import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCharacterDraftsStore } from '@/stores/character-drafts'

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
})
