import { describe, expect, it } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { getSpeciesCastingMethods, getSpeciesSpellcastingProfiles, getSpellFreeCastings, canCastSpellWithSlots } from '@/rules/spellcasting'
import { listSessionResources } from '@/rules/session-resources'
import { rulesRepository } from '@/rules/repository'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { draft2024, selection } from '../fixtures/draft-2024'

const slugs = ['yuan-ti', 'githzerai', 'githyanki', 'deep-gnome', 'duergar', 'firbolg', 'aarakocra', 'triton']
const draftFor = (slug: string, targetLevel = 5, ability = 'wis') => {
  const raceId = `race-2014-motm-${slug}`
  return draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', raceId, targetLevel, enabledSourceIds: ['motm-2022-index'], raceAbilityChoices: ['str', 'con'], selections: [selection(`${raceId}-spellcasting-ability`, [`spell-ability-${ability}`])] })
}
describe('MotM B3逐法术施放协议', () => {
  it.each(slugs)('%s 1—20级、三施法属性、逐法术授予和独立免费次数', (slug) => {
    for (let level = 1; level <= 20; level++) for (const ability of ['int', 'wis', 'cha'] as const) {
      const draft = draftFor(slug, level, ability)
      const race = rulesRepository.getRace(draft.raceId ?? '')
      const expected = (race?.spellGrants ?? []).filter((grant) => grant.minimumLevel <= level)
      const profile = getSpeciesSpellcastingProfiles(draft)[0]
      expect(profile?.spellIds ?? []).toEqual(expected.map((grant) => grant.spellId))
      if (profile) {
        const derived = deriveCharacter(draft)
        expect(profile.ability).toBe(ability)
        expect(profile.saveDc).toBe(8 + derived.proficiencyBonus.value + derived.modifiers[ability])
      }
      const free = getSpellFreeCastings(draft).filter((grant) => grant.sourceId === draft.raceId)
      expect(free).toHaveLength(expected.filter((grant) => grant.freeCastings === 1).length)
      expect(free.every((grant) => grant.count === 1 && grant.recovery === 'long-rest')).toBe(true)
    }
  })
  it('蛇人化兽为友为受限无限次路径，不制造资源或法术位许可', () => {
    const draft = draftFor('yuan-ti')
    const spellId = 'spell-2014-animal-friendship'
    expect(getSpeciesCastingMethods(draft, spellId)[0]).toMatchObject({ atWill: true, canCastWithSpellSlots: false, targetRestriction: 'snakes-only' })
    expect(listSessionResources(draft).some((resource) => resource.spellId === spellId)).toBe(false)
    expect(canCastSpellWithSlots(draft, spellId)).toBe(false)
    const otherSource = { ...draft, classId: 'class-2014-druid', spellSelections: { ...draft.spellSelections, preparedSpellIds: [spellId] } }
    expect(canCastSpellWithSlots(otherSource, spellId)).toBe(true)
    expect(buildCharacterExportModel(draft, deriveCharacter(draft)).features.some((feature) => feature.summary.includes('仅限蛇'))).toBe(true)
  })
  it('吉斯全部成分豁免，灰矮人仅自身，地底侏儒及鸟羽人逐法术免材料', () => {
    for (const slug of ['githzerai', 'githyanki']) for (const spellId of getSpeciesSpellcastingProfiles(draftFor(slug))[0]?.spellIds ?? []) expect(getSpeciesCastingMethods(draftFor(slug), spellId)[0]?.waivedComponents).toEqual(['verbal', 'somatic', 'material'])
    for (const spellId of ['spell-2014-enlarge-reduce', 'spell-2014-invisibility']) expect(getSpeciesCastingMethods(draftFor('duergar'), spellId)[0]).toMatchObject({ targetRestriction: 'self-only', waivesMaterialComponents: true })
    expect(getSpeciesSpellcastingProfiles(draftFor('deep-gnome'))[0]?.materialFreeSpellIds).toEqual(['spell-2014-nondetection'])
    expect(getSpeciesSpellcastingProfiles(draftFor('aarakocra'))[0]?.materialFreeSpellIds).toEqual(['spell-2014-gust-of-wind'])
    expect(getSpeciesSpellcastingProfiles(draftFor('triton'))[0]?.materialFreeSpellIds).toEqual([])
  })
  it('缺选、非法属性、重复活动选择停用所有种族法术及免费资源，原值保留', () => {
    for (const slug of slugs) {
      const draft = draftFor(slug)
      for (const selections of [[], [selection(`${draft.raceId}-spellcasting-ability`, ['spell-ability-str'])], [...draft.selections, ...draft.selections]]) {
        const invalid = { ...draft, selections }
        expect(getSpeciesSpellcastingProfiles(invalid)).toEqual([])
        expect(getSpellFreeCastings(invalid)).toEqual([])
        for (const grant of rulesRepository.getRace(draft.raceId ?? '')?.spellGrants ?? []) expect(getSpeciesCastingMethods(invalid, grant.spellId)).toEqual([])
        expect(invalid.selections).toEqual(selections)
      }
    }
  })
  it.each(slugs)('%s 关闭来源后属性说明、次数及施放路径停用，选择保留', (slug) => {
    const original = draftFor(slug)
    const disabled = { ...original, enabledSourceIds: [] }
    expect(getSpeciesSpellcastingProfiles(disabled)).toEqual([])
    expect(getSpellFreeCastings(disabled)).toEqual([])
    expect(getSpeciesCastingMethods(disabled, 'spell-2014-mage-hand')).toEqual([])
    expect(disabled.selections).toEqual(original.selections)
  })
})
