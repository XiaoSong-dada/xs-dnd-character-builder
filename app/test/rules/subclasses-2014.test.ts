import { describe, expect, it } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import { subclassOptions2014, subclasses2014 } from '@/rules/data/subclasses-2014'
import { buildTimeline } from '@/rules/timeline'

const expectedCounts: Readonly<Record<string, number>> = {
  'class-2014-barbarian': 9,
  'class-2014-bard': 8,
  'class-2014-cleric': 14,
  'class-2014-druid': 7,
  'class-2014-fighter': 10,
  'class-2014-monk': 10,
  'class-2014-paladin': 9,
  'class-2014-ranger': 8,
  'class-2014-rogue': 9,
  'class-2014-sorcerer': 8,
  'class-2014-warlock': 9,
  'class-2014-wizard': 13,
  'class-2014-artificer': 4,
}

describe('2014 subclass catalog', () => {
  it('registers 118 unique and complete subclass metadata records', () => {
    expect(subclasses2014).toHaveLength(118)
    expect(new Set(subclasses2014.map((subclass) => subclass.id)).size).toBe(118)
    expect(subclassOptions2014).toHaveLength(118)
    expect(subclasses2014.every((subclass) =>
      subclass.name.length > 0
      && subclass.englishName.length > 0
      && subclass.summary.length > 0
      && subclass.sourceIds.length > 0
      && subclass.ruleset === '5e-2014'
    )).toBe(true)
  })

  it('keeps player and DM-only availability separate', () => {
    expect(subclasses2014.filter((subclass) => subclass.availability === 'player')).toHaveLength(116)
    expect(subclasses2014.filter((subclass) => subclass.availability === 'dm-only').map((subclass) => subclass.id).sort())
      .toEqual(['subclass-2014-cleric-death', 'subclass-2014-paladin-oathbreaker'])
    expect(subclasses2014.some((subclass) => ['world-tree', 'dance', 'sea'].some((slug) => subclass.id.endsWith(slug)))).toBe(false)
  })

  it('matches the audited count for every class and resolves every source', () => {
    for (const [classId, expectedCount] of Object.entries(expectedCounts)) {
      expect(subclasses2014.filter((subclass) => subclass.classId === classId)).toHaveLength(expectedCount)
    }
    expect(subclasses2014.flatMap((subclass) => subclass.sourceIds)
      .every((sourceId) => rulesRepository.sources.some((source) => source.id === sourceId))).toBe(true)
    expect(new Set(rulesRepository.options.map((option) => option.id)).size).toBe(rulesRepository.options.length)
  })

  it('provides every class a player-only subclass checkpoint at its 2014 selection level', () => {
    for (const classId of Object.keys(expectedCounts)) {
      const checkpoint = buildTimeline(classId, 20).find((item) => item.kind === 'subclass')
      const playerSubclasses = subclasses2014.filter((subclass) => subclass.classId === classId && subclass.availability === 'player')
      expect(checkpoint?.level).toBe(playerSubclasses[0]?.selectionLevel)
      expect(checkpoint?.optionIds).toHaveLength(playerSubclasses.length)
      expect(checkpoint?.optionIds).toEqual(playerSubclasses.map((subclass) => subclass.id))
      expect(checkpoint?.optionIds.some((id) => rulesRepository.getSubclass(id)?.availability === 'dm-only')).toBe(false)
    }
  })
})
