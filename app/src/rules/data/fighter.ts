import type { ClassRule, RuleOption, SubclassRule } from '@/types/rules'
import { ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS } from '@/rules/data/feats-2014'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'

const sourceIds = ['basic-rules-2014'] as const
const maneuverIds = [
  'maneuver-precision',
  'maneuver-trip',
  'maneuver-rally',
  'maneuver-menacing',
  'maneuver-riposte',
  'maneuver-pushing',
  'maneuver-disarming',
  'maneuver-commanders-strike',
  'maneuver-goading',
  'maneuver-maneuvering',
  'maneuver-sweeping',
] as const

export const fighterOptions: readonly RuleOption[] = [
  { id: 'skill-acrobatics', name: '体操', description: '敏捷相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-animal-handling', name: '驯兽', description: '感知相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-athletics', name: '运动', description: '力量相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-history', name: '历史', description: '智力相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-insight', name: '洞悉', description: '感知相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-intimidation', name: '威吓', description: '魅力相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-perception', name: '察觉', description: '感知相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-survival', name: '生存', description: '感知相关技能。', status: 'implemented', sourceIds },
  { id: 'style-archery', name: '箭术', description: '适合远程武器路线。', status: 'implemented', sourceIds },
  { id: 'style-defense', name: '防御', description: '穿着护甲时强化防御。', status: 'implemented', sourceIds },
  { id: 'style-dueling', name: '决斗', description: '单手近战武器路线。', status: 'implemented', sourceIds },
  { id: 'style-great-weapon', name: '巨武器战斗', description: '双手或两用武器路线。', status: 'implemented', sourceIds },
  { id: 'style-protection', name: '保护', description: '使用盾牌保护队友。', status: 'implemented', sourceIds },
  { id: 'style-two-weapon', name: '双武器战斗', description: '强化双持武器路线。', status: 'implemented', sourceIds },
  { id: 'subclass-2014-fighter-battle-master', name: '战斗大师', description: '使用优势骰与战技控制战场。', status: 'implemented', sourceIds: ['phb-2014-index'] },
  { id: 'maneuver-precision', name: '精准攻击', description: '战技索引；具体效果以获准规则来源为准。', status: 'index-only', sourceIds: ['phb-2014-index'] },
  { id: 'maneuver-trip', name: '绊摔攻击', description: '战技索引；具体效果以获准规则来源为准。', status: 'index-only', sourceIds: ['phb-2014-index'] },
  { id: 'maneuver-rally', name: '激励集结', description: '战技索引；具体效果以获准规则来源为准。', status: 'index-only', sourceIds: ['phb-2014-index'] },
  { id: 'maneuver-menacing', name: '恐吓攻击', description: '战技索引；具体效果以获准规则来源为准。', status: 'index-only', sourceIds: ['phb-2014-index'] },
  { id: 'maneuver-riposte', name: '还击', description: '战技索引；具体效果以获准规则来源为准。', status: 'index-only', sourceIds: ['phb-2014-index'] },
  { id: 'maneuver-pushing', name: '推撞攻击', description: '战技索引；具体效果以获准规则来源为准。', status: 'index-only', sourceIds: ['phb-2014-index'] },
  { id: 'maneuver-disarming', name: '缴械攻击', description: '战技索引；具体效果以获准规则来源为准。', status: 'index-only', sourceIds: ['phb-2014-index'] },
  { id: 'maneuver-commanders-strike', name: '指挥官突袭', description: '战技索引；具体效果以获准规则来源为准。', status: 'index-only', sourceIds: ['phb-2014-index'] },
  { id: 'maneuver-goading', name: '挑衅攻击', description: '战技索引；具体效果以获准规则来源为准。', status: 'index-only', sourceIds: ['phb-2014-index'] },
  { id: 'maneuver-maneuvering', name: '机动攻击', description: '战技索引；具体效果以获准规则来源为准。', status: 'index-only', sourceIds: ['phb-2014-index'] },
  { id: 'maneuver-sweeping', name: '横扫攻击', description: '战技索引；具体效果以获准规则来源为准。', status: 'index-only', sourceIds: ['phb-2014-index'] },
]

export const fighterRule: ClassRule = {
  id: 'class-2014-fighter',
  ruleset: '5e-2014',
  name: '战士',
  englishName: 'Fighter',
  summary: '2014版武器专家，以战斗风格、动作如潮和武术范型成长。',
  hitDie: 10,
  primaryAbilities: ['str', 'dex'],
  playStyleTags: ['frontline', 'durable', 'striker', 'ranged'],
  savingThrowAbilities: ['str', 'con'],
  status: 'implemented',
  sourceIds: ['basic-rules-2014', 'phb-2014-index'],
  checkpoints: [
    { id: 'fighter-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项战士技能', description: '从战士技能列表中选择。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-acrobatics', 'skill-animal-handling', 'skill-athletics', 'skill-history', 'skill-insight', 'skill-intimidation', 'skill-perception', 'skill-survival'] },
    { id: 'fighter-2014-style-1', level: 1, step: 'timeline', kind: 'fighting-style', title: '选择战斗风格', description: '确定常用武器与防御路线。', required: true, minSelections: 1, maxSelections: 1, optionIds: ['style-archery', 'style-defense', 'style-dueling', 'style-great-weapon', 'style-protection', 'style-two-weapon'] },
    { id: 'fighter-2014-subclass-3', level: 3, step: 'timeline', kind: 'subclass', title: '选择武术范型', description: '纵向切片实现战斗大师。', required: true, minSelections: 1, maxSelections: 1, optionIds: ['subclass-2014-fighter-battle-master'] },
    { id: 'fighter-2014-maneuvers-3', level: 3, step: 'timeline', kind: 'maneuvers', title: '选择3项战技', description: '战斗大师在3级获得三项战技。', required: true, minSelections: 3, maxSelections: 3, optionIds: maneuverIds },
    { id: 'fighter-2014-asi-4', level: 4, step: 'timeline', kind: 'ability-improvement', title: '属性提升或专长', description: '专长属于默认开放的2014可选规则。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS },
    { id: 'fighter-2014-asi-6', level: 6, step: 'timeline', kind: 'ability-improvement', title: '属性提升或专长', description: '属性提升与专长互斥。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS },
    { id: 'fighter-2014-maneuvers-7', level: 7, step: 'timeline', kind: 'maneuvers', title: '再选择2项战技', description: '选择尚未掌握的战技。', required: true, minSelections: 2, maxSelections: 2, optionIds: maneuverIds },
    { id: 'fighter-2014-asi-8', level: 8, step: 'timeline', kind: 'ability-improvement', title: '属性提升或专长', description: '属性提升与专长互斥。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS },
    { id: 'fighter-2014-maneuvers-10', level: 10, step: 'timeline', kind: 'maneuvers', title: '再选择2项战技', description: '10级优势骰提升为d10，并新增两项战技。', required: true, minSelections: 2, maxSelections: 2, optionIds: maneuverIds },
    { id: 'fighter-2014-asi-12', level: 12, step: 'timeline', kind: 'ability-improvement', title: '属性提升或专长', description: '12级战士选择。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS },
    { id: 'fighter-2014-asi-14', level: 14, step: 'timeline', kind: 'ability-improvement', title: '属性提升或专长', description: '14级战士选择。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS },
    { id: 'fighter-2014-maneuvers-15', level: 15, step: 'timeline', kind: 'maneuvers', title: '再选择2项战技', description: '选择尚未掌握的战技。', required: true, minSelections: 2, maxSelections: 2, optionIds: maneuverIds },
    { id: 'fighter-2014-asi-16', level: 16, step: 'timeline', kind: 'ability-improvement', title: '属性提升或专长', description: '16级战士选择。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS },
    { id: 'fighter-2014-asi-19', level: 19, step: 'timeline', kind: 'ability-improvement', title: '属性提升或专长', description: '19级战士选择。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS },
  ],
}

export const fighterSubclasses: readonly SubclassRule[] = [
  { id: 'subclass-2014-fighter-battle-master', classId: 'class-2014-fighter', ruleset: '5e-2014', name: '战斗大师', englishName: 'Battle Master', selectionLevel: 3, summary: '以优势骰和战技控制战场。', status: 'implemented', sourceIds: ['phb-2014-index'], features: getSubclassFeatures2014('subclass-2014-fighter-battle-master') },
  { id: 'subclass-2014-fighter-champion', classId: 'class-2014-fighter', ruleset: '5e-2014', name: '勇士', englishName: 'Champion', selectionLevel: 3, summary: '直接强化武器和运动能力。', status: 'implemented', sourceIds, features: getSubclassFeatures2014('subclass-2014-fighter-champion') },
  { id: 'subclass-2014-fighter-eldritch-knight', classId: 'class-2014-fighter', ruleset: '5e-2014', name: '奥法骑士', englishName: 'Eldritch Knight', selectionLevel: 3, summary: '结合武器和法师法术。', status: 'index-only', sourceIds: ['phb-2014-index'], features: getSubclassFeatures2014('subclass-2014-fighter-eldritch-knight') },
]
