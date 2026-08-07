import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import TimelineStep from '@/views/character-builder/components/TimelineStep.vue'
import type { CharacterDraft } from '@/types/character'

function bardDraft(): CharacterDraft {
  return {
    schemaVersion: 3,
    id: 'timeline-test',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 3,
    abilityMethod: 'standard-array',
    preferences: [],
    classId: 'class-2014-bard',
    raceId: 'race-2014-half-elf',
    backgroundId: 'background-2014-entertainer',
    raceAbilityChoices: [],
    backgroundSkillIds: ['skill-acrobatics', 'skill-performance'],
    backgroundToolIds: [],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
    selections: [
      { checkpointId: 'bard-2014-skills-1', optionIds: ['skill-insight', 'skill-history', 'skill-persuasion'], confirmedAt: '' },
      { checkpointId: 'bard-2014-tool-1', optionIds: ['tool-musical-instrument'], confirmedAt: '' },
    ],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    equipmentNeedsReview: false,
    name: '测试',
    alignment: '',
    notes: '',
    currentStep: 'timeline',
  }
}

function mountStep(draft: CharacterDraft) {
  return mount(TimelineStep, {
    props: {
      classId: draft.classId ?? 'class-2014-bard',
      targetLevel: draft.targetLevel,
      backgroundSkillIds: draft.backgroundSkillIds,
      selections: draft.selections,
      draft,
    },
  })
}

function optionCard(wrapper: ReturnType<typeof mountStep>, name: string) {
  return wrapper.findAll('.option-card').find((card) => card.text().includes(name))
}

describe('TimelineStep 专精选择', () => {
  it('锁定未熟练的技能并显示提示，熟练技能与背景技能保持可选', () => {
    const wrapper = mountStep(bardDraft())

    // 欺瞒不在职业技能（洞悉/历史/游说）也不在背景技能（体操/表演）中
    const deception = optionCard(wrapper, '欺瞒')
    expect(deception?.attributes('disabled')).toBeDefined()
    expect(deception?.text()).toContain('需先获得该技能熟练')

    // 洞悉是1级职业技能，可专精
    const insight = optionCard(wrapper, '洞悉')
    expect(insight?.attributes('disabled')).toBeUndefined()

    // 体操是背景技能，可专精
    const acrobatics = optionCard(wrapper, '体操')
    expect(acrobatics?.attributes('disabled')).toBeUndefined()
  })

  it('点击未熟练技能不会触发选择事件', async () => {
    const wrapper = mountStep(bardDraft())

    const deception = optionCard(wrapper, '欺瞒')
    await deception?.trigger('click')

    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('点击已熟练技能可以加入专精选择', async () => {
    const wrapper = mountStep(bardDraft())

    const insight = optionCard(wrapper, '洞悉')
    await insight?.trigger('click')

    expect(wrapper.emitted('select')?.[0]).toEqual(['bard-2014-expertise-3', ['skill-insight']])
  })

  it('已选中的未熟练技能可以点击取消', async () => {
    const d = bardDraft()
    d.selections.push({ checkpointId: 'bard-2014-expertise-3', optionIds: ['skill-deception'], confirmedAt: '' })
    const wrapper = mountStep(d)

    const deception = optionCard(wrapper, '欺瞒')
    await deception?.trigger('click')

    expect(wrapper.emitted('select')?.[0]).toEqual(['bard-2014-expertise-3', []])
  })
})
