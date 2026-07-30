import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { buildStartingEquipmentState } from '@/rules/starting-equipment'
import type { CharacterDraft } from '@/types/character'
import EquipmentStep from '@/views/character-builder/components/EquipmentStep.vue'

function createWizardDraft(): CharacterDraft {
  const draft: CharacterDraft = {
    schemaVersion: 3,
    id: 'equipment-component',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 1,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-wizard',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-sage',
    backgroundSkillIds: ['skill-arcana', 'skill-history'],
    backgroundToolIds: [],
    languages: ['精灵语', '矮人语'],
    proficiencyReplacements: [],
    baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    equipmentNeedsReview: false,
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
    name: '',
    alignment: '',
    notes: '',
    currentStep: 'equipment',
  }
  const state = buildStartingEquipmentState(draft)
  return { ...draft, inventory: state.inventory, currency: state.currency }
}

describe('EquipmentStep', () => {
  it('renders class choices, background grants and emits a structured selection', async () => {
    const wrapper = mount(EquipmentStep, { props: { draft: createWizardDraft() } })

    expect(wrapper.text()).toContain('职业起始装备')
    expect(wrapper.text()).toContain('法术书')
    expect(wrapper.text()).toContain('背景固定装备')
    expect(wrapper.text()).toContain('起始金币 10 GP')

    const quarterstaff = wrapper.findAll('button').find((button) => button.text().includes('长棍'))
    expect(quarterstaff).toBeDefined()
    await quarterstaff!.trigger('click')

    const emitted = wrapper.emitted('change')
    expect(emitted).toHaveLength(1)
    expect(emitted?.[0]?.[0]).toContainEqual({
      groupId: 'wizard-weapon',
      optionId: 'quarterstaff',
      pickedItemIds: [],
    })
  })
})
