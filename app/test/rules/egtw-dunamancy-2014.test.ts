import { describe, expect, it } from 'vitest'

import { spells2014 } from '@/rules/data/spells-2014'
import { rulesRepository } from '@/rules/repository'
import { getAvailableSpells, getSpellcastingConfig } from '@/rules/spellcasting'
import type { CharacterDraft } from '@/types/character'

/** S02：EGtW 秘迹学 15 条与时间魔法／重力法师两个法师子职。 */
const EGTW_SPELLS = [
  'Sapping Sting', 'Gift of Alacrity', 'Magnify Gravity', "Fortune's Favor", 'Immovable Object',
  'Wristpocket', 'Pulse Wave', 'Gravity Sinkhole', 'Temporal Shunt', 'Gravity Fissure',
  'Tether Essence', 'Dark Star', 'Reality Break', 'Ravenous Void', 'Time Ravage',
] as const

const SHARED = ['Sapping Sting', "Fortune's Favor", 'Immovable Object', 'Wristpocket', 'Pulse Wave', 'Tether Essence']
const CHRONURGY = [...SHARED, 'Gift of Alacrity', 'Temporal Shunt', 'Reality Break', 'Time Ravage']
const GRAVITURGY = [...SHARED, 'Magnify Gravity', 'Gravity Sinkhole', 'Gravity Fissure', 'Dark Star', 'Ravenous Void']

function wizardDraft(subclassId?: string, enabledSourceIds?: readonly string[]): CharacterDraft {
  return {
    schemaVersion: 4,
    id: 'egtw-dunamancy',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 20,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-wizard',
    ...(subclassId ? { subclassId } : {}),
    raceId: 'race-2014-human',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-acolyte',
    backgroundSkillIds: ['skill-insight', 'skill-religion'],
    backgroundToolIds: [],
    languages: ['language-elvish', 'language-dwarvish'],
    proficiencyReplacements: [],
    baseAbilities: { str: 10, dex: 10, con: 10, int: 20, wis: 10, cha: 10 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    ...(enabledSourceIds ? { enabledSourceIds } : {}),
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
    name: '秘迹学回归',
    alignment: '',
    notes: '',
    currentStep: 'spells',
  } as unknown as CharacterDraft
}

function availableNames(subclassId?: string, enabledSourceIds?: readonly string[]): readonly string[] {
  const draft = wizardDraft(subclassId, enabledSourceIds)
  const config = rulesRepository.getSpellcastingConfig(draft)
  expect(config).toBeTruthy()
  return getAvailableSpells(draft, config!).map((spell) => spell.englishName)
}

describe('EGtW 秘迹学与法师子职（S02）', () => {
  it('15 条法术已登记：classIds 为空、来源 egtw、摘要非空', () => {
    // S01 509 + S02 15 起；后续第三方批次继续追加。
    expect(spells2014.length).toBeGreaterThanOrEqual(524)
    for (const name of EGTW_SPELLS) {
      const spell = spells2014.find((item) => item.englishName === name)
      expect(spell, name).toBeTruthy()
      expect(spell?.classIds, name).toEqual([])
      expect(spell?.sourceIds, name).toEqual(['egtw-2020-index'])
      expect(spell?.description.length ?? 0, name).toBeGreaterThan(0)
    }
  })

  it('两个子职可选中且特性不再是 index-only', () => {
    for (const id of ['subclass-2014-wizard-chronurgy', 'subclass-2014-wizard-graviturgy']) {
      const subclass = rulesRepository.getSubclass(id)
      expect(subclass, id).toBeTruthy()
      expect(subclass?.status, id).not.toBe('index-only')
      expect(subclass?.features.length, id).toBeGreaterThan(0)
      expect(subclass?.features.some((feature) => feature.status === 'index-only'), id).toBe(false)
      expect(subclass?.spellbookSpellIds?.length ?? 0, id).toBeGreaterThan(0)
    }
  })

  it('时间魔法／重力法师分别获得 10／11 条秘迹学候选，未选子职不可见', () => {
    const chronurgy = availableNames('subclass-2014-wizard-chronurgy')
    const graviturgy = availableNames('subclass-2014-wizard-graviturgy')
    for (const name of CHRONURGY) expect(chronurgy, name).toContain(name)
    for (const name of GRAVITURGY) expect(graviturgy, name).toContain(name)
    const none = availableNames()
    for (const name of EGTW_SPELLS) expect(none, name).not.toContain(name)
    expect(chronurgy.filter((name) => EGTW_SPELLS.includes(name as (typeof EGTW_SPELLS)[number]))).toHaveLength(10)
    expect(graviturgy.filter((name) => EGTW_SPELLS.includes(name as (typeof EGTW_SPELLS)[number]))).toHaveLength(11)
  })

  it('关闭 egtw 来源时不进入候选', () => {
    const names = availableNames('subclass-2014-wizard-chronurgy', [])
    for (const name of EGTW_SPELLS) expect(names, name).not.toContain(name)
  })
})
