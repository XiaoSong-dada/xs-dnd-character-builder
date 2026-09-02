import type { ClassRule, RuleOption, SubclassRule } from '@/types/rules'
import { ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS } from '@/rules/data/feats-2014'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'

const basicSource = ['basic-rules-2014'] as const
const indexSource = ['phb-2014-index'] as const

const barbarianSkillIds = [
  'skill-animal-handling',
  'skill-athletics',
  'skill-intimidation',
  'skill-nature',
  'skill-perception',
  'skill-survival',
] as const
const monkSkillIds = [
  'skill-acrobatics',
  'skill-athletics',
  'skill-history',
  'skill-insight',
  'skill-religion',
  'skill-stealth',
] as const
const rogueSkillIds = [
  'skill-acrobatics',
  'skill-athletics',
  'skill-deception',
  'skill-insight',
  'skill-intimidation',
  'skill-investigation',
  'skill-perception',
  'skill-performance',
  'skill-persuasion',
  'skill-sleight-of-hand',
  'skill-stealth',
] as const
const expertiseOptionIds = [
  'skill-acrobatics',
  'skill-animal-handling',
  'skill-arcana',
  'skill-athletics',
  'skill-deception',
  'skill-history',
  'skill-insight',
  'skill-intimidation',
  'skill-investigation',
  'skill-medicine',
  'skill-nature',
  'skill-perception',
  'skill-performance',
  'skill-persuasion',
  'skill-religion',
  'skill-sleight-of-hand',
  'skill-stealth',
  'skill-survival',
  'tool-thieves-tools',
] as const

const barbarianSubclassIds = [
  'subclass-2014-barbarian-berserker',
  'subclass-2014-barbarian-totem-warrior',
  'subclass-2014-barbarian-ancestral-guardian',
  'subclass-2014-barbarian-battlerager',
  'subclass-2014-barbarian-beast',
  'subclass-2014-barbarian-giant',
  'subclass-2014-barbarian-storm-herald',
  'subclass-2014-barbarian-wild-magic',
  'subclass-2014-barbarian-zealot',
] as const
const monkSubclassIds = [
  'subclass-2014-monk-open-hand',
  'subclass-2014-monk-shadow',
  'subclass-2014-monk-four-elements',
  'subclass-2014-monk-long-death',
  'subclass-2014-monk-drunken-master',
  'subclass-2014-monk-kensei',
  'subclass-2014-monk-sun-soul',
  'subclass-2014-monk-astral-self',
  'subclass-2014-monk-mercy',
  'subclass-2014-monk-ascendant-dragon',
] as const
const rogueSubclassIds = [
  'subclass-2014-rogue-thief',
  'subclass-2014-rogue-assassin',
  'subclass-2014-rogue-arcane-trickster',
  'subclass-2014-rogue-inquisitive',
  'subclass-2014-rogue-mastermind',
  'subclass-2014-rogue-phantom',
  'subclass-2014-rogue-scout',
  'subclass-2014-rogue-soulknife',
  'subclass-2014-rogue-swashbuckler',
] as const

export const martialOptions2014: readonly RuleOption[] = [
  { id: 'skill-nature', name: '自然', description: '智力相关技能。', status: 'implemented', sourceIds: basicSource },
  { id: 'skill-arcana', name: '奥秘', description: '智力相关技能。', status: 'implemented', sourceIds: basicSource },
  { id: 'skill-medicine', name: '医药', description: '感知相关技能。', status: 'implemented', sourceIds: basicSource },
  { id: 'skill-religion', name: '宗教', description: '智力相关技能。', status: 'implemented', sourceIds: basicSource },
  { id: 'skill-stealth', name: '隐匿', description: '敏捷相关技能。', status: 'implemented', sourceIds: basicSource },
  { id: 'skill-deception', name: '欺瞒', description: '魅力相关技能。', status: 'implemented', sourceIds: basicSource },
  { id: 'skill-investigation', name: '调查', description: '智力相关技能。', status: 'implemented', sourceIds: basicSource },
  { id: 'skill-performance', name: '表演', description: '魅力相关技能。', status: 'implemented', sourceIds: basicSource },
  { id: 'skill-persuasion', name: '游说', description: '魅力相关技能。', status: 'implemented', sourceIds: basicSource },
  { id: 'skill-sleight-of-hand', name: '巧手', description: '敏捷相关技能。', status: 'implemented', sourceIds: basicSource },
  { id: 'tool-thieves-tools', name: '盗贼工具', description: '可作为游荡者专精的工具熟练。', status: 'implemented', sourceIds: basicSource },
  { id: 'tool-artisans-tools', name: '一种工匠工具', description: '选择一种工匠工具熟练。', status: 'index-only', sourceIds: indexSource },
  { id: 'tool-musical-instrument', name: '一种乐器', description: '选择一种乐器熟练。', status: 'index-only', sourceIds: indexSource },
  { id: 'tool-poisoners-kit', name: '制毒工具', description: '选择制毒工具熟练。', status: 'index-only', sourceIds: indexSource },
  ...barbarianSubclassIds.map((id) => ({
    id,
    name: ({
      'subclass-2014-barbarian-berserker': '狂战士道途',
      'subclass-2014-barbarian-totem-warrior': '图腾武者道途',
      'subclass-2014-barbarian-ancestral-guardian': '先祖守护者道途',
      'subclass-2014-barbarian-battlerager': '战狂道途',
      'subclass-2014-barbarian-beast': '野兽道途',
      'subclass-2014-barbarian-giant': '巨人道途',
      'subclass-2014-barbarian-storm-herald': '风暴先驱道途',
      'subclass-2014-barbarian-wild-magic': '狂野魔法道途',
      'subclass-2014-barbarian-zealot': '狂热者道途',
    } as Record<string, string>)[id] ?? id,
    description: '2014野蛮人子职索引；具体效果以获准来源为准。',
    status: 'index-only' as const,
    sourceIds: indexSource,
  })),
  ...monkSubclassIds.map((id) => ({
    id,
    name: ({
      'subclass-2014-monk-open-hand': '散打宗',
      'subclass-2014-monk-shadow': '暗影宗',
      'subclass-2014-monk-four-elements': '四象宗',
      'subclass-2014-monk-long-death': '永亡宗',
      'subclass-2014-monk-drunken-master': '醉拳宗',
      'subclass-2014-monk-kensei': '剑圣宗',
      'subclass-2014-monk-sun-soul': '日魂宗',
      'subclass-2014-monk-astral-self': '星界灵体宗',
      'subclass-2014-monk-mercy': '命流宗',
      'subclass-2014-monk-ascendant-dragon': '神龙宗',
    } as Record<string, string>)[id] ?? id,
    description: '2014武僧子职索引；具体效果以获准来源为准。',
    status: 'index-only' as const,
    sourceIds: indexSource,
  })),
  ...rogueSubclassIds.map((id) => ({
    id,
    name: ({
      'subclass-2014-rogue-thief': '盗贼',
      'subclass-2014-rogue-assassin': '刺客',
      'subclass-2014-rogue-arcane-trickster': '诡术师',
      'subclass-2014-rogue-inquisitive': '审判官',
      'subclass-2014-rogue-mastermind': '策士',
      'subclass-2014-rogue-phantom': '鬼魅',
      'subclass-2014-rogue-scout': '斥候',
      'subclass-2014-rogue-soulknife': '魂刃',
      'subclass-2014-rogue-swashbuckler': '游荡剑客',
    } as Record<string, string>)[id] ?? id,
    description: '2014游荡者子职索引；具体效果以获准来源为准。',
    status: 'index-only' as const,
    sourceIds: indexSource,
  })),
]

export const martialClasses2014: readonly ClassRule[] = [
  {
    id: 'class-2014-barbarian',
    ruleset: '5e-2014',
    name: '野蛮人',
    englishName: 'Barbarian',
    summary: '高生命值、狂暴与强力近战。',
    hitDie: 12,
    primaryAbilities: ['str'],
    playStyleTags: ['frontline', 'durable', 'striker'],
    savingThrowAbilities: ['str', 'con'],
    status: 'implemented',
    sourceIds: ['basic-rules-2014', 'phb-2014-index'],
    checkpoints: [
      { id: 'barbarian-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项野蛮人技能', description: '从野蛮人职业技能列表中选择。', required: true, minSelections: 2, maxSelections: 2, optionIds: barbarianSkillIds },
      { id: 'barbarian-2014-subclass-3', level: 3, step: 'timeline', kind: 'subclass', title: '选择原初道途', description: '选择野蛮人的2014子职。', required: true, minSelections: 1, maxSelections: 1, optionIds: barbarianSubclassIds },
      ...[4, 8, 12, 16, 19].map((level) => ({ id: `barbarian-2014-asi-${level}`, level, step: 'timeline' as const, kind: 'ability-improvement' as const, title: '属性提升或专长', description: '专长属于默认开放的2014可选规则。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS })),
    ],
  },
  {
    id: 'class-2014-monk',
    ruleset: '5e-2014',
    name: '武僧',
    englishName: 'Monk',
    summary: '机动、武艺与气。',
    hitDie: 8,
    primaryAbilities: ['dex', 'wis'],
    playStyleTags: ['frontline', 'skirmisher', 'striker', 'control'],
    savingThrowAbilities: ['str', 'dex'],
    status: 'implemented',
    sourceIds: ['phb-2014-index'],
    checkpoints: [
      { id: 'monk-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项武僧技能', description: '从武僧职业技能列表中选择。', required: true, minSelections: 2, maxSelections: 2, optionIds: monkSkillIds },
      { id: 'monk-2014-tool-1', level: 1, step: 'timeline', kind: 'class-choice', title: '选择工具或乐器熟练', description: '选择一种工匠工具或一种乐器。', required: true, minSelections: 1, maxSelections: 1, optionIds: ['tool-artisans-tools', 'tool-musical-instrument'] },
      { id: 'monk-2014-subclass-3', level: 3, step: 'timeline', kind: 'subclass', title: '选择宗派', description: '选择武僧的2014子职。', required: true, minSelections: 1, maxSelections: 1, optionIds: monkSubclassIds },
      ...[4, 8, 12, 16, 19].map((level) => ({ id: `monk-2014-asi-${level}`, level, step: 'timeline' as const, kind: 'ability-improvement' as const, title: '属性提升或专长', description: '属性提升与专长互斥。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS })),
    ],
  },
  {
    id: 'class-2014-rogue',
    ruleset: '5e-2014',
    name: '游荡者',
    englishName: 'Rogue',
    summary: '技能、偷袭与机动。',
    hitDie: 8,
    primaryAbilities: ['dex'],
    playStyleTags: ['striker', 'skirmisher', 'utility'],
    savingThrowAbilities: ['dex', 'int'],
    status: 'implemented',
    sourceIds: ['basic-rules-2014', 'phb-2014-index'],
    checkpoints: [
      { id: 'rogue-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择4项游荡者技能', description: '从游荡者职业技能列表中选择。', required: true, minSelections: 4, maxSelections: 4, optionIds: rogueSkillIds },
      { id: 'rogue-2014-expertise-1', level: 1, step: 'timeline', kind: 'expertise', title: '选择2项专精', description: '选择已熟练的技能，或以盗贼工具替代其中一项。', required: true, minSelections: 2, maxSelections: 2, optionIds: expertiseOptionIds },
      { id: 'rogue-2014-subclass-3', level: 3, step: 'timeline', kind: 'subclass', title: '选择游荡者范型', description: '选择游荡者的2014子职。', required: true, minSelections: 1, maxSelections: 1, optionIds: rogueSubclassIds },
      { id: 'rogue-2014-expertise-6', level: 6, step: 'timeline', kind: 'expertise', title: '再选择2项专精', description: '选择尚未获得专精的熟练技能。', required: true, minSelections: 2, maxSelections: 2, optionIds: expertiseOptionIds },
      ...[4, 8, 10, 12, 16, 19].map((level) => ({ id: `rogue-2014-asi-${level}`, level, step: 'timeline' as const, kind: 'ability-improvement' as const, title: '属性提升或专长', description: '属性提升与专长互斥。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS })),
    ],
  },
]

function subclass(
  id: string,
  classId: string,
  name: string,
  englishName: string,
): SubclassRule {
  return {
    id,
    classId,
    ruleset: '5e-2014',
    name,
    englishName,
    selectionLevel: 3,
    summary: '2014子职资料索引。',
    status: 'index-only',
    sourceIds: indexSource,
    features: getSubclassFeatures2014(id),
  }
}

export const martialSubclasses2014: readonly SubclassRule[] = [
  ...barbarianSubclassIds.map((id) => subclass(id, 'class-2014-barbarian', martialOptions2014.find((item) => item.id === id)?.name ?? id, id.replace('subclass-2014-barbarian-', ''))),
  ...monkSubclassIds.map((id) => subclass(id, 'class-2014-monk', martialOptions2014.find((item) => item.id === id)?.name ?? id, id.replace('subclass-2014-monk-', ''))),
  ...rogueSubclassIds.map((id) => subclass(id, 'class-2014-rogue', martialOptions2014.find((item) => item.id === id)?.name ?? id, id.replace('subclass-2014-rogue-', ''))),
]
