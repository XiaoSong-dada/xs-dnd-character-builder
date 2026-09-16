import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { useCharacterDraftsStore } from '@/stores/character-drafts'
import { deriveCharacter } from '@/rules/derive'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import { RulesetPreferenceService } from '@/services/ruleset-preference'
import { SessionStateStorageService } from '@/services/session-state-storage'

describe('character drafts store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('创建草稿并保存时间线选择', () => {
    const store = useCharacterDraftsStore()
    const draft = store.createDraft()
    store.updateDraft({ classId: 'class-2014-fighter' })
    store.saveSelection('fighter-2014-style-1', ['style-defense'])
    expect(store.activeDraftId).toBe(draft.id)
    expect(store.activeDraft?.adventureGold).toBe(0)
    expect(store.activeDraft?.selections[0]?.optionIds).toEqual(['style-defense'])
  })

  it('失效选择时保留原选项和值', () => {
    const store = useCharacterDraftsStore()
    store.createDraft()
    store.saveSelection('fighter-2014-style-1', ['style-defense'])
    store.invalidateSelections(['fighter-2014-style-1'], '修改职业')
    expect(store.activeDraft?.selections[0]?.invalidatedReason).toBe('修改职业')
    expect(store.activeDraft?.selections[0]?.optionIds).toEqual(['style-defense'])
  })

  it('关闭当前草稿时保留内容和当前步骤', () => {
    const store = useCharacterDraftsStore()
    const draft = store.createDraft()
    store.updateDraft({ currentStep: 'abilities', name: '凯恩' })

    store.closeActiveDraft()

    expect(store.activeDraftId).toBeUndefined()
    expect(store.activeDraft).toBeUndefined()
    expect(store.drafts).toHaveLength(1)
    expect(store.drafts[0]).toMatchObject({
      id: draft.id,
      currentStep: 'abilities',
      name: '凯恩',
    })
  })

  it('删除草稿并清除对应的活动状态', () => {
    const store = useCharacterDraftsStore()
    const first = store.createDraft()
    const second = store.createDraft()

    expect(store.deleteDraft(first.id)).toBe(true)
    expect(store.drafts.map((draft) => draft.id)).toEqual([second.id])
    expect(store.activeDraftId).toBe(second.id)

    expect(store.deleteDraft(second.id)).toBe(true)
    expect(store.drafts).toHaveLength(0)
    expect(store.activeDraftId).toBeUndefined()
    expect(store.deleteDraft('missing')).toBe(false)
  })

  it('人工最大生命与环位变化时协调跑团状态，并统一归一化写入', () => {
    const store = useCharacterDraftsStore()
    const draft = store.createDraft()
    store.updateDraft({ classId: 'class-2014-wizard', targetLevel: 5 })
    const current = store.activeDraft!
    const oldMax = deriveCharacter(current).hitPoints.value
    SessionStateStorageService.save({
      draftId: draft.id,
      currentHp: oldMax - 10,
      usedSpellSlots: { 1: 3, 3: 2 },
      exhaustionLevel: 0,
      debuffs: [],
      updatedAt: '',
    })

    store.updateManualEdits({
      ...EMPTY_MANUAL_EDITS,
      derivedAdjustments: { hitPoints: 20, invalid: 4 } as never,
      spellSlotAdjustments: { 1: -3, 9: 2, 10: 4 },
    })

    const next = store.activeDraft!
    expect(next.manualEdits.derivedAdjustments).toEqual({ hitPoints: 20 })
    expect(next.manualEdits.spellSlotAdjustments).toEqual({ 1: -3, 9: 2 })
    expect(SessionStateStorageService.load(draft.id)?.currentHp).toBe(oldMax + 10)
    expect(SessionStateStorageService.load(draft.id)?.usedSpellSlots).toEqual({ 1: 1, 3: 2 })
  })

  it('2024 草稿使用独立默认值且不套用 2014 可选来源', () => {
    const store = useCharacterDraftsStore()
    const legacy = store.createDraft()
    const modern = store.createDraft('5e-2024')

    expect(legacy.ruleset).toBe('5e-2014')
    expect(legacy.schemaVersion).toBe(8)
    expect(legacy.enabledSourceIds.length).toBeGreaterThan(0)
    expect(modern.ruleset).toBe('5e-2024')
    expect(modern.schemaVersion).toBe(8)
    expect(modern.enabledSourceIds).toEqual([])
    expect(modern.targetLevel).toBe(10)
  })

  it('降级与换职业时协调职业资源已用量（B10-04）', () => {
    const store = useCharacterDraftsStore()
    const draft = store.createDraft('5e-2024')
    store.updateDraft({ classId: 'class-2024-barbarian', targetLevel: 9 })
    SessionStateStorageService.save({
      draftId: draft.id,
      currentHp: 50,
      usedSpellSlots: {},
      exhaustionLevel: 0,
      debuffs: [],
      resourceUsage: { 'barbarian-2024-class-rage': 4 },
      updatedAt: '',
    })

    store.updateDraft({ targetLevel: 3 })
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage).toEqual({ 'barbarian-2024-class-rage': 3 })

    store.updateDraft({ classId: 'class-2024-fighter', targetLevel: 3 })
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage).toEqual({})
  })

  it('两版草稿共存并在刷新后恢复', async () => {
    const store = useCharacterDraftsStore()
    store.createDraft()
    store.createDraft('5e-2024')
    await nextTick()

    setActivePinia(createPinia())
    const reloaded = useCharacterDraftsStore()
    expect(reloaded.drafts.map((draft) => draft.ruleset).sort()).toEqual(['5e-2014', '5e-2024'])
  })

  it('新建按本设备偏好解析版本，已有构筑不能原地改版（B09-01）', () => {
    const store = useCharacterDraftsStore()
    RulesetPreferenceService.savePreferredRuleset('5e-2024')
    const modern = store.createDraft()
    expect(modern.ruleset).toBe('5e-2024')
    expect(modern.enabledSourceIds).toEqual([])

    expect(store.changeRuleset('5e-2014')).toBe(true)
    expect(store.activeDraft?.ruleset).toBe('5e-2014')
    expect(store.activeDraft?.enabledSourceIds.length).toBeGreaterThan(0)

    expect(store.changeRuleset('5e-2024')).toBe(true)
    store.updateDraft({ classId: 'class-2024-fighter' })
    expect(store.changeRuleset('5e-2014')).toBe(false)
    expect(store.activeDraft?.ruleset).toBe('5e-2024')
    expect(store.activeDraft?.classId).toBe('class-2024-fighter')
  })

  it('导入 2024 角色文件与完整角色包均成功（B09-01）', async () => {
    const store = useCharacterDraftsStore()
    const raw = JSON.stringify({
      schemaVersion: 8,
      id: 'opened-2024',
      ruleset: '5e-2024',
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      selections: [],
    })

    const imported = store.importDraft(raw)
    expect(imported.ruleset).toBe('5e-2024')
    expect(store.drafts).toHaveLength(1)

    const draft = CharacterJsonService.importDraft(raw)
    const bytes = await CharacterPackageService.build(draft)
    const packed = await store.importPackage(new Blob([bytes as BlobPart], { type: 'application/zip' }))
    expect(packed.ruleset).toBe('5e-2024')
    expect(store.drafts).toHaveLength(2)
  })
})
