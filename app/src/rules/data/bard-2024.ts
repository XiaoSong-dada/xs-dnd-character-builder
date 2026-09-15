import type { ChoiceCheckpoint, ClassFeature, ClassRule, RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'
import { spells2024 } from '@/rules/data/spells-2024'

/**
 * 2024 吟游诗人与 4 个学院（B08-08）。
 *
 * 规则依据：B01《职业-全量》CV-006、CV-005／007—009 与项目内《5e 不全书》2024 吟游诗人章节；
 * `docs/classes/subclasses/bard/*.md` 提供结构与边界说明。
 * 特性名称采用 5e 不全书译名，摘要与详情为原创中文转述。
 */
const sourceIds = ['source-2024-phb'] as const

/** 吟游诗人技能候选（任选 3 项，见第一章技能表）。 */
const ALL_SKILL_OPTION_IDS = [
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
] as const

/** 乐器候选：任选 3 项乐器熟练；初始装备可领取其中一件。 */
const BARD_INSTRUMENT_OPTION_IDS = [
  'bard-2024-instrument-bagpipes',
  'bard-2024-instrument-drum',
  'bard-2024-instrument-dulcimer',
  'bard-2024-instrument-flute',
  'bard-2024-instrument-horn',
  'bard-2024-instrument-lute',
  'bard-2024-instrument-lyre',
  'bard-2024-instrument-pan-flute',
  'bard-2024-instrument-shawm',
  'bard-2024-instrument-viol',
] as const

/** 初始装备“所选乐器”候选（2024 装备库物品 ID）。 */
export const BARD_INSTRUMENT_ITEM_IDS = [
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

// 2024 吟游诗人施法表（B01 CV-006 核对）：不复用 2014 常量，按版本独立登记。
const BARD_PREPARED_COUNTS = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22] as const
const BARD_CANTRIPS = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] as const
const BARD_MAX_SPELL_LEVELS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 9] as const
const BARD_SPELL_SLOTS = [
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

/** 诗人激励骰：1—4 级 d6、5—9 级 d8、10—14 级 d10、15 级起 d12。 */
const BARDIC_INSPIRATION_DIE = [
  'd6', 'd6', 'd6', 'd6', 'd8', 'd8', 'd8', 'd8', 'd8', 'd10',
  'd10', 'd10', 'd10', 'd10', 'd12', 'd12', 'd12', 'd12', 'd12', 'd12',
] as const

const bardClassSpellIds2024 = spells2024
  .filter((spell) => spell.classIds.includes('class-2024-bard'))
  .map((spell) => spell.id)

/** 魔法奥秘：10 级起可从牧师／德鲁伊／法师列表准备法术（不含戏法）。 */
const MAGICAL_SECRETS_CLASS_IDS: readonly string[] = ['class-2024-cleric', 'class-2024-druid', 'class-2024-wizard']
const magicalSecretsSpellIds2024 = spells2024
  .filter((spell) => spell.level > 0 && spell.classIds.some((id) => MAGICAL_SECRETS_CLASS_IDS.includes(id)))
  .map((spell) => spell.id)

/** 吟游诗人职业专属选项：乐器熟练。 */
export const bardOptions2024: readonly RuleOption[] = [
  { id: 'bard-2024-instrument-bagpipes', name: '风笛', englishName: 'Bagpipes', description: '乐器熟练：风笛。', status: 'implemented', sourceIds },
  { id: 'bard-2024-instrument-drum', name: '鼓', englishName: 'Drum', description: '乐器熟练：鼓。', status: 'implemented', sourceIds },
  { id: 'bard-2024-instrument-dulcimer', name: '扬琴', englishName: 'Dulcimer', description: '乐器熟练：扬琴。', status: 'implemented', sourceIds },
  { id: 'bard-2024-instrument-flute', name: '长笛', englishName: 'Flute', description: '乐器熟练：长笛。', status: 'implemented', sourceIds },
  { id: 'bard-2024-instrument-horn', name: '号角', englishName: 'Horn', description: '乐器熟练：号角。', status: 'implemented', sourceIds },
  { id: 'bard-2024-instrument-lute', name: '鲁特琴', englishName: 'Lute', description: '乐器熟练：鲁特琴。', status: 'implemented', sourceIds },
  { id: 'bard-2024-instrument-lyre', name: '里拉琴', englishName: 'Lyre', description: '乐器熟练：里拉琴。', status: 'implemented', sourceIds },
  { id: 'bard-2024-instrument-pan-flute', name: '排箫', englishName: 'Pan Flute', description: '乐器熟练：排箫。', status: 'implemented', sourceIds },
  { id: 'bard-2024-instrument-shawm', name: '芦笛', englishName: 'Shawm', description: '乐器熟练：芦笛。', status: 'implemented', sourceIds },
  { id: 'bard-2024-instrument-viol', name: '提琴', englishName: 'Viol', description: '乐器熟练：提琴。', status: 'implemented', sourceIds },
]

export const bardFeatures2024: readonly ClassFeature[] = [
  {
    id: 'bard-2024-class-bardic-inspiration', classId: 'class-2024-bard', name: '吟游诗人激励', englishName: 'Bardic Inspiration', level: 1,
    summary: '附赠动作授予 60 尺内一个生物一枚激励骰（1—4 级 d6、5 级 d8、10 级 d10、15 级 d12）；使用次数＝魅力调整值（至少 1 次）。',
    description: '你可以用语言、音乐或舞蹈对他人进行超自然激励。以一个附赠动作，你可以激励 60 尺内一个能听见或看见你的生物；该生物获得一枚诗人激励骰（同一生物同时只能持有一枚）。在接下来的 1 小时内，该生物一次 d20 检定失败时，可以投掷激励骰并把结果加到该次 d20 上，这可能把失败变为成功；骰子随即消耗。可授予次数等于你的魅力调整值（至少 1 次），完成长休时重获全部次数。激励骰随等级变化：1—4 级 d6、5—9 级 d8、10—14 级 d10、15 级起 d12。',
    kind: 'resource', status: 'implemented', sourceIds,
    dicePool: { diceByLevel: Array.from({ length: 20 }, () => 1), dieByLevel: BARDIC_INSPIRATION_DIE, recovery: 'none', note: '附赠动作授予 60 尺内可见或可听见的生物；1 小时内用于失败的 d20 检定' },
    resource: { recovery: 'long-rest', maxFromAbility: { ability: 'cha', minimum: 1 }, note: '5 级起短休或长休全部恢复，也可消耗法术位（无需动作）回复 1 次' },
  },
  {
    id: 'bard-2024-class-spellcasting', classId: 'class-2024-bard', name: '施法', englishName: 'Spellcasting', level: 1,
    summary: '魅力施法：1 级 2 戏法、4 道准备法术；每获得吟游诗人等级可替换一道准备法术；乐器作为法器。',
    description: '施法属性为魅力，可使用乐器作为施法法器。1 级时知晓 2 道吟游诗人戏法，并准备 4 道一环吟游诗人法术；4 级与 10 级各额外习得一道戏法。准备法术数量按职业表随等级提升，所选法术环级不得超过当前拥有的法术位环级。每当你获得一个吟游诗人等级时，可以将准备列表上的一道法术替换为另一道吟游诗人法术（10 级起魔法奥秘扩展可选列表）。其他特性授予的始终准备法术不计入准备数量，但对你而言都视为吟游诗人法术。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-class-expertise', classId: 'class-2024-bard', name: '专精', englishName: 'Expertise', level: 2,
    summary: '选择 2 项已熟练技能获得专精；9 级再选 2 项。',
    description: '你从已熟练的技能中选择 2 项获得专精：使用这些技能进行的属性检定加上双倍熟练加值。当你到达 9 级时，再选择 2 项已熟练技能获得专精（不能与已有专精重复）。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-bard-expertise-2', 'class-2024-bard-expertise-9'], status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-class-jack-of-all-trades', classId: 'class-2024-bard', name: '万事通', englishName: 'Jack of All Trades', level: 2,
    summary: '属性检定可使用技能熟练但你没有熟练时，可加入一半熟练加值（向下取整）。',
    description: '若你进行的属性检定可以使用技能熟练，但你既不具备该技能熟练，也无法通过其他方式应用熟练加值，你可以将熟练加值的一半（向下取整）加到该检定中。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-class-subclass', classId: 'class-2024-bard', name: '吟游诗人子职', englishName: 'Bard Subclass', level: 3,
    summary: '选择舞蹈、魅心、逸闻或勇气学院，并在 3、6、14 级获得其特性。',
    description: '你在 3 级选择一项吟游诗人子职：舞蹈学院、魅心学院、逸闻学院或勇气学院。此后获得该学院的全部能力，前提是所需等级不超过你的吟游诗人等级。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-bard-subclass-3'], status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-class-font-of-inspiration', classId: 'class-2024-bard', name: '激励之源', englishName: 'Font of Inspiration', level: 5,
    summary: '短休或长休重获全部激励次数；也可消耗一个法术位（无需动作）回复 1 次。',
    description: '现在，当你完成一次短休或长休时，你重获所有已消耗的诗人激励使用次数。此外，你可以消耗一个法术位（无需动作）来重获一次已消耗的诗人激励使用次数。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-class-countercharm', classId: 'class-2024-bard', name: '反迷惑', englishName: 'Countercharm', level: 7,
    summary: '反应：你或 30 尺内生物对抗魅惑／恐慌的豁免失败时令其重骰，且具有优势。',
    description: '若你或位于你 30 尺内的一名生物在对抗施加魅惑或恐慌状态的效应的豁免检定中失败，你可以用反应令其重骰这次豁免，这次重骰具有优势。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-class-magical-secrets', classId: 'class-2024-bard', name: '魔法奥秘', englishName: 'Magical Secrets', level: 10,
    summary: '10 级起，准备法术数量增加的每个等级都可从诗人／牧师／德鲁伊／法师列表选择法术准备（视为诗人法术）。',
    description: '你从各种魔法传说中习得奥秘。每当你到达一个准备法术数量有所增加的吟游诗人等级时（包括 10 级），你可以从吟游诗人、牧师、德鲁伊和法师的法术列表中选择法术准备；这些法术对你而言都视为吟游诗人法术。此外，每当你替换本职业的准备法术时，也可以从这些法术列表中选择替换。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-class-superior-inspiration', classId: 'class-2024-bard', name: '先发激励', englishName: 'Superior Inspiration', level: 18,
    summary: '投掷先攻时，若激励次数不足两次，则恢复至两次。',
    description: '当你投掷先攻时，若你的诗人激励使用次数不足两次，你重获已消耗的诗人激励使用次数到两次为止。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-class-epic-boon', classId: 'class-2024-bard', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长，或其他满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一项你选择的、满足条件且适用的专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-bard-feat-19'], status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-class-words-of-creation', classId: 'class-2024-bard', name: '创生圣言', englishName: 'Words of Creation', level: 20,
    summary: '始终准备律令医疗与律令死亡；施展这两道法术时可指定 10 尺内第二个生物为目标。',
    description: '你掌握了创生圣言的其中两字：“生”与“死”。因此你总是准备法术律令医疗与律令死亡。当你施展这两道法术时，可以选择第二个生物作为目标，该生物必须位于第一个目标 10 尺内。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const bardRule2024: ClassRule = {
  id: 'class-2024-bard',
  ruleset: '5e-2024',
  name: '吟游诗人',
  englishName: 'Bard',
  summary: '2024版魅力施法者：激励骰支援队友，专精与魔法奥秘扩展法术，学院特化战斗或诡术。',
  hitDie: 8,
  primaryAbilities: ['cha'],
  playStyleTags: ['spellcaster', 'support', 'utility'],
  savingThrowAbilities: ['dex', 'cha'],
  status: 'implemented',
  sourceIds,
  armorTraining: ['light'],
  weaponTraining: { categories: ['simple'] },
  features: bardFeatures2024,
  checkpoints: [
    {
      id: 'class-2024-bard-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择3项吟游诗人技能', description: '从全部技能中选择3项不同技能。',
      required: true, minSelections: 3, maxSelections: 3, optionIds: ALL_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-bard-tools-1', level: 1, step: 'timeline', kind: 'class-choice',
      title: '选择3项乐器熟练', description: '从乐器中选择3项熟练；初始装备可领取其中一件。',
      required: true, minSelections: 3, maxSelections: 3, optionIds: BARD_INSTRUMENT_OPTION_IDS, uniqueGroup: 'bard-2024-instruments',
    },
    {
      id: 'class-2024-bard-expertise-2', level: 2, step: 'timeline', kind: 'expertise',
      title: '选择2项专精', description: '从已熟练的技能中选择2项获得专精。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: ALL_SKILL_OPTION_IDS,
    },
    ...([4, 8, 12, 16] as const).map((level): ChoiceCheckpoint => ({
      id: `class-2024-bard-feat-${level}`, level, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    {
      id: 'class-2024-bard-expertise-9', level: 9, step: 'timeline', kind: 'expertise',
      title: '再选择2项专精', description: '从已熟练且尚无专精的技能中选择2项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: ALL_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-bard-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '19级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
  spellcasting: {
    ruleset: '5e-2024',
    mode: 'prepared',
    ability: 'cha',
    startsAtLevel: 1,
    preparedCountByLevel: BARD_PREPARED_COUNTS,
    cantripsKnownByLevel: BARD_CANTRIPS,
    maxSpellLevelByClassLevel: BARD_MAX_SPELL_LEVELS,
    slotsByClassLevel: BARD_SPELL_SLOTS,
    classSpellIds: bardClassSpellIds2024,
    expandedSpellPool: { spellIds: magicalSecretsSpellIds2024, startsAtLevel: 10 },
    alwaysPreparedSpellIdsByLevel: { 20: ['spell-2024-power-word-heal', 'spell-2024-power-word-kill'] },
  },
}

export const bardSubclassFeatures2024: readonly SubclassFeature[] = [
  // ============ 勇气学院 ============
  {
    id: 'bard-2024-valor-combat-inspiration', subclassId: 'subclass-2024-bard-college-of-valor', name: '战斗激励', englishName: 'Combat Inspiration', level: 3,
    summary: '持有激励骰的生物可选择：被命中时以反应把骰值加到 AC，或命中后把骰值加到伤害。',
    description: '一名拥有你的诗人激励骰的生物可以选择以下一种方式使用该骰：防御——被一次攻击检定命中时，以反应投掷激励骰并把骰值加到对抗该次攻击的 AC 上，这可能使攻击失手；进攻——以一次攻击检定命中目标后，立即投掷激励骰并把骰值加到该次攻击对该目标造成的伤害中。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-valor-martial-training', subclassId: 'subclass-2024-bard-college-of-valor', name: '战争训练', englishName: 'Martial Training', level: 3,
    summary: '获得军用武器熟练与中甲、盾牌受训；可用简易或军用武器作为诗人法术法器。',
    description: '你获得军用武器熟练，以及中甲和盾牌的护甲受训。此外，你施展吟游诗人法术列表中的法术时，可以使用简易或军用武器作为施法法器。',
    kind: 'passive', status: 'implemented', sourceIds,
    armorTraining: ['medium', 'shield'],
    weaponTraining: { categories: ['martial'] },
  },
  {
    id: 'bard-2024-valor-extra-attack', subclassId: 'subclass-2024-bard-college-of-valor', name: '额外攻击', englishName: 'Extra Attack', level: 6,
    summary: '执行攻击动作时可发动两次攻击；可将其中一次替换为施法时间为动作的戏法。',
    description: '当你在自己的回合执行攻击动作时，你可以发动两次攻击而非一次。此外，你可以将额外攻击中的一次替换为施展一道施法时间为动作的戏法。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-valor-battle-magic', subclassId: 'subclass-2024-bard-college-of-valor', name: '战斗魔法', englishName: 'Battle Magic', level: 14,
    summary: '施展施法时间为动作的法术后，可用附赠动作以武器发动一次攻击。',
    description: '在你施展一道施法时间为动作的法术后，你能够以一个附赠动作，使用一把武器发动一次攻击。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },

  // ============ 舞蹈学院 ============
  {
    id: 'bard-2024-dance-dazzling-footwork', subclassId: 'subclass-2024-bard-college-of-dance', name: '炫目舞步', englishName: 'Dazzling Footwork', level: 3,
    summary: '未着甲未持盾时 AC＝10＋敏捷＋魅力；消耗激励次数时可附带徒手打击；徒手打击可用敏捷并以激励骰＋敏捷计算伤害。',
    description: '未着装护甲且未持用盾牌期间，你获得：大舞蹈家——有关舞蹈的魅力（表演）检定具有优势；无甲防御——基础 AC 等于 10 + 敏捷调整值 + 魅力调整值；灵巧打击——当你在一次动作、附赠动作或反应中消耗诗人激励使用次数时，可作为该动作的一部分发动一次徒手打击；诗人痛击——徒手打击可用敏捷代替力量进行攻击检定，造成伤害时可选择造成等于诗人激励骰 + 敏捷调整值的钝击伤害（不消耗激励次数）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-dance-inspiring-movement', subclassId: 'subclass-2024-bard-college-of-dance', name: '鼓舞之移', englishName: 'Inspring Movement', level: 6,
    summary: '反应消耗一次激励：你移动至多半速，且 30 尺内一名盟友可用反应移动至多半速；均不引发借机攻击。',
    description: '当一名你可见的敌人位于你 5 尺内结束它的回合时，你可以用反应消耗一次诗人激励使用次数，移动至多等于你速度一半的距离；此时你选择的 30 尺内一名盟友也可以使用其反应，移动至多等于其速度一半的距离。这些移动不会引发借机攻击。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-dance-tandem-footwork', subclassId: 'subclass-2024-bard-college-of-dance', name: '协同舞步', englishName: 'Tandem Footwork', level: 6,
    summary: '投先攻时可消耗一次激励，掷激励骰，你与 30 尺内盟友的先攻检定获得该骰值加值。',
    description: '当你投掷先攻时，若你未陷入失能状态，你可以消耗一次诗人激励使用次数并投掷激励骰，使你与位于你 30 尺内每个能听见或看见你的盟友的先攻检定获得等于该骰值的加值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-dance-leading-evasion', subclassId: 'subclass-2024-bard-college-of-dance', name: '引导闪避', englishName: 'Leading Evasion', level: 14,
    summary: '敏捷豁免减半伤害的效应：成功免伤、失败减半；5 尺内同样需要豁免的生物也享受此增益。',
    description: '当你受到一个允许你进行敏捷豁免来只承受一半伤害的效应影响时，你在豁免成功时不受伤害，豁免失败时只承受一半伤害。若位于你 5 尺内的其他生物同样需要进行这次敏捷豁免，你可以让他们也享受此特性的增益。若你陷入失能状态，你无法使用此特性。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 逸闻学院 ============
  {
    id: 'bard-2024-lore-bonus-proficiencies', subclassId: 'subclass-2024-bard-college-of-lore', name: '附赠熟练', englishName: 'Bonus Proficiencies', level: 3,
    summary: '获得三项由你选择的技能熟练。',
    description: '你获得三项由你选择的技能的熟练。所选技能不能与已有熟练重复。',
    kind: 'choice', requiresChoice: true, optionIds: ALL_SKILL_OPTION_IDS, minSelections: 3, maxSelections: 3, status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-lore-cutting-words', subclassId: 'subclass-2024-bard-college-of-lore', name: '语出惊人', englishName: 'Cutting Words', level: 3,
    summary: '反应消耗一次激励：60 尺内可见生物的伤害掷骰或成功的属性／攻击检定减去激励骰值。',
    description: '当一名你可见的、位于你 60 尺内的生物进行伤害掷骰，或在一次属性检定或攻击检定中成功时，你可以用反应消耗一次诗人激励使用次数并投掷激励骰，然后从该生物的掷骰结果中减去骰值；这会降低其造成的伤害，或可能使成功的检定变为失败。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-lore-magical-discoveries', subclassId: 'subclass-2024-bard-college-of-lore', name: '魔法探秘', englishName: 'Magical Discoveries', level: 6,
    summary: '习得 2 道来自牧师／德鲁伊／法师列表的戏法或拥有法术位环阶的法术，始终准备，升级可替换一道。',
    description: '你习得两道自选法术，可从牧师、德鲁伊或法师的法术列表中单独或组合选择。所选法术必须是戏法，或是你拥有对应环阶法术位的法术。这些法术始终准备（不占准备上限）；每当你获得一个吟游诗人等级时，可以将其中一个替换为另一个满足上述要求的法术。',
    kind: 'choice', requiresChoice: true, minSelections: 2, maxSelections: 2,
    candidateKind: 'spell-pool',
    spellPool: { classIds: MAGICAL_SECRETS_CLASS_IDS, includeCantrips: true },
    spellGrant: { alwaysPrepared: true },
    status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-lore-peerless-skill', subclassId: 'subclass-2024-bard-college-of-lore', name: '超凡技艺', englishName: 'Peerless Skill', level: 14,
    summary: '属性或攻击检定失败时，可消耗一次激励并加激励骰值；仍失败则不消耗。',
    description: '当你进行一次属性检定或攻击检定并在检定中失败时，你可以消耗一次诗人激励使用次数，投掷激励骰并把骰值加到 d20 中，这可能使失败变为成功。若检定仍然失败，则不会消耗诗人激励次数。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 魅心学院 ============
  {
    id: 'bard-2024-glamour-beguiling-magic', subclassId: 'subclass-2024-bard-college-of-glamour', name: '惑心魔法', englishName: 'Beguiling Magic', level: 3,
    summary: '始终准备魅惑类人与镜影术；用法术位施展惑控或幻术法术后可迫使 60 尺内生物豁免，失败被魅惑或恐慌 1 分钟（每次长休 1 次）。',
    description: '你始终准备法术魅惑类人与镜影术（不占准备上限）。此外，在你使用法术位施展一道惑控或幻术学派的法术后，你可以立即使一名位于你 60 尺内你可见的生物进行一次感知豁免（对抗你的施法 DC）：失败则目标陷入魅惑或恐慌状态（由你选择），持续 1 分钟，目标在其每个回合结束时可以重新豁免，成功则效应提前结束。此增益每次长休 1 次；你也可以消耗一次诗人激励使用次数（无需动作）重置其使用权。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-glamour-mantle-of-inspiration', subclassId: 'subclass-2024-bard-college-of-glamour', name: '灵感织衣', englishName: 'Mantle of Insipration', level: 3,
    summary: '附赠动作消耗一次激励：至多等于魅力调整值的 60 尺内生物各获得 2×激励骰值临时生命，并可用反应移动整速。',
    description: '以一个附赠动作，你可以消耗一次诗人激励使用次数并投掷激励骰，从位于你 60 尺内的其他生物中选择至多等于你魅力调整值数量（至少一名）的生物：每个被选中的生物获得等于两倍该激励骰骰值的临时生命值，然后每名生物均可使用自己的反应立即移动至多等于自己速度的距离，该移动不会引发借机攻击。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-glamour-mantle-of-majesty', subclassId: 'subclass-2024-bard-college-of-glamour', name: '威仪作锦', englishName: 'Mantle of Majesty', level: 6,
    summary: '始终准备命令术；附赠动作无需法术位施展命令术并获得威仪 1 分钟，期间每回合可再免费施展；受你魅惑者对其豁免自动失败（每次长休 1 次）。',
    description: '你始终准备法术命令术（不占准备上限）。以一个附赠动作，你无需法术位地施展命令术，随后获得超凡脱俗的容貌，持续 1 分钟或直到你的专注终止；在此期间，你可以用一个附赠动作无需法术位地施展命令术。任何因你而陷入魅惑状态的生物，在对抗你以此特性施展的命令术时豁免自动失败。此特性每次长休 1 次；你也可以消耗一个三环或更高的法术位（无需动作）重置其使用权。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'bard-2024-glamour-unbreakable-majesty', subclassId: 'subclass-2024-bard-college-of-glamour', name: '不破威仪', englishName: 'Unbreakable Majesty', level: 14,
    summary: '附赠动作获得威仪 1 分钟：每回合首次命中你的攻击者须通过魅力豁免，否则该次攻击失手。',
    description: '以一个附赠动作，你可以魔法性地呈现出庄严的姿态，持续 1 分钟或直至你陷入失能状态。在此期间，任何生物在一个回合中的攻击检定首次命中你时，攻击者必须通过一次对抗你施法 DC 的魅力豁免，否则这次攻击将因畏惧你的威仪而失手。一旦你呈现出这庄严的姿态，直至完成短休或长休前都无法再次如此做。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
]

export const bardSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-bard-college-of-dance',
    classId: 'class-2024-bard',
    ruleset: '5e-2024',
    name: '舞蹈学院',
    englishName: 'College of Dance',
    selectionLevel: 3,
    summary: '以舞步作战：无甲防御（魅力）、激励附带徒手打击、团队先攻与移动支援，高等级共享闪避。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: bardSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-bard-college-of-dance'),
    unarmoredDefense: { ability: 'cha', allowsShield: false },
  },
  {
    id: 'subclass-2024-bard-college-of-glamour',
    classId: 'class-2024-bard',
    ruleset: '5e-2024',
    name: '魅心学院',
    englishName: 'College of Glamour',
    selectionLevel: 3,
    summary: '以妖精魔法魅惑与鼓舞：群体临时生命与移动、免费命令术，高等级以威仪使攻击失手。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: bardSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-bard-college-of-glamour'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-charm-person', 'spell-2024-mirror-image'],
      6: ['spell-2024-command'],
    },
  },
  {
    id: 'subclass-2024-bard-college-of-lore',
    classId: 'class-2024-bard',
    ruleset: '5e-2024',
    name: '逸闻学院',
    englishName: 'College of Lore',
    selectionLevel: 3,
    summary: '以知识与妙语削弱敌人：额外技能熟练、语出惊人、跨表法术探秘与超凡技艺。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: bardSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-bard-college-of-lore'),
  },
  {
    id: 'subclass-2024-bard-college-of-valor',
    classId: 'class-2024-bard',
    ruleset: '5e-2024',
    name: '勇气学院',
    englishName: 'College of Valor',
    selectionLevel: 3,
    summary: '以战歌与武器作战：激励骰用于 AC 或伤害、军用与中甲盾牌训练、额外攻击与战斗魔法。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: bardSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-bard-college-of-valor'),
  },
]
