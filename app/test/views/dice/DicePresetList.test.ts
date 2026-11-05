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
    const wrapper = mount(DicePresetList, { props: { presets, maximum: 20, disabled: false } })
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
    const empty = mount(DicePresetList, { props: { presets: [], maximum: 20, disabled: false } })
    expect(empty.text()).toContain('保存常用的投掷组合')
    empty.unmount()

    const busy = mount(DicePresetList, { props: { presets, maximum: 20, disabled: true } })
    expect(busy.get('[aria-label="应用预设 1d20 + 5"]').attributes('disabled')).toBeDefined()
    expect(busy.get('[aria-label="删除预设 1d20 + 5"]').attributes('disabled')).toBeDefined()
    busy.unmount()
  })

  it('应用提示只显示在本次应用的预设条目里，删除反馈显示在列表顶部', async () => {
    const wrapper = mount(DicePresetList, {
      props: {
        presets, maximum: 20, disabled: false,
        applyFeedback: { presetId: 'a', message: '已应用 1d20 + 5，请手动投掷。' },
      },
    })
    expect(wrapper.get('[role="status"]').element.closest('li')).toBe(wrapper.get('[aria-label="应用预设 1d20 + 5"]').element.closest('li'))
    await wrapper.setProps({ applyFeedback: { presetId: 'b', message: '已应用 2d6 − 2，请手动投掷。' } })
    expect(wrapper.findAll('[role="status"]')).toHaveLength(1)
    expect(wrapper.get('[role="status"]').text()).toBe('已应用 2d6 − 2，请手动投掷。')
    expect(wrapper.get('[role="status"]').element.closest('li')).toBe(wrapper.get('[aria-label="应用预设 2d6 − 2"]').element.closest('li'))
    await wrapper.setProps({ applyFeedback: undefined, deleteFeedback: { message: '预设删除失败。', error: true } })
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.get('[role="alert"]').element.nextElementSibling).toBe(wrapper.get('ul').element)
    wrapper.unmount()
  })
})
