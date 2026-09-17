import type { ChoiceCheckpoint, ClassFeature, ClassRule, RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'
import { spells2024 } from '@/rules/data/spells-2024'
import { METAMAGIC_2024_OPTION_IDS, metamagicOptions2024 } from '@/rules/data/metamagic-2024'

/**
 * 2024 术士与 4 个术法（B08-09）。
 *
 * 规则依据：B01《职业-全量》CV-024、CV-023／025—027 与项目内《5e 不全书》2024 术士章节；
 * `docs/classes/subclasses/sorcerer/*.md` 提供结构与边界说明。
 * 特性名称采用 5e 不全书译名，摘要与详情为原创中文转述。
 * 2024 超魔选项独立于 2014 数据（`metamagic-2024.ts`），按 `ruleset` 解析。
 */
const sourceIds = ['source-2024-phb'] as const

/** 术士技能候选：奥秘、欺瞒、洞悉、威吓、游说、宗教。 */
const SORCERER_SKILL_OPTION_IDS = [
  'skill-arcana',
  'skill-deception',
  'skill-insight',
  'skill-intimidation',
  'skill-persuasion',
  'skill-religion',
] as const

// 2024 术士施法表（B01 CV-024 核对）：不复用 2014 常量，按版本独立登记。
const SORCERER_PREPARED_COUNTS = [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22] as const
const SORCERER_CANTRIPS = [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6] as const
const SORCERER_MAX_SPELL_LEVELS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 9] as const
const SORCERER_SPELL_SLOTS = [
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

/** 术法点：2 级起等于术士等级。 */
const SORCERY_POINTS = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const

/** 先天术法：2 次，长休全部恢复；7 级起可消耗 2 点术法点续用。 */
const INNATE_SORCERY_USES = Array.from({ length: 20 }, () => 2)

/** 混乱之潮：每次长休 1 次；用法术位施展术士法术后自动恢复（并触发狂野浪涌）。 */
const TIDE_OF_CHAOS_USES = [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] as const

/** 归复平衡：次数＝魅力调整值（至少 1 次），长休全部恢复。 */
const RESTORE_BALANCE_MIN_USES = { ability: 'cha', minimum: 1 } as const

/** N 级起每次长休 1 次（用于限次特性资源登记）。 */
const onceFromLevel = (level: number): readonly number[] =>
  Array.from({ length: 20 }, (_, index) => (index + 1 >= level ? 1 : 0))

const sorcererClassSpellIds2024 = spells2024
  .filter((spell) => spell.classIds.includes('class-2024-sorcerer'))
  .map((spell) => spell.id)

/** 子职始终准备法术（2024 术法）。 */
const CLOCKWORK_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-protection-from-evil-and-good', 'spell-2024-alarm', 'spell-2024-lesser-restoration', 'spell-2024-aid'],
  5: ['spell-2024-dispel-magic', 'spell-2024-protection-from-energy'],
  7: ['spell-2024-freedom-of-movement', 'spell-2024-summon-construct'],
  9: ['spell-2024-greater-restoration', 'spell-2024-wall-of-force'],
}
const ABERRANT_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-mind-sliver', 'spell-2024-arms-of-hadar', 'spell-2024-dissonant-whispers', 'spell-2024-calm-emotions', 'spell-2024-detect-thoughts'],
  5: ['spell-2024-hunger-of-hadar', 'spell-2024-sending'],
  7: ['spell-2024-evard-s-black-tentacles', 'spell-2024-summon-aberration'],
  9: ['spell-2024-rary-s-telepathic-bond', 'spell-2024-telekinesis'],
}
const DRACONIC_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-chromatic-orb', 'spell-2024-command', 'spell-2024-dragon-s-breath', 'spell-2024-alter-self'],
  5: ['spell-2024-fear', 'spell-2024-fly'],
  7: ['spell-2024-arcane-eye', 'spell-2024-charm-monster'],
  9: ['spell-2024-legend-lore', 'spell-2024-summon-dragon'],
}

/** 术士职业专属选项：2024 超魔选项并入仓库选项表。 */
export const sorcererOptions2024: readonly RuleOption[] = [...metamagicOptions2024]

export const sorcererFeatures2024: readonly ClassFeature[] = [
  {
    id: 'sorcerer-2024-class-spellcasting', classId: 'class-2024-sorcerer', name: '施法', englishName: 'Spellcasting', level: 1,
    summary: '魅力施法：1 级 4 戏法、2 道准备法术；每获得术士等级可替换一道准备法术；奥术法器作为法器。',
    description: '施法属性为魅力，可使用奥术法器作为施法法器。1 级时知晓 4 道术士戏法，并准备 2 道一环术士法术；4 级与 10 级各额外习得一道戏法。准备法术数量按职业表随等级提升，所选法术环级不得超过当前拥有的法术位环级。每当你获得一个术士等级时，可以将准备列表上的一道法术替换为另一道术士法术。其他特性授予的始终准备法术不计入准备数量，但对你而言都视为术士法术。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-class-innate-sorcery', classId: 'class-2024-sorcerer', name: '先天术法', englishName: 'Innate Sorcery', level: 1,
    summary: '附赠动作释放魔力 1 分钟：术士法术豁免 DC +1、术士法术攻击检定具有优势；2 次，长休恢复。',
    description: '以一个附赠动作，你可以将魔力释放而出，持续 1 分钟。期间你的术士法术豁免 DC +1，且你施展的术士法术的攻击检定具有优势。你可以使用此特性两次，完成长休时重获全部次数；7 级术法化身起，次数耗尽时还可消耗 2 点术法点以附赠动作继续激活。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: INNATE_SORCERY_USES, recovery: 'long-rest', note: '7 级起可消耗 2 点术法点续用；术法化身期间可应用两种超魔' },
  },
  {
    id: 'sorcerer-2024-class-font-of-magic', classId: 'class-2024-sorcerer', name: '魔力泉涌', englishName: 'Font of Magic', level: 2,
    summary: '术法点 2 级起等于术士等级，长休全部恢复；可消耗法术位换等量点，或消耗点创造法术位（≤5 环）。',
    description: '你获得术法点，数量等于你的术士等级（2 级起），上限同表中数值；完成长休后重获所有已消耗的术法点。你可以消耗一个法术位获得等同于其环位的术法点（无需动作）；也可以以一个附赠动作消耗术法点创造一个法术位：一环 2 点、二环 3 点、三环 5 点、四环 6 点（7 级起）、五环 7 点（9 级起），不能创造高于五环的法术位。以此创造的任何法术位在完成长休时消失。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: SORCERY_POINTS, recovery: 'long-rest', note: '可消耗法术位换等量点；消耗点创造法术位（2／3／5／6／7 点→一至五环，四环需 7 级、五环需 9 级）' },
  },
  {
    id: 'sorcerer-2024-class-metamagic', classId: 'class-2024-sorcerer', name: '超魔法', englishName: 'Metamagic', level: 2,
    summary: '选择 2 项超魔；10 级与 17 级各再选 2 项（共 6 项，不可重复）；每次施法默认只能应用一种。',
    description: '你从超魔法选项中选择并获得 2 项；使用超魔需消耗其标注的术法点。施展一道法术时默认只能应用一种超魔选项，除非该选项另有说明（术法化身期间最多两种）。每获得一级术士等级可以更换一项超魔；10 级与 17 级各再获得 2 项超魔选项。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-sorcerer-metamagic-2', 'class-2024-sorcerer-metamagic-10', 'class-2024-sorcerer-metamagic-17'], status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-class-subclass', classId: 'class-2024-sorcerer', name: '术士子职', englishName: 'Sorcerer Subclass', level: 3,
    summary: '选择畸变、时械、龙族或狂野术法，并在 3、6、14、18 级获得其特性。',
    description: '你在 3 级选择一项术士子职：畸变术法、时械术法、龙族术法或狂野术法。此后获得该术法的全部能力，前提是所需等级不超过你的术士等级。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-sorcerer-subclass-3'], status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-class-sorcerous-restoration', classId: 'class-2024-sorcerer', name: '术法复苏', englishName: 'Sorcerous Restoration', level: 5,
    summary: '短休恢复不超过术士等级一半（向下取整）的术法点；每次长休 1 次。',
    description: '当你完成一次短休时，你可以恢复不大于你术士等级一半（向下取整）的已消耗术法点。此特性一经使用，直到完成一次长休为止不能再次使用。',
    kind: 'passive', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(5), recovery: 'long-rest', note: '短休时手动恢复不超过术士等级一半（向下取整）的术法点；每次长休 1 次' },
  },
  {
    id: 'sorcerer-2024-class-sorcery-incarnate', classId: 'class-2024-sorcerer', name: '术法化身', englishName: 'Sorcery Incarnate', level: 7,
    summary: '先天术法次数耗尽时可消耗 2 点术法点继续激活；先天术法激活期间每次施法可应用最多两种超魔。',
    description: '如果你的先天术法特性使用次数耗尽，你仍可以消耗 2 点术法点，以一个附赠动作继续激活该特性。此外，在你的先天术法特性处于激活状态期间，你可以在你施展的每道法术上应用最多两次超魔选项。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-class-epic-boon', classId: 'class-2024-sorcerer', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长，或其他满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一项你选择的、满足条件且适用的专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-sorcerer-feat-19'], status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-class-arcane-apotheosis', classId: 'class-2024-sorcerer', name: '奥术登神', englishName: 'Arcane Apotheosis', level: 20,
    summary: '先天术法激活期间，每回合可免费使用一次消耗不超过 2 点术法点的超魔。',
    description: '在你的先天术法特性处于激活状态期间，你每个自己的回合可以免费使用一次超魔选项（所选超魔的术法点消耗不超过 2 点），无需消耗术法点。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const sorcererRule2024: ClassRule = {
  id: 'class-2024-sorcerer',
  ruleset: '5e-2024',
  name: '术士',
  englishName: 'Sorcerer',
  summary: '2024版天生施法者：术法点与超魔改造法术，先天术法强化输出，术法决定力量来源。',
  introduction: '天生法术的操纵者：术法点与超魔让法术表现可被改造，先天术法提供强化施法的手段，术法来源决定额外能力。',
  hitDie: 6,
  primaryAbilities: ['cha'],
  playStyleTags: ['spellcaster', 'striker', 'utility'],
  savingThrowAbilities: ['con', 'cha'],
  status: 'implemented',
  sourceIds,
  armorTraining: [],
  weaponTraining: { categories: ['simple'] },
  features: sorcererFeatures2024,
  checkpoints: [
    {
      id: 'class-2024-sorcerer-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择2项术士技能', description: '从术士技能列表中选择2项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: SORCERER_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-sorcerer-metamagic-2', level: 2, step: 'timeline', kind: 'class-choice',
      title: '选择2项超魔法', description: '从 2024 超魔选项中选择2项，不可重复；10级与17级各再选2项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: METAMAGIC_2024_OPTION_IDS, uniqueGroup: 'sorcerer-metamagic-2024',
    },
    ...([4, 8, 12, 16] as const).map((level): ChoiceCheckpoint => ({
      id: `class-2024-sorcerer-feat-${level}`, level, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    {
      id: 'class-2024-sorcerer-metamagic-10', level: 10, step: 'timeline', kind: 'class-choice',
      title: '再选择2项超魔法', description: '再选择2项超魔选项（共4项），不可与已有选项重复。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: METAMAGIC_2024_OPTION_IDS, uniqueGroup: 'sorcerer-metamagic-2024',
    },
    {
      id: 'class-2024-sorcerer-metamagic-17', level: 17, step: 'timeline', kind: 'class-choice',
      title: '再选择2项超魔法', description: '再选择2项超魔选项（共6项），不可与已有选项重复。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: METAMAGIC_2024_OPTION_IDS, uniqueGroup: 'sorcerer-metamagic-2024',
    },
    {
      id: 'class-2024-sorcerer-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '19级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
  spellcasting: {
    ruleset: '5e-2024',
    mode: 'prepared',
    ability: 'cha',
    startsAtLevel: 1,
    preparedCountByLevel: SORCERER_PREPARED_COUNTS,
    cantripsKnownByLevel: SORCERER_CANTRIPS,
    maxSpellLevelByClassLevel: SORCERER_MAX_SPELL_LEVELS,
    slotsByClassLevel: SORCERER_SPELL_SLOTS,
    classSpellIds: sorcererClassSpellIds2024,
  },
}

export const sorcererSubclassFeatures2024: readonly SubclassFeature[] = [
  // ============ 畸变术法 ============
  {
    id: 'sorcerer-2024-aberrant-psionic-spells', subclassId: 'subclass-2024-sorcerer-aberrant-sorcery', name: '灵能法术', englishName: 'Psionic Spells', level: 3,
    summary: '3／5／7／9 级获得始终准备的灵能主题法术（心灵之楔、哈达之臂、侦测思想、心灵遥控等）。',
    description: '你与异界灵能的链接使你始终准备特定法术：3 级——心灵之楔、哈达之臂、不谐低语、安定心神、侦测思想；5 级——哈达之欲、短讯术；7 级——艾伐黑触手、异怪召唤术；9 级——拉瑞心灵连接、心灵遥控。这些法术不计入你的准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-aberrant-telepathic-speech', subclassId: 'subclass-2024-sorcerer-aberrant-sorcery', name: '传心谈话', englishName: 'Telepathic Speech', level: 3,
    summary: '附赠动作与 30 尺内可见生物建立心灵链接：可用知晓的语言心灵交流，距离不超过魅力调整值里（至少 1 里），持续术士等级分钟。',
    description: '以一个附赠动作，你可以选择 30 尺内一个你可见的生物建立心灵感应链接。链接持续等同于你术士等级的分钟数，或在你与另一生物建立链接时提前结束。你们可以用互相知晓的语言进行心灵交流，交流距离不超过你的魅力调整值里（至少 1 里）。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-aberrant-psionic-sorcery', subclassId: 'subclass-2024-sorcerer-aberrant-sorcery', name: '灵能术法', englishName: 'Psionic Sorcery', level: 6,
    summary: '施展灵能法术表中的一环或更高环法术时，可用等于环数的术法点代替法术位，并忽略言语／姿势成分。',
    description: '当你施展一道灵能法术特性中的一环或更高环阶的法术时，你可以改为使用等同于该法术环数的术法点而非消耗法术位施展该法术。以术法点施放时，你无视该法术的言语成分与姿势成分，也忽视不会消耗且未给出具体价值的材料成分。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-aberrant-psychic-defenses', subclassId: 'subclass-2024-sorcerer-aberrant-sorcery', name: '心灵防御', englishName: 'Psychic Defenses', level: 6,
    summary: '获得心灵伤害抗性；避免与结束魅惑、恐慌状态的豁免具有优势。',
    description: '你获得心灵伤害的抗性。此外，你在避免和结束魅惑状态与恐慌状态的豁免检定上具有优势。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-aberrant-revelation-in-flesh', subclassId: 'subclass-2024-sorcerer-aberrant-sorcery', name: '血肉启示', englishName: 'Revelation in Flesh', level: 14,
    summary: '附赠动作消耗 1 点以上术法点变形 10 分钟，每点选择一项：水下适应、闪耀飞翔、识破隐形或蠕行移动。',
    description: '以一个附赠动作，你使用 1 点或更多术法点魔法性地转变形态，持续 10 分钟。每消耗 1 点术法点，你从以下效应中选择一项并在持续期间同时获得：水生适应——获得两倍行走速度的游泳速度并可在水下呼吸；闪耀飞翔——获得等于你速度的飞行速度并可悬浮；识破隐形——能看见 60 尺内处于隐形状态的生物（全身掩护除外）；蠕行移动——可穿过最窄 1 寸宽的狭窄空间，并可消耗 5 尺移动力脱离非魔法束缚或受擒状态。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(14), recovery: 'long-rest', note: '变形本身按术法点消耗；每次长休 1 次，可消耗 5 点术法点重置（手动）' },
  },
  {
    id: 'sorcerer-2024-aberrant-warping-implosion', subclassId: 'subclass-2024-sorcerer-aberrant-sorcery', name: '扭曲内爆', englishName: 'Warping Implosion', level: 18,
    summary: '魔法动作传送 120 尺并牵引周围生物：30 尺内生物力量豁免失败受 3d10 力场伤害并被拉向原位置；每次长休 1 次，可消耗 5 点术法点重置。',
    description: '以一个魔法动作，你传送到 120 尺内你可见的一个未被占据的位置；随后你消失位置 30 尺内的每个生物必须进行一次对抗你施法 DC 的力量豁免：失败受到 3d10 力场伤害并被立即拉向你原本的位置（停在最靠近的未占据空间），成功则只受一半伤害。此特性每次长休 1 次；你也可以消耗 5 点术法点（无需动作）重置其使用权。',
    kind: 'action', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(18), recovery: 'long-rest', note: '每次长休 1 次；可消耗 5 点术法点重置（手动）' },
  },

  // ============ 时械术法 ============
  {
    id: 'sorcerer-2024-clockwork-spells', subclassId: 'subclass-2024-sorcerer-clockwork-sorcery', name: '时械法术', englishName: 'Clockwork Spells', level: 3,
    summary: '3／5／7／9 级获得始终准备的秩序主题法术（援助、解除魔法、行动自如、力场墙等）。',
    description: '你与机械境等秩序位面的链接使你始终准备特定法术：3 级——防护善恶、警报术、次等复原术、援助术；5 级——解除魔法、防护能量；7 级——行动自如、构装召唤术；9 级——高等复原术、力场墙。这些法术不计入你的准备上限。此外，你可以从秩序显迹表（1d6）中选择或掷骰决定施法时显现秩序联系的方式。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-clockwork-restore-balance', subclassId: 'subclass-2024-sorcerer-clockwork-sorcery', name: '归复平衡', englishName: 'Restore Balance', level: 3,
    summary: '反应：60 尺内可见生物带优势或劣势的检定取消其优势／劣势；次数＝魅力调整值（至少 1），长休恢复。',
    description: '当你 60 尺内一个你可见的生物即将带着优势或劣势进行一次检定时，你可以用反应使这次检定免受优势或劣势的影响。使用次数等于你的魅力调整值（至少 1 次），完成长休时重获全部次数。',
    kind: 'reaction', status: 'implemented', sourceIds,
    resource: { recovery: 'long-rest', maxFromAbility: RESTORE_BALANCE_MIN_USES, note: '反应取消一次检定的优势或劣势' },
  },
  {
    id: 'sorcerer-2024-clockwork-bastion-of-law', subclassId: 'subclass-2024-sorcerer-clockwork-sorcery', name: '律令之壁', englishName: 'Bastion of Law', level: 6,
    summary: '魔法动作消耗 1—5 点术法点，为你或 30 尺内可见生物创造对应数量 d8 的屏障；受伤时可消耗骰子减伤。',
    description: '以一个魔法动作，你可以消耗 1—5 点术法点，为你或 30 尺内的一个可见生物创造一个魔法屏障，屏障具有等同于所消耗术法点数量的 d8 骰。当被守护的生物受到伤害时，其可以消耗任意数量的这些骰子，投掷并将结果合计从该次伤害中减去。屏障持续到完成一次长休或你再次使用该特性。',
    kind: 'action', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-clockwork-trance-of-order', subclassId: 'subclass-2024-sorcerer-clockwork-sorcery', name: '序列意识', englishName: 'Trance of Order', level: 14,
    summary: '附赠动作进入 1 分钟状态：攻击检定无法对你具有优势，d20 的 9 及以下视为 10；每次长休 1 次，可消耗 5 点术法点重置。',
    description: '以一个附赠动作，你可以进入与机械境计算同步的状态 1 分钟。期间对你进行的攻击检定无法具有优势，且每当你进行一次 d20 检定时，可以把 d20 掷出的 9 或以下视为 10。此特性每次长休 1 次；你也可以消耗 5 点术法点（无需动作）重置其使用权。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(14), recovery: 'long-rest', note: '每次长休 1 次；可消耗 5 点术法点重置（手动）' },
  },
  {
    id: 'sorcerer-2024-clockwork-clockwork-cavalcade', subclassId: 'subclass-2024-sorcerer-clockwork-sorcery', name: '时械矩阵', englishName: 'Clockwork Cavalcade', level: 18,
    summary: '魔法动作召唤精魂：30 尺立方内分配至多 100 点治疗、修复物件、解除六环及以下法术；每次长休 1 次，可消耗 7 点术法点重置。',
    description: '以一个魔法动作，你在以你为源点的 30 尺立方范围内召唤秩序精魂（无实体、不可摧毁），在其消失前产生以下效应：治愈——合计提供至多恢复 100 生命值，由你分配给范围内任意数量的生物；修复——范围内损坏的物件立即修复；破法——你选择范围内任意数量的生物或物件，其承受的六环或以下法术结束。此特性每次长休 1 次；你也可以消耗 7 点术法点（无需动作）恢复其使用次数。',
    kind: 'action', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(18), recovery: 'long-rest', note: '每次长休 1 次；可消耗 7 点术法点重置（手动）' },
  },

  // ============ 龙族术法 ============
  {
    id: 'sorcerer-2024-draconic-resilience', subclassId: 'subclass-2024-sorcerer-draconic-sorcery', name: '龙族体魄', englishName: 'Draconic Resilience', level: 3,
    summary: '生命值上限 3 级 +3、此后每级 +1；未着甲时 AC＝10＋敏捷＋魅力。',
    description: '魔法在你的体内流动，外化为龙族赠礼：你的生命值上限提升 3，此后每提升一个术士等级再提升 1；你的部分皮肤覆盖龙鳞样式的柔鳞，未着装护甲时基础 AC 等于 10 + 敏捷调整值 + 魅力调整值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-draconic-spells', subclassId: 'subclass-2024-sorcerer-draconic-sorcery', name: '龙族法术', englishName: 'Draconic Spells', level: 3,
    summary: '3／5／7／9 级获得始终准备的龙族主题法术（繁彩球、龙息术、飞行术、龙类召唤术等）。',
    description: '你与龙族血脉的链接使你始终准备特定法术：3 级——繁彩球、命令术、龙息术、变身术；5 级——恐惧术、飞行术；7 级——秘法眼、魅惑怪物；9 级——通晓传奇、龙类召唤术。这些法术不计入你的准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-draconic-elemental-affinity', subclassId: 'subclass-2024-sorcerer-draconic-sorcery', name: '元素亲和', englishName: 'Elemental Affinity', level: 6,
    summary: '选择强酸／寒冷／火焰／闪电／毒素之一：获得该伤害抗性，施展该类型伤害法术时把魅力调整值加到一次伤害掷骰。',
    description: '选择以下伤害类型之一：强酸、寒冷、火焰、闪电或毒素。你获得对所选伤害类型的抗性；当你施展造成该类型伤害的法术时，你可以将你的魅力调整值加到该法术的其中一次伤害掷骰中。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-draconic-dragon-wings', subclassId: 'subclass-2024-sorcerer-draconic-sorcery', name: '龙翼', englishName: 'Dragon Wings', level: 14,
    summary: '附赠动作张开龙翼 1 小时，获得 60 尺飞行速度；每次长休 1 次，可消耗 3 点术法点重置。',
    description: '以一个附赠动作，你可以在背后张开一对龙翼，持续 1 小时（或直至你无需动作将其解散）。持续期间你获得 60 尺飞行速度。此特性每次长休 1 次；你也可以消耗 3 点术法点（无需动作）重置其使用权。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(14), recovery: 'long-rest', note: '每次长休 1 次；可消耗 3 点术法点重置（手动）' },
  },
  {
    id: 'sorcerer-2024-draconic-dragon-companion', subclassId: 'subclass-2024-sorcerer-draconic-sorcery', name: '龙族伙伴', englishName: 'Dragon Companion', level: 18,
    summary: '无需材料成分施展龙类召唤术，并可无需法术位施展一次（长休恢复）；可改为无需专注、持续 1 分钟。',
    description: '你可以无需材料成分施展龙类召唤术，并且可以无需法术位施展它一次；以此法施展后需完成一次长休才能再次如此施展。每当你开始施展该法术时，都可以修改该法术使其无需专注；以此法施展时，法术持续时间变为 1 分钟。召唤生物的数据卡未装配前，本条目只登记规则边界，不生成召唤物数值。',
    kind: 'passive', status: 'implemented', sourceIds,
    grantedSpells: [{ spellId: 'spell-2024-summon-dragon', freeCastings: 1, recovery: 'long-rest' }],
  },

  // ============ 狂野术法 ============
  {
    id: 'sorcerer-2024-wild-wild-magic-surge', subclassId: 'subclass-2024-sorcerer-wild-magic-sorcery', name: '狂野魔法浪涌', englishName: 'Wild Magic Surge', level: 3,
    summary: '每回合一次，消耗法术位施展术士法术后可掷 d20；掷出 20 则在狂野魔法浪涌表上掷骰决定随机效应。',
    description: '你施法时会释放未经塑造的魔法浪涌。一回合一次，你每次消耗法术位施展一道术士法术后，可以立刻掷一次 d20；如果掷出 20，则在狂野魔法浪涌表上掷骰以确定随机魔法效应。若掷出的效应是一道法术，该法术因过于狂野而无法受你的超魔影响。随机表与效应结算保持提示，不自动投掷。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-wild-tide-of-chaos', subclassId: 'subclass-2024-sorcerer-wild-magic-sorcery', name: '混乱之潮', englishName: 'Tide of Chaos', level: 3,
    summary: '使自身一次 d20 检定具有优势（掷骰前决定）；每次长休 1 次，用法术位施展术士法术后恢复可用并自动触发浪涌掷骰。',
    description: '你可以在掷出 d20 之前决定使用此特性，使一次自身的 d20 检定具有优势。此特性每次长休 1 次；当你使用法术位施展一道术士法术时，它也会恢复可用，但此时你会自动在狂野魔法浪涌表上掷骰。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: TIDE_OF_CHAOS_USES, recovery: 'long-rest', note: '用法术位施展术士法术后恢复可用，并自动触发狂野魔法浪涌掷骰' },
  },
  {
    id: 'sorcerer-2024-wild-bend-luck', subclassId: 'subclass-2024-sorcerer-wild-magic-sorcery', name: '扭曲幸运', englishName: 'Bend Luck', level: 6,
    summary: '反应消耗 1 点术法点：可见生物完成 d20 掷骰后，掷 1d4 作为加值或减值附加到结果上。',
    description: '当一个你能看见的生物投掷 d20 进行 d20 检定时，你可以在掷骰完成之后立即用一个反应并消耗 1 点术法点，掷一次 1d4，并将结果作为加值或减值（由你决定）附加到该 d20 掷骰中。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-wild-controlled-chaos', subclassId: 'subclass-2024-sorcerer-wild-magic-sorcery', name: '受控混沌', englishName: 'Controlled Chaos', level: 14,
    summary: '每次在狂野魔法浪涌表上掷骰时可以掷两次并自选其一。',
    description: '你对狂野魔法的涌动有了些许掌控：每次在狂野魔法浪涌表上掷骰时，你可以掷两次并自选其中一个结果生效。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'sorcerer-2024-wild-tamed-surge', subclassId: 'subclass-2024-sorcerer-wild-magic-sorcery', name: '驯服浪涌', englishName: 'Tamed Surge', level: 18,
    summary: '用法术位施展术士法术后可从浪涌表中自选一种效应（末行除外）；每次长休 1 次。',
    description: '你使用法术位施展一道术士法术之后，可以立即创造一种从狂野魔法浪涌表中选择的效应，而非在其上掷骰。你可以选择表中除最后一行外的任何效应；若所选效应包含掷骰，则你必须掷骰。此特性每次长休 1 次。',
    kind: 'passive', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(18), recovery: 'long-rest', note: '每次长休 1 次' },
  },
]

export const sorcererSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-sorcerer-aberrant-sorcery',
    classId: 'class-2024-sorcerer',
    ruleset: '5e-2024',
    name: '畸变术法',
    englishName: 'Aberrant Sorcery',
    selectionLevel: 3,
    summary: '以灵能力量触碰他人意识：灵能法术、传心谈话、灵能术法与心灵防御，高等级血肉启示与空间扭曲。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: sorcererSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-sorcerer-aberrant-sorcery'),
    alwaysPreparedSpellIdsByLevel: ABERRANT_SPELLS,
  },
  {
    id: 'subclass-2024-sorcerer-clockwork-sorcery',
    classId: 'class-2024-sorcerer',
    ruleset: '5e-2024',
    name: '时械术法',
    englishName: 'Clockwork Sorcery',
    selectionLevel: 3,
    summary: '引导机械境的秩序之力：时械法术、归复平衡、律令之壁，高等级序列意识与时械矩阵。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: sorcererSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-sorcerer-clockwork-sorcery'),
    alwaysPreparedSpellIdsByLevel: CLOCKWORK_SPELLS,
  },
  {
    id: 'subclass-2024-sorcerer-draconic-sorcery',
    classId: 'class-2024-sorcerer',
    ruleset: '5e-2024',
    name: '龙族术法',
    englishName: 'Draconic Sorcery',
    selectionLevel: 3,
    summary: '以龙族血脉强化体魄与元素亲和：龙族体魄（无甲 AC 与生命值）、龙族法术、龙翼与龙族伙伴。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: sorcererSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-sorcerer-draconic-sorcery'),
    alwaysPreparedSpellIdsByLevel: DRACONIC_SPELLS,
    unarmoredDefense: { ability: 'cha', allowsShield: false },
  },
  {
    id: 'subclass-2024-sorcerer-wild-magic-sorcery',
    classId: 'class-2024-sorcerer',
    ruleset: '5e-2024',
    name: '狂野术法',
    englishName: 'Wild Magic Sorcery',
    selectionLevel: 3,
    summary: '以混沌魔力赌运：狂野魔法浪涌、混乱之潮、扭曲幸运，高等级受控混沌与驯服浪涌。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: sorcererSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-sorcerer-wild-magic-sorcery'),
  },
]
