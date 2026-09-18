import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { monkFeatures2024, monkRule2024, monkSubclasses2024 } from '@/rules/data/monk-2024'
import { classStartingEquipment2024 } from '@/rules/data/starting-equipment-2024'
import { getCheckpointSelectionBounds } from '@/rules/feats'
import { formatDicePoolText, formatResourceText, getDicePoolCount, getDicePoolDie, getResourceMax } from '@/rules/resources'
import { buildTimeline } from '@/rules/timeline'
import { isWeaponTrainingCovered } from '@/rules/weapon-training'
import { draft2024 } from '../fixtures/draft-2024'

const SUBCLASS_IDS = [
  'subclass-2024-monk-warrior-of-mercy',
  'subclass-2024-monk-warrior-of-the-elements',
  'subclass-2024-monk-warrior-of-the-open-hand',
  'subclass-2024-monk-warrior-of-shadow',
] as const

describe('2024 武僧与子职数据（B08-05）', () => {
  it('职业基础字段、无甲防御与武器训练（简易＋轻型军用）', () => {
    const classRule = rulesRepository2024.getClass('class-2024-monk')
    expect(classRule?.status).toBe('implemented')
    expect(classRule?.hitDie).toBe(8)
    expect(classRule?.primaryAbilities).toEqual(['dex', 'wis'])
    expect(classRule?.savingThrowAbilities).toEqual(['str', 'dex'])
    expect(classRule?.armorTraining).toEqual([])
    expect(classRule?.weaponTraining).toEqual({ categories: ['simple'], martialProperties: ['light'] })
    expect(classRule?.unarmoredDefense).toEqual({ ability: 'wis', allowsShield: false })
  })

  it('武器训练覆盖简易与轻型军用，不覆盖其他军用', () => {
    const training = rulesRepository2024.getClass('class-2024-monk')?.weaponTraining
    const item = (id: string) => rulesRepository2024.getEquipment(id)!
    expect(isWeaponTrainingCovered(training, item('equipment-2024-dagger'))).toBe(true)
    expect(isWeaponTrainingCovered(training, item('equipment-2024-club'))).toBe(true)
    expect(isWeaponTrainingCovered(training, item('equipment-2024-shortsword'))).toBe(true)
    expect(isWeaponTrainingCovered(training, item('equipment-2024-hand-crossbow'))).toBe(true)
    expect(isWeaponTrainingCovered(training, item('equipment-2024-longsword'))).toBe(false)
    expect(isWeaponTrainingCovered(training, item('equipment-2024-greataxe'))).toBe(false)
  })

  it('职业特性 21 条、ID 唯一，选择类特性挂检查点', () => {
    expect(monkFeatures2024).toHaveLength(21)
    expect(new Set(monkFeatures2024.map((feature) => feature.id)).size).toBe(21)
    expect(monkFeatures2024.every((feature) => feature.classId === 'class-2024-monk')).toBe(true)
    const choiceFeatures = monkFeatures2024.filter((feature) => feature.requiresChoice)
    expect(choiceFeatures.map((feature) => feature.id)).toEqual([
      'monk-2024-class-subclass',
      'monk-2024-class-epic-boon',
    ])
    expect(choiceFeatures.every((feature) => (feature.checkpointIds?.length ?? 0) > 0)).toBe(true)
  })

  it('功力资源按武僧等级，短休或长休全部恢复', () => {
    const focus = monkFeatures2024.find((feature) => feature.id === 'monk-2024-class-monks-focus')?.resource
    if (!focus) throw new Error('缺少功力资源')
    expect([1, 2, 5, 20].map((level) => getResourceMax(focus, level))).toEqual([0, 2, 5, 20])
    expect(formatResourceText(focus, 2)).toBe('2 次 · 短休恢复')
    expect(focus.recovery).toBe('short-rest')
  })

  it('武艺骰按等级 d6→d8→d10→d12', () => {
    const martialArts = monkFeatures2024.find((feature) => feature.id === 'monk-2024-class-martial-arts')?.dicePool
    if (!martialArts) throw new Error('缺少武艺骰池')
    expect([1, 4, 5, 10, 11, 16, 17, 20].map((level) => getDicePoolDie(martialArts, level))).toEqual([
      'd6', 'd6', 'd8', 'd8', 'd10', 'd10', 'd12', 'd12',
    ])
    expect([1, 20].map((level) => getDicePoolCount(martialArts, level))).toEqual([1, 1])
    expect(formatDicePoolText(martialArts, 5)).toBe('1d8')
    expect(martialArts.recovery).toBe('none')
  })

  it('技能、工具与属性提升检查点登记', () => {
    const skills = monkRule2024.checkpoints.filter((checkpoint) => checkpoint.kind === 'skills')
    expect(skills.map((checkpoint) => checkpoint.id)).toEqual(['class-2024-monk-skills-1'])
    expect(skills[0]?.optionIds).toHaveLength(6)
    expect(skills[0]?.minSelections).toBe(2)

    const tool = monkRule2024.checkpoints.find((checkpoint) => checkpoint.kind === 'class-choice')
    expect(tool?.id).toBe('class-2024-monk-tool-1')
    expect(tool?.optionIds).toEqual(['monk-2024-tool-artisans-tools', 'monk-2024-tool-musical-instrument'])

    expect(monkRule2024.checkpoints.filter((checkpoint) => checkpoint.kind === 'ability-improvement').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-monk-feat-4',
      'class-2024-monk-feat-8',
      'class-2024-monk-feat-12',
      'class-2024-monk-feat-16',
      'class-2024-monk-feat-19',
    ])
  })

  it('4 个子职特性数为 6／5／4／4，等级为 3／6／11／17', () => {
    expect(rulesRepository2024.subclasses.filter((subclass) => subclass.classId === 'class-2024-monk' && subclass.sourceIds.includes('source-2024-phb')).map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    const expectedFeatures = [
      ['subclass-2024-monk-warrior-of-mercy', 6],
      ['subclass-2024-monk-warrior-of-the-elements', 5],
      ['subclass-2024-monk-warrior-of-the-open-hand', 4],
      ['subclass-2024-monk-warrior-of-shadow', 4],
    ] as const
    for (const [id, count] of expectedFeatures) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass?.status).toBe('implemented')
      expect(subclass?.selectionLevel).toBe(3)
      expect(subclass?.features).toHaveLength(count)
      expect(subclass?.features.map((feature) => feature.level)).toEqual(
        count === 5 ? [3, 3, 6, 11, 17] : count === 6 ? [3, 3, 3, 6, 11, 17] : [3, 6, 11, 17],
      )
    }
    expect(monkSubclasses2024).toHaveLength(4)
  })

  it('起始装备 A 为矛／5 匕首／工具选择／探索套组＋11 GP，B 为 50 GP', () => {
    const profile = classStartingEquipment2024.find((item) => item.classId === 'class-2024-monk')
    if (!profile) throw new Error('缺少武僧起始装备')
    const group = profile.groups[0]
    expect(group?.id).toBe('monk-2024-starting')
    const optionA = group?.options.find((option) => option.id === 'monk-2024-a')
    const optionB = group?.options.find((option) => option.id === 'monk-2024-b')
    expect(optionA?.grants.map((grant) => [grant.itemId, grant.quantity])).toEqual([
      ['equipment-2024-spear', 1],
      ['equipment-2024-dagger', 5],
      ['equipment-2024-explorer-s-pack', 1],
    ])
    expect(optionA?.currency?.gp).toBe(11)
    expect(optionA?.pick?.count).toBe(1)
    expect(optionA?.pick?.allowedItemIds).toHaveLength(27)
    expect(optionB?.currency?.gp).toBe(50)
  })

  it('时间线展开技能、工具、子职与属性提升', () => {
    const levelOne = buildTimeline('class-2024-monk', 1, { ruleset: '5e-2024', enabledSourceIds: [] })
    expect(levelOne.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-monk-skills-1',
      'class-2024-monk-tool-1',
    ])

    const levelThree = buildTimeline('class-2024-monk', 3, { ruleset: '5e-2024', enabledSourceIds: [] })
    const subclass = levelThree.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclass?.id).toBe('class-2024-monk-subclass-3')
    expect(subclass?.title).toBe('选择武僧子职')
    expect(subclass?.optionIds).toEqual([...SUBCLASS_IDS])

    const levelTwenty = buildTimeline('class-2024-monk', 20, { ruleset: '5e-2024', enabledSourceIds: [] })
    expect(levelTwenty.filter((checkpoint) => checkpoint.kind === 'ability-improvement').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-monk-feat-4',
      'class-2024-monk-feat-8',
      'class-2024-monk-feat-12',
      'class-2024-monk-feat-16',
      'class-2024-monk-feat-19',
    ])
    expect(getCheckpointSelectionBounds(draft2024({ classId: 'class-2024-monk', targetLevel: 20 }), levelTwenty.find((checkpoint) => checkpoint.id === 'class-2024-monk-feat-19')!).max).toBe(1)
  })

  it('未接入条目不进入候选：子职全部为玩家可用', () => {
    expect(monkSubclasses2024.every((subclass) => subclass.availability === 'player' && subclass.status === 'implemented')).toBe(true)
  })
})
