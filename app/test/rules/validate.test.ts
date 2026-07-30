import { describe, expect, it } from 'vitest'

import { validateDraft } from '@/rules/validate'
import type { CharacterDraft } from '@/types/character'

function createDraft(): CharacterDraft {
  return {
    schemaVersion: 2,
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
    inventoryItemIds: [],
    equippedItemIds: [],
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
})
