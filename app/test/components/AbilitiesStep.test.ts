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
  it('assigns standard-array values by swapping the occupied ability', async () => {
    const wrapper = mountStep()

    await wrapper.get('select[aria-label="选择力量基础值"]').setValue('14')

    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({
      str: 14,
      dex: 15,
      con: 13,
      int: 8,
      wis: 12,
      cha: 10,
    })
  })

  it('shows race bonuses separately from the standard-array base value', () => {
    const wrapper = mount(AbilitiesStep, {
      props: {
        scores,
        method: 'standard-array',
        bonuses: { str: 2 },
        flexibleCount: 0,
        flexibleChoices: [],
      },
    })

    expect(wrapper.text()).toContain('基础 15 + 种族 2 = 17')
  })

  it('disables point-buy increases when all 27 points are used', () => {
    const wrapper = mountStep('point-buy')

    expect(wrapper.get('button[aria-label="增加力量基础值"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[aria-label="减少力量基础值"]').attributes('disabled')).toBeUndefined()
  })
})
