import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { fighterOptions2024, fighterSubclassFeatures2024, fighterSubclasses2024 } from '@/rules/data/fighter-2024'
import { wizardSubclassFeatures2024, wizardSubclasses2024 } from '@/rules/data/wizard-2024'
import { getCheckpointSelectionBounds } from '@/rules/feats'
import { getCheckpointCandidates, getMaximumSpellLevel, getRequiredSpellCount, getSpellcastingConfig, getSpellSlots } from '@/rules/spellcasting'
import { getDicePoolCount, getDicePoolDie, getResourceMax } from '@/rules/resources'
import { buildTimeline } from '@/rules/timeline'
import { draft2024 } from '../fixtures/draft-2024'

const FIGHTER_SUBCLASS_IDS = [
  'subclass-2024-fighter-champion',
  'subclass-2024-fighter-eldritch-knight',
  'subclass-2024-fighter-battle-master',
  'subclass-2024-fighter-psi-warrior',
] as const

const WIZARD_SUBCLASS_IDS = [
  'subclass-2024-wizard-evoker',
  'subclass-2024-wizard-illusionist',
  'subclass-2024-wizard-abjurer',
  'subclass-2024-wizard-diviner',
] as const

describe('2024 战士与法师补齐子职（B08-13）', () => {
  it('战士 4 个子职全部接入，特性等级结构正确', () => {
    expect(rulesRepository2024.subclasses.filter((subclass) => subclass.classId === 'class-2024-fighter').map((subclass) => subclass.id)).toEqual([...FIGHTER_SUBCLASS_IDS])
    expect(fighterSubclasses2024.map((subclass) => subclass.id)).toEqual([...FIGHTER_SUBCLASS_IDS])
    const expected: Readonly<Record<(typeof FIGHTER_SUBCLASS_IDS)[number], readonly number[]>> = {
      'subclass-2024-fighter-champion': [3, 3, 7, 10, 15, 18],
      'subclass-2024-fighter-battle-master': [3, 3, 7, 7, 10, 15, 18],
      'subclass-2024-fighter-eldritch-knight': [3, 3, 7, 10, 15, 18],
      'subclass-2024-fighter-psi-warrior': [3, 7, 10, 15, 18],
    }
    for (const id of FIGHTER_SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass?.status).toBe('implemented')
      expect(subclass?.features.map((feature) => feature.level)).toEqual(expected[id])
    }
  })

  it('奥法骑士使用智力的三分之一施法配置（法师法术表）', () => {
    const config = getSpellcastingConfig({ classId: 'class-2024-fighter', subclassId: 'subclass-2024-fighter-eldritch-knight', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少奥法骑士施法配置')
    expect(config.mode).toBe('prepared')
    expect(config.ability).toBe('int')
    expect(config.startsAtLevel).toBe(3)
    const atThree = draft2024({ classId: 'class-2024-fighter', subclassId: 'subclass-2024-fighter-eldritch-knight', targetLevel: 3 })
    expect(getRequiredSpellCount(atThree, config)).toBe(3)
    expect(getMaximumSpellLevel(config, 3)).toBe(1)
    expect(getSpellSlots(config, 3).map((slot) => [slot.level, slot.count])).toEqual([[1, 2]])
    const atSeven = draft2024({ classId: 'class-2024-fighter', subclassId: 'subclass-2024-fighter-eldritch-knight', targetLevel: 7 })
    expect(getRequiredSpellCount(atSeven, config)).toBe(5)
    expect(getMaximumSpellLevel(config, 7)).toBe(2)
    expect(getSpellSlots(config, 7).map((slot) => [slot.level, slot.count])).toEqual([[1, 4], [2, 2]])
    const atTwenty = draft2024({ classId: 'class-2024-fighter', subclassId: 'subclass-2024-fighter-eldritch-knight', targetLevel: 20 })
    expect(getRequiredSpellCount(atTwenty, config)).toBe(13)
    expect(getMaximumSpellLevel(config, 20)).toBe(4)
  })

  it('战斗大师卓越骰与战技检查点登记', () => {
    const superiority = fighterSubclassFeatures2024.find((feature) => feature.id === 'fighter-2024-battle-master-combat-superiority')?.dicePool
    if (!superiority) throw new Error('缺少卓越骰池')
    expect([3, 7, 10, 15, 18].map((level) => getDicePoolCount(superiority, level))).toEqual([4, 5, 5, 6, 6])
    expect([3, 9, 10, 17, 18].map((level) => getDicePoolDie(superiority, level))).toEqual(['d8', 'd8', 'd10', 'd10', 'd12'])
    expect(superiority.recovery).toBe('short-rest')

    expect(fighterOptions2024).toHaveLength(20)
    const draft = draft2024({ classId: 'class-2024-fighter', subclassId: 'subclass-2024-fighter-battle-master', targetLevel: 15 })
    const timeline = buildTimeline('class-2024-fighter', 15, { ruleset: '5e-2024', subclassId: 'subclass-2024-fighter-battle-master' })
    const maneuverCheckpoints = timeline.filter((checkpoint) => checkpoint.optionIds.some((id) => id.startsWith('maneuver-2024-')))
    expect(maneuverCheckpoints.map((checkpoint) => [checkpoint.level, checkpoint.minSelections])).toEqual([
      [3, 3], [7, 2], [10, 2], [15, 2],
    ])
    const superior = maneuverCheckpoints[0]!
    expect(getCheckpointSelectionBounds(draft, superior).max).toBe(3)
    expect(getCheckpointCandidates(draft, superior)).toContain('maneuver-2024-trip-attack')
  })

  it('灵能武士灵能骰池按等级变化', () => {
    const psi = fighterSubclassFeatures2024.find((feature) => feature.id === 'fighter-2024-psi-warrior-psionic-power')?.dicePool
    if (!psi) throw new Error('缺少灵能骰池')
    expect([3, 5, 9, 11, 13, 17].map((level) => getDicePoolCount(psi, level))).toEqual([4, 6, 8, 8, 10, 12])
    expect([3, 5, 9, 11, 13, 17].map((level) => getDicePoolDie(psi, level))).toEqual(['d6', 'd8', 'd8', 'd10', 'd10', 'd12'])
    expect(psi.recovery).toBe('short-rest')
  })

  it('法师 4 个子职全部接入，特性等级与额外入书学派正确', () => {
    expect(rulesRepository2024.subclasses.filter((subclass) => subclass.classId === 'class-2024-wizard').map((subclass) => subclass.id)).toEqual([...WIZARD_SUBCLASS_IDS])
    expect(wizardSubclasses2024.map((subclass) => subclass.id)).toEqual([...WIZARD_SUBCLASS_IDS])
    const expected: Readonly<Record<(typeof WIZARD_SUBCLASS_IDS)[number], readonly number[]>> = {
      'subclass-2024-wizard-evoker': [3, 3, 6, 10, 14],
      'subclass-2024-wizard-illusionist': [3, 3, 6, 10, 14],
      'subclass-2024-wizard-abjurer': [3, 3, 6, 10, 14],
      'subclass-2024-wizard-diviner': [3, 3, 6, 10, 14],
    }
    const schools: Readonly<Record<string, string>> = {
      'subclass-2024-wizard-evoker': '塑能',
      'subclass-2024-wizard-illusionist': '幻术',
      'subclass-2024-wizard-abjurer': '防护',
      'subclass-2024-wizard-diviner': '预言',
    }
    for (const id of WIZARD_SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass?.status).toBe('implemented')
      expect(subclass?.features.map((feature) => feature.level)).toEqual(expected[id])
      expect(subclass?.spellbookExtraSpells?.schools).toEqual([schools[id]])
    }
    expect(wizardSubclassFeatures2024.length).toBeGreaterThanOrEqual(20)
  })

  it('防护师奥术守御与预言师预兆资源按等级与属性登记', () => {
    const ward = wizardSubclassFeatures2024.find((feature) => feature.id === 'wizard-2024-abjurer-arcane-ward')?.resource
    if (!ward) throw new Error('缺少奥术守御资源')
    expect(getResourceMax(ward, 3, 3)).toBe(9)
    expect(getResourceMax(ward, 10, 4)).toBe(24)
    expect(ward.abilityBonus).toBe('int')
    expect(ward.recovery).toBe('long-rest')

    const portent = wizardSubclassFeatures2024.find((feature) => feature.id === 'wizard-2024-diviner-portent')?.resource
    if (!portent) throw new Error('缺少预兆资源')
    expect([3, 14].map((level) => getResourceMax(portent, level))).toEqual([2, 2])
    expect(portent.recovery).toBe('long-rest')
  })

  it('子职检查点进入时间线且未接入子职不出现', () => {
    const ekTimeline = buildTimeline('class-2024-fighter', 3, { ruleset: '5e-2024', subclassId: 'subclass-2024-fighter-eldritch-knight' })
    expect(ekTimeline.find((checkpoint) => checkpoint.kind === 'subclass')?.optionIds).toEqual([...FIGHTER_SUBCLASS_IDS])
    expect(ekTimeline.some((checkpoint) => checkpoint.id.startsWith('subclass-feature-fighter-2024-eldritch-knight'))).toBe(false)

    const wizardTimeline = buildTimeline('class-2024-wizard', 3, { ruleset: '5e-2024', subclassId: 'subclass-2024-wizard-abjurer' })
    expect(wizardTimeline.find((checkpoint) => checkpoint.kind === 'subclass')?.optionIds).toEqual([...WIZARD_SUBCLASS_IDS])
  })
})
