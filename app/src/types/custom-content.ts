import type { AbilityKey, RulesetId } from '@/types/character'
import type {
  ArmorTraining,
  FeatCategory,
  SubclassFeatureKind,
  UnarmoredDefenseRule,
  WeaponTraining,
} from '@/types/rules'

/**
 * 内容工坊（自定义内容）域类型。
 *
 * 设计基线见 `docs/需求文档/内容工坊需求.md`：
 * - 自定义内容按规则集隔离（`5e-2014` 与 `5e-2024` 各一套，不共享、不隐式转换）；
 * - 每条内容必须挂在某个「自定义扩展」下，扩展即来源门禁，映射为一条 `RuleSource`；
 * - ID 使用固定前缀 `custom-` / `source-custom-`，永不与内置 ID 冲突；
 * - 类型是内置规则类型的**子集投影**，由 `rules/custom-content` 转成 `RaceRule` 等内置类型。
 */
export type CustomContentKind = 'expansion' | 'race' | 'class' | 'subclass' | 'feat' | 'spell'

/** 玩家录入的特性/职业特性条目（仅展示，不参与自动计算）。 */
export interface CustomTrait {
  readonly id: string
  readonly name: string
  readonly level: number
  readonly summary: string
  readonly description: string
}

/** 职业等级特性条目（仅展示，不参与自动计算）。 */
export interface CustomClassFeature {
  readonly id: string
  readonly name: string
  readonly level: number
  readonly summary: string
  readonly description: string
  readonly kind?: SubclassFeatureKind
}

interface CustomEntryBase {
  /** 稳定 ID：`custom-<kind>-<token>`，导入导出与草稿引用都依赖它。 */
  readonly id: string
  /** 所属自定义扩展 ID：`source-custom-<token>`。 */
  readonly expansionId: string
  readonly ruleset: RulesetId
  readonly name: string
  readonly englishName: string
  /** 卡片摘要行（一句话）。 */
  readonly summary: string
  /** 原创中文详细说明（展开区 / 角色卡展示）。 */
  readonly description: string
  /** 归档后不再进入新建候选池，但已被引用的角色仍可解析。 */
  readonly archived?: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

/** 自定义扩展：一本玩家自制的"扩展书"，同时是内容门禁来源。 */
export interface CustomExpansion {
  /** `source-custom-<token>` */
  readonly id: string
  readonly ruleset: RulesetId
  /** 书名（车卡第 2 步 chip 主文案）。 */
  readonly title: string
  /** 简称（chip 前缀，沿用「简称 · 书名」格式）。 */
  readonly shortTitle: string
  readonly note?: string
  /** 新车卡是否默认勾选该扩展。 */
  readonly defaultEnabled: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

/** 自定义种族。2014 使用固定属性加值；2024 不得使用（属性加值来自背景）。 */
export interface CustomRaceEntry extends CustomEntryBase {
  readonly kind: 'race'
  readonly size?: 'small' | 'medium'
  readonly sizeChoices?: readonly ('small' | 'medium')[]
  readonly speed?: number
  readonly darkvision?: number
  /** 仅 2014：固定属性加值（0—2）。 */
  readonly fixedAbilityBonuses?: Readonly<Partial<Record<AbilityKey, number>>>
  readonly skillProficiencies?: readonly string[]
  readonly fixedLanguages?: readonly string[]
  readonly languageChoices?: number
  readonly damageResistances?: readonly string[]
  readonly hitPointBonusPerLevel?: number
  readonly initiativeProficiency?: boolean
  readonly climbSpeed?: number
  readonly swimSpeed?: number
  readonly flySpeed?: number
  /** 种族特性（仅展示）。 */
  readonly traits?: readonly CustomTrait[]
}

/** 自定义职业。施法通过"引用已有职业的法术表"实现（需求 §7.3.1）。 */
export interface CustomClassEntry extends CustomEntryBase {
  readonly kind: 'class'
  readonly hitDie: 6 | 8 | 10 | 12
  /** 主属性（中文标签，如「力量」「敏捷」）。 */
  readonly primaryAbilities: readonly string[]
  readonly savingThrowAbilities: readonly AbilityKey[]
  readonly armorTraining?: readonly ArmorTraining[]
  readonly weaponTraining?: WeaponTraining
  readonly unarmoredDefense?: UnarmoredDefenseRule
  /** 引用的内置职业 ID：复用其 `spellcasting` 配置。 */
  readonly spellcastingSourceClassId?: string
  /** 施法属性；缺省跟随被引用职业。 */
  readonly spellcastingAbility?: AbilityKey
  /** 职业等级特性（仅展示）。 */
  readonly features?: readonly CustomClassFeature[]
}

/** 自定义子职。挂在某个内置或自定义职业下；v1 只展示特性，不自动结算。 */
export interface CustomSubclassEntry extends CustomEntryBase {
  readonly kind: 'subclass'
  /** 父职业 ID（内置或自定义，完整 ID）。 */
  readonly classId: string
  /** 选择等级；由父职业已有子职锁定，首个自定义子职可选择。 */
  readonly selectionLevel: number
  /** 子职特性（仅展示）。 */
  readonly features?: readonly CustomClassFeature[]
}

/** 自定义专长。 */
export interface CustomFeatEntry extends CustomEntryBase {
  readonly kind: 'feat'
  /** 2014 固定 general；2024 必填。 */
  readonly category?: FeatCategory
  readonly repeatable?: boolean
  readonly prerequisite?: {
    readonly minimumLevel?: number
    readonly abilityMinimum?: { readonly anyOf: readonly AbilityKey[]; readonly score: number }
    readonly requiredCapability?: 'spellcasting' | 'spellcasting-or-pact'
  }
  readonly hitPointBonusPerLevel?: number
  readonly hitPointBonus?: number
  readonly speedBonus?: number
  readonly armorTraining?: readonly ArmorTraining[]
  /** 固定授予的法术（引用当前规则集仓库中已存在的法术 ID）。 */
  readonly grantedSpellIds?: readonly string[]
}

/** 自定义法术。 */
export interface CustomSpellEntry extends CustomEntryBase {
  readonly kind: 'spell'
  /** 0—9；0 为戏法。 */
  readonly level: number
  readonly school?: string
  /** 所属职业 ID 列表；决定进入哪些职业的第 8 步候选池。 */
  readonly classIds: readonly string[]
  readonly ritual?: boolean
  readonly castingTime?: string
  readonly range?: string
  readonly components?: string
  readonly duration?: string
  readonly concentration?: boolean
}

/** 可编辑条目联合类型（扩展单独管理）。 */
export type CustomEntry = CustomRaceEntry | CustomClassEntry | CustomSubclassEntry | CustomFeatEntry | CustomSpellEntry

/** 可编辑条目的种类（不含 expansion）。 */
export type CustomEntryKind = CustomEntry['kind']

/** 单个规则集的内容库。 */
export interface CustomContentBundle {
  readonly version: 1
  readonly expansions: readonly CustomExpansion[]
  readonly races: readonly CustomRaceEntry[]
  readonly classes: readonly CustomClassEntry[]
  readonly subclasses: readonly CustomSubclassEntry[]
  readonly feats: readonly CustomFeatEntry[]
  readonly spells: readonly CustomSpellEntry[]
}

/** 两个规则集各一套，互不混合。 */
export interface CustomContentState {
  readonly '5e-2014': CustomContentBundle
  readonly '5e-2024': CustomContentBundle
}

/** 内容库读取结果：`skipped` 用于向用户报告"已跳过 N 条损坏内容"，不静默丢弃。 */
export interface CustomContentLoadResult {
  readonly state: CustomContentState
  readonly skipped: number
  /** 读取整体失败（JSON 损坏等）时的中文原因。 */
  readonly error?: string
}
