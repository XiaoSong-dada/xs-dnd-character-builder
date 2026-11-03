import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import SpellPickerList from '@/components/spell/SpellPickerList.vue'
import type { SpellRule } from '@/types/rules'

function makeSpell(overrides: Partial<SpellRule> & Pick<SpellRule, 'id' | 'name'>): SpellRule {
  return {
    ruleset: '5e-2014',
    englishName: '',
    level: 0,
    ritual: false,
    classIds: [],
    summary: '',
    description: '',
    status: 'selectable',
    sourceIds: [],
    ...overrides,
  }
}

const spells = [
  makeSpell({
    id: 'fire-bolt',
    name: '火焰箭',
    englishName: 'Fire Bolt',
    level: 0,
    school: '塑能',
    description: '向目标投掷一团火焰。',
  }),
  makeSpell({
    id: 'fireball',
    name: '火球术',
    englishName: 'Fireball',
    level: 3,
    school: '塑能',
    description: '以目标点为中心爆开火球。',
  }),
  makeSpell({
    id: 'cure-wounds',
    name: '治疗伤口',
    englishName: 'Cure Wounds',
    level: 1,
    school: '防护',
    description: '触碰生物并恢复生命值。',
  }),
]

afterEach(() => {
  vi.useRealTimers()
})

describe('SpellPickerList', () => {
  it('渲染全部法术与元信息', () => {
    const wrapper = mount(SpellPickerList, {
      props: { spells, selectedIds: [] },
    })

    expect(wrapper.findAll('.expandable-option-card')).toHaveLength(3)
    expect(wrapper.text()).toContain('戏法 · 塑能 · Fire Bolt')
    expect(wrapper.text()).toContain('3 环 · 塑能 · Fireball')
  })

  it('按关键词过滤列表', async () => {
    const wrapper = mount(SpellPickerList, {
      props: { spells, selectedIds: [] },
    })

    await wrapper.get('input[type="search"]').setValue('火焰')

    expect(wrapper.findAll('.expandable-option-card')).toHaveLength(1)
    expect(wrapper.text()).toContain('火焰箭')
  })

  it('按环级页签过滤列表', async () => {
    const wrapper = mount(SpellPickerList, {
      props: { spells, selectedIds: [] },
    })

    const cantripTab = wrapper
      .findAll('[role="tab"]')
      .find((tab) => tab.text() === '戏法')
    expect(cantripTab).toBeDefined()

    await cantripTab!.trigger('click')

    expect(wrapper.findAll('.expandable-option-card')).toHaveLength(1)
    expect(wrapper.text()).toContain('火焰箭')
  })

  it('按学派筛选列表', async () => {
    const wrapper = mount(SpellPickerList, {
      props: { spells, selectedIds: [] },
    })

    await wrapper.get('select[aria-label="按学派筛选"]').setValue('防护')

    expect(wrapper.findAll('.expandable-option-card')).toHaveLength(1)
    expect(wrapper.text()).toContain('治疗伤口')
  })

  it('多选模式点击卡片后发出 toggle 并显示已选状态', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SpellPickerList, {
      props: { spells, selectedIds: [], multiple: true },
    })

    await wrapper.get('.expandable-option-card__main').trigger('click')
    await vi.advanceTimersByTimeAsync(300)

    expect(wrapper.emitted('toggle')).toEqual([['fire-bolt']])

    await wrapper.setProps({ selectedIds: ['fire-bolt'] })

    const selectedCard = wrapper.findAll('.expandable-option-card')[0]
    expect(selectedCard.classes()).toContain('expandable-option-card--selected')
    expect(selectedCard.find('.expandable-option-card__main').attributes('aria-pressed')).toBe('true')
    expect(selectedCard.text()).toContain('已选')
  })

  it('单选模式显示 radio 标记', () => {
    const wrapper = mount(SpellPickerList, {
      props: { spells, selectedIds: ['fire-bolt'] },
    })

    expect(wrapper.findAll('.expandable-option-card__mark')).toHaveLength(3)
    expect(
      wrapper.findAll('.expandable-option-card')[0].find('.expandable-option-card__main').attributes('aria-pressed'),
    ).toBe('true')
  })

  it('归档法术锁定、不可选择，但仍可展开', async () => {
    vi.useFakeTimers()
    const archived = makeSpell({
      id: 'custom-spell-archived',
      name: '归档法术',
      description: '这条效果不会被新授予。',
      status: 'unavailable',
    })
    const wrapper = mount(SpellPickerList, {
      props: { spells: [archived], selectedIds: [], multiple: true },
    })

    const card = wrapper.get('.expandable-option-card')
    expect(card.classes()).toContain('expandable-option-card--locked')
    expect(card.text()).toContain('已归档')

    const main = card.get('.expandable-option-card__main')
    expect(main.attributes('disabled')).toBeDefined()

    await main.trigger('click')
    await vi.advanceTimersByTimeAsync(300)
    expect(wrapper.emitted('toggle')).toBeUndefined()

    await card.get('.expandable-option-card__arrow').trigger('click')
    expect(card.text()).toContain('这条效果不会被新授予。')
  })

  it('无匹配结果时显示空态文案', async () => {
    const wrapper = mount(SpellPickerList, {
      props: { spells, selectedIds: [], emptyHint: '没有匹配的法术。' },
    })

    await wrapper.get('input[type="search"]').setValue('不存在')

    expect(wrapper.get('.list-shell__empty').text()).toBe('没有匹配的法术。')
  })
})
