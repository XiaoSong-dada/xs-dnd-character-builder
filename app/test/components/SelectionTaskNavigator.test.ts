import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import SelectionTaskNavigator from '@/views/character-builder/components/SelectionTaskNavigator.vue'

const tasks = [
  { id: 'race', label: '选择种族', group: '种族', required: true, status: 'complete' as const, summary: '矮人' },
  { id: 'subrace', label: '子种族', group: '种族', required: true, status: 'pending' as const, summary: '尚未选择' },
  { id: 'variant', label: '背景变体', group: '背景', required: false, status: 'optional' as const, summary: '可选' },
]

describe('SelectionTaskNavigator 可访问性', () => {
  it('提供 tablist、当前状态文本与方向键跳转', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 0 })
    const wrapper = mount(SelectionTaskNavigator, { props: { tasks, modelValue: 'subrace', completed: 1 } })
    expect(wrapper.get('[role="tablist"]').attributes('aria-label')).toBe('选择要完成的任务')
    expect(wrapper.get('[data-task-id="subrace"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.get('[data-task-id="subrace"]').text()).toContain('当前')

    await wrapper.get('[data-task-id="subrace"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['variant'])
    await wrapper.get('[data-task-id="subrace"]').trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['race'])
    vi.unstubAllGlobals()
  })
})
