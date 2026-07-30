import type { AbilityKey, CompatibilityStatus, DraftStep, RuleSource, RulesetId, SpellcastingMode } from '@/types/character'

export type CheckpointKind =
  | 'skills'
  | 'fighting-style'
  | 'subclass'
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
  readonly armorBase?: number
  readonly addsDexterityToArmor?: boolean
  readonly armorDexterityCap?: number
  readonly armorClassBonus?: number
  readonly category: 'armor' | 'shield' | 'weapon' | 'tool' | 'gear'
  readonly sourceIds: readonly string[]
}

export interface RulesRepository {
  readonly sources: readonly RuleSource[]
  readonly classes: readonly ClassRule[]
  readonly subclasses: readonly SubclassRule[]
  readonly races: readonly RaceRule[]
  readonly backgrounds: readonly BackgroundRule[]
  readonly options: readonly RuleOption[]
  readonly equipment: readonly EquipmentRule[]
  readonly spells: readonly SpellRule[]
  getClass(id: string): ClassRule | undefined
  getSubclass(id: string): SubclassRule | undefined
  getOption(id: string): RuleOption | undefined
  getRace(id: string): RaceRule | undefined
  getBackground(id: string): BackgroundRule | undefined
  getEquipment(id: string): EquipmentRule | undefined
  getSpell(id: string): SpellRule | undefined
}
