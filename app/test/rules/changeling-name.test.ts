import { describe, expect, it } from 'vitest'
import { rulesRepository } from '@/rules/repository'
import { deriveCharacter } from '@/rules/derive'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { CharacterJsonService } from '@/services/character-json'
import { draft2024 } from '../fixtures/draft-2024'

describe('艾伯伦幻身灵译名兼容', () => {
  it('稳定 ID 与旧草稿保持不变，导出使用新译名和特性名', () => {
    const race = rulesRepository.getRace('race-2014-changeling')
    expect(race).toMatchObject({ name: '幻身灵', englishName: 'Changeling', searchAliases: ['变形怪'], fixedAbilityBonuses: { cha: 2 }, flexibleBonusValue: 1 })
    expect(rulesRepository.races.filter((item) => item.englishName === 'Changeling')).toHaveLength(1)
    const draft = draft2024({ ruleset: '5e-2014', classId: 'class-2014-bard', raceId: 'race-2014-changeling', targetLevel: 1,
      enabledSourceIds: ['erftlw-2019-index'], raceAbilityChoices: ['dex'] })
    const restored = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(draft))
    expect(restored.raceId).toBe('race-2014-changeling')
    const model = buildCharacterExportModel(restored, deriveCharacter(restored))
    expect(model.identity.raceName).toBe('幻身灵')
    expect(model.features).toContainEqual(expect.objectContaining({ id: 'race-2014-changeling-instincts', name: '幻身本能' }))
    expect(model.features).toContainEqual(expect.objectContaining({ id: 'race-2014-changeling-shapechanger', name: '变形生物' }))
  })
})
