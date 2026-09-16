import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { EMPTY_CURRENCY } from '@/rules/starting-equipment'
import type { CharacterDraft, ChoiceSelection } from '@/types/character'

export function emptySpellSelections(): CharacterDraft['spellSelections'] {
  return {
    cantripIds: [],
    knownSpellIds: [],
    preparedSpellIds: [],
    spellbookSpellIds: [],
    transcribedSpellIds: [],
  }
}

/** 2024 测试草稿工厂：字段完整、默认 4 级战士，便于按用例覆盖。 */
export function draft2024(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  const now = '2026-09-11T00:00:00.000Z'
  return {
    schemaVersion: 8,
    id: 'b04-test-draft',
    ruleset: '5e-2024',
    createdAt: now,
    updatedAt: now,
    targetLevel: 4,
    abilityMethod: 'standard-array',
    enabledSourceIds: [],
    classId: 'class-2024-fighter',
    raceAbilityChoices: [],
    backgroundSkillIds: [],
    backgroundToolIds: [],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    infusionAssignments: [],
    currency: EMPTY_CURRENCY,
    adventureGold: 0,
    equipmentNeedsReview: false,
    spellSelections: emptySpellSelections(),
    manualEdits: EMPTY_MANUAL_EDITS,
    name: '测试角色',
    alignment: '',
    notes: '',
    currentStep: 'timeline',
    ...overrides,
  }
}

export function selection(checkpointId: string, optionIds: readonly string[]): ChoiceSelection {
  return { checkpointId, optionIds, confirmedAt: '2026-09-11T00:00:00.000Z' }
}
