import type { ClassRule, RuleOption, SpellRule, SubclassRule } from '@/types/rules'
import { ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS } from '@/rules/data/feats-2014'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'

const basicSource = ['basic-rules-2014'] as const
const indexSource = ['phb-2014-index'] as const
const halfCasterMaximumSpellLevels = [0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5] as const
const rangerSpellsKnown = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11] as const

type SpellSeed = readonly [englishName: string, name: string, level: number, classes: readonly ('paladin' | 'ranger')[]]

const spellSeeds: readonly SpellSeed[] = [
  ['Bless', '祝福术', 1, ['paladin']],
  ['Command', '命令术', 1, ['paladin']],
  ['Cure Wounds', '疗伤术', 1, ['paladin', 'ranger']],
  ['Detect Evil and Good', '侦测善恶', 1, ['paladin']],
  ['Detect Magic', '侦测魔法', 1, ['paladin', 'ranger']],
  ['Detect Poison and Disease', '侦测毒性和疾病', 1, ['paladin', 'ranger']],
  ['Divine Favor', '神恩', 1, ['paladin']],
  ['Heroism', '英雄气概', 1, ['paladin']],
  ['Protection from Evil and Good', '防护善恶', 1, ['paladin']],
  ['Purify Food and Drink', '净化食粮', 1, ['paladin']],
  ['Shield of Faith', '虔诚护盾', 1, ['paladin']],
  ['Alarm', '警报术', 1, ['ranger']],
  ['Animal Friendship', '动物友好术', 1, ['ranger']],
  ['Fog Cloud', '云雾术', 1, ['ranger']],
  ['Goodberry', '神莓术', 1, ['ranger']],
  ['Hunter’s Mark', '猎人印记', 1, ['ranger']],
  ['Jump', '跳跃术', 1, ['ranger']],
  ['Longstrider', '大步奔行', 1, ['ranger']],
  ['Speak with Animals', '动物交谈', 1, ['ranger']],
  ['Aid', '援助术', 2, ['paladin']],
  ['Branding Smite', '灼热斩', 2, ['paladin']],
  ['Find Steed', '召唤坐骑', 2, ['paladin']],
  ['Magic Weapon', '魔化武器', 2, ['paladin']],
  ['Zone of Truth', '诚实之域', 2, ['paladin']],
  ['Animal Messenger', '动物信使', 2, ['ranger']],
  ['Barkskin', '树肤术', 2, ['ranger']],
  ['Darkvision', '黑暗视觉', 2, ['ranger']],
  ['Pass without Trace', '行动无踪', 2, ['ranger']],
  ['Silence', '沉默术', 2, ['ranger']],
  ['Spike Growth', '荆棘丛生', 2, ['ranger']],
  ['Lesser Restoration', '次级复原术', 2, ['paladin', 'ranger']],
  ['Locate Object', '物品定位术', 2, ['paladin', 'ranger']],
  ['Protection from Poison', '防护毒素', 2, ['paladin', 'ranger']],
  ['Create Food and Water', '造粮术', 3, ['paladin']],
  ['Dispel Magic', '解除魔法', 3, ['paladin']],
  ['Magic Circle', '魔法阵', 3, ['paladin']],
  ['Remove Curse', '移除诅咒', 3, ['paladin']],
  ['Revivify', '回生术', 3, ['paladin']],
  ['Conjure Animals', '召唤动物', 3, ['ranger']],
  ['Nondetection', '回避侦测', 3, ['ranger']],
  ['Plant Growth', '植物滋长', 3, ['ranger']],
  ['Speak with Plants', '植物交谈', 3, ['ranger']],
  ['Water Breathing', '水下呼吸', 3, ['ranger']],
  ['Water Walk', '水上行走', 3, ['ranger']],
  ['Daylight', '昼明术', 3, ['paladin', 'ranger']],
  ['Banishment', '放逐术', 4, ['paladin']],
  ['Death Ward', '防死结界', 4, ['paladin']],
  ['Locate Creature', '生物定位术', 4, ['paladin', 'ranger']],
  ['Conjure Woodland Beings', '召唤林地之精', 4, ['ranger']],
  ['Freedom of Movement', '行动自如', 4, ['ranger']],
  ['Stoneskin', '石肤术', 4, ['ranger']],
  ['Dispel Evil and Good', '解除善恶', 5, ['paladin']],
  ['Geas', '指使术', 5, ['paladin']],
  ['Raise Dead', '死者复活', 5, ['paladin']],
  ['Commune with Nature', '问道自然', 5, ['ranger']],
  ['Tree Stride', '树跃术', 5, ['ranger']],
]

function spellId(englishName: string): string {
  return `spell-2014-${englishName.toLowerCase().replace(/’/g, '').replace(/[^a-z0-9]+/g, '-')}`
}

export const halfCasterSpells2014: readonly SpellRule[] = spellSeeds.map(([englishName, name, level, classes]) => ({
  id: spellId(englishName),
  ruleset: '5e-2014',
  name,
  englishName,
  level,
  classIds: classes.map((className) => `class-2014-${className}`),
  summary: `${level}环法术；本批提供选择与等级校验，具体效果以规则来源为准。`,
  status: 'implemented',
  sourceIds: basicSource,
}))

const paladinSpellIds = halfCasterSpells2014.filter((spell) => spell.classIds.includes('class-2014-paladin')).map((spell) => spell.id)
const rangerSpellIds = halfCasterSpells2014.filter((spell) => spell.classIds.includes('class-2014-ranger')).map((spell) => spell.id)
const paladinSubclassIds = ['subclass-2014-paladin-devotion', 'subclass-2014-paladin-ancients', 'subclass-2014-paladin-vengeance'] as const
const rangerSubclassIds = ['subclass-2014-ranger-hunter', 'subclass-2014-ranger-beast-master'] as const
const favoredEnemyIds = ['enemy-beasts', 'enemy-dragons', 'enemy-fey', 'enemy-fiends', 'enemy-giants', 'enemy-undead'] as const
const terrainIds = ['terrain-arctic', 'terrain-coast', 'terrain-desert', 'terrain-forest', 'terrain-grassland', 'terrain-mountain', 'terrain-swamp', 'terrain-underdark'] as const

export const halfCasterOptions2014: readonly RuleOption[] = [
  ...paladinSubclassIds.map((id) => ({ id, name: ({ 'subclass-2014-paladin-devotion': '奉献之誓', 'subclass-2014-paladin-ancients': '古贤之誓', 'subclass-2014-paladin-vengeance': '复仇之誓' } as Record<string, string>)[id] ?? id, description: '2014圣武士神圣誓言索引。', status: 'index-only' as const, sourceIds: indexSource })),
  ...rangerSubclassIds.map((id) => ({ id, name: id.endsWith('hunter') ? '猎人' : '驯兽师', description: '2014游侠范型索引。', status: 'index-only' as const, sourceIds: indexSource })),
  ...favoredEnemyIds.map((id) => ({ id, name: ({ 'enemy-beasts': '野兽', 'enemy-dragons': '龙类', 'enemy-fey': '精类', 'enemy-fiends': '邪魔', 'enemy-giants': '巨人', 'enemy-undead': '不死生物' } as Record<string, string>)[id] ?? id, description: '宿敌类型。', status: 'implemented' as const, sourceIds: basicSource })),
  ...terrainIds.map((id) => ({ id, name: ({ 'terrain-arctic': '极地', 'terrain-coast': '海岸', 'terrain-desert': '沙漠', 'terrain-forest': '森林', 'terrain-grassland': '草原', 'terrain-mountain': '山地', 'terrain-swamp': '沼泽', 'terrain-underdark': '幽暗地域' } as Record<string, string>)[id] ?? id, description: '自然探索者熟悉地形。', status: 'implemented' as const, sourceIds: basicSource })),
]

function asi(level: number, className: 'paladin' | 'ranger') {
  return { id: `${className}-2014-asi-${level}`, level, step: 'timeline' as const, kind: 'ability-improvement' as const, title: '属性提升或专长', description: '属性提升与专长互斥。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS }
}

export const halfCasterClasses2014: readonly ClassRule[] = [
  {
    id: 'class-2014-paladin',
    ruleset: '5e-2014',
    name: '圣武士',
    englishName: 'Paladin',
    summary: '2014版重甲神圣战士，从2级开始以魅力准备法术。',
    hitDie: 10,
    primaryAbilities: ['str', 'cha'],
    savingThrowAbilities: ['wis', 'cha'],
    status: 'implemented',
    sourceIds: basicSource,
    checkpoints: [
      { id: 'paladin-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项圣武士技能', description: '从圣武士技能列表中选择。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-athletics', 'skill-insight', 'skill-intimidation', 'skill-medicine', 'skill-persuasion', 'skill-religion'] },
      { id: 'paladin-2014-style-2', level: 2, step: 'timeline', kind: 'fighting-style', title: '选择战斗风格', description: '选择圣武士的战斗路线。', required: true, minSelections: 1, maxSelections: 1, optionIds: ['style-defense', 'style-dueling', 'style-great-weapon', 'style-protection'] },
      { id: 'paladin-2014-subclass-3', level: 3, step: 'timeline', kind: 'subclass', title: '选择神圣誓言', description: '誓言在3级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: paladinSubclassIds },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'paladin')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'prepared', ability: 'cha', startsAtLevel: 2, preparedFormula: 'ability-plus-half-level', maxSpellLevelByClassLevel: halfCasterMaximumSpellLevels, classSpellIds: paladinSpellIds },
  },
  {
    id: 'class-2014-ranger',
    ruleset: '5e-2014',
    name: '游侠',
    englishName: 'Ranger',
    summary: '2014版荒野猎手，从2级开始以感知掌握法术。',
    hitDie: 10,
    primaryAbilities: ['dex', 'wis'],
    savingThrowAbilities: ['str', 'dex'],
    status: 'implemented',
    sourceIds: basicSource,
    checkpoints: [
      { id: 'ranger-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择3项游侠技能', description: '从游侠技能列表中选择。', required: true, minSelections: 3, maxSelections: 3, optionIds: ['skill-animal-handling', 'skill-athletics', 'skill-insight', 'skill-investigation', 'skill-nature', 'skill-perception', 'skill-stealth', 'skill-survival'] },
      { id: 'ranger-2014-enemy-1', level: 1, step: 'timeline', kind: 'class-choice', title: '选择宿敌', description: '选择一种经常追踪与研究的敌人类型。', required: true, minSelections: 1, maxSelections: 1, optionIds: favoredEnemyIds },
      { id: 'ranger-2014-terrain-1', level: 1, step: 'timeline', kind: 'class-choice', title: '选择偏好地形', description: '选择一种自然探索者熟悉地形。', required: true, minSelections: 1, maxSelections: 1, optionIds: terrainIds },
      { id: 'ranger-2014-style-2', level: 2, step: 'timeline', kind: 'fighting-style', title: '选择战斗风格', description: '选择游侠的战斗路线。', required: true, minSelections: 1, maxSelections: 1, optionIds: ['style-archery', 'style-defense', 'style-dueling', 'style-two-weapon'] },
      { id: 'ranger-2014-subclass-3', level: 3, step: 'timeline', kind: 'subclass', title: '选择游侠范型', description: '范型在3级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: rangerSubclassIds },
      { id: 'ranger-2014-enemy-6', level: 6, step: 'timeline', kind: 'class-choice', title: '新增宿敌', description: '选择另一种宿敌。', required: true, minSelections: 1, maxSelections: 1, optionIds: favoredEnemyIds },
      { id: 'ranger-2014-terrain-6', level: 6, step: 'timeline', kind: 'class-choice', title: '新增偏好地形', description: '选择另一种偏好地形。', required: true, minSelections: 1, maxSelections: 1, optionIds: terrainIds },
      { id: 'ranger-2014-terrain-10', level: 10, step: 'timeline', kind: 'class-choice', title: '新增偏好地形', description: '选择第三种偏好地形。', required: true, minSelections: 1, maxSelections: 1, optionIds: terrainIds },
      { id: 'ranger-2014-enemy-14', level: 14, step: 'timeline', kind: 'class-choice', title: '新增宿敌', description: '选择第三种宿敌。', required: true, minSelections: 1, maxSelections: 1, optionIds: favoredEnemyIds },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'ranger')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'known', ability: 'wis', startsAtLevel: 2, spellsKnownByLevel: rangerSpellsKnown, maxSpellLevelByClassLevel: halfCasterMaximumSpellLevels, classSpellIds: rangerSpellIds },
  },
]

export const halfCasterSubclasses2014: readonly SubclassRule[] = [
  ...paladinSubclassIds.map((id) => ({ id, classId: 'class-2014-paladin', ruleset: '5e-2014' as const, name: halfCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 3, summary: '2014神圣誓言索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
  ...rangerSubclassIds.map((id) => ({ id, classId: 'class-2014-ranger', ruleset: '5e-2014' as const, name: halfCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 3, summary: '2014游侠范型索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
]
