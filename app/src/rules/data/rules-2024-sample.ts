import type {
  ChoiceCheckpoint,
  ClassRule,
  EquipmentRule,
  FeatCategory,
  SubclassRule,
} from '@/types/rules'
import type { RuleSource } from '@/types/character'
import { spells2024 } from '@/rules/data/spells-2024'

export const sources2024Sample: readonly RuleSource[] = [{
  id: 'source-2024-phb',
  title: '玩家手册（2024）',
  shortTitle: 'PHB 2024',
  ruleset: '5e-2024',
  category: 'core',
  selectable: false,
}]

/** B04 起接入的成长检查点：专长候选池按类别展开，其余职业数据由 B08 补齐。 */
function featChoiceCheckpoint(classId: string, level: number, categories: readonly FeatCategory[]): ChoiceCheckpoint {
  return {
    id: `${classId}-feat-${level}`,
    level,
    step: 'timeline',
    kind: 'ability-improvement',
    title: '属性提升或专长',
    description: '选择属性值提升专长或满足前置的专长；19 级可选择传奇恩惠。',
    required: true,
    minSelections: 1,
    maxSelections: 1,
    optionIds: [],
    featCategories: categories,
  }
}

const fighterStyleCheckpoint: ChoiceCheckpoint = {
  id: 'class-2024-fighter-style-1',
  level: 1,
  step: 'timeline',
  kind: 'fighting-style',
  title: '选择战斗风格',
  description: '战斗风格专长由战士 1 级特性授予。',
  required: true,
  minSelections: 1,
  maxSelections: 1,
  optionIds: [],
  featCategories: ['fighting-style'],
}

const fighterFeatLevels = [4, 6, 8, 12, 14, 16] as const
const wizardFeatLevels = [4, 8, 12, 16] as const

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

export const classes2024Sample: readonly ClassRule[] = [
  {
    id: 'class-2024-fighter', ruleset: '5e-2024', name: '战士', englishName: 'Fighter',
    summary: 'B02 架构核验样例，其余成长数据由 B08 接入。', hitDie: 10,
    primaryAbilities: ['str', 'dex'], playStyleTags: ['frontline', 'durable', 'striker', 'ranged'],
    savingThrowAbilities: ['str', 'con'], status: 'unavailable', sourceIds: ['source-2024-phb'],
    armorTraining: ['light', 'medium', 'heavy', 'shield'],
    checkpoints: [
      fighterStyleCheckpoint,
      ...fighterFeatLevels.map((level) => featChoiceCheckpoint('class-2024-fighter', level, ['general'])),
      featChoiceCheckpoint('class-2024-fighter', 19, ['general', 'epic-boon']),
    ],
  },
  {
    id: 'class-2024-wizard', ruleset: '5e-2024', name: '法师', englishName: 'Wizard',
    summary: 'B02 架构核验样例，施法与其余成长数据由 B05／B08 接入。', hitDie: 6,
    primaryAbilities: ['int'], playStyleTags: ['spellcaster', 'control', 'utility'],
    savingThrowAbilities: ['int', 'wis'], status: 'unavailable', sourceIds: ['source-2024-phb'],
    armorTraining: [],
    checkpoints: [
      ...wizardFeatLevels.map((level) => featChoiceCheckpoint('class-2024-wizard', level, ['general'])),
      featChoiceCheckpoint('class-2024-wizard', 19, ['general', 'epic-boon']),
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
  },
]

export const subclasses2024Sample: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-fighter-champion', classId: 'class-2024-fighter', ruleset: '5e-2024',
    name: '勇士', englishName: 'Champion', selectionLevel: 3,
    summary: 'B02 架构核验样例。', status: 'unavailable', sourceIds: ['source-2024-phb'], features: [],
  },
  {
    id: 'subclass-2024-wizard-evoker', classId: 'class-2024-wizard', ruleset: '5e-2024',
    name: '塑能师', englishName: 'Evoker', selectionLevel: 3,
    summary: 'B00“塑能学派”对应的 B02 架构核验样例。', status: 'unavailable', sourceIds: ['source-2024-phb'], features: [],
  },
]

export const equipment2024Sample: readonly EquipmentRule[] = [{
  id: 'equipment-2024-longsword', ruleset: '5e-2024', name: '长剑', englishName: 'Longsword',
  status: 'unavailable', description: 'B02 普通装备隔离样例。', classIds: ['class-2024-fighter'],
  equippable: true, weaponKind: 'martial-melee', damageDice: '1d8', damageType: '挥砍',
  weaponProperties: ['versatile'], versatileDamageDice: '1d10', category: 'weapon', attunement: 'none',
  sourceIds: ['source-2024-phb'],
}]
