import { describe, expect, it } from 'vitest'

import { HALF_CASTER_PREPARED_2024, HALF_CASTER_SPELL_SLOTS_2024, halfCasterMaximumSpellLevels2024 } from '@/rules/data/spell-slots-2024'
import { HALF_CASTER_SPELL_SLOTS, halfCasterMaximumSpellLevels } from '@/rules/data/spell-slots-2014'
import { paladinRule2024 } from '@/rules/data/paladin-2024'
import { rangerRule2024 } from '@/rules/data/ranger-2024'
import { artificerRule2024 } from '@/rules/data/ua-artificer-2024'

/**
 * 缺陷回归（v1.14.2）：2024 半施法者 1 级起即有法术位。
 *
 * 曾经 `paladin-2024.ts` / `ranger-2024.ts` 各自复制了一份 2014 半施法者表（首行为空），
 * 而 `startsAtLevel: 1` 与准备数 2 又要求 1 级选法术 → 第 8 步候选池被「最高 0 环」清空，流程卡死。
 * 本文件锁定「单一来源」与「与 2014 表的差异」，防止再次分叉。
 */
describe('2024 半施法者法术位表', () => {
  it('20 级法术位表：1 级起即有 2 个一环法术位，最高到五环', () => {
    expect(HALF_CASTER_SPELL_SLOTS_2024).toHaveLength(20)
    expect(HALF_CASTER_SPELL_SLOTS_2024[0]).toEqual([2])
    expect(HALF_CASTER_SPELL_SLOTS_2024[1]).toEqual([2])
    expect(HALF_CASTER_SPELL_SLOTS_2024[4]).toEqual([4, 2])
    expect(HALF_CASTER_SPELL_SLOTS_2024[19]).toEqual([4, 3, 3, 3, 2])
    expect(HALF_CASTER_SPELL_SLOTS_2024.every((slots) => slots.length >= 1 && slots.length <= 5)).toBe(true)
  })

  it('准备数量逐格对齐职业表（6 级 6、9 级 9、17 级 14、20 级 15）', () => {
    expect(HALF_CASTER_PREPARED_2024).toHaveLength(20)
    expect(HALF_CASTER_PREPARED_2024[0]).toBe(2)
    expect(HALF_CASTER_PREPARED_2024[5]).toBe(6)
    expect(HALF_CASTER_PREPARED_2024[8]).toBe(9)
    expect(HALF_CASTER_PREPARED_2024[16]).toBe(14)
    expect(HALF_CASTER_PREPARED_2024[19]).toBe(15)
    expect([...HALF_CASTER_PREPARED_2024]).toEqual([2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15])
  })

  it('最高施法环级由法术位表长度派生，不另存手写数组', () => {
    expect(halfCasterMaximumSpellLevels2024).toEqual(HALF_CASTER_SPELL_SLOTS_2024.map((slots) => slots.length))
    expect(halfCasterMaximumSpellLevels2024[0]).toBe(1)
    expect(halfCasterMaximumSpellLevels2024[19]).toBe(5)
  })

  it('与 2014 半施法者表的关键差异：1 级有环位', () => {
    expect(HALF_CASTER_SPELL_SLOTS[0]).toEqual([])
    expect(HALF_CASTER_SPELL_SLOTS_2024[0]).toEqual([2])
    expect(halfCasterMaximumSpellLevels[0]).toBe(0)
    expect(halfCasterMaximumSpellLevels2024[0]).toBe(1)
    // 2 级起两者数值相同（2024 表整体上移一级）。
    expect(HALF_CASTER_SPELL_SLOTS_2024.slice(1)).toEqual(HALF_CASTER_SPELL_SLOTS.slice(1).map((slots) => [...slots]))
  })

  it('圣武士、游侠、UA 奇械师引用同一份常量（单一来源）', () => {
    for (const rule of [paladinRule2024, rangerRule2024, artificerRule2024]) {
      expect(rule.spellcasting?.slotsByClassLevel).toBe(HALF_CASTER_SPELL_SLOTS_2024)
      expect(rule.spellcasting?.preparedCountByLevel).toBe(HALF_CASTER_PREPARED_2024)
      expect(rule.spellcasting?.maxSpellLevelByClassLevel).toBe(halfCasterMaximumSpellLevels2024)
      expect(rule.spellcasting?.startsAtLevel).toBe(1)
    }
  })
})
