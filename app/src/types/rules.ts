import type { AbilityKey, CompatibilityStatus, DraftStep, RuleSource, RulesetId, SpellcastingMode } from '@/types/character'

export type CheckpointKind =
  | 'skills'
  | 'fighting-style'
  | 'subclass'
  | 'subclass-feature'
  | 'ability-improvement'
  | 'maneuvers'
  | 'expertise'
  | 'class-choice'

/**
 * 玩法标签：描述职业/子职的常见玩法定位，供推荐引擎做偏好匹配。
 * 标签只服务推荐排序与理由解释，不参与派生计算。
 */
export type PlayStyleTag =
  | 'frontline' // 前线近战
  | 'ranged' // 远程输出
  | 'spellcaster' // 施法者
  | 'support' // 支援辅助
  | 'durable' // 耐久生存
  | 'control' // 战场控制
  | 'striker' // 爆发输出
  | 'utility' // 多功能
  | 'skirmisher' // 机动游击

export interface RuleOption {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly status: CompatibilityStatus
  readonly sourceIds: readonly string[]
}

export interface FeatPrerequisite {
  readonly abilityMinimum?: {
    readonly anyOf: readonly AbilityKey[]
    readonly score: number
  }
  readonly requiredCapability?: 'armor-light' | 'armor-medium' | 'armor-heavy' | 'spellcasting'
}

export interface FeatRule extends RuleOption {
  readonly ruleset: '5e-2014'
  readonly englishName: string
  readonly tags: readonly string[]
  readonly prerequisite?: FeatPrerequisite
}

export interface ChoiceCheckpoint {
  readonly id: string
  readonly level: number
  readonly step: DraftStep
  readonly kind: CheckpointKind
  readonly title: string
  readonly description: string
  readonly required: boolean
  readonly minSelections: number
  readonly maxSelections: number
  readonly optionIds: readonly string[]
}

export interface SpellcastingConfig {
  readonly ruleset: RulesetId
  readonly mode: SpellcastingMode
  readonly ability: AbilityKey
  readonly startsAtLevel: number
  readonly spellsKnownByLevel?: readonly number[]
  readonly preparedFormula?: 'ability-plus-half-level' | 'ability-plus-level'
  readonly cantripsKnownByLevel?: readonly number[]
  readonly maxSpellLevelByClassLevel: readonly number[]
  /** 标准法术位表（1—20 级各一项，每项元素下标 = 环级 − 1，值为该环法术位数量）；非 pact 模式使用。 */
  readonly slotsByClassLevel?: readonly (readonly number[])[]
  /** 契约法术位表（1—20 级各一项，每项 [法术位数量, 契约环级]）；仅 mode: 'pact' 使用。 */
  readonly pactSlotsByClassLevel?: readonly (readonly [number, number])[]
  readonly classSpellIds: readonly string[]
  readonly spellbookSpellsByLevel?: readonly number[]
}

export interface SpellRule {
  readonly id: string
  readonly ruleset: RulesetId
  readonly name: string
  readonly englishName: string
  readonly level: number
  readonly classIds: readonly string[]
  /** 环级等元数据说明（占位性质，不承载效果）。 */
  readonly summary: string
  /** 原创中文效果摘要（施法时间/射程/持续时间/效果要点）；空字符串表示尚未登记。 */
  readonly description: string
  readonly status: CompatibilityStatus
  readonly sourceIds: readonly string[]
}

export interface ClassRule {
  readonly id: string
  readonly ruleset: RulesetId
  readonly name: string
  readonly englishName: string
  readonly summary: string
  readonly hitDie: number
  readonly primaryAbilities: readonly string[]
  readonly playStyleTags: readonly PlayStyleTag[]
  readonly savingThrowAbilities: readonly AbilityKey[]
  readonly status: CompatibilityStatus
  readonly sourceIds: readonly string[]
  readonly checkpoints: readonly ChoiceCheckpoint[]
  readonly spellcasting?: SpellcastingConfig
}

export interface SubclassRule {
  readonly id: string
  readonly classId: string
  readonly ruleset: RulesetId
  readonly name: string
  readonly englishName: string
  readonly selectionLevel: number
  readonly summary: string
  readonly status: CompatibilityStatus
  readonly availability?: 'player' | 'dm-only'
  readonly sourceIds: readonly string[]
  readonly features: readonly SubclassFeature[]
}

export type SubclassFeatureKind =
  | 'passive'
  | 'choice'
  | 'resource'
  | 'action'
  | 'bonus-action'
  | 'reaction'

export interface SubclassFeature {
  readonly id: string
  readonly subclassId: string
  readonly name: string
  readonly englishName: string
  readonly level: number
  readonly summary: string
  readonly kind: SubclassFeatureKind
  readonly requiresChoice?: boolean
  readonly optionIds?: readonly string[]
  /** 选项 id → 中文名（用于子职特性选择检查点的界面渲染）。 */
  readonly optionLabels?: Readonly<Record<string, string>>
  readonly status: CompatibilityStatus
  readonly sourceIds: readonly string[]
}

export interface RaceRule {
  readonly id: string
  readonly ruleset: RulesetId
  readonly name: string
  readonly englishName: string
  /** 一行概括（卡片摘要行）。 */
  readonly summary: string
  /** 原创中文详细介绍（体型/速度/感官/语言/特性要点）；展开区展示。 */
  readonly description: string
  readonly parentRaceId?: string
  readonly subraceIds: readonly string[]
  readonly requiresSubrace?: boolean
  readonly replacesParentBonuses?: boolean
  readonly fixedAbilityBonuses: Readonly<Partial<Record<AbilityKey, number>>>
  readonly speed?: number
  readonly flexibleBonusCount?: number
  readonly flexibleBonusValue?: number
  /** 灵活加值分组（如费兹本龙裔：第一项 +2、第二项 +1）；与 flexibleBonusCount/Value 二选一。 */
  readonly flexibleBonusGroups?: readonly { readonly count: number; readonly value: number }[]
  readonly excludedFlexibleAbilityKeys?: readonly AbilityKey[]
  readonly recommendedClassIds: readonly string[]
  readonly status: CompatibilityStatus
  readonly sourceIds: readonly string[]
}

export interface BackgroundRule {
  readonly id: string
  readonly ruleset: RulesetId
  readonly name: string
  readonly englishName: string
  readonly summary: string
  /** 原创中文详细介绍（技能/工具/语言/背景特性/装备要点）；展开区展示。 */
  readonly description: string
  readonly parentBackgroundId?: string
  readonly variantIds: readonly string[]
  readonly skillIds: readonly string[]
  readonly toolIds: readonly string[]
  readonly languageChoices: number
  readonly featureName: string
  readonly recommendedClassIds: readonly string[]
  readonly status: CompatibilityStatus
  readonly sourceIds: readonly string[]
}

export interface EquipmentRule {
  readonly id: string
  readonly name: string
  /** 展开区详情：护甲 AC/力量需求/隐蔽劣势、武器伤害与特性、魔法物品效果要点等（原创转述）。 */
  readonly description: string
  readonly classIds: readonly string[]
  readonly equippable: boolean
  readonly weaponKind?: 'simple-melee' | 'simple-ranged' | 'martial-melee' | 'martial-ranged'
  /** 武器伤害骰（如 '1d6'）；仅武器条目使用。 */
  readonly damageDice?: string
  /** 武器伤害类型（如 '穿刺'）；仅武器条目使用。 */
  readonly damageType?: string
  readonly contents?: readonly EquipmentGrant[]
  readonly armorBase?: number
  readonly addsDexterityToArmor?: boolean
  readonly armorDexterityCap?: number
  readonly armorClassBonus?: number
  readonly category: 'armor' | 'shield' | 'weapon' | 'tool' | 'gear' | 'potion' | 'magic'
  /** 魔法物品稀有度；普通装备省略。 */
  readonly rarity?: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact'
  /** 是否需要同调（attunement）才能使用；仅魔法物品使用。 */
  readonly requiresAttunement?: boolean
  /** 魔法加值（+1/+2/+3）：供命中/AC/伤害派生计算；仅魔法物品使用。 */
  readonly magicBonus?: number
  readonly sourceIds: readonly string[]
}

export interface EquipmentGrant {
  readonly itemId: string
  readonly quantity: number
}

export interface EquipmentPickRule {
  readonly count: number
  readonly allowedItemIds?: readonly string[]
  readonly allowedWeaponKinds?: readonly NonNullable<EquipmentRule['weaponKind']>[]
}

export interface StartingEquipmentOption {
  readonly id: string
  readonly label: string
  readonly grants: readonly EquipmentGrant[]
  readonly pick?: EquipmentPickRule
}

export interface StartingEquipmentGroup {
  readonly id: string
  readonly title: string
  readonly options: readonly StartingEquipmentOption[]
}

export interface ClassStartingEquipmentRule {
  readonly classId: string
  readonly fixedGrants: readonly EquipmentGrant[]
  readonly groups: readonly StartingEquipmentGroup[]
}

export interface BackgroundStartingEquipmentRule {
  readonly backgroundId: string
  readonly grants: readonly EquipmentGrant[]
  readonly gp: number
}

export interface RulesRepository {
  readonly sources: readonly RuleSource[]
  readonly classes: readonly ClassRule[]
  readonly subclasses: readonly SubclassRule[]
  readonly races: readonly RaceRule[]
  readonly backgrounds: readonly BackgroundRule[]
  readonly options: readonly RuleOption[]
  readonly feats: readonly FeatRule[]
  readonly equipment: readonly EquipmentRule[]
  readonly classStartingEquipment: readonly ClassStartingEquipmentRule[]
  readonly backgroundStartingEquipment: readonly BackgroundStartingEquipmentRule[]
  readonly spells: readonly SpellRule[]
  getClass(id: string): ClassRule | undefined
  getSubclass(id: string): SubclassRule | undefined
  getOption(id: string): RuleOption | undefined
  getFeat(id: string): FeatRule | undefined
  getRace(id: string): RaceRule | undefined
  getBackground(id: string): BackgroundRule | undefined
  getEquipment(id: string): EquipmentRule | undefined
  getClassStartingEquipment(classId: string): ClassStartingEquipmentRule | undefined
  getBackgroundStartingEquipment(backgroundId: string): BackgroundStartingEquipmentRule | undefined
  getSpell(id: string): SpellRule | undefined
}

/** 推荐原因：text 为玩家可读的解释，weight 为该原因对分数的贡献。 */
export interface RecommendationReason {
  readonly text: string
  readonly weight: number
  /** 所属偏好的中文名，供界面生成原因摘要。 */
  readonly preferenceLabel: string
}

/** 职业推荐结果：score 仅用于排序，reasons 用于界面解释。 */
export interface ClassRecommendation {
  readonly score: number
  readonly reasons: readonly RecommendationReason[]
  /** 命中偏好的中文名（与 reasons 一一对应），供界面生成原因摘要。 */
  readonly matchedPreferenceLabels: readonly string[]
}

/** 职业成长速览条目：由规则数据推导，供界面展示职业关键节点。 */
export interface ClassGrowthSummaryItem {
  readonly level: number
  readonly title: string
}
