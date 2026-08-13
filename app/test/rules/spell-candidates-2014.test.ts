import { describe, expect, it } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import { getSpellCandidates } from '@/rules/spellcasting'
import type { CharacterDraft } from '@/types/character'

function draft(patch: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    schemaVersion: 3,
    id: 'spell-candidates-test',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 5,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-cleric',
    raceId: 'race-2014-human',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-acolyte',
    backgroundSkillIds: ['skill-insight', 'skill-religion'],
    backgroundToolIds: [],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: { str: 15, dex: 10, con: 13, int: 8, wis: 12, cha: 14 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    equipmentNeedsReview: false,
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
    name: '候选池测试',
    alignment: '',
    notes: '',
    currentStep: 'spells',
    ...patch,
  }
}

function config(classId: string) {
  return rulesRepository.getClass(classId)?.spellcasting
}

describe('2014 候选池计算', () => {
  it('prepared（牧师）候选 = 职业池 1 环起 − 已准备', () => {
    const d = draft({
      classId: 'class-2014-cleric',
      targetLevel: 3,
      spellSelections: {
        cantripIds: [],
        knownSpellIds: [],
        preparedSpellIds: ['spell-2014-bless', 'spell-2014-healing-word'],
        spellbookSpellIds: [],
      },
    })
    const candidates = getSpellCandidates(d, config(d.classId!)!)

    expect(candidates.prepared.length).toBeGreaterThan(0)
    expect(candidates.prepared).not.toContain('spell-2014-bless')
    expect(candidates.prepared).not.toContain('spell-2014-healing-word')
    expect(candidates.prepared).toContain('spell-2014-guiding-bolt')
    expect(candidates.prepared.every((id) => (rulesRepository.getSpell(id)?.level ?? 0) >= 1)).toBe(true)
    expect(candidates.prepared.every((id) => (rulesRepository.getSpell(id)?.level ?? 0) <= 2)).toBe(true)
    expect(candidates.writeToBook).toEqual([])
    expect(candidates.prepareFromBook).toEqual([])
  })

  it('spellbook（法师）候选写入 = 职业池 − 书中；候选准备 = 书中 − 已准备', () => {
    const d = draft({
      classId: 'class-2014-wizard',
      targetLevel: 3,
      spellSelections: {
        cantripIds: [],
        knownSpellIds: [],
        preparedSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield'],
        spellbookSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield', 'spell-2014-burning-hands'],
      },
    })
    const candidates = getSpellCandidates(d, config(d.classId!)!)

    expect(candidates.prepareFromBook).toEqual(['spell-2014-burning-hands'])
    expect(candidates.writeToBook).not.toContain('spell-2014-burning-hands')
    expect(candidates.writeToBook).not.toContain('spell-2014-magic-missile')
    expect(candidates.writeToBook).not.toContain('spell-2014-shield')
    expect(candidates.writeToBook.length).toBeGreaterThan(0)
    expect(candidates.writeToBook.every((id) => (rulesRepository.getSpell(id)?.level ?? 0) >= 1)).toBe(true)
    expect(candidates.prepared).toEqual([])
  })

  it('known / pact 模式无候选（2014 规则平时不可更换）', () => {
    const sorcerer = draft({
      classId: 'class-2014-sorcerer',
      targetLevel: 3,
      spellSelections: {
        cantripIds: ['spell-2014-fire-bolt'],
        knownSpellIds: ['spell-2014-charm-person'],
        preparedSpellIds: [],
        spellbookSpellIds: [],
      },
    })
    expect(getSpellCandidates(sorcerer, config(sorcerer.classId!)!)).toEqual({ prepared: [], writeToBook: [], prepareFromBook: [] })

    const warlock = draft({
      classId: 'class-2014-warlock',
      targetLevel: 3,
      spellSelections: {
        cantripIds: ['spell-2014-eldritch-blast'],
        knownSpellIds: ['spell-2014-hex'],
        preparedSpellIds: [],
        spellbookSpellIds: [],
      },
    })
    expect(getSpellCandidates(warlock, config(warlock.classId!)!)).toEqual({ prepared: [], writeToBook: [], prepareFromBook: [] })
  })

  it('候选随等级变化：5 级出现 3 环候选，3 级没有', () => {
    const d5 = draft({ classId: 'class-2014-cleric', targetLevel: 5 })
    const candidates5 = getSpellCandidates(d5, config(d5.classId!)!)
    expect(candidates5.prepared.map((id) => rulesRepository.getSpell(id)?.level)).toContain(3)

    const d3 = draft({ classId: 'class-2014-cleric', targetLevel: 3 })
    const candidates3 = getSpellCandidates(d3, config(d3.classId!)!)
    expect(candidates3.prepared.map((id) => rulesRepository.getSpell(id)?.level)).not.toContain(3)
  })
})
