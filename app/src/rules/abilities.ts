import type { AbilityDestinyRolls, AbilityMethod, AbilityScores, RulesetId } from '@/types/character'

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const
export const STANDARD_ARRAY_DEFAULT: AbilityScores = {
  str: 15,
  dex: 14,
  con: 13,
  int: 8,
  wis: 12,
  cha: 10,
}
const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
const POINT_BUY_BUDGET = 27
const ABILITY_SCORE_CAP = 20

/**
 * 天命掷骰（第 5 步自定义属性）：官方随机生成法的取值范围与骰法。
 *
 * 依据本地不全书两版正文：2014《玩家手册·第一章·一步步创建你的角色》与
 * 2024《玩家手册2024·创建角色·第三步：确定属性值》均写明「投掷 4 个 d6，
 * 将点数最高的三个骰子的总和记录下来，重复六次」，故每项为 4d6 去最低之和，
 * 范围 3—18；掷骰结果不含任何种族或背景加值。3d6 是更早版本的做法，5e 未采用。
 */
export const DESTINY_MIN_COUNT = 1
export const DESTINY_MAX_COUNT = 10
export const DESTINY_DICE_PER_SCORE = 4
export const DESTINY_DICE_KEPT = 3
/** 单项最低＝三颗骰子全出 1；最高＝三颗骰子全出 6。 */
export const DESTINY_SCORE_MIN = DESTINY_DICE_KEPT
export const DESTINY_SCORE_MAX = DESTINY_DICE_KEPT * 6

export type RandomInteger = (minimum: number, maximum: number) => number

/** 把玩家请求的天命组数夹到允许范围；非法输入回落到 1。 */
export function clampDestinyCount(value: number): number {
  if (!Number.isFinite(value)) return DESTINY_MIN_COUNT
  return Math.min(DESTINY_MAX_COUNT, Math.max(DESTINY_MIN_COUNT, Math.floor(value)))
}

/** 掷出六项属性：每项投 4d6 取最高三颗之和。 */
export function rollAbilityScoreSet(randomInteger: RandomInteger): readonly number[] {
  return ABILITY_KEYS.map(() => {
    const dice = Array.from(
      { length: DESTINY_DICE_PER_SCORE },
      () => randomInteger(1, 6),
    ).sort((left, right) => right - left)
    return dice.slice(0, DESTINY_DICE_KEPT).reduce((total, value) => total + value, 0)
  })
}

/**
 * 按天命次数掷出多组属性。
 *
 * 随机源由调用方注入：`rules` 保持框架与外部能力无关，页面 hook 负责传入
 * `services/dice-random` 的强随机实现；测试可传入固定序列。
 */
export function rollAbilityScoreSets(
  count: number,
  randomInteger: RandomInteger,
): readonly (readonly number[])[] {
  const safeCount = clampDestinyCount(count)
  return Array.from({ length: safeCount }, () => rollAbilityScoreSet(randomInteger))
}

/** 判断一组掷骰结果是否为合法的六项 3—18 整数。 */
export function isAbilityDestinySet(value: unknown): value is readonly number[] {
  return Array.isArray(value)
    && value.length === ABILITY_KEYS.length
    && value.every((score) => Number.isInteger(score) && score >= DESTINY_SCORE_MIN && score <= DESTINY_SCORE_MAX)
}

/**
 * 归一化天命记录：组数夹到 1—10，只保留合法的六项结果并截断到最后 `count` 组。
 * 非法或越界的记录被丢弃而不是折算，避免把不可复现的数值写成"原始选择"。
 */
export function normalizeAbilityDestiny(value: unknown): AbilityDestinyRolls | undefined {
  if (!value || typeof value !== 'object') return undefined
  const source = value as { readonly count?: unknown; readonly rolls?: unknown }
  if (typeof source.count !== 'number') return undefined
  const count = clampDestinyCount(source.count)
  const rolls = Array.isArray(source.rolls)
    ? source.rolls.filter(isAbilityDestinySet).map((set) => [...set]).slice(-count)
    : []
  return rolls.length > 0 ? { count, rolls } : { count }
}

interface AbilityRules {
  readonly pointBuyMinimum: number
  readonly pointBuyMaximum: number
  readonly customMinimum: number
  readonly customMaximum: number
  pointBuyScoreCost(score: number): number
}

const ABILITY_RULES: Readonly<Record<RulesetId, AbilityRules>> = {
  '5e-2014': {
    pointBuyMinimum: 8,
    pointBuyMaximum: 20,
    customMinimum: 3,
    customMaximum: 20,
    pointBuyScoreCost: (score) => Math.max(0, score - 8),
  },
  '5e-2024': {
    pointBuyMinimum: 8,
    pointBuyMaximum: 15,
    customMinimum: 3,
    customMaximum: 20,
    pointBuyScoreCost: (score) => score <= 13
      ? Math.max(0, score - 8)
      : 5 + (score - 13) * 2,
  },
}

export function pointBuyCost(scores: AbilityScores, ruleset: RulesetId): number {
  const rules = ABILITY_RULES[ruleset]
  return Object.values(scores).reduce((total, score) => total + rules.pointBuyScoreCost(score), 0)
}

export function areBaseAbilitiesValid(
  scores: AbilityScores,
  method: AbilityMethod,
  ruleset: RulesetId,
): boolean {
  const rules = ABILITY_RULES[ruleset]
  const values = Object.values(scores)
  if (method === 'standard-array') {
    return [...values].sort((a, b) => b - a).every((value, index) => value === STANDARD_ARRAY[index])
  }
  if (method === 'point-buy') {
    return ABILITY_KEYS.every((key) => {
      const baseScore = scores[key]
      return Number.isInteger(baseScore)
        && baseScore >= rules.pointBuyMinimum
        && baseScore <= rules.pointBuyMaximum
    }) && pointBuyCost(scores, ruleset) <= POINT_BUY_BUDGET
  }
  return values.every((value) => value >= rules.customMinimum && value <= rules.customMaximum)
}

export function areOriginAbilitiesWithinCap(
  scores: AbilityScores,
  bonuses: Partial<AbilityScores>,
): boolean {
  return ABILITY_KEYS.every((key) => scores[key] + (bonuses[key] ?? 0) <= ABILITY_SCORE_CAP)
}
