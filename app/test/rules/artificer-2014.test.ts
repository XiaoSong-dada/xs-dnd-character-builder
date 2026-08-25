import { describe, expect, it } from 'vitest'

import { artificerClass2014, artificerInfusions2014, getArtificerInfusedItemLimit } from '@/rules/data/artificer-2014'
import { rulesRepository } from '@/rules/repository'
import { getRequiredSpellCount, getSpellSlots } from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import type { CharacterDraft } from '@/types/character'

function draft(level: number): CharacterDraft {
  return {
    schemaVersion: 5, id: `artificer-${level}`, ruleset: '5e-2014', createdAt: '', updatedAt: '',
    targetLevel: level, abilityMethod: 'custom', enabledSourceIds: ['tcoe-2020-index'],
    classId: 'class-2014-artificer', raceAbilityChoices: [], backgroundSkillIds: [], backgroundToolIds: [],
    languages: [], proficiencyReplacements: [], baseAbilities: { str: 8, dex: 14, con: 14, int: 16, wis: 12, cha: 10 },
    selections: [], startingEquipmentSelections: [], inventory: [], infusionAssignments: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }, adventureGold: 0, equipmentNeedsReview: false,
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
    name: '工匠测试', alignment: '', notes: '', currentStep: 'timeline',
  }
}

describe('Artificer 2014 vertical slice', () => {
  it('uses d8, Constitution/Intelligence saves and level-one casting', () => {
    expect(artificerClass2014.hitDie).toBe(8)
    expect(artificerClass2014.savingThrowAbilities).toEqual(['con', 'int'])
    expect(artificerClass2014.spellcasting?.startsAtLevel).toBe(1)
    expect(getSpellSlots(artificerClass2014.spellcasting!, 1)).toEqual([{ level: 1, count: 2 }])
  })

  it('prepares Intelligence modifier plus half level rounded up', () => {
    const config = artificerClass2014.spellcasting!
    expect(getRequiredSpellCount(draft(1), config)).toBe(4)
    expect(getRequiredSpellCount(draft(2), config)).toBe(4)
    expect(getRequiredSpellCount(draft(3), config)).toBe(5)
  })

  it.each([[1, 0], [2, 2], [5, 2], [6, 3], [10, 4], [14, 5], [18, 6], [20, 6]])(
    'level %i allows %i active infusions', (level, expected) => {
      expect(getArtificerInfusedItemLimit(level)).toBe(expected)
    },
  )

  it('uses unique recipe IDs and level-gated known-infusion checkpoints', () => {
    expect(new Set(artificerInfusions2014.map((item) => item.id)).size).toBe(artificerInfusions2014.length)
    const timeline = buildTimeline('class-2014-artificer', 20, { enabledSourceIds: ['tcoe-2020-index'] })
    expect(timeline.find((item) => item.id === 'artificer-2014-infusions-2')?.maxSelections).toBe(4)
    expect(timeline.filter((item) => item.kind === 'infusion').map((item) => item.level)).toEqual([2, 6, 10, 14, 18])
    expect(timeline.find((item) => item.kind === 'subclass')?.optionIds).toHaveLength(4)
    expect(rulesRepository.getSubclass('subclass-2014-artificer-battle-smith')).toBeDefined()
  })
})
