import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import TimelineStep from '@/views/character-builder/components/TimelineStep.vue'
import EquipmentStep from '@/views/character-builder/components/EquipmentStep.vue'
import { deriveCharacter } from '@/rules/derive'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { buildTimelineForDraft } from '@/rules/timeline'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft } from '@/types/character'

const ABILITIES: AbilityScores = { str: 15, dex: 14, con: 13, int: 13, wis: 13, cha: 13 }

beforeEach(() => {
  setActivePinia(createPinia())
})

interface ClassSpec {
  readonly classId: string
  readonly level: number
  readonly subclassId?: string
}

function mc(classes: readonly ClassSpec[], overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  const order = classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  const first = classes[0]
  return draft2024({
    ruleset: '5e-2014',
    baseAbilities: ABILITIES,
    classId: first?.classId,
    subclassId: first?.subclassId,
    targetLevel: order.length,
    multiclass: { enabled: true, primaryClassId: first?.classId ?? '', classes, levelOrder: order },
    manualEdits: EMPTY_MANUAL_EDITS,
    ...overrides,
  })
}

function mountTimeline(draft: CharacterDraft) {
  return mount(TimelineStep, {
    props: {
      classId: 'class-2014-fighter',
      targetLevel: draft.targetLevel,
      backgroundSkillIds: [],
      selections: draft.selections,
      draft,
    },
  })
}

function levelLabels(draft: CharacterDraft): string[] {
  const wrapper = mountTimeline(draft)
  return wrapper.findAll('.timeline-step__header span').map((item) => item.text())
}

describe('MC-E04 时间线多职业标注', () => {
  it('检查点头部按归属职业标注，不把角色总等级当成职业等级', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    const labels = levelLabels(draft)
    const levelLabelPattern = /^\S+ \d+ 级$/
    // 每个「N 级」形式的标签都必须带归属职业前缀
    const levelLike = labels.filter((text) => text.endsWith('级'))
    expect(levelLike.length).toBeGreaterThan(0)
    expect(levelLike.every((text) => levelLabelPattern.test(text))).toBe(true)
    expect(labels.some((text) => text.startsWith('战士'))).toBe(true)
    expect(labels.some((text) => text.startsWith('游荡者'))).toBe(true)
    // 角色总等级为 5，但没有任何标签写成裸的「5 级」
    expect(labels).not.toContain('5 级')
  })

  it('同职业的不同检查点各自显示自己的解锁等级（战士 1 级技能、3 级子职）', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    const labels = levelLabels(draft)
    expect(labels).toContain('战士 1 级')
    expect(labels).toContain('战士 3 级')
    // 游荡者只到 2 级：1 级的技能与专精各一条，3 级子职检查点不出现
    expect(labels.filter((text) => text === '游荡者 1 级')).toHaveLength(2)
    expect(labels).not.toContain('游荡者 3 级')
  })

  it('职业特性区块列出全部职业的自动获得特性并标注归属职业与职业等级', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-barbarian', level: 5 },
    ])
    const wrapper = mountTimeline(draft)
    const heading = wrapper.findAll('h4').find((item) => item.text().startsWith('职业特性'))
    expect(heading?.text()).toContain('战士')
    expect(heading?.text()).toContain('野蛮人')
    const text = wrapper.text()
    // 野蛮人 5 级解锁的额外攻击出现在列表里，并标注职业与职业等级
    expect(text).toContain('额外攻击')
    expect(text).toContain('野蛮人 5级')
    // 战士只到 3 级：不应出现该职业 5 级的特性
    expect(text).not.toContain('战士 5级')
  })
})

describe('MC-E04 唯一组与兼职去重', () => {
  it('职业自带的同类检查点保持全局同名组（跨等级去重不被兼职破坏）', () => {
    const draft = mc([
      { classId: 'class-2014-rogue', level: 6 },
      { classId: 'class-2014-bard', level: 3 },
    ])
    const rogueExpertise = buildTimelineForDraft(draft)
      .filter((checkpoint) => checkpoint.kind === 'expertise' && checkpoint.classId === 'class-2014-rogue')
      .map((checkpoint) => checkpoint.uniqueGroup)
    // 1 级与 6 级专精同组 → 跨等级不可重复选择
    expect(rogueExpertise.length).toBeGreaterThanOrEqual(2)
    expect(new Set(rogueExpertise)).toEqual(new Set(['expertise']))
  })

  it('子职特性检查点的唯一组按职业限定，两个职业互不锁死', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3, subclassId: 'subclass-2014-fighter-battle-master' },
      { classId: 'class-2014-rogue', level: 3, subclassId: 'subclass-2014-rogue-assassin' },
    ])
    const groups = buildTimelineForDraft(draft)
      .filter((checkpoint) => checkpoint.id.startsWith('subclass-feature-'))
      .map((checkpoint) => checkpoint.uniqueGroup)
      .filter((group): group is string => Boolean(group))
    expect(groups.length).toBeGreaterThan(0)
    expect(groups.every((group) => group.includes(':'))).toBe(true)
  })
})

describe('MC-E04 装备步骤起始职业口径', () => {
  it('兼职时提示起始装备只来自起始职业', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    const wrapper = mount(EquipmentStep, {
      props: { draft, derived: deriveCharacter(draft) },
      global: { stubs: { teleport: true } },
    })
    expect(wrapper.text()).toContain('起始装备来自起始职业「战士」')
    expect(wrapper.text()).toContain('兼职不会获得其他职业的起始装备')
  })

  it('单职业时不显示兼职提示', () => {
    const solo = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 3 })
    const wrapper = mount(EquipmentStep, {
      props: { draft: solo, derived: deriveCharacter(solo) },
      global: { stubs: { teleport: true } },
    })
    expect(wrapper.text()).not.toContain('兼职不会获得其他职业的起始装备')
  })
})
