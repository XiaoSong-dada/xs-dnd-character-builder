import { describe, expect, it } from 'vitest'

import {
  getAvailableSpells,
  getRequiredCantripCount,
  getRequiredSpellCount,
  getRequiredSpellbookCount,
  getSpellFreeCastings,
  getSpellSlots,
  getSpellcastingConfig,
  validateSpellSelections,
} from '@/rules/spellcasting'
import {
  applyTranscription,
  getTranscribeCandidates,
  getTranscribeHours,
  getTranscribeTotalCost,
} from '@/rules/spellbook'
import { rulesRepository2024 } from '@/rules/repositories'
import type { CharacterDraft } from '@/types/character'
import { draft2024, emptySpellSelections } from '../fixtures/draft-2024'

const WIZARD_BOOK = [
  'spell-2024-magic-missile',
  'spell-2024-shield',
  'spell-2024-mage-armor',
  'spell-2024-detect-magic',
  'spell-2024-find-familiar',
  'spell-2024-comprehend-languages',
]
const WIZARD_PREPARED = [
  'spell-2024-magic-missile',
  'spell-2024-shield',
  'spell-2024-mage-armor',
  'spell-2024-detect-magic',
]
const WIZARD_CANTRIPS = ['spell-2024-fire-bolt', 'spell-2024-ray-of-frost', 'spell-2024-mage-hand']

function wizardDraft(targetLevel = 1, overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return draft2024({
    classId: 'class-2024-wizard',
    targetLevel,
    spellSelections: {
      ...emptySpellSelections(),
      spellbookSpellIds: WIZARD_BOOK,
      preparedSpellIds: WIZARD_PREPARED,
      cantripIds: WIZARD_CANTRIPS,
    },
    ...overrides,
  })
}

describe('2024 法师施法配置', () => {
  it('表定准备数不随智力变化（TC-013）', () => {
    const low = wizardDraft(1, { baseAbilities: { str: 8, dex: 14, con: 13, int: 8, wis: 12, cha: 10 } })
    const high = wizardDraft(1, { baseAbilities: { str: 8, dex: 14, con: 13, int: 20, wis: 12, cha: 10 } })
    const config = getSpellcastingConfig(low)
    expect(config?.mode).toBe('spellbook')
    expect(config?.ability).toBe('int')
    expect(config?.ritualCastingFromBook).toBe(true)
    expect(config && getRequiredSpellCount(low, config)).toBe(4)
    expect(config && getRequiredSpellCount(high, config)).toBe(4)
    expect(config && getRequiredCantripCount(low, config)).toBe(3)
    expect(config && getRequiredSpellbookCount(low, config)).toBe(6)
  })

  it('1—20 级准备数、戏法与法术书按表', () => {
    const config = getSpellcastingConfig(wizardDraft(20))!
    expect(getRequiredSpellCount(wizardDraft(20), config)).toBe(25)
    expect(getRequiredCantripCount(wizardDraft(20), config)).toBe(5)
    expect(getRequiredSpellbookCount(wizardDraft(20), config)).toBe(44)
    expect(getRequiredSpellCount(wizardDraft(4), config)).toBe(7)
    expect(getRequiredCantripCount(wizardDraft(4), config)).toBe(4)
  })

  it('等级 1 法师初始选择通过校验；缺法术书名额时报错', () => {
    expect(validateSpellSelections(wizardDraft(1))).toBe(true)
    const incomplete = wizardDraft(1, {
      spellSelections: {
        ...emptySpellSelections(),
        spellbookSpellIds: WIZARD_BOOK.slice(0, 5),
        preparedSpellIds: WIZARD_PREPARED,
        cantripIds: WIZARD_CANTRIPS,
      },
    })
    expect(validateSpellSelections(incomplete)).toBe(false)
  })

  it('职业池只含法师法术且受最高可施放环限制', () => {
    const draft = wizardDraft(3)
    const config = getSpellcastingConfig(draft)!
    const available = getAvailableSpells(draft, config)
    expect(available.length).toBeGreaterThan(50)
    expect(available.every((spell) => spell.classIds.includes('class-2024-wizard'))).toBe(true)
    expect(available.every((spell) => spell.level <= 2)).toBe(true)
    expect(available.some((spell) => spell.id === 'spell-2024-fireball')).toBe(false)
    expect(available.some((spell) => spell.id === 'spell-2024-web')).toBe(true)
  })

  it('法术位按职业表派生', () => {
    const config = getSpellcastingConfig(wizardDraft(1))!
    expect(getSpellSlots(config, 1)).toEqual([{ level: 1, count: 2 }])
    expect(getSpellSlots(config, 3)).toEqual([{ level: 1, count: 4 }, { level: 2, count: 2 }])
    expect(getSpellSlots(config, 20)).toEqual([
      { level: 1, count: 4 },
      { level: 2, count: 3 },
      { level: 3, count: 3 },
      { level: 4, count: 3 },
      { level: 5, count: 3 },
      { level: 6, count: 2 },
      { level: 7, count: 2 },
      { level: 8, count: 1 },
      { level: 9, count: 1 },
    ])
  })

  it('无专长授予时没有免费施法记录', () => {
    expect(getSpellFreeCastings(wizardDraft(1))).toEqual([])
  })

  it('法师职业池覆盖仓库内全部法师法术（覆盖率清单）', () => {
    const config = getSpellcastingConfig(wizardDraft(20))!
    const expected = rulesRepository2024.spells
      .filter((spell) => spell.classIds.includes('class-2024-wizard'))
      .map((spell) => spell.id)
      .sort()
    expect(expected.length).toBeGreaterThan(150)
    expect([...config.classSpellIds].sort()).toEqual(expected)
  })
})

describe('2024 法师抄录', () => {
  it('外部抄录与自书复制使用不同费率（TC-014）', () => {
    expect(getTranscribeTotalCost(['spell-2024-magic-missile'], 'external', '5e-2024')).toBe(50)
    expect(getTranscribeTotalCost(['spell-2024-fireball'], 'external', '5e-2024')).toBe(150)
    expect(getTranscribeTotalCost(['spell-2024-fireball'], 'own-book', '5e-2024')).toBe(30)
    expect(getTranscribeHours(3, 'external', '5e-2024')).toBe(6)
    expect(getTranscribeHours(2, 'own-book', '5e-2024')).toBe(2)
    // 2014 保持单一费率
    expect(getTranscribeTotalCost(['spell-2014-fireball'], 'own-book', '5e-2014')).toBe(150)
  })

  it('候选池只含职业池内未入书的法术，抄录后写入书库并记录来源', () => {
    const draft = wizardDraft(1)
    const config = getSpellcastingConfig(draft)!
    const candidates = getTranscribeCandidates(draft, config)
    expect(candidates.some((spell) => spell.id === 'spell-2024-burning-hands')).toBe(true)
    expect(candidates.some((spell) => spell.id === 'spell-2024-magic-missile')).toBe(false)
    expect(candidates.every((spell) => spell.level >= 1 && spell.level <= 1)).toBe(true)

    const result = applyTranscription(draft, ['spell-2024-burning-hands'], 'own-book')
    expect(result.cost).toBe(10)
    expect(result.spellSelections.spellbookSpellIds).toContain('spell-2024-burning-hands')
    expect(result.spellSelections.transcribedSpellIds).toContain('spell-2024-burning-hands')
    expect(result.spellSelections.preparedSpellIds).not.toContain('spell-2024-burning-hands')
  })
})
