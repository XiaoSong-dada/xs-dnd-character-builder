import { describe, expect, it } from 'vitest'

import { getOriginStepBlockers, isOriginStepComplete } from '@/rules/origins'
import { rulesRepository as rulesRepository2014 } from '@/rules/repository'
import { getRulesRepository } from '@/rules/repositories'
import { validateDraft } from '@/rules/validate'
import type { CharacterDraft } from '@/types/character'
import { draft2024 } from '../fixtures/draft-2024'

const repository2024 = getRulesRepository('5e-2024')

/** 2024 法师＋精灵（高等血统）＋学者：完整起源（默认含 2 门语言与背景属性分配）。 */
function completeOrigin2024(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return draft2024({
    classId: 'class-2024-wizard',
    raceId: 'species-2024-elf',
    subraceId: 'species-2024-elf-high-elf-lineage',
    backgroundId: 'background-2024-sage',
    raceSkillChoices: ['skill-perception'],
    speciesSizeChoice: undefined,
    languages: ['龙语', '精灵语'],
    backgroundAbilityAllocation: { int: 2, con: 1 },
    ...overrides,
  })
}

function blockerIds(draft: CharacterDraft): readonly string[] {
  return getOriginStepBlockers(draft, repository2024).map((blocker) => blocker.id)
}

describe('B09-07 起源步骤完成判定（2024）', () => {
  it('完整起源可继续：法师＋精灵血统＋学者（语言 2 门）', () => {
    const draft = completeOrigin2024()
    expect(getOriginStepBlockers(draft, repository2024)).toEqual([])
    expect(isOriginStepComplete(draft, repository2024)).toBe(true)
  })

  it('当前缺陷回归：语言 0／1 门被阻断，选满 2 门通过', () => {
    expect(blockerIds(completeOrigin2024({ languages: [] }))).toContain('background-languages')
    expect(blockerIds(completeOrigin2024({ languages: ['龙语'] }))).toContain('background-languages')
    expect(blockerIds(completeOrigin2024({ languages: ['龙语', '精灵语'] }))).not.toContain('background-languages')
  })

  it('语言重复计入未完成（与校验一致）', () => {
    expect(blockerIds(completeOrigin2024({ languages: ['龙语', '龙语'] }))).toContain('background-languages')
  })

  it('血统、物种技能与背景属性分配纳入同一判定', () => {
    expect(blockerIds(completeOrigin2024({ subraceId: undefined }))).toContain('subrace-required')
    expect(blockerIds(completeOrigin2024({ raceSkillChoices: [] }))).toContain('race-skill-choice-count')
    expect(blockerIds(completeOrigin2024({ backgroundAbilityAllocation: {} }))).toContain('background-ability-allocation')
  })

  it('物种体型未选时阻断（2024 人类可选择小/中型）', () => {
    const human = draft2024({
      raceId: 'species-2024-human',
      backgroundId: 'background-2024-sage',
      raceSkillChoices: [],
      languages: ['龙语', '精灵语'],
      backgroundAbilityAllocation: { int: 2, con: 1 },
      speciesSizeChoice: undefined,
    })
    expect(blockerIds(human)).toContain('species-size-required')
    expect(blockerIds({ ...human, speciesSizeChoice: 'medium' })).not.toContain('species-size-required')
  })

  it('结构化背景工具覆盖缺项、重复与非法候选，合法选择解除阻塞', () => {
    const artisan = completeOrigin2024({
      backgroundId: 'background-2024-artisan',
      backgroundAbilityAllocation: { int: 2, dex: 1 },
      backgroundToolIds: [],
    })
    const optionId = repository2024.getBackground('background-2024-artisan')?.toolChoices?.optionIds?.[0]
    expect(optionId).toBeDefined()
    if (!optionId) return

    expect(blockerIds(artisan)).toContain('background-tool-choice-count')
    expect(blockerIds({ ...artisan, backgroundToolIds: [optionId] })).not.toContain('background-tool-choice-count')
    expect(blockerIds({ ...artisan, backgroundToolIds: [optionId, optionId] })).toContain('background-tool-choice-count')
    expect(blockerIds({ ...artisan, backgroundToolIds: ['equipment-2024-invalid'] })).toContain('background-tool-choice-invalid-equipment-2024-invalid')
  })

  it('旧草稿缺少当前背景工具选择时保留为空并要求补选', () => {
    const oldDraft = completeOrigin2024({
      backgroundId: 'background-2024-entertainer',
      backgroundAbilityAllocation: { dex: 2, cha: 1 },
      backgroundToolIds: [],
    })
    expect(isOriginStepComplete(oldDraft, repository2024)).toBe(false)
    expect(validateDraft(oldDraft).map((issue) => issue.id)).toContain('background-tool-choice-count')
    expect(oldDraft.backgroundToolIds).toEqual([])
  })

  it('职业追加语言：2024 游荡者需要 3 门（盗贼黑话 +1）', () => {
    const rogue = completeOrigin2024({
      classId: 'class-2024-rogue',
      languageChoices: undefined,
      languages: ['龙语', '精灵语'],
    } as Partial<CharacterDraft>)
    expect(blockerIds(rogue)).toContain('background-languages')
    expect(blockerIds({ ...rogue, languages: ['龙语', '精灵语', '地精语'] })).not.toContain('background-languages')
  })

  it('阻塞项与 validateDraft 的错误级问题同源（阻塞项集合为其子集）', () => {
    const drafts: readonly CharacterDraft[] = [
      completeOrigin2024(),
      completeOrigin2024({ languages: [] }),
      completeOrigin2024({ subraceId: undefined }),
      completeOrigin2024({ raceSkillChoices: [] }),
      completeOrigin2024({ backgroundAbilityAllocation: {} }),
      completeOrigin2024({ raceId: undefined, backgroundId: undefined }),
    ]
    for (const draft of drafts) {
      const errorIds = new Set(validateDraft(draft).filter((issue) => issue.severity === 'error').map((issue) => issue.id))
      for (const id of blockerIds(draft)) {
        expect(errorIds.has(id), `阻塞项 ${id} 未在校验中报错`).toBe(true)
      }
    }
  })
})

describe('B09-07 起源步骤完成判定（2014 回归）', () => {
  function legacyDraft(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
    const draft = draft2024()
    return {
      ...draft,
      ruleset: '5e-2014',
      classId: 'class-2014-fighter',
      raceId: 'race-2014-half-orc',
      subraceId: undefined,
      backgroundId: 'background-2014-soldier',
      raceSkillChoices: [],
      languages: [],
      ...overrides,
    }
  }

  it('侍僧 2 门语言必须选满', () => {
    const acolyte = legacyDraft({ backgroundId: 'background-2014-acolyte', languages: [] })
    expect(getOriginStepBlockers(acolyte, rulesRepository2014).map((blocker) => blocker.id)).toContain('background-languages')
    expect(isOriginStepComplete({ ...acolyte, languages: ['龙语', '精灵语'] }, rulesRepository2014)).toBe(true)
  })

  it('罪犯 0 门语言：不选或额外多选均不阻断（与校验的额外语言放宽一致）', () => {
    const criminal = legacyDraft({ backgroundId: 'background-2014-criminal' })
    expect(isOriginStepComplete(criminal, rulesRepository2014)).toBe(true)
    expect(isOriginStepComplete({ ...criminal, languages: ['龙语'] }, rulesRepository2014)).toBe(true)
  })
})
