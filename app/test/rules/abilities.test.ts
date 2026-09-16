import { describe, expect, it } from 'vitest'

import { areBaseAbilitiesValid, areOriginAbilitiesWithinCap, pointBuyCost } from '@/rules/abilities'

describe('2014 ability generation', () => {
  it('accepts the standard array exactly once each', () => {
    expect(areBaseAbilitiesValid({ str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 }, 'standard-array', '5e-2014')).toBe(true)
    expect(areBaseAbilitiesValid({ str: 15, dex: 15, con: 13, int: 8, wis: 12, cha: 10 }, 'standard-array', '5e-2014')).toBe(false)
  })

  it('calculates linear point-buy cost and allows base scores above 15', () => {
    const scores = { str: 20, dex: 16, con: 15, int: 8, wis: 8, cha: 8 }
    expect(pointBuyCost(scores, '5e-2014')).toBe(27)
    expect(areBaseAbilitiesValid(scores, 'point-buy', '5e-2014')).toBe(true)
  })

  it('rejects point-buy overspending independently from later bonuses', () => {
    const overspent = { str: 18, dex: 15, con: 13, int: 8, wis: 12, cha: 10 }
    expect(pointBuyCost(overspent, '5e-2014')).toBe(28)
    expect(areBaseAbilitiesValid(overspent, 'point-buy', '5e-2014')).toBe(false)

    const affordable = { str: 18, dex: 10, con: 10, int: 8, wis: 8, cha: 8 }
    expect(pointBuyCost(affordable, '5e-2014')).toBe(14)
    expect(areBaseAbilitiesValid(affordable, 'point-buy', '5e-2014')).toBe(true)
    expect(areOriginAbilitiesWithinCap(affordable, { str: 2 })).toBe(true)
    expect(areOriginAbilitiesWithinCap({ ...affordable, str: 19 }, { str: 2 })).toBe(false)
  })

  it('uses the official 2024 point-buy costs and maximum', () => {
    const legal = { str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 }
    expect(pointBuyCost(legal, '5e-2024')).toBe(27)
    expect(areBaseAbilitiesValid(legal, 'point-buy', '5e-2024')).toBe(true)

    const aboveMaximum = { ...legal, str: 16, dex: 14 }
    expect(areBaseAbilitiesValid(aboveMaximum, 'point-buy', '5e-2024')).toBe(false)
  })

  it('keeps the 2014 free point-buy behavior independent from 2024', () => {
    const scores = { str: 20, dex: 9, con: 8, int: 8, wis: 8, cha: 8 }
    expect(pointBuyCost(scores, '5e-2014')).toBe(13)
    expect(areBaseAbilitiesValid(scores, 'point-buy', '5e-2014')).toBe(true)
    expect(areBaseAbilitiesValid(scores, 'point-buy', '5e-2024')).toBe(false)
  })
})
