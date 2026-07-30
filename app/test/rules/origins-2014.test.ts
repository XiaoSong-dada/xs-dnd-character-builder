import { describe, expect, it } from 'vitest'

import { getRaceAbilityBonuses } from '@/rules/derive'
import { rulesRepository } from '@/rules/repository'
import type { CharacterDraft } from '@/types/character'

function draft(patch: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    schemaVersion: 2,
    id: 'origin-test',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 1,
    abilityMethod: 'standard-array',
    preferences: [],
    raceAbilityChoices: [],
    backgroundSkillIds: [],
    backgroundToolIds: [],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
    selections: [],
    inventoryItemIds: [],
    equippedItemIds: [],
    name: '',
    alignment: '',
    notes: '',
    currentStep: 'origin',
    ...patch,
  }
}

describe('2014 origins', () => {
  it('registers all nine core races and thirteen base backgrounds', () => {
    expect(rulesRepository.races.filter((item) => !item.parentRaceId)).toHaveLength(9)
    expect(rulesRepository.backgrounds.filter((item) => !item.parentBackgroundId)).toHaveLength(13)
    expect(rulesRepository.backgrounds.filter((item) => item.parentBackgroundId)).toHaveLength(5)
  })

  it('combines parent and subrace bonuses', () => {
    expect(getRaceAbilityBonuses(draft({
      raceId: 'race-2014-dwarf',
      subraceId: 'race-2014-dwarf-mountain',
    }))).toEqual({ con: 2, str: 2 })
  })

  it('variant human replaces the ordinary human bonuses', () => {
    expect(getRaceAbilityBonuses(draft({
      raceId: 'race-2014-human',
      subraceId: 'race-2014-human-variant',
      raceAbilityChoices: ['str', 'con'],
    }))).toEqual({ str: 1, con: 1 })
  })
})
