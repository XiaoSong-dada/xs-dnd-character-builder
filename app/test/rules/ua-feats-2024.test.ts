import { describe, expect, it } from 'vitest'

import { uaFeats2024 } from '@/rules/data/ua-feats-2024'
import { rulesRepository2024 } from '@/rules/repositories'
import { listFeatGrants, getFeatEligibility, type FeatEligibilityContext } from '@/rules/feats'
import { getFeatEligibilityContext } from '@/rules/feat-eligibility'
import { getAlwaysPreparedSpellIds, getAvailableSpells, getSpellcastingConfig } from '@/rules/spellcasting'
import { draft2024, selection } from '../fixtures/draft-2024'

const context = (overrides: Partial<FeatEligibilityContext> = {}): FeatEligibilityContext => ({
  abilities: { str: 10, dex: 10, con: 10, int: 15, wis: 10, cha: 10 },
  classId: 'class-2024-ua-psion',
  canCastSpells: true,
  level: 4,
  acquiredFeatIds: [],
  acquiredFeatTags: [],
  ...overrides,
})

describe('艾伯伦龙纹与狂野天赋专长（UA，E07）', () => {
  it('38 条专长分类、来源与引用闭合', () => {
    const dragonmark = uaFeats2024.filter((feat) => feat.category === 'dragonmark')
    const greater = uaFeats2024.filter((feat) => feat.category === 'general' && feat.englishName.startsWith('Greater'))
    const wildTalents = uaFeats2024.filter((feat) => feat.category === 'wild-talent')
    expect(dragonmark).toHaveLength(13)
    expect(greater).toHaveLength(13)
    expect(wildTalents).toHaveLength(10)
    expect(uaFeats2024).toHaveLength(38)
    expect(rulesRepository2024.getFeat('feat-2024-ua-potent-dragonmark')?.category).toBe('general')
    expect(rulesRepository2024.getFeat('feat-2024-ua-boon-of-siberys')?.category).toBe('epic-boon')
    for (const feat of uaFeats2024) {
      expect(rulesRepository2024.getFeat(feat.id), feat.id).toBeDefined()
      expect(feat.status).toBe('selectable')
      for (const grant of feat.grantedSpells ?? []) {
        expect(rulesRepository2024.getSpell(grant.spellId), `${feat.id}:${grant.spellId}`).toBeDefined()
      }
      for (const spellId of feat.expandedSpellPool ?? []) {
        expect(rulesRepository2024.getSpell(spellId), `${feat.id}:${spellId}`).toBeDefined()
      }
    }
    expect(uaFeats2024.filter((feat) => feat.sourceIds.includes('source-2024-ua-eberron'))).toHaveLength(28)
    expect(uaFeats2024.filter((feat) => feat.sourceIds.includes('source-2024-ua-psion'))).toHaveLength(10)
  })

  it('互斥与前置：同类标签互斥、高等龙纹需对应基础龙纹', () => {
    const secondDragonmark = rulesRepository2024.getFeat('feat-2024-ua-dragonmark-markoffinding')!
    const blocked = getFeatEligibility(secondDragonmark, context({ acquiredFeatTags: ['dragonmark'] }))
    expect(blocked.available).toBe(false)
    expect(blocked.reasons.join()).toContain('同类专长')
    const allowed = getFeatEligibility(secondDragonmark, context())
    expect(allowed.available).toBe(true)

    const wildTalent = rulesRepository2024.getFeat('feat-2024-ua-wild-talent-atmokinesis')!
    expect(getFeatEligibility(wildTalent, context({ acquiredFeatTags: ['wild-talent'] })).available).toBe(false)

    const greater = rulesRepository2024.getFeat('feat-2024-ua-greater-dragonmark-greatermarkoffinding')!
    const missingBase = getFeatEligibility(greater, context({ level: 4 }))
    expect(missingBase.available).toBe(false)
    const withBase = getFeatEligibility(greater, context({ level: 4, acquiredFeatIds: ['feat-2024-ua-dragonmark-markoffinding'] }))
    expect(withBase.available).toBe(true)
    const lowLevel = getFeatEligibility(greater, context({ level: 3, acquiredFeatIds: ['feat-2024-ua-dragonmark-markoffinding'] }))
    expect(lowLevel.available).toBe(false)
  })

  it('贵族／智者背景的起源专长替代生效', () => {
    const base = {
      classId: 'class-2024-ua-psion',
      backgroundId: 'background-2024-sage',
      targetLevel: 4,
      enabledSourceIds: ['source-2024-ua-psion'],
    } as const
    const withoutTalent = listFeatGrants(draft2024(base), rulesRepository2024)
    expect(withoutTalent.some((grant) => grant.featId === 'feat-2024-magic-initiate')).toBe(true)

    const withTalent = listFeatGrants(draft2024({
      ...base,
      selections: [selection('psion-2024-feat-4', ['feat-2024-ua-wild-talent-atmokinesis'])],
    }), rulesRepository2024)
    expect(withTalent.some((grant) => grant.featId === 'feat-2024-magic-initiate')).toBe(false)
    expect(withTalent.some((grant) => grant.featId === 'feat-2024-ua-wild-talent-atmokinesis')).toBe(true)
    const noble = rulesRepository2024.getBackground('background-2024-noble')
    expect(noble?.originFeatSubstitutions?.[0]?.category).toBe('wild-talent')
    expect(rulesRepository2024.getBackground('background-2024-acolyte')?.originFeatSubstitutions).toBeUndefined()
  })

  it('纹中之法扩表与 3 级追加授予生效', () => {
    const draft = draft2024({
      classId: 'class-2024-ua-psion',
      targetLevel: 4,
      enabledSourceIds: ['source-2024-ua-psion', 'source-2024-ua-eberron'],
      selections: [selection('psion-2024-feat-4', ['feat-2024-ua-dragonmark-markoffinding'])],
    })
    const eligibility = getFeatEligibilityContext(draft, { checkpointLevel: 4 })
    expect(eligibility.acquiredFeatIds).toContain('feat-2024-ua-dragonmark-markoffinding')
    expect(eligibility.acquiredFeatTags).toContain('dragonmark')
    const config = getSpellcastingConfig(draft)
    if (!config) throw new Error('缺少施法配置')
    const available = getAvailableSpells(draft, config).map((spell) => spell.id)
    expect(available).toContain('spell-2024-locate-animals-or-plants')
    expect(getAlwaysPreparedSpellIds(draft)).toContain('spell-2024-locate-object')
  })
})
