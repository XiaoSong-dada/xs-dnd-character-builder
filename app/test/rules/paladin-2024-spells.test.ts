import { describe, expect, it } from 'vitest'

import { getAvailableSpells, getMaximumSpellLevel, getRequiredSpellCount, getSpellcastingConfig, validateSpellSelections } from '@/rules/spellcasting'
import { draft2024, emptySpellSelections } from '../fixtures/draft-2024'

/**
 * 缺陷回归（v1.14.2）：5e-2024 1 级圣武士第 8 步（法术）曾无法完成。
 *
 * 原因：`paladin-2024.ts` 的 `slotsByClassLevel` 首行为空、`maxSpellLevelByClassLevel[0] = 0`，
 * 而 `startsAtLevel: 1` 与准备数 2 要求必须选 2 个法术 → 候选池恒空 → 校验恒 false。
 * 这里从「候选池 → 选择 → 校验」走一遍真实数据链路。
 */
const paladinDraftAt = (targetLevel: number, preparedSpellIds: readonly string[] = []) =>
  draft2024({
    classId: 'class-2024-paladin',
    targetLevel,
    spellSelections: { ...emptySpellSelections(), preparedSpellIds: [...preparedSpellIds] },
  })

const paladinConfig2024 = () => {
  const config = getSpellcastingConfig({ classId: 'class-2024-paladin', enabledSourceIds: [], ruleset: '5e-2024' })
  if (!config) throw new Error('缺少圣武士施法配置')
  return config
}

const availableSpellIds = (targetLevel: number): readonly string[] =>
  getAvailableSpells(paladinDraftAt(targetLevel), paladinConfig2024())
    .filter((spell) => spell.level > 0)
    .map((spell) => spell.id)

describe('5e-2024 1 级圣武士法术步骤可完成', () => {
  it('1 级候选池含一环法术，最高环级为 1、需准备 2 个', () => {
    const config = paladinConfig2024()
    expect(getMaximumSpellLevel(config, 1)).toBe(1)
    expect(getRequiredSpellCount(paladinDraftAt(1), config)).toBe(2)
    const ids = availableSpellIds(1)
    expect(ids.length).toBeGreaterThanOrEqual(2)
  })

  it('恰好准备 2 个一环法术即通过校验', () => {
    const [first, second] = availableSpellIds(1)
    expect(validateSpellSelections(paladinDraftAt(1, [first!, second!]))).toBe(true)
  })

  it('少于或多于 2 个都不通过（不静默放过超量）', () => {
    const [first, , third] = availableSpellIds(1)
    expect(validateSpellSelections(paladinDraftAt(1, [first!]))).toBe(false)
    expect(validateSpellSelections(paladinDraftAt(1))).toBe(false)
    if (third) expect(validateSpellSelections(paladinDraftAt(1, [first!, third, third]))).toBe(false)
  })

  it('6 级准备数按职业表为 6：7 个旧上限会判失败', () => {
    const config = paladinConfig2024()
    expect(getRequiredSpellCount(paladinDraftAt(6), config)).toBe(6)
    const ids = availableSpellIds(6)
    expect(ids.length).toBeGreaterThanOrEqual(7)
    expect(validateSpellSelections(paladinDraftAt(6, ids.slice(0, 6)))).toBe(true)
    expect(validateSpellSelections(paladinDraftAt(6, ids.slice(0, 7)))).toBe(false)
  })

  it('2024 1 级游侠同样可完成（同类缺陷）', () => {
    const config = getSpellcastingConfig({ classId: 'class-2024-ranger', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少游侠施法配置')
    const draft = draft2024({ classId: 'class-2024-ranger', targetLevel: 1 })
    const ids = getAvailableSpells(draft, config).filter((spell) => spell.level > 0).map((spell) => spell.id)
    expect(ids.length).toBeGreaterThanOrEqual(2)
    expect(validateSpellSelections({
      ...draft,
      spellSelections: { ...emptySpellSelections(), preparedSpellIds: [ids[0]!, ids[1]!] },
    })).toBe(true)
  })
})
