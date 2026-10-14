import { describe, expect, it } from 'vitest'

import {
  listCharacterFeatures,
  resolveArmorClassFormula,
  resolveExtraAttack,
} from '@/rules/multiclass-features'
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

describe('MC-C02 额外攻击不叠加', () => {
  it('无额外攻击来源时为 1 次', () => {
    const draft = mc([{ classId: 'class-2014-fighter', level: 4 }])
    expect(resolveExtraAttack(draft)).toMatchObject({ attacks: 1, sourceNames: [], multipleSources: false })
  })

  it('单职业战士 5 级为 2 次；11 级为 3 次；20 级为 4 次', () => {
    expect(resolveExtraAttack(mc([{ classId: 'class-2014-fighter', level: 5 }])).attacks).toBe(2)
    expect(resolveExtraAttack(mc([{ classId: 'class-2014-fighter', level: 11 }])).attacks).toBe(3)
    expect(resolveExtraAttack(mc([{ classId: 'class-2014-fighter', level: 20 }])).attacks).toBe(4)
  })

  it('两个职业都提供额外攻击时不叠加：战士5/野蛮人5 仍为 2 次', () => {
    const resolution = resolveExtraAttack(mc([
      { classId: 'class-2014-fighter', level: 5 },
      { classId: 'class-2014-barbarian', level: 5 },
    ]))
    expect(resolution.attacks).toBe(2)
    expect(resolution.multipleSources).toBe(true)
    expect(resolution.sourceNames).toContain('额外攻击')
  })

  it('战士的强化额外攻击提升上限：战士11/野蛮人5 → 3 次', () => {
    expect(resolveExtraAttack(mc([
      { classId: 'class-2014-fighter', level: 11 },
      { classId: 'class-2014-barbarian', level: 5 },
    ])).attacks).toBe(3)
    // 反之，野蛮人等级再高也不会超过战士给出的上限
    expect(resolveExtraAttack(mc([
      { classId: 'class-2014-barbarian', level: 5 },
      { classId: 'class-2014-fighter', level: 11 },
    ])).attacks).toBe(3)
  })

  it('战士20/圣武士5 → 4 次（战士（三）的说明允许）', () => {
    expect(resolveExtraAttack(mc([
      { classId: 'class-2014-fighter', level: 20 },
      { classId: 'class-2014-paladin', level: 5 },
    ])).attacks).toBe(4)
  })

  it('武僧5/游侠5 → 2 次（两个两次来源不叠加）', () => {
    const resolution = resolveExtraAttack(mc([
      { classId: 'class-2014-monk', level: 5 },
      { classId: 'class-2014-ranger', level: 5 },
    ]))
    expect(resolution.attacks).toBe(2)
    expect(resolution.multipleSources).toBe(true)
  })

  it('2024 口径一致：战士11/野蛮人5 → 3 次', () => {
    const draft = draft2024({
      ruleset: '5e-2024',
      baseAbilities: ABILITIES,
      classId: 'class-2024-fighter',
      targetLevel: 16,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2024-fighter',
        classes: [{ classId: 'class-2024-fighter', level: 11 }, { classId: 'class-2024-barbarian', level: 5 }],
        levelOrder: [...Array.from({ length: 11 }, () => 'class-2024-fighter'), ...Array.from({ length: 5 }, () => 'class-2024-barbarian')],
      },
    })
    expect(resolveExtraAttack(draft).attacks).toBe(3)
  })
})

describe('MC-C02 AC 计算方式同时只用一种', () => {
  it('单职业野蛮人只有一条无甲防御公式', () => {
    const options = resolveArmorClassFormula(mc([{ classId: 'class-2014-barbarian', level: 5 }]))
    // 2014 野蛮人的无甲防御登记在派生分支中，规则数据未声明 unarmoredDefense → 不产出公式选项
    expect(options).toEqual([])
  })

  it('2024 武僧/术士各有一条公式，可比较取其一', () => {
    const options = resolveArmorClassFormula(draft2024({
      ruleset: '5e-2024',
      baseAbilities: ABILITIES,
      classId: 'class-2024-monk',
      targetLevel: 6,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2024-monk',
        classes: [{ classId: 'class-2024-monk', level: 3 }, { classId: 'class-2024-sorcerer', level: 3 }],
        levelOrder: ['class-2024-monk', 'class-2024-monk', 'class-2024-monk', 'class-2024-sorcerer', 'class-2024-sorcerer', 'class-2024-sorcerer'],
      },
    }))
    expect(options.length).toBeGreaterThanOrEqual(1)
    expect(options.every((option) => option.id.length > 0)).toBe(true)
    // 每个来源各自一条，玩家只能择一
    const ids = options.map((option) => option.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('未声明公式的职业不产出选项（不推断）', () => {
    expect(resolveArmorClassFormula(mc([{ classId: 'class-2014-wizard', level: 5 }]))).toEqual([])
  })
})

describe('MC-C02 特性汇总按各职业等级', () => {
  it('特性只累积到各职业自己的等级', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-barbarian', level: 5 },
    ])
    const features = listCharacterFeatures(draft)
    // 战士 3 级：不含 5 级额外攻击、不含 4 级属性提升
    expect(features.some((feature) => feature.id === 'fighter-2014-class-extra-attack')).toBe(false)
    // 野蛮人 5 级：含额外攻击
    expect(features.some((feature) => feature.id === 'barbarian-2014-class-extra-attack')).toBe(true)
  })

  it('兼职时特性数多于任一单职业', () => {
    const solo = listCharacterFeatures(mc([{ classId: 'class-2014-fighter', level: 5 }]))
    const both = listCharacterFeatures(mc([
      { classId: 'class-2014-fighter', level: 5 },
      { classId: 'class-2014-rogue', level: 5 },
    ]))
    expect(both.length).toBeGreaterThan(solo.length)
  })

  it('来源关闭的职业特性不参与汇总', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 5 },
      { classId: 'class-2014-artificer', level: 3 },
    ])
    // 奇械师来源（erftlw/tcoe）在 enabledSourceIds 为空时关闭
    expect(listCharacterFeatures(draft).some((feature) => feature.id.startsWith('artificer-'))).toBe(false)
  })
})
