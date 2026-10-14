import { describe, expect, it } from 'vitest'

import { buildTimeline, buildTimelineForDraft } from '@/rules/timeline'
import { getCheckpointSelectionBounds } from '@/rules/feats'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft } from '@/types/character'
import type { ClassLevelEntry } from '@/types/multiclass'

const ABILITIES: AbilityScores = { str: 15, dex: 14, con: 13, int: 13, wis: 12, cha: 10 }

function mc(classes: readonly ClassLevelEntry[], overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  const order = classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  return draft2024({
    ruleset: '5e-2014',
    baseAbilities: ABILITIES,
    classId: classes[0]?.classId,
    targetLevel: order.length,
    multiclass: { enabled: true, primaryClassId: classes[0]?.classId ?? '', classes, levelOrder: order },
    ...overrides,
  })
}

describe('MC-C01 单职业行为不变', () => {
  it('未提供 classes 时按 classId + targetLevel 合成，检查点带 classId 与 classLevel', () => {
    const timeline = buildTimeline('class-2014-fighter', 4, { ruleset: '5e-2014' })
    const classCheckpoints = timeline.filter((checkpoint) => checkpoint.id.startsWith('fighter-2014-'))
    expect(classCheckpoints.length).toBeGreaterThan(0)
    expect(classCheckpoints.every((checkpoint) => checkpoint.classId === 'class-2014-fighter')).toBe(true)
    expect(classCheckpoints.every((checkpoint) => checkpoint.classLevel === checkpoint.level)).toBe(true)
  })

  it('未知职业返回空时间线', () => {
    expect(buildTimeline('', 5, { ruleset: '5e-2014' })).toEqual([])
    expect(buildTimeline('class-2014-unknown', 5, { ruleset: '5e-2014' })).toEqual([])
  })
})

describe('MC-C01 多职业时间线', () => {
  it('每个职业只展开到自己的等级（战士3/游荡者2）', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    const timeline = buildTimelineForDraft(draft)
    const fighter = timeline.filter((checkpoint) => checkpoint.classId === 'class-2014-fighter')
    const rogue = timeline.filter((checkpoint) => checkpoint.classId === 'class-2014-rogue')
    expect(fighter.length).toBeGreaterThan(0)
    expect(rogue.length).toBeGreaterThan(0)
    // 战士 3 级：不含 4 级属性提升；游荡者只有 2 级
    expect(fighter.every((checkpoint) => checkpoint.classLevel !== undefined && checkpoint.classLevel <= 3)).toBe(true)
    expect(rogue.every((checkpoint) => checkpoint.classLevel !== undefined && checkpoint.classLevel <= 2)).toBe(true)
    expect(timeline.some((checkpoint) => checkpoint.id === 'fighter-2014-asi-4')).toBe(false)
  })

  it('检查点 id 唯一且不重复', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    const ids = buildTimelineForDraft(draft).map((checkpoint) => checkpoint.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('子职检查点按各职业展开，且只在该职业等级达标时出现', () => {
    // 战士 3 级（子职 3 级解锁）+ 游荡者 2 级（子职 3 级未解锁）
    const early = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    const earlyTimeline = buildTimelineForDraft(early)
    expect(earlyTimeline.some((checkpoint) => checkpoint.kind === 'subclass' && checkpoint.classId === 'class-2014-fighter')).toBe(true)
    expect(earlyTimeline.some((checkpoint) => checkpoint.kind === 'subclass' && checkpoint.classId === 'class-2014-rogue')).toBe(false)

    // 游荡者升到 3 级后出现
    const later = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 3 },
    ])
    const laterTimeline = buildTimelineForDraft(later)
    expect(laterTimeline.some((checkpoint) => checkpoint.kind === 'subclass' && checkpoint.classId === 'class-2014-rogue')).toBe(true)
  })

  it('各职业子职分别追加其子职特性检查点（战斗大师战技）', () => {
    // 战斗大师 3 级「战斗大师战技」是需要玩家选择的子职特性
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3, subclassId: 'subclass-2014-fighter-battle-master' },
      { classId: 'class-2014-wizard', level: 2, subclassId: 'subclass-2014-wizard-evocation' },
    ])
    const timeline = buildTimelineForDraft(draft)
    const featureIds = timeline.filter((checkpoint) => checkpoint.id.startsWith('subclass-feature-')).map((checkpoint) => checkpoint.id)
    expect(featureIds.some((id) => id.includes('battle-master'))).toBe(true)
    // 子职特性按各自职业等级过滤：战士只到 3 级，不含 7 级追加战技
    expect(featureIds.some((id) => id.includes('extra-maneuvers-7'))).toBe(false)
    // 特性检查点的归属职业正确
    const battleMaster = timeline.find((checkpoint) => checkpoint.id.startsWith('subclass-feature-') && checkpoint.id.includes('battle-master'))
    expect(battleMaster?.classId).toBe('class-2014-fighter')
  })

  it('第三个职业也能正确展开（战士3/游荡者2/法师2）', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
      { classId: 'class-2014-wizard', level: 2 },
    ])
    const timeline = buildTimelineForDraft(draft)
    const byClass = new Set(timeline.map((checkpoint) => checkpoint.classId).filter(Boolean))
    expect(byClass.has('class-2014-fighter')).toBe(true)
    expect(byClass.has('class-2014-rogue')).toBe(true)
    expect(byClass.has('class-2014-wizard')).toBe(true)
  })

  it('按另一个总等级重算时间线时，职业等级按比例缩放（targetLevelOverride）', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 6 },
      { classId: 'class-2014-rogue', level: 4 },
    ])
    const atFive = buildTimelineForDraft(draft, { targetLevelOverride: 5 })
    const levels = atFive.filter((checkpoint) => checkpoint.classId).map((checkpoint) => checkpoint.level)
    expect(Math.max(...levels)).toBeLessThanOrEqual(5)
    expect(atFive.some((checkpoint) => checkpoint.id === 'fighter-2014-asi-6')).toBe(false)
  })

  it('2024 多职业同样按各职业等级展开（战士3/法师3，法师子职 3 级解锁）', () => {
    const draft = draft2024({
      ruleset: '5e-2024',
      baseAbilities: ABILITIES,
      classId: 'class-2024-fighter',
      targetLevel: 6,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2024-fighter',
        classes: [{ classId: 'class-2024-fighter', level: 3 }, { classId: 'class-2024-wizard', level: 3 }],
        levelOrder: ['class-2024-fighter', 'class-2024-fighter', 'class-2024-fighter', 'class-2024-wizard', 'class-2024-wizard', 'class-2024-wizard'],
      },
    })
    const timeline = buildTimelineForDraft(draft)
    expect(timeline.some((checkpoint) => checkpoint.id === 'class-2024-fighter-subclass-3')).toBe(true)
    expect(timeline.some((checkpoint) => checkpoint.id === 'class-2024-wizard-subclass-3')).toBe(true)
  })
})

describe('MC-C01 检查点按归属职业等级取值', () => {
  it('2024 战士武器精通按战士等级取值（兼职时不按总等级）', () => {
    const draft = draft2024({
      ruleset: '5e-2024',
      baseAbilities: ABILITIES,
      classId: 'class-2024-fighter',
      targetLevel: 10,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2024-fighter',
        classes: [{ classId: 'class-2024-fighter', level: 2 }, { classId: 'class-2024-wizard', level: 8 }],
        levelOrder: [...Array.from({ length: 2 }, () => 'class-2024-fighter'), ...Array.from({ length: 8 }, () => 'class-2024-wizard')],
      },
    })
    const mastery = buildTimelineForDraft(draft).find((checkpoint) => checkpoint.candidateKind === 'weapon-mastery')
    expect(mastery?.classId).toBe('class-2024-fighter')
    // 战士 2 级 → 3 项（若误用总等级 10 会得到 4 项）
    expect(getCheckpointSelectionBounds(draft, mastery as never)).toEqual({ min: 3, max: 3 })
  })
})
