import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { invocations2024, INVOCATION_2024_OPTION_IDS } from '@/rules/data/invocations-2024'
import { warlockFeatures2024, warlockRule2024, warlockSubclasses2024 } from '@/rules/data/warlock-2024'
import { classStartingEquipment2024 } from '@/rules/data/starting-equipment-2024'
import { getCheckpointCandidates, getSpellcastingConfig, getSpellSlots, getRequiredSpellCount, getRequiredCantripCount, getMaximumSpellLevel, getAlwaysPreparedSpellIds, getSelectedSpellIds, getSpellCandidates, usesPreparedSelection } from '@/rules/spellcasting'
import { getDicePoolCount, getDicePoolDie } from '@/rules/resources'
import { buildTimeline } from '@/rules/timeline'
import { validateDraft } from '@/rules/validate'
import { draft2024, selection } from '../fixtures/draft-2024'

const SUBCLASS_IDS = [
  'subclass-2024-warlock-archfey-patron',
  'subclass-2024-warlock-celestial-patron',
  'subclass-2024-warlock-fiend-patron',
  'subclass-2024-warlock-great-old-one-patron',
] as const

const warlockDraft = (overrides: Parameters<typeof draft2024>[0] = {}) =>
  draft2024({ classId: 'class-2024-warlock', targetLevel: 1, ...overrides })

const issueIds = (draft: Parameters<typeof validateDraft>[0]) => validateDraft(draft).map((issue) => issue.id)

describe('2024 魔契师与 4 宗主数据（B08-10）', () => {
  it('职业基础字段、护甲与武器训练', () => {
    const classRule = rulesRepository2024.getClass('class-2024-warlock')
    expect(classRule?.status).toBe('implemented')
    expect(classRule?.hitDie).toBe(8)
    expect(classRule?.primaryAbilities).toEqual(['cha'])
    expect(classRule?.savingThrowAbilities).toEqual(['wis', 'cha'])
    expect(classRule?.armorTraining).toEqual(['light'])
    expect(classRule?.weaponTraining).toEqual({ categories: ['simple'] })
  })

  it('职业特性 8 条、ID 唯一，选择类特性挂检查点', () => {
    expect(warlockFeatures2024).toHaveLength(8)
    expect(new Set(warlockFeatures2024.map((feature) => feature.id)).size).toBe(8)
    expect(warlockFeatures2024.every((feature) => feature.classId === 'class-2024-warlock')).toBe(true)
    const choiceFeatures = warlockFeatures2024.filter((feature) => feature.requiresChoice)
    expect(choiceFeatures.map((feature) => feature.id)).toEqual([
      'warlock-2024-class-eldritch-invocations',
      'warlock-2024-class-subclass',
      'warlock-2024-class-mystic-arcanum',
      'warlock-2024-class-epic-boon',
    ])
    expect(choiceFeatures.every((feature) => (feature.checkpointIds?.length ?? 0) > 0)).toBe(true)
  })

  it('契约法术位由法术位系统结算，不重复登记为可消耗资源', () => {
    const pact = warlockFeatures2024.find((feature) => feature.id === 'warlock-2024-class-pact-magic')
    expect(pact?.resource).toBeUndefined()

    const config = getSpellcastingConfig({ classId: 'class-2024-warlock', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少魔契师施法配置')
    expect(config.mode).toBe('pact')
    expect(usesPreparedSelection(config)).toBe(true)
    expect(getSpellSlots(config, 1).map((slot) => [slot.level, slot.count, slot.pact])).toEqual([[1, 1, true]])
    expect(getSpellSlots(config, 11).map((slot) => [slot.level, slot.count, slot.pact])).toEqual([[5, 3, true]])
    expect([1, 3, 17].map((level) => getMaximumSpellLevel(config, level))).toEqual([1, 2, 5])
  })

  it('准备法术与戏法按职业表，使用准备列表选择', () => {
    const config = getSpellcastingConfig({ classId: 'class-2024-warlock', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少魔契师施法配置')
    expect(getRequiredSpellCount(warlockDraft({ targetLevel: 1 }), config)).toBe(2)
    expect(getRequiredSpellCount(warlockDraft({ targetLevel: 20 }), config)).toBe(15)
    expect(getRequiredCantripCount(warlockDraft({ targetLevel: 1 }), config)).toBe(2)
    expect(getRequiredCantripCount(warlockDraft({ targetLevel: 4 }), config)).toBe(3)
    expect(getRequiredCantripCount(warlockDraft({ targetLevel: 10 }), config)).toBe(4)

    const draft = warlockDraft({ targetLevel: 1, spellSelections: { ...warlockDraft().spellSelections, preparedSpellIds: ['spell-2024-hex'] } })
    expect(getSelectedSpellIds(draft, config)).toEqual(['spell-2024-hex'])
    expect(getSpellCandidates(draft, config).prepared.length).toBeGreaterThan(0)
  })

  it('魔能祈唤 28 项、等级先决筛选候选', () => {
    expect(invocations2024).toHaveLength(28)
    expect(INVOCATION_2024_OPTION_IDS).toHaveLength(28)
    expect(new Set(invocations2024.map((option) => option.id)).size).toBe(28)

    const optionsAt = (level: number) => buildTimeline('class-2024-warlock', level, { ruleset: '5e-2024' })
      .find((checkpoint) => checkpoint.id === `class-2024-warlock-invocations-${level}`)?.optionIds ?? []
    expect(optionsAt(1)).toHaveLength(5)
    expect(optionsAt(2)).toHaveLength(14)
    expect(optionsAt(5)).toHaveLength(22)
    expect(optionsAt(7)).toHaveLength(23)
    expect(optionsAt(12)).toHaveLength(27)
    expect(optionsAt(15)).toHaveLength(28)
    expect(optionsAt(18)).toHaveLength(28)

    const levelEighteen = buildTimeline('class-2024-warlock', 18, { ruleset: '5e-2024' })
    expect(levelEighteen.filter((checkpoint) => checkpoint.id.startsWith('class-2024-warlock-invocations-')).map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-warlock-invocations-1',
      'class-2024-warlock-invocations-2',
      'class-2024-warlock-invocations-5',
      'class-2024-warlock-invocations-7',
      'class-2024-warlock-invocations-9',
      'class-2024-warlock-invocations-12',
      'class-2024-warlock-invocations-15',
      'class-2024-warlock-invocations-18',
    ])
  })

  it('祈唤等级先决与依赖先决被校验', () => {
    const lowLevel = warlockDraft({
      targetLevel: 3,
      selections: [selection('class-2024-warlock-invocations-1', ['invocation-2024-eldritch-smite'])],
    })
    expect(issueIds(lowLevel)).toContain('option-level-class-2024-warlock-invocations-1-invocation-2024-eldritch-smite')

    const missingPact = warlockDraft({
      targetLevel: 5,
      selections: [selection('class-2024-warlock-invocations-5', ['invocation-2024-eldritch-smite'])],
    })
    expect(issueIds(missingPact)).toContain('option-prerequisite-class-2024-warlock-invocations-5-invocation-2024-eldritch-smite')

    const withPact = warlockDraft({
      targetLevel: 5,
      selections: [
        selection('class-2024-warlock-invocations-1', ['invocation-2024-pact-of-the-blade']),
        selection('class-2024-warlock-invocations-5', ['invocation-2024-eldritch-smite']),
      ],
    })
    expect(issueIds(withPact)).not.toContain('option-prerequisite-class-2024-warlock-invocations-5-invocation-2024-eldritch-smite')
  })

  it('玄奥秘法四档候选限魔契师法术且始终准备、可免费施放', () => {
    const draft = warlockDraft({ targetLevel: 17 })
    const timeline = buildTimeline('class-2024-warlock', 17, { ruleset: '5e-2024' })
    const arcanum = [11, 13, 15, 17].map((level) => {
      const checkpoint = timeline.find((item) => item.id === `class-2024-warlock-arcanum-${level}`)
      if (!checkpoint) throw new Error(`缺少玄奥秘法检查点 ${level}`)
      return checkpoint
    })
    expect(arcanum.map((checkpoint) => checkpoint.spellPool?.level)).toEqual([6, 7, 8, 9])
    for (const checkpoint of arcanum) {
      const candidates = getCheckpointCandidates(draft, checkpoint)
      expect(candidates.length).toBeGreaterThan(0)
      for (const id of candidates) {
        const spell = rulesRepository2024.getSpell(id)
        expect(spell?.level, id).toBe(checkpoint.spellPool?.level)
        expect(spell?.classIds, id).toContain('class-2024-warlock')
      }
    }

    const firstSix = getCheckpointCandidates(draft, arcanum[0]!)[0]!
    const chosen = warlockDraft({
      targetLevel: 11,
      selections: [selection('class-2024-warlock-arcanum-11', [firstSix])],
    })
    expect(getAlwaysPreparedSpellIds(chosen)).toContain(firstSix)
  })

  it('联络宗主在 9 级始终准备异界探知', () => {
    expect(getAlwaysPreparedSpellIds(warlockDraft({ targetLevel: 8 }))).not.toContain('spell-2024-contact-other-plane')
    expect(getAlwaysPreparedSpellIds(warlockDraft({ targetLevel: 9 }))).toContain('spell-2024-contact-other-plane')
  })

  it('4 个宗主特性数量与等级节点正确，宗主法术始终准备', () => {
    expect(rulesRepository2024.subclasses.filter((subclass) => subclass.classId === 'class-2024-warlock').map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    const expected: Readonly<Record<(typeof SUBCLASS_IDS)[number], readonly number[]>> = {
      'subclass-2024-warlock-archfey-patron': [3, 3, 6, 10, 14],
      'subclass-2024-warlock-celestial-patron': [3, 3, 6, 10, 14],
      'subclass-2024-warlock-fiend-patron': [3, 3, 6, 10, 14],
      'subclass-2024-warlock-great-old-one-patron': [3, 3, 3, 6, 10, 10, 14],
    }
    for (const id of SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass?.status).toBe('implemented')
      expect(subclass?.selectionLevel).toBe(3)
      expect(subclass?.features.map((feature) => feature.level)).toEqual(expected[id])
      const spellIds = Object.values(subclass?.alwaysPreparedSpellIdsByLevel ?? {}).flat()
      expect(spellIds.length).toBeGreaterThan(0)
      for (const spellId of spellIds) expect(rulesRepository2024.getSpell(spellId), spellId).toBeDefined()
    }
    expect(warlockSubclasses2024).toHaveLength(4)
  })

  it('天界宗主治愈之光骰池为等级 +1 枚 d6', () => {
    const celestial = rulesRepository2024.getSubclass('subclass-2024-warlock-celestial-patron')
    const pool = celestial?.features.find((feature) => feature.id === 'warlock-2024-celestial-healing-light')?.dicePool
    if (!pool) throw new Error('缺少治愈之光骰池')
    expect([3, 5, 20].map((level) => getDicePoolCount(pool, level))).toEqual([4, 6, 21])
    expect(getDicePoolDie(pool, 3)).toBe('d6')
  })

  it('起始装备 A 为皮甲／镰刀／2 匕首／法球／书／学者套组＋15 GP，B 为 100 GP', () => {
    const profile = classStartingEquipment2024.find((item) => item.classId === 'class-2024-warlock')
    if (!profile) throw new Error('缺少魔契师起始装备')
    const group = profile.groups[0]
    const optionA = group?.options.find((option) => option.id === 'warlock-2024-a')
    const optionB = group?.options.find((option) => option.id === 'warlock-2024-b')
    expect(optionA?.grants.map((grant) => [grant.itemId, grant.quantity])).toEqual([
      ['equipment-2024-leather-armor', 1],
      ['equipment-2024-sickle', 1],
      ['equipment-2024-dagger', 2],
      ['equipment-2024-orb', 1],
      ['equipment-2024-book', 1],
      ['equipment-2024-scholar-s-pack', 1],
    ])
    expect(optionA?.currency?.gp).toBe(15)
    expect(optionB?.currency?.gp).toBe(100)
  })

  it('时间线展开技能、祈唤、子职与属性提升', () => {
    const levelOne = buildTimeline('class-2024-warlock', 1, { ruleset: '5e-2024' })
    expect(levelOne.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-warlock-skills-1',
      'class-2024-warlock-invocations-1',
    ])

    const levelThree = buildTimeline('class-2024-warlock', 3, { ruleset: '5e-2024' })
    const subclass = levelThree.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclass?.id).toBe('class-2024-warlock-subclass-3')
    expect(subclass?.optionIds).toEqual([...SUBCLASS_IDS])

    const levelTwenty = buildTimeline('class-2024-warlock', 20, { ruleset: '5e-2024' })
    expect(levelTwenty.filter((checkpoint) => checkpoint.kind === 'ability-improvement').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-warlock-feat-4',
      'class-2024-warlock-feat-8',
      'class-2024-warlock-feat-12',
      'class-2024-warlock-feat-16',
      'class-2024-warlock-feat-19',
    ])
  })
})
