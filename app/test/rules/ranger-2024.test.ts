import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { rangerFeatures2024, rangerRule2024, rangerSubclasses2024 } from '@/rules/data/ranger-2024'
import { classStartingEquipment2024 } from '@/rules/data/starting-equipment-2024'
import { getCheckpointSelectionBounds } from '@/rules/feats'
import { getAlwaysPreparedSpellIds, getCheckpointCandidates, getMaximumSpellLevel, getRequiredSpellCount, getSpellcastingConfig, getSpellSlots } from '@/rules/spellcasting'
import { formatResourceText, getResourceMax } from '@/rules/resources'
import { buildTimeline } from '@/rules/timeline'
import { draft2024, selection } from '../fixtures/draft-2024'

const SUBCLASS_IDS = [
  'subclass-2024-ranger-beast-master',
  'subclass-2024-ranger-fey-wanderer',
  'subclass-2024-ranger-gloom-stalker',
  'subclass-2024-ranger-hunter',
] as const

const rangerDraft = (overrides: Parameters<typeof draft2024>[0] = {}) =>
  draft2024({ classId: 'class-2024-ranger', targetLevel: 1, ...overrides })

describe('2024 游侠与 4 范型数据（B08-12）', () => {
  it('职业基础字段、护甲与武器训练', () => {
    const classRule = rulesRepository2024.getClass('class-2024-ranger')
    expect(classRule?.status).toBe('implemented')
    expect(classRule?.hitDie).toBe(10)
    expect(classRule?.primaryAbilities).toEqual(['dex', 'wis'])
    expect(classRule?.savingThrowAbilities).toEqual(['str', 'dex'])
    expect(classRule?.armorTraining).toEqual(['light', 'medium', 'shield'])
    expect(classRule?.weaponTraining).toEqual({ categories: ['simple', 'martial'] })
  })

  it('职业特性 16 条、ID 唯一，选择类特性挂检查点', () => {
    expect(rangerFeatures2024).toHaveLength(16)
    expect(new Set(rangerFeatures2024.map((feature) => feature.id)).size).toBe(16)
    expect(rangerFeatures2024.every((feature) => feature.classId === 'class-2024-ranger')).toBe(true)
    const choiceFeatures = rangerFeatures2024.filter((feature) => feature.requiresChoice)
    expect(choiceFeatures.map((feature) => feature.id)).toEqual([
      'ranger-2024-class-weapon-mastery',
      'ranger-2024-class-deft-explorer',
      'ranger-2024-class-fighting-style',
      'ranger-2024-class-subclass',
      'ranger-2024-class-expertise',
      'ranger-2024-class-epic-boon',
    ])
    expect(choiceFeatures.every((feature) => (feature.checkpointIds?.length ?? 0) > 0)).toBe(true)
  })

  it('宿敌与不知疲倦／自然面纱资源按等级登记', () => {
    const favored = rangerFeatures2024.find((feature) => feature.id === 'ranger-2024-class-favored-enemy')?.resource
    if (!favored) throw new Error('缺少宿敌资源')
    expect([1, 5, 9, 13, 17, 20].map((level) => getResourceMax(favored, level))).toEqual([2, 3, 4, 5, 6, 6])
    expect(formatResourceText(favored, 1)).toBe('2 次 · 长休恢复')

    const tireless = rangerFeatures2024.find((feature) => feature.id === 'ranger-2024-class-tireless')?.resource
    if (!tireless) throw new Error('缺少不知疲倦资源')
    expect(tireless.maxFromAbility).toEqual({ ability: 'wis', minimum: 1 })
    expect(getResourceMax(tireless, 10, 3)).toBe(3)
    expect(getResourceMax(tireless, 10, -2)).toBe(1)

    const veil = rangerFeatures2024.find((feature) => feature.id === 'ranger-2024-class-natures-veil')?.resource
    expect(veil?.maxFromAbility).toEqual({ ability: 'wis', minimum: 1 })
  })

  it('半施法者施法配置：准备数量与法术位按职业表', () => {
    const config = getSpellcastingConfig({ classId: 'class-2024-ranger', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少游侠施法配置')
    expect(config.mode).toBe('prepared')
    expect(config.ability).toBe('wis')
    expect(getRequiredSpellCount(rangerDraft({ targetLevel: 1 }), config)).toBe(2)
    expect(getRequiredSpellCount(rangerDraft({ targetLevel: 20 }), config)).toBe(15)
    expect(getMaximumSpellLevel(config, 1)).toBe(0)
    expect(getMaximumSpellLevel(config, 2)).toBe(1)
    expect(getMaximumSpellLevel(config, 5)).toBe(2)
    expect(getMaximumSpellLevel(config, 20)).toBe(5)
    expect(getSpellSlots(config, 1)).toEqual([])
    expect(getSpellSlots(config, 2).map((slot) => [slot.level, slot.count])).toEqual([[1, 2]])
    expect(getSpellSlots(config, 9).map((slot) => [slot.level, slot.count])).toEqual([[1, 4], [2, 3], [3, 2]])
  })

  it('猎人印记始终准备', () => {
    expect(getAlwaysPreparedSpellIds(rangerDraft({ targetLevel: 1 }))).toContain('spell-2024-hunter-s-mark')
  })

  it('技能、武器精通、专精与战斗风格检查点登记', () => {
    const skills = rangerRule2024.checkpoints.find((checkpoint) => checkpoint.kind === 'skills')
    expect(skills?.optionIds).toHaveLength(8)
    expect(skills?.minSelections).toBe(3)

    const mastery = rangerRule2024.checkpoints.find((checkpoint) => checkpoint.candidateKind === 'weapon-mastery')
    if (!mastery) throw new Error('缺少武器精通检查点')
    expect(mastery.weaponMasteryFilter).toBe('proficient')
    expect(getCheckpointSelectionBounds(rangerDraft(), mastery).max).toBe(2)
    expect(getCheckpointCandidates(rangerDraft(), mastery)).toContain('equipment-2024-longbow')

    const expertise = rangerRule2024.checkpoints.filter((checkpoint) => checkpoint.kind === 'expertise')
    expect(expertise.map((checkpoint) => [checkpoint.id, checkpoint.minSelections])).toEqual([
      ['class-2024-ranger-expertise-2', 1],
      ['class-2024-ranger-expertise-9', 2],
    ])
    expect(rangerRule2024.checkpoints.find((checkpoint) => checkpoint.kind === 'fighting-style')?.level).toBe(2)
  })

  it('4 个范型特性数量与等级节点正确，范型法术始终准备', () => {
    expect(rulesRepository2024.subclasses.filter((subclass) => subclass.classId === 'class-2024-ranger').map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    const expected: Readonly<Record<(typeof SUBCLASS_IDS)[number], readonly number[]>> = {
      'subclass-2024-ranger-beast-master': [3, 7, 11, 15],
      'subclass-2024-ranger-fey-wanderer': [3, 3, 3, 7, 11, 15],
      'subclass-2024-ranger-gloom-stalker': [3, 3, 3, 7, 11, 15],
      'subclass-2024-ranger-hunter': [3, 3, 7, 11, 15],
    }
    for (const id of SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass?.status).toBe('implemented')
      expect(subclass?.selectionLevel).toBe(3)
      expect(subclass?.features.map((feature) => feature.level)).toEqual(expected[id])
    }
    for (const id of SUBCLASS_IDS) {
      for (const spellId of Object.values(rulesRepository2024.getSubclass(id)?.alwaysPreparedSpellIdsByLevel ?? {}).flat()) {
        expect(rulesRepository2024.getSpell(spellId), spellId).toBeDefined()
      }
    }
    expect(rangerSubclasses2024).toHaveLength(4)
  })

  it('妖精漫游者与幽域追猎者法术按等级生效', () => {
    const fey = rangerDraft({ subclassId: 'subclass-2024-ranger-fey-wanderer', targetLevel: 3 })
    expect(getAlwaysPreparedSpellIds(fey)).toContain('spell-2024-charm-person')
    expect(getAlwaysPreparedSpellIds(fey)).not.toContain('spell-2024-misty-step')
    const feyAtNine = rangerDraft({ subclassId: 'subclass-2024-ranger-fey-wanderer', targetLevel: 9 })
    expect(getAlwaysPreparedSpellIds(feyAtNine)).toContain('spell-2024-summon-fey')

    const gloom = rangerDraft({ subclassId: 'subclass-2024-ranger-gloom-stalker', targetLevel: 3 })
    expect(getAlwaysPreparedSpellIds(gloom)).toContain('spell-2024-disguise-self')
    expect(rulesRepository2024.getOption('hunter-2024-prey-colossus-slayer')).toBeDefined()
  })

  it('猎人范型选择项登记并可通过校验', () => {
    const draft = rangerDraft({
      subclassId: 'subclass-2024-ranger-hunter',
      targetLevel: 3,
      selections: [
        selection('class-2024-ranger-skills-1', ['skill-perception', 'skill-stealth', 'skill-survival']),
        selection('class-2024-ranger-expertise-2', ['skill-perception']),
        selection('subclass-feature-ranger-2024-hunter-hunters-prey', ['hunter-2024-prey-colossus-slayer']),
      ],
    })
    const timeline = buildTimeline('class-2024-ranger', 3, { ruleset: '5e-2024', subclassId: 'subclass-2024-ranger-hunter' })
    const prey = timeline.find((checkpoint) => checkpoint.id === 'subclass-feature-ranger-2024-hunter-hunters-prey')
    expect(prey?.optionIds).toEqual(['hunter-2024-prey-colossus-slayer', 'hunter-2024-prey-horde-breaker'])
    expect(draft.selections.flatMap((item) => item.optionIds)).toContain('hunter-2024-prey-colossus-slayer')
  })

  it('起始装备 A 为镶钉皮甲／弯刀／短剑／长弓／20 箭矢／箭袋／槲寄生／探索套组＋7 GP，B 为 150 GP', () => {
    const profile = classStartingEquipment2024.find((item) => item.classId === 'class-2024-ranger')
    if (!profile) throw new Error('缺少游侠起始装备')
    const group = profile.groups[0]
    const optionA = group?.options.find((option) => option.id === 'ranger-2024-a')
    const optionB = group?.options.find((option) => option.id === 'ranger-2024-b')
    expect(optionA?.grants.map((grant) => [grant.itemId, grant.quantity])).toEqual([
      ['equipment-2024-studded-leather-armor', 1],
      ['equipment-2024-scimitar', 1],
      ['equipment-2024-shortsword', 1],
      ['equipment-2024-longbow', 1],
      ['equipment-2024-ammunition', 20],
      ['equipment-2024-quiver', 1],
      ['equipment-2024-sprig-of-mistletoe', 1],
      ['equipment-2024-explorer-s-pack', 1],
    ])
    expect(optionA?.currency?.gp).toBe(7)
    expect(optionB?.currency?.gp).toBe(150)
  })

  it('时间线展开技能、武器精通、战斗风格、子职与属性提升', () => {
    const levelOne = buildTimeline('class-2024-ranger', 1, { ruleset: '5e-2024' })
    expect(levelOne.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-ranger-skills-1',
      'class-2024-ranger-mastery-1',
    ])

    const levelThree = buildTimeline('class-2024-ranger', 3, { ruleset: '5e-2024' })
    const subclass = levelThree.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclass?.id).toBe('class-2024-ranger-subclass-3')
    expect(subclass?.optionIds).toEqual([...SUBCLASS_IDS])

    const levelTwenty = buildTimeline('class-2024-ranger', 20, { ruleset: '5e-2024' })
    expect(levelTwenty.filter((checkpoint) => checkpoint.kind === 'ability-improvement').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-ranger-feat-4',
      'class-2024-ranger-feat-8',
      'class-2024-ranger-feat-12',
      'class-2024-ranger-feat-16',
      'class-2024-ranger-feat-19',
    ])
    expect(rangerRule2024.spellcasting?.alwaysPreparedSpellIdsByLevel).toEqual({ 1: ['spell-2024-hunter-s-mark'] })
  })
})
