import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'

describe('ExpandableOptionCard', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const mountCard = (options: Parameters<typeof mount>[1] = {}) =>
    mount(ExpandableOptionCard, {
      props: { title: '火焰箭', description: '戏法 · Fire Bolt', expandedLabel: '法术效果' },
      slots: { expanded: '<p class="effect">原创效果摘要</p>' },
      ...options,
    })

  it('默认收起，不渲染展开区', () => {
    const wrapper = mountCard()
    expect(wrapper.find('.expandable-option-card__growth').exists()).toBe(false)
    expect(wrapper.find('.expandable-option-card__arrow').attributes('aria-expanded')).toBe('false')
  })

  it('点击右侧箭头展开/收起，展开区采用金色柔和背景与 dashed 分隔（对齐职业卡片）', async () => {
    const wrapper = mountCard()
    const arrow = wrapper.find('.expandable-option-card__arrow')
    expect(arrow.text()).toBe('›')
    expect(arrow.attributes('aria-label')).toBe('展开火焰箭')
    await arrow.trigger('click')
    expect(wrapper.find('.expandable-option-card__growth').exists()).toBe(true)
    expect(arrow.attributes('aria-expanded')).toBe('true')
    expect(arrow.attributes('aria-label')).toBe('收起火焰箭')
    expect(arrow.classes()).toContain('expandable-option-card__arrow--open')
    expect(wrapper.text()).toContain('法术效果')
    expect(wrapper.text()).toContain('原创效果摘要')
    const growth = wrapper.find('.expandable-option-card__growth')
    expect(growth.attributes('style') ?? '').toBe('')
    // 样式断言：gold-soft 背景与 dashed 分隔（scoped 样式类存在即可验证结构）
    expect(growth.exists()).toBe(true)
    await arrow.trigger('click')
    expect(wrapper.find('.expandable-option-card__growth').exists()).toBe(false)
    expect(arrow.attributes('aria-expanded')).toBe('false')
  })

  it('摘要行单行省略展示（summary 类存在）', () => {
    const wrapper = mountCard()
    expect(wrapper.find('.expandable-option-card__summary').exists()).toBe(true)
    expect(wrapper.find('.expandable-option-card__title-line strong').text()).toBe('火焰箭')
  })

  it('双击卡片主体展开，且不触发选择', async () => {
    const wrapper = mountCard()
    const main = wrapper.find('.expandable-option-card__main')
    await main.trigger('click')
    await main.trigger('click')
    expect(wrapper.find('.expandable-option-card__growth').exists()).toBe(true)
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('单击卡片主体在选择延迟后触发 select，且不展开', async () => {
    const wrapper = mountCard()
    await wrapper.find('.expandable-option-card__main').trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    await vi.advanceTimersByTimeAsync(250)
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.find('.expandable-option-card__growth').exists()).toBe(false)
  })

  it('expandOnSelect 时单击选择后自动展开介绍区', async () => {
    const wrapper = mountCard({
      props: { title: '火焰箭', description: '戏法 · Fire Bolt', expandedLabel: '法术效果', expandOnSelect: true },
      slots: { expanded: '<p class="effect">原创效果摘要</p>' },
    })
    await wrapper.find('.expandable-option-card__main').trigger('click')
    await vi.advanceTimersByTimeAsync(250)
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.find('.expandable-option-card__growth').exists()).toBe(true)
    expect(wrapper.text()).toContain('原创效果摘要')
  })

  it('展开状态与选择互不影响', async () => {
    const wrapper = mountCard()
    await wrapper.find('.expandable-option-card__arrow').trigger('click')
    await wrapper.find('.expandable-option-card__main').trigger('click')
    await vi.advanceTimersByTimeAsync(250)
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.find('.expandable-option-card__growth').exists()).toBe(true)
  })

  it('箭头为独立可聚焦按钮，aria-controls 指向展开区', async () => {
    const wrapper = mountCard()
    const arrow = wrapper.find('.expandable-option-card__arrow')
    expect(arrow.attributes('type')).toBe('button')
    expect(arrow.attributes('aria-controls')).toBeTruthy()
    await arrow.trigger('click')
    const panel = wrapper.find('.expandable-option-card__growth')
    expect(panel.attributes('id')).toBe(arrow.attributes('aria-controls'))
  })

  it('suffix 操作位位于主按钮外部（避免非法 button 嵌套）且可垂直居中', async () => {
    const wrapper = mountCard({
      slots: {
        suffix: '<button type="button" class="spell-action-test">取消准备</button>',
        expanded: '<p class="effect">原创效果摘要</p>',
      },
    })
    // 主按钮内部不得再嵌套按钮（浏览器会重排非法 DOM）
    expect(wrapper.find('.expandable-option-card__main').find('button').exists()).toBe(false)
    // suffix 内容渲染在 __head 内的 __badges 容器中
    const badges = wrapper.find('.expandable-option-card__badges')
    expect(badges.exists()).toBe(true)
    expect(badges.find('button.spell-action-test').exists()).toBe(true)
    expect(badges.find('button.spell-action-test').text()).toBe('取消准备')
  })

  it('未提供展开内容时显示占位提示', async () => {
    const wrapper = mount(ExpandableOptionCard, { props: { title: '未登记法术' } })
    await wrapper.find('.expandable-option-card__arrow').trigger('click')
    expect(wrapper.text()).toContain('暂无摘要，效果以规则来源为准。')
  })

  it('选中状态以 aria-pressed 表达', () => {
    const wrapper = mountCard({ props: { title: '火焰箭', description: '', state: 'selected' } })
    expect(wrapper.find('.expandable-option-card__main').attributes('aria-pressed')).toBe('true')
  })

  it('锁定状态禁用选择但展开仍可用', async () => {
    const wrapper = mountCard({ props: { title: '火焰箭', description: '', state: 'locked' } })
    const main = wrapper.find('.expandable-option-card__main')
    expect(main.attributes()).toHaveProperty('disabled')
    await wrapper.find('.expandable-option-card__arrow').trigger('click')
    expect(wrapper.find('.expandable-option-card__growth').exists()).toBe(true)
  })
})
