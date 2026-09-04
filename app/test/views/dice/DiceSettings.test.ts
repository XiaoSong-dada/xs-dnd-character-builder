import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DiceSettings from '@/views/dice/components/DiceSettings.vue'

describe('dice settings', () => {
  it('exposes switches and disables unavailable actions without losing sound preference', async () => {
    const wrapper = mount(DiceSettings, { props: { skipAnimation: false, soundEnabled: true, busy: false } })
    await wrapper.get('#dice-skip-animation').trigger('click')
    expect(wrapper.emitted('skip')).toEqual([[true]])
    await wrapper.setProps({ skipAnimation: true })
    expect(wrapper.get('#dice-sound').attributes('disabled')).toBeDefined()
    expect(wrapper.get('#dice-sound').attributes('aria-checked')).toBe('true')
    expect(wrapper.text()).toContain('跳过动画时不播放音效')
    await wrapper.setProps({ skipAnimation: false, busy: true })
    expect(wrapper.get('#dice-skip-animation').attributes('disabled')).toBeDefined()
    await wrapper.get('#dice-sound').trigger('click')
    expect(wrapper.emitted('sound')).toEqual([[false]])
    wrapper.unmount()
  })
})
