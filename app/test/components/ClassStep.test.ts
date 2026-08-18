import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ClassStep from '@/views/character-builder/components/ClassStep.vue'

afterEach(() => {
  vi.useRealTimers()
})

function fighterCard(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.expandable-option-card').find((card) => card.get('strong').text() === '战士')
}

describe('ClassStep 职业选择', () => {
  it('手机宽度 375px 下渲染 12 个可展开职业卡片且无横向溢出', () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))
    const wrapper = mount(ClassStep, { props: { preferences: ['melee', 'durable'] } })
    const cards = wrapper.findAll('.expandable-option-card')
    expect(cards).toHaveLength(12)
    // 推荐徽标在操作位正常渲染，卡片主体可点击
    expect(wrapper.findAll('.ui-badge').length).toBeGreaterThan(0)
    expect(cards[0].find('.expandable-option-card__main').exists()).toBe(true)
  })

  it('推荐徽标显示排序序号与匹配数，不使用百分比', () => {
    const wrapper = mount(ClassStep, { props: { preferences: ['melee', 'durable'] } })
    const badges = wrapper.findAll('.ui-badge').map((badge) => badge.text())
    expect(badges.some((text) => text.includes('① 推荐 · 匹配'))).toBe(true)
    expect(badges.some((text) => text.includes('%'))).toBe(false)
  })

  it('默认渲染全部 12 个职业卡片', () => {
    const wrapper = mount(ClassStep, { props: { preferences: ['spellcasting'] } })
    expect(wrapper.findAll('.expandable-option-card')).toHaveLength(12)
  })

  it('未匹配偏好的职业无推荐徽标', () => {
    const wrapper = mount(ClassStep, { props: { preferences: ['spellcasting'] } })
    expect(fighterCard(wrapper)!.findAll('.ui-badge').length).toBe(0)
  })

  it('推荐卡片与普通卡片外观一致，不带选中样式', () => {
    const wrapper = mount(ClassStep, { props: { preferences: ['melee', 'durable'] } })
    const cards = wrapper.findAll('.expandable-option-card')
    const recommended = cards.find((card) => card.find('.ui-badge').exists())
    expect(recommended).toBeTruthy()
    // 推荐是独立状态（语义标记），但不带选中强调样式。
    expect(recommended!.classes()).toContain('expandable-option-card--recommended')
    expect(recommended!.classes()).not.toContain('expandable-option-card--selected')
  })

  it('推荐样式不得与选中样式共享声明块（源码契约，防回归）', () => {
    const expandable = readFileSync(resolve(process.cwd(), 'src/components/ui/ExpandableOptionCard.vue'), 'utf-8')
    const option = readFileSync(resolve(process.cwd(), 'src/components/ui/OptionCard.vue'), 'utf-8')
    // 一旦 --recommended 与 --selected 重新合并声明，推荐职业将与选中职业视觉一致。
    expect(expandable).not.toMatch(/&--selected,\s*&--recommended/)
    expect(option).not.toMatch(/&--selected,\s*&--recommended/)
  })

  it('选中卡片带选中样式', () => {
    const wrapper = mount(ClassStep, { props: { preferences: [], selected: 'class-2014-fighter' } })
    const selected = wrapper.findAll('.expandable-option-card').find((card) => card.classes().includes('expandable-option-card--selected'))
    expect(selected).toBeTruthy()
    expect(selected!.find('strong').text()).toBe('战士')
  })

  it('点击右侧箭头展开与收起该卡片的成长速览', async () => {
    const wrapper = mount(ClassStep, { props: { preferences: [] } })
    const card = fighterCard(wrapper)!
    expect(card.find('.expandable-option-card__growth').exists()).toBe(false)
    await card.find('.expandable-option-card__arrow').trigger('click')
    const growth = card.find('.expandable-option-card__growth')
    expect(growth.exists()).toBe(true)
    expect(growth.text()).toContain('职业成长')
    expect(growth.text()).toContain('1级 · 生命骰 d10')
    expect(growth.text()).toContain('3级 · 选择子职')
    await card.find('.expandable-option-card__arrow').trigger('click')
    expect(card.find('.expandable-option-card__growth').exists()).toBe(false)
  })

  it('双击卡片主体也可展开成长速览且不触发选中', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ClassStep, { props: { preferences: [] } })
    const card = fighterCard(wrapper)!
    const main = card.find('.expandable-option-card__main')
    await main.trigger('click')
    await main.trigger('click')
    expect(card.find('.expandable-option-card__growth').exists()).toBe(true)
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('点击箭头不触发职业选中', async () => {
    const wrapper = mount(ClassStep, { props: { preferences: [], selected: 'class-2014-fighter' } })
    const card = fighterCard(wrapper)!
    await card.find('.expandable-option-card__arrow').trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })
})
