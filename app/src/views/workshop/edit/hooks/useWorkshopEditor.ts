import { computed, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

import { customKindLabel, isCustomContentKind } from '@/features/custom-content/dictionary'
import { buildTemplateEntry, listCustomTemplateOptions } from '@/features/custom-content/templates'
import { useRulesRepository } from '@/hooks/useRulesRepository'
import { useCustomContentStore } from '@/stores/custom-content'
import type { CustomContentKind, CustomEntry, CustomEntryKind, CustomExpansion } from '@/types/custom-content'
import type { CustomEntryInput, SaveExpansionInput } from '@/stores/custom-content'

/**
 * 内容工坊编辑器入口 hook。
 *
 * 负责：路由参数解析、现有条目/扩展载入、保存（新建或更新）、未保存离开确认。
 * 具体表单字段由各类型的 Form 组件持有（CW-D/E/F 分批接入）。
 */
export function useWorkshopEditor() {
  const route = useRoute()
  const router = useRouter()
  const store = useCustomContentStore()

  const rawKind = computed(() => String(route.params.kind ?? ''))
  const kind = computed<CustomContentKind | undefined>(() =>
    isCustomContentKind(rawKind.value) ? rawKind.value : undefined,
  )
  const entryId = computed(() => String(route.params.entryId ?? 'new'))
  const isNew = computed(() => entryId.value === 'new')

  const ruleset = computed(() => store.activeRuleset)
  const expansions = computed(() => store.expansionsOf(store.activeRuleset))
  const expansionId = computed(() => expansions.value[0]?.id ?? '')

  const existingEntry = computed<CustomEntry | undefined>(() => {
    if (kind.value === 'expansion' || isNew.value) return undefined
    return store.findEntry(store.activeRuleset, entryId.value)
  })

  const existingExpansion = computed<CustomExpansion | undefined>(() => {
    if (kind.value !== 'expansion' || isNew.value) return undefined
    return store.expansionOf(store.activeRuleset, entryId.value)
  })

  /* ---------------- 从模板新建（CW-D07） ---------------- */

  const repository = useRulesRepository(() => store.activeRuleset)
  const templatePickerOpen = ref(false)
  const templateEntry = ref<CustomEntry>()

  const templateOptions = computed(() => {
    const current = kind.value
    if (!current || current === 'expansion') return []
    return listCustomTemplateOptions(repository.value, current as CustomEntryKind)
  })

  /** 复制内置条目为表单初值；保存时仍走 createEntry（重新生成 ID）。 */
  function applyTemplate(id: string): void {
    const current = kind.value
    if (!current || current === 'expansion' || !expansionId.value) return
    const entry = buildTemplateEntry(repository.value, current as CustomEntryKind, id, {
      expansionId: expansionId.value,
      ruleset: ruleset.value,
    })
    if (!entry) return
    templateEntry.value = entry
    templatePickerOpen.value = false
    dirty.value = true
  }

  const templatePickerTitle = computed(() => {
    const current = kind.value
    const label = current && current !== 'expansion' ? customKindLabel(current).replace('自定义', '') : '条目'
    return `从内置${label}复制`
  })

  function openTemplatePicker(): void {
    templatePickerOpen.value = true
  }

  function closeTemplatePicker(): void {
    templatePickerOpen.value = false
  }

  const title = computed(() => {
    if (!kind.value) return '内容不存在'
    return `${isNew.value ? '新建' : '编辑'}${customKindLabel(kind.value)}`
  })

  /** 类型非法或条目不存在时回列表并提示，不跳全局 404。 */
  const missing = computed(() => {
    if (!kind.value) return true
    if (isNew.value) return false
    if (kind.value === 'expansion') return !existingExpansion.value
    return !existingEntry.value
  })

  const error = ref('')
  const dirty = ref(false)
  /** 保存成功后允许离开，避免"保存 → 返回列表"被未保存确认拦住。 */
  const saved = ref(false)

  function setDirty(value: boolean): void {
    dirty.value = value
  }

  function backToList(): void {
    void router.push({ name: 'workshop' })
  }

  function handleFailure(cause: unknown): void {
    error.value = cause instanceof Error ? cause.message : '保存失败，请检查填写内容。'
  }

  /** 新建或更新一条自定义内容。 */
  function saveEntry(input: CustomEntryInput): void {
    error.value = ''
    try {
      const existing = existingEntry.value
      if (existing) {
        store.updateEntry({
          ...input,
          id: existing.id,
          createdAt: existing.createdAt,
          updatedAt: existing.updatedAt,
        } as CustomEntry)
      } else {
        store.createEntry(input)
      }
      saved.value = true
      dirty.value = false
      backToList()
    } catch (cause) {
      handleFailure(cause)
    }
  }

  function saveExpansion(input: SaveExpansionInput): void {
    error.value = ''
    try {
      const expansion = store.saveExpansion(input)
      saved.value = true
      dirty.value = false
      // 从车卡第 2 步跳转进来的：保存后回到车卡，并把新扩展自动勾选进那份草稿（需求 Q14）。
      if (route.query.from === 'character-builder') {
        void router.push({ name: 'character-builder', query: { enableSource: expansion.id } })
        return
      }
      backToList()
    } catch (cause) {
      handleFailure(cause)
    }
  }

  // 未保存离开确认：拦下路由跳转，用户确认后再手动跳过去。
  const leavePrompt = ref(false)
  const pendingTarget = ref<string | null>(null)

  onBeforeRouteLeave((to) => {
    if (!dirty.value || saved.value) return true
    leavePrompt.value = true
    pendingTarget.value = to.fullPath
    return false
  })

  function confirmLeave(): void {
    const target = pendingTarget.value
    leavePrompt.value = false
    pendingTarget.value = null
    dirty.value = false
    if (target) void router.push(target)
  }

  function cancelLeave(): void {
    leavePrompt.value = false
    pendingTarget.value = null
  }

  return {
    kind,
    isNew,
    title,
    missing,
    ruleset,
    expansions,
    expansionId,
    existingEntry,
    existingExpansion,
    error,
    dirty,
    leavePrompt,
    templatePickerOpen,
    templateEntry,
    templateOptions,
    templatePickerTitle,
    openTemplatePicker,
    closeTemplatePicker,
    applyTemplate,
    backToList,
    setDirty,
    saveEntry,
    saveExpansion,
    confirmLeave,
    cancelLeave,
  } as const
}
