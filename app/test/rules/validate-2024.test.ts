import { describe, expect, it } from 'vitest'

import { buildTimeline } from '@/rules/timeline'
import { validateDraft } from '@/rules/validate'
import { draft2024, selection } from '../fixtures/draft-2024'

function issueIds(draft: Parameters<typeof validateDraft>[0]): readonly string[] {
  return validateDraft(draft).map((issue) => issue.id)
}

describe('2024 专长时间线约束', () => {
  it('战士成长检查点按等级展开四类候选池', () => {
    const timeline = buildTimeline('class-2024-fighter', 19, { ruleset: '5e-2024' })
    const style = timeline.find((checkpoint) => checkpoint.id === 'class-2024-fighter-style-1')
    const levelFour = timeline.find((checkpoint) => checkpoint.id === 'class-2024-fighter-feat-4')
    const levelNineteen = timeline.find((checkpoint) => checkpoint.id === 'class-2024-fighter-feat-19')
    expect(style?.kind).toBe('fighting-style')
    expect(style?.optionIds).toHaveLength(10)
    expect(style?.optionIds).toContain('feat-2024-archery')
    expect(levelFour?.optionIds).toHaveLength(43)
    expect(levelFour?.optionIds).not.toContain('feat-2024-boon-of-fate')
    expect(levelNineteen?.optionIds).toHaveLength(55)
    expect(levelNineteen?.optionIds).toContain('feat-2024-boon-of-fate')
  })

  it('人类授予额外起源专长检查点，法师不出现战斗风格候选', () => {
    const timeline = buildTimeline('class-2024-wizard', 4, { ruleset: '5e-2024', raceId: 'species-2024-human' })
    const speciesFeat = timeline.find((checkpoint) => checkpoint.id === 'species-2024-human-origin-feat')
    expect(speciesFeat?.kind).toBe('feat')
    expect(speciesFeat?.optionIds).toHaveLength(10)
    expect(timeline.some((checkpoint) => checkpoint.kind === 'fighting-style')).toBe(false)
  })
})

describe('2024 专长校验', () => {
  it('前置按获得节点校验：4 级属性不足时，最终属性满足也报错（TC-011）', () => {
    const draft = draft2024({
      targetLevel: 8,
      baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 12 },
      selections: [
        selection('class-2024-fighter-feat-4', ['feat-2024-actor']),
        selection('feat-child:class-2024-fighter-feat-4:feat-2024-actor:ability', ['feat-bonus-cha-1']),
        selection('class-2024-fighter-feat-8', ['feat-2024-ability-score-improvement']),
        selection('feat-child:class-2024-fighter-feat-8:feat-2024-ability-score-improvement:ability-score', ['asi-2024-cha-2']),
      ],
    })
    const issues = validateDraft(draft)
    expect(issues.some((issue) => issue.id.startsWith('feat-prerequisite-class-2024-fighter-feat-4-feat-2024-actor'))).toBe(true)
    expect(issues.some((issue) => issue.resolution.includes('魅力需要达到13'))).toBe(true)
  })

  it('同一不可复选专长跨等级重复取得时报错并说明来源', () => {
    const draft = draft2024({
      targetLevel: 6,
      selections: [
        selection('class-2024-fighter-feat-4', ['feat-2024-tough']),
        selection('class-2024-fighter-feat-6', ['feat-2024-tough']),
      ],
    })
    const issues = validateDraft(draft)
    expect(issues.some((issue) => issue.id === 'feat-duplicate-feat-2024-tough')).toBe(true)
    expect(issues.some((issue) => issue.message.includes('不可复选专长「健壮」被重复取得'))).toBe(true)
  })

  it('背景与人类同授可复选专长时不报重复（魔法学徒按换表处理）', () => {
    const draft = draft2024({
      raceId: 'species-2024-human',
      backgroundId: 'background-2024-sage',
      selections: [selection('species-2024-human-origin-feat', ['feat-2024-magic-initiate'])],
    })
    expect(validateDraft(draft).some((issue) => issue.id.startsWith('feat-duplicate-'))).toBe(false)
  })

  it('法师无法取得战斗风格专长', () => {
    const draft = draft2024({
      classId: 'class-2024-wizard',
      selections: [selection('class-2024-wizard-feat-4', ['feat-2024-archery'])],
    })
    expect(issueIds(draft).some((id) => id.startsWith('feat-prerequisite-class-2024-wizard-feat-4-feat-2024-archery'))).toBe(true)
  })

  it('普通属性提升不能超过 20', () => {
    const draft = draft2024({
      baseAbilities: { str: 19, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
      selections: [
        selection('class-2024-fighter-feat-4', ['feat-2024-ability-score-improvement']),
        selection('feat-child:class-2024-fighter-feat-4:feat-2024-ability-score-improvement:ability-score', ['asi-2024-str-2']),
      ],
    })
    expect(issueIds(draft).some((id) => id.includes('ability-improvement') && id.includes('asi-2024-str-2'))).toBe(true)
  })

  it('强健身心不能选择已有豁免熟练的属性', () => {
    const draft = draft2024({
      selections: [
        selection('class-2024-fighter-feat-4', ['feat-2024-resilient']),
        selection('feat-child:class-2024-fighter-feat-4:feat-2024-resilient:ability', ['feat-bonus-str-1']),
      ],
    })
    expect(issueIds(draft).some((id) => id.startsWith('feat-save-proficiency-'))).toBe(true)
  })

  it('19 级传奇恩惠允许属性超过 20', () => {
    const draft = draft2024({
      targetLevel: 19,
      baseAbilities: { str: 15, dex: 14, con: 20, int: 8, wis: 12, cha: 10 },
      selections: [
        selection('class-2024-fighter-feat-19', ['feat-2024-boon-of-fortitude']),
        selection('feat-child:class-2024-fighter-feat-19:feat-2024-boon-of-fortitude:ability', ['feat-bonus-con-1']),
      ],
    })
    expect(issueIds(draft).some((id) => id.startsWith('feat-ability-cap-'))).toBe(false)
  })
})
