import { describe, expect, it } from 'vitest'

import { legacySpells2024 } from '@/rules/data/generated/spells-2024-legacy'
import { sources2024 } from '@/rules/data/sources-2024'
import { rulesRepository2024 } from '@/rules/repositories'
import { getDefaultEnabledSourceIds } from '@/rules/source-books'
import { getAvailableSpells } from '@/rules/spellcasting'
import type { CharacterDraft } from '@/types/character'

/** S04：2024 旧扩展附注层（10 个来源、128 条镜像）与 UA 跨职业合并。 */
const LEGACY_SOURCE_IDS = [
  'source-2024-legacy-xge',
  'source-2024-legacy-tce',
  'source-2024-legacy-ftd',
  'source-2024-legacy-scc',
  'source-2024-legacy-ai',
  'source-2024-legacy-bmt',
  'source-2024-legacy-aag',
  'source-2024-legacy-so',
  'source-2024-legacy-idrotf',
  'source-2024-legacy-llok',
] as const

function draft(classId: string, enabledSourceIds: readonly string[]): CharacterDraft {
  return {
    schemaVersion: 8,
    id: 'legacy-2024',
    ruleset: '5e-2024',
    createdAt: '',
    updatedAt: '',
    targetLevel: 20,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId,
    raceId: 'species-2024-human',
    backgroundId: 'background-2024-sage',
    backgroundAbilityAllocation: { int: 2, con: 1, wis: 0 },
    backgroundOriginFeatId: 'feat-2024-magic-initiate',
    backgroundSkillIds: ['skill-arcana', 'skill-history'],
    backgroundToolIds: [],
    languages: ['language-common', 'language-elvish'],
    proficiencyReplacements: [],
    baseAbilities: { str: 10, dex: 10, con: 10, int: 20, wis: 10, cha: 10 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    enabledSourceIds,
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
    name: '旧扩展回归',
    alignment: '',
    notes: '',
    currentStep: 'spells',
  } as unknown as CharacterDraft
}

function availableNames(classId: string, enabledSourceIds: readonly string[]): readonly string[] {
  const character = draft(classId, enabledSourceIds)
  const config = rulesRepository2024.getSpellcastingConfig(character)
  expect(config).toBeTruthy()
  return getAvailableSpells(character, config!).map((spell) => spell.englishName)
}

describe('2024 旧扩展层（S04）', () => {
  it('10 个旧扩展来源登记为 legacy 且默认关闭', () => {
    for (const id of LEGACY_SOURCE_IDS) {
      const source = sources2024.find((item) => item.id === id)
      expect(source, id).toBeTruthy()
      expect(source?.contentKind, id).toBe('legacy')
      expect(source?.selectable, id).toBe(true)
    }
    expect(getDefaultEnabledSourceIds('5e-2024')).toEqual([])
  })

  it('128 条镜像条目字段齐全且来源映射正确', () => {
    expect(legacySpells2024).toHaveLength(128)
    for (const spell of legacySpells2024) {
      expect(spell.id.startsWith('spell-2024-legacy-'), spell.id).toBe(true)
      expect(spell.ruleset, spell.id).toBe('5e-2024')
      expect(spell.description.trim().length, spell.id).toBeGreaterThan(0)
      expect(spell.classIds.every((id) => id.startsWith('class-2024-')), spell.id).toBe(true)
      expect(LEGACY_SOURCE_IDS, spell.id).toContain(spell.sourceIds[0])
    }
  })

  it('开启旧扩展来源后 2024 法师可选银光锐语，关闭时不可见', () => {
    const open = availableNames('class-2024-wizard', ['source-2024-legacy-scc'])
    expect(open).toContain('Silvery Barbs')
    const closed = availableNames('class-2024-wizard', [])
    expect(closed).not.toContain('Silvery Barbs')
  })

  it('UA 跨职业合并后核心职业可选对应法术', () => {
    const sorcererOpen = availableNames('class-2024-sorcerer', ['source-2024-ua-psion'])
    expect(sorcererOpen).toContain("Tasha's Mind Whip")
    const sorcererClosed = availableNames('class-2024-sorcerer', [])
    expect(sorcererClosed).not.toContain("Tasha's Mind Whip")
  })
})
