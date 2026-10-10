import { deriveCharacter } from '@/rules/derive'
import { getFixedSpeciesLanguages } from '@/rules/languages'
import { getEffectiveSpeciesFeatures, getOriginStepBlockers } from '@/rules/origins'
import { getRulesRepository } from '@/rules/repositories'
import { isSourceEnabled } from '@/rules/source-books'
import { getSpeciesLegacyCandidates } from '@/rules/species-legacy'
import { validateDraft } from '@/rules/validate'
import type { CharacterDraft, DerivedCharacter } from '@/types/character'

export interface LineageTransformationPreview {
  readonly draft: CharacterDraft
  readonly before: DerivedCharacter
  readonly after: DerivedCharacter
  readonly removedFeatures: readonly string[]
  readonly pending: readonly string[]
}

/** 预览构造新草稿，不写存储；遗产键必须重新从原种族结构化资料证明。 */
export function previewLineageTransformation(draft: CharacterDraft, targetRaceId: string, retainedKeys: readonly string[], transformedAt: string): LineageTransformationPreview {
  const repository = getRulesRepository(draft.ruleset)
  const target = repository.getRace(targetRaceId)
  const original = draft.raceId ? repository.getRace(draft.raceId) : undefined
  if (draft.ruleset !== '5e-2014' || !target?.lineage || !original || target.id === original.id || !isSourceEnabled(target.sourceIds, draft.enabledSourceIds, repository) || !isSourceEnabled(original.sourceIds, draft.enabledSourceIds, repository)) throw new Error('请选择已启用来源中的不同血统。')
  const candidates = getSpeciesLegacyCandidates(draft, repository)
  if (new Set(retainedKeys).size !== retainedKeys.length || retainedKeys.some((key) => !candidates.some((item) => item.key === key))) throw new Error('先祖遗产选择无效，请重新选择合法的种族技能或特殊移动。')
  const originIds = new Set([draft.raceId, draft.subraceId].filter((id): id is string => Boolean(id)))
  const raceCheckpoints = new Set([...originIds].flatMap((id) => [...(repository.getRace(id)?.choices ?? []).map((choice) => choice.id), `${id}-origin-feat`]))
  const selections = draft.selections.map((selection) => raceCheckpoints.has(selection.checkpointId) || (selection.checkpointId.startsWith('feat-child:') && raceCheckpoints.has(selection.checkpointId.split(':')[1] ?? '')) ? { ...selection, invalidatedAt: transformedAt, invalidatedReason: '血统转化：原种族选择仅保留追溯' } : selection)
  const next: CharacterDraft = {
    ...draft, raceId: target.id, subraceId: undefined, raceAbilityChoices: [], raceAbilityBonusOptionId: undefined,
    raceSkillChoices: [], raceToolChoice: undefined, raceToolChoices: undefined, speciesSizeChoice: undefined,
    languages: [], selections,
    lineageHistory: [...(draft.lineageHistory ?? []), {
      targetRaceId: target.id, transformedAt, level: draft.targetLevel, retainedKeys: [...retainedKeys],
      origin: { raceId: original.id, subraceId: draft.subraceId, sourceIds: [...draft.enabledSourceIds], raceAbilityChoices: [...draft.raceAbilityChoices], raceAbilityBonusOptionId: draft.raceAbilityBonusOptionId, raceSkillChoices: [...(draft.raceSkillChoices ?? [])], raceToolChoice: draft.raceToolChoice, raceToolChoices: draft.raceToolChoices, speciesSizeChoice: draft.speciesSizeChoice, selections: draft.selections.map((item) => ({ ...item, optionIds: [...item.optionIds] })), languages: [...new Set([...getFixedSpeciesLanguages(draft, repository), ...draft.languages])] },
    }],
  }
  return { draft: next, before: deriveCharacter(draft), after: deriveCharacter(next), removedFeatures: getEffectiveSpeciesFeatures(draft, repository).map((item) => item.name), pending: [...new Set([...getOriginStepBlockers(next, repository).map((item) => item.resolution), ...validateDraft(next).filter((issue) => issue.severity === 'error').map((issue) => issue.resolution)])] }
}
