import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PreferencesStep from '@/views/character-builder/components/PreferencesStep.vue'
import { getClassRecommendation } from '@/rules/recommend'
import { rulesRepository } from '@/rules/repository'

function topThreeNames(preferences: readonly string[]) {
  return [...rulesRepository.classes]
    .map((classRule) => ({ classRule, recommendation: getClassRecommendation(classRule, preferences) }))
    .filter(({ recommendation }) => recommendation.score > 0)
    .sort((a, b) => b.recommendation.score - a.recommendation.score)
    .slice(0, 3)
    .map(({ classRule }) => classRule.name)
}

describe('PreferencesStep 玩法偏好', () => {
  it('偏好选项从规则层渲染，选中状态正确', () => {
    const wrapper = mount(PreferencesStep, { props: { selected: ['melee'] } })
    const chips = wrapper.findAll('.ui-chip')
    expect(chips.map((chip) => chip.text())).toEqual(['近身作战', '远程攻击', '施放法术', '支援队友', '高生存', '战场控制'])
    expect(chips[0].attributes('aria-pressed')).toBe('true')
    expect(chips[1].attributes('aria-pressed')).toBe('false')
  })

  it('无偏好时显示引导文案，不显示推荐方向', () => {
    const wrapper = mount(PreferencesStep, { props: { selected: [] } })
    expect(wrapper.text()).toContain('选择偏好后查看推荐方向')
  })

  it('推荐方向与规则层排序前 3 一致', () => {
    const preferences = ['spellcasting', 'support'] as const
    const wrapper = mount(PreferencesStep, { props: { selected: preferences } })
    const direction = wrapper.find('aside span').text()
    expect(direction).toBe(topThreeNames(preferences).join(' · '))
  })

  it('切换偏好触发 change 事件', async () => {
    const wrapper = mount(PreferencesStep, { props: { selected: ['melee'] } })
    await wrapper.findAll('.ui-chip')[1].trigger('click')
    expect(wrapper.emitted('change')).toEqual([[['melee', 'ranged']]])
  })
})
