import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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
    adventureGold: 0,
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
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders class choices, background grants and emits a structured selection', async () => {
    const wrapper = mount(EquipmentStep, { props: { draft: createWizardDraft() } })

    expect(wrapper.text()).toContain('职业起始装备')
    expect(wrapper.text()).toContain('法术书')
    expect(wrapper.text()).toContain('背景固定装备')
    expect(wrapper.text()).toContain('起始金币 10 GP')

    const quarterstaff = wrapper.findAll('button').find((button) => button.text().includes('长棍'))
    expect(quarterstaff).toBeDefined()
    await quarterstaff!.trigger('click')
    // 单击选择经 250ms 双击判定窗口后 emit
    await vi.advanceTimersByTimeAsync(250)

    const emitted = wrapper.emitted('change')
    expect(emitted).toHaveLength(1)
    expect(emitted?.[0]?.[0]).toContainEqual({
      groupId: 'wizard-weapon',
      optionId: 'quarterstaff',
      pickedItemIds: [],
    })
  })

  it('分组选项展开显示选项包含的装备清单，pick 行条目展开显示装备详情', async () => {
    const clericDraft: CharacterDraft = {
      ...createWizardDraft(),
      id: 'equipment-cleric',
      classId: 'class-2014-cleric',
    }
    const state = buildStartingEquipmentState(clericDraft)
    let draft: CharacterDraft = { ...clericDraft, inventory: state.inventory, currency: state.currency }
    const wrapper = mount(EquipmentStep, { props: { draft } })

    // 分组选项卡片：轻弩选项展开显示"装备详情"标题与装备清单（轻弩 + 20 弩矢）
    const crossbowCard = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('轻弩'))
    expect(crossbowCard).toBeTruthy()
    await crossbowCard!.find('.expandable-option-card__arrow').trigger('click')
    expect(crossbowCard!.text()).toContain('装备详情')

    // 选择带 pick 的"任意一件简易武器"选项（受控回写），pick 行出现具体装备条目
    const simpleWeaponCard = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('任意一件简易武器'))
    expect(simpleWeaponCard).toBeTruthy()
    await simpleWeaponCard!.find('.expandable-option-card__main').trigger('click')
    await vi.advanceTimersByTimeAsync(250)
    const changes = wrapper.emitted('change')
    const latest = changes?.[changes.length - 1]?.[0] as CharacterDraft['startingEquipmentSelections']
    draft = { ...draft, startingEquipmentSelections: [...latest] }
    await wrapper.setProps({ draft })

    const pickCards = wrapper.findAll('.expandable-option-card').filter((card) => card.find('.equipment-step__qty').exists())
    expect(pickCards.length).toBeGreaterThan(0)
    // 展开第一件 pick 装备，可见伤害/用途详情
    await pickCards[0].find('.expandable-option-card__arrow').trigger('click')
    expect(pickCards[0].text()).toContain('装备详情')
    expect(pickCards[0].find('.expandable-option-card__growth').exists()).toBe(true)
  })
})
