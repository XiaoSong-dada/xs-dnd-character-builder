export type RulesetId = '5e-2014'
export type CompatibilityStatus = 'implemented' | 'index-only' | 'dm-only' | 'unavailable'
export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
export type AbilityMethod = 'standard-array' | 'point-buy' | 'custom'
export type SpellcastingMode = 'prepared' | 'known' | 'spellbook' | 'pact'

export type DraftStep =
  | 'setup'
  | 'preferences'
  | 'class'
  | 'origin'
  | 'abilities'
  | 'timeline'
  | 'equipment'
  | 'spells'
  | 'identity'
  | 'validation'
  | 'sheet'

export interface RuleSource {
  readonly id: string
  readonly title: string
  readonly ruleset: RulesetId
  readonly url?: string
}

export interface AbilityScores {
  readonly str: number
  readonly dex: number
  readonly con: number
  readonly int: number
  readonly wis: number
  readonly cha: number
}

export interface ChoiceSelection {
  readonly checkpointId: string
  readonly optionIds: readonly string[]
  readonly confirmedAt: string
  readonly invalidatedAt?: string
  readonly invalidatedReason?: string
}

export interface ProficiencyReplacement {
  readonly kind: 'skill' | 'tool' | 'language'
  readonly sourceId: string
  readonly duplicateId: string
  readonly replacementId: string
}

export interface SpellSelections {
  readonly cantripIds: readonly string[]
  readonly knownSpellIds: readonly string[]
  readonly preparedSpellIds: readonly string[]
  readonly spellbookSpellIds: readonly string[]
}

export interface StartingEquipmentSelection {
  readonly groupId: string
  readonly optionId: string
  readonly pickedItemIds: readonly string[]
}

export type InventorySourceKind = 'class' | 'background' | 'legacy'

export interface InventoryEntry {
  readonly id: string
  readonly itemId: string
  readonly quantity: number
  readonly sourceKind: InventorySourceKind
  readonly sourceId: string
  readonly equippedQuantity: number
}

export interface CurrencyWallet {
  readonly cp: number
  readonly sp: number
  readonly ep: number
  readonly gp: number
  readonly pp: number
}

export interface CharacterDraft {
  readonly schemaVersion: 3
  readonly id: string
  readonly ruleset: '5e-2014'
  readonly createdAt: string
  readonly updatedAt: string
  readonly targetLevel: number
  readonly abilityMethod: AbilityMethod
  readonly preferences: readonly string[]
  readonly classId?: string
  readonly subclassId?: string
  readonly raceId?: string
  readonly subraceId?: string
  readonly backgroundId?: string
  readonly backgroundVariantId?: string
  readonly raceAbilityChoices: readonly AbilityKey[]
  readonly backgroundSkillIds: readonly string[]
  readonly backgroundToolIds: readonly string[]
  readonly languages: readonly string[]
  readonly proficiencyReplacements: readonly ProficiencyReplacement[]
  readonly baseAbilities: AbilityScores
  readonly selections: readonly ChoiceSelection[]
  readonly startingEquipmentSelections: readonly StartingEquipmentSelection[]
  readonly inventory: readonly InventoryEntry[]
  readonly currency: CurrencyWallet
  readonly equipmentNeedsReview: boolean
  readonly spellSelections: SpellSelections
  readonly name: string
  readonly alignment: string
  readonly notes: string
  readonly currentStep: DraftStep
}

export interface LegacyDraftRecord {
  readonly id: string
  readonly name: string
  readonly ruleset: string
  readonly targetLevel?: number
  readonly raw: unknown
}

export interface ValueSource {
  readonly id: string
  readonly label: string
  readonly value: number
  readonly detail: string
}

export interface DerivedValue<T> {
  readonly value: T
  readonly sources: readonly ValueSource[]
}

export interface DerivedCharacter {
  readonly abilities: AbilityScores
  readonly modifiers: Record<AbilityKey, number>
  readonly proficiencyBonus: DerivedValue<number>
  readonly hitPoints: DerivedValue<number>
  readonly armorClass: DerivedValue<number>
  readonly initiative: DerivedValue<number>
  readonly attackBonus: DerivedValue<number>
  readonly attackDamageBonus: DerivedValue<number>
  readonly spellAttackBonus?: DerivedValue<number>
  readonly spellSaveDc?: DerivedValue<number>
  readonly speed: DerivedValue<number>
  readonly savingThrows: Readonly<Record<AbilityKey, DerivedValue<number>>>
  readonly skills: Readonly<Record<string, DerivedValue<number>>>
}

export interface DerivedCharacterSummary {
  readonly level: number
  readonly className?: string
  readonly proficiencyBonus: string
  readonly hitPoints?: number
  readonly armorClass?: number
  readonly initiative?: string
  readonly speed?: number
}

export interface ValidationIssue {
  readonly id: string
  readonly step: DraftStep
  readonly severity: 'error' | 'warning'
  readonly message: string
  readonly resolution: string
}

export interface DependencyImpact {
  readonly invalidated: readonly string[]
  readonly review: readonly string[]
  readonly preserved: readonly string[]
}
