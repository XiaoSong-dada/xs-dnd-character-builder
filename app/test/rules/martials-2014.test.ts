import { describe, expect, it } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import { rulesRepository } from '@/rules/repository'
import { buildTimeline } from '@/rules/timeline'
import { validateDraft } from '@/rules/validate'
import type { CharacterDraft } from '@/types/character'

function draft(patch: Partial<CharacterDraft>): CharacterDraft {
  return {
    schemaVersion: 3,
    id: 'martial-test',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 10,
    abilityMethod: 'standard-array',
    preferences: ['melee'],
    raceId: 'race-2014-half-orc',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-soldier',
    backgroundSkillIds: ['skill-athletics', 'skill-intimidation'],
    backgroundToolIds: ['tool-gaming-set', 'tool-land-vehicles'],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    equipmentNeedsReview: false,
    name: '测试角色',
    alignment: '',
    notes: '',
    currentStep: 'sheet',
    ...patch,
  }
}

describe('2014 pure martial classes', () => {
  it('registers barbarian, monk and rogue as runnable classes', () => {
    for (const classId of ['class-2014-barbarian', 'class-2014-monk', 'class-2014-rogue']) {
      expect(rulesRepository.getClass(classId)?.status).toBe('implemented')
      expect(buildTimeline(classId, 20).length).toBeGreaterThan(0)
    }
  })

  it('uses the 2014 ASI levels and keeps the rogue timeline sorted', () => {
    expect(buildTimeline('class-2014-barbarian', 20).filter((item) => item.kind === 'ability-improvement').map((item) => item.level))
      .toEqual([4, 8, 12, 16, 19])
    expect(buildTimeline('class-2014-monk', 20).filter((item) => item.kind === 'ability-improvement').map((item) => item.level))
      .toEqual([4, 8, 12, 16, 19])
    expect(buildTimeline('class-2014-rogue', 20).filter((item) => item.kind === 'ability-improvement').map((item) => item.level))
      .toEqual([4, 8, 10, 12, 16, 19])
    const levels = buildTimeline('class-2014-rogue', 20).map((item) => item.level)
    expect(levels).toEqual([...levels].sort((a, b) => a - b))
  })

  it('derives monk unarmored defense, movement and dexterity attack', () => {
    const result = deriveCharacter(draft({ classId: 'class-2014-monk' }))

    expect(result.armorClass.value).toBe(13)
    expect(result.speed.value).toBe(50)
    expect(result.attackBonus.value).toBe(6)
    expect(result.armorClass.sources[0]?.label).toBe('武僧无甲防御')
  })

  it('applies rogue expertise as a second proficiency bonus', () => {
    const result = deriveCharacter(draft({
      classId: 'class-2014-rogue',
      selections: [
        {
          checkpointId: 'rogue-2014-skills-1',
          optionIds: ['skill-acrobatics', 'skill-deception', 'skill-insight', 'skill-perception'],
          confirmedAt: '',
        },
        {
          checkpointId: 'rogue-2014-expertise-1',
          optionIds: ['skill-perception', 'tool-thieves-tools'],
          confirmedAt: '',
        },
      ],
    }))

    expect(result.skills['skill-perception']?.value).toBe(9)
    expect(result.skills['skill-perception']?.sources.some((source) => source.id.endsWith('expertise'))).toBe(true)
  })

  it('derives barbarian unarmored defense and fast movement', () => {
    const result = deriveCharacter(draft({ classId: 'class-2014-barbarian' }))

    expect(result.armorClass.value).toBe(14)
    expect(result.speed.value).toBe(40)
    expect(result.armorClass.sources[0]?.label).toBe('野蛮人无甲防御')
  })

  it('derives rogue leather armor from the equipment registry', () => {
    const result = deriveCharacter(draft({
      classId: 'class-2014-rogue',
      inventory: [
        { id: 'test-leather', itemId: 'leather-armor', quantity: 1, sourceKind: 'legacy', sourceId: 'test', equippedQuantity: 1 },
        { id: 'test-rapier', itemId: 'rapier', quantity: 1, sourceKind: 'legacy', sourceId: 'test', equippedQuantity: 1 },
      ],
    }))

    expect(result.armorClass.value).toBe(13)
  })

  it('rejects expertise in a skill without proficiency', () => {
    const issues = validateDraft(draft({
      classId: 'class-2014-rogue',
      selections: [{
        checkpointId: 'rogue-2014-expertise-1',
        optionIds: ['skill-arcana', 'tool-thieves-tools'],
        confirmedAt: '',
      }],
    }))

    expect(issues.some((issue) => issue.id === 'expertise-without-proficiency')).toBe(true)
  })
})
