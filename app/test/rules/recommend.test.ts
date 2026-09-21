import { describe, expect, it } from 'vitest'

import { getBackgroundRecommendationReason, getClassGrowthSummary, getRaceRecommendationReason, sortByClassRecommendation } from '@/rules/recommend'
import { rulesRepository } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'

const byId = (id: string) => {
  const classRule = rulesRepository.getClass(id)
  if (!classRule) throw new Error(`missing class ${id}`)
  return classRule
}

describe('getClassGrowthSummary', () => {
  it('fighter summary is data-driven and ordered by level', () => {
    const summary = getClassGrowthSummary(byId('class-2014-fighter'), rulesRepository)
    expect(summary[0]).toEqual({ level: 1, title: '生命骰 d10' })
    expect(summary.map((item) => item.level)).toEqual([...summary].sort((a, b) => a.level - b.level).map((item) => item.level))
    expect(summary.some((item) => item.level === 3 && item.title === '选择子职')).toBe(true)
    expect(summary.some((item) => item.title.includes('战斗风格'))).toBe(true)
  })

  it('spellcasting starts at the class-specific level', () => {
    expect(getClassGrowthSummary(byId('class-2014-wizard'), rulesRepository).some((item) => item.level === 1 && item.title.includes('开始施法'))).toBe(true)
    expect(getClassGrowthSummary(byId('class-2014-paladin'), rulesRepository).some((item) => item.level === 2 && item.title.includes('开始施法'))).toBe(true)
  })

  it('artificer includes spellcasting, infusions and specialist milestones', () => {
    const summary = getClassGrowthSummary(byId('class-2014-artificer'), rulesRepository)
    expect(summary.some((item) => item.level === 1 && item.title.includes('开始施法'))).toBe(true)
    expect(summary.some((item) => item.level === 2 && item.title.includes('灌注'))).toBe(true)
    expect(summary.some((item) => item.level === 3 && item.title === '选择子职')).toBe(true)
  })
})

describe('origin hints remain after class recommendation removal', () => {
  it('derives race and background hints from rule data', () => {
    expect(getRaceRecommendationReason(rulesRepository.getRace('race-2014-dwarf-mountain')!, byId('class-2014-fighter'))).toContain('力量')
    expect(getRaceRecommendationReason(rulesRepository.getRace('race-2014-elf')!, byId('class-2014-rogue'))).toContain('敏捷')
    expect(getBackgroundRecommendationReason(rulesRepository.getBackground('background-2014-soldier')!, byId('class-2014-fighter'))).toContain('可选熟练')
  })
})

interface RecommendedItem {
  readonly id: string
  readonly recommendedClassIds: readonly string[]
}

/** 独立复算期望顺序（不调用被测函数）：推荐命中在前，其余留在后面，两组都保持登记顺序。 */
function expectedRecommendationOrder<T extends RecommendedItem>(items: readonly T[], classId: string): readonly string[] {
  return [
    ...items.filter((item) => item.recommendedClassIds.includes(classId)),
    ...items.filter((item) => !item.recommendedClassIds.includes(classId)),
  ].map((item) => item.id)
}

/** 断言推荐优先的稳定分区：不丢项、不重复、组内保持登记顺序、推荐块非空。 */
function expectRecommendedFirst<T extends RecommendedItem>(items: readonly T[], classId: string): void {
  const ordered = sortByClassRecommendation(items, classId)
  const indexById = new Map(items.map((item, index) => [item.id, index]))
  expect(ordered).toHaveLength(items.length)
  expect(new Set(ordered.map((item) => item.id))).toEqual(new Set(items.map((item) => item.id)))
  expect(ordered.map((item) => item.id)).toEqual(expectedRecommendationOrder(items, classId))

  const flags = ordered.map((item) => item.recommendedClassIds.includes(classId))
  const boundary = flags.indexOf(false)
  const splitAt = boundary === -1 ? flags.length : boundary
  expect(splitAt, '用例需覆盖至少一个推荐项').toBeGreaterThan(0)
  expect(flags.slice(0, splitAt).every(Boolean)).toBe(true)
  expect(flags.slice(splitAt).some(Boolean)).toBe(false)

  // 稳定分区：两个分组各自在登记顺序中的下标必须递增（组内不重排）
  const positionOf = (item: T): number => indexById.get(item.id) ?? -1
  const recommendedPositions = ordered.filter((item) => item.recommendedClassIds.includes(classId)).map(positionOf)
  const restPositions = ordered.filter((item) => !item.recommendedClassIds.includes(classId)).map(positionOf)
  expect(recommendedPositions).not.toContain(-1)
  expect(restPositions).not.toContain(-1)
  expect(recommendedPositions.length + restPositions.length).toBe(items.length)
  expect(recommendedPositions).toEqual([...recommendedPositions].sort((left, right) => left - right))
  expect(restPositions).toEqual([...restPositions].sort((left, right) => left - right))
}

describe('sortByClassRecommendation 推荐优先稳定分区（v1.9.1 R1）', () => {
  it('2014 种族：推荐项整体前移，其余保持登记顺序', () => {
    expectRecommendedFirst(rulesRepository.races, 'class-2014-fighter')
  })

  it('2024 物种：同一规则适用于另一个规则集', () => {
    expectRecommendedFirst(rulesRepository2024.races, 'class-2024-fighter')
  })

  it('2014 背景：推荐项整体前移', () => {
    expectRecommendedFirst(rulesRepository.backgrounds, 'class-2014-fighter')
  })

  it('2024 出身目录当前没有推荐清单，顺序必须原样保持', () => {
    const backgrounds = rulesRepository2024.backgrounds
    expect(backgrounds.some((item) => item.recommendedClassIds.length > 0)).toBe(false)
    expect(sortByClassRecommendation(backgrounds, 'class-2024-fighter').map((item) => item.id))
      .toEqual(backgrounds.map((item) => item.id))
  })

  it('未选择职业或职业无推荐命中时保持登记顺序', () => {
    const registrationOrder = rulesRepository.races.map((item) => item.id)
    expect(sortByClassRecommendation(rulesRepository.races).map((item) => item.id)).toEqual(registrationOrder)
    expect(sortByClassRecommendation(rulesRepository.races, '').map((item) => item.id)).toEqual(registrationOrder)
    expect(sortByClassRecommendation(rulesRepository.races, 'class-2014-nonexistent').map((item) => item.id)).toEqual(registrationOrder)
  })

  it('空输入安全且不修改入参', () => {
    expect(sortByClassRecommendation([], 'class-2014-fighter')).toEqual([])
    const races = rulesRepository.races
    const snapshot = races.map((item) => item.id)
    sortByClassRecommendation(races, 'class-2014-fighter')
    expect(races.map((item) => item.id)).toEqual(snapshot)
  })
})
