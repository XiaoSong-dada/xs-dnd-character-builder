import { beforeEach, describe, expect, it } from 'vitest'
import { deriveCharacter, getRaceAbilityBonuses } from '@/rules/derive'
import { getEffectiveSpeciesFeatures, getSpeciesProficiencyBlockers, getValidSpeciesChoice } from '@/rules/origins'
import { rulesRepository } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { listSessionResources } from '@/rules/session-resources'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import { DraftStorageService } from '@/services/draft-storage'
import { validateDraft } from '@/rules/validate'
import { motmDraft, motmSlugs } from '../fixtures/motm-2014'

describe('MotM 33项逐项联合回归', () => {
  beforeEach(() => localStorage.clear())
  it('源书清单与注册集合相同，所有主项和特性ID独立', () => {
    const expected = motmSlugs.map((slug) => `race-2014-motm-${slug}`)
    const races = rulesRepository.races.filter((race) => race.id.startsWith('race-2014-motm-'))
    expect(races.map((race) => race.id).sort()).toEqual([...expected].sort())
    expect(new Set(rulesRepository.races.map((race) => race.id)).size).toBe(rulesRepository.races.length)
    const features = races.flatMap((race) => rulesRepository.getRaceFeatures(race.id))
    expect(new Set(features.map((feature) => feature.id)).size).toBe(features.length)
    for (const race of races) {
      expect(race.parentRaceId).toBeUndefined()
      expect(race.ruleset).toBe('5e-2014')
      expect(race.sourceIds).toContain('motm-2022-index')
      expect(rulesRepository2024.getRace(race.id)).toBeUndefined()
    }
  })
  it.each(motmSlugs)('%s 的1—20级、属性、选择、资源及来源关闭/恢复', (slug) => {
    const race = rulesRepository.getRace(`race-2014-motm-${slug}`)
    for (let level = 1; level <= 20; level++) {
      const draft = motmDraft(slug, level)
      expect(getRaceAbilityBonuses(draft)).toEqual({ str: 2, dex: 1 })
      expect(getRaceAbilityBonuses({ ...draft, raceAbilityBonusOptionId: 'three-one', raceAbilityChoices: ['str', 'dex', 'con'] })).toEqual({ str: 1, dex: 1, con: 1 })
      expect(deriveCharacter(draft).speed.value).toBe(race?.speed ?? 30)
      expect(getSpeciesProficiencyBlockers(draft, rulesRepository)).toEqual([])
      for (const choice of race?.choices ?? []) {
        if (choice.level <= level && (!choice.parentCheckpointId || getValidSpeciesChoice(draft, rulesRepository, choice.parentCheckpointId)?.includes(choice.parentOptionId ?? ''))) expect(getValidSpeciesChoice(draft, rulesRepository, choice.id)).toBeDefined()
      }
      const features = getEffectiveSpeciesFeatures(draft, rulesRepository)
      expect(features.length).toBeGreaterThan(0)
      expect(features.every((feature) => feature.level <= level)).toBe(true)
      const resources = listSessionResources(draft)
      expect(new Set(resources.map((resource) => resource.id)).size).toBe(resources.length)
      const disabled = { ...draft, enabledSourceIds: [] }
      expect(getRaceAbilityBonuses(disabled)).toEqual({})
      expect(getEffectiveSpeciesFeatures(disabled, rulesRepository)).toEqual([])
      expect(listSessionResources(disabled)).toEqual([])
      expect(disabled.selections).toEqual(draft.selections)
      expect(getEffectiveSpeciesFeatures({ ...disabled, enabledSourceIds: draft.enabledSourceIds }, rulesRepository)).toEqual(features)
    }
  })
  it.each(motmSlugs)('%s 的JSON、ZIP及本地保存保留原始选择且重新派生一致', async (slug) => {
    const draft = motmDraft(slug)
    const json = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(draft))
    const packaged = await CharacterPackageService.build(draft)
    const zip = await CharacterPackageService.import(new Blob([new Uint8Array(packaged)]))
    DraftStorageService.saveAll([draft])
    const saved = DraftStorageService.loadAll()[0]
    for (const restored of [json, zip, saved]) {
      expect(restored).toMatchObject({ raceId: draft.raceId, selections: draft.selections, raceSkillChoices: draft.raceSkillChoices, raceAbilityChoices: draft.raceAbilityChoices })
      expect(restored?.raceToolChoice).toBe(draft.raceToolChoice)
      expect(restored?.speciesSizeChoice).toBe(draft.speciesSizeChoice)
      if (!restored) throw new Error('Missing restored draft')
      expect(deriveCharacter(restored).armorClass.value).toBe(deriveCharacter(draft).armorClass.value)
      expect(getEffectiveSpeciesFeatures(restored, rulesRepository)).toEqual(getEffectiveSpeciesFeatures(draft, rulesRepository))
    }
  })
  it('按逐项玩家正文核对基础速度、感官与移动资料，不从待核验感官猜修正值', () => {
    const darkvision = ['shadar-kai', 'air-genasi', 'earth-genasi', 'fire-genasi', 'water-genasi', 'bugbear', 'tabaxi', 'sea-elf', 'orc', 'goblin', 'hobgoblin', 'yuan-ti', 'deep-gnome', 'duergar', 'triton', 'shifter', 'kobold', 'aasimar', 'eladrin']
    for (const slug of motmSlugs) {
      const race = rulesRepository.getRace(`race-2014-motm-${slug}`)
      expect(race?.speed).toBe(slug === 'centaur' ? 40 : slug === 'satyr' || slug === 'air-genasi' ? 35 : 30)
      expect(race?.darkvision).toBe(darkvision.includes(slug) ? 60 : undefined)
    }
    expect(rulesRepository.getRace('race-2014-motm-tabaxi')?.climbSpeed).toBe(30)
    for (const slug of ['sea-elf', 'triton', 'water-genasi', 'lizardfolk']) expect(rulesRepository.getRace(`race-2014-motm-${slug}`)?.swimSpeed).toBe(30)
    for (const slug of ['fairy', 'aarakocra']) expect(rulesRepository.getRace(`race-2014-motm-${slug}`)?.flySpeed).toBe(30)
    for (const slug of ['deep-gnome', 'duergar']) expect(rulesRepository.getRace(`race-2014-motm-${slug}`)?.summary).toContain('官方核验待补')
  })
  it('所有可选体型的两种合法值、不合法及缺失值、来源关闭分别校验', () => {
    for (const slug of motmSlugs) {
      const draft = motmDraft(slug)
      if (!rulesRepository.getRace(draft.raceId ?? '')?.sizeChoices?.length) continue
      for (const speciesSizeChoice of ['small', 'medium'] as const) expect(validateDraft({ ...draft, speciesSizeChoice }).some((issue) => issue.id.startsWith('species-size'))).toBe(false)
      expect(validateDraft({ ...draft, speciesSizeChoice: undefined }).some((issue) => issue.id.startsWith('species-size') && issue.severity === 'error')).toBe(true)
      expect(validateDraft({ ...draft, enabledSourceIds: [], speciesSizeChoice: undefined }).some((issue) => issue.id.startsWith('species-size'))).toBe(false)
    }
  })
})
