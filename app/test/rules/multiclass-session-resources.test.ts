import { beforeEach, describe, expect, it } from 'vitest'

import { deriveCharacterSummary } from '@/rules/derive'
import { getClassLevelLabel, getHitDiceFaces } from '@/rules/multiclass-session'
import { listSessionResources } from '@/rules/session-resources'
import { getRulesRepository } from '@/rules/repositories'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft, ClassLevelEntry } from '@/types/character'

/**
 * MC-E05 跑团助手规则层：职业标签、生命骰骰面、资源按职业等级与同名合并。
 * 单职业结果必须与改造前逐字段一致。
 */

const ABILITIES: AbilityScores = { str: 15, dex: 14, con: 13, int: 13, wis: 13, cha: 13 }

function mc(ruleset: '5e-2014' | '5e-2024', classes: readonly ClassLevelEntry[], overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  const order = classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  return draft2024({
    ruleset,
    baseAbilities: ABILITIES,
    classId: classes[0]?.classId,
    subclassId: classes[0]?.subclassId,
    targetLevel: order.length,
    multiclass: { enabled: true, primaryClassId: classes[0]?.classId ?? '', classes, levelOrder: order },
    manualEdits: EMPTY_MANUAL_EDITS,
    ...overrides,
  })
}

beforeEach(() => {
  getRulesRepository('5e-2014')
})

describe('MC-E05 职业展示标签（需求 §3.1 统一格式）', () => {
  it('单职业为「职业+职业等级」，不出现总等级括注', () => {
    const solo = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5 })
    expect(getClassLevelLabel(solo)).toBe('战士5')
    expect(getClassLevelLabel(solo)).not.toContain('级角色')
  })

  it('多职业为「战士3 / 游荡者2（5 级角色）」', () => {
    const draft = mc('5e-2014', [
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    expect(getClassLevelLabel(draft)).toBe('战士3 / 游荡者2（5 级角色）')
  })

  it('未选职业返回空串（调用方退回「N 级」）', () => {
    const draft = draft2024({ ruleset: '5e-2014', classId: undefined, targetLevel: 3 })
    expect(getClassLevelLabel(draft)).toBe('')
  })

  it('职业无法解析时不打印原始 id，退回空串', () => {
    const draft = draft2024({ ruleset: '5e-2014', classId: 'class-2014-unknown', targetLevel: 3 })
    expect(getClassLevelLabel(draft)).toBe('')
  })

  it('部分职业无法解析时跳过该职业，不暴露英文 id', () => {
    const draft = mc('5e-2014', [
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-unknown', level: 2 },
    ])
    const label = getClassLevelLabel(draft)
    expect(label).toBe('战士3')
    expect(label).not.toContain('class-2014-unknown')
  })

  it('摘要携带同一标签，供车卡吸底摘要使用', () => {
    const draft = mc('5e-2014', [
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    expect(deriveCharacterSummary(draft).classLabel).toBe('战士3 / 游荡者2（5 级角色）')
    // 单职业草稿仍带 classLabel；未选职业时不带该字段
    expect(deriveCharacterSummary(draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5 })).classLabel).toBe('战士5')
    expect(deriveCharacterSummary(draft2024({ ruleset: '5e-2014', classId: undefined })).classLabel).toBeUndefined()
  })
})

describe('MC-E05 生命骰按骰面展开', () => {
  it('圣武士5/牧师5 → 5×d10 + 5×d8', () => {
    const draft = mc('5e-2014', [
      { classId: 'class-2014-paladin', level: 5 },
      { classId: 'class-2014-cleric', level: 5 },
    ])
    const faces = getHitDiceFaces(draft)
    expect(faces).toHaveLength(10)
    expect(faces.filter((die) => die === 10)).toHaveLength(5)
    expect(faces.filter((die) => die === 8)).toHaveLength(5)
  })

  it('单职业 5 级战士 → 5×d10（骰面与改造前一致）', () => {
    const solo = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5 })
    expect(getHitDiceFaces(solo)).toEqual([10, 10, 10, 10, 10])
  })
})

describe('MC-E05 资源：按职业等级取上限并合并同名池', () => {
  it('同名引导神力合并为一个计数池，上限按各自职业等级取较高者', () => {
    // 牧师5 → 2 次；圣武士10 → 2 次。若误用角色总等级 15，两条都会取到 3 次。
    const draft = mc('5e-2024', [
      { classId: 'class-2024-cleric', level: 5 },
      { classId: 'class-2024-paladin', level: 10 },
    ])
    const channelDivinity = listSessionResources(draft).filter((resource) => resource.name === '引导神力')
    expect(channelDivinity).toHaveLength(1)
    expect(channelDivinity[0]?.max).toBe(2)
    expect(channelDivinity[0]?.sharedSources).toEqual(['牧师', '圣武士'])
    expect(draft.targetLevel).toBe(15)
  })

  it('上限取各来源的最大值：牧师6（3 次）与圣武士3（2 次）合并为 3', () => {
    const draft = mc('5e-2024', [
      { classId: 'class-2024-cleric', level: 6 },
      { classId: 'class-2024-paladin', level: 3 },
    ])
    const merged = listSessionResources(draft).filter((resource) => resource.name === '引导神力')
    expect(merged).toHaveLength(1)
    expect(merged[0]?.max).toBe(3)
  })

  it('单职业资源不合并：无 sharedSources，上限与改造前一致', () => {
    const solo = draft2024({ ruleset: '5e-2024', classId: 'class-2024-cleric', targetLevel: 3 })
    const resources = listSessionResources(solo)
    const channelDivinity = resources.filter((resource) => resource.name === '引导神力')
    expect(channelDivinity).toHaveLength(1)
    expect(channelDivinity[0]?.max).toBe(2)
    expect(channelDivinity[0]?.sharedSources).toBeUndefined()
    expect(channelDivinity[0]?.id).toBe('cleric-2024-class-channel-divinity')
  })

  it('不同名资源各自独立成池', () => {
    const draft = mc('5e-2024', [
      { classId: 'class-2024-barbarian', level: 3 },
      { classId: 'class-2024-fighter', level: 3 },
    ])
    const names = listSessionResources(draft).map((resource) => resource.name)
    // 野蛮人「狂暴」与战士「回气」是两个独立池，不得互相合并
    expect(names).toContain('狂暴')
    expect(names).toContain('回气')
    expect(new Set(names).size).toBe(names.length)
  })
})
