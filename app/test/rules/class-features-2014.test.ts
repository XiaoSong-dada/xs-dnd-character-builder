import { describe, expect, it } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import { classFeatures2014, getClassFeatures2014 } from '@/rules/data/class-features-2014'

const CLASS_IDS = [
  'class-2014-barbarian',
  'class-2014-bard',
  'class-2014-cleric',
  'class-2014-druid',
  'class-2014-fighter',
  'class-2014-monk',
  'class-2014-paladin',
  'class-2014-ranger',
  'class-2014-rogue',
  'class-2014-sorcerer',
  'class-2014-warlock',
  'class-2014-wizard',
  'class-2014-artificer',
] as const

describe('2014 class features catalog', () => {
  it('registers features for every base class with unique ids and valid fields', () => {
    expect(classFeatures2014.length).toBeGreaterThan(0)
    expect(new Set(classFeatures2014.map((feature) => feature.id)).size).toBe(classFeatures2014.length)
    const classIds = new Set(rulesRepository.classes.map((classRule) => classRule.id))
    for (const feature of classFeatures2014) {
      expect(classIds.has(feature.classId)).toBe(true)
      expect(feature.name.length).toBeGreaterThan(0)
      expect(feature.englishName.length).toBeGreaterThan(0)
      expect(feature.summary.length).toBeGreaterThan(0)
      expect(feature.description.length).toBeGreaterThan(0)
      expect(feature.level).toBeGreaterThan(0)
      expect(feature.level).toBeLessThanOrEqual(20)
      expect(['implemented', 'selectable', 'index-only']).toContain(feature.status)
      expect(feature.sourceIds.length).toBeGreaterThan(0)
    }
  })

  it('registers a detailed description longer than the summary for representative features', () => {
    const secondWind = classFeatures2014.find((feature) => feature.id === 'fighter-2014-class-second-wind')
    expect(secondWind?.description.length).toBeGreaterThan(secondWind?.summary.length ?? 0)
    expect(secondWind?.description).toContain('附赠动作')
    const rage = classFeatures2014.find((feature) => feature.id === 'barbarian-2014-class-rage')
    expect(rage?.description.length).toBeGreaterThan(rage?.summary.length ?? 0)
    expect(rage?.description).toContain('长休后全部恢复')
  })

  it('keeps feature id prefixes consistent with the owning class', () => {
    const slugByClassId: Record<string, string> = {
      'class-2014-barbarian': 'barbarian',
      'class-2014-bard': 'bard',
      'class-2014-cleric': 'cleric',
      'class-2014-druid': 'druid',
      'class-2014-fighter': 'fighter',
      'class-2014-monk': 'monk',
      'class-2014-paladin': 'paladin',
      'class-2014-ranger': 'ranger',
      'class-2014-rogue': 'rogue',
      'class-2014-sorcerer': 'sorcerer',
      'class-2014-warlock': 'warlock',
      'class-2014-wizard': 'wizard',
      'class-2014-artificer': 'artificer',
    }
    for (const feature of classFeatures2014) {
      expect(feature.id.startsWith(`${slugByClassId[feature.classId]}-2014-class-`)).toBe(true)
    }
  })

  it('looks up features per class via getClassFeatures2014 and repository mounting', () => {
    for (const classId of CLASS_IDS) {
      const features = getClassFeatures2014(classId)
      expect(features.length).toBeGreaterThan(0)
      const classRule = rulesRepository.getClass(classId)
      expect(classRule?.features).toEqual(features)
    }
    expect(getClassFeatures2014('class-2014-unknown')).toEqual([])
  })

  it('registers representative features with expected levels', () => {
    const fighter = getClassFeatures2014('class-2014-fighter')
    expect(fighter.some((feature) => feature.name === '回气' && feature.level === 1)).toBe(true)
    expect(fighter.some((feature) => feature.name === '动作如潮' && feature.level === 2)).toBe(true)
    expect(fighter.some((feature) => feature.name === '额外攻击' && feature.level === 5)).toBe(true)

    const barbarian = getClassFeatures2014('class-2014-barbarian')
    expect(barbarian.some((feature) => feature.name === '狂暴' && feature.level === 1)).toBe(true)
    expect(barbarian.some((feature) => feature.name === '鲁莽攻击' && feature.level === 2)).toBe(true)

    const wizard = getClassFeatures2014('class-2014-wizard')
    expect(wizard.some((feature) => feature.name === '法术书' && feature.level === 1)).toBe(true)
  })

  it('registers each upgraded tier of a feature as its own entry with increasing level', () => {
    const fighterExtraAttacks = getClassFeatures2014('class-2014-fighter')
      .filter((feature) => feature.englishName === 'Extra Attack')
      .map((feature) => feature.level)
      .sort((a, b) => a - b)
    expect(fighterExtraAttacks).toEqual([5, 11, 20])

    const bardSongOfRest = getClassFeatures2014('class-2014-bard')
      .filter((feature) => feature.englishName === 'Song of Rest')
      .map((feature) => feature.level)
      .sort((a, b) => a - b)
    expect(bardSongOfRest).toEqual([2, 9, 13, 17])
  })

  it('marks every feature that requires a player choice', () => {
    const choiceNames = new Set(
      classFeatures2014.filter((feature) => feature.requiresChoice).map((feature) => feature.id),
    )
    // 子职选择（原初道途/学院/领域/结社/范型/传统/誓言/起源/宗主/奥术传承）
    expect(choiceNames.has('barbarian-2014-class-primal-path')).toBe(true)
    expect(choiceNames.has('fighter-2014-class-martial-archetype')).toBe(true)
    expect(choiceNames.has('wizard-2014-class-arcane-tradition')).toBe(true)
    // 战斗风格、专精、宿敌/地形、超魔法、魔能祈唤/魔契恩泽、法术精通/招牌法术
    expect(choiceNames.has('fighter-2014-class-fighting-style')).toBe(true)
    expect(choiceNames.has('rogue-2014-class-expertise')).toBe(true)
    expect(choiceNames.has('ranger-2014-class-favored-enemy')).toBe(true)
    expect(choiceNames.has('sorcerer-2014-class-metamagic')).toBe(true)
    expect(choiceNames.has('warlock-2014-class-eldritch-invocations')).toBe(true)
    expect(choiceNames.has('wizard-2014-class-spell-mastery')).toBe(true)
    // 自动能力不标记
    expect(choiceNames.has('fighter-2014-class-action-surge')).toBe(false)
    expect(choiceNames.has('barbarian-2014-class-rage')).toBe(false)
    expect(choiceNames.has('rogue-2014-class-sneak-attack')).toBe(false)
  })

  it('marks all choice-type features with requiresChoice and vice versa', () => {
    for (const feature of classFeatures2014) {
      if (feature.kind === 'choice') {
        expect(feature.requiresChoice).toBe(true)
      }
    }
  })
})
