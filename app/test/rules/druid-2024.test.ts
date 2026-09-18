import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { druidFeatures2024, druidOptions2024, druidRule2024, druidSubclasses2024 } from '@/rules/data/druid-2024'
import { classStartingEquipment2024 } from '@/rules/data/starting-equipment-2024'
import { collectArmorTrainings } from '@/rules/feats'
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
import { deriveWeaponAttack } from '@/rules/weapon-attacks'
import { deriveCharacter } from '@/rules/derive'
import { draft2024, selection } from '../fixtures/draft-2024'

const SUBCLASS_IDS = [
  'subclass-2024-druid-circle-of-the-land',
  'subclass-2024-druid-circle-of-the-stars',
  'subclass-2024-druid-circle-of-the-moon',
  'subclass-2024-druid-circle-of-the-sea',
] as const

const LAND_CHECKPOINT_ID = 'subclass-feature-druid-2024-land-circle-spells'

const druidDraft = (overrides: Parameters<typeof draft2024>[0] = {}) =>
  draft2024({ classId: 'class-2024-druid', targetLevel: 1, ...overrides })

describe('2024 德鲁伊与 4 结社数据（B08-07）', () => {
  it('职业基础字段、护甲与武器训练', () => {
    const classRule = rulesRepository2024.getClass('class-2024-druid')
    expect(classRule?.status).toBe('implemented')
    expect(classRule?.hitDie).toBe(8)
    expect(classRule?.primaryAbilities).toEqual(['wis'])
    expect(classRule?.savingThrowAbilities).toEqual(['int', 'wis'])
    expect(classRule?.armorTraining).toEqual(['light', 'shield'])
    expect(classRule?.weaponTraining).toEqual({ categories: ['simple'] })
  })

  it('职业特性 12 条、ID 唯一，选择类特性挂检查点', () => {
    expect(druidFeatures2024).toHaveLength(12)
    expect(new Set(druidFeatures2024.map((feature) => feature.id)).size).toBe(12)
    expect(druidFeatures2024.every((feature) => feature.classId === 'class-2024-druid')).toBe(true)
    const choiceFeatures = druidFeatures2024.filter((feature) => feature.requiresChoice)
    expect(choiceFeatures.map((feature) => feature.id)).toEqual([
      'druid-2024-class-primal-order',
      'druid-2024-class-subclass',
      'druid-2024-class-elemental-fury',
      'druid-2024-class-epic-boon',
    ])
    expect(choiceFeatures.every((feature) => (feature.checkpointIds?.length ?? 0) > 0)).toBe(true)
  })

  it('荒野变形资源按等级 2／3／4 次，短休恢复 1 次', () => {
    const wildShape = druidFeatures2024.find((feature) => feature.id === 'druid-2024-class-wild-shape')?.resource
    if (!wildShape) throw new Error('缺少荒野变形资源')
    expect([1, 2, 6, 16, 17, 20].map((level) => getResourceMax(wildShape, level))).toEqual([0, 2, 3, 3, 4, 4])
    expect(formatResourceText(wildShape, 2)).toBe('2 次 · 短休恢复')
    expect(wildShape.recovery).toBe('short-rest')
  })

  it('施法配置为感知准备制，准备数量、戏法与法术位按职业表', () => {
    const config = getSpellcastingConfig({ classId: 'class-2024-druid', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少德鲁伊施法配置')
    expect(config.mode).toBe('prepared')
    expect(config.ability).toBe('wis')
    expect(getRequiredSpellCount(druidDraft({ targetLevel: 1 }), config)).toBe(4)
    expect(getRequiredSpellCount(druidDraft({ targetLevel: 20 }), config)).toBe(22)
    expect(getRequiredCantripCount(druidDraft({ targetLevel: 1 }), config)).toBe(2)
    expect(getRequiredCantripCount(druidDraft({ targetLevel: 4 }), config)).toBe(3)
    expect(getRequiredCantripCount(druidDraft({ targetLevel: 10 }), config)).toBe(4)
    expect(getMaximumSpellLevel(config, 3)).toBe(2)
    expect(getSpellSlots(config, 1).map((slot) => [slot.level, slot.count])).toEqual([[1, 2]])
    expect(getSpellSlots(config, 3).map((slot) => [slot.level, slot.count])).toEqual([[1, 4], [2, 2]])
  })

  it('德鲁伊语始终准备动物交谈', () => {
    expect(getAlwaysPreparedSpellIds(druidDraft())).toContain('spell-2024-speak-with-animals')
  })

  it('原初职能：术师追加戏法，卫士授予军用与中甲', () => {
    const magician = druidOptions2024.find((option) => option.id === 'druid-2024-primal-order-magician')
    expect(magician?.cantripBonus).toBe(1)
    const warden = druidOptions2024.find((option) => option.id === 'druid-2024-primal-order-warden')
    expect(warden?.armorTraining).toEqual(['medium'])
    expect(warden?.weaponTraining).toEqual({ categories: ['martial'] })

    const config = getSpellcastingConfig({ classId: 'class-2024-druid', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少德鲁伊施法配置')
    const withMagician = druidDraft({
      selections: [selection('class-2024-druid-primal-order-1', ['druid-2024-primal-order-magician'])],
    })
    expect(getRequiredCantripCount(withMagician, config)).toBe(3)

    const withWarden = druidDraft({
      selections: [selection('class-2024-druid-primal-order-1', ['druid-2024-primal-order-warden'])],
    })
    expect(collectArmorTrainings(withWarden, rulesRepository2024)).toContain('medium')
    expect(collectArmorTrainings(druidDraft(), rulesRepository2024)).not.toContain('medium')

    const longsword = rulesRepository2024.getEquipment('equipment-2024-longsword')
    const sickle = rulesRepository2024.getEquipment('equipment-2024-sickle')
    if (!longsword || !sickle) throw new Error('缺少 2024 武器数据')
    expect(deriveWeaponAttack(withWarden, deriveCharacter(withWarden), longsword)?.proficient).toBe(true)
    expect(deriveWeaponAttack(druidDraft(), deriveCharacter(druidDraft()), longsword)?.proficient).toBe(false)
    expect(deriveWeaponAttack(druidDraft(), deriveCharacter(druidDraft()), sickle)?.proficient).toBe(true)
  })

  it('4 个结社各 5 条特性、3／6／10／14 级，结社法术始终准备', () => {
    expect(rulesRepository2024.subclasses.filter((subclass) => subclass.classId === 'class-2024-druid' && subclass.sourceIds.includes('source-2024-phb')).map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    for (const id of SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass?.status).toBe('implemented')
      expect(subclass?.selectionLevel).toBe(3)
      expect(subclass?.features).toHaveLength(5)
      expect(subclass?.features.map((feature) => feature.level)).toEqual([3, 3, 6, 10, 14])
    }

    const moon = rulesRepository2024.getSubclass('subclass-2024-druid-circle-of-the-moon')
    expect(Object.keys(moon?.alwaysPreparedSpellIdsByLevel ?? {}).map(Number)).toEqual([3, 5, 7, 9])
    expect(Object.values(moon?.alwaysPreparedSpellIdsByLevel ?? {}).flat()).toHaveLength(6)
    const sea = rulesRepository2024.getSubclass('subclass-2024-druid-circle-of-the-sea')
    expect(Object.values(sea?.alwaysPreparedSpellIdsByLevel ?? {}).flat()).toHaveLength(11)
    const stars = rulesRepository2024.getSubclass('subclass-2024-druid-circle-of-the-stars')
    expect(stars?.alwaysPreparedSpellIdsByLevel).toEqual({ 3: ['spell-2024-guidance', 'spell-2024-guiding-bolt'] })
    for (const subclass of druidSubclasses2024) {
      const spellIds = Object.values(subclass.alwaysPreparedSpellIdsByLevel ?? {}).flat()
      for (const spellId of spellIds) {
        expect(rulesRepository2024.getSpell(spellId), spellId).toBeDefined()
      }
    }
    expect(druidSubclasses2024).toHaveLength(4)
  })

  it('大地结社地形选择驱动始终准备法术，并可随等级扩展', () => {
    const levelThree = buildTimeline('class-2024-druid', 3, { ruleset: '5e-2024', enabledSourceIds: [], subclassId: 'subclass-2024-druid-circle-of-the-land' })
    const landCheckpoint = levelThree.find((checkpoint) => checkpoint.id === LAND_CHECKPOINT_ID)
    expect(landCheckpoint?.kind).toBe('subclass-feature')
    expect(landCheckpoint?.optionIds).toEqual([
      'druid-2024-land-arid',
      'druid-2024-land-polar',
      'druid-2024-land-temperate',
      'druid-2024-land-tropical',
    ])

    const arid = druidDraft({
      subclassId: 'subclass-2024-druid-circle-of-the-land',
      targetLevel: 3,
      selections: [selection(LAND_CHECKPOINT_ID, ['druid-2024-land-arid'])],
    })
    const aridPrepared = getAlwaysPreparedSpellIds(arid)
    expect(aridPrepared).toEqual(expect.arrayContaining([
      'spell-2024-fire-bolt', 'spell-2024-burning-hands', 'spell-2024-blur',
    ]))
    expect(aridPrepared).not.toContain('spell-2024-fireball')

    const aridAtFive = druidDraft({
      subclassId: 'subclass-2024-druid-circle-of-the-land',
      targetLevel: 5,
      selections: [selection(LAND_CHECKPOINT_ID, ['druid-2024-land-arid'])],
    })
    expect(getAlwaysPreparedSpellIds(aridAtFive)).toContain('spell-2024-fireball')

    const polar = druidDraft({
      subclassId: 'subclass-2024-druid-circle-of-the-land',
      targetLevel: 3,
      selections: [selection(LAND_CHECKPOINT_ID, ['druid-2024-land-polar'])],
    })
    expect(getAlwaysPreparedSpellIds(polar)).toContain('spell-2024-ray-of-frost')
    expect(getAlwaysPreparedSpellIds(polar)).not.toContain('spell-2024-fire-bolt')
  })

  it('起始装备 A 为皮甲／盾牌／镰刀／木杖／探索套组／草药工具＋9 GP，B 为 50 GP', () => {
    const profile = classStartingEquipment2024.find((item) => item.classId === 'class-2024-druid')
    if (!profile) throw new Error('缺少德鲁伊起始装备')
    const group = profile.groups[0]
    const optionA = group?.options.find((option) => option.id === 'druid-2024-a')
    const optionB = group?.options.find((option) => option.id === 'druid-2024-b')
    expect(optionA?.grants.map((grant) => [grant.itemId, grant.quantity])).toEqual([
      ['equipment-2024-leather-armor', 1],
      ['equipment-2024-shield', 1],
      ['equipment-2024-sickle', 1],
      ['equipment-2024-wooden-staff-also-a-quarterstaff', 1],
      ['equipment-2024-explorer-s-pack', 1],
      ['equipment-2024-herbalism-kit', 1],
    ])
    expect(optionA?.currency?.gp).toBe(9)
    expect(optionB?.currency?.gp).toBe(50)
  })

  it('时间线展开技能、原初职能、子职、元素之怒与属性提升', () => {
    const levelOne = buildTimeline('class-2024-druid', 1, { ruleset: '5e-2024', enabledSourceIds: [] })
    expect(levelOne.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-druid-skills-1',
      'class-2024-druid-primal-order-1',
    ])

    const levelThree = buildTimeline('class-2024-druid', 3, { ruleset: '5e-2024', enabledSourceIds: [] })
    const subclass = levelThree.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclass?.id).toBe('class-2024-druid-subclass-3')
    expect(subclass?.optionIds).toEqual([...SUBCLASS_IDS])

    const levelSeven = buildTimeline('class-2024-druid', 7, { ruleset: '5e-2024', enabledSourceIds: [] })
    expect(levelSeven.find((checkpoint) => checkpoint.id === 'class-2024-druid-elemental-fury-7')?.optionIds).toEqual([
      'druid-2024-elemental-fury-potent-spellcasting',
      'druid-2024-elemental-fury-primal-strike',
    ])

    const levelTwenty = buildTimeline('class-2024-druid', 20, { ruleset: '5e-2024', enabledSourceIds: [] })
    expect(levelTwenty.filter((checkpoint) => checkpoint.kind === 'ability-improvement').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-druid-feat-4',
      'class-2024-druid-feat-8',
      'class-2024-druid-feat-12',
      'class-2024-druid-feat-16',
      'class-2024-druid-feat-19',
    ])
    expect(druidRule2024.spellcasting?.alwaysPreparedSpellIdsByLevel).toEqual({ 1: ['spell-2024-speak-with-animals'] })
  })
})
