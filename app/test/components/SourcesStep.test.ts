import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SourcesStep from '@/views/character-builder/components/SourcesStep.vue'

describe('SourcesStep 来源开关（E01）', () => {
  it('2024 展示 7 个游玩测试来源且默认未选中', () => {
    const wrapper = mount(SourcesStep, { props: { selected: [], ruleset: '5e-2024' } })
    expect(wrapper.findAll('.ui-chip')).toHaveLength(7)
    expect(wrapper.text()).toContain('破解奥秘为游玩测试内容')
    expect(wrapper.text()).toContain('UA 艾伯伦')
    expect(wrapper.text()).toContain('游玩测试')
    expect(wrapper.findAll('.ui-chip--selected')).toHaveLength(0)
    expect(wrapper.text()).toContain('已启用 0 / 7')
  })

  it('2024 点击单个来源发出对应 ID，全部启用发出全部来源', async () => {
    const wrapper = mount(SourcesStep, { props: { selected: [], ruleset: '5e-2024' } })
    const chip = wrapper.findAll('.ui-chip').find((item) => item.text().includes('UA 艾伯伦'))!
    await chip.trigger('click')
    expect(wrapper.emitted('change')?.[0]).toEqual([['source-2024-ua-eberron']])

    await wrapper.findAll('.sources-step__toolbar button')[0]!.trigger('click')
    const allEnabled = wrapper.emitted('change')?.[1]?.[0] as string[]
    expect(allEnabled).toHaveLength(7)
    expect(allEnabled).toContain('source-2024-ua-psion')
  })

  it('2024 已选来源渲染选中态，只用核心规则清空选择', async () => {
    const wrapper = mount(SourcesStep, { props: { selected: ['source-2024-ua-arcane'], ruleset: '5e-2024' } })
    expect(wrapper.findAll('.ui-chip--selected')).toHaveLength(1)

    await wrapper.findAll('.sources-step__toolbar button')[1]!.trigger('click')
    expect(wrapper.emitted('change')?.[0]).toEqual([[]])
  })

  it('2014 保持既有扩展书开关行为且不显示游玩测试提示', () => {
    const wrapper = mount(SourcesStep, { props: { selected: [] } })
    expect(wrapper.findAll('.ui-chip').length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('全部启用')
    expect(wrapper.text()).not.toContain('破解奥秘为游玩测试内容')
  })

  it('2014 第三方合作内容独立分组、默认未选中，全部启用可显式开启', async () => {
    const wrapper = mount(SourcesStep, { props: { selected: [] } })
    expect(wrapper.text()).toContain('合作内容需 DM 同意')
    const labels = wrapper.findAll('.sources-step__third-party-label')
    expect(labels).toHaveLength(11)
    expect(labels.every((item) => item.text().includes('合作内容'))).toBe(true)
    expect(wrapper.findAll('.ui-chip--selected')).toHaveLength(0)

    await wrapper.findAll('.sources-step__toolbar button')[0]!.trigger('click')
    const allEnabled = wrapper.emitted('change')?.[0]?.[0] as string[]
    expect(allEnabled).toContain('tp-ebon-tides-index')
    expect(allEnabled).toContain('xgte-2017-index')
  })
})
