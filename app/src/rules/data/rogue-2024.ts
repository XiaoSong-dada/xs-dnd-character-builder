import type { ChoiceCheckpoint, ClassFeature, ClassRule, SubclassFeature, SubclassRule } from '@/types/rules'
import { spells2024 } from '@/rules/data/spells-2024'

/**
 * 2024 游荡者与 4 个子职（B08-04）。
 *
 * 规则依据：B01《职业-全量》CV-042、CV-041／043—045 与项目内《5e 不全书》2024 游荡者章节；
 * `docs/classes/subclasses/rogue/*.md` 提供结构与边界说明。
 * 特性名称采用 5e 不全书译名，摘要与详情为原创中文转述。
 */
const sourceIds = ['source-2024-phb'] as const

const ROGUE_SKILL_OPTION_IDS = [
  'skill-acrobatics',
  'skill-athletics',
  'skill-deception',
  'skill-insight',
  'skill-intimidation',
  'skill-investigation',
  'skill-perception',
  'skill-persuasion',
  'skill-sleight-of-hand',
  'skill-stealth',
] as const

/** 专精候选：全部 18 项技能；未熟练项由界面锁定与校验拦截。 */
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

/** 偷袭骰：1 级 1d6，此后每两个游荡者等级 +1d6，19 级起 10d6。 */
const SNEAK_ATTACK_DICE = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10] as const

/** 武器精通：1 级起固定 2 种已熟练武器，无升级增长。 */
const ROGUE_MASTERY_COUNTS = Array.from({ length: 20 }, () => 2)

/** 魂刃灵能骰：3 级 4d6、5 级 6d8、9 级 8d8、11 级 8d10、13 级 10d10、17 级 12d12。 */
const SOULKNIFE_DICE = [0, 0, 4, 4, 6, 6, 6, 6, 8, 8, 8, 8, 10, 10, 10, 10, 12, 12, 12, 12] as const
const SOULKNIFE_DIE_BY_LEVEL = [
  '', '', 'd6', 'd6', 'd8', 'd8', 'd8', 'd8', 'd8', 'd8',
  'd10', 'd10', 'd10', 'd10', 'd10', 'd10', 'd12', 'd12', 'd12', 'd12',
] as const

// 2024 诡术师施法表（B01 CV-044 与不全书）：三分之一施法者、准备制、智力施法。
const ARCANE_TRICKSTER_PREPARED = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13] as const
const ARCANE_TRICKSTER_CANTRIPS = [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] as const
const ARCANE_TRICKSTER_MAX_LEVELS = [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4] as const
const ARCANE_TRICKSTER_SLOTS = [
  [], [], [2], [3], [3], [3], [4, 2], [4, 2], [4, 2], [4, 3],
  [4, 3], [4, 3], [4, 3, 2], [4, 3, 2], [4, 3, 2], [4, 3, 3], [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1],
] as const

const wizardClassSpellIds2024 = spells2024
  .filter((spell) => spell.classIds.includes('class-2024-wizard'))
  .map((spell) => spell.id)

export const rogueFeatures2024: readonly ClassFeature[] = [
  {
    id: 'rogue-2024-class-expertise', classId: 'class-2024-rogue', name: '专精', englishName: 'Expertise', level: 1,
    summary: '选择 2 项已熟练的技能获得专精；6 级再选 2 项。',
    description: '你从已熟练的技能中选择 2 项获得专精：使用这些技能进行的属性检定可加上双倍熟练加值。6 级时再选择 2 项（不能与已有专精重复）。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-rogue-expertise-1', 'class-2024-rogue-expertise-6'], status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-sneak-attack', classId: 'class-2024-rogue', name: '偷袭', englishName: 'Sneak Attack', level: 1,
    summary: '每回合一次，用灵巧或远程武器命中时可追加伤害骰；需优势，或目标 5 尺内有未失能盟友且你无劣势。',
    description: '每个回合一次，当你以灵巧或远程武器命中一个生物时，可以造成额外伤害：额外伤害为对应骰数的 d6，类型与武器伤害相同。触发条件为：该次攻击具有优势，或目标 5 尺内存在未陷入失能的盟友且你的攻击检定没有劣势。额外伤害随游荡者等级提升。',
    kind: 'passive', status: 'implemented', sourceIds,
    dicePool: { diceByLevel: SNEAK_ATTACK_DICE, die: 'd6', recovery: 'none', note: '每回合一次；需优势或 5 尺内未失能盟友；灵巧或远程武器' },
  },
  {
    id: 'rogue-2024-class-thieves-cant', classId: 'class-2024-rogue', name: '盗贼黑话', englishName: "Thieves' Cant", level: 1,
    summary: '习得盗贼黑话，并额外掌握一门语言。',
    description: '你习得盗贼黑话，以及语言表中的另一门语言。盗贼黑话用于与同道交流暗语、标记与切口。额外语言的正式选项录入归语言流程后续补齐。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-weapon-mastery', classId: 'class-2024-rogue', name: '武器精通', englishName: 'Weapon Mastery', level: 1,
    summary: '选择 2 种已熟练武器的精通词条；长休可替换一种。',
    description: '你对武器的训练让你能为 2 种你已熟练的武器启用其精通词条（例如匕首和短弓）。每次完成长休时可以更换其中一种。持有或熟练武器不会自动获得精通词条。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-rogue-mastery-1'], status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-cunning-action', classId: 'class-2024-rogue', name: '灵巧动作', englishName: 'Cunning Action', level: 2,
    summary: '回合内可用附赠动作执行疾走、撤离或躲藏。',
    description: '在你的回合内，你可以用一个附赠动作执行疾走、撤离或躲藏动作之一。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-subclass', classId: 'class-2024-rogue', name: '游荡者子职', englishName: 'Rogue Subclass', level: 3,
    summary: '选择一项游荡者子职，并在 3、9、13、17 级获得其特性。',
    description: '你在 3 级选择一项游荡者子职。此后获得该子职的能力，前提是所需等级不超过你的游荡者等级。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-rogue-subclass-3'], status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-steady-aim', classId: 'class-2024-rogue', name: '稳定瞄准', englishName: 'Steady Aim', level: 3,
    summary: '附赠动作使本回合下次攻击获得优势；使用后速度归 0。',
    description: '以一个附赠动作，你为本回合的下一次攻击检定提供优势。你只能在本回合尚未移动时使用该附赠动作；使用后，你本回合的速度变为 0。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-cunning-strike', classId: 'class-2024-rogue', name: '诡诈打击', englishName: 'Cunning Strike', level: 5,
    summary: '造成偷袭时可扣除偷袭骰换取效果：淬毒（1d6）、摔绊（1d6）、撤步（1d6）；DC=8＋熟练＋敏捷。',
    description: '当你造成偷袭伤害时，可以在投掷伤害前扣除一定数量的偷袭骰，换取一种效果：淬毒（花费 1d6，目标体质豁免，失败中毒 1 分钟，可在自己回合结束时重复豁免；需携带制毒工具）、摔绊（花费 1d6，大型及以下目标敏捷豁免，失败倒地）、撤步（花费 1d6，攻击后立即半速移动且不引发借机攻击）。需要目标豁免时，DC=8＋熟练加值＋敏捷调整值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-uncanny-dodge', classId: 'class-2024-rogue', name: '直觉闪避', englishName: 'Uncanny Dodge', level: 5,
    summary: '可见攻击者命中你时，可用反应使该次伤害减半。',
    description: '当一个你能看见的攻击者以攻击检定命中你时，你可以用一个反应将该次攻击对你造成的伤害减半（向下取整）。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-evasion', classId: 'class-2024-rogue', name: '反射闪避', englishName: 'Evasion', level: 7,
    summary: '允许敏捷豁免减半伤害的效应：成功免伤、失败减半；失能时失效。',
    description: '当你受到一个允许敏捷豁免以只承受一半伤害的效应影响时，豁免成功则不受伤害，豁免失败则只承受一半伤害。陷入失能状态时无法使用该特性。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-reliable-talent', classId: 'class-2024-rogue', name: '可靠才能', englishName: 'Reliable Talent', level: 7,
    summary: '使用已熟练掌握的技能或工具进行属性检定时，d20 掷出 9 或以下视为 10。',
    description: '每当你进行属性检定且可以运用某项技能或工具熟练时，你可以把 d20 掷出的 9 及以下结果视为 10。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-improved-cunning-strike', classId: 'class-2024-rogue', name: '进阶诡诈打击', englishName: 'Improved Cunning Strike', level: 11,
    summary: '一次偷袭可同时选用两种诡诈打击效果，各自扣除对应骰数。',
    description: '你造成偷袭伤害时可以一次性选用两种诡诈打击效果，每种效果独立扣除对应的偷袭骰。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-devious-strikes', classId: 'class-2024-rogue', name: '凶狡打击', englishName: 'Devious Strikes', level: 14,
    summary: '诡诈打击新增恍惚（2d6）、眩目（3d6）、击昏（6d6）。',
    description: '诡诈打击的选项列表新增：恍惚（花费 2d6，体质豁免失败则目标下一回合只能移动、执行一个动作或执行一个附赠动作中的一项）、眩目（花费 3d6，敏捷豁免失败则目标目盲至其下回合结束）、击昏（花费 6d6，体质豁免失败则目标昏迷 1 分钟或直到受到伤害，可在自己回合结束时重复豁免）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-slippery-mind', classId: 'class-2024-rogue', name: '圆滑心智', englishName: 'Slippery Mind', level: 15,
    summary: '获得感知豁免与魅力豁免熟练。',
    description: '你获得感知豁免与魅力豁免的熟练加值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-elusive', classId: 'class-2024-rogue', name: '飘忽不定', englishName: 'Elusive', level: 18,
    summary: '只要你未失能，以你为目标的攻击检定无法具有优势。',
    description: '只要你没有陷入失能状态，以你为目标的攻击检定就无法具有优势。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-epic-boon', classId: 'class-2024-rogue', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长，或其他满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一项你选择的、满足条件且适用的专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-rogue-feat-19'], status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-class-stroke-of-luck', classId: 'class-2024-rogue', name: '幸运一击', englishName: 'Stroke of Luck', level: 20,
    summary: 'd20 检定失败时可将结果改为 20。',
    description: '当你在一次 d20 检定中失败时，你可以把该次结果改为 20。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const rogueRule2024: ClassRule = {
  id: 'class-2024-rogue',
  ruleset: '5e-2024',
  name: '游荡者',
  englishName: 'Rogue',
  summary: '2024版技能与精准打击专家：专精、偷袭、诡诈打击与子职特化。',
  hitDie: 8,
  primaryAbilities: ['dex'],
  playStyleTags: ['striker', 'skirmisher', 'utility'],
  savingThrowAbilities: ['dex', 'int'],
  status: 'implemented',
  sourceIds,
  armorTraining: ['light'],
  weaponTraining: { categories: ['simple'], martialProperties: ['finesse', 'light'] },
  features: rogueFeatures2024,
  checkpoints: [
    {
      id: 'class-2024-rogue-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择4项游荡者技能', description: '从游荡者技能列表中选择4项。',
      required: true, minSelections: 4, maxSelections: 4, optionIds: ROGUE_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-rogue-expertise-1', level: 1, step: 'timeline', kind: 'expertise',
      title: '选择2项专精', description: '从已熟练的技能中选择2项获得专精。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: ALL_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-rogue-mastery-1', level: 1, step: 'timeline', kind: 'weapon-mastery',
      title: '选择武器精通', description: '选择2种已熟练武器的精通词条；长休可替换一种。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: [],
      candidateKind: 'weapon-mastery', selectionCountByLevel: ROGUE_MASTERY_COUNTS, weaponMasteryFilter: 'proficient',
    },
    ...([4, 8, 10, 12, 16] as const).map((level): ChoiceCheckpoint => ({
      id: `class-2024-rogue-feat-${level}`, level, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    {
      id: 'class-2024-rogue-expertise-6', level: 6, step: 'timeline', kind: 'expertise',
      title: '再选择2项专精', description: '从已熟练且尚无专精的技能中选择2项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: ALL_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-rogue-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '19级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
}

export const rogueSubclassFeatures2024: readonly SubclassFeature[] = [
  // ============ 刺客 ============
  {
    id: 'rogue-2024-assassin-assassinate', subclassId: 'subclass-2024-rogue-assassin', name: '暗杀', englishName: 'Assassinate', level: 3,
    summary: '先攻优势；战斗首轮对尚未行动者攻击有优势，命中并偷袭时追加等同游荡者等级的伤害。',
    description: '你的先攻掷骰具有优势。每次战斗的第一轮中，你对任何尚未经历过自己回合的生物发动的攻击检定具有优势；若你在该轮命中并偷袭了目标，目标额外承受等同于你游荡者等级的伤害，类型与武器伤害相同。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-assassin-assassins-tools', subclassId: 'subclass-2024-rogue-assassin', name: '刺客工具', englishName: "Assassin's Tools", level: 3,
    summary: '获得易容工具与制毒工具的熟练。',
    description: '你获得一套易容工具与一套制毒工具，并获得这两种工具的熟练。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-assassin-infiltration-expertise', subclassId: 'subclass-2024-rogue-assassin', name: '专业渗透', englishName: 'Infiltration Expertise', level: 9,
    summary: '钻研 1 小时后可精准模仿他人言语、笔迹；稳定瞄准不再使速度归零。',
    description: '你获得两项渗透技巧：模仿大师——在至少花费 1 小时钻研后，你能精准模仿他人的言语、笔迹或两者；机动瞄准——你使用稳定瞄准时速度不再归零。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-assassin-envenom-weapons', subclassId: 'subclass-2024-rogue-assassin', name: '淬毒武器', englishName: 'Envenom Weapons', level: 13,
    summary: '淬毒选项豁免失败时额外造成 2d6 毒素伤害，且无视毒素抗性。',
    description: '当你使用诡诈打击的淬毒选项且目标豁免失败时，目标额外承受 2d6 毒素伤害；该额外伤害无视毒素抗性。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-assassin-death-strike', subclassId: 'subclass-2024-rogue-assassin', name: '致命袭杀', englishName: 'Death Strike', level: 17,
    summary: '战斗首轮命中并偷袭时，目标体质豁免失败则本次攻击造成双倍伤害（DC=8＋熟练＋敏捷）。',
    description: '当你在战斗的第一轮命中并偷袭某一目标时，该目标必须进行一次体质豁免（DC=8＋熟练加值＋敏捷调整值）：失败则本次攻击对该目标造成双倍伤害。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 盗贼 ============
  {
    id: 'rogue-2024-thief-fast-hands', subclassId: 'subclass-2024-rogue-thief', name: '快手', englishName: 'Fast Hands', level: 3,
    summary: '附赠动作可进行巧手（开锁/解陷阱/扒窃）或使用物件（操作/魔法动作使用魔法物品）。',
    description: '你可以用一个附赠动作进行以下之一：巧手——以敏捷（巧手）检定使用盗贼工具开锁、解除陷阱或扒窃；使用物件——执行操作动作，或执行魔法动作来使用一件要求该动作的魔法物品。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-thief-second-story-work', subclassId: 'subclass-2024-rogue-thief', name: '梁上君子', englishName: 'Second-Story Work', level: 3,
    summary: '获得等同速度的攀爬速度；跳跃距离改用敏捷计算。',
    description: '你获得等同于你速度的攀爬速度；你的跳跃距离由敏捷而非力量决定。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-thief-supreme-sneak', subclassId: 'subclass-2024-rogue-thief', name: '极效潜行', englishName: 'Supreme Sneak', level: 9,
    summary: '诡诈打击新增无声袭击（1d6）：保持四分之三或全身掩护时，攻击不解除躲藏带来的隐形。',
    description: '诡诈打击新增“无声袭击”选项（花费 1d6）：若你通过躲藏动作获得隐形，且结束回合时仍处于四分之三掩护或全身掩护之后，本次攻击不会使该隐形状态结束。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-thief-use-magic-device', subclassId: 'subclass-2024-rogue-thief', name: '使用魔法装置', englishName: 'Use Magic Device', level: 13,
    summary: '同调上限 4 件；充能使用掷 d6 出 6 不消耗；可用任意法术卷轴（更高环需奥秘检定）。',
    description: '你获得三项增益：同调——可同时同调最多四件魔法物品；充能——使用魔法物品消耗充能的特性时掷 d6，结果为 6 则不消耗充能；卷轴——可以使用任何法术卷轴，并以智力作为施法属性，稳定使用戏法与一环卷轴，更高环卷轴需通过 DC=10＋法术环级的智力（奥秘）检定，失败则卷轴化为尘埃。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-thief-thiefs-reflexes', subclassId: 'subclass-2024-rogue-thief', name: '窃盗本能', englishName: "Thief's Reflexes", level: 17,
    summary: '战斗首轮可行动两个回合：第二个回合的先攻值减 10。',
    description: '每次战斗的第一轮中，你可以行动两个回合：先用正常先攻执行第一个回合，再以先攻值减 10 的顺序执行第二个回合。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 诡术师 ============
  {
    id: 'rogue-2024-arcane-trickster-spellcasting', subclassId: 'subclass-2024-rogue-arcane-trickster', name: '施法', englishName: 'Spellcasting', level: 3,
    summary: '智力的三分之一施法者：3 级 3 戏法（含法师之手）与 3 道准备法师法术；升级可替换与增加准备数。',
    description: '你习得 3 道法师戏法，其中必须包含法师之手；每当你获得游荡者等级时可替换一道非法师之手的戏法；10 级时额外习得一道法师戏法。你可以准备一环及以上的法师法术，初始 3 道，准备数量随游荡者等级按诡术师施法表增加；每获得一个游荡者等级可替换一道准备法术（需有对应环级法术位）。施法属性为智力，可用奥术法器作为法器；法术位在完成长休后恢复。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-arcane-trickster-mage-hand-legerdemain', subclassId: 'subclass-2024-rogue-arcane-trickster', name: '法师之手诈术', englishName: 'Mage Hand Legerdemain', level: 3,
    summary: '法师之手可用附赠动作施展并隐形，可用附赠动作操控并以其进行巧手检定。',
    description: '当你施展法师之手时，可以用附赠动作施展，并使幽灵手隐形。你可以用附赠动作控制幽灵手，并可以通过它进行敏捷（巧手）检定。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-arcane-trickster-magical-ambush', subclassId: 'subclass-2024-rogue-arcane-trickster', name: '诡术伏击', englishName: 'Magical Ambush', level: 9,
    summary: '处于隐形状态时对生物施法，其对抗该法术的豁免具有劣势。',
    description: '当你处于隐形状态时对一名生物施展法术，该生物在该回合为对抗该法术而进行的豁免检定具有劣势。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-arcane-trickster-versatile-trickster', subclassId: 'subclass-2024-rogue-arcane-trickster', name: '万能诡术', englishName: 'Versatile Trickster', level: 13,
    summary: '使用诡诈打击摔绊时，可同时作用于法师之手 5 尺内的另一个生物。',
    description: '当你对一个生物使用诡诈打击的摔绊选项时，你还可以对法师之手 5 尺内的另一个生物施加该效果。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-arcane-trickster-spell-thief', subclassId: 'subclass-2024-rogue-arcane-trickster', name: '法术窃贼', englishName: 'Spell Thief', level: 17,
    summary: '他人对你施法后，可用反应迫使其智力豁免（DC=你的施法DC）；失败则窃取该法术 8 小时且对方无法施展。',
    description: '当一个生物施展以你为目标或效应范围覆盖你的法术之后，你可以立刻用一个反应迫使该生物进行一次智力豁免，DC 等于你的施法 DC。失败时：你消除该法术对你的影响，并窃取该法术的知识——该法术至少为一环且在你可施展的环级内（不必是法师法术）；接下来 8 小时内你准备该法术，对方在 8 小时内无法施展该法术。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },

  // ============ 魂刃 ============
  {
    id: 'rogue-2024-soulknife-psionic-power', subclassId: 'subclass-2024-rogue-soulknife', name: '灵能力量', englishName: 'Psionic Power', level: 3,
    summary: '灵能骰池（3 级 4d6 → 17 级 12d12）；长休全满、短休恢复 1 枚；可用于失败检定加值或心灵低语。',
    description: '你获得若干灵能骰，骰数与骰面随游荡者等级变化：3 级 4d6、5 级 6d8、9 级 8d8、11 级 8d10、13 级 10d10、17 级 12d12。完成长休重获全部已消耗骰，完成短休额外恢复 1 枚。灵振诀窍——使用已熟练的技能或工具检定失败时，可掷一枚灵能骰加在结果上；只有加值使检定成功时才消耗该骰。心灵低语——以一个魔法动作，选择至多等于熟练加值数量的可见生物，掷一枚灵能骰，在掷值小时内与之建立一里内的心灵感应；每次长休后有一次免费使用，其余使用需消耗灵能骰。',
    kind: 'resource', status: 'implemented', sourceIds,
    dicePool: { diceByLevel: SOULKNIFE_DICE, dieByLevel: SOULKNIFE_DIE_BY_LEVEL, recovery: 'short-rest', note: '长休全部恢复；短休恢复 1 枚' },
  },
  {
    id: 'rogue-2024-soulknife-psychic-blades', subclassId: 'subclass-2024-rogue-soulknife', name: '念刃', englishName: 'Psychic Blades', level: 3,
    summary: '空闲手塑造简易近战/投掷（60/120 尺）灵能刀刃：1d6 心灵伤害、灵巧、侵扰；主攻后可用附赠动作再攻 1d4。',
    description: '当你执行攻击动作或进行借机攻击时，可在空闲的手中塑造一把心灵之刃并用其攻击：视为简易武器，命中造成 1d6 心灵伤害加属性调整值，具有灵巧与投掷（60/120 尺）词条，并可使用侵扰精通（不占用武器精通数量）。念刃在近战或远程攻击后立即消失且不留痕迹。若你本回合用念刃攻击过且另一只手空闲，可以用附赠动作塑造第二把念刃并再发动一次近战或远程攻击，该次伤害骰为 1d4。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-soulknife-soul-blades', subclassId: 'subclass-2024-rogue-soulknife', name: '灵魂之刃', englishName: 'Soul Blades', level: 9,
    summary: '念刃攻击失手可掷灵能骰加值（命中才消耗）；或以附赠动作掷灵能骰进行至多 10×骰值的传送。',
    description: '你能以念刃使用两种能力：寻的斩击——念刃攻击检定未命中时，可掷一枚灵能骰加在该攻击检定上，只有因此命中才消耗该骰；心灵传送——以一个附赠动作塑造念刃并消耗、投掷一枚灵能骰，把刀刃掷向至多 10×骰值尺内你可见的未占据空间，并传送到该处，刀刃随即消失。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-soulknife-psychic-veil', subclassId: 'subclass-2024-rogue-soulknife', name: '灵能面纱', englishName: 'Psychic Veil', level: 13,
    summary: '魔法动作隐形至多 1 小时；造成伤害或迫使豁免即结束；每次长休 1 次，可消耗 1 枚灵能骰重置。',
    description: '以一个魔法动作，你获得隐形状态，持续至多 1 小时或直到你主动解除（无需动作）。造成伤害或迫使生物进行豁免检定会立即结束该隐形。该特性使用后需完成长休才能再次使用；你也可以消耗一枚灵能骰（无需动作）重置其使用权。',
    kind: 'action', status: 'implemented', sourceIds,
  },
  {
    id: 'rogue-2024-soulknife-rend-mind', subclassId: 'subclass-2024-rogue-soulknife', name: '撕裂心智', englishName: 'Rend Mind', level: 17,
    summary: '念刃造成偷袭伤害时，目标感知豁免失败陷入震慑 1 分钟；每次长休 1 次，可消耗 3 枚灵能骰重置。',
    description: '当你使用念刃对一个生物造成偷袭伤害时，可以迫使该生物进行一次感知豁免（DC=8＋熟练加值＋敏捷调整值）：失败则陷入震慑，持续至多 1 分钟，并在其每个回合结束时重复豁免，成功则结束。该特性使用后需完成长休才能再次使用；你也可以消耗三枚灵能骰（无需动作）重置其使用权。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const rogueSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-rogue-assassin',
    classId: 'class-2024-rogue',
    ruleset: '5e-2024',
    name: '刺客',
    englishName: 'Assassin',
    selectionLevel: 3,
    summary: '以先攻优势与首轮爆发终结目标：暗杀、伪装与毒药、淬毒武器和致命袭杀。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: rogueSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-rogue-assassin'),
  },
  {
    id: 'subclass-2024-rogue-thief',
    classId: 'class-2024-rogue',
    ruleset: '5e-2024',
    name: '盗贼',
    englishName: 'Thief',
    selectionLevel: 3,
    summary: '经典冒险家：附赠动作操作物品、攀爬跳跃、极效潜行与魔法物品专精。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: rogueSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-rogue-thief'),
  },
  {
    id: 'subclass-2024-rogue-arcane-trickster',
    classId: 'class-2024-rogue',
    ruleset: '5e-2024',
    name: '诡术师',
    englishName: 'Arcane Trickster',
    selectionLevel: 3,
    summary: '以法师法术强化潜行与巧手：隐形法师之手、魔法伏击与法术窃贼。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: rogueSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-rogue-arcane-trickster'),
    spellcasting: {
      ruleset: '5e-2024',
      mode: 'prepared',
      ability: 'int',
      startsAtLevel: 3,
      preparedCountByLevel: ARCANE_TRICKSTER_PREPARED,
      cantripsKnownByLevel: ARCANE_TRICKSTER_CANTRIPS,
      maxSpellLevelByClassLevel: ARCANE_TRICKSTER_MAX_LEVELS,
      slotsByClassLevel: ARCANE_TRICKSTER_SLOTS,
      classSpellIds: wizardClassSpellIds2024,
    },
  },
  {
    id: 'subclass-2024-rogue-soulknife',
    classId: 'class-2024-rogue',
    ruleset: '5e-2024',
    name: '魂刃',
    englishName: 'Soulknife',
    selectionLevel: 3,
    summary: '以灵能骰与心灵刀刃作战：灵振诀窍、心灵传送、灵能面纱与撕裂心智。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: rogueSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-rogue-soulknife'),
  },
]
