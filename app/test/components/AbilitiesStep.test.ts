import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AbilitiesStep from '@/views/character-builder/components/AbilitiesStep.vue'
import type { AbilityScores } from '@/types/character'

const scores = { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 } as const

function mountStep(
  method: 'standard-array' | 'point-buy' = 'standard-array',
  pointScores: AbilityScores = scores,
  bonuses: Partial<AbilityScores> = {},
) {
  return mount(AbilitiesStep, {
    props: {
      scores: pointScores,
      method,
      bonuses,
      flexibleCount: 0,
      flexibleChoices: [],
    },
  })
}

describe('AbilitiesStep', () => {
  it('明确选择属性加值方案，切换不在组件中删除已选属性', async () => {
    const wrapper = mount(AbilitiesStep, { props: { scores, method: 'standard-array', bonuses: { str: 2, dex: 1 }, flexibleCount: 2, flexibleChoices: ['str', 'dex'],
      flexibleGroups: [{ count: 1, value: 2 }, { count: 1, value: 1 }],
      flexibleAlternatives: [
        { id: 'two-one', label: '+2 / +1', groups: [{ count: 1, value: 2 }, { count: 1, value: 1 }] },
        { id: 'three-one', label: '三项 +1', groups: [{ count: 3, value: 1 }] },
      ],
    } })
    expect((wrapper.get('input[value="two-one"]').element as HTMLInputElement).checked).toBe(true)
    await wrapper.get('input[value="three-one"]').setValue(true)
    expect(wrapper.emitted('option')).toEqual([['three-one']])
    expect(wrapper.emitted('choices')).toBeUndefined()
    await wrapper.setProps({ flexibleOptionId: 'three-one', flexibleCount: 3, flexibleGroups: [{ count: 3, value: 1 }], bonuses: { str: 1, dex: 1 } })
    const con = wrapper.findAll('.abilities-step__choices button').find((button) => button.text() === '体质')
    if (!con) throw new Error('missing constitution')
    await con.trigger('click')
    expect(wrapper.emitted('choices')?.[0]).toEqual([['str', 'dex', 'con']])
    wrapper.unmount()
  })

  it('第一项 +2 不能选择基础19的属性，三项 +1 可以达到20', async () => {
    const wrapper = mount(AbilitiesStep, { props: { scores: { ...scores, str: 19 }, method: 'custom', bonuses: {}, flexibleCount: 2, flexibleChoices: [], flexibleGroups: [{ count: 1, value: 2 }, { count: 1, value: 1 }] } })
    const str = () => wrapper.findAll('.abilities-step__choices button').find((button) => button.text() === '力量')
    expect(str()?.attributes('disabled')).toBeDefined()
    await wrapper.setProps({ flexibleCount: 3, flexibleGroups: [{ count: 3, value: 1 }] })
    expect(str()?.attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })
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

  it('allows point-buy increases above 15 while budget and final-score room remain', async () => {
    const pointScores = { str: 15, dex: 14, con: 13, int: 8, wis: 8, cha: 8 } as const
    const wrapper = mountStep('point-buy', pointScores)

    expect(wrapper.get('button[aria-label="增加力量基础值"]').attributes('disabled')).toBeUndefined()
    await wrapper.get('button[aria-label="增加力量基础值"]').trigger('click')
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({ ...pointScores, str: 16 })
  })

  it('disables point-buy increases at final score 20 or after spending all 27 points', () => {
    const finalTwenty = mountStep(
      'point-buy',
      { str: 18, dex: 10, con: 10, int: 8, wis: 8, cha: 8 },
      { str: 2 },
    )
    expect(finalTwenty.get('button[aria-label="增加力量基础值"]').attributes('disabled')).toBeDefined()

    const budgetSpent = mountStep(
      'point-buy',
      { str: 20, dex: 16, con: 15, int: 8, wis: 8, cha: 8 },
    )
    expect(budgetSpent.get('button[aria-label="增加魅力基础值"]').attributes('disabled')).toBeDefined()
    expect(budgetSpent.get('button[aria-label="减少力量基础值"]').attributes('disabled')).toBeUndefined()
  })

  it('prevents a flexible race bonus from pushing a final score above 20', () => {
    const wrapper = mount(AbilitiesStep, {
      props: {
        scores: { str: 20, dex: 10, con: 10, int: 8, wis: 8, cha: 8 },
        method: 'point-buy',
        bonuses: {},
        flexibleCount: 2,
        flexibleChoices: [],
      },
    })

    expect(wrapper.get('button[aria-pressed="false"]').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('27点预算只计算本页基础值')
  })

  it('keeps decrement enabled for a valid point-buy score above its minimum', () => {
    const wrapper = mountStep('point-buy', { str: 20, dex: 16, con: 15, int: 8, wis: 8, cha: 8 })
    expect(wrapper.get('button[aria-label="减少力量基础值"]').attributes('disabled')).toBeUndefined()
  })
})
