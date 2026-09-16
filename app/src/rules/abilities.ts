import type { AbilityMethod, AbilityScores, RulesetId } from '@/types/character'

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const
export const STANDARD_ARRAY_DEFAULT: AbilityScores = {
  str: 15,
  dex: 14,
  con: 13,
  int: 8,
  wis: 12,
  cha: 10,
}
const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
const POINT_BUY_BUDGET = 27
const ABILITY_SCORE_CAP = 20

interface AbilityRules {
  readonly pointBuyMinimum: number
  readonly pointBuyMaximum: number
  readonly customMinimum: number
  readonly customMaximum: number
  pointBuyScoreCost(score: number): number
}

const ABILITY_RULES: Readonly<Record<RulesetId, AbilityRules>> = {
  '5e-2014': {
    pointBuyMinimum: 8,
    pointBuyMaximum: 20,
    customMinimum: 3,
    customMaximum: 20,
    pointBuyScoreCost: (score) => Math.max(0, score - 8),
  },
  '5e-2024': {
    pointBuyMinimum: 8,
    pointBuyMaximum: 15,
    customMinimum: 3,
    customMaximum: 20,
    pointBuyScoreCost: (score) => score <= 13
      ? Math.max(0, score - 8)
      : 5 + (score - 13) * 2,
  },
}

export function pointBuyCost(scores: AbilityScores, ruleset: RulesetId): number {
  const rules = ABILITY_RULES[ruleset]
  return Object.values(scores).reduce((total, score) => total + rules.pointBuyScoreCost(score), 0)
}

export function areBaseAbilitiesValid(
  scores: AbilityScores,
  method: AbilityMethod,
  ruleset: RulesetId,
): boolean {
  const rules = ABILITY_RULES[ruleset]
  const values = Object.values(scores)
  if (method === 'standard-array') {
    return [...values].sort((a, b) => b - a).every((value, index) => value === STANDARD_ARRAY[index])
  }
  if (method === 'point-buy') {
    return ABILITY_KEYS.every((key) => {
      const baseScore = scores[key]
      return Number.isInteger(baseScore)
        && baseScore >= rules.pointBuyMinimum
        && baseScore <= rules.pointBuyMaximum
    }) && pointBuyCost(scores, ruleset) <= POINT_BUY_BUDGET
  }
  return values.every((value) => value >= rules.customMinimum && value <= rules.customMaximum)
}

export function areOriginAbilitiesWithinCap(
  scores: AbilityScores,
  bonuses: Partial<AbilityScores>,
): boolean {
  return ABILITY_KEYS.every((key) => scores[key] + (bonuses[key] ?? 0) <= ABILITY_SCORE_CAP)
}
