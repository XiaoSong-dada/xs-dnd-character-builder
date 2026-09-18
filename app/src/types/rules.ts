import type { AbilityKey, CharacterDraft, CompatibilityStatus, CurrencyWallet, DraftStep, RuleSource, RulesetId, SpellcastingMode } from '@/types/character'

export type CheckpointKind =
  | 'skills'
  | 'fighting-style'
  | 'weapon-mastery'
  | 'subclass'
  | 'subclass-feature'
  | 'ability-improvement'
  | 'expertise'
  | 'class-choice'
  | 'feat-feature'
  | 'feat'
  | 'infusion'

/** 2024 专长类别：决定授予来源与候选池；2014 条目可省略。 */
export type FeatCategory = 'origin' | 'general' | 'fighting-style' | 'epic-boon' | 'dragonmark' | 'wild-talent'

/** 护甲训练类别；2024 前置与熟练均以此为口径。 */
export type ArmorTraining = 'light' | 'medium' | 'heavy' | 'shield'

/** 武器训练：类别（简易／军用）、指定武器 ID，以及按词条覆盖的军用武器（如游荡者的灵巧／轻型军用）。 */
export interface WeaponTraining {
  readonly categories?: readonly ('simple' | 'martial')[]
  /** 具备其中任一属性的军用武器同样熟练（如 2024 游荡者的 finesse／light）。 */
  readonly martialProperties?: readonly string[]
  readonly itemIds?: readonly string[]
}

/** 骰池派生数据（偷袭、武艺、灵能骰等）：按等级变化的骰数／骰面，与消耗池分开。 */
export interface DicePoolRule {
  /** 1—20 级骰数（索引 = 等级−1；0 表示尚未获得）。 */
  readonly diceByLevel: readonly number[]
  /** 固定骰面（如偷袭 d6）；与 dieByLevel 二选一。 */
  readonly die?: string
  /** 按等级变化的骰面（如魂刃灵能骰 d6→d8→d10→d12）；与 die 二选一。 */
  readonly dieByLevel?: readonly string[]
  /** 骰池恢复方式（缺省 none，表示不是可消耗池）。 */
  readonly recovery?: 'short-rest' | 'long-rest' | 'none' | 'special'
  /** 短休只恢复固定枚数（如 2024 灵能骰短休恢复 1 枚）；缺省为短休全部恢复。 */
  readonly shortRestRecovery?: number
  readonly note?: string
}

/** 无甲防御规则（2024 职业数据）：未着甲时以 10＋敏捷＋指定属性计算基础 AC。 */
export interface UnarmoredDefenseRule {
  readonly ability: AbilityKey
  /** 持盾时是否仍受益（2024 野蛮人 true，2024 武僧 false）。 */
  readonly allowsShield: boolean
}

/** 职业／子职资源（B08 登记，B10 结算）：简单计数池的上限与恢复。 */
export interface ClassResource {
  /** 1—20 级上限；索引 = 等级−1；0 表示该等级尚未获得。使用 maxFromAbility 时省略。 */
  readonly maxByLevel?: readonly number[]
  readonly recovery: 'short-rest' | 'long-rest' | 'none' | 'special'
  /** 复杂条件或额外说明（如每回合一次、失败不消耗）。 */
  readonly note?: string
  /** 数值单位（缺省“次”，如奥术回想为“环级”）。 */
  readonly unit?: string
  /** 上限来自属性调整值（如 2024 诗人激励＝魅力调整值，至少 1 次）；提供时优先于 maxByLevel。 */
  readonly maxFromAbility?: { readonly ability: AbilityKey; readonly minimum: number; readonly multiplier?: number }
  /** 在等级表上限之外再加一项属性调整值（如防护师奥术守御＝2×等级＋智力调整值）。 */
  readonly abilityBonus?: AbilityKey
  /** 短休只恢复固定数量（如 2024 狂暴／回气短休恢复 1 次）；缺省为短休全部恢复。 */
  readonly shortRestRecovery?: number
  /** 达到该等级后短休也恢复（如 2024 诗人激励 5 级起短休或长休全恢复）；缺省只按 `recovery`。 */
  readonly shortRestFromLevel?: number
}

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
  /** 选项授予的护甲训练（如 2024 牧师圣职·保护者的重甲受训）。 */
  readonly armorTraining?: readonly ArmorTraining[]
  /** 选项授予的武器训练（如 2024 牧师圣职·保护者的军用武器熟练）。 */
  readonly weaponTraining?: WeaponTraining
  /** 选项授予的额外戏法数量（如 2024 牧师圣职·奇术使）。 */
  readonly cantripBonus?: number
  /** 超魔选项的术法点消耗（2024 超魔数据；B10 结算输入）。 */
  readonly sorceryPointCost?: number
  /** 选项授予的固定法术免费次数（如 2024 深海馈赠的水下呼吸，每次长休 1 次）。 */
  readonly grantedSpells?: readonly FixedSpellGrant[]
  /** 选项的职业等级先决（如 2024 魔能祈唤等级要求）；候选与校验按此筛选。 */
  readonly minimumLevel?: number
  /** 依赖的已选选项（如魔能斩需先选刃之魔契）。 */
  readonly requiredOptionIds?: readonly string[]
  /** 可重复选择（如苦痛魔爆可为不同戏法重复选取）。 */
  readonly repeatable?: boolean
  /** 选项授予的始终准备法术（如 2024 德鲁伊大地结社的地形法术，按德鲁伊等级生效）。 */
  readonly alwaysPreparedSpellIdsByLevel?: Readonly<Record<number, readonly string[]>>
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
  /** 获得节点等级下限（2024 通用专长 4、传奇恩惠 19）；2014 条目省略。 */
  readonly minimumLevel?: number
  readonly requiredCapability?:
    | 'armor-light'
    | 'armor-medium'
    | 'armor-heavy'
    | 'shield'
    | 'fighting-style'
    | 'spellcasting'
    | 'spellcasting-or-pact'
  readonly requiredRaceIds?: readonly string[]
  readonly requiredSubraceIds?: readonly string[]
  /** 必须已获得的专长 ID（如高等龙纹需先有对应基础龙纹）。 */
  readonly requiredFeatIds?: readonly string[]
  /** 已获得任意携带该 tag 的专长时不可选（如「不具有其他龙纹专长」）。 */
  readonly excludedFeatTag?: string
}

/** 检查点或专长子选择声明的法术授予语义（始终准备、免费次数与恢复）。 */
export interface SpellGrantSpec {
  /** 所选法术始终准备，不占职业准备上限。 */
  readonly alwaysPrepared?: boolean
  /** 每个休息周期的免费施放次数；缺省或 0 表示无免费次数。 */
  readonly freeCastings?: number
  /** 免费次数恢复时机。 */
  readonly recovery?: 'long-rest' | 'short-rest'
  /** 施法属性；缺省跟随授予来源（专长提升属性或职业施法属性）。 */
  readonly ability?: AbilityKey
}

/** 专长候选法术池：按环级、学派、仪式标签与所选法术表过滤。 */
export interface SpellPoolSpec {
  /** 固定法术环级；省略时按施法配置取 0—当前最高可用环级（配合 includeCantrips）。 */
  readonly level?: number
  /** 学派中文名（如“预言”“惑控”）。 */
  readonly schools?: readonly string[]
  readonly ritualOnly?: boolean
  /** 限定这些职业的法术（如 2024 逸闻学院·魔法探秘限牧师／德鲁伊／法师）。 */
  readonly classIds?: readonly string[]
  /** 未指定 level 时是否包含戏法（环级 0）。 */
  readonly includeCantrips?: boolean
  /** 依赖同一专长的另一个子选择（选项 ID 形如 `spell-list-<职业>`）确定法术表。 */
  readonly fromListChoiceId?: string
}

/** 固定授予的法术（不可选择，随专长、物种特性、职业／子职特性或祈唤生效）。 */
export interface FixedSpellGrant {
  readonly spellId: string
  readonly alwaysPrepared?: boolean
  readonly freeCastings?: number
  /**
   * 免费次数随熟练加值或属性调整值变化（如森林侏儒动物交谈随熟练加值、星图光导箭随感知调整值）。
   * 属性形式时 `minimum` 为最低次数。
   */
  readonly freeCastingsFrom?: 'proficiency-bonus' | { readonly ability: AbilityKey; readonly minimum: number }
  readonly recovery?: 'long-rest' | 'short-rest'
  readonly ability?: AbilityKey
  /** 达到该等级后本授予生效（如基础龙纹 3 级追加始终准备法术）。 */
  readonly minimumLevel?: number
}

/** 物种授予的固定法术：按获得等级生效；施法属性由物种选择（若声明）。 */
export interface SpeciesSpellGrant extends FixedSpellGrant {
  readonly minimumLevel: number
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
  /** 所选属性同时获得豁免熟练（如专长强健身心；选项需为属性 +1 选项）。 */
  readonly grantSavingThrowProficiency?: boolean
  /** 属性提升上限（2024 通用专长 20、传奇恩惠 30）；省略时按 20 处理。 */
  readonly abilityCap?: number
  /** 所选技能未熟练则获得熟练、已熟练则获得专精（如敏锐心灵、观察力）。 */
  readonly expertiseIfProficient?: boolean
  /** 带法术专长的子选择声明始终准备、免费次数与施法属性。 */
  readonly spellGrant?: SpellGrantSpec
  /** 候选法术池（与 `candidateKind: 'spell-pool'` 配合）。 */
  readonly spellPool?: SpellPoolSpec
  /** 选择数量随熟练加值变化（如仪式施法者）。 */
  readonly selectionCountFrom?: 'proficiency-bonus'
}

export interface FeatRule extends RuleOption {
  readonly ruleset: RulesetId
  readonly englishName: string
  readonly tags: readonly string[]
  /** 2024 专长类别；2014 条目省略。 */
  readonly category?: FeatCategory
  readonly prerequisite?: FeatPrerequisite
  /** 原创中文详细效果（展开区展示）：触发时机、资源与恢复、数值/范围、前置条件重申。 */
  readonly detail: string
  readonly choices?: readonly FeatChoiceSpec[]
  readonly repeatable?: boolean
  /** 固定授予的法术（随专长自动生效，不需选择）。 */
  readonly grantedSpells?: readonly FixedSpellGrant[]
  /** 将法术加入施法／契约法术列表（如龙纹「纹中之法」）。 */
  readonly expandedSpellPool?: readonly string[]
  /** 无条件派生效果：每级最大生命值加成（如健壮 +2/级）。 */
  readonly hitPointBonusPerLevel?: number
  /** 无条件派生效果：固定最大生命值加成（如超凡强韧之恩惠 +40）。 */
  readonly hitPointBonus?: number
  /** 无条件派生效果：速度加值（尺，如飙速跑者 +10、神行无拘之恩惠 +30）。 */
  readonly speedBonus?: number
  /** 无条件授予的护甲训练；用于前置判定与后续装备接入。 */
  readonly armorTraining?: readonly ArmorTraining[]
  /** 获得全部 18 项技能熟练（博学多才之恩惠）。 */
  readonly grantsAllSkillProficiencies?: boolean
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
  /** 属性提升上限（2024 通用专长 20、传奇恩惠 30）；省略时按 20 处理。 */
  readonly abilityCap?: number
  /** 所选属性同时获得豁免熟练（专长子选择，如强健身心）。 */
  readonly grantSavingThrowProficiency?: boolean
  /** 专长授予检查点：按类别展开候选池（2024 通用／战斗风格／传奇恩惠）；2014 职业检查点省略。 */
  readonly featCategories?: readonly FeatCategory[]
  /** 检查点选择声明的法术授予语义（法术精通、招牌法术、物种／专长授予）。 */
  readonly spellGrant?: SpellGrantSpec
  /** 候选法术池（与 `candidateKind: 'spell-pool'` 配合）。 */
  readonly spellPool?: SpellPoolSpec
  /** 选择数量随熟练加值变化（如仪式施法者）。 */
  readonly selectionCountFrom?: 'proficiency-bonus'
  /** 选择数量按等级表变化（索引 = 等级−1）；如 2024 战士武器精通 3／4／5／6。 */
  readonly selectionCountByLevel?: readonly number[]
  /** 法术级候选的施法时间过滤（如法术精通只允许“动作”）；与 candidateKind 配合。 */
  readonly spellCastingTime?: string
  /** 武器精通候选范围（缺省任意；`melee` 近战限定，`proficient` 限职业熟练武器）。 */
  readonly weaponMasteryFilter?: 'melee' | 'proficient' | 'any'
}

/** 动态候选池：检查点选项随草稿状态（等级、法术书）由规则层生成。 */
export type CheckpointCandidateKind =
  | 'all-spells'
  | 'spellbook-level-1'
  | 'spellbook-level-2'
  | 'spellbook-level-3'
  | 'weapon-mastery'
  | 'spell-pool'
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
  /** 表定准备数量表（2024 职业按等级表）；提供时优先于 preparedFormula。 */
  readonly preparedCountByLevel?: readonly number[]
  readonly spellbookSpellsByLevel?: readonly number[]
  /** 达到对应等级后始终准备，且不计入准备上限的法术。 */
  readonly alwaysPreparedSpellIdsByLevel?: Readonly<Record<number, readonly string[]>>
  /** 从某等级起追加的候选法术池（如 2024 诗人魔法奥秘：10 级起可从诗人／牧师／德鲁伊／法师列表准备）。 */
  readonly expandedSpellPool?: {
    readonly spellIds: readonly string[]
    readonly startsAtLevel: number
  }
  /** 可从法术书直接施展仪式，无需准备（2024 法师仪式学家）。 */
  readonly ritualCastingFromBook?: boolean
  /** 必须包含的戏法（如 2014／2024 酉术师必须包含法师之手）；缺失时校验器给出提示级问题而不是硬阻断。 */
  readonly requiredCantripSpellIds?: readonly string[]
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
  /** 法术学派（2024 录入；2014 条目省略）。 */
  readonly school?: string
  /** 施法时间原文（如“动作”“1 分钟”）；仪式标签另由 ritual 表示。 */
  readonly castingTime?: string
  /** 射程原文（如“60 尺”“触碰”“自身”）。 */
  readonly range?: string
  /** 成分原文（如“V、S、M（一点磷）”）。 */
  readonly components?: string
  /** 持续时间原文（如“立即”“1 分钟”）。 */
  readonly duration?: string
  /** 是否需要专注。 */
  readonly concentration?: boolean
}

export interface ClassRule {
  readonly id: string
  readonly ruleset: RulesetId
  readonly name: string
  readonly englishName: string
  readonly summary: string
  /** 职业介绍（原创中文转述，1—3 句：定位、常见玩法与核心机制）；2014 与 2024 文本独立。 */
  readonly introduction?: string
  readonly hitDie: number
  readonly primaryAbilities: readonly string[]
  readonly playStyleTags: readonly PlayStyleTag[]
  readonly savingThrowAbilities: readonly AbilityKey[]
  readonly status: CompatibilityStatus
  readonly sourceIds: readonly string[]
  readonly checkpoints: readonly ChoiceCheckpoint[]
  /** 职业授予的护甲训练（2024）；2014 职业省略并使用专长层的兼容映射。 */
  readonly armorTraining?: readonly ArmorTraining[]
  /** 职业授予的武器训练（2024）；2014 职业省略并回退 2014 兼容映射。 */
  readonly weaponTraining?: WeaponTraining
  /** 职业的无甲防御规则（2024）；2014 职业沿用 derive 内的兼容分支。 */
  readonly unarmoredDefense?: UnarmoredDefenseRule
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
  /** 子职专属法术书候选（如 EGtW 法师子职的秘迹学法术）；仅在选择该子职且来源开启时并入候选。 */
  readonly spellbookSpellIds?: readonly string[]
  /** 子职在特定职业等级授予的始终准备法术，不占准备上限。 */
  readonly alwaysPreparedSpellIdsByLevel?: Readonly<Record<number, readonly string[]>>
  /** 子职提供的无甲防御公式（如 2024 舞蹈学院炫目舞步）；与职业公式共用版本化出口。 */
  readonly unarmoredDefense?: UnarmoredDefenseRule
  /** 子职授予的额外入书规则（如 2024 塑能学者的塑能法术额外入书）。 */
  readonly spellbookExtraSpells?: SpellbookExtraRule
}

export type SubclassFeatureKind =
  | 'passive'
  | 'choice'
  | 'resource'
  | 'action'
  | 'bonus-action'
  | 'reaction'

/** 子职额外入书规则：基础名额＋每获得新法术环位追加名额，并限定法术学派。 */
export interface SpellbookExtraRule {
  /** 获得子职时立即获得的额外入书名额（如塑能学者 3 级的 2 道）。 */
  readonly base: number
  /** 此后每获得一个新的法术环位追加的名额（如每新环位 1 道）。 */
  readonly perNewSpellLevel: number
  /** 允许的学派中文名（与法术数据 `school` 对应，如“塑能”）。 */
  readonly schools: readonly string[]
}

/** 种族特性（2014）。常驻或按等级自动获得，不建立时间线检查点。 */
export interface RaceFeature {
  readonly id: string
  readonly raceId: string
  readonly name: string
  readonly englishName: string
  readonly level: number
  readonly summary: string
  /** 原创中文详细效果（展开区展示）。 */
  readonly description: string
  readonly kind: SubclassFeatureKind
  readonly status: CompatibilityStatus
  readonly sourceIds: readonly string[]
}

/** 背景特性（2014）。每个背景 1—N 条；变体背景沿用父背景特性。 */
export interface BackgroundFeature {
  readonly id: string
  readonly backgroundId: string
  readonly name: string
  readonly englishName: string
  readonly level: number
  readonly summary: string
  readonly description: string
  readonly kind: SubclassFeatureKind
  readonly status: CompatibilityStatus
  readonly sourceIds: readonly string[]
}

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
  /** 按专长类别展开候选池（如 2024 勇士 7 级额外战斗风格）。 */
  readonly featCategories?: readonly FeatCategory[]
  /** 选项 id → 中文名（用于子职特性选择检查点的界面渲染）。 */
  readonly optionLabels?: Readonly<Record<string, string>>
  /** 选择检查点的最少/最多选择数（缺省 1/1；多选特性如战斗大师战技填写 3/3）。 */
  readonly minSelections?: number
  readonly maxSelections?: number
  /** 动态候选池类型（如 2024 逸闻学院·魔法探秘的法术池）。 */
  readonly candidateKind?: CheckpointCandidateKind
  /** 同一唯一组内的选项不得跨检查点重复（如魔射手奥术射击跨等级去重）。 */
  readonly uniqueGroup?: string
  /** 候选法术池（与 `candidateKind: 'spell-pool'` 配合）。 */
  readonly spellPool?: SpellPoolSpec
  /** 检查点选择声明的法术授予语义（如始终准备）。 */
  readonly spellGrant?: SpellGrantSpec
  /** 法术级候选的施法时间过滤（与 candidateKind 配合）。 */
  readonly spellCastingTime?: string
  /** 子职特性授予的护甲训练（如 2024 勇气学院·战争训练）。 */
  readonly armorTraining?: readonly ArmorTraining[]
  /** 子职特性授予的武器训练（如 2024 勇气学院·战争训练）。 */
  readonly weaponTraining?: WeaponTraining
  /** 简单计数池资源（B08 登记展示，B10 结算）。 */
  readonly resource?: ClassResource
  /** 骰池派生数据（按等级变化的骰数与骰面；与消耗池分开）。 */
  readonly dicePool?: DicePoolRule
  /** 短休额外降低的力竭层数（缺省 0）。 */
  readonly shortRestExhaustionReduction?: number
  /** 本特性固定授予的免费施法（如 2024 精宸所与的妖精召唤术长休免费 1 次）。 */
  readonly grantedSpells?: readonly FixedSpellGrant[]
  /** 本特性额外授予的“自选语言”数量（如 2024 紫龙骑士骑士使节额外掌握一门语言）。 */
  readonly languageChoices?: number
  /** 所选技能获得专精（如知识领域·知识祝福）：检查点选项为技能 ID。 */
  readonly grantsExpertiseInChosenSkills?: boolean
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
  /** 简单计数池资源（B08 登记展示，B10 结算）。 */
  readonly resource?: ClassResource
  /** 骰池派生数据（按等级变化的骰数与骰面；与消耗池分开）。 */
  readonly dicePool?: DicePoolRule
  /** 短休额外降低的力竭层数（如 2024 游侠·不知疲倦短休力竭 −1；缺省 0）。 */
  readonly shortRestExhaustionReduction?: number
  /** 本特性固定授予的免费施法（如 2024 圣武斩的至圣斩长休免费 1 次）。 */
  readonly grantedSpells?: readonly FixedSpellGrant[]
  /** 本特性额外授予的“自选语言”数量（如 2024 游荡者盗贼黑话额外掌握一门语言）。 */
  readonly languageChoices?: number
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
  /** 2024 物种额外授予的起源专长选择（如人类 Versatile）；2014 与待接入数据省略。 */
  readonly originFeatChoices?: { readonly count: number; readonly categories: readonly FeatCategory[] }
  /** 2024 物种法术的施法属性候选（如精灵、侏儒、提夫林）；选择结果存于时间线检查点。 */
  readonly spellcastingAbilityChoices?: readonly AbilityKey[]
  /** 2024 物种随时间授予的固定法术（如血统法术）；2014 与待接入数据省略。 */
  readonly spellGrants?: readonly SpeciesSpellGrant[]
  /** 2024 固定体型；与 sizeChoices 二选一。 */
  readonly size?: 'small' | 'medium'
  /** 2024 创建时可选的体型（阿斯莫、人类、提夫林）。 */
  readonly sizeChoices?: readonly ('small' | 'medium')[]
  /** 2024 黑暗视觉范围（尺）；无黑暗视觉省略。 */
  readonly darkvision?: number
  /** 2024 其他感官原创释义（如震颤感知、盲视）；展示用。 */
  readonly senses?: readonly string[]
  /** 无条件派生：每级最大生命值加成（如矮人坚韧 +1/级）。 */
  readonly hitPointBonusPerLevel?: number
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
  /** 2024 背景固定授予的起源专长；2014 背景与待接入数据省略。 */
  readonly originFeatId?: string
  /** 起源专长替代：满足条件时可用所列类别专长替换固定起源专长（如贵族／智者＋狂野天赋）。 */
  readonly originFeatSubstitutions?: readonly { readonly category: FeatCategory; readonly sourceIds: readonly string[] }[]
  /** 2024 背景的三项属性候选（+2/+1 或各 +1）；2014 背景省略。 */
  readonly abilityChoices?: readonly AbilityKey[]
  /** 2024 背景的可选工具规格（如工匠工具、乐器、赌具）。 */
  readonly toolChoices?: { readonly count: number; readonly optionIds?: readonly string[] }
  /** 2024 装备 A 的物品显示名；B07 建立装备库后转为稳定 ID 引用。 */
  readonly startingEquipmentOptionA?: readonly string[]
  /** 2024 装备 B 的金币数量（通常 50 GP）。 */
  readonly startingEquipmentGold?: number
  readonly recommendedClassIds: readonly string[]
  readonly status: CompatibilityStatus
  readonly sourceIds: readonly string[]
}

/** 魔法物品的充能与消耗登记（B07-04 登记展示；消耗与恢复结算归 B10）。 */
export interface MagicItemUsageRule {
  /** 是否有充能（有限使用次数）机制；具体上限与消耗见物品说明。 */
  readonly charged: boolean
  /** 是否为一次性消耗品（药水、卷轴、油等）。 */
  readonly consumable: boolean
  /** 恢复时机集合；一次性消耗不在此列。 */
  readonly recovery: readonly ('dawn' | 'short-rest' | 'long-rest')[]
}

export interface EquipmentRule {
  readonly id: string
  readonly name: string
  readonly englishName: string
  readonly ruleset: RulesetId
  readonly status: CompatibilityStatus
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
  readonly rarity?: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact' | 'varies'
  /** 魔法物品目录分类；普通装备省略。 */
  readonly magicItemCategory?: 'armor' | 'potion' | 'ring' | 'rod' | 'scroll' | 'staff' | 'wand' | 'weapon' | 'wondrous'
  /** 同调状态；普通装备与无需同调的魔法物品均为 none。 */
  readonly attunement: 'none' | 'required' | 'conditional'
  /** 特殊同调条件的中文说明；仅 conditional 使用。 */
  readonly attunementCondition?: string
  /** 魔法加值（+1/+2/+3）：供命中/AC/伤害派生计算；仅魔法物品使用。 */
  readonly magicBonus?: number
  /** 魔法物品的动作边界；组合或依正文触发记为 varies。 */
  readonly itemAction?: 'action' | 'bonus-action' | 'reaction' | 'magic-action' | 'varies'
  /** 充能、消耗与恢复时机登记（B01《机制索引》解析）；普通装备省略。 */
  readonly magicItemUsage?: MagicItemUsageRule
  /** 机制索引登记的状态引用（如隐形、中毒）；无状态引用时省略。 */
  readonly stateReferences?: readonly string[]
  readonly sourceIds: readonly string[]
  readonly priceCp?: number
  readonly weightLb?: number
  readonly masteryId?: WeaponMasteryId
  readonly strengthRequirement?: number
  readonly stealthDisadvantage?: boolean
  readonly toolAbility?: AbilityKey
  readonly toolCheckHints?: readonly ToolCheckHint[]
  readonly craftableItemIds?: readonly string[]
}

export type WeaponMasteryId = `mastery-2024-${'cleave' | 'graze' | 'nick' | 'push' | 'sap' | 'slow' | 'topple' | 'vex'}`

export interface ToolCheckHint { readonly label: string; readonly dc: number }

export interface WeaponMasteryRule {
  readonly id: WeaponMasteryId
  readonly ruleset: '5e-2024'
  readonly name: string
  readonly englishName: string
  readonly summary: string
  readonly trigger: 'hit' | 'miss' | 'attack'
  readonly oncePerTurn: boolean
  readonly status: CompatibilityStatus
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
  readonly currency?: Partial<CurrencyWallet>
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
  readonly grants?: readonly EquipmentGrant[]
  readonly gp?: number
  readonly groups?: readonly StartingEquipmentGroup[]
}

export interface RulesRepository {
  readonly ruleset: RulesetId
  readonly sources: readonly RuleSource[]
  readonly classes: readonly ClassRule[]
  readonly subclasses: readonly SubclassRule[]
  readonly races: readonly RaceRule[]
  readonly backgrounds: readonly BackgroundRule[]
  /** 种族／物种特性注册表（2014 种族特性、2024 物种特性）。 */
  readonly raceFeatures: readonly RaceFeature[]
  /** 背景特性注册表（2024 背景无 2014 式特性时为空）。 */
  readonly backgroundFeatures: readonly BackgroundFeature[]
  readonly options: readonly RuleOption[]
  readonly feats: readonly FeatRule[]
  readonly equipment: readonly EquipmentRule[]
  readonly classStartingEquipment: readonly ClassStartingEquipmentRule[]
  readonly backgroundStartingEquipment: readonly BackgroundStartingEquipmentRule[]
  readonly spells: readonly SpellRule[]
  readonly weaponMasteries: readonly WeaponMasteryRule[]
  getClass(id: string): ClassRule | undefined
  getSubclass(id: string): SubclassRule | undefined
  /** 解析角色当前施法配置：子职级（奥法骑士、诡术师）优先，否则回退职业级。 */
  getSpellcastingConfig(draft: Pick<CharacterDraft, 'classId' | 'subclassId'>): SpellcastingConfig | undefined
  getOption(id: string): RuleOption | undefined
  getFeat(id: string): FeatRule | undefined
  getRace(id: string): RaceRule | undefined
  getBackground(id: string): BackgroundRule | undefined
  getRaceFeatures(raceId: string): readonly RaceFeature[]
  getBackgroundFeatures(backgroundId: string): readonly BackgroundFeature[]
  getEquipment(id: string): EquipmentRule | undefined
  getClassStartingEquipment(classId: string): ClassStartingEquipmentRule | undefined
  getBackgroundStartingEquipment(backgroundId: string): BackgroundStartingEquipmentRule | undefined
  getSpell(id: string): SpellRule | undefined
  getWeaponMastery(id: WeaponMasteryId): WeaponMasteryRule | undefined
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

/** 职业详情摘要：职业卡片展开区展示用；标签由规则层给出，组件不硬编码文案。 */
export interface ClassDetailSummary {
  /** 主要属性中文标签（可能两项，如「力量、敏捷」）。 */
  readonly abilities: readonly string[]
  /** 豁免熟练中文标签。 */
  readonly savingThrows: readonly string[]
  /** 生命骰，如 "d10"。 */
  readonly hitDie: string
}
