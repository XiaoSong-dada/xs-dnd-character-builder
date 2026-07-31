import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import type { CharacterDraft } from '@/types/character'
import CharacterSheetStep from '@/views/character-builder/components/CharacterSheetStep.vue'

const draft: CharacterDraft = {
  schemaVersion: 3,
  id: 'character-sheet-labels',
  ruleset: '5e-2014',
  createdAt: '',
  updatedAt: '',
  targetLevel: 4,
  abilityMethod: 'standard-array',
  preferences: [],
  classId: 'class-2014-fighter',
  backgroundId: 'background-2014-soldier',
  raceId: 'race-2014-half-orc',
  raceAbilityChoices: [],
  backgroundSkillIds: ['skill-athletics', 'skill-intimidation'],
  backgroundToolIds: [],
  languages: [],
  proficiencyReplacements: [],
  baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
  selections: [],
  startingEquipmentSelections: [],
  inventory: [],
  currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  equipmentNeedsReview: false,
  spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
  name: '测试角色',
  alignment: '',
  notes: '',
  currentStep: 'sheet',
}

describe('CharacterSheetStep', () => {
  it('uses Chinese labels for abilities, saving throws, and skills', async () => {
    const wrapper = mount(CharacterSheetStep, {
      props: { draft, derived: deriveCharacter(draft) },
    })

    expect(wrapper.text()).toContain('力量')
    expect(wrapper.text()).not.toContain('STR')

    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('体操')
    expect(wrapper.text()).toContain('驯兽')
    expect(wrapper.text()).toContain('奥秘')
    expect(wrapper.text()).not.toMatch(/\b(?:STR|DEX|CON|INT|WIS|CHA)\b/)
    expect(wrapper.text()).not.toContain('acrobatics')
    expect(wrapper.text()).not.toContain('animal-handling')
    expect(wrapper.text()).not.toContain('arcana')
  })
})
