import { describe, expect, it } from 'vitest'

import {
  areBaseAbilitiesValid,
  areOriginAbilitiesWithinCap,
  clampDestinyCount,
  DESTINY_MAX_COUNT,
  DESTINY_MIN_COUNT,
  isAbilityDestinySet,
  normalizeAbilityDestiny,
  pointBuyCost,
  rollAbilityScoreSet,
  rollAbilityScoreSets,
} from '@/rules/abilities'

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

/** 用固定骰值序列驱动一次掷骰；`values` 按顺序作为每个 d6 的点数。 */
function sequenceRandom(values: readonly number[]) {
  let index = 0
  return (minimum: number, maximum: number): number => {
    expect(minimum, '骰面下界').toBe(1)
    expect(maximum, '骰面上界').toBe(6)
    const value = values[index % values.length] ?? 1
    index += 1
    return value
  }
}

describe('第 5 步自定义属性的天命掷骰', () => {
  it('每项取 4d6 中最高的三颗之和，六项一次生成', () => {
    // 第一组 1/2/3/4 → 保留 4+3+2=9；第二组 6/6/1/1 → 保留 6+6+1=13；其余按 1/1/1/1 → 3
    const values = [1, 2, 3, 4, 6, 6, 1, 1, ...Array.from({ length: 16 }, () => 1)]
    expect(rollAbilityScoreSet(sequenceRandom(values))).toEqual([9, 13, 3, 3, 3, 3])
  })

  it('单项范围恒为 3—18，且不会低于三颗骰子的最小值', () => {
    for (const all of [1, 6]) {
      const set = rollAbilityScoreSet(() => all)
      expect(set).toHaveLength(6)
      expect(set.every((score) => score >= 3 && score <= 18)).toBe(true)
      expect(set[0]).toBe(all === 1 ? 3 : 18)
    }
  })

  it('天命次数决定组数，并且每次都会重新掷骰', () => {
    // 确定性伪随机（线性同余），不带短周期，避免三组恰好被"证明"成相同
    let seed = 20261010
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return (seed % 6) + 1
    }
    const sets = rollAbilityScoreSets(3, random)
    expect(sets).toHaveLength(3)
    expect(sets.every((set) => set.length === 6)).toBe(true)
    // 每组都重新掷骰，不是同一组复制三遍
    expect(new Set(sets.map((set) => set.join(','))).size).toBe(3)
    expect(sets[0]).not.toEqual(sets[1])
    // 同样的种子必须复现同样的结果（随机源由调用方注入）
    let replaySeed = 20261010
    const replay = rollAbilityScoreSets(3, () => {
      replaySeed = (replaySeed * 1103515245 + 12345) % 2147483648
      return (replaySeed % 6) + 1
    })
    expect(replay).toEqual(sets)
  })

  it('次数夹到 1—10，非法输入回落到 1', () => {
    expect(DESTINY_MIN_COUNT).toBe(1)
    expect(DESTINY_MAX_COUNT).toBe(10)
    expect(clampDestinyCount(0)).toBe(1)
    expect(clampDestinyCount(-5)).toBe(1)
    expect(clampDestinyCount(3)).toBe(3)
    expect(clampDestinyCount(10)).toBe(10)
    expect(clampDestinyCount(999)).toBe(10)
    expect(clampDestinyCount(4.7)).toBe(4)
    expect(clampDestinyCount(Number.NaN)).toBe(1)
    expect(clampDestinyCount(Number.POSITIVE_INFINITY)).toBe(1)
    expect(rollAbilityScoreSets(99, () => 6)).toHaveLength(10)
  })

  it('归一化天命记录：丢非法组、截断到最后 count 组、无效输入返回 undefined', () => {
    const legal = [15, 14, 13, 10, 18, 9]
    const older = [4, 10, 18, 3, 18, 18]
    const newest = [10, 10, 10, 10, 10, 10]
    expect(normalizeAbilityDestiny({ count: 2, rolls: [legal, older, newest] })).toEqual({ count: 2, rolls: [older, newest] })
    // 非六项、越界、非整数一律丢弃
    expect(normalizeAbilityDestiny({ count: 3, rolls: [legal, [1, 2, 3], [1, 2, 3, 4, 5, 21], [1, 2, 3, 4, 5, 6.5]] })).toEqual({ count: 3, rolls: [legal] })
    // 只记录次数、还没掷骰
    expect(normalizeAbilityDestiny({ count: 5 })).toEqual({ count: 5 })
    expect(normalizeAbilityDestiny({ count: 42, rolls: [legal] })).toEqual({ count: 10, rolls: [legal] })
    expect(normalizeAbilityDestiny(undefined)).toBeUndefined()
    expect(normalizeAbilityDestiny({ rolls: [legal] })).toBeUndefined()
    expect(normalizeAbilityDestiny('天命')).toBeUndefined()
  })

  it('isAbilityDestinySet 只接受六项 3—18 整数', () => {
    expect(isAbilityDestinySet([15, 14, 13, 10, 18, 9])).toBe(true)
    expect(isAbilityDestinySet([3, 3, 3, 3, 3, 3])).toBe(true)
    expect(isAbilityDestinySet([18, 18, 18, 18, 18, 18])).toBe(true)
    expect(isAbilityDestinySet([2, 3, 3, 3, 3, 3])).toBe(false)
    expect(isAbilityDestinySet([19, 3, 3, 3, 3, 3])).toBe(false)
    expect(isAbilityDestinySet([15, 14, 13, 10, 18])).toBe(false)
    expect(isAbilityDestinySet([15, 14, 13, 10, 18, 9, 8])).toBe(false)
    expect(isAbilityDestinySet([15, 14, 13, 10, 18, '9'])).toBe(false)
    expect(isAbilityDestinySet(undefined)).toBe(false)
  })

  it('掷出的数组本身就是合法的自定义属性输入（3—20 范围内）', () => {
    const sets = rollAbilityScoreSets(10, sequenceRandom([6, 6, 6, 1, 1, 1, 2, 3]))
    for (const set of sets) {
      expect(isAbilityDestinySet(set)).toBe(true)
      for (const score of set) {
        const scores = { str: score, dex: score, con: score, int: score, wis: score, cha: score }
        expect(areBaseAbilitiesValid(scores, 'custom', '5e-2014')).toBe(true)
        expect(areBaseAbilitiesValid(scores, 'custom', '5e-2024')).toBe(true)
      }
    }
  })
})
