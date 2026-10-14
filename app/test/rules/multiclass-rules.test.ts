import { describe, expect, it } from 'vitest'

import {
  MULTICLASS_ABILITY_MINIMUM,
  checkMulticlassPrerequisite,
  getMulticlassPrerequisite,
  getMulticlassPrerequisiteReport,
  multiclassPrerequisites2024,
} from '@/rules/multiclass-prerequisites'
import { multiclassClasses2014 } from '@/rules/data/multiclass-2014'
import { multiclassProficiencyGrants2024 } from '@/rules/data/multiclass-2024'
import {
  deriveMulticlassHitPoints,
  getHitDiceFaces,
  getMulticlassProficiencyReport,
  getPrimarySavingThrowAbilities,
  isMulticlassWeaponCovered,
} from '@/rules/multiclass-session'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft } from '@/types/character'
import type { EquipmentRule } from '@/types/rules'

const ABILITIES: AbilityScores = { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 }

function build(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return draft2024({ ruleset: '5e-2014', baseAbilities: ABILITIES, ...overrides })
}

function combatDraft(fighter: number, rogue: number, overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return build({
    classId: 'class-2014-fighter',
    targetLevel: fighter + rogue,
    multiclass: {
      enabled: true,
      primaryClassId: 'class-2014-fighter',
      classes: [
        { classId: 'class-2014-fighter', level: fighter },
        { classId: 'class-2014-rogue', level: rogue },
      ],
      levelOrder: [
        ...Array.from({ length: fighter }, () => 'class-2014-fighter'),
        ...Array.from({ length: rogue }, () => 'class-2014-rogue'),
      ],
    },
    ...overrides,
  })
}

describe('MC-B01 兼职先决数据完整性', () => {
  it('2014 全部 13 个职业都已登记先决与兼职熟练项', () => {
    const repositoryClassIds = [
      'class-2014-artificer', 'class-2014-barbarian', 'class-2014-bard', 'class-2014-cleric',
      'class-2014-druid', 'class-2014-fighter', 'class-2014-monk', 'class-2014-paladin',
      'class-2014-ranger', 'class-2014-rogue', 'class-2014-sorcerer', 'class-2014-warlock',
      'class-2014-wizard',
    ]
    expect(multiclassClasses2014.map((entry) => entry.classId).sort()).toEqual([...repositoryClassIds].sort())
    for (const entry of multiclassClasses2014) {
      expect(entry.prerequisite.anyOf.length).toBeGreaterThan(0)
      expect(entry.proficiencies.ruleset).toBe('5e-2014')
    }
  })

  it('2024 全部 12 核心职业 + UA 职业都已登记兼职熟练项', () => {
    const expected = [
      'class-2024-barbarian', 'class-2024-bard', 'class-2024-cleric', 'class-2024-druid',
      'class-2024-fighter', 'class-2024-monk', 'class-2024-paladin', 'class-2024-ranger',
      'class-2024-rogue', 'class-2024-sorcerer', 'class-2024-warlock', 'class-2024-wizard',
      'class-2024-ua-artificer', 'class-2024-ua-psion',
    ]
    expect(Object.keys(multiclassProficiencyGrants2024).sort()).toEqual([...expected].sort())
    expect(Object.keys(multiclassPrerequisites2024).sort()).toEqual([...expected].sort())
  })

  it('先决表与不全书逐条一致（含「或」「及」语义）', () => {
    const ruleset = '5e-2014' as const
    expect(getMulticlassPrerequisite(ruleset, 'class-2014-barbarian')?.anyOf).toEqual([['str']])
    expect(getMulticlassPrerequisite(ruleset, 'class-2014-bard')?.anyOf).toEqual([['cha']])
    expect(getMulticlassPrerequisite(ruleset, 'class-2014-cleric')?.anyOf).toEqual([['wis']])
    expect(getMulticlassPrerequisite(ruleset, 'class-2014-druid')?.anyOf).toEqual([['wis']])
    // 战士：力量 13 **或** 敏捷 13
    expect(getMulticlassPrerequisite(ruleset, 'class-2014-fighter')?.anyOf).toEqual([['str'], ['dex']])
    // 武僧／圣武士／游侠：**及**
    expect(getMulticlassPrerequisite(ruleset, 'class-2014-monk')?.anyOf).toEqual([['dex', 'wis']])
    expect(getMulticlassPrerequisite(ruleset, 'class-2014-paladin')?.anyOf).toEqual([['str', 'cha']])
    expect(getMulticlassPrerequisite(ruleset, 'class-2014-ranger')?.anyOf).toEqual([['dex', 'wis']])
    expect(getMulticlassPrerequisite(ruleset, 'class-2014-rogue')?.anyOf).toEqual([['dex']])
    expect(getMulticlassPrerequisite(ruleset, 'class-2014-sorcerer')?.anyOf).toEqual([['cha']])
    expect(getMulticlassPrerequisite(ruleset, 'class-2014-warlock')?.anyOf).toEqual([['cha']])
    expect(getMulticlassPrerequisite(ruleset, 'class-2014-wizard')?.anyOf).toEqual([['int']])
    expect(getMulticlassPrerequisite(ruleset, 'class-2014-artificer')?.anyOf).toEqual([['int']])
    // 2024 同口径
    for (const [classId, prerequisite] of Object.entries(multiclassPrerequisites2024)) {
      const legacy = classId.replace('class-2024', 'class-2014').replace('class-2024-ua', 'class-2014')
      const legacyPrerequisite = getMulticlassPrerequisite('5e-2014', legacy)
      if (legacyPrerequisite) expect(prerequisite.anyOf).toEqual(legacyPrerequisite.anyOf)
    }
  })
})

describe('MC-B01 先决判定', () => {
  const check = (classId: string, abilities: AbilityScores) =>
    checkMulticlassPrerequisite('5e-2014', classId, '测试职业', abilities)

  it('单项满足 / 不满足', () => {
    expect(check('class-2014-wizard', { ...ABILITIES, int: 13 }).status).toBe('met')
    const unmet = check('class-2014-wizard', { ...ABILITIES, int: 12 })
    expect(unmet.status).toBe('unmet')
    expect(unmet.reasons[0]).toContain('智力需提高到 13')
    expect(unmet.reasons[0]).toContain('当前')
  })

  it('「或」条件：任一项达标即通过（战士 力量13 或 敏捷13）', () => {
    expect(check('class-2014-fighter', { ...ABILITIES, str: 13, dex: 8 }).status).toBe('met')
    expect(check('class-2014-fighter', { ...ABILITIES, str: 8, dex: 13 }).status).toBe('met')
    expect(check('class-2014-fighter', { ...ABILITIES, str: 12, dex: 12 }).status).toBe('unmet')
    expect(check('class-2014-fighter', { ...ABILITIES, str: 12, dex: 12 }).reasons[0]).toContain('或')
  })

  it('「及」条件：必须同时达标（武僧 敏捷与感知）', () => {
    expect(check('class-2014-monk', { ...ABILITIES, dex: 13, wis: 13 }).status).toBe('met')
    const partial = check('class-2014-monk', { ...ABILITIES, dex: 13, wis: 12 })
    expect(partial.status).toBe('unmet')
    expect(partial.reasons[0]).toContain('感知需提高到 13')
    expect(partial.reasons[0]).not.toContain('敏捷需提高到 13')
  })

  it('边界值 13 恰好满足，12 不满足', () => {
    expect(MULTICLASS_ABILITY_MINIMUM).toBe(13)
    expect(check('class-2014-rogue', { ...ABILITIES, dex: 13 }).status).toBe('met')
    expect(check('class-2014-rogue', { ...ABILITIES, dex: 12 }).status).toBe('unmet')
  })

  it('未登记先决的职业返回 pending 且不判失败（D8）', () => {
    const pending = checkMulticlassPrerequisite('5e-2014', 'class-2014-unknown', '未知职业', ABILITIES)
    expect(pending.status).toBe('pending')
    expect(pending.requirements).toEqual([])
    expect(pending.reasons[0]).toContain('尚未登记')
  })
})

describe('MC-B01 全角色先决报告', () => {
  it('起始职业与新职业都必须满足（临时加值不计入，只读 baseAbilities）', () => {
    // 基础属性敏捷 14 满足游荡者；感知 12 不满足德鲁伊
    const draft = build({
      classId: 'class-2014-rogue',
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-rogue',
        classes: [{ classId: 'class-2014-rogue', level: 3 }, { classId: 'class-2014-druid', level: 2 }],
        levelOrder: ['class-2014-rogue', 'class-2014-rogue', 'class-2014-rogue', 'class-2014-druid', 'class-2014-druid'],
      },
    })
    const report = getMulticlassPrerequisiteReport(draft)
    expect(report.satisfied).toBe(false)
    expect(report.unmetClassIds).toEqual(['class-2014-druid'])
    const druid = report.results.find((item) => item.classId === 'class-2014-druid')
    expect(druid?.reasons[0]).toContain('感知需提高到 13')
  })

  it('来源关闭的职业不判失败，只给 pending 提示', () => {
    const draft = build({
      classId: 'class-2014-fighter',
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-artificer', level: 1 }],
        levelOrder: ['class-2014-fighter', 'class-2014-fighter', 'class-2014-fighter', 'class-2014-artificer'],
      },
    })
    const report = getMulticlassPrerequisiteReport(draft)
    // enabledSourceIds 为空 → 奇械师来源（erftlw/tcoe）关闭
    expect(report.pendingClassIds).toContain('class-2014-artificer')
    expect(report.satisfied).toBe(true)
  })

  it('全部满足时 satisfied 为 true 且无原因', () => {
    const report = getMulticlassPrerequisiteReport(combatDraft(3, 2))
    expect(report.satisfied).toBe(true)
    expect(report.results.every((item) => item.reasons.length === 0)).toBe(true)
  })
})

describe('MC-B02 兼职熟练项合并', () => {
  it('豁免熟练只来自起始职业', () => {
    // 起始职业战士：力量与体质
    expect(getPrimarySavingThrowAbilities(combatDraft(3, 2))).toEqual(['str', 'con'])
    // 起始职业换成游荡者：敏捷与智力（不受兼职影响）
    const rogueFirst = combatDraft(2, 3, { classId: 'class-2014-rogue' })
    expect(getPrimarySavingThrowAbilities({
      ...rogueFirst,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-rogue',
        classes: [{ classId: 'class-2014-rogue', level: 3 }, { classId: 'class-2014-fighter', level: 2 }],
        levelOrder: ['class-2014-rogue', 'class-2014-rogue', 'class-2014-rogue', 'class-2014-fighter', 'class-2014-fighter'],
      },
    })).toEqual(['dex', 'int'])
  })

  it('2014 兼职熟练项按总表合并（战士+游荡者：轻/中甲、盾牌、简易/军用武器、盗贼工具与一项技能）', () => {
    const report = getMulticlassProficiencyReport(combatDraft(3, 2))
    expect(report.armorTraining).toEqual(['light', 'medium', 'shield'])
    expect(report.toolProficiencies).toEqual(['thieves-tools'])
    // 战士与游荡者的兼职条目都提供简易与军用武器熟练；合并后按覆盖语义去重
    expect(report.weaponTraining).toHaveLength(1)
    expect(report.weaponTraining[0]?.categories).toEqual(['simple', 'martial'])
    expect(report.sources).toHaveLength(2)
    const rogueSkill = report.skillChoices.find((item) => item.classId === 'class-2014-rogue')
    expect(rogueSkill?.count).toBe(1)
    expect(rogueSkill?.optionIds).toContain('skill-stealth')
    // 战士兼职条目不含技能选择
    expect(report.skillChoices.some((item) => item.classId === 'class-2014-fighter')).toBe(false)
  })

  it('术士与法师的兼职条目没有熟练项（原书为「—」）', () => {
    const draft = build({
      classId: 'class-2014-fighter',
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [
          { classId: 'class-2014-fighter', level: 2 },
          { classId: 'class-2014-sorcerer', level: 2 },
          { classId: 'class-2014-wizard', level: 2 },
        ],
        levelOrder: ['class-2014-fighter', 'class-2014-fighter', 'class-2014-sorcerer', 'class-2014-sorcerer', 'class-2014-wizard', 'class-2014-wizard'],
      },
    })
    const report = getMulticlassProficiencyReport(draft)
    const sorcerer = report.sources.find((item) => item.classId === 'class-2014-sorcerer')
    const wizard = report.sources.find((item) => item.classId === 'class-2014-wizard')
    expect(sorcerer?.armorTraining).toEqual([])
    expect(sorcerer?.weaponTraining).toBeUndefined()
    expect(wizard?.armorTraining).toEqual([])
    expect(wizard?.weaponTraining).toBeUndefined()
    // 总表仍来自战士
    expect(report.armorTraining).toEqual(['light', 'medium', 'shield'])
  })

  it('吟游诗人兼职获得一项技能与一项乐器，武僧只获得简易武器与短剑', () => {
    const bard = build({
      ruleset: '5e-2024',
      baseAbilities: { ...ABILITIES, cha: 13 },
      classId: 'class-2024-bard',
      multiclass: { enabled: true, primaryClassId: 'class-2024-bard', classes: [{ classId: 'class-2024-bard', level: 3 }], levelOrder: ['class-2024-bard', 'class-2024-bard', 'class-2024-bard'] },
    })
    const bardReport = getMulticlassProficiencyReport(bard)
    expect(bardReport.armorTraining).toEqual(['light'])
    expect(bardReport.skillChoices[0]).toMatchObject({ classId: 'class-2024-bard', count: 1 })
    expect(bardReport.toolChoices[0]?.optionIds).toEqual(['tool-musical-instrument'])

    const monk = build({
      ruleset: '5e-2024',
      baseAbilities: { ...ABILITIES, dex: 13, wis: 13 },
      classId: 'class-2024-monk',
      multiclass: { enabled: true, primaryClassId: 'class-2024-monk', classes: [{ classId: 'class-2024-monk', level: 2 }], levelOrder: ['class-2024-monk', 'class-2024-monk'] },
    })
    const monkReport = getMulticlassProficiencyReport(monk)
    expect(monkReport.armorTraining).toEqual([])
    expect(monkReport.weaponTraining).toEqual([])
    expect(monkReport.skillChoices).toEqual([])
  })

  it('2024 武僧/术士/法师的兼职条目只给生命骰（无受训）', () => {
    for (const classId of ['class-2024-monk', 'class-2024-sorcerer', 'class-2024-wizard']) {
      const grant = multiclassProficiencyGrants2024[classId]
      expect(grant?.armorTraining ?? []).toEqual([])
      expect(grant?.weaponTraining).toBeUndefined()
      expect(grant?.skillChoices).toBeUndefined()
    }
  })

  it('武器受训覆盖判定使用合并结果', () => {
    const report = getMulticlassProficiencyReport(combatDraft(3, 2))
    const longsword = { id: 'longsword', name: '长剑', weaponKind: 'martial-melee', category: 'weapon' } as EquipmentRule
    const improvised = { id: 'improvised', name: '临时武器', weaponKind: 'simple-melee', category: 'weapon' } as EquipmentRule
    expect(isMulticlassWeaponCovered(report, longsword)).toBe(true)
    expect(isMulticlassWeaponCovered(report, improvised)).toBe(true)
    // 无武器受训的职业（法师兼职）不覆盖军用武器
    const wizardOnly = getMulticlassProficiencyReport(build({
      classId: 'class-2014-fighter',
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 1 }, { classId: 'class-2014-wizard', level: 1 }],
        levelOrder: ['class-2014-fighter', 'class-2014-wizard'],
      },
    }))
    const greatsword = { id: 'greatsword', name: '巨剑', weaponKind: 'martial-melee', category: 'weapon' } as EquipmentRule
    // 战士条目提供军用武器熟练，所以仍覆盖
    expect(isMulticlassWeaponCovered(wizardOnly, greatsword)).toBe(true)
  })
})

describe('MC-B03 生命值与生命骰', () => {
  it('生命骰骰面按各职业等级展开（战士3/游荡者2）', () => {
    expect(getHitDiceFaces(combatDraft(3, 2))).toEqual([10, 10, 10, 8, 8])
  })

  it('圣武士5/牧师5 → 5d10 + 5d8', () => {
    const draft = build({
      classId: 'class-2014-paladin',
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-paladin',
        classes: [{ classId: 'class-2014-paladin', level: 5 }, { classId: 'class-2014-cleric', level: 5 }],
        levelOrder: [...Array.from({ length: 5 }, () => 'class-2014-paladin'), ...Array.from({ length: 5 }, () => 'class-2014-cleric')],
      },
    })
    const faces = getHitDiceFaces(draft)
    expect(faces.filter((die) => die === 10)).toHaveLength(5)
    expect(faces.filter((die) => die === 8)).toHaveLength(5)
  })

  it('起始职业 1 级最大值只算一次，后续按所升职业的固定值', () => {
    // 体质 13 → 调整值 +1；战士 d10 → 后续每级 6+1=7；游荡者 d8 → 5+1=6
    const detail = deriveMulticlassHitPoints(combatDraft(3, 2), 13)
    expect(detail.constitutionModifier).toBe(1)
    expect(detail.firstLevel).toBe(10 + 1)
    expect(detail.perLevel).toEqual([6, 6, 5, 5])
    expect(detail.subsequentTotal).toBe((6 + 1) + (6 + 1) + (5 + 1) + (5 + 1))
    expect(detail.total).toBe(11 + 26)
  })

  it('相同总等级下，起始职业不同会导致 1 级生命值不同（战士3/游荡者2 vs 游荡者3/战士2）', () => {
    const fighterFirst = deriveMulticlassHitPoints(combatDraft(3, 2), 13)
    const rogueFirstDraft = combatDraft(2, 3, { classId: 'class-2014-rogue' })
    const rogueFirst = deriveMulticlassHitPoints({
      ...rogueFirstDraft,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-rogue',
        classes: [{ classId: 'class-2014-rogue', level: 3 }, { classId: 'class-2014-fighter', level: 2 }],
        levelOrder: ['class-2014-rogue', 'class-2014-rogue', 'class-2014-rogue', 'class-2014-fighter', 'class-2014-fighter'],
      },
    }, 13)
    expect(fighterFirst.firstLevel).toBe(11)
    expect(rogueFirst.firstLevel).toBe(9)
  })

  it('单职业草稿的生命值口径与既有实现一致（5 级战士）', () => {
    const solo = build({ classId: 'class-2014-fighter', targetLevel: 5 })
    const detail = deriveMulticlassHitPoints(solo, 13)
    // 既有口径：hitDie + con + (level-1)*(floor(hitDie/2)+1+con)
    // d10 后续固定值 6，体质 13 → +1，故每级 7
    expect(detail.firstLevel).toBe(11)
    expect(detail.perLevel).toEqual([6, 6, 6, 6])
    expect(detail.total).toBe(11 + 4 * 7)
  })

  it('体质为负时后续等级至少每级 +1 底线的口径保持不变（固定值不减小）', () => {
    const detail = deriveMulticlassHitPoints(combatDraft(2, 1), 6)
    expect(detail.constitutionModifier).toBe(-2)
    // 固定值仍为 6/5，只是体质调整值为 -2
    expect(detail.perLevel).toEqual([6, 5])
    expect(detail.subsequentTotal).toBe(6 - 2 + 5 - 2)
  })
})
