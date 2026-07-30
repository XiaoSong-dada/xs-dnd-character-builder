import { describe, expect, it } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import { rulesRepository } from '@/rules/repository'
import { getMaximumSpellLevel, getRequiredSpellCount, validateSpellSelections } from '@/rules/spellcasting'
import { validateDraft } from '@/rules/validate'
import type { CharacterDraft } from '@/types/character'

function draft(patch: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    schemaVersion: 3,
    id: 'spell-test',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 5,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-paladin',
    raceId: 'race-2014-human',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-acolyte',
    backgroundSkillIds: ['skill-insight', 'skill-religion'],
    backgroundToolIds: [],
    languages: ['language-elvish', 'language-dwarvish'],
    proficiencyReplacements: [],
    baseAbilities: { str: 15, dex: 10, con: 13, int: 8, wis: 12, cha: 14 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [
      { id: 'test-chain-mail', itemId: 'chain-mail', quantity: 1, sourceKind: 'legacy', sourceId: 'test', equippedQuantity: 1 },
      { id: 'test-longsword', itemId: 'longsword', quantity: 1, sourceKind: 'legacy', sourceId: 'test', equippedQuantity: 1 },
    ],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    equipmentNeedsReview: false,
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
    name: '施法测试',
    alignment: '',
    notes: '',
    currentStep: 'spells',
    ...patch,
  }
}

describe('2014 half-caster spellcasting', () => {
  it('starts both classes at level 2 and follows the half-caster spell levels', () => {
    for (const classId of ['class-2014-paladin', 'class-2014-ranger']) {
      const config = rulesRepository.getClass(classId)?.spellcasting
      expect(config?.startsAtLevel).toBe(2)
      expect(config && getMaximumSpellLevel(config, 4)).toBe(1)
      expect(config && getMaximumSpellLevel(config, 5)).toBe(2)
      expect(config && getMaximumSpellLevel(config, 17)).toBe(5)
    }
  })

  it('calculates paladin prepared spells from Charisma and half class level', () => {
    const config = rulesRepository.getClass('class-2014-paladin')?.spellcasting
    expect(config && getRequiredSpellCount(draft(), config)).toBe(4)
  })

  it('uses the 2014 ranger spells-known table', () => {
    const rangerDraft = draft({ classId: 'class-2014-ranger', targetLevel: 10 })
    const config = rulesRepository.getClass('class-2014-ranger')?.spellcasting
    expect(config && getRequiredSpellCount(rangerDraft, config)).toBe(6)
  })

  it('rejects over-level and wrong-class spells', () => {
    const invalid = draft({
      targetLevel: 2,
      spellSelections: {
        cantripIds: [],
        knownSpellIds: [],
        preparedSpellIds: ['spell-2014-bless', 'spell-2014-aid'],
        spellbookSpellIds: [],
      },
    })
    expect(validateSpellSelections(invalid)).toBe(false)
    expect(validateDraft(invalid).some((issue) => issue.id === 'unavailable-spell')).toBe(true)
  })

  it('derives spell attack and save DC with visible sources', () => {
    const result = deriveCharacter(draft())
    expect(result.spellAttackBonus?.value).toBe(5)
    expect(result.spellSaveDc?.value).toBe(13)
    expect(result.spellSaveDc?.sources.map((source) => source.id)).toEqual([
      'spell-dc-base',
      'spell-dc-proficiency',
      'spell-dc-ability',
    ])
  })
})
