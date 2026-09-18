import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { barbarianFeatures2024, barbarianOptions2024, barbarianRule2024 } from '@/rules/data/barbarian-2024'
import { getCheckpointSelectionBounds } from '@/rules/feats'
import { formatResourceText, getResourceMax } from '@/rules/resources'
import { buildTimeline } from '@/rules/timeline'
import { draft2024 } from '../fixtures/draft-2024'

const SUBCLASS_IDS = [
  'subclass-2024-barbarian-path-of-the-berserker',
  'subclass-2024-barbarian-path-of-wild-heart',
  'subclass-2024-barbarian-path-of-the-world-tree',
  'subclass-2024-barbarian-path-of-the-zealot',
] as const

describe('2024 野蛮人与道途数据（B08-03）', () => {
  it('职业基础字段、武器训练与无甲防御规则', () => {
    const classRule = rulesRepository2024.getClass('class-2024-barbarian')
    expect(classRule?.status).toBe('implemented')
    expect(classRule?.hitDie).toBe(12)
    expect(classRule?.armorTraining).toEqual(['light', 'medium', 'shield'])
    expect(classRule?.weaponTraining).toEqual({ categories: ['simple', 'martial'] })
    expect(classRule?.unarmoredDefense).toEqual({ ability: 'con', allowsShield: true })
    expect(classRule?.savingThrowAbilities).toEqual(['str', 'con'])
  })

  it('职业特性 19 条、ID 唯一，选择类特性挂检查点', () => {
    expect(barbarianFeatures2024).toHaveLength(19)
    expect(new Set(barbarianFeatures2024.map((feature) => feature.id)).size).toBe(19)
    expect(barbarianFeatures2024.every((feature) => feature.classId === 'class-2024-barbarian')).toBe(true)
    expect(barbarianFeatures2024.map((feature) => feature.level)).toEqual(
      expect.arrayContaining([1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 18, 19, 20]),
    )
    const choiceFeatures = barbarianFeatures2024.filter((feature) => feature.requiresChoice)
    expect(choiceFeatures.every((feature) => (feature.checkpointIds?.length ?? 0) > 0)).toBe(true)
  })

  it('狂暴次数与武器精通数量按等级表登记', () => {
    const rage = barbarianFeatures2024.find((feature) => feature.id === 'barbarian-2024-class-rage')?.resource
    if (!rage) throw new Error('缺少狂暴资源')
    expect([1, 3, 6, 12, 17].map((level) => getResourceMax(rage, level))).toEqual([2, 3, 4, 5, 6])
    expect(rage.recovery).toBe('short-rest')
    expect(formatResourceText(rage, 12)).toBe('5 次 · 短休恢复')

    const mastery = barbarianRule2024.checkpoints.find((checkpoint) => checkpoint.candidateKind === 'weapon-mastery')
    if (!mastery) throw new Error('缺少武器精通检查点')
    const boundsAt = (level: number) => getCheckpointSelectionBounds({ ...draft2024(), targetLevel: level }, mastery)
    expect([1, 4, 10, 20].map((level) => boundsAt(level).max)).toEqual([2, 3, 4, 4])
  })

  it('技能与原初学识共享唯一组，防止重复选择', () => {
    const skills = barbarianRule2024.checkpoints.find((checkpoint) => checkpoint.id === 'class-2024-barbarian-skills-1')
    const knowledge = barbarianRule2024.checkpoints.find((checkpoint) => checkpoint.id === 'class-2024-barbarian-primal-knowledge-3')
    expect(skills?.uniqueGroup).toBe('barbarian-skills')
    expect(knowledge?.uniqueGroup).toBe('barbarian-skills')
    expect(skills?.optionIds).toHaveLength(6)
    expect(knowledge?.optionIds).toHaveLength(6)
    expect(skills?.optionIds.every((id) => rulesRepository2024.getOption(id)?.name)).toBe(true)
  })

  it('4 个道途特性等级与结构齐全', () => {
    expect(rulesRepository2024.subclasses.filter((subclass) => subclass.classId === 'class-2024-barbarian' && subclass.sourceIds.includes('source-2024-phb')).map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    const expectations: Readonly<Record<string, readonly number[]>> = {
      [SUBCLASS_IDS[0]]: [3, 6, 10, 14],
      [SUBCLASS_IDS[1]]: [3, 3, 6, 10, 14],
      [SUBCLASS_IDS[2]]: [3, 6, 10, 14],
      [SUBCLASS_IDS[3]]: [3, 3, 6, 10, 14],
    }
    for (const id of SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass?.status).toBe('implemented')
      expect(subclass?.features.map((feature) => feature.level)).toEqual(expectations[id])
      expect(new Set(subclass?.features.map((feature) => feature.id)).size).toBe(subclass?.features.length)
    }
  })

  it('狂热者治疗池与兽心形貌选择登记为结构化数据', () => {
    const zealot = rulesRepository2024.getSubclass(SUBCLASS_IDS[3])
    const pool = zealot?.features.find((feature) => feature.id === 'barbarian-2024-zealot-warrior-of-the-gods')?.resource
    if (!pool) throw new Error('缺少神之勇者治疗池')
    expect([3, 6, 12, 17].map((level) => getResourceMax(pool, level))).toEqual([4, 5, 6, 7])
    expect(formatResourceText(pool, 6)).toBe('5 d12 · 长休恢复')

    const wildHeart = rulesRepository2024.getSubclass(SUBCLASS_IDS[1])
    const aspect = wildHeart?.features.find((feature) => feature.id === 'barbarian-2024-wild-heart-aspect-of-the-wilds')
    expect(aspect?.requiresChoice).toBe(true)
    expect(aspect?.optionIds).toEqual(['barbarian-2024-aspect-owl', 'barbarian-2024-aspect-panther', 'barbarian-2024-aspect-salmon'])
    expect(barbarianOptions2024.every((option) => rulesRepository2024.getOption(option.id))).toBe(true)
  })

  it('道途在时间线上作为子职候选并可生成形貌选择检查点', () => {
    const timeline = buildTimeline('class-2024-barbarian', 6, { ruleset: '5e-2024', enabledSourceIds: [], subclassId: SUBCLASS_IDS[1] })
    const subclass = timeline.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclass?.optionIds).toEqual([...SUBCLASS_IDS])
    const aspect = timeline.find((checkpoint) => checkpoint.id === 'subclass-feature-barbarian-2024-wild-heart-aspect-of-the-wilds')
    expect(aspect?.kind).toBe('subclass-feature')
    expect(aspect?.optionIds).toEqual(['barbarian-2024-aspect-owl', 'barbarian-2024-aspect-panther', 'barbarian-2024-aspect-salmon'])
  })
})
