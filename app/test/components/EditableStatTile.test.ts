import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import EditableStatTile from '@/views/character-builder/components/EditableStatTile.vue'

describe('EditableStatTile', () => {
  it('只在编辑模式下通过双击或 Enter 进入，并以 Enter 提交整数', async () => {
    const wrapper = mount(EditableStatTile, { props: { label: '护甲等级', value: 18, editMode: false } })
    await wrapper.trigger('dblclick')
    expect(wrapper.find('input').exists()).toBe(false)

    await wrapper.setProps({ editMode: true })
    await wrapper.trigger('keydown.enter')
    await nextTick()
    const input = wrapper.get('input')
    await input.setValue('20')
    await input.trigger('keydown.enter')
    expect(wrapper.emitted('commit')?.at(-1)).toEqual([20])
  })

  it('非法值恢复原显示值并给出中文原因，Esc 放弃不提交', async () => {
    const wrapper = mount(EditableStatTile, { props: { label: '最大生命值', value: 30, editMode: true, minimum: 1 } })
    await wrapper.trigger('dblclick')
    await wrapper.get('input').setValue('0')
    await wrapper.get('input').trigger('blur')
    expect(wrapper.text()).toContain('请输入不小于 1 的整数')
    expect(wrapper.text()).toContain('30')
    expect(wrapper.emitted('commit')).toBeUndefined()

    await wrapper.trigger('dblclick')
    await wrapper.get('input').setValue('40')
    await wrapper.get('input').trigger('keydown.esc')
    expect(wrapper.emitted('commit')).toBeUndefined()
  })

  it('触屏在 250ms 内双击进入输入', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-27T00:00:00.000Z'))
    const wrapper = mount(EditableStatTile, { props: { label: '速度', value: 30, editMode: true } })
    await wrapper.trigger('pointerup', { pointerType: 'touch' })
    vi.advanceTimersByTime(200)
    await wrapper.trigger('pointerup', { pointerType: 'touch' })
    await nextTick()
    expect(wrapper.find('input').exists()).toBe(true)
    vi.useRealTimers()
  })
})

/**
 * UI-C01：说明区接入 `StatNote` 之后的分工（需求 D25）。
 * - 非编辑态：说明被截断时双击打开明细弹窗（不再进入数值编辑）；
 * - 编辑态：双击仍然是进入数值编辑，「双击编辑」提示不变。
 */
describe('EditableStatTile 说明区（D25）', () => {
  /** jsdom 不做真实布局，用属性打桩模拟「说明超过两行」。 */
  function stubOverflow(wrapper: ReturnType<typeof mount>, truncated: boolean): void {
    const note = wrapper.get('.stat-note').element as HTMLElement
    Object.defineProperty(note, 'scrollHeight', { value: truncated ? 60 : 18, configurable: true })
    Object.defineProperty(note, 'clientHeight', { value: 18, configurable: true })
    window.dispatchEvent(new Event('resize'))
  }

  const DETAILS = ['起始职业 1 级生命值 +11', '第 2 级生命值 +7']

  it('非编辑态 + 说明被截断：双击说明打开明细弹窗，且不进入数值编辑', async () => {
    const wrapper = mount(EditableStatTile, {
      props: { label: '最大生命值', value: 37, details: DETAILS, editMode: false },
      global: { stubs: { teleport: true } },
    })
    stubOverflow(wrapper, true)
    await nextTick()
    await wrapper.get('.stat-note').trigger('dblclick')
    const modal = wrapper.get('.ui-modal')
    expect(modal.text()).toContain('最大生命值（37）')
    expect(modal.findAll('.stat-note__list li').map((item) => item.text())).toEqual(DETAILS)
    // 非编辑态不会因为双击进入数值编辑
    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.emitted('commit')).toBeUndefined()
  })

  it('非编辑态 + 说明未截断：双击说明不弹窗', async () => {
    const wrapper = mount(EditableStatTile, {
      props: { label: '最大生命值', value: 37, details: DETAILS, editMode: false },
      global: { stubs: { teleport: true } },
    })
    stubOverflow(wrapper, false)
    await nextTick()
    await wrapper.get('.stat-note').trigger('dblclick')
    expect(wrapper.find('.ui-modal').exists()).toBe(false)
  })

  it('编辑态：说明区不可交互，双击仍然进入数值编辑', async () => {
    const wrapper = mount(EditableStatTile, {
      props: { label: '最大生命值', value: 37, details: DETAILS, editMode: true },
      global: { stubs: { teleport: true } },
    })
    stubOverflow(wrapper, true)
    await nextTick()
    expect(wrapper.get('.stat-note').attributes('role')).toBeUndefined()
    expect(wrapper.text()).toContain('双击编辑')
    await wrapper.get('.stat-note').trigger('dblclick')
    await nextTick()
    expect(wrapper.find('.ui-modal').exists()).toBe(false)
    expect(wrapper.find('input').exists()).toBe(true)
  })
})
