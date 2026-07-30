import { describe, expect, it } from 'vitest'

import { areBaseAbilitiesValid, pointBuyCost } from '@/rules/abilities'

describe('2014 ability generation', () => {
  it('accepts the standard array exactly once each', () => {
    expect(areBaseAbilitiesValid({ str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 }, 'standard-array')).toBe(true)
    expect(areBaseAbilitiesValid({ str: 15, dex: 15, con: 13, int: 8, wis: 12, cha: 10 }, 'standard-array')).toBe(false)
  })

  it('calculates the nonlinear 27-point-buy cost', () => {
    const scores = { str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 }
    expect(pointBuyCost(scores)).toBe(27)
    expect(areBaseAbilitiesValid(scores, 'point-buy')).toBe(true)
  })
})
