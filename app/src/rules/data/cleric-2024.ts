import type { ChoiceCheckpoint, ClassFeature, ClassRule, RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'
import { spells2024 } from '@/rules/data/spells-2024'

/**
 * 2024 牧师与 4 个领域（B08-06）。
 *
 * 规则依据：B01《职业-全量》CV-048、CV-046／047／049／050 与项目内《5e 不全书》2024 牧师章节；
 * `docs/classes/subclasses/cleric/*.md` 提供结构与边界说明。
 * 特性名称采用 5e 不全书译名，摘要与详情为原创中文转述。
 */
const sourceIds = ['source-2024-phb'] as const

/** 牧师技能候选：历史、洞悉、医药、游说、宗教。 */
const CLERIC_SKILL_OPTION_IDS = [
  'skill-history',
  'skill-insight',
  'skill-medicine',
  'skill-persuasion',
  'skill-religion',
] as const

// 2024 牧师施法表（B01 CV-048 核对）：不复用 2014 常量，按版本独立登记。
const CLERIC_PREPARED_COUNTS = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22] as const
const CLERIC_CANTRIPS = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] as const
const CLERIC_MAX_SPELL_LEVELS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 9] as const
const CLERIC_SPELL_SLOTS = [
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

/** 引导神力使用次数：2 级起 2 次，6 级起 3 次，18 级起 4 次。 */
const CHANNEL_DIVINITY_USES = [0, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4] as const

/** 神圣干预：10 级起每次长休 1 次；20 级进阶后可改选祈愿术。 */
const DIVINE_INTERVENTION_USES = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] as const

const clericClassSpellIds2024 = spells2024
  .filter((spell) => spell.classIds.includes('class-2024-cleric'))
  .map((spell) => spell.id)

/** 领域法术：到达对应牧师等级时始终准备，不占准备上限。 */
const LIFE_DOMAIN_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-aid', 'spell-2024-bless', 'spell-2024-cure-wounds', 'spell-2024-lesser-restoration'],
  5: ['spell-2024-mass-healing-word', 'spell-2024-revivify'],
  7: ['spell-2024-aura-of-life', 'spell-2024-death-ward'],
  9: ['spell-2024-greater-restoration', 'spell-2024-mass-cure-wounds'],
}
const LIGHT_DOMAIN_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-burning-hands', 'spell-2024-faerie-fire', 'spell-2024-scorching-ray', 'spell-2024-see-invisibility'],
  5: ['spell-2024-daylight', 'spell-2024-fireball'],
  7: ['spell-2024-arcane-eye', 'spell-2024-wall-of-fire'],
  9: ['spell-2024-flame-strike', 'spell-2024-scrying'],
}
const WAR_DOMAIN_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-guiding-bolt', 'spell-2024-shield-of-faith', 'spell-2024-magic-weapon', 'spell-2024-spiritual-weapon'],
  5: ['spell-2024-crusader-s-mantle', 'spell-2024-spirit-guardians'],
  7: ['spell-2024-fire-shield', 'spell-2024-freedom-of-movement'],
  9: ['spell-2024-hold-monster', 'spell-2024-steel-wind-strike'],
}
const TRICKERY_DOMAIN_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-charm-person', 'spell-2024-disguise-self', 'spell-2024-invisibility', 'spell-2024-pass-without-trace'],
  5: ['spell-2024-hypnotic-pattern', 'spell-2024-nondetection'],
  7: ['spell-2024-confusion', 'spell-2024-dimension-door'],
  9: ['spell-2024-dominate-person', 'spell-2024-modify-memory'],
}

/** 牧师职业专属选项：圣职与受祝击。 */
export const clericOptions2024: readonly RuleOption[] = [
  {
    id: 'cleric-2024-divine-order-protector', name: '保护者', englishName: 'Protector',
    description: '为战斗做足训练：获得军用武器熟练与重甲受训。',
    status: 'implemented', sourceIds,
    armorTraining: ['heavy'],
    weaponTraining: { categories: ['martial'] },
  },
  {
    id: 'cleric-2024-divine-order-thaumaturge', name: '奇术使', englishName: 'Thaumaturge',
    description: '额外从牧师法术列表习得一道戏法；智力（奥秘、宗教）检定获得等于感知调整值（至少 +1）的加值。',
    status: 'implemented', sourceIds,
    cantripBonus: 1,
  },
  {
    id: 'cleric-2024-blessed-strikes-divine-strike', name: '神圣打击', englishName: 'Divine Strike',
    description: '每回合一次，武器攻击命中时额外造成 1d8 暗蚀或光耀伤害（14 级提升至 2d8）。',
    status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-blessed-strikes-potent-spellcasting', name: '强力施法', englishName: 'Potent Spellcasting',
    description: '将感知调整值加到牧师戏法造成的伤害上（14 级起还可给予临时生命值）。',
    status: 'implemented', sourceIds,
  },
]

export const clericFeatures2024: readonly ClassFeature[] = [
  {
    id: 'cleric-2024-class-spellcasting', classId: 'class-2024-cleric', name: '施法', englishName: 'Spellcasting', level: 1,
    summary: '感知施法：1 级 3 戏法、4 道准备法术；准备数量按职业表，长休可更换，领域法术始终准备且不占上限。',
    description: '施法属性为感知，可使用圣徽作为施法法器。1 级时知晓 3 道牧师戏法，并准备 4 道一环牧师法术；4 级与 10 级各额外习得一道戏法。准备法术数量按职业表随等级提升，所选法术环级不得超过当前拥有的法术位环级。完成长休时可将任意数量已准备法术替换为其他牧师法术。其他特性授予的始终准备法术不计入准备数量，但对你而言都视为牧师法术。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-class-divine-order', classId: 'class-2024-cleric', name: '圣职', englishName: 'Divine Order', level: 1,
    summary: '选择保护者（军用武器与重甲受训）或奇术使（额外戏法与奥秘／宗教检定加值）。',
    description: '你投身于一种神圣职能：保护者——获得军用武器熟练与重甲受训；奇术使——额外习得一道牧师戏法，并在智力（奥秘、宗教）检定中获得等于感知调整值（至少 +1）的加值。该选择在时间线中确认并持久保存。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-cleric-divine-order-1'], status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-class-channel-divinity', classId: 'class-2024-cleric', name: '引导神力', englishName: 'Channel Divinity', level: 2,
    summary: '引导神力次数 2 级起 2 次、6 级起 3 次、18 级起 4 次；短休恢复 1 次，长休全部恢复。',
    description: '你能引导外层位面的神圣能量。起始掌握神圣火花与驱散亡灵两种效应，子职会提供更多选项。使用次数见职业表：2 级起 2 次，6 级起 3 次，18 级起 4 次；完成短休恢复 1 次，完成长休恢复全部。需要豁免的引导神力效应使用你的法术豁免 DC。神圣火花：魔法动作，为 30 尺内一个可见生物恢复 1d8＋感知调整值生命，或迫使其体质豁免失败受等量暗蚀／光耀伤害（成功减半）；7／13／18 级伤害骰为 2d8／3d8／4d8。驱散亡灵：魔法动作，30 尺内每个你选择的亡灵感知豁免，失败则恐慌且失能 1 分钟，并尽可能远离你；受到伤害或你失能／死亡时提前结束。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: CHANNEL_DIVINITY_USES, recovery: 'short-rest', shortRestRecovery: 1, note: '短休恢复 1 次，长休全部恢复；神圣火花与驱散亡灵，子职另有选项' },
  },
  {
    id: 'cleric-2024-class-subclass', classId: 'class-2024-cleric', name: '牧师子职', englishName: 'Cleric Subclass', level: 3,
    summary: '选择生命、光明、诡术或战争领域，并在 3、6、17 级获得其特性。',
    description: '你在 3 级选择一项牧师子职：生命领域、光明领域、诡术领域或战争领域。此后获得该领域的全部能力，前提是所需等级不超过你的牧师等级。每个领域以神明、神殿或宗教青睐的“领域”命名，并授予始终准备的领域法术。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-cleric-subclass-3'], status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-class-sear-undead', classId: 'class-2024-cleric', name: '灼净亡灵', englishName: 'Sear Undead', level: 5,
    summary: '使用驱散亡灵时投掷等于感知调整值枚 d8（至少 1 枚），豁免失败的亡灵受到等量光耀伤害且不终止驱散。',
    description: '每当你使用驱散亡灵时，都可以投掷等于你感知调整值枚 d8（最少 1d8）；每个对抗驱散亡灵豁免失败的亡灵受到骰值之和的光耀伤害。此伤害不会终止驱散效应。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-class-blessed-strikes', classId: 'class-2024-cleric', name: '受祝击', englishName: 'Blessed Strikes', level: 7,
    summary: '选择神圣打击（武器命中追加 1d8 暗蚀／光耀）或强力施法（牧师戏法伤害加感知调整值）。',
    description: '神圣力量注入你的战斗，你从以下两项中选择其一：神圣打击——每个你的回合一次，武器攻击命中时可使目标额外受到 1d8 暗蚀或光耀伤害（由你选择）；强力施法——将你的感知调整值加到任何牧师戏法造成的伤害上。该选择在时间线中确认并持久保存。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-cleric-blessed-strikes-7'], status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-class-divine-intervention', classId: 'class-2024-cleric', name: '神圣干预', englishName: 'Divine Intervention', level: 10,
    summary: '魔法动作选择一道五环或更低、施法时间非反应的牧师法术，无需法术位与材料施展；每次长休 1 次。',
    description: '以一个魔法动作，你选择一道五环或更低且施法时间不为反应动作的牧师法术，将其作为该动作的一部分施展，无需消耗法术位，也无需提供对应的施法材料。使用后必须完成一次长休才能再次使用。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: DIVINE_INTERVENTION_USES, recovery: 'long-rest', note: '每次长休 1 次；20 级起可选择祈愿术' },
  },
  {
    id: 'cleric-2024-class-improved-blessed-strike', classId: 'class-2024-cleric', name: '精通受祝击', englishName: 'Improved Blessed Strike', level: 14,
    summary: '神圣打击提升至 2d8；强力施法额外给予自己或 60 尺内一个生物 2×感知调整值临时生命。',
    description: '你所选择的受祝击选项获得强化：神圣打击——额外伤害提升至 2d8；强力施法——当你以牧师戏法对生物造成伤害时，可为自己或 60 尺内的另一个生物注入活力，使其获得等于你感知调整值两倍的临时生命值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-class-epic-boon', classId: 'class-2024-cleric', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长，或其他满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一项你选择的、满足条件且适用的专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-cleric-feat-19'], status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-class-greater-divine-intervention', classId: 'class-2024-cleric', name: '进阶神圣干预', englishName: 'Greater Divine Intervention', level: 20,
    summary: '使用神圣干预时可选择祈愿术；若如此做，需完成 2d4 次长休后才能再次使用。',
    description: '你能够呼唤更强大的神圣干预。当你使用神圣干预时，可以在选择法术时选择祈愿术；如果你这样做，只有在完成 2d4 次长休后才能再次使用神圣干预。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const clericRule2024: ClassRule = {
  id: 'class-2024-cleric',
  ruleset: '5e-2024',
  name: '牧师',
  englishName: 'Cleric',
  summary: '2024版神术施法者：圣职路线、引导神力与领域特化，兼顾治疗、防护与输出。',
  introduction: '从诸神国度引动力量的神术施法者：领域提供额外法术与特性，圣职路线决定偏武斗还是偏施法，按准备列表每日更换法术，治疗与防护兼具。',
  hitDie: 8,
  primaryAbilities: ['wis'],
  playStyleTags: ['spellcaster', 'support', 'durable'],
  savingThrowAbilities: ['wis', 'cha'],
  status: 'implemented',
  sourceIds,
  armorTraining: ['light', 'medium', 'shield'],
  weaponTraining: { categories: ['simple'] },
  features: clericFeatures2024,
  checkpoints: [
    {
      id: 'class-2024-cleric-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择2项牧师技能', description: '从牧师技能列表中选择2项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: CLERIC_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-cleric-divine-order-1', level: 1, step: 'timeline', kind: 'class-choice',
      title: '选择圣职', description: '选择保护者或奇术使；保护者获得军用武器与重甲受训，奇术使获得额外戏法与知识检定加值。',
      required: true, minSelections: 1, maxSelections: 1,
      optionIds: ['cleric-2024-divine-order-protector', 'cleric-2024-divine-order-thaumaturge'],
    },
    ...([4, 8, 12, 16] as const).map((level): ChoiceCheckpoint => ({
      id: `class-2024-cleric-feat-${level}`, level, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    {
      id: 'class-2024-cleric-blessed-strikes-7', level: 7, step: 'timeline', kind: 'class-choice',
      title: '选择受祝击', description: '选择神圣打击或强力施法，14 级时同一选项获得强化。',
      required: true, minSelections: 1, maxSelections: 1,
      optionIds: ['cleric-2024-blessed-strikes-divine-strike', 'cleric-2024-blessed-strikes-potent-spellcasting'],
    },
    {
      id: 'class-2024-cleric-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '19级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
  spellcasting: {
    ruleset: '5e-2024',
    mode: 'prepared',
    ability: 'wis',
    startsAtLevel: 1,
    preparedCountByLevel: CLERIC_PREPARED_COUNTS,
    cantripsKnownByLevel: CLERIC_CANTRIPS,
    maxSpellLevelByClassLevel: CLERIC_MAX_SPELL_LEVELS,
    slotsByClassLevel: CLERIC_SPELL_SLOTS,
    classSpellIds: clericClassSpellIds2024,
  },
}

export const clericSubclassFeatures2024: readonly SubclassFeature[] = [
  // ============ 生命领域 ============
  {
    id: 'cleric-2024-life-domain-spells', subclassId: 'subclass-2024-cleric-life-domain', name: '生命领域法术', englishName: 'Life Domain Spells', level: 3,
    summary: '3／5／7／9 级各获得始终准备的领域法术（援助、祝福、疗伤、复生、灵光与群体治疗）。',
    description: '你与生命领域的链接使你始终准备特定法术：3 级——援助术、祝福术、疗伤术、次等复原术；5 级——群体治愈真言、回生术；7 级——生命灵光、防死结界；9 级——高等复原术、群体疗伤术。这些法术不计入你的准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-life-disciple-of-life', subclassId: 'subclass-2024-cleric-life-domain', name: '生命门徒', englishName: 'Disciple of Life', level: 3,
    summary: '用法术位施展的治疗法术额外恢复 2＋法术位环阶生命值。',
    description: '当你消耗法术位施展一道治疗生物生命的法术时，该法术为目标额外恢复 2 + 所消耗法术位环阶的生命值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-life-preserve-life', subclassId: 'subclass-2024-cleric-life-domain', name: '维持生命', englishName: 'Preserve Life', level: 3,
    summary: '引导神力：魔法动作在 30 尺内浴血生物间分配 5×牧师等级的治疗量，至多治疗到生命上限一半。',
    description: '以一个魔法动作，你展示圣徽并消耗一次引导神力，引导等于你牧师等级五倍的治疗能量。你选择 30 尺内处于浴血状态的生物（可包括自己）并在其中分配治疗量；该特性最多将目标治疗至其生命上限的一半。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-life-blessed-healer', subclassId: 'subclass-2024-cleric-life-domain', name: '神祝医者', englishName: 'Blessed Healer', level: 6,
    summary: '用法术位治疗他人后，自己也恢复 2＋法术位环阶生命值。',
    description: '如果你用法术位施展的治疗法术为除你以外的一名或更多生物恢复了生命值，此次施法后你也立刻恢复 2 + 该法术位环阶的生命值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-life-supreme-healing', subclassId: 'subclass-2024-cleric-life-domain', name: '极效治疗', englishName: 'Supreme Healing', level: 17,
    summary: '法术或引导神力掷骰决定治疗量时，每枚骰子直接取最大值。',
    description: '当你需要用一道法术或引导神力掷一枚或多枚骰子决定恢复的生命值数值时，你无需掷骰，直接为每枚骰子取最高值（例如 2d6 直接取 12）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 光明领域 ============
  {
    id: 'cleric-2024-light-domain-spells', subclassId: 'subclass-2024-cleric-light-domain', name: '光明领域法术', englishName: 'Light Domain Spells', level: 3,
    summary: '3／5／7／9 级各获得始终准备的领域法术（火焰、揭示与净化主题）。',
    description: '你与光明领域的链接使你始终准备特定法术：3 级——燃烧之手、妖火、灼热射线、识破隐形；5 级——昼明术、火球术；7 级——秘法眼、火墙术；9 级——焰击术、探知术。这些法术不计入你的准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-light-radiance-of-the-dawn', subclassId: 'subclass-2024-cleric-light-domain', name: '黎明曙光', englishName: 'Radiance of the Dawn', level: 3,
    summary: '引导神力：魔法动作解除 30 尺光环内魔法黑暗，范围内生物体质豁免失败受 2d10＋牧师等级光耀伤害。',
    description: '以一个魔法动作，你展示圣徽并消耗一次引导神力，释放覆盖以你为源点 30 尺光环区域的闪光。区域内任何魔法黑暗（例如黑暗术）都被解除；区域内你选择的所有生物进行一次体质豁免，失败受到 2d10 + 你牧师等级的光耀伤害，成功则伤害减半。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-light-warding-flare', subclassId: 'subclass-2024-cleric-light-domain', name: '守御之光', englishName: 'Warding Flare', level: 3,
    summary: '反应：30 尺内可见生物进行攻击检定时使其具有劣势；次数＝感知调整值（至少 1），长休恢复。',
    description: '当位于你 30 尺内的一名你可见的生物进行攻击检定时，你可以用反应在该次攻击命中或失手前在其面前发出闪耀之光，迫使该次攻击检定具有劣势。使用次数等于你的感知调整值（至少 1 次），完成长休时重获全部次数。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-light-improved-warding-flare', subclassId: 'subclass-2024-cleric-light-domain', name: '精通守御之光', englishName: 'Improved Warding Flare', level: 6,
    summary: '守御之光改为短休或长休全部恢复，并可给予受攻击目标 2d6＋感知调整值临时生命。',
    description: '你在完成短休或长休后重新获得所有守御之光使用次数。此外，每当你使用守御之光时，可以给予触发该反应的攻击所指定的目标 2d6 + 你的感知调整值点临时生命值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-light-corona-of-light', subclassId: 'subclass-2024-cleric-light-domain', name: '光冕', englishName: 'Corona of Light', level: 17,
    summary: '魔法动作散发 60 尺日光 1 分钟：区域内敌人对抗黎明曙光与火焰／光耀法术的豁免具有劣势；次数＝感知调整值。',
    description: '以一个魔法动作，你让自己散发日光组成的灵光，持续 1 分钟或直至你主动解除（无需动作）。你散发半径 60 尺明亮光照与额外 30 尺微光光照；身处明亮光照中的敌人在抵抗你的黎明曙光特性以及任何造成火焰或光耀伤害的法术时，豁免检定具有劣势。使用次数等于你的感知调整值（至少 1 次），完成长休时重获全部次数。',
    kind: 'action', status: 'implemented', sourceIds,
  },

  // ============ 战争领域 ============
  {
    id: 'cleric-2024-war-guided-strike', subclassId: 'subclass-2024-cleric-war-domain', name: '导引打击', englishName: 'Guided Strike', level: 3,
    summary: '引导神力：自己或 30 尺内生物攻击失手时，使其攻击检定 +10（为他人使用时需反应）。',
    description: '当你或 30 尺内的一个生物在一次攻击检定中失手时，你可以消耗一次引导神力，使该次攻击检定获得 +10 加值，这可能使其命中。当你以该特性增益另一个生物的攻击检定时，你必须使用你的反应。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-war-domain-spells', subclassId: 'subclass-2024-cleric-war-domain', name: '战争领域法术', englishName: 'War Domain Spells', level: 3,
    summary: '3／5／7／9 级各获得始终准备的领域法术（武器强化、灵体卫士与战斗机动）。',
    description: '你与战争领域的链接使你始终准备特定法术：3 级——光导箭、虔诚护盾、魔化武器、灵体武器；5 级——十字军披风、灵体卫士；7 级——火焰护盾、行动自如；9 级——定身怪物、钢风斩。这些法术不计入你的准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-war-war-priest', subclassId: 'subclass-2024-cleric-war-domain', name: '战争祭司', englishName: 'War Priest', level: 3,
    summary: '附赠动作发动一次武器攻击或徒手打击；次数＝感知调整值（至少 1），短休或长休全部恢复。',
    description: '作为一个附赠动作，你可以发动一次武器攻击或徒手打击。使用次数等于你的感知调整值（至少 1 次），完成短休或长休后重获全部次数。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-war-war-gods-blessing', subclassId: 'subclass-2024-cleric-war-domain', name: '战神祝福', englishName: "War God's Blessing", level: 6,
    summary: '引导神力：无需法术位与专注施展虔诚护盾或灵体武器，持续 1 分钟。',
    description: '你可以使用引导神力施展虔诚护盾或灵体武器而无需消耗法术位。以该方式施展的法术无需专注，持续时间变为 1 分钟，但会在你再次施展该法术、陷入失能状态或死亡时提前结束。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-war-avatar-of-battle', subclassId: 'subclass-2024-cleric-war-domain', name: '战争化身', englishName: 'Avatar of Battle', level: 17,
    summary: '获得对钝击、穿刺与挥砍伤害的抗性。',
    description: '你获得对钝击、穿刺与挥砍伤害的抗性。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 诡术领域 ============
  {
    id: 'cleric-2024-trickery-blessing-of-the-trickster', subclassId: 'subclass-2024-cleric-trickery-domain', name: '诡术祝福', englishName: 'Blessing of the Trickster', level: 3,
    summary: '魔法动作使自身或 30 尺内自愿生物的敏捷（隐匿）检定具有优势，持续至长休或再次使用。',
    description: '以一个魔法动作，你可以选择自己或 30 尺内的一个自愿生物，使所选生物在进行敏捷（隐匿）检定时具有优势。此祝福持续至你完成一次长休或直至你再次使用该特性。',
    kind: 'action', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-trickery-invoke-duplicity', subclassId: 'subclass-2024-cleric-trickery-domain', name: '召现分身', englishName: 'Invoke Duplicity', level: 3,
    summary: '引导神力：附赠动作创造 30 尺内分身幻象 1 分钟；可以分身位置施法、近身时攻击有优势，可附赠动作移动 30 尺。',
    description: '以一个附赠动作，你可以消耗一次引导神力，创造一个完美视觉幻象并出现在你 30 尺内一个你能看见且未占据的空间。幻象无实体、不占据空间，持续 1 分钟或直至你解除（无需动作）或陷入失能状态；它能模仿你的表情与姿势。幻象存在期间：施法——你可以如同在幻象位置一般施展法术，但仍使用你自己的感官；干扰——当幻象与你在同一生物 5 尺内且该生物能看见幻象时，你对其攻击检定具有优势；转移——以一个附赠动作，你可以将幻象移动至多 30 尺，到达你 120 尺内一处可见的未占据空间。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-trickery-domain-spells', subclassId: 'subclass-2024-cleric-trickery-domain', name: '诡术领域法术', englishName: 'Trickery Domain Spells', level: 3,
    summary: '3／5／7／9 级各获得始终准备的领域法术（欺瞒、隐形与控制主题）。',
    description: '你与诡术领域的链接使你始终准备特定法术：3 级——魅惑类人、易容术、隐形术、行动无踪；5 级——催眠图纹、回避侦测；7 级——困惑术、任意门；9 级——支配类人、篡改记忆。这些法术不计入你的准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-trickery-tricksters-transposition', subclassId: 'subclass-2024-cleric-trickery-domain', name: '诡诈换位', englishName: "Trickster's Transposition", level: 6,
    summary: '使用附赠动作创造或移动分身时，可通过传送与分身交换位置。',
    description: '每当你使用附赠动作创造或移动来自召现分身的幻象时，你都可以通过传送与幻象交换位置。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'cleric-2024-trickery-improved-duplicity', subclassId: 'subclass-2024-cleric-trickery-domain', name: '精通分身', englishName: 'Improved Duplicity', level: 17,
    summary: '分身使你和盟友对 5 尺内生物的攻击具有优势；幻象消失时为你或 5 尺内一名生物恢复等于牧师等级的生命。',
    description: '召现分身创造的幻象获得强化：共享干扰——你和你的盟友对位于幻象 5 尺内的生物进行攻击检定时具有优势；治愈幻象——当幻象消失时，你或你选择的 5 尺内一名生物恢复等同于你牧师等级的生命值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const clericSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-cleric-life-domain',
    classId: 'class-2024-cleric',
    ruleset: '5e-2024',
    name: '生命领域',
    englishName: 'Life Domain',
    selectionLevel: 3,
    summary: '专精治疗与危急救援：强化治疗量、引导神力分配生命、治疗他人时自愈并让治疗骰取满值。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: clericSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-cleric-life-domain'),
    alwaysPreparedSpellIdsByLevel: LIFE_DOMAIN_SPELLS,
  },
  {
    id: 'subclass-2024-cleric-light-domain',
    classId: 'class-2024-cleric',
    ruleset: '5e-2024',
    name: '光明领域',
    englishName: 'Light Domain',
    selectionLevel: 3,
    summary: '以火焰与光耀压制敌人：反应干扰攻击、引导神力清除黑暗并爆发光耀伤害，高等级削弱敌人抗性。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: clericSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-cleric-light-domain'),
    alwaysPreparedSpellIdsByLevel: LIGHT_DOMAIN_SPELLS,
  },
  {
    id: 'subclass-2024-cleric-war-domain',
    classId: 'class-2024-cleric',
    ruleset: '5e-2024',
    name: '战争领域',
    englishName: 'War Domain',
    selectionLevel: 3,
    summary: '把牧师转为近身战斗支援者：附赠动作攻击、引导神力保证命中、无需专注的引导法术与武器抗性。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: clericSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-cleric-war-domain'),
    alwaysPreparedSpellIdsByLevel: WAR_DOMAIN_SPELLS,
  },
  {
    id: 'subclass-2024-cleric-trickery-domain',
    classId: 'class-2024-cleric',
    ruleset: '5e-2024',
    name: '诡术领域',
    englishName: 'Trickery Domain',
    selectionLevel: 3,
    summary: '以潜行祝福与幻象分身改变战场：分身可施法与支援，中高等级提供位置交换、优势与治疗。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: clericSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-cleric-trickery-domain'),
    alwaysPreparedSpellIdsByLevel: TRICKERY_DOMAIN_SPELLS,
  },
]
