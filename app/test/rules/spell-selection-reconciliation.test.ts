import { describe, expect, it } from 'vitest'

import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import {
  deleteInactiveSpellSelection,
  getInactiveSpellRestoreStatus,
  reconcileSpellSelections,
  restoreInactiveSpellSelection,
} from '@/rules/spell-selection-reconciliation'
import { getAvailableSpells, getRequiredSpellCount, getSpellcastingConfig } from '@/rules/spellcasting'
import { EMPTY_CURRENCY } from '@/rules/starting-equipment'
import type { CharacterDraft, RulesetId } from '@/types/character'

function draftFor(ruleset: RulesetId, classId: string, targetLevel: number): CharacterDraft {
  return {
    schemaVersion: 9,
    id: `reconcile-${ruleset}`,
    ruleset,
    createdAt: '',
    updatedAt: '',
    targetLevel,
    abilityMethod: 'standard-array',
    enabledSourceIds: [],
    classId,
    raceAbilityChoices: [],
    backgroundSkillIds: [],
    backgroundToolIds: [],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    infusionAssignments: [],
    currency: EMPTY_CURRENCY,
    adventureGold: 0,
    equipmentNeedsReview: false,
    spellSelections: {
      cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [],
      transcribedSpellIds: [], spellbookExtraSpellIds: [], spellbookReservedSpellIds: [],
    },
    inactiveSpellSelections: [],
    manualEdits: EMPTY_MANUAL_EDITS,
    name: '协调测试',
    alignment: '',
    notes: '',
    currentStep: 'spells',
  }
}

describe('法术选择协调', () => {
  it('更换职业时把职业法术各集合移入停用记录，而非直接丢失', () => {
    const draft = {
      ...draftFor('5e-2014', 'class-2014-wizard', 5),
      spellSelections: {
        cantripIds: ['spell-2014-fire-bolt'],
        knownSpellIds: [],
        preparedSpellIds: ['spell-2014-magic-missile'],
        spellbookSpellIds: ['spell-2014-magic-missile'],
        transcribedSpellIds: ['spell-2014-magic-missile'],
        spellbookExtraSpellIds: [],
        spellbookReservedSpellIds: [],
      },
    } satisfies CharacterDraft
    const result = reconcileSpellSelections(draft, {
      nextClassId: 'class-2014-fighter',
      nextTargetLevel: 5,
      reason: 'class-changed',
      invalidatedAt: '2026-09-29T01:00:00.000Z',
    })

    expect(result.spellSelections.cantripIds).toEqual([])
    expect(result.spellSelections.spellbookSpellIds).toEqual([])
    expect(result.archived.map((item) => item.originalBucket)).toEqual([
      'cantripIds', 'preparedSpellIds', 'spellbookSpellIds', 'transcribedSpellIds',
    ])
    expect(result.archived.every((item) => item.reason === 'class-changed')).toBe(true)
  })

  it.each([
    ['5e-2014', 'class-2014-wizard'],
    ['5e-2024', 'class-2024-wizard'],
  ] as const)('%s 降级时只停用超过新环级的法术', (ruleset, classId) => {
    const highDraft = draftFor(ruleset, classId, 5)
    const config = getSpellcastingConfig(highDraft)
    if (!config) throw new Error('missing wizard config')
    const available = getAvailableSpells(highDraft, config)
    const low = available.find((spell) => spell.level === 1)
    const high = available.find((spell) => spell.level === 3)
    if (!low || !high) throw new Error('missing spell fixture')
    const draft: CharacterDraft = {
      ...highDraft,
      spellSelections: {
        ...highDraft.spellSelections,
        spellbookSpellIds: [low.id, high.id],
        preparedSpellIds: [low.id, high.id],
      },
    }
    const result = reconcileSpellSelections(draft, {
      nextClassId: classId,
      nextTargetLevel: 1,
      reason: 'level-reduced',
      invalidatedAt: '2026-09-29T01:00:00.000Z',
    })

    expect(result.spellSelections.spellbookSpellIds).toEqual([low.id])
    expect(result.spellSelections.preparedSpellIds).toEqual([low.id])
    expect(result.archived.filter((item) => item.spellId === high.id).map((item) => item.originalBucket).sort())
      .toEqual(['preparedSpellIds', 'spellbookSpellIds'])
  })

  it('准备施法职业降级时停用高环准备法术并保留低环选择', () => {
    const highDraft = draftFor('5e-2014', 'class-2014-cleric', 5)
    const config = getSpellcastingConfig(highDraft)
    if (!config) throw new Error('missing cleric config')
    const available = getAvailableSpells(highDraft, config)
    const low = available.find((spell) => spell.level === 1)
    const high = available.find((spell) => spell.level === 3)
    if (!low || !high) throw new Error('missing spell fixture')
    const draft: CharacterDraft = {
      ...highDraft,
      spellSelections: {
        ...highDraft.spellSelections,
        preparedSpellIds: [low.id, high.id],
      },
    }
    const result = reconcileSpellSelections(draft, {
      nextClassId: draft.classId,
      nextTargetLevel: 1,
      reason: 'level-reduced',
      invalidatedAt: '2026-09-29T01:00:00.000Z',
    })

    expect(result.spellSelections.preparedSpellIds).toEqual([low.id])
    expect(result.archived.map((item) => [item.spellId, item.originalBucket])).toEqual([
      [high.id, 'preparedSpellIds'],
    ])
  })

  it('降级后仍合法但超出数量的已知法术保持有效，交给用户选择归档', () => {
    const highDraft = draftFor('5e-2014', 'class-2014-bard', 5)
    const lowDraft = { ...highDraft, targetLevel: 1 }
    const config = getSpellcastingConfig(lowDraft)
    if (!config) throw new Error('missing bard config')
    const required = getRequiredSpellCount(lowDraft, config)
    const lowLevelIds = getAvailableSpells(lowDraft, config)
      .filter((spell) => spell.level === 1)
      .slice(0, required + 1)
      .map((spell) => spell.id)
    const draft: CharacterDraft = {
      ...highDraft,
      spellSelections: { ...highDraft.spellSelections, knownSpellIds: lowLevelIds },
    }
    const result = reconcileSpellSelections(draft, {
      nextClassId: draft.classId,
      nextTargetLevel: 1,
      reason: 'level-reduced',
      invalidatedAt: '2026-09-29T01:00:00.000Z',
    })
    expect(result.spellSelections.knownSpellIds).toEqual(lowLevelIds)
    expect(result.archived).toEqual([])
  })

  it('重新满足等级与名额后可显式恢复，并可单独删除历史', () => {
    const highDraft = draftFor('5e-2014', 'class-2014-bard', 5)
    const config = getSpellcastingConfig(highDraft)
    if (!config) throw new Error('missing bard config')
    const highSpell = getAvailableSpells(highDraft, config).find((spell) => spell.level === 3)
    if (!highSpell) throw new Error('missing high spell')
    const archived = reconcileSpellSelections({
      ...highDraft,
      spellSelections: { ...highDraft.spellSelections, knownSpellIds: [highSpell.id] },
    }, {
      nextClassId: highDraft.classId,
      nextTargetLevel: 1,
      reason: 'level-reduced',
      invalidatedAt: '2026-09-29T01:00:00.000Z',
    })
    const entry = archived.archived[0]
    if (!entry) throw new Error('missing inactive spell')
    const upgraded: CharacterDraft = {
      ...highDraft,
      spellSelections: archived.spellSelections,
      inactiveSpellSelections: archived.inactiveSpellSelections,
    }

    expect(getInactiveSpellRestoreStatus(upgraded, entry).available).toBe(true)
    const restored = restoreInactiveSpellSelection(upgraded, entry.id)
    expect(restored?.spellSelections.knownSpellIds).toContain(highSpell.id)
    expect(restored?.inactiveSpellSelections).toEqual([])
    expect(deleteInactiveSpellSelection(upgraded, entry.id)).toEqual([])
  })
})
