import { describe, expect, it } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import {
  TRANSCRIBE_COST_PER_LEVEL,
  TRANSCRIBE_HOURS_PER_LEVEL,
  applyTranscription,
  canAffordTranscription,
  getTranscribeCandidates,
  getTranscribeCost,
  getTranscribeTotalCost,
} from '@/rules/spellbook'
import { getSpellcastingConfig } from '@/rules/spellcasting'
import type { CharacterDraft } from '@/types/character'

function wizardDraft(patch: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    schemaVersion: 4,
    id: 'spellbook-test',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 5,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-wizard',
    raceId: 'race-2014-human',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-acolyte',
    backgroundSkillIds: ['skill-insight', 'skill-religion'],
    backgroundToolIds: [],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 100, pp: 0 },
    adventureGold: 50,
    equipmentNeedsReview: false,
    spellSelections: {
      cantripIds: ['spell-2014-fire-bolt', 'spell-2014-mage-hand', 'spell-2014-ray-of-frost'],
      knownSpellIds: [],
      preparedSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield'],
      spellbookSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield'],
      transcribedSpellIds: [],
    },
    name: '抄录测试',
    alignment: '',
    notes: '',
    currentStep: 'sheet',
    ...patch,
  }
}

function wizardConfig() {
  return getSpellcastingConfig(wizardDraft())
}

describe('2014 法师抄录法术书', () => {
  it('抄录费用 = 环级 × 50 GP（1/3/9 环）', () => {
    expect(TRANSCRIBE_COST_PER_LEVEL).toBe(50)
    expect(TRANSCRIBE_HOURS_PER_LEVEL).toBe(2)
    expect(getTranscribeCost(1)).toBe(50)
    expect(getTranscribeCost(3)).toBe(150)
    expect(getTranscribeCost(9)).toBe(450)
  })

  it('多选合计 = 各环级费用之和', () => {
    expect(getTranscribeTotalCost(['spell-2014-magic-missile', 'spell-2014-scorching-ray'])).toBe(150)
  })

  it('候选池 = 职业池 1 环起、≤ 当前最高环、未入书；不含戏法且无重复', () => {
    const config = wizardConfig()
    const candidates = getTranscribeCandidates(wizardDraft(), config!)
    expect(candidates.length).toBeGreaterThan(0)
    expect(candidates.every((spell) => spell.level >= 1 && spell.level <= 3)).toBe(true)
    expect(candidates.every((spell) => spell.classIds.includes('class-2014-wizard'))).toBe(true)
    const ids = candidates.map((spell) => spell.id)
    expect(new Set(ids).size).toBe(ids.length)
    // 已入书法术不在候选
    expect(ids).not.toContain('spell-2014-magic-missile')
    expect(ids).not.toContain('spell-2014-shield')
    // 戏法不在候选
    expect(candidates.every((spell) => spell.level > 0)).toBe(true)
  })

  it('金币校验：不足拒绝并给中文原因；充足与恰好（余额 0）放行', () => {
    const config = wizardConfig()
    const poor = canAffordTranscription(wizardDraft({ currency: { cp: 0, sp: 0, ep: 0, gp: 100, pp: 0 }, adventureGold: 0 }), 150)
    expect(poor.ok).toBe(false)
    expect(poor.reason ?? '').toContain('金币不足')

    const enough = canAffordTranscription(wizardDraft(), 150)
    expect(enough.ok).toBe(true)

    const exact = canAffordTranscription(wizardDraft({ currency: { cp: 0, sp: 0, ep: 0, gp: 100, pp: 0 }, adventureGold: 50 }), 150)
    expect(exact.ok).toBe(true)
    void config
  })

  it('抄录应用：法术入书、记录转录、正确扣款，且不修改原草稿（纯函数）', () => {
    const draft = wizardDraft()
    const result = applyTranscription(draft, ['spell-2014-fireball'])
    expect(result.spellSelections.spellbookSpellIds).toContain('spell-2014-fireball')
    expect(result.spellSelections.transcribedSpellIds).toEqual(['spell-2014-fireball'])
    expect(result.adventureGold).toBe(50 - 150)
    expect(result.cost).toBe(150)
    // 原草稿未被修改
    expect(draft.spellSelections.spellbookSpellIds).not.toContain('spell-2014-fireball')
    expect(draft.spellSelections.transcribedSpellIds).toEqual([])
    expect(draft.adventureGold).toBe(50)
  })

  it('重复抄录同一法术被去重；非候选（已在书中/职业池外）ID 不生效', () => {
    const draft = wizardDraft()
    const once = applyTranscription(draft, ['spell-2014-fireball'])
    const twice = applyTranscription({ ...once.spellSelections ? wizardDraft({ ...draft, spellSelections: once.spellSelections, adventureGold: once.adventureGold }) : draft }, ['spell-2014-fireball'])
    expect(twice.spellSelections.spellbookSpellIds.filter((id) => id === 'spell-2014-fireball')).toHaveLength(1)
    expect(twice.spellSelections.transcribedSpellIds.filter((id) => id === 'spell-2014-fireball')).toHaveLength(1)
    expect(twice.adventureGold).toBe(once.adventureGold)

    const invalid = applyTranscription(draft, ['spell-2014-magic-missile', 'spell-2014-cure-wounds'])
    expect(invalid.spellSelections.spellbookSpellIds).toEqual(['spell-2014-magic-missile', 'spell-2014-shield'])
    expect(invalid.spellSelections.transcribedSpellIds).toEqual([])
    expect(invalid.adventureGold).toBe(50)
  })
})
