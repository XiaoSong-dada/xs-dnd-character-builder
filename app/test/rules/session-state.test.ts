import { describe, expect, it } from 'vitest'

import {
  applyExhaustionChange,
  applyHpChange,
  applyLongRest,
  applyShortRest,
  applySpellSlotChange,
  clampCurrentHp,
  averageHitDieValue,
  createInitialSessionState,
  ensureHitDicePool,
  spendHitDice,
  undoHitDiceSpend,
  getAvailableSlotLevels,
  restoreLastRest,
  reconcileSessionLimits,
  toggleDebuff,
} from '@/rules/session-state'
import type { SessionState } from '@/types/session-state'

const baseState: SessionState = {
  draftId: 'draft-1',
  currentHp: 20,
  usedSpellSlots: { 3: 1 },
  exhaustionLevel: 0,
  debuffs: [],
  updatedAt: '2026-08-01T00:00:00.000Z',
}

describe('session-state 初始状态', () => {
  it('首次进入：HP = 最大 HP，法术位全 0，力竭 0，无 debuff，无快照', () => {
    const state = createInitialSessionState('draft-1', 40)
    expect(state).toMatchObject({
      draftId: 'draft-1',
      currentHp: 40,
      usedSpellSlots: {},
      exhaustionLevel: 0,
      debuffs: [],
    })
    expect(state.lastRestSnapshot).toBeUndefined()
  })
})

describe('session-state HP 增减', () => {
  it('按增量加减并钳制在 [0, 最大HP]', () => {
    expect(applyHpChange(baseState, 5, 40).currentHp).toBe(25)
    expect(applyHpChange(baseState, -5, 40).currentHp).toBe(15)
    expect(applyHpChange(baseState, 0, 40).currentHp).toBe(20)
    expect(applyHpChange(baseState, -100, 40).currentHp).toBe(0)
    expect(applyHpChange(baseState, 100, 40).currentHp).toBe(40)
  })
})

describe('session-state 法术位增减', () => {
  it('按环增减并钳制在 [0, 总量]', () => {
    expect(applySpellSlotChange(baseState, 3, 2, 3).usedSpellSlots[3]).toBe(3)
    expect(applySpellSlotChange(baseState, 3, -1, 3).usedSpellSlots[3]).toBe(0)
    expect(applySpellSlotChange(baseState, 3, -10, 3).usedSpellSlots[3]).toBe(0)
    expect(applySpellSlotChange(baseState, 3, 10, 3).usedSpellSlots[3]).toBe(3)
    // 其他环不受影响
    expect(applySpellSlotChange(baseState, 5, 1, 2).usedSpellSlots[3]).toBe(1)
  })

  it('非法环级（非 1—9）原样返回', () => {
    expect(applySpellSlotChange(baseState, 0, 1, 3)).toBe(baseState)
    expect(applySpellSlotChange(baseState, 10, 1, 3)).toBe(baseState)
  })
})

describe('session-state 力竭层数增减', () => {
  it('层数增减并钳制在 [0, 6]', () => {
    expect(applyExhaustionChange(baseState, 1).exhaustionLevel).toBe(1)
    expect(applyExhaustionChange(baseState, 10).exhaustionLevel).toBe(6)
    const level3: SessionState = { ...baseState, exhaustionLevel: 3 }
    expect(applyExhaustionChange(level3, -1).exhaustionLevel).toBe(2)
    expect(applyExhaustionChange(level3, -10).exhaustionLevel).toBe(0)
  })
})

describe('session-state debuff 挂摘', () => {
  it('未挂则挂、已挂则摘（幂等）', () => {
    const added = toggleDebuff(baseState, 'poisoned')
    expect(added.debuffs).toEqual(['poisoned'])
    expect(toggleDebuff(added, 'poisoned').debuffs).toEqual([])
    // 重复挂同一状态 = 只挂一次
    expect(toggleDebuff(added, 'poisoned').debuffs).toEqual([])
  })
})

describe('session-state 短休息', () => {
  const maxHp = 40

  it('回一半损失血量（向上取整），契约位归零、普通环不动', () => {
    const state: SessionState = {
      ...baseState,
      currentHp: 20,
      usedSpellSlots: { 3: 1, 5: 2 },
      exhaustionLevel: 2,
      debuffs: ['poisoned'],
    }
    const rested = applyShortRest(state, [5], maxHp)
    // 损失 20 → 回 10
    expect(rested.currentHp).toBe(30)
    // 契约位（5 环）归零，普通环（3 环）不动
    expect(rested.usedSpellSlots[5]).toBe(0)
    expect(rested.usedSpellSlots[3]).toBe(1)
    // 短休不清 debuff、不清力竭
    expect(rested.debuffs).toEqual(['poisoned'])
    expect(rested.exhaustionLevel).toBe(2)
  })

  it('奇数损失向上取整', () => {
    const rested = applyShortRest({ ...baseState, currentHp: 21 }, [5], maxHp)
    // 损失 19 → 回 ceil(19/2) = 10 → 31
    expect(rested.currentHp).toBe(31)
  })

  it('满血时结果不变', () => {
    const rested = applyShortRest({ ...baseState, currentHp: 40 }, [5], maxHp)
    expect(rested.currentHp).toBe(40)
  })

  it('结算前保存休息快照', () => {
    const rested = applyShortRest({ ...baseState, currentHp: 20 }, [5], maxHp)
    expect(rested.lastRestSnapshot).toMatchObject({
      currentHp: 20,
      usedSpellSlots: { 3: 1 },
      exhaustionLevel: 0,
      debuffs: [],
    })
    expect(typeof rested.lastRestSnapshot?.at).toBe('string')
  })
})

describe('session-state 长休息', () => {
  it('回满血、全部法术位归零、debuff 清空、力竭归零，并保存快照', () => {
    const state: SessionState = {
      ...baseState,
      currentHp: 10,
      usedSpellSlots: { 1: 1, 3: 2, 5: 1 },
      exhaustionLevel: 4,
      debuffs: ['poisoned', 'prone'],
    }
    const rested = applyLongRest(state, 40)
    expect(rested.currentHp).toBe(40)
    expect(rested.usedSpellSlots).toEqual({})
    expect(rested.debuffs).toEqual([])
    expect(rested.exhaustionLevel).toBe(0)
    expect(rested.lastRestSnapshot).toMatchObject({ currentHp: 10 })
  })
})

describe('session-state 撤回上次休息', () => {
  it('无快照时原样返回', () => {
    expect(restoreLastRest(baseState)).toBe(baseState)
  })

  it('恢复快照中的 HP/法术位/力竭/debuff 并清除快照', () => {
    const state: SessionState = {
      ...baseState,
      currentHp: 30,
      usedSpellSlots: { 3: 1, 5: 0 },
      exhaustionLevel: 1,
      debuffs: [],
      lastRestSnapshot: {
        currentHp: 20,
        usedSpellSlots: { 3: 1, 5: 2 },
        exhaustionLevel: 2,
        debuffs: ['poisoned'],
        at: '2026-08-01T01:00:00.000Z',
      },
    }
    const restored = restoreLastRest(state)
    expect(restored.currentHp).toBe(20)
    expect(restored.usedSpellSlots[5]).toBe(2)
    expect(restored.exhaustionLevel).toBe(2)
    expect(restored.debuffs).toEqual(['poisoned'])
    expect(restored.lastRestSnapshot).toBeUndefined()
  })

  it('再次休息覆盖旧快照', () => {
    const shortRested = applyShortRest({ ...baseState, currentHp: 20 }, [5], 40)
    const longRested = applyLongRest(shortRested, 40)
    // 快照应为短休后的状态（长休前）
    expect(longRested.lastRestSnapshot?.currentHp).toBe(30)
    // 撤回恢复到长休前
    const restored = restoreLastRest(longRested)
    expect(restored.currentHp).toBe(30)
  })
})

describe('session-state 升级钳制', () => {
  it('最大 HP 变小时读取钳制', () => {
    const state: SessionState = { ...baseState, currentHp: 50 }
    expect(clampCurrentHp(state, 40).currentHp).toBe(40)
    expect(clampCurrentHp(state, 60).currentHp).toBe(50)
  })
})

describe('session-state 人工编辑协调', () => {
  it('最大生命提高时保持已损失生命，并同步休息快照', () => {
    const state: SessionState = {
      ...baseState,
      currentHp: 20,
      usedSpellSlots: { 1: 2, 3: 3 },
      lastRestSnapshot: {
        currentHp: 15,
        usedSpellSlots: { 1: 4, 3: 1 },
        exhaustionLevel: 0,
        debuffs: [],
        at: '2026-08-01T00:30:00.000Z',
      },
    }
    const reconciled = reconcileSessionLimits(state, 30, 40, [
      { level: 1, count: 3 },
      { level: 3, count: 2 },
    ])

    expect(reconciled.currentHp).toBe(30)
    expect(reconciled.lastRestSnapshot?.currentHp).toBe(25)
    expect(reconciled.usedSpellSlots).toEqual({ 1: 2, 3: 2 })
    expect(reconciled.lastRestSnapshot?.usedSpellSlots).toEqual({ 1: 3, 3: 1 })
  })

  it('恢复较低最大生命时仍保持伤害，并在必要时钳制到零', () => {
    expect(reconcileSessionLimits({ ...baseState, currentHp: 30 }, 40, 30, []).currentHp).toBe(20)
    expect(reconcileSessionLimits({ ...baseState, currentHp: 5 }, 40, 30, []).currentHp).toBe(0)
  })

  it('编辑协调：资源已用量按新上限钳制、失效条目移除并同步休息快照（B10-04）', () => {
    const state: SessionState = {
      ...baseState,
      resourceUsage: { keep: 5, trim: 3, gone: 2 },
      lastRestSnapshot: {
        currentHp: 20,
        usedSpellSlots: {},
        exhaustionLevel: 0,
        debuffs: [],
        resourceUsage: { keep: 4, gone: 1 },
        at: '2026-08-01T00:30:00.000Z',
      },
    }
    const reconciled = reconcileSessionLimits(state, 30, 30, [], undefined, [
      { id: 'keep', max: 4 },
      { id: 'trim', max: 1 },
    ])
    expect(reconciled.resourceUsage).toEqual({ keep: 4, trim: 1 })
    expect(reconciled.lastRestSnapshot?.resourceUsage).toEqual({ keep: 4 })
  })

  it('未提供资源上限时保持既有 resourceUsage（兼容旧调用）', () => {
    const reconciled = reconcileSessionLimits({ ...baseState, resourceUsage: { keep: 2 } }, 30, 30, [])
    expect(reconciled.resourceUsage).toEqual({ keep: 2 })
  })
})

describe('session-state 可施法环位（升环）', () => {
  const slots = [
    { level: 1, count: 4 },
    { level: 2, count: 3 },
    { level: 3, count: 3 },
    { level: 4, count: 3 },
  ]

  it('返回 ≥ 法术原始环级且可用 > 0 的环位', () => {
    const state: SessionState = { ...baseState, usedSpellSlots: { 2: 3, 4: 1 } }
    // 3 环法术：可用 3 环 3 个、4 环 2 个（升环）
    expect(getAvailableSlotLevels(state, 3, slots)).toEqual([3, 4])
  })

  it('原始环位用尽时仍可升环施放', () => {
    const state: SessionState = { ...baseState, usedSpellSlots: { 3: 3 } }
    expect(getAvailableSlotLevels(state, 3, slots)).toEqual([4])
  })

  it('无可用环位时返回空数组', () => {
    const state: SessionState = { ...baseState, usedSpellSlots: { 3: 3, 4: 3 } }
    expect(getAvailableSlotLevels(state, 3, slots)).toEqual([])
  })

  it('戏法（0 环）不消耗环位，返回空数组', () => {
    expect(getAvailableSlotLevels(baseState, 0, slots)).toEqual([])
  })

  it('契约法术位并入对应环级参与施法', () => {
    const pactSlots = [{ level: 5, count: 2 }]
    const state: SessionState = { ...baseState, usedSpellSlots: { 5: 1 } }
    expect(getAvailableSlotLevels(state, 3, pactSlots)).toEqual([5])
    const exhausted: SessionState = { ...baseState, usedSpellSlots: { 5: 2 } }
    expect(getAvailableSlotLevels(exhausted, 5, pactSlots)).toEqual([])
  })

})

describe('B10-01 两版休息与生命骰', () => {
  const modern = () => createInitialSessionState('draft-2024', 30, 5)

  it('2024 短休不自动治疗，仅恢复契约法术位并保留快照', () => {
    const state = { ...modern(), currentHp: 10, usedSpellSlots: { 1: 2, 3: 1 }, exhaustionLevel: 2, debuffs: ['poisoned'] }
    const rested = applyShortRest(state, [3], 30, { ruleset: '5e-2024' })

    expect(rested.currentHp).toBe(10)
    expect(rested.usedSpellSlots).toEqual({ 1: 2, 3: 0 })
    expect(rested.exhaustionLevel).toBe(2)
    expect(rested.lastRestSnapshot?.currentHp).toBe(10)
  })

  it('2024 短休按特性差额降低力竭并可撤回；2014 忽略该差额、最低为 0', () => {
    const state = { ...modern(), exhaustionLevel: 2 }
    const rested = applyShortRest(state, [], 30, { ruleset: '5e-2024', exhaustionReduction: 1 })
    expect(rested.exhaustionLevel).toBe(1)
    expect(restoreLastRest(rested).exhaustionLevel).toBe(2)

    const floor = applyShortRest({ ...state, exhaustionLevel: 0 }, [], 30, { ruleset: '5e-2024', exhaustionReduction: 2 })
    expect(floor.exhaustionLevel).toBe(0)

    const legacy = applyShortRest(state, [], 30, { ruleset: '5e-2014', exhaustionReduction: 1 })
    expect(legacy.exhaustionLevel).toBe(2)
  })

  it('2024 长休：回满血、法术位与生命骰恢复、力竭 −1、debuff 保持', () => {
    const state = { ...modern(), currentHp: 8, usedSpellSlots: { 2: 3 }, exhaustionLevel: 2, debuffs: ['prone'], hitDice: { total: 5, spent: 4 } }
    const rested = applyLongRest(state, 30, { ruleset: '5e-2024' })

    expect(rested.currentHp).toBe(30)
    expect(rested.usedSpellSlots).toEqual({})
    expect(rested.hitDice).toEqual({ total: 5, spent: 0 })
    expect(rested.exhaustionLevel).toBe(1)
    expect(rested.debuffs).toEqual(['prone'])
    expect(rested.lastRestSnapshot?.hitDice).toEqual({ total: 5, spent: 4 })
  })

  it('2014 行为不变：长休清零力竭与 debuff，短休回一半损失', () => {
    const state = { ...createInitialSessionState('draft-2014', 30), currentHp: 10, exhaustionLevel: 2, debuffs: ['prone'] }
    const short = applyShortRest(state, [], 30)
    expect(short.currentHp).toBe(20)
    const long = applyLongRest(state, 30)
    expect(long.exhaustionLevel).toBe(0)
    expect(long.debuffs).toEqual([])
  })

  it('花费生命骰：按骰点＋消耗数×体质恢复并可撤回', () => {
    const state = { ...modern(), currentHp: 10, hitDice: { total: 5, spent: 1 } }
    const spent = spendHitDice(state, { count: 2, outcomes: [6, 3], conModifier: 2, maxHp: 30 })

    expect(spent.hitDice).toEqual({ total: 5, spent: 3 })
    expect(spent.currentHp).toBe(10 + 6 + 3 + 2 * 2)

    const undone = undoHitDiceSpend(spent)
    expect(undone.currentHp).toBe(10)
    expect(undone.hitDice).toEqual({ total: 5, spent: 1 })
    expect(undone.lastHitDiceSnapshot).toBeUndefined()
  })

  it('生命骰边界：无池/耗尽不改动，恢复量至少 1 且不超过最大 HP', () => {
    expect(spendHitDice(createInitialSessionState('draft-2014', 20), { count: 1, outcomes: [4], conModifier: 0, maxHp: 20 })).toEqual(createInitialSessionState('draft-2014', 20))
    const exhausted = { ...modern(), hitDice: { total: 5, spent: 5 }, currentHp: 5 }
    expect(spendHitDice(exhausted, { count: 1, outcomes: [6], conModifier: 3, maxHp: 30 })).toBe(exhausted)
    const negative = { ...modern(), currentHp: 10, hitDice: { total: 5, spent: 0 } }
    const healed = spendHitDice(negative, { count: 1, outcomes: [1], conModifier: -3, maxHp: 30 })
    expect(healed.currentHp).toBe(11)
    const capped = spendHitDice({ ...negative, currentHp: 29 }, { count: 1, outcomes: [12], conModifier: 0, maxHp: 30 })
    expect(capped.currentHp).toBe(30)
  })

  it('旧状态迁移补全骰池并把花费数钳制到总数内', () => {
    const legacy = createInitialSessionState('draft-legacy', 20)
    expect(legacy.hitDice).toBeUndefined()
    const migrated = ensureHitDicePool({ ...legacy, hitDice: { total: 3, spent: 7 } }, 4)
    expect(migrated.hitDice).toEqual({ total: 4, spent: 3 })
  })

  it('“直接回”平均值：d6→4、d8→5、d10→6、d12→7', () => {
    expect([6, 8, 10, 12].map(averageHitDieValue)).toEqual([4, 5, 6, 7])
  })
})
