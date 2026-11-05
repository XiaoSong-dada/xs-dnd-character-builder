import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DicePoolPanel from '@/views/dice/components/DicePoolPanel.vue'

function mountPanel(overrides: Partial<{ modifier: string; modifierError: string; disabled: boolean; canSave: boolean }> = {}) {
  return mount(DicePoolPanel, {
    props: {
      entries: [{ type: 'd6', quantity: 2 }],
      expression: '2d6',
      modifier: '',
      modifierError: '',
      physicalCount: 2,
      remaining: 18,
      maximum: 20,
      disabled: false,
      canAdd: () => true,
      canSave: true,
      ...overrides,
    },
  })
}

describe('dice pool panel', () => {
  it('emits every fixed modifier input change for validation by the page hook', async () => {
    const wrapper = mountPanel()
    expect(wrapper.text()).toContain('固定修正值')
    await wrapper.get('#dice-modifier').setValue('-2')
    expect(wrapper.emitted('update:modifier')).toEqual([['-2']])
    expect(wrapper.get('#dice-modifier').attributes('aria-describedby')).toBe('dice-modifier-hint')
    wrapper.unmount()
  })

  it('marks invalid input and explains the accepted format', () => {
    const wrapper = mountPanel({ modifier: '1.5', modifierError: '固定修正值只能填写整数，例如 5、-2 或 0。' })
    expect(wrapper.get('#dice-modifier').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#dice-modifier').attributes('aria-describedby')).toBe('dice-modifier-hint dice-modifier-error')
    expect(wrapper.get('#dice-modifier-error').text()).toContain('只能填写整数')
    wrapper.unmount()
  })

  it('disables the modifier input while a roll is in progress', () => {
    const wrapper = mountPanel({ disabled: true })
    expect(wrapper.get('#dice-modifier').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('offers a save-preset entry that is disabled until the pool can be saved', async () => {
    const wrapper = mountPanel()
    await wrapper.get('.dice-pool__save').trigger('click')
    expect(wrapper.emitted('save')).toEqual([[]])
    await wrapper.setProps({ canSave: false })
    expect(wrapper.get('.dice-pool__save').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ canSave: true, disabled: true })
    expect(wrapper.get('.dice-pool__save').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })
})
