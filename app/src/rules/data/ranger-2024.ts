import type { ChoiceCheckpoint, ClassFeature, ClassRule, RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'
import { spells2024 } from '@/rules/data/spells-2024'

/**
 * 2024 游侠与 4 个范型（B08-12）。
 *
 * 规则依据：B01《职业-全量》CV-038、CV-036／037／039／040 与项目内《5e 不全书》2024 游侠章节；
 * `docs/classes/subclasses/ranger/*.md` 提供结构与边界说明。
 * 特性名称采用 5e 不全书译名，摘要与详情为原创中文转述。
 * 原初行侣与召唤物数值（AC-08）保持边界：只登记规则关系，不生成生物数值。
 */
const sourceIds = ['source-2024-phb'] as const

/** 游侠技能候选：驯兽、运动、洞悉、调查、自然、察觉、隐匿、求生。 */
const RANGER_SKILL_OPTION_IDS = [
  'skill-animal-handling',
  'skill-athletics',
  'skill-insight',
  'skill-investigation',
  'skill-nature',
  'skill-perception',
  'skill-stealth',
  'skill-survival',
] as const

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

// 2024 游侠成长表（B01 CV-038 核对）。
const RANGER_PREPARED = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15] as const
/** 宿敌免费施法次数：1—4 级 2 次、5—8 级 3 次、9—12 级 4 次、13—16 级 5 次、17 级起 6 次。 */
const FAVORED_ENEMY_USES = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6] as const
/** 半施法者法术位（1 级无环位，2 级起）。 */
const RANGER_SPELL_SLOTS = [
  [],
  [2],
  [3],
  [3],
  [4, 2],
  [4, 2],
  [4, 3],
  [4, 3],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2],
] as const
const RANGER_MAX_SPELL_LEVELS = RANGER_SPELL_SLOTS.map((slots) => slots.length)
/** 武器精通固定 2 种（无升级增长）。 */
const RANGER_MASTERY_COUNTS = Array.from({ length: 20 }, () => 2)

/** 范型法术始终准备（3／5／9／13／17 级）。 */
const FEY_WANDERER_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-charm-person'],
  5: ['spell-2024-misty-step'],
  9: ['spell-2024-summon-fey'],
  13: ['spell-2024-dimension-door'],
  17: ['spell-2024-mislead'],
}
const GLOOM_STALKER_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-disguise-self'],
  5: ['spell-2024-rope-trick'],
  9: ['spell-2024-fear'],
  13: ['spell-2024-greater-invisibility'],
  17: ['spell-2024-seeming'],
}

const rangerClassSpellIds2024 = spells2024
  .filter((spell) => spell.classIds.includes('class-2024-ranger'))
  .map((spell) => spell.id)

/** 游侠职业专属选项：猎人范型的短休可更换选项。 */
export const rangerOptions2024: readonly RuleOption[] = [
  { id: 'hunter-2024-prey-colossus-slayer', name: '巨像屠夫', englishName: 'Colossus Slayer', description: '武器命中生命值不满的生物时额外造成 1d8 伤害（每回合一次）。', status: 'implemented', sourceIds },
  { id: 'hunter-2024-prey-horde-breaker', name: '灭族者', englishName: 'Horde Breaker', description: '每个你的回合一次，武器攻击时可对目标 5 尺内另一生物发动另一次攻击。', status: 'implemented', sourceIds },
  { id: 'hunter-2024-defense-escape-the-horde', name: '冲出重围', englishName: 'Escape the Horde', description: '对你发动的借机攻击具有劣势。', status: 'implemented', sourceIds },
  { id: 'hunter-2024-defense-multiattack-defense', name: '多重防御', englishName: 'Multiattack Defense', description: '当一个生物的攻击命中你时，该生物本回合内对你进行的其他攻击具有劣势。', status: 'implemented', sourceIds },
]

export const rangerFeatures2024: readonly ClassFeature[] = [
  {
    id: 'ranger-2024-class-spellcasting', classId: 'class-2024-ranger', name: '施法', englishName: 'Spellcasting', level: 1,
    summary: '感知准备制半施法者：1 级无环位、2 级起 2 个一环；准备数量按职业表，长休可更换。',
    description: '施法属性为感知，可使用德鲁伊法器作为施法法器。半施法者法术位按职业表：1 级无环位，2 级起获得一环法术位，随等级提升最高到五环。准备法术数量按职业表（1 级 2 道、20 级 15 道），所选法术环级不得超过当前拥有的法术位环级；完成长休时可替换任意数量已准备法术。其他特性授予的始终准备法术不计入准备数量。游侠没有戏法（德鲁伊教战士除外）。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-class-favored-enemy', classId: 'class-2024-ranger', name: '宿敌', englishName: 'Favored Enemy', level: 1,
    summary: '始终准备猎人印记；可无需法术位施展 2 次，按等级提升至 6 次，长休全部恢复。',
    description: '你始终准备着法术猎人印记。你可以无需法术位地施展该法术共计 2 次，并在完成一次长休后恢复所有使用次数；无需法术位施展的次数随游侠等级提升（5 级 3 次、9 级 4 次、13 级 5 次、17 级起 6 次）。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: FAVORED_ENEMY_USES, recovery: 'long-rest', note: '免费施展猎人印记；长休恢复全部次数' },
  },
  {
    id: 'ranger-2024-class-weapon-mastery', classId: 'class-2024-ranger', name: '武器精通', englishName: 'Weapon Mastery', level: 1,
    summary: '选择 2 种已熟练武器的精通词条；长休可替换。',
    description: '你对武器的训练使你能够为 2 种你已熟练的武器启用其精通词条（例如长弓和短剑）；每次完成长休时可以更换所选武器类型。持有或熟练武器不会自动获得精通词条。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-ranger-mastery-1'], status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-class-deft-explorer', classId: 'class-2024-ranger', name: '熟练探险家', englishName: 'Deft Explorer', level: 2,
    summary: '选择 1 项已熟练技能获得专精；另习得两门语言。',
    description: '得益于你的旅途：专精——选择一项你熟练但不具备专精的技能，在该技能上获得专精；语言——你习得语言表中的两门语言。语言选择随语言流程后续补齐，本条目暂登记规则关系。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-ranger-expertise-2'], status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-class-fighting-style', classId: 'class-2024-ranger', name: '战斗风格', englishName: 'Fighting Style', level: 2,
    summary: '获得一项战斗风格专长，或以德鲁伊教战士替代（两道德鲁伊戏法，感知施法）。',
    description: '你获得一项战斗风格专长。作为替代，你也可以选择德鲁伊教战士：习得两道由你选择的德鲁伊戏法（对你视为游侠法术，施法属性为感知），每获得一级游侠等级可替换其中一道戏法。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-ranger-style-2'], status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-class-subclass', classId: 'class-2024-ranger', name: '游侠子职', englishName: 'Ranger Subclass', level: 3,
    summary: '选择驯兽师、妖精漫游者、幽域追猎者或猎人，并在 3、7、11、15 级获得其特性。',
    description: '你在 3 级选择一项游侠子职：驯兽师、妖精漫游者、幽域追猎者或猎人。此后获得该范型的全部能力，前提是所需等级不超过你的游侠等级。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-ranger-subclass-3'], status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-class-extra-attack', classId: 'class-2024-ranger', name: '额外攻击', englishName: 'Extra Attack', level: 5,
    summary: '执行攻击动作时可发动两次攻击。',
    description: '你在自己回合内执行攻击动作时，可以发动两次攻击而非一次。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-class-roving', classId: 'class-2024-ranger', name: '越野', englishName: 'Roving', level: 6,
    summary: '未着重复甲时速度 +10 尺，并获得等于速度的攀爬与游泳速度。',
    description: '只要你未着装重复甲，你的速度提升 10 尺；你也获得等于你速度的攀爬速度与游泳速度。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-class-expertise', classId: 'class-2024-ranger', name: '专精', englishName: 'Expertise', level: 9,
    summary: '选择两项已熟练技能获得专精。',
    description: '选择两项你熟练但不具备专精的技能，你获得这些技能的专精：使用这些技能进行的属性检定加上双倍熟练加值。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-ranger-expertise-9'], status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-class-tireless', classId: 'class-2024-ranger', name: '不知疲倦', englishName: 'Tireless', level: 10,
    summary: '魔法动作获得 1d8＋感知临时生命；次数＝感知调整值；短休时力竭等级减少 1 级。',
    description: '原初力量帮你重整旗鼓：以一个魔法动作，你获得 1d8 + 你的感知调整值（至少 1）的临时生命值，使用次数等于你的感知调整值（至少 1 次），完成长休时重获全部次数；此外，当你完成一次短休时，你的力竭等级减少 1 级（若有）。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { recovery: 'long-rest', maxFromAbility: { ability: 'wis', minimum: 1 }, note: '魔法动作获得 1d8＋感知临时生命；短休减少 1 级力竭' },
  },
  {
    id: 'ranger-2024-class-relentless-hunter', classId: 'class-2024-ranger', name: '永恒追猎', englishName: 'Relentless Hunter', level: 13,
    summary: '受到伤害不会打断你对猎人印记的专注。',
    description: '受到伤害不会打断你对猎人印记的专注。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-class-natures-veil', classId: 'class-2024-ranger', name: '自然面纱', englishName: "Nature's Veil", level: 14,
    summary: '附赠动作隐形至你下回合结束；次数＝感知调整值（至少 1），长休恢复。',
    description: '你祈唤自然精魂遮蔽身形：以一个附赠动作，你可以让自己进入隐形状态，持续到你的下个回合结束。使用次数等于你的感知调整值（至少 1 次），完成长休时重获全部次数。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { recovery: 'long-rest', maxFromAbility: { ability: 'wis', minimum: 1 }, note: '附赠动作隐形至下回合结束' },
  },
  {
    id: 'ranger-2024-class-precise-hunter', classId: 'class-2024-ranger', name: '致命猎杀', englishName: 'Precise Hunter', level: 17,
    summary: '对猎人印记当前目标进行的攻击检定具有优势。',
    description: '你在对你的猎人印记当前指定目标的攻击检定中具有优势。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-class-feral-senses', classId: 'class-2024-ranger', name: '野性感官', englishName: 'Feral Senses', level: 18,
    summary: '获得 30 尺盲视。',
    description: '你与自然的链接给予你 30 尺盲视。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-class-epic-boon', classId: 'class-2024-ranger', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长，或其他满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一项你选择的、满足条件且适用的专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-ranger-feat-19'], status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-class-foe-slayer', classId: 'class-2024-ranger', name: '屠灭众敌', englishName: 'Foe Slayer', level: 20,
    summary: '猎人印记的额外伤害骰从 d6 变为 d10。',
    description: '你的猎人印记的额外伤害骰从 d6 变为 d10。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const rangerRule2024: ClassRule = {
  id: 'class-2024-ranger',
  ruleset: '5e-2024',
  name: '游侠',
  englishName: 'Ranger',
  summary: '2024版原初半施法者：猎人印记标记猎物，武器精通与范型特化荒野作战。',
  hitDie: 10,
  primaryAbilities: ['dex', 'wis'],
  playStyleTags: ['skirmisher', 'striker', 'utility'],
  savingThrowAbilities: ['str', 'dex'],
  status: 'implemented',
  sourceIds,
  armorTraining: ['light', 'medium', 'shield'],
  weaponTraining: { categories: ['simple', 'martial'] },
  features: rangerFeatures2024,
  checkpoints: [
    {
      id: 'class-2024-ranger-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择3项游侠技能', description: '从游侠技能列表中选择3项。',
      required: true, minSelections: 3, maxSelections: 3, optionIds: RANGER_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-ranger-mastery-1', level: 1, step: 'timeline', kind: 'weapon-mastery',
      title: '选择武器精通', description: '选择2种已熟练武器的精通词条；长休可替换。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: [],
      candidateKind: 'weapon-mastery', selectionCountByLevel: RANGER_MASTERY_COUNTS, weaponMasteryFilter: 'proficient',
    },
    {
      id: 'class-2024-ranger-expertise-2', level: 2, step: 'timeline', kind: 'expertise',
      title: '选择1项专精', description: '从已熟练技能中选择1项获得专精（熟练探险家）。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: ALL_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-ranger-style-2', level: 2, step: 'timeline', kind: 'fighting-style',
      title: '选择战斗风格', description: '选择一项战斗风格专长（或以德鲁伊教战士替代）。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['fighting-style'],
    },
    ...([4, 8, 12, 16] as const).map((level): ChoiceCheckpoint => ({
      id: `class-2024-ranger-feat-${level}`, level, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    {
      id: 'class-2024-ranger-expertise-9', level: 9, step: 'timeline', kind: 'expertise',
      title: '选择2项专精', description: '从已熟练且尚无专精的技能中选择2项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: ALL_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-ranger-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '19级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
  spellcasting: {
    ruleset: '5e-2024',
    mode: 'prepared',
    ability: 'wis',
    startsAtLevel: 1,
    preparedCountByLevel: RANGER_PREPARED,
    maxSpellLevelByClassLevel: RANGER_MAX_SPELL_LEVELS,
    slotsByClassLevel: RANGER_SPELL_SLOTS,
    classSpellIds: rangerClassSpellIds2024,
    alwaysPreparedSpellIdsByLevel: { 1: ['spell-2024-hunter-s-mark'] },
  },
}

export const rangerSubclassFeatures2024: readonly SubclassFeature[] = [
  // ============ 驯兽师 ============
  {
    id: 'ranger-2024-beast-master-primal-companion', subclassId: 'subclass-2024-ranger-beast-master', name: '原初行侣', englishName: 'Primal Companion', level: 3,
    summary: '召唤原初野兽（大地／海洋／天空数据卡）：战斗中在你的回合行动，可用附赠动作命令；死亡 1 小时内可消耗法术位复活；长休可更换。',
    description: '你魔法性地召唤一只原初野兽，从大地野兽、海洋野兽与天空野兽中选择一项数据卡并决定其外形。野兽与你及伙伴友善并听从你的命令，在你死亡时消失。战斗中野兽在你的回合中行动：它能自主移动或使用反应，但除非你用附赠动作命令它执行其他动作，只会执行回避动作；你也可以在执行攻击动作时牺牲一次攻击来命令它执行野兽打击。若你陷入失能，野兽可自主行动。若野兽死亡不超过 1 小时，你可以用魔法动作并消耗一个法术位使其在 1 分钟后复活并恢复全部生命值；每次长休可召唤一只不同的原初野兽。生物数据卡未装配前，本条目只登记规则关系，不生成生物数值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-beast-master-exceptional-training', subclassId: 'subclass-2024-ranger-beast-master', name: '特效训练', englishName: 'Exceptional Training', level: 7,
    summary: '附赠动作命令野兽时，它还可用自己的附赠动作执行疾走／撤离／回避／协助；其伤害可改为力场。',
    description: '当你以附赠动作命令原初行侣执行动作时，你还可以令它以它自己的附赠动作执行疾走、撤离、回避或协助动作。此外，每当野兽的攻击检定命中并造成伤害时，伤害类型可以是力场伤害或其原本的伤害类型（由你选择）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-beast-master-bestial-fury', subclassId: 'subclass-2024-ranger-beast-master', name: '兽性狂怒', englishName: 'Bestial Fury', level: 11,
    summary: '命令野兽打击时可使用两次；每回合首次命中猎人印记目标时追加该法术的额外伤害（力场）。',
    description: '当你命令原初行侣执行野兽打击动作时，它能使用该动作两次。此外，每个回合中当其首次击中一个受你猎人印记影响的生物时，可以额外造成等同于该法术额外伤害的力场伤害。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-beast-master-share-spells', subclassId: 'subclass-2024-ranger-beast-master', name: '法术共享', englishName: 'Share Spells', level: 15,
    summary: '以自己为目标的法术，若野兽在 30 尺内，可同时作用于它。',
    description: '当你施展的法术指定了你自己作为目标，并且你的原初行侣正位于你 30 尺范围内时，你可以让该法术效应同时作用于你的原初行侣。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 妖精漫游者 ============
  {
    id: 'ranger-2024-fey-wanderer-dreadful-strikes', subclassId: 'subclass-2024-ranger-fey-wanderer', name: '哀惧灵袭', englishName: 'Dreadful Strikes', level: 3,
    summary: '武器命中时可追加 2d6 心灵伤害；每回合一次，次数＝感知调整值（至少 1），长休恢复。',
    description: '当你用武器对生物攻击并命中时，你可以额外对目标造成 2d6 心灵伤害。你每回合只能使用一次该增益，使用次数等于你的感知调整值（至少 1 次），完成长休时重获全部次数。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { recovery: 'long-rest', maxFromAbility: { ability: 'wis', minimum: 1 }, note: '武器命中追加 2d6 心灵伤害；每回合一次' },
  },
  {
    id: 'ranger-2024-fey-wanderer-magic', subclassId: 'subclass-2024-ranger-fey-wanderer', name: '妖精漫游者魔法', englishName: 'Fey Wanderer Magic', level: 3,
    summary: '3／5／9／13／17 级获得始终准备的妖精法术（魅惑类人、迷踪步、妖精召唤术等）；并获得精野之赐祝福。',
    description: '你始终准备特定法术：3 级——魅惑类人；5 级——迷踪步；9 级——妖精召唤术；13 级——任意门；17 级——假象术。这些法术不计入准备上限。你还获得一种妖精祝福（精野之赐表，1d6）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-fey-wanderer-otherworldly-glamour', subclassId: 'subclass-2024-ranger-fey-wanderer', name: '妖冶娴都', englishName: 'Otherworldly Glamour', level: 3,
    summary: '魅力检定获得感知调整值加值（至少 +1）；并获得一项技能熟练（欺瞒、表演或游说）。',
    description: '你的妖精血统使你举止迷人：每当你进行魅力检定时，加上你的感知调整值（至少 +1）；你获得欺瞒、表演或游说之一的技能熟练（若已熟练则按规则处理）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-fey-wanderer-beguiling-twist', subclassId: 'subclass-2024-ranger-fey-wanderer', name: '妖思魅缕', englishName: 'Beguiling Twist', level: 7,
    summary: '你或 120 尺内可见生物成功通过对抗魅惑／恐慌的豁免时，可用反应迫使另一可见生物感知豁免，失败则被魅惑或恐慌 1 分钟。',
    description: '当你或你 120 尺内一个可见生物成功通过一次对抗魅惑或恐慌状态的豁免检定时，你可以用反应迫使 120 尺内另一个可见生物进行一次感知豁免（DC 为你的法术豁免 DC）：失败则目标陷入魅惑或恐慌状态（由你选择）1 分钟，并可在其每个回合结束时重复豁免。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-fey-wanderer-fey-reinforcements', subclassId: 'subclass-2024-ranger-fey-wanderer', name: '精宸所与', englishName: 'Fey Reinforcements', level: 11,
    summary: '始终准备妖精召唤术且可不消耗法术位施展一次（长休恢复）；但以此法召唤时无需专注且持续 1 分钟。',
    description: '你始终准备着妖精召唤术，并且可以无需法术位施展它一次，完成长休后恢复该能力。当你以该方式施展妖精召唤术时，法术无需专注且持续时间变为 1 分钟。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-fey-wanderer-misty-wanderer', subclassId: 'subclass-2024-ranger-fey-wanderer', name: '雾行漫游', englishName: 'Misty Wanderer', level: 15,
    summary: '施展迷踪步时可携带 5 尺内一名自愿生物；使用次数＝感知调整值（至少 1），长休恢复。',
    description: '你可以无需法术位施展迷踪步的次数等于你的感知调整值（至少 1 次），完成长休时恢复全部次数；每当你施展迷踪步时，你还可以携带 5 尺内一名自愿生物一同传送。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { recovery: 'long-rest', maxFromAbility: { ability: 'wis', minimum: 1 }, note: '免费施展迷踪步并可携带一名自愿生物' },
  },

  // ============ 幽域追猎者 ============
  {
    id: 'ranger-2024-gloom-stalker-dread-ambusher', subclassId: 'subclass-2024-ranger-gloom-stalker', name: '恐惧伏击', englishName: 'Dread Ambusher', level: 3,
    summary: '先攻检定加感知调整值；首回合移动 +10 尺，若该回合执行攻击动作可额外攻击一次并追加 2d6 伤害。',
    description: '当你投掷先攻时，可以加入你的感知调整值。此外，在你的第一个回合中：移动速度提升 10 尺；若你该回合执行攻击动作，可以额外发动一次武器攻击，该次命中追加 2d6 伤害（类型与武器相同）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-gloom-stalker-magic', subclassId: 'subclass-2024-ranger-gloom-stalker', name: '幽域追猎者魔法', englishName: 'Gloom Stalker Magic', level: 3,
    summary: '3／5／9／13／17 级获得始终准备的幽影法术（易容术、魔绳术、恐惧术、高等隐形术等）。',
    description: '你始终准备特定法术：3 级——易容术；5 级——魔绳术；9 级——恐惧术；13 级——高等隐形术；17 级——伪装术。这些法术不计入准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-gloom-stalker-umbral-sight', subclassId: 'subclass-2024-ranger-gloom-stalker', name: '阴影视野', englishName: 'Umbral Sight', level: 3,
    summary: '获得 60 尺黑暗视觉（已有则范围 +60 尺）；在黑暗中对你而言隐形。',
    description: '你获得 60 尺黑暗视觉；若获得本特性时已有黑暗视觉，其范围增加 60 尺。此外，你处于黑暗环境中时，对你而言处于隐形状态（依赖黑暗视觉的生物无法以黑暗视觉看见你）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-gloom-stalker-iron-mind', subclassId: 'subclass-2024-ranger-gloom-stalker', name: '钢铁意志', englishName: 'Iron Mind', level: 7,
    summary: '获得感知豁免熟练；若已熟练，则改为获得智力或魅力豁免熟练。',
    description: '你获得感知豁免的熟练；如果你已经熟练感知豁免，则改为获得智力或魅力豁免的熟练（由你选择）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-gloom-stalker-stalkers-flurry', subclassId: 'subclass-2024-ranger-gloom-stalker', name: '追猎如风', englishName: "Stalker's Flurry", level: 11,
    summary: '每回合一次，攻击未命中时可对同一目标再发动一次攻击。',
    description: '每个你的回合一次，当你的一次攻击检定未命中时，你可以对同一目标再发动一次攻击。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-gloom-stalker-shadowy-dodge', subclassId: 'subclass-2024-ranger-gloom-stalker', name: '如影随行', englishName: 'Shadowy Dodge', level: 15,
    summary: '被攻击检定时可用反应使该次攻击具有劣势，并立即传送 30 尺。',
    description: '当一个生物对你发动攻击检定时，你可以用反应使该次攻击检定具有劣势，并在攻击命中或失手后传送至多 30 尺到一处你可见的未占据空间。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },

  // ============ 猎人 ============
  {
    id: 'ranger-2024-hunter-hunters-lore', subclassId: 'subclass-2024-ranger-hunter', name: '猎人学识', englishName: "Hunter's Lore", level: 3,
    summary: '被猎人印记标记的生物的免疫、抗性与易伤对你可知。',
    description: '当一个生物被你的猎人印记标记时，你知道该生物是否拥有免疫、抗性或易伤，并得知其具体项目。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-hunter-hunters-prey', subclassId: 'subclass-2024-ranger-hunter', name: '猎杀技艺', englishName: "Hunter's Prey", level: 3,
    summary: '选择巨像屠夫（对不满血目标追加 1d8，每回合一次）或灭族者（每回合一次对邻近另一生物追加攻击）；短休或长休可更换。',
    description: '你从以下选项中选择其一，每次短休或长休时可更换：巨像屠夫——当你用武器命中一个生命值不满的生物时，额外造成 1d8 伤害（每回合一次）；灭族者——每个你的回合一次，当你用武器攻击时，可以对目标 5 尺内的另一生物发动另一次攻击，该目标必须在你武器射程内且本回合未被攻击过。',
    kind: 'choice', requiresChoice: true, optionIds: ['hunter-2024-prey-colossus-slayer', 'hunter-2024-prey-horde-breaker'], minSelections: 1, maxSelections: 1, status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-hunter-defensive-tactics', subclassId: 'subclass-2024-ranger-hunter', name: '防守战术', englishName: 'Defensive Tactics', level: 7,
    summary: '选择冲出重围（对你借机攻击劣势）或多重防御（命中你的生物本回合后续攻击劣势）；短休或长休可更换。',
    description: '你从以下选项中选择其一，每次短休或长休时可更换：冲出重围——对你发动的借机攻击具有劣势；多重防御——当一个生物的攻击检定命中你时，该生物在本回合内对你进行的其他攻击检定具有劣势。',
    kind: 'choice', requiresChoice: true, optionIds: ['hunter-2024-defense-escape-the-horde', 'hunter-2024-defense-multiattack-defense'], minSelections: 1, maxSelections: 1, status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-hunter-superior-hunters-prey', subclassId: 'subclass-2024-ranger-hunter', name: '高阶猎杀技艺', englishName: "Superior Hunter's Prey", level: 11,
    summary: '每回合一次，对被猎人印记目标造成伤害时，可对 30 尺内另一可见生物施加猎人印记的额外伤害。',
    description: '每回合一次，当你对被你的猎人印记所标记的生物造成伤害时，你可以对位于该生物 30 尺范围内的另一名你能看见的生物同样施加猎人印记造成的额外伤害。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'ranger-2024-hunter-superior-hunters-defense', subclassId: 'subclass-2024-ranger-hunter', name: '高阶防守战术', englishName: "Superior Hunter's Defense", level: 15,
    summary: '受到伤害时可用反应获得对该伤害类型（及同类型伤害）的抗性直到本回合结束。',
    description: '当你受到伤害时，你可以用反应获得对该次伤害类型（以及同类型的其他伤害）的抗性，直到当前回合结束。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
]

export const rangerSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-ranger-beast-master',
    classId: 'class-2024-ranger',
    ruleset: '5e-2024',
    name: '驯兽师',
    englishName: 'Beast Master',
    selectionLevel: 3,
    summary: '与原初野兽并肩作战：原初行侣、特效训练、兽性狂怒与法术共享。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: rangerSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-ranger-beast-master'),
  },
  {
    id: 'subclass-2024-ranger-fey-wanderer',
    classId: 'class-2024-ranger',
    ruleset: '5e-2024',
    name: '妖精漫游者',
    englishName: 'Fey Wanderer',
    selectionLevel: 3,
    summary: '以妖精魅力扰乱敌人：哀惧灵袭、妖冶娴都、妖思魅缕、精宸所与与雾行漫游。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: rangerSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-ranger-fey-wanderer'),
    alwaysPreparedSpellIdsByLevel: FEY_WANDERER_SPELLS,
  },
  {
    id: 'subclass-2024-ranger-gloom-stalker',
    classId: 'class-2024-ranger',
    ruleset: '5e-2024',
    name: '幽域追猎者',
    englishName: 'Gloom Stalker',
    selectionLevel: 3,
    summary: '在黑暗中先发制人：恐惧伏击、阴影视野、钢铁意志、追猎如风与如影随行。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: rangerSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-ranger-gloom-stalker'),
    alwaysPreparedSpellIdsByLevel: GLOOM_STALKER_SPELLS,
  },
  {
    id: 'subclass-2024-ranger-hunter',
    classId: 'class-2024-ranger',
    ruleset: '5e-2024',
    name: '猎人',
    englishName: 'Hunter',
    selectionLevel: 3,
    summary: '以猎杀技艺与防守战术应对各类猎物：猎人学识、猎杀技艺、防守战术与高阶技艺。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: rangerSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-ranger-hunter'),
  },
]
