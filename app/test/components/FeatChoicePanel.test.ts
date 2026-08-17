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
  adventureGold: 0,
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
    await wrapper.get('input[type="search"]').setValue('战地施法者')

    expect(wrapper.text()).toContain('战地施法者 · War Caster')
    expect(wrapper.text()).toContain('需要能够施放至少一个法术')
    expect(wrapper.get('.expandable-option-card').find('.expandable-option-card__main').attributes('disabled')).toBeDefined()
  })

  it('expands a feat card to show its detailed effect without selecting it', async () => {
    const wrapper = mountPanel()
    await wrapper.get('.feat-choice__kind button:last-child').trigger('click')
    const selectCountBefore = wrapper.emitted('select')?.length ?? 0
    await wrapper.get('input[type="search"]').setValue('幸运')

    expect(wrapper.text()).toContain('幸运 · Lucky')
    expect(wrapper.text()).not.toContain('幸运点')
    await wrapper.get('.expandable-option-card__arrow').trigger('click')
    expect(wrapper.text()).toContain('幸运点')
    // 展开不产生新的选择事件
    expect(wrapper.emitted('select')?.length).toBe(selectCountBefore)
  })

  it('no longer shows the index-only badge for feats', async () => {
    const wrapper = mountPanel()
    await wrapper.get('.feat-choice__kind button:last-child').trigger('click')
    await wrapper.get('input[type="search"]').setValue('警觉')

    expect(wrapper.text()).toContain('警觉 · Alert')
    expect(wrapper.text()).not.toContain('仅索引')
  })
})
