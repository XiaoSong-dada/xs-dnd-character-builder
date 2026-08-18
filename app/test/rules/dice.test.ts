import { describe, expect, it } from 'vitest'

import {
  calculateRollTotal,
  formatDiceExpression,
  getPhysicalDiceCount,
  prepareRoll,
  resolveD100,
  splitD100,
} from '@/rules/dice'

describe('dice rules', () => {
  it('formats a mixed pool in stable D&D die order', () => {
    expect(formatDiceExpression([
      { type: 'd100', quantity: 1 },
      { type: 'd6', quantity: 2 },
      { type: 'd20', quantity: 1 },
    ])).toBe('2d6 + 1d20 + 1d100')
  })

  it('counts d100 as two physical dice', () => {
    expect(getPhysicalDiceCount([
      { type: 'd20', quantity: 2 },
      { type: 'd100', quantity: 3 },
    ])).toBe(8)
  })

  it.each([
    [0, 0, 100],
    [0, 1, 1],
    [10, 0, 10],
    [90, 9, 99],
  ])('resolves percentile dice %i + %i as %i', (tens, ones, expected) => {
    expect(resolveD100(tens, ones)).toBe(expected)
  })

  it.each([1, 10, 47, 99, 100])('round trips d100 result %i', (value) => {
    const components = splitD100(value)
    expect(resolveD100(components.tens, components.ones)).toBe(value)
  })

  it('prepares logical and physical d100 results without double counting', () => {
    const values = [14, 47]
    const preparation = prepareRoll(
      [{ type: 'd20', quantity: 1 }, { type: 'd100', quantity: 1 }],
      'roll-1',
      123,
      () => values.shift() ?? 1,
    )

    expect(preparation.results).toHaveLength(2)
    expect(preparation.request.dice).toHaveLength(3)
    expect(preparation.results[1]?.d100).toEqual({ tens: 40, ones: 7 })
    expect(calculateRollTotal(preparation.results)).toBe(61)
  })

  it('rejects more than twenty physical dice', () => {
    expect(() => prepareRoll([{ type: 'd100', quantity: 11 }], 'roll', 1, () => 1))
      .toThrow('单次最多投掷 20 个物理骰子')
  })
})

