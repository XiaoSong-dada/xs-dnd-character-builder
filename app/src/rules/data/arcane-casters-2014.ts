import type { ClassRule, RuleOption, SpellRule, SubclassRule } from '@/types/rules'
import { ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS } from '@/rules/data/feats-2014'

const basicSource = ['basic-rules-2014'] as const
const indexSource = ['phb-2014-index'] as const
const fullCasterMaximumSpellLevels = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 9] as const
const pactMaximumSpellLevels = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] as const
const wizardCantrips = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] as const
const wizardSpellbookCounts = Array.from({ length: 20 }, (_, index) => 6 + index * 2)
const warlockCantrips = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] as const
const warlockSpellsKnown = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15] as const

type ArcaneClass = 'wizard' | 'warlock'
type SpellSeed = readonly [englishName: string, name: string, level: number, classes: readonly ArcaneClass[]]

const wizardSeeds: readonly SpellSeed[] = [
  ['Fire Bolt', '火焰箭', 0, ['wizard']], ['Mage Hand', '法师之手', 0, ['wizard']], ['Minor Illusion', '次级幻影', 0, ['wizard']], ['Prestidigitation', '魔法伎俩', 0, ['wizard']], ['Ray of Frost', '冷冻射线', 0, ['wizard']],
  ['Burning Hands', '燃烧之手', 1, ['wizard']], ['Charm Person', '魅惑人类', 1, ['wizard', 'warlock']], ['Color Spray', '七彩喷射', 1, ['wizard']], ['Comprehend Languages', '通晓语言', 1, ['wizard']], ['Feather Fall', '羽落术', 1, ['wizard']], ['Find Familiar', '寻获魔宠', 1, ['wizard']], ['Identify', '鉴定术', 1, ['wizard']], ['Mage Armor', '法师护甲', 1, ['wizard']], ['Magic Missile', '魔法飞弹', 1, ['wizard']], ['Sleep', '睡眠术', 1, ['wizard']],
  ['Arcane Lock', '秘法锁', 2, ['wizard']], ['Blindness/Deafness', '目盲/耳聋术', 2, ['wizard']], ['Blur', '朦胧术', 2, ['wizard']], ['Darkness', '黑暗术', 2, ['wizard', 'warlock']], ['Flaming Sphere', '炽焰法球', 2, ['wizard']], ['Hold Person', '人类定身术', 2, ['wizard', 'warlock']], ['Invisibility', '隐形术', 2, ['wizard', 'warlock']], ['Misty Step', '迷踪步', 2, ['wizard', 'warlock']],
  ['Counterspell', '法术反制', 3, ['wizard', 'warlock']], ['Fireball', '火球术', 3, ['wizard']], ['Fly', '飞行术', 3, ['wizard', 'warlock']], ['Haste', '加速术', 3, ['wizard']], ['Lightning Bolt', '闪电束', 3, ['wizard']], ['Major Image', '高等幻影', 3, ['wizard']], ['Slow', '缓慢术', 3, ['wizard']],
  ['Arcane Eye', '秘法眼', 4, ['wizard']], ['Dimension Door', '任意门', 4, ['wizard', 'warlock']], ['Greater Invisibility', '高等隐形术', 4, ['wizard']], ['Ice Storm', '冰风暴', 4, ['wizard']], ['Polymorph', '变形术', 4, ['wizard']], ['Wall of Fire', '火墙术', 4, ['wizard']],
  ['Animate Objects', '活化物件', 5, ['wizard']], ['Cone of Cold', '寒冰锥', 5, ['wizard']], ['Hold Monster', '怪物定身术', 5, ['wizard', 'warlock']], ['Scrying', '探知术', 5, ['wizard']], ['Teleportation Circle', '传送法阵', 5, ['wizard']],
  ['Chain Lightning', '连锁闪电', 6, ['wizard']], ['Disintegrate', '解离术', 6, ['wizard']], ['Globe of Invulnerability', '法术无效结界', 6, ['wizard']], ['True Seeing', '真实视觉', 6, ['wizard']],
  ['Finger of Death', '死亡一指', 7, ['wizard']], ['Plane Shift', '异界传送', 7, ['wizard']], ['Teleport', '传送术', 7, ['wizard']],
  ['Dominate Monster', '支配怪物', 8, ['wizard']], ['Maze', '迷宫术', 8, ['wizard']], ['Power Word Stun', '律令震慑', 8, ['wizard']],
  ['Foresight', '预警术', 9, ['wizard']], ['Meteor Swarm', '流星爆', 9, ['wizard']], ['Wish', '祈愿术', 9, ['wizard']],
]

const warlockOnlySeeds: readonly SpellSeed[] = [
  ['Eldritch Blast', '魔能爆', 0, ['warlock']], ['Chill Touch', '冻寒之触', 0, ['warlock']], ['Friends', '交友术', 0, ['warlock']],
  ['Armor of Agathys', '阿伽迪斯之铠', 1, ['warlock']], ['Arms of Hadar', '哈达之臂', 1, ['warlock']], ['Hellish Rebuke', '炼狱叱喝', 1, ['warlock']], ['Hex', '妖火诅咒', 1, ['warlock']], ['Witch Bolt', '巫术箭', 1, ['warlock']],
  ['Cloud of Daggers', '匕首之云', 2, ['warlock']], ['Mirror Image', '镜影术', 2, ['warlock']], ['Suggestion', '暗示术', 2, ['warlock']],
  ['Fear', '恐惧术', 3, ['warlock']], ['Hunger of Hadar', '哈达之欲', 3, ['warlock']], ['Vampiric Touch', '吸血鬼之触', 3, ['warlock']],
  ['Banishment', '放逐术', 4, ['warlock']], ['Blight', '枯萎术', 4, ['warlock']],
  ['Dream', '托梦术', 5, ['warlock']], ['Contact Other Plane', '异界探知', 5, ['warlock']],
]

function spellId(englishName: string): string {
  return `spell-2014-${englishName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export const arcaneCasterSpells2014: readonly SpellRule[] = [...wizardSeeds, ...warlockOnlySeeds].map(([englishName, name, level, classes]) => ({
  id: spellId(englishName),
  ruleset: '5e-2014',
  name,
  englishName,
  level,
  classIds: classes.map((className) => `class-2014-${className}`),
  summary: `${level === 0 ? '戏法' : `${level}环法术`}；本批只保存选择所需元数据。`,
  status: 'implemented',
  sourceIds: basicSource,
}))

const spellIds = (classId: string) => arcaneCasterSpells2014.filter((spell) => spell.classIds.includes(classId)).map((spell) => spell.id)
const wizardSubclassIds = ['subclass-2014-wizard-abjuration', 'subclass-2014-wizard-conjuration', 'subclass-2014-wizard-divination', 'subclass-2014-wizard-enchantment', 'subclass-2014-wizard-evocation', 'subclass-2014-wizard-illusion', 'subclass-2014-wizard-necromancy', 'subclass-2014-wizard-transmutation'] as const
const warlockSubclassIds = ['subclass-2014-warlock-archfey', 'subclass-2014-warlock-fiend', 'subclass-2014-warlock-great-old-one'] as const

export const arcaneCasterOptions2014: readonly RuleOption[] = [
  ...wizardSubclassIds.map((id) => ({ id, name: ({ abjuration: '防护学派', conjuration: '咒法学派', divination: '预言学派', enchantment: '附魔学派', evocation: '塑能学派', illusion: '幻术学派', necromancy: '死灵学派', transmutation: '变化学派' } as Record<string, string>)[id.split('-').slice(-1)[0] ?? ''] ?? id, description: '2014法师奥术传统索引。', status: 'index-only' as const, sourceIds: indexSource })),
  ...warlockSubclassIds.map((id) => ({ id, name: ({ archfey: '至高妖精宗主', fiend: '邪魔宗主', 'great-old-one': '旧日支配者宗主' } as Record<string, string>)[id.replace('subclass-2014-warlock-', '')] ?? id, description: '2014邪术师异界宗主索引。', status: 'index-only' as const, sourceIds: indexSource })),
  { id: 'pact-chain', name: '锁链契约', description: '获得强化魔宠路线。', status: 'index-only', sourceIds: indexSource },
  { id: 'pact-blade', name: '刀锋契约', description: '获得契约武器路线。', status: 'index-only', sourceIds: indexSource },
  { id: 'pact-tome', name: '魔典契约', description: '获得额外戏法路线。', status: 'index-only', sourceIds: indexSource },
  { id: 'invocation-agonizing-blast', name: '痛苦魔爆', description: '魔能祈唤索引。', status: 'index-only', sourceIds: indexSource },
  { id: 'invocation-devils-sight', name: '魔鬼视界', description: '魔能祈唤索引。', status: 'index-only', sourceIds: indexSource },
  { id: 'invocation-mask-of-many-faces', name: '千面之颜', description: '魔能祈唤索引。', status: 'index-only', sourceIds: indexSource },
]

const asi = (level: number, className: 'wizard' | 'warlock') => ({ id: `${className}-2014-asi-${level}`, level, step: 'timeline' as const, kind: 'ability-improvement' as const, title: '属性提升或专长', description: '属性提升与专长互斥。', required: true, minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS })

export const arcaneCasterClasses2014: readonly ClassRule[] = [
  {
    id: 'class-2014-wizard', ruleset: '5e-2014', name: '法师', englishName: 'Wizard', summary: '2014版法术书施法者，分别管理法术书与准备列表。', hitDie: 6, primaryAbilities: ['int'], savingThrowAbilities: ['int', 'wis'], status: 'implemented', sourceIds: basicSource,
    checkpoints: [
      { id: 'wizard-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项法师技能', description: '选择职业技能。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-arcana', 'skill-history', 'skill-insight', 'skill-investigation', 'skill-medicine', 'skill-religion'] },
      { id: 'wizard-2014-subclass-2', level: 2, step: 'timeline', kind: 'subclass', title: '选择奥术传统', description: '奥术传统在2级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: wizardSubclassIds },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'wizard')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'spellbook', ability: 'int', startsAtLevel: 1, preparedFormula: 'ability-plus-level', cantripsKnownByLevel: wizardCantrips, spellbookSpellsByLevel: wizardSpellbookCounts, maxSpellLevelByClassLevel: fullCasterMaximumSpellLevels, classSpellIds: spellIds('class-2014-wizard') },
  },
  {
    id: 'class-2014-warlock', ruleset: '5e-2014', name: '邪术师', englishName: 'Warlock', summary: '2014版契约施法者，以短休恢复的契约法术位施法。', hitDie: 8, primaryAbilities: ['cha'], savingThrowAbilities: ['wis', 'cha'], status: 'implemented', sourceIds: basicSource,
    checkpoints: [
      { id: 'warlock-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项邪术师技能', description: '选择职业技能。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-arcana', 'skill-deception', 'skill-history', 'skill-intimidation', 'skill-investigation', 'skill-nature', 'skill-religion'] },
      { id: 'warlock-2014-subclass-1', level: 1, step: 'timeline', kind: 'subclass', title: '选择异界宗主', description: '宗主在1级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: warlockSubclassIds },
      { id: 'warlock-2014-invocations-2', level: 2, step: 'timeline', kind: 'class-choice', title: '选择2项魔能祈唤', description: '当前提供核心祈唤索引。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['invocation-agonizing-blast', 'invocation-devils-sight', 'invocation-mask-of-many-faces'] },
      { id: 'warlock-2014-pact-3', level: 3, step: 'timeline', kind: 'class-choice', title: '选择契约恩赐', description: '锁链、刀锋或魔典契约。', required: true, minSelections: 1, maxSelections: 1, optionIds: ['pact-chain', 'pact-blade', 'pact-tome'] },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'warlock')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'pact', ability: 'cha', startsAtLevel: 1, cantripsKnownByLevel: warlockCantrips, spellsKnownByLevel: warlockSpellsKnown, maxSpellLevelByClassLevel: pactMaximumSpellLevels, classSpellIds: spellIds('class-2014-warlock') },
  },
]

export const arcaneCasterSubclasses2014: readonly SubclassRule[] = [
  ...wizardSubclassIds.map((id) => ({ id, classId: 'class-2014-wizard', ruleset: '5e-2014' as const, name: arcaneCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 2, summary: '2014法师奥术传统索引。', status: 'index-only' as const, sourceIds: indexSource })),
  ...warlockSubclassIds.map((id) => ({ id, classId: 'class-2014-warlock', ruleset: '5e-2014' as const, name: arcaneCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 1, summary: '2014邪术师宗主索引。', status: 'index-only' as const, sourceIds: indexSource })),
]
