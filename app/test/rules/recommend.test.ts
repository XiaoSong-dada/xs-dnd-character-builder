import { describe, expect, it } from 'vitest'

import { getBackgroundRecommendationReason, getClassGrowthSummary, getRaceRecommendationReason } from '@/rules/recommend'
import { rulesRepository } from '@/rules/repository'

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
