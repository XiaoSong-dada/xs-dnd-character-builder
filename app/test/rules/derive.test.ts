import { describe, expect, it } from 'vitest'

import { abilityModifier, deriveCharacter, proficiencyBonus } from '@/rules/derive'
import type { CharacterDraft } from '@/types/character'

const draft: CharacterDraft = {
  schemaVersion: 3,
  id: 'test',
  ruleset: '5e-2014',
  createdAt: '2026-07-30T00:00:00.000Z',
  updatedAt: '2026-07-30T00:00:00.000Z',
  targetLevel: 10,
  abilityMethod: 'standard-array',
  preferences: [],
  classId: 'class-2014-fighter',
  subclassId: 'subclass-2014-fighter-battle-master',
  backgroundId: 'background-2014-soldier',
  raceId: 'race-2014-half-orc',
  raceAbilityChoices: [],
  backgroundSkillIds: ['skill-athletics', 'skill-intimidation'],
  backgroundToolIds: ['tool-gaming-set', 'tool-land-vehicles'],
  languages: [],
  proficiencyReplacements: [],
  baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
  selections: [{ checkpointId: 'fighter-2014-style-1', optionIds: ['style-defense'], confirmedAt: '2026-07-30T00:00:00.000Z' }],
  startingEquipmentSelections: [],
  inventory: [
    { id: 'test-chain-mail', itemId: 'chain-mail', quantity: 1, sourceKind: 'legacy', sourceId: 'test', equippedQuantity: 1 },
    { id: 'test-shield', itemId: 'shield', quantity: 1, sourceKind: 'legacy', sourceId: 'test', equippedQuantity: 1 },
    { id: 'test-longsword', itemId: 'longsword', quantity: 1, sourceKind: 'legacy', sourceId: 'test', equippedQuantity: 1 },
  ],
  currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  equipmentNeedsReview: false,
  name: '凯恩',
  alignment: '中立善良',
  notes: '',
  currentStep: 'sheet',
}

describe('deriveCharacter', () => {
  it('计算属性调整值和熟练加值', () => {
    expect(abilityModifier(8)).toBe(-1)
    expect(abilityModifier(17)).toBe(3)
    expect(proficiencyBonus(1)).toBe(2)
    expect(proficiencyBonus(10)).toBe(4)
    expect(proficiencyBonus(20)).toBe(6)
  })

  it('区分拥有与已装备，并保留数值来源', () => {
    const result = deriveCharacter(draft)
    expect(result.abilities.str).toBe(17)
    expect(result.armorClass.value).toBe(19)
    expect(result.armorClass.sources.map((source) => source.id)).toEqual(['armor-base', 'shield', 'defense-style'])
    expect(result.attackBonus.value).toBe(7)
    expect(result.savingThrows.str.value).toBe(7)
    expect(result.savingThrows.dex.value).toBe(2)
    expect(result.skills['skill-athletics']?.value).toBe(7)
    expect(result.skills['skill-athletics']?.sources.some((source) => source.detail === '来自背景')).toBe(true)
  })

  it('applies arbitrary +2 and split +1/+1 timeline ability improvements', () => {
    const improvedDraft: CharacterDraft = {
      ...draft,
      selections: [
        ...draft.selections,
        { checkpointId: 'fighter-2014-asi-4', optionIds: ['asi-dex-2'], confirmedAt: draft.updatedAt },
        { checkpointId: 'fighter-2014-asi-6', optionIds: ['asi-int-cha'], confirmedAt: draft.updatedAt },
        { checkpointId: 'fighter-2014-asi-8', optionIds: ['asi-str-2'], confirmedAt: draft.updatedAt },
      ],
    }

    const result = deriveCharacter(improvedDraft)

    expect(result.abilities).toMatchObject({ str: 19, dex: 16, int: 9, cha: 11 })
    expect(result.attackBonus.value).toBe(8)
  })

  it('派生调查与自然技能的熟练加值', () => {
    const result = deriveCharacter({
      ...draft,
      backgroundSkillIds: ['skill-investigation', 'skill-nature'],
    })

    // 智力 8 → -1，10级熟练加值 +4
    expect(result.skills['skill-investigation']?.value).toBe(3)
    expect(result.skills['skill-nature']?.value).toBe(3)
    expect(result.skills['skill-investigation']?.sources.some((source) => source.detail === '来自背景')).toBe(true)
  })

  it('派生调查技能的专精加值', () => {
    const result = deriveCharacter({
      ...draft,
      classId: 'class-2014-rogue',
      backgroundSkillIds: ['skill-investigation'],
      selections: [
        { checkpointId: 'rogue-2014-expertise-1', optionIds: ['skill-investigation'], confirmedAt: draft.updatedAt },
      ],
    })

    // 智力 8 → -1，熟练 +4 再加专精 +4
    expect(result.skills['skill-investigation']?.value).toBe(7)
    expect(result.skills['skill-investigation']?.sources.some((source) => source.id === 'skill-investigation-expertise')).toBe(true)
  })
})
