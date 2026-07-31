import { describe, expect, it } from 'vitest'

import {
  ABILITY_IMPROVEMENT_OPTION_IDS,
  FEAT_OPTION_IDS,
  abilityImprovementOptions2014,
  feats2014,
} from '@/rules/data/feats-2014'
import {
  decodeAbilityImprovement,
  encodeAbilityImprovement,
  getAbilityImprovementEligibility,
  getFeatEligibility,
} from '@/rules/feats'

describe('2014 feats and ability improvements', () => {
  it('registers the complete 2014 PHB feat index with unique metadata', () => {
    expect(feats2014).toHaveLength(42)
    expect(new Set(FEAT_OPTION_IDS).size).toBe(feats2014.length)
    expect(feats2014.every((feat) =>
      feat.ruleset === '5e-2014'
      && feat.name.length > 0
      && feat.englishName.length > 0
      && feat.description.length > 0
      && feat.sourceIds.length > 0,
    )).toBe(true)
  })

  it('provides six +2 choices and fifteen distinct +1/+1 choices', () => {
    expect(abilityImprovementOptions2014).toHaveLength(21)
    expect(ABILITY_IMPROVEMENT_OPTION_IDS.filter((id) => id.endsWith('-2'))).toHaveLength(6)
    expect(ABILITY_IMPROVEMENT_OPTION_IDS.filter((id) => !id.endsWith('-2'))).toHaveLength(15)
    expect(encodeAbilityImprovement({ mode: 'single', abilities: ['cha'] })).toBe('asi-cha-2')
    expect(encodeAbilityImprovement({ mode: 'split', abilities: ['wis', 'dex'] })).toBe('asi-dex-wis')
    expect(decodeAbilityImprovement('asi-dex-wis')).toEqual({ mode: 'split', abilities: ['dex', 'wis'] })
  })

  it('rejects improvements over 20 and explains feat prerequisites', () => {
    const scores = { str: 19, dex: 14, con: 15, int: 8, wis: 12, cha: 10 } as const
    expect(getAbilityImprovementEligibility(scores, 'asi-str-2')).toEqual({
      available: false,
      reason: '力量提高后会超过20',
    })
    expect(getAbilityImprovementEligibility(scores, 'asi-dex-wis').available).toBe(true)

    const actor = feats2014.find((feat) => feat.id === 'feat-actor')
    expect(actor).toBeDefined()
    expect(getFeatEligibility(actor!, {
      abilities: scores,
      classId: 'class-2014-fighter',
      canCastSpells: false,
    }).reasons).toContain('魅力需要达到13')
  })
})
