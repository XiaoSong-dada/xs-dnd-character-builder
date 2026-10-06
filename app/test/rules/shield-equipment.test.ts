import { describe, expect, it } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { deriveCharacterSummary } from '@/rules/derive'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { getRulesRepository } from '@/rules/repositories'
import { getEquipmentWarnings } from '@/rules/equipment-state'
import { buildStartingEquipmentState, getAllowedPickItems, toggleInventoryEquipment } from '@/rules/starting-equipment'
import { validateDraft } from '@/rules/validate'
import { CharacterJsonService } from '@/services/character-json'
import type { CharacterDraft, InventoryEntry } from '@/types/character'
import { draft2024 } from '../fixtures/draft-2024'

function equipmentDraft(ruleset: CharacterDraft['ruleset'], weapon = 'greatsword'): CharacterDraft {
  const id = (slug: string) => ruleset === '5e-2014' ? slug : `equipment-2024-${slug}`
  return draft2024({
    ruleset,
    classId: ruleset === '5e-2014' ? 'class-2014-paladin' : 'class-2024-paladin',
    targetLevel: 1,
    inventory: ['chain-mail', weapon, 'shield'].map((slug) => ({ id: slug, itemId: id(slug), quantity: 1, equippedQuantity: 1, sourceKind: 'legacy' })),
  })
}

describe('盾牌默认装备与 AC 条件', () => {
  const routes = [
    ['5e-2014', 'class-2014-cleric'], ['5e-2014', 'class-2014-druid'],
    ['5e-2014', 'class-2014-fighter'], ['5e-2014', 'class-2014-paladin'],
    ['5e-2024', 'class-2024-cleric'], ['5e-2024', 'class-2024-druid'], ['5e-2024', 'class-2024-paladin'],
  ] as const
  it.each(routes)('%s %s 不默认装备盾牌，重建保留明确装备与卸下状态', (ruleset, classId) => {
    const repository = getRulesRepository(ruleset)
    const profile = repository.getClassStartingEquipment(classId)
    if (!profile) throw new Error('missing starting equipment')
    const draft = draft2024({
      ruleset, classId, targetLevel: 1,
      startingEquipmentSelections: profile.groups.map((group) => {
        const option = group.options.find((item) => item.grants.some((grant) => repository.getEquipment(grant.itemId)?.category === 'shield')) ?? group.options[0]
        if (!option) throw new Error('missing option')
        const candidates = option.pick ? getAllowedPickItems(option.pick, repository) : []
        const preferred = candidates.find((item) => item.id === 'greatsword') ?? candidates[0]
        return { groupId: group.id, optionId: option.id, pickedItemIds: option.pick && preferred ? Array.from({ length: option.pick.count }, () => preferred.id) : [] }
      }),
    })
    const generated = buildStartingEquipmentState(draft).inventory
    const shield = generated.find((entry) => repository.getEquipment(entry.itemId)?.category === 'shield')
    if (!shield) throw new Error('route must include a shield')
    expect(shield.equippedQuantity).toBe(0)
    const equipped = toggleInventoryEquipment(generated, shield.id, repository)
    expect(buildStartingEquipmentState({ ...draft, inventory: equipped }).inventory.find((entry) => entry.id === shield.id)?.equippedQuantity).toBe(1)
    const off = equipped.map((entry) => ({ ...entry, equippedQuantity: 0 }))
    const rebuilt = buildStartingEquipmentState({ ...draft, inventory: off }).inventory
    expect(rebuilt).toEqual(off)
    const imported = CharacterJsonService.importDraft(CharacterJsonService.exportDraft({ ...draft, inventory: off }))
    expect(buildStartingEquipmentState(imported).inventory).toEqual(off)
  })

  it.each(['5e-2014', '5e-2024'] as const)('%s 同时手动装备盾牌和双手武器保留 AC，只提示；卸下后消除提示', (ruleset) => {
    const repository = getRulesRepository(ruleset)
    for (const weapon of ['greatsword', 'greataxe', 'longbow']) {
      const draft = equipmentDraft(ruleset, weapon)
      expect(deriveCharacter(draft).armorClass.value).toBe(18)
      expect(getEquipmentWarnings(draft).map((issue) => issue.id)).toContain('shield-two-handed-conflict')
      expect(validateDraft(draft).find((issue) => issue.id === 'shield-two-handed-conflict')?.severity).toBe('warning')
      const noShield = { ...draft, inventory: toggleInventoryEquipment(draft.inventory, 'shield', repository) }
      expect(deriveCharacter(noShield).armorClass.value).toBe(16)
      expect(getEquipmentWarnings(noShield)).toEqual([])
      const noWeapon = { ...draft, inventory: toggleInventoryEquipment(draft.inventory, weapon, repository) }
      expect(deriveCharacter(noWeapon).armorClass.value).toBe(18)
      expect(getEquipmentWarnings(noWeapon)).toEqual([])
    }
    expect(getEquipmentWarnings(equipmentDraft(ruleset, 'longsword'))).toEqual([])
    for (const item of repository.equipment.filter((item) => item.weaponProperties?.includes('versatile'))) {
      expect(item.weaponProperties, item.id).not.toContain('two-handed')
    }
  })

  it('2024 未受盾牌训练不获得收益，2014 保留持盾增益', () => {
    const modern = { ...equipmentDraft('5e-2024'), classId: 'class-2024-wizard' }
    expect(deriveCharacter(modern).armorClass.value).toBe(16)
    expect(deriveCharacter(modern).armorClass.sources.find((source) => source.id === 'shield')).toMatchObject({ value: 0, detail: '未受盾牌训练，不计入 AC' })
    expect(getEquipmentWarnings(modern).map((issue) => issue.id)).toContain('shield-training-required')
    const classic = { ...equipmentDraft('5e-2014'), classId: 'class-2014-wizard' }
    expect(deriveCharacter(classic).armorClass.value).toBe(18)
    expect(getEquipmentWarnings(classic).map((issue) => issue.id)).not.toContain('shield-training-required')
  })

  it('两版全部职业共用持盾路径，2024 仅受训职业获得盾牌收益', () => {
    for (const ruleset of ['5e-2014', '5e-2024'] as const) {
      const repository = getRulesRepository(ruleset)
      for (const classRule of repository.classes) {
        const draft = { ...equipmentDraft(ruleset), classId: classRule.id, enabledSourceIds: classRule.sourceIds }
        const expected = ruleset === '5e-2014' || classRule.armorTraining?.includes('shield') ? 18 : 16
        expect(deriveCharacter(draft).armorClass.value, classRule.id).toBe(expected)
        expect(getEquipmentWarnings(draft).find((issue) => issue.id === 'shield-two-handed-conflict')?.severity).toBe('warning')
      }
    }
  })

  it.each([
    ['5e-2014', 'class-2014-barbarian', 16], ['5e-2014', 'class-2014-monk', 14],
    ['5e-2024', 'class-2024-barbarian', 16], ['5e-2024', 'class-2024-monk', 12],
  ] as const)('%s %s 无甲防御正确处理持盾与训练条件', (ruleset, classId, expected) => {
    const draft = {
      ...equipmentDraft(ruleset), classId,
      baseAbilities: { str: 10, dex: 14, con: 15, int: 10, wis: 16, cha: 10 },
      inventory: equipmentDraft(ruleset).inventory.filter((entry) => entry.id === 'shield'),
    }
    expect(deriveCharacter(draft).armorClass.value).toBe(expected)
  })

  it('背景重建不会重新装备已有护甲、武器、旧草稿或冒险物品', () => {
    const draft = draft2024({ classId: 'class-2024-paladin', startingEquipmentSelections: [{ groupId: 'paladin-2024-starting', optionId: 'paladin-2024-a', pickedItemIds: [] }] })
    const generated = buildStartingEquipmentState(draft).inventory.map((entry) => ({ ...entry, equippedQuantity: 0 }))
    const extra: readonly InventoryEntry[] = [
      { id: 'legacy', itemId: 'equipment-2024-longsword', sourceKind: 'legacy', quantity: 1, equippedQuantity: 0 },
      { id: 'adventure', itemId: 'equipment-2024-chain-mail', sourceKind: 'adventure', quantity: 1, equippedQuantity: 0 },
    ]
    const state = buildStartingEquipmentState({ ...draft, backgroundId: 'background-2024-soldier', inventory: [...generated, ...extra] })
    for (const entry of [...generated, ...extra]) expect(state.inventory.find((item) => item.id === entry.id)?.equippedQuantity).toBe(0)
  })

  it('2024 子职/专长授予训练生效，降级与来源关闭时不生效', () => {
    const valor = { ...equipmentDraft('5e-2024', 'longsword'), classId: 'class-2024-bard', subclassId: 'subclass-2024-bard-college-of-valor', targetLevel: 3 }
    expect(deriveCharacter(valor).armorClass.value).toBe(18)
    expect(deriveCharacter({ ...valor, targetLevel: 2 }).armorClass.value).toBe(16)
    const trained = {
      ...equipmentDraft('5e-2024', 'longsword'), classId: 'class-2024-wizard', targetLevel: 4,
      selections: [{ checkpointId: 'class-2024-wizard-feat-4', optionIds: ['feat-2024-lightly-armored'], confirmedAt: '' }],
    }
    expect(deriveCharacter(trained).armorClass.value).toBe(18)
    const repository = getRulesRepository('5e-2024')
    const ua = repository.getClass('class-2024-ua-artificer')
    if (!ua) throw new Error('missing artificer')
    const artificer = { ...equipmentDraft('5e-2024', 'longsword'), classId: ua.id, enabledSourceIds: ua.sourceIds }
    expect(deriveCharacter(artificer).armorClass.value).toBe(18)
    expect(deriveCharacter({ ...artificer, enabledSourceIds: [] }).armorClass.value).toBe(16)
  })

  it('魔法盾牌与强化防御灌注随卸下和来源关闭停止，人工 AC 只叠加一次', () => {
    const repository = getRulesRepository('5e-2014')
    const magic = repository.getEquipment('shield-+1')
    if (!magic) throw new Error('missing magic shield')
    const draft = {
      ...equipmentDraft('5e-2014', 'longsword'), enabledSourceIds: magic.sourceIds,
      inventory: equipmentDraft('5e-2014', 'longsword').inventory.map((entry) => entry.id === 'shield' ? { ...entry, itemId: magic.id } : entry),
      manualEdits: { ...EMPTY_MANUAL_EDITS, derivedAdjustments: { armorClass: 3 } },
    }
    expect(deriveCharacter(draft).armorClass.value).toBe(22)
    expect(deriveCharacter({ ...draft, enabledSourceIds: [] }).armorClass.value).toBe(19)
    expect(deriveCharacter({ ...draft, inventory: toggleInventoryEquipment(draft.inventory, 'shield', repository) }).armorClass.value).toBe(19)
    const artificer = {
      ...equipmentDraft('5e-2014', 'longsword'), classId: 'class-2014-artificer', targetLevel: 2,
      enabledSourceIds: ['tcoe-2020-index', 'erftlw-2019-index'],
      selections: [{ checkpointId: 'artificer-2014-infusions-2', optionIds: ['infusion-2014-enhanced-defense'], confirmedAt: '' }],
      infusionAssignments: [{ infusionId: 'infusion-2014-enhanced-defense', inventoryEntryId: 'shield' }],
    }
    expect(deriveCharacter(artificer).armorClass.value).toBe(19)
    expect(deriveCharacter({ ...artificer, inventory: toggleInventoryEquipment(artificer.inventory, 'shield', repository) }).armorClass.value).toBe(16)
    expect(artificer.infusionAssignments).toHaveLength(1)
  })

  it.each(['5e-2014', '5e-2024'] as const)('%s 摘要和共享 PDF/XLSX 导出模型与派生 AC 一致', (ruleset) => {
    const repository = getRulesRepository(ruleset)
    const draft = equipmentDraft(ruleset)
    for (const current of [draft, { ...draft, inventory: toggleInventoryEquipment(draft.inventory, 'shield', repository) }]) {
      const derived = deriveCharacter(current)
      expect(buildCharacterExportModel(current, derived).combat.armorClass).toBe(derived.armorClass.value)
      expect(deriveCharacterSummary(current).armorClass).toBe(derived.armorClass.value)
    }
  })
})
