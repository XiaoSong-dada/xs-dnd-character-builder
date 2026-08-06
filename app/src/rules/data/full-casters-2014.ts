import type { ClassRule, RuleOption, SpellRule, SubclassRule } from '@/types/rules'
import { ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS } from '@/rules/data/feats-2014'
import { halfCasterSpells2014 } from '@/rules/data/half-casters-2014'
import { arcaneCasterSpells2014 } from '@/rules/data/arcane-casters-2014'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'

const basicSource = ['basic-rules-2014'] as const
const indexSource = ['phb-2014-index'] as const
const fullCasterMaximumSpellLevels = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 9] as const

const bardCantrips = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] as const
const bardSpellsKnown = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 22, 22, 22] as const
const sorcererCantrips = [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6] as const
const sorcererSpellsKnown = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15] as const

type FullCasterClass = 'bard' | 'cleric' | 'druid' | 'sorcerer'
type SpellSeed = readonly [englishName: string, name: string, level: number, classes: readonly FullCasterClass[]]

const spellSeeds: readonly SpellSeed[] = [
  // 戏法
  ['Vicious Mockery', '恶毒嘲笑', 0, ['bard']], ['Light', '光亮术', 0, ['bard', 'cleric']], ['Acid Splash', '强酸飞溅', 0, ['sorcerer']], ['Shocking Grasp', '电震之触', 0, ['sorcerer']],
  ['Guidance', '指引术', 0, ['cleric', 'druid']], ['Sacred Flame', '神圣之火', 0, ['cleric']], ['Spare the Dying', '稳定伤势', 0, ['cleric']],
  ['Druidcraft', '德鲁伊伎俩', 0, ['druid']], ['Produce Flame', '造火术', 0, ['druid']], ['Shillelagh', '木棍术', 0, ['druid']],
  // 1 环
  ['Healing Word', '治愈真言', 1, ['bard', 'cleric']], ['Faerie Fire', '妖精之火', 1, ['bard', 'druid']], ['Thunderwave', '雷鸣波', 1, ['bard', 'druid', 'sorcerer']],
  ['Disguise Self', '易容术', 1, ['bard']], ["Tasha's Hideous Laughter", '塔莎狂笑术', 1, ['bard']],
  ['Guiding Bolt', '引导箭', 1, ['cleric']], ['Inflict Wounds', '创伤术', 1, ['cleric']], ['Sanctuary', '庇护术', 1, ['cleric']],
  ['Entangle', '纠缠术', 1, ['druid']],
  ['Shield', '护盾术', 1, ['sorcerer']],
  // 2 环
  ['Shatter', '粉碎音波', 2, ['bard']], ['Heat Metal', '灼热金属', 2, ['bard', 'druid']],
  ['Spiritual Weapon', '灵体武器', 2, ['cleric']], ['Prayer of Healing', '治疗祷言', 2, ['cleric']],
  ['Moonbeam', '月光射线', 2, ['druid']], ['Flame Blade', '烈焰刀', 2, ['druid']],
  ['Scorching Ray', '灼热射线', 2, ['sorcerer']],
  // 3 环
  ['Hypnotic Pattern', '催眠图纹', 3, ['bard']], ["Leomund's Tiny Hut", '利昂蒙德小屋', 3, ['bard']],
  ['Spirit Guardians', '精魂守卫', 3, ['cleric']], ['Mass Healing Word', '群体治愈真言', 3, ['cleric']],
  ['Call Lightning', '召唤闪电', 3, ['druid']],
  // 4 环
  ["Otto's Irresistible Dance", '奥托不可抗拒之舞', 4, ['bard']],
  ['Guardian of Faith', '信仰守卫', 4, ['cleric']],
  ['Insect Plague', '虫灾术', 4, ['druid']],
  // 5 环
  ['Greater Restoration', '高等复原术', 5, ['bard', 'cleric', 'druid']],
  ['Commune', '通神术', 5, ['cleric']], ['Flame Strike', '烈焰打击', 5, ['cleric']], ['Hallow', '祝圣术', 5, ['cleric']],
  ['Reincarnate', '转生术', 5, ['druid']],
  ['Telekinesis', '心灵遥控', 5, ['sorcerer']], ['Wall of Stone', '石墙术', 5, ['sorcerer']],
  // 6 环
  ['Mass Cure Wounds', '群体疗伤术', 6, ['bard', 'cleric']],
  ['Heal', '治愈术', 6, ['cleric', 'druid']], ['Harm', '伤害术', 6, ['cleric']], ['Word of Recall', '召唤之语', 6, ['cleric']],
  ['Sunbeam', '阳光射线', 6, ['druid', 'sorcerer']], ['Transport via Plants', '植物传送', 6, ['druid']],
  ['Mass Suggestion', '群体暗示术', 6, ['sorcerer']],
  // 7 环
  ['Resurrection', '复活术', 7, ['bard', 'cleric']], ['Symbol', '符文术', 7, ['cleric']],
  ['Regenerate', '肢体再生', 7, ['cleric', 'druid']], ['Reverse Gravity', '反重力', 7, ['druid', 'sorcerer']],
  // 8 环
  ['Mind Blank', '心灵空白', 8, ['bard']], ['Antimagic Field', '反魔法力场', 8, ['cleric']], ['Holy Aura', '神圣光环', 8, ['cleric']],
  ['Earthquake', '地震术', 8, ['druid']], ['Animal Shapes', '群体变形', 8, ['druid']], ['Sunburst', '烈日爆发', 8, ['sorcerer']],
  // 9 环
  ['Power Word Kill', '律令死亡', 9, ['bard']], ['Gate', '传送门', 9, ['cleric']], ['True Resurrection', '真实复活', 9, ['cleric']], ['Mass Heal', '群体治愈术', 9, ['cleric']],
  ['Shapechange', '变形万物', 9, ['druid']], ['Storm of Vengeance', '复仇风暴', 9, ['druid']], ['Time Stop', '时间停止', 9, ['sorcerer']],
]

function spellId(englishName: string): string {
  return `spell-2014-${englishName.toLowerCase().replace(/’/g, '').replace(/[^a-z0-9]+/g, '-')}`
}

// 与既有 half/arcane 施法者共享的法术只登记一次；本文件对重复 id 去重，
// classIds 合并校准留待后续批次（选择与等级校验不依赖 classIds）。
const existingSpellIds = new Set([...halfCasterSpells2014, ...arcaneCasterSpells2014].map((spell) => spell.id))

export const fullCasterSpells2014: readonly SpellRule[] = spellSeeds
  .map(([englishName, name, level, classes]) => ({
    id: spellId(englishName),
    ruleset: '5e-2014' as const,
    name,
    englishName,
    level,
    classIds: classes.map((className) => `class-2014-${className}`),
    summary: `${level === 0 ? '戏法' : `${level}环法术`}；本批提供选择与等级校验，具体效果以规则来源为准。`,
    status: 'implemented' as const,
    sourceIds: basicSource,
  }))
  .filter((spell) => !existingSpellIds.has(spell.id))

const allSeedIds = (classId: string): readonly string[] =>
  spellSeeds.filter(([, , , classes]) => classes.includes(classId.replace('class-2014-', '') as FullCasterClass)).map(([englishName]) => spellId(englishName))

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

function asi(level: number, className: FullCasterClass) {
  return { id: `${className}-2014-asi-${level}`, level, step: 'timeline' as const, kind: 'ability-improvement' as const, title: '属性提升或专长', description: '属性提升与专长互斥。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS }
}

export const fullCasterClasses2014: readonly ClassRule[] = [
  {
    id: 'class-2014-bard', ruleset: '5e-2014', name: '吟游诗人', englishName: 'Bard', summary: '2014版多面手：技能、激励与已知法术。', hitDie: 8, primaryAbilities: ['cha'], savingThrowAbilities: ['dex', 'cha'], status: 'implemented', sourceIds: basicSource,
    checkpoints: [
      { id: 'bard-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择3项任意技能', description: '2014吟游诗人可从任意技能中选择3项。', required: true, minSelections: 3, maxSelections: 3, optionIds: allSkillIds },
      { id: 'bard-2014-tool-1', level: 1, step: 'timeline', kind: 'class-choice', title: '选择一种乐器熟练', description: '选择一种乐器熟练。', required: true, minSelections: 1, maxSelections: 1, optionIds: ['tool-musical-instrument'] },
      { id: 'bard-2014-expertise-3', level: 3, step: 'timeline', kind: 'expertise', title: '选择2项专精', description: '选择已熟练的技能或乐器。', required: true, minSelections: 2, maxSelections: 2, optionIds: allSkillIds },
      { id: 'bard-2014-subclass-3', level: 3, step: 'timeline', kind: 'subclass', title: '选择吟游学院', description: '学院在3级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: bardSubclassIds },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'bard')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'known', ability: 'cha', startsAtLevel: 1, cantripsKnownByLevel: bardCantrips, spellsKnownByLevel: bardSpellsKnown, maxSpellLevelByClassLevel: fullCasterMaximumSpellLevels, classSpellIds: allSeedIds('class-2014-bard') },
  },
  {
    id: 'class-2014-cleric', ruleset: '5e-2014', name: '牧师', englishName: 'Cleric', summary: '2014版神术施法者：领域、引导神力与准备法术。', hitDie: 8, primaryAbilities: ['wis'], savingThrowAbilities: ['wis', 'cha'], status: 'implemented', sourceIds: basicSource,
    checkpoints: [
      { id: 'cleric-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项牧师技能', description: '从牧师技能列表中选择。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-history', 'skill-insight', 'skill-medicine', 'skill-persuasion', 'skill-religion'] },
      { id: 'cleric-2014-subclass-1', level: 1, step: 'timeline', kind: 'subclass', title: '选择神圣领域', description: '领域在1级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: clericSubclassIds },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'cleric')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'prepared', ability: 'wis', startsAtLevel: 1, preparedFormula: 'ability-plus-level', maxSpellLevelByClassLevel: fullCasterMaximumSpellLevels, classSpellIds: allSeedIds('class-2014-cleric') },
  },
  {
    id: 'class-2014-druid', ruleset: '5e-2014', name: '德鲁伊', englishName: 'Druid', summary: '2014版自然施法者：荒野变形与准备法术。', hitDie: 8, primaryAbilities: ['wis'], savingThrowAbilities: ['int', 'wis'], status: 'implemented', sourceIds: basicSource,
    checkpoints: [
      { id: 'druid-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项德鲁伊技能', description: '从德鲁伊技能列表中选择。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-arcana', 'skill-animal-handling', 'skill-insight', 'skill-medicine', 'skill-nature', 'skill-perception', 'skill-religion', 'skill-survival'] },
      { id: 'druid-2014-subclass-2', level: 2, step: 'timeline', kind: 'subclass', title: '选择德鲁伊结社', description: '结社在2级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: druidSubclassIds },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'druid')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'prepared', ability: 'wis', startsAtLevel: 1, preparedFormula: 'ability-plus-level', maxSpellLevelByClassLevel: fullCasterMaximumSpellLevels, classSpellIds: allSeedIds('class-2014-druid') },
  },
  {
    id: 'class-2014-sorcerer', ruleset: '5e-2014', name: '术士', englishName: 'Sorcerer', summary: '2014版天生施法者：术法点、超魔法与已知法术。', hitDie: 6, primaryAbilities: ['cha'], savingThrowAbilities: ['con', 'cha'], status: 'implemented', sourceIds: basicSource,
    checkpoints: [
      { id: 'sorcerer-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项术士技能', description: '从术士技能列表中选择。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-arcana', 'skill-deception', 'skill-insight', 'skill-intimidation', 'skill-persuasion', 'skill-religion'] },
      { id: 'sorcerer-2014-subclass-1', level: 1, step: 'timeline', kind: 'subclass', title: '选择术法起源', description: '起源在1级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: sorcererSubclassIds },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'sorcerer')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'known', ability: 'cha', startsAtLevel: 1, cantripsKnownByLevel: sorcererCantrips, spellsKnownByLevel: sorcererSpellsKnown, maxSpellLevelByClassLevel: fullCasterMaximumSpellLevels, classSpellIds: allSeedIds('class-2014-sorcerer') },
  },
]

export const fullCasterOptions2014: readonly RuleOption[] = [
  ...bardSubclassIds.map((id) => ({ id, name: ({ 'subclass-2014-bard-lore': '博闻学院', 'subclass-2014-bard-valor': '勇气学院', 'subclass-2014-bard-glamour': '魅惑学院', 'subclass-2014-bard-swords': '剑舞学院', 'subclass-2014-bard-whispers': '低语学院', 'subclass-2014-bard-creation': '创造学院', 'subclass-2014-bard-eloquence': '雄辩学院', 'subclass-2014-bard-spirits': '精魂学院' } as Record<string, string>)[id] ?? id, description: '2014吟游诗人学院索引。', status: 'index-only' as const, sourceIds: indexSource })),
  ...clericSubclassIds.map((id) => ({ id, name: ({ 'subclass-2014-cleric-knowledge': '知识领域', 'subclass-2014-cleric-life': '生命领域', 'subclass-2014-cleric-light': '光明领域', 'subclass-2014-cleric-nature': '自然领域', 'subclass-2014-cleric-tempest': '风暴领域', 'subclass-2014-cleric-trickery': '诡术领域', 'subclass-2014-cleric-war': '战争领域', 'subclass-2014-cleric-arcana': '奥秘领域', 'subclass-2014-cleric-forge': '锻造领域', 'subclass-2014-cleric-grave': '坟墓领域', 'subclass-2014-cleric-order': '秩序领域', 'subclass-2014-cleric-peace': '和平领域', 'subclass-2014-cleric-twilight': '暮光领域' } as Record<string, string>)[id] ?? id, description: '2014牧师领域索引。', status: 'index-only' as const, sourceIds: indexSource })),
  ...druidSubclassIds.map((id) => ({ id, name: ({ 'subclass-2014-druid-land': '大地结社', 'subclass-2014-druid-moon': '月亮结社', 'subclass-2014-druid-dreams': '梦境结社', 'subclass-2014-druid-shepherd': '牧者结社', 'subclass-2014-druid-spores': '孢子结社', 'subclass-2014-druid-stars': '星辰结社', 'subclass-2014-druid-wildfire': '野火结社' } as Record<string, string>)[id] ?? id, description: '2014德鲁伊结社索引。', status: 'index-only' as const, sourceIds: indexSource })),
  ...sorcererSubclassIds.map((id) => ({ id, name: ({ 'subclass-2014-sorcerer-draconic-bloodline': '龙族血脉', 'subclass-2014-sorcerer-wild-magic': '狂野魔法', 'subclass-2014-sorcerer-storm-sorcery': '风暴术法', 'subclass-2014-sorcerer-divine-soul': '神圣灵魂', 'subclass-2014-sorcerer-shadow-magic': '暗影魔法', 'subclass-2014-sorcerer-aberrant-mind': '异怪心智', 'subclass-2014-sorcerer-clockwork-soul': '机关魂', 'subclass-2014-sorcerer-lunar-sorcery': '月相术法' } as Record<string, string>)[id] ?? id, description: '2014术士起源索引。', status: 'index-only' as const, sourceIds: indexSource })),
]

export const fullCasterSubclasses2014: readonly SubclassRule[] = [
  ...bardSubclassIds.map((id) => ({ id, classId: 'class-2014-bard', ruleset: '5e-2014' as const, name: fullCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 3, summary: '2014吟游诗人学院索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
  ...clericSubclassIds.map((id) => ({ id, classId: 'class-2014-cleric', ruleset: '5e-2014' as const, name: fullCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 1, summary: '2014牧师领域索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
  ...druidSubclassIds.map((id) => ({ id, classId: 'class-2014-druid', ruleset: '5e-2014' as const, name: fullCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 2, summary: '2014德鲁伊结社索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
  ...sorcererSubclassIds.map((id) => ({ id, classId: 'class-2014-sorcerer', ruleset: '5e-2014' as const, name: fullCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 1, summary: '2014术士起源索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
]
