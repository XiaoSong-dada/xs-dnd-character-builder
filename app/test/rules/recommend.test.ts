import { describe, expect, it } from 'vitest'

import { getBackgroundRecommendationReason, getClassGrowthSummary, getClassRecommendation, getRaceRecommendationReason } from '@/rules/recommend'
import { rulesRepository } from '@/rules/repository'

const byId = (id: string) => {
  const classRule = rulesRepository.getClass(id)
  if (!classRule) throw new Error(`missing class ${id}`)
  return classRule
}

describe('getClassRecommendation', () => {
  it('empty preferences yields zero score and no reasons for every class', () => {
    for (const classRule of rulesRepository.classes) {
      const recommendation = getClassRecommendation(classRule, [])
      expect(recommendation.score).toBe(0)
      expect(recommendation.reasons).toHaveLength(0)
      expect(recommendation.matchedPreferenceLabels).toHaveLength(0)
    }
  })

  it('spellcasting preference ranks full casters first and leaves pure martials at zero', () => {
    const fullCasterIds = ['class-2014-bard', 'class-2014-cleric', 'class-2014-druid', 'class-2014-sorcerer', 'class-2014-warlock', 'class-2014-wizard']
    const ranked = [...rulesRepository.classes]
      .map((classRule) => ({ classRule, recommendation: getClassRecommendation(classRule, ['spellcasting']) }))
      .sort((a, b) => b.recommendation.score - a.recommendation.score)
    const fullCasterScores = ranked
      .filter(({ classRule }) => fullCasterIds.includes(classRule.id))
      .map(({ recommendation }) => recommendation.score)
    const bestOtherScore = ranked
      .filter(({ classRule }) => !fullCasterIds.includes(classRule.id))
      .reduce((max, { recommendation }) => Math.max(max, recommendation.score), 0)
    expect(fullCasterScores.every((score) => score > 0)).toBe(true)
    expect(Math.min(...fullCasterScores)).toBeGreaterThan(bestOtherScore)
    const first = ranked[0]
    expect(first.recommendation.reasons[0].text).toContain('施放法术')
    for (const id of ['class-2014-barbarian', 'class-2014-fighter', 'class-2014-rogue']) {
      expect(getClassRecommendation(byId(id), ['spellcasting']).score).toBe(0)
    }
  })

  it('melee preference matches frontline classes with readable reasons', () => {
    const barbarian = getClassRecommendation(byId('class-2014-barbarian'), ['melee'])
    expect(barbarian.score).toBeGreaterThan(0)
    expect(barbarian.matchedPreferenceLabels).toEqual(['近身作战'])
    expect(barbarian.reasons[0].text).toContain('力量')
    expect(barbarian.reasons[0].text).toContain('前线近战')
    const wizard = getClassRecommendation(byId('class-2014-wizard'), ['melee'])
    expect(wizard.score).toBe(0)
  })

  it('durable preference distinguishes barbarian from wizard', () => {
    const barbarian = getClassRecommendation(byId('class-2014-barbarian'), ['durable'])
    const wizard = getClassRecommendation(byId('class-2014-wizard'), ['durable'])
    expect(barbarian.score).toBeGreaterThan(wizard.score)
    expect(wizard.score).toBe(0)
    expect(barbarian.reasons[0].text).toContain('耐久生存')
  })

  it('multi-preference reasons map one-to-one to matched preferences', () => {
    const fighter = getClassRecommendation(byId('class-2014-fighter'), ['melee', 'ranged', 'durable'])
    expect(fighter.reasons).toHaveLength(3)
    expect(fighter.matchedPreferenceLabels).toEqual(['近身作战', '远程攻击', '高生存'])
    expect(fighter.score).toBe(fighter.reasons.reduce((sum, reason) => sum + reason.weight, 0))
  })

  it('status (data completeness) does not affect the score', () => {
    const fighter = byId('class-2014-fighter')
    const asIndexOnly = { ...fighter, status: 'index-only' as const }
    const preferences = ['melee', 'durable']
    expect(getClassRecommendation(fighter, preferences).score)
      .toBe(getClassRecommendation(asIndexOnly, preferences).score)
  })
})

describe('getClassGrowthSummary', () => {
  it('fighter summary is data-driven and ordered by level', () => {
    const summary = getClassGrowthSummary(byId('class-2014-fighter'), rulesRepository)
    expect(summary[0]).toEqual({ level: 1, title: '生命骰 d10' })
    const levels = summary.map((item) => item.level)
    expect([...levels].sort((a, b) => a - b)).toEqual(levels)
    expect(summary.some((item) => item.level === 3 && item.title === '选择子职')).toBe(true)
    expect(summary.some((item) => item.title.includes('战斗风格'))).toBe(true)
    expect(summary.some((item) => item.level === 4 && item.title === '属性提升或专长')).toBe(true)
  })

  it('wizard summary includes spellcasting start at level 1', () => {
    const summary = getClassGrowthSummary(byId('class-2014-wizard'), rulesRepository)
    expect(summary.some((item) => item.level === 1 && item.title.includes('开始施法'))).toBe(true)
  })

  it('paladin summary includes spellcasting start at level 2', () => {
    const summary = getClassGrowthSummary(byId('class-2014-paladin'), rulesRepository)
    expect(summary.some((item) => item.level === 2 && item.title.includes('开始施法'))).toBe(true)
  })
})

describe('race and background recommendation reasons', () => {
  it('derives ability-based race reasons from data', () => {
    const fighter = byId('class-2014-fighter')
    const mountainDwarf = rulesRepository.getRace('race-2014-dwarf-mountain')
    if (!mountainDwarf) throw new Error('missing race')
    expect(getRaceRecommendationReason(mountainDwarf, fighter)).toContain('力量')

    const rogue = byId('class-2014-rogue')
    const elf = rulesRepository.getRace('race-2014-elf')
    if (!elf) throw new Error('missing race')
    expect(getRaceRecommendationReason(elf, rogue)).toContain('敏捷')
  })

  it('falls back to neutral text when no ability overlaps', () => {
    const fighter = byId('class-2014-fighter')
    const dwarf = rulesRepository.getRace('race-2014-dwarf')
    if (!dwarf) throw new Error('missing race')
    expect(getRaceRecommendationReason(dwarf, fighter)).toMatch(/常见玩法/)
  })

  it('derives background reasons from skill overlap with class skill options', () => {
    const fighter = byId('class-2014-fighter')
    const soldier = rulesRepository.getBackground('background-2014-soldier')
    if (!soldier) throw new Error('missing background')
    expect(getBackgroundRecommendationReason(soldier, fighter)).toContain('可选熟练')
  })
})
