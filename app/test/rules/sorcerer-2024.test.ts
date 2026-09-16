import { describe, expect, it } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { metamagicOptions2024, METAMAGIC_2024_OPTION_IDS } from '@/rules/data/metamagic-2024'
import { sorcererFeatures2024, sorcererRule2024, sorcererSubclasses2024 } from '@/rules/data/sorcerer-2024'
import { classStartingEquipment2024 } from '@/rules/data/starting-equipment-2024'
import { deriveCharacter } from '@/rules/derive'
import { formatResourceText, getResourceMax } from '@/rules/resources'
import {
  getAlwaysPreparedSpellIds,
  getMaximumSpellLevel,
  getRequiredCantripCount,
  getRequiredSpellCount,
  getSpellcastingConfig,
  getSpellSlots,
} from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import { draft2024 } from '../fixtures/draft-2024'

const SUBCLASS_IDS = [
  'subclass-2024-sorcerer-aberrant-sorcery',
  'subclass-2024-sorcerer-clockwork-sorcery',
  'subclass-2024-sorcerer-draconic-sorcery',
  'subclass-2024-sorcerer-wild-magic-sorcery',
] as const

const sorcererDraft = (overrides: Parameters<typeof draft2024>[0] = {}) =>
  draft2024({ classId: 'class-2024-sorcerer', targetLevel: 1, ...overrides })

describe('2024 术士与 4 术法数据（B08-09）', () => {
  it('职业基础字段、护甲与武器训练', () => {
    const classRule = rulesRepository2024.getClass('class-2024-sorcerer')
    expect(classRule?.status).toBe('implemented')
    expect(classRule?.hitDie).toBe(6)
    expect(classRule?.primaryAbilities).toEqual(['cha'])
    expect(classRule?.savingThrowAbilities).toEqual(['con', 'cha'])
    expect(classRule?.armorTraining).toEqual([])
    expect(classRule?.weaponTraining).toEqual({ categories: ['simple'] })
  })

  it('职业特性 9 条、ID 唯一，选择类特性挂检查点', () => {
    expect(sorcererFeatures2024).toHaveLength(9)
    expect(new Set(sorcererFeatures2024.map((feature) => feature.id)).size).toBe(9)
    expect(sorcererFeatures2024.every((feature) => feature.classId === 'class-2024-sorcerer')).toBe(true)
    const choiceFeatures = sorcererFeatures2024.filter((feature) => feature.requiresChoice)
    expect(choiceFeatures.map((feature) => feature.id)).toEqual([
      'sorcerer-2024-class-metamagic',
      'sorcerer-2024-class-subclass',
      'sorcerer-2024-class-epic-boon',
    ])
    expect(choiceFeatures.every((feature) => (feature.checkpointIds?.length ?? 0) > 0)).toBe(true)
  })

  it('术法点与先天术法资源按等级登记', () => {
    const font = sorcererFeatures2024.find((feature) => feature.id === 'sorcerer-2024-class-font-of-magic')?.resource
    if (!font) throw new Error('缺少术法点资源')
    expect([1, 2, 5, 20].map((level) => getResourceMax(font, level))).toEqual([0, 2, 5, 20])
    expect(formatResourceText(font, 2)).toBe('2 次 · 长休恢复')

    const innate = sorcererFeatures2024.find((feature) => feature.id === 'sorcerer-2024-class-innate-sorcery')?.resource
    if (!innate) throw new Error('缺少先天术法资源')
    expect([1, 20].map((level) => getResourceMax(innate, level))).toEqual([2, 2])
    expect(innate.recovery).toBe('long-rest')
  })

  it('2024 超魔选项 10 项、消耗登记、与 2014 隔离', () => {
    expect(metamagicOptions2024).toHaveLength(10)
    expect(METAMAGIC_2024_OPTION_IDS).toHaveLength(10)
    expect(metamagicOptions2024.every((option) => option.sorceryPointCost && option.sorceryPointCost > 0)).toBe(true)
    const cost = (id: string) => metamagicOptions2024.find((option) => option.id === id)?.sorceryPointCost
    expect(cost('metamagic-2024-careful')).toBe(1)
    expect(cost('metamagic-2024-heightened')).toBe(2)
    expect(cost('metamagic-2024-quickened')).toBe(2)
    expect(cost('metamagic-2024-twinned')).toBe(1)

    expect(rulesRepository2024.getOption('metamagic-2024-careful')?.sourceIds).toEqual(['source-2024-phb'])
    expect(rulesRepository.getOption('metamagic-2024-careful')).toBeUndefined()
    expect(rulesRepository2024.getOption('metamagic-careful')).toBeUndefined()
  })

  it('超魔检查点在 2／10／17 级各选 2 项且不可重复', () => {
    expect(sorcererRule2024.checkpoints.filter((checkpoint) => checkpoint.id.startsWith('class-2024-sorcerer-metamagic-')).map((checkpoint) => [checkpoint.id, checkpoint.level, checkpoint.minSelections, checkpoint.maxSelections, checkpoint.uniqueGroup])).toEqual([
      ['class-2024-sorcerer-metamagic-2', 2, 2, 2, 'sorcerer-metamagic-2024'],
      ['class-2024-sorcerer-metamagic-10', 10, 2, 2, 'sorcerer-metamagic-2024'],
      ['class-2024-sorcerer-metamagic-17', 17, 2, 2, 'sorcerer-metamagic-2024'],
    ])
  })

  it('施法配置为魅力准备制，准备数量、戏法与法术位按职业表', () => {
    const config = getSpellcastingConfig({ classId: 'class-2024-sorcerer', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少术士施法配置')
    expect(config.mode).toBe('prepared')
    expect(config.ability).toBe('cha')
    expect(getRequiredSpellCount(sorcererDraft({ targetLevel: 1 }), config)).toBe(2)
    expect(getRequiredSpellCount(sorcererDraft({ targetLevel: 20 }), config)).toBe(22)
    expect(getRequiredCantripCount(sorcererDraft({ targetLevel: 1 }), config)).toBe(4)
    expect(getRequiredCantripCount(sorcererDraft({ targetLevel: 4 }), config)).toBe(5)
    expect(getRequiredCantripCount(sorcererDraft({ targetLevel: 10 }), config)).toBe(6)
    expect(getMaximumSpellLevel(config, 3)).toBe(2)
    expect(getSpellSlots(config, 1).map((slot) => [slot.level, slot.count])).toEqual([[1, 2]])
    expect(getSpellSlots(config, 3).map((slot) => [slot.level, slot.count])).toEqual([[1, 4], [2, 2]])
  })

  it('4 个术法特性数量与等级节点正确', () => {
    expect(rulesRepository2024.subclasses.filter((subclass) => subclass.classId === 'class-2024-sorcerer').map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    const expected: Readonly<Record<(typeof SUBCLASS_IDS)[number], readonly number[]>> = {
      'subclass-2024-sorcerer-aberrant-sorcery': [3, 3, 6, 6, 14, 18],
      'subclass-2024-sorcerer-clockwork-sorcery': [3, 3, 6, 14, 18],
      'subclass-2024-sorcerer-draconic-sorcery': [3, 3, 6, 14, 18],
      'subclass-2024-sorcerer-wild-magic-sorcery': [3, 3, 6, 14, 18],
    }
    for (const id of SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass?.status).toBe('implemented')
      expect(subclass?.selectionLevel).toBe(3)
      expect(subclass?.features.map((feature) => feature.level)).toEqual(expected[id])
    }
    expect(sorcererSubclasses2024).toHaveLength(4)
  })

  it('子职法术经始终准备通道按等级生效', () => {
    const clockwork = sorcererDraft({ subclassId: 'subclass-2024-sorcerer-clockwork-sorcery', targetLevel: 3 })
    expect(getAlwaysPreparedSpellIds(clockwork)).toEqual(expect.arrayContaining([
      'spell-2024-aid', 'spell-2024-alarm', 'spell-2024-lesser-restoration', 'spell-2024-protection-from-evil-and-good',
    ]))
    expect(getAlwaysPreparedSpellIds(clockwork)).not.toContain('spell-2024-dispel-magic')
    const clockworkFive = sorcererDraft({ subclassId: 'subclass-2024-sorcerer-clockwork-sorcery', targetLevel: 5 })
    expect(getAlwaysPreparedSpellIds(clockworkFive)).toContain('spell-2024-dispel-magic')

    const aberrant = sorcererDraft({ subclassId: 'subclass-2024-sorcerer-aberrant-sorcery', targetLevel: 3 })
    expect(getAlwaysPreparedSpellIds(aberrant)).toContain('spell-2024-mind-sliver')

    const draconic = sorcererDraft({ subclassId: 'subclass-2024-sorcerer-draconic-sorcery', targetLevel: 3 })
    expect(getAlwaysPreparedSpellIds(draconic)).toContain('spell-2024-chromatic-orb')

    const wild = sorcererDraft({ subclassId: 'subclass-2024-sorcerer-wild-magic-sorcery', targetLevel: 3 })
    expect(getAlwaysPreparedSpellIds(wild)).toEqual([])
  })

  it('龙族体魄：未着甲 AC＝10＋敏捷＋魅力，生命值上限 3 级起 +等级', () => {
    const draconic = draft2024({
      classId: 'class-2024-sorcerer',
      subclassId: 'subclass-2024-sorcerer-draconic-sorcery',
      targetLevel: 3,
      baseAbilities: { str: 10, dex: 14, con: 13, int: 8, wis: 12, cha: 16 },
    })
    expect(deriveCharacter(draconic).armorClass.value).toBe(15)

    const wild = draft2024({
      classId: 'class-2024-sorcerer',
      subclassId: 'subclass-2024-sorcerer-wild-magic-sorcery',
      targetLevel: 3,
      baseAbilities: { str: 10, dex: 14, con: 13, int: 8, wis: 12, cha: 16 },
    })
    expect(deriveCharacter(draconic).hitPoints.value - deriveCharacter(wild).hitPoints.value).toBe(3)

    const draconicTwo = draft2024({
      classId: 'class-2024-sorcerer',
      subclassId: 'subclass-2024-sorcerer-draconic-sorcery',
      targetLevel: 2,
      baseAbilities: { str: 10, dex: 14, con: 13, int: 8, wis: 12, cha: 16 },
    })
    const wildTwo = draft2024({
      classId: 'class-2024-sorcerer',
      subclassId: 'subclass-2024-sorcerer-wild-magic-sorcery',
      targetLevel: 2,
      baseAbilities: { str: 10, dex: 14, con: 13, int: 8, wis: 12, cha: 16 },
    })
    expect(deriveCharacter(draconicTwo).hitPoints.value).toBe(deriveCharacter(wildTwo).hitPoints.value)
  })

  it('起始装备 A 为矛／2 匕首／水晶／地城套组＋28 GP，B 为 50 GP', () => {
    const profile = classStartingEquipment2024.find((item) => item.classId === 'class-2024-sorcerer')
    if (!profile) throw new Error('缺少术士起始装备')
    const group = profile.groups[0]
    const optionA = group?.options.find((option) => option.id === 'sorcerer-2024-a')
    const optionB = group?.options.find((option) => option.id === 'sorcerer-2024-b')
    expect(optionA?.grants.map((grant) => [grant.itemId, grant.quantity])).toEqual([
      ['equipment-2024-spear', 1],
      ['equipment-2024-dagger', 2],
      ['equipment-2024-crystal', 1],
      ['equipment-2024-dungeoneer-s-pack', 1],
    ])
    expect(optionA?.currency?.gp).toBe(28)
    expect(optionB?.currency?.gp).toBe(50)
  })

  it('时间线展开技能、超魔、子职与属性提升', () => {
    const levelOne = buildTimeline('class-2024-sorcerer', 1, { ruleset: '5e-2024' })
    expect(levelOne.map((checkpoint) => checkpoint.id)).toEqual(['class-2024-sorcerer-skills-1'])

    const levelTwo = buildTimeline('class-2024-sorcerer', 2, { ruleset: '5e-2024' })
    expect(levelTwo.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-sorcerer-skills-1',
      'class-2024-sorcerer-metamagic-2',
    ])
    expect(levelTwo.find((checkpoint) => checkpoint.id === 'class-2024-sorcerer-metamagic-2')?.optionIds).toEqual([...METAMAGIC_2024_OPTION_IDS])

    const levelThree = buildTimeline('class-2024-sorcerer', 3, { ruleset: '5e-2024' })
    const subclass = levelThree.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclass?.id).toBe('class-2024-sorcerer-subclass-3')
    expect(subclass?.optionIds).toEqual([...SUBCLASS_IDS])

    const levelTwenty = buildTimeline('class-2024-sorcerer', 20, { ruleset: '5e-2024' })
    expect(levelTwenty.filter((checkpoint) => checkpoint.kind === 'class-choice').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-sorcerer-metamagic-2',
      'class-2024-sorcerer-metamagic-10',
      'class-2024-sorcerer-metamagic-17',
    ])
    expect(levelTwenty.filter((checkpoint) => checkpoint.kind === 'ability-improvement').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-sorcerer-feat-4',
      'class-2024-sorcerer-feat-8',
      'class-2024-sorcerer-feat-12',
      'class-2024-sorcerer-feat-16',
      'class-2024-sorcerer-feat-19',
    ])
  })
})
