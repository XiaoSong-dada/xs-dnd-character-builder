import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SetupStep from '@/views/character-builder/components/SetupStep.vue'

function standardArrayCard(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.option-card').find((card) => card.text().includes('标准数组'))
}

describe('SetupStep 属性生成方式选择', () => {
  it('选中非标准数组时，标准数组卡片不带选中/推荐样式', () => {
    const wrapper = mount(SetupStep, { props: { targetLevel: 3, abilityMethod: 'point-buy' } })

    const standard = standardArrayCard(wrapper)
    expect(standard).toBeTruthy()
    expect(standard!.classes()).toContain('option-card--default')
    expect(standard!.classes()).not.toContain('option-card--selected')
    expect(standard!.classes()).not.toContain('option-card--recommended')

    const pointBuy = wrapper.findAll('.option-card').find((card) => card.text().includes('27点购点'))
    expect(pointBuy!.classes()).toContain('option-card--selected')
  })

  it('选中标准数组时仅标准数组卡片带选中样式', () => {
    const wrapper = mount(SetupStep, { props: { targetLevel: 3, abilityMethod: 'standard-array' } })

    expect(standardArrayCard(wrapper)!.classes()).toContain('option-card--selected')
    const others = wrapper.findAll('.option-card').filter((card) => !card.text().includes('标准数组'))
    expect(others.every((card) => !card.classes().includes('option-card--selected'))).toBe(true)
  })

  it('点击卡片触发 method 事件', async () => {
    const wrapper = mount(SetupStep, { props: { targetLevel: 3, abilityMethod: 'standard-array' } })

    await wrapper.findAll('.option-card').find((card) => card.text().includes('自定义'))!.trigger('click')

    expect(wrapper.emitted('method')).toEqual([['custom']])
  })
})
