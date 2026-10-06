import { describe, expect, it } from 'vitest'
import { deriveCharacter, getRaceAbilityBonuses } from '@/rules/derive'
import { getFixedSpeciesLanguages, getRequiredLanguageCount } from '@/rules/languages'
import { getOriginStepBlockers } from '@/rules/origins'
import { rulesRepository } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { getDefaultEnabledSourceIds } from '@/rules/source-books'
import { validateDraft } from '@/rules/validate'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import { draft2024 } from '../fixtures/draft-2024'

const id = 'race-2014-motm-changeling'
const draftFor = () => draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 1,
  raceId: id, backgroundId: 'background-2014-criminal', enabledSourceIds: ['motm-2022-index'], speciesSizeChoice: 'small',
  raceAbilityChoices: ['str', 'dex'], raceSkillChoices: ['skill-performance', 'skill-deception'], languages: ['精灵语'],
})

describe('MotM幻身灵独立接入', () => {
  it('官方来源默认启用，独立于旧艾伯伦版及2024仓库', () => {
    expect(getDefaultEnabledSourceIds()).toContain('motm-2022-index')
    expect(rulesRepository.getRace(id)).toMatchObject({ sourceIds: ['motm-2022-index'], sizeChoices: ['small', 'medium'], fixedAbilityBonuses: {} })
    expect(rulesRepository.getRace('race-2014-changeling')).toMatchObject({ sourceIds: ['erftlw-2019-index'], fixedAbilityBonuses: { cha: 2 } })
    expect(rulesRepository2024.getRace(id)).toBeUndefined()
    expect(rulesRepository.getRaceFeatures(id)).toHaveLength(5)
  })
  it('两种属性方案、必选体型、五技能选二均参与派生和校验', () => {
    const draft = draftFor()
    expect(getRaceAbilityBonuses(draft)).toEqual({ str: 2, dex: 1 })
    expect(getRaceAbilityBonuses({ ...draft, raceAbilityBonusOptionId: 'three-one', raceAbilityChoices: ['str', 'dex', 'con'] })).toEqual({ str: 1, dex: 1, con: 1 })
    expect(deriveCharacter(draft).speed.value).toBe(30)
    expect(deriveCharacter(draft).skills['skill-performance']?.sources.some((source) => source.label === '技能熟练')).toBe(true)
    expect(getOriginStepBlockers(draft, rulesRepository)).toEqual([])
    expect(validateDraft({ ...draft, speciesSizeChoice: undefined })).toContainEqual(expect.objectContaining({ id: 'species-size-required' }))
    expect(validateDraft({ ...draft, raceSkillChoices: ['skill-athletics', 'skill-deception'] }).some((issue) => issue.id.startsWith('race-skill'))).toBe(true)
  })
  it('种族语言加到背景任务，固定通用语进入导出；旧条目不猜测追加', () => {
    const draft = draftFor()
    expect(getRequiredLanguageCount(draft, rulesRepository)).toBe(1)
    expect(getRequiredLanguageCount({ ...draft, backgroundId: 'background-2014-sage' }, rulesRepository)).toBe(3)
    expect(getRequiredLanguageCount({ ...draft, raceId: 'race-2014-changeling' }, rulesRepository)).toBe(0)
    expect(getOriginStepBlockers({ ...draft, languages: [] }, rulesRepository)).toContainEqual(expect.objectContaining({ id: 'background-languages' }))
    expect(getFixedSpeciesLanguages(draft, rulesRepository)).toEqual(['通用语'])
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    expect(model.proficiencies.languages).toEqual(['通用语', '精灵语'])
    expect(model.features).toContainEqual(expect.objectContaining({ name: '生物种类', summary: '妖精' }))
  })
  it('JSON及ZIP保持版本、选择和来源，来源关闭后不激活收益', async () => {
    const original = draftFor()
    const restored = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(original))
    expect(restored.raceId).toBe(id)
    expect(restored.raceSkillChoices).toEqual(original.raceSkillChoices)
    expect(restored.speciesSizeChoice).toBe('small')
    expect(getRaceAbilityBonuses(restored)).toEqual({ str: 2, dex: 1 })
    const bytes = await CharacterPackageService.build(original)
    const zipped = await CharacterPackageService.import(new Blob([bytes as BlobPart]))
    expect(zipped.raceId).toBe(id)
    expect(zipped.raceSkillChoices).toEqual(original.raceSkillChoices)
    expect(getRaceAbilityBonuses(zipped)).toEqual({ str: 2, dex: 1 })
    const disabled = { ...restored, enabledSourceIds: [] }
    expect(getRaceAbilityBonuses(disabled)).toEqual({})
    expect(getRequiredLanguageCount(disabled, rulesRepository)).toBe(0)
    expect(getFixedSpeciesLanguages(disabled, rulesRepository)).toEqual([])
    expect(buildCharacterExportModel(disabled, deriveCharacter(disabled)).features.some((feature) => feature.id.startsWith(id))).toBe(false)
  })
})
