import { describe, expect, it } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import { rulesRepository } from '@/rules/repository'
import {
  getAvailableSpells,
  getMaximumSpellLevel,
  getRequiredCantripCount,
  getRequiredSpellbookCount,
  getRequiredSpellCount,
  validateSpellSelections,
} from '@/rules/spellcasting'
import type { CharacterDraft } from '@/types/character'

function draft(patch: Partial<CharacterDraft>): CharacterDraft {
  return {
    schemaVersion: 2,
    id: 'arcane-test',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 8,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-wizard',
    raceId: 'race-2014-human',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-sage',
    backgroundSkillIds: ['skill-arcana', 'skill-history'],
    backgroundToolIds: [],
    languages: ['language-elvish', 'language-dwarvish'],
    proficiencyReplacements: [],
    baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    selections: [],
    inventoryItemIds: [],
    equippedItemIds: [],
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
    name: '奥术测试',
    alignment: '',
    notes: '',
    currentStep: 'spells',
    ...patch,
  }
}

describe('2014 wizard and warlock spellcasting', () => {
  it('builds the level 8 wizard spellbook and prepared limits', () => {
    const value = draft({})
    const config = rulesRepository.getClass('class-2014-wizard')?.spellcasting
    expect(config && getRequiredCantripCount(value, config)).toBe(4)
    expect(config && getRequiredSpellbookCount(value, config)).toBe(20)
    expect(config && getRequiredSpellCount(value, config)).toBe(11)
    expect(config && getMaximumSpellLevel(config, 8)).toBe(4)
  })

  it('requires prepared wizard spells to be present in the spellbook', () => {
    const base = draft({})
    const config = rulesRepository.getClass('class-2014-wizard')?.spellcasting
    if (!config) throw new Error('wizard config missing')
    const available = getAvailableSpells(base, config)
    const cantrips = available.filter((spell) => spell.level === 0).slice(0, 4).map((spell) => spell.id)
    const book = available.filter((spell) => spell.level > 0).slice(0, 20).map((spell) => spell.id)
    const valid = draft({ spellSelections: { cantripIds: cantrips, spellbookSpellIds: book, preparedSpellIds: book.slice(0, 11), knownSpellIds: [] } })
    expect(validateSpellSelections(valid)).toBe(true)
    expect(validateSpellSelections(draft({
      spellSelections: {
        ...valid.spellSelections,
        preparedSpellIds: [...book.slice(0, 10), available.filter((spell) => spell.level > 0)[25]?.id ?? 'missing'],
      },
    }))).toBe(false)
  })

  it('uses pact limits for a level 12 warlock', () => {
    const value = draft({ classId: 'class-2014-warlock', targetLevel: 12 })
    const config = rulesRepository.getClass('class-2014-warlock')?.spellcasting
    expect(config && getRequiredCantripCount(value, config)).toBe(4)
    expect(config && getRequiredSpellCount(value, config)).toBe(11)
    expect(config && getMaximumSpellLevel(config, 12)).toBe(5)
    const result = deriveCharacter(value)
    expect(result.spellAttackBonus?.value).toBe(4)
    expect(result.spellSaveDc?.value).toBe(12)
  })
})
