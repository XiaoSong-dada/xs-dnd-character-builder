import { describe, expect, it } from 'vitest'

import {
  averageHitDieValue,
  createInitialSessionState,
  ensureHitDicePool,
  getHitDicePoolEntries,
  getHitDiceRemaining,
  normalizeHitDicePool,
  reconcileSessionLimits,
  restoreLastRest,
  spendHitDice,
  spendHitDiceDie,
  undoHitDiceSpend,
  applyLongRest,
} from '@/rules/session-state'
import type { SessionState } from '@/types/session-state'

function state(overrides: Partial<SessionState> = {}): SessionState {
  return {
    draftId: 'mc-session',
    currentHp: 40,
    usedSpellSlots: {},
    exhaustionLevel: 0,
    debuffs: [],
    updatedAt: '2026-10-11T00:00:00.000Z',
    ...overrides,
  }
}

describe('MC-A03 生命骰按骰面分组', () => {
  it('圣武士5/牧师5 = 5d10 + 5d8，由骰面数组建立分组', () => {
    const dice = [...Array.from({ length: 5 }, () => 10), ...Array.from({ length: 5 }, () => 8)]
    const next = ensureHitDicePool(state(), dice)
    expect(getHitDicePoolEntries(next.hitDice)).toEqual([
      { die: 8, total: 5, spent: 0 },
      { die: 10, total: 5, spent: 0 },
    ])
    expect(next.hitDice).toMatchObject({ total: 10, spent: 0 })
    expect(getHitDiceRemaining(next.hitDice)).toBe(10)
  })

  it('单职业 2024 角色（数字签名）行为不变：只有 total／spent，无分组', () => {
    const next = ensureHitDicePool(state(), 5)
    expect(next.hitDice).toEqual({ total: 5, spent: 0 })
    expect(getHitDicePoolEntries(next.hitDice)).toEqual([])
    expect(getHitDiceRemaining(next.hitDice)).toBe(5)
  })

  it('旧状态只有 total／spent 时仍可读取与消耗（兼容）', () => {
    const legacy = state({ currentHp: 20, hitDice: { total: 4, spent: 1 } })
    const spent = spendHitDice(legacy, { count: 2, outcomes: [6, 3], conModifier: 2, maxHp: 40 })
    expect(spent.hitDice).toEqual({ total: 4, spent: 3 })
    expect(spent.currentHp).toBe(20 + 6 + 3 + 4)
    // 旧池没有骰面信息，指定骰面时回退到总量扣减（不报错、不丢消耗）
    const withDie = spendHitDice(legacy, { count: 1, outcomes: [6], conModifier: 2, maxHp: 40, die: 10 })
    expect(withDie.hitDice).toEqual({ total: 4, spent: 2 })
    expect(withDie.currentHp).toBe(20 + 6 + 2)
  })

  it('重复调用 ensureHitDicePool 不改变已花数量，也不产生新对象', () => {
    const dice = [10, 10, 8]
    const first = ensureHitDicePool(state(), dice)
    const spent = { ...first, hitDice: spendHitDiceDie(first.hitDice, 10, 1) }
    const again = ensureHitDicePool(spent, dice)
    expect(getHitDicePoolEntries(again.hitDice)).toEqual([
      { die: 8, total: 1, spent: 0 },
      { die: 10, total: 2, spent: 1 },
    ])
    // 无变化时返回同一引用
    expect(ensureHitDicePool(again, dice)).toBe(again)
  })

  it('混入非法骰面时被忽略', () => {
    const next = ensureHitDicePool(state(), [10, 0, -3, Number.NaN, 8])
    expect(getHitDicePoolEntries(next.hitDice)).toEqual([
      { die: 8, total: 1, spent: 0 },
      { die: 10, total: 1, spent: 0 },
    ])
  })
})

describe('MC-A03 按骰面消耗与撤回', () => {
  const grouped = () => ensureHitDicePool(state({ currentHp: 10 }), [10, 10, 10, 8, 8])

  it('spendHitDiceDie 只扣指定骰面组', () => {
    const pool = grouped().hitDice
    const next = spendHitDiceDie(pool, 8, 1)
    expect(getHitDicePoolEntries(next)).toEqual([
      { die: 8, total: 2, spent: 1 },
      { die: 10, total: 3, spent: 0 },
    ])
    expect(next).toMatchObject({ total: 5, spent: 1 })
  })

  it('无该骰面或已耗尽时原样返回同一引用', () => {
    const pool = grouped().hitDice
    expect(spendHitDiceDie(pool, 12, 1)).toBe(pool)
    const exhausted = spendHitDiceDie(spendHitDiceDie(pool, 8, 2), 8, 1)
    expect(getHitDicePoolEntries(exhausted)).toEqual([
      { die: 8, total: 2, spent: 2 },
      { die: 10, total: 3, spent: 0 },
    ])
    expect(spendHitDiceDie(exhausted, 8, 1)).toBe(exhausted)
  })

  it('短休按指定骰面消耗并恢复生命，可撤回', () => {
    const base = { ...grouped(), currentHp: 10 }
    const spent = spendHitDice(base, { count: 2, outcomes: [6, 3], conModifier: 2, maxHp: 40, die: 10 })
    expect(spent.currentHp).toBe(10 + 6 + 3 + 4)
    expect(getHitDicePoolEntries(spent.hitDice)).toEqual([
      { die: 8, total: 2, spent: 0 },
      { die: 10, total: 3, spent: 2 },
    ])
    const undone = undoHitDiceSpend(spent)
    expect(undone.currentHp).toBe(10)
    expect(getHitDicePoolEntries(undone.hitDice)).toEqual([
      { die: 8, total: 2, spent: 0 },
      { die: 10, total: 3, spent: 0 },
    ])
  })

  it('指定骰面已耗尽时短休不改动状态', () => {
    const base = { ...grouped(), hitDice: spendHitDiceDie(grouped().hitDice, 8, 2), currentHp: 10 }
    expect(spendHitDice(base, { count: 1, outcomes: [6], conModifier: 2, maxHp: 40, die: 8 })).toBe(base)
  })

  it('长休恢复全部骰面组', () => {
    const depleted = spendHitDiceDie(ensureHitDicePool(state(), [10, 10, 10, 8, 8]).hitDice, 10, 2)
    const base = state({ hitDice: depleted })
    expect(getHitDicePoolEntries(base.hitDice)).toEqual([
      { die: 8, total: 2, spent: 0 },
      { die: 10, total: 3, spent: 2 },
    ])
    const rested = applyLongRest(base, 40, { ruleset: '5e-2024' })
    expect(getHitDicePoolEntries(rested.hitDice)).toEqual([
      { die: 8, total: 2, spent: 0 },
      { die: 10, total: 3, spent: 0 },
    ])
    // 快照保留休息前分组，撤回后可还原
    expect(getHitDicePoolEntries(rested.lastRestSnapshot?.hitDice)).toEqual([
      { die: 8, total: 2, spent: 0 },
      { die: 10, total: 3, spent: 2 },
    ])
    expect(getHitDicePoolEntries(restoreLastRest(rested).hitDice)).toEqual([
      { die: 8, total: 2, spent: 0 },
      { die: 10, total: 3, spent: 2 },
    ])
  })

  it('直接恢复平均值不因分组而改变（d6→4、d8→5、d10→6、d12→7）', () => {
    expect([6, 8, 10, 12].map(averageHitDieValue)).toEqual([4, 5, 6, 7])
  })
})

describe('MC-A03 编辑协调（升级／降级／移除职业）', () => {
  it('传入新的骰面数组时按骰面重算，已花数量按同骰面保留并钳制', () => {
    const base = { ...state(), hitDice: spendHitDiceDie(ensureHitDicePool(state(), [10, 10, 8]).hitDice, 10, 2) }
    // 降级为 1d10 + 1d8：d10 已花 2 被钳制为 1
    const reconciled = reconcileSessionLimits(base, 40, 40, [], [10, 8])
    expect(getHitDicePoolEntries(reconciled.hitDice)).toEqual([
      { die: 8, total: 1, spent: 0 },
      { die: 10, total: 1, spent: 1 },
    ])
  })

  it('移除某个职业后该骰面整组消失', () => {
    const base = ensureHitDicePool(state(), [10, 10, 8])
    const reconciled = reconcileSessionLimits(base, 40, 40, [], [10, 10])
    expect(getHitDicePoolEntries(reconciled.hitDice)).toEqual([{ die: 10, total: 2, spent: 0 }])
  })

  it('数字签名下按比例分配并保持已花数量可用（兼容旧调用）', () => {
    const base = ensureHitDicePool(state(), [8, 8, 10, 10])
    const reconciled = reconcileSessionLimits(base, 40, 40, [], 2)
    expect(reconciled.hitDice).toMatchObject({ total: 2 })
    expect(getHitDiceRemaining(reconciled.hitDice)).toBe(2)
  })

  it('未提供骰池时协调不产生骰池', () => {
    expect(reconcileSessionLimits(state(), 40, 40, [], [10, 8]).hitDice).toBeUndefined()
  })

  it('normalizeHitDicePool 汇总值等于各分组之和，spent 超限被钳制', () => {
    const pool = normalizeHitDicePool({ 10: { total: 3, spent: 9 }, 8: { total: 2, spent: 1 } })
    expect(pool).toMatchObject({ total: 5, spent: 4 })
    expect(pool?.byDie?.[10]).toEqual({ total: 3, spent: 3 })
    expect(normalizeHitDicePool({})).toBeUndefined()
    expect(normalizeHitDicePool({}, { total: 4, spent: 2 })).toEqual({ total: 4, spent: 2 })
  })
})

describe('MC-A03 首次初始化', () => {
  it('提供骰面数组时初始化分组骰池', () => {
    const initial = createInitialSessionState('mc-init', 30, undefined)
    expect(initial.hitDice).toBeUndefined()
    const withDice = ensureHitDicePool(initial, [10, 8])
    expect(getHitDicePoolEntries(withDice.hitDice)).toHaveLength(2)
  })

  it('提供总数时初始化单组骰池（既有签名不变）', () => {
    const initial = createInitialSessionState('mc-init', 30, 4)
    expect(initial.hitDice).toEqual({ total: 4, spent: 0 })
  })
})
