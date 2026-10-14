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

/**
 * 检查点头部的两种标注（需求 D22）：
 * - 等级徽章 `.timeline-step__badge` 显示「N级」（圆形徽章容不下「职业 + 等级」）；
 * - 归属职业以 tag 形式出现在 `.timeline-step__title-row`（`UiBadge`，无归属职业时不渲染）。
 */
function badgeNumbers(draft: CharacterDraft): string[] {
  return mountTimeline(draft).findAll('.timeline-step__badge').map((item) => item.text())
}

/** 每个检查点的「等级徽章 + 职业 tag」配对，便于按检查点整体断言。 */
function checkpointHeaders(draft: CharacterDraft): { level: string; className: string; title: string; ariaLabel: string }[] {
  return mountTimeline(draft).findAll('.timeline-step__header').map((header) => ({
    level: header.get('.timeline-step__badge').text(),
    className: header.find('.timeline-step__title-row .ui-badge').exists()
      ? header.get('.timeline-step__title-row .ui-badge').text()
      : '',
    title: header.get('.timeline-step__title-row strong').text(),
    ariaLabel: header.get('.timeline-step__badge').attributes('aria-label') ?? '',
  }))
}

describe('MC-E04 时间线多职业标注', () => {
  it('徽章显示「N级」，职业名以 tag 出现在标题行（D22）', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    const headers = checkpointHeaders(draft)
    expect(headers.length).toBeGreaterThan(0)
    // 徽章是「数字 + 级」，不带职业名
    for (const header of headers) {
      expect(header.level).toMatch(/^\d+级$/)
      expect(header.className).toMatch(/^(战士|游荡者)$/)
      // 合成语义仍可读到「职业 第 N 级」，读屏不会只读出一个数字
      expect(header.ariaLabel).toBe(`${header.className} 第 ${header.level.replace('级', '')} 级`)
    }
    // 角色总等级 5：徽章里出现的是各职业自己的等级，不出现总等级 5
    const totalOwned = headers.filter((header) => header.title.includes('子职'))
    expect(totalOwned.every((header) => header.level === '3级')).toBe(true)
    expect(badgeNumbers(draft)).not.toContain('5级')
  })

  it('同职业的不同检查点各自显示自己的解锁等级（战士 1 级技能、3 级子职）', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    const headers = checkpointHeaders(draft)
    const fighterLevels = headers.filter((header) => header.className === '战士').map((header) => header.level)
    expect(fighterLevels).toContain('1级')
    expect(fighterLevels).toContain('3级')
    // 游荡者只到 2 级：1 级的技能与专精各一条，不出现 3 级
    const rogueLevels = headers.filter((header) => header.className === '游荡者').map((header) => header.level)
    expect(rogueLevels.filter((level) => level === '1级')).toHaveLength(2)
    expect(rogueLevels).not.toContain('3级')
  })

  it('无归属职业的检查点不渲染职业 tag', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    const headers = checkpointHeaders(draft)
    const untagged = headers.filter((header) => header.className === '')
    // 无 tag 时 aria-label 退化为「第 N 级」，不出现空职业名
    for (const header of untagged) {
      expect(header.ariaLabel).toBe(`第 ${header.level.replace('级', '')} 级`)
      expect(header.ariaLabel).not.toContain(' 第')
    }
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
