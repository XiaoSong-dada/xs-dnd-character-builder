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

describe('AbilitiesStep 天命随机点数（第 5 步自定义属性）', () => {
  const destinyRolls = [[15, 14, 13, 10, 18, 9], [4, 10, 18, 3, 18, 18]] as const

  function mountCustom(extra: Record<string, unknown> = {}) {
    return mount(AbilitiesStep, {
      props: {
        scores,
        method: 'custom',
        bonuses: {},
        flexibleCount: 0,
        flexibleChoices: [],
        destinyCount: 2,
        destinyRolls,
        ...extra,
      },
    })
  }

  it('天命输入框默认显示当前次数，并列出掷出的数组', () => {
    const wrapper = mountCustom()
    const input = wrapper.get('input[aria-label="天命次数"]')
    expect(input.attributes('type')).toBe('number')
    expect(input.attributes('min')).toBe('1')
    expect(input.attributes('max')).toBe('10')
    expect((input.element as HTMLInputElement).value).toBe('2')
    expect(wrapper.text()).toContain('天命')
    expect(wrapper.text()).toContain('天命随机点数:')
    const rows = wrapper.findAll('.abilities-step__destiny-list li').map((node) => node.text())
    expect(rows).toEqual(['[15 ,14 ,13 ,10 ,18 ,9]', '[4 ,10 ,18 ,3 ,18 ,18]'])
    wrapper.unmount()
  })

  it('改变天命次数发出新次数，输入超界在提交时被夹到 1—10', async () => {
    const wrapper = mountCustom()
    const input = wrapper.get('input[aria-label="天命次数"]')
    await input.setValue('5')
    expect(wrapper.emitted('destinyCount')).toEqual([[5]])

    await input.setValue('99')
    expect(wrapper.emitted('destinyCount')?.[1]).toEqual([10])
    expect((input.element as HTMLInputElement).value).toBe('10')

    // 空输入回落到 1（一次事件周期可能同时触发 input/change/blur，但同一个值只发一次）
    await input.setValue('')
    expect((input.element as HTMLInputElement).value).toBe('1')
    expect(wrapper.emitted('destinyCount')).toEqual([[5], [10], [1]])

    // 再提交一次同样的值不应重复发出
    await input.trigger('change')
    expect(wrapper.emitted('destinyCount')).toHaveLength(3)

    // 重新键入 1 视为回到已提交值，也不重复发出
    await input.setValue('1')
    expect(wrapper.emitted('destinyCount')).toHaveLength(3)

    // 从 1 改到 3 仍会发出
    await input.setValue('3')
    expect(wrapper.emitted('destinyCount')?.[3]).toEqual([3])
    wrapper.unmount()
  })

  it('次数未变化时不重复发出，避免多余重掷', async () => {
    const wrapper = mountCustom()
    const input = wrapper.get('input[aria-label="天命次数"]')
    await input.setValue('2')
    expect(wrapper.emitted('destinyCount')).toBeUndefined()
    wrapper.unmount()
  })

  it('重新掷骰按钮只发出重掷意图，不改变次数', async () => {
    const wrapper = mountCustom()
    const reroll = wrapper.findAll('button').find((button) => button.text() === '重新掷骰')
    if (!reroll) throw new Error('missing reroll button')
    await reroll.trigger('click')
    expect(wrapper.emitted('destinyReroll')).toHaveLength(1)
    expect(wrapper.emitted('destinyCount')).toBeUndefined()
    wrapper.unmount()
  })

  it('说明 4d6 去最低与"不含加值"，且掷骰结果不进入最终值计算', () => {
    const wrapper = mountCustom({ bonuses: { str: 2 } })
    expect(wrapper.text()).toContain('4 个 d6')
    expect(wrapper.text()).toContain('取最高的三颗之和')
    expect(wrapper.text()).toContain('不含种族与背景加值')
    // 天命数组只作参考，基础值仍以输入为准：力量基础 15 + 种族 2 = 17
    expect(wrapper.text()).toContain('基础 15 + 种族 2 = 17')
    wrapper.unmount()
  })

  it('随机源不可用时显示可修复的中文提示，且不渲染数组', () => {
    const wrapper = mountCustom({ destinyRolls: [], destinyError: '当前环境无法生成可靠的随机结果。请刷新页面后重试；当前结果沿用上一次记录。' })
    expect(wrapper.get('[role="alert"]').text()).toContain('无法生成可靠的随机结果')
    expect(wrapper.text()).toContain('请刷新页面后重试')
    expect(wrapper.findAll('.abilities-step__destiny-list li')).toHaveLength(0)
    wrapper.unmount()
  })

  it('标准数组与购点法下不显示天命区块', () => {
    for (const method of ['standard-array', 'point-buy'] as const) {
      const wrapper = mountStep(method)
      expect(wrapper.find('input[aria-label="天命次数"]').exists(), method).toBe(false)
      expect(wrapper.text()).not.toContain('天命')
      wrapper.unmount()
    }
  })
})
