import { describe, expect, it } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { deriveWeaponAttack } from '@/rules/weapon-attacks'
import { getRulesRepository } from '@/rules/repositories'
import { EMPTY_MANUAL_EDITS, normalizeManualEdits } from '@/rules/manual-edits'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import type { CharacterDraft } from '@/types/character'
import { draft2024, selection } from '../fixtures/draft-2024'

function referenceValues(draft: CharacterDraft): readonly number[] {
  const d = deriveCharacter(draft)
  return [d.attackBonus.value, d.attackDamageBonus.value, d.dexterityAttackBonus.value, d.dexterityAttackDamageBonus.value]
}

function attack(draft: CharacterDraft, slug: string) {
  const equipment = getRulesRepository(draft.ruleset).getEquipment(draft.ruleset === '5e-2024' ? `equipment-2024-${slug}` : slug)
  if (!equipment) throw new Error(`Missing ${slug}`)
  return deriveWeaponAttack(draft, deriveCharacter(draft), equipment)
}

describe('力量与敏捷攻击参考卡', () => {
  for (const ruleset of ['5e-2014', '5e-2024'] as const) {
    const base = () => draft2024({ ruleset, classId: ruleset === '5e-2014' ? 'class-2014-paladin' : 'class-2024-paladin', targetLevel: 1,
      baseAbilities: { str: 10, dex: 16, con: 12, int: 18, wis: 10, cha: 10 } })

    it(`${ruleset} 两组参考固定属性，不依赖首件装备或武器魔法加值`, () => {
      const draft = base()
      expect(referenceValues(draft)).toEqual([2, 0, 5, 3])
      expect(attack(draft, 'rapier')).toMatchObject({ ability: 'dex', attackBonus: 5, damageBonus: 3 })
      expect(referenceValues({ ...draft, inventory: [{ id: 'weapon', itemId: ruleset === '5e-2014' ? 'greatsword' : 'equipment-2024-greatsword', sourceKind: 'class', quantity: 1, equippedQuantity: 1 }] })).toEqual([2, 0, 5, 3])
      const equipment = getRulesRepository(ruleset).getEquipment(ruleset === '5e-2014' ? 'rapier' : 'equipment-2024-rapier')
      if (!equipment) throw new Error('Missing rapier')
      expect(deriveWeaponAttack(draft, deriveCharacter(draft), { ...equipment, magicBonus: 2 })).toMatchObject({ attackBonus: 7, damageBonus: 5 })
    })

    it(`${ruleset} 选定实际属性后仅继承对应人工修正，远程与未熟练分开计算`, () => {
      const draft = { ...base(), manualEdits: { ...EMPTY_MANUAL_EDITS, derivedAdjustments: {
        attackBonus: 2, attackDamageBonus: -1, dexterityAttackBonus: 4, dexterityAttackDamageBonus: 5,
      } } }
      expect(referenceValues(draft)).toEqual([4, -1, 9, 8])
      expect(attack(draft, 'greatsword')).toMatchObject({ ability: 'str', attackBonus: 4, damageBonus: -1 })
      expect(attack(draft, 'rapier')).toMatchObject({ ability: 'dex', attackBonus: 9, damageBonus: 8 })
      expect(attack(draft, 'longbow')).toMatchObject({ ability: 'dex', attackBonus: 9, damageBonus: 8 })
      expect(attack({ ...draft, baseAbilities: { ...draft.baseAbilities, str: 18 } }, 'rapier')).toMatchObject({ ability: 'str', attackBonus: 8, damageBonus: 3 })
      expect(attack({ ...draft, classId: ruleset === '5e-2014' ? 'class-2014-wizard' : 'class-2024-wizard' }, 'rapier')).toMatchObject({ proficient: false, attackBonus: 7, damageBonus: 8 })
    })

    it(`${ruleset} 旧修正只保留在力量卡，属性和熟练人工修正重新派生两卡`, () => {
      const draft = { ...base(), manualEdits: { ...EMPTY_MANUAL_EDITS, derivedAdjustments: { attackBonus: 2, attackDamageBonus: 1 } } }
      expect(referenceValues(draft)).toEqual([4, 1, 5, 3])
      expect(referenceValues({ ...draft, manualEdits: { ...draft.manualEdits, abilityAdjustments: { str: 2, dex: -2 }, proficiencyBonusAdjustment: 1 } })).toEqual([6, 2, 5, 2])
      expect(referenceValues({ ...draft, manualEdits: EMPTY_MANUAL_EDITS })).toEqual([2, 0, 5, 3])
    })

    it(`${ruleset} JSON、ZIP 和导出实际攻击保持两组修正独立`, async () => {
      const itemId = ruleset === '5e-2014' ? 'rapier' : 'equipment-2024-rapier'
      const draft = { ...base(), inventory: [{ id: 'rapier', itemId, sourceKind: 'adventure' as const, quantity: 1, equippedQuantity: 1 }],
        manualEdits: { ...EMPTY_MANUAL_EDITS, derivedAdjustments: { attackBonus: 2, attackDamageBonus: -1, dexterityAttackBonus: 4, dexterityAttackDamageBonus: 5 } } }
      const json = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(draft))
      const archive = await CharacterPackageService.build(draft)
      const restored = await CharacterPackageService.import(new Blob([archive as BlobPart]))
      for (const result of [json, restored]) {
        expect(result.manualEdits).toEqual(draft.manualEdits)
        expect(referenceValues(result)).toEqual([4, -1, 9, 8])
        expect(buildCharacterExportModel(result, deriveCharacter(result)).attacks).toEqual([
          expect.objectContaining({ itemId, attackBonus: 9, damage: '1d8+8 穿刺' }),
        ])
      }
    })

    it(`${ruleset} 武僧仅在武僧武器且无甲无盾条件下选择较高属性`, () => {
      const monk = { ...base(), classId: ruleset === '5e-2014' ? 'class-2014-monk' : 'class-2024-monk' }
      expect(attack(monk, 'quarterstaff')).toMatchObject({ ability: 'dex', attackBonus: 5, damageBonus: 3 })
      for (const slug of ['shield', 'leather-armor', 'greatsword']) {
        const equipped = { ...monk, inventory: [{ id: 'blocking', itemId: ruleset === '5e-2014' ? slug : `equipment-2024-${slug}`, sourceKind: 'adventure' as const, quantity: 1, equippedQuantity: 1 }] }
        expect(attack(equipped, 'quarterstaff')?.ability).toBe('str')
        expect(attack({ ...equipped, inventory: equipped.inventory.map((entry) => ({ ...entry, equippedQuantity: 0 })) }, 'quarterstaff')?.ability).toBe('dex')
      }
      expect(attack(monk, 'greatsword')?.ability).toBe('str')
    })
  }

  it('战地匠师魔法与有效灌注武器使用智力，不继承力量或敏捷修正', () => {
    const draft = draft2024({ ruleset: '5e-2014', classId: 'class-2014-artificer', subclassId: 'subclass-2014-artificer-battle-smith', targetLevel: 3,
      enabledSourceIds: ['tcoe-2020-index'], baseAbilities: { str: 10, dex: 16, con: 12, int: 18, wis: 10, cha: 10 },
      manualEdits: { ...EMPTY_MANUAL_EDITS, derivedAdjustments: { attackBonus: 10, attackDamageBonus: 11, dexterityAttackBonus: 12, dexterityAttackDamageBonus: 13 } },
      inventory: [{ id: 'weapon', itemId: 'greatsword', quantity: 1, equippedQuantity: 1, sourceKind: 'class' }],
      selections: [selection('artificer-2014-infusions-2', ['infusion-2014-enhanced-weapon'])],
      infusionAssignments: [{ inventoryEntryId: 'weapon', infusionId: 'infusion-2014-enhanced-weapon' }],
    })
    expect(attack(draft, 'greatsword')).toMatchObject({ ability: 'int', proficient: true, attackBonus: 7, damageBonus: 5 })
    expect(attack({ ...draft, targetLevel: 10 }, 'greatsword')).toMatchObject({ attackBonus: 10, damageBonus: 6 })
    expect(attack({ ...draft, infusionAssignments: [] }, 'greatsword')).toMatchObject({ ability: 'str', attackBonus: 12, damageBonus: 11 })
    expect(attack({ ...draft, inventory: [] }, 'greatsword')?.ability).toBe('str')
    expect(attack({ ...draft, enabledSourceIds: [] }, 'greatsword')).toMatchObject({ ability: 'str', proficient: false })
    expect(attack({ ...draft, targetLevel: 2 }, 'greatsword')).toMatchObject({ ability: 'str', proficient: false })
    expect(attack({ ...draft, subclassId: undefined }, 'quarterstaff')?.proficient).toBe(true)
  })

  it('敏捷人工字段仅接受有限整数，非法字段与非法数值不进入草稿', () => {
    expect(normalizeManualEdits({ derivedAdjustments: { attackBonus: 1, dexterityAttackBonus: -2, dexterityAttackDamageBonus: 3, other: 5 } }).derivedAdjustments)
      .toEqual({ attackBonus: 1, dexterityAttackBonus: -2, dexterityAttackDamageBonus: 3 })
    expect(normalizeManualEdits({ derivedAdjustments: { dexterityAttackBonus: NaN, dexterityAttackDamageBonus: 1.5 } }).derivedAdjustments).toEqual({})
  })
})
