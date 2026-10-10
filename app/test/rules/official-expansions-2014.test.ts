import { describe, expect, it } from 'vitest'
import { deriveCharacter, collectRaceSkillIds, getRaceAbilityBonuses } from '@/rules/derive'
import { getEffectiveSpeciesFeatures, getEffectiveSpeciesSize, getSpeciesProficiencyBlockers, getSpeciesToolProficiencies } from '@/rules/origins'
import { getAlwaysPreparedSpellIds, getSpeciesSpellcastingProfiles } from '@/rules/spellcasting'
import { canCastSpellWithSlots, getSpeciesCastingMethods, getSpellFreeCastings } from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import { listActiveFeats } from '@/rules/feats'
import { rulesRepository } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { listSessionResources } from '@/rules/session-resources'
import { draft2024, selection } from '../fixtures/draft-2024'

describe('官方扩展2014：S03', () => {
  it('佛丹人体型随等级派生，降级恢复小型且不改原始选择', () => {
    const draft = draft2024({ ruleset: '5e-2014', raceId: 'race-2014-verdan', classId: 'class-2014-fighter', enabledSourceIds: ['ai-2019-index'], speciesSizeChoice: 'small' })
    for (let level = 1; level <= 20; level++) expect(getEffectiveSpeciesSize({ ...draft, targetLevel: level }, rulesRepository)).toBe(level < 5 ? 'small' : 'medium')
    expect(getEffectiveSpeciesSize({ ...draft, targetLevel: 4 }, rulesRepository)).toBe('small')
    expect(getRaceAbilityBonuses(draft)).toEqual({ con: 1, cha: 2 })
  })
  it('枭人感官120尺、可选体型及固定技能来源隔离', () => {
    const draft = draft2024({ ruleset: '5e-2014', raceId: 'race-2014-owlin', enabledSourceIds: ['scc-2021-index'], speciesSizeChoice: 'small' })
    expect(rulesRepository.getRace(draft.raceId ?? '')?.darkvision).toBe(120)
    expect(getEffectiveSpeciesSize(draft, rulesRepository)).toBe('small')
    expect(collectRaceSkillIds(draft)).toContain('skill-stealth')
    expect(collectRaceSkillIds({ ...draft, enabledSourceIds: [] })).toEqual([])
    expect(rulesRepository2024.getRace(draft.raceId ?? '')).toBeUndefined()
  })
  it('坎德人嘲讽是独立非施法选择，缺选不授予资源', () => {
    const draft = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', raceId: 'race-2014-kender', enabledSourceIds: ['dsotdq-2022-index'], selections: [], raceSkillChoices: ['skill-insight'] })
    expect(rulesRepository.getRace(draft.raceId ?? '')?.spellcastingAbilityChoices).toBeUndefined()
    expect(getSpeciesProficiencyBlockers(draft, rulesRepository)).toEqual([])
    expect(getEffectiveSpeciesFeatures(draft, rulesRepository).some((f) => f.id.endsWith('-taunt'))).toBe(false)
    const selected = { ...draft, selections: [selection('race-2014-kender-taunt-ability', ['spell-ability-wis'])] }
    expect(listSessionResources(selected).filter((r) => r.id.includes('kender'))).toHaveLength(2)
  })
  it('洛卡鱼人自然护甲及技能、无盾情况下人工修正只加一次', () => {
    const draft = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', raceId: 'race-2014-locathah', enabledSourceIds: ['locathah-2019-index'], baseAbilities: { str: 10, dex: 15, con: 10, int: 10, wis: 10, cha: 10 }, inventory: [] })
    expect(deriveCharacter(draft).armorClass.value).toBe(15)
    expect(collectRaceSkillIds(draft)).toEqual(['skill-athletics', 'skill-perception'])
    expect(deriveCharacter({ ...draft, enabledSourceIds: [] }).armorClass.value).toBe(12)
  })
})

describe('官方扩展2014：S05—S07创建', () => {
  const base = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', enabledSourceIds: ['mot-2020-index', 'eepc-2015-index', 'mtof-2018-index', 'tcoe-2020-index', 'vrgtr-2021-index', 'xgte-2017-index'], inventory: [], selections: [], baseAbilities: { str: 10, dex: 10, con: 14, int: 10, wis: 10, cha: 10 } })
  it('相同重印旧ID及特性在任一来源开启时生效，不重复累计', () => {
    for (const raceId of ['race-2014-centaur', 'race-2014-minotaur', 'race-2014-triton']) {
      expect(rulesRepository.races.filter((r) => r.id === raceId)).toHaveLength(1)
      expect(getEffectiveSpeciesFeatures({ ...base, raceId }, rulesRepository).length).toBeGreaterThan(0)
      expect(getEffectiveSpeciesFeatures({ ...base, raceId, enabledSourceIds: [] }, rulesRepository)).toEqual([])
    }
    const triton = { ...base, raceId: 'race-2014-triton', targetLevel: 5 }
    expect(getSpellFreeCastings(triton).filter((s) => s.sourceId === triton.raceId)).toHaveLength(3)
    expect(canCastSpellWithSlots(triton, 'spell-2014-fog-cloud')).toBe(false)
    expect(getRaceAbilityBonuses(triton)).toEqual({ str: 1, con: 1, cha: 1 })
  })
  it('旧元素裔父子属性一次、固定体质施法、等级及免费环级与MotM隔离', () => {
    for (const [slug, ability] of [['air', 'dex'], ['earth', 'str'], ['fire', 'int'], ['water', 'wis']] as const) {
      for (let targetLevel = 1; targetLevel <= 20; targetLevel++) {
        const draft = { ...base, targetLevel, raceId: 'race-2014-genasi', subraceId: `race-2014-genasi-${slug}` }
        expect(getRaceAbilityBonuses(draft)).toEqual({ con: 2, [ability]: 1 })
        expect(getSpeciesSpellcastingProfiles(draft)[0]?.ability).toBe('con')
        const free = getSpellFreeCastings(draft)
        expect(free).toHaveLength(slug === 'air' || slug === 'earth' || targetLevel >= 3 ? 1 : 0)
        for (const grant of free) expect(canCastSpellWithSlots(draft, grant.spellId)).toBe(false)
      }
    }
    const water = { ...base, targetLevel: 3, raceId: 'race-2014-genasi', subraceId: 'race-2014-genasi-water' }
    expect(getSpeciesCastingMethods(water, 'spell-2014-create-or-destroy-water')[0]).toMatchObject({ ability: 'con', castingLevel: 2 })
    expect(getSpellFreeCastings(water)[0]?.castingLevel).toBe(2)
    expect(listSessionResources(water).find((resource) => resource.spellId === 'spell-2014-create-or-destroy-water')?.castingLevel).toBe(2)
    const shadar = { ...base, targetLevel: 20, raceId: 'race-2014-elf', subraceId: 'race-2014-elf-shadar-kai' }
    expect(getRaceAbilityBonuses(shadar)).toEqual({ dex: 2, con: 1 })
    expect(listSessionResources(shadar).find((r) => r.id.endsWith('-blessing'))?.max).toBe(1)
  })
  it('定制血统不因外貌获得精灵资格，技能与视觉互斥，失效选择保留', () => {
    const draft = { ...base, raceId: 'race-2014-custom-lineage', raceAbilityChoices: ['con' as const], selections: [selection('race-2014-custom-lineage-trait', ['species-2014-custom-skill']), selection('race-2014-custom-lineage-skill', ['skill-perception']), selection('race-2014-custom-lineage-origin-feat', ['feat-elven-accuracy'])] }
    expect(collectRaceSkillIds(draft)).toEqual(['skill-perception'])
    expect(listActiveFeats(draft, rulesRepository)).toEqual([])
    const vision = { ...draft, selections: [selection('race-2014-custom-lineage-trait', ['species-2014-custom-darkvision']), ...draft.selections.slice(1)] }
    expect(collectRaceSkillIds(vision)).toEqual([])
    expect(getEffectiveSpeciesFeatures(vision, rulesRepository).some((f) => f.id.endsWith('-darkvision'))).toBe(true)
    expect(vision.selections).toHaveLength(3)
    const timeline = buildTimeline(base.classId ?? '', 20, { ...draft })
    expect(timeline.find((c) => c.id === 'race-2014-custom-lineage-origin-feat')?.level).toBe(1)
  })
  it('三血统创建两技能，巫咒之子1级两法术独立免费次数，复生者无视觉', () => {
    for (const slug of ['dhampir', 'hexblood', 'reborn']) {
      const draft = { ...base, raceId: `race-2014-${slug}`, raceSkillChoices: ['skill-stealth', 'skill-perception'], selections: [selection('race-2014-hexblood-spellcasting-ability', ['spell-ability-cha'])] }
      expect(collectRaceSkillIds(draft)).toHaveLength(2)
      if (slug === 'hexblood') {
        expect(getSpellFreeCastings(draft)).toHaveLength(2)
        expect(canCastSpellWithSlots(draft, 'spell-2014-hex')).toBe(true)
      }
      expect(rulesRepository2024.getRace(draft.raceId)).toBeUndefined()
    }
    expect(rulesRepository.getRace('race-2014-reborn')?.darkvision).toBeUndefined()
  })
  it('非施法能力DC及啮咬使用最终属性和熟练，不套职业施法修正', () => {
    const draft = { ...base, targetLevel: 5, raceId: 'race-2014-kender', enabledSourceIds: ['dsotdq-2022-index'], selections: [selection('race-2014-kender-taunt-ability', ['spell-ability-wis'])] }
    expect(getEffectiveSpeciesFeatures(draft, rulesRepository, undefined, deriveCharacter(draft)).find((f) => f.id.endsWith('-taunt'))?.summary).toContain('当前DC 11')
    const bite = { ...base, raceId: 'race-2014-dhampir' }
    expect(getEffectiveSpeciesFeatures(bite, rulesRepository, undefined, deriveCharacter(bite)).find((f) => f.id.endsWith('-bite'))?.summary).toContain('当前命中+4；伤害1d4+2')
  })
})

describe('官方扩展2014：S04与共用契约', () => {
  const base = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', enabledSourceIds: ['aag-2022-index'], inventory: [], selections: [], baseAbilities: { str: 10, dex: 16, con: 10, int: 10, wis: 10, cha: 10 } })
  it('两项具体工具完整、唯一、可回读；缺选/重复/抽象工具不生效', () => {
    const draft = { ...base, raceId: 'race-2014-autognome', raceToolChoices: ['lute', 'smiths-tools'] }
    expect(getSpeciesToolProficiencies(draft, rulesRepository).map((item) => item.id)).toEqual(['lute', 'smiths-tools'])
    expect(getEffectiveSpeciesFeatures(draft, rulesRepository).find((item) => item.id.endsWith('-selected-tool'))?.description).toContain('铁匠')
    for (const tools of [[], ['lute'], ['lute', 'lute'], ['musical-instrument', 'smiths-tools']]) {
      expect(getSpeciesToolProficiencies({ ...draft, raceToolChoices: tools }, rulesRepository)).toEqual([])
      expect(getSpeciesProficiencyBlockers({ ...draft, raceToolChoices: tools }, rulesRepository).length).toBeGreaterThan(0)
    }
    expect(getSpeciesToolProficiencies({ ...draft, enabledSourceIds: [] }, rulesRepository)).toEqual([])
  })
  it('自动侏儒和螳螂人仅未穿甲可用自然护甲；盾牌由手动状态决定', () => {
    for (const raceId of ['race-2014-autognome', 'race-2014-thri-kreen']) {
      const draft = { ...base, raceId }
      expect(deriveCharacter(draft).armorClass.value).toBe(16)
      const armor = { id: 'armor', itemId: 'leather-armor', quantity: 1, equippedQuantity: 1 }
      const shield = { id: 'shield', itemId: 'shield', quantity: 1, equippedQuantity: 1 }
      expect(deriveCharacter({ ...draft, inventory: [armor] }).armorClass.value).toBe(14)
      expect(deriveCharacter({ ...draft, inventory: [shield] }).armorClass.value).toBe(18)
      expect(deriveCharacter({ ...draft, inventory: [armor, shield] }).armorClass.value).toBe(16)
    }
  })
  it('星界戏法必须同时有合法戏法和属性，不授予非施法职业法术位', () => {
    const draft = { ...base, raceId: 'race-2014-astral-elf', selections: [selection('race-2014-astral-elf-cantrip', ['spell-2014-light']), selection('race-2014-astral-elf-spellcasting-ability', ['spell-ability-wis'])] }
    expect(getAlwaysPreparedSpellIds(draft)).toContain('spell-2014-light')
    expect(getSpeciesSpellcastingProfiles(draft)[0]?.ability).toBe('wis')
    expect(getAlwaysPreparedSpellIds({ ...draft, selections: draft.selections.slice(0, 1) })).not.toContain('spell-2014-light')
    expect(getAlwaysPreparedSpellIds({ ...draft, selections: [selection('race-2014-astral-elf-cantrip', ['spell-2014-fire-bolt']), ...draft.selections.slice(1)] })).not.toContain('spell-2014-fire-bolt')
  })
  it('资源1—20级按熟练变化，临时效果和勘误只展示', () => {
    for (let targetLevel = 1; targetLevel <= 20; targetLevel++) {
      for (const raceId of ['race-2014-giff', 'race-2014-hadozee', 'race-2014-autognome']) {
        expect(listSessionResources({ ...base, raceId, targetLevel }).find((r) => r.id.includes(raceId))?.max).toBe(2 + Math.floor((targetLevel - 1) / 4))
      }
    }
    const description = getEffectiveSpeciesFeatures({ ...base, raceId: 'race-2014-thri-kreen' }, rulesRepository).find((f) => f.id.endsWith('-telepathy'))?.description
    expect(description).toContain('无需可见')
    expect(rulesRepository2024.getRace('race-2014-hadozee')).toBeUndefined()
  })
})
