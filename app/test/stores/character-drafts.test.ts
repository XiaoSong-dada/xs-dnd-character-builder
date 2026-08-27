import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCharacterDraftsStore } from '@/stores/character-drafts'
import { deriveCharacter } from '@/rules/derive'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
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
})
