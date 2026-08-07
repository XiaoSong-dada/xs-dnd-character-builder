import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ClassStep from '@/views/character-builder/components/ClassStep.vue'

function fighterCard(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.class-option-card').find((card) => card.get('strong').text() === '战士')
}

describe('ClassStep 职业选择', () => {
  it('推荐徽标显示排序序号与匹配数，不使用百分比', () => {
    const wrapper = mount(ClassStep, { props: { preferences: ['melee', 'durable'] } })
    const badges = wrapper.findAll('.ui-badge').map((badge) => badge.text())
    expect(badges.some((text) => text.includes('① 推荐 · 匹配'))).toBe(true)
    expect(badges.some((text) => text.includes('%'))).toBe(false)
  })

  it('默认渲染全部 12 个职业卡片', () => {
    const wrapper = mount(ClassStep, { props: { preferences: ['spellcasting'] } })
    expect(wrapper.findAll('.class-option-card')).toHaveLength(12)
  })

  it('未匹配偏好的职业无推荐徽标', () => {
    const wrapper = mount(ClassStep, { props: { preferences: ['spellcasting'] } })
    expect(fighterCard(wrapper)!.findAll('.ui-badge').length).toBe(0)
  })

  it('推荐卡片与普通卡片外观一致，不带选中样式', () => {
    const wrapper = mount(ClassStep, { props: { preferences: ['melee', 'durable'] } })
    const cards = wrapper.findAll('.class-option-card')
    const recommended = cards.find((card) => card.find('.ui-badge').exists())
    expect(recommended).toBeTruthy()
    expect(recommended!.classes()).not.toContain('class-option-card--selected')
  })

  it('选中卡片带选中样式', () => {
    const wrapper = mount(ClassStep, { props: { preferences: [], selected: 'class-2014-fighter' } })
    const selected = wrapper.findAll('.class-option-card').find((card) => card.classes().includes('class-option-card--selected'))
    expect(selected).toBeTruthy()
    expect(selected!.find('strong').text()).toBe('战士')
  })

  it('点击右侧箭头展开与收起该卡片的成长速览', async () => {
    const wrapper = mount(ClassStep, { props: { preferences: [] } })
    const card = fighterCard(wrapper)!
    expect(card.find('.class-option-card__growth').exists()).toBe(false)
    await card.find('.class-option-card__arrow').trigger('click')
    const growth = card.find('.class-option-card__growth')
    expect(growth.exists()).toBe(true)
    expect(growth.text()).toContain('战士1—20级成长')
    expect(growth.text()).toContain('1级 · 生命骰 d10')
    expect(growth.text()).toContain('3级 · 选择子职')
    await card.find('.class-option-card__arrow').trigger('click')
    expect(card.find('.class-option-card__growth').exists()).toBe(false)
  })

  it('双击卡片主体也可展开成长速览', async () => {
    const wrapper = mount(ClassStep, { props: { preferences: [] } })
    const card = fighterCard(wrapper)!
    await card.find('.class-option-card__main').trigger('dblclick')
    expect(card.find('.class-option-card__growth').exists()).toBe(true)
  })

  it('点击箭头不触发职业选中', async () => {
    const wrapper = mount(ClassStep, { props: { preferences: [], selected: 'class-2014-fighter' } })
    const card = fighterCard(wrapper)!
    await card.find('.class-option-card__arrow').trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })
})
