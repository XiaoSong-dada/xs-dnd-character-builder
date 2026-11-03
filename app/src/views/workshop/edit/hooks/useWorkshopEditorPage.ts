import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { customKindLabel, isCustomContentKind } from '@/features/custom-content/dictionary'
import { useCustomContentStore } from '@/stores/custom-content'
import type { CustomContentKind } from '@/types/custom-content'

/**
 * 内容工坊编辑器入口 hook。
 *
 * 目前只解析路由参数并提供返回动作；表单、校验与保存流程在 CW-D 批次补齐。
 */
export function useWorkshopEditorPage() {
  const route = useRoute()
  const router = useRouter()
  const store = useCustomContentStore()

  const rawKind = computed(() => String(route.params.kind ?? ''))
  const kind = computed<CustomContentKind | undefined>(() =>
    isCustomContentKind(rawKind.value) ? rawKind.value : undefined,
  )
  const entryId = computed(() => String(route.params.entryId ?? 'new'))
  const isNew = computed(() => entryId.value === 'new')

  const title = computed(() => {
    if (!kind.value) return '内容不存在'
    return `${isNew.value ? '新建' : '编辑'}${customKindLabel(kind.value)}`
  })

  /** 类型非法或条目不存在时回到列表并提示，不跳全局 404。 */
  const missing = computed(() => {
    if (!kind.value) return true
    if (isNew.value) return false
    if (kind.value === 'expansion') return !store.expansionOf(store.activeRuleset, entryId.value)
    return !store.findEntry(store.activeRuleset, entryId.value)
  })

  function backToList(): void {
    void router.push({ name: 'workshop' })
  }

  return { kind, entryId, isNew, title, missing, ruleset: computed(() => store.activeRuleset), backToList } as const
}
