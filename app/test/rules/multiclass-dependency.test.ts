import { describe, expect, it } from 'vitest'

import { getDependencyImpact } from '@/rules/dependency'
import { validateMulticlassAllocation } from '@/rules/validate'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft } from '@/types/character'

const ABILITIES: AbilityScores = { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 }

function mc(classes: readonly { readonly classId: string; readonly level: number; readonly subclassId?: string }[], overrides: Partial<CharacterDraft> = {}): CharacterDraft {
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

describe('MC-C03 class-allocation 依赖影响', () => {
  it('新增职业时把新检查点列入待补全', () => {
    const draft = mc([{ classId: 'class-2014-fighter', level: 3 }])
    const impact = getDependencyImpact(draft, {
      kind: 'class-allocation',
      classes: [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 1 }],
    })
    expect(impact.added?.some((item) => item.checkpointId.startsWith('rogue-2014-'))).toBe(true)
    expect(impact.invalidated).toEqual([])
    // 总等级由 3 升到 4，属升级方向
    expect(impact.reviews).toBeUndefined()
  })

  it('降级某职业时把超出范围的检查点列入将失效', () => {
    const draft = mc(
      [{ classId: 'class-2014-fighter', level: 5 }, { classId: 'class-2014-rogue', level: 1 }],
      { selections: [{ checkpointId: 'fighter-2014-asi-4', optionIds: ['asi-str-2'], confirmedAt: '' }] },
    )
    const impact = getDependencyImpact(draft, {
      kind: 'class-allocation',
      classes: [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 1 }],
    })
    expect(impact.invalidated).toContain('fighter-2014-asi-4')
    expect(impact.invalidatedDetails?.some((item) => item.checkpointId === 'fighter-2014-asi-4')).toBe(true)
    expect(impact.reviews?.length).toBeGreaterThan(0)
  })

  it('移除职业时该职业的选择全部进入将失效', () => {
    const draft = mc(
      [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 2 }],
      { selections: [{ checkpointId: 'rogue-2014-skills-1', optionIds: ['skill-stealth'], confirmedAt: '' }] },
    )
    const impact = getDependencyImpact(draft, {
      kind: 'class-allocation',
      classes: [{ classId: 'class-2014-fighter', level: 3 }],
    })
    expect(impact.invalidated).toContain('rogue-2014-skills-1')
  })

  it('关闭开关触发的合并：总等级不变、职业集合变化', () => {
    const draft = mc(
      [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 2 }],
      { selections: [{ checkpointId: 'rogue-2014-skills-1', optionIds: ['skill-stealth'], confirmedAt: '' }] },
    )
    const impact = getDependencyImpact(draft, {
      kind: 'class-allocation',
      enabled: false,
      classes: [{ classId: 'class-2014-fighter', level: 5 }],
    })
    expect(impact.invalidated).toContain('rogue-2014-skills-1')
    // 总等级不变 → 不产生升级补全提示，也不产生降级复查
    expect(impact.added?.some((item) => item.checkpointId === 'fighter-2014-asi-4')).toBe(true)
    expect(impact.review).toContain('起始职业豁免熟练')
  })

  it('清空职业集合时作废全部选择（等同换职业）', () => {
    const draft = mc([{ classId: 'class-2014-fighter', level: 3 }], { selections: [{ checkpointId: 'fighter-2014-skills-1', optionIds: ['skill-athletics'], confirmedAt: '' }] })
    const impact = getDependencyImpact(draft, { kind: 'class-allocation', classes: [] })
    expect(impact.invalidated).toContain('fighter-2014-skills-1')
    expect(impact.preserved).toContain('种族与背景')
  })
})

describe('MC-C04 兼职校验', () => {
  it('总等级与职业合计不一致时报错', () => {
    const draft = {
      ...mc([{ classId: 'class-2014-fighter', level: 3 }]),
      targetLevel: 9,
    }
    const issues = validateMulticlassAllocation(draft)
    expect(issues.some((issue) => issue.id === 'multiclass-total-mismatch')).toBe(true)
  })

  it('先决不满足时报 error 并给出可执行原因', () => {
    // 基础感知 12 < 13，不能兼职德鲁伊
    const draft = mc([
      { classId: 'class-2014-rogue', level: 3 },
      { classId: 'class-2014-druid', level: 2 },
    ])
    const issues = validateMulticlassAllocation(draft)
    const issue = issues.find((item) => item.id === 'multiclass-prerequisite-class-2014-druid')
    expect(issue?.severity).toBe('error')
    expect(issue?.message).toContain('感知需提高到 13')
    expect(issue?.resolution).toContain('第 5 步')
  })

  it('先决满足时不报先决问题', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    expect(validateMulticlassAllocation(draft).filter((issue) => issue.id.startsWith('multiclass-prerequisite-'))).toEqual([])
  })

  it('单职业草稿不产生兼职分配问题', () => {
    expect(validateMulticlassAllocation(draft2024({ ruleset: '5e-2014', baseAbilities: ABILITIES, classId: 'class-2014-fighter', targetLevel: 5 }))).toEqual([])
  })
})

describe('SC-A03 起始职业不是第一个职业时的依赖影响', () => {
  /** 起始职业为游荡者、但它排在列表第二位的草稿（切换起始职业后的形态）。 */
  function roguePrimary(): CharacterDraft {
    return mc(
      [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 2 }],
      {
        classId: 'class-2014-rogue',
        multiclass: {
          enabled: true,
          primaryClassId: 'class-2014-rogue',
          classes: [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 2 }],
          levelOrder: ['class-2014-rogue', 'class-2014-fighter', 'class-2014-fighter', 'class-2014-fighter', 'class-2014-rogue'],
        },
      },
    )
  }

  it('影响清单指出起始职业已更换，并提示起始装备需复查', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    const impact = getDependencyImpact(draft, {
      kind: 'class-allocation',
      classes: [
        { classId: 'class-2014-rogue', level: 2 },
        { classId: 'class-2014-fighter', level: 3 },
      ],
      primaryClassId: 'class-2014-rogue',
    })
    expect(impact.review?.some((item) => item.includes('起始职业已更换'))).toBe(true)
    expect(impact.review?.some((item) => item.includes('起始装备'))).toBe(true)
    // 起始装备不再列为「保留」
    expect(impact.preserved).not.toContain('装备与金币')
  })

  it('起始职业不变时影响清单与改造前一致', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    const impact = getDependencyImpact(draft, {
      kind: 'class-allocation',
      classes: [
        { classId: 'class-2014-fighter', level: 3 },
        { classId: 'class-2014-rogue', level: 3 },
      ],
      primaryClassId: 'class-2014-fighter',
    })
    expect(impact.review).toContain('起始职业豁免熟练')
    expect(impact.preserved).toContain('装备与金币')
  })

  it('起始职业不是首位时，时间线按起始职业展开（而非 classes[0]）', () => {
    const draft = roguePrimary()
    // 变更只把战士降 1 级，起始职业仍是列表第二位的游荡者
    const impact = getDependencyImpact(draft, {
      kind: 'class-allocation',
      classes: [
        { classId: 'class-2014-fighter', level: 2 },
        { classId: 'class-2014-rogue', level: 2 },
      ],
      primaryClassId: 'class-2014-rogue',
    })
    // 起始职业未变 → 不出现「起始职业已更换」，且仍保留装备
    expect(impact.review?.some((item) => item.includes('起始职业已更换'))).toBe(false)
    expect(impact.preserved).toContain('装备与金币')
  })
})
