import type { ChoiceCheckpoint, ClassFeature, ClassRule, RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'

/**
 * 破解奥秘：灵能（UA）灵能使职业（以灵能 II 为有效期次）。
 * 来源 `source-2024-ua-psion`，默认关闭、状态 selectable；与 2014 内容完全隔离。
 */

const sourceIds = ['source-2024-ua-psion'] as const

/** 灵能使法术列表（141 条：既有 124 条 + 灵能 UA 新增／重印 17 条）。 */
const PSION_CLASS_SPELL_IDS: readonly string[] = [
  'spell-2024-blade-ward', 'spell-2024-dancing-lights', 'spell-2024-friends', 'spell-2024-light',
  'spell-2024-mage-hand', 'spell-2024-mending', 'spell-2024-message', 'spell-2024-mind-sliver',
  'spell-2024-minor-illusion', 'spell-2024-prestidigitation', 'spell-2024-true-strike', 'spell-2024-animal-friendship',
  'spell-2024-charm-person', 'spell-2024-command', 'spell-2024-comprehend-languages', 'spell-2024-detect-magic',
  'spell-2024-dissonant-whispers', 'spell-2024-feather-fall', 'spell-2024-identify', 'spell-2024-jump',
  'spell-2024-longstrider', 'spell-2024-mage-armor', 'spell-2024-sanctuary', 'spell-2024-shield',
  'spell-2024-silent-image', 'spell-2024-sleep', 'spell-2024-speak-with-animals', 'spell-2024-tasha-s-hideous-laughter',
  'spell-2024-tenser-s-floating-disk', 'spell-2024-thunderwave', 'spell-2024-animal-messenger', 'spell-2024-blindness-deafness',
  'spell-2024-calm-emotions', 'spell-2024-crown-of-madness', 'spell-2024-detect-thoughts', 'spell-2024-enhance-ability',
  'spell-2024-enlarge-reduce', 'spell-2024-enthrall', 'spell-2024-heat-metal', 'spell-2024-hold-person',
  'spell-2024-invisibility', 'spell-2024-knock', 'spell-2024-locate-animals-or-plants', 'spell-2024-locate-object',
  'spell-2024-magic-mouth', 'spell-2024-mind-spike', 'spell-2024-mirror-image', 'spell-2024-phantasmal-force',
  'spell-2024-see-invisibility', 'spell-2024-shatter', 'spell-2024-silence', 'spell-2024-suggestion',
  'spell-2024-zone-of-truth', 'spell-2024-animate-dead', 'spell-2024-bestow-curse', 'spell-2024-clairvoyance',
  'spell-2024-dispel-magic', 'spell-2024-fear', 'spell-2024-hypnotic-pattern', 'spell-2024-major-image',
  'spell-2024-nondetection', 'spell-2024-sending', 'spell-2024-tongues', 'spell-2024-arcane-eye',
  'spell-2024-banishment', 'spell-2024-charm-monster', 'spell-2024-compulsion', 'spell-2024-confusion',
  'spell-2024-dimension-door', 'spell-2024-freedom-of-movement', 'spell-2024-greater-invisibility', 'spell-2024-hallucinatory-terrain',
  'spell-2024-locate-creature', 'spell-2024-phantasmal-killer', 'spell-2024-polymorph', 'spell-2024-summon-aberration',
  'spell-2024-animate-objects', 'spell-2024-awaken', 'spell-2024-contact-other-plane', 'spell-2024-dominate-person',
  'spell-2024-dream', 'spell-2024-geas', 'spell-2024-hold-monster', 'spell-2024-legend-lore',
  'spell-2024-mislead', 'spell-2024-modify-memory', 'spell-2024-rary-s-telepathic-bond', 'spell-2024-seeming',
  'spell-2024-synaptic-static', 'spell-2024-telekinesis', 'spell-2024-teleportation-circle', 'spell-2024-blade-barrier',
  'spell-2024-disintegrate', 'spell-2024-eyebite', 'spell-2024-find-the-path', 'spell-2024-mass-suggestion',
  'spell-2024-move-earth', 'spell-2024-otto-s-irresistible-dance', 'spell-2024-programmed-illusion', 'spell-2024-true-seeing',
  'spell-2024-etherealness', 'spell-2024-forcecage', 'spell-2024-mirage-arcane', 'spell-2024-plane-shift',
  'spell-2024-power-word-fortify', 'spell-2024-project-image', 'spell-2024-reverse-gravity', 'spell-2024-teleport',
  'spell-2024-antipathy-sympathy', 'spell-2024-befuddlement', 'spell-2024-dominate-monster', 'spell-2024-glibness',
  'spell-2024-maze', 'spell-2024-mind-blank', 'spell-2024-power-word-stun', 'spell-2024-telepathy',
  'spell-2024-astral-projection', 'spell-2024-foresight', 'spell-2024-power-word-heal', 'spell-2024-power-word-kill',
  'spell-2024-shapechange', 'spell-2024-time-stop', 'spell-2024-weird',
  'spell-2024-scrying',
  'spell-2024-ua-telekinetic-fling', 'spell-2024-ua-life-siphon', 'spell-2024-ua-ectoplasmic-trail', 'spell-2024-ua-ego-whip',
  'spell-2024-ua-tashas-mind-whip', 'spell-2024-ua-bleeding-darkness', 'spell-2024-ua-enemies-abound', 'spell-2024-ua-intellect-fortress',
  'spell-2024-ua-summon-astral-entity', 'spell-2024-ua-telekinetic-crush', 'spell-2024-ua-life-inversion-field', 'spell-2024-ua-raulothims-psychic-lance',
  'spell-2024-ua-mental-prison', 'spell-2024-ua-psionic-blast', 'spell-2024-ua-thought-form', 'spell-2024-ua-abi-dalzims-horrid-wilting',
  'spell-2024-ua-psychic-scream',
]

const PSION_SKILL_OPTION_IDS = ['skill-arcana', 'skill-insight', 'skill-intimidation', 'skill-investigation', 'skill-medicine', 'skill-perception', 'skill-persuasion'] as const
const PSION_DISCIPLINE_IDS = [
  'psion-2024-discipline-biofeedback',
  'psion-2024-discipline-bolstering-precognition',
  'psion-2024-discipline-destructive-thought',
  'psion-2024-discipline-devilish-tongue',
  'psion-2024-discipline-expanded-awareness',
  'psion-2024-discipline-id-insinuation',
  'psion-2024-discipline-inerrant-aim',
  'psion-2024-discipline-observant-mind',
  'psion-2024-discipline-psionic-backlash',
  'psion-2024-discipline-psionic-guards',
  'psion-2024-discipline-sharpened-mind',
] as const

const PSION_SPELL_SLOTS: readonly (readonly number[])[] = [
  [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
]
const PSION_MAX_SPELL_LEVELS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 9] as const
const PSION_PREPARED_COUNTS = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 17, 18, 19, 20, 21, 22] as const
const PSION_CANTRIPS = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] as const
const PSION_DICE_COUNTS = [4, 4, 4, 4, 6, 6, 6, 6, 8, 8, 8, 8, 10, 10, 10, 10, 12, 12, 12, 12] as const
const PSION_DICE_FACES = ['d6', 'd6', 'd6', 'd6', 'd8', 'd8', 'd8', 'd8', 'd8', 'd8', 'd10', 'd10', 'd10', 'd10', 'd10', 'd10', 'd12', 'd12', 'd12', 'd12'] as const

export const psionOptions2024: readonly RuleOption[] = [
  { id: 'psion-2024-discipline-biofeedback', name: '生物反馈', englishName: 'Biofeedback', description: '施展死灵或变化灵能使法术时，消耗至多智力调整值枚灵能骰，获得骰值＋智力调整值（至少 1）临时生命。', status: 'selectable', sourceIds },
  { id: 'psion-2024-discipline-bolstering-precognition', name: '强化预知', englishName: 'Bolstering Precognition', description: '施展防护或预言灵能使法术时消耗一枚灵能骰，令 60 尺内可见生物（可为自己）下次 d20 检定获得骰值加值（至你下回合结束）。', status: 'selectable', sourceIds },
  { id: 'psion-2024-discipline-destructive-thought', name: '破坏思维', englishName: 'Destructive Thought', description: '施展咒法或塑能灵能使法术且可见生物豁免成功时，消耗至多智力调整值枚灵能骰，该生物受骰值＋智力调整值（至少 1）心灵伤害。', status: 'selectable', sourceIds },
  { id: 'psion-2024-discipline-devilish-tongue', name: '巧舌如魔', englishName: 'Devilish Tongue', description: '影响动作中消耗并投掷一枚灵能骰，将骰值加入该属性检定；仅当检定成功时消耗。', status: 'selectable', sourceIds },
  { id: 'psion-2024-discipline-expanded-awareness', name: '延伸意识', englishName: 'Expanded Awareness', description: '搜索动作中消耗并投掷一枚灵能骰，将骰值加入该属性检定；仅当检定成功时消耗。', status: 'selectable', sourceIds },
  { id: 'psion-2024-discipline-id-insinuation', name: '本我暗示', englishName: 'Id Insinuation', description: '施展惑控或幻术灵能使法术迫使生物豁免时，消耗并投掷一枚灵能骰，一个可见目标本次豁免减去骰值一半（向下取整）。', status: 'selectable', sourceIds },
  { id: 'psion-2024-discipline-inerrant-aim', name: '弹无虚发', englishName: 'Inerrant Aim', description: '攻击检定失手时投掷一枚灵能骰并加入攻击检定；仅当攻击因此命中时消耗。', status: 'selectable', sourceIds },
  { id: 'psion-2024-discipline-observant-mind', name: '观察思维', englishName: 'Observant Mind', description: '研究动作中投掷一枚灵能骰并把骰值加入该属性检定；仅当检定成功时消耗。', status: 'selectable', sourceIds },
  { id: 'psion-2024-discipline-psionic-backlash', name: '灵能反射', englishName: 'Psionic Backlash', description: '可见生物命中你时，反应消耗并投掷一枚灵能骰，伤害减去骰值＋智力调整值（至少 2）；可迫使攻击者感知豁免，失败受两枚灵能骰总骰值心灵伤害。', status: 'selectable', sourceIds },
  { id: 'psion-2024-discipline-psionic-guards', name: '灵能护卫', englishName: 'Psionic Guards', description: '回合开始消耗一枚灵能骰：免疫魅惑与恐慌、智力豁免优势至你下回合开始；本回合仍可使用另一种才赋。', status: 'selectable', sourceIds },
  { id: 'psion-2024-discipline-sharpened-mind', name: '明晰思维', englishName: 'Sharpened Mind', description: '回合开始消耗一枚灵能骰并记录骰值 1 分钟：伤害忽视心灵抗性（迂心绕灵）；每回合一次可用记录值替换一枚心灵伤害骰（攻击模式）；本回合仍可使用另一种才赋。', status: 'selectable', sourceIds },
]

const psionFeaturesList: readonly ClassFeature[] = [
  {
    id: 'psion-2024-spellcasting', classId: 'class-2024-ua-psion', name: '施法', englishName: 'Spellcasting', level: 1,
    summary: '智力准备施法；灵能施法无需言语与材料成分（有价／消耗材料除外）；升级可替换一道准备法术。',
    description: '你以心灵之力引导魔法（施法规则见《玩家手册》）。你知晓两道灵能使戏法，4 级与 10 级各再习得一道。你以智力作为施法属性，按等级表准备 1 环及以上法术；每当你获得灵能使等级时可替换一道准备法术。当你施展灵能使法术时，该法术不需要言语或材料成分，除非法术材料会被消耗或有特定价格。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-psionic-power', classId: 'class-2024-ua-psion', name: '灵能力量', englishName: 'Psionic Power', level: 1,
    summary: '获得灵能骰池（4d6→12d12）；短休恢复 1 枚、长休全部恢复；提供念力驱使与心灵连接。',
    description: '你的灵能骰数量与骰面按等级表：1—4 级 4d6，5—8 级 6d8，9—10 级 8d8，11—12 级 8d10，13—16 级 10d10，17—20 级 12d12。你在完成短休时恢复一枚灵能骰，长休时恢复全部。灵能骰可用于本职业特性与才赋；需要豁免时 DC＝你的法术豁免 DC。起始两项用法：念力驱使——附赠动作，30 尺内可见的不超过大型生物力量豁免失败则被你推拉 5 尺；你可额外投一枚灵能骰，移动距离改为骰值 ×5（仅豁免失败时消耗）。心灵连接——你具有 30 尺心灵感应；附赠动作投一枚灵能骰，使心灵感应距离变为骰值 ×10 持续 1 小时；每次长休后首次使用不消耗骰。',
    kind: 'passive', status: 'selectable', sourceIds,
    dicePool: { diceByLevel: PSION_DICE_COUNTS, dieByLevel: PSION_DICE_FACES, recovery: 'short-rest', shortRestRecovery: 1, note: '短休恢复 1 枚，长休全部恢复' },
  },
  {
    id: 'psion-2024-subtle-telekinesis', classId: 'class-2024-ua-psion', name: '精妙念力', englishName: 'Subtle Telekinesis', level: 1,
    summary: '知晓法师之手，可无言语成分施展且幽灵手隐形。',
    description: '你知晓戏法法师之手。你可以无需言语成分施展它，并可在施展时令幽灵手隐形。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-discipline-2', classId: 'class-2024-ua-psion', name: '灵能才赋', englishName: 'Psionic Discipline', level: 2,
    summary: '选择两项灵能才赋；5／10／13／17 级各再获得一项，升级可替换。每回合通常只能使用一种才赋。',
    description: '你获得两项由你选择的灵能才赋。每回合你通常只能使用一种才赋（标明例外者除外）。每当获得灵能使等级时可替换一道才赋；5、10、13、17 级各再获得一项。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['psion-2024-disciplines-2'], status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-subclass', classId: 'class-2024-ua-psion', name: '灵能使子职', englishName: 'Psion Subclass', level: 3,
    summary: '选择蜕变使、裂空使、念动使或传心使。',
    description: '你获得一项灵能使子职，并在达到对应等级时获得其特性。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-ua-psion-subclass-3'], status: 'selectable', sourceIds,
  },
  ...[4, 8, 12, 16].map((level): ClassFeature => ({
    id: `psion-2024-feat-${level}`, classId: 'class-2024-ua-psion', name: '属性值提升', englishName: 'Ability Score Improvement', level,
    summary: '选择属性值提升专长或其他满足前置的专长。',
    description: '你获得属性值提升专长，或另一个你满足条件的专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: [`psion-2024-feat-${level}`], status: 'selectable', sourceIds,
  })),
  {
    id: 'psion-2024-restoration', classId: 'class-2024-ua-psion', name: '灵能复原', englishName: 'Psionic Restoration', level: 5,
    summary: '花 1 分钟冥想重获全部已消耗灵能骰；每次长休 1 次。',
    description: '你能够花 1 分钟冥想并集中精神；冥想结束后，你重获全部已消耗的灵能骰。此特性每次长休后恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long-rest', note: '冥想 1 分钟重获全部灵能骰' },
  },
  {
    id: 'psion-2024-surge', classId: 'class-2024-ua-psion', name: '灵能浪潮', englishName: 'Psionic Surge', level: 7,
    summary: '掷先攻时可消耗一枚生命骰回复一次灵能模式；使用灵能骰后可消耗生命骰把其中的 1／2／3 改为 4。',
    description: '当你掷先攻时，你可以消耗一枚生命骰并回复一次灵能模式的使用次数。此外，当你使用一枚或更多灵能骰时，你可以消耗一枚生命骰，并将这些灵能骰中的所有 1、2、3 结果改为 4。（灵能模式在灵能 II 中已移除；本特性按现版本以“重掷灵能骰”为主。）',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-reserves', classId: 'class-2024-ua-psion', name: '灵能储备', englishName: 'Psionic Reserves', level: 18,
    summary: '掷先攻时若灵能骰少于 4 枚，恢复至 4 枚。',
    description: '当你掷先攻时，若你的灵能骰数量少于 4 枚，你恢复至 4 枚。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-epic-boon', classId: 'class-2024-ua-psion', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长或其他满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一个你满足条件的专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['psion-2024-feat-19'], status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-enkindled', classId: 'class-2024-ua-psion', name: '命源过载', englishName: 'Enkindled Lifeforce', level: 20,
    summary: '每回合一次，使用灵能骰时可消耗 1—2 枚生命骰，每枚额外投一枚灵能骰并把骰值加入最终结果（额外骰不消耗）。',
    description: '每回合一次，当你消耗一枚灵能骰并将其应用于灵能使特性或灵能才赋时，你可以消耗一枚或两枚生命骰；每消耗一枚生命骰，额外投一枚灵能骰并将骰值加入最终结果。此特性额外投掷的灵能骰不会被消耗。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
]

export const psionFeatures2024: readonly ClassFeature[] = [...psionFeaturesList].sort((left, right) => left.level - right.level)

export const psionRule2024: ClassRule = {
  id: 'class-2024-ua-psion',
  ruleset: '5e-2024',
  name: '灵能使',
  englishName: 'Psion',
  summary: '破解奥秘（UA）新职业：以灵能骰驱动法术与才赋的智力施法者。',
  introduction: '以心灵之力编织魔法的智力施法者：灵能骰为职业特性与才赋供能，灵能施法无需言语与材料成分；子职覆盖变形、传送、念力与传心四条路线，适合喜欢掌控心灵与空间议题的玩家。',
  hitDie: 6,
  primaryAbilities: ['int'],
  playStyleTags: ['spellcaster', 'control', 'utility'],
  savingThrowAbilities: ['int', 'wis'],
  status: 'selectable',
  sourceIds,
  armorTraining: [],
  weaponTraining: { categories: ['simple'] },
  spellcasting: {
    ruleset: '5e-2024',
    mode: 'prepared',
    ability: 'int',
    startsAtLevel: 1,
    preparedCountByLevel: PSION_PREPARED_COUNTS,
    cantripsKnownByLevel: PSION_CANTRIPS,
    maxSpellLevelByClassLevel: PSION_MAX_SPELL_LEVELS,
    slotsByClassLevel: PSION_SPELL_SLOTS,
    classSpellIds: PSION_CLASS_SPELL_IDS,
  },
  features: psionFeatures2024,
  checkpoints: [
    {
      id: 'psion-2024-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择 2 项灵能使技能', description: '从奥秘、洞悉、威吓、调查、医药、察觉、游说中选择 2 项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: [...PSION_SKILL_OPTION_IDS],
    },
    {
      id: 'psion-2024-disciplines-2', level: 2, step: 'timeline', kind: 'class-choice',
      title: '选择 2 项灵能才赋', description: '从灵能才赋选项中选择 2 项；升级时可替换一项已知才赋。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: [...PSION_DISCIPLINE_IDS], uniqueGroup: 'psion-disciplines',
    },
    ...[5, 10, 13, 17].map((level): ChoiceCheckpoint => ({
      id: `psion-2024-disciplines-${level}`, level, step: 'timeline' as const, kind: 'class-choice' as const,
      title: '选择 1 项灵能才赋', description: '再习得一项灵能才赋；升级时可替换一项已知才赋。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [...PSION_DISCIPLINE_IDS], uniqueGroup: 'psion-disciplines',
    })),
    ...[4, 8, 12, 16].map((level): ChoiceCheckpoint => ({
      id: `psion-2024-feat-${level}`, level, step: 'timeline' as const, kind: 'ability-improvement' as const,
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    {
      id: 'psion-2024-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '传奇恩惠', description: '19 级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
}

export const psionSubclassFeatures2024: readonly SubclassFeature[] = [
  // ============ 蜕变使 ============
  {
    id: 'psion-2024-metamorph-spells', subclassId: 'subclass-2024-ua-psion-metamorph', name: '蜕变使法术', englishName: 'Metamorph Spells', level: 3,
    summary: '3／5／7／9 级按蜕变使法术表始终准备法术。',
    description: '达到对应灵能使等级时，你始终准备蜕变使法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-metamorph-mutable', subclassId: 'subclass-2024-ua-psion-metamorph', name: '可变形态', englishName: 'Mutable Form', level: 3,
    summary: '附赠动作消耗灵能骰 1 分钟：临时生命＝骰值＋智力调整值，触及 +5 尺、速度 +5 尺、触碰法术射程可改 10 尺。',
    description: '以一个附赠动作消耗一枚灵能骰，灵能性地伸长肢体 1 分钟：投掷该骰，获得等于骰值＋智力调整值的临时生命；期间触及 +5 尺、速度 +5 尺，施展触碰且施法时间为动作的法术时射程可改为 10 尺。6 级起可额外消耗一枚灵能骰获得生体守御（AC +2）或强效疗愈（治疗法术加一枚灵能骰值）。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest', note: '消耗灵能骰使用' },
  },
  {
    id: 'psion-2024-metamorph-weapons', subclassId: 'subclass-2024-ua-psion-metamorph', name: '生体武器', englishName: 'Organic Weapons', level: 3,
    summary: '把空手塑成白骨利刃（1d8 穿刺、灵巧）、血肉巨锤（1d10 钝击、命中后力/体豁免劣势）或脏腑射弹（1d6 强酸、30/90 尺）；可用智力攻击。',
    description: '每当你进行攻击动作或借机攻击时，你可以将空着的一只手转化为一种生体武器（白骨利刃、血肉巨锤或脏腑射弹），直到你以魔法动作更换、陷入昏迷或变回原形。用其攻击时可使用智力调整值代替力量或敏捷，并可改为造成心灵伤害。白骨利刃：简易近战、灵巧、1d8 穿刺，若目标 5 尺内有未失能盟友则攻击优势；血肉巨锤：简易近战、1d10 钝击，命中后目标下回合开始前力量或体质豁免劣势；脏腑射弹：简易远程、30/90 尺、1d6 强酸，每回合一次命中追加 1d6 强酸。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-metamorph-extra-attack', subclassId: 'subclass-2024-ua-psion-metamorph', name: '额外攻击', englishName: 'Extra Attack', level: 6,
    summary: '攻击动作可攻击两次；其中一次可替换为动作施法的灵能使戏法。',
    description: '你在自己回合内执行攻击动作时可以发动两次攻击。此外，你可以将其中一次攻击替换为施展一道施法时间为动作的灵能使戏法。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-metamorph-flesh-weaver', subclassId: 'subclass-2024-ua-psion-metamorph', name: '血肉织者', englishName: 'Flesh Weaver', level: 6,
    summary: '可变形态期间可额外获得生体守御（AC+2）或强效疗愈（治疗法术加一枚灵能骰值）。',
    description: '你使用可变形态时可以额外消耗一枚灵能骰，在特性激活期间获得：生体守御——AC +2；强效疗愈——用法术位施展治疗法术时消耗并投掷一枚灵能骰，把骰值加入恢复总量。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-metamorph-improved', subclassId: 'subclass-2024-ua-psion-metamorph', name: '进阶可变形态', englishName: 'Improved Mutable Form', level: 10,
    summary: '可变形态延长至 10 分钟，并选择硬化表皮／高等奔行／非凡灵敏之一。',
    description: '可变形态持续时间延长至 10 分钟，且你获得由你选择的一项增益：硬化表皮——维持专注的体质豁免优势，并获得强酸／钝击／寒冷／火焰／穿刺／毒素／挥砍／雷鸣之一抗性；高等奔行——未着甲时附赠动作疾走，并获得等同速度的攀爬与游泳速度；非凡灵敏——AC +1，可穿过 1 寸宽缝隙，并可用 5 尺移动力逃脱非魔法束缚或结束受擒。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-metamorph-life-bending', subclassId: 'subclass-2024-ua-psion-metamorph', name: '曲命武器', englishName: 'Life-Bending Weapons', level: 14,
    summary: '生体武器命中时投灵能骰追加暗蚀（不消耗）；或消耗灵能骰追加暗蚀并治疗 10 尺内所选生物（每回合一次）。',
    description: '你用生体武器命中目标时，投掷一枚灵能骰，目标额外受到骰值的暗蚀伤害，此投掷不消耗该骰。此外，命中时你可以改为消耗并投掷一枚灵能骰：目标额外受骰值暗蚀，同时源自你 10 尺光环内每名你选择的生物恢复等于骰值＋智力调整值的生命值。此替代用法每回合只能使用一次。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 裂空使 ============
  {
    id: 'psion-2024-psi-warper-spells', subclassId: 'subclass-2024-ua-psion-psi-warper', name: '裂空使法术', englishName: 'Psi Warper Spells', level: 3,
    summary: '3／5／7／9 级按裂空使法术表始终准备法术。',
    description: '达到对应灵能使等级时，你始终准备裂空使法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-psi-warper-teleport', subclassId: 'subclass-2024-ua-psion-psi-warper', name: '瞬间移动', englishName: 'Teleportation', level: 3,
    summary: '免费施展迷踪步一次（长休恢复）；可消耗一枚灵能骰重置使用权。',
    description: '你可以无需法术位施展迷踪步一次，长休后恢复；你也可以消耗一枚灵能骰（无需动作）重置该使用权。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long-rest', note: '可消耗灵能骰重置' },
  },
  {
    id: 'psion-2024-psi-warper-propel', subclassId: 'subclass-2024-ua-psion-psi-warper', name: '裂曲推进', englishName: 'Warp Propel', level: 3,
    summary: '念力驱使豁免失败时，可改为把目标传送至 30 尺内与你齐平的未占据空间。',
    description: '当一个目标在对抗你念力驱使的豁免中失败时，你可以改为将其传送到你 30 尺内一处与你齐平的未占据空间，而非推拉。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-psi-warper-space', subclassId: 'subclass-2024-ua-psion-psi-warper', name: '裂曲空间', englishName: 'Warp Space', level: 6,
    summary: '施展粉碎音波时可消耗灵能骰把半径改为 20 尺；失败生物被拉向球心。',
    description: '当你施展粉碎音波时，你可以消耗一枚灵能骰修改该法术：半径变为 20 尺；豁免失败的生物被向着球状区域中心直线拉近，直至最近的未占据空间。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-psi-warper-combat', subclassId: 'subclass-2024-ua-psion-psi-warper', name: '传送战法', englishName: 'Teleporter Combat', level: 6,
    summary: '施展迷踪步后，作为同一附赠动作可立即施展一道动作施法的灵能使戏法。',
    description: '在你施展迷踪步之后，作为该附赠动作的一部分，你可以立即施展一道施法时间为动作的灵能使戏法。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-psi-warper-duplicitous', subclassId: 'subclass-2024-ua-psion-psi-warper', name: '诡谲易位', englishName: 'Duplicitous Target', level: 10,
    summary: '可见生物攻击你时，反应消耗灵能骰与 30 尺内自愿生物互换位置，攻击改为以其为目标。',
    description: '当一个你可见的生物对你发动攻击检定时，你可以用一个反应消耗一枚灵能骰，并选择你 30 尺内一名你可见、未失能的自愿生物；你与该生物传送互换位置，该次攻击的目标随即变为互换后的生物。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-psi-warper-mass', subclassId: 'subclass-2024-ua-psion-psi-warper', name: '群体瞬间移动', englishName: 'Mass Teleportation', level: 14,
    summary: '魔法动作消耗 4 枚灵能骰，把至多智力调整值名 30 尺内生物传送至 150 尺内可见点；非自愿需感知豁免。',
    description: '以一个魔法动作，你消耗 4 枚灵能骰，选择 30 尺内至多等于你智力调整值（至少 1 名）的非巨型生物，将其传送至你能看见的 150 尺内一点。非自愿生物必须通过一次对抗你法术豁免 DC 的感知豁免才能免受影响。',
    kind: 'action', status: 'selectable', sourceIds,
  },

  // ============ 念动使 ============
  {
    id: 'psion-2024-psykinetic-spells', subclassId: 'subclass-2024-ua-psion-psykinetic', name: '念动使法术', englishName: 'Psykinetic Spells', level: 3,
    summary: '3／5／7／9 级按念动使法术表始终准备法术。',
    description: '达到对应灵能使等级时，你始终准备念动使法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-psykinetic-telekinesis', subclassId: 'subclass-2024-ua-psion-psykinetic', name: '强化念力', englishName: 'Stronger Telekinesis', level: 3,
    summary: '法师之手射程 +30 尺，可承载至多 20 磅。',
    description: '当你施展法师之手时，其施法距离增加 30 尺，且该法师之手可以承载至多 20 磅重。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-psykinetic-techniques', subclassId: 'subclass-2024-ua-psion-psykinetic', name: '念力技巧', englishName: 'Telekinetic Techniques', level: 3,
    summary: '念力驱使可掷 1d4 代替消耗灵能骰；目标豁免失败时可施加提速或迷惘。',
    description: '当你使用念力驱使时，你可以掷 1d4 并使用掷骰结果而非消耗灵能骰。此外，当目标在对抗念力驱使的豁免中失败时，你可以额外施加：提速——目标速度 +10 尺直至你下回合开始；迷惘——目标下一次攻击检定或属性检定具有劣势（以 CHM 正文为准）。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-psykinetic-trance', subclassId: 'subclass-2024-ua-psion-psykinetic', name: '毁灭迷狂', englishName: 'Destructive Trance', level: 6,
    summary: '回合开始消耗灵能骰进入迷狂 10 分钟：20 尺飞行与悬浮；法术伤害可加一枚灵能骰（不额外消耗）。',
    description: '在你回合开始时，你可以消耗一枚灵能骰进入毁灭迷狂 10 分钟：获得 20 尺飞行速度并可悬浮；当你施展消耗法术位的灵能使法术时，你可以投掷一枚灵能骰并把结果加入该法术的一次伤害掷骰，此投掷不额外消耗灵能骰。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-psykinetic-rebounding', subclassId: 'subclass-2024-ua-psion-psykinetic', name: '反弹力场', englishName: 'Rebounding Field', level: 6,
    summary: '以护盾术使攻击失手时，消耗灵能骰反弹：攻击者敏捷豁免失败受力场伤害（骰值＋智力调整值），成功减半。',
    description: '当你因被一次攻击命中而施展护盾术并使该攻击失手时，你可以消耗一枚灵能骰将力场反弹给攻击者：攻击者进行敏捷豁免，失败受到骰值＋智力调整值的力场伤害，成功减半。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-psykinetic-crush', subclassId: 'subclass-2024-ua-psion-psykinetic', name: '强化念力碾压', englishName: 'Enhanced Telekinetic Crush', level: 10,
    summary: '施展念力碾压时可消耗灵能骰：无论豁免成败目标速度减半；骰值加入一次伤害掷骰。',
    description: '当你施展念力碾压时，你可以消耗一枚灵能骰增强该法术：无论生物对抗该法术的豁免成功与否，其速度都会减半直至你下回合开始；你还可以投掷被消耗的灵能骰并把结果加入该法术的一次伤害掷骰。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-psykinetic-heightened', subclassId: 'subclass-2024-ua-psion-psykinetic', name: '升阶心灵遥控', englishName: 'Heightened Telekinesis', level: 14,
    summary: '可消耗 4 枚灵能骰代替法术位施展心灵遥控（可修改为无需专注、持续 1 分钟、可作用于超巨型目标）。',
    description: '你可以通过消耗 4 枚灵能骰而非法术位施展心灵遥控。以此方式施展时，你可以修改该法术使其无需专注：持续时间变为 1 分钟，且能够以超巨型生物和物件为目标。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 传心使 ============
  {
    id: 'psion-2024-telepath-infiltrator', subclassId: 'subclass-2024-ua-psion-telepath', name: '心智渗透', englishName: 'Mind Infiltrator', level: 3,
    summary: '施展侦测思想时可花一枚灵能骰使其免成分与专注；读心失败的目标不会察觉被窥探。',
    description: '当你施展侦测思想时，你可以花费一枚灵能骰调整该法术，使其无需法术成分或专注；使用其阅读思想选项且目标感知豁免失败时，目标不会知道你正在窥探其心灵。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-telepath-spells', subclassId: 'subclass-2024-ua-psion-telepath', name: '传心使法术', englishName: 'Telepath Spells', level: 3,
    summary: '3／5／7／9 级按传心使法术表始终准备法术。',
    description: '达到对应灵能使等级时，你始终准备传心使法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-telepath-distraction', subclassId: 'subclass-2024-ua-psion-telepath', name: '信号干扰', englishName: 'Telepathic Distraction', level: 3,
    summary: '心灵感应范围内生物攻击命中时，反应投灵能骰减去攻击检定；仅在因此失手时消耗。',
    description: '在你的心灵感应范围内，当有生物的攻击检定命中时，你可以用一个反应投掷一枚灵能骰，将该次攻击检定减去骰值（可能导致失手）；只有目标确实因此失手时，该灵能骰才被消耗。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-telepath-bulwark', subclassId: 'subclass-2024-ua-psion-telepath', name: '强固心智', englishName: 'Bulwark Mind', level: 6,
    summary: '回合开始消耗灵能骰进入坚守 10 分钟：心灵抗性；智力／感知／魅力豁免可加一枚灵能骰（不消耗）。',
    description: '在你回合开始时，你可以消耗一枚灵能骰进入坚守模式 10 分钟：获得心灵伤害抗性；每当你进行智力、感知或魅力豁免检定时，你可以投掷一枚灵能骰并把骰值加入该豁免（此投掷不消耗灵能骰）。失能时无法使用该增益。6 级同时获得 60 尺心灵感应与戏法伤害加智力调整值。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-telepath-potent', subclassId: 'subclass-2024-ua-psion-telepath', name: '思维潜能', englishName: 'Potent Thoughts', level: 6,
    summary: '心灵感应扩展至 60 尺；灵能使戏法伤害加入智力调整值。',
    description: '你拥有 60 尺范围的心灵感应。此外，你在使用任何灵能使戏法造成的伤害中加入你的智力调整值。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-telepath-bolstering', subclassId: 'subclass-2024-ua-psion-telepath', name: '心感援护', englishName: 'Telepathic Bolstering', level: 10,
    summary: '心灵感应范围内生物检定失败或攻击失手时，反应花费灵能骰加入 d20；仅在转为成功／命中时消耗。',
    description: '当你或你心灵感应范围内一个你可见的生物在一次属性检定中失败或在一次攻击检定中失手时，你可以用一个反应花费一枚灵能骰，将其骰值加入该次 d20（可能使检定成功或攻击命中）；只有在检定成功或攻击命中时，该灵能骰才被消耗。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },
  {
    id: 'psion-2024-telepath-scramble', subclassId: 'subclass-2024-ua-psion-telepath', name: '扰乱心智', englishName: 'Scramble Minds', level: 14,
    summary: '可消耗 4 枚灵能骰代替法术位施展困惑术（半径 30 尺、可令一个目标自动成功、可直接指定行为）。',
    description: '你可以消耗 4 枚灵能骰代替法术位施展困惑术。以此方式施展时，你可以调整该法术：球状区域半径变为 30 尺；选择区域内一个你可见生物使其对抗该法术的豁免自动成功；受影响生物在区域内开始回合时，你可以直接从法术表格中选择其本回合行为而非让其掷骰决定。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
]

const psionFeaturesOf = (subclassId: string): readonly SubclassFeature[] =>
  psionSubclassFeatures2024.filter((feature) => feature.subclassId === subclassId)

export const psionSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-ua-psion-metamorph', classId: 'class-2024-ua-psion', ruleset: '5e-2024', name: '蜕变使', englishName: 'Metamorph', selectionLevel: 3,
    summary: '以灵能重塑血肉：可变形态、生体武器、额外攻击、进阶可变形态与曲命武器。',
    status: 'selectable', availability: 'player', sourceIds,
    features: psionFeaturesOf('subclass-2024-ua-psion-metamorph'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-cure-wounds', 'spell-2024-inflict-wounds', 'spell-2024-lesser-restoration', 'spell-2024-alter-self'],
      5: ['spell-2024-aura-of-vitality', 'spell-2024-haste'],
      7: ['spell-2024-polymorph', 'spell-2024-stoneskin'],
      9: ['spell-2024-contagion', 'spell-2024-mass-cure-wounds'],
    },
  },
  {
    id: 'subclass-2024-ua-psion-psi-warper', classId: 'class-2024-ua-psion', ruleset: '5e-2024', name: '裂空使', englishName: 'Psi Warper', selectionLevel: 3,
    summary: '扭曲空间：瞬间移动、裂曲推进、裂曲空间、传送战法、诡谲易位与群体瞬间移动。',
    status: 'selectable', availability: 'player', sourceIds,
    features: psionFeaturesOf('subclass-2024-ua-psion-psi-warper'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-expeditious-retreat', 'spell-2024-feather-fall', 'spell-2024-misty-step', 'spell-2024-shatter'],
      5: ['spell-2024-blink', 'spell-2024-haste'],
      7: ['spell-2024-banishment', 'spell-2024-dimension-door'],
      9: ['spell-2024-steel-wind-strike', 'spell-2024-teleportation-circle'],
    },
  },
  {
    id: 'subclass-2024-ua-psion-psykinetic', classId: 'class-2024-ua-psion', ruleset: '5e-2024', name: '念动使', englishName: 'Psykinetic', selectionLevel: 3,
    summary: '念力屏障与攻城锤：强化念力、念力技巧、毁灭迷狂、反弹力场与升阶心灵遥控。',
    status: 'selectable', availability: 'player', sourceIds,
    features: psionFeaturesOf('subclass-2024-ua-psion-psykinetic'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-shield', 'spell-2024-thunderwave', 'spell-2024-cloud-of-daggers', 'spell-2024-levitate'],
      5: ['spell-2024-slow', 'spell-2024-ua-telekinetic-crush'],
      7: ['spell-2024-otiluke-s-resilient-sphere', 'spell-2024-stone-shape'],
      9: ['spell-2024-telekinesis', 'spell-2024-wall-of-force'],
    },
  },
  {
    id: 'subclass-2024-ua-psion-telepath', classId: 'class-2024-ua-psion', ruleset: '5e-2024', name: '传心使', englishName: 'Telepath', selectionLevel: 3,
    summary: '心智大师：心智渗透、信号干扰、强固心智、思维潜能、心感援护与扰乱心智。',
    status: 'selectable', availability: 'player', sourceIds,
    features: psionFeaturesOf('subclass-2024-ua-psion-telepath'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-bane', 'spell-2024-command', 'spell-2024-detect-thoughts', 'spell-2024-mind-spike'],
      5: ['spell-2024-counterspell', 'spell-2024-slow'],
      7: ['spell-2024-compulsion', 'spell-2024-confusion'],
      9: ['spell-2024-modify-memory', 'spell-2024-yolande-s-regal-presence'],
    },
  },
]
