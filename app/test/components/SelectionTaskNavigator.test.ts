import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import SelectionTaskNavigator from '@/views/character-builder/components/SelectionTaskNavigator.vue'

const tasks = [
  { id: 'race', label: '选择种族', group: '种族', required: true, status: 'complete' as const, summary: '矮人' },
  { id: 'subrace', label: '子种族', group: '种族', required: true, status: 'pending' as const, summary: '尚未选择' },
  { id: 'variant', label: '背景变体', group: '背景', required: false, status: 'optional' as const, summary: '可选' },
]

describe('SelectionTaskNavigator 可访问性', () => {
  it('提供 tablist、当前状态文本与方向键跳转', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 0 })
    const wrapper = mount(SelectionTaskNavigator, { props: { tasks, modelValue: 'subrace', completed: 1 } })
    expect(wrapper.get('[role="tablist"]').attributes('aria-label')).toBe('选择要完成的任务')
    expect(wrapper.get('[data-task-id="subrace"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.get('[data-task-id="subrace"]').text()).toContain('当前')

    await wrapper.get('[data-task-id="subrace"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['variant'])
    await wrapper.get('[data-task-id="subrace"]').trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['race'])
    vi.unstubAllGlobals()
  })
})

/** 第 8 步法术书模式的四类任务：含进度、无进度与可选任务。 */
const spellTasks = [
  { id: 'cantrips', label: '选择戏法', group: '施法', required: true, status: 'complete' as const, summary: '戏法已选齐', progress: '4/4' },
  { id: 'spellbook', label: '写入法术书', group: '施法', required: true, status: 'pending' as const, summary: '升级法术已写入', progress: '6/14' },
  { id: 'spellbook-extra', label: '子职额外入书', group: '施法', required: false, status: 'optional' as const, summary: '已使用额外名额', progress: '0/2' },
  { id: 'spells', label: '准备法术', group: '施法', required: true, status: 'pending' as const, summary: '尚未选齐' },
]

const navigatorSource = readFileSync(
  resolve(process.cwd(), 'src/views/character-builder/components/SelectionTaskNavigator.vue'),
  'utf8',
)

/** 提取 scoped SCSS 中 `&__xxx {` 规则块（含嵌套内容，按花括号配对）。 */
function extractBlock(selector: string): string {
  const styleSection = navigatorSource.slice(navigatorSource.indexOf('<style'))
  const start = styleSection.indexOf(selector)
  expect(start, `未找到 ${selector}`).toBeGreaterThanOrEqual(0)
  const open = styleSection.indexOf('{', start)
  let depth = 0
  for (let index = open; index < styleSection.length; index += 1) {
    if (styleSection[index] === '{') depth += 1
    else if (styleSection[index] === '}') {
      depth -= 1
      if (depth === 0) return styleSection.slice(open, index + 1)
    }
  }
  throw new Error(`${selector} 规则块未闭合`)
}

describe('SelectionTaskNavigator 任务卡结构（v1.9.1 追加）', () => {
  it('任务卡为两行结构：第一行标记与任务名（含状态词），第二行进度与说明', () => {
    const wrapper = mount(SelectionTaskNavigator, { props: { tasks: spellTasks, modelValue: 'spellbook', completed: 1 } })
    const card = wrapper.get('[data-task-id="spellbook"]')

    const head = card.get('.selection-task-nav__head')
    expect(head.get('.selection-task-nav__mark').text()).toBe('•')
    expect(head.get('.selection-task-nav__label').text()).toBe('写入法术书')
    expect(head.get('.selection-task-nav__state').text()).toBe('当前')

    const meta = card.get('.selection-task-nav__meta')
    expect(meta.get('.selection-task-nav__progress').text()).toBe('6/14')
    expect(meta.get('.selection-task-nav__summary').text()).toBe('升级法术已写入')
  })

  it('无进度任务只显示说明，不渲染空的进度节点', () => {
    const wrapper = mount(SelectionTaskNavigator, { props: { tasks: spellTasks, modelValue: 'spells', completed: 1 } })
    const meta = wrapper.get('[data-task-id="spells"] .selection-task-nav__meta')
    expect(meta.find('.selection-task-nav__progress').exists()).toBe(false)
    expect(meta.get('.selection-task-nav__summary').text()).toBe('尚未选齐')
  })

  it('任务名、说明、进度与状态词仍全部出现在按钮文本中（读屏与既有断言依赖）', () => {
    const wrapper = mount(SelectionTaskNavigator, { props: { tasks: spellTasks, modelValue: 'spellbook-extra', completed: 1 } })
    const text = wrapper.get('[data-task-id="spellbook-extra"]').text()
    expect(text).toContain('子职额外入书')
    expect(text).toContain('已使用额外名额')
    expect(text).toContain('0/2')
    expect(text).toContain('当前')
  })

  it('列数固定 2 列、不再按视口切列', () => {
    expect(extractBlock('&__list {')).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))')
    const styleSection = navigatorSource.slice(navigatorSource.indexOf('<style'))
    expect(styleSection).not.toContain('@media (min-width')
    expect(styleSection).not.toContain('repeat(3')
  })

  it('状态词与状态标记不收缩、任务名与说明可收缩（防止再次互相挤压）', () => {
    expect(extractBlock('&__state {')).toContain('flex: none')
    expect(extractBlock('&__mark {')).toContain('flex: none')
    const label = extractBlock('&__label {')
    expect(label).toContain('min-width: 0')
    expect(label).toContain('text-overflow: ellipsis')
    const summary = extractBlock('&__summary {')
    expect(summary).toContain('min-width: 0')
    expect(summary).toContain('text-overflow: ellipsis')
  })
})
