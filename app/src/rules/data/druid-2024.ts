import type { ChoiceCheckpoint, ClassFeature, ClassRule, RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'
import { spells2024 } from '@/rules/data/spells-2024'

/**
 * 2024 德鲁伊与 4 个结社（B08-07）。
 *
 * 规则依据：B01《职业-全量》CV-016、CV-015／017—019 与项目内《5e 不全书》2024 德鲁伊章节；
 * `docs/classes/subclasses/druid/*.md` 提供结构与边界说明。
 * 特性名称采用 5e 不全书译名，摘要与详情为原创中文转述。
 * 荒野变形与荒野伙伴涉及生物数据（AC-08）：只登记使用次数、可用等级与边界，不生成野兽数值。
 */
const sourceIds = ['source-2024-phb'] as const

/** 德鲁伊技能候选：奥秘、驯兽、洞悉、医药、自然、察觉、宗教、求生。 */
const DRUID_SKILL_OPTION_IDS = [
  'skill-arcana',
  'skill-animal-handling',
  'skill-insight',
  'skill-medicine',
  'skill-nature',
  'skill-perception',
  'skill-religion',
  'skill-survival',
] as const

// 2024 德鲁伊施法表（B01 CV-016 核对）：不复用 2014 常量，按版本独立登记。
const DRUID_PREPARED_COUNTS = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22] as const
const DRUID_CANTRIPS = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] as const
const DRUID_MAX_SPELL_LEVELS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 9] as const
const DRUID_SPELL_SLOTS = [
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

/** 荒野变形使用次数：2 级起 2 次，6 级起 3 次，17 级起 4 次。 */
const WILD_SHAPE_USES = [0, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4] as const

const druidClassSpellIds2024 = spells2024
  .filter((spell) => spell.classIds.includes('class-2024-druid'))
  .map((spell) => spell.id)

/** 大地结社：长休时选择地形，地形法术始终准备。 */
const LAND_ARID_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-fire-bolt', 'spell-2024-burning-hands', 'spell-2024-blur'],
  5: ['spell-2024-fireball'],
  7: ['spell-2024-blight'],
  9: ['spell-2024-wall-of-stone'],
}
const LAND_POLAR_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-ray-of-frost', 'spell-2024-fog-cloud', 'spell-2024-hold-person'],
  5: ['spell-2024-sleet-storm'],
  7: ['spell-2024-ice-storm'],
  9: ['spell-2024-cone-of-cold'],
}
const LAND_TEMPERATE_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-shocking-grasp', 'spell-2024-sleep', 'spell-2024-misty-step'],
  5: ['spell-2024-lightning-bolt'],
  7: ['spell-2024-freedom-of-movement'],
  9: ['spell-2024-tree-stride'],
}
const LAND_TROPICAL_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-acid-splash', 'spell-2024-web', 'spell-2024-ray-of-sickness'],
  5: ['spell-2024-stinking-cloud'],
  7: ['spell-2024-polymorph'],
  9: ['spell-2024-insect-plague'],
}

/** 德鲁伊职业专属选项：原初职能、元素之怒与大地结社地形。 */
export const druidOptions2024: readonly RuleOption[] = [
  {
    id: 'druid-2024-primal-order-magician', name: '术师', englishName: 'Magician',
    description: '额外从德鲁伊法术列表习得一道戏法；智力（奥秘、自然）检定获得等于感知调整值（至少 +1）的加值。',
    status: 'implemented', sourceIds,
    cantripBonus: 1,
  },
  {
    id: 'druid-2024-primal-order-warden', name: '卫士', englishName: 'Warden',
    description: '为战斗做足训练：获得军用武器熟练与中甲受训。',
    status: 'implemented', sourceIds,
    armorTraining: ['medium'],
    weaponTraining: { categories: ['martial'] },
  },
  {
    id: 'druid-2024-elemental-fury-potent-spellcasting', name: '强力施法', englishName: 'Potent Spellcasting',
    description: '德鲁伊戏法造成的伤害加上感知调整值（15 级起射程 10 尺以上的德鲁伊戏法射程 +300 尺）。',
    status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-elemental-fury-primal-strike', name: '原力蛮击', englishName: 'Primal Strike',
    description: '每回合一次，武器攻击或野兽形态攻击命中时额外造成 1d8 寒冷／火焰／闪电／雷鸣伤害（15 级提升至 2d8）。',
    status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-land-arid', name: '荒漠', englishName: 'Arid Land',
    description: '地形法术：3 级火焰箭、燃烧之手、朦胧术；5 级火球术；7 级枯萎术；9 级石墙术。',
    status: 'implemented', sourceIds,
    alwaysPreparedSpellIdsByLevel: LAND_ARID_SPELLS,
  },
  {
    id: 'druid-2024-land-polar', name: '极地', englishName: 'Polar Land',
    description: '地形法术：3 级冷冻射线、云雾术、定身类人；5 级雪雨暴；7 级冰风暴；9 级寒冰锥。',
    status: 'implemented', sourceIds,
    alwaysPreparedSpellIdsByLevel: LAND_POLAR_SPELLS,
  },
  {
    id: 'druid-2024-land-temperate', name: '温带', englishName: 'Temperate Land',
    description: '地形法术：3 级电爪、睡眠术、迷踪步；5 级闪电束；7 级行动自如；9 级树跃术。',
    status: 'implemented', sourceIds,
    alwaysPreparedSpellIdsByLevel: LAND_TEMPERATE_SPELLS,
  },
  {
    id: 'druid-2024-land-tropical', name: '热带', englishName: 'Tropical Land',
    description: '地形法术：3 级酸液飞溅、蛛网术、致病射线；5 级臭云术；7 级变形术；9 级疫病虫群。',
    status: 'implemented', sourceIds,
    alwaysPreparedSpellIdsByLevel: LAND_TROPICAL_SPELLS,
  },
]

export const druidFeatures2024: readonly ClassFeature[] = [
  {
    id: 'druid-2024-class-spellcasting', classId: 'class-2024-druid', name: '施法', englishName: 'Spellcasting', level: 1,
    summary: '感知施法：1 级 2 戏法、4 道准备法术；准备数量按职业表，长休可更换；始终准备法术不占上限。',
    description: '施法属性为感知，可使用德鲁伊法器作为施法法器。1 级时知晓 2 道德鲁伊戏法，并准备 4 道一环德鲁伊法术；4 级与 10 级各额外习得一道戏法。准备法术数量按职业表随等级提升，所选法术环级不得超过当前拥有的法术位环级。完成长休时可将任意数量已准备法术替换为其他德鲁伊法术。其他特性授予的始终准备法术不计入准备数量，但对你而言都视为德鲁伊法术。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-class-druidic', classId: 'class-2024-druid', name: '德鲁伊语', englishName: 'Druidic', level: 1,
    summary: '习得德鲁伊密语，并始终准备动物交谈；密语可传递隐藏信息（他人需 DC15 智力（调查）察觉）。',
    description: '你学会德鲁伊语——德鲁伊之间的秘密语言，并始终准备法术动物交谈。你可以用德鲁伊语传递隐藏信息：其他知晓该语言者能自动辨认，其他人必须通过 DC 15 智力（调查）检定才能意识到信息存在，且不借助魔法无法解读。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-class-primal-order', classId: 'class-2024-druid', name: '原初职能', englishName: 'Primal Order', level: 1,
    summary: '选择术师（额外戏法与奥秘／自然检定加值）或卫士（军用武器与中甲受训）。',
    description: '你投身于一种原初职能：术师——额外习得一道德鲁伊戏法，并在智力（奥秘、自然）检定中获得等于感知调整值（至少 +1）的加值；卫士——获得军用武器熟练与中甲受训。该选择在时间线中确认并持久保存。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-druid-primal-order-1'], status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-class-wild-shape', classId: 'class-2024-druid', name: '荒野变形', englishName: 'Wild Shape', level: 2,
    summary: '附赠动作变形为已知野兽形态（2 级 4 种、CR 1/4；4 级 6 种、CR 1/2；8 级 8 种、CR 1、可飞行）；次数 2／3／4。',
    description: '以一个附赠动作，你变形为一只已学会的野兽形态，持续至多德鲁伊等级一半的小时数，或直到你再次使用、陷入失能或死亡；也可用附赠动作提前结束。使用次数：2 级起 2 次，6 级起 3 次，17 级起 4 次；完成短休恢复 1 次，长休恢复全部。已知形态：2 级 4 种（最大 CR 1/4、无飞行），4 级 6 种（CR 1/2），8 级 8 种（CR 1、可使用飞行速度）；每次长休可更换一种。变形期间获得等于德鲁伊等级的临时生命值，游戏数据替换为野兽数据卡（保留生物类型、生命值、生命骰、智力／感知／魅力、职业特性、语言、专长与熟练）；不能施法但不会打断专注；装备处理见规则正文。生物数据卡未装配前，本条目只登记形态数量、CR 与飞行解锁节点，不生成野兽数值。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: WILD_SHAPE_USES, recovery: 'short-rest', note: '短休恢复 1 次，长休全部恢复；野兽数据未装配，只登记次数与形态等级边界（AC-08）' },
  },
  {
    id: 'druid-2024-class-wild-companion', classId: 'class-2024-druid', name: '荒野伙伴', englishName: 'Wild Companion', level: 2,
    summary: '魔法动作消耗一个法术位或一次荒野变形次数施展寻获魔宠，无需材料成分；魔宠为妖精，长休时消失。',
    description: '以一个魔法动作，你可以消耗一个法术位或一次荒野变形使用次数来施展寻获魔宠，无需任何材料成分。以该方式获得的魔宠为妖精，并在你完成一次长休时消失。',
    kind: 'action', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-class-subclass', classId: 'class-2024-druid', name: '德鲁伊子职', englishName: 'Druid Subclass', level: 3,
    summary: '选择大地、月亮、海洋或星辰结社，并在 3、6、10、14 级获得其特性。',
    description: '你在 3 级选择一项德鲁伊子职：大地结社、月亮结社、海洋结社或星辰结社。此后获得该结社的全部能力，前提是所需等级不超过你的德鲁伊等级。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-druid-subclass-3'], status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-class-wild-resurgence', classId: 'class-2024-druid', name: '荒野复苏', englishName: 'Wild Resurgence', level: 5,
    summary: '每回合一次可用法术位换取一次荒野变形；或消耗一次荒野变形换取一环法术位（每次长休 1 次）。',
    description: '每个你的回合内一次，如果你没有荒野变形使用次数，你可以消耗一个法术位（无需动作）获得一次荒野变形使用次数。此外，你可以消耗一次荒野变形使用次数（无需动作）令自己获得一个一环法术位，然后直至完成长休前都无法再次如此做。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-class-elemental-fury', classId: 'class-2024-druid', name: '元素之怒', englishName: 'Elemental Fury', level: 7,
    summary: '选择强力施法（戏法伤害加感知）或原力蛮击（每回合一次追加 1d8 元素伤害）。',
    description: '元素之力在你体内流淌，你从以下两项中选择其一：强力施法——将感知调整值加到任何德鲁伊戏法造成的伤害上；原力蛮击——每个你的回合一次，武器攻击或荒野变形中野兽形态的攻击命中时，额外造成 1d8 寒冷、火焰、闪电或雷鸣伤害（命中时选择）。该选择在时间线中确认并持久保存。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-druid-elemental-fury-7'], status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-class-improved-elemental-fury', classId: 'class-2024-druid', name: '元素狂怒', englishName: 'Improved Elemental Fury', level: 15,
    summary: '强力施法：射程 10 尺以上的德鲁伊戏法射程 +300 尺；原力蛮击：额外伤害提升至 2d8。',
    description: '你所选择的元素之怒获得强化：强力施法——当你施展施法距离为 10 尺或更高的德鲁伊戏法时，其射程提升 300 尺；原力蛮击——原力蛮击的额外伤害提升至 2d8。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-class-beast-spells', classId: 'class-2024-druid', name: '兽形施法', englishName: 'Beast Spells', level: 18,
    summary: '可在任何荒野变形下施法；但需要标价材料成分或消耗材料成分的法术仍不可施展。',
    description: '你可以在任何荒野变形下施法。当一个法术需要标有价值的材料成分或需要消耗材料成分时，你无法在荒野变形下施展。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-class-epic-boon', classId: 'class-2024-druid', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长，或其他满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一项你选择的、满足条件且适用的专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-druid-feat-19'], status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-class-archdruid', classId: 'class-2024-druid', name: '大德鲁伊', englishName: 'Archdruid', level: 20,
    summary: '先攻时若无荒野变形次数则恢复 1 次；可把未使用的荒野变形次数转为法术位（每次长休 1 次）；衰老减缓。',
    description: '自然的活力在你身上永不凋零：不凋化形——投掷先攻时若你没有荒野变形使用次数，获得一次；自然术使——可将未使用的荒野变形使用次数转化为法术位（无需动作），每个使用次数转为 2 个法术环阶（例如 2 次转出四环法术位），此增益每次长休 1 次；青春永驻——每经过 10 年，你的身体只衰老 1 年。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const druidRule2024: ClassRule = {
  id: 'class-2024-druid',
  ruleset: '5e-2024',
  name: '德鲁伊',
  englishName: 'Druid',
  summary: '2024版自然神术施法者：准备施法、荒野变形与结社特化，兼顾治疗、控制与形态作战。',
  hitDie: 8,
  primaryAbilities: ['wis'],
  playStyleTags: ['spellcaster', 'support', 'skirmisher'],
  savingThrowAbilities: ['int', 'wis'],
  status: 'implemented',
  sourceIds,
  armorTraining: ['light', 'shield'],
  weaponTraining: { categories: ['simple'] },
  features: druidFeatures2024,
  checkpoints: [
    {
      id: 'class-2024-druid-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择2项德鲁伊技能', description: '从德鲁伊技能列表中选择2项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: DRUID_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-druid-primal-order-1', level: 1, step: 'timeline', kind: 'class-choice',
      title: '选择原初职能', description: '选择术师或卫士；术师获得额外戏法与知识检定加值，卫士获得军用武器与中甲受训。',
      required: true, minSelections: 1, maxSelections: 1,
      optionIds: ['druid-2024-primal-order-magician', 'druid-2024-primal-order-warden'],
    },
    ...([4, 8, 12, 16] as const).map((level): ChoiceCheckpoint => ({
      id: `class-2024-druid-feat-${level}`, level, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    {
      id: 'class-2024-druid-elemental-fury-7', level: 7, step: 'timeline', kind: 'class-choice',
      title: '选择元素之怒', description: '选择强力施法或原力蛮击，15 级时同一选项获得强化。',
      required: true, minSelections: 1, maxSelections: 1,
      optionIds: ['druid-2024-elemental-fury-potent-spellcasting', 'druid-2024-elemental-fury-primal-strike'],
    },
    {
      id: 'class-2024-druid-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '19级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
  spellcasting: {
    ruleset: '5e-2024',
    mode: 'prepared',
    ability: 'wis',
    startsAtLevel: 1,
    preparedCountByLevel: DRUID_PREPARED_COUNTS,
    cantripsKnownByLevel: DRUID_CANTRIPS,
    maxSpellLevelByClassLevel: DRUID_MAX_SPELL_LEVELS,
    slotsByClassLevel: DRUID_SPELL_SLOTS,
    classSpellIds: druidClassSpellIds2024,
    alwaysPreparedSpellIdsByLevel: { 1: ['spell-2024-speak-with-animals'] },
  },
}

export const druidSubclassFeatures2024: readonly SubclassFeature[] = [
  // ============ 大地结社 ============
  {
    id: 'druid-2024-land-circle-spells', subclassId: 'subclass-2024-druid-circle-of-the-land', name: '大地结社法术', englishName: 'Circle of the Land Spells', level: 3,
    summary: '长休时选择荒漠／极地／温带／热带地形，按 3／5／7／9 级获得对应地形法术始终准备。',
    description: '当你完成一次长休时，选择一种地形：荒漠、极地、温带或热带。到达对应德鲁伊等级时，你始终准备该地形的结社法术：3 级获得一道戏法与两道法术，5／7／9 级各获得一道（或两道）法术。这些法术不计入你的准备上限。地形可在每次长休时更换（长休更换流程归 B10）。',
    kind: 'choice', requiresChoice: true, optionIds: ['druid-2024-land-arid', 'druid-2024-land-polar', 'druid-2024-land-temperate', 'druid-2024-land-tropical'],
    minSelections: 1, maxSelections: 1, status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-land-lands-aid', subclassId: 'subclass-2024-druid-circle-of-the-land', name: '大地之援', englishName: "Land's Aid", level: 3,
    summary: '魔法动作消耗一次荒野变形：60 尺内 10 尺球状区域，目标体质豁免失败受 2d6 暗蚀，另选一名生物恢复 2d6；10／14 级提升至 3d6／4d6。',
    description: '以一个魔法动作，你可以消耗一次荒野变形使用次数并选择 60 尺内一点，在以该点为源点的 10 尺半径球状区域生出繁花与荆刺。区域内每个你选择的生物进行一次对抗你法术豁免 DC 的体质豁免：失败受到 2d6 暗蚀伤害，成功则伤害减半。此外，区域内你选择的一名生物恢复 2d6 生命值。伤害与治疗量在 10 级提升至 3d6、14 级提升至 4d6。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-land-natural-recovery', subclassId: 'subclass-2024-druid-circle-of-the-land', name: '自然恢复', englishName: 'Natural Recovery', level: 6,
    summary: '每长休 1 次免费施展一道结社法术；短休可恢复总环级不超过半数德鲁伊等级的法术位（每次长休 1 次）。',
    description: '你可以施展一道你以结社法术特性准备的、一环或更高环阶的法术，而无须消耗法术位；此效果每次长休 1 次。此外，当你完成一次短休时，你可以恢复已消耗的法术位：所恢复法术位的环阶总和不超过你德鲁伊等级的一半（向上取整），且不能恢复六环或更高环阶的法术位。此恢复每次长休 1 次。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-land-natures-ward', subclassId: 'subclass-2024-druid-circle-of-the-land', name: '自然守御', englishName: "Nature's Ward", level: 10,
    summary: '免疫中毒；按当前地形获得对应抗性（荒漠火焰／极地寒冷／温带闪电／热带毒素）。',
    description: '你免疫中毒状态，并获得与你在结社法术特性中所选地形相关的伤害类型抗性：荒漠——火焰；极地——寒冷；温带——闪电；热带——毒素。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-land-natures-sanctuary', subclassId: 'subclass-2024-druid-circle-of-the-land', name: '自然庇护', englishName: "Nature's Sanctuary", level: 14,
    summary: '魔法动作消耗一次荒野变形：120 尺内 15 尺立方灵体丛林，你与盟友获得半身掩护、盟友获得自然守御抗性；附赠动作可移动 60 尺。',
    description: '以一个魔法动作，你可以消耗一次荒野变形使用次数，在距你 120 尺内的地面上制造 15 尺立方区域的灵体丛林与藤蔓，持续 1 分钟或直至你陷入失能状态或死亡。区域内你与盟友获得半身掩护，盟友还获得你自然守御特性提供的伤害抗性。以一个附赠动作，你可以将立方区域在你 120 尺内移动至多 60 尺。',
    kind: 'resource', status: 'implemented', sourceIds,
  },

  // ============ 星辰结社 ============
  {
    id: 'druid-2024-stars-star-map', subclassId: 'subclass-2024-druid-circle-of-the-stars', name: '星图', englishName: 'Star Map', level: 3,
    summary: '持握星图时始终准备神导术与光导箭，并可免费施展光导箭等于感知调整值次（至少 1 次，长休恢复）。',
    description: '你创造一张星图（微型物件，可作德鲁伊法器）。持握星图期间，你视作始终准备神导术与光导箭，并可施展光导箭而无需消耗法术位；免费施展次数等于你的感知调整值（至少 1 次），完成长休时重获全部次数。若星图丢失，可通过 1 小时仪式（可在短休或长休中进行）重造并摧毁原星图。形态掷 1d6 决定。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-stars-starry-form', subclassId: 'subclass-2024-druid-circle-of-the-stars', name: '星耀形态', englishName: 'Starry Form', level: 3,
    summary: '附赠动作消耗一次荒野变形呈现星耀形态 10 分钟，选择射手（光箭 1d8＋感知）／圣杯（治疗 1d8＋感知）／巨龙（d20 的 9 视为 10）之一。',
    description: '以一个附赠动作，你可以消耗一次荒野变形使用次数呈现星耀形态（而非变形为野兽）。形态持续 10 分钟或直至你解除（无需动作）、失能、死亡或再次使用。你散发 10 尺明亮光照与其外 10 尺微光光照，并选择一种星座：射手——激活时及后续回合可用附赠动作发射光箭，远程法术攻击命中造成 1d8 + 感知调整值光耀伤害；圣杯——消耗法术位施展治疗法术时，你或 30 尺内另一生物恢复 1d8 + 感知调整值生命；巨龙——智力或感知检定、以及为维持专注的体质豁免中，可将 d20 的 9 或以下视为 10。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-stars-cosmic-omen', subclassId: 'subclass-2024-druid-circle-of-the-stars', name: '宇宙预兆', englishName: 'Cosmic Omen', level: 6,
    summary: '每次长休掷骰决定吉兆（偶数：d6 加值）或凶兆（奇数：d6 减值）；反应次数＝感知调整值，长休恢复。',
    description: '每当你完成一次长休时，参照星图掷一枚骰子，直到下次长休前获得基于奇偶性的反应能力：吉兆（偶数）——30 尺内可见生物进行 d20 检定时，用反应投 d6 加入结果；凶兆（奇数）——用反应投 d6 从结果中减去。使用次数等于你的感知调整值（至少 1 次），完成长休时重获全部次数。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-stars-twinkling-constellations', subclassId: 'subclass-2024-druid-circle-of-the-stars', name: '闪烁星座', englishName: 'Twinkling Constellations', level: 10,
    summary: '射手与圣杯提升至 2d8；巨龙获得 20 尺飞行与悬浮；每回合开始可更换星座。',
    description: '你的星耀形态星座增强：射手座与圣杯座的 1d8 变为 2d8；巨龙座激活期间获得 20 尺飞行速度并可悬浮。此外，每个你的回合开始时，若你处于星耀形态，可以更改当前闪耀的星座。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-stars-full-of-stars', subclassId: 'subclass-2024-druid-circle-of-the-stars', name: '灿若繁星', englishName: 'Full of Stars', level: 14,
    summary: '星耀形态期间获得对钝击、穿刺与挥砍伤害的抗性。',
    description: '处于星耀形态期间，你的身体部分无实质化，获得对钝击、穿刺与挥砍伤害的抗性。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 月亮结社 ============
  {
    id: 'druid-2024-moon-circle-forms', subclassId: 'subclass-2024-druid-circle-of-the-moon', name: '结社形态', englishName: 'Circle Forms', level: 3,
    summary: '荒野变形最大 CR＝德鲁伊等级三分之一；形态 AC 可用 13＋感知调整值取代；变形时获得 3×等级临时生命。',
    description: '你学会在使用荒野变形时引导月之魔力：挑战等级——荒野变形形态的最大挑战等级等于你德鲁伊等级的三分之一（向下取整）；护甲等级——变形期间，若 13 + 你的感知调整值高于野兽的 AC，则你的 AC 等于 13 + 感知调整值；临时生命值——变形时获得等于德鲁伊等级三倍的临时生命值。野兽数据卡未装配前，本条目只登记规则边界，不生成具体形态数值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-moon-circle-spells', subclassId: 'subclass-2024-druid-circle-of-the-moon', name: '月亮结社法术', englishName: 'Circle of the Moon Spells', level: 3,
    summary: '3／5／7／9 级获得始终准备法术（点点星芒、疗伤术、月华之光、咒唤兽群等），并可在荒野变形下施展。',
    description: '到达对应德鲁伊等级时，你始终准备月亮结社法术：3 级——点点星芒、疗伤术、月华之光；5 级——咒唤兽群；7 级——月光涌泉；9 级——群体疗伤术。这些法术不计入准备上限，并且你可以在荒野变形下施展它们。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-moon-improved-circle-forms', subclassId: 'subclass-2024-druid-circle-of-the-moon', name: '进阶结社形态', englishName: 'Improved Circle Forms', level: 6,
    summary: '荒野变形攻击可选光耀伤害；体质豁免加感知调整值。',
    description: '荒野变形期间：月耀辉光——每次攻击可选择造成普通伤害或光耀伤害（命中时选择）；强化韧性——将感知调整值加到体质豁免结果中。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-moon-moonlight-step', subclassId: 'subclass-2024-druid-circle-of-the-moon', name: '月光飞步', englishName: 'Moonlight Step', level: 10,
    summary: '附赠动作传送 30 尺，本回合下次攻击有优势；次数＝感知调整值，长休恢复，可用二环以上法术位恢复次数。',
    description: '以一个附赠动作，你传送至多 30 尺到一处你能看见的未占据空间，并在本回合结束前进行的下一次攻击具有优势。使用次数等于你的感知调整值（至少 1 次），完成长休时重获全部次数；你也可以消耗一个二环或更高的法术位恢复一次使用次数（无需动作）。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-moon-lunar-form', subclassId: 'subclass-2024-druid-circle-of-the-moon', name: '月辉形态', englishName: 'Lunar Form', level: 14,
    summary: '每回合一次，荒野变形攻击命中可追加 2d10 光耀；月光飞步可携带 10 尺内一名自愿生物。',
    description: '月之力量充盈你的身体：月耀炽光——每回合一次，对荒野变形下攻击命中的目标额外造成 2d10 光耀伤害；月辉同行——使用月光飞步时，可将 10 尺内一名自愿生物一并传送，该生物出现在你出现点 10 尺内一处你能看见的未占据空间。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 海洋结社 ============
  {
    id: 'druid-2024-sea-circle-spells', subclassId: 'subclass-2024-druid-circle-of-the-sea', name: '海洋结社法术', englishName: 'Circle of the Sea Spells', level: 3,
    summary: '3／5／7／9 级获得始终准备法术（冷冻射线、云雾术、雷鸣波、闪电束、冰风暴等）。',
    description: '到达对应德鲁伊等级时，你始终准备海洋结社法术：3 级——冷冻射线、云雾术、雷鸣波、造风术、粉碎音波；5 级——闪电束、水下呼吸；7 级——操控水体、冰风暴；9 级——咒唤元素、定身怪物。这些法术不计入准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-sea-wrath-of-the-sea', subclassId: 'subclass-2024-druid-circle-of-the-sea', name: '瀚海之怒', englishName: 'Wrath of the Sea', level: 3,
    summary: '附赠动作消耗一次荒野变形显现 5 尺海浪光环 10 分钟；附赠动作迫使光环内可见生物体质豁免，失败受感知枚 d6 寒冷并被推离至多 15 尺。',
    description: '以一个附赠动作，你可以消耗一次荒野变形使用次数，在自身周围显现 5 尺光环的海浪形态，持续 10 分钟或直至你解除（无需动作）、再次显现或陷入失能。显现时以及后续回合中以一个附赠动作，你可以选择光环范围内一名你可见的生物：目标必须通过一次对抗你法术豁免 DC 的体质豁免，否则受到寒冷伤害（掷等于你感知调整值数量、最少 1 枚 d6），若其为大型或更小体型还会被推离至多 15 尺。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-sea-aquatic-affinity', subclassId: 'subclass-2024-druid-circle-of-the-sea', name: '水生亲和', englishName: 'Aquatic Affinity', level: 6,
    summary: '瀚海之怒光环提升至 10 尺；获得等于速度的游泳速度。',
    description: '你的瀚海之怒光环范围提升至 10 尺。此外，你获得等于你速度的游泳速度。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-sea-stormborn', subclassId: 'subclass-2024-druid-circle-of-the-sea', name: '风暴降生', englishName: 'Stormborn', level: 10,
    summary: '瀚海之怒激活时获得等于速度的飞行速度，以及寒冷、闪电与雷鸣伤害抗性。',
    description: '你的瀚海之怒特性在激活时获得：飞行——获得等于你速度的飞行速度；抗性——获得对寒冷、闪电与雷鸣伤害的抗性。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'druid-2024-sea-oceanic-gift', subclassId: 'subclass-2024-druid-circle-of-the-sea', name: '大洋慨赠', englishName: 'Oceanic Gift', level: 14,
    summary: '瀚海之怒可移至 60 尺内一名自愿生物；消耗两次荒野变形可同时在两处显现。',
    description: '当你使用瀚海之怒时，你可以让 60 尺内一名自愿生物而非自己身上显现光环；该生物获得光环的所有增益，并使用你的法术豁免 DC 与感知调整值。此外，如果你消耗两次而非一次荒野变形使用次数，可以同时在你自己与另一生物身上显现光环。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const druidSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-druid-circle-of-the-land',
    classId: 'class-2024-druid',
    ruleset: '5e-2024',
    name: '大地结社',
    englishName: 'Circle of the Land',
    selectionLevel: 3,
    summary: '以地形法术与自然恢复支援队伍，高等级获得地形抗性与灵体丛林庇护。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: druidSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-druid-circle-of-the-land'),
  },
  {
    id: 'subclass-2024-druid-circle-of-the-stars',
    classId: 'class-2024-druid',
    ruleset: '5e-2024',
    name: '星辰结社',
    englishName: 'Circle of the Stars',
    selectionLevel: 3,
    summary: '以星图与星耀形态作战：射手、圣杯与巨龙星座提供输出、治疗或检定稳定，高等级飞行与抗性。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: druidSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-druid-circle-of-the-stars'),
    alwaysPreparedSpellIdsByLevel: { 3: ['spell-2024-guidance', 'spell-2024-guiding-bolt'] },
  },
  {
    id: 'subclass-2024-druid-circle-of-the-moon',
    classId: 'class-2024-druid',
    ruleset: '5e-2024',
    name: '月亮结社',
    englishName: 'Circle of the Moon',
    selectionLevel: 3,
    summary: '强化荒野变形：更高 CR 与临时生命、光耀攻击与感知加成，可携带同伴传送。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: druidSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-druid-circle-of-the-moon'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-starry-wisp', 'spell-2024-cure-wounds', 'spell-2024-moonbeam'],
      5: ['spell-2024-conjure-animals'],
      7: ['spell-2024-fount-of-moonlight'],
      9: ['spell-2024-mass-cure-wounds'],
    },
  },
  {
    id: 'subclass-2024-druid-circle-of-the-sea',
    classId: 'class-2024-druid',
    ruleset: '5e-2024',
    name: '海洋结社',
    englishName: 'Circle of the Sea',
    selectionLevel: 3,
    summary: '以海浪光环持续压制与推离敌人，中高等级获得游泳、飞行与寒冷／闪电／雷鸣抗性。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: druidSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-druid-circle-of-the-sea'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-ray-of-frost', 'spell-2024-fog-cloud', 'spell-2024-thunderwave', 'spell-2024-gust-of-wind', 'spell-2024-shatter'],
      5: ['spell-2024-lightning-bolt', 'spell-2024-water-breathing'],
      7: ['spell-2024-control-water', 'spell-2024-ice-storm'],
      9: ['spell-2024-conjure-elemental', 'spell-2024-hold-monster'],
    },
  },
]
