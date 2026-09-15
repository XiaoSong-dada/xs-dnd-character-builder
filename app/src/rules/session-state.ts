import { EXHAUSTION_MAX_LEVEL } from '@/types/session-state'
import type { HitDicePool, SessionRestSnapshot, SessionState } from '@/types/session-state'
import type { RulesetId } from '@/types/character'

/**
 * 跑团助手局内状态纯函数（规则层，框架无关）。
 *
 * 所有函数保持不可变：返回新状态对象；无变化的边界情况返回原引用。
 * 局内状态不写入车卡草稿、不参与车卡校验。
 */

const MAX_SPELL_LEVEL = 9

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** 首次进入：HP = 最大 HP，法术位全 0，力竭 0，无 debuff，无快照；提供生命骰总数时初始化骰池。 */
export function createInitialSessionState(draftId: string, maxHp: number, hitDiceTotal?: number): SessionState {
  return {
    draftId,
    currentHp: maxHp,
    usedSpellSlots: {},
    exhaustionLevel: 0,
    debuffs: [],
    ...(hitDiceTotal !== undefined ? { hitDice: { total: Math.max(0, hitDiceTotal), spent: 0 } } : {}),
    updatedAt: new Date().toISOString(),
  }
}

/** 补全/同步生命骰总数（旧状态迁移与升级后调用）；花费数按新总数钳制。 */
export function ensureHitDicePool(state: SessionState, total: number): SessionState {
  const safeTotal = Math.max(0, total)
  const priorTotal = state.hitDice?.total ?? safeTotal
  const spent = clamp(state.hitDice?.spent ?? 0, 0, Math.min(priorTotal, safeTotal))
  if (state.hitDice && state.hitDice.total === safeTotal && state.hitDice.spent === spent) return state
  return { ...state, hitDice: { total: safeTotal, spent } }
}

/** 直接恢复口径的骰面平均值（d6→4、d8→5、d10→6、d12→7）。 */
export function averageHitDieValue(die: number): number {
  return Math.ceil((die + 1) / 2)
}

/**
 * 短休花费生命骰：消耗 count 颗（不得超过剩余），按 outcomes 骰点合计 + 消耗数×体质调整值恢复生命（至少 1）。
 * 记录 lastHitDiceSnapshot 以支持撤回。
 */
export function spendHitDice(
  state: SessionState,
  options: { readonly count: number; readonly outcomes: readonly number[]; readonly conModifier: number; readonly maxHp: number },
): SessionState {
  const pool = state.hitDice
  const count = Math.max(0, Math.floor(options.count))
  if (!pool || count === 0) return state
  const remaining = Math.max(0, pool.total - pool.spent)
  const spentCount = Math.min(count, remaining, options.outcomes.length || count)
  if (spentCount === 0) return state
  const total = options.outcomes.slice(0, spentCount).reduce((sum, value) => sum + value, 0) + spentCount * options.conModifier
  const currentHp = clamp(state.currentHp + Math.max(1, total), 0, options.maxHp)
  return {
    ...state,
    currentHp,
    hitDice: { ...pool, spent: pool.spent + spentCount },
    lastHitDiceSnapshot: snapshot(state),
    updatedAt: new Date().toISOString(),
  }
}

/** 撤回生命骰消耗：恢复 HP 与骰池；无快照原样返回。 */
export function undoHitDiceSpend(state: SessionState): SessionState {
  const last = state.lastHitDiceSnapshot
  if (!last) return state
  return {
    ...state,
    currentHp: last.currentHp,
    hitDice: last.hitDice ?? state.hitDice,
    lastHitDiceSnapshot: undefined,
    updatedAt: new Date().toISOString(),
  }
}

/** 当前 HP 增减，钳制在 [0, maxHp]。 */
export function applyHpChange(state: SessionState, delta: number, maxHp: number): SessionState {
  const currentHp = clamp(state.currentHp + delta, 0, maxHp)
  if (currentHp === state.currentHp) return state
  return { ...state, currentHp, updatedAt: new Date().toISOString() }
}

/** 某环已用法术位增减，钳制在 [0, maxForLevel]；非法环级（非 1—9）原样返回。 */
export function applySpellSlotChange(
  state: SessionState,
  level: number,
  delta: number,
  maxForLevel: number,
): SessionState {
  if (level < 1 || level > MAX_SPELL_LEVEL) return state
  const current = state.usedSpellSlots[level] ?? 0
  const next = clamp(current + delta, 0, Math.max(0, maxForLevel))
  if (next === current) return state
  return {
    ...state,
    usedSpellSlots: { ...state.usedSpellSlots, [level]: next },
    updatedAt: new Date().toISOString(),
  }
}

/** 力竭层数增减，钳制在 [0, EXHAUSTION_MAX_LEVEL]。 */
export function applyExhaustionChange(state: SessionState, delta: number): SessionState {
  const exhaustionLevel = clamp(state.exhaustionLevel + delta, 0, EXHAUSTION_MAX_LEVEL)
  if (exhaustionLevel === state.exhaustionLevel) return state
  return { ...state, exhaustionLevel, updatedAt: new Date().toISOString() }
}

/** 挂载/摘除普通 debuff（幂等：已挂则摘、未挂则挂）。 */
export function toggleDebuff(state: SessionState, debuffId: string): SessionState {
  const exists = state.debuffs.includes(debuffId)
  const debuffs = exists
    ? state.debuffs.filter((id) => id !== debuffId)
    : [...state.debuffs, debuffId]
  return { ...state, debuffs, updatedAt: new Date().toISOString() }
}

function snapshot(state: SessionState): SessionRestSnapshot {
  return {
    currentHp: state.currentHp,
    usedSpellSlots: state.usedSpellSlots,
    exhaustionLevel: state.exhaustionLevel,
    debuffs: state.debuffs,
    ...(state.hitDice ? { hitDice: state.hitDice } : {}),
    ...(state.resourceUsage ? { resourceUsage: state.resourceUsage } : {}),
    at: new Date().toISOString(),
  }
}

/**
 * 短休息：先保存快照，再结算——回一半损失血量（向上取整）、
 * 契约法术位（pactSlotLevels 中的环级）已用归零；普通环、debuff、力竭不动。
 */
export function applyShortRest(
  state: SessionState,
  pactSlotLevels: readonly number[],
  maxHp: number,
  options: { readonly ruleset?: RulesetId } = {},
): SessionState {
  // 2024：短休不自动治疗，生命值由玩家自行花费生命骰恢复（B10-01）；2014 保持既有“回一半损失”行为。
  const lost = options.ruleset === '5e-2024' ? 0 : Math.max(0, maxHp - state.currentHp)
  const currentHp = state.currentHp + Math.ceil(lost / 2)
  const pactSet = new Set(pactSlotLevels)
  const usedSpellSlots = Object.fromEntries(
    Object.entries(state.usedSpellSlots).map(([level, used]) => [
      level,
      pactSet.has(Number(level)) ? 0 : used,
    ]),
  )
  return {
    ...state,
    currentHp: Math.min(maxHp, currentHp),
    usedSpellSlots,
    lastRestSnapshot: snapshot(state),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * 长休息：先保存快照，再结算——回满血、全部法术位已用归零、
 * 普通 debuff 清空、力竭层数归零。
 */
export function applyLongRest(
  state: SessionState,
  maxHp: number,
  options: { readonly ruleset?: RulesetId } = {},
): SessionState {
  // 2024：回满血、法术位与生命骰全部恢复、力竭 −1、debuff 保持；2014 保持既有行为（力竭清零、清空 debuff）。
  if (options.ruleset === '5e-2024') {
    return {
      ...state,
      currentHp: maxHp,
      usedSpellSlots: {},
      exhaustionLevel: Math.max(0, state.exhaustionLevel - 1),
      hitDice: state.hitDice ? { ...state.hitDice, spent: 0 } : undefined,
      lastRestSnapshot: snapshot(state),
      updatedAt: new Date().toISOString(),
    }
  }
  return {
    ...state,
    currentHp: maxHp,
    usedSpellSlots: {},
    exhaustionLevel: 0,
    debuffs: [],
    lastRestSnapshot: snapshot(state),
    updatedAt: new Date().toISOString(),
  }
}

/** 撤回上次休息：无快照原样返回；有快照恢复 HP/法术位/力竭/debuff 并清除快照。 */
export function restoreLastRest(state: SessionState): SessionState {
  const last = state.lastRestSnapshot
  if (!last) return state
  return {
    ...state,
    currentHp: last.currentHp,
    usedSpellSlots: last.usedSpellSlots,
    exhaustionLevel: last.exhaustionLevel,
    debuffs: last.debuffs,
    ...(last.hitDice ? { hitDice: last.hitDice } : {}),
    ...(last.resourceUsage ? { resourceUsage: last.resourceUsage } : {}),
    lastRestSnapshot: undefined,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * 可施法环位列表：≥ 法术原始环级且可用 > 0 的环级（升环施法）。
 * 戏法（spellLevel = 0）不消耗环位，返回空数组。
 */
export function getAvailableSlotLevels(
  state: SessionState,
  spellLevel: number,
  slotLevels: readonly { level: number; count: number }[],
): readonly number[] {
  if (spellLevel < 1) return []
  return slotLevels
    .filter((slot) => slot.level >= spellLevel)
    .filter((slot) => slot.count - (state.usedSpellSlots[slot.level] ?? 0) > 0)
    .map((slot) => slot.level)
}

/** 读取时按当前最大 HP 钳制当前 HP（升级/重新编辑后最大 HP 可能变小）。 */
export function clampCurrentHp(state: SessionState, maxHp: number): SessionState {
  const currentHp = Math.min(state.currentHp, maxHp)
  if (currentHp === state.currentHp) return state
  return { ...state, currentHp }
}

/**
 * 角色最大 HP / 环位上限变化时协调局内状态：保持已损失 HP，已用环位按新上限钳制。
 * 休息快照同步换算，保证撤回休息后仍落在新的角色上限内。
 */
export function reconcileSessionLimits(
  state: SessionState,
  oldMaxHp: number,
  newMaxHp: number,
  newSlots: readonly { level: number; count: number }[],
  hitDiceTotal?: number,
): SessionState {
  const preserveDamage = (currentHp: number): number => clamp(newMaxHp - Math.max(0, oldMaxHp - currentHp), 0, newMaxHp)
  const slotMax = new Map(newSlots.map((slot) => [slot.level, slot.count]))
  const reconcileSlots = (used: Readonly<Record<number, number>>): Readonly<Record<number, number>> => Object.fromEntries(
    Object.entries(used).flatMap(([level, count]) => {
      const maximum = slotMax.get(Number(level)) ?? 0
      const next = clamp(count, 0, maximum)
      return next > 0 ? [[level, next]] : []
    }),
  )
  const reconcileHitDice = (pool: HitDicePool | undefined): HitDicePool | undefined => {
    if (!pool) return undefined
    const total = Math.max(0, hitDiceTotal ?? pool.total)
    return { total, spent: clamp(pool.spent, 0, total) }
  }
  return {
    ...state,
    currentHp: preserveDamage(state.currentHp),
    usedSpellSlots: reconcileSlots(state.usedSpellSlots),
    ...(state.hitDice ? { hitDice: reconcileHitDice(state.hitDice) } : {}),
    ...(state.resourceUsage ? { resourceUsage: state.resourceUsage } : {}),
    ...(state.lastRestSnapshot ? {
      lastRestSnapshot: {
        ...state.lastRestSnapshot,
        currentHp: preserveDamage(state.lastRestSnapshot.currentHp),
        usedSpellSlots: reconcileSlots(state.lastRestSnapshot.usedSpellSlots),
        ...(state.lastRestSnapshot.hitDice ? { hitDice: reconcileHitDice(state.lastRestSnapshot.hitDice) } : {}),
        ...(state.lastRestSnapshot.resourceUsage ? { resourceUsage: state.lastRestSnapshot.resourceUsage } : {}),
      },
    } : {}),
    updatedAt: new Date().toISOString(),
  }
}
