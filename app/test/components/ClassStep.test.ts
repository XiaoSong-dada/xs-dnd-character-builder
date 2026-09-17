import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ClassStep from '@/views/character-builder/components/ClassStep.vue'

afterEach(() => vi.useRealTimers())

function fighterCard(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.expandable-option-card').find((card) => card.get('strong').text() === '战士')
}

describe('ClassStep 职业选择', () => {
  it('手机宽度 375px 下按稳定顺序渲染全部 13 个职业且不显示推荐', () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))
    const wrapper = mount(ClassStep)
    const cards = wrapper.findAll('.expandable-option-card')
    expect(cards).toHaveLength(13)
    expect(cards.map((card) => card.get('strong').text())).toContain('奇械师')
    expect(wrapper.text()).not.toContain('推荐')
  })

  it('关闭 TCoE 后隐藏奇械师但保留核心职业', () => {
    const wrapper = mount(ClassStep, { props: { enabledSourceIds: [] } })
    expect(wrapper.findAll('.expandable-option-card')).toHaveLength(12)
    expect(wrapper.text()).not.toContain('奇械师')
    expect(wrapper.text()).toContain('战士')
  })

  it('选中卡片带选中样式', () => {
    const wrapper = mount(ClassStep, { props: { selected: 'class-2014-fighter' } })
    expect(wrapper.find('.expandable-option-card--selected').get('strong').text()).toBe('战士')
  })

  it('点击箭头展开与收起成长速览且不触发选中', async () => {
    const wrapper = mount(ClassStep)
    const card = fighterCard(wrapper)!
    await card.find('.expandable-option-card__arrow').trigger('click')
    expect(card.text()).toContain('1级 · 生命骰 d10')
    expect(card.text()).toContain('3级 · 选择子职')
    expect(wrapper.emitted('select')).toBeUndefined()
    await card.find('.expandable-option-card__arrow').trigger('click')
    expect(card.find('.expandable-option-card__growth').exists()).toBe(false)
  })

  it('展开区展示职业详情（介绍 + 主要属性 + 生命骰 + 豁免）且位于职业成长之前', async () => {
    const wrapper = mount(ClassStep)
    const card = fighterCard(wrapper)!
    await card.find('.expandable-option-card__arrow').trigger('click')

    const panel = card.get('.expandable-option-card__growth')
    // 面板标题为「职业详情」，职业成长作为内部小标题位于其后
    expect(panel.findAll('strong').map((item) => item.text())).toEqual(['职业详情', '职业成长'])
    expect(panel.get('.class-step__intro').text()).toContain('武器与护甲的全能专家')
    const facts = panel.get('.class-step__facts').findAll('div').map((row) => row.text())
    expect(facts).toEqual(['主要属性力量、敏捷', '生命骰d10', '豁免熟练力量、体质'])
    // 职业成长仍在同一展开区内
    expect(panel.text()).toContain('1级 · 生命骰 d10')
  })

  it('每个职业都有职业介绍（无介绍时不渲染空段落）', async () => {
    const wrapper = mount(ClassStep)
    expect(wrapper.findAll('.class-step__intro')).toHaveLength(0)
    for (const card of wrapper.findAll('.expandable-option-card')) {
      await card.find('.expandable-option-card__arrow').trigger('click')
    }
    expect(wrapper.findAll('.class-step__intro')).toHaveLength(13)
    expect(wrapper.findAll('.class-step__intro').every((item) => item.text().trim().length > 0)).toBe(true)
  })

  it('双击卡片主体只展开成长速览', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ClassStep)
    const card = fighterCard(wrapper)!
    await card.find('.expandable-option-card__main').trigger('click')
    await card.find('.expandable-option-card__main').trigger('click')
    expect(card.find('.expandable-option-card__growth').exists()).toBe(true)
    expect(wrapper.emitted('select')).toBeUndefined()
  })
})
