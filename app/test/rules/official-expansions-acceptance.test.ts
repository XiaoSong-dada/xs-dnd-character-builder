import { describe, expect, it } from 'vitest'
import { officialExpansionRaces2014 } from '@/rules/data/races-official-expansions-2014'
import { deriveCharacter, getRaceAbilityBonuses, collectRaceSkillIds } from '@/rules/derive'
import { getEffectiveSpeciesFeatures, getSpeciesProficiencyBlockers } from '@/rules/origins'
import { rulesRepository } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { applyRestRecovery, listSessionResources } from '@/rules/session-resources'
import { createInitialSessionState } from '@/rules/session-state'
import { getSpeciesCastingMethods, getAlwaysPreparedSpellIds } from '@/rules/spellcasting'
import { getFeatEligibilityContext } from '@/rules/feat-eligibility'
import { getFeatEligibility } from '@/rules/feats'
import { officialDraft, officialIds } from '../fixtures/official-expansions-2014'
import { selection } from '../fixtures/draft-2024'

const expectedSlugs = ['owlin', 'verdan', 'kender', 'locathah', 'astral-elf', 'autognome', 'giff', 'hadozee', 'plasmoid', 'thri-kreen', 'leonin', 'satyr', 'genasi', 'genasi-air', 'genasi-earth', 'genasi-fire', 'genasi-water', 'elf-shadar-kai', 'custom-lineage', 'dhampir', 'hexblood', 'reborn']
const equipped = (itemId: string) => ({ id: `entry-${itemId}`, itemId, quantity: 1, equippedQuantity: 1, sourceKind: 'adventure' as const, sourceId: 'acceptance' })
describe('O01：独立源书清单与逐项联验', () => {
  it('登记集合与独立S03—S07清单一致，已有三个重印ID不复制', () => {
    expect(officialExpansionRaces2014.map((race) => race.id).sort()).toEqual(expectedSlugs.map((slug) => `race-2014-${slug}`).sort())
    expect(new Set(rulesRepository.races.map((race) => race.id)).size).toBe(rulesRepository.races.length)
    for (const id of officialIds) expect(rulesRepository2024.getRace(id)).toBeUndefined()
  })
  it.each(officialIds)('%s：1—20级必选、来源关闭恢复、方案和资源恢复', (id) => {
    for (let level = 1; level <= 20; level++) {
      const draft = officialDraft(id, level)
      const race = rulesRepository.getRace(id)
      expect(getSpeciesProficiencyBlockers(draft, rulesRepository)).toEqual([])
      const features = getEffectiveSpeciesFeatures(draft, rulesRepository)
      expect(features.length).toBeGreaterThan(0)
      expect(features.every((f) => f.level <= level)).toBe(true)
      expect(deriveCharacter(draft).speed.value).toBe(race?.speed ?? 30)
      const disabled = { ...draft, enabledSourceIds: [] }
      expect(getEffectiveSpeciesFeatures(disabled, rulesRepository)).toEqual([])
      expect(listSessionResources(disabled)).toEqual([])
      // 影灵的核心精灵父项仍启用；其它新主项和元素裔父项没有收益。
      if (id !== 'race-2014-elf-shadar-kai') expect(getRaceAbilityBonuses(disabled)).toEqual({})
      expect(getEffectiveSpeciesFeatures({ ...disabled, enabledSourceIds: draft.enabledSourceIds }, rulesRepository)).toEqual(features)
      if (race?.flexibleBonusAlternatives) {
        expect(getRaceAbilityBonuses({ ...draft, raceAbilityBonusOptionId: 'three-one', raceAbilityChoices: ['str', 'dex', 'con'] })).toEqual({ str: 1, dex: 1, con: 1 })
        expect(getRaceAbilityBonuses({ ...draft, raceAbilityChoices: ['con', 'con'] })).toEqual({})
        expect(getRaceAbilityBonuses({ ...draft, raceAbilityChoices: [] })).toEqual({})
      }
      const resources = listSessionResources(draft)
      const spent = { ...createInitialSessionState(draft.id, 20), resourceUsage: Object.fromEntries(resources.map((r) => [r.id, r.max])) }
      const short = applyRestRecovery(spent, resources, 'short-rest')
      const long = applyRestRecovery(spent, resources, 'long-rest')
      for (const resource of resources) {
        expect(short.resourceUsage?.[resource.id]).toBe(resource.recovery === 'short-rest' ? 0 : resource.max)
        expect(long.resourceUsage?.[resource.id]).toBe(0)
      }
      expect(new Set(collectRaceSkillIds(draft)).size).toBe(collectRaceSkillIds(draft).length)
    }
  })
  it('星界精灵拥有精灵资格，定制血统无此资格', () => {
    const feat = rulesRepository.getFeat('feat-elven-accuracy')
    if (!feat) throw new Error('缺少精灵专长')
    const astral = officialDraft('race-2014-astral-elf')
    expect(getFeatEligibility(feat, getFeatEligibilityContext(astral, { checkpointLevel: 4 })).available).toBe(true)
    expect(getFeatEligibility(feat, getFeatEligibilityContext(officialDraft('race-2014-custom-lineage'), { checkpointId: 'race-2014-custom-lineage-origin-feat', checkpointLevel: 1 })).available).toBe(false)
  })
  it('定制血统专长子选择：合法属性与豁免、重复/伪造/换父项均停用', () => {
    const base = officialDraft('race-2014-custom-lineage')
    const parent = 'race-2014-custom-lineage-origin-feat'
    const child = `feat-child:${parent}:feat-resilient:resilient-ability`
    const valid = { ...base, selections: [selection(parent, ['feat-resilient']), selection(child, ['feat-bonus-wis-1'])] }
    expect(deriveCharacter(valid).abilities.wis).toBe(11)
    expect(deriveCharacter(valid).savingThrows.wis.value).toBe(3)
    for (const ids of [['feat-bonus-wis-2'], ['feat-bonus-wis-1', 'feat-bonus-wis-1'], []]) {
      const invalid = { ...valid, selections: [valid.selections[0] ?? selection(parent, []), selection(child, ids)] }
      expect(deriveCharacter(invalid).abilities.wis).toBe(10)
      expect(deriveCharacter(invalid).savingThrows.wis.value).toBe(0)
    }
    expect(deriveCharacter({ ...valid, selections: [selection(parent, ['feat-tough']), valid.selections[1] ?? selection(child, [])] }).abilities.wis).toBe(10)
  })
  it('三种自然护甲、无甲防御、魔法装备、盾牌及人工修正一次', () => {
    const shield = rulesRepository.getEquipment('shield-+1')
    const armor = rulesRepository.equipment.find((item) => item.category === 'armor' && item.id.includes('+1') && !item.addsDexterityToArmor)
    if (!shield || !armor) throw new Error('缺少魔法护甲')
    for (const id of ['race-2014-autognome', 'race-2014-thri-kreen', 'race-2014-locathah']) {
      const draft = { ...officialDraft(id), raceAbilityChoices: ['str' as const, 'con' as const], baseAbilities: { str: 10, dex: 18, con: 18, int: 10, wis: 18, cha: 10 } }
      const bonus = id === 'race-2014-locathah' ? 0 : 1
      expect(deriveCharacter(draft).armorClass.value).toBe(16 + bonus)
      const leather = { ...draft, inventory: [equipped('leather-armor')] }
      expect(deriveCharacter(leather).armorClass.value).toBe(id === 'race-2014-locathah' ? 16 : 15)
      const magical = { ...draft, inventory: [equipped(armor.id), equipped(shield.id)], manualEdits: { ...draft.manualEdits, derivedAdjustments: { armorClass: 2 } } }
      expect(deriveCharacter(magical).armorClass.value).toBe(Math.max(id === 'race-2014-locathah' ? 16 : 0, armor.armorBase ?? 10) + (armor.magicBonus ?? 0) + (shield.armorClassBonus ?? 0) + 2)
      const barbarian = { ...draft, classId: 'class-2014-barbarian' }
      expect(deriveCharacter(barbarian).armorClass.value).toBe(18)
      expect(deriveCharacter({ ...barbarian, inventory: [equipped('shield')] }).armorClass.value).toBe(20)
    }
  })
  it('巫咒法术独立属性、成分及法术位权限，不污染职业同名法术', () => {
    const draft = officialDraft('race-2014-hexblood')
    expect(getSpeciesCastingMethods(draft, 'spell-2014-hex')[0]).toMatchObject({ ability: 'wis', canCastWithSpellSlots: true })
    expect(getSpeciesCastingMethods(draft, 'spell-2014-hex')[0]?.waivesAllComponents).not.toBe(true)
    expect(getAlwaysPreparedSpellIds({ ...draft, selections: [] })).toEqual([])
    const warlock = { ...draft, classId: 'class-2014-warlock', spellSelections: { ...draft.spellSelections, knownSpellIds: ['spell-2014-hex'] }, selections: [selection('race-2014-hexblood-spellcasting-ability', ['spell-ability-wis'])] }
    expect(getAlwaysPreparedSpellIds(warlock).filter((id) => id === 'spell-2014-hex')).toHaveLength(1)
  })
})
