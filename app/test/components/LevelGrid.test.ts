import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import LevelGrid from '@/views/character-builder/components/LevelGrid.vue'

/** 等级单元格表格（需求 §4，决策 D38／D40）。 */
describe('LevelGrid 等级表格', () => {
  it('固定渲染 1—20 个单元格，并标注当前值与范围', () => {
    const wrapper = mount(LevelGrid, { props: { min: 1, max: 20, value: 5, label: '总等级' } })
    const cells = wrapper.findAll('.level-grid__cell')
    expect(cells).toHaveLength(20)
    expect(cells.map((cell) => cell.text())).toEqual(Array.from({ length: 20 }, (_, index) => String(index + 1)))
    const current = wrapper.get('.level-grid__cell--current')
    expect(current.text()).toBe('5')
    expect(current.attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('.level-grid').attributes('aria-label')).toBe('选择总等级')
    // 单元格范围不变时，可选范围通过 disabled 表达
    expect(wrapper.get('[aria-label="总等级 5 级"]').attributes('disabled')).toBeUndefined()
  })

  it('越界单元格禁用（兼职下限为职业数量）', () => {
    const wrapper = mount(LevelGrid, { props: { min: 2, max: 20, value: 2, label: '总等级' } })
    expect(wrapper.get('[aria-label="总等级 1 级"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[aria-label="总等级 2 级"]').attributes('disabled')).toBeUndefined()
  })

  it('职业表格把上限收在 19：20 级单元格禁用', () => {
    const wrapper = mount(LevelGrid, { props: { min: 1, max: 19, value: 3, label: '战士等级' } })
    expect(wrapper.get('[aria-label="战士等级 19 级"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('[aria-label="战士等级 20 级"]').attributes('disabled')).toBeDefined()
  })

  it('点选其它等级 emit select，点当前值不 emit', async () => {
    const wrapper = mount(LevelGrid, { props: { min: 1, max: 20, value: 5, label: '总等级' } })
    await wrapper.get('[aria-label="总等级 8 级"]').trigger('click')
    expect(wrapper.emitted('select')).toEqual([[8]])

    await wrapper.get('[aria-label="总等级 5 级"]').trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('点禁用单元格不 emit', async () => {
    const wrapper = mount(LevelGrid, { props: { min: 3, max: 20, value: 3, label: '总等级' } })
    await wrapper.get('[aria-label="总等级 1 级"]').trigger('click')
    expect(wrapper.emitted('select')).toBeFalsy()
  })
})
