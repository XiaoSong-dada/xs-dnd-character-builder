import { describe, expect, it } from 'vitest'

import { getCantripScalingAtLevel, getDraftCantripScaling } from '@/rules/spellcasting'
import { cantripScaling2014 } from '@/rules/data/cantrip-scaling-2014'
import { cantripScaling2024 } from '@/rules/data/cantrip-scaling-2024'
import { getRulesRepository } from '@/rules/repositories'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft } from '@/types/character'

const ABILITIES: AbilityScores = { str: 15, dex: 14, con: 13, int: 13, wis: 13, cha: 13 }

describe('MC-D05 戏法成长数据完整性', () => {
  it('2014 已登记 25 条，全部指向真实存在的 0 环法术', () => {
    const repository = getRulesRepository('5e-2014')
    expect(cantripScaling2014.length).toBe(25)
    for (const rule of cantripScaling2014) {
      const spell = repository.getSpell(rule.id)
      expect(spell, rule.id).toBeDefined()
      expect(spell?.level, rule.id).toBe(0)
      expect(rule.steps.length).toBeGreaterThan(0)
      expect(rule.sourceNote.length).toBeGreaterThan(0)
      // 节点按等级升序且首节点为 1 级
      expect(rule.steps[0]?.level, rule.id).toBe(1)
      const levels = rule.steps.map((step) => step.level)
      expect([...levels].sort((a, b) => a - b), rule.id).toEqual(levels)
    }
  })

  it('2024 已登记 18 条，全部指向真实存在的 0 环法术', () => {
    const repository = getRulesRepository('5e-2024')
    expect(cantripScaling2024.length).toBe(18)
    for (const rule of cantripScaling2024) {
      const spell = repository.getSpell(rule.id)
      expect(spell, rule.id).toBeDefined()
      expect(spell?.level, rule.id).toBe(0)
      expect(rule.steps[0]?.level, rule.id).toBe(1)
    }
  })

  it('两版数据不含重复条目', () => {
    expect(new Set(cantripScaling2014.map((r) => r.id)).size).toBe(cantripScaling2014.length)
    expect(new Set(cantripScaling2024.map((r) => r.id)).size).toBe(cantripScaling2024.length)
  })
})

describe('MC-D05 火焰箭按角色总等级取值', () => {
  const expected: readonly (readonly [number, string])[] = [
    [1, '1d10'], [4, '1d10'], [5, '2d10'], [10, '2d10'], [11, '3d10'], [16, '3d10'], [17, '4d10'], [20, '4d10'],
  ]

  it('2014 火焰箭在 1/4/5/10/11/16/17 级分别为 1d10/1d10/2d10/2d10/3d10/3d10/4d10', () => {
    for (const [level, dice] of expected) {
      expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-fire-bolt', level)?.dice, `${level} 级`).toBe(dice)
    }
  })

  it('2024 火焰箭同节点同口径', () => {
    for (const [level, dice] of expected) {
      expect(getCantripScalingAtLevel('5e-2024', 'spell-2024-fire-bolt', level)?.dice, `${level} 级`).toBe(dice)
    }
  })

  it('1—4 级标记为基础值，5 级起不再是基础值', () => {
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-fire-bolt', 1)?.isBase).toBe(true)
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-fire-bolt', 4)?.isBase).toBe(true)
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-fire-bolt', 5)?.isBase).toBe(false)
  })

  it('越界等级夹到 1—20 范围（0 与负数按 1 级处理）', () => {
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-fire-bolt', 0)?.dice).toBe('1d10')
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-fire-bolt', -5)?.dice).toBe('1d10')
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-fire-bolt', 99)?.dice).toBe('4d10')
  })
})

describe('MC-D05 兼职按角色总等级（需求 §2.8）', () => {
  it('游侠4/术士3 的术士戏法按总等级 7 取值（2d10），而不是术士等级 3', () => {
    const draft: CharacterDraft = draft2024({
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-ranger',
      targetLevel: 7,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-ranger',
        classes: [{ classId: 'class-2014-ranger', level: 4 }, { classId: 'class-2014-sorcerer', level: 3 }],
        levelOrder: [...Array.from({ length: 4 }, () => 'class-2014-ranger'), ...Array.from({ length: 3 }, () => 'class-2014-sorcerer')],
      },
    })
    expect(getDraftCantripScaling(draft, 'spell-2014-fire-bolt')?.dice).toBe('2d10')
  })

  it('单职业草稿按自身等级取值', () => {
    const solo = draft2024({ ruleset: '5e-2014', baseAbilities: ABILITIES, classId: 'class-2014-wizard', targetLevel: 11 })
    expect(getDraftCantripScaling(solo, 'spell-2014-ray-of-frost')?.dice).toBe('3d8')
  })

  it('总等级 17 时达到最高成长', () => {
    const draft: CharacterDraft = draft2024({
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-fighter',
      targetLevel: 17,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 2 }, { classId: 'class-2014-sorcerer', level: 15 }],
        levelOrder: [...Array.from({ length: 2 }, () => 'class-2014-fighter'), ...Array.from({ length: 15 }, () => 'class-2014-sorcerer')],
      },
    })
    expect(getDraftCantripScaling(draft, 'spell-2014-vicious-mockery')?.dice).toBe('4d4')
  })
})

describe('MC-D05 特殊成长形态与未登记条目', () => {
  it('魔能爆按射线数量成长', () => {
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-eldritch-blast', 1)?.count).toBe(1)
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-eldritch-blast', 5)?.count).toBe(2)
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-eldritch-blast', 11)?.count).toBe(3)
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-eldritch-blast', 17)?.count).toBe(4)
  })

  it('亡者丧钟在 note 中记录 d8/d12 分支（不进入自动结算）', () => {
    const result = getCantripScalingAtLevel('5e-2014', 'spell-2014-toll-the-dead', 5)
    expect(result?.dice).toBe('2d8')
    expect(result?.note).toContain('d12')
  })

  it('橡棍术记录骰型成长', () => {
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-shillelagh', 1)?.die).toBe('d8')
    expect(getCantripScalingAtLevel('5e-2024', 'spell-2024-shillelagh', 17)?.dice).toBe('2d6')
  })

  it('未登记的 0 环法术不产出成长值（决策 D12）', () => {
    // 无成长的法术
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-mage-hand', 17)).toBeUndefined()
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-light', 20)).toBeUndefined()
    // 项目收录但未核验成长数据的扩展戏法
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-drizzle', 17)).toBeUndefined()
    // 不存在的法术
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-not-a-spell', 17)).toBeUndefined()
  })

  it('非戏法法术不产出成长值', () => {
    expect(getCantripScalingAtLevel('5e-2014', 'spell-2014-magic-missile', 20)).toBeUndefined()
  })
})
