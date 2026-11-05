import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { DieType, LogicalRollResult } from '@/types/dice'
import DiceResultPanel from '@/views/dice/components/DiceResultPanel.vue'

const groups: Array<{ type: DieType; results: LogicalRollResult[] }> = [
  {
    type: 'd6',
    results: [
      { id: 'roll-1:d6:0', type: 'd6', value: 4 },
      { id: 'roll-1:d6:1', type: 'd6', value: 4 },
    ],
  },
  {
    type: 'd100',
    results: [{ id: 'roll-1:d100:0', type: 'd100', value: 47, d100: { tens: 40, ones: 7 } }],
  },
]

describe('DiceResultPanel', () => {
  it('turns every die result into its own reroll target even when values repeat', async () => {
    const wrapper = mount(DiceResultPanel, { props: { groups, total: 55, canReroll: true } })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[1]?.attributes('aria-label')).toBe('重掷 d6 第 2 颗，当前 4 点')
    expect(buttons[2]?.text()).toContain('40 + 7 = 47')
    expect(buttons[0]?.text()).toContain('↻')

    await buttons[1]?.trigger('click')
    expect(wrapper.emitted('reroll')).toEqual([['roll-1:d6:1']])

    await buttons[2]?.trigger('click')
    expect(wrapper.emitted('reroll')?.[1]).toEqual(['roll-1:d100:0'])
    wrapper.unmount()
  })

  it('disables reroll until the current roll has settled', async () => {
    const wrapper = mount(DiceResultPanel, { props: { groups, total: 55, canReroll: false } })
    const button = wrapper.findAll('button')[0]
    expect(button?.attributes('disabled')).toBeDefined()
    await button?.trigger('click')
    expect(wrapper.emitted('reroll')).toBeUndefined()
    wrapper.unmount()
  })
})
