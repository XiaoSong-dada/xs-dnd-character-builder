/**
 * 2014 法术位表（spell slots）与最高施法环级常量。
 *
 * 来源：2014 Basic Rules / SRD 5.1（项目已核验开放规则）。
 * 三张表覆盖全部 8 个施法职业：
 * - FULL_CASTER_SPELL_SLOTS：吟游诗人、牧师、德鲁伊、术士、法师（1 级起全施法者表）。
 * - HALF_CASTER_SPELL_SLOTS：圣武士、游侠（2 级起半施法者表，1 级无环位）。
 * - PACT_SPELL_SLOTS：邪术师契约法术位（数量少、随等级提升到 5 环，短休恢复）。
 *
 * 结构约定：
 * - 标准表：20 项，下标 = 职业等级 − 1；每项为数组，元素下标 = 环级 − 1（0 = 1 环），
 *   值为该环法术位数量，数组长度即该等级拥有的环位数。
 * - 契约表：20 项，每项 [法术位数量, 契约法术位环级]。
 *
 * 法术位为派生展示数据，不进入草稿持久化；数值必须与各职业
 * maxSpellLevelByClassLevel 保持一致的来源（见下方派生常量）。
 */

export const FULL_CASTER_SPELL_SLOTS = [
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
] as const satisfies readonly (readonly number[])[]

export const HALF_CASTER_SPELL_SLOTS = [
  [],
  [2],
  [3],
  [3],
  [4, 2],
  [4, 2],
  [4, 3],
  [4, 3],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2],
] as const satisfies readonly (readonly number[])[]

export const PACT_SPELL_SLOTS = [
  [1, 1],
  [2, 1],
  [2, 2],
  [2, 2],
  [2, 3],
  [2, 3],
  [2, 4],
  [2, 4],
  [2, 5],
  [2, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [4, 5],
  [4, 5],
  [4, 5],
  [4, 5],
] as const satisfies readonly (readonly [number, number])[]

/** 全施法者每级最高施法环级（由法术位表长度派生，保持与旧常量数值一致）。 */
export const fullCasterMaximumSpellLevels: readonly number[] = FULL_CASTER_SPELL_SLOTS.map((slots) => slots.length)

/** 半施法者每级最高施法环级（由法术位表长度派生）。 */
export const halfCasterMaximumSpellLevels: readonly number[] = HALF_CASTER_SPELL_SLOTS.map((slots) => slots.length)

/** 邪术师每级契约法术位环级（由契约表派生）。 */
export const pactMaximumSpellLevels: readonly number[] = PACT_SPELL_SLOTS.map(([, level]) => level)
