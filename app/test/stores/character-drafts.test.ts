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
})
