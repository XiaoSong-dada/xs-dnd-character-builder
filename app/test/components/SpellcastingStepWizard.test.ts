import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
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

describe('法术候选保留已选项与就地取消（v1.9.1 追加）', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  /** 候选列表是最后一个 ListShell（第一个是「当前已选」区块）。 */
  const candidateCards = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('.list-shell').at(-1)!.findAll('.expandable-option-card')
  const titleOf = (card: { find: (selector: string) => { text: () => string } }) =>
    card.find('.expandable-option-card__title-line strong').text()
  const badgeOf = (card: { find: (selector: string) => { text: () => string } }) =>
    card.find('.expandable-option-card__badges').text()
  /** 任务切换后环级页签默认选中「全部」（v1.9.1 追加），因此任意环级的候选都直接可见。 */
  const expectAllLevels = (wrapper: ReturnType<typeof mount>) => {
    const active = wrapper.findAll('.ui-tabs button').find((button) => button.classes().includes('ui-tabs__tab--active'))
    expect(active?.text()).toBe('全部')
  }

  it('准备法术任务：已准备法术留在候选中并可就地取消', async () => {
    const wrapper = mount(SpellcastingStep, { props: { draft: wizardDraft() } })
    await wrapper.get('[data-task-id="spells"]').trigger('click')

    const magicMissile = rulesRepository.getSpell('spell-2014-magic-missile')!.name
    const card = candidateCards(wrapper).find((item) => titleOf(item) === magicMissile)
    expect(card, '已准备法术应留在候选列表中').toBeTruthy()
    expect(badgeOf(card!)).toBe('已选')

    await card!.get('button[aria-pressed]').trigger('click')
    await vi.advanceTimersByTimeAsync(260)
    const change = wrapper.emitted('change')?.at(-1)?.[0] as SpellSelections
    expect(change.preparedSpellIds).not.toContain('spell-2014-magic-missile')
  })

  it('写入法术书任务：抄录法术在候选中标注不可移除且点击不产生变更', async () => {
    const wrapper = mount(SpellcastingStep, { props: { draft: wizardDraft() } })
    expect(wrapper.get('[data-task-id="spellbook"]').attributes('aria-selected')).toBe('true')
    expectAllLevels(wrapper)

    const scorching = rulesRepository.getSpell('spell-2014-scorching-ray')!.name
    const card = candidateCards(wrapper).find((item) => titleOf(item) === scorching)
    expect(card, '抄录法术应仍在候选列表中').toBeTruthy()
    expect(badgeOf(card!)).toBe('在书中（抄录，不可移除）')

    await card!.get('button[aria-pressed]').trigger('click')
    await vi.advanceTimersByTimeAsync(260)
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('子职额外入书任务：已在书中的候选说明原因，额外名额项可就地移除', async () => {
    let draft = evoker2024Draft()
    const wrapper = mount(SpellcastingStep, { props: { draft } })
    await wrapper.get('[data-task-id="spellbook-extra"]').trigger('click')
    expectAllLevels(wrapper)

    const burningHands = rulesRepository2024.getSpell('spell-2024-burning-hands')!.name
    const inBook = candidateCards(wrapper).find((item) => titleOf(item) === burningHands)
    expect(inBook, '已在书中的法术应留在额外入书候选中').toBeTruthy()
    expect(badgeOf(inBook!)).toBe('已在书中')
    await inBook!.get('button[aria-pressed]').trigger('click')
    await vi.advanceTimersByTimeAsync(260)
    expect(wrapper.emitted('change')).toBeUndefined()

    const scorching = rulesRepository2024.getSpell('spell-2024-scorching-ray')!.name
    const add = candidateCards(wrapper).find((item) => titleOf(item) === scorching)!
    await add.get('button[aria-pressed]').trigger('click')
    await vi.advanceTimersByTimeAsync(260)
    const added = wrapper.emitted('change')?.at(-1)?.[0] as SpellSelections
    expect(added.spellbookExtraSpellIds).toEqual(['spell-2024-scorching-ray'])
    draft = { ...draft, spellSelections: added }
    await wrapper.setProps({ draft })

    const selectedExtra = candidateCards(wrapper).find((item) => titleOf(item) === scorching)!
    expect(badgeOf(selectedExtra)).toBe('已选')
    await selectedExtra.get('button[aria-pressed]').trigger('click')
    await vi.advanceTimersByTimeAsync(260)
    const removed = wrapper.emitted('change')?.at(-1)?.[0] as SpellSelections
    expect(removed.spellbookExtraSpellIds).toEqual([])
    expect(removed.spellbookSpellIds).not.toContain('spell-2024-scorching-ray')
  })
})

describe('法术列表按环级升序（v1.9.1 追加）', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  /** 候选列表是最后一个 ListShell（「当前已选」区块存在时排在其后）。 */
  const candidateCards = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('.list-shell').at(-1)!.findAll('.expandable-option-card')
  const titleOf = (card: { find: (selector: string) => { text: () => string } }) =>
    card.find('.expandable-option-card__title-line strong').text()
  const levelOf = (name: string): number => {
    const found = rulesRepository.spells.find((item) => item.name === name)
    if (!found) throw new Error(`missing spell name ${name}`)
    return found.level
  }
  const levelsOf = (cards: ReturnType<typeof candidateCards>) => cards.map((card) => levelOf(titleOf(card)))

  it('候选列表按环级升序排列（扩表法术归位，「全部」页签下不再成块）', () => {
    const wrapper = mount(SpellcastingStep, { props: { draft: wizardDraft() } })
    const levels = levelsOf(candidateCards(wrapper))
    expect(levels.length).toBeGreaterThan(5)
    expect(levels).toEqual([...levels].sort((left, right) => left - right))
  })

  it('「当前已选」区块按环级升序，且不重排草稿存储顺序', async () => {
    const base = wizardDraft()
    const preparedSpellIds = ['spell-2014-scorching-ray', 'spell-2014-magic-missile', 'spell-2014-shield']
    const draft: CharacterDraft = { ...base, spellSelections: { ...base.spellSelections, preparedSpellIds } }
    const wrapper = mount(SpellcastingStep, { props: { draft } })
    await wrapper.get('[data-task-id="spells"]').trigger('click')

    const selectedCards = wrapper.findAll('.list-shell')[0]!.findAll('.expandable-option-card')
    expect(selectedCards).toHaveLength(3)
    const levels = levelsOf(selectedCards)
    // 乱序草稿（2 环在前）渲染为环级升序：1 环在 2 环之前
    expect(levels).toEqual([...levels].sort((left, right) => left - right))
    expect(levels[0]).toBe(1)
    expect(levels[levels.length - 1]).toBe(2)
    // 排序只作用于展示：草稿顺序不变、未产生变更事件
    expect(draft.spellSelections.preparedSpellIds).toEqual(preparedSpellIds)
    expect(wrapper.emitted('change')).toBeUndefined()
  })
})
