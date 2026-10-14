import { describe, expect, it } from 'vitest'

import { getClassEntries, getTotalLevel, mergeIntoPrimaryClass } from '@/rules/multiclass'
import { applyClassSpellSelections, getClassSpellSelections, normalizeSpellSelectionBuckets } from '@/rules/spellcasting'
import { draft2024 } from '../fixtures/draft-2024'
import type { CharacterDraft, SpellSelections } from '@/types/character'

const WIZARD = 'class-2014-wizard'
const FIGHTER = 'class-2014-fighter'
const ROGUE = 'class-2014-rogue'

function selections(overrides: Partial<SpellSelections> = {}): SpellSelections {
  return {
    cantripIds: [],
    knownSpellIds: [],
    preparedSpellIds: [],
    spellbookSpellIds: [],
    transcribedSpellIds: [],
    ...overrides,
  }
}

/** 单职业（法师）草稿：默认**不带分桶**（新建卡形态）。 */
function solo(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return draft2024({
    ruleset: '5e-2014',
    classId: WIZARD,
    subclassId: 'subclass-2014-wizard-evocation',
    targetLevel: 5,
    ...overrides,
  })
}

/** 带残留分桶的单职业草稿（v10 迁移产生的历史形态）。 */
function soloWithStaleBucket(): CharacterDraft {
  const bucket = {
    classId: WIZARD,
    cantripIds: ['spell-2014-fire-bolt'],
    knownSpellIds: [],
    preparedSpellIds: [],
    spellbookSpellIds: ['spell-2014-magic-missile'],
  }
  return solo({
    spellSelections: selections({
      cantripIds: ['spell-2014-fire-bolt'],
      spellbookSpellIds: ['spell-2014-magic-missile'],
      transcribedSpellIds: ['spell-2014-magic-missile'],
      classSpellSelections: [bucket],
    }),
  })
}

function multiclass(classes: readonly { classId: string; level: number }[], overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return draft2024({
    ruleset: '5e-2014',
    classId: classes[0]!.classId,
    targetLevel: classes.reduce((sum, entry) => sum + entry.level, 0),
    multiclass: {
      enabled: true,
      primaryClassId: classes[0]!.classId,
      classes: [...classes],
      levelOrder: classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId)),
    },
    ...overrides,
  })
}

/**
 * 按职业分桶的法术选择：写入必须落在**读取时真正使用的那份数据**上。
 *
 * 回归背景：读取（`getClassSpellSelections`）只要该职业有分桶就以分桶为准，
 * 写入原先按「施法职业数 > 1」判断，于是「单职业 + 迁移产生的分桶」写顶层、读分桶，
 * 法术既加不上也删不掉（用户反馈）。
 */
describe('applyClassSpellSelections：写入与读取口径对称', () => {
  it('该职业已有残留分桶（单职业）→ 写入落顶层并清掉分桶，读取随即生效', () => {
    const draft = soloWithStaleBucket()
    // 与 UI 一致：负载以「当前作用域读取值」为底，只改要动的数组
    const next = applyClassSpellSelections(draft, WIZARD, {
      ...getClassSpellSelections(draft, WIZARD),
      cantripIds: ['spell-2014-fire-bolt', 'spell-2014-acid-splash'],
      spellbookSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield'],
    })

    const bucket = next.classSpellSelections?.find((item) => item.classId === WIZARD)
    expect(bucket).toBeUndefined()
    // 写入落在顶层数组（并且顺手清掉遗留分桶，读取随即回到顶层）
    expect(next.cantripIds).toEqual(['spell-2014-fire-bolt', 'spell-2014-acid-splash'])
    expect(next.spellbookSpellIds).toEqual(['spell-2014-magic-missile', 'spell-2014-shield'])
    // 共享字段不落分桶，仍在顶层
    expect(next.transcribedSpellIds).toEqual(['spell-2014-magic-missile'])
    // 写后读到的就是写进去的
    expect(getClassSpellSelections({ ...draft, spellSelections: next }, WIZARD).cantripIds)
      .toEqual(['spell-2014-fire-bolt', 'spell-2014-acid-splash'])
  })

  it('单职业且无分桶 → 写顶层数组，且不产生分桶（新建卡既有约定）', () => {
    const draft = solo({ spellSelections: selections({ cantripIds: ['spell-2014-fire-bolt'] }) })
    const next = applyClassSpellSelections(draft, WIZARD, selections({ cantripIds: ['spell-2014-fire-bolt', 'spell-2014-acid-splash'] }))

    expect(next.classSpellSelections).toBeUndefined()
    expect(next.cantripIds).toEqual(['spell-2014-fire-bolt', 'spell-2014-acid-splash'])
  })

  it('多职业非起始职业首次写入 → 为该职业建分桶，并补齐其它职业的分桶', () => {
    const draft = multiclass([{ classId: FIGHTER, level: 4 }, { classId: WIZARD, level: 1 }])
    const next = applyClassSpellSelections(draft, WIZARD, selections({ spellbookSpellIds: ['spell-2014-magic-missile'] }))

    expect(next.classSpellSelections).toHaveLength(2)
    expect(next.classSpellSelections?.find((item) => item.classId === WIZARD)?.spellbookSpellIds)
      .toEqual(['spell-2014-magic-missile'])
    expect(next.spellbookSpellIds).toEqual(['spell-2014-magic-missile'])
  })

  it('多职业起始职业首次写入 → 起始职业的既有顶层法术被搬进它自己的分桶（不丢数据）', () => {
    const draft = multiclass([{ classId: WIZARD, level: 4 }, { classId: ROGUE, level: 1 }], {
      spellSelections: selections({ spellbookSpellIds: ['spell-2014-magic-missile'] }),
    })
    const next = applyClassSpellSelections(draft, WIZARD, {
      ...getClassSpellSelections(draft, WIZARD),
      spellbookSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield'],
    })

    expect(next.classSpellSelections?.find((item) => item.classId === WIZARD)?.spellbookSpellIds)
      .toEqual(['spell-2014-magic-missile', 'spell-2014-shield'])
    // 顶层变成并集镜像，起始职业的既有法术仍在
    expect(next.spellbookSpellIds).toEqual(['spell-2014-magic-missile', 'spell-2014-shield'])
    expect(getClassSpellSelections({ ...draft, spellSelections: next }, WIZARD).spellbookSpellIds)
      .toEqual(['spell-2014-magic-missile', 'spell-2014-shield'])
  })

  it('两个施法职业各自分桶互不串味', () => {
    const draft = multiclass([{ classId: WIZARD, level: 3 }, { classId: ROGUE, level: 3 }], {
      subclassId: 'subclass-2014-wizard-evocation',
      spellSelections: selections(),
    })
    const first = applyClassSpellSelections(draft, WIZARD, selections({ spellbookSpellIds: ['spell-2014-magic-missile'] }))
    const second = applyClassSpellSelections({ ...draft, spellSelections: first }, ROGUE, selections())
    const wizardBucket = second.classSpellSelections?.find((item) => item.classId === WIZARD)
    const rogueBucket = second.classSpellSelections?.find((item) => item.classId === ROGUE)
    expect(wizardBucket?.spellbookSpellIds).toEqual(['spell-2014-magic-missile'])
    expect(rogueBucket?.spellbookSpellIds).toEqual([])
    // 并集镜像只反映各分桶
    expect(second.spellbookSpellIds).toEqual(['spell-2014-magic-missile'])
  })
})

describe('normalizeSpellSelectionBuckets：分桶卫生（幂等）', () => {
  it('单职业残留分桶 → 折回顶层并清除分桶', () => {
    const draft = soloWithStaleBucket()
    const next = normalizeSpellSelectionBuckets(draft)

    expect(next.classSpellSelections).toBeUndefined()
    expect(next.cantripIds).toEqual(['spell-2014-fire-bolt'])
    expect(next.spellbookSpellIds).toEqual(['spell-2014-magic-missile'])
    expect(next.transcribedSpellIds).toEqual(['spell-2014-magic-missile'])
  })

  it('折回时与顶层取并集，不丢数据', () => {
    const draft = solo({
      spellSelections: selections({
        cantripIds: ['spell-2014-acid-splash'],
        classSpellSelections: [{ classId: WIZARD, cantripIds: ['spell-2014-fire-bolt'], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] }],
      }),
    })
    const next = normalizeSpellSelectionBuckets(draft)
    expect(next.cantripIds).toEqual(['spell-2014-acid-splash', 'spell-2014-fire-bolt'])
    expect(next.classSpellSelections).toBeUndefined()
  })

  it('幂等：连续归一化结果一致', () => {
    const once = normalizeSpellSelectionBuckets(soloWithStaleBucket())
    const twice = normalizeSpellSelectionBuckets({ ...soloWithStaleBucket(), spellSelections: once })
    expect(twice).toEqual(once)
  })

  it('多职业：只保留仍存在职业的分桶', () => {
    const draft = multiclass([{ classId: WIZARD, level: 3 }, { classId: ROGUE, level: 2 }], {
      spellSelections: selections({
        classSpellSelections: [
          { classId: WIZARD, cantripIds: ['spell-2014-fire-bolt'], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
          { classId: 'class-2014-bard', cantripIds: ['spell-2014-vicious-mockery'], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
        ],
      }),
    })
    const next = normalizeSpellSelectionBuckets(draft)
    expect(next.classSpellSelections).toEqual([
      { classId: WIZARD, cantripIds: ['spell-2014-fire-bolt'], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
    ])
    expect(next.cantripIds).toEqual(['spell-2014-fire-bolt'])
  })

  it('没有分桶时原值返回', () => {
    const draft = solo({ spellSelections: selections({ cantripIds: ['spell-2014-fire-bolt'] }) })
    expect(normalizeSpellSelectionBuckets(draft)).toBe(draft.spellSelections)
  })

  it('关闭兼职合并后回到单职业约定：分桶清除、顶层保留存活职业列表', () => {
    const draft = multiclass([{ classId: WIZARD, level: 4 }, { classId: ROGUE, level: 2 }], {
      spellSelections: selections({
        classSpellSelections: [
          { classId: WIZARD, cantripIds: ['spell-2014-fire-bolt'], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: ['spell-2014-magic-missile'] },
          { classId: ROGUE, cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
        ],
      }),
    })
    const merged = mergeIntoPrimaryClass(draft)
    expect(merged.ok).toBe(true)
    expect(getClassEntries(merged.draft)).toHaveLength(1)
    expect(getTotalLevel(merged.draft)).toBe(6)

    const next = normalizeSpellSelectionBuckets(merged.draft)
    expect(next.classSpellSelections).toBeUndefined()
    expect(next.cantripIds).toContain('spell-2014-fire-bolt')
    expect(next.spellbookSpellIds).toContain('spell-2014-magic-missile')
    // 合并后再写入仍可见（读写同源）
    const written = applyClassSpellSelections({ ...merged.draft, spellSelections: next }, WIZARD, selections({ cantripIds: ['spell-2014-fire-bolt', 'spell-2014-acid-splash'] }))
    expect(written.cantripIds).toEqual(['spell-2014-fire-bolt', 'spell-2014-acid-splash'])
    expect(written.classSpellSelections).toBeUndefined()
  })
})
