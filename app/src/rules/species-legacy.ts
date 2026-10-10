import { SKILL_IDS } from '@/rules/data/skill-ids'
import { isSourceEnabled } from '@/rules/source-books'
import type { CharacterDraft, LineageHistoryEntry } from '@/types/character'
import type { RaceRule, RulesRepository } from '@/types/rules'

export interface SpeciesLegacyCandidate {
  readonly key: string
  readonly raceId: string
  readonly sourceIds: readonly string[]
  readonly name: string
  readonly skillId?: string
  readonly movement?: NonNullable<RaceRule['ancestralMovement']>[number]
}
type LegacyContext = Pick<CharacterDraft, 'ruleset' | 'raceId' | 'subraceId' | 'enabledSourceIds'> & Partial<Pick<CharacterDraft, 'raceSkillChoices' | 'selections' | 'targetLevel' | 'lineageHistory'>>

function originChain(draft: LegacyContext, repository: RulesRepository): readonly RaceRule[] {
  if (draft.subraceId && repository.getRace(draft.subraceId)?.parentRaceId !== draft.raceId) return []
  const result: RaceRule[] = []
  const visited = new Set<string>()
  let id = draft.subraceId ?? draft.raceId
  while (id && !visited.has(id)) {
    visited.add(id)
    const race = repository.getRace(id)
    if (!race || !isSourceEnabled(race.sourceIds, draft.enabledSourceIds, repository)) break
    result.push(race)
    id = race.parentRaceId
  }
  return result
}

function choiceSkills(race: RaceRule, draft: LegacyContext, repository: RulesRepository): readonly string[] {
  const choices = race.choices ?? []
  const valid = (id: string, seen = new Set<string>()): readonly string[] => {
    if (seen.has(id)) return []
    seen.add(id)
    const choice = choices.find((item) => item.id === id)
    if (!choice || choice.level > (draft.targetLevel ?? 1)) return []
    if (choice.parentCheckpointId && !valid(choice.parentCheckpointId, seen).includes(choice.parentOptionId ?? '')) return []
    const records = (draft.selections ?? []).filter((item) => item.checkpointId === id && !item.invalidatedAt)
    const ids = records.length === 1 ? records[0]?.optionIds ?? [] : []
    return ids.length >= choice.minSelections && ids.length <= choice.maxSelections && new Set(ids).size === ids.length && ids.every((optionId) => choice.optionIds.includes(optionId) && (!repository.getOption(optionId) || isSourceEnabled(repository.getOption(optionId)?.sourceIds ?? [], draft.enabledSourceIds, repository))) ? ids : []
  }
  return choices.filter((item) => item.grantsSkillProficiency).flatMap((item) => valid(item.id))
}

/** 候选只能由结构化种族熟练和已核验移动元数据生成，不读取说明文本或草稿数值。 */
export function getSpeciesLegacyCandidates(draft: LegacyContext, repository: RulesRepository): readonly SpeciesLegacyCandidate[] {
  if (draft.ruleset !== '5e-2014') return []
  const retained = getSpeciesLegacyBenefits(draft, repository)
  const candidates: SpeciesLegacyCandidate[] = [...retained]
  for (const race of originChain(draft, repository)) {
    const spec = race.lineage && retained.length ? undefined : race.skillProficiencyChoices
    const selected = draft.raceSkillChoices ?? []
    const skills = [...(race.skillProficiencies ?? []), ...choiceSkills(race, draft, repository)]
    if (spec && selected.length === spec.count && new Set(selected).size === selected.length && selected.every((id) => (spec.optionIds ?? SKILL_IDS).includes(id))) skills.push(...selected)
    for (const skillId of new Set(skills)) candidates.push({ key: `skill:${race.id}:${skillId}`, raceId: race.id, sourceIds: race.sourceIds, skillId, name: `${repository.getOption(skillId)?.name ?? skillId}（${race.name}）` })
    for (const movement of race.ancestralMovement ?? []) candidates.push({ key: `movement:${race.id}:${movement.kind}`, raceId: race.id, sourceIds: race.sourceIds, movement, name: `${movement.kind === 'fly' ? '飞行' : movement.kind === 'climb' ? '攀爬' : '游泳'}${movement.usesWalkingSpeed ? '速度等于当前步行' : `${movement.speed}尺`}（${race.name}；${movement.condition}）` })
  }
  return [...new Map(candidates.map((item) => [item.key, item])).values()]
}

/** 最后一条转化记录决定当前遗产；之前的记录只用于递归证明再次转化的来源。 */
export function getSpeciesLegacyBenefits(draft: LegacyContext, repository: RulesRepository): readonly SpeciesLegacyCandidate[] {
  if (draft.ruleset !== '5e-2014') return []
  const race = draft.raceId ? repository.getRace(draft.raceId) : undefined
  const history = Array.isArray(draft.lineageHistory) ? draft.lineageHistory : []
  const record = history[history.length - 1]
  if (!race?.lineage || !record || record.targetRaceId !== race.id || !isSourceEnabled(race.sourceIds, draft.enabledSourceIds, repository)) return []
  if (!Array.isArray(record.retainedKeys) || new Set(record.retainedKeys).size !== record.retainedKeys.length || !Number.isInteger(record.level) || record.level < 1 || record.level > 20) return []
  const original = record.origin
  if (!original || !Array.isArray(original.sourceIds) || !Array.isArray(original.selections) || !Array.isArray(original.raceSkillChoices)) return []
  const sourceIds = original.sourceIds.filter((id: string) => draft.enabledSourceIds.includes(id) || repository.sources.some((source) => source.id === id && source.category === 'core'))
  const candidates = getSpeciesLegacyCandidates({ ruleset: '5e-2014', raceId: original.raceId, subraceId: original.subraceId, raceSkillChoices: original.raceSkillChoices, selections: original.selections, targetLevel: record.level, enabledSourceIds: sourceIds, lineageHistory: history.slice(0, -1) }, repository)
  return candidates.filter((item) => record.retainedKeys.includes(item.key))
}

export function getActiveLineageRecord(draft: LegacyContext, repository: RulesRepository): LineageHistoryEntry | undefined {
  const record = draft.lineageHistory?.[draft.lineageHistory.length - 1]
  const race = draft.raceId ? repository.getRace(draft.raceId) : undefined
  return draft.ruleset === '5e-2014' && race?.lineage && record?.targetRaceId === race.id && Array.isArray(record.retainedKeys) && Array.isArray(record.origin?.languages) && isSourceEnabled(race.sourceIds, draft.enabledSourceIds, repository) ? record : undefined
}
