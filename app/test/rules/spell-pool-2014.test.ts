import { describe, expect, it } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import {
  getAvailableSpells,
  getMaximumSpellLevel,
  getRequiredCantripCount,
  getRequiredSpellbookCount,
  getRequiredSpellCount,
} from '@/rules/spellcasting'
import type { CharacterDraft } from '@/types/character'

const CASTER_CLASSES = [
  'class-2014-bard',
  'class-2014-cleric',
  'class-2014-druid',
  'class-2014-paladin',
  'class-2014-ranger',
  'class-2014-sorcerer',
  'class-2014-warlock',
  'class-2014-wizard',
] as const

// 各职业施法属性(用于最坏情况验证:属性 20 → 调整值 +5)
const CASTING_ABILITY: Record<(typeof CASTER_CLASSES)[number], 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'> = {
  'class-2014-bard': 'cha',
  'class-2014-cleric': 'wis',
  'class-2014-druid': 'wis',
  'class-2014-paladin': 'cha',
  'class-2014-ranger': 'wis',
  'class-2014-sorcerer': 'cha',
  'class-2014-warlock': 'cha',
  'class-2014-wizard': 'int',
}

function draft(classId: string, targetLevel: number): CharacterDraft {
  const ability = CASTING_ABILITY[classId as keyof typeof CASTING_ABILITY] ?? 'cha'
  const baseAbilities = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, [ability]: 20 }
  return {
    schemaVersion: 4,
    id: `pool-${classId}`,
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId,
    raceId: 'race-2014-human',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-acolyte',
    backgroundSkillIds: ['skill-insight', 'skill-religion'],
    backgroundToolIds: [],
    languages: ['language-elvish', 'language-dwarvish'],
    proficiencyReplacements: [],
    baseAbilities,
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    equipmentNeedsReview: false,
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
    name: '法术池回归',
    alignment: '',
    notes: '',
    currentStep: 'spells',
  }
}

describe('2014 法术池完整性(回归:每职业每等级可选数 >= 需求数)', () => {
  it.each(CASTER_CLASSES)('%s 在 1-20 级每级都有足够法术可选', (classId) => {
    const classRule = rulesRepository.getClass(classId)
    const config = classRule?.spellcasting
    expect(config, `${classId} 应有施法配置`).toBeDefined()
    if (!config) return

    for (let level = 1; level <= 20; level++) {
      if (level < config.startsAtLevel) continue
      const d = draft(classId, level)
      const maximumLevel = getMaximumSpellLevel(config, level)
      const available = getAvailableSpells(d, config)
      const spellPool = available.filter((spell) => spell.level > 0 && spell.level <= maximumLevel).length
      const cantripPool = available.filter((spell) => spell.level === 0).length

      // 非戏法法术池必须不小于需求(属性 20 的最坏情况)
      expect(spellPool, `${classId} L${level}: 可选法术 ${spellPool} < 需求 ${getRequiredSpellCount(d, config)}`)
        .toBeGreaterThanOrEqual(getRequiredSpellCount(d, config))
      // 戏法池必须不小于需求
      expect(cantripPool, `${classId} L${level}: 可选戏法 ${cantripPool} < 需求 ${getRequiredCantripCount(d, config)}`)
        .toBeGreaterThanOrEqual(getRequiredCantripCount(d, config))
      // 法术书职业:法术书容量需求
      if (config.mode === 'spellbook') {
        expect(spellPool, `${classId} L${level}: 可选法术 ${spellPool} < 法术书需求 ${getRequiredSpellbookCount(d, config)}`)
          .toBeGreaterThanOrEqual(getRequiredSpellbookCount(d, config))
      }
    }
  })
})
