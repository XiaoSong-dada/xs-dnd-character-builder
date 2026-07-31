import { describe, expect, it } from 'vitest'

import { areBaseAbilitiesValid, pointBuyCost } from '@/rules/abilities'

describe('2014 ability generation', () => {
  it('accepts the standard array exactly once each', () => {
    expect(areBaseAbilitiesValid({ str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 }, 'standard-array')).toBe(true)
    expect(areBaseAbilitiesValid({ str: 15, dex: 15, con: 13, int: 8, wis: 12, cha: 10 }, 'standard-array')).toBe(false)
  })

  it('calculates linear point-buy cost and allows base scores above 15', () => {
    const scores = { str: 20, dex: 16, con: 15, int: 8, wis: 8, cha: 8 }
    expect(pointBuyCost(scores)).toBe(27)
    expect(areBaseAbilitiesValid(scores, 'point-buy')).toBe(true)
  })

  it('rejects point-buy overspending and final scores above 20 after race bonuses', () => {
    const overspent = { str: 18, dex: 15, con: 13, int: 8, wis: 12, cha: 10 }
    expect(pointBuyCost(overspent)).toBe(28)
    expect(areBaseAbilitiesValid(overspent, 'point-buy')).toBe(false)

    const affordable = { str: 18, dex: 10, con: 10, int: 8, wis: 8, cha: 8 }
    expect(pointBuyCost(affordable)).toBe(14)
    expect(areBaseAbilitiesValid(affordable, 'point-buy', { str: 2 })).toBe(true)
    expect(areBaseAbilitiesValid({ ...affordable, str: 19 }, 'point-buy', { str: 2 })).toBe(false)
  })
})
