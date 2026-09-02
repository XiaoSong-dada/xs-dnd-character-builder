import type { ClassRule, RuleOption, SubclassRule } from '@/types/rules'
import { ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS } from '@/rules/data/feats-2014'
import { FULL_CASTER_SPELL_SLOTS, fullCasterMaximumSpellLevels } from '@/rules/data/spell-slots-2014'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import { spells2014 } from '@/rules/data/spells-2014'
import { METAMAGIC_OPTION_IDS } from '@/rules/data/metamagic-2014'

const basicSource = ['basic-rules-2014'] as const
const indexSource = ['phb-2014-index'] as const

const bardCantrips = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] as const
const bardSpellsKnown = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 22, 22, 22] as const
// 2014 PHB 牧师表 Cantrips Known：1—3 级 3 个、4—9 级 4 个、10 级起 5 个。
const clericCantrips = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] as const
// 2014 PHB 德鲁伊表 Cantrips Known：1—3 级 2 个、4—9 级 3 个、10 级起 4 个。
const druidCantrips = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] as const
const sorcererCantrips = [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6] as const
const sorcererSpellsKnown = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15] as const

const spellIds = (classId: string): readonly string[] =>
  spells2014.filter((spell) => spell.classIds.includes(classId)).map((spell) => spell.id)

const bardSubclassIds = [
  'subclass-2014-bard-lore', 'subclass-2014-bard-valor', 'subclass-2014-bard-glamour', 'subclass-2014-bard-swords',
  'subclass-2014-bard-whispers', 'subclass-2014-bard-creation', 'subclass-2014-bard-eloquence', 'subclass-2014-bard-spirits',
] as const
const clericSubclassIds = [
  'subclass-2014-cleric-knowledge', 'subclass-2014-cleric-life', 'subclass-2014-cleric-light', 'subclass-2014-cleric-nature',
  'subclass-2014-cleric-tempest', 'subclass-2014-cleric-trickery', 'subclass-2014-cleric-war', 'subclass-2014-cleric-arcana',
  'subclass-2014-cleric-forge', 'subclass-2014-cleric-grave', 'subclass-2014-cleric-order', 'subclass-2014-cleric-peace',
  'subclass-2014-cleric-twilight',
] as const
const druidSubclassIds = [
  'subclass-2014-druid-land', 'subclass-2014-druid-moon', 'subclass-2014-druid-dreams', 'subclass-2014-druid-shepherd',
  'subclass-2014-druid-spores', 'subclass-2014-druid-stars', 'subclass-2014-druid-wildfire',
] as const
const sorcererSubclassIds = [
  'subclass-2014-sorcerer-draconic-bloodline', 'subclass-2014-sorcerer-wild-magic', 'subclass-2014-sorcerer-storm-sorcery',
  'subclass-2014-sorcerer-divine-soul', 'subclass-2014-sorcerer-shadow-magic', 'subclass-2014-sorcerer-aberrant-mind',
  'subclass-2014-sorcerer-clockwork-soul', 'subclass-2014-sorcerer-lunar-sorcery',
] as const

const allSkillIds = [
  'skill-acrobatics', 'skill-animal-handling', 'skill-arcana', 'skill-athletics', 'skill-deception', 'skill-history',
  'skill-insight', 'skill-intimidation', 'skill-investigation', 'skill-medicine', 'skill-nature', 'skill-perception',
  'skill-performance', 'skill-persuasion', 'skill-religion', 'skill-sleight-of-hand', 'skill-stealth', 'skill-survival',
] as const

function asi(level: number, className: 'bard' | 'cleric' | 'druid' | 'sorcerer') {
  return { id: `${className}-2014-asi-${level}`, level, step: 'timeline' as const, kind: 'ability-improvement' as const, title: '属性提升或专长', description: '属性提升与专长互斥。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS }
}

export const fullCasterClasses2014: readonly ClassRule[] = [
  {
    id: 'class-2014-bard', ruleset: '5e-2014', name: '吟游诗人', englishName: 'Bard', summary: '2014版多面手：技能、激励与已知法术。', hitDie: 8, primaryAbilities: ['cha'], playStyleTags: ['spellcaster', 'support', 'utility', 'control'], savingThrowAbilities: ['dex', 'cha'], status: 'implemented', sourceIds: basicSource,
    checkpoints: [
      { id: 'bard-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择3项任意技能', description: '2014吟游诗人可从任意技能中选择3项。', required: true, minSelections: 3, maxSelections: 3, optionIds: allSkillIds },
      { id: 'bard-2014-tool-1', level: 1, step: 'timeline', kind: 'class-choice', title: '选择一种乐器熟练', description: '选择一种乐器熟练。', required: true, minSelections: 1, maxSelections: 1, optionIds: ['tool-musical-instrument'] },
      { id: 'bard-2014-expertise-3', level: 3, step: 'timeline', kind: 'expertise', title: '选择2项专精', description: '选择已熟练的技能或乐器。', required: true, minSelections: 2, maxSelections: 2, optionIds: allSkillIds },
      { id: 'bard-2014-subclass-3', level: 3, step: 'timeline', kind: 'subclass', title: '选择吟游诗人学院', description: '学院在3级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: bardSubclassIds },
      { id: 'bard-2014-expertise-10', level: 10, step: 'timeline', kind: 'expertise', title: '选择2项专精（强化）', description: '再选择 2 项已熟练的技能或乐器获得专精。', required: true, minSelections: 2, maxSelections: 2, optionIds: allSkillIds },
      { id: 'bard-2014-magical-secrets-10', level: 10, step: 'timeline', kind: 'class-choice', title: '选择2个魔法奥秘法术', description: '从任意职业的法术列表中选择 2 个法术加入已知法术（环级不高于当前可用最高环）。', required: true, minSelections: 2, maxSelections: 2, optionIds: [], candidateKind: 'all-spells' },
      { id: 'bard-2014-magical-secrets-14', level: 14, step: 'timeline', kind: 'class-choice', title: '再选2个魔法奥秘法术', description: '再次从任意职业的法术列表中选择 2 个法术加入已知法术。', required: true, minSelections: 2, maxSelections: 2, optionIds: [], candidateKind: 'all-spells' },
      { id: 'bard-2014-magical-secrets-18', level: 18, step: 'timeline', kind: 'class-choice', title: '再选2个魔法奥秘法术', description: '第三次从任意职业的法术列表中选择 2 个法术加入已知法术。', required: true, minSelections: 2, maxSelections: 2, optionIds: [], candidateKind: 'all-spells' },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'bard')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'known', ability: 'cha', startsAtLevel: 1, cantripsKnownByLevel: bardCantrips, spellsKnownByLevel: bardSpellsKnown, maxSpellLevelByClassLevel: fullCasterMaximumSpellLevels, slotsByClassLevel: FULL_CASTER_SPELL_SLOTS, classSpellIds: spellIds('class-2014-bard') },
  },
  {
    id: 'class-2014-cleric', ruleset: '5e-2014', name: '牧师', englishName: 'Cleric', summary: '2014版神术施法者：领域、引导神力与准备法术。', hitDie: 8, primaryAbilities: ['wis'], playStyleTags: ['spellcaster', 'support', 'durable'], savingThrowAbilities: ['wis', 'cha'], status: 'implemented', sourceIds: basicSource,
    checkpoints: [
      { id: 'cleric-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项牧师技能', description: '从牧师技能列表中选择。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-history', 'skill-insight', 'skill-medicine', 'skill-persuasion', 'skill-religion'] },
      { id: 'cleric-2014-subclass-1', level: 1, step: 'timeline', kind: 'subclass', title: '选择神圣领域', description: '领域在1级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: clericSubclassIds },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'cleric')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'prepared', ability: 'wis', startsAtLevel: 1, preparedFormula: 'ability-plus-level', cantripsKnownByLevel: clericCantrips, maxSpellLevelByClassLevel: fullCasterMaximumSpellLevels, slotsByClassLevel: FULL_CASTER_SPELL_SLOTS, classSpellIds: spellIds('class-2014-cleric') },
  },
  {
    id: 'class-2014-druid', ruleset: '5e-2014', name: '德鲁伊', englishName: 'Druid', summary: '2014版自然施法者：荒野形态与准备法术。', hitDie: 8, primaryAbilities: ['wis'], playStyleTags: ['spellcaster', 'control', 'support', 'durable'], savingThrowAbilities: ['int', 'wis'], status: 'implemented', sourceIds: basicSource,
    checkpoints: [
      { id: 'druid-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项德鲁伊技能', description: '从德鲁伊技能列表中选择。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-arcana', 'skill-animal-handling', 'skill-insight', 'skill-medicine', 'skill-nature', 'skill-perception', 'skill-religion', 'skill-survival'] },
      { id: 'druid-2014-subclass-2', level: 2, step: 'timeline', kind: 'subclass', title: '选择德鲁伊结社', description: '结社在2级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: druidSubclassIds },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'druid')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'prepared', ability: 'wis', startsAtLevel: 1, preparedFormula: 'ability-plus-level', cantripsKnownByLevel: druidCantrips, maxSpellLevelByClassLevel: fullCasterMaximumSpellLevels, slotsByClassLevel: FULL_CASTER_SPELL_SLOTS, classSpellIds: spellIds('class-2014-druid') },
  },
  {
    id: 'class-2014-sorcerer', ruleset: '5e-2014', name: '术士', englishName: 'Sorcerer', summary: '2014版天生施法者：术法点、超魔法与已知法术。', hitDie: 6, primaryAbilities: ['cha'], playStyleTags: ['spellcaster', 'striker', 'control'], savingThrowAbilities: ['con', 'cha'], status: 'implemented', sourceIds: basicSource,
    checkpoints: [
      { id: 'sorcerer-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项术士技能', description: '从术士技能列表中选择。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-arcana', 'skill-deception', 'skill-insight', 'skill-intimidation', 'skill-persuasion', 'skill-religion'] },
      { id: 'sorcerer-2014-subclass-1', level: 1, step: 'timeline', kind: 'subclass', title: '选择术法起源', description: '起源在1级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: sorcererSubclassIds },
      { id: 'sorcerer-2014-metamagic-3', level: 3, step: 'timeline', kind: 'class-choice', title: '选择2项超魔法', description: '选择 2 项超魔法选项，施法时消耗术法点改变法术效果。', required: true, minSelections: 2, maxSelections: 2, optionIds: METAMAGIC_OPTION_IDS },
      { id: 'sorcerer-2014-metamagic-10', level: 10, step: 'timeline', kind: 'class-choice', title: '再选1项超魔法', description: '再选择 1 项超魔法选项（共 3 项），不可与已选重复。', required: true, minSelections: 1, maxSelections: 1, optionIds: METAMAGIC_OPTION_IDS },
      { id: 'sorcerer-2014-metamagic-17', level: 17, step: 'timeline', kind: 'class-choice', title: '再选1项超魔法', description: '再选择 1 项超魔法选项（共 4 项），不可与已选重复。', required: true, minSelections: 1, maxSelections: 1, optionIds: METAMAGIC_OPTION_IDS },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'sorcerer')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'known', ability: 'cha', startsAtLevel: 1, cantripsKnownByLevel: sorcererCantrips, spellsKnownByLevel: sorcererSpellsKnown, maxSpellLevelByClassLevel: fullCasterMaximumSpellLevels, slotsByClassLevel: FULL_CASTER_SPELL_SLOTS, classSpellIds: spellIds('class-2014-sorcerer') },
  },
]

export const fullCasterOptions2014: readonly RuleOption[] = [
  ...bardSubclassIds.map((id) => ({ id, name: ({ 'subclass-2014-bard-lore': '逸闻学院', 'subclass-2014-bard-valor': '勇气学院', 'subclass-2014-bard-glamour': '魅心学院', 'subclass-2014-bard-swords': '剑舞学院', 'subclass-2014-bard-whispers': '低语学院', 'subclass-2014-bard-creation': '创造学院', 'subclass-2014-bard-eloquence': '雄辩学院', 'subclass-2014-bard-spirits': '精魂学院' } as Record<string, string>)[id] ?? id, description: '2014吟游诗人学院索引。', status: 'index-only' as const, sourceIds: indexSource })),
  ...clericSubclassIds.map((id) => ({ id, name: ({ 'subclass-2014-cleric-knowledge': '知识领域', 'subclass-2014-cleric-life': '生命领域', 'subclass-2014-cleric-light': '光明领域', 'subclass-2014-cleric-nature': '自然领域', 'subclass-2014-cleric-tempest': '风暴领域', 'subclass-2014-cleric-trickery': '诡术领域', 'subclass-2014-cleric-war': '战争领域', 'subclass-2014-cleric-arcana': '奥秘领域', 'subclass-2014-cleric-forge': '锻造领域', 'subclass-2014-cleric-grave': '坟墓领域', 'subclass-2014-cleric-order': '秩序领域', 'subclass-2014-cleric-peace': '和平领域', 'subclass-2014-cleric-twilight': '暮光领域' } as Record<string, string>)[id] ?? id, description: '2014牧师领域索引。', status: 'index-only' as const, sourceIds: indexSource })),
  ...druidSubclassIds.map((id) => ({ id, name: ({ 'subclass-2014-druid-land': '大地结社', 'subclass-2014-druid-moon': '月亮结社', 'subclass-2014-druid-dreams': '梦境结社', 'subclass-2014-druid-shepherd': '牧人结社', 'subclass-2014-druid-spores': '孢子结社', 'subclass-2014-druid-stars': '星辰结社', 'subclass-2014-druid-wildfire': '野火结社' } as Record<string, string>)[id] ?? id, description: '2014德鲁伊结社索引。', status: 'index-only' as const, sourceIds: indexSource })),
  ...sorcererSubclassIds.map((id) => ({ id, name: ({ 'subclass-2014-sorcerer-draconic-bloodline': '龙族血脉', 'subclass-2014-sorcerer-wild-magic': '狂野魔法', 'subclass-2014-sorcerer-storm-sorcery': '风暴术法', 'subclass-2014-sorcerer-divine-soul': '神圣之魂', 'subclass-2014-sorcerer-shadow-magic': '幽影魔法', 'subclass-2014-sorcerer-aberrant-mind': '畸变心智', 'subclass-2014-sorcerer-clockwork-soul': '时械之魂', 'subclass-2014-sorcerer-lunar-sorcery': '月之术法' } as Record<string, string>)[id] ?? id, description: '2014术士起源索引。', status: 'index-only' as const, sourceIds: indexSource })),
]

export const fullCasterSubclasses2014: readonly SubclassRule[] = [
  ...bardSubclassIds.map((id) => ({ id, classId: 'class-2014-bard', ruleset: '5e-2014' as const, name: fullCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 3, summary: '2014吟游诗人学院索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
  ...clericSubclassIds.map((id) => ({ id, classId: 'class-2014-cleric', ruleset: '5e-2014' as const, name: fullCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 1, summary: '2014牧师领域索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
  ...druidSubclassIds.map((id) => ({ id, classId: 'class-2014-druid', ruleset: '5e-2014' as const, name: fullCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 2, summary: '2014德鲁伊结社索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
  ...sorcererSubclassIds.map((id) => ({ id, classId: 'class-2014-sorcerer', ruleset: '5e-2014' as const, name: fullCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 1, summary: '2014术士起源索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
]
