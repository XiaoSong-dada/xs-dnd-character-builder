import { describe, expect, it } from 'vitest'
import { deriveCharacter, getRaceAbilityBonuses } from '@/rules/derive'
import { getSpeciesProficiencyBlockers, getSpeciesToolProficiency } from '@/rules/origins'
import { rulesRepository } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { validateDraft } from '@/rules/validate'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import { draft2024 } from '../fixtures/draft-2024'

const raceId = 'race-2014-motm-satyr'
const draftFor = () => draft2024({ ruleset: '5e-2014', targetLevel: 1, classId: 'class-2014-fighter', raceId,
  enabledSourceIds: ['motm-2022-index'], raceAbilityChoices: ['str', 'dex'], raceToolChoice: 'flute', languages: ['精灵语'],
})

describe('MotM半羊人与限定工具选择', () => {
  it('独立中型妖精、速度35、两种属性方案与两项固定技能，保留情境限制', () => {
    const draft = draftFor()
    const race = rulesRepository.getRace(raceId)
    expect(race).toMatchObject({ size: 'medium', speed: 35, sourceIds: ['motm-2022-index'], fixedLanguages: ['通用语'], languageChoices: 1, skillProficiencies: ['skill-performance', 'skill-persuasion'] })
    expect(race?.parentRaceId).toBeUndefined()
    expect(rulesRepository2024.getRace(raceId)).toBeUndefined()
    expect(getRaceAbilityBonuses(draft)).toEqual({ str: 2, dex: 1 })
    expect(getRaceAbilityBonuses({ ...draft, raceAbilityBonusOptionId: 'three-one', raceAbilityChoices: ['str', 'dex', 'con'] })).toEqual({ str: 1, dex: 1, con: 1 })
    for (const targetLevel of [1, 5, 20]) {
      const derived = deriveCharacter({ ...draft, targetLevel })
      expect(derived.speed.value).toBe(35)
      expect(derived.skills['skill-performance'].sources).toContainEqual(expect.objectContaining({ label: '技能熟练' }))
      expect(derived.skills['skill-persuasion'].sources).toContainEqual(expect.objectContaining({ label: '技能熟练' }))
    }
    const features = rulesRepository.getRaceFeatures(raceId)
    expect(features).toHaveLength(5)
    expect(features.find((item) => item.englishName === 'Ram')?.summary).toContain('1d6')
    expect(features.find((item) => item.englishName === 'Magic Resistance')?.description).toContain('法术')
    expect(features.find((item) => item.englishName === 'Mirthful Leaps')?.description).toContain('消耗移动力')
    expect(features.every((item) => !item.resource)).toBe(true)
  })
  it('十种具体乐器必选，非乐器拒绝，旧种族工具未选仍仅提示', () => {
    const draft = draftFor()
    const allowed = rulesRepository.getRace(raceId)?.toolProficiencyChoices?.optionIds ?? []
    expect(allowed).toHaveLength(10)
    for (const raceToolChoice of allowed) {
      expect(getSpeciesProficiencyBlockers({ ...draft, raceToolChoice }, rulesRepository)).toEqual([])
      expect(getSpeciesToolProficiency({ ...draft, raceToolChoice }, rulesRepository)?.name).toBe(rulesRepository.getEquipment(raceToolChoice)?.name)
    }
    expect(validateDraft({ ...draft, raceToolChoice: undefined })).toContainEqual(expect.objectContaining({ id: 'race-tool-choice-required', severity: 'error' }))
    expect(validateDraft({ ...draft, raceToolChoice: 'tool-thieves-tools' })).toContainEqual(expect.objectContaining({ id: 'race-tool-choice-invalid', severity: 'error' }))
    expect(getSpeciesToolProficiency({ ...draft, raceToolChoice: 'tool-thieves-tools' }, rulesRepository)).toBeUndefined()
    expect(validateDraft({ ...draft, raceId: 'race-2014-warforged', enabledSourceIds: ['erftlw-2019-index'], raceToolChoice: undefined })).toContainEqual(expect.objectContaining({ id: 'race-tool-choice-missing', severity: 'warning' }))
  })
  it('来源关闭停用工具、固定技能及导出，重新开启恢复且不删除原选择', () => {
    const draft = draftFor()
    const disabled = { ...draft, enabledSourceIds: [] }
    expect(getSpeciesProficiencyBlockers(disabled, rulesRepository)).toEqual([])
    expect(getSpeciesToolProficiency(disabled, rulesRepository)).toBeUndefined()
    expect(deriveCharacter(disabled).speed.value).toBe(30)
    expect(buildCharacterExportModel(disabled, deriveCharacter(disabled)).features.filter((item) => item.category === 'race')).toEqual([])
    expect(getSpeciesToolProficiency(draft, rulesRepository)?.name).toBe('长笛')
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    expect(model.features).toContainEqual(expect.objectContaining({ name: '种族工具熟练', summary: '半羊人（多元宇宙）：长笛' }))
    expect(model.proficiencies.languages).toContain('通用语')
    expect(draft.raceToolChoice).toBe('flute')
  })
  it('JSON/ZIP保留具体乐器，导入后重新校验而不猜测替代项', async () => {
    const draft = draftFor()
    const json = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(draft))
    expect(json.raceToolChoice).toBe('flute')
    const bundle = await CharacterPackageService.build(draft)
    const imported = await CharacterPackageService.import(new Blob([new Uint8Array(bundle)]))
    expect(imported.raceToolChoice).toBe('flute')
  })
})
