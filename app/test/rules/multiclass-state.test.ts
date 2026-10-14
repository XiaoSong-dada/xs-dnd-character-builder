import { describe, expect, it } from 'vitest'

import {
  addClassEntry,
  getClassEntries,
  getClassLevel,
  getClassSubclassId,
  getLastLevelClassIds,
  getMulticlassState,
  getPrimaryClassId,
  getTotalLevel,
  isMulticlassActive,
  normalizeMulticlass,
  rebuildLevelOrder,
  removeClassEntry,
  setClassLevel,
  setClassSubclassId,
  setMulticlassEnabled,
} from '@/rules/multiclass'
import { draft2024 } from '../fixtures/draft-2024'
import type { CharacterDraft } from '@/types/character'
import type { MulticlassState } from '@/types/multiclass'

/** 兼职草稿工厂：默认战士3／游荡者2（总等级 5）。 */
function multiclassDraft(overrides: Partial<CharacterDraft> = {}, state?: Partial<MulticlassState>): CharacterDraft {
  const classes = state?.classes ?? [
    { classId: 'class-2014-fighter', level: 3 },
    { classId: 'class-2014-rogue', level: 2 },
  ]
  return draft2024({
    ruleset: '5e-2014',
    classId: 'class-2014-fighter',
    targetLevel: classes.reduce((sum, entry) => sum + entry.level, 0),
    multiclass: {
      enabled: state?.enabled ?? true,
      primaryClassId: state?.primaryClassId ?? classes[0]!.classId,
      classes,
      levelOrder: state?.levelOrder ?? rebuildLevelOrder(classes),
    },
    ...overrides,
  })
}

describe('MC-A01 单职业兼容读取', () => {
  it('无 multiclass 字段时由 classId／targetLevel／subclassId 合成，且不写回草稿', () => {
    const draft = draft2024({ classId: 'class-2024-fighter', subclassId: 'subclass-2024-fighter-champion', targetLevel: 7 })
    expect(getClassEntries(draft)).toEqual([{ classId: 'class-2024-fighter', level: 7, subclassId: 'subclass-2024-fighter-champion' }])
    expect(getClassLevel(draft, 'class-2024-fighter')).toBe(7)
    expect(getClassLevel(draft, 'class-2024-wizard')).toBe(0)
    expect(getClassSubclassId(draft, 'class-2024-fighter')).toBe('subclass-2024-fighter-champion')
    expect(getPrimaryClassId(draft)).toBe('class-2024-fighter')
    expect(getTotalLevel(draft)).toBe(7)
    expect(isMulticlassActive(draft)).toBe(false)
    // 读取不产生副作用：草稿仍是原对象
    expect(draft.multiclass).toBeUndefined()
  })

  it('没有职业时返回空集合与零总等级', () => {
    const draft = draft2024({ classId: undefined, subclassId: undefined, targetLevel: 1 })
    expect(getClassEntries(draft)).toEqual([])
    expect(getPrimaryClassId(draft)).toBeUndefined()
    expect(getTotalLevel(draft)).toBe(0)
    expect(isMulticlassActive(draft)).toBe(false)
  })
})

describe('MC-A01 多职业读取', () => {
  it('总等级为各职业等级之和，起始职业取 primaryClassId', () => {
    const draft = multiclassDraft()
    expect(getTotalLevel(draft)).toBe(5)
    expect(getClassLevel(draft, 'class-2014-fighter')).toBe(3)
    expect(getClassLevel(draft, 'class-2014-rogue')).toBe(2)
    expect(getPrimaryClassId(draft)).toBe('class-2014-fighter')
    expect(isMulticlassActive(draft)).toBe(true)
  })

  it('开关名称与实际兼职分离：开关关闭但有两个职业 ≠ 已启用兼职', () => {
    const draft = multiclassDraft({}, { enabled: false })
    expect(isMulticlassActive(draft)).toBe(false)
    expect(getClassEntries(draft)).toHaveLength(2)
  })

  it('primaryClassId 与职业集合不符时回退到第一个职业', () => {
    const draft = multiclassDraft({}, { primaryClassId: 'class-2014-bard' })
    expect(getPrimaryClassId(draft)).toBe('class-2014-fighter')
  })

  it('levelOrder 长度与总等级不符时由各职业等级重建', () => {
    const draft = multiclassDraft({}, { levelOrder: ['class-2014-fighter'] })
    const state = getMulticlassState(draft)
    expect(state.levelOrder).toHaveLength(5)
    expect(state.levelOrder.filter((id) => id === 'class-2014-fighter')).toHaveLength(3)
    expect(state.levelOrder.filter((id) => id === 'class-2014-rogue')).toHaveLength(2)
  })

  it('最近等级职业按升级顺序从后往前取', () => {
    const draft = multiclassDraft({}, {
      classes: [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 2 }],
      levelOrder: ['class-2014-fighter', 'class-2014-rogue', 'class-2014-fighter', 'class-2014-rogue', 'class-2014-fighter'],
    })
    expect(getLastLevelClassIds(draft, 1)).toEqual(['class-2014-fighter'])
    // levelOrder = [战士, 游荡者, 战士, 游荡者, 战士] → 最后 3 级为 战士/游荡者/战士
    expect(getLastLevelClassIds(draft, 3)).toEqual(['class-2014-fighter', 'class-2014-rogue', 'class-2014-fighter'])
    expect(getLastLevelClassIds(draft, 0)).toEqual([])
    expect(getLastLevelClassIds(draft, 99)).toHaveLength(5)
  })
})

describe('MC-A01 等级写入', () => {
  it('提升某职业等级会同步总等级，且不改动 selections', () => {
    const draft = multiclassDraft({ selections: [{ checkpointId: 'fighter-2014-style-1', optionIds: ['style-defense'], confirmedAt: '2026-10-11T00:00:00.000Z' }] })
    const result = setClassLevel(draft, 'class-2014-rogue', 3)
    expect(result.ok).toBe(true)
    expect(result.draft.targetLevel).toBe(6)
    expect(getClassLevel(result.draft, 'class-2014-rogue')).toBe(3)
    expect(result.draft.selections).toHaveLength(1)
    expect(result.draft.selections[0]?.optionIds).toEqual(['style-defense'])
  })

  it('等级相同时原样返回同一草稿引用', () => {
    const draft = multiclassDraft()
    expect(setClassLevel(draft, 'class-2014-fighter', 3).draft).toBe(draft)
  })

  it('等级被钳制在职业上限（兼职 19／单职业 20）；钳制后总等级仍超 20 时拒绝写入', () => {
    const draft = multiclassDraft()
    // 战士由 3 提到 0 → 钳制为 1，总等级 3，可写入
    expect(getClassLevel(setClassLevel(draft, 'class-2014-fighter', 0).draft, 'class-2014-fighter')).toBe(1)
    // 战士 3→19 会让总等级变成 21，超上限，写入被拒绝
    const rejected = setClassLevel(draft, 'class-2014-fighter', 99)
    expect(rejected).toMatchObject({ ok: false, error: 'total-level-exceeded' })
    expect(rejected.draft).toBe(draft)
    // 单职业草稿：职业上限为 20（D42），写入 99 被钳制到 20
    const solo = draft2024({ classId: 'class-2014-fighter', targetLevel: 5 })
    expect(getClassLevel(setClassLevel(solo, 'class-2014-fighter', 99).draft, 'class-2014-fighter')).toBe(20)
  })

  it('兼职草稿：职业等级仍钳制在 19（D42）', () => {
    const draft = multiclassDraft({}, {
      classes: [{ classId: 'class-2014-fighter', level: 1 }, { classId: 'class-2014-rogue', level: 1 }],
    })
    expect(getClassLevel(setClassLevel(draft, 'class-2014-fighter', 99).draft, 'class-2014-fighter')).toBe(19)
  })

  it('总等级超过 20 时拒绝写入并保留原草稿', () => {
    const draft = multiclassDraft({}, {
      classes: [{ classId: 'class-2014-fighter', level: 19 }, { classId: 'class-2014-rogue', level: 1 }],
    })
    const result = setClassLevel(draft, 'class-2014-rogue', 2)
    expect(result.ok).toBe(false)
    expect(result.error).toBe('total-level-exceeded')
    expect(result.draft).toBe(draft)
    expect(getTotalLevel(result.draft)).toBe(20)
  })

  it('写入未加入的职业等同于以 1 级添加该职业', () => {
    const draft = multiclassDraft()
    const added = setClassLevel(draft, 'class-2014-wizard', 4)
    expect(added.ok).toBe(true)
    expect(getClassEntries(added.draft).map((entry) => entry.classId))
      .toEqual(['class-2014-fighter', 'class-2014-rogue', 'class-2014-wizard'])
    expect(getClassLevel(added.draft, 'class-2014-wizard')).toBe(1)
    expect(getTotalLevel(added.draft)).toBe(6)
    // 再显式设置等级才会生效
    const raised = setClassLevel(added.draft, 'class-2014-wizard', 4)
    expect(getClassLevel(raised.draft, 'class-2014-wizard')).toBe(4)
    expect(getTotalLevel(raised.draft)).toBe(9)
  })
})

describe('MC-A01 添加与移除职业（D5／D9）', () => {
  it('添加职业默认 1 级并自动打开开关', () => {
    const draft = multiclassDraft({}, { enabled: false })
    const result = addClassEntry(draft, 'class-2014-wizard')
    expect(result.ok).toBe(true)
    expect(result.draft.multiclass?.enabled).toBe(true)
    expect(getClassLevel(result.draft, 'class-2014-wizard')).toBe(1)
    expect(getTotalLevel(result.draft)).toBe(6)
  })

  it('同职业不可重复添加', () => {
    const draft = multiclassDraft()
    const result = addClassEntry(draft, 'class-2014-rogue')
    expect(result.ok).toBe(false)
    expect(result.error).toBe('class-duplicate')
  })

  it('总等级已满时不能添加职业', () => {
    const draft = multiclassDraft({}, { classes: [{ classId: 'class-2014-fighter', level: 19 }, { classId: 'class-2014-rogue', level: 1 }] })
    const result = addClassEntry(draft, 'class-2014-wizard')
    expect(result.ok).toBe(false)
    expect(result.error).toBe('total-level-exceeded')
  })

  it('起始职业不可移除，其他职业可移除且总等级下降', () => {
    const draft = multiclassDraft()
    expect(removeClassEntry(draft, 'class-2014-fighter')).toMatchObject({ ok: false, error: 'primary-class' })
    const removed = removeClassEntry(draft, 'class-2014-rogue')
    expect(removed.ok).toBe(true)
    expect(getTotalLevel(removed.draft)).toBe(3)
    expect(getClassEntries(removed.draft)).toHaveLength(1)
  })

  it('移除不存在的职业返回错误且不改动草稿', () => {
    const draft = multiclassDraft()
    const result = removeClassEntry(draft, 'class-2014-bard')
    expect(result).toMatchObject({ ok: false, error: 'class-not-found' })
    expect(result.draft).toBe(draft)
  })

  it('不限制职业数量：20 个职业各 1 级合法（D9）', () => {
    const ids = Array.from({ length: 19 }, (_, index) => `class-2014-test-${index}`)
    let draft = draft2024({
      ruleset: '5e-2014',
      classId: 'class-2014-fighter',
      targetLevel: 1,
      multiclass: { enabled: true, primaryClassId: 'class-2014-fighter', classes: [{ classId: 'class-2014-fighter', level: 1 }], levelOrder: ['class-2014-fighter'] },
    })
    for (const id of ids) {
      const result = addClassEntry(draft, id)
      expect(result.ok).toBe(true)
      draft = result.draft
    }
    expect(getClassEntries(draft)).toHaveLength(20)
    expect(getTotalLevel(draft)).toBe(20)
    // 第 21 个职业无法加入（总等级已满）
    expect(addClassEntry(draft, 'class-2014-test-extra')).toMatchObject({ ok: false, error: 'total-level-exceeded' })
  })
})

describe('MC-A01 子职与开关', () => {
  it('子职按职业分别记录，清除后不影响其他职业', () => {
    const draft = multiclassDraft()
    const withSubclass = setClassSubclassId(draft, 'class-2014-fighter', 'subclass-2014-fighter-champion')
    expect(withSubclass.ok).toBe(true)
    expect(getClassSubclassId(withSubclass.draft, 'class-2014-fighter')).toBe('subclass-2014-fighter-champion')
    expect(getClassSubclassId(withSubclass.draft, 'class-2014-rogue')).toBeUndefined()
    const cleared = setClassSubclassId(withSubclass.draft, 'class-2014-fighter', undefined)
    expect(getClassSubclassId(cleared.draft, 'class-2014-fighter')).toBeUndefined()
  })

  it('给未加入的职业设置子职会被拒绝', () => {
    const draft = multiclassDraft()
    expect(setClassSubclassId(draft, 'class-2014-bard', 'subclass-2014-bard-lore')).toMatchObject({ ok: false, error: 'class-not-found' })
  })

  it('切换开关不改变职业集合与等级（D2）', () => {
    const draft = multiclassDraft()
    const off = setMulticlassEnabled(draft, false)
    expect(off.multiclass?.enabled).toBe(false)
    expect(getTotalLevel(off)).toBe(5)
    expect(getClassEntries(off)).toHaveLength(2)
    expect(setMulticlassEnabled(off, true).multiclass?.enabled).toBe(true)
  })
})

describe('MC-A01 归一化', () => {
  it('过滤非法等级、重复职业、空 classId，并修正起始职业', () => {
    const state = normalizeMulticlass({
      enabled: true,
      primaryClassId: 'missing',
      classes: [
        { classId: 'class-2014-fighter', level: 4 },
        { classId: 'class-2014-fighter', level: 9 },
        { classId: '', level: 3 },
        { classId: 'class-2014-rogue', level: 0 },
        { classId: 'class-2014-wizard', level: 99 },
        'bad',
      ],
    })
    expect(state).toBeDefined()
    expect(state?.classes.map((entry) => entry.classId)).toEqual(['class-2014-fighter', 'class-2014-rogue', 'class-2014-wizard'])
    expect(state?.classes.map((entry) => entry.level)).toEqual([4, 1, 19])
    expect(state?.primaryClassId).toBe('class-2014-fighter')
    expect(state?.levelOrder).toHaveLength(24)
  })

  it('无有效职业时返回 undefined', () => {
    expect(normalizeMulticlass(undefined)).toBeUndefined()
    expect(normalizeMulticlass('x')).toBeUndefined()
    expect(normalizeMulticlass({ classes: [] })).toBeUndefined()
  })
})

describe('MC-A01 升级顺序重建', () => {
  it('按职业顺序轮流填充直到各自等级用尽', () => {
    expect(rebuildLevelOrder([
      { classId: 'a', level: 1 },
      { classId: 'b', level: 2 },
      { classId: 'c', level: 1 },
    ])).toEqual(['a', 'b', 'c', 'b'])
  })

  it('单职业时顺序为该职业重复 n 次', () => {
    expect(rebuildLevelOrder([{ classId: 'a', level: 3 }])).toEqual(['a', 'a', 'a'])
  })

  it('空集合返回空数组', () => {
    expect(rebuildLevelOrder([])).toEqual([])
  })
})
