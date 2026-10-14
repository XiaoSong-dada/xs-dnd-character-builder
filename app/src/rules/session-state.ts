import { EXHAUSTION_MAX_LEVEL } from '@/types/session-state'
import type { HitDiceGroup, HitDicePool, SessionRestSnapshot, SessionState } from '@/types/session-state'
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

/**
 * 生命骰池的骰面分组（MC-A03）：兼职角色按骰面分别记账。
 * 旧状态只有 total／spent 时返回空数组，调用方按单组处理。
 */
export function getHitDicePoolEntries(pool: HitDicePool | undefined): readonly { readonly die: number; readonly total: number; readonly spent: number }[] {
  if (!pool?.byDie) return []
  return Object.entries(pool.byDie)
    .map(([die, group]) => ({ die: Number(die), total: Math.max(0, group.total), spent: Math.max(0, group.spent) }))
    .filter((entry) => Number.isFinite(entry.die) && entry.die > 0 && entry.total > 0)
    .sort((left, right) => left.die - right.die)
}

/**
 * 归一化骰面分组并重算汇总值；spent 钳制在 [0, total]。
 * 没有任何分组时退回 `fallback` 的单组形态（旧状态兼容）。
 */
export function normalizeHitDicePool(
  byDie: Readonly<Record<number, HitDiceGroup>> | undefined,
  fallback?: HitDicePool,
): HitDicePool | undefined {
  const groups: Record<number, HitDiceGroup> = {}
  for (const [die, group] of Object.entries(byDie ?? {})) {
    const faces = Number(die)
    if (!Number.isFinite(faces) || faces <= 0) continue
    const total = Math.max(0, Math.trunc(group.total))
    if (total === 0) continue
    groups[faces] = { total, spent: clamp(Math.trunc(group.spent), 0, total) }
  }
  const entries = Object.values(groups)
  if (entries.length === 0) {
    if (!fallback) return undefined
    const total = Math.max(0, Math.trunc(fallback.total))
    const spent = clamp(Math.trunc(fallback.spent), 0, total)
    return { total, spent }
  }
  return {
    total: entries.reduce((sum, group) => sum + group.total, 0),
    spent: entries.reduce((sum, group) => sum + group.spent, 0),
    byDie: groups,
  }
}

/** 剩余生命骰汇总（按骰面分组时求和，否则用旧字段）。 */
export function getHitDiceRemaining(pool: HitDicePool | undefined): number {
  if (!pool) return 0
  return Math.max(0, pool.total - pool.spent)
}

/** 按骰面花费生命骰：只扣指定骰面组，返回新池；无该骰面或已耗尽时返回原引用。 */
export function spendHitDiceDie(pool: HitDicePool | undefined, die: number, count: number): HitDicePool | undefined {
  const entries = getHitDicePoolEntries(pool)
  const target = entries.find((entry) => entry.die === die)
  if (!pool || !target) return pool
  const spendCount = Math.max(0, Math.min(Math.trunc(count), target.total - target.spent))
  if (spendCount === 0) return pool
  const byDie: Record<number, HitDiceGroup> = Object.fromEntries(entries.map((entry) => [entry.die, { total: entry.total, spent: entry.spent }]))
  byDie[die] = { total: target.total, spent: target.spent + spendCount }
  return normalizeHitDicePool(byDie, pool)
}

/**
 * 首次进入：HP = 最大 HP，法术位全 0，力竭 0，无 debuff，无快照。
 * `hitDiceTotal` 传数字时建立单组骰池（旧签名）；传骰面数组时按骰面分组（MC-A03）。
 */
export function createInitialSessionState(draftId: string, maxHp: number, hitDiceTotal?: number | readonly number[]): SessionState {
  const base: SessionState = {
    draftId,
    currentHp: maxHp,
    usedSpellSlots: {},
    exhaustionLevel: 0,
    debuffs: [],
    updatedAt: new Date().toISOString(),
  }
  if (hitDiceTotal === undefined) return base
  if (Array.isArray(hitDiceTotal)) {
    const byDie: Record<number, HitDiceGroup> = {}
    for (const die of hitDiceTotal as readonly number[]) {
      if (!Number.isFinite(die) || die <= 0) continue
      byDie[die] = { total: (byDie[die]?.total ?? 0) + 1, spent: 0 }
    }
    const pool = normalizeHitDicePool(byDie)
    return pool ? { ...base, hitDice: pool } : base
  }
  return { ...base, hitDice: { total: Math.max(0, hitDiceTotal as number), spent: 0 } }
}

/**
 * 补全/同步生命骰池（旧状态迁移与升级后调用）；花费数按新上限钳制。
 * `total` 传数字时按单组处理（旧签名，骰面未知）；传入骰面数组时建立分组（MC-A03）。
 */
export function ensureHitDicePool(state: SessionState, total: number | readonly number[]): SessionState {
  if (Array.isArray(total)) {
    const dice = total as readonly number[]
    const byDie: Record<number, HitDiceGroup> = {}
    for (const die of dice) {
      if (!Number.isFinite(die) || die <= 0) continue
      byDie[die] = { total: (byDie[die]?.total ?? 0) + 1, spent: 0 }
    }
    const next = normalizeHitDicePool(byDie)
    if (!next) return state
    const entries = getHitDicePoolEntries(next)
    const previous = getHitDicePoolEntries(state.hitDice)
    const byDieWithSpent: Record<number, HitDiceGroup> = Object.fromEntries(entries.map((entry) => [
      entry.die,
      { total: entry.total, spent: clamp(previous.find((item) => item.die === entry.die)?.spent ?? 0, 0, entry.total) },
    ]))
    const normalized = normalizeHitDicePool(byDieWithSpent) ?? next
    if (state.hitDice && samePool(state.hitDice, normalized)) return state
    return { ...state, hitDice: normalized }
  }
  const safeTotal = Math.max(0, total as number)
  const priorTotal = state.hitDice?.total ?? safeTotal
  const spent = clamp(state.hitDice?.spent ?? 0, 0, Math.min(priorTotal, safeTotal))
  if (state.hitDice && state.hitDice.total === safeTotal && state.hitDice.spent === spent) return state
  return { ...state, hitDice: { total: safeTotal, spent } }
}

function samePool(left: HitDicePool, right: HitDicePool): boolean {
  if (left.total !== right.total || left.spent !== right.spent) return false
  const leftEntries = getHitDicePoolEntries(left)
  const rightEntries = getHitDicePoolEntries(right)
  if (leftEntries.length !== rightEntries.length) return false
  return leftEntries.every((entry, index) => {
    const other = rightEntries[index]
    return Boolean(other) && entry.die === other?.die && entry.total === other.total && entry.spent === other.spent
  })
}

/** 直接恢复口径的骰面平均值（d6→4、d8→5、d10→6、d12→7）。 */
export function averageHitDieValue(die: number): number {
  return Math.ceil((die + 1) / 2)
}

/**
 * 短休花费生命骰：消耗 count 颗（不得超过剩余），按 outcomes 骰点合计 + 消耗数×体质调整值恢复生命（至少 1）。
 * 记录 lastHitDiceSnapshot 以支持撤回。
 * 提供 `die` 时只扣该骰面组（兼职角色按骰面记账，MC-A03）；省略时保持从总量扣减的既有行为。
 */
export function spendHitDice(
  state: SessionState,
  options: { readonly count: number; readonly outcomes: readonly number[]; readonly conModifier: number; readonly maxHp: number; readonly die?: number },
): SessionState {
  const pool = state.hitDice
  const count = Math.max(0, Math.floor(options.count))
  if (!pool || count === 0) return state
  // 只有按骰面分组的池才能按骰面扣减；旧状态（只有 total／spent）回退到总量扣减。
  const byDie = options.die !== undefined && getHitDicePoolEntries(pool).length > 0
  const grouped = byDie ? spendHitDiceDie(pool, options.die as number, count) : undefined
  if (byDie && grouped === pool) return state
  const available = grouped ? getHitDiceRemaining(grouped) : getHitDiceRemaining(pool)
  const spentCount = Math.min(count, available, options.outcomes.length || count)
  if (spentCount === 0) return state
  const nextPool = byDie
    ? spendHitDiceDie(pool, options.die as number, spentCount)
    : { ...pool, spent: pool.spent + spentCount }
  if (!nextPool) return state
  const total = options.outcomes.slice(0, spentCount).reduce((sum, value) => sum + value, 0) + spentCount * options.conModifier
  const currentHp = clamp(state.currentHp + Math.max(1, total), 0, options.maxHp)
  return {
    ...state,
    currentHp,
    hitDice: nextPool,
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

/** 长休恢复全部骰面组：按骰面把 spent 清零，并重算汇总值（MC-A03）。 */
function refreshHitDicePool(pool: HitDicePool | undefined): HitDicePool | undefined {
  if (!pool) return undefined
  const entries = getHitDicePoolEntries(pool)
  if (entries.length === 0) return { ...pool, spent: 0 }
  return normalizeHitDicePool(Object.fromEntries(entries.map((entry) => [entry.die, { total: entry.total, spent: 0 }])), pool)
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
 * 短休息：先保存快照，再结算——2014 回一半损失血量（向上取整）；2024 不自动治疗（由生命骰恢复）。
 * 契约法术位（pactSlotLevels 中的环级）已用归零；普通环、debuff 不动。
 * 仅 2024 应用 `exhaustionReduction`（如游侠·不知疲倦的短休力竭 −1），2014 保持既有行为。
 */
export function applyShortRest(
  state: SessionState,
  pactSlotLevels: readonly number[],
  maxHp: number,
  options: { readonly ruleset?: RulesetId; readonly exhaustionReduction?: number } = {},
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
  const exhaustionReduction = options.ruleset === '5e-2024' ? Math.max(0, options.exhaustionReduction ?? 0) : 0
  const exhaustionLevel = Math.max(0, state.exhaustionLevel - exhaustionReduction)
  return {
    ...state,
    currentHp: Math.min(maxHp, currentHp),
    usedSpellSlots,
    exhaustionLevel,
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
      hitDice: refreshHitDicePool(state.hitDice),
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
 * 角色最大 HP / 环位／资源上限变化时协调局内状态：保持已损失 HP，已用环位与职业资源按新上限钳制，
 * 已不存在的资源条目（换职业或降级失去特性）移除；休息快照同步换算，保证撤回休息后仍落在新上限内。
 * `resources` 省略时跳过资源协调（兼容旧调用）。
 */
export function reconcileSessionLimits(
  state: SessionState,
  oldMaxHp: number,
  newMaxHp: number,
  newSlots: readonly { level: number; count: number }[],
  hitDiceTotal?: number | readonly number[],
  resources?: readonly { readonly id: string; readonly max: number }[],
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
    // 骰面数组：按骰面重建分组，已花数量按同骰面保留并钳制（MC-A03）。
    if (Array.isArray(hitDiceTotal)) {
      const dice = hitDiceTotal as readonly number[]
      const byDie: Record<number, HitDiceGroup> = {}
      for (const die of dice) {
        if (!Number.isFinite(die) || die <= 0) continue
        byDie[die] = { total: (byDie[die]?.total ?? 0) + 1, spent: 0 }
      }
      const previous = getHitDicePoolEntries(pool)
      const withSpent: Record<number, HitDiceGroup> = Object.fromEntries(Object.entries(byDie).map(([die, group]) => [
        Number(die),
        { total: group.total, spent: clamp(previous.find((entry) => entry.die === Number(die))?.spent ?? 0, 0, group.total) },
      ]))
      return normalizeHitDicePool(withSpent, pool)
    }
    const total = Math.max(0, (hitDiceTotal as number | undefined) ?? pool.total)
    if (pool.byDie) {
      const entries = getHitDicePoolEntries(pool)
      const scale = pool.total > 0 ? total / pool.total : 1
      const rebuilt: Record<number, HitDiceGroup> = {}
      let assigned = 0
      entries.forEach((entry, index) => {
        const nextTotal = index === entries.length - 1 ? Math.max(0, total - assigned) : Math.max(0, Math.round(entry.total * scale))
        assigned += nextTotal
        rebuilt[entry.die] = { total: nextTotal, spent: clamp(entry.spent, 0, nextTotal) }
      })
      return normalizeHitDicePool(rebuilt, pool)
    }
    return { total, spent: clamp(pool.spent, 0, total) }
  }
  const resourceMax = new Map((resources ?? []).map((resource) => [resource.id, resource.max]))
  const reconcileResources = (
    usage: Readonly<Record<string, number>> | undefined,
  ): Readonly<Record<string, number>> | undefined => {
    if (!usage || !resources) return usage
    return Object.fromEntries(
      Object.entries(usage).flatMap(([id, used]) => {
        const maximum = resourceMax.get(id)
        if (maximum === undefined) return []
        const next = clamp(used, 0, maximum)
        return next > 0 ? [[id, next]] : []
      }),
    )
  }
  const resourceUsage = reconcileResources(state.resourceUsage)
  const snapshotResourceUsage = reconcileResources(state.lastRestSnapshot?.resourceUsage)
  return {
    ...state,
    currentHp: preserveDamage(state.currentHp),
    usedSpellSlots: reconcileSlots(state.usedSpellSlots),
    ...(state.hitDice ? { hitDice: reconcileHitDice(state.hitDice) } : {}),
    ...(resourceUsage ? { resourceUsage } : {}),
    ...(state.lastRestSnapshot ? {
      lastRestSnapshot: {
        ...state.lastRestSnapshot,
        currentHp: preserveDamage(state.lastRestSnapshot.currentHp),
        usedSpellSlots: reconcileSlots(state.lastRestSnapshot.usedSpellSlots),
        ...(state.lastRestSnapshot.hitDice ? { hitDice: reconcileHitDice(state.lastRestSnapshot.hitDice) } : {}),
        ...(snapshotResourceUsage ? { resourceUsage: snapshotResourceUsage } : {}),
      },
    } : {}),
    updatedAt: new Date().toISOString(),
  }
}
