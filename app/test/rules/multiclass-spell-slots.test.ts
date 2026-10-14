import { describe, expect, it } from 'vitest'

import {
  getEffectiveSpellSlots,
  getMulticlassSpellSlots,
  getMulticlassSpellcastingLevel,
} from '@/rules/spellcasting'
import { MULTICAST_SPELL_SLOTS, getMulticlassSlotRow } from '@/rules/data/multiclass-spell-slots-2014'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft } from '@/types/character'
import type { ClassLevelEntry } from '@/types/multiclass'

const ABILITIES: AbilityScores = { str: 15, dex: 14, con: 13, int: 13, wis: 13, cha: 13 }

function mc(classes: readonly ClassLevelEntry[], overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  const order = classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  return draft2024({
    ruleset: '5e-2014',
    baseAbilities: ABILITIES,
    classId: classes[0]?.classId,
    targetLevel: order.length,
    multiclass: { enabled: true, primaryClassId: classes[0]?.classId ?? '', classes, levelOrder: order },
    ...overrides,
  })
}

function slots(entries: readonly { readonly level: number; readonly count: number; readonly pact?: boolean }[]): string {
  return entries.map((slot) => `${slot.level}:${slot.count}${slot.pact ? 'p' : ''}`).join(',')
}

describe('MC-D01 兼职施法者法术位表', () => {
  it('表为 20 行 × 9 环，且与不全书逐行一致（抽点核对）', () => {
    expect(MULTICAST_SPELL_SLOTS).toHaveLength(20)
    expect(MULTICAST_SPELL_SLOTS.every((row) => row.length === 9)).toBe(true)
    expect(getMulticlassSlotRow(1)).toEqual([2, 0, 0, 0, 0, 0, 0, 0, 0])
    expect(getMulticlassSlotRow(3)).toEqual([4, 2, 0, 0, 0, 0, 0, 0, 0])
    expect(getMulticlassSlotRow(5)).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0])
    expect(getMulticlassSlotRow(9)).toEqual([4, 3, 3, 3, 1, 0, 0, 0, 0])
    expect(getMulticlassSlotRow(11)).toEqual([4, 3, 3, 3, 2, 1, 0, 0, 0])
    expect(getMulticlassSlotRow(17)).toEqual([4, 3, 3, 3, 2, 1, 1, 1, 1])
    expect(getMulticlassSlotRow(20)).toEqual([4, 3, 3, 3, 3, 2, 2, 1, 1])
  })

  it('越界施法等级返回空行', () => {
    expect(getMulticlassSlotRow(0)).toEqual([])
    expect(getMulticlassSlotRow(21)).toEqual([])
    expect(getMulticlassSlotRow(Number.NaN)).toEqual([])
  })

  it('表值单调不降（每个环级的法术位随施法等级只增不减）', () => {
    for (let level = 2; level <= 20; level += 1) {
      const previous = getMulticlassSlotRow(level - 1)
      const current = getMulticlassSlotRow(level)
      for (let index = 0; index < 9; index += 1) {
        expect(current[index] ?? 0, `施法等级 ${level} 第 ${index + 1} 环`).toBeGreaterThanOrEqual(previous[index] ?? 0)
      }
    }
  })
})

describe('MC-D01 施法等级累加', () => {
  it('全施法者全额相加：法师5/术士3 → 8', () => {
    const result = getMulticlassSpellcastingLevel(mc([
      { classId: 'class-2014-wizard', level: 5 },
      { classId: 'class-2014-sorcerer', level: 3 },
    ]))
    expect(result.casterLevel).toBe(8)
    expect(result.contributions.every((item) => item.weight === 'full')).toBe(true)
  })

  it('半施法者除以 2 向下取整：游侠4/术士3 → 2 + 3 = 5', () => {
    const result = getMulticlassSpellcastingLevel(mc([
      { classId: 'class-2014-ranger', level: 4 },
      { classId: 'class-2014-sorcerer', level: 3 },
    ]))
    expect(result.casterLevel).toBe(5)
    expect(result.contributions.find((item) => item.classId === 'class-2014-ranger')).toMatchObject({ weight: 'half', value: 2 })
    expect(result.contributions.find((item) => item.classId === 'class-2014-sorcerer')).toMatchObject({ weight: 'full', value: 3 })
  })

  it('半施法者奇数等级向下取整（D1）：圣武士5 → 2，而不是 3', () => {
    const result = getMulticlassSpellcastingLevel(mc([
      { classId: 'class-2014-paladin', level: 5 },
      { classId: 'class-2014-wizard', level: 1 },
    ]))
    expect(result.contributions.find((item) => item.classId === 'class-2014-paladin')?.value).toBe(2)
    expect(result.casterLevel).toBe(3)
  })

  it('2024 半施法者同样向下取整（D1）：圣武士1/法师1 → 0 + 1 = 1', () => {
    const draft = mc(
      [{ classId: 'class-2024-paladin', level: 1 }, { classId: 'class-2024-wizard', level: 1 }],
      { ruleset: '5e-2024' },
    )
    const result = getMulticlassSpellcastingLevel(draft)
    expect(result.casterLevel).toBe(1)
    expect(result.contributions.some((item) => item.classId === 'class-2024-paladin')).toBe(false)
  })

  it('1/3 施法子职：战士3（奥法骑士）/法师5 → 1 + 5 = 6', () => {
    const result = getMulticlassSpellcastingLevel(mc([
      { classId: 'class-2014-fighter', level: 3, subclassId: 'subclass-2014-fighter-eldritch-knight' },
      { classId: 'class-2014-wizard', level: 5 },
    ]))
    expect(result.contributions.find((item) => item.classId === 'class-2014-fighter')).toMatchObject({ weight: 'third', value: 1 })
    expect(result.casterLevel).toBe(6)
  })

  it('未选 1/3 施法子职的战士不贡献施法等级', () => {
    const result = getMulticlassSpellcastingLevel(mc([
      { classId: 'class-2014-fighter', level: 6, subclassId: 'subclass-2014-fighter-champion' },
      { classId: 'class-2014-wizard', level: 4 },
    ]))
    expect(result.contributions.some((item) => item.classId === 'class-2014-fighter')).toBe(false)
    expect(result.casterLevel).toBe(4)
  })

  it('纯非施法兼职：战士3/游荡者2 → 施法等级 0', () => {
    const result = getMulticlassSpellcastingLevel(mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ]))
    expect(result.casterLevel).toBe(0)
    expect(result.contributions).toEqual([])
  })

  it('魔契师走契约魔法，不并入通用池', () => {
    const result = getMulticlassSpellcastingLevel(mc([
      { classId: 'class-2014-warlock', level: 3 },
      { classId: 'class-2014-fighter', level: 2 },
    ]))
    expect(result.casterLevel).toBe(0)
    expect(result.pactClassId).toBe('class-2014-warlock')
    expect(result.pactCasterLevel).toBe(3)
  })

  it('奇械师按半施法者计（向上取整的职业表口径不适用于兼职通用池）', () => {
    const result = getMulticlassSpellcastingLevel(mc([
      { classId: 'class-2014-artificer', level: 5 },
      { classId: 'class-2014-wizard', level: 1 },
    ]))
    expect(result.contributions.find((item) => item.classId === 'class-2014-artificer')).toMatchObject({ weight: 'half', value: 2 })
  })
})

describe('MC-D01 法术位池', () => {
  it('成功标准：游侠4/术士3 → 施法等级 5 → 4/3/2', () => {
    const draft = mc([
      { classId: 'class-2014-ranger', level: 4 },
      { classId: 'class-2014-sorcerer', level: 3 },
    ])
    expect(slots(getMulticlassSpellSlots(draft))).toBe('1:4,2:3,3:2')
    expect(slots(getEffectiveSpellSlots(draft))).toBe('1:4,2:3,3:2')
  })

  it('纯非施法兼职没有法术位', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    expect(getMulticlassSpellSlots(draft)).toEqual([])
    expect(getEffectiveSpellSlots(draft)).toEqual([])
  })

  it('契约池与通用池并存：魔契师3/法师5 → 通用 4/3/2（施法等级 5）+ 契约 2 个 2 环', () => {
    const draft = mc([
      { classId: 'class-2014-warlock', level: 3 },
      { classId: 'class-2014-wizard', level: 5 },
    ])
    const result = getMulticlassSpellSlots(draft)
    expect(slots(result)).toBe('1:4,2:3,3:2,2:2p')
  })

  it('只有魔契师时通用池为空，只剩契约池', () => {
    const draft = mc([
      { classId: 'class-2014-warlock', level: 5 },
      { classId: 'class-2014-rogue', level: 1 },
    ])
    expect(slots(getMulticlassSpellSlots(draft))).toBe('3:2p')
  })

  it('人工环位差值仍生效', () => {
    const draft = mc([
      { classId: 'class-2014-ranger', level: 4 },
      { classId: 'class-2014-sorcerer', level: 3 },
    ], {
      manualEdits: {
        abilityAdjustments: {}, proficiencyBonusAdjustment: 0, derivedAdjustments: {},
        savingThrowAdjustments: {}, skillAdjustments: {}, spellSlotAdjustments: { 1: 1 },
        addedSpells: [], addedFeats: [],
      },
    })
    expect(slots(getEffectiveSpellSlots(draft))).toBe('1:5,2:3,3:2')
  })
})

describe('MC-D01 单职业行为不变', () => {
  it('单职业法师仍使用法师自己的法术位表（不走兼职表）', () => {
    const solo = draft2024({ ruleset: '5e-2014', baseAbilities: ABILITIES, classId: 'class-2014-wizard', targetLevel: 5 })
    expect(slots(getEffectiveSpellSlots(solo))).toBe('1:4,2:3,3:2')
  })

  it('单职业游侠 5 级仍按游侠表（2 个 1 环 + 2 个 2 环），与兼职表口径不同', () => {
    const solo = draft2024({ ruleset: '5e-2014', baseAbilities: ABILITIES, classId: 'class-2014-ranger', targetLevel: 5 })
    expect(slots(getEffectiveSpellSlots(solo))).toBe('1:4,2:2')
  })

  it('单职业战契师仍是契约池', () => {
    const solo = draft2024({ ruleset: '5e-2014', baseAbilities: ABILITIES, classId: 'class-2014-warlock', targetLevel: 3 })
    expect(slots(getEffectiveSpellSlots(solo))).toBe('2:2p')
  })

  it('2024 单职业行为同样不变', () => {
    const solo = draft2024({ ruleset: '5e-2024', baseAbilities: ABILITIES, classId: 'class-2024-wizard', targetLevel: 5 })
    expect(getEffectiveSpellSlots(solo).length).toBeGreaterThan(0)
  })
})
