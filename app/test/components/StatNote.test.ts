import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import StatNote from '@/components/ui/StatNote.vue'

/**
 * UI-B：数值说明区（需求 D23—D27）。
 *
 * 交互矩阵：{编辑态 interactive, 非编辑态} × {截断, 未截断} × {双击, 触屏双击, 键盘}，
 * 只有「可交互 + 截断」的三种输入会打开明细弹窗。
 *
 * jsdom 不做真实布局（scrollHeight／clientHeight 恒为 0），因此溢出与否用属性打桩模拟。
 */
function mountNote(props: Record<string, unknown>, options: { readonly truncated?: boolean } = {}) {
  const wrapper = mount(StatNote, {
    props: { label: '最大生命值', value: 37, ...props },
    global: { stubs: { teleport: true } },
  })
  const text = wrapper.get('.stat-note').element as HTMLElement
  Object.defineProperty(text, 'scrollHeight', { value: options.truncated ? 60 : 18, configurable: true })
  Object.defineProperty(text, 'clientHeight', { value: 18, configurable: true })
  // 挂载时的首次测量发生在打桩之前，这里用窗口 resize 触发重测（组件在真实环境同样监听它）。
  window.dispatchEvent(new Event('resize'))
  return wrapper
}

const DETAILS = ['起始职业 1 级生命值 +11', '第 2 级生命值 +7 · 战士 d10 最大值 + 体质调整值']

describe('UI-B StatNote：截断显示（D23／R9）', () => {
  it('内联说明由明细拼接，显示与弹窗同源', () => {
    const wrapper = mountNote({ items: DETAILS })
    expect(wrapper.get('.stat-note').text()).toBe(DETAILS.join(' · '))
  })

  it('没有明细时显示原文', () => {
    const wrapper = mountNote({ fallback: '当前职业无施法能力' })
    expect(wrapper.get('.stat-note').text()).toBe('当前职业无施法能力')
  })

  it('两者都没有时不渲染说明区', () => {
    const wrapper = mount(StatNote, { props: { label: '最大生命值', value: 37 }, global: { stubs: { teleport: true } } })
    expect(wrapper.get('.stat-note').text()).toBe('')
  })
})

describe('UI-B StatNote：只有被截断时才可交互（D24）', () => {
  it('截断 + 可交互：带 role / tabindex / aria-label', async () => {
    const wrapper = mountNote({ items: DETAILS, interactive: true }, { truncated: true })
    await nextTick()
    const note = wrapper.get('.stat-note')
    expect(note.attributes('role')).toBe('button')
    expect(note.attributes('tabindex')).toBe('0')
    expect(note.attributes('aria-label')).toBe('查看最大生命值的说明')
    expect(note.classes()).toContain('stat-note--interactive')
  })

  it('未截断：不可交互（无 role / tabindex，双击与键盘都不弹窗）', async () => {
    const wrapper = mountNote({ items: DETAILS, interactive: true }, { truncated: false })
    const note = wrapper.get('.stat-note')
    expect(note.attributes('role')).toBeUndefined()
    expect(note.attributes('tabindex')).toBeUndefined()
    await note.trigger('dblclick')
    await note.trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('.ui-modal').exists()).toBe(false)
  })

  it('interactive 为 false（编辑态）：即使截断也不可交互', async () => {
    const wrapper = mountNote({ items: DETAILS, interactive: false }, { truncated: true })
    const note = wrapper.get('.stat-note')
    expect(note.attributes('role')).toBeUndefined()
    await note.trigger('dblclick')
    expect(wrapper.find('.ui-modal').exists()).toBe(false)
  })
})

describe('UI-B StatNote：明细弹窗（D25／D26）', () => {
  it('非编辑态双击打开弹窗，明细逐条列出', async () => {
    const wrapper = mountNote({ items: DETAILS, interactive: true }, { truncated: true })
    await wrapper.get('.stat-note').trigger('dblclick')
    const modal = wrapper.get('.ui-modal')
    // 标题带名称与当前值
    expect(modal.text()).toContain('最大生命值（37）')
    const items = modal.findAll('.stat-note__list li').map((item) => item.text())
    expect(items).toEqual(DETAILS)
    // 来源说明也在其中
    expect(items[1]).toContain('战士 d10 最大值 + 体质调整值')
  })

  it('触屏双击打开弹窗（250ms 判定窗口内两次 pointerup，跳过首次）', async () => {
    const wrapper = mountNote({ items: DETAILS, interactive: true }, { truncated: true })
    const note = wrapper.get('.stat-note')
    await note.trigger('pointerup', { pointerType: 'touch' })
    expect(wrapper.find('.ui-modal').exists()).toBe(false)
    await note.trigger('pointerup', { pointerType: 'touch' })
    expect(wrapper.find('.ui-modal').exists()).toBe(true)
  })

  it('鼠标的 pointerup 不触发弹窗（避免与 dblclick 重复）', async () => {
    const wrapper = mountNote({ items: DETAILS, interactive: true }, { truncated: true })
    const note = wrapper.get('.stat-note')
    await note.trigger('pointerup', { pointerType: 'mouse' })
    await note.trigger('pointerup', { pointerType: 'mouse' })
    expect(wrapper.find('.ui-modal').exists()).toBe(false)
  })

  it('键盘 Enter 与 Space 都能打开弹窗', async () => {
    for (const key of ['Enter', ' ']) {
      const wrapper = mountNote({ items: DETAILS, interactive: true }, { truncated: true })
      await wrapper.get('.stat-note').trigger('keydown', { key })
      expect(wrapper.find('.ui-modal').exists(), `key=${key}`).toBe(true)
    }
  })

  it('没有明细时弹窗显示原文', async () => {
    const wrapper = mountNote({ fallback: '当前职业无施法能力', interactive: true }, { truncated: true })
    await wrapper.get('.stat-note').trigger('dblclick')
    const items = wrapper.findAll('.stat-note__list li').map((item) => item.text())
    expect(items).toEqual(['当前职业无施法能力'])
  })

  it('弹窗可以关闭', async () => {
    const wrapper = mountNote({ items: DETAILS, interactive: true }, { truncated: true })
    await wrapper.get('.stat-note').trigger('dblclick')
    expect(wrapper.find('.ui-modal').exists()).toBe(true)
    await wrapper.get('.ui-modal button[aria-label="关闭"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('.ui-modal').exists()).toBe(false)
  })
})
