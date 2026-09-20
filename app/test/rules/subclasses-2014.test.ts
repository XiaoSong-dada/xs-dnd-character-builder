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

/**
 * G3-I2 起第三方子职并入 `subclasses2014`（ID 含 `-tp-`）。
 * 既有「已核验的官方数目」断言只统计核心条目，第三方条目按覆盖度下界断言，避免锁死总数。
 */
const isThirdParty = (id: string): boolean => id.includes('-tp-')
const coreSubclasses = subclasses2014.filter((subclass) => !isThirdParty(subclass.id))
const thirdPartySubclasses = subclasses2014.filter((subclass) => isThirdParty(subclass.id))

describe('2014 subclass catalog', () => {
  it('registers unique and complete subclass metadata records', () => {
    expect(coreSubclasses).toHaveLength(118)
    expect(subclasses2014).toHaveLength(118 + thirdPartySubclasses.length)
    expect(thirdPartySubclasses.length).toBeGreaterThanOrEqual(11)
    expect(new Set(subclasses2014.map((subclass) => subclass.id)).size).toBe(subclasses2014.length)
    expect(subclassOptions2014).toHaveLength(subclasses2014.length)
    expect(subclasses2014.every((subclass) =>
      subclass.name.length > 0
      && subclass.englishName.length > 0
      && subclass.summary.length > 0
      && subclass.sourceIds.length > 0
      && subclass.ruleset === '5e-2014'
    )).toBe(true)
  })

  it('keeps player and DM-only availability separate', () => {
    expect(coreSubclasses.filter((subclass) => subclass.availability === 'player')).toHaveLength(116)
    expect(thirdPartySubclasses.every((subclass) => subclass.availability === 'player')).toBe(true)
    expect(subclasses2014.filter((subclass) => subclass.availability === 'dm-only').map((subclass) => subclass.id).sort())
      .toEqual(['subclass-2014-cleric-death', 'subclass-2014-paladin-oathbreaker'])
    // 2024 专属子职（世界树、舞蹈、海洋）不得出现在 2014 目录；按名称比对，
    // 不能用 `endsWith('sea')` 之类的后缀判断（第三方 slug 如 `open-sea` 会误命中）。
    const only2024Names = ['世界树道途', '舞蹈学院', '海洋结社']
    const leaked = subclasses2014.filter((subclass) => only2024Names.includes(subclass.name))
    expect(leaked.map((subclass) => subclass.id)).toEqual([])
    const only2024Ids = ['subclass-2024-barbarian-world-tree', 'subclass-2024-bard-dance', 'subclass-2024-druid-circle-of-the-sea']
    expect(subclasses2014.filter((subclass) => only2024Ids.includes(subclass.id))).toEqual([])
  })

  it('matches the audited count for every core class and resolves every source', () => {
    for (const [classId, expectedCount] of Object.entries(expectedCounts)) {
      expect(coreSubclasses.filter((subclass) => subclass.classId === classId)).toHaveLength(expectedCount)
    }
    // 第三方条目同样必须挂到已支持职业上
    const supportedClassIds = new Set(Object.keys(expectedCounts))
    for (const subclass of thirdPartySubclasses) {
      expect(supportedClassIds.has(subclass.classId), subclass.id).toBe(true)
      expect(subclass.selectionLevel, subclass.id).toBeGreaterThanOrEqual(1)
      expect(subclass.features.length, subclass.id).toBeGreaterThan(0)
    }
    expect(subclasses2014.flatMap((subclass) => subclass.sourceIds)
      .every((sourceId) => rulesRepository.sources.some((source) => source.id === sourceId))).toBe(true)
    expect(new Set(rulesRepository.options.map((option) => option.id)).size).toBe(rulesRepository.options.length)
  })

  it('provides every class a player-only subclass checkpoint at its 2014 selection level', () => {
    for (const classId of Object.keys(expectedCounts)) {
      const checkpoint = buildTimeline(classId, 20).find((item) => item.kind === 'subclass')
      const corePlayerSubclasses = coreSubclasses.filter((subclass) => subclass.classId === classId && subclass.availability === 'player')
      expect(checkpoint?.level).toBe(corePlayerSubclasses[0]?.selectionLevel)
      // 第三方来源默认关闭，故检查点候选是核心条目的超集（默认情况下相等）。
      expect(checkpoint?.optionIds).toEqual(expect.arrayContaining(corePlayerSubclasses.map((subclass) => subclass.id)))
      expect(checkpoint?.optionIds.some((id) => rulesRepository.getSubclass(id)?.availability === 'dm-only')).toBe(false)
    }
  })
})
