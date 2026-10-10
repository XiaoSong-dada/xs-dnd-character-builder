import { describe, expect, it } from 'vitest'
import { deriveCharacter, getRaceAbilityBonuses } from '@/rules/derive'
import { rulesRepository } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { validateDraft } from '@/rules/validate'
import { getEffectiveSelectedSpellIds, getSpeciesSpellcastingProfiles, getSpellFreeCastings } from '@/rules/spellcasting'
import { listSessionResources, applyResourceChange, applyRestRecovery } from '@/rules/session-resources'
import { createInitialSessionState } from '@/rules/session-state'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import { draft2024, selection } from '../fixtures/draft-2024'

const cases = [
  { slug: 'air', speed: 35, resistance: ['闪电'], spells: ['shocking-grasp', 'feather-fall', 'levitate'], levels: [1, 3, 5], waived: ['feather-fall', 'levitate'] },
  { slug: 'earth', speed: 30, resistance: undefined, spells: ['blade-ward', 'pass-without-trace'], levels: [1, 5], waived: ['pass-without-trace'] },
  { slug: 'fire', speed: 30, resistance: ['火焰'], spells: ['produce-flame', 'burning-hands', 'flame-blade'], levels: [1, 3, 5], waived: ['flame-blade'] },
  { slug: 'water', speed: 30, resistance: ['强酸'], spells: ['acid-splash', 'create-or-destroy-water', 'wall-of-water'], levels: [1, 3, 5], waived: ['wall-of-water'] },
]
const draftFor = (slug: string, targetLevel = 5) => {
  const raceId = `race-2014-motm-${slug}-genasi`
  return draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel, raceId,
    enabledSourceIds: ['motm-2022-index'], raceAbilityChoices: ['str', 'dex'], speciesSizeChoice: 'small', languages: ['精灵语'],
    selections: [selection(`${raceId}-spellcasting-ability`, ['spell-ability-wis'])],
  })
}

describe('四种MotM元素裔及逐法术免材料', () => {
  it.each(cases)('$slug 独立主种族的属性、体型、速度、感官与等级法术', (item) => {
    const original = draftFor(item.slug)
    const race = rulesRepository.getRace(original.raceId ?? '')
    expect(race).toMatchObject({ ruleset: '5e-2014', sizeChoices: ['small', 'medium'], darkvision: 60, speed: item.speed, sourceIds: ['motm-2022-index'] })
    expect(race?.parentRaceId).toBeUndefined()
    expect(race?.damageResistances).toEqual(item.resistance)
    expect(rulesRepository2024.getRace(original.raceId ?? '')).toBeUndefined()
    expect(getRaceAbilityBonuses(original)).toEqual({ str: 2, dex: 1 })
    expect(getRaceAbilityBonuses({ ...original, raceAbilityBonusOptionId: 'three-one', raceAbilityChoices: ['str', 'dex', 'con'] })).toEqual({ str: 1, dex: 1, con: 1 })
    expect(validateDraft({ ...original, speciesSizeChoice: undefined })).toContainEqual(expect.objectContaining({ id: 'species-size-required' }))
    expect(validateDraft({ ...original, selections: [] })).toContainEqual(expect.objectContaining({ id: `checkpoint-${original.raceId}-spellcasting-ability` }))
    for (const level of [1, 2, 3, 4, 5, 20]) {
      const draft = draftFor(item.slug, level)
      const expected = item.spells.filter((_, index) => item.levels[index] <= level).map((spell) => `spell-2014-${spell}`)
      expect(deriveCharacter(draft).speed.value).toBe(item.speed)
      expect(getEffectiveSelectedSpellIds(draft)).toEqual(expected)
      expect(getSpellFreeCastings(draft)).toHaveLength(expected.length - 1)
      expect(getSpellFreeCastings(draft).every((grant) => grant.count === 1 && grant.recovery === 'long-rest')).toBe(true)
      expect(buildCharacterExportModel(draft, deriveCharacter(draft)).spellcasting?.spells.map((spell) => spell.id)).toEqual(expected)
      expect(draft.spellSelections.preparedSpellIds).toEqual([])
      const waived = expected.filter((spell) => item.waived.some((suffix) => spell === `spell-2014-${suffix}`))
      expect(getSpeciesSpellcastingProfiles(draft)[0]?.materialFreeSpellIds).toEqual(waived)
    }
  })

  it('土元素裔附赠剑刃防护为独立熟练次数资源，不限制正常戏法也不占行动无踪次数', () => {
    const id = 'race-2014-motm-earth-genasi-bonus-blade-ward'
    for (let level = 1; level <= 20; level++) {
      const resources = listSessionResources(draftFor('earth', level))
      expect(resources).toContainEqual(expect.objectContaining({ id, max: 2 + Math.floor((level - 1) / 4), recovery: 'long-rest' }))
      expect(resources).toHaveLength(level >= 5 ? 2 : 1)
    }
    const draft = draftFor('earth')
    const resources = listSessionResources(draft)
    const spent = applyResourceChange(createInitialSessionState('earth-genasi', 30), id, 3, 3).state
    expect(getEffectiveSelectedSpellIds(draft)).toContain('spell-2014-blade-ward')
    expect(spent.resourceUsage?.['race-2014-motm-earth-genasi:spell-2014-pass-without-trace']).toBeUndefined()
    expect(applyRestRecovery(spent, resources, 'short-rest').resourceUsage?.[id]).toBe(3)
    expect(applyRestRecovery(spent, resources, 'long-rest').resourceUsage?.[id]).toBe(0)
    expect(rulesRepository.getSpell('spell-2014-blade-ward')?.castingTime).not.toBe('附赠动作')
  })

  it('免材料只作用于所声明的种族授予，不修改法术元数据或仙灵及2024条目', () => {
    const before = { ...rulesRepository.getSpell('spell-2014-levitate') }
    for (const item of cases) {
      const draft = draftFor(item.slug)
      const profile = getSpeciesSpellcastingProfiles(draft)[0]
      expect(profile?.materialFreeSpellIds).toEqual(item.waived.map((spell) => `spell-2014-${spell}`))
      const feature = buildCharacterExportModel(draft, deriveCharacter(draft)).features.find((feature) => feature.id === `${draft.raceId}-spellcasting-wis`)
      expect(feature?.summary).toContain('无需材料成分（种族施放）')
      for (const spell of profile?.materialFreeSpellIds ?? []) expect(feature?.summary).toContain(rulesRepository.getSpell(spell)?.name)
    }
    const fairy = { ...draftFor('air'), raceId: 'race-2014-motm-fairy', selections: [selection('race-2014-motm-fairy-spellcasting-ability', ['spell-ability-wis'])] }
    expect(getSpeciesSpellcastingProfiles(fairy)[0]?.materialFreeSpellIds).toEqual([])
    expect(rulesRepository.getSpell('spell-2014-levitate')).toEqual(before)
    // X 批次新增两条明确声明免材料的种族施放：奇械锻炉炎身（火焰刀）与 UA 寇涛（寻获魔宠，种族施放免材料）。
    // 除这两条外，2024 仓库不得出现其他免材料声明。
    const declaredMaterialFree = ['species-2024-lfl-flamekin', 'species-2024-ua-underdark-kuo-toa']
    expect(rulesRepository2024.races.filter((race) => !declaredMaterialFree.includes(race.id)).flatMap((race) => race.spellGrants ?? []).some((grant) => grant.waivesMaterialComponents)).toBe(false)
    expect(rulesRepository2024.getRace('species-2024-lfl-flamekin')?.spellGrants?.filter((grant) => grant.waivesMaterialComponents).map((grant) => grant.spellId)).toEqual(['spell-2024-flame-blade'])
    expect(rulesRepository2024.getRace('species-2024-ua-underdark-kuo-toa')?.spellGrants?.filter((grant) => grant.waivesMaterialComponents).map((grant) => grant.spellId)).toEqual(['spell-2024-find-familiar'])
    const disabled = { ...draftFor('air'), enabledSourceIds: [] }
    expect(getSpeciesSpellcastingProfiles(disabled)).toEqual([])
  })

  it('每种施法属性都可解析，来源关闭停用收益但JSON/ZIP不丢选择', async () => {
    for (const item of cases) {
      const original = draftFor(item.slug)
      for (const ability of ['int', 'wis', 'cha']) {
        expect(getSpeciesSpellcastingProfiles({ ...original, selections: [selection(`${original.raceId}-spellcasting-ability`, [`spell-ability-${ability}`])] })[0]?.ability).toBe(ability)
      }
      const json = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(original))
      const bytes = await CharacterPackageService.build(original)
      const zipped = await CharacterPackageService.import(new Blob([bytes as BlobPart]))
      for (const restored of [json, zipped]) {
        expect(restored.raceId).toBe(original.raceId)
        expect(restored.selections).toEqual(original.selections)
        expect(restored.speciesSizeChoice).toBe('small')
        expect(getSpeciesSpellcastingProfiles(restored)).toEqual(getSpeciesSpellcastingProfiles(original))
        const disabled = { ...restored, enabledSourceIds: [] }
        expect(getRaceAbilityBonuses(disabled)).toEqual({})
        expect(getEffectiveSelectedSpellIds(disabled)).toEqual([])
        expect(listSessionResources(disabled)).toEqual([])
        expect(buildCharacterExportModel(disabled, deriveCharacter(disabled)).spellcasting).toBeUndefined()
      }
    }
  })

  it('水裔游泳、两栖、气裔闭气与土行只作明确条件展示', () => {
    expect(rulesRepository.getRace('race-2014-motm-water-genasi')?.swimSpeed).toBe(30)
    expect(rulesRepository.getRaceFeatures('race-2014-motm-water-genasi')).toContainEqual(expect.objectContaining({ name: '游泳', description: expect.stringContaining('当前步行速度') }))
    expect(rulesRepository.getRaceFeatures('race-2014-motm-air-genasi')).toContainEqual(expect.objectContaining({ name: '魔息', description: expect.stringContaining('未失能') }))
    expect(rulesRepository.getRaceFeatures('race-2014-motm-earth-genasi')).toContainEqual(expect.objectContaining({ name: '土行', description: expect.stringContaining('地面或地板') }))
  })
})
