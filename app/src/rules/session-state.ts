import { EXHAUSTION_MAX_LEVEL } from '@/types/session-state'
import type { SessionState } from '@/types/session-state'

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

/** 首次进入：HP = 最大 HP，法术位全 0，力竭 0，无 debuff，无快照。 */
export function createInitialSessionState(draftId: string, maxHp: number): SessionState {
  return {
    draftId,
    currentHp: maxHp,
    usedSpellSlots: {},
    exhaustionLevel: 0,
    debuffs: [],
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

function snapshot(state: SessionState): NonNullable<SessionState['lastRestSnapshot']> {
  return {
    currentHp: state.currentHp,
    usedSpellSlots: state.usedSpellSlots,
    exhaustionLevel: state.exhaustionLevel,
    debuffs: state.debuffs,
    at: new Date().toISOString(),
  }
}

/**
 * 短休息：先保存快照，再结算——回一半损失血量（向上取整）、
 * 契约法术位（pactSlotLevels 中的环级）已用归零；普通环、debuff、力竭不动。
 */
export function applyShortRest(state: SessionState, pactSlotLevels: readonly number[], maxHp: number): SessionState {
  const lost = Math.max(0, maxHp - state.currentHp)
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
export function applyLongRest(state: SessionState, maxHp: number): SessionState {
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
    lastRestSnapshot: undefined,
    updatedAt: new Date().toISOString(),
  }
}

/** 读取时按当前最大 HP 钳制当前 HP（升级/重新编辑后最大 HP 可能变小）。 */
export function clampCurrentHp(state: SessionState, maxHp: number): SessionState {
  const currentHp = Math.min(state.currentHp, maxHp)
  if (currentHp === state.currentHp) return state
  return { ...state, currentHp }
}
