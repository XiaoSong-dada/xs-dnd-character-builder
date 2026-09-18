import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { bardFeatures2024, bardOptions2024, bardRule2024, bardSubclasses2024 } from '@/rules/data/bard-2024'
import { classStartingEquipment2024 } from '@/rules/data/starting-equipment-2024'
import { collectArmorTrainings } from '@/rules/feats'
import { deriveCharacter } from '@/rules/derive'
import { formatResourceText, getDicePoolDie, getResourceMax } from '@/rules/resources'
import {
  getAlwaysPreparedSpellIds,
  getAvailableSpells,
  getCheckpointCandidates,
  getMaximumSpellLevel,
  getRequiredCantripCount,
  getRequiredSpellCount,
  getSpellcastingConfig,
  getSpellSlots,
} from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import { deriveWeaponAttack } from '@/rules/weapon-attacks'
import { draft2024, selection } from '../fixtures/draft-2024'

const SUBCLASS_IDS = [
  'subclass-2024-bard-college-of-dance',
  'subclass-2024-bard-college-of-glamour',
  'subclass-2024-bard-college-of-lore',
  'subclass-2024-bard-college-of-valor',
] as const

const LORE_DISCOVERIES_CHECKPOINT = 'subclass-feature-bard-2024-lore-magical-discoveries'
const LORE_PROFICIENCIES_CHECKPOINT = 'subclass-feature-bard-2024-lore-bonus-proficiencies'

const bardDraft = (overrides: Parameters<typeof draft2024>[0] = {}) =>
  draft2024({ classId: 'class-2024-bard', targetLevel: 1, ...overrides })

describe('2024 吟游诗人与 4 学院数据（B08-08）', () => {
  it('职业基础字段、护甲与武器训练', () => {
    const classRule = rulesRepository2024.getClass('class-2024-bard')
    expect(classRule?.status).toBe('implemented')
    expect(classRule?.hitDie).toBe(8)
    expect(classRule?.primaryAbilities).toEqual(['cha'])
    expect(classRule?.savingThrowAbilities).toEqual(['dex', 'cha'])
    expect(classRule?.armorTraining).toEqual(['light'])
    expect(classRule?.weaponTraining).toEqual({ categories: ['simple'] })
  })

  it('职业特性 11 条、ID 唯一，选择类特性挂检查点', () => {
    expect(bardFeatures2024).toHaveLength(11)
    expect(new Set(bardFeatures2024.map((feature) => feature.id)).size).toBe(11)
    expect(bardFeatures2024.every((feature) => feature.classId === 'class-2024-bard')).toBe(true)
    const choiceFeatures = bardFeatures2024.filter((feature) => feature.requiresChoice)
    expect(choiceFeatures.map((feature) => feature.id)).toEqual([
      'bard-2024-class-expertise',
      'bard-2024-class-subclass',
      'bard-2024-class-epic-boon',
    ])
    expect(choiceFeatures.every((feature) => (feature.checkpointIds?.length ?? 0) > 0)).toBe(true)
  })

  it('诗人激励骰按等级 d6→d8→d10→d12，次数＝魅力调整值（至少 1）', () => {
    const inspiration = bardFeatures2024.find((feature) => feature.id === 'bard-2024-class-bardic-inspiration')
    const pool = inspiration?.dicePool
    const resource = inspiration?.resource
    if (!pool || !resource) throw new Error('缺少诗人激励数据')
    expect([1, 4, 5, 9, 10, 14, 15, 20].map((level) => getDicePoolDie(pool, level))).toEqual([
      'd6', 'd6', 'd8', 'd8', 'd10', 'd10', 'd12', 'd12',
    ])
    expect(resource.maxFromAbility).toEqual({ ability: 'cha', minimum: 1 })
    expect(resource.shortRestFromLevel).toBe(5)
    expect(getResourceMax(resource, 1, 4)).toBe(4)
    expect(getResourceMax(resource, 1, -2)).toBe(1)
    expect(formatResourceText(resource, 1, 3)).toBe('3 次 · 长休恢复')
    expect(formatResourceText(resource, 5, 3)).toBe('3 次 · 短休恢复')
  })

  it('施法配置为魅力准备制，准备数量、戏法与法术位按职业表', () => {
    const config = getSpellcastingConfig({ classId: 'class-2024-bard', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少吟游诗人施法配置')
    expect(config.mode).toBe('prepared')
    expect(config.ability).toBe('cha')
    expect(getRequiredSpellCount(bardDraft({ targetLevel: 1 }), config)).toBe(4)
    expect(getRequiredSpellCount(bardDraft({ targetLevel: 20 }), config)).toBe(22)
    expect(getRequiredCantripCount(bardDraft({ targetLevel: 1 }), config)).toBe(2)
    expect(getRequiredCantripCount(bardDraft({ targetLevel: 4 }), config)).toBe(3)
    expect(getMaximumSpellLevel(config, 3)).toBe(2)
    expect(getSpellSlots(config, 1).map((slot) => [slot.level, slot.count])).toEqual([[1, 2]])
    expect(getSpellSlots(config, 3).map((slot) => [slot.level, slot.count])).toEqual([[1, 4], [2, 2]])
  })

  it('魔法奥秘在 10 级扩展候选池到牧师／德鲁伊／法师法术', () => {
    const config = getSpellcastingConfig({ classId: 'class-2024-bard', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少吟游诗人施法配置')
    const atNine = getAvailableSpells(bardDraft({ targetLevel: 9 }), config).map((spell) => spell.id)
    const atTen = getAvailableSpells(bardDraft({ targetLevel: 10 }), config).map((spell) => spell.id)
    expect(atNine).not.toContain('spell-2024-fireball')
    expect(atTen).toContain('spell-2024-fireball')
    expect(atTen).toContain('spell-2024-guiding-bolt')
  })

  it('创生圣言在 20 级始终准备律令医疗与律令死亡', () => {
    expect(getAlwaysPreparedSpellIds(bardDraft({ targetLevel: 19 }))).not.toContain('spell-2024-power-word-kill')
    expect(getAlwaysPreparedSpellIds(bardDraft({ targetLevel: 20 }))).toEqual(expect.arrayContaining([
      'spell-2024-power-word-heal', 'spell-2024-power-word-kill',
    ]))
  })

  it('技能、乐器与两次专精检查点登记', () => {
    const skills = bardRule2024.checkpoints.find((checkpoint) => checkpoint.kind === 'skills')
    expect(skills?.minSelections).toBe(3)
    expect(skills?.optionIds).toHaveLength(18)

    const tools = bardRule2024.checkpoints.find((checkpoint) => checkpoint.id === 'class-2024-bard-tools-1')
    expect(tools?.minSelections).toBe(3)
    expect(tools?.optionIds).toHaveLength(10)
    expect(tools?.uniqueGroup).toBe('bard-2024-instruments')

    expect(bardRule2024.checkpoints.filter((checkpoint) => checkpoint.kind === 'expertise').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-bard-expertise-2',
      'class-2024-bard-expertise-9',
    ])
  })

  it('4 个学院各 4 条特性、3／6／14 级', () => {
    expect(rulesRepository2024.subclasses.filter((subclass) => subclass.classId === 'class-2024-bard' && subclass.sourceIds.includes('source-2024-phb')).map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    const expectedLevels: Readonly<Record<(typeof SUBCLASS_IDS)[number], readonly number[]>> = {
      'subclass-2024-bard-college-of-dance': [3, 6, 6, 14],
      'subclass-2024-bard-college-of-glamour': [3, 3, 6, 14],
      'subclass-2024-bard-college-of-lore': [3, 3, 6, 14],
      'subclass-2024-bard-college-of-valor': [3, 3, 6, 14],
    }
    for (const id of SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass?.status).toBe('implemented')
      expect(subclass?.selectionLevel).toBe(3)
      expect(subclass?.features).toHaveLength(4)
      expect(subclass?.features.map((feature) => feature.level)).toEqual(expectedLevels[id])
    }
    expect(bardSubclasses2024).toHaveLength(4)
  })

  it('勇气学院战争训练授予军用武器与中甲、盾牌', () => {
    const valor = bardDraft({ subclassId: 'subclass-2024-bard-college-of-valor', targetLevel: 3 })
    expect(collectArmorTrainings(valor, rulesRepository2024)).toEqual(expect.arrayContaining(['medium', 'shield']))
    expect(collectArmorTrainings(bardDraft({ targetLevel: 3 }), rulesRepository2024)).not.toContain('medium')

    const longsword = rulesRepository2024.getEquipment('equipment-2024-longsword')
    if (!longsword) throw new Error('缺少 2024 武器数据')
    expect(deriveWeaponAttack(valor, deriveCharacter(valor), longsword)?.proficient).toBe(true)
    const plain = bardDraft({ targetLevel: 3 })
    expect(deriveWeaponAttack(plain, deriveCharacter(plain), longsword)?.proficient).toBe(false)
  })

  it('舞蹈学院无甲防御为 10＋敏捷＋魅力，持盾时失效', () => {
    const dance = draft2024({
      classId: 'class-2024-bard',
      subclassId: 'subclass-2024-bard-college-of-dance',
      targetLevel: 3,
      baseAbilities: { str: 10, dex: 14, con: 13, int: 8, wis: 12, cha: 16 },
    })
    expect(deriveCharacter(dance).armorClass.value).toBe(15)

    const withShield = {
      ...dance,
      inventory: [{ id: 'shield', itemId: 'equipment-2024-shield', quantity: 1, sourceKind: 'legacy' as const, sourceId: 'test', equippedQuantity: 1 }],
    }
    expect(deriveCharacter(withShield).armorClass.value).toBe(14)
  })

  it('逸闻学院附赠熟练与魔法探秘候选', () => {
    const draft = bardDraft({ subclassId: 'subclass-2024-bard-college-of-lore', targetLevel: 6 })
    const timeline = buildTimeline('class-2024-bard', 6, { ruleset: '5e-2024', enabledSourceIds: [], subclassId: 'subclass-2024-bard-college-of-lore' })

    const proficiencies = timeline.find((checkpoint) => checkpoint.id === LORE_PROFICIENCIES_CHECKPOINT)
    expect(proficiencies?.optionIds).toHaveLength(18)
    expect(proficiencies?.minSelections).toBe(3)

    const discoveries = timeline.find((checkpoint) => checkpoint.id === LORE_DISCOVERIES_CHECKPOINT)
    expect(discoveries?.candidateKind).toBe('spell-pool')
    if (!discoveries) throw new Error('缺少魔法探秘检查点')
    const candidates = getCheckpointCandidates(draft, discoveries)
    expect(candidates).toContain('spell-2024-guiding-bolt')
    expect(candidates).toContain('spell-2024-fireball')
    expect(candidates).toContain('spell-2024-guidance')
    expect(candidates).not.toContain('spell-2024-vicious-mockery')

    const chosen = bardDraft({
      subclassId: 'subclass-2024-bard-college-of-lore',
      targetLevel: 6,
      selections: [selection(LORE_DISCOVERIES_CHECKPOINT, ['spell-2024-guiding-bolt', 'spell-2024-fireball'])],
    })
    expect(getAlwaysPreparedSpellIds(chosen)).toEqual(expect.arrayContaining([
      'spell-2024-guiding-bolt', 'spell-2024-fireball',
    ]))
  })

  it('魅心学院始终准备魅惑类人／镜影术与命令术', () => {
    const atThree = bardDraft({ subclassId: 'subclass-2024-bard-college-of-glamour', targetLevel: 3 })
    expect(getAlwaysPreparedSpellIds(atThree)).toEqual(expect.arrayContaining([
      'spell-2024-charm-person', 'spell-2024-mirror-image',
    ]))
    expect(getAlwaysPreparedSpellIds(atThree)).not.toContain('spell-2024-command')
    const atSix = bardDraft({ subclassId: 'subclass-2024-bard-college-of-glamour', targetLevel: 6 })
    expect(getAlwaysPreparedSpellIds(atSix)).toContain('spell-2024-command')
  })

  it('起始装备 A 为皮甲／2 匕首／所选乐器／艺人套组＋19 GP，B 为 90 GP', () => {
    const profile = classStartingEquipment2024.find((item) => item.classId === 'class-2024-bard')
    if (!profile) throw new Error('缺少吟游诗人起始装备')
    const group = profile.groups[0]
    const optionA = group?.options.find((option) => option.id === 'bard-2024-a')
    const optionB = group?.options.find((option) => option.id === 'bard-2024-b')
    expect(optionA?.grants.map((grant) => [grant.itemId, grant.quantity])).toEqual([
      ['equipment-2024-leather-armor', 1],
      ['equipment-2024-dagger', 2],
      ['equipment-2024-entertainer-s-pack', 1],
    ])
    expect(optionA?.currency?.gp).toBe(19)
    expect(optionA?.pick?.count).toBe(1)
    expect(optionA?.pick?.allowedItemIds).toHaveLength(10)
    expect(optionB?.currency?.gp).toBe(90)
    expect(bardOptions2024).toHaveLength(10)
  })

  it('时间线展开技能、乐器、专精、子职与属性提升', () => {
    const levelOne = buildTimeline('class-2024-bard', 1, { ruleset: '5e-2024', enabledSourceIds: [] })
    expect(levelOne.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-bard-skills-1',
      'class-2024-bard-tools-1',
    ])

    const levelThree = buildTimeline('class-2024-bard', 3, { ruleset: '5e-2024', enabledSourceIds: [] })
    const subclass = levelThree.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclass?.id).toBe('class-2024-bard-subclass-3')
    expect(subclass?.title).toBe('选择吟游诗人子职')
    expect(subclass?.optionIds).toEqual([...SUBCLASS_IDS])

    const levelTwenty = buildTimeline('class-2024-bard', 20, { ruleset: '5e-2024', enabledSourceIds: [] })
    expect(levelTwenty.filter((checkpoint) => checkpoint.kind === 'expertise').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-bard-expertise-2',
      'class-2024-bard-expertise-9',
    ])
    expect(levelTwenty.filter((checkpoint) => checkpoint.kind === 'ability-improvement').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-bard-feat-4',
      'class-2024-bard-feat-8',
      'class-2024-bard-feat-12',
      'class-2024-bard-feat-16',
      'class-2024-bard-feat-19',
    ])
  })
})
