import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import FeatChoicePanel from '@/views/character-builder/components/FeatChoicePanel.vue'
import type { CharacterDraft } from '@/types/character'
import { draft2024 } from '../fixtures/draft-2024'

const draft: CharacterDraft = {
  schemaVersion: 4,
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
  spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
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

describe('FeatChoicePanel 2024 等级前置（B09-08）', () => {
  function mountModern() {
    return mount(FeatChoicePanel, {
      props: {
        checkpointId: 'class-2024-fighter-feat-4',
        checkpointLevel: 4,
        draft: draft2024({ classId: 'class-2024-fighter', targetLevel: 5 }),
        allowAbilityImprovement: false,
      },
    })
  }

  it('5 级角色在 4 级节点可选 4 级专长，19 级恩惠仍锁定', async () => {
    const wrapper = mountModern()
    await wrapper.get('input[type="search"]').setValue('重甲运用')
    const armored = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('重甲运用'))
    expect(armored).toBeTruthy()
    expect(armored!.classes()).not.toContain('expandable-option-card--locked')
    expect(armored!.text()).not.toContain('不可选')

    await wrapper.get('input[type="search"]').setValue('英勇战斗之恩惠')
    const boon = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('英勇战斗之恩惠'))
    expect(boon).toBeTruthy()
    expect(boon!.text()).toContain('需要19级')
  })
})

describe('FeatChoicePanel 不可复选专长重复选择（问题 #29）', () => {
  function mountAt(checkpointId: string, checkpointLevel: number, draft: CharacterDraft) {
    return mount(FeatChoicePanel, {
      props: { checkpointId, checkpointLevel, draft, allowAbilityImprovement: false },
    })
  }

  const toughAtFour: CharacterDraft = draft2024({
    targetLevel: 8,
    classId: 'class-2024-fighter',
    selections: [{ checkpointId: 'class-2024-fighter-feat-4', optionIds: ['feat-2024-tough'], confirmedAt: '' }],
  })

  it('4 级已取得的专长在 8 级节点被禁用并提示来源', async () => {
    const wrapper = mountAt('class-2024-fighter-feat-8', 8, toughAtFour)
    await wrapper.get('input[type="search"]').setValue('健壮')
    const card = wrapper.findAll('.expandable-option-card').find((item) => item.text().includes('健壮 · Tough'))
    expect(card).toBeTruthy()
    expect(card!.classes()).toContain('expandable-option-card--locked')
    expect(card!.text()).toContain('已获得（4级属性提升或专长）')
  })

  it('回看 4 级原节点时已选项仍正常显示且可选', async () => {
    const wrapper = mountAt('class-2024-fighter-feat-4', 4, toughAtFour)
    await wrapper.get('input[type="search"]').setValue('健壮')
    const card = wrapper.findAll('.expandable-option-card').find((item) => item.text().includes('健壮 · Tough'))
    expect(card).toBeTruthy()
    expect(card!.classes()).not.toContain('expandable-option-card--locked')
    expect(card!.find('.expandable-option-card__main').attributes('disabled')).toBeUndefined()
    expect(card!.text()).not.toContain('已获得')
  })

  it('可复选专长在后续节点仍可选择', async () => {
    const draft = draft2024({
      targetLevel: 8,
      classId: 'class-2024-fighter',
      selections: [{ checkpointId: 'class-2024-fighter-feat-4', optionIds: ['feat-2024-ability-score-improvement'], confirmedAt: '' }],
    })
    const wrapper = mountAt('class-2024-fighter-feat-8', 8, draft)
    await wrapper.get('input[type="search"]').setValue('属性值提升')
    const card = wrapper.findAll('.expandable-option-card').find((item) => item.text().includes('属性值提升'))
    expect(card).toBeTruthy()
    expect(card!.classes()).not.toContain('expandable-option-card--locked')
  })
})
