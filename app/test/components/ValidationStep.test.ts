import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ValidationStep from '@/views/character-builder/components/ValidationStep.vue'
import type { ValidationIssue } from '@/types/character'

const errorIssue: ValidationIssue = { id: 'cantrip-count', step: 'spells', severity: 'error', message: '戏法选择尚未完成或包含不可用项。', resolution: '需要选择3个当前职业戏法。' }
const warningIssue: ValidationIssue = { id: 'required-cantrip-missing', step: 'spells', severity: 'warning', message: '子职要求包含的戏法“法师之手”尚未选择。', resolution: '诡术师的戏法必须包含法师之手；可在法术步骤补齐（提示级，不阻断草稿保存）。' }

describe('ValidationStep 提示级校验呈现（B09-04）', () => {
  it('错误与提示分组展示，提示不阻断', () => {
    const wrapper = mount(ValidationStep, { props: { issues: [errorIssue, warningIssue] } })

    expect(wrapper.text()).toContain('需要处理（1）')
    expect(wrapper.text()).toContain('提示（不阻断，1）')
    expect(wrapper.text()).toContain('法师之手')
    expect(wrapper.findAll('button')).toHaveLength(2)
    expect(wrapper.find('.validation-step__issue--warning').exists()).toBe(true)
  })

  it('只有提示时给出可继续说明', () => {
    const wrapper = mount(ValidationStep, { props: { issues: [warningIssue] } })

    expect(wrapper.text()).toContain('可以继续，但存在提示项')
    expect(wrapper.text()).not.toContain('需要处理（')
  })

  it('点击问题跳转到对应步骤', async () => {
    const wrapper = mount(ValidationStep, { props: { issues: [warningIssue] } })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('go')).toEqual([['spells']])
  })

  it('2024 草稿显示车卡预览与边界说明', () => {
    const wrapper = mount(ValidationStep, { props: { issues: [], ruleset: '5e-2024' } })

    expect(wrapper.text()).toContain('2024 车卡预览')
    expect(wrapper.text()).toContain('跑团资源结算与导出承载尚未完成')
    const legacy = mount(ValidationStep, { props: { issues: [] } })
    expect(legacy.text()).not.toContain('2024 车卡预览')
  })
})
