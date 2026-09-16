import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { paladinFeatures2024, paladinRule2024, paladinSubclasses2024 } from '@/rules/data/paladin-2024'
import { classStartingEquipment2024 } from '@/rules/data/starting-equipment-2024'
import { getCheckpointSelectionBounds } from '@/rules/feats'
import { getAlwaysPreparedSpellIds, getCheckpointCandidates, getMaximumSpellLevel, getRequiredSpellCount, getSpellcastingConfig, getSpellSlots } from '@/rules/spellcasting'
import { formatResourceText, getResourceMax } from '@/rules/resources'
import { buildTimeline } from '@/rules/timeline'
import { draft2024, selection } from '../fixtures/draft-2024'

const SUBCLASS_IDS = [
  'subclass-2024-paladin-oath-of-devotion',
  'subclass-2024-paladin-oath-of-glory',
  'subclass-2024-paladin-oath-of-the-ancients',
  'subclass-2024-paladin-oath-of-vengeance',
] as const

const paladinDraft = (overrides: Parameters<typeof draft2024>[0] = {}) =>
  draft2024({ classId: 'class-2024-paladin', targetLevel: 1, ...overrides })

describe('2024 圣武士与 4 誓言数据（B08-11）', () => {
  it('职业基础字段、护甲与武器训练', () => {
    const classRule = rulesRepository2024.getClass('class-2024-paladin')
    expect(classRule?.status).toBe('implemented')
    expect(classRule?.hitDie).toBe(10)
    expect(classRule?.primaryAbilities).toEqual(['str', 'cha'])
    expect(classRule?.savingThrowAbilities).toEqual(['wis', 'cha'])
    expect(classRule?.armorTraining).toEqual(['light', 'medium', 'heavy', 'shield'])
    expect(classRule?.weaponTraining).toEqual({ categories: ['simple', 'martial'] })
  })

  it('职业特性 16 条、ID 唯一，选择类特性挂检查点', () => {
    expect(paladinFeatures2024).toHaveLength(16)
    expect(new Set(paladinFeatures2024.map((feature) => feature.id)).size).toBe(16)
    expect(paladinFeatures2024.every((feature) => feature.classId === 'class-2024-paladin')).toBe(true)
    const choiceFeatures = paladinFeatures2024.filter((feature) => feature.requiresChoice)
    expect(choiceFeatures.map((feature) => feature.id)).toEqual([
      'paladin-2024-class-weapon-mastery',
      'paladin-2024-class-fighting-style',
      'paladin-2024-class-subclass',
      'paladin-2024-class-epic-boon',
    ])
    expect(choiceFeatures.every((feature) => (feature.checkpointIds?.length ?? 0) > 0)).toBe(true)
  })

  it('圣疗池与引导神力资源按等级登记', () => {
    const layOnHands = paladinFeatures2024.find((feature) => feature.id === 'paladin-2024-class-lay-on-hands')?.resource
    if (!layOnHands) throw new Error('缺少圣疗资源')
    expect([1, 10, 20].map((level) => getResourceMax(layOnHands, level))).toEqual([5, 50, 100])
    expect(formatResourceText(layOnHands, 10)).toBe('50 点治疗量 · 长休恢复')

    const channel = paladinFeatures2024.find((feature) => feature.id === 'paladin-2024-class-channel-divinity')?.resource
    if (!channel) throw new Error('缺少引导神力资源')
    expect([1, 3, 10, 11, 20].map((level) => getResourceMax(channel, level))).toEqual([0, 2, 2, 3, 3])
    expect(channel.recovery).toBe('short-rest')
  })

  it('半施法者施法配置：准备数量与法术位按职业表', () => {
    const config = getSpellcastingConfig({ classId: 'class-2024-paladin', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少圣武士施法配置')
    expect(config.mode).toBe('prepared')
    expect(config.ability).toBe('cha')
    expect(getRequiredSpellCount(paladinDraft({ targetLevel: 1 }), config)).toBe(2)
    expect(getRequiredSpellCount(paladinDraft({ targetLevel: 20 }), config)).toBe(15)
    expect(getMaximumSpellLevel(config, 1)).toBe(0)
    expect(getMaximumSpellLevel(config, 2)).toBe(1)
    expect(getMaximumSpellLevel(config, 5)).toBe(2)
    expect(getMaximumSpellLevel(config, 20)).toBe(5)
    expect(getSpellSlots(config, 1)).toEqual([])
    expect(getSpellSlots(config, 2).map((slot) => [slot.level, slot.count])).toEqual([[1, 2]])
    expect(getSpellSlots(config, 5).map((slot) => [slot.level, slot.count])).toEqual([[1, 4], [2, 2]])
    expect(getSpellSlots(config, 20).map((slot) => [slot.level, slot.count])).toEqual([[1, 4], [2, 3], [3, 3], [4, 3], [5, 2]])
  })

  it('圣武斩与信实坐骑始终准备', () => {
    expect(getAlwaysPreparedSpellIds(paladinDraft({ targetLevel: 1 }))).not.toContain('spell-2024-divine-smite')
    expect(getAlwaysPreparedSpellIds(paladinDraft({ targetLevel: 2 }))).toContain('spell-2024-divine-smite')
    expect(getAlwaysPreparedSpellIds(paladinDraft({ targetLevel: 4 }))).not.toContain('spell-2024-find-steed')
    expect(getAlwaysPreparedSpellIds(paladinDraft({ targetLevel: 5 }))).toContain('spell-2024-find-steed')
  })

  it('技能、武器精通与战斗风格检查点登记', () => {
    const skills = paladinRule2024.checkpoints.find((checkpoint) => checkpoint.kind === 'skills')
    expect(skills?.optionIds).toHaveLength(6)
    expect(skills?.minSelections).toBe(2)

    const mastery = paladinRule2024.checkpoints.find((checkpoint) => checkpoint.candidateKind === 'weapon-mastery')
    if (!mastery) throw new Error('缺少武器精通检查点')
    expect(mastery.weaponMasteryFilter).toBe('proficient')
    expect(getCheckpointSelectionBounds(paladinDraft(), mastery).max).toBe(2)
    const candidates = getCheckpointCandidates(paladinDraft(), mastery)
    expect(candidates).toContain('equipment-2024-longsword')
    expect(candidates).toContain('equipment-2024-javelin')

    const style = paladinRule2024.checkpoints.find((checkpoint) => checkpoint.kind === 'fighting-style')
    expect(style?.id).toBe('class-2024-paladin-style-2')
    expect(style?.level).toBe(2)
    expect(style?.featCategories).toEqual(['fighting-style'])
  })

  it('4 个誓言特性数量与等级节点正确，誓言法术始终准备', () => {
    expect(rulesRepository2024.subclasses.filter((subclass) => subclass.classId === 'class-2024-paladin').map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    const expected: Readonly<Record<(typeof SUBCLASS_IDS)[number], readonly number[]>> = {
      'subclass-2024-paladin-oath-of-devotion': [3, 3, 7, 15, 20],
      'subclass-2024-paladin-oath-of-glory': [3, 3, 3, 7, 15, 20],
      'subclass-2024-paladin-oath-of-the-ancients': [3, 3, 7, 15, 20],
      'subclass-2024-paladin-oath-of-vengeance': [3, 3, 7, 15, 20],
    }
    for (const id of SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass?.status).toBe('implemented')
      expect(subclass?.selectionLevel).toBe(3)
      expect(subclass?.features.map((feature) => feature.level)).toEqual(expected[id])
      const spellLevels = Object.keys(subclass?.alwaysPreparedSpellIdsByLevel ?? {}).map(Number)
      expect(spellLevels).toEqual([3, 5, 9, 13, 17])
      for (const spellId of Object.values(subclass?.alwaysPreparedSpellIdsByLevel ?? {}).flat()) {
        expect(rulesRepository2024.getSpell(spellId), spellId).toBeDefined()
      }
    }
    expect(paladinSubclasses2024).toHaveLength(4)
  })

  it('誓言法术按等级生效且不占准备上限', () => {
    const devotion = paladinDraft({ subclassId: 'subclass-2024-paladin-oath-of-devotion', targetLevel: 3 })
    expect(getAlwaysPreparedSpellIds(devotion)).toEqual(expect.arrayContaining([
      'spell-2024-protection-from-evil-and-good', 'spell-2024-shield-of-faith',
    ]))
    expect(getAlwaysPreparedSpellIds(devotion)).not.toContain('spell-2024-aid')
    const devotionAtFive = paladinDraft({ subclassId: 'subclass-2024-paladin-oath-of-devotion', targetLevel: 5 })
    expect(getAlwaysPreparedSpellIds(devotionAtFive)).toContain('spell-2024-aid')

    const vengeance = paladinDraft({ subclassId: 'subclass-2024-paladin-oath-of-vengeance', targetLevel: 3 })
    expect(getAlwaysPreparedSpellIds(vengeance)).toContain('spell-2024-hunter-s-mark')
  })

  it('起始装备 A 为链甲／盾牌／长剑／6 标枪／圣徽／祭司套组＋9 GP，B 为 150 GP', () => {
    const profile = classStartingEquipment2024.find((item) => item.classId === 'class-2024-paladin')
    if (!profile) throw new Error('缺少圣武士起始装备')
    const group = profile.groups[0]
    const optionA = group?.options.find((option) => option.id === 'paladin-2024-a')
    const optionB = group?.options.find((option) => option.id === 'paladin-2024-b')
    expect(optionA?.grants.map((grant) => [grant.itemId, grant.quantity])).toEqual([
      ['equipment-2024-chain-mail', 1],
      ['equipment-2024-shield', 1],
      ['equipment-2024-longsword', 1],
      ['equipment-2024-javelin', 6],
      ['equipment-2024-holy-symbol', 1],
      ['equipment-2024-priest-s-pack', 1],
    ])
    expect(optionA?.currency?.gp).toBe(9)
    expect(optionB?.currency?.gp).toBe(150)
  })

  it('时间线展开技能、武器精通、战斗风格、子职与属性提升', () => {
    const levelOne = buildTimeline('class-2024-paladin', 1, { ruleset: '5e-2024' })
    expect(levelOne.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-paladin-skills-1',
      'class-2024-paladin-mastery-1',
    ])

    const levelTwo = buildTimeline('class-2024-paladin', 2, { ruleset: '5e-2024' })
    expect(levelTwo.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-paladin-skills-1',
      'class-2024-paladin-mastery-1',
      'class-2024-paladin-style-2',
    ])

    const levelThree = buildTimeline('class-2024-paladin', 3, { ruleset: '5e-2024' })
    const subclass = levelThree.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclass?.id).toBe('class-2024-paladin-subclass-3')
    expect(subclass?.optionIds).toEqual([...SUBCLASS_IDS])

    const levelTwenty = buildTimeline('class-2024-paladin', 20, { ruleset: '5e-2024' })
    expect(levelTwenty.filter((checkpoint) => checkpoint.kind === 'ability-improvement').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-paladin-feat-4',
      'class-2024-paladin-feat-8',
      'class-2024-paladin-feat-12',
      'class-2024-paladin-feat-16',
      'class-2024-paladin-feat-19',
    ])
    expect(paladinRule2024.spellcasting?.alwaysPreparedSpellIdsByLevel).toEqual({
      2: ['spell-2024-divine-smite'],
      5: ['spell-2024-find-steed'],
    })
    expect(selection('class-2024-paladin-skills-1', ['skill-athletics', 'skill-religion']).optionIds).toHaveLength(2)
  })
})
