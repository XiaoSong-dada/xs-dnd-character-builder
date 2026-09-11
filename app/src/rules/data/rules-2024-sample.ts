import type {
  BackgroundRule,
  ClassRule,
  EquipmentRule,
  FeatRule,
  RaceRule,
  SpellRule,
  SubclassRule,
} from '@/types/rules'
import type { RuleSource } from '@/types/character'

export const sources2024Sample: readonly RuleSource[] = [{
  id: 'source-2024-phb',
  title: '玩家手册（2024）',
  shortTitle: 'PHB 2024',
  ruleset: '5e-2024',
  category: 'core',
  selectable: false,
}]

export const classes2024Sample: readonly ClassRule[] = [
  {
    id: 'class-2024-fighter', ruleset: '5e-2024', name: '战士', englishName: 'Fighter',
    summary: 'B02 架构核验样例，完整成长数据由 B04 接入。', hitDie: 10,
    primaryAbilities: ['str', 'dex'], playStyleTags: ['frontline', 'durable', 'striker', 'ranged'],
    savingThrowAbilities: ['str', 'con'], status: 'unavailable', sourceIds: ['source-2024-phb'], checkpoints: [],
  },
  {
    id: 'class-2024-wizard', ruleset: '5e-2024', name: '法师', englishName: 'Wizard',
    summary: 'B02 架构核验样例，完整施法与成长数据由 B04/B05 接入。', hitDie: 6,
    primaryAbilities: ['int'], playStyleTags: ['spellcaster', 'control', 'utility'],
    savingThrowAbilities: ['int', 'wis'], status: 'unavailable', sourceIds: ['source-2024-phb'], checkpoints: [],
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

export const races2024Sample: readonly RaceRule[] = [{
  id: 'species-2024-human', ruleset: '5e-2024', name: '人类', englishName: 'Human',
  summary: 'B02 起源隔离样例。', description: '完整物种选择与收益由 B06 接入。',
  subraceIds: [], fixedAbilityBonuses: {}, recommendedClassIds: [], status: 'unavailable', sourceIds: ['source-2024-phb'],
}]

export const backgrounds2024Sample: readonly BackgroundRule[] = [{
  id: 'background-2024-sage', ruleset: '5e-2024', name: '贤者', englishName: 'Sage',
  summary: 'B02 起源隔离样例。', description: '完整背景属性、专长及装备由 B06 接入。',
  variantIds: [], skillIds: [], toolIds: [], languageChoices: 0, featureName: '待 B06 装配',
  recommendedClassIds: [], status: 'unavailable', sourceIds: ['source-2024-phb'],
}]

export const feats2024Sample: readonly FeatRule[] = [{
  id: 'feat-2024-alert', ruleset: '5e-2024', name: '警觉', englishName: 'Alert',
  description: 'B02 专长隔离样例。', detail: '完整效果与子选择由 B04 接入。', tags: ['origin'],
  status: 'unavailable', sourceIds: ['source-2024-phb'],
}]

export const spells2024Sample: readonly SpellRule[] = [{
  id: 'spell-2024-magic-missile', ruleset: '5e-2024', name: '魔法飞弹', englishName: 'Magic Missile',
  level: 1, ritual: false, classIds: ['class-2024-wizard'], summary: '1环法术；B02隔离样例。',
  description: '完整参数和效果由 B05 接入。', status: 'unavailable', sourceIds: ['source-2024-phb'],
}]

export const equipment2024Sample: readonly EquipmentRule[] = [{
  id: 'equipment-2024-longsword', ruleset: '5e-2024', name: '长剑', englishName: 'Longsword',
  status: 'unavailable', description: 'B02 普通装备隔离样例。', classIds: ['class-2024-fighter'],
  equippable: true, weaponKind: 'martial-melee', damageDice: '1d8', damageType: '挥砍',
  weaponProperties: ['versatile'], versatileDamageDice: '1d10', category: 'weapon', attunement: 'none',
  sourceIds: ['source-2024-phb'],
}]
