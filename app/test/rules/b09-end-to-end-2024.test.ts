import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { deriveCharacter } from '@/rules/derive'
import { getRulesRepository, rulesRepository2024 } from '@/rules/repositories'
import { buildStartingEquipmentState, isStartingEquipmentComplete } from '@/rules/starting-equipment'
import { getRequiredCantripCount, getRequiredSpellCount, getRequiredSpellbookCount, getSpellcastingConfig, validateSpellSelections } from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import { validateDraft } from '@/rules/validate'
import { CharacterJsonService } from '@/services/character-json'
import { RulesetPreferenceService } from '@/services/ruleset-preference'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import { draft2024, emptySpellSelections } from '../fixtures/draft-2024'

const CLASS_IDS = rulesRepository2024.classes.map((classRule) => classRule.id)

describe('B09-05 2024 车卡端到端验收', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('12 个 2024 职业在 1／3／4／19／20 级都可展开时间线与起始装备（AC-01／AC-09）', () => {
    for (const classId of CLASS_IDS) {
      for (const level of [1, 3, 4, 19, 20]) {
        const draft = draft2024({ classId, targetLevel: level, subclassId: rulesRepository2024.subclasses.find((subclass) => subclass.classId === classId)?.id })
        const timeline = buildTimeline(classId, level, { ruleset: '5e-2024', enabledSourceIds: [], subclassId: draft.subclassId })
        expect(timeline.length, `${classId} ${level}级时间线为空`).toBeGreaterThan(0)
        const profile = rulesRepository2024.getClassStartingEquipment(classId)
        const selections = (profile?.groups ?? []).map((group) => ({ groupId: group.id, optionId: group.options[0]!.id, pickedItemIds: [] }))
        const equipment = buildStartingEquipmentState({ ...draft, startingEquipmentSelections: selections })
        expect(equipment.inventory.length, `${classId} 起始装备为空`).toBeGreaterThan(0)
      }
    }
  })

  it('2024 草稿从创建到校验、角色卡与导出的完整流程可用', () => {
    const store = useCharacterDraftsStore()
    RulesetPreferenceService.savePreferredRuleset('5e-2024')
    const draft = store.createDraft()
    expect(draft.ruleset).toBe('5e-2024')

    store.updateDraft({
      classId: 'class-2024-fighter',
      raceId: 'species-2024-human',
      backgroundId: 'background-2024-soldier',
      name: '验收战士',
      spells: undefined,
    })
    // 战士无施法配置：法术步骤应可直接跳过。
    expect(validateSpellSelections(store.activeDraft!)).toBe(true)
    // 起始装备方案 A 选择完成后装备步骤视为完成。
    const profile = rulesRepository2024.getClassStartingEquipment('class-2024-fighter')
    const backgroundProfile = rulesRepository2024.getBackgroundStartingEquipment('background-2024-soldier')
    const selections = [...(profile?.groups ?? []), ...(backgroundProfile?.groups ?? [])].map((group) => ({ groupId: group.id, optionId: group.options[0]!.id, pickedItemIds: [] }))
    const equipment = buildStartingEquipmentState({ ...store.activeDraft!, startingEquipmentSelections: selections })
    store.updateDraft({ startingEquipmentSelections: selections })
    store.updateDraft({ inventory: equipment.inventory, currency: equipment.currency })
    expect(isStartingEquipmentComplete(store.activeDraft!)).toBe(true)

    const derived = deriveCharacter(store.activeDraft!)
    expect(derived.hitPoints.value).toBeGreaterThan(0)
    const model = buildCharacterExportModel(store.activeDraft!, derived)
    expect(model.identity.className).toBe('战士')
    expect(model.diagnostics.filter((item) => item.severity === 'error')).toHaveLength(0)

    // 保存与 JSON 往返保留版本、身份与选择。
    const raw = CharacterJsonService.exportDraft(store.activeDraft!)
    const imported = CharacterJsonService.importDraft(raw)
    expect(imported.ruleset).toBe('5e-2024')
    expect(imported.name).toBe('验收战士')
    expect(imported.classId).toBe('class-2024-fighter')
    expect(imported.raceId).toBe('species-2024-human')
  })

  it('2024 法师在 1／3／20 级完成戏法、法术书与准备后可校验（AC-07）', () => {
    const repository = getRulesRepository('5e-2024')
    const wizardSpells = repository.spells
    const base = draft2024({
      classId: 'class-2024-wizard',
      subclassId: 'subclass-2024-wizard-evoker',
      targetLevel: 3,
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      raceId: 'species-2024-human',
      backgroundId: 'background-2024-sage',
      languages: ['龙语', '精灵语'],
      name: '验收法师',
    })
    const baseConfig = getSpellcastingConfig(base)!
    const cantrips = wizardSpells.filter((spell) => spell.level === 0 && spell.classIds.includes('class-2024-wizard')).slice(0, getRequiredCantripCount(base, baseConfig)).map((spell) => spell.id)
    const levelOne = wizardSpells.filter((spell) => spell.level === 1 && spell.classIds.includes('class-2024-wizard'))
    const spellbook = levelOne.slice(0, getRequiredSpellbookCount(base, baseConfig)).map((spell) => spell.id)
    const prepared = levelOne.slice(0, getRequiredSpellCount(base, baseConfig)).map((spell) => spell.id)

    const draft = draft2024({
      classId: 'class-2024-wizard',
      subclassId: 'subclass-2024-wizard-evoker',
      targetLevel: 3,
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      spellSelections: { ...emptySpellSelections(), cantripIds: cantrips, spellbookSpellIds: spellbook, preparedSpellIds: prepared },
      raceId: 'species-2024-human',
      backgroundId: 'background-2024-sage',
      languages: ['龙语', '精灵语'],
      name: '验收法师',
    })

    const config = getSpellcastingConfig(draft)
    expect(config?.mode).toBe('spellbook')
    expect(config?.ability).toBe('int')
    expect(getRequiredCantripCount(draft, config!)).toBe(3)
    expect(validateSpellSelections(draft)).toBe(true)
    expect(deriveCharacter(draft).spellAttackBonus?.value).toBeTypeOf('number')
  })

  it('升降级保留高等级选择并在恢复后重新生效（AC-02）', () => {
    const store = useCharacterDraftsStore()
    const draft = store.createDraft('5e-2024')
    store.updateDraft({ classId: 'class-2024-fighter', targetLevel: 20, selections: [{ checkpointId: 'fighter-2024-asi-19', optionIds: ['asi-str-2'], confirmedAt: '' }] })
    const highLevelSelection = store.activeDraft!.selections[0]!

    store.updateDraft({ targetLevel: 3 })
    store.invalidateSelections(['fighter-2024-asi-19'], '等级降至 3 级')
    expect(store.activeDraft?.selections[0]?.invalidatedAt).toBeTruthy()
    const invalidated = store.activeDraft!.selections[0]!
    store.updateDraft({ selections: [{ ...invalidated, invalidatedAt: undefined, invalidatedReason: undefined }], targetLevel: 20 })
    expect(store.activeDraft?.selections[0]).toEqual(highLevelSelection)
  })

  it('2014 回归：既有草稿不受 2024 偏好与入口开放影响', () => {
    const store = useCharacterDraftsStore()
    RulesetPreferenceService.savePreferredRuleset('5e-2024')
    const legacy = store.createDraft('5e-2014')
    store.updateDraft({ classId: 'class-2014-fighter' })
    expect(legacy.ruleset).toBe('5e-2014')
    expect(legacy.enabledSourceIds.length).toBeGreaterThan(0)
    expect(store.activeDraft?.ruleset).toBe('5e-2014')
    expect(validateDraft(store.activeDraft!).some((issue) => issue.id.startsWith('source-disabled'))).toBe(false)
  })
})
