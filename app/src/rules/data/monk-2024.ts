import type { ChoiceCheckpoint, ClassFeature, ClassRule, RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'

/**
 * 2024 武僧与 4 个子职（B08-05）。
 *
 * 规则依据：B01《职业-全量》CV-032、CV-028—031 与项目内《5e 不全书》2024 武僧章节；
 * `docs/classes/subclasses/monk/*.md` 提供结构与边界说明。
 * 特性名称采用 5e 不全书译名（命流武者／四象武者／散打武者／暗影武者），摘要与详情为原创中文转述。
 */
const sourceIds = ['source-2024-phb'] as const

/** 武僧技能候选：杂技、运动、历史、洞悉、宗教、隐匿。 */
export const MONK_SKILL_OPTION_IDS = [
  'skill-acrobatics',
  'skill-athletics',
  'skill-history',
  'skill-insight',
  'skill-religion',
  'skill-stealth',
] as const

/** 功法点数：2 级起等于武僧等级，1 级为 0。 */
const FOCUS_POINTS = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const

/** 武艺骰：1—4 级 d6、5—10 级 d8、11—16 级 d10、17—20 级 d12。 */
const MARTIAL_ARTS_DIE_BY_LEVEL = [
  'd6', 'd6', 'd6', 'd6', 'd8', 'd8', 'd8', 'd8', 'd8', 'd8',
  'd10', 'd10', 'd10', 'd10', 'd10', 'd10', 'd12', 'd12', 'd12', 'd12',
] as const

/** 初始装备 A 的工具选择候选：17 种工匠工具与 10 种乐器（B07-A 已接入的 2024 装备）。 */
export const MONK_TOOL_ITEM_IDS = [
  'equipment-2024-alchemist-s-supplies',
  'equipment-2024-brewer-s-supplies',
  'equipment-2024-calligrapher-s-supplies',
  'equipment-2024-carpenter-s-tools',
  'equipment-2024-cartographer-s-tools',
  'equipment-2024-cobbler-s-tools',
  'equipment-2024-cook-s-utensils',
  'equipment-2024-glassblower-s-tools',
  'equipment-2024-jeweler-s-tools',
  'equipment-2024-leatherworker-s-tools',
  'equipment-2024-mason-s-tools',
  'equipment-2024-painter-s-supplies',
  'equipment-2024-potter-s-tools',
  'equipment-2024-smith-s-tools',
  'equipment-2024-tinker-s-tools',
  'equipment-2024-weaver-s-tools',
  'equipment-2024-woodcarver-s-tools',
  'equipment-2024-bagpipes',
  'equipment-2024-drum',
  'equipment-2024-dulcimer',
  'equipment-2024-flute',
  'equipment-2024-horn',
  'equipment-2024-lute',
  'equipment-2024-lyre',
  'equipment-2024-pan-flute',
  'equipment-2024-shawm',
  'equipment-2024-viol',
] as const

/** 武僧职业专属选项：工匠工具或乐器熟练的二选一。 */
export const monkOptions2024: readonly RuleOption[] = [
  { id: 'monk-2024-tool-artisans-tools', name: '一种工匠工具', englishName: "Artisan's Tools", description: '选择一种工匠工具熟练（具体工具在装备步骤选择）。', status: 'implemented', sourceIds },
  { id: 'monk-2024-tool-musical-instrument', name: '一种乐器', englishName: 'Musical Instrument', description: '选择一种乐器熟练（具体乐器在装备步骤选择）。', status: 'implemented', sourceIds },
]

export const monkFeatures2024: readonly ClassFeature[] = [
  {
    id: 'monk-2024-class-martial-arts', classId: 'class-2024-monk', name: '武艺', englishName: 'Martial Arts', level: 1,
    summary: '附赠徒手打击；武艺骰 d6→d8→d10→d12；徒手与武僧武器可用敏捷代替力量。',
    description: '武僧武器为简易近战武器与具有轻型词条的军用近战武器。只要你未着装任何护甲也未持用盾牌，且徒手或只持用武僧武器，便获得：附赠徒手打击（用附赠动作发动一次徒手打击）；武艺骰（徒手打击或武僧武器伤害可改用武艺骰：1—4 级 d6、5—10 级 d8、11—16 级 d10、17 级起 d12）；敏捷攻击（徒手打击或武僧武器可用敏捷代替力量进行攻击检定与伤害掷骰，徒手擒抱或推撞时也可用敏捷决定豁免 DC）。',
    kind: 'passive', status: 'implemented', sourceIds,
    dicePool: { diceByLevel: Array.from({ length: 20 }, () => 1), dieByLevel: MARTIAL_ARTS_DIE_BY_LEVEL, recovery: 'none', note: '武艺完整收益要求未着装护甲、未持用盾牌，且徒手或只持用武僧武器' },
  },
  {
    id: 'monk-2024-class-unarmored-defense', classId: 'class-2024-monk', name: '无甲防御', englishName: 'Unarmored Defense', level: 1,
    summary: '未着装护甲且未持用盾牌时，AC = 10 + 敏捷调整值 + 感知调整值。',
    description: '若你未着装任何护甲且未持用盾牌，你的基础护甲等级等于 10 + 你的敏捷调整值 + 你的感知调整值。持盾或着甲时该特性失效。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-monks-focus', classId: 'class-2024-monk', name: '武僧武功', englishName: "Monk's Focus", level: 2,
    summary: '功力点数等于武僧等级；短休或长休全部恢复；武艺豁免 DC = 8＋熟练＋感知。',
    description: '你掌握内在能量“功力”，其点数等于你的武僧等级（2 级起）。每消耗 1 点功力后，直到完成短休或长休前不能再次使用；完成休息时重获全部功力。可消耗功力启动：疾风连击（1 点，附赠动作发动两次徒手打击）、坚强防御（附赠动作执行撤离；消耗 1 点可同时执行撤离与回避）、疾步如风（附赠动作执行疾走；消耗 1 点可同时执行撤离与疾走，并使该回合跳跃距离翻倍）。需要目标豁免的武僧特性 DC = 8 + 熟练加值 + 感知调整值。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: FOCUS_POINTS, recovery: 'short-rest', note: '消耗后需短休或长休恢复；运转周天可在先攻时恢复全部功力' },
  },
  {
    id: 'monk-2024-class-unarmored-movement', classId: 'class-2024-monk', name: '无甲移动', englishName: 'Unarmored Movement', level: 2,
    summary: '未着甲未持盾时速度 +10 尺，6 级 +15、10 级 +20、14 级 +25、18 级 +30 尺。',
    description: '若你未着装任何护甲且未持用盾牌，你的速度提升 10 尺。该加值随武僧等级提升：6 级 +15 尺、10 级 +20 尺、14 级 +25 尺、18 级 +30 尺。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-uncanny-metabolism', classId: 'class-2024-monk', name: '运转周天', englishName: 'Uncanny Metabolism', level: 2,
    summary: '投先攻时可重获全部功力，并回复 1 枚武艺骰＋武僧等级的生命值；每次长休一次。',
    description: '当你投掷先攻时，你可以重获所有已消耗的功力。若你如此做，掷你的武艺骰，并恢复其结果 + 你的武僧等级的生命值。使用此特性后，必须完成一次长休才能再次使用。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-deflect-attacks', classId: 'class-2024-monk', name: '拨挡攻击', englishName: 'Deflect Attacks', level: 3,
    summary: '反应减少 1d10＋敏捷＋武僧等级的钝击／穿刺／挥砍伤害；减至 0 可消耗 1 点功力反击 2 武艺骰＋敏捷。',
    description: '当你被一次伤害包含钝击、穿刺或挥砍类型的攻击检定命中时，你可以执行反应减少此次攻击对你造成的伤害，减值等于 1d10 + 你的敏捷调整值 + 你的武僧等级。若伤害被减至 0，你可以消耗 1 点功力将部分伤害重新定向：近战攻击选择 5 尺内你可见的生物，远程攻击选择 60 尺内不在全身掩护后的可见生物；目标敏捷豁免失败则受到 2 枚武艺骰 + 敏捷调整值的同类型伤害。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-subclass', classId: 'class-2024-monk', name: '武僧子职', englishName: 'Monk Subclass', level: 3,
    summary: '选择命流武者、四象武者、散打武者或暗影武者，并在 3、6、11、17 级获得其特性。',
    description: '你在 3 级选择一项武僧子职：命流武者、四象武者、散打武者或暗影武者。此后获得该子职的能力，前提是所需等级不超过你的武僧等级。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-monk-subclass-3'], status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-slow-fall', classId: 'class-2024-monk', name: '轻身坠', englishName: 'Slow Fall', level: 4,
    summary: '反应将坠落伤害减少 5 × 武僧等级。',
    description: '当你要承受坠落伤害时，你可以使用反应将伤害减少等同于五倍武僧职业等级的数值。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-extra-attack', classId: 'class-2024-monk', name: '额外攻击', englishName: 'Extra Attack', level: 5,
    summary: '执行攻击动作时可发动两次攻击而非一次。',
    description: '当你在自己的回合执行攻击动作时，你可以发动两次攻击而非一次。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-stunning-strike', classId: 'class-2024-monk', name: '震慑拳', englishName: 'Stunning Strike', level: 5,
    summary: '每回合一次，徒手或武僧武器命中后消耗 1 点功力，目标体质豁免；失败震慑，成功则减速且下次攻击有优势。',
    description: '每回合一次，当你使用徒手打击或武僧武器命中一个生物后，你可以消耗 1 点功力尝试发动震慑拳。目标必须进行一次体质豁免（DC = 8 + 熟练加值 + 感知调整值）：失败则陷入震慑状态直至你的下个回合开始；成功则速度减半直至你的下个回合开始，且下一次对该目标进行的攻击检定具有优势。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-empowered-strikes', classId: 'class-2024-monk', name: '真力注拳', englishName: 'Empowered Strikes', level: 6,
    summary: '徒手打击造成伤害时可选择力场伤害或原本的伤害类型。',
    description: '当你使用徒手打击造成伤害时，你可以选择造成力场伤害或是其原本的伤害类型。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-evasion', classId: 'class-2024-monk', name: '反射闪避', englishName: 'Evasion', level: 7,
    summary: '允许敏捷豁免减半伤害的效应：成功免伤、失败减半；失能时失效。',
    description: '当你受到一个允许你进行敏捷豁免来只承受一半伤害的效应影响时，你在豁免成功时不受伤害，豁免失败时只承受一半伤害。如果你处于失能状态，则无法从此特性中受益。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-acrobatic-movement', classId: 'class-2024-monk', name: '飞檐走壁', englishName: 'Acrobatic Movement', level: 9,
    summary: '未着甲未持盾时，可在垂直表面与液体表面上移动而不坠落。',
    description: '若你未着装任何护甲也未持用盾牌，你便可以在你的回合中在垂直表面和液体表面上移动而不会坠落。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-heightened-focus', classId: 'class-2024-monk', name: '出神入化', englishName: 'Heightened Focus', level: 10,
    summary: '疾风连击改为三次徒手打击；坚强防御获得 2 武艺骰临时生命；疾步如风可携带 5 尺内一名自愿生物。',
    description: '你的武僧武功获得强化：疾风连击——消耗 1 点功力施展时可进行三次徒手打击而非两次；坚强防御——消耗功力使用时可获得相当于 2 枚武艺骰的临时生命值；疾步如风——消耗功力使用时可选择 5 尺内一名体型为大型或更小的自愿生物，直至你的回合结束随你移动且不引发借机攻击。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-self-restoration', classId: 'class-2024-monk', name: '返本还元', englishName: 'Self-Restoration', level: 10,
    summary: '每回合结束可移除魅惑、恐慌或中毒之一；不吃不喝不再提升力竭等级。',
    description: '你能够在每个自己的回合结束时移除你身上的魅惑、恐慌或中毒状态之一。此外，不吃不喝不再会使你提升力竭等级。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-deflect-energy', classId: 'class-2024-monk', name: '拨挡能量', englishName: 'Deflect Energy', level: 13,
    summary: '拨挡攻击可对抗任何伤害类型的攻击，不再限于钝击、穿刺或挥砍。',
    description: '你现在可以使用拨挡攻击特性对抗造成任何伤害类型的攻击，而不仅限于钝击、穿刺或挥砍。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-disciplined-survivor', classId: 'class-2024-monk', name: '圆融自在', englishName: 'Disciplined Survivor', level: 14,
    summary: '获得全部豁免熟练；豁免失败时可消耗 1 点功力重掷且必须采用新结果。',
    description: '你获得所有豁免的熟练。此外，当你豁免失败时，你可以消耗 1 点功力重掷豁免，但必须使用重掷的结果。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-perfect-focus', classId: 'class-2024-monk', name: '明镜止水', englishName: 'Perfect Focus', level: 15,
    summary: '投先攻且不使用运转周天时，若功力不超过 3 点则恢复至 4 点。',
    description: '若你在投掷先攻，且选择不使用运转周天时，你的功力为 3 点或更少，则你的功力恢复至 4 点。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-superior-defense', classId: 'class-2024-monk', name: '无懈可击', englishName: 'Superior Defense', level: 18,
    summary: '回合开始时消耗 3 点功力，1 分钟内除力场外获得全部伤害抗性。',
    description: '在你的回合开始时，你可以消耗 3 点功力提高自己抵挡伤害的能力，持续 1 分钟或直至你陷入失能状态。持续时间内，你对力场伤害之外的所有伤害都具有抗性。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-epic-boon', classId: 'class-2024-monk', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长，或其他满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一项你选择的、满足条件且适用的专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-monk-feat-19'], status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-class-body-and-mind', classId: 'class-2024-monk', name: '天人合一', englishName: 'Body and Mind', level: 20,
    summary: '敏捷与感知各 +4，且这两项属性的上限提高至 25。',
    description: '你行满功成，身心性命皆已突破超然境界。你的敏捷和感知各提升 4，且这两项属性的上限提高至 25。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const monkRule2024: ClassRule = {
  id: 'class-2024-monk',
  ruleset: '5e-2024',
  name: '武僧',
  englishName: 'Monk',
  summary: '2024版徒手武术家：功力驱动的连击与防御、无甲防御与高机动，子职特化。',
  hitDie: 8,
  primaryAbilities: ['dex', 'wis'],
  playStyleTags: ['striker', 'skirmisher', 'utility'],
  savingThrowAbilities: ['str', 'dex'],
  status: 'implemented',
  sourceIds,
  armorTraining: [],
  weaponTraining: { categories: ['simple'], martialProperties: ['light'] },
  unarmoredDefense: { ability: 'wis', allowsShield: false },
  features: monkFeatures2024,
  checkpoints: [
    {
      id: 'class-2024-monk-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择2项武僧技能', description: '从武僧技能列表中选择2项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: MONK_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-monk-tool-1', level: 1, step: 'timeline', kind: 'class-choice',
      title: '选择工具或乐器熟练', description: '从工匠工具或乐器中选择1项熟练。',
      required: true, minSelections: 1, maxSelections: 1,
      optionIds: ['monk-2024-tool-artisans-tools', 'monk-2024-tool-musical-instrument'],
    },
    ...([4, 8, 12, 16] as const).map((level): ChoiceCheckpoint => ({
      id: `class-2024-monk-feat-${level}`, level, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    {
      id: 'class-2024-monk-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '19级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
}

export const monkSubclassFeatures2024: readonly SubclassFeature[] = [
  // ============ 命流武者 ============
  {
    id: 'monk-2024-mercy-hand-of-harm', subclassId: 'subclass-2024-monk-warrior-of-mercy', name: '夺命之手', englishName: 'Hand of Harm', level: 3,
    summary: '每回合一次，徒手命中时消耗 1 点功力追加 1 枚武艺骰＋感知调整值的暗蚀伤害。',
    description: '每回合一次，当你用徒手打击命中一名生物并造成伤害时，你可以消耗 1 点功力额外造成等于一枚你的武艺骰 + 你的感知调整值的暗蚀伤害。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-mercy-hand-of-healing', subclassId: 'subclass-2024-monk-warrior-of-mercy', name: '予命之手', englishName: 'Hand of Healing', level: 3,
    summary: '魔法动作消耗 1 点功力治疗 1 枚武艺骰＋感知；可在疾风连击中替换一次攻击且不额外消耗。',
    description: '以一个魔法动作，你可以消耗 1 点功力并接触一名生物，为其恢复等于一枚武艺骰 + 感知调整值的生命值。当你使用疾风连击时，你可以将其中一次徒手打击替换为使用此特性，且无需为予命之手消耗功力。',
    kind: 'action', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-mercy-implements-of-mercy', subclassId: 'subclass-2024-monk-warrior-of-mercy', name: '操命本事', englishName: 'Implements of Mercy', level: 3,
    summary: '获得洞悉与医药技能熟练，以及草药工具熟练。',
    description: '你获得洞悉和医药的熟练，并且获得草药工具的熟练。这些熟练来源独立保存，重复熟练按规则处理。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-mercy-physicians-touch', subclassId: 'subclass-2024-monk-warrior-of-mercy', name: '生死之触', englishName: "Physician's Touch", level: 6,
    summary: '夺命之手可附加中毒至下回合结束；予命之手可额外结束目盲、耳聋、麻痹、中毒或震慑之一。',
    description: '你的夺命之手与予命之手获得强化：夺命之手——对目标使用时可使其陷入中毒状态直至你的下个回合结束；予命之手——使用时可额外结束被治疗者身上的目盲、耳聋、麻痹、中毒或震慑状态之一。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-mercy-flurry-of-healing-and-harm', subclassId: 'subclass-2024-monk-warrior-of-mercy', name: '生杀予夺', englishName: 'Flurry of Healing and Harm', level: 11,
    summary: '疾风连击可把每次攻击替换为予命之手；命中时免费使用夺命之手（每回合仍限一次）；总次数＝感知调整值，长休恢复。',
    description: '当你使用疾风连击时，你可以将每一次徒手打击都替换为使用予命之手，且均无需消耗功力。此外，当你以疾风连击发动徒手打击并造成伤害时，可以为那次打击免费使用夺命之手（每回合仍只能使用一次）。这些增益的总使用次数等于你的感知调整值（至少一次），完成长休时重获全部次数。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-mercy-hand-of-ultimate-mercy', subclassId: 'subclass-2024-monk-warrior-of-mercy', name: '命极之手', englishName: 'Hand of Ultimate Mercy', level: 17,
    summary: '魔法动作消耗 5 点功力，复活死亡不超过 24 小时的生物并恢复 4d10＋感知生命值；每次长休一次。',
    description: '以一个魔法动作，你可以消耗 5 点功力并触碰一名死亡不超过 24 小时的生物的尸体。该生物以 4d10 + 你的感知调整值的生命值复活；若其死前具有目盲、耳聋、麻痹、中毒或震慑状态，复活时一并移除。此特性一经使用，直至完成长休前无法再次使用。',
    kind: 'action', status: 'implemented', sourceIds,
  },

  // ============ 四象武者 ============
  {
    id: 'monk-2024-elements-elemental-attunement', subclassId: 'subclass-2024-monk-warrior-of-the-elements', name: '元素同调', englishName: 'Elemental Attunement', level: 3,
    summary: '回合开始时消耗 1 点功力获得 10 分钟增益：徒手触及 +10 尺、可选元素伤害并推拉目标 10 尺。',
    description: '在你回合开始时，你可以消耗 1 点功力让元素能量浸润己身，持续 10 分钟或直至你陷入失能状态。持续时间内：触及——徒手打击的触及提升 10 尺；元素注拳——徒手打击命中时可选择造成强酸、寒冷、火焰、闪电或雷鸣伤害（替代原本类型），且造成这些伤害时可迫使目标力量豁免，失败则将其拉近或推离 10 尺。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-elements-manipulate-elements', subclassId: 'subclass-2024-monk-warrior-of-the-elements', name: '掌控元素', englishName: 'Manipulate Elements', level: 3,
    summary: '习得戏法四象法门，施法属性为感知。',
    description: '你习得戏法四象法门（Elementalism），其施法属性为感知。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-elements-elemental-burst', subclassId: 'subclass-2024-monk-warrior-of-the-elements', name: '元素爆破拳', englishName: 'Elemental Burst', level: 6,
    summary: '魔法动作消耗 2 点功力：120 尺内 20 尺球状区域，目标敏捷豁免失败受 3 枚武艺骰元素伤害，成功减半。',
    description: '以一个魔法动作，你可以消耗 2 点功力，在你周围 120 尺内一点产生半径 20 尺的球状能量爆发，选择强酸、寒冷、火焰、闪电或雷鸣之一作为伤害类型。区域内每个生物必须进行一次敏捷豁免（DC = 8 + 熟练加值 + 感知调整值）：失败受到 3 枚武艺骰的该类型伤害，成功则受到一半伤害。',
    kind: 'action', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-elements-stride-of-the-elements', subclassId: 'subclass-2024-monk-warrior-of-the-elements', name: '四象遁术', englishName: 'Stride of the Elements', level: 11,
    summary: '元素同调激活期间获得等于速度的飞行与游泳速度。',
    description: '当你处于元素同调特性激活期间，你获得相当于你速度的飞行速度与游泳速度。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-elements-elemental-epitome', subclassId: 'subclass-2024-monk-warrior-of-the-elements', name: '四象神通', englishName: 'Elemental Epitome', level: 17,
    summary: '元素同调期间：可选一种元素抗性并每回合更换；疾步如风提速 20 尺并对 5 尺内生物各造成 1 武艺骰伤害；每回合一次徒手命中追加 1 武艺骰。',
    description: '当你处于元素同调激活期间，你额外获得：伤害抗性——选择强酸、寒冷、火焰、闪电或雷鸣之一获得抗性，每个你的回合开始时可以更换；破灭奔行——使用疾步如风时速度提升 20 尺直至回合结束，持续期间进入某生物 5 尺内时可对其造成 1 枚武艺骰伤害（伤害类型任选，同一生物每回合只受一次）；真力注拳——每个你的回合一次，徒手打击命中时可追加 1 枚武艺骰的同类型伤害。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 散打武者 ============
  {
    id: 'monk-2024-open-hand-open-hand-technique', subclassId: 'subclass-2024-monk-warrior-of-the-open-hand', name: '散打技巧', englishName: 'Open Hand Technique', level: 3,
    summary: '疾风连击命中时可选择：慌神（禁用借机攻击）、推离 15 尺（力量豁免）或失衡倒地（敏捷豁免）。',
    description: '每当你的疾风连击中的一次攻击命中一个生物时，你可以迫使其承受以下效应之一：慌神——目标直至其下个回合开始不能使用借机攻击；推离——目标力量豁免失败则被你推离 15 尺；失衡——目标敏捷豁免失败则陷入倒地状态（DC = 8 + 熟练加值 + 感知调整值）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-open-hand-wholeness-of-body', subclassId: 'subclass-2024-monk-warrior-of-the-open-hand', name: '混元体', englishName: 'Wholeness of Body', level: 6,
    summary: '附赠动作恢复 1 枚武艺骰＋感知生命值；次数＝感知调整值（至少 1 次），长休恢复。',
    description: '你可以用一个附赠动作掷你的武艺骰，并恢复掷骰结果 + 你的感知调整值的生命值（至少 1 点）。可使用次数等于你的感知调整值（至少一次），完成长休时重获全部次数。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-open-hand-fleet-step', subclassId: 'subclass-2024-monk-warrior-of-the-open-hand', name: '流星步', englishName: 'Fleet Step', level: 11,
    summary: '执行疾步如风以外的附赠动作后，可立即再使用疾步如风。',
    description: '当你执行疾步如风以外的附赠动作时，你还可以在该附赠动作完成后立即使用疾步如风。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-open-hand-quivering-palm', subclassId: 'subclass-2024-monk-warrior-of-the-open-hand', name: '渗透劲', englishName: 'Quivering Palm', level: 17,
    summary: '徒手命中时消耗 4 点功力植入暗劲（持续武僧等级天数）；引爆时目标体质豁免，失败受 10d12 力场伤害、成功减半。',
    description: '当你以徒手打击命中一个生物时，可以消耗 4 点功力打入暗劲，持续相当于你武僧等级的天数；在你用动作结束前暗劲无害。在自己的回合执行攻击动作时，你可以将其中一次攻击替换为引爆暗劲的动作（你与目标需处于同一存在位面）。目标体质豁免失败受到 10d12 力场伤害，成功则只受一半。同一时间只能使一个生物处于此效应中，也可以无伤害地结束暗劲（无需动作）。',
    kind: 'action', status: 'implemented', sourceIds,
  },

  // ============ 暗影武者 ============
  {
    id: 'monk-2024-shadow-shadow-arts', subclassId: 'subclass-2024-monk-warrior-of-shadow', name: '暗影技艺', englishName: 'Shadow Arts', level: 3,
    summary: '消耗 1 点功力施展黑暗术（可看穿并可移动黑暗区域）；获得 60 尺黑暗视觉；习得次级幻象（感知施法）。',
    description: '你获得以下增益：黑暗术——你可以消耗 1 点功力施展黑暗术且无需任何法术成分，可以看穿以此特性施展的黑暗区域，并在法术持续期间于每个回合开始时将黑暗区域移动到 60 尺内任意一处空间；黑暗视觉——获得 60 尺黑暗视觉，若已有则范围提升 60 尺；幻影术——你知晓戏法次级幻象，其施法属性为感知。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-shadow-shadow-step', subclassId: 'subclass-2024-monk-warrior-of-shadow', name: '暗影步', englishName: 'Shadow Step', level: 6,
    summary: '完全处于微光或黑暗时，附赠动作传送到 60 尺内同样处于微光或黑暗的空位，且本回合下次近战攻击有优势。',
    description: '当你完全身处微光光照或黑暗下时，你能以一个附赠动作传送到 60 尺内另一处你可见的未占据空间，目标地点需要同样位于微光光照或黑暗下。此后，你在当前回合结束前所做的下一次近战攻击具有优势。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-shadow-improved-shadow-step', subclassId: 'subclass-2024-monk-warrior-of-shadow', name: '无影步', englishName: 'Improved Shadow Step', level: 11,
    summary: '暗影步时消耗 1 点功力可移除光照要求，并可在传送后立即进行一次徒手打击。',
    description: '当你使用暗影步特性时，你可以消耗 1 点功力，移除开始与结束时对微光光照或黑暗环境的要求。此外，作为这个附赠动作的一部分，你可以立即在传送之后进行一次徒手打击。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'monk-2024-shadow-cloak-of-shadows', subclassId: 'subclass-2024-monk-warrior-of-shadow', name: '幽影斗篷', englishName: 'Cloak of Shadows', level: 17,
    summary: '微光或黑暗中魔法动作消耗 3 点功力，1 分钟内：隐形、可穿过已占据空间、疾风连击不再消耗功力。',
    description: '当你完全身处微光光照或黑暗环境下时，你能够以一个魔法动作消耗 3 点功力让幽影环绕，持续 1 分钟或直至你陷入失能状态或在明亮光照中结束回合。期间获得：隐形——你获得隐形状态；局部虚化——你可以如同通过困难地形一般通过已占据空间，若回合结束时仍处于已占据空间会被排出到最近未占据空间；幽影连击——你使用疾风连击时不再需要消耗功力。',
    kind: 'action', status: 'implemented', sourceIds,
  },
]

export const monkSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-monk-warrior-of-mercy',
    classId: 'class-2024-monk',
    ruleset: '5e-2024',
    name: '命流武者',
    englishName: 'Warrior of Mercy',
    selectionLevel: 3,
    summary: '以功力在连击中切换治疗与黯蚀伤害：夺命之手、予命之手、生死之触与命极之手。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: monkSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-monk-warrior-of-mercy'),
  },
  {
    id: 'subclass-2024-monk-warrior-of-the-elements',
    classId: 'class-2024-monk',
    ruleset: '5e-2024',
    name: '四象武者',
    englishName: 'Warrior of the Elements',
    selectionLevel: 3,
    summary: '以元素同调改变伤害、触及与位移，并用元素爆发、飞行与抗性成为高速元素战士。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: monkSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-monk-warrior-of-the-elements'),
  },
  {
    id: 'subclass-2024-monk-warrior-of-the-open-hand',
    classId: 'class-2024-monk',
    ruleset: '5e-2024',
    name: '散打武者',
    englishName: 'Warrior of the Open Hand',
    selectionLevel: 3,
    summary: '把疾风连击转化为推倒、推离与封锁反应的控制工具，并以混元体和渗透劲压制目标。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: monkSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-monk-warrior-of-the-open-hand'),
  },
  {
    id: 'subclass-2024-monk-warrior-of-shadow',
    classId: 'class-2024-monk',
    ruleset: '5e-2024',
    name: '暗影武者',
    englishName: 'Warrior of Shadow',
    selectionLevel: 3,
    summary: '以魔法黑暗与暗影步建立自己的战场，随后瞬移并获得持续隐形与虚化。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: monkSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-monk-warrior-of-shadow'),
  },
]
