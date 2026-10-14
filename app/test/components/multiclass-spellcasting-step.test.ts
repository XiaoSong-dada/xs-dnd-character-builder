import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import SpellcastingStep from '@/views/character-builder/components/SpellcastingStep.vue'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { draft2024, emptySpellSelections } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft, ClassLevelEntry, ClassSpellSelections } from '@/types/character'

/**
 * MC-D03：第 8 步按**职业**分派任务与候选。
 *
 * 锁定案例 `游侠4/术士3`：两个职业各自成组，候选互不串味，写回落到各自的分桶。
 */

const ABILITIES: AbilityScores = { str: 13, dex: 14, con: 13, int: 13, wis: 13, cha: 16 }

const RANGER_SORCERER: readonly ClassLevelEntry[] = [
  { classId: 'class-2014-ranger', level: 4 },
  { classId: 'class-2014-sorcerer', level: 3 },
]

function mc(buckets?: readonly ClassSpellSelections[]): CharacterDraft {
  const order = RANGER_SORCERER.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  return draft2024({
    ruleset: '5e-2014',
    baseAbilities: ABILITIES,
    classId: 'class-2014-ranger',
    targetLevel: 7,
    multiclass: { enabled: true, primaryClassId: 'class-2014-ranger', classes: RANGER_SORCERER, levelOrder: order },
    manualEdits: EMPTY_MANUAL_EDITS,
    spellSelections: { ...emptySpellSelections(), ...(buckets ? { classSpellSelections: buckets } : {}) },
  })
}

function taskLabels(wrapper: ReturnType<typeof mount>): string[] {
  return wrapper.findAll('[data-task-id]').map((item) => item.attributes('data-task-id') ?? '')
}

const EMPTY_BUCKETS: readonly ClassSpellSelections[] = [
  { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
  { classId: 'class-2014-sorcerer', cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
]

describe('MC-D03 法术步骤按职业分派', () => {
  it('两个施法职业各自生成带职业前缀的任务', () => {
    const wrapper = mount(SpellcastingStep, { props: { draft: mc(EMPTY_BUCKETS) } })
    const ids = taskLabels(wrapper)
    // 游侠 4 级：已知 3 个、无戏法 → 只有「掌握法术」
    expect(ids).toContain('class-2014-ranger:spells')
    expect(ids).not.toContain('class-2014-ranger:cantrips')
    // 术士 3 级：4 个戏法 + 4 个已知法术
    expect(ids).toContain('class-2014-sorcerer:cantrips')
    expect(ids).toContain('class-2014-sorcerer:spells')
    // 任务标题带职业名，玩家能分辨是哪一本法术列表
    expect(wrapper.text()).toContain('掌握法术 · 游侠')
    expect(wrapper.text()).toContain('选择戏法 · 术士')
  })

  it('游侠侧候选不含 2 环游侠法术，术士侧候选不含 3 环术士法术', () => {
    const wrapper = mount(SpellcastingStep, { props: { draft: mc(EMPTY_BUCKETS) } })
    // 手动切到游侠任务
    const rangerTask = wrapper.findAll('[data-task-id]').find((item) => item.attributes('data-task-id') === 'class-2014-ranger:spells')
    expect(rangerTask).toBeDefined()
    const text = wrapper.text()
    expect(text).toContain('疗伤术')
    // 树肤术是 2 环游侠法术，游侠 4 级时不可选
    expect(text).not.toContain('树肤术')
  })

  it('术士侧任务显示术士自己的计数（4 / 4 戏法）', () => {
    const wrapper = mount(SpellcastingStep, { props: { draft: mc(EMPTY_BUCKETS) } })
    const sorcererCantrips = wrapper.findAll('[data-task-id]').find((item) => item.attributes('data-task-id') === 'class-2014-sorcerer:cantrips')
    expect(sorcererCantrips?.text()).toContain('0/4')
  })

  it('法术位显示兼职通用池（4/3/2）', () => {
    const wrapper = mount(SpellcastingStep, { props: { draft: mc(EMPTY_BUCKETS) } })
    expect(wrapper.text()).toContain('1环×4 · 2环×3 · 3环×2')
  })

  it('选中术士戏法时写回术士分桶而不是顶层数组', async () => {
    // 卡片的选择是防误触的延迟判定（250ms 双击窗口），需要假定时器推进。
    vi.useFakeTimers()
    try {
      const wrapper = mount(SpellcastingStep, { props: { draft: mc(EMPTY_BUCKETS) } })
      // 切到术士戏法任务，并选择候选列表里的第一项（酸液飞溅）
      await wrapper.get('button[data-task-id="class-2014-sorcerer:cantrips"]').trigger('click')
      await wrapper.vm.$nextTick()
      const firstCard = wrapper.find('.expandable-option-card')
      expect(firstCard.exists()).toBe(true)
      expect(firstCard.text()).toContain('酸液飞溅')
      await firstCard.get('button.expandable-option-card__main').trigger('click')
      vi.advanceTimersByTime(300)
      await wrapper.vm.$nextTick()

      const emitted = wrapper.emitted('change')
      expect(emitted).toBeTruthy()
      const next = emitted?.at(-1)?.[0] as CharacterDraft['spellSelections']
      const sorcerer = next.classSpellSelections?.find((bucket) => bucket.classId === 'class-2014-sorcerer')
      const ranger = next.classSpellSelections?.find((bucket) => bucket.classId === 'class-2014-ranger')
      expect(sorcerer?.cantripIds).toEqual(['spell-2014-acid-splash'])
      expect(ranger?.cantripIds).toEqual([])
      // 顶层数组是并集兼容视图，与分桶一致
      expect(next.cantripIds).toEqual(sorcerer?.cantripIds)
    } finally {
      vi.useRealTimers()
    }
  })
})
