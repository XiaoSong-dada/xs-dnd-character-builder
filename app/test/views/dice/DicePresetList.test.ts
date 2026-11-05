import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { DicePoolPreset } from '@/types/dice'
import DicePresetList from '@/views/dice/components/DicePresetList.vue'

const presets: DicePoolPreset[] = [
  { id: 'a', pool: [{ type: 'd20', quantity: 1 }], modifier: 5, createdAt: 1 },
  { id: 'b', pool: [{ type: 'd6', quantity: 2 }], modifier: -2, createdAt: 2 },
  { id: 'c', pool: [{ type: 'd100', quantity: 1 }], modifier: 0, createdAt: 3 },
]

describe('DicePresetList', () => {
  it('展示可辨认的投掷式并在点击时触发应用与删除', async () => {
    const wrapper = mount(DicePresetList, { props: { presets, maximum: 20, disabled: false, notice: '', error: '' } })
    expect(wrapper.get('#dice-presets-title').text()).toBe('骰池预设')
    expect(wrapper.text()).toContain('1d20 + 5')
    expect(wrapper.text()).toContain('2d6 − 2')
    expect(wrapper.text()).toContain('1d100')
    expect(wrapper.findAll('li')).toHaveLength(3)

    await wrapper.get('[aria-label="应用预设 1d20 + 5"]').trigger('click')
    await wrapper.get('[aria-label="删除预设 2d6 − 2"]').trigger('click')
    expect(wrapper.emitted('apply')).toEqual([['a']])
    expect(wrapper.emitted('delete')).toEqual([['b']])
    wrapper.unmount()
  })

  it('空列表给出说明，忙碌时禁用应用与删除', () => {
    const empty = mount(DicePresetList, { props: { presets: [], maximum: 20, disabled: false, notice: '', error: '' } })
    expect(empty.text()).toContain('保存常用的投掷组合')
    empty.unmount()

    const busy = mount(DicePresetList, { props: { presets, maximum: 20, disabled: true, notice: '', error: '' } })
    expect(busy.get('[aria-label="应用预设 1d20 + 5"]').attributes('disabled')).toBeDefined()
    expect(busy.get('[aria-label="删除预设 1d20 + 5"]').attributes('disabled')).toBeDefined()
    busy.unmount()
  })

  it('显示保存结果与错误提示', () => {
    const wrapper = mount(DicePresetList, { props: { presets: [], maximum: 20, disabled: false, notice: '已保存。', error: '存储不可用。' } })
    expect(wrapper.get('[role="status"]').text()).toBe('已保存。')
    expect(wrapper.get('[role="alert"]').text()).toBe('存储不可用。')
    wrapper.unmount()
  })
})
