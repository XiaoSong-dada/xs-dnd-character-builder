import { describe, expect, it } from 'vitest'

import { feats2024 } from '@/rules/data/feats-2024'
import { getFeatEligibility, getFeatPool, listActiveFeats, listFeatGrants } from '@/rules/feats'
import { rulesRepository2024 } from '@/rules/repositories'
import type { AbilityScores } from '@/types/character'
import { draft2024, selection } from '../fixtures/draft-2024'

function feat(slug: string) {
  const found = feats2024.find((item) => item.id === `feat-2024-${slug}`)
  if (!found) throw new Error(`missing feat: ${slug}`)
  return found
}

function abilities(overrides: Partial<AbilityScores> = {}): AbilityScores {
  return { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10, ...overrides }
}

function context(overrides: Record<string, unknown> = {}) {
  return {
    abilities: abilities(),
    classId: 'class-2024-fighter',
    canCastSpells: false,
    level: 4,
    ...overrides,
  }
}

describe('2024 专长目录', () => {
  it('包含四类共 75 条并全部接入 2024 仓库', () => {
    expect(feats2024).toHaveLength(75)
    const count = (category: string) => feats2024.filter((item) => item.category === category).length
    expect(count('origin')).toBe(10)
    expect(count('general')).toBe(43)
    expect(count('fighting-style')).toBe(10)
    expect(count('epic-boon')).toBe(12)
    expect(new Set(feats2024.map((item) => item.id)).size).toBe(75)
    expect(feats2024.every((item) => item.id.startsWith('feat-2024-'))).toBe(true)
    expect(feats2024.every((item) => item.ruleset === '5e-2024' && item.description.length > 0 && item.detail.length > 0)).toBe(true)
    expect(feats2024.every((item) => item.sourceIds.includes('source-2024-phb'))).toBe(true)
    expect(rulesRepository2024.feats).toHaveLength(75)
    expect(rulesRepository2024.getFeat('feat-2024-alert')?.name).toBe('警戒')
    expect(rulesRepository2024.getFeat('feat-2024-boon-of-fate')?.name).toBe('扭曲命运之恩惠')
    expect(rulesRepository2024.getOption('asi-2024-str-2')?.name).toBe('力量 +2')
  })

  it('等级、类别与复选规则按 B01 矩阵登记', () => {
    for (const item of feats2024.filter((entry) => entry.category === 'general')) {
      expect(item.prerequisite?.minimumLevel).toBe(4)
    }
    for (const item of feats2024.filter((entry) => entry.category === 'fighting-style')) {
      expect(item.prerequisite?.requiredCapability).toBe('fighting-style')
    }
    for (const item of feats2024.filter((entry) => entry.category === 'epic-boon')) {
      expect(item.prerequisite?.minimumLevel).toBe(19)
    }
    expect(feats2024.filter((entry) => entry.category === 'origin').every((entry) => entry.prerequisite === undefined)).toBe(true)
    expect(feats2024.filter((entry) => entry.repeatable).map((entry) => entry.id).sort()).toEqual([
      'feat-2024-ability-score-improvement',
      'feat-2024-elemental-adept',
      'feat-2024-magic-initiate',
      'feat-2024-skilled',
    ])
  })

  it('候选池按类别与获得节点等级展开', () => {
    expect(getFeatPool(rulesRepository2024, ['fighting-style'], { level: 1 })).toHaveLength(10)
    const general = getFeatPool(rulesRepository2024, ['general'], { level: 4 })
    expect(general).toHaveLength(43)
    expect(general.some((item) => item.id === 'feat-2024-boon-of-fate')).toBe(false)
    const withBoons = getFeatPool(rulesRepository2024, ['general', 'epic-boon'], { level: 19 })
    expect(withBoons).toHaveLength(55)
    expect(getFeatPool(rulesRepository2024, ['origin'], { level: 1 })).toHaveLength(10)
    expect(getFeatPool(rulesRepository2024, ['general'], { level: 3 })).toHaveLength(0)
  })

  it('前置按等级、属性、特性与护甲训练判定', () => {
    expect(getFeatEligibility(feat('actor'), context({ abilities: abilities({ cha: 13 }) })).available).toBe(true)
    expect(getFeatEligibility(feat('actor'), context({ abilities: abilities({ cha: 12 }) })).reasons).toContain('魅力需要达到13')
    expect(getFeatEligibility(feat('actor'), context({ abilities: abilities({ cha: 13 }), level: 3 })).reasons).toContain('需要4级')
    expect(getFeatEligibility(feat('archery'), context({ hasFightingStyle: false })).reasons).toContain('需要战斗风格特性')
    expect(getFeatEligibility(feat('archery'), context({ hasFightingStyle: true })).available).toBe(true)
    expect(getFeatEligibility(feat('elemental-adept'), context({ canCastSpells: false })).reasons).toContain('需要施法或契约魔法特性')
    expect(getFeatEligibility(feat('heavily-armored'), context({ armorTrainings: ['heavy'] })).reasons).toContain('需要中甲熟练')
    expect(getFeatEligibility(feat('heavily-armored'), context({ armorTrainings: ['medium'] })).available).toBe(true)
    expect(getFeatEligibility(feat('shield-master'), context({ armorTrainings: [] })).reasons).toContain('需要盾牌熟练')
    expect(getFeatEligibility(feat('boon-of-fate'), context({ level: 18 })).reasons).toContain('需要19级')
  })

  it('背景固定授予与时间线选择都进入授予清单', () => {
    const draft = draft2024({
      backgroundId: 'background-2024-sage',
      selections: [
        selection('class-2024-fighter-style-1', ['feat-2024-archery']),
        selection('class-2024-fighter-feat-4', ['feat-2024-tough']),
      ],
    })
    expect(listFeatGrants(draft, rulesRepository2024)).toEqual([
      { featId: 'feat-2024-magic-initiate', sourceKind: 'background', sourceId: 'background-2024-sage' },
      { featId: 'feat-2024-archery', sourceKind: 'class', sourceId: 'class-2024-fighter-style-1', checkpointId: 'class-2024-fighter-style-1' },
      { featId: 'feat-2024-tough', sourceKind: 'class', sourceId: 'class-2024-fighter-feat-4', checkpointId: 'class-2024-fighter-feat-4' },
    ])
    expect(listActiveFeats(draft, rulesRepository2024).map((item) => item.id)).toEqual([
      'feat-2024-magic-initiate',
      'feat-2024-archery',
      'feat-2024-tough',
    ])
  })

  it('失效选择不进入授予清单', () => {
    const draft = draft2024({
      selections: [
        { ...selection('class-2024-fighter-feat-4', ['feat-2024-tough']), invalidatedAt: '2026-09-11T01:00:00.000Z' },
      ],
    })
    expect(listFeatGrants(draft, rulesRepository2024)).toEqual([])
  })
})
