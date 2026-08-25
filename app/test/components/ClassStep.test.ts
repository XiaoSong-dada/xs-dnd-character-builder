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
    expect(cards.map((card) => card.get('strong').text())).toContain('工匠')
    expect(wrapper.text()).not.toContain('推荐')
  })

  it('关闭 TCoE 后隐藏工匠但保留核心职业', () => {
    const wrapper = mount(ClassStep, { props: { enabledSourceIds: [] } })
    expect(wrapper.findAll('.expandable-option-card')).toHaveLength(12)
    expect(wrapper.text()).not.toContain('工匠')
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
