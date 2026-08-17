import type { ClassRule, RuleOption, SubclassRule } from '@/types/rules'
import { ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS } from '@/rules/data/feats-2014'
import { FULL_CASTER_SPELL_SLOTS, PACT_SPELL_SLOTS, fullCasterMaximumSpellLevels, pactMaximumSpellLevels } from '@/rules/data/spell-slots-2014'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import { spells2014 } from '@/rules/data/spells-2014'

const basicSource = ['basic-rules-2014'] as const
const indexSource = ['phb-2014-index'] as const
const wizardCantrips = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] as const
const wizardSpellbookCounts = Array.from({ length: 20 }, (_, index) => 6 + index * 2)
const warlockCantrips = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] as const
const warlockSpellsKnown = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15] as const

const spellIds = (classId: string): readonly string[] =>
  spells2014.filter((spell) => spell.classIds.includes(classId)).map((spell) => spell.id)
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
    id: 'class-2014-wizard', ruleset: '5e-2014', name: '法师', englishName: 'Wizard', summary: '2014版法术书施法者，分别管理法术书与准备列表。', hitDie: 6, primaryAbilities: ['int'], playStyleTags: ['spellcaster', 'control', 'utility', 'striker'], savingThrowAbilities: ['int', 'wis'], status: 'implemented', sourceIds: basicSource,
    checkpoints: [
      { id: 'wizard-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项法师技能', description: '选择职业技能。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-arcana', 'skill-history', 'skill-insight', 'skill-investigation', 'skill-medicine', 'skill-religion'] },
      { id: 'wizard-2014-subclass-2', level: 2, step: 'timeline', kind: 'subclass', title: '选择奥术传统', description: '奥术传统在2级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: wizardSubclassIds },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'wizard')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'spellbook', ability: 'int', startsAtLevel: 1, preparedFormula: 'ability-plus-level', cantripsKnownByLevel: wizardCantrips, spellbookSpellsByLevel: wizardSpellbookCounts, maxSpellLevelByClassLevel: fullCasterMaximumSpellLevels, slotsByClassLevel: FULL_CASTER_SPELL_SLOTS, classSpellIds: spellIds('class-2014-wizard') },
  },
  {
    id: 'class-2014-warlock', ruleset: '5e-2014', name: '邪术师', englishName: 'Warlock', summary: '2014版契约施法者，以短休恢复的契约法术位施法。', hitDie: 8, primaryAbilities: ['cha'], playStyleTags: ['spellcaster', 'striker', 'control', 'utility'], savingThrowAbilities: ['wis', 'cha'], status: 'implemented', sourceIds: basicSource,
    checkpoints: [
      { id: 'warlock-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择2项邪术师技能', description: '选择职业技能。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-arcana', 'skill-deception', 'skill-history', 'skill-intimidation', 'skill-investigation', 'skill-nature', 'skill-religion'] },
      { id: 'warlock-2014-subclass-1', level: 1, step: 'timeline', kind: 'subclass', title: '选择异界宗主', description: '宗主在1级确定。', required: true, minSelections: 1, maxSelections: 1, optionIds: warlockSubclassIds },
      { id: 'warlock-2014-invocations-2', level: 2, step: 'timeline', kind: 'class-choice', title: '选择2项魔能祈唤', description: '当前提供核心祈唤索引。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['invocation-agonizing-blast', 'invocation-devils-sight', 'invocation-mask-of-many-faces'] },
      { id: 'warlock-2014-pact-3', level: 3, step: 'timeline', kind: 'class-choice', title: '选择契约恩赐', description: '锁链、刀锋或魔典契约。', required: true, minSelections: 1, maxSelections: 1, optionIds: ['pact-chain', 'pact-blade', 'pact-tome'] },
      ...[4, 8, 12, 16, 19].map((level) => asi(level, 'warlock')),
    ],
    spellcasting: { ruleset: '5e-2014', mode: 'pact', ability: 'cha', startsAtLevel: 1, cantripsKnownByLevel: warlockCantrips, spellsKnownByLevel: warlockSpellsKnown, maxSpellLevelByClassLevel: pactMaximumSpellLevels, pactSlotsByClassLevel: PACT_SPELL_SLOTS, classSpellIds: spellIds('class-2014-warlock') },
  },
]

export const arcaneCasterSubclasses2014: readonly SubclassRule[] = [
  ...wizardSubclassIds.map((id) => ({ id, classId: 'class-2014-wizard', ruleset: '5e-2014' as const, name: arcaneCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 2, summary: '2014法师奥术传统索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
  ...warlockSubclassIds.map((id) => ({ id, classId: 'class-2014-warlock', ruleset: '5e-2014' as const, name: arcaneCasterOptions2014.find((option) => option.id === id)?.name ?? id, englishName: id.split('-').slice(-1)[0] ?? id, selectionLevel: 1, summary: '2014邪术师宗主索引。', status: 'index-only' as const, sourceIds: indexSource, features: getSubclassFeatures2014(id) })),
]
