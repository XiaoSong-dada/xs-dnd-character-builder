export type RulesetId = '5e-2014'
export type CompatibilityStatus = 'implemented' | 'selectable' | 'index-only' | 'dm-only' | 'unavailable'
export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
export type AbilityMethod = 'standard-array' | 'point-buy' | 'custom'
export type SpellcastingMode = 'prepared' | 'known' | 'spellbook' | 'pact'
export type ManualSpellDestination = 'known' | 'pact-known' | 'prepared-list' | 'spellbook' | 'granted'
export type ManualDerivedField =
  | 'armorClass'
  | 'hitPoints'
  | 'initiative'
  | 'speed'
  | 'attackBonus'
  | 'attackDamageBonus'
  | 'passivePerception'
  | 'spellAttackBonus'
  | 'spellSaveDc'

export type DraftStep =
  | 'setup'
  | 'sources'
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
  readonly shortTitle: string
  readonly ruleset: RulesetId
  readonly category: 'core' | 'supplement'
  readonly selectable: boolean
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
  /** 通过抄录写入法术书的法术 ID（spellbookSpellIds 的子集）；升级自动获得的不在此列。 */
  readonly transcribedSpellIds: readonly string[]
}

export interface ManualAddedSpell {
  readonly spellId: string
  readonly destination: ManualSpellDestination
  readonly prepared: boolean
}

/** 角色卡人工编辑只保存相对系统计算值的差值；空对象代表完全使用系统规则。 */
export interface CharacterManualEdits {
  readonly abilityAdjustments: Readonly<Partial<Record<AbilityKey, number>>>
  readonly proficiencyBonusAdjustment: number
  readonly derivedAdjustments: Readonly<Partial<Record<ManualDerivedField, number>>>
  readonly savingThrowAdjustments: Readonly<Partial<Record<AbilityKey, number>>>
  readonly skillAdjustments: Readonly<Record<string, number>>
  readonly spellSlotAdjustments: Readonly<Record<number, number>>
  readonly addedSpells: readonly ManualAddedSpell[]
}

export interface StartingEquipmentSelection {
  readonly groupId: string
  readonly optionId: string
  readonly pickedItemIds: readonly string[]
}

export type InventorySourceKind = 'class' | 'background' | 'legacy' | 'adventure'

export interface InventoryEntry {
  readonly id: string
  readonly itemId: string
  readonly quantity: number
  readonly sourceKind: InventorySourceKind
  readonly sourceId: string
  readonly equippedQuantity: number
}

/** Artificer 灌注与物品栏条目的生效绑定；已知灌注仍保存在时间线 selections。 */
export interface InfusionAssignment {
  readonly infusionId: string
  readonly inventoryEntryId: string
}

export interface CurrencyWallet {
  readonly cp: number
  readonly sp: number
  readonly ep: number
  readonly gp: number
  readonly pp: number
}

export interface CharacterDraft {
  readonly schemaVersion: 6
  readonly id: string
  readonly ruleset: '5e-2014'
  readonly createdAt: string
  readonly updatedAt: string
  readonly targetLevel: number
  readonly abilityMethod: AbilityMethod
  /** 当前角色允许使用的可选 2014 来源；Basic Rules 与 PHB 始终启用，不写入此数组。 */
  readonly enabledSourceIds: readonly string[]
  readonly classId?: string
  readonly subclassId?: string
  readonly raceId?: string
  readonly subraceId?: string
  readonly backgroundId?: string
  readonly backgroundVariantId?: string
  readonly raceAbilityChoices: readonly AbilityKey[]
  /** 种族自选技能熟练结果（如半精灵 2 项、兽人 7 选 2）；旧草稿缺省为空。 */
  readonly raceSkillChoices?: readonly string[]
  /** 种族自选工具熟练结果（矮人/战俑/维达肯/吉斯洋基）；展示级，不参与派生。 */
  readonly raceToolChoice?: string
  readonly backgroundSkillIds: readonly string[]
  readonly backgroundToolIds: readonly string[]
  readonly languages: readonly string[]
  readonly proficiencyReplacements: readonly ProficiencyReplacement[]
  readonly baseAbilities: AbilityScores
  readonly selections: readonly ChoiceSelection[]
  readonly startingEquipmentSelections: readonly StartingEquipmentSelection[]
  readonly inventory: readonly InventoryEntry[]
  readonly infusionAssignments: readonly InfusionAssignment[]
  readonly currency: CurrencyWallet
  /** 冒险净增金币（GP，可为负）；持有总额 = currency.gp + adventureGold。 */
  readonly adventureGold: number
  readonly equipmentNeedsReview: boolean
  readonly spellSelections: SpellSelections
  readonly manualEdits: CharacterManualEdits
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
  readonly passivePerception: DerivedValue<number>
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

/** 依赖影响清单中的检查点引用：id 用于定位，title 用于界面展示。 */
export interface DependencyCheckpointRef {
  readonly checkpointId: string
  readonly title: string
}

export interface DependencyImpact {
  readonly invalidated: readonly string[]
  readonly review: readonly string[]
  readonly preserved: readonly string[]
  /** 升级时：新等级时间线新增且尚未完成的检查点（用于引导玩家补全）。 */
  readonly added?: readonly DependencyCheckpointRef[]
  /** 降级时：将失效选择的展示信息（checkpointId → 标题）。 */
  readonly invalidatedDetails?: readonly DependencyCheckpointRef[]
  /** 降级时：按新等级列出数量减少、需玩家复查的资源说明。 */
  readonly reviews?: readonly string[]
  /** 升级时：施法配置随新等级需补全的说明（已知/准备/法术书/戏法数量不足时）。 */
  readonly spellUpdates?: readonly string[]
}
