import { beforeEach, describe, expect, it } from 'vitest'

import { DraftStorageService, migrateDraftToV10, parseCharacterDraft } from '@/services/draft-storage'
import { getClassEntries, getTotalLevel } from '@/rules/multiclass'

const V10_KEY = 'dnd-character-builder:drafts:v10'
const V9_KEY = 'dnd-character-builder:drafts:v9'
const V8_KEY = 'dnd-character-builder:drafts:v8'

function setJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

const baseAbilities = { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 }

/** v9 单职业草稿夹具：战士 7 级 + 子职 + 三类法术选择。 */
function v9Draft(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schemaVersion: 9,
    id: 'v9-mc',
    ruleset: '5e-2014',
    name: '迁移角色',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    targetLevel: 7,
    abilityMethod: 'standard-array',
    enabledSourceIds: [],
    classId: 'class-2014-fighter',
    subclassId: 'subclass-2014-fighter-champion',
    baseAbilities,
    selections: [{ checkpointId: 'fighter-2014-style-1', optionIds: ['style-defense'], confirmedAt: '2026-10-01T00:00:00.000Z' }],
    spellSelections: {
      cantripIds: ['spell-2014-fire-bolt'],
      knownSpellIds: [],
      preparedSpellIds: [],
      spellbookSpellIds: ['spell-2014-magic-missile'],
      transcribedSpellIds: ['spell-2014-magic-missile'],
    },
    inactiveSpellSelections: [],
    ...overrides,
  }
}

describe('MC-A02 schema v10 迁移', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('v9 草稿迁移为 v10：职业、子职、等级与法术数组映射到兼职结构', () => {
    const migrated = migrateDraftToV10(v9Draft())
    expect(migrated).toBeDefined()
    expect(migrated?.schemaVersion).toBe(10)
    // 职业集合 = 单一职业，等级 = 原 targetLevel，子职原样保留
    expect(migrated?.multiclass).toMatchObject({
      enabled: false,
      primaryClassId: 'class-2014-fighter',
      classes: [{ classId: 'class-2014-fighter', level: 7, subclassId: 'subclass-2014-fighter-champion' }],
    })
    expect(migrated?.multiclass?.levelOrder).toHaveLength(7)
    expect(migrated?.multiclass?.levelOrder.every((id) => id === 'class-2014-fighter')).toBe(true)
    // 顶层兼容字段保留
    expect(migrated?.classId).toBe('class-2014-fighter')
    expect(migrated?.subclassId).toBe('subclass-2014-fighter-champion')
    expect(migrated?.targetLevel).toBe(7)
    // 选择历史不被改写
    expect(migrated?.selections).toHaveLength(1)
    expect(migrated?.selections[0]?.optionIds).toEqual(['style-defense'])
  })

  it('单职业旧草稿迁移不建分桶：继续以顶层数组为准（修复「读分桶、写顶层」的根因）', () => {
    const migrated = migrateDraftToV10(v9Draft())
    expect(migrated?.spellSelections.classSpellSelections).toBeUndefined()
    expect(migrated?.spellSelections.cantripIds).toEqual(['spell-2014-fire-bolt'])
    expect(migrated?.spellSelections.spellbookSpellIds).toEqual(['spell-2014-magic-missile'])
    expect(migrated?.spellSelections.transcribedSpellIds).toEqual(['spell-2014-magic-missile'])
  })

  it('v9 没有兼职结构，迁移只会产出单职业草稿，因此不建分桶', () => {
    const migrated = migrateDraftToV10(v9Draft({
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 6 }, { classId: 'class-2014-rogue', level: 1 }],
        levelOrder: [...Array.from({ length: 6 }, () => 'class-2014-fighter'), 'class-2014-rogue'],
      },
    }))
    // 迁移只认旧字段 classId／targetLevel（buildMigratedMulticlass），v9 的 multiclass 字段被忽略
    expect(migrated?.multiclass?.classes).toHaveLength(1)
    expect(migrated?.spellSelections.classSpellSelections).toBeUndefined()
  })

  it('未选职业的草稿不产生兼职结构，也不产生法术分组', () => {
    const migrated = migrateDraftToV10(v9Draft({ classId: undefined, subclassId: undefined, targetLevel: 1 }))
    expect(migrated?.multiclass).toBeUndefined()
    expect(migrated?.spellSelections.classSpellSelections).toBeUndefined()
    expect(migrated?.schemaVersion).toBe(10)
  })

  it('v10 多职业草稿的既有分桶在归一化后保留（只保留仍存在职业的分桶）', () => {
    const buckets = [
      { classId: 'class-2014-wizard', cantripIds: ['spell-2014-fire-bolt'], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
      { classId: 'class-2014-rogue', cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
    ]
    const parsed = parseCharacterDraft({
      ...v9Draft({ classId: 'class-2014-wizard', subclassId: undefined }),
      schemaVersion: 10,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-wizard',
        classes: [{ classId: 'class-2014-wizard', level: 6 }, { classId: 'class-2014-rogue', level: 1 }],
        levelOrder: [...Array.from({ length: 6 }, () => 'class-2014-wizard'), 'class-2014-rogue'],
      },
      spellSelections: {
        cantripIds: ['spell-2014-fire-bolt'],
        knownSpellIds: [],
        preparedSpellIds: [],
        spellbookSpellIds: [],
        transcribedSpellIds: [],
        classSpellSelections: buckets,
      },
    })
    expect(parsed?.spellSelections.classSpellSelections).toEqual(buckets)
  })

  it('单职业草稿的残留分桶在归一化时折回顶层并清除（幂等）', () => {
    const stale = [{ classId: 'class-2014-wizard', cantripIds: ['spell-2014-fire-bolt'], knownSpellIds: ['spell-2014-shield'], preparedSpellIds: [], spellbookSpellIds: [] }]
    const raw = {
      ...v9Draft({
        classId: 'class-2014-wizard',
        subclassId: undefined,
        spellSelections: {
          cantripIds: [],
          knownSpellIds: [],
          preparedSpellIds: [],
          spellbookSpellIds: [],
          transcribedSpellIds: [],
          classSpellSelections: stale,
        },
      }),
      schemaVersion: 10,
    }
    const parsed = parseCharacterDraft(raw)
    expect(parsed?.spellSelections.classSpellSelections).toBeUndefined()
    expect(parsed?.spellSelections.cantripIds).toEqual(['spell-2014-fire-bolt'])
    expect(parsed?.spellSelections.knownSpellIds).toEqual(['spell-2014-shield'])
    // 幂等：再次归一化结果不变
    const again = parseCharacterDraft(parsed)
    expect(again?.spellSelections).toEqual(parsed?.spellSelections)
  })

  it('总等级恒等于 Σ 职业等级（归一化时以职业集合为准）', () => {
    const parsed = parseCharacterDraft(v9Draft({ targetLevel: 5 }))
    expect(parsed).toBeDefined()
    expect(getTotalLevel(parsed as never)).toBe(5)
    expect(getClassEntries(parsed as never)).toHaveLength(1)
    // 人为制造不一致的 v10 草稿：归一化后以职业集合重算
    const inconsistent = parseCharacterDraft({
      ...v9Draft(),
      schemaVersion: 10,
      targetLevel: 99,
      multiclass: { enabled: true, primaryClassId: 'class-2014-fighter', classes: [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 2 }], levelOrder: [] },
    })
    expect(inconsistent?.targetLevel).toBe(5)
    expect(inconsistent?.multiclass?.levelOrder).toHaveLength(5)
  })

  it('归一化清除非法兼职条目并修正起始职业', () => {
    const parsed = parseCharacterDraft({
      ...v9Draft(),
      schemaVersion: 10,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-bard',
        classes: [
          { classId: 'class-2014-fighter', level: 3 },
          { classId: 'class-2014-fighter', level: 9 },
          { classId: 'class-2014-rogue', level: 0 },
        ],
        levelOrder: [],
      },
    })
    expect(parsed?.multiclass?.classes).toEqual([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 1 },
    ])
    expect(parsed?.multiclass?.primaryClassId).toBe('class-2014-fighter')
    expect(parsed?.targetLevel).toBe(4)
  })

  it('从 v9 存储键读取并迁移为 v10', () => {
    setJson(V9_KEY, [v9Draft()])
    const drafts = DraftStorageService.loadAll()
    expect(drafts).toHaveLength(1)
    expect(drafts[0]?.schemaVersion).toBe(10)
    expect(drafts[0]?.multiclass?.classes[0]).toMatchObject({ classId: 'class-2014-fighter', level: 7 })
    // 旧键原文不删不改
    expect(localStorage.getItem(V9_KEY)).toContain('v9-mc')
    // 新键在写入时才产生
    DraftStorageService.saveAll(drafts)
    expect(JSON.parse(localStorage.getItem(V10_KEY) ?? 'null')).toHaveLength(1)
  })

  it('v8 两版草稿链条迁移到 v10 且规则版本各自保留', () => {
    setJson(V8_KEY, [
      { schemaVersion: 8, id: 'v8-2014', ruleset: '5e-2014', name: '旧版', classId: 'class-2014-fighter', targetLevel: 4 },
      { schemaVersion: 8, id: 'v8-2024', ruleset: '5e-2024', name: '新版', classId: 'class-2024-fighter', targetLevel: 3 },
    ])
    const drafts = DraftStorageService.loadAll()
    expect(drafts.map((draft) => draft.ruleset)).toEqual(['5e-2014', '5e-2024'])
    expect(drafts.every((draft) => draft.schemaVersion === 10)).toBe(true)
    expect(drafts[0]?.multiclass?.classes[0]).toMatchObject({ classId: 'class-2014-fighter', level: 4 })
    expect(drafts[1]?.multiclass?.classes[0]).toMatchObject({ classId: 'class-2024-fighter', level: 3 })
  })

  it('v10 草稿与其迁移结果在数值与选择上等价（无损迁移）', () => {
    const source = v9Draft()
    const migrated = migrateDraftToV10(source)
    expect(migrated?.name).toBe(source.name)
    expect(migrated?.baseAbilities).toEqual(source.baseAbilities)
    expect(migrated?.abilityMethod).toBe(source.abilityMethod)
    expect(migrated?.selections).toEqual(source.selections)
    expect(migrated?.targetLevel).toBe(source.targetLevel)
    expect(migrated?.classId).toBe(source.classId)
    expect(migrated?.subclassId).toBe(source.subclassId)
    expect(migrated?.inactiveSpellSelections).toEqual([])
  })

  it('未知版本与缺少 id 的条目仍被拒绝', () => {
    expect(migrateDraftToV10({ ...v9Draft(), schemaVersion: 99 })).toBeUndefined()
    expect(migrateDraftToV10({ ...v9Draft(), id: undefined })).toBeUndefined()
    expect(migrateDraftToV10(null)).toBeUndefined()
  })
})
