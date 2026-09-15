import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { clericFeatures2024, clericOptions2024, clericRule2024, clericSubclasses2024 } from '@/rules/data/cleric-2024'
import { classStartingEquipment2024 } from '@/rules/data/starting-equipment-2024'
import { collectArmorTrainings } from '@/rules/feats'
import { formatResourceText, getResourceMax } from '@/rules/resources'
import {
  getMaximumSpellLevel,
  getRequiredCantripCount,
  getRequiredSpellCount,
  getSpellcastingConfig,
  getSpellSlots,
  getAlwaysPreparedSpellIds,
} from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import { deriveWeaponAttack } from '@/rules/weapon-attacks'
import { deriveCharacter } from '@/rules/derive'
import { draft2024, selection } from '../fixtures/draft-2024'

const SUBCLASS_IDS = [
  'subclass-2024-cleric-life-domain',
  'subclass-2024-cleric-light-domain',
  'subclass-2024-cleric-war-domain',
  'subclass-2024-cleric-trickery-domain',
] as const

const clericDraft = (overrides: Parameters<typeof draft2024>[0] = {}) =>
  draft2024({ classId: 'class-2024-cleric', targetLevel: 1, ...overrides })

describe('2024 牧师与 4 领域数据（B08-06）', () => {
  it('职业基础字段、护甲与武器训练', () => {
    const classRule = rulesRepository2024.getClass('class-2024-cleric')
    expect(classRule?.status).toBe('implemented')
    expect(classRule?.hitDie).toBe(8)
    expect(classRule?.primaryAbilities).toEqual(['wis'])
    expect(classRule?.savingThrowAbilities).toEqual(['wis', 'cha'])
    expect(classRule?.armorTraining).toEqual(['light', 'medium', 'shield'])
    expect(classRule?.weaponTraining).toEqual({ categories: ['simple'] })
  })

  it('职业特性 10 条、ID 唯一，选择类特性挂检查点', () => {
    expect(clericFeatures2024).toHaveLength(10)
    expect(new Set(clericFeatures2024.map((feature) => feature.id)).size).toBe(10)
    expect(clericFeatures2024.every((feature) => feature.classId === 'class-2024-cleric')).toBe(true)
    const choiceFeatures = clericFeatures2024.filter((feature) => feature.requiresChoice)
    expect(choiceFeatures.map((feature) => feature.id)).toEqual([
      'cleric-2024-class-divine-order',
      'cleric-2024-class-subclass',
      'cleric-2024-class-blessed-strikes',
      'cleric-2024-class-epic-boon',
    ])
    expect(choiceFeatures.every((feature) => (feature.checkpointIds?.length ?? 0) > 0)).toBe(true)
  })

  it('引导神力与神圣干预资源按等级登记', () => {
    const channel = clericFeatures2024.find((feature) => feature.id === 'cleric-2024-class-channel-divinity')?.resource
    if (!channel) throw new Error('缺少引导神力资源')
    expect([1, 2, 6, 18, 20].map((level) => getResourceMax(channel, level))).toEqual([0, 2, 3, 4, 4])
    expect(formatResourceText(channel, 2)).toBe('2 次 · 短休恢复')

    const intervention = clericFeatures2024.find((feature) => feature.id === 'cleric-2024-class-divine-intervention')?.resource
    if (!intervention) throw new Error('缺少神圣干预资源')
    expect([9, 10, 20].map((level) => getResourceMax(intervention, level))).toEqual([0, 1, 1])
    expect(intervention.recovery).toBe('long-rest')
  })

  it('施法配置为感知准备制，准备数量、戏法与法术位按职业表', () => {
    const config = getSpellcastingConfig({ classId: 'class-2024-cleric', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少牧师施法配置')
    expect(config.mode).toBe('prepared')
    expect(config.ability).toBe('wis')
    expect(getRequiredSpellCount(clericDraft({ targetLevel: 1 }), config)).toBe(4)
    expect(getRequiredSpellCount(clericDraft({ targetLevel: 20 }), config)).toBe(22)
    expect(getRequiredCantripCount(clericDraft({ targetLevel: 1 }), config)).toBe(3)
    expect(getRequiredCantripCount(clericDraft({ targetLevel: 4 }), config)).toBe(4)
    expect(getMaximumSpellLevel(config, 1)).toBe(1)
    expect(getMaximumSpellLevel(config, 5)).toBe(3)
    expect(getSpellSlots(config, 1).map((slot) => [slot.level, slot.count])).toEqual([[1, 2]])
    expect(getSpellSlots(config, 3).map((slot) => [slot.level, slot.count])).toEqual([[1, 4], [2, 2]])
  })

  it('圣职选项：保护者授予军用与重甲，奇术使追加戏法', () => {
    const protector = clericOptions2024.find((option) => option.id === 'cleric-2024-divine-order-protector')
    expect(protector?.armorTraining).toEqual(['heavy'])
    expect(protector?.weaponTraining).toEqual({ categories: ['martial'] })
    const thaumaturge = clericOptions2024.find((option) => option.id === 'cleric-2024-divine-order-thaumaturge')
    expect(thaumaturge?.cantripBonus).toBe(1)

    const config = getSpellcastingConfig({ classId: 'class-2024-cleric', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少牧师施法配置')
    const withThaumaturge = clericDraft({
      selections: [selection('class-2024-cleric-divine-order-1', ['cleric-2024-divine-order-thaumaturge'])],
    })
    expect(getRequiredCantripCount(withThaumaturge, config)).toBe(4)
    expect(getRequiredCantripCount(clericDraft(), config)).toBe(3)

    const armorTrainings = collectArmorTrainings(clericDraft({
      selections: [selection('class-2024-cleric-divine-order-1', ['cleric-2024-divine-order-protector'])],
    }), rulesRepository2024)
    expect(armorTrainings).toContain('heavy')
    expect(collectArmorTrainings(clericDraft(), rulesRepository2024)).not.toContain('heavy')
  })

  it('保护者的军用武器熟练进入武器攻击判定', () => {
    const longsword = rulesRepository2024.getEquipment('equipment-2024-longsword')
    const mace = rulesRepository2024.getEquipment('equipment-2024-mace')
    if (!longsword || !mace) throw new Error('缺少 2024 武器数据')

    const plain = clericDraft()
    const plainDerived = deriveCharacter(plain)
    expect(deriveWeaponAttack(plain, plainDerived, mace)?.proficient).toBe(true)
    expect(deriveWeaponAttack(plain, plainDerived, longsword)?.proficient).toBe(false)

    const protector = clericDraft({
      selections: [selection('class-2024-cleric-divine-order-1', ['cleric-2024-divine-order-protector'])],
    })
    const protectorDerived = deriveCharacter(protector)
    expect(deriveWeaponAttack(protector, protectorDerived, longsword)?.proficient).toBe(true)
  })

  it('4 个领域各 5 条特性、3／6／17 级，领域法术始终准备', () => {
    expect(rulesRepository2024.subclasses.filter((subclass) => subclass.classId === 'class-2024-cleric').map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    for (const id of SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass?.status).toBe('implemented')
      expect(subclass?.selectionLevel).toBe(3)
      expect(subclass?.features).toHaveLength(5)
      expect(subclass?.features.map((feature) => feature.level)).toEqual([3, 3, 3, 6, 17])
      const spellLevels = Object.keys(subclass?.alwaysPreparedSpellIdsByLevel ?? {}).map(Number)
      expect(spellLevels).toEqual([3, 5, 7, 9])
      const spellIds = Object.values(subclass?.alwaysPreparedSpellIdsByLevel ?? {}).flat()
      expect(spellIds.length).toBe(10)
      for (const spellId of spellIds) {
        const spell = rulesRepository2024.getSpell(spellId)
        expect(spell, spellId).toBeDefined()
        // 领域法术对牧师视为牧师法术；部分条目不在职业基础法术表内（如灼热射线），由始终准备通道提供。
        expect(spell?.level).toBeGreaterThan(0)
      }
    }
    expect(clericSubclasses2024).toHaveLength(4)
  })

  it('领域法术按等级计入始终准备，且不占准备上限', () => {
    const life = clericDraft({ subclassId: 'subclass-2024-cleric-life-domain', targetLevel: 3 })
    expect(getAlwaysPreparedSpellIds(life)).toEqual(expect.arrayContaining([
      'spell-2024-aid', 'spell-2024-bless', 'spell-2024-cure-wounds', 'spell-2024-lesser-restoration',
    ]))
    expect(getAlwaysPreparedSpellIds(life)).not.toContain('spell-2024-revivify')

    const lifeAtFive = clericDraft({ subclassId: 'subclass-2024-cleric-life-domain', targetLevel: 5 })
    expect(getAlwaysPreparedSpellIds(lifeAtFive)).toContain('spell-2024-revivify')
  })

  it('起始装备 A 为链甲衫／盾牌／硬头锤／圣徽／祭司套组＋7 GP，B 为 110 GP', () => {
    const profile = classStartingEquipment2024.find((item) => item.classId === 'class-2024-cleric')
    if (!profile) throw new Error('缺少牧师起始装备')
    const group = profile.groups[0]
    const optionA = group?.options.find((option) => option.id === 'cleric-2024-a')
    const optionB = group?.options.find((option) => option.id === 'cleric-2024-b')
    expect(optionA?.grants.map((grant) => [grant.itemId, grant.quantity])).toEqual([
      ['equipment-2024-chain-shirt', 1],
      ['equipment-2024-shield', 1],
      ['equipment-2024-mace', 1],
      ['equipment-2024-holy-symbol', 1],
      ['equipment-2024-priest-s-pack', 1],
    ])
    expect(optionA?.currency?.gp).toBe(7)
    expect(optionB?.currency?.gp).toBe(110)
  })

  it('时间线展开技能、圣职、子职、受祝击与属性提升', () => {
    const levelOne = buildTimeline('class-2024-cleric', 1, { ruleset: '5e-2024' })
    expect(levelOne.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-cleric-skills-1',
      'class-2024-cleric-divine-order-1',
    ])

    const levelThree = buildTimeline('class-2024-cleric', 3, { ruleset: '5e-2024' })
    const subclass = levelThree.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclass?.id).toBe('class-2024-cleric-subclass-3')
    expect(subclass?.title).toBe('选择牧师子职')
    expect(subclass?.optionIds).toEqual([...SUBCLASS_IDS])

    const levelSeven = buildTimeline('class-2024-cleric', 7, { ruleset: '5e-2024' })
    expect(levelSeven.find((checkpoint) => checkpoint.id === 'class-2024-cleric-blessed-strikes-7')?.optionIds).toEqual([
      'cleric-2024-blessed-strikes-divine-strike',
      'cleric-2024-blessed-strikes-potent-spellcasting',
    ])

    const levelTwenty = buildTimeline('class-2024-cleric', 20, { ruleset: '5e-2024' })
    expect(levelTwenty.filter((checkpoint) => checkpoint.kind === 'ability-improvement').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-cleric-feat-4',
      'class-2024-cleric-feat-8',
      'class-2024-cleric-feat-12',
      'class-2024-cleric-feat-16',
      'class-2024-cleric-feat-19',
    ])
    expect(clericRule2024.checkpoints.find((checkpoint) => checkpoint.id === 'class-2024-cleric-feat-19')?.featCategories).toEqual(['general', 'epic-boon'])
  })
})
