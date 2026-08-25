import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SourcesStep from '@/views/character-builder/components/SourcesStep.vue'
import { getSelectableSources } from '@/rules/source-books'

describe('SourcesStep 扩展书选择', () => {
  it('核心规则只读展示，扩展来源从规则层渲染', () => {
    const wrapper = mount(SourcesStep, { props: { selected: [] } })
    expect(wrapper.text()).toContain('核心规则始终启用')
    expect(wrapper.text()).toContain('Basic Rules')
    expect(wrapper.findAll('.ui-chip')).toHaveLength(getSelectableSources().length)
  })

  it('支持零本扩展与单本切换', async () => {
    const wrapper = mount(SourcesStep, { props: { selected: [] } })
    expect(wrapper.text()).toContain('已启用 0 /')
    await wrapper.findAll('.ui-chip')[0].trigger('click')
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual([getSelectableSources()[0].id])
  })

  it('支持全部启用与只用核心规则', async () => {
    const wrapper = mount(SourcesStep, { props: { selected: ['xgte-2017'] } })
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual(getSelectableSources().map((source) => source.id))
    await buttons[1].trigger('click')
    expect(wrapper.emitted('change')?.[1]?.[0]).toEqual([])
  })
})
