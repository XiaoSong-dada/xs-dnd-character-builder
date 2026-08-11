import { describe, expect, it } from 'vitest'

import { validateDraft } from '@/rules/validate'
import type { CharacterDraft } from '@/types/character'

function createDraft(): CharacterDraft {
  return {
    schemaVersion: 3,
    id: 'test',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 3,
    abilityMethod: 'standard-array',
    preferences: [],
    raceAbilityChoices: [],
    backgroundSkillIds: [],
    backgroundToolIds: [],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    equipmentNeedsReview: false,
    name: '',
    alignment: '',
    notes: '',
    currentStep: 'validation',
  }
}

describe('validateDraft', () => {
  it('报告缺失职业、起源和姓名', () => {
    const issueIds = validateDraft(createDraft()).map((issue) => issue.id)
    expect(issueIds).toContain('class-required')
    expect(issueIds).toContain('origin-required')
    expect(issueIds).toContain('name-required')
  })

  it('报告职业时间线缺失选择', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-soldier',
      raceId: 'race-2014-human',
      name: '凯恩',
    }
    expect(validateDraft(draft).some((issue) => issue.id === 'checkpoint-fighter-2014-skills-1')).toBe(true)
    expect(validateDraft(draft).some((issue) => issue.id === 'checkpoint-fighter-2014-subclass-3')).toBe(true)
  })

  it('报告费兹本龙裔缺少子种族与自选属性数量不足', () => {
    const withoutSubrace: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-soldier',
      raceId: 'race-2014-dragonborn-fizban',
      name: '凯恩',
      raceAbilityChoices: ['str', 'con'],
    }
    expect(validateDraft(withoutSubrace).some((issue) => issue.id === 'subrace-required')).toBe(true)

    const partialChoices: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-soldier',
      raceId: 'race-2014-dragonborn-fizban',
      subraceId: 'race-2014-dragonborn-fizban-chromatic',
      name: '凯恩',
      raceAbilityChoices: ['str'],
    }
    expect(validateDraft(partialChoices).some((issue) => issue.id === 'race-ability-choice')).toBe(true)
  })

  it('报告超过20的属性提升和不满足前置条件的专长', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      targetLevel: 8,
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-soldier',
      raceId: 'race-2014-human',
      name: '凯恩',
      baseAbilities: { str: 20, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
      selections: [
        { checkpointId: 'fighter-2014-asi-4', optionIds: ['asi-str-2'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-6', optionIds: ['feat-actor'], confirmedAt: '' },
      ],
    }
    const issues = validateDraft(draft)
    expect(issues.some((issue) => issue.id.startsWith('ability-improvement-'))).toBe(true)
    expect(issues.some((issue) => issue.id.startsWith('feat-prerequisite-'))).toBe(true)
  })

  it('27点预算只校验基础值，不计入等级属性提升', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      targetLevel: 4,
      abilityMethod: 'point-buy',
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-soldier',
      raceId: 'race-2014-human',
      name: '凯恩',
      baseAbilities: { str: 18, dex: 16, con: 15, int: 8, wis: 10, cha: 8 },
      selections: [
        { checkpointId: 'fighter-2014-asi-4', optionIds: ['asi-int-2'], confirmedAt: '' },
      ],
    }

    const issues = validateDraft(draft)

    expect(issues.some((issue) => issue.id === 'ability-method-invalid')).toBe(false)
    expect(issues.some((issue) => issue.id.startsWith('ability-improvement-'))).toBe(false)
  })

  it('属性提升超过20时只报告属性提升错误，不误报27点预算', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      targetLevel: 4,
      abilityMethod: 'point-buy',
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-soldier',
      raceId: 'race-2014-human',
      name: '凯恩',
      baseAbilities: { str: 18, dex: 16, con: 15, int: 8, wis: 10, cha: 8 },
      selections: [
        { checkpointId: 'fighter-2014-asi-4', optionIds: ['asi-str-2'], confirmedAt: '' },
      ],
    }

    const issues = validateDraft(draft)

    expect(issues.some((issue) => issue.id === 'ability-method-invalid')).toBe(false)
    expect(issues.some((issue) => issue.id.startsWith('ability-improvement-'))).toBe(true)
  })

  it('吟游诗人专精选择已熟练技能时不报未熟练错误', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      targetLevel: 3,
      classId: 'class-2014-bard',
      backgroundId: 'background-2014-sage',
      raceId: 'race-2014-human',
      name: '诗人',
      spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
      selections: [
        { checkpointId: 'bard-2014-skills-1', optionIds: ['skill-insight', 'skill-history', 'skill-persuasion'], confirmedAt: '' },
        { checkpointId: 'bard-2014-expertise-3', optionIds: ['skill-insight', 'skill-history'], confirmedAt: '' },
      ],
    }

    const issues = validateDraft(draft)

    expect(issues.some((issue) => issue.id === 'expertise-without-proficiency')).toBe(false)
  })

  it('吟游诗人专精选择未熟练技能时报告未熟练错误', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      targetLevel: 3,
      classId: 'class-2014-bard',
      backgroundId: 'background-2014-sage',
      raceId: 'race-2014-human',
      name: '诗人',
      spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
      selections: [
        { checkpointId: 'bard-2014-skills-1', optionIds: ['skill-insight', 'skill-history', 'skill-persuasion'], confirmedAt: '' },
        { checkpointId: 'bard-2014-expertise-3', optionIds: ['skill-deception', 'skill-history'], confirmedAt: '' },
      ],
    }

    const issues = validateDraft(draft)

    expect(issues.some((issue) => issue.id === 'expertise-without-proficiency')).toBe(true)
  })
})
