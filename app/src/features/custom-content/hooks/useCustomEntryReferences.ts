import { computed } from 'vue'

import { collectCustomContentReferences, type CustomReferenceOwner } from '@/rules/custom-content-references'
import { useCharacterDraftsStore } from '@/stores/character-drafts'

/**
 * 自定义条目的角色引用计数。
 *
 * 数据来源是本地草稿（`stores/character-drafts`），引用扫描本身是纯函数
 * （`rules/custom-content-references`），列表卡与删除确认弹窗共用同一口径。
 */
export function useCustomEntryReferences() {
  const draftsStore = useCharacterDraftsStore()
  const references = computed(() => collectCustomContentReferences(draftsStore.drafts))

  function referencesOf(entryId: string): readonly CustomReferenceOwner[] {
    return references.value.get(entryId) ?? []
  }

  function referenceCountOf(entryId: string): number {
    return referencesOf(entryId).length
  }

  return { references, referencesOf, referenceCountOf } as const
}
