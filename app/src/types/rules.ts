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
  readonly summary: string
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
  readonly summary: string
  readonly parentRaceId?: string
  readonly subraceIds: readonly string[]
  readonly requiresSubrace?: boolean
  readonly replacesParentBonuses?: boolean
  readonly fixedAbilityBonuses: Readonly<Partial<Record<AbilityKey, number>>>
  readonly speed?: number
  readonly flexibleBonusCount?: number
  readonly flexibleBonusValue?: number
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
  readonly description: string
  readonly classIds: readonly string[]
  readonly equippable: boolean
  readonly weaponKind?: 'simple-melee' | 'simple-ranged' | 'martial-melee' | 'martial-ranged'
  readonly contents?: readonly EquipmentGrant[]
  readonly armorBase?: number
  readonly addsDexterityToArmor?: boolean
  readonly armorDexterityCap?: number
  readonly armorClassBonus?: number
  readonly category: 'armor' | 'shield' | 'weapon' | 'tool' | 'gear'
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
