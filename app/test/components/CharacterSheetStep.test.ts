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

  it('shows subclass features in the features tab once a subclass is selected', async () => {
    const clericDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-cleric',
      subclassId: 'subclass-2014-cleric-life',
      targetLevel: 3,
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: clericDraft, derived: deriveCharacter(clericDraft) },
    })

    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('子职特性 · 生命领域')
    expect(wrapper.text()).toContain('领域法术')
    expect(wrapper.text()).toContain('生命引导者')
    expect(wrapper.text()).toContain('仅索引 · 未核验')
    expect(wrapper.text()).not.toContain('至高治疗')

    const text = wrapper.text()
    expect(text.indexOf('豁免')).toBeLessThan(text.indexOf('技能'))
    expect(text.indexOf('技能')).toBeLessThan(text.indexOf('子职特性'))
  })

  it('shows an empty hint in the features tab when no subclass is selected', async () => {
    const wrapper = mount(CharacterSheetStep, {
      props: { draft, derived: deriveCharacter(draft) },
    })

    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('尚未选择子职')
  })

  it('shows the empty feature hint when the subclass has no features at the current level', async () => {
    const lowLevelDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-fighter',
      subclassId: 'subclass-2014-fighter-battle-master',
      targetLevel: 1,
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: lowLevelDraft, derived: deriveCharacter(lowLevelDraft) },
    })

    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('该子职在当前等级暂无已登记特性')
  })
})
