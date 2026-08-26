import type { AbilityKey, CharacterDraft, CompatibilityStatus, DraftStep, RuleSource, RulesetId, SpellcastingMode } from '@/types/character'

export type CheckpointKind =
  | 'skills'
  | 'fighting-style'
  | 'subclass'
  | 'subclass-feature'
  | 'ability-improvement'
  | 'expertise'
  | 'class-choice'
  | 'feat-feature'
  | 'infusion'

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
  /** 英文名（可选：选项类条目如超魔、战技等需要时登记）。 */
  readonly englishName?: string
  readonly description: string
  readonly status: CompatibilityStatus
  readonly sourceIds: readonly string[]
  /** 同一内容被重印时，当前规则实现采用的出版来源。 */
  readonly adoptedSourceId?: string
  /** 同一内容的首发来源；未重印时可省略。 */
  readonly originalSourceId?: string
}

export interface FeatPrerequisite {
  readonly abilityMinimum?: {
    readonly anyOf: readonly AbilityKey[]
    readonly score: number
  }
  readonly requiredCapability?: 'armor-light' | 'armor-medium' | 'armor-heavy' | 'spellcasting'
  readonly requiredRaceIds?: readonly string[]
  readonly requiredSubraceIds?: readonly string[]
}

export interface FeatChoiceSpec {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly minSelections: number
  readonly maxSelections: number
  readonly optionIds: readonly string[]
  readonly candidateKind?: CheckpointCandidateKind
  readonly abilityBonus?: number
  readonly uniqueGroup?: string
}

export interface FeatRule extends RuleOption {
  readonly ruleset: '5e-2014'
  readonly englishName: string
  readonly tags: readonly string[]
  readonly prerequisite?: FeatPrerequisite
  /** 原创中文详细效果（展开区展示）：触发时机、资源与恢复、数值/范围、前置条件重申。 */
  readonly detail: string
  readonly choices?: readonly FeatChoiceSpec[]
  readonly repeatable?: boolean
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
  /** 静态选项：普通选择（技能、子职、超魔等）直接列候选。 */
  readonly optionIds: readonly string[]
  /** 动态候选池类型：optionIds 为空时由规则层按草稿状态解析候选（法术级选项）。 */
  readonly candidateKind?: CheckpointCandidateKind
  /** 同一唯一组内的选项不得跨检查点重复。 */
  readonly uniqueGroup?: string
  /** 动态派生检查点的父检查点；父选择失效时本项同步失效。 */
  readonly parentCheckpointId?: string
  readonly parentOptionId?: string
  /** 子选择向对应属性提供的固定加值（半专长等）。 */
  readonly abilityBonus?: number
}

/** 动态候选池：检查点选项随草稿状态（等级、法术书）由规则层生成。 */
export type CheckpointCandidateKind =
  | 'all-spells'
  | 'spellbook-level-1'
  | 'spellbook-level-2'
  | 'spellbook-level-3'
  | 'all-skills'
  | 'proficient-skills'
  | 'artificer-infusions'

export interface SpellcastingConfig {
  readonly ruleset: RulesetId
  readonly mode: SpellcastingMode
  readonly ability: AbilityKey
  readonly startsAtLevel: number
  readonly spellsKnownByLevel?: readonly number[]
  readonly preparedFormula?: 'ability-plus-half-level' | 'ability-plus-half-level-ceil' | 'ability-plus-level'
  readonly cantripsKnownByLevel?: readonly number[]
  readonly maxSpellLevelByClassLevel: readonly number[]
  /** 标准法术位表（1—20 级各一项，每项元素下标 = 环级 − 1，值为该环法术位数量）；非 pact 模式使用。 */
  readonly slotsByClassLevel?: readonly (readonly number[])[]
  /** 契约法术位表（1—20 级各一项，每项 [法术位数量, 契约环级]）；仅 mode: 'pact' 使用。 */
  readonly pactSlotsByClassLevel?: readonly (readonly [number, number])[]
  readonly classSpellIds: readonly string[]
  readonly spellbookSpellsByLevel?: readonly number[]
  /** 达到对应等级后始终准备，且不计入准备上限的法术。 */
  readonly alwaysPreparedSpellIdsByLevel?: Readonly<Record<number, readonly string[]>>
}

export interface SpellRule {
  readonly id: string
  readonly ruleset: RulesetId
  readonly name: string
  readonly englishName: string
  readonly level: number
  /** 是否带有仪式标签，可由具备对应能力的角色进行仪式施法。 */
  readonly ritual: boolean
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
  /** 职业等级特性（含升级增强项，每条独立登记）；由 class-features-2014 挂载。 */
  readonly features?: readonly ClassFeature[]
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
  /** 子职级施法配置（如奥法骑士、诡术师）；解析时优先于职业配置。 */
  readonly spellcasting?: SpellcastingConfig
  /** 子职在特定职业等级授予的始终准备法术，不占准备上限。 */
  readonly alwaysPreparedSpellIdsByLevel?: Readonly<Record<number, readonly string[]>>
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
  /** 原创中文详细效果（展开区展示）：触发时机、资源消耗与恢复、数值、持续/范围。 */
  readonly description: string
  readonly kind: SubclassFeatureKind
  readonly requiresChoice?: boolean
  readonly optionIds?: readonly string[]
  /** 选项 id → 中文名（用于子职特性选择检查点的界面渲染）。 */
  readonly optionLabels?: Readonly<Record<string, string>>
  /** 选择检查点的最少/最多选择数（缺省 1/1；多选特性如战斗大师战技填写 3/3）。 */
  readonly minSelections?: number
  readonly maxSelections?: number
  readonly status: CompatibilityStatus
  readonly sourceIds: readonly string[]
}

/** 职业等级特性（2014 基础职业）。升级增强项每个等级各登记一条；需要玩家选择的特性标记 requiresChoice。 */
export interface ClassFeature {
  readonly id: string
  readonly classId: string
  readonly name: string
  readonly englishName: string
  readonly level: number
  readonly summary: string
  /** 原创中文详细效果（展开区展示）：触发时机、资源消耗与恢复、数值、持续/范围。 */
  readonly description: string
  readonly kind: SubclassFeatureKind
  readonly requiresChoice?: boolean
  /** 关联的时间线检查点 id：用于角色卡展示选择完成度（如超魔 3/10/17 级检查点）。 */
  readonly checkpointIds?: readonly string[]
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
  /** 种族固定技能熟练（如精灵察觉）；沿 parentRaceId 链叠加。 */
  readonly skillProficiencies?: readonly string[]
  /** 种族自选技能熟练规格（如半精灵 2 项全技能、兽人 7 选 2）；optionIds 缺省为全部 18 项技能。 */
  readonly skillProficiencyChoices?: { readonly count: number; readonly optionIds?: readonly string[] }
  /** 种族自选工具熟练规格（如矮人 1 项工匠工具）；展示级，不参与派生。 */
  readonly toolProficiencyChoices?: { readonly count: number }
  /** 种族武器/护甲熟练（如精灵武器训练）；展示级，不参与派生。 */
  readonly weaponArmorProficiencies?: readonly string[]
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
  /** 结构化武器特性；规则计算不得解析展示用 description。 */
  readonly weaponProperties?: readonly ('finesse' | 'light' | 'heavy' | 'reach' | 'loading' | 'ammunition' | 'thrown' | 'two-handed' | 'versatile')[]
  /** 两用武器双手持握时的伤害骰。 */
  readonly versatileDamageDice?: string
  /** 弹药或投掷武器的常规/长程距离（尺）。 */
  readonly range?: readonly [normal: number, long: number]
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
  /** 解析角色当前施法配置：子职级（奥法骑士、诡术师）优先，否则回退职业级。 */
  getSpellcastingConfig(draft: Pick<CharacterDraft, 'classId' | 'subclassId'>): SpellcastingConfig | undefined
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
