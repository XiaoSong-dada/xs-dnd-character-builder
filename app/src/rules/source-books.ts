import { CORE_SOURCE_IDS, SELECTABLE_SOURCE_IDS, sources2014 } from '@/rules/data/sources-2014'
import type { CharacterDraft } from '@/types/character'
import type { RulesRepository } from '@/types/rules'

const coreIds = new Set(CORE_SOURCE_IDS)
const selectableIds = new Set(SELECTABLE_SOURCE_IDS)

export function isSourceEnabled(sourceIds: readonly string[], enabledSourceIds?: readonly string[]): boolean {
  if (sourceIds.length === 0) return true
  if (sourceIds.some((id) => coreIds.has(id))) return true
  if (enabledSourceIds === undefined) return true
  const enabled = new Set(enabledSourceIds)
  return sourceIds.some((id) => enabled.has(id))
}

export function getSelectableSources() {
  return sources2014.filter((item) => item.selectable)
}

export function getDefaultEnabledSourceIds(): readonly string[] {
  return [...SELECTABLE_SOURCE_IDS]
}

export function normalizeEnabledSourceIds(ids: readonly string[] | undefined): readonly string[] {
  if (!ids) return []
  return [...new Set(ids.filter((id) => selectableIds.has(id)))]
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
