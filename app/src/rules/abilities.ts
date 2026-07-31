import type { AbilityMethod, AbilityScores } from '@/types/character'

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
const POINT_BUY_MINIMUM = 8
const POINT_BUY_MAXIMUM = 20
const POINT_BUY_BUDGET = 27

export function pointBuyCost(scores: AbilityScores): number {
  return Object.values(scores).reduce((total, score) => total + Math.max(0, score - POINT_BUY_MINIMUM), 0)
}

export function areBaseAbilitiesValid(
  scores: AbilityScores,
  method: AbilityMethod,
): boolean {
  const values = Object.values(scores)
  if (method === 'standard-array') {
    return [...values].sort((a, b) => b - a).every((value, index) => value === STANDARD_ARRAY[index])
  }
  if (method === 'point-buy') {
    return ABILITY_KEYS.every((key) => {
      const baseScore = scores[key]
      return Number.isInteger(baseScore)
        && baseScore >= POINT_BUY_MINIMUM
        && baseScore <= POINT_BUY_MAXIMUM
    }) && pointBuyCost(scores) <= POINT_BUY_BUDGET
  }
  return values.every((value) => value >= 3 && value <= 20)
}

export function areOriginAbilitiesWithinCap(
  scores: AbilityScores,
  bonuses: Partial<AbilityScores>,
): boolean {
  return ABILITY_KEYS.every((key) => scores[key] + (bonuses[key] ?? 0) <= POINT_BUY_MAXIMUM)
}
