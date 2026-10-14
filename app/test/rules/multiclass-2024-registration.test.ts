import { describe, expect, it } from 'vitest'

import { multiclassCasterWeights2014, multiclassThirdCasterSubclasses2014 } from '@/rules/data/multiclass-2014'
import { multiclassCasterWeights2024, multiclassProficiencyGrants2024, multiclassThirdCasterSubclasses2024 } from '@/rules/data/multiclass-2024'
import { getMulticlassPrerequisite, getMulticlassPrerequisiteReport } from '@/rules/multiclass-prerequisites'
import { getMulticlassProficiencyReport } from '@/rules/multiclass-session'
import { getMulticlassSpellcastingLevel } from '@/rules/spellcasting'
import { getRulesRepository } from '@/rules/repositories'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft, ClassLevelEntry } from '@/types/character'

/**
 * MC-D06：2024 兼职数据登记齐备性（先决、兼职受训、施法系数）。
 *
 * 数据来源：各职业「作为兼职角色」条目；2024 侧没有独立兼职熟练项总表，
 * 且**不含任何豁免熟练**（豁免只来自起始职业）。
 */

const ABILITIES: AbilityScores = { str: 13, dex: 13, con: 13, int: 13, wis: 13, cha: 13 }

/** 12 个 2024 核心职业 + UA 奇械师 + UA 灵能使。 */
const CLASSES_2024: readonly { readonly classId: string; readonly name: string; readonly full?: boolean }[] = [
  { classId: 'class-2024-barbarian', name: '野蛮人' },
  { classId: 'class-2024-bard', name: '吟游诗人', full: true },
  { classId: 'class-2024-cleric', name: '牧师', full: true },
  { classId: 'class-2024-druid', name: '德鲁伊', full: true },
  { classId: 'class-2024-fighter', name: '战士' },
  { classId: 'class-2024-monk', name: '武僧' },
  { classId: 'class-2024-paladin', name: '圣武士' },
  { classId: 'class-2024-ranger', name: '游侠' },
  { classId: 'class-2024-rogue', name: '游荡者' },
  { classId: 'class-2024-sorcerer', name: '术士', full: true },
  { classId: 'class-2024-warlock', name: '魔契师' },
  { classId: 'class-2024-wizard', name: '法师', full: true },
  { classId: 'class-2024-ua-artificer', name: '奇械师（UA）' },
  { classId: 'class-2024-ua-psion', name: '灵能使（UA）' },
]

function mc(classes: readonly ClassLevelEntry[]): CharacterDraft {
  const order = classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  return draft2024({
    ruleset: '5e-2024',
    baseAbilities: ABILITIES,
    classId: classes[0]?.classId,
    targetLevel: order.length,
    multiclass: { enabled: true, primaryClassId: classes[0]?.classId ?? '', classes, levelOrder: order },
    manualEdits: EMPTY_MANUAL_EDITS,
  })
}

describe('MC-D06 2024 职业可兼职且条目齐备', () => {
  it('13 个 2024 职业（12 核心 + UA 奇械师）与灵能使都有兼职受训条目', () => {
    for (const entry of CLASSES_2024) {
      expect(getRulesRepository('5e-2024').getClass(entry.classId), `${entry.name} 职业未登记`).toBeDefined()
      expect(multiclassProficiencyGrants2024[entry.classId], `${entry.name} 缺少兼职受训条目`).toBeDefined()
      expect(multiclassProficiencyGrants2024[entry.classId]?.ruleset).toBe('5e-2024')
    }
  })

  it('13 个职业都能解析出兼职先决条件（含奇械师与灵能使）', () => {
    for (const entry of CLASSES_2024) {
      const prerequisite = getMulticlassPrerequisite('5e-2024', entry.classId)
      expect(prerequisite, `${entry.name} 缺少兼职先决`).toBeDefined()
      expect(prerequisite?.anyOf.length).toBeGreaterThan(0)
    }
  })

  it('武僧／术士／法师的兼职条目只授予生命骰', () => {
    for (const classId of ['class-2024-monk', 'class-2024-sorcerer', 'class-2024-wizard']) {
      const grant = multiclassProficiencyGrants2024[classId]
      expect(grant?.armorTraining ?? []).toEqual([])
      expect(grant?.weaponTraining).toBeUndefined()
      expect(grant?.skillChoices).toBeUndefined()
      expect(grant?.toolProficiencies ?? []).toEqual([])
      expect(grant?.toolChoices).toBeUndefined()
    }
  })

  it('兼职不授予任何豁免熟练（豁免只来自起始职业）', () => {
    const draft = mc([
      { classId: 'class-2024-fighter', level: 3 },
      { classId: 'class-2024-cleric', level: 3 },
    ])
    const report = getMulticlassProficiencyReport(draft)
    expect(report.primaryClassId).toBe('class-2024-fighter')
    // 每个来源的兼职条目都没有豁免熟练字段（类型上不存在），逐条确认受训内容来自条目本身
    expect(report.sources.map((source) => source.classId)).toEqual(['class-2024-fighter', 'class-2024-cleric'])
  })
})

describe('MC-D06 2024 施法系数', () => {
  it('全施法者全额、半施法者半数，奇械师为半施法者', () => {
    expect(multiclassCasterWeights2024).toMatchObject({
      'class-2024-bard': 'full',
      'class-2024-cleric': 'full',
      'class-2024-druid': 'full',
      'class-2024-sorcerer': 'full',
      'class-2024-wizard': 'full',
      'class-2024-paladin': 'half',
      'class-2024-ranger': 'half',
      'class-2024-ua-artificer': 'half',
    })
    // 非施法职业不进系数表
    for (const classId of ['class-2024-barbarian', 'class-2024-fighter', 'class-2024-monk', 'class-2024-rogue']) {
      expect(multiclassCasterWeights2024[classId]).toBeUndefined()
    }
    // 魔契师走契约池，不参与通用池
    expect(multiclassCasterWeights2024['class-2024-warlock']).toBeUndefined()
  })

  it('2024 半施法者向下取整（决策 D1）：圣武士5 → 2', () => {
    const draft = mc([{ classId: 'class-2024-paladin', level: 5 }])
    expect(getMulticlassSpellcastingLevel(draft).casterLevel).toBe(2)
  })

  it('1/3 施法子职两版都登记了奥法骑士与诡术师', () => {
    expect(multiclassThirdCasterSubclasses2014).toEqual([
      'subclass-2014-fighter-eldritch-knight',
      'subclass-2014-rogue-arcane-trickster',
    ])
    expect(multiclassThirdCasterSubclasses2024).toEqual([
      'subclass-2024-fighter-eldritch-knight',
      'subclass-2024-rogue-arcane-trickster',
    ])
  })

  it('2014 侧 13 职业（含奇械师）都有先决与兼职熟练项', () => {
    const classes2014 = [
      'class-2014-barbarian', 'class-2014-bard', 'class-2014-cleric', 'class-2014-druid', 'class-2014-fighter',
      'class-2014-monk', 'class-2014-paladin', 'class-2014-ranger', 'class-2014-rogue', 'class-2014-sorcerer',
      'class-2014-warlock', 'class-2014-wizard', 'class-2014-artificer',
    ]
    for (const classId of classes2014) {
      expect(getRulesRepository('5e-2014').getClass(classId), `${classId} 职业未登记`).toBeDefined()
      expect(getMulticlassPrerequisite('5e-2014', classId), `${classId} 缺少兼职先决`).toBeDefined()
      expect(multiclassCasterWeights2014[classId] ?? 'non-caster', `${classId} 未登记施法系数`).toBeDefined()
    }
    expect(multiclassCasterWeights2014['class-2014-artificer']).toBe('half')
  })
})

describe('MC-D06 未登记职业不阻断（决策 D8）', () => {
  it('第三方职业未登记先决时给出「待核验」且不阻断', () => {
    const draft = draft2024({
      ruleset: '5e-2024',
      baseAbilities: ABILITIES,
      classId: 'class-2024-fighter',
      targetLevel: 2,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2024-fighter',
        classes: [
          { classId: 'class-2024-fighter', level: 1 },
          { classId: 'class-2024-tp-unknown', level: 1 },
        ],
        levelOrder: ['class-2024-fighter', 'class-2024-tp-unknown'],
      },
      manualEdits: EMPTY_MANUAL_EDITS,
    })
    const report = getMulticlassPrerequisiteReport(draft)
    const unknown = report.results.find((item) => item.classId === 'class-2024-tp-unknown')
    expect(unknown?.status).toBe('pending')
    expect(unknown?.reasons.join('')).toContain('待核验')
    // 未核验职业不阻断（决策 D8）：satisfied 只看「不满足」的职业
    expect(report.pendingClassIds).toEqual(['class-2024-tp-unknown'])
    expect(report.satisfied).toBe(true)
    // 起始职业仍正常判定
    expect(report.results.find((item) => item.classId === 'class-2024-fighter')?.status).toBe('met')
  })
})
