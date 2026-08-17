import { describe, expect, it } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import {
  FULL_CASTER_SPELL_SLOTS,
  HALF_CASTER_SPELL_SLOTS,
  PACT_SPELL_SLOTS,
} from '@/rules/data/spell-slots-2014'
import { rulesRepository } from '@/rules/repository'
import { getMaximumSpellLevel, getRequiredSpellCount, getSpellSlots, validateSpellSelections } from '@/rules/spellcasting'
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
    adventureGold: 0,
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

describe('2014 spell slots', () => {
  const fullCasterIds = ['class-2014-bard', 'class-2014-cleric', 'class-2014-druid', 'class-2014-sorcerer', 'class-2014-wizard']
  const halfCasterIds = ['class-2014-paladin', 'class-2014-ranger']

  it('follows the full-caster slot table for all five full casters at every level', () => {
    for (const classId of fullCasterIds) {
      const config = rulesRepository.getClass(classId)?.spellcasting
      expect(config, classId).toBeDefined()
      for (let level = 1; level <= 20; level += 1) {
        const expected = FULL_CASTER_SPELL_SLOTS[level - 1].map((count, index) => ({ level: index + 1, count }))
        expect(config && getSpellSlots(config, level), `${classId} L${level}`).toEqual(expected)
      }
    }
  })

  it('exposes key full-caster levels (wizard 1/5/9/20)', () => {
    const config = rulesRepository.getClass('class-2014-wizard')?.spellcasting
    expect(config && getSpellSlots(config, 1)).toEqual([{ level: 1, count: 2 }])
    expect(config && getSpellSlots(config, 5)).toEqual([
      { level: 1, count: 4 }, { level: 2, count: 3 }, { level: 3, count: 2 },
    ])
    expect(config && getSpellSlots(config, 9)).toEqual([
      { level: 1, count: 4 }, { level: 2, count: 3 }, { level: 3, count: 3 }, { level: 4, count: 3 }, { level: 5, count: 1 },
    ])
    expect(config && getSpellSlots(config, 20)).toEqual([
      { level: 1, count: 4 }, { level: 2, count: 3 }, { level: 3, count: 3 }, { level: 4, count: 3 },
      { level: 5, count: 3 }, { level: 6, count: 2 }, { level: 7, count: 2 }, { level: 8, count: 1 }, { level: 9, count: 1 },
    ])
  })

  it('starts half casters with no slots and follows the half-caster table', () => {
    for (const classId of halfCasterIds) {
      const config = rulesRepository.getClass(classId)?.spellcasting
      expect(config && getSpellSlots(config, 1)).toEqual([])
      expect(config && getSpellSlots(config, 2)).toEqual([{ level: 1, count: 2 }])
      expect(config && getSpellSlots(config, 5)).toEqual([{ level: 1, count: 4 }, { level: 2, count: 2 }])
      expect(config && getSpellSlots(config, 20)).toEqual([
        { level: 1, count: 4 }, { level: 2, count: 3 }, { level: 3, count: 3 }, { level: 4, count: 3 }, { level: 5, count: 2 },
      ])
      for (let level = 1; level <= 20; level += 1) {
        const expected = HALF_CASTER_SPELL_SLOTS[level - 1].map((count, index) => ({ level: index + 1, count }))
        expect(config && getSpellSlots(config, level), `${classId} L${level}`).toEqual(expected)
      }
    }
  })

  it('returns pact slots with count, level and pact flag (warlock 1/5/11/17/20)', () => {
    const config = rulesRepository.getClass('class-2014-warlock')?.spellcasting
    expect(config && getSpellSlots(config, 1)).toEqual([{ level: 1, count: 1, pact: true }])
    expect(config && getSpellSlots(config, 5)).toEqual([{ level: 3, count: 2, pact: true }])
    expect(config && getSpellSlots(config, 11)).toEqual([{ level: 5, count: 3, pact: true }])
    expect(config && getSpellSlots(config, 17)).toEqual([{ level: 5, count: 4, pact: true }])
    expect(config && getSpellSlots(config, 20)).toEqual([{ level: 5, count: 4, pact: true }])
    for (let level = 1; level <= 20; level += 1) {
      const [count, slotLevel] = PACT_SPELL_SLOTS[level - 1]
      expect(config && getSpellSlots(config, level), `warlock L${level}`).toEqual([{ level: slotLevel, count, pact: true }])
    }
  })

  it('returns empty slots for out-of-range levels and no config for non-casters', () => {
    const wizard = rulesRepository.getClass('class-2014-wizard')?.spellcasting
    expect(wizard && getSpellSlots(wizard, 0)).toEqual([])
    expect(wizard && getSpellSlots(wizard, 21)).toEqual([])
    expect(rulesRepository.getClass('class-2014-fighter')?.spellcasting).toBeUndefined()
  })

  it('keeps slot tables consistent with maxSpellLevelByClassLevel', () => {
    for (const classId of ['class-2014-wizard', 'class-2014-paladin', 'class-2014-warlock']) {
      const config = rulesRepository.getClass(classId)?.spellcasting
      for (let level = 1; level <= 20; level += 1) {
        const slots = config && getSpellSlots(config, level)
        const maxLevel = config && getMaximumSpellLevel(config, level)
        if (slots && slots.length) {
          expect(Math.max(...slots.map((slot) => slot.level)), `${classId} L${level}`).toBe(maxLevel)
        } else {
          expect(maxLevel, `${classId} L${level}`).toBe(0)
        }
      }
    }
  })
})
