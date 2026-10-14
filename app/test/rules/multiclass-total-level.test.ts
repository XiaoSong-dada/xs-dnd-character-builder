import { describe, expect, it } from 'vitest'

import {
  addClassEntry,
  getClassEntries,
  getClassLevel,
  getPrimaryClassId,
  getTotalLevel,
  getTotalLevelBounds,
  rebuildLevelOrder,
  removeClassEntry,
  setClassLevel,
  setPrimaryClassId,
  setTotalLevel,
} from '@/rules/multiclass'
import { draft2024 } from '../fixtures/draft-2024'
import type { CharacterDraft } from '@/types/character'
import type { MulticlassState } from '@/types/multiclass'

/**
 * SC-A01／SC-A02：总等级滑杆的搬运规则与起始职业切换。
 *
 * 需求依据：[起始职业选择与第 1 步等级滑杆需求](../../docs/需求文档/起始职业选择与第1步等级滑杆需求.md) §3.3、§4.4。
 */

function multiclassDraft(classes: MulticlassState['classes'], overrides: Partial<CharacterDraft> = {}, primaryClassId?: string): CharacterDraft {
  return draft2024({
    ruleset: '5e-2014',
    classId: classes[0]!.classId,
    targetLevel: classes.reduce((sum, entry) => sum + entry.level, 0),
    multiclass: {
      enabled: true,
      primaryClassId: primaryClassId ?? classes[0]!.classId,
      classes,
      levelOrder: rebuildLevelOrder(classes),
    },
    ...overrides,
  })
}

function solo(level: number, classId = 'class-2014-fighter'): CharacterDraft {
  return draft2024({ ruleset: '5e-2014', classId, targetLevel: level })
}

const FIGHTER = 'class-2014-fighter'
const ROGUE = 'class-2014-rogue'
const WIZARD = 'class-2014-wizard'

describe('SC-A01 getTotalLevelBounds', () => {
  it('下限为职业数量、上限为 20', () => {
    expect(getTotalLevelBounds(multiclassDraft([{ classId: FIGHTER, level: 3 }, { classId: ROGUE, level: 2 }])))
      .toEqual({ min: 2, max: 20 })
    expect(getTotalLevelBounds(solo(5))).toEqual({ min: 1, max: 20 })
  })

  it('没有职业时下限退回角色等级下限', () => {
    const draft = draft2024({ ruleset: '5e-2014', classId: undefined, targetLevel: 1 })
    expect(getTotalLevelBounds(draft)).toEqual({ min: 1, max: 20 })
  })
})

describe('SC-A01 setTotalLevel', () => {
  it('单职业下与 setClassLevel 结果逐字段相等', () => {
    const draft = solo(5)
    const byTotal = setTotalLevel(draft, 9)
    const byClass = setClassLevel(draft, FIGHTER, 9)
    expect(byTotal.ok).toBe(true)
    expect(byTotal.draft).toEqual(byClass.draft)
    expect(getTotalLevel(byTotal.draft)).toBe(9)
  })

  it('加级给职业列表的最后一个职业', () => {
    const draft = multiclassDraft([{ classId: FIGHTER, level: 3 }, { classId: ROGUE, level: 2 }])
    const result = setTotalLevel(draft, 7)
    expect(result.ok).toBe(true)
    expect(getClassEntries(result.draft)).toEqual([
      { classId: FIGHTER, level: 3 },
      { classId: ROGUE, level: 4 },
    ])
    expect(getTotalLevel(result.draft)).toBe(7)
  })

  it('减级从末尾往前扣，单个职业最低扣到 1 级且不移除职业', () => {
    const draft = multiclassDraft([{ classId: FIGHTER, level: 3 }, { classId: ROGUE, level: 2 }])
    // 5 → 4：游荡者 2 → 1
    const four = setTotalLevel(draft, 4)
    expect(getClassEntries(four.draft)).toEqual([{ classId: FIGHTER, level: 3 }, { classId: ROGUE, level: 1 }])
    // 5 → 3：游荡者已到 1，转而扣战士
    const three = setTotalLevel(draft, 3)
    expect(getClassEntries(three.draft)).toEqual([{ classId: FIGHTER, level: 2 }, { classId: ROGUE, level: 1 }])
    // 5 → 2：下限，两职业各 1 级，职业数量不变
    const two = setTotalLevel(draft, 2)
    expect(getClassEntries(two.draft)).toEqual([{ classId: FIGHTER, level: 1 }, { classId: ROGUE, level: 1 }])
  })

  it('低于职业数量时拒绝写入（拖动不会移除职业）', () => {
    const draft = multiclassDraft([{ classId: FIGHTER, level: 3 }, { classId: ROGUE, level: 2 }])
    const result = setTotalLevel(draft, 1)
    expect(result.ok).toBe(false)
    expect(result.error).toBe('invalid-level')
    expect(result.draft).toBe(draft)
    // 明确：要移除职业只能走 removeClassEntry
    expect(removeClassEntry(draft, ROGUE).ok).toBe(true)
  })

  it('超过 20 或空职业集合时拒绝写入', () => {
    const two = multiclassDraft([{ classId: FIGHTER, level: 19 }, { classId: ROGUE, level: 1 }])
    expect(setTotalLevel(two, 21)).toMatchObject({ ok: false, error: 'invalid-level' })
    const empty = draft2024({ ruleset: '5e-2014', classId: undefined, targetLevel: 1 })
    expect(setTotalLevel(empty, 3)).toMatchObject({ ok: false, error: 'class-not-found' })
  })

  it('三级职业跨职业搬运：先扣末位，再往前逐级扣', () => {
    const draft = multiclassDraft([
      { classId: FIGHTER, level: 5 },
      { classId: ROGUE, level: 2 },
      { classId: WIZARD, level: 1 },
    ])
    const result = setTotalLevel(draft, 6)
    // 8 → 6：术士已 1 级不可再扣，扣游荡者 2 → 1，再扣战士 5 → 4
    expect(getClassEntries(result.draft)).toEqual([
      { classId: FIGHTER, level: 4 },
      { classId: ROGUE, level: 1 },
      { classId: WIZARD, level: 1 },
    ])
  })

  it('等级不变时返回原草稿且不改动 levelOrder', () => {
    const draft = multiclassDraft([{ classId: FIGHTER, level: 3 }, { classId: ROGUE, level: 2 }])
    const result = setTotalLevel(draft, 5)
    expect(result.ok).toBe(true)
    expect(result.draft).toBe(draft)
  })

  it('加级不会越过 19 级单职业上限（末位到 19 时总等级必已达 20）', () => {
    const draft = multiclassDraft([{ classId: FIGHTER, level: 19 }, { classId: ROGUE, level: 1 }])
    expect(getTotalLevel(draft)).toBe(20)
    expect(setTotalLevel(draft, 20).draft).toBe(draft)
    expect(getClassLevel(setTotalLevel(draft, 20).draft, FIGHTER)).toBe(19)
  })
})

describe('SC-A02 setPrimaryClassId', () => {
  it('切换后 classId／primaryClassId／classes[0] 三者一致，且列表重排为起始职业在前', () => {
    const draft = multiclassDraft([{ classId: FIGHTER, level: 3 }, { classId: ROGUE, level: 2 }])
    const result = setPrimaryClassId(draft, ROGUE)
    expect(result.ok).toBe(true)
    const next = result.draft
    expect(getPrimaryClassId(next)).toBe(ROGUE)
    expect(next.classId).toBe(ROGUE)
    expect(getClassEntries(next)[0]!.classId).toBe(ROGUE)
    // 各职业等级不变，总等级不变
    expect(getClassEntries(next)).toEqual([{ classId: ROGUE, level: 2 }, { classId: FIGHTER, level: 3 }])
    expect(getTotalLevel(next)).toBe(5)
  })

  it('levelOrder[0] 改为新起始职业，长度与各职业次数不变', () => {
    const draft = multiclassDraft([{ classId: FIGHTER, level: 3 }, { classId: ROGUE, level: 2 }])
    const next = setPrimaryClassId(draft, ROGUE).draft
    const order = next.multiclass!.levelOrder
    expect(order).toHaveLength(5)
    expect(order[0]).toBe(ROGUE)
    expect(order.filter((id) => id === ROGUE)).toHaveLength(2)
    expect(order.filter((id) => id === FIGHTER)).toHaveLength(3)
  })

  it('切换后原起始职业变成普通职业，可以降到 0 移除', () => {
    const draft = multiclassDraft([{ classId: FIGHTER, level: 3 }, { classId: ROGUE, level: 2 }])
    const switched = setPrimaryClassId(draft, ROGUE).draft
    expect(removeClassEntry(switched, FIGHTER).ok).toBe(true)
    const removed = removeClassEntry(switched, FIGHTER).draft
    expect(getClassEntries(removed)).toEqual([{ classId: ROGUE, level: 2 }])
    expect(getPrimaryClassId(removed)).toBe(ROGUE)
    // 新起始职业仍不可移除
    expect(removeClassEntry(switched, ROGUE)).toMatchObject({ ok: false, error: 'primary-class' })
  })

  it('切换会带上新起始职业自己的子职，并清掉旧子职', () => {
    const draft = multiclassDraft([
      { classId: FIGHTER, level: 3, subclassId: 'subclass-2014-fighter-champion' },
      { classId: ROGUE, level: 2 },
    ], { subclassId: 'subclass-2014-fighter-champion' })
    const next = setPrimaryClassId(draft, ROGUE).draft
    expect(next.subclassId).toBeUndefined()
    const withRogueSubclass = multiclassDraft([
      { classId: FIGHTER, level: 3 },
      { classId: ROGUE, level: 2, subclassId: 'subclass-2014-rogue-assassin' },
    ])
    expect(setPrimaryClassId(withRogueSubclass, ROGUE).draft.subclassId).toBe('subclass-2014-rogue-assassin')
  })

  it('目标职业不存在或为空时返回稳定错误码', () => {
    const draft = multiclassDraft([{ classId: FIGHTER, level: 3 }, { classId: ROGUE, level: 2 }])
    expect(setPrimaryClassId(draft, WIZARD)).toMatchObject({ ok: false, error: 'class-not-found' })
    expect(setPrimaryClassId(draft, '')).toMatchObject({ ok: false, error: 'class-unknown' })
  })

  it('已是起始职业且已在首位时返回原草稿', () => {
    const draft = multiclassDraft([{ classId: FIGHTER, level: 3 }, { classId: ROGUE, level: 2 }])
    const result = setPrimaryClassId(draft, FIGHTER)
    expect(result.ok).toBe(true)
    expect(result.draft).toBe(draft)
  })

  it('起始职业不是首位时（旧数据）也能正确切换并修正顺序', () => {
    const draft = multiclassDraft([{ classId: FIGHTER, level: 3 }, { classId: ROGUE, level: 2 }], {}, ROGUE)
    const next = setPrimaryClassId(draft, FIGHTER).draft
    expect(getClassEntries(next)[0]!.classId).toBe(FIGHTER)
    expect(next.multiclass!.primaryClassId).toBe(FIGHTER)
    expect(next.classId).toBe(FIGHTER)
  })

  it('与 addClassEntry 组合：新加入的职业可作为起始职业候选', () => {
    const draft = solo(5)
    const added = addClassEntry(draft, ROGUE).draft
    const switched = setPrimaryClassId(added, ROGUE).draft
    expect(getPrimaryClassId(switched)).toBe(ROGUE)
    expect(getClassEntries(switched)).toEqual([{ classId: ROGUE, level: 1 }, { classId: FIGHTER, level: 5 }])
    expect(getTotalLevel(switched)).toBe(6)
  })
})
