import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AbilitiesStep from '@/views/character-builder/components/AbilitiesStep.vue'

const scores = { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 } as const

function mountStep(method: 'standard-array' | 'point-buy' = 'standard-array') {
  return mount(AbilitiesStep, {
    props: {
      scores,
      method,
      bonuses: {},
      flexibleCount: 0,
      flexibleChoices: [],
    },
  })
}

describe('AbilitiesStep', () => {
  it('changes a score with the minus and plus buttons', async () => {
    const wrapper = mountStep()

    await wrapper.get('button[aria-label="减少力量基础值"]').trigger('click')
    await wrapper.get('button[aria-label="增加敏捷基础值"]').trigger('click')

    expect(wrapper.emitted('change')?.[0]?.[0]).toMatchObject({ str: 14 })
    expect(wrapper.emitted('change')?.[1]?.[0]).toMatchObject({ dex: 15 })
  })

  it('disables point-buy increases when all 27 points are used', () => {
    const wrapper = mountStep('point-buy')

    expect(wrapper.get('button[aria-label="增加力量基础值"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[aria-label="减少力量基础值"]').attributes('disabled')).toBeUndefined()
  })
})
