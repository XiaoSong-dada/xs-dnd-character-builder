import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { CUSTOM_KIND_FILTERS, customKindLabel } from '@/features/custom-content/dictionary'
import { useCustomEntryReferences } from '@/features/custom-content/hooks/useCustomEntryReferences'
import { getCustomAutomationLabel, getCustomEntryAutomationLevel } from '@/rules/custom-content'
import { downloadCustomContentJson, readCustomContentFile } from '@/services/custom-content-files'
import { useCustomContentStore } from '@/stores/custom-content'
import type { RulesetId } from '@/types/character'
import type { CustomContentKind, CustomContentState, CustomEntry, CustomEntryKind } from '@/types/custom-content'
import type { CustomReferenceOwner } from '@/rules/custom-content-references'

const RULESET_OPTIONS = [
  { value: '5e-2014' as RulesetId, label: '5e 2014' },
  { value: '5e-2024' as RulesetId, label: '5e 2024' },
] as const

const ALL_RULESETS: readonly RulesetId[] = ['5e-2014', '5e-2024']

/** 待确认删除的条目（含受影响的角色，供弹窗展示）。 */
export interface PendingCustomDeletion {
  readonly entryId: string
  readonly name: string
  readonly referenceCount: number
  readonly references: readonly CustomReferenceOwner[]
  /** 引用该职业的自定义子职名称；非空时禁止删除父职业。 */
  readonly blockedSubclasses: readonly string[]
}

/** 导入预览（确认后才写入内容库）。 */
export interface CustomImportPreview {
  readonly state: CustomContentState
  readonly added: number
  readonly replaced: number
  readonly skipped: number
}

export interface WorkshopExpansionItem {
  readonly type: 'expansion'
  readonly id: string
  readonly title: string
  readonly shortTitle: string
  readonly note?: string
  readonly entryCount: number
  readonly defaultEnabled: boolean
}

export interface WorkshopEntryItem {
  readonly type: 'entry'
  readonly id: string
  readonly kind: CustomEntryKind
  readonly kindLabel: string
  readonly name: string
  readonly englishName: string
  readonly summary: string
  readonly expansionTitle: string
  readonly automationLabel: string
  readonly referenceCount: number
  readonly archived: boolean
}

export type WorkshopItem = WorkshopExpansionItem | WorkshopEntryItem

/**
 * 内容工坊列表页：规则集切换、类型筛选、搜索、计数与导航。
 *
 * 列表按「扩展 → 条目」两级展示：扩展是来源门禁，条目必须归属其中。
 */
export function useWorkshopPage() {
  const store = useCustomContentStore()
  const router = useRouter()
  const { referenceCountOf, referencesOf } = useCustomEntryReferences()

  const filter = ref<CustomContentKind | 'all'>('all')
  const query = ref('')
  const kindPickerOpen = ref(false)

  const ruleset = computed(() => store.activeRuleset)
  const bundle = computed(() => store.bundleOf(store.activeRuleset))

  const counts = computed(() => ({
    expansion: bundle.value.expansions.length,
    race: bundle.value.races.length,
    class: bundle.value.classes.length,
    subclass: bundle.value.subclasses.length,
    feat: bundle.value.feats.length,
    spell: bundle.value.spells.length,
    total: bundle.value.races.length + bundle.value.classes.length + bundle.value.subclasses.length
      + bundle.value.feats.length + bundle.value.spells.length,
  }))

  /** 类型筛选 chip：没有该类内容时置灰（除「全部」）。 */
  const kindFilters = computed(() => CUSTOM_KIND_FILTERS.map((item) => ({
    ...item,
    disabled: item.value !== 'all' && item.value !== 'expansion' && counts.value[item.value] === 0,
    count: item.value === 'all' ? counts.value.total : counts.value[item.value],
  })))

  function expansionTitle(expansionId: string): string {
    return store.expansionOf(store.activeRuleset, expansionId)?.title ?? '（扩展已删除）'
  }

  function toEntryItem(entry: CustomEntry): WorkshopEntryItem {
    return {
      type: 'entry',
      id: entry.id,
      kind: entry.kind,
      kindLabel: customKindLabel(entry.kind),
      name: entry.name,
      englishName: entry.englishName,
      summary: entry.summary,
      expansionTitle: expansionTitle(entry.expansionId),
      automationLabel: getCustomAutomationLabel(getCustomEntryAutomationLevel(entry)),
      referenceCount: referenceCountOf(entry.id),
      archived: entry.archived === true,
    }
  }

  const items = computed<readonly WorkshopItem[]>(() => {
    const expansions: WorkshopExpansionItem[] = bundle.value.expansions.map((expansion) => ({
      type: 'expansion',
      id: expansion.id,
      title: expansion.title,
      shortTitle: expansion.shortTitle,
      note: expansion.note,
      entryCount: bundle.value.races.filter((entry) => entry.expansionId === expansion.id).length
        + bundle.value.classes.filter((entry) => entry.expansionId === expansion.id).length
        + bundle.value.subclasses.filter((entry) => entry.expansionId === expansion.id).length
        + bundle.value.feats.filter((entry) => entry.expansionId === expansion.id).length
        + bundle.value.spells.filter((entry) => entry.expansionId === expansion.id).length,
      defaultEnabled: expansion.defaultEnabled,
    }))
    const entries: WorkshopEntryItem[] = [
      ...bundle.value.races,
      ...bundle.value.classes,
      ...bundle.value.subclasses,
      ...bundle.value.feats,
      ...bundle.value.spells,
    ]
      .map(toEntryItem)
      .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
    return [...expansions, ...entries]
  })

  const visibleItems = computed<readonly WorkshopItem[]>(() => {
    const keyword = query.value.trim().toLocaleLowerCase('zh-CN')
    return items.value.filter((item) => {
      const itemKind = item.type === 'expansion' ? 'expansion' : item.kind
      if (filter.value !== 'all' && itemKind !== filter.value) return false
      if (!keyword) return true
      const haystack = item.type === 'expansion'
        ? `${item.title} ${item.shortTitle} ${item.note ?? ''}`
        : `${item.name} ${item.englishName} ${item.id} ${item.expansionTitle}`
      return haystack.toLocaleLowerCase('zh-CN').includes(keyword)
    })
  })

  const hasExpansion = computed(() => bundle.value.expansions.length > 0)

  function selectRuleset(value: RulesetId): void {
    store.setActiveRuleset(value)
  }

  function setFilter(value: CustomContentKind | 'all'): void {
    filter.value = value
  }

  function openKindPicker(): void {
    kindPickerOpen.value = true
  }

  function closeKindPicker(): void {
    kindPickerOpen.value = false
  }

  function newEntryPath(kind: CustomContentKind) {
    return { name: 'workshop-editor', params: { kind, entryId: 'new' } }
  }

  function selectKind(kind: CustomContentKind): void {
    kindPickerOpen.value = false
    void router.push(newEntryPath(kind))
  }

  function openEntry(targetId: string, kind: CustomContentKind): void {
    void router.push({ name: 'workshop-editor', params: { kind, entryId: targetId } })
  }

  /** 空态文案：区分"没有扩展""搜索无结果""该类型暂无内容"三种情况。 */
  const emptyMessage = computed(() => {
    if (!hasExpansion.value) {
      return '还没有自定义扩展。内容必须先归入一本自制扩展，才能在车卡第 2 步作为来源勾选——点「＋ 新建」从「自定义扩展」开始。'
    }
    if (query.value.trim()) return `没有匹配「${query.value.trim()}」的内容。`
    if (filter.value === 'all') return '还没有内容，点「＋ 新建」开始录入。'
    return `还没有${customKindLabel(filter.value)}，点「＋ 新建」开始录入。`
  })

  /** 复制条目：保留全部内容字段，重新生成 ID 与时间戳，名称加「（副本）」。 */
  function copyEntry(entryId: string): void {
    const entry = store.findEntry(store.activeRuleset, entryId)
    if (!entry) return
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = entry
    store.createEntry({ ...input, name: `${entry.name}（副本）` })
  }

  /* ---------------- 归档 / 删除（CW-G01） ---------------- */

  const pendingDeletion = ref<PendingCustomDeletion | null>(null)
  const deleteError = ref('')

  function archiveEntry(entryId: string): void {
    store.archiveEntry(store.activeRuleset, entryId)
  }

  function restoreEntry(entryId: string): void {
    store.restoreEntry(store.activeRuleset, entryId)
  }

  /** 请求删除：先查引用，弹窗按引用情况给出「归档优先」的建议。 */
  function requestDelete(entryId: string): void {
    const entry = store.findEntry(store.activeRuleset, entryId)
    if (!entry) return
    const references = referencesOf(entryId)
    const blockedSubclasses = entry.kind === 'class'
      ? store.subclassesOfClass(store.activeRuleset, entry.id).map((subclass) => subclass.name)
      : []
    deleteError.value = ''
    pendingDeletion.value = {
      entryId,
      name: entry.name,
      referenceCount: references.length,
      references,
      blockedSubclasses,
    }
  }

  function confirmDelete(): void {
    const pending = pendingDeletion.value
    if (!pending || pending.blockedSubclasses.length > 0) return
    try {
      store.deleteEntry(store.activeRuleset, pending.entryId)
      pendingDeletion.value = null
      deleteError.value = ''
    } catch (cause) {
      deleteError.value = cause instanceof Error ? cause.message : '删除失败，请稍后重试。'
    }
  }

  /** 引用中的条目改为归档（保留已选角色的解析能力）。 */
  function archiveInsteadOfDelete(): void {
    const pending = pendingDeletion.value
    if (!pending) return
    store.archiveEntry(store.activeRuleset, pending.entryId)
    pendingDeletion.value = null
  }

  function cancelDelete(): void {
    pendingDeletion.value = null
  }

  /* ---------------- 导入 / 导出（CW-G03） ---------------- */

  const importPreview = ref<CustomImportPreview | null>(null)
  const importError = ref('')

  function exportBundle(scope: RulesetId | 'all'): void {
    downloadCustomContentJson(store.exportToJson(scope), scope)
  }

  /** 导入预览计数：与内容库现有 ID 比对，得出新增与覆盖数量。 */
  function countImport(next: CustomContentState): { added: number; replaced: number } {
    let added = 0
    let replaced = 0
    for (const ruleset of ALL_RULESETS) {
      const local = store.bundleOf(ruleset)
      const existingIds = new Set<string>([
        ...local.expansions.map((item) => item.id),
        ...local.races.map((item) => item.id),
        ...local.classes.map((item) => item.id),
        ...local.subclasses.map((item) => item.id),
        ...local.feats.map((item) => item.id),
        ...local.spells.map((item) => item.id),
      ])
      const incoming = next[ruleset]
      const incomingIds = [
        ...incoming.expansions.map((item) => item.id),
        ...incoming.races.map((item) => item.id),
        ...incoming.classes.map((item) => item.id),
        ...incoming.subclasses.map((item) => item.id),
        ...incoming.feats.map((item) => item.id),
        ...incoming.spells.map((item) => item.id),
      ]
      for (const id of incomingIds) {
        if (existingIds.has(id)) replaced += 1
        else added += 1
      }
    }
    return { added, replaced }
  }

  async function readImportFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    importError.value = ''
    try {
      const raw = await readCustomContentFile(file)
      const parsed = store.parseImport(raw)
      importPreview.value = { state: parsed.state, skipped: parsed.skipped, ...countImport(parsed.state) }
    } catch (cause) {
      importError.value = cause instanceof Error ? cause.message : '无法读取该文件。'
    } finally {
      input.value = ''
    }
  }

  function confirmImport(): void {
    const preview = importPreview.value
    if (!preview) return
    try {
      store.mergeState(preview.state)
      importError.value = ''
    } catch (cause) {
      importError.value = cause instanceof Error ? cause.message : '导入失败，请检查文件内容。'
    } finally {
      importPreview.value = null
    }
  }

  function cancelImport(): void {
    importPreview.value = null
  }

  return {
    rulesetOptions: RULESET_OPTIONS,
    filter,
    query,
    kindPickerOpen,
    ruleset,
    counts,
    kindFilters,
    items,
    visibleItems,
    hasExpansion,
    emptyMessage,
    skippedOnLoad: computed(() => store.skippedOnLoad),
    loadError: computed(() => store.loadError),
    selectRuleset,
    setFilter,
    openKindPicker,
    closeKindPicker,
    selectKind,
    openEntry,
    copyEntry,
    pendingDeletion,
    deleteError,
    archiveEntry,
    restoreEntry,
    requestDelete,
    confirmDelete,
    archiveInsteadOfDelete,
    cancelDelete,
    importPreview,
    importError,
    exportBundle,
    readImportFile,
    confirmImport,
    cancelImport,
  } as const
}
