import { describe, expect, it } from 'vitest'

import { rulesRepository as rulesRepository2014 } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { getClassDetailSummary } from '@/rules/recommend'
import type { ClassRule } from '@/types/rules'

/** 占位文本特征：职业介绍不应包含这些字样。 */
const PLACEHOLDER_PATTERNS = [/元数据/, /待补/, /效果以规则来源为准/, /TODO/, /占位/] as const

/**
 * 主要属性核对清单：与 5e 不全书逐条核对（2024「主要属性 Primary Ability」字段、
 * 2014／奇械师「快速建卡 Quick Build」的最高属性建议），见需求文档 §3.2 与 U02 更新计划 §2。
 */
const EXPECTED_PRIMARY_ABILITIES: Readonly<Record<string, readonly string[]>> = {
  artificer: ['int'],
  barbarian: ['str'],
  bard: ['cha'],
  cleric: ['wis'],
  druid: ['wis'],
  fighter: ['str', 'dex'],
  monk: ['dex', 'wis'],
  paladin: ['str', 'cha'],
  ranger: ['dex', 'wis'],
  rogue: ['dex'],
  sorcerer: ['cha'],
  warlock: ['cha'],
  wizard: ['int'],
}

describe('职业介绍与职业详情（U02）', () => {
  const classes2014 = rulesRepository2014.classes
  const classes2024 = rulesRepository2024.classes

  it('2014 的 13 个职业与 2024 的 12 个职业都登记了职业介绍', () => {
    expect(classes2014).toHaveLength(13)
    expect(classes2024).toHaveLength(12)
    for (const classRule of [...classes2014, ...classes2024]) {
      const introduction = classRule.introduction ?? ''
      expect(introduction.trim(), `${classRule.id} 应有职业介绍`).not.toBe('')
      expect(introduction.length, `${classRule.id} 职业介绍过短`).toBeGreaterThanOrEqual(20)
      expect(introduction.length, `${classRule.id} 职业介绍过长（应控制在 1—3 句）`).toBeLessThanOrEqual(140)
      for (const pattern of PLACEHOLDER_PATTERNS) {
        expect(introduction, `${classRule.id} 职业介绍不应是占位文本`).not.toMatch(pattern)
      }
    }
  })

  it('2014 职业介绍经 repository 合并后仍可取到（Q-4a 合并顺序回归）', () => {
    const fighter = rulesRepository2014.getClass('class-2014-fighter')
    expect(fighter?.introduction).toBeTruthy()
    // 完整规则文件（fighter.ts 等）覆盖其余字段时，不得丢掉仅登记在预览清单中的介绍。
    expect(fighter?.introduction).toContain('武器')
    expect(fighter?.checkpoints.length).toBeGreaterThan(0)
  })

  it('两版同名职业的介绍文本独立，不互相复制', () => {
    const introductions2014 = new Map(classes2014.map((classRule) => [classRule.englishName, classRule.introduction]))
    for (const classRule of classes2024) {
      const counterpart = introductions2014.get(classRule.englishName)
      expect(counterpart, `${classRule.englishName} 应在 2014 有同名职业`).toBeTruthy()
      expect(classRule.introduction, `${classRule.englishName} 两版介绍不应相同`).not.toBe(counterpart)
    }
  })

  it('主要属性与 5e 不全书核对清单一致（25 个职业）', () => {
    for (const classRule of [...classes2014, ...classes2024]) {
      const expected = EXPECTED_PRIMARY_ABILITIES[classRule.englishName.toLowerCase()]
      expect(expected, `${classRule.id} 缺少核对清单项`).toBeTruthy()
      expect(classRule.primaryAbilities, `${classRule.id} 主要属性应与不全书一致`).toEqual(expected)
    }
  })

  it('职业详情摘要输出中文标签、生命骰与豁免熟练', () => {
    const fighter = rulesRepository2014.getClass('class-2014-fighter') as ClassRule
    expect(getClassDetailSummary(fighter)).toEqual({
      abilities: ['力量', '敏捷'],
      savingThrows: ['力量', '体质'],
      hitDie: 'd10',
    })
    const wizard = rulesRepository2024.getClass('class-2024-wizard') as ClassRule
    expect(getClassDetailSummary(wizard)).toEqual({
      abilities: ['智力'],
      savingThrows: ['智力', '感知'],
      hitDie: 'd6',
    })
  })
})
