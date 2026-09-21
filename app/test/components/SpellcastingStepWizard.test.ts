import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import SpellcastingStep from '@/views/character-builder/components/SpellcastingStep.vue'
import type { SelectionTaskFocusHandle } from '@/views/character-builder/selection-task'
import type { CharacterDraft, SpellSelections } from '@/types/character'
import { draft2024, emptySpellSelections } from '../fixtures/draft-2024'

/** 5 级法师：升级名额 14，最高 3 环；书 = 6 升级 + 2 抄录（总数 8）。 */
function wizardDraft(): CharacterDraft {
  return {
    schemaVersion: 4,
    id: 'wizard-flow',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 5,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-wizard',
    raceId: 'race-2014-human',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-acolyte',
    backgroundSkillIds: ['skill-insight', 'skill-religion'],
    backgroundToolIds: [],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    equipmentNeedsReview: false,
    spellSelections: {
      cantripIds: ['spell-2014-fire-bolt', 'spell-2014-mage-hand', 'spell-2014-ray-of-frost', 'spell-2014-minor-illusion'],
      knownSpellIds: [],
      preparedSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield', 'spell-2014-burning-hands', 'spell-2014-mage-armor', 'spell-2014-thunderwave', 'spell-2014-find-familiar', 'spell-2014-detect-magic', 'spell-2014-chromatic-orb'],
      spellbookSpellIds: [
        'spell-2014-magic-missile', 'spell-2014-shield', 'spell-2014-burning-hands', 'spell-2014-mage-armor',
        'spell-2014-thunderwave', 'spell-2014-find-familiar', 'spell-2014-scorching-ray', 'spell-2014-misty-step',
      ],
      transcribedSpellIds: ['spell-2014-scorching-ray', 'spell-2014-misty-step'],
    },
    name: '法师流程回归',
    alignment: '',
    notes: '',
    currentStep: 'spells',
  }
}

describe('法师法术步骤（缺陷回归：抄录法术不可移除、计数不含抄录）', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('法术书计数按非抄录法术数 / 升级名额显示，抄录数量另计', () => {
    const wrapper = mount(SpellcastingStep, { props: { draft: wizardDraft() } })
    expect(wrapper.text()).toContain('6 / 14（另有抄录 2）')
    expect(wrapper.text()).toContain('1环 · Find Familiar · 仪式')
    expect(wrapper.text()).toContain('1环 · Magic Missile')
    expect(wrapper.text()).not.toContain('Magic Missile · 仪式')
  })

  it('抄录法术显示「在书中（抄录）」，点击不触发移除', async () => {
    const wrapper = mount(SpellcastingStep, { props: { draft: wizardDraft() } })
    const cards = wrapper.findAll('.expandable-option-card')
    const scorchingCard = cards.find((card) => card.text().includes('灼热射线'))!
    expect(scorchingCard.text()).toContain('在书中（抄录，不可移除）')

    // 点击主按钮并推进双击判定窗口：不得发出变更（抄录不可撤销）
    const emittedBefore = wrapper.emitted('change')?.length ?? 0
    await scorchingCard.get('button[aria-pressed]').trigger('click')
    await vi.advanceTimersByTimeAsync(250)
    expect(wrapper.emitted('change')?.length ?? 0).toBe(emittedBefore)
  })

  it('升级名额未满时仍可继续写入（非抄录数 < 名额上限）', async () => {
    const wrapper = mount(SpellcastingStep, { props: { draft: wizardDraft() } })
    const cards = wrapper.findAll('.expandable-option-card')
    // 选一个未入书的 1 环法术（如睡眠术）写入
    const sleepCard = cards.find((card) => card.text().includes('睡眠术'))!
    expect(sleepCard.text()).toContain('写入')
    await sleepCard.get('button[aria-pressed]').trigger('click')
    await vi.advanceTimersByTimeAsync(250)
    const change = wrapper.emitted('change')?.[0]?.[0] as CharacterDraft['spellSelections']
    expect(change.spellbookSpellIds).toContain('spell-2014-sleep')
    expect(change.transcribedSpellIds).toEqual(['spell-2014-scorching-ray', 'spell-2014-misty-step'])
  })
})

/** 3 级塑能师：升级名额 10 道已满，额外入书名额 2 道。 */
function evoker2024Draft(): CharacterDraft {
  return draft2024({
    classId: 'class-2024-wizard',
    subclassId: 'subclass-2024-wizard-evoker',
    targetLevel: 3,
    spellSelections: {
      ...emptySpellSelections(),
      cantripIds: ['spell-2024-fire-bolt', 'spell-2024-ray-of-frost', 'spell-2024-mage-hand'],
      spellbookSpellIds: [
        'spell-2024-magic-missile', 'spell-2024-mage-armor', 'spell-2024-detect-magic', 'spell-2024-find-familiar',
        'spell-2024-comprehend-languages', 'spell-2024-shield', 'spell-2024-burning-hands', 'spell-2024-thunderwave',
        'spell-2024-chromatic-orb', 'spell-2024-misty-step',
      ],
      preparedSpellIds: ['spell-2024-magic-missile', 'spell-2024-mage-armor', 'spell-2024-detect-magic', 'spell-2024-find-familiar', 'spell-2024-shield', 'spell-2024-burning-hands'],
    },
  })
}

describe('法师法术步骤（2024 塑能学者额外入书）', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('显示子职额外入书区与名额，选择同时写入法术书', async () => {
    const wrapper = mount(SpellcastingStep, { props: { draft: evoker2024Draft() } })
    expect(wrapper.text()).toContain('子职额外入书')
    expect(wrapper.get('[data-task-id="spellbook-extra"]').text()).toContain('0/2')
    await wrapper.get('[data-task-id="spellbook-extra"]').trigger('click')
    await wrapper.findAll('button').find((button) => button.text() === '2环')!.trigger('click')

    const extraCard = wrapper.findAll('.expandable-option-card')
      .find((card) => card.text().includes('灼热射线'))
    expect(extraCard).toBeDefined()
    await extraCard?.get('button[aria-pressed]').trigger('click')
    await vi.advanceTimersByTimeAsync(300)

    const change = wrapper.emitted('change')?.at(-1)?.[0] as SpellSelections
    expect(change.spellbookSpellIds).toContain('spell-2024-scorching-ray')
    expect(change.spellbookExtraSpellIds).toEqual(['spell-2024-scorching-ray'])
  })
})

describe('法术步骤去完成聚焦出口（v1.9.1 R3-6）', () => {
  // 聚焦断言需要元素真实连到文档（happy-dom 下未挂载的元素 focus() 不更新 activeElement）
  const mountAttached = (draft: CharacterDraft) =>
    mount(SpellcastingStep, { props: { draft }, attachTo: document.body })
  const handleOf = (wrapper: ReturnType<typeof mountAttached>) =>
    wrapper.vm as unknown as SelectionTaskFocusHandle

  afterEach(() => { document.body.innerHTML = '' })

  it('切到首个未完成任务并聚焦该任务标题', async () => {
    const wrapper = mountAttached(wizardDraft())
    await wrapper.get('[data-task-id="cantrips"]').trigger('click')
    expect(wrapper.get('[data-task-id="cantrips"]').attributes('aria-selected')).toBe('true')

    await handleOf(wrapper).focusFirstIncomplete()

    expect(wrapper.get('[data-task-id="spellbook"]').attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(wrapper.get('.spellcasting-step__panel h2').element)
  })

  it('活动任务未变化时重复调用仍有聚焦反馈（R3-7）', async () => {
    const wrapper = mountAttached(wizardDraft())
    await handleOf(wrapper).focusFirstIncomplete()
    const heading = wrapper.get('.spellcasting-step__panel h2').element
    expect(document.activeElement).toBe(heading)

    ;(document.activeElement as HTMLElement | null)?.blur()
    await handleOf(wrapper).focusFirstIncomplete()
    expect(document.activeElement).toBe(heading)
  })

  it('无施法能力时没有任务目标（R3-9 不变量）', () => {
    const wrapper = mountAttached({ ...wizardDraft(), classId: 'class-2014-fighter', subclassId: undefined })
    expect(wrapper.find('[data-task-id]').exists()).toBe(false)
    expect(wrapper.text()).toContain('当前职业无需配置法术')
  })
})
