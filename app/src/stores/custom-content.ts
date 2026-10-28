import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import {
  buildCustomEntryId,
  buildCustomExpansionId,
  emptyBundle,
  emptyCustomContentState,
  isEmptyBundle,
  validateCustomEntry,
  validateCustomExpansion,
} from '@/rules/custom-content'
import { getCustomContentRevision, registerCustomContent, resetCustomContent } from '@/rules/repositories'
import { CustomContentStorageError, CustomContentStorageService, clearStoredCustomContent } from '@/services/custom-content-storage'
import { resolveInitialRuleset } from '@/services/ruleset-preference'
import type { RulesetId } from '@/types/character'
import type {
  CustomClassEntry,
  CustomContentBundle,
  CustomContentState,
  CustomEntry,
  CustomExpansion,
  CustomFeatEntry,
  CustomRaceEntry,
  CustomSpellEntry,
} from '@/types/custom-content'

const RULESETS: readonly RulesetId[] = ['5e-2014', '5e-2024']

/**
 * 内容库版本号的模块级响应式镜像。
 *
 * 组件（车卡各步骤、角色卡、跑团面板）通过 `hooks/useRulesRepository` 读取它来决定是否重新解析仓库。
 * 之所以不直接依赖 store：组件单测可能没有安装 Pinia，而内容版本本身是进程级全局状态，
 * 放在模块级 `ref` 即可在有无 Pinia 的环境下都工作。
 */
export const customContentVersion = ref(0)

type CustomEntryManagedKeys = 'id' | 'createdAt' | 'updatedAt'

/**
 * 条目输入：由界面提供，ID / 时间戳由 store 生成。
 *
 * 用四类条目的联合而不是泛型投影，是为了让 `createEntry` 在 `switch (input.kind)`
 * 后自然收窄，避免使用类型断言。
 */
export type CustomEntryInput =
  | Omit<CustomRaceEntry, CustomEntryManagedKeys>
  | Omit<CustomClassEntry, CustomEntryManagedKeys>
  | Omit<CustomFeatEntry, CustomEntryManagedKeys>
  | Omit<CustomSpellEntry, CustomEntryManagedKeys>

export interface SaveExpansionInput {
  readonly id?: string
  readonly ruleset: RulesetId
  readonly title: string
  readonly shortTitle: string
  readonly note?: string
  readonly defaultEnabled: boolean
}

function newToken(): string {
  const cryptoApi = globalThis.crypto as Crypto | undefined
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID()
  return `cc-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 10)}`
}

function now(): string {
  return new Date().toISOString()
}

function withEntry(bundle: CustomContentBundle, entry: CustomEntry): CustomContentBundle {
  switch (entry.kind) {
    case 'race':
      return { ...bundle, races: [...bundle.races.filter((item) => item.id !== entry.id), entry] }
    case 'class':
      return { ...bundle, classes: [...bundle.classes.filter((item) => item.id !== entry.id), entry] }
    case 'feat':
      return { ...bundle, feats: [...bundle.feats.filter((item) => item.id !== entry.id), entry] }
    case 'spell':
      return { ...bundle, spells: [...bundle.spells.filter((item) => item.id !== entry.id), entry] }
  }
}

function withoutEntry(bundle: CustomContentBundle, entry: CustomEntry): CustomContentBundle {
  switch (entry.kind) {
    case 'race':
      return { ...bundle, races: bundle.races.filter((item) => item.id !== entry.id) }
    case 'class':
      return { ...bundle, classes: bundle.classes.filter((item) => item.id !== entry.id) }
    case 'feat':
      return { ...bundle, feats: bundle.feats.filter((item) => item.id !== entry.id) }
    case 'spell':
      return { ...bundle, spells: bundle.spells.filter((item) => item.id !== entry.id) }
  }
}

function flattenEntries(bundle: CustomContentBundle): readonly CustomEntry[] {
  return [...bundle.races, ...bundle.classes, ...bundle.feats, ...bundle.spells]
}

/** 只替换一个规则集的分包，另一套原样保留（避免用计算属性键导致的类型退化）。 */
function withBundle(state: CustomContentState, ruleset: RulesetId, bundle: CustomContentBundle): CustomContentState {
  return ruleset === '5e-2014'
    ? { '5e-2014': bundle, '5e-2024': state['5e-2024'] }
    : { '5e-2014': state['5e-2014'], '5e-2024': bundle }
}

const VIEW_STORAGE_KEY = 'dnd-custom-content:view:v1'

function readActiveRuleset(): RulesetId {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isRecord(parsed) && (parsed.ruleset === '5e-2014' || parsed.ruleset === '5e-2024')) return parsed.ruleset
    }
  } catch {
    // 预渲染或存储不可用：退回版本偏好。
  }
  return resolveInitialRuleset().ruleset
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 内容工坊 store：本机内容库的唯一事实源。
 *
 * - store 创建时同步读入内容库并注册到规则仓库（`App.vue` setup 阶段调用，
 *   早于任何页面渲染，因此车卡首屏即可见自定义内容）；
 * - 每次写入先落盘再重建仓库；落盘失败会回滚状态，避免"界面已改、存储未改"；
 * - `revision` 作为响应式依赖供 `hooks/useRulesRepository` 使用。
 */
export const useCustomContentStore = defineStore('custom-content', () => {
  const loaded = CustomContentStorageService.load()
  const state = ref<CustomContentState>(loaded.state)
  const revision = ref(getCustomContentRevision())
  const skippedOnLoad = ref(loaded.skipped)
  const loadError = ref(loaded.error ?? '')
  /** 列表/编辑器共用的当前规则集（切页、刷新后保持）。 */
  const activeRuleset = ref<RulesetId>(readActiveRuleset())

  syncRegistration()

  function setActiveRuleset(ruleset: RulesetId): void {
    activeRuleset.value = ruleset
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify({ ruleset }))
    } catch {
      // 存储不可用时仅保留内存状态。
    }
  }

  /** 按当前内容库重建规则仓库（注册是非增量的，先清空再注册）。 */
  function syncRegistration(): void {
    resetCustomContent()
    for (const ruleset of RULESETS) {
      const bundle = state.value[ruleset]
      if (!isEmptyBundle(bundle)) registerCustomContent(ruleset, bundle)
    }
    revision.value = getCustomContentRevision()
    customContentVersion.value = revision.value
  }

  function commit(next: CustomContentState): void {
    const previous = state.value
    state.value = next
    try {
      CustomContentStorageService.save(next)
    } catch (error) {
      state.value = previous
      throw error
    }
    syncRegistration()
  }

  function emptyState(): CustomContentState {
    return {
      '5e-2014': emptyBundle(),
      '5e-2024': emptyBundle(),
    }
  }

  const expansionsOf = computed(() => (ruleset: RulesetId) => state.value[ruleset].expansions)
  const entriesOf = computed(() => (ruleset: RulesetId) => flattenEntries(state.value[ruleset]))
  const bundleOf = computed(() => (ruleset: RulesetId) => state.value[ruleset])

  function findEntry(ruleset: RulesetId, entryId: string): CustomEntry | undefined {
    return flattenEntries(state.value[ruleset]).find((entry) => entry.id === entryId)
  }

  function expansionOf(ruleset: RulesetId, expansionId: string): CustomExpansion | undefined {
    return state.value[ruleset].expansions.find((expansion) => expansion.id === expansionId)
  }

  /** 新建或更新一本自定义扩展；返回保存后的扩展。 */
  function saveExpansion(input: SaveExpansionInput): CustomExpansion {
    const existing = input.id ? expansionOf(input.ruleset, input.id) : undefined
    const expansion: CustomExpansion = {
      id: existing?.id ?? buildCustomExpansionId(newToken()),
      ruleset: input.ruleset,
      title: input.title.trim(),
      shortTitle: input.shortTitle.trim(),
      note: input.note?.trim() || undefined,
      defaultEnabled: input.defaultEnabled,
      createdAt: existing?.createdAt ?? now(),
      updatedAt: now(),
    }
    const issues = validateCustomExpansion(expansion)
    if (issues.length > 0) throw new CustomContentStorageError(issues[0] ?? '扩展信息不完整。')
    const bundle = state.value[input.ruleset]
    const expansions = existing
      ? bundle.expansions.map((item) => (item.id === expansion.id ? expansion : item))
      : [...bundle.expansions, expansion]
    commit(withBundle(state.value, input.ruleset, { ...bundle, expansions }))
    return expansion
  }

  /** 删除扩展：仅当扩展下没有任何条目时允许，保证来源门禁不会留下悬空条目。 */
  function deleteExpansion(ruleset: RulesetId, expansionId: string): void {
    const bundle = state.value[ruleset]
    const used = flattenEntries(bundle).filter((entry) => entry.expansionId === expansionId)
    if (used.length > 0) {
      throw new CustomContentStorageError(`该扩展下还有 ${used.length} 条内容，请先迁移或删除后再删除扩展。`)
    }
    commit(withBundle(state.value, ruleset, {
      ...bundle,
      expansions: bundle.expansions.filter((item) => item.id !== expansionId),
    }))
  }

  /** 新建条目；校验不通过时抛出中文原因（首个），不写入。 */
  function createEntry(input: CustomEntryInput): CustomEntry {
    const managed = { id: buildCustomEntryId(input.kind, newToken()), createdAt: now(), updatedAt: now() }
    // 按 kind 分支构造，保证每类条目保持自己的判别属性（不使用类型断言）。
    let draftEntry: CustomEntry
    switch (input.kind) {
      case 'race':
        draftEntry = { ...input, ...managed }
        break
      case 'class':
        draftEntry = { ...input, ...managed }
        break
      case 'feat':
        draftEntry = { ...input, ...managed }
        break
      case 'spell':
        draftEntry = { ...input, ...managed }
        break
    }
    const ruleset = draftEntry.ruleset
    const issues = validateCustomEntry(draftEntry)
    if (issues.length > 0) throw new CustomContentStorageError(issues[0] ?? '内容信息不完整。')
    commit(withBundle(state.value, ruleset, withEntry(state.value[ruleset], draftEntry)))
    return draftEntry
  }

  /** 更新条目（ID 与创建时间保持不变）。 */
  function updateEntry(entry: CustomEntry): CustomEntry {
    const existing = findEntry(entry.ruleset, entry.id)
    if (!existing) throw new CustomContentStorageError('该自定义内容不存在，可能已被删除。')
    const nextEntry: CustomEntry = { ...entry, createdAt: existing.createdAt, updatedAt: now() }
    const issues = validateCustomEntry(nextEntry)
    if (issues.length > 0) throw new CustomContentStorageError(issues[0] ?? '内容信息不完整。')
    commit(withBundle(state.value, entry.ruleset, withEntry(state.value[entry.ruleset], nextEntry)))
    return nextEntry
  }

  function setArchived(ruleset: RulesetId, entryId: string, archived: boolean): void {
    const existing = findEntry(ruleset, entryId)
    if (!existing) throw new CustomContentStorageError('该自定义内容不存在，可能已被删除。')
    const nextEntry = { ...existing, archived: archived ? true : undefined, updatedAt: now() } as CustomEntry
    commit(withBundle(state.value, ruleset, withEntry(state.value[ruleset], nextEntry)))
  }

  function archiveEntry(ruleset: RulesetId, entryId: string): void {
    setArchived(ruleset, entryId, true)
  }

  function restoreEntry(ruleset: RulesetId, entryId: string): void {
    setArchived(ruleset, entryId, false)
  }

  /** 删除条目；调用方（界面）负责先做引用检测与二次确认。 */
  function deleteEntry(ruleset: RulesetId, entryId: string): void {
    const existing = findEntry(ruleset, entryId)
    if (!existing) return
    commit(withBundle(state.value, ruleset, withoutEntry(state.value[ruleset], existing)))
  }

  /** 导出为 JSON 文本（当前规则集或全部）。 */
  function exportToJson(scope: RulesetId | 'all'): string {
    return CustomContentStorageService.exportJson(state.value, scope)
  }

  /** 解析待导入文件（不做写入，供预览页使用）。 */
  function parseImport(raw: string): { state: CustomContentState; skipped: number } {
    return CustomContentStorageService.importJson(raw)
  }

  /** 写入合并后的内容库（导入确认后调用）。 */
  function replaceState(next: CustomContentState): void {
    commit(next)
  }

  /**
   * 合并导入的内容库：同 ID 用导入版本覆盖，本机独有条目保留。
   * 返回计数用于导入预览与结果提示。
   */
  function mergeState(imported: CustomContentState): { added: number; replaced: number } {
    let added = 0
    let replaced = 0
    const mergeList = <T extends { readonly id: string }>(target: readonly T[], source: readonly T[]): readonly T[] => {
      const map = new Map(target.map((item) => [item.id, item]))
      for (const item of source) {
        if (map.has(item.id)) replaced += 1
        else added += 1
        map.set(item.id, item)
      }
      return [...map.values()]
    }
    const mergeBundle = (target: CustomContentBundle, source: CustomContentBundle): CustomContentBundle => ({
      version: 1,
      // 先合并扩展，保证随后合并的条目都能找到所属扩展。
      expansions: mergeList(target.expansions, source.expansions),
      races: mergeList(target.races, source.races),
      classes: mergeList(target.classes, source.classes),
      feats: mergeList(target.feats, source.feats),
      spells: mergeList(target.spells, source.spells),
    })
    commit({
      '5e-2014': mergeBundle(state.value['5e-2014'], imported['5e-2014']),
      '5e-2024': mergeBundle(state.value['5e-2024'], imported['5e-2024']),
    })
    return { added, replaced }
  }

  /** 清空内容库（危险操作，界面需二次确认）。 */
  function clearAll(): void {
    clearStoredCustomContent()
    commit(emptyState())
  }

  /** 仅供测试：清空内容库与仓库注册。 */
  function resetForTests(): void {
    clearStoredCustomContent()
    try {
      localStorage.removeItem(VIEW_STORAGE_KEY)
    } catch {
      // 忽略：没有可清理的存储时无需报错。
    }
    state.value = emptyCustomContentState()
    skippedOnLoad.value = 0
    loadError.value = ''
    syncRegistration()
  }

  return {
    state,
    revision,
    skippedOnLoad,
    loadError,
    activeRuleset,
    setActiveRuleset,
    expansionsOf,
    entriesOf,
    bundleOf,
    findEntry,
    expansionOf,
    saveExpansion,
    deleteExpansion,
    createEntry,
    updateEntry,
    archiveEntry,
    restoreEntry,
    deleteEntry,
    exportToJson,
    parseImport,
    replaceState,
    mergeState,
    clearAll,
    resetForTests,
  }
})
