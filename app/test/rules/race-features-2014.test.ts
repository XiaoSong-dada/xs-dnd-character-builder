import { describe, expect, it } from 'vitest'

import { races2014, backgrounds2014 } from '@/rules/data/origins-2014'
import { getRaceFeatures2014, raceFeatures2014 } from '@/rules/data/race-features-2014'
import { getBackgroundFeatures2014, backgroundFeatures2014 } from '@/rules/data/background-features-2014'

describe('2014 种族特性注册表', () => {
  const raceIds = new Set(races2014.map((race) => race.id))

  it('覆盖 docs/species 特性规模（240 条）且 ID 唯一', () => {
    expect(raceFeatures2014.length).toBe(240)
    const ids = raceFeatures2014.map((feature) => feature.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每条特性的 raceId 指向已登记种族，ID 以 race-2014 前缀命名', () => {
    for (const feature of raceFeatures2014) {
      expect(raceIds.has(feature.raceId), feature.id).toBe(true)
      expect(feature.id.startsWith('race-2014-')).toBe(true)
      expect(feature.englishName.length).toBeGreaterThan(0)
      expect(feature.level).toBeGreaterThanOrEqual(1)
      expect(['passive', 'choice', 'resource', 'action', 'bonus-action', 'reaction']).toContain(feature.kind)
    }
  })

  it('getRaceFeatures2014 按种族返回特性并按等级过滤语义正确', () => {
    const dwarfFeatures = getRaceFeatures2014('race-2014-dwarf')
    expect(dwarfFeatures.some((feature) => feature.id === 'race-2014-dwarf-darkvision')).toBe(true)
    expect(dwarfFeatures.some((feature) => feature.id === 'race-2014-dwarf-ability-score-increase')).toBe(true)
    // 子种族特性归属子种族（如 丘陵矮人），不并入父种族
    expect(dwarfFeatures.some((feature) => feature.id === 'race-2014-dwarf-hill-ability-score-increase')).toBe(false)
    expect(getRaceFeatures2014('race-2014-elf-drow').some((feature) => feature.id === 'race-2014-elf-drow-ability-score-increase')).toBe(true)
    // 全部已拆分特性的父种族都至少有属性提升条目；吉斯/费兹本血统/提夫林传承等
    // 特性登记在子种族或分支文件的除外（docs 未拆分）。
    const noFeatureParents = new Set([
      'race-2014-gith',
      'race-2014-dragonborn-fizban-chromatic', 'race-2014-dragonborn-fizban-gem', 'race-2014-dragonborn-fizban-metallic',
      'race-2014-tiefling-legacy-asmodeus', 'race-2014-tiefling-legacy-baalzebul', 'race-2014-tiefling-legacy-dispater',
      'race-2014-tiefling-legacy-fierna', 'race-2014-tiefling-legacy-glasya', 'race-2014-tiefling-legacy-levistus',
      'race-2014-tiefling-legacy-mammon', 'race-2014-tiefling-legacy-mephistopheles', 'race-2014-tiefling-legacy-zariel',
    ])
    for (const race of races2014.filter((item) => !item.parentRaceId && !item.subraceIds.includes(item.id))) {
      if (race.status === 'dm-only') continue
      if (noFeatureParents.has(race.id)) continue
      expect(getRaceFeatures2014(race.id).length, race.id).toBeGreaterThan(0)
    }
  })

  it('3/5 级特性存在且归属正确（如 天裔 光耀之魂）', () => {
    const radiant = raceFeatures2014.find((feature) => feature.id === 'race-2014-aasimar-protector-radiant-soul')
    expect(radiant).toBeDefined()
    expect(radiant?.level).toBe(3)
    const leveled = raceFeatures2014.filter((feature) => feature.level > 1)
    expect(leveled.length).toBe(8)
  })
})

describe('2014 背景特性注册表', () => {
  const bgIds = new Set(backgrounds2014.map((background) => background.id))

  it('覆盖 35 个已登记背景（44 条特性）且 ID 唯一', () => {
    expect(backgroundFeatures2014.length).toBe(44)
    const ids = backgroundFeatures2014.map((feature) => feature.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每条特性的 backgroundId 指向已登记背景（含父背景；变体不重复登记）', () => {
    const registeredBgIds = new Set(backgroundFeatures2014.map((feature) => feature.backgroundId))
    for (const bgId of registeredBgIds) {
      expect(bgIds.has(bgId), bgId).toBe(true)
    }
    // 变体背景（间谍/角斗士等）沿用父背景特性
    const spy = backgrounds2014.find((background) => background.id === 'background-2014-criminal-spy')
    expect(spy?.parentBackgroundId).toBe('background-2014-criminal')
    expect(backgroundFeatures2014.some((feature) => feature.backgroundId === 'background-2014-criminal-spy')).toBe(false)
  })

  it('getBackgroundFeatures2014 按背景返回特性（PHB 背景 1 条、公会背景多条）', () => {
    expect(getBackgroundFeatures2014('background-2014-acolyte').length).toBe(1)
    expect(getBackgroundFeatures2014('background-2014-acolyte')[0]?.englishName).toBe('Shelter of the Faithful')
    expect(getBackgroundFeatures2014('background-2014-azorius-functionary').length).toBe(2)
    for (const feature of backgroundFeatures2014) {
      expect(feature.level).toBe(1)
      expect(feature.englishName.length).toBeGreaterThan(0)
    }
  })
})
