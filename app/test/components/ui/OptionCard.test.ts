import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import OptionCard from '@/components/ui/OptionCard.vue'

describe('OptionCard', () => {
  it('以aria-pressed和可见标记表达选中状态', () => {
    const wrapper = mount(OptionCard, { props: { title: '战士', state: 'selected' } })
    expect(wrapper.attributes('aria-pressed')).toBe('true')
    expect(wrapper.text()).toContain('✓')
  })

  it('锁定状态不可触发选择', async () => {
    const wrapper = mount(OptionCard, { props: { title: '法师', state: 'locked' } })
    await wrapper.trigger('click')
    expect(wrapper.attributes()).toHaveProperty('disabled')
    expect(wrapper.emitted('select')).toBeUndefined()
  })
})
