import { describe, expect, it } from 'vitest'

import {
  calculateDiceTotal,
  calculateRollTotal,
  formatDiceExpression,
  formatRollTotalFormula,
  getPhysicalDiceCount,
  parseRollModifier,
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

  it('adds the fixed modifier to the total only once', () => {
    const results = [
      { id: 'a', type: 'd6' as const, value: 3 },
      { id: 'b', type: 'd6' as const, value: 4 },
    ]
    expect(calculateDiceTotal(results)).toBe(7)
    expect(calculateRollTotal(results)).toBe(7)
    expect(calculateRollTotal(results, 5)).toBe(12)
    expect(calculateRollTotal(results, -2)).toBe(5)
    expect(calculateRollTotal(results, 0)).toBe(7)
  })

  it.each([
    ['', 0],
    ['   ', 0],
    ['0', 0],
    ['+5', 5],
    ['-2', -2],
    [' 12 ', 12],
  ])('parses modifier %j as %i with no error', (input, expected) => {
    expect(parseRollModifier(input)).toEqual({ value: expected, error: '' })
  })

  it.each(['1.5', 'abc', '1e3', '--2', '1 2'])('rejects invalid modifier %j', (input) => {
    const parsed = parseRollModifier(input)
    expect(parsed.value).toBe(0)
    expect(parsed.error).toContain('整数')
  })

  it('rejects a modifier outside the safe integer range', () => {
    expect(parseRollModifier('99999999999999999999').error).toContain('超出可处理范围')
  })

  it.each([
    [7, -2, '7 − 2 = 5'],
    [7, 5, '7 + 5 = 12'],
    [7, 0, '7 + 0 = 7'],
  ])('formats %i with modifier %i as %s', (diceTotal, modifier, expected) => {
    expect(formatRollTotalFormula(diceTotal, modifier)).toBe(expected)
  })
})


import type { DiceRollSnapshot } from '@/rules/dice'
import { buildRerollRequest, rerollLogicalResult } from '@/rules/dice'
import type { LogicalRollResult, RollRequest } from '@/types/dice'

const rerollResults: LogicalRollResult[] = [
  { id: 'a', type: 'd6', value: 3 },
  { id: 'b', type: 'd6', value: 5 },
  { id: 'c', type: 'd100', value: 47, d100: { tens: 40, ones: 7 } },
]

function createSnapshot(): DiceRollSnapshot {
  const request: RollRequest = {
    id: 'roll-1',
    seed: 1,
    dice: [
      { id: 'a', logicalId: 'a', type: 'd6', resultKind: 'standard', targetValue: 3 },
      { id: 'b', logicalId: 'b', type: 'd6', resultKind: 'standard', targetValue: 5 },
      { id: 'c:tens', logicalId: 'c', type: 'd10', resultKind: 'percentile-tens', targetValue: 4 },
      { id: 'c:ones', logicalId: 'c', type: 'd10', resultKind: 'percentile-ones', targetValue: 7 },
    ],
  }
  const frameCount = 2
  const diceCount = request.dice.length
  const transforms = new Float32Array(frameCount * diceCount * 7)
  request.dice.forEach((_, index) => {
    for (let frame = 0; frame < frameCount; frame += 1) {
      const offset = (frame * diceCount + index) * 7
      transforms[offset] = index
      transforms[offset + 1] = 0.5
      transforms[offset + 2] = -index
      transforms[offset + 6] = 1
    }
  })
  return {
    request,
    trajectory: {
      rollId: request.id,
      diceIds: request.dice.map((die) => die.id),
      frameRate: 60,
      frameCount,
      durationMs: 33,
      transforms,
      landingDirectionIndices: [0, 1, 2, 3],
    },
  }
}

describe('single die reroll rules', () => {
  it('replaces only one logical result and refreshes d100 components', () => {
    const rerolled = rerollLogicalResult(rerollResults[2] ?? rerollResults[0]!, () => 7)
    expect(rerolled).toMatchObject({ id: 'c', type: 'd100', value: 7, d100: { tens: 0, ones: 7 } })
    expect(rerollResults[2]?.value).toBe(47)
  })

  it('pins the other dice to their resting pose and keeps the rerolled die active', () => {
    const nextResults = rerollResults.map((result) => result.id === 'b' ? rerollLogicalResult(result, () => 6) : result)
    const request = buildRerollRequest(nextResults, 'b', 'reroll-1', 999, createSnapshot())

    expect(request).toMatchObject({ id: 'reroll-1', seed: 999 })
    expect(request.dice.map((die) => die.id)).toEqual(['a', 'b', 'c:tens', 'c:ones'])
    expect(request.dice[1]).toMatchObject({ targetValue: 6, type: 'd6' })
    expect(request.dice[1]?.staticPose).toBeUndefined()
    expect(request.dice[0]?.staticPose).toEqual({
      position: [0, 0.5, -0],
      quaternion: [0, 0, 0, 1],
      landingDirectionIndex: 0,
    })
    expect(request.dice[2]?.staticPose?.landingDirectionIndex).toBe(2)
    expect(request.dice[2]?.staticPose?.position).toEqual([2, 0.5, -2])
  })

  it('rerolls both percentile dice as one logical d100', () => {
    const nextResults = rerollResults.map((result) => result.id === 'c' ? rerollLogicalResult(result, () => 7) : result)
    const request = buildRerollRequest(nextResults, 'c', 'reroll-2', 7, createSnapshot())
    expect(request.dice[0]?.staticPose).toBeDefined()
    expect(request.dice[2]).toMatchObject({ resultKind: 'percentile-tens', targetValue: 0 })
    expect(request.dice[3]).toMatchObject({ resultKind: 'percentile-ones', targetValue: 7 })
    expect(request.dice[2]?.staticPose).toBeUndefined()
    expect(request.dice[3]?.staticPose).toBeUndefined()
  })

  it('rejects an unknown target or a stale tray snapshot', () => {
    expect(() => buildRerollRequest(rerollResults, 'missing', 'reroll-3', 1, createSnapshot())).toThrow('找不到要重掷的骰子')
    const stale = createSnapshot()
    stale.request.dice = stale.request.dice.filter((die) => die.id !== 'c:ones')
    expect(() => buildRerollRequest(rerollResults, 'a', 'reroll-4', 1, stale)).toThrow('骰盘状态与本次结果不一致')
  })
})
