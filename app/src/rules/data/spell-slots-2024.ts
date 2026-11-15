/**
 * 2024 半施法者法术位表（spell slots）、最高施法环级与准备数量常量。
 *
 * 来源：2024 玩家手册职业表（项目内 `docs/classes/subclasses/paladin/paladin.md`
 * 与 `docs/classes/subclasses/ranger/ranger.md` 已逐格核对）。
 * 覆盖 2024 版圣武士、游侠与 UA 奇械师（三者共用一张半施法者表）。
 *
 * 与 2014 版（`app/src/rules/data/spell-slots-2014.ts`）的差异：
 * 2024 半施法者**1 级起即拥有 2 个一环法术位**（2014 版为 2 级起施法、1 级无环位），
 * 两者不得互相引用。
 *
 * 结构约定：
 * - 20 项，下标 = 职业等级 − 1；每项为数组，元素下标 = 环级 − 1（0 = 1 环），
 *   值为该环法术位数量，数组长度即该等级拥有的环位数。
 * - 最高施法环级由法术位表长度派生，避免再手写第二份数组而与法术位表漂移。
 *
 * 法术位为派生展示数据，不进入草稿持久化。
 */

export const HALF_CASTER_SPELL_SLOTS_2024 = [
  [2],
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

/** 2024 半施法者每级准备法术数量（圣武士、游侠、UA 奇械师共用）。 */
export const HALF_CASTER_PREPARED_2024 = [
  2,
  3,
  4,
  5,
  6,
  6,
  7,
  7,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  14,
  14,
  15,
  15,
] as const satisfies readonly number[]

/** 2024 半施法者每级最高施法环级（由法术位表长度派生）。 */
export const halfCasterMaximumSpellLevels2024: readonly number[] = HALF_CASTER_SPELL_SLOTS_2024.map((slots) => slots.length)
