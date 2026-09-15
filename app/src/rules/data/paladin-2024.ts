import type { ChoiceCheckpoint, ClassFeature, ClassRule, SubclassFeature, SubclassRule } from '@/types/rules'
import { spells2024 } from '@/rules/data/spells-2024'

/**
 * 2024 圣武士与 4 个誓言（B08-11）。
 *
 * 规则依据：B01《职业-全量》CV-011、CV-010／012—014 与项目内《5e 不全书》2024 圣武士章节；
 * `docs/classes/subclasses/paladin/*.md` 提供结构与边界说明。
 * 特性名称采用 5e 不全书译名，摘要与详情为原创中文转述。
 */
const sourceIds = ['source-2024-phb'] as const

/** 圣武士技能候选：运动、洞悉、威吓、医疗、游说、宗教。 */
const PALADIN_SKILL_OPTION_IDS = [
  'skill-athletics',
  'skill-insight',
  'skill-intimidation',
  'skill-medicine',
  'skill-persuasion',
  'skill-religion',
] as const

/** 武器精通候选：全部 2024 武器（限职业熟练武器，由检查点过滤）。 */
const ALL_WEAPON_OPTION_IDS: readonly string[] = []

// 2024 圣武士成长表（B01 CV-011 核对）。
const PALADIN_PREPARED = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15] as const
/** 引导神力使用次数：3 级起 2 次，11 级起 3 次。 */
const CHANNEL_DIVINITY_USES = [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3] as const
/** 圣疗池：治疗量＝圣武士等级×5，长休补满。 */
const LAY_ON_HANDS = Array.from({ length: 20 }, (_, index) => (index + 1) * 5)
/** 半施法者法术位（1 级无环位，2 级起）。 */
const PALADIN_SPELL_SLOTS = [
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
const PALADIN_MAX_SPELL_LEVELS = PALADIN_SPELL_SLOTS.map((slots) => slots.length)
/** 武器精通固定 2 种（无升级增长）。 */
const PALADIN_MASTERY_COUNTS = Array.from({ length: 20 }, () => 2)

/** 战斗风格专长选项：受祝福的勇士（额外牧师戏法）在专长数据层登记，此处仅登记检查点类别。 */
const FIGHTING_STYLE_CATEGORIES = ['fighting-style'] as const

const paladinClassSpellIds2024 = spells2024
  .filter((spell) => spell.classIds.includes('class-2024-paladin'))
  .map((spell) => spell.id)

/** 誓言法术始终准备：3／5／9／13／17 级。 */
const DEVOTION_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-protection-from-evil-and-good', 'spell-2024-shield-of-faith'],
  5: ['spell-2024-aid', 'spell-2024-zone-of-truth'],
  9: ['spell-2024-beacon-of-hope', 'spell-2024-dispel-magic'],
  13: ['spell-2024-freedom-of-movement', 'spell-2024-guardian-of-faith'],
  17: ['spell-2024-commune', 'spell-2024-flame-strike'],
}
const GLORY_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-guiding-bolt', 'spell-2024-heroism'],
  5: ['spell-2024-enhance-ability', 'spell-2024-magic-weapon'],
  9: ['spell-2024-haste', 'spell-2024-protection-from-energy'],
  13: ['spell-2024-compulsion', 'spell-2024-freedom-of-movement'],
  17: ['spell-2024-legend-lore', 'spell-2024-yolande-s-regal-presence'],
}
const ANCIENTS_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-ensnaring-strike', 'spell-2024-speak-with-animals'],
  5: ['spell-2024-misty-step', 'spell-2024-moonbeam'],
  9: ['spell-2024-plant-growth', 'spell-2024-protection-from-energy'],
  13: ['spell-2024-ice-storm', 'spell-2024-stoneskin'],
  17: ['spell-2024-commune-with-nature', 'spell-2024-tree-stride'],
}
const VENGEANCE_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-bane', 'spell-2024-hunter-s-mark'],
  5: ['spell-2024-hold-person', 'spell-2024-misty-step'],
  9: ['spell-2024-haste', 'spell-2024-protection-from-energy'],
  13: ['spell-2024-banishment', 'spell-2024-dimension-door'],
  17: ['spell-2024-hold-monster', 'spell-2024-scrying'],
}

export const paladinFeatures2024: readonly ClassFeature[] = [
  {
    id: 'paladin-2024-class-lay-on-hands', classId: 'class-2024-paladin', name: '圣疗', englishName: 'Lay on Hands', level: 1,
    summary: '治疗池＝圣武士等级×5，长休补满；附赠动作触碰生物回血，或消耗 5 点治疗量移除中毒。',
    description: '你获得一个治疗能量池，完成长休后自动补满，储备总量等于圣武士等级 × 5。以一个附赠动作，你可以触碰一个生物（可为自己）并抽取池中能量恢复其生命值，恢复量不超过池中剩余治疗量；也可以消耗 5 点治疗量移除目标的中毒状态（不恢复生命值）。14 级复原之触可将该消耗扩展到更多状态。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: LAY_ON_HANDS, recovery: 'long-rest', unit: '点治疗量', note: '附赠动作治疗；5 点可移除中毒（复原之触扩展更多状态）' },
  },
  {
    id: 'paladin-2024-class-spellcasting', classId: 'class-2024-paladin', name: '施法', englishName: 'Spellcasting', level: 1,
    summary: '魅力准备制半施法者：1 级无环位、2 级起 2 个一环；准备数量按职业表，长休可更换。',
    description: '施法属性为魅力，可使用圣徽作为施法法器。半施法者法术位按职业表：1 级无环位，2 级起获得一环法术位，随等级提升最高到五环。准备法术数量按职业表（1 级 2 道、20 级 15 道），所选法术环级不得超过当前拥有的法术位环级；完成长休时可替换任意数量已准备法术。其他特性授予的始终准备法术不计入准备数量。圣武士没有戏法。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-class-weapon-mastery', classId: 'class-2024-paladin', name: '武器精通', englishName: 'Weapon Mastery', level: 1,
    summary: '选择 2 种已熟练武器的精通词条；长休可替换。',
    description: '你对武器的训练使你能够为 2 种你已熟练的武器启用其精通词条（例如长剑和标枪）；每次完成长休时可以更换所选武器类型。持有或熟练武器不会自动获得精通词条。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-paladin-mastery-1'], status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-class-fighting-style', classId: 'class-2024-paladin', name: '战斗风格', englishName: 'Fighting Style', level: 2,
    summary: '获得一项战斗风格专长，或以受祝福的勇士替代（两道牧师戏法，魅力施法）。',
    description: '你获得一项战斗风格专长。作为替代，你也可以选择受祝福的勇士：习得两道由你选择的牧师戏法（对你视为圣武士法术，施法属性为魅力），每获得一级圣武士等级可替换其中一道戏法。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-paladin-style-2'], status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-class-paladins-smite', classId: 'class-2024-paladin', name: '圣武斩', englishName: "Paladin's Smite", level: 2,
    summary: '始终准备至圣斩；可不消耗法术位施展一次（长休恢复）。',
    description: '你始终准备着法术至圣斩。此外，你可以不消耗法术位地施展该法术一次，随后必须完成一次长休才能再次如此施展。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-class-channel-divinity', classId: 'class-2024-paladin', name: '引导神力', englishName: 'Channel Divinity', level: 3,
    summary: '3 级起 2 次、11 级起 3 次；短休恢复 1 次、长休全部恢复；起始选项为神圣感知，子职提供更多选项。',
    description: '你能引导外层位面的神圣能量。起始掌握神圣感知：以一个附赠动作扩展意识，持续 10 分钟，感知 60 尺内的天族、邪魔与亡灵及其生物类型，也能侦测受到圣居一类法术祝福或亵渎的地点与物件。使用次数：3 级起 2 次，11 级起 3 次；完成短休恢复 1 次，完成长休恢复全部。需要豁免的引导神力效应使用你的法术豁免 DC。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: CHANNEL_DIVINITY_USES, recovery: 'short-rest', note: '短休恢复 1 次，长休全部恢复；神圣感知与子职选项' },
  },
  {
    id: 'paladin-2024-class-subclass', classId: 'class-2024-paladin', name: '圣武士子职', englishName: 'Paladin Subclass', level: 3,
    summary: '选择奉献、荣耀、古贤或复仇之誓，并在 3、7、15、20 级获得其特性。',
    description: '你在 3 级选择一项圣武士子职：奉献之誓、荣耀之誓、古贤之誓或复仇之誓。此后获得该誓言的全部能力，前提是所需等级不超过你的圣武士等级。每个誓言代表圣武士必须遵守的誓言主体，并授予始终准备的誓言法术。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-paladin-subclass-3'], status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-class-extra-attack', classId: 'class-2024-paladin', name: '额外攻击', englishName: 'Extra Attack', level: 5,
    summary: '执行攻击动作时可发动两次攻击而非一次。',
    description: '当你在你的回合中执行攻击动作时，你可以发动两次攻击而非一次。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-class-faithful-steed', classId: 'class-2024-paladin', name: '信实坐骑', englishName: 'Faithful Steed', level: 5,
    summary: '始终准备寻获坐骑；可不消耗法术位施展一次（长休恢复）。',
    description: '你始终准备着法术寻获坐骑。此外，你可以不消耗法术位地施展该法术一次，随后必须完成一次长休才能再次如此施展。坐骑数值未装配前，本条目只登记规则边界。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-class-aura-of-protection', classId: 'class-2024-paladin', name: '守护灵光', englishName: 'Aura of Protection', level: 6,
    summary: '10 尺光环内你与盟友的豁免检定获得魅力调整值加值（至少 +1）；失能时失效。',
    description: '你散发出源自你、覆盖 10 尺光环区域的保护灵光，在你陷入失能状态期间失效。你与灵光内盟友的豁免检定获得等于你魅力调整值的加值（至少 +1）。若存在其他圣武士，一名生物同时只能从一个守护灵光中获得增益（由其选择）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-class-abjure-foes', classId: 'class-2024-paladin', name: '弃绝众敌', englishName: 'Abjure Foes', level: 9,
    summary: '引导神力：魔法动作使 60 尺内至多魅力调整值数量的可见生物感知豁免，失败则恐慌 1 分钟且每回合只能移动／动作／附赠动作之一。',
    description: '以一个魔法动作，你消耗一次引导神力使用次数，高举圣徽或武器，选择 60 尺内至多等于你魅力调整值（至少 1）的可见生物。每个目标必须成功通过一次感知豁免，否则陷入恐慌状态 1 分钟（或在受到任何伤害时提前结束）；因此陷入恐慌的生物在其每个回合只能执行移动、动作或附赠动作中的一项。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-class-aura-of-courage', classId: 'class-2024-paladin', name: '勇气灵光', englishName: 'Aura of Courage', level: 10,
    summary: '你与守护灵光内盟友免疫恐慌状态。',
    description: '你与你的盟友在守护灵光内具有对恐慌状态的免疫；若陷入恐慌的盟友进入灵光，该状态在灵光内不会造成影响。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-class-radiant-strikes', classId: 'class-2024-paladin', name: '光耀打击', englishName: 'Radiant Strikes', level: 11,
    summary: '近战武器或徒手打击命中时额外造成 1d8 光耀伤害。',
    description: '神圣之力充盈你身：当你使用近战武器或徒手打击进行攻击检定并命中目标时，目标额外受到 1d8 光耀伤害。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-class-restoring-touch', classId: 'class-2024-paladin', name: '复原之触', englishName: 'Restoring Touch', level: 14,
    summary: '使用圣疗时可额外终止目盲、魅惑、耳聋、恐慌、麻痹或震慑之一或更多，每个状态消耗 5 点治疗量。',
    description: '当你对一个生物使用圣疗时，你可以终止该生物身上以下一种或更多状态：目盲、魅惑、耳聋、恐慌、麻痹或震慑。每终止一个状态需消耗 5 点圣疗治疗量，这些治疗量不会恢复生命值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-class-aura-expansion', classId: 'class-2024-paladin', name: '灵光增效', englishName: 'Aura Expansion', level: 18,
    summary: '守护灵光范围由 10 尺提升至 30 尺。',
    description: '你的守护灵光范围扩大：光环区域由 10 尺提升至 30 尺。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-class-epic-boon', classId: 'class-2024-paladin', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长，或其他满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一项你选择的、满足条件且适用的专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-paladin-feat-19'], status: 'implemented', sourceIds,
  },
]

export const paladinRule2024: ClassRule = {
  id: 'class-2024-paladin',
  ruleset: '5e-2024',
  name: '圣武士',
  englishName: 'Paladin',
  summary: '2024版神圣半施法者：圣疗与引导神力支援队伍，誓言灵光与斩击构成前线核心。',
  hitDie: 10,
  primaryAbilities: ['str', 'cha'],
  playStyleTags: ['frontline', 'support', 'durable'],
  savingThrowAbilities: ['wis', 'cha'],
  status: 'implemented',
  sourceIds,
  armorTraining: ['light', 'medium', 'heavy', 'shield'],
  weaponTraining: { categories: ['simple', 'martial'] },
  features: paladinFeatures2024,
  checkpoints: [
    {
      id: 'class-2024-paladin-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择2项圣武士技能', description: '从圣武士技能列表中选择2项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: PALADIN_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-paladin-mastery-1', level: 1, step: 'timeline', kind: 'weapon-mastery',
      title: '选择武器精通', description: '选择2种已熟练武器的精通词条；长休可替换。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: ALL_WEAPON_OPTION_IDS,
      candidateKind: 'weapon-mastery', selectionCountByLevel: PALADIN_MASTERY_COUNTS, weaponMasteryFilter: 'proficient',
    },
    {
      id: 'class-2024-paladin-style-2', level: 2, step: 'timeline', kind: 'fighting-style',
      title: '选择战斗风格', description: '选择一项战斗风格专长（或以受祝福的勇士替代）。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: FIGHTING_STYLE_CATEGORIES,
    },
    ...([4, 8, 12, 16] as const).map((level): ChoiceCheckpoint => ({
      id: `class-2024-paladin-feat-${level}`, level, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    {
      id: 'class-2024-paladin-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '19级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
  spellcasting: {
    ruleset: '5e-2024',
    mode: 'prepared',
    ability: 'cha',
    startsAtLevel: 1,
    preparedCountByLevel: PALADIN_PREPARED,
    maxSpellLevelByClassLevel: PALADIN_MAX_SPELL_LEVELS,
    slotsByClassLevel: PALADIN_SPELL_SLOTS,
    classSpellIds: paladinClassSpellIds2024,
    alwaysPreparedSpellIdsByLevel: { 2: ['spell-2024-divine-smite'], 5: ['spell-2024-find-steed'] },
  },
}

export const paladinSubclassFeatures2024: readonly SubclassFeature[] = [
  // ============ 奉献之誓 ============
  {
    id: 'paladin-2024-devotion-spells', subclassId: 'subclass-2024-paladin-oath-of-devotion', name: '奉献之誓法术', englishName: 'Oath of Devotion Spells', level: 3,
    summary: '3／5／9／13／17 级获得始终准备的奉献法术（防护善恶、虔诚护盾、援助术、希望信标等）。',
    description: '誓言魔法使你始终准备特定法术：3 级——防护善恶、虔诚护盾；5 级——援助术、诚实之域；9 级——希望信标、解除魔法；13 级——行动自如、信仰守卫；17 级——通神术、焰击术。这些法术不计入准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-devotion-sacred-weapon', subclassId: 'subclass-2024-paladin-oath-of-devotion', name: '圣洁武器', englishName: 'Sacred Weapon', level: 3,
    summary: '引导神力：魔法动作使手中武器 10 分钟内攻击检定加魅力调整值（至少 +1），并可改为光耀伤害。',
    description: '以一个魔法动作，你可以消耗一次引导神力使用次数，将神圣能量注入手中一件武器，持续 10 分钟或直到你再次使用该特性：你用该武器进行攻击检定时加上你的魅力调整值（至少 +1）；你还可以令该武器造成光耀伤害而非原本伤害类型。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-devotion-aura-of-devotion', subclassId: 'subclass-2024-paladin-oath-of-devotion', name: '奉献灵光', englishName: 'Aura of Devotion', level: 7,
    summary: '你与守护灵光内盟友免疫魅惑状态。',
    description: '你与你的盟友在守护灵光内具有对魅惑状态的免疫；若陷入魅惑的盟友进入灵光，该状态在灵光内不会造成影响。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-devotion-smite-of-protection', subclassId: 'subclass-2024-paladin-oath-of-devotion', name: '卫护斩', englishName: 'Smite of Protection', level: 15,
    summary: '施展至圣斩时可令守护灵光同时提供半身掩护，持续至你下回合开始。',
    description: '当你施展至圣斩时，你的守护灵光同时提供保护：直到你的下个回合开始，灵光内你与盟友获得半身掩护。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-devotion-holy-nimbus', subclassId: 'subclass-2024-paladin-oath-of-devotion', name: '至圣光轮', englishName: 'Holy Nimbus', level: 20,
    summary: '附赠动作散发 30 尺日光 10 分钟：区域内敌人受光耀伤害，你对抗邪魔／亡灵的法术豁免优势；每次长休 1 次。',
    description: '以一个附赠动作，你获得至圣光轮，持续 10 分钟或直至你解除（无需动作）：你散发 30 尺明亮光照；每个回合中，光轮内一个由你选择的敌人受到光耀伤害（数值见规则正文）；你对抗邪魔或亡灵施展的法术进行的豁免检定具有优势。此特性每次长休 1 次。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },

  // ============ 荣耀之誓 ============
  {
    id: 'paladin-2024-glory-inspiring-smite', subclassId: 'subclass-2024-paladin-oath-of-glory', name: '鼓舞斩', englishName: 'Inspiring Smite', level: 3,
    summary: '施展至圣斩后可消耗一次引导神力：30 尺内选定生物与你共分 2d8＋圣武士等级临时生命。',
    description: '当你施展至圣斩后，你可以立即消耗一次引导神力使用次数，使 30 尺内由你选择的生物或你自己获得临时生命值：这些生物共获得的临时生命值等于 2d8 + 你的圣武士等级，你可以为其任意分配。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-glory-spells', subclassId: 'subclass-2024-paladin-oath-of-glory', name: '荣耀之誓法术', englishName: 'Oath of Glory Spells', level: 3,
    summary: '3／5／9／13／17 级获得始终准备的荣耀法术（光导箭、英雄气概、强化属性、加速术等）。',
    description: '誓言魔法使你始终准备特定法术：3 级——光导箭、英雄气概；5 级——强化属性、魔化武器；9 级——加速术、防护能量；13 级——强迫术、行动自如；17 级——通晓传奇、悠兰德王者威仪。这些法术不计入准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-glory-peerless-athlete', subclassId: 'subclass-2024-paladin-oath-of-glory', name: '绝伦健将', englishName: 'Peerless Athlete', level: 3,
    summary: '引导神力：附赠动作 1 小时内力量（运动）与敏捷（特技）检定优势，跳跃距离与负重提升（数值见原文）。',
    description: '以一个附赠动作，你可以消耗一次引导神力使用次数，在 1 小时内获得运动员般的体魄：力量（运动）与敏捷（特技）检定具有优势，跳跃距离增加并提升可推拉重量上限（具体数值见规则正文）。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-glory-aura-of-alacrity', subclassId: 'subclass-2024-paladin-oath-of-glory', name: '迅捷灵光', englishName: 'Aura of Alacrity', level: 7,
    summary: '你的速度提升 10 尺；守护灵光内盟友速度也提升 10 尺。',
    description: '你的速度提升 10 尺。此外，当盟友在你的守护灵光内开始其回合时，其速度提升 10 尺，直到其下个回合开始。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-glory-glorious-defense', subclassId: 'subclass-2024-paladin-oath-of-glory', name: '辉煌防御', englishName: 'Glorious Defense', level: 15,
    summary: '被命中时可用反应使 AC 增加魅力调整值（至少 +1）可能使攻击失手；若失手可用该反应的一部分对另一目标发动一次攻击。',
    description: '当你或 10 尺内一个可见生物被一次攻击检定命中时，你可以用反应使这次攻击的 AC 增加等于你魅力调整值的数值（至少 +1），这可能使攻击失手。若该攻击失手，且攻击者在你的 30 尺范围内，你可以用该反应的一部分对攻击者发动一次武器攻击。使用次数等于你的魅力调整值（至少 1 次），完成长休时重获全部次数。',
    kind: 'reaction', status: 'implemented', sourceIds,
    resource: { recovery: 'long-rest', maxFromAbility: { ability: 'cha', minimum: 1 }, note: '反应：AC 加魅力调整值；攻击失手时可反击' },
  },
  {
    id: 'paladin-2024-glory-living-legend', subclassId: 'subclass-2024-paladin-oath-of-glory', name: '现世传说', englishName: 'Living Legend', level: 20,
    summary: '附赠动作 1 小时内魅力检定优势、豁免可重骰一次（必须使用新结果）；每次长休 1 次。',
    description: '以一个附赠动作，你获得 "现世传说" 状态 1 小时：你的魅力检定具有优势；此外，每当你进行一次豁免检定并失败时，你可以重骰该豁免，且必须使用重骰结果。此特性每次长休 1 次。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },

  // ============ 古贤之誓 ============
  {
    id: 'paladin-2024-ancients-natures-wrath', subclassId: 'subclass-2024-paladin-oath-of-the-ancients', name: '自然之怒', englishName: "Nature's Wrath", level: 3,
    summary: '引导神力：魔法动作使 15 尺内可见生物力量豁免，失败则被束缚 1 分钟（每回合结束可重复豁免）。',
    description: '以一个魔法动作，你可以消耗一次引导神力使用次数，唤出灵体藤蔓缠绕周围生物：选择你可见、位于你 15 尺内的任意数量生物，每个目标必须通过一次力量豁免，否则陷入束缚状态 1 分钟；被束缚的生物可以在其回合结束时重复该豁免，成功则效应结束。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-ancients-spells', subclassId: 'subclass-2024-paladin-oath-of-the-ancients', name: '古贤之誓法术', englishName: 'Oath of the Ancients Spells', level: 3,
    summary: '3／5／9／13／17 级获得始终准备的自然法术（捕获打击、动物交谈、迷踪步、月华之光等）。',
    description: '誓言魔法使你始终准备特定法术：3 级——捕获打击、动物交谈；5 级——迷踪步、月华之光；9 级——植物滋长、防护能量；13 级——冰风暴、石肤术；17 级——问道自然、树跃术。这些法术不计入准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-ancients-aura-of-warding', subclassId: 'subclass-2024-paladin-oath-of-the-ancients', name: '守御灵光', englishName: 'Aura of Warding', level: 7,
    summary: '你与守护灵光内盟友获得对法术伤害的抗性。',
    description: '你与你的盟友在守护灵光内获得对法术伤害的抗性。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-ancients-undying-sentinel', subclassId: 'subclass-2024-paladin-oath-of-the-ancients', name: '不灭哨卫', englishName: 'Undying Sentinel', level: 15,
    summary: '生命降至 0 时可不死亡并回复 3×圣武士等级生命（每次长休 1 次）；此外不再因年老而衰老。',
    description: '当你的生命值降至 0 且未立即死亡时，你可以选择不陷入昏迷并改为恢复等于 3 × 圣武士等级的生命值（每次长休 1 次）。此外，你不会因年老而衰老，且不会因年老而死亡。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-ancients-elder-champion', subclassId: 'subclass-2024-paladin-oath-of-the-ancients', name: '上古斗士', englishName: 'Elder Champion', level: 20,
    summary: '附赠动作 1 分钟内：每回合开始回复 10 生命、圣武士法术附赠动作施法、敌人对你的法术豁免劣势；每次长休 1 次。',
    description: '以一个附赠动作，你获得上古斗士形态 1 分钟或直至你解除（无需动作）：在你的每个回合开始时恢复 10 点生命值；你可以用一个附赠动作施展一道施法时间为动作的圣武士法术；你施展的圣武士法术的敌人豁免检定具有劣势。此特性每次长休 1 次。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },

  // ============ 复仇之誓 ============
  {
    id: 'paladin-2024-vengeance-spells', subclassId: 'subclass-2024-paladin-oath-of-vengeance', name: '复仇之誓法术', englishName: 'Oath of Vengeance Spells', level: 3,
    summary: '3／5／9／13／17 级获得始终准备的复仇法术（灾祸术、猎人印记、定身类人、加速术等）。',
    description: '誓言魔法使你始终准备特定法术：3 级——灾祸术、猎人印记；5 级——定身类人、迷踪步；9 级——加速术、防护能量；13 级——放逐术、任意门；17 级——定身怪物、探知术。这些法术不计入准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-vengeance-vow-of-enmity', subclassId: 'subclass-2024-paladin-oath-of-vengeance', name: '仇敌誓言', englishName: 'Vow of Enmity', level: 3,
    summary: '引导神力：攻击动作中消耗一次使用次数，30 尺内可见生物 1 分钟内你对其攻击检定具有优势；目标倒下可改换。',
    description: '当你执行攻击动作时，你可以消耗一次引导神力使用次数，对一个你能看见、位于你 30 尺内的生物立下仇敌誓言：接下来 1 分钟内，你对该生物的攻击检定具有优势。若该生物在誓言结束前生命值降至 0，你可以（无需动作）将誓言目标更换为另一个你可见、位于你 30 尺内的生物。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-vengeance-relentless-avenger', subclassId: 'subclass-2024-paladin-oath-of-vengeance', name: '坚韧复仇', englishName: 'Relentless Avenger', level: 7,
    summary: '借机攻击命中后可移动至多速度一半且不引发借机攻击。',
    description: '当你以借机攻击命中一个生物后，你可以立即移动至多等于你速度一半的距离，且该移动不会引发借机攻击。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-vengeance-soul-of-vengeance', subclassId: 'subclass-2024-paladin-oath-of-vengeance', name: '复仇之魂', englishName: 'Soul of Vengeance', level: 15,
    summary: '仇敌誓言目标攻击时可用反应对其发动一次近战武器攻击。',
    description: '当受你仇敌誓言影响的生物进行攻击时，你可以用反应对其发动一次近战武器攻击。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'paladin-2024-vengeance-avenging-angel', subclassId: 'subclass-2024-paladin-oath-of-vengeance', name: '复仇天使', englishName: 'Avenging Angel', level: 20,
    summary: '附赠动作获得 1 小时飞行 60 尺与恐惧灵光（敌人感知豁免失败则恐慌）；每次长休 1 次。',
    description: '以一个附赠动作，你获得复仇天使形态 1 小时或直至你解除（无需动作）：你获得 60 尺飞行速度与悬浮能力；你散发出 30 尺恐惧灵光——进入或在其内开始回合的敌人必须通过感知豁免，否则陷入恐慌状态 1 分钟（可在其回合结束时重复豁免）。此特性每次长休 1 次。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
]

export const paladinSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-paladin-oath-of-devotion',
    classId: 'class-2024-paladin',
    ruleset: '5e-2024',
    name: '奉献之誓',
    englishName: 'Oath of Devotion',
    selectionLevel: 3,
    summary: '以圣洁武器与守护灵光践行美德：圣洁武器、奉献灵光、卫护斩与至圣光轮。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: paladinSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-paladin-oath-of-devotion'),
    alwaysPreparedSpellIdsByLevel: DEVOTION_SPELLS,
  },
  {
    id: 'subclass-2024-paladin-oath-of-glory',
    classId: 'class-2024-paladin',
    ruleset: '5e-2024',
    name: '荣耀之誓',
    englishName: 'Oath of Glory',
    selectionLevel: 3,
    summary: '以英雄事迹激励同伴：鼓舞斩、绝伦健将、迅捷灵光、辉煌防御与现世传说。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: paladinSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-paladin-oath-of-glory'),
    alwaysPreparedSpellIdsByLevel: GLORY_SPELLS,
  },
  {
    id: 'subclass-2024-paladin-oath-of-the-ancients',
    classId: 'class-2024-paladin',
    ruleset: '5e-2024',
    name: '古贤之誓',
    englishName: 'Oath of the Ancients',
    selectionLevel: 3,
    summary: '以自然之力守护光明：自然之怒、守御灵光、不灭哨卫与上古斗士。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: paladinSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-paladin-oath-of-the-ancients'),
    alwaysPreparedSpellIdsByLevel: ANCIENTS_SPELLS,
  },
  {
    id: 'subclass-2024-paladin-oath-of-vengeance',
    classId: 'class-2024-paladin',
    ruleset: '5e-2024',
    name: '复仇之誓',
    englishName: 'Oath of Vengeance',
    selectionLevel: 3,
    summary: '以仇敌誓言追击目标：仇敌誓言、坚韧复仇、复仇之魂与复仇天使。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: paladinSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-paladin-oath-of-vengeance'),
    alwaysPreparedSpellIdsByLevel: VENGEANCE_SPELLS,
  },
]
