import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import FeatChoicePanel from '@/views/character-builder/components/FeatChoicePanel.vue'
import type { CharacterDraft } from '@/types/character'

const draft: CharacterDraft = {
  schemaVersion: 3,
  id: 'feat-panel',
  ruleset: '5e-2014',
  createdAt: '',
  updatedAt: '',
  targetLevel: 4,
  abilityMethod: 'standard-array',
  preferences: [],
  classId: 'class-2014-fighter',
  raceAbilityChoices: [],
  backgroundSkillIds: [],
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
  name: '',
  alignment: '',
  notes: '',
  currentStep: 'timeline',
}

function mountPanel() {
  return mount(FeatChoicePanel, {
    props: {
      checkpointId: 'fighter-2014-asi-4',
      checkpointLevel: 4,
      draft,
      allowAbilityImprovement: true,
    },
  })
}

describe('FeatChoicePanel', () => {
  it('allows any one ability +2 or two different abilities +1', async () => {
    const wrapper = mountPanel()

    await wrapper.get('button[aria-label="选择魅力进行属性提升"]').trigger('click')
    expect(wrapper.emitted('select')?.at(-1)).toEqual(['asi-cha-2'])

    await wrapper.get('.feat-choice__modes button:last-child').trigger('click')
    await wrapper.get('button[aria-label="选择敏捷进行属性提升"]').trigger('click')
    expect(wrapper.text()).toContain('已分配 1 / 2 点')
    await wrapper.get('button[aria-label="选择感知进行属性提升"]').trigger('click')
    expect(wrapper.emitted('select')?.at(-1)).toEqual(['asi-dex-wis'])
  })

  it('searches the full catalog and disables unmet prerequisites with a reason', async () => {
    const wrapper = mountPanel()
    await wrapper.get('.feat-choice__kind button:last-child').trigger('click')
    await wrapper.get('input[aria-label="搜索专长"]').setValue('战地施法者')

    expect(wrapper.text()).toContain('战地施法者 · War Caster')
    expect(wrapper.text()).toContain('需要能够施放至少一个法术')
    expect(wrapper.get('.option-card').attributes('disabled')).toBeDefined()
  })
})
