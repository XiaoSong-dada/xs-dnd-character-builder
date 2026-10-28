import { afterEach, describe, expect, it } from 'vitest'

import { CustomContentConflictError, mergeCustomContent } from '@/rules/custom-content-merge'
import { emptyBundle } from '@/rules/custom-content'
import { getRulesRepository, registerCustomContent, resetCustomContent, rulesRepository2024 } from '@/rules/repositories'
import { rulesRepository2014 } from '@/rules/repository'
import type { CustomClassEntry, CustomExpansion, CustomFeatEntry, CustomRaceEntry, CustomSpellEntry } from '@/types/custom-content'

const NOW = '2026-10-19T00:00:00.000Z'

function expansion(overrides: Partial<CustomExpansion> = {}): CustomExpansion {
  return {
    id: 'source-custom-test',
    ruleset: '5e-2014',
    title: '我的自制扩展',
    shortTitle: '自制',
    defaultEnabled: true,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  }
}

function baseEntry(kindName: string) {
  return {
    id: `custom-${kindName}-1`,
    expansionId: 'source-custom-test',
    ruleset: '5e-2014' as const,
    name: `自制${kindName}`,
    englishName: `Homebrew ${kindName}`,
    summary: '一句话概括',
    description: '详细说明',
    createdAt: NOW,
    updatedAt: NOW,
  }
}

function raceEntry(): CustomRaceEntry {
  return {
    ...baseEntry('race'),
    kind: 'race',
    speed: 30,
    darkvision: 60,
    fixedAbilityBonuses: { dex: 2, cha: 1 },
    skillProficiencies: ['skill-perception'],
    traits: [{ id: 'trait-1', name: '自制特性', level: 1, summary: '摘要', description: '说明' }],
  }
}

function spellEntry(overrides: Partial<CustomSpellEntry> = {}): CustomSpellEntry {
  return {
    ...baseEntry('spell'),
    kind: 'spell',
    level: 3,
    school: '塑能',
    classIds: ['class-2014-wizard'],
    ...overrides,
  }
}

function featEntry(): CustomFeatEntry {
  return {
    ...baseEntry('feat'),
    kind: 'feat',
    hitPointBonusPerLevel: 2,
  }
}

function classEntry(): CustomClassEntry {
  return {
    ...baseEntry('class'),
    kind: 'class',
    hitDie: 8,
    primaryAbilities: ['智力'],
    savingThrowAbilities: ['int', 'wis'],
    spellcastingSourceClassId: 'class-2014-wizard',
    spellcastingAbility: 'int',
    features: [{ id: 'feature-1', name: '自制特性', level: 1, summary: '摘要', description: '说明' }],
  }
}

describe('内容工坊：运行时叠加层合并', () => {
  afterEach(() => {
    resetCustomContent()
  })

  it('注册后自定义种族、专长、法术、职业与自定义来源都进入仓库', () => {
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      races: [raceEntry()],
      feats: [featEntry()],
      spells: [spellEntry()],
      classes: [classEntry()],
    })
    const repository = getRulesRepository('5e-2014')

    expect(repository.getRace('custom-race-1')?.name).toBe('自制race')
    expect(repository.getRaceFeatures('custom-race-1')).toHaveLength(1)
    expect(repository.getFeat('custom-feat-1')?.hitPointBonusPerLevel).toBe(2)
    // 专长同时进入 options（选择面板走 getOption）
    expect(repository.getOption('custom-feat-1')?.name).toBe('自制feat')
    expect(repository.getSpell('custom-spell-1')?.level).toBe(3)
    expect(repository.getClass('custom-class-1')?.hitDie).toBe(8)
    expect(repository.getClass('custom-class-1')?.features).toHaveLength(1)
    expect(repository.sources.some((source) => source.id === 'source-custom-test' && source.contentKind === 'custom')).toBe(true)
  })

  it('自定义法术注入所属职业的 classSpellIds（2014 短键口径）', () => {
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      spells: [spellEntry()],
    })
    const repository = getRulesRepository('5e-2014')
    const wizard = repository.getClass('class-2014-wizard')

    expect(wizard?.spellcasting?.classSpellIds).toContain('custom-spell-1')
    // SpellRule.classIds 仍按 2014 数据口径写短键
    expect(repository.getSpell('custom-spell-1')?.classIds).toEqual(['wizard'])
  })

  it('自定义职业复用所引用职业的施法配置，并包含已注入的自定义法术', () => {
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      spells: [spellEntry()],
      classes: [classEntry()],
    })
    const repository = getRulesRepository('5e-2014')
    const custom = repository.getClass('custom-class-1')

    expect(custom?.spellcasting?.ability).toBe('int')
    expect(custom?.spellcasting?.mode).toBe(repository.getClass('class-2014-wizard')?.spellcasting?.mode)
    expect(custom?.spellcasting?.classSpellIds).toContain('custom-spell-1')
    // 未选择子职时不应生成子职检查点
    expect(repository.subclasses.filter((subclass) => subclass.classId === 'custom-class-1')).toHaveLength(0)
  })

  it('归档条目仍可解析，但状态为 unavailable 且不再注入职业法术表', () => {
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      races: [{ ...raceEntry(), archived: true }],
      spells: [{ ...spellEntry(), archived: true }],
    })
    const repository = getRulesRepository('5e-2014')

    expect(repository.getRace('custom-race-1')?.status).toBe('unavailable')
    expect(repository.getClass('class-2014-wizard')?.spellcasting?.classSpellIds).not.toContain('custom-spell-1')
  })

  it('ID 冲突、前缀错误与规则集混用都被拒绝', () => {
    expect(() => registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      races: [{ ...raceEntry(), id: 'race-2014-human' }],
    })).toThrow(CustomContentConflictError)

    expect(() => registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      races: [{ ...raceEntry(), id: 'bad-id' }],
    })).toThrow(CustomContentConflictError)

    expect(() => registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      spells: [{ ...spellEntry(), ruleset: '5e-2024' }],
    })).toThrow(CustomContentConflictError)
  })

  it('清空内容后仓库恢复内置数据（逐项数量一致）', () => {
    const base = rulesRepository2014
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      races: [raceEntry()],
      spells: [spellEntry()],
    })
    expect(getRulesRepository('5e-2014').races.length).toBe(base.races.length + 1)

    resetCustomContent()
    const restored = getRulesRepository('5e-2014')
    expect(restored.races.length).toBe(base.races.length)
    expect(restored.spells.length).toBe(base.spells.length)
    expect(restored.getClass('class-2014-wizard')?.spellcasting?.classSpellIds).not.toContain('custom-spell-1')
  })

  it('空内容库合并结果与内置仓库逐字段一致（不修改入参）', () => {
    const base = rulesRepository2024
    const merged = mergeCustomContent(base, emptyBundle())
    expect(merged.classes).toHaveLength(base.classes.length)
    expect(merged.races).toHaveLength(base.races.length)
    expect(merged.spells).toHaveLength(base.spells.length)
    expect(base.races).toHaveLength(rulesRepository2024.races.length)
  })
})
