import { describe, expect, it } from 'vitest'

import {
  adjustmentForEnteredValue,
  hasManualEdits,
  normalizeManualEdits,
  setRecordAdjustment,
} from '@/rules/manual-edits'

describe('manual-edits', () => {
  it('只保留合法整数、字段、环级与法术目标，并按法术 ID 去重', () => {
    const edits = normalizeManualEdits({
      abilityAdjustments: { int: 4, nope: 2, wis: 1.5 },
      proficiencyBonusAdjustment: Number.NaN,
      derivedAdjustments: { armorClass: 2, nope: 3 },
      savingThrowAdjustments: { dex: -1, nope: 5 },
      skillAdjustments: { 'skill-perception': 3, bad: 1.2 },
      spellSlotAdjustments: { 0: 4, 1: 2, 9: -1, 10: 3 },
      addedSpells: [
        { spellId: 'spell-a', destination: 'known', prepared: false },
        { spellId: 'spell-a', destination: 'spellbook', prepared: true },
        { spellId: 'spell-b', destination: 'invalid', prepared: true },
      ],
      addedFeats: [
        { instanceId: 'manual-feat-1', featId: 'feat-2024-alert', addedAt: '2026-09-29T00:00:00.000Z', note: '  DM 奖励  ' },
        { instanceId: 'manual-feat-1', featId: 'feat-2024-tough', addedAt: '2026-09-29T00:00:00.000Z' },
        { instanceId: '', featId: 'feat-2024-skilled', addedAt: '2026-09-29T00:00:00.000Z' },
      ],
    })

    expect(edits.abilityAdjustments).toEqual({ int: 4 })
    expect(edits.proficiencyBonusAdjustment).toBe(0)
    expect(edits.derivedAdjustments).toEqual({ armorClass: 2 })
    expect(edits.savingThrowAdjustments).toEqual({ dex: -1 })
    expect(edits.skillAdjustments).toEqual({ 'skill-perception': 3 })
    expect(edits.spellSlotAdjustments).toEqual({ 1: 2, 9: -1 })
    expect(edits.addedSpells).toEqual([{ spellId: 'spell-a', destination: 'known', prepared: false }])
    expect(edits.addedFeats).toEqual([{
      instanceId: 'manual-feat-1',
      featId: 'feat-2024-alert',
      addedAt: '2026-09-29T00:00:00.000Z',
      note: 'DM 奖励',
    }])
    expect(hasManualEdits(edits)).toBe(true)
  })

  it('按当前无本字段人工差值的基线换算，并在差值为零时删除记录', () => {
    expect(adjustmentForEnteredValue(20, 18)).toBe(2)
    expect(setRecordAdjustment({ armorClass: 2 }, 'armorClass', 0)).toEqual({})
  })
})
