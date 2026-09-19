import { describe, expect, it } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import { arcaneCasterOptions2014 } from '@/rules/data/arcane-casters-2014'
import { classFeatures2014 } from '@/rules/data/class-features-2014'
import { INVOCATION_2014_CHECKPOINT_IDS, INVOCATION_2014_OPTION_IDS } from '@/rules/data/invocations-2014'
import { rulesRepository } from '@/rules/repository'
import { buildTimeline } from '@/rules/timeline'
import {
  getAvailableSpells,
  getMaximumSpellLevel,
  getRequiredCantripCount,
  getRequiredSpellbookCount,
  getRequiredSpellCount,
  validateSpellSelections,
} from '@/rules/spellcasting'
import type { CharacterDraft } from '@/types/character'

function draft(patch: Partial<CharacterDraft>): CharacterDraft {
  return {
    schemaVersion: 4,
    id: 'arcane-test',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 8,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-wizard',
    raceId: 'race-2014-human',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-sage',
    backgroundSkillIds: ['skill-arcana', 'skill-history'],
    backgroundToolIds: [],
    languages: ['language-elvish', 'language-dwarvish'],
    proficiencyReplacements: [],
    baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    equipmentNeedsReview: false,
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
    name: '奥术测试',
    alignment: '',
    notes: '',
    currentStep: 'spells',
    ...patch,
  }
}

describe('2014 wizard and warlock spellcasting', () => {
  it('builds the level 8 wizard spellbook and prepared limits', () => {
    const value = draft({})
    const config = rulesRepository.getClass('class-2014-wizard')?.spellcasting
    expect(config && getRequiredCantripCount(value, config)).toBe(4)
    expect(config && getRequiredSpellbookCount(value, config)).toBe(20)
    expect(config && getRequiredSpellCount(value, config)).toBe(11)
    expect(config && getMaximumSpellLevel(config, 8)).toBe(4)
  })

  it('requires prepared wizard spells to be present in the spellbook', () => {
    const base = draft({})
    const config = rulesRepository.getClass('class-2014-wizard')?.spellcasting
    if (!config) throw new Error('wizard config missing')
    const available = getAvailableSpells(base, config)
    const cantrips = available.filter((spell) => spell.level === 0).slice(0, 4).map((spell) => spell.id)
    const book = available.filter((spell) => spell.level > 0).slice(0, 20).map((spell) => spell.id)
    const valid = draft({ spellSelections: { cantripIds: cantrips, spellbookSpellIds: book, preparedSpellIds: book.slice(0, 11), knownSpellIds: [], transcribedSpellIds: [] } })
    expect(validateSpellSelections(valid)).toBe(true)
    expect(validateSpellSelections(draft({
      spellSelections: {
        ...valid.spellSelections,
        preparedSpellIds: [...book.slice(0, 10), available.filter((spell) => spell.level > 0)[25]?.id ?? 'missing'],
      },
    }))).toBe(false)
  })

  it('uses pact limits for a level 12 warlock', () => {
    const value = draft({ classId: 'class-2014-warlock', targetLevel: 12 })
    const config = rulesRepository.getClass('class-2014-warlock')?.spellcasting
    expect(config && getRequiredCantripCount(value, config)).toBe(4)
    expect(config && getRequiredSpellCount(value, config)).toBe(11)
    expect(config && getMaximumSpellLevel(config, 12)).toBe(5)
    const result = deriveCharacter(value)
    expect(result.spellAttackBonus?.value).toBe(4)
    expect(result.spellSaveDc?.value).toBe(12)
  })

  it('registers the full 2014 warlock invocation set and four pact boons', () => {
    const optionIds = new Set(arcaneCasterOptions2014.map((option) => option.id))
    expect(INVOCATION_2014_OPTION_IDS.every((id) => optionIds.has(id))).toBe(true)
    expect(rulesRepository.getOption('pact-talisman')).toBeDefined()

    const timeline = buildTimeline('class-2014-warlock', 20, {
      enabledSourceIds: ['phb-2014-index', 'xgte-2017-index', 'tcoe-2020-index'],
    })
    expect(timeline.filter((checkpoint) => checkpoint.id.startsWith('warlock-2014-invocations-'))).toHaveLength(7)
    expect(timeline.find((checkpoint) => checkpoint.id === 'warlock-2014-pact-3')?.optionIds).toEqual([
      'pact-chain',
      'pact-blade',
      'pact-tome',
      'pact-talisman',
    ])
  })

  it('邪术师祈唤、魔契恩泽与宗主选择使用可展开卡片，并挂上职业特性检查点', () => {
    const timeline = buildTimeline('class-2014-warlock', 20, {
      enabledSourceIds: ['phb-2014-index', 'xgte-2017-index', 'tcoe-2020-index'],
    })
    const expandableIds = timeline.filter((checkpoint) => checkpoint.optionPresentation === 'expandable').map((checkpoint) => checkpoint.id)
    expect(expandableIds).toEqual([
      'warlock-2014-subclass-1',
      'warlock-2014-invocations-2',
      'warlock-2014-pact-3',
      'warlock-2014-invocations-5',
      'warlock-2014-invocations-7',
      'warlock-2014-invocations-9',
      'warlock-2014-invocations-12',
      'warlock-2014-invocations-15',
      'warlock-2014-invocations-18',
    ])

    // 角色卡「已选选项详情」依赖特性的 checkpointIds 关联
    expect(classFeatures2014.find((feature) => feature.id === 'warlock-2014-class-eldritch-invocations')?.checkpointIds).toEqual(INVOCATION_2014_CHECKPOINT_IDS)
    expect(classFeatures2014.find((feature) => feature.id === 'warlock-2014-class-pact-boon')?.checkpointIds).toEqual(['warlock-2014-pact-3'])
  })

  it('邪术师相关条目取消索引态，法师等其它职业保持不变', () => {
    for (const id of [...INVOCATION_2014_OPTION_IDS, 'pact-chain', 'pact-blade', 'pact-tome', 'pact-talisman']) {
      expect(rulesRepository.getOption(id)?.status, id).toBe('implemented')
    }
    for (const id of ['subclass-2014-warlock-archfey', 'subclass-2014-warlock-fiend', 'subclass-2014-warlock-great-old-one']) {
      expect(rulesRepository.getOption(id)?.status, id).toBe('implemented')
      expect(rulesRepository.getSubclass(id)?.status, id).toBe('implemented')
    }
    // 范围仅限本批的 3 个宗主：其它邪术师子职与法师子职均未被升级
    expect(rulesRepository.getSubclass('subclass-2014-warlock-hexblade')?.status).not.toBe('implemented')
    expect(rulesRepository.getSubclass('subclass-2014-wizard-abjuration')?.status).not.toBe('implemented')
  })
})
