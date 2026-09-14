import type { ClassRule, SubclassRule } from '@/types/rules'
import { spells2024 } from '@/rules/data/spells-2024'

/**
 * 2024 法师与塑能师（B08-02 待接入）。
 *
 * B05 已交付法师施法配置（法术书、准备数、戏法、法术位与职业法术表）；
 * 职业特性、技能检查点与塑能师子职数据由 B08-02 补齐。本文件在 B08-01 中
 * 仅承接 B02 法师样例（施法配置），保持既有测试与仓库行为不变。
 */
const sourceIds = ['source-2024-phb'] as const

// 2024 法师施法表（B01 CF-019 核对）：不复用 2014 常量，按版本独立登记。
const wizardPreparedCounts2024 = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25] as const
const wizardCantrips2024 = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] as const
const wizardSpellbookCounts2024 = Array.from({ length: 20 }, (_, index) => 6 + index * 2)
const wizardMaxSpellLevels2024 = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 9] as const
const wizardSpellSlots2024 = [
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
] as const

const wizardClassSpellIds2024 = spells2024
  .filter((spell) => spell.classIds.includes('class-2024-wizard'))
  .map((spell) => spell.id)

const wizardFeatLevels = [4, 8, 12, 16] as const

export const wizardRule2024: ClassRule = {
  id: 'class-2024-wizard',
  ruleset: '5e-2024',
  name: '法师',
  englishName: 'Wizard',
  summary: 'B05 施法数据已接入；职业特性、技能检查点与塑能师由 B08-02 补齐。',
  hitDie: 6,
  primaryAbilities: ['int'],
  playStyleTags: ['spellcaster', 'control', 'utility'],
  savingThrowAbilities: ['int', 'wis'],
  status: 'unavailable',
  sourceIds,
  armorTraining: [],
  weaponTraining: { categories: ['simple'] },
  checkpoints: [
    ...wizardFeatLevels.map((level) => ({
      id: `class-2024-wizard-feat-${level}`, level, step: 'timeline' as const, kind: 'ability-improvement' as const,
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'] as const,
    })),
    {
      id: 'class-2024-wizard-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '19级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
  spellcasting: {
    ruleset: '5e-2024',
    mode: 'spellbook',
    ability: 'int',
    startsAtLevel: 1,
    preparedCountByLevel: wizardPreparedCounts2024,
    cantripsKnownByLevel: wizardCantrips2024,
    spellbookSpellsByLevel: wizardSpellbookCounts2024,
    maxSpellLevelByClassLevel: wizardMaxSpellLevels2024,
    slotsByClassLevel: wizardSpellSlots2024,
    classSpellIds: wizardClassSpellIds2024,
    ritualCastingFromBook: true,
  },
}

export const wizardSubclasses2024: readonly SubclassRule[] = [{
  id: 'subclass-2024-wizard-evoker',
  classId: 'class-2024-wizard',
  ruleset: '5e-2024',
  name: '塑能师',
  englishName: 'Evoker',
  selectionLevel: 3,
  summary: 'B02 架构核验样例，特性与检查点由 B08-02 接入。',
  status: 'unavailable',
  availability: 'player',
  sourceIds,
  features: [],
}]
