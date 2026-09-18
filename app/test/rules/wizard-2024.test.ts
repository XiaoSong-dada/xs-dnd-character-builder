import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { wizardFeatures2024, wizardRule2024 } from '@/rules/data/wizard-2024'
import { getResourceMax, formatResourceText } from '@/rules/resources'
import {
  getAlwaysPreparedSpellIds,
  getCheckpointCandidates,
  getSpellbookExtraAllowance,
  getSpellbookExtraCandidates,
  getSpellFreeCastings,
  getSpellcastingConfig,
  validateSpellSelections,
} from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import type { CharacterDraft } from '@/types/character'
import { draft2024, emptySpellSelections, selection } from '../fixtures/draft-2024'

const WIZARD_CONFIG = rulesRepository2024.getSpellcastingConfig({ classId: 'class-2024-wizard', subclassId: undefined })!

const NORMAL_BOOK = [
  'spell-2024-magic-missile',
  'spell-2024-mage-armor',
  'spell-2024-detect-magic',
  'spell-2024-find-familiar',
  'spell-2024-comprehend-languages',
  'spell-2024-shield',
  'spell-2024-burning-hands',
  'spell-2024-thunderwave',
  'spell-2024-chromatic-orb',
  'spell-2024-misty-step',
]
const EXTRA_EVOCATION = ['spell-2024-scorching-ray', 'spell-2024-shatter']
const WIZARD_CANTRIPS = ['spell-2024-fire-bolt', 'spell-2024-ray-of-frost', 'spell-2024-mage-hand']

function evokerDraft(level: number, overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return draft2024({
    classId: 'class-2024-wizard',
    subclassId: 'subclass-2024-wizard-evoker',
    targetLevel: level,
    spellSelections: {
      ...emptySpellSelections(),
      cantripIds: WIZARD_CANTRIPS,
      spellbookSpellIds: [...NORMAL_BOOK, ...EXTRA_EVOCATION],
      spellbookExtraSpellIds: EXTRA_EVOCATION,
      preparedSpellIds: NORMAL_BOOK.slice(0, 6),
    },
    ...overrides,
  })
}

describe('2024 法师与塑能师数据（B08-02）', () => {
  it('职业基础字段与武器训练', () => {
    const classRule = rulesRepository2024.getClass('class-2024-wizard')
    expect(classRule?.status).toBe('implemented')
    expect(classRule?.hitDie).toBe(6)
    expect(classRule?.weaponTraining).toEqual({ categories: ['simple'] })
    expect(classRule?.armorTraining).toEqual([])
    expect(classRule?.savingThrowAbilities).toEqual(['int', 'wis'])
  })

  it('职业特性 9 条、ID 唯一，选择类特性挂检查点', () => {
    expect(wizardFeatures2024).toHaveLength(9)
    expect(new Set(wizardFeatures2024.map((feature) => feature.id)).size).toBe(9)
    expect(wizardFeatures2024.every((feature) => feature.classId === 'class-2024-wizard')).toBe(true)
    const choiceFeatures = wizardFeatures2024.filter((feature) => feature.requiresChoice)
    expect(choiceFeatures.map((feature) => feature.id)).toEqual([
      'wizard-2024-class-scholar',
      'wizard-2024-class-subclass',
      'wizard-2024-class-spell-mastery',
      'wizard-2024-class-epic-boon',
      'wizard-2024-class-signature-spells',
    ])
    expect(choiceFeatures.every((feature) => (feature.checkpointIds?.length ?? 0) > 0)).toBe(true)
  })

  it('塑能师 5 条特性与额外入书规则', () => {
    const evoker = rulesRepository2024.getSubclass('subclass-2024-wizard-evoker')
    expect(evoker?.status).toBe('implemented')
    expect(evoker?.selectionLevel).toBe(3)
    expect(evoker?.features).toHaveLength(5)
    expect(evoker?.features.map((feature) => feature.level)).toEqual([3, 3, 6, 10, 14])
    expect(new Set(evoker?.features.map((feature) => feature.id)).size).toBe(5)
    expect(evoker?.spellbookExtraSpells).toEqual({ base: 2, perNewSpellLevel: 1, schools: ['塑能'] })
  })

  it('奥术回想与超限导能资源按等级登记', () => {
    const recovery = wizardFeatures2024.find((feature) => feature.id === 'wizard-2024-class-arcane-recovery')?.resource
    if (!recovery) throw new Error('缺少奥术回想资源')
    expect(getResourceMax(recovery, 1)).toBe(1)
    expect(getResourceMax(recovery, 5)).toBe(3)
    expect(getResourceMax(recovery, 20)).toBe(10)
    expect(formatResourceText(recovery, 9)).toBe('5 环级 · 长休恢复')

    const overchannel = rulesRepository2024.getSubclass('subclass-2024-wizard-evoker')?.features
      .find((feature) => feature.id === 'wizard-2024-evoker-overchannel')?.resource
    if (!overchannel) throw new Error('缺少超限导能资源')
    expect(getResourceMax(overchannel, 13)).toBe(0)
    expect(getResourceMax(overchannel, 14)).toBe(1)
    expect(overchannel.recovery).toBe('long-rest')
  })

  it('学者与法术选择检查点在职业数据中登记', () => {
    const scholar = wizardRule2024.checkpoints.find((checkpoint) => checkpoint.id === 'class-2024-wizard-scholar-2')
    expect(scholar?.kind).toBe('expertise')
    expect(scholar?.optionIds).toEqual(['skill-arcana', 'skill-history', 'skill-nature', 'skill-religion'])
    expect(scholar?.minSelections).toBe(1)

    const spellMastery = wizardRule2024.checkpoints.filter((checkpoint) => checkpoint.id.startsWith('class-2024-wizard-spell-mastery-'))
    expect(spellMastery.map((checkpoint) => checkpoint.spellGrant)).toEqual([
      { alwaysPrepared: true },
      { alwaysPrepared: true },
    ])
    const signature = wizardRule2024.checkpoints.find((checkpoint) => checkpoint.id === 'class-2024-wizard-signature-spells-20')
    expect(signature?.maxSelections).toBe(2)
  })

  it('塑能额外入书名额按等级增长，非塑能师为 0', () => {
    const allowanceAt = (level: number) => getSpellbookExtraAllowance(evokerDraft(level), WIZARD_CONFIG)
    expect([3, 4, 5, 9, 17, 20].map(allowanceAt)).toEqual([2, 2, 3, 5, 9, 9])
    const plainWizard = draft2024({ classId: 'class-2024-wizard', targetLevel: 9 })
    expect(getSpellbookExtraAllowance(plainWizard, WIZARD_CONFIG)).toBe(0)
  })

  it('塑能额外入书候选只含限定的塑能系法师法术', () => {
    const candidates = getSpellbookExtraCandidates(evokerDraft(3), WIZARD_CONFIG)
    const ids = candidates.map((spell) => spell.id)
    expect(ids).toContain('spell-2024-magic-missile')
    expect(ids).toContain('spell-2024-scorching-ray')
    expect(ids).not.toContain('spell-2024-shield')
    expect(ids).not.toContain('spell-2024-mage-armor')
    expect(candidates.every((spell) => spell.school === '塑能')).toBe(true)
  })

  it('法术精通候选取法术书中动作施法的一环／二环法术，不含护盾术', () => {
    const draft = evokerDraft(18)
    const timeline = buildTimeline('class-2024-wizard', 18, { ruleset: '5e-2024', enabledSourceIds: [], subclassId: 'subclass-2024-wizard-evoker' })
    const levelOne = timeline.find((checkpoint) => checkpoint.id === 'class-2024-wizard-spell-mastery-1')
    const levelTwo = timeline.find((checkpoint) => checkpoint.id === 'class-2024-wizard-spell-mastery-2')
    if (!levelOne || !levelTwo) throw new Error('缺少法术精通检查点')
    const firstLevelCandidates = getCheckpointCandidates(draft, levelOne)
    expect(firstLevelCandidates).toContain('spell-2024-magic-missile')
    expect(firstLevelCandidates).not.toContain('spell-2024-shield')
    const secondLevelCandidates = getCheckpointCandidates(draft, levelTwo)
    expect(secondLevelCandidates).toContain('spell-2024-scorching-ray')
  })

  it('法术精通与招牌法术登记为始终准备，招牌法术各一次短休恢复', () => {
    const draft = evokerDraft(20, {
      selections: [
        selection('class-2024-wizard-spell-mastery-1', ['spell-2024-magic-missile']),
        selection('class-2024-wizard-spell-mastery-2', ['spell-2024-scorching-ray']),
        selection('class-2024-wizard-signature-spells-20', ['spell-2024-fireball', 'spell-2024-lightning-bolt']),
      ],
    })
    const alwaysPrepared = getAlwaysPreparedSpellIds(draft)
    expect(alwaysPrepared).toEqual(expect.arrayContaining([
      'spell-2024-magic-missile',
      'spell-2024-scorching-ray',
      'spell-2024-fireball',
      'spell-2024-lightning-bolt',
    ]))
    const free = getSpellFreeCastings(draft).filter((grant) => grant.sourceId === 'class-2024-wizard-signature-spells-20')
    expect(free.map((grant) => grant.spellId)).toEqual(['spell-2024-fireball', 'spell-2024-lightning-bolt'])
    expect(free.every((grant) => grant.count === 1 && grant.recovery === 'short-rest')).toBe(true)
  })

  it('塑能额外入书在校验中与升级名额分开计数', () => {
    expect(validateSpellSelections(evokerDraft(3))).toBe(true)

    const overAllowance = evokerDraft(3, {
      spellSelections: {
        ...emptySpellSelections(),
        cantripIds: WIZARD_CANTRIPS,
        spellbookSpellIds: [...NORMAL_BOOK, ...EXTRA_EVOCATION, 'spell-2024-witch-bolt'],
        spellbookExtraSpellIds: [...EXTRA_EVOCATION, 'spell-2024-witch-bolt'],
        preparedSpellIds: NORMAL_BOOK.slice(0, 6),
      },
    })
    expect(validateSpellSelections(overAllowance)).toBe(false)

    const wrongSchool = evokerDraft(3, {
      spellSelections: {
        ...emptySpellSelections(),
        cantripIds: WIZARD_CANTRIPS,
        spellbookSpellIds: [...NORMAL_BOOK, 'spell-2024-scorching-ray', 'spell-2024-shield'],
        spellbookExtraSpellIds: ['spell-2024-scorching-ray', 'spell-2024-shield'],
        preparedSpellIds: NORMAL_BOOK.slice(0, 6),
      },
    })
    expect(validateSpellSelections(wrongSchool)).toBe(false)

    const notInBook = evokerDraft(3, {
      spellSelections: {
        ...emptySpellSelections(),
        cantripIds: WIZARD_CANTRIPS,
        spellbookSpellIds: [...NORMAL_BOOK, 'spell-2024-scorching-ray'],
        spellbookExtraSpellIds: ['spell-2024-shatter'],
        preparedSpellIds: NORMAL_BOOK.slice(0, 6),
      },
    })
    expect(validateSpellSelections(notInBook)).toBe(false)
  })
})
