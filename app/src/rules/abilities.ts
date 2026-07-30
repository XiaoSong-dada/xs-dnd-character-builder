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
const POINT_BUY_COST: Readonly<Record<number, number>> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
}

export function pointBuyCost(scores: AbilityScores): number {
  return Object.values(scores).reduce((total, score) => total + (POINT_BUY_COST[score] ?? 99), 0)
}

export function areBaseAbilitiesValid(scores: AbilityScores, method: AbilityMethod): boolean {
  const values = Object.values(scores)
  if (method === 'standard-array') {
    return [...values].sort((a, b) => b - a).every((value, index) => value === STANDARD_ARRAY[index])
  }
  if (method === 'point-buy') {
    return values.every((value) => value >= 8 && value <= 15) && pointBuyCost(scores) <= 27
  }
  return values.every((value) => value >= 3 && value <= 20)
}
