import { isSourceEnabled } from '@/rules/source-books'
import type { AbilityKey, AbilityScores, CharacterDraft } from '@/types/character'
import type { RaceRule, RulesRepository } from '@/types/rules'

export const ABILITY_KEYS_ORDER: readonly AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

/** 角色物种链规则（子种族起沿 parentRaceId 叠加，来源关闭时跳过）；2014 与 2024 通用。 */
export function getDraftSpeciesRules(draft: CharacterDraft, repository: RulesRepository): readonly RaceRule[] {
  const rules: RaceRule[] = []
  const visited = new Set<string>()
  const visit = (raceId: string | undefined): void => {
    if (!raceId || visited.has(raceId)) return
    visited.add(raceId)
    const race = repository.getRace(raceId)
    if (!race || !isSourceEnabled(race.sourceIds, draft.enabledSourceIds, repository)) return
    if (race.parentRaceId) visit(race.parentRaceId)
    rules.push(race)
  }
  visit(draft.subraceId ?? draft.raceId)
  return rules
}

/** 物种无条件派生：每级最大生命值加成（矮人坚韧等）。 */
export function getSpeciesHitPointBonus(draft: CharacterDraft, repository: RulesRepository): number {
  if (draft.ruleset !== '5e-2024') return 0
  return getDraftSpeciesRules(draft, repository)
    .reduce((sum, race) => sum + (race.hitPointBonusPerLevel ?? 0) * draft.targetLevel, 0)
}

/** 2024 背景属性分配收益（+2/+1 或各 +1）；非法或缺失时返回空。 */
export function getBackgroundAbilityBonuses(
  draft: CharacterDraft,
  repository: RulesRepository,
): Partial<AbilityScores> {
  if (draft.ruleset !== '5e-2024') return {}
  const allocation = draft.backgroundAbilityAllocation
  const background = draft.backgroundId ? repository.getBackground(draft.backgroundId) : undefined
  if (!allocation || !background || !isSourceEnabled(background.sourceIds, draft.enabledSourceIds, repository)) return {}
  const bonuses: Partial<Record<AbilityKey, number>> = {}
  for (const key of ABILITY_KEYS_ORDER) {
    const value = allocation[key]
    if (value) bonuses[key] = value
  }
  return bonuses
}

/**
 * 2024 背景属性分配是否合法：三候选内、且为“一项 +2 与另一项 +1”或“三项各 +1”。
 * 返回中文原因；合法时返回空字符串。
 */
export function getBackgroundAllocationIssue(
  draft: CharacterDraft,
  repository: RulesRepository,
): string {
  if (draft.ruleset !== '5e-2024') return ''
  const background = draft.backgroundId ? repository.getBackground(draft.backgroundId) : undefined
  if (!background?.abilityChoices?.length) return ''
  const allocation = draft.backgroundAbilityAllocation ?? {}
  const entries = ABILITY_KEYS_ORDER
    .map((key) => [key, allocation[key] ?? 0] as const)
    .filter(([, value]) => value > 0)
  if (entries.length === 0) return '背景属性加值尚未分配。'
  if (entries.some(([key]) => !background.abilityChoices?.includes(key))) {
    return '背景属性分配包含候选之外的属性。'
  }
  const values = entries.map(([, value]) => value).sort((left, right) => left - right)
  const validPattern = (values.length === 3 && values.every((value) => value === 1))
    || (values.length === 2 && values[0] === 1 && values[1] === 2)
  if (!validPattern) return '背景属性分配必须是“一项 +2 与另一项 +1”或“三项各 +1”。'
  const exceeded = entries.find(([key, value]) => draft.baseAbilities[key] + value > 20)
  if (exceeded) return `${exceeded[0].toUpperCase()} 加上背景加值后会超过 20。`
  return ''
}
