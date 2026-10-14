import type { RulesetId } from '@/types/character'

/**
 * 兼职（多职业）草稿结构。
 *
 * 设计要点（见 `docs/需求文档/兼职（多职业）支持需求.md` §4.1 与决策 D2／D9）：
 * - 一个草稿最多 20 个职业（受「总等级 ≤ 20」与「每职业 ≥ 1 级」约束），职业数本身不设上限。
 * - `levelOrder` 是**升级顺序**（索引 i = 角色第 i+1 级选择的职业 id），用于 HP 逐级累加与检查点判定；
 *   它由分配变更的增量即时维护，缺失时可由各职业等级重建（决策 D7 不留历史）。
 * - 起始职业（`primaryClassId`）承载 1 级最大生命值、起始装备与豁免熟练。
 */
export interface ClassLevelEntry {
  readonly classId: string
  /** 该职业当前等级（1—19）。 */
  readonly level: number
  /** 该职业的子职（达到该职业的子职解锁等级后填写）。 */
  readonly subclassId?: string
}

export interface MulticlassState {
  /** 兼职开关（D2／D10）：默认 false；关闭时不显示「添加职业」入口，但不清空既有分配。 */
  readonly enabled: boolean
  /** 起始职业 = 第一个获得等级的职业。 */
  readonly primaryClassId: string
  /** 职业 → 等级的集合，按加入顺序排列；长度 1 时等价于单职业行为。 */
  readonly classes: readonly ClassLevelEntry[]
  /** 升级顺序：索引 i = 角色第 i+1 级选择的职业 id。 */
  readonly levelOrder: readonly string[]
}

/** 兼容视图：接受带兼职结构或仅有旧单职业字段的草稿子集。 */
export type MulticlassDraft = {
  readonly multiclass?: MulticlassState
  readonly classId?: string
  readonly subclassId?: string
  readonly targetLevel?: number
}

/** 单个职业的法术选择（存储形态；消费方见 MC-D04）。 */
export interface ClassSpellSelections {
  readonly classId: string
  readonly cantripIds: readonly string[]
  readonly knownSpellIds: readonly string[]
  readonly preparedSpellIds: readonly string[]
  readonly spellbookSpellIds: readonly string[]
}

/** 兼职先决属性：满足任一 `anyOf` 组即可（组内属性全部满足）。 */
export interface MulticlassPrerequisite {
  readonly anyOf: readonly (readonly ('str' | 'dex' | 'con' | 'int' | 'wis' | 'cha')[])[]
}

/** 兼职时获得的熟练项（2014 用总表，2024 用各职业「作为兼职角色」条目）。 */
export interface MulticlassProficiencyGrant {
  readonly ruleset: RulesetId
  readonly armorTraining?: readonly ('light' | 'medium' | 'heavy' | 'shield')[]
  readonly weaponTraining?: {
    readonly categories?: readonly ('simple' | 'martial')[]
    readonly martialProperties?: readonly string[]
    readonly itemIds?: readonly string[]
  }
  readonly skillChoices?: { readonly count: number; readonly optionIds?: readonly string[] }
  readonly toolProficiencies?: readonly string[]
  readonly toolChoices?: { readonly count: number; readonly optionIds?: readonly string[] }
}

/** 兼职施法系数：full = 全额，half = 二分之一，third = 三分之一。 */
export type MulticlassCasterWeight = 'full' | 'half' | 'third'
