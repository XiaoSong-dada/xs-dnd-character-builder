import { describe, expect, it } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import {
  FULL_CASTER_SPELL_SLOTS,
  HALF_CASTER_SPELL_SLOTS,
  PACT_SPELL_SLOTS,
  THIRD_CASTER_SPELL_SLOTS,
} from '@/rules/data/spell-slots-2014'
import { rulesRepository } from '@/rules/repository'
import { getCheckpointCandidates, getMagicalSecretsSpellIds, getMaximumSpellLevel, getRequiredCantripCount, getRequiredSpellCount, getSpellcastingConfig, getSpellSlots, validateSpellSelections } from '@/rules/spellcasting'
import { validateDraft } from '@/rules/validate'
import type { CharacterDraft } from '@/types/character'
import type { ChoiceCheckpoint } from '@/types/rules'

function draft(patch: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    schemaVersion: 4,
    id: 'spell-test',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 5,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-paladin',
    raceId: 'race-2014-human',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-acolyte',
    backgroundSkillIds: ['skill-insight', 'skill-religion'],
    backgroundToolIds: [],
    languages: ['language-elvish', 'language-dwarvish'],
    proficiencyReplacements: [],
    baseAbilities: { str: 15, dex: 10, con: 13, int: 8, wis: 12, cha: 14 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [
      { id: 'test-chain-mail', itemId: 'chain-mail', quantity: 1, sourceKind: 'legacy', sourceId: 'test', equippedQuantity: 1 },
      { id: 'test-longsword', itemId: 'longsword', quantity: 1, sourceKind: 'legacy', sourceId: 'test', equippedQuantity: 1 },
    ],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    equipmentNeedsReview: false,
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
    name: '施法测试',
    alignment: '',
    notes: '',
    currentStep: 'spells',
    ...patch,
  }
}

describe('2014 half-caster spellcasting', () => {
  it('starts both classes at level 2 and follows the half-caster spell levels', () => {
    for (const classId of ['class-2014-paladin', 'class-2014-ranger']) {
      const config = rulesRepository.getClass(classId)?.spellcasting
      expect(config?.startsAtLevel).toBe(2)
      expect(config && getMaximumSpellLevel(config, 4)).toBe(1)
      expect(config && getMaximumSpellLevel(config, 5)).toBe(2)
      expect(config && getMaximumSpellLevel(config, 17)).toBe(5)
    }
  })

  it('calculates paladin prepared spells from Charisma and half class level', () => {
    const config = rulesRepository.getClass('class-2014-paladin')?.spellcasting
    expect(config && getRequiredSpellCount(draft(), config)).toBe(4)
  })

  it('uses the 2014 ranger spells-known table', () => {
    const rangerDraft = draft({ classId: 'class-2014-ranger', targetLevel: 10 })
    const config = rulesRepository.getClass('class-2014-ranger')?.spellcasting
    expect(config && getRequiredSpellCount(rangerDraft, config)).toBe(6)
  })

  it('rejects over-level and wrong-class spells', () => {
    const invalid = draft({
      targetLevel: 2,
      spellSelections: {
        cantripIds: [],
        knownSpellIds: [],
        preparedSpellIds: ['spell-2014-bless', 'spell-2014-aid'],
        spellbookSpellIds: [],
        transcribedSpellIds: [],
      },
    })
    expect(validateSpellSelections(invalid)).toBe(false)
    expect(validateDraft(invalid).some((issue) => issue.id === 'unavailable-spell')).toBe(true)
  })

  it('derives spell attack and save DC with visible sources', () => {
    const result = deriveCharacter(draft())
    expect(result.spellAttackBonus?.value).toBe(5)
    expect(result.spellSaveDc?.value).toBe(13)
    expect(result.spellSaveDc?.sources.map((source) => source.id)).toEqual([
      'spell-dc-base',
      'spell-dc-proficiency',
      'spell-dc-ability',
    ])
  })
})

describe('2014 牧师/德鲁伊戏法数量（缺陷回归：车卡页无戏法选择入口）', () => {
  it('牧师戏法数量按 PHB 表推进：1/4/10/20 级为 3/4/5/5', () => {
    const config = rulesRepository.getClass('class-2014-cleric')?.spellcasting
    expect(config).toBeDefined()
    for (const [level, expected] of [[1, 3], [4, 4], [10, 5], [20, 5]] as const) {
      expect(config && getRequiredCantripCount(draft({ classId: 'class-2014-cleric', targetLevel: level }), config), `cleric L${level}`).toBe(expected)
    }
  })

  it('德鲁伊戏法数量按 PHB 表推进：1/4/10/20 级为 2/3/4/4', () => {
    const config = rulesRepository.getClass('class-2014-druid')?.spellcasting
    expect(config).toBeDefined()
    for (const [level, expected] of [[1, 2], [4, 3], [10, 4], [20, 4]] as const) {
      expect(config && getRequiredCantripCount(draft({ classId: 'class-2014-druid', targetLevel: level }), config), `druid L${level}`).toBe(expected)
    }
  })

  it('圣武士、游侠 2014 规则无戏法：数量恒为 0', () => {
    const paladin = rulesRepository.getClass('class-2014-paladin')?.spellcasting
    expect(paladin && getRequiredCantripCount(draft(), paladin)).toBe(0)
    const ranger = rulesRepository.getClass('class-2014-ranger')?.spellcasting
    expect(ranger && getRequiredCantripCount(draft({ classId: 'class-2014-ranger' }), ranger)).toBe(0)
  })

  it('牧师选满职业戏法与准备法术后校验通过；缺选戏法不通过', () => {
    const complete = draft({
      classId: 'class-2014-cleric',
      targetLevel: 1,
      spellSelections: {
        cantripIds: ['spell-2014-sacred-flame', 'spell-2014-guidance', 'spell-2014-light'],
        knownSpellIds: [],
        preparedSpellIds: ['spell-2014-bless', 'spell-2014-cure-wounds'],
        spellbookSpellIds: [],
        transcribedSpellIds: [],
      },
    })
    expect(validateSpellSelections(complete)).toBe(true)
    const missingOne = { ...complete, spellSelections: { ...complete.spellSelections, cantripIds: ['spell-2014-sacred-flame', 'spell-2014-guidance'] } }
    expect(validateSpellSelections(missingOne)).toBe(false)
  })

  it('牧师选非本职业戏法（火焰箭）校验不通过', () => {
    const invalid = draft({
      classId: 'class-2014-cleric',
      targetLevel: 1,
      spellSelections: {
        cantripIds: ['spell-2014-fire-bolt', 'spell-2014-guidance', 'spell-2014-light'],
        knownSpellIds: [],
        preparedSpellIds: ['spell-2014-bless', 'spell-2014-cure-wounds'],
        spellbookSpellIds: [],
        transcribedSpellIds: [],
      },
    })
    expect(validateSpellSelections(invalid)).toBe(false)
  })
})

describe('2014 spell slots', () => {
  const fullCasterIds = ['class-2014-bard', 'class-2014-cleric', 'class-2014-druid', 'class-2014-sorcerer', 'class-2014-wizard']
  const halfCasterIds = ['class-2014-paladin', 'class-2014-ranger']

  it('follows the full-caster slot table for all five full casters at every level', () => {
    for (const classId of fullCasterIds) {
      const config = rulesRepository.getClass(classId)?.spellcasting
      expect(config, classId).toBeDefined()
      for (let level = 1; level <= 20; level += 1) {
        const expected = FULL_CASTER_SPELL_SLOTS[level - 1].map((count, index) => ({ level: index + 1, count }))
        expect(config && getSpellSlots(config, level), `${classId} L${level}`).toEqual(expected)
      }
    }
  })

  it('exposes key full-caster levels (wizard 1/5/9/20)', () => {
    const config = rulesRepository.getClass('class-2014-wizard')?.spellcasting
    expect(config && getSpellSlots(config, 1)).toEqual([{ level: 1, count: 2 }])
    expect(config && getSpellSlots(config, 5)).toEqual([
      { level: 1, count: 4 }, { level: 2, count: 3 }, { level: 3, count: 2 },
    ])
    expect(config && getSpellSlots(config, 9)).toEqual([
      { level: 1, count: 4 }, { level: 2, count: 3 }, { level: 3, count: 3 }, { level: 4, count: 3 }, { level: 5, count: 1 },
    ])
    expect(config && getSpellSlots(config, 20)).toEqual([
      { level: 1, count: 4 }, { level: 2, count: 3 }, { level: 3, count: 3 }, { level: 4, count: 3 },
      { level: 5, count: 3 }, { level: 6, count: 2 }, { level: 7, count: 2 }, { level: 8, count: 1 }, { level: 9, count: 1 },
    ])
  })

  it('starts half casters with no slots and follows the half-caster table', () => {
    for (const classId of halfCasterIds) {
      const config = rulesRepository.getClass(classId)?.spellcasting
      expect(config && getSpellSlots(config, 1)).toEqual([])
      expect(config && getSpellSlots(config, 2)).toEqual([{ level: 1, count: 2 }])
      expect(config && getSpellSlots(config, 5)).toEqual([{ level: 1, count: 4 }, { level: 2, count: 2 }])
      expect(config && getSpellSlots(config, 20)).toEqual([
        { level: 1, count: 4 }, { level: 2, count: 3 }, { level: 3, count: 3 }, { level: 4, count: 3 }, { level: 5, count: 2 },
      ])
      for (let level = 1; level <= 20; level += 1) {
        const expected = HALF_CASTER_SPELL_SLOTS[level - 1].map((count, index) => ({ level: index + 1, count }))
        expect(config && getSpellSlots(config, level), `${classId} L${level}`).toEqual(expected)
      }
    }
  })

  it('returns pact slots with count, level and pact flag (warlock 1/5/11/17/20)', () => {
    const config = rulesRepository.getClass('class-2014-warlock')?.spellcasting
    expect(config && getSpellSlots(config, 1)).toEqual([{ level: 1, count: 1, pact: true }])
    expect(config && getSpellSlots(config, 5)).toEqual([{ level: 3, count: 2, pact: true }])
    expect(config && getSpellSlots(config, 11)).toEqual([{ level: 5, count: 3, pact: true }])
    expect(config && getSpellSlots(config, 17)).toEqual([{ level: 5, count: 4, pact: true }])
    expect(config && getSpellSlots(config, 20)).toEqual([{ level: 5, count: 4, pact: true }])
    for (let level = 1; level <= 20; level += 1) {
      const [count, slotLevel] = PACT_SPELL_SLOTS[level - 1]
      expect(config && getSpellSlots(config, level), `warlock L${level}`).toEqual([{ level: slotLevel, count, pact: true }])
    }
  })

  it('returns empty slots for out-of-range levels and no config for non-casters', () => {
    const wizard = rulesRepository.getClass('class-2014-wizard')?.spellcasting
    expect(wizard && getSpellSlots(wizard, 0)).toEqual([])
    expect(wizard && getSpellSlots(wizard, 21)).toEqual([])
    expect(rulesRepository.getClass('class-2014-fighter')?.spellcasting).toBeUndefined()
  })

  it('keeps slot tables consistent with maxSpellLevelByClassLevel', () => {
    for (const classId of ['class-2014-wizard', 'class-2014-paladin', 'class-2014-warlock']) {
      const config = rulesRepository.getClass(classId)?.spellcasting
      for (let level = 1; level <= 20; level += 1) {
        const slots = config && getSpellSlots(config, level)
        const maxLevel = config && getMaximumSpellLevel(config, level)
        if (slots && slots.length) {
          expect(Math.max(...slots.map((slot) => slot.level)), `${classId} L${level}`).toBe(maxLevel)
        } else {
          expect(maxLevel, `${classId} L${level}`).toBe(0)
        }
      }
    }
  })
})

describe('三分之一施法者（奥法骑士 / 诡术师）', () => {
  function ekDraft(patch: Partial<CharacterDraft> = {}): CharacterDraft {
    return draft({
      classId: 'class-2014-fighter',
      subclassId: 'subclass-2014-fighter-eldritch-knight',
      targetLevel: 3,
      baseAbilities: { str: 15, dex: 10, con: 13, int: 16, wis: 12, cha: 8 },
      ...patch,
    })
  }

  it('EK/AT 共用 1/3 施法者法术位表（3/5/11/14/19 关键等级与逐级一致）', () => {
    const ek = rulesRepository.getSubclass('subclass-2014-fighter-eldritch-knight')?.spellcasting
    const at = rulesRepository.getSubclass('subclass-2014-rogue-arcane-trickster')?.spellcasting
    expect(ek).toBeDefined()
    expect(at).toBeDefined()
    expect(ek?.slotsByClassLevel).toBe(at?.slotsByClassLevel)
    expect(ek && getSpellSlots(ek, 3)).toEqual([{ level: 1, count: 2 }])
    expect(ek && getSpellSlots(ek, 5)).toEqual([{ level: 1, count: 3 }, { level: 2, count: 1 }])
    expect(ek && getSpellSlots(ek, 11)).toEqual([{ level: 1, count: 3 }, { level: 2, count: 2 }, { level: 3, count: 1 }])
    expect(ek && getSpellSlots(ek, 14)).toEqual([{ level: 1, count: 3 }, { level: 2, count: 2 }, { level: 3, count: 2 }])
    expect(ek && getSpellSlots(ek, 19)).toEqual([{ level: 1, count: 3 }, { level: 2, count: 2 }, { level: 3, count: 2 }, { level: 4, count: 1 }])
    for (let level = 1; level <= 20; level += 1) {
      const expected = THIRD_CASTER_SPELL_SLOTS[level - 1].map((count, index) => ({ level: index + 1, count }))
      expect(ek && getSpellSlots(ek, level), `EK L${level}`).toEqual(expected)
    }
    // 1—2 级无环位；最大环级与表一致。
    expect(ek && getSpellSlots(ek, 1)).toEqual([])
    expect(ek && getSpellSlots(ek, 2)).toEqual([])
    expect(ek && getMaximumSpellLevel(ek!, 3)).toBe(1)
    expect(ek && getMaximumSpellLevel(ek!, 11)).toBe(3)
  })

  it('子职施法配置优先于职业：战士+EK 生效，战士无子职不施法，法师回退职业配置', () => {
    const fighter = draft({ classId: 'class-2014-fighter', subclassId: undefined })
    expect(getSpellcastingConfig(fighter)).toBeUndefined()
    const ek = ekDraft()
    const ekConfig = getSpellcastingConfig(ek)
    expect(ekConfig?.mode).toBe('known')
    expect(ekConfig?.ability).toBe('int')
    expect(ekConfig?.startsAtLevel).toBe(3)
    // 法师子职无施法配置时回退职业配置。
    const wizard = draft({ classId: 'class-2014-wizard', subclassId: 'subclass-2014-wizard-evocation' })
    expect(getSpellcastingConfig(wizard)?.mode).toBe('spellbook')
  })

  it('已知法术与戏法数量按 1/3 进度推进（3 级 3/2，10 级 7/3）', () => {
    const level3 = ekDraft()
    expect(getRequiredSpellCount(level3, getSpellcastingConfig(level3)!)).toBe(3)
    expect(getRequiredCantripCount(level3, getSpellcastingConfig(level3)!)).toBe(2)
    const level10 = ekDraft({ targetLevel: 10 })
    expect(getRequiredSpellCount(level10, getSpellcastingConfig(level10)!)).toBe(7)
    expect(getRequiredCantripCount(level10, getSpellcastingConfig(level10)!)).toBe(3)
    const level20 = ekDraft({ targetLevel: 20 })
    expect(getRequiredSpellCount(level20, getSpellcastingConfig(level20)!)).toBe(11)
  })

  it('EK 从法师法术池选择：选满戏法与已知法术后校验通过，未选满不通过', () => {
    const complete = ekDraft({
      spellSelections: {
        cantripIds: ['spell-2014-fire-bolt', 'spell-2014-mage-hand'],
        knownSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield', 'spell-2014-burning-hands'],
        preparedSpellIds: [],
        spellbookSpellIds: [],
        transcribedSpellIds: [],
      },
    })
    expect(validateSpellSelections(complete)).toBe(true)
    const missing = ekDraft({
      spellSelections: {
        cantripIds: ['spell-2014-fire-bolt'],
        knownSpellIds: ['spell-2014-magic-missile'],
        preparedSpellIds: [],
        spellbookSpellIds: [],
        transcribedSpellIds: [],
      },
    })
    expect(validateSpellSelections(missing)).toBe(false)
  })

  it('EK 法术攻击与法术豁免 DC 使用智力', () => {
    const ek = ekDraft()
    const derived = deriveCharacter(ek)
    // 3 级熟练 +2，智力 16 调整 +3。
    expect(derived.spellAttackBonus?.value).toBe(5)
    expect(derived.spellSaveDc?.value).toBe(13)
    expect(derived.spellAttackBonus?.sources.some((source) => source.label.includes('INT'))).toBe(true)
  })
})

describe('动态候选池与魔法奥秘', () => {
  const baseCheckpoint = (candidateKind: ChoiceCheckpoint['candidateKind']): ChoiceCheckpoint => ({
    id: 'test-checkpoint',
    level: 10,
    step: 'timeline',
    kind: 'class-choice',
    title: '',
    description: '',
    required: true,
    minSelections: 2,
    maxSelections: 2,
    optionIds: [],
    candidateKind,
  })

  it('all-spells 候选池：全部 1 环及以上法术，环级不高于当前最高环', () => {
    const bard = draft({ classId: 'class-2014-bard', targetLevel: 5 })
    const candidates = getCheckpointCandidates(bard, baseCheckpoint('all-spells'))
    expect(candidates.length).toBeGreaterThan(0)
    const spells = candidates.map((id) => rulesRepository.getSpell(id))
    expect(spells.every((spell) => spell && spell.level >= 1 && spell.level <= 3)).toBe(true)
    const config = getSpellcastingConfig(bard)
    expect(config && getMaximumSpellLevel(config, 5)).toBe(3)
  })

  it('spellbook-level 候选池：仅法术书内对应环级的法术', () => {
    const wizard = draft({ classId: 'class-2014-wizard', targetLevel: 18 })
    const config = getSpellcastingConfig(wizard)
    const pool = (config?.classSpellIds ?? [])
      .map((id) => rulesRepository.getSpell(id))
      .filter((spell): spell is NonNullable<typeof spell> => Boolean(spell))
    const level1 = pool.filter((spell) => spell.level === 1).slice(0, 2).map((spell) => spell.id)
    const level3 = pool.filter((spell) => spell.level === 3).slice(0, 2).map((spell) => spell.id)
    const withBook = { ...wizard, spellSelections: { ...wizard.spellSelections, spellbookSpellIds: [...level1, ...level3] } }
    expect(getCheckpointCandidates(withBook, baseCheckpoint('spellbook-level-1'))).toEqual(level1)
    expect(getCheckpointCandidates(withBook, baseCheckpoint('spellbook-level-3'))).toEqual(level3)
    // 未写入法术书时候选为空
    expect(getCheckpointCandidates(wizard, baseCheckpoint('spellbook-level-1'))).toEqual([])
  })

  it('静态 optionIds 检查点直接返回选项（不受候选池影响）', () => {
    const fighter = draft({ classId: 'class-2014-fighter', targetLevel: 1 })
    const checkpoint: ChoiceCheckpoint = { ...baseCheckpoint(undefined), optionIds: ['style-dueling'] }
    expect(getCheckpointCandidates(fighter, checkpoint)).toEqual(['style-dueling'])
  })

  it('getMagicalSecretsSpellIds 从魔法奥秘检查点提取并去重、忽略失效选择', () => {
    const [spellA, spellB, spellC] = rulesRepository.spells.filter((spell) => spell.level > 0).map((spell) => spell.id)
    const bard = draft({
      classId: 'class-2014-bard',
      selections: [
        { checkpointId: 'bard-2014-magical-secrets-10', optionIds: [spellA, spellB], confirmedAt: '' },
        { checkpointId: 'bard-2014-magical-secrets-14', optionIds: [spellA, spellC], confirmedAt: '' },
        {
          checkpointId: 'bard-2014-magical-secrets-18',
          optionIds: [spellC],
          confirmedAt: '',
          invalidatedAt: '2026-08-06T00:00:00.000Z',
          invalidatedReason: '目标等级调整',
        },
      ],
    })
    expect(getMagicalSecretsSpellIds(bard)).toEqual([spellA, spellB, spellC])
  })
})

describe('2014 法师抄录法术书与升级名额校验（缺陷回归：重新编辑后无法继续）', () => {
  /** 5 级法师：升级名额 14（6 + 4×2），最高 3 环，准备 8（人类 +1 智力 → 智力 16 → +3 + 5），戏法 4。 */
  function wizardDraft(bookCount: number, transcribedCount: number): CharacterDraft {
    const pool = rulesRepository.spells
      .filter((spell) => spell.classIds.includes('class-2014-wizard') && spell.level >= 1 && spell.level <= 3)
      .map((spell) => spell.id)
    const cantrips = rulesRepository.spells
      .filter((spell) => spell.classIds.includes('class-2014-wizard') && spell.level === 0)
      .slice(0, 4)
      .map((spell) => spell.id)
    const book = pool.slice(0, bookCount)
    const transcribed = pool.slice(bookCount, bookCount + transcribedCount)
    return draft({
      classId: 'class-2014-wizard',
      targetLevel: 5,
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      spellSelections: {
        cantripIds: cantrips,
        knownSpellIds: [],
        preparedSpellIds: book.slice(0, 8),
        spellbookSpellIds: [...book, ...transcribed],
        transcribedSpellIds: transcribed,
      },
    })
  }

  it('书 = 14 升级名额 + 2 抄录（总数 16）时校验通过，不再卡住「继续」', () => {
    const w = wizardDraft(14, 2)
    expect(w.spellSelections.spellbookSpellIds.length).toBeGreaterThan(14)
    expect(validateSpellSelections(w)).toBe(true)
    expect(validateDraft(w).some((issue) => issue.id === 'spellbook-count')).toBe(false)
  })

  it('升级名额（非抄录）不足时校验失败，即使总数因抄录达标', () => {
    // 6 升级 + 2 抄录 = 8，非抄录 6 < 14
    expect(validateSpellSelections(wizardDraft(6, 2))).toBe(false)
  })

  it('抄录法术不顶替升级名额：13 升级 + 1 抄录 = 14 总数仍校验失败', () => {
    expect(validateSpellSelections(wizardDraft(13, 1))).toBe(false)
  })

  it('无抄录且恰好名额数量时校验通过（回归：既有严格等于语义保持）', () => {
    const w = wizardDraft(14, 0)
    expect(validateSpellSelections(w)).toBe(true)
    expect(validateDraft(w).some((issue) => issue.id === 'spellbook-count')).toBe(false)
  })
})
