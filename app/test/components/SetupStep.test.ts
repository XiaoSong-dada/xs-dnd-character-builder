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
    const others = wrapper.findAll('.option-card').filter((card) => !card.text().includes('标准数组') && !card.text().includes('核心规则'))
    expect(others.every((card) => !card.classes().includes('option-card--selected'))).toBe(true)
  })

  it('点击卡片触发 method 事件', async () => {
    const wrapper = mount(SetupStep, { props: { targetLevel: 3, abilityMethod: 'standard-array' } })

    await wrapper.findAll('.option-card').find((card) => card.text().includes('自定义'))!.trigger('click')

    expect(wrapper.emitted('method')).toEqual([['custom']])
  })
})

describe('SetupStep 规则版本选择（B09-01）', () => {
  function rulesetCard(wrapper: ReturnType<typeof mount>, label: string) {
    return wrapper.findAll('.option-card').find((card) => card.text().includes(label))
  }

  it('第一页顶部展示版本、等级与属性方式两版卡片', () => {
    const wrapper = mount(SetupStep, { props: { targetLevel: 4, abilityMethod: 'standard-array', ruleset: '5e-2024' } })

    expect(rulesetCard(wrapper, '2014 核心规则')).toBeTruthy()
    expect(rulesetCard(wrapper, '2024 核心规则')!.classes()).toContain('option-card--selected')
    expect(rulesetCard(wrapper, '2014 核心规则')!.classes()).not.toContain('option-card--selected')
    expect(rulesetCard(wrapper, '27点购点')!.text()).toContain('2024 官方购点')
  })

  it('选择版本触发 ruleset 事件，且不改动等级与属性方式事件', async () => {
    const wrapper = mount(SetupStep, { props: { targetLevel: 4, abilityMethod: 'point-buy', ruleset: '5e-2014' } })

    await rulesetCard(wrapper, '2024 核心规则')!.trigger('click')

    expect(wrapper.emitted('ruleset')).toEqual([['5e-2024']])
    expect(wrapper.emitted('level')).toBeUndefined()
    expect(wrapper.emitted('method')).toBeUndefined()
  })

  it('已有构筑时锁定另一版本并说明原因', async () => {
    const wrapper = mount(SetupStep, { props: { targetLevel: 4, abilityMethod: 'standard-array', ruleset: '5e-2014', rulesetLocked: true } })

    const modern = rulesetCard(wrapper, '2024 核心规则')!
    expect(modern.classes()).toContain('option-card--locked')
    expect(modern.text()).toContain('已有构筑选择')
    await modern.trigger('click')
    expect(wrapper.emitted('ruleset')).toBeUndefined()
  })

  it('记忆版本未开放时给出回退说明', () => {
    const wrapper = mount(SetupStep, { props: { targetLevel: 4, abilityMethod: 'standard-array', ruleset: '5e-2014', rulesetFallback: '5e-2024' } })

    expect(wrapper.text()).toContain('已改用 2014 新建')
    expect(wrapper.text()).toContain('暂未开放')
  })
})
