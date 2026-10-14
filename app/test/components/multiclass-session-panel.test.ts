import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'

import SessionPanel from '@/views/session-assistant/components/SessionPanel.vue'
import { SessionStateStorageService } from '@/services/session-state-storage'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft, ClassLevelEntry } from '@/types/character'

/**
 * MC-E05 跑团助手多职业展示：职业行、生命骰按骰面消耗、同名资源合并。
 * 规则层口径见 `test/rules/multiclass-session-resources.test.ts`，这里只验证界面接线。
 */

const ABILITIES: AbilityScores = { str: 15, dex: 14, con: 13, int: 13, wis: 13, cha: 13 }

function mc(classes: readonly ClassLevelEntry[]): CharacterDraft {
  const order = classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  return draft2024({
    id: 'mc-session-panel',
    ruleset: '5e-2024',
    baseAbilities: ABILITIES,
    classId: classes[0]?.classId,
    targetLevel: order.length,
    multiclass: { enabled: true, primaryClassId: classes[0]?.classId ?? '', classes, levelOrder: order },
    manualEdits: EMPTY_MANUAL_EDITS,
  })
}

function buttonByText(wrapper: ReturnType<typeof mount>, text: string) {
  const button = wrapper.findAll('button').find((item) => item.text().includes(text))
  if (!button) throw new Error(`未找到按钮：${text}`)
  return button
}

/** 从页面文本里读出某个骰面组的「剩余 N / M 颗」。 */
function dieRemaining(text: string, die: number): number {
  const match = new RegExp(`生命骰 d${die}：剩余 (\\d+) / (\\d+) 颗`).exec(text)
  if (!match) throw new Error(`页面未渲染 d${die} 生命骰分组`)
  return Number(match[1])
}

describe('MC-E05 跑团助手多职业', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('头部显示多职业与总等级', () => {
    const wrapper = mount(SessionPanel, { props: { draft: mc([
      { classId: 'class-2024-cleric', level: 5 },
      { classId: 'class-2024-paladin', level: 10 },
    ]) } })
    expect(wrapper.text()).toContain('牧师5 / 圣武士10（15 级角色）')
    wrapper.unmount()
  })

  it('单职业头部不出现总等级括注', () => {
    const solo = draft2024({ ruleset: '5e-2024', classId: 'class-2024-cleric', targetLevel: 3 })
    const wrapper = mount(SessionPanel, { props: { draft: solo } })
    expect(wrapper.text()).toContain('牧师3')
    expect(wrapper.text()).not.toContain('级角色）')
    wrapper.unmount()
  })

  it('生命骰按骰面分组，消耗 d10 不影响 d8', async () => {
    const draft = mc([
      { classId: 'class-2024-paladin', level: 10 },
      { classId: 'class-2024-cleric', level: 5 },
    ])
    const wrapper = mount(SessionPanel, { props: { draft } })
    // 圣武士 d10×10 + 牧师 d8×5
    expect(dieRemaining(wrapper.text(), 10)).toBe(10)
    expect(dieRemaining(wrapper.text(), 8)).toBe(5)
    expect(wrapper.text()).toContain('生命骰共剩余 15 / 15 颗')

    await buttonByText(wrapper, '掷骰消耗 1 颗 d10').trigger('click')
    await nextTick()
    expect(dieRemaining(wrapper.text(), 10)).toBe(9)
    expect(dieRemaining(wrapper.text(), 8)).toBe(5)
    expect(wrapper.text()).toContain('生命骰共剩余 14 / 15 颗')

    await buttonByText(wrapper, '直接回 1 颗（5）').trigger('click')
    await nextTick()
    expect(dieRemaining(wrapper.text(), 10)).toBe(9)
    expect(dieRemaining(wrapper.text(), 8)).toBe(4)

    // 按骰面分别记账：d10 组已用 1，d8 组已用 1
    const pool = SessionStateStorageService.load(draft.id)?.hitDice
    expect(pool?.byDie?.[10]).toEqual({ total: 10, spent: 1 })
    expect(pool?.byDie?.[8]).toEqual({ total: 5, spent: 1 })
    wrapper.unmount()
  })

  it('某骰面耗尽后只有该组按钮禁用', async () => {
    const draft = mc([
      { classId: 'class-2024-paladin', level: 10 },
      { classId: 'class-2024-cleric', level: 1 },
    ])
    const wrapper = mount(SessionPanel, { props: { draft } })
    const d8Button = buttonByText(wrapper, '掷骰消耗 1 颗 d8')
    const d10Button = buttonByText(wrapper, '掷骰消耗 1 颗 d10')
    expect(d8Button.attributes('disabled')).toBeUndefined()
    expect(d10Button.attributes('disabled')).toBeUndefined()

    await d8Button.trigger('click')
    await nextTick()
    const spentD8 = buttonByText(wrapper, '掷骰消耗 1 颗 d8')
    const stillD10 = buttonByText(wrapper, '掷骰消耗 1 颗 d10')
    expect(spentD8.attributes('disabled')).toBeDefined()
    expect(stillD10.attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })

  it('同名资源合并为一个计数池并说明来源', () => {
    const wrapper = mount(SessionPanel, { props: { draft: mc([
      { classId: 'class-2024-cleric', level: 5 },
      { classId: 'class-2024-paladin', level: 10 },
    ]) } })
    // 只出现一个引导神力计数池，上限取各来源较高者（牧师5 = 2、圣武士10 = 2）
    expect(wrapper.text().match(/引导神力/g)).toHaveLength(1)
    expect(wrapper.text()).toContain('剩余 2 / 2 次')
    expect(wrapper.text()).toContain('由牧师、圣武士共用同一计数池')
    wrapper.unmount()
  })

  it('单职业不显示合并来源说明', () => {
    const solo = draft2024({ ruleset: '5e-2024', classId: 'class-2024-cleric', targetLevel: 3 })
    const wrapper = mount(SessionPanel, { props: { draft: solo } })
    expect(wrapper.text()).toContain('引导神力')
    expect(wrapper.text()).not.toContain('共用同一计数池')
    wrapper.unmount()
  })
})
