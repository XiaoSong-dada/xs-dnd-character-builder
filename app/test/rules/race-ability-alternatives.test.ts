import { afterEach, describe, expect, it, vi } from 'vitest'
import { deriveCharacter, getFlexibleBonusGroups, getRaceAbilityBonuses } from '@/rules/derive'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { rulesRepository } from '@/rules/repository'
import { validateDraft } from '@/rules/validate'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import type { RaceRule } from '@/types/rules'
import { draft2024 } from '../fixtures/draft-2024'

const race: RaceRule = {
  id: 'test-motm-race', ruleset: '5e-2014', name: '测试种族', englishName: 'Test', summary: '', description: '',
  fixedAbilityBonuses: {}, subraceIds: [], recommendedClassIds: [], status: 'implemented', sourceIds: [],
  sizeChoices: ['small', 'medium'],
  flexibleBonusAlternatives: [
    { id: 'two-one', label: '+2 / +1', groups: [{ count: 1, value: 2 }, { count: 1, value: 1 }] },
    { id: 'three-one', label: '三项 +1', groups: [{ count: 3, value: 1 }] },
  ],
}
const base = () => draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', raceId: race.id, abilityMethod: 'custom', targetLevel: 1 })
function installRace() {
  const original = rulesRepository.getRace.bind(rulesRepository)
  vi.spyOn(rulesRepository, 'getRace').mockImplementation((id) => id === race.id ? race : original(id))
}

describe('2014 种族属性加值方案', () => {
  afterEach(() => vi.restoreAllMocks())

  it('缺省采用第一方案，明确选择三项 +1；非法方案不猜测加值', () => {
    installRace()
    expect(getFlexibleBonusGroups(race, undefined)).toEqual(race.flexibleBonusAlternatives?.[0]?.groups)
    expect(getRaceAbilityBonuses({ ...base(), raceAbilityChoices: ['str', 'dex'] })).toEqual({ str: 2, dex: 1 })
    expect(getRaceAbilityBonuses({ ...base(), raceAbilityBonusOptionId: 'three-one', raceAbilityChoices: ['str', 'dex', 'con'] })).toEqual({ str: 1, dex: 1, con: 1 })
    expect(getRaceAbilityBonuses({ ...base(), raceAbilityBonusOptionId: 'unknown', raceAbilityChoices: ['str', 'dex'] })).toEqual({})
    expect(validateDraft({ ...base(), raceAbilityBonusOptionId: 'unknown' })).toContainEqual(expect.objectContaining({ id: 'race-ability-option', step: 'abilities' }))
  })

  it('数量、重复项及最终属性超过20均有阻断错误，切换方案不会默默删除旧选择', () => {
    installRace()
    const draft = { ...base(), raceAbilityBonusOptionId: 'three-one', raceAbilityChoices: ['str', 'dex'] as const }
    expect(validateDraft(draft)).toContainEqual(expect.objectContaining({ id: 'race-ability-choice', resolution: '选择3项不同属性。' }))
    expect(validateDraft({ ...draft, raceAbilityChoices: ['str', 'str', 'dex'] })).toContainEqual(expect.objectContaining({ id: 'race-ability-choice' }))
    expect(validateDraft({ ...draft, raceAbilityBonusOptionId: 'two-one', baseAbilities: { ...draft.baseAbilities, str: 19 } })).toContainEqual(expect.objectContaining({ id: 'origin-ability-cap-exceeded' }))
    expect(validateDraft({ ...draft, raceAbilityBonusOptionId: 'two-one', raceAbilityChoices: ['str', 'dex', 'con'] })).toContainEqual(expect.objectContaining({ id: 'race-ability-choice' }))
  })

  it('固定加值、原有灵活分组和2024不隐式获得新方案', () => {
    const fixed = rulesRepository.getRace('race-2014-half-orc')
    expect(getFlexibleBonusGroups(fixed, 'three-one')).toBeUndefined()
    expect(getRaceAbilityBonuses({ ...base(), raceId: 'race-2014-half-orc', raceAbilityChoices: [], raceAbilityBonusOptionId: 'three-one' })).toEqual({ str: 2, con: 1 })
    const fizban = rulesRepository.getRace('race-2014-dragonborn-fizban')
    expect(getFlexibleBonusGroups(fizban, 'three-one')).toEqual(fizban?.flexibleBonusGroups)
    expect(getRaceAbilityBonuses(draft2024({ raceId: 'species-2024-human', raceAbilityBonusOptionId: 'three-one', raceAbilityChoices: ['str', 'dex', 'con'] }))).toEqual({})
  })

  it('JSON与ZIP保留方案和选择，旧格式缺省不补写方案，归一化拒绝非字符串', async () => {
    installRace()
    const draft = { ...base(), raceAbilityBonusOptionId: 'three-one', raceAbilityChoices: ['str', 'dex', 'con'] as const }
    const json = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(draft))
    const bytes = await CharacterPackageService.build(draft)
    const zip = await CharacterPackageService.import(new Blob([bytes as BlobPart]))
    for (const restored of [json, zip]) {
      expect(restored.raceAbilityBonusOptionId).toBe('three-one')
      expect(restored.raceAbilityChoices).toEqual(draft.raceAbilityChoices)
      expect(getRaceAbilityBonuses(restored)).toEqual({ str: 1, dex: 1, con: 1 })
      expect(buildCharacterExportModel(restored, deriveCharacter(restored)).abilities.str.score).toBe(draft.baseAbilities.str + 1)
    }
    expect(CharacterJsonService.importDraft(CharacterJsonService.exportDraft(base())).raceAbilityBonusOptionId).toBeUndefined()
    expect(CharacterJsonService.importDraft(JSON.stringify({ ...base(), raceAbilityBonusOptionId: 3 })).raceAbilityBonusOptionId).toBeUndefined()
  })

  it('2014体型选择同样阻断未选或非法值，合法选择可继续且持久化', () => {
    installRace()
    expect(validateDraft(base())).toContainEqual(expect.objectContaining({ id: 'species-size-required', step: 'origin', message: '种族需要选择体型。' }))
    for (const size of ['small', 'medium'] as const) {
      const draft = { ...base(), speciesSizeChoice: size }
      expect(validateDraft(draft).some((issue) => issue.id === 'species-size-required')).toBe(false)
      expect(CharacterJsonService.importDraft(CharacterJsonService.exportDraft(draft)).speciesSizeChoice).toBe(size)
      expect(buildCharacterExportModel(draft, deriveCharacter(draft)).features).toContainEqual(expect.objectContaining({ name: '选定体型', summary: size === 'small' ? '小型' : '中型' }))
    }
    const invalid = CharacterJsonService.importDraft(JSON.stringify({ ...base(), speciesSizeChoice: 'large' }))
    expect(invalid.speciesSizeChoice).toBeUndefined()
    expect(validateDraft(invalid)).toContainEqual(expect.objectContaining({ id: 'species-size-required' }))
  })
})
