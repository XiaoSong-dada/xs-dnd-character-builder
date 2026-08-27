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
