import { afterEach, describe, expect, it } from 'vitest'

import { emptyBundle, validateCustomEntry } from '@/rules/custom-content'
import { getRulesRepository, registerCustomContent, resetCustomContent } from '@/rules/repositories'
import { buildTimeline } from '@/rules/timeline'
import type { CustomClassEntry, CustomExpansion, CustomSubclassEntry } from '@/types/custom-content'

const NOW = '2026-11-02T00:00:00.000Z'
const SOURCE = 'source-custom-subclass-test'

function expansion(): CustomExpansion {
  return {
    id: SOURCE,
    ruleset: '5e-2014',
    title: '子职测试书',
    shortTitle: '子职',
    defaultEnabled: true,
    createdAt: NOW,
    updatedAt: NOW,
  }
}

function subclass(overrides: Partial<CustomSubclassEntry> = {}): CustomSubclassEntry {
  return {
    kind: 'subclass',
    id: 'custom-subclass-1',
    expansionId: SOURCE,
    ruleset: '5e-2014',
    name: '工坊子职',
    englishName: 'Workshop Subclass',
    summary: '自制子职',
    description: '说明',
    createdAt: NOW,
    updatedAt: NOW,
    classId: 'class-2014-wizard',
    selectionLevel: 3,
    features: [{ id: 'feature-1', name: '子职特性', level: 3, summary: '摘要', description: '说明' }],
    ...overrides,
  }
}

function customClass(overrides: Partial<CustomClassEntry> = {}): CustomClassEntry {
  return {
    kind: 'class',
    id: 'custom-class-1',
    expansionId: SOURCE,
    ruleset: '5e-2014',
    name: '工坊职业',
    englishName: 'Workshop Class',
    summary: '自制职业',
    description: '说明',
    createdAt: NOW,
    updatedAt: NOW,
    hitDie: 10,
    primaryAbilities: ['力量'],
    savingThrowAbilities: ['str', 'con'],
    ...overrides,
  }
}

describe('内容工坊：自定义子职投影与时间线', () => {
  afterEach(() => {
    resetCustomContent()
  })

  it('内置职业的自定义子职进入 repository.subclasses，并出现在时间线候选中', () => {
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      subclasses: [subclass()],
    })
    const repository = getRulesRepository('5e-2014')
    const projected = repository.getSubclass('custom-subclass-1')

    expect(projected?.classId).toBe('class-2014-wizard')
    expect(projected?.selectionLevel).toBe(3)
    expect(projected?.features).toHaveLength(1)
    expect(projected?.sourceIds).toEqual([SOURCE])

    const checkpoints = buildTimeline('class-2014-wizard', 3, { ruleset: '5e-2014', repository })
    const subclassCheckpoint = checkpoints.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclassCheckpoint?.optionIds).toContain('custom-subclass-1')
  })

  it('自定义职业创建首个自定义子职后出现子职检查点，等级取子职等级', () => {
    const classEntry = customClass()
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      classes: [classEntry],
    })
    const before = buildTimeline('custom-class-1', 4, {
      ruleset: '5e-2014',
      repository: getRulesRepository('5e-2014'),
    })
    expect(before.some((checkpoint) => checkpoint.kind === 'subclass')).toBe(false)

    resetCustomContent()
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      classes: [classEntry],
      subclasses: [subclass({ classId: 'custom-class-1', selectionLevel: 3 })],
    })
    const after = buildTimeline('custom-class-1', 4, {
      ruleset: '5e-2014',
      repository: getRulesRepository('5e-2014'),
    })
    const subclassCheckpoint = after.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclassCheckpoint?.level).toBe(3)
    expect(subclassCheckpoint?.optionIds).toContain('custom-subclass-1')
  })

  it('归档子职退出新候选，但仍可解析', () => {
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      subclasses: [subclass({ archived: true })],
    })
    const repository = getRulesRepository('5e-2014')
    expect(repository.getSubclass('custom-subclass-1')?.status).toBe('unavailable')
    const checkpoints = buildTimeline('class-2014-wizard', 3, { ruleset: '5e-2014', repository })
    const subclassCheckpoint = checkpoints.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclassCheckpoint?.optionIds ?? []).not.toContain('custom-subclass-1')
  })

  it('校验父职业、等级范围与已锁定等级', () => {
    const base = subclass()
    expect(validateCustomEntry({ ...base, classId: '' })).toContain('请选择所属职业。')
    expect(validateCustomEntry({ ...base, selectionLevel: 0 })).toContain('子职选择等级必须是 1—20 的整数。')
    expect(validateCustomEntry({ ...base, classId: 'class-2014-wizard' }, {
      classIds: ['class-2014-wizard'],
      subclassLevelsByClass: { 'class-2014-wizard': 3 },
    })).toEqual([])
    expect(validateCustomEntry({ ...base, selectionLevel: 5 }, {
      classIds: ['class-2014-wizard'],
      subclassLevelsByClass: { 'class-2014-wizard': 3 },
    })).toContain('该职业的子职选择等级固定为 3 级，不能修改。')
    expect(validateCustomEntry({ ...base, classId: 'class-2014-fighter' }, {
      classIds: ['class-2014-wizard'],
    })).toContain('所属职业不存在或已被归档，请重新选择。')
  })
})
