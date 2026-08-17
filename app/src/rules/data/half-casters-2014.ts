import type { ClassRule, RuleOption, SubclassRule } from '@/types/rules'
import { ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS } from '@/rules/data/feats-2014'
import { HALF_CASTER_SPELL_SLOTS, halfCasterMaximumSpellLevels } from '@/rules/data/spell-slots-2014'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import { spells2014 } from '@/rules/data/spells-2014'

const basicSource = ['basic-rules-2014'] as const
const indexSource = ['phb-2014-index'] as const
const rangerSpellsKnown = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11] as const

const paladinSpellIds = spells2014.filter((spell) => spell.classIds.includes('class-2014-paladin')).map((spell) => spell.id)
const rangerSpellIds = spells2014.filter((spell) => spell.classIds.includes('class-2014-ranger')).map((spell) => spell.id)
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
    playStyleTags: ['frontline', 'durable', 'support', 'striker'],
    savingThrowAbilities: ['wis', 'cha'],
    status: 'implemented',
    sourceIds: basicSource,
    checkpoints: [
      { id: 'paladin-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项圣武士技能', description: '从圣武士技能列表中选择。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-athletics', 'skill-insight', 'skill-intimidation', 'skill-medicine', 'skill-persuasion', 'skill-religion'] },
      { id: 'paladin-2014-style-2', level: 2, step: 'timeline', kind: 'fighting-style', title: '选择战斗风格', description: '选择圣武士的战斗路线。', required: true, minSelections: 1, maxSelections: 1, optionIds: ['style-defense', 'style-dueling', 'style-great-weapon', 'style-protection'] },
      { id: 'paladin-2014-subclass-3', level: 3, step: 'timeline', kind: 'subclass', title: '选择神圣誓言', description: '誓言在3级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: paladinSubclassIds },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'paladin')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'prepared', ability: 'cha', startsAtLevel: 2, preparedFormula: 'ability-plus-half-level', maxSpellLevelByClassLevel: halfCasterMaximumSpellLevels, slotsByClassLevel: HALF_CASTER_SPELL_SLOTS, classSpellIds: paladinSpellIds },
  },
  {
    id: 'class-2014-ranger',
    ruleset: '5e-2014',
    name: '游侠',
    englishName: 'Ranger',
    summary: '2014版荒野猎手，从2级开始以感知掌握法术。',
    hitDie: 10,
    primaryAbilities: ['dex', 'wis'],
    playStyleTags: ['ranged', 'striker', 'frontline', 'utility'],
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
    spellcasting: { ruleset: '5e-2014', mode: 'known', ability: 'wis', startsAtLevel: 2, spellsKnownByLevel: rangerSpellsKnown, maxSpellLevelByClassLevel: halfCasterMaximumSpellLevels, slotsByClassLevel: HALF_CASTER_SPELL_SLOTS, classSpellIds: rangerSpellIds },
  },
]

export const halfCasterSubclasses2014: readonly SubclassRule[] = [
  ...paladinSubclassIds.map((id) => ({ id, classId: 'class-2014-paladin', ruleset: '5e-2014' as const, name: halfCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 3, summary: '2014神圣誓言索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
  ...rangerSubclassIds.map((id) => ({ id, classId: 'class-2014-ranger', ruleset: '5e-2014' as const, name: halfCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 3, summary: '2014游侠范型索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
]
