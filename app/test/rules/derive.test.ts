import { describe, expect, it } from 'vitest'

import { abilityModifier, deriveCharacter, proficiencyBonus } from '@/rules/derive'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import type { CharacterDraft } from '@/types/character'

const draft: CharacterDraft = {
  schemaVersion: 6,
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
  adventureGold: 0,
  equipmentNeedsReview: false,
  spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
  manualEdits: EMPTY_MANUAL_EDITS,
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

  it('种族技能熟练进入派生且来源可解释（精灵察觉、子种族继承）', () => {
    const elf: CharacterDraft = {
      ...draft,
      raceId: 'race-2014-elf',
      subraceId: 'race-2014-elf-high',
      backgroundSkillIds: ['skill-history'],
    }
    const derived = deriveCharacter(elf)
    const perception = derived.skills['skill-perception']
    // 感知 12 → +1，10 级熟练 +4。
    expect(perception?.value).toBe(5)
    expect(perception?.sources.some((source) => source.detail === '来自种族')).toBe(true)
    // 子种族继承父种族熟练：高等精灵仍拥有精灵的察觉。
    expect(perception?.sources.some((source) => source.id === 'skill-perception-proficiency')).toBe(true)
  })

  it('半兽人种族威吓与背景重叠时只加一次熟练', () => {
    // draft 为半兽人且背景已含威吓与运动。
    const derived = deriveCharacter(draft)
    const intimidation = derived.skills['skill-intimidation']
    // 魅力 10 → +0，熟练 +4，只加一次（不因种族+背景双来源叠加）。
    expect(intimidation?.value).toBe(4)
    expect(intimidation?.sources.filter((source) => source.label === '技能熟练')).toHaveLength(1)
  })

  it('半精灵自选技能熟练生效，工具选择不影响数值', () => {
    const halfElf: CharacterDraft = {
      ...draft,
      raceId: 'race-2014-half-elf',
      subraceId: undefined,
      raceSkillChoices: ['skill-deception', 'skill-persuasion'],
      raceToolChoice: 'tool-thieves-tools',
    }
    const derived = deriveCharacter(halfElf)
    // 半精灵魅力 +2 → 12 → 调整 +1，10 级熟练 +4。
    expect(derived.skills['skill-deception']?.value).toBe(5)
    expect(derived.skills['skill-persuasion']?.value).toBe(5)
    expect(derived.skills['skill-deception']?.sources.some((source) => source.detail === '来自种族')).toBe(true)
    // 工具选择不改变攻击等任何数值。
    expect(derived.attackBonus.value).toBe(proficiencyBonus(10) + 2)
  })

  it('先重算上游属性与熟练，再叠加下游人工差值', () => {
    const edited = deriveCharacter({
      ...draft,
      backgroundSkillIds: ['skill-investigation', 'skill-perception'],
      manualEdits: {
        ...EMPTY_MANUAL_EDITS,
        abilityAdjustments: { int: 4 },
        proficiencyBonusAdjustment: 1,
        derivedAdjustments: { armorClass: 2, passivePerception: 3 },
        savingThrowAdjustments: { int: 2 },
        skillAdjustments: { 'skill-investigation': -1 },
      },
    })

    expect(edited.abilities.int).toBe(12)
    // 调查：智力 +1、熟练 +5，再叠加人工 -1。
    expect(edited.skills['skill-investigation']?.value).toBe(5)
    expect(edited.savingThrows.int.value).toBe(3)
    expect(edited.armorClass.value).toBe(21)
    // 察觉 +6（感知 +1、人工熟练 +5），被动 16，再叠加人工 +3。
    expect(edited.passivePerception.value).toBe(19)
    expect(edited.armorClass.sources.some((source) => source.label === '人工调整')).toBe(true)
  })

  it('下游差值在系统基线改变后保持不变而不重复累计', () => {
    const manualEdits = { ...EMPTY_MANUAL_EDITS, derivedAdjustments: { armorClass: 2 } }
    expect(deriveCharacter({ ...draft, manualEdits }).armorClass.value).toBe(21)

    const withoutShield = {
      ...draft,
      inventory: draft.inventory.map((entry) => entry.itemId === 'shield' ? { ...entry, equippedQuantity: 0 } : entry),
      manualEdits,
    }
    expect(deriveCharacter(withoutShield).armorClass.value).toBe(19)
    expect(deriveCharacter(withoutShield).armorClass.value).toBe(19)
  })
})
