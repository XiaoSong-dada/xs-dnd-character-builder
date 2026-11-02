import { describe, expect, it } from 'vitest'
import {
  SPELL_LEVEL_ALL,
  SPELL_SCHOOL_ALL,
  buildSpellLevelTabs,
  filterSpells,
  isSpellArchived,
  sortSpells,
  spellMetaLabel,
} from '@/components/spell/spell-picker'
import type { SpellRule } from '@/types/rules'

function makeSpell(overrides: Partial<SpellRule> & Pick<SpellRule, 'id' | 'name'>): SpellRule {
  return {
    ruleset: '5e-2014',
    englishName: '',
    level: 0,
    ritual: false,
    classIds: [],
    summary: '',
    description: '',
    status: 'selectable',
    sourceIds: [],
    ...overrides,
  }
}

describe('spell-picker', () => {
  it('把 unavailable 视为已归档', () => {
    expect(isSpellArchived(makeSpell({ id: 'a', name: 'A' }))).toBe(false)
    expect(
      isSpellArchived(makeSpell({ id: 'b', name: 'B', status: 'unavailable' })),
    ).toBe(true)
  })

  it('生成带环级、学派、英文名与仪式标记的元信息', () => {
    expect(
      spellMetaLabel(
        makeSpell({
          id: 'fire-bolt',
          name: '火焰箭',
          englishName: 'Fire Bolt',
          level: 0,
          school: '塑能',
        }),
      ),
    ).toBe('戏法 · 塑能 · Fire Bolt')
    expect(
      spellMetaLabel(
        makeSpell({
          id: 'fireball',
          name: '火球术',
          englishName: 'Fireball',
          level: 3,
          school: '塑能',
          ritual: true,
        }),
      ),
    ).toBe('3 环 · 塑能 · Fireball · 仪式')
    expect(spellMetaLabel(makeSpell({ id: 'bless', name: '祝福术', level: 1 }))).toBe('1 环')
  })

  it('只按实际存在的环级生成筛选页签', () => {
    const tabs = buildSpellLevelTabs([
      makeSpell({ id: 'level-1', name: '一', level: 1 }),
      makeSpell({ id: 'level-0', name: '零', level: 0 }),
      makeSpell({ id: 'level-3', name: '三', level: 3 }),
      makeSpell({ id: 'level-1b', name: '一', level: 1 }),
    ])

    expect(tabs).toEqual([
      { id: SPELL_LEVEL_ALL, label: '全部' },
      { id: '0', label: '戏法' },
      { id: '1', label: '1 环' },
      { id: '3', label: '3 环' },
    ])
    expect(buildSpellLevelTabs([])).toEqual([{ id: SPELL_LEVEL_ALL, label: '全部' }])
  })

  it('按环级、中文名、id 依次排序且不修改原数组', () => {
    const spells = [
      makeSpell({ id: 'level-3', name: 'Gamma', level: 3 }),
      makeSpell({ id: 'level-1-b', name: 'Beta', level: 1 }),
      makeSpell({ id: 'level-0', name: 'Alpha', level: 0 }),
      makeSpell({ id: 'level-1-a', name: 'Alpha', level: 1 }),
      makeSpell({ id: 'level-1-z', name: 'Same', level: 1 }),
      makeSpell({ id: 'level-1-a2', name: 'Same', level: 1 }),
    ]

    expect(sortSpells(spells).map((spell) => spell.id)).toEqual([
      'level-0',
      'level-1-a',
      'level-1-b',
      'level-1-a2',
      'level-1-z',
      'level-3',
    ])
    expect(spells.map((spell) => spell.id)).toEqual([
      'level-3',
      'level-1-b',
      'level-0',
      'level-1-a',
      'level-1-z',
      'level-1-a2',
    ])
  })

  it('按中文名、英文名与 id 搜索，忽略大小写', () => {
    const spells = [
      makeSpell({ id: 'fire-bolt', name: '火焰箭', englishName: 'Fire Bolt' }),
      makeSpell({ id: 'fireball', name: '火球术', englishName: 'Fireball', level: 3 }),
      makeSpell({ id: 'custom-spell-1', name: '自定义法术' }),
    ]

    expect(filterSpells(spells, { query: '火焰' }).map((spell) => spell.id)).toEqual(['fire-bolt'])
    expect(filterSpells(spells, { query: 'FIRE' }).map((spell) => spell.id)).toEqual([
      'fire-bolt',
      'fireball',
    ])
    expect(filterSpells(spells, { query: 'custom-spell-1' }).map((spell) => spell.id)).toEqual([
      'custom-spell-1',
    ])
    expect(filterSpells(spells, { query: '不存在' })).toEqual([])
    expect(filterSpells(spells, { query: '  ' })).toHaveLength(3)
  })

  it('按环级筛选，全部与空值不过滤', () => {
    const spells = [
      makeSpell({ id: 'level-0', name: '零', level: 0 }),
      makeSpell({ id: 'level-1', name: '一', level: 1 }),
      makeSpell({ id: 'level-3', name: '三', level: 3 }),
    ]

    expect(filterSpells(spells, { level: '0' }).map((spell) => spell.id)).toEqual(['level-0'])
    expect(filterSpells(spells, { level: '3' }).map((spell) => spell.id)).toEqual(['level-3'])
    expect(filterSpells(spells, { level: SPELL_LEVEL_ALL })).toHaveLength(3)
    expect(filterSpells(spells, { level: '' })).toHaveLength(3)
    expect(filterSpells(spells, { level: 'abc' })).toHaveLength(3)
  })

  it('按学派精确筛选，全部与空值不过滤', () => {
    const spells = [
      makeSpell({ id: 'evocation', name: '塑能法术', school: '塑能' }),
      makeSpell({ id: 'abjuration', name: '防护法术', school: '防护' }),
      makeSpell({ id: 'no-school', name: '无学派' }),
    ]

    expect(filterSpells(spells, { school: '塑能' }).map((spell) => spell.id)).toEqual(['evocation'])
    expect(filterSpells(spells, { school: SPELL_SCHOOL_ALL })).toHaveLength(3)
    expect(filterSpells(spells, { school: '' })).toHaveLength(3)
  })

  it('组合搜索、环级与学派筛选', () => {
    const spells = [
      makeSpell({ id: 'fire-bolt', name: '火焰箭', englishName: 'Fire Bolt', school: '塑能' }),
      makeSpell({
        id: 'fireball',
        name: '火球术',
        englishName: 'Fireball',
        level: 3,
        school: '塑能',
      }),
      makeSpell({ id: 'cure-wounds', name: '治疗 wounds', level: 1, school: '死灵' }),
    ]

    expect(
      filterSpells(spells, { query: 'fire', level: '0', school: '塑能' }).map(
        (spell) => spell.id,
      ),
    ).toEqual(['fire-bolt'])
    expect(
      filterSpells(spells, { query: 'fire', level: SPELL_LEVEL_ALL, school: '塑能' }).map(
        (spell) => spell.id,
      ),
    ).toEqual(['fire-bolt', 'fireball'])
  })
})
