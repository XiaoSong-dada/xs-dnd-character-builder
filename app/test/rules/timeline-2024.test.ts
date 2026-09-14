import { describe, expect, it } from 'vitest'

import { getCheckpointSelectionBounds } from '@/rules/feats'
import { buildTimeline } from '@/rules/timeline'
import { draft2024 } from '../fixtures/draft-2024'

const fighterTimeline = (level: number, subclassId?: string) =>
  buildTimeline('class-2024-fighter', level, { ruleset: '5e-2024', subclassId })

describe('2024 职业时间线（B08-01）', () => {
  it('1 级展开技能、战斗风格与武器精通', () => {
    const timeline = fighterTimeline(1)
    expect(timeline.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-fighter-skills-1',
      'class-2024-fighter-style-1',
      'class-2024-fighter-mastery-1',
    ])
  })

  it('子职检查点由仓库提供勇士候选，标题按 2024 口径生成', () => {
    const timeline = fighterTimeline(3)
    const subclass = timeline.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclass?.id).toBe('class-2024-fighter-subclass-3')
    expect(subclass?.title).toBe('选择战士子职')
    expect(subclass?.optionIds).toEqual(['subclass-2024-fighter-champion'])
  })

  it('属性提升检查点按 4／6／8／12／14／16／19 级展开', () => {
    const timeline = fighterTimeline(19)
    expect(timeline.filter((checkpoint) => checkpoint.kind === 'ability-improvement').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-fighter-feat-4',
      'class-2024-fighter-feat-6',
      'class-2024-fighter-feat-8',
      'class-2024-fighter-feat-12',
      'class-2024-fighter-feat-14',
      'class-2024-fighter-feat-16',
      'class-2024-fighter-feat-19',
    ])
    expect(timeline.find((checkpoint) => checkpoint.id === 'class-2024-fighter-feat-19')?.optionIds).toContain('feat-2024-boon-of-fate')
  })

  it('武器精通数量随等级 3／4／5／6，且为动态候选', () => {
    const checkpoint = fighterTimeline(16).find((item) => item.candidateKind === 'weapon-mastery')
    if (!checkpoint) throw new Error('缺少武器精通检查点')
    const boundsAt = (level: number) => getCheckpointSelectionBounds({ ...draft2024(), targetLevel: level }, checkpoint)
    expect([1, 4, 10, 16, 20].map((level) => boundsAt(level).max)).toEqual([3, 4, 5, 6, 6])
    expect(checkpoint.optionIds).toEqual([])
  })

  it('勇士子职特性检查点按等级展开，额外战斗风格候选为战斗风格专长', () => {
    const atSix = fighterTimeline(6, 'subclass-2024-fighter-champion')
    expect(atSix.some((checkpoint) => checkpoint.id === 'subclass-feature-fighter-2024-champion-additional-fighting-style')).toBe(false)
    // 被动特性不生成选择检查点，6 级没有需要选择的子职特性。
    expect(atSix.filter((checkpoint) => checkpoint.id.startsWith('subclass-feature-'))).toEqual([])
    const atSeven = fighterTimeline(7, 'subclass-2024-fighter-champion')
    const additional = atSeven.find((checkpoint) => checkpoint.id === 'subclass-feature-fighter-2024-champion-additional-fighting-style')
    expect(additional?.optionIds).toHaveLength(10)
    expect(additional?.optionIds).toContain('feat-2024-archery')
    const atEighteen = fighterTimeline(18, 'subclass-2024-fighter-champion')
    expect(atEighteen.filter((checkpoint) => checkpoint.id.startsWith('subclass-feature-')).map((checkpoint) => checkpoint.id)).toEqual([
      'subclass-feature-fighter-2024-champion-additional-fighting-style',
    ])
  })

  it('直建 20 级包含逐级升级的全部检查点', () => {
    const levelTwenty = fighterTimeline(20)
    for (let level = 1; level <= 20; level += 1) {
      const ids = fighterTimeline(level).map((checkpoint) => checkpoint.id)
      expect(ids.every((id) => levelTwenty.some((checkpoint) => checkpoint.id === id))).toBe(true)
    }
  })

  it('法师时间线展开技能、学者、子职与高等级法术选择', () => {
    const levelThree = buildTimeline('class-2024-wizard', 3, { ruleset: '5e-2024' })
    expect(levelThree.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-wizard-skills-1',
      'class-2024-wizard-scholar-2',
      'class-2024-wizard-subclass-3',
    ])
    expect(levelThree.find((checkpoint) => checkpoint.kind === 'subclass')?.optionIds).toEqual(['subclass-2024-wizard-evoker'])

    const levelTwo = buildTimeline('class-2024-wizard', 2, { ruleset: '5e-2024' })
    expect(levelTwo.some((checkpoint) => checkpoint.kind === 'subclass')).toBe(false)

    const levelTwenty = buildTimeline('class-2024-wizard', 20, { ruleset: '5e-2024' })
    const mastery = levelTwenty.filter((checkpoint) => checkpoint.id.startsWith('class-2024-wizard-spell-mastery-'))
    expect(mastery.map((checkpoint) => checkpoint.candidateKind)).toEqual(['spellbook-level-1', 'spellbook-level-2'])
    expect(mastery.every((checkpoint) => checkpoint.spellCastingTime === '动作' && checkpoint.spellGrant?.alwaysPrepared)).toBe(true)

    const signature = levelTwenty.find((checkpoint) => checkpoint.id === 'class-2024-wizard-signature-spells-20')
    expect(signature?.candidateKind).toBe('spellbook-level-3')
    expect(signature?.minSelections).toBe(2)
    expect(signature?.spellGrant).toEqual({ alwaysPrepared: true, freeCastings: 1, recovery: 'short-rest' })
  })

  it('野蛮人时间线展开技能、武器精通、原初学识与道途', () => {
    const levelOne = buildTimeline('class-2024-barbarian', 1, { ruleset: '5e-2024' })
    expect(levelOne.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-barbarian-skills-1',
      'class-2024-barbarian-mastery-1',
    ])

    const levelThree = buildTimeline('class-2024-barbarian', 3, { ruleset: '5e-2024' })
    expect(levelThree.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-barbarian-skills-1',
      'class-2024-barbarian-mastery-1',
      'class-2024-barbarian-primal-knowledge-3',
      'class-2024-barbarian-subclass-3',
    ])
    expect(levelThree.find((checkpoint) => checkpoint.kind === 'subclass')?.optionIds).toHaveLength(4)

    const levelTwenty = buildTimeline('class-2024-barbarian', 20, { ruleset: '5e-2024' })
    expect(levelTwenty.filter((checkpoint) => checkpoint.kind === 'ability-improvement').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-barbarian-feat-4',
      'class-2024-barbarian-feat-8',
      'class-2024-barbarian-feat-12',
      'class-2024-barbarian-feat-16',
      'class-2024-barbarian-feat-19',
    ])
    const mastery = levelTwenty.find((checkpoint) => checkpoint.candidateKind === 'weapon-mastery')
    expect(mastery?.weaponMasteryFilter).toBe('melee')
    expect(getCheckpointSelectionBounds(draft2024({ targetLevel: 20 }), mastery!).max).toBe(4)
  })
})
