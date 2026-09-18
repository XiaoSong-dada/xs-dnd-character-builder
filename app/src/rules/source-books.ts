import { CORE_SOURCE_IDS, SELECTABLE_SOURCE_IDS, sources2014 } from '@/rules/data/sources-2014'
import { sources2024 } from '@/rules/data/sources-2024'
import type { CharacterDraft, RuleSource, RulesetId } from '@/types/character'
import type { RulesRepository } from '@/types/rules'

const coreIds = new Set(CORE_SOURCE_IDS)
const selectableIds = new Set(SELECTABLE_SOURCE_IDS)

const sourcesByRuleset: Readonly<Record<RulesetId, readonly RuleSource[]>> = {
  '5e-2014': sources2014,
  '5e-2024': sources2024,
}

/** 各规则集可切换来源的 ID 白名单；2024 只包含扩展来源，核心来源始终启用。 */
const selectableIdsByRuleset: Readonly<Record<RulesetId, ReadonlySet<string>>> = {
  '5e-2014': selectableIds,
  '5e-2024': new Set(sources2024.filter((source) => source.selectable).map((source) => source.id)),
}

/**
 * 来源是否启用。传入 `repository` 时按其规则集来源判定（核心书始终启用）；
 * 省略时保持 2014 白名单行为。
 */
export function isSourceEnabled(
  sourceIds: readonly string[],
  enabledSourceIds?: readonly string[],
  repository?: RulesRepository,
): boolean {
  if (sourceIds.length === 0) return true
  if (repository) {
    const repositoryCoreIds = new Set(
      repository.sources.filter((source) => source.category === 'core').map((source) => source.id),
    )
    if (sourceIds.some((id) => repositoryCoreIds.has(id))) return true
    if (enabledSourceIds === undefined) return true
    const enabled = new Set(enabledSourceIds)
    return sourceIds.some((id) => enabled.has(id))
  }
  if (sourceIds.some((id) => coreIds.has(id))) return true
  if (enabledSourceIds === undefined) return true
  const enabled = new Set(enabledSourceIds)
  return sourceIds.some((id) => enabled.has(id))
}

/** 按规则集返回可切换的来源；缺省 2014，保持既有调用行为。 */
export function getSelectableSources(ruleset: RulesetId = '5e-2014'): readonly RuleSource[] {
  return sourcesByRuleset[ruleset].filter((item) => item.selectable)
}

/**
 * 新草稿默认启用的来源：2014 保持默认全选；2024 的破解奥秘（UA）为
 * 游玩测试内容，默认全关（D-02），由玩家在来源步骤显式开启。
 */
export function getDefaultEnabledSourceIds(ruleset: RulesetId = '5e-2014'): readonly string[] {
  if (ruleset === '5e-2024') return []
  return sources2014.filter((source) => source.selectable && source.defaultEnabled !== false).map((source) => source.id)
}

/** 按规则集白名单过滤未知或已移除的来源 ID；缺省 2014，保持既有调用行为。 */
export function normalizeEnabledSourceIds(
  ids: readonly string[] | undefined,
  ruleset: RulesetId = '5e-2014',
): readonly string[] {
  if (!ids) return []
  const whitelist = selectableIdsByRuleset[ruleset]
  return [...new Set(ids.filter((id) => whitelist.has(id)))]
}

function addSources(target: Set<string>, sourceIds: readonly string[] | undefined): void {
  for (const id of sourceIds ?? []) {
    if (selectableIds.has(id)) target.add(id)
  }
}

/**
 * v2—v4 草稿没有来源开关：只启用角色当前实际引用内容所需的扩展来源。
 * 无法解析的旧 ID 不丢弃，后续由常规校验报告。
 */
export function inferEnabledSourceIds(
  draft: Partial<CharacterDraft>,
  repository: RulesRepository,
): readonly string[] {
  const inferred = new Set<string>()
  addSources(inferred, draft.classId ? repository.getClass(draft.classId)?.sourceIds : undefined)
  addSources(inferred, draft.subclassId ? repository.getSubclass(draft.subclassId)?.sourceIds : undefined)
  addSources(inferred, draft.raceId ? repository.getRace(draft.raceId)?.sourceIds : undefined)
  addSources(inferred, draft.subraceId ? repository.getRace(draft.subraceId)?.sourceIds : undefined)
  addSources(inferred, draft.backgroundId ? repository.getBackground(draft.backgroundId)?.sourceIds : undefined)
  addSources(inferred, draft.backgroundVariantId ? repository.getBackground(draft.backgroundVariantId)?.sourceIds : undefined)
  for (const selection of draft.selections ?? []) {
    for (const optionId of selection.optionIds) addSources(inferred, repository.getOption(optionId)?.sourceIds)
  }
  for (const spellId of [
    ...(draft.spellSelections?.cantripIds ?? []),
    ...(draft.spellSelections?.knownSpellIds ?? []),
    ...(draft.spellSelections?.preparedSpellIds ?? []),
    ...(draft.spellSelections?.spellbookSpellIds ?? []),
  ]) addSources(inferred, repository.getSpell(spellId)?.sourceIds)
  for (const entry of draft.inventory ?? []) addSources(inferred, repository.getEquipment(entry.itemId)?.sourceIds)
  return [...inferred]
}
