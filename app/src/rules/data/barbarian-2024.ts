import type { ChoiceCheckpoint, ClassFeature, ClassRule, RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'

/**
 * 2024 野蛮人与 4 个道途（B08-03）。
 *
 * 规则依据：B01《职业-全量》CV-055、CV-051—054 与项目内《5e 不全书》2024 野蛮人章节；
 * `docs/classes/subclasses/barbarian/*.md` 提供结构与边界说明。
 * 特性名称采用 5e 不全书译名，摘要与详情为原创中文转述。
 */
const sourceIds = ['source-2024-phb'] as const

const BARBARIAN_SKILL_OPTION_IDS = [
  'skill-animal-handling',
  'skill-athletics',
  'skill-intimidation',
  'skill-nature',
  'skill-perception',
  'skill-survival',
] as const

/** 武器精通数量：1—3 级 2 种、4—9 级 3 种、10 级起 4 种。 */
const WEAPON_MASTERY_COUNTS = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] as const

/** 狂暴次数：1—2 级 2 次、3—5 级 3 次、6—11 级 4 次、12—16 级 5 次、17 级起 6 次。 */
const RAGE_MAX = [2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6] as const

/** 狂热者神之勇者治疗池：3 级 4 枚、6 级 5 枚、12 级 6 枚、17 级 7 枚 d12。 */
const ZEALOT_POOL_MAX = [0, 0, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7] as const

/** 兽心道途 6 级兽之形貌的固定选择（长休可调整）。 */
export const barbarianOptions2024: readonly RuleOption[] = [
  { id: 'barbarian-2024-aspect-owl', name: '枭', englishName: 'Owl', description: '获得 60 尺黑暗视觉；若已有黑暗视觉则其范围增加 60 尺。', status: 'implemented', sourceIds },
  { id: 'barbarian-2024-aspect-panther', name: '豹', englishName: 'Panther', description: '获得等于你速度的攀爬速度。', status: 'implemented', sourceIds },
  { id: 'barbarian-2024-aspect-salmon', name: '鲑', englishName: 'Salmon', description: '获得等于你速度的游泳速度。', status: 'implemented', sourceIds },
]

export const barbarianFeatures2024: readonly ClassFeature[] = [
  {
    id: 'barbarian-2024-class-rage', classId: 'class-2024-barbarian', name: '狂暴', englishName: 'Rage', level: 1,
    summary: '附赠动作进入狂暴：钝击／穿刺／挥砍抗性、狂暴伤害加值、力量检定与豁免优势；不能施法或专注。',
    description: '未着装重甲时，你可以用一个附赠动作消耗一次狂暴进入狂暴状态。狂暴期间：获得钝击、穿刺与挥砍伤害抗性；使用力量发动武器或徒手攻击并造成伤害时，伤害加上狂暴伤害加值；力量检定与力量豁免具有优势；不能施展法术，也不能维持专注。狂暴持续到你下个回合结束，可通过攻击敌人、迫使敌人豁免或用附赠动作延长，最长 10 分钟；穿重甲或陷入失能会提前结束。短休恢复 1 次已消耗次数，长休恢复全部。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: RAGE_MAX, recovery: 'short-rest', note: '短休恢复 1 次，长休全部恢复；狂暴伤害加值按等级为 +2／+3／+4' },
  },
  {
    id: 'barbarian-2024-class-unarmored-defense', classId: 'class-2024-barbarian', name: '无甲防御', englishName: 'Unarmored Defense', level: 1,
    summary: '未着甲时 AC = 10＋敏捷调整值＋体质调整值；可以同时持盾。',
    description: '当你未着装任何护甲时，基础护甲等级为 10＋你的敏捷调整值＋你的体质调整值。使用盾牌不影响该公式；若穿着护甲则此特性不生效。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-weapon-mastery', classId: 'class-2024-barbarian', name: '武器精通', englishName: 'Weapon Mastery', level: 1,
    summary: '选择 2／3／4 种简易或军用近战武器的精通词条（1／4／10 级）；长休可替换一种。',
    description: '你对武器的训练让你能为所选近战武器启用其精通词条：1 级选择 2 种简易或军用近战武器，4 级起 3 种、10 级起 4 种。每次完成长休时可以更换其中一种。持有或熟练武器不会自动获得精通词条。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-barbarian-mastery-1'], status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-danger-sense', classId: 'class-2024-barbarian', name: '危机感应', englishName: 'Danger Sense', level: 2,
    summary: '未陷入失能时，敏捷豁免检定具有优势。',
    description: '只要你没有陷入失能状态，你的敏捷豁免检定就具有优势。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-reckless-attack', classId: 'class-2024-barbarian', name: '鲁莽攻击', englishName: 'Reckless Attack', level: 2,
    summary: '本回合首次攻击时选择：用力量发动的攻击获得优势，但到你的下回合开始，对你的攻击也有优势。',
    description: '在你回合进行第一次攻击检定时，你可以选择鲁莽：到你的下个回合开始前，你使用力量的攻击检定具有优势，同时所有以你为目标的攻击检定也具有优势。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-subclass', classId: 'class-2024-barbarian', name: '野蛮人子职', englishName: 'Barbarian Subclass', level: 3,
    summary: '选择一条道途，并在 3、6、10、14 级获得其特性。',
    description: '你在 3 级选择一条野蛮人道途。此后获得该子职的能力，前提是所需等级不超过你的野蛮人等级。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-barbarian-subclass-3'], status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-primal-knowledge', classId: 'class-2024-barbarian', name: '原初学识', englishName: 'Primal Knowledge', level: 3,
    summary: '额外获得 1 项野蛮人技能熟练；狂暴期间特技、威吓、察觉、隐匿、求生可改用力量检定。',
    description: '你从野蛮人技能列表中额外获得一项技能熟练（不能与已选职业技能重复）。此外，狂暴期间进行特技、威吓、察觉、隐匿或求生检定时，你可以改用力量而不是原本的属性进行检定。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-barbarian-primal-knowledge-3'], status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-extra-attack', classId: 'class-2024-barbarian', name: '额外攻击', englishName: 'Extra Attack', level: 5,
    summary: '攻击动作可进行两次攻击。',
    description: '你在自己回合内执行攻击动作时，可以发动两次攻击而非一次。不同职业的同名特性不叠加。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-fast-movement', classId: 'class-2024-barbarian', name: '快速移动', englishName: 'Fast Movement', level: 5,
    summary: '未着装重甲时速度增加 10 尺。',
    description: '当你未着装重甲时，你的速度提升 10 尺。狂暴期间同样生效。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-feral-instinct', classId: 'class-2024-barbarian', name: '野性直觉', englishName: 'Feral Instinct', level: 7,
    summary: '先攻检定具有优势。',
    description: '你的直觉格外敏锐，先攻检定具有优势。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-instinctive-pounce', classId: 'class-2024-barbarian', name: '莽驰', englishName: 'Instinctive Pounce', level: 7,
    summary: '进入狂暴的附赠动作中可移动至多半速。',
    description: '作为你进入狂暴所用附赠动作的一部分，你可以移动至多等于你速度一半的距离。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-brutal-strike', classId: 'class-2024-barbarian', name: '凶蛮打击', englishName: 'Brutal Strike', level: 9,
    summary: '使用鲁莽攻击时，可放弃一次力量攻击的优势换取 1d10 额外伤害与一种战术效应。',
    description: '若你本回合使用了鲁莽攻击，你可以放弃其中一次力量攻击检定原本具有的全部优势（不能选择具有劣势的攻击），改为：该攻击命中时造成 1d10 额外伤害（伤害类型同武器或徒手打击），并施加一种你所选的凶蛮打击效应——巨力猛击（将目标直线推开 15 尺，随后你可以半速跟随移动且不引发借机攻击）或断筋猛击（目标速度降低 15 尺至你下回合开始）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-relentless-rage', classId: 'class-2024-barbarian', name: '坚韧狂暴', englishName: 'Relentless Rage', level: 11,
    summary: '狂暴中生命降至 0 时可进行 DC10 体质豁免，成功则生命变为野蛮人等级的两倍；重复使用 DC 每次 +5。',
    description: '狂暴期间，如果你的生命值降至 0 且没有立即死亡，你可以进行一次 DC 10 的体质豁免：成功则生命值改为你野蛮人等级的两倍。每再次使用一次，该 DC 提升 5；完成短休或长休后重置为 10。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-improved-brutal-strike-13', classId: 'class-2024-barbarian', name: '强化凶蛮打击', englishName: 'Improved Brutal Strike', level: 13,
    summary: '凶蛮打击新增震撼猛击（下次豁免劣势、不能借机）与破势猛击（他人对目标下次攻击 +5）。',
    description: '凶蛮打击的效应列表新增两种：震撼猛击——目标的下一次豁免检定具有劣势，且至你下回合开始前不能发动借机攻击；破势猛击——至你下回合开始，其他生物对目标进行的下一次攻击检定获得 +5 加值（一次攻击只能获得一次该加值）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-persistent-rage', classId: 'class-2024-barbarian', name: '持久狂暴', englishName: 'Persistent Rage', level: 15,
    summary: '掷先攻时可重获全部狂暴次数（每次长休限一次）；狂暴无需维持即可持续 10 分钟。',
    description: '当你掷先攻时，可以重获所有已消耗的狂暴使用次数；以此法重获后，直到完成长休都不能再次这样做。此外，你的狂暴自动持续 10 分钟，无需逐轮维持；只有陷入昏迷或穿着重甲会使其提前结束。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-improved-brutal-strike-17', classId: 'class-2024-barbarian', name: '强化凶蛮打击', englishName: 'Improved Brutal Strike', level: 17,
    summary: '凶蛮打击额外伤害提升为 2d10，并可同时使用两种不同效应。',
    description: '凶蛮打击的额外伤害提升至 2d10，且每次使用时可以同时选择并施加两种不同的凶蛮打击效应。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-indomitable-might', classId: 'class-2024-barbarian', name: '不屈勇武', englishName: 'Indomitable Might', level: 18,
    summary: '力量检定或力量豁免总值低于力量属性值时，可用力量值替代。',
    description: '如果你进行的力量检定或力量豁免检定总值低于你的力量属性值，你可以直接使用力量属性值作为结果。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-epic-boon', classId: 'class-2024-barbarian', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长，或其他满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一项你选择的、满足条件且适用的专长。该选择与其他属性提升／专长机会相互独立。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-barbarian-feat-19'], status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-class-primal-champion', classId: 'class-2024-barbarian', name: '原初斗士', englishName: 'Primal Champion', level: 20,
    summary: '力量与体质各 +4，上限提高至 25。',
    description: '你的力量与体质属性值各提高 4，且这两项属性的上限提高至 25。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const barbarianRule2024: ClassRule = {
  id: 'class-2024-barbarian',
  ruleset: '5e-2024',
  name: '野蛮人',
  englishName: 'Barbarian',
  summary: '2024版狂暴前排：高生命值、狂暴减伤与伤害、武器精通和道途特化。',
  hitDie: 12,
  primaryAbilities: ['str'],
  playStyleTags: ['frontline', 'durable', 'striker'],
  savingThrowAbilities: ['str', 'con'],
  status: 'implemented',
  sourceIds,
  armorTraining: ['light', 'medium', 'shield'],
  weaponTraining: { categories: ['simple', 'martial'] },
  unarmoredDefense: { ability: 'con', allowsShield: true },
  features: barbarianFeatures2024,
  checkpoints: [
    {
      id: 'class-2024-barbarian-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择2项野蛮人技能', description: '从野蛮人技能列表中选择2项；原初学识可在3级再选1项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: BARBARIAN_SKILL_OPTION_IDS, uniqueGroup: 'barbarian-skills',
    },
    {
      id: 'class-2024-barbarian-mastery-1', level: 1, step: 'timeline', kind: 'weapon-mastery',
      title: '选择武器精通', description: '选择精通词条的近战武器种类；1／4／10级起为2／3／4种，长休可替换一种。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: [],
      candidateKind: 'weapon-mastery', selectionCountByLevel: WEAPON_MASTERY_COUNTS, weaponMasteryFilter: 'melee',
    },
    {
      id: 'class-2024-barbarian-primal-knowledge-3', level: 3, step: 'timeline', kind: 'skills',
      title: '原初学识：选择1项额外技能', description: '从野蛮人技能列表中额外获得1项技能熟练，不能与已有职业技能重复。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: BARBARIAN_SKILL_OPTION_IDS, uniqueGroup: 'barbarian-skills',
    },
    ...([4, 8, 12, 16] as const).map((level): ChoiceCheckpoint => ({
      id: `class-2024-barbarian-feat-${level}`, level, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    {
      id: 'class-2024-barbarian-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '19级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
}

export const barbarianSubclassFeatures2024: readonly SubclassFeature[] = [
  // ============ 狂战士道途 ============
  {
    id: 'barbarian-2024-berserker-frenzy', subclassId: 'subclass-2024-barbarian-path-of-the-berserker', name: '狂怒', englishName: 'Frenzy', level: 3,
    summary: '狂暴中使用鲁莽攻击的回合，首次力量攻击命中时追加等于狂暴伤害加值数量的 d6 伤害。',
    description: '狂暴激活期间，在你使用鲁莽攻击的回合中，你基于力量发动的第一次攻击命中时，对目标造成额外伤害：投掷数量等于你狂暴伤害加值的 d6 并相加；伤害类型与该次武器或徒手打击相同。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-berserker-mindless-rage', subclassId: 'subclass-2024-barbarian-path-of-the-berserker', name: '无我狂暴', englishName: 'Mindless Rage', level: 6,
    summary: '狂暴期间免疫魅惑与恐慌；进入狂暴时立即终止已有的这两种状态。',
    description: '狂暴激活期间，你对魅惑与恐慌状态免疫。当你进入狂暴时，若你已陷入魅惑或恐慌，这些状态立即结束。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-berserker-retaliation', subclassId: 'subclass-2024-barbarian-path-of-the-berserker', name: '报偿', englishName: 'Retaliation', level: 10,
    summary: '5 尺内生物对你造成伤害时，可用反应对其发动一次近战武器或徒手攻击。',
    description: '当一名位于你 5 尺内的生物对你造成伤害时，你可以用一个反应，使用武器或徒手打击对其发动一次近战攻击。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-berserker-intimidating-presence', subclassId: 'subclass-2024-barbarian-path-of-the-berserker', name: '威慑之姿', englishName: 'Intimidating Presence', level: 14,
    summary: '附赠动作令 30 尺内所选生物感知豁免，失败恐慌 1 分钟；每次长休 1 次，可消耗狂暴次数重置。',
    description: '以一个附赠动作，你令 30 尺光环内你所选择的每个生物进行一次感知豁免（DC=8＋力量调整值＋熟练加值）：失败则恐慌 1 分钟，并在其每个回合结束时重复豁免，成功则结束。该特性使用后需完成长休才能再次使用；你也可以消耗一次狂暴使用次数（无需动作）来重置其使用权。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },

  // ============ 兽心道途 ============
  {
    id: 'barbarian-2024-wild-heart-animal-speaker', subclassId: 'subclass-2024-barbarian-path-of-wild-heart', name: '动物语者', englishName: 'Animal Speaker', level: 3,
    summary: '可以仪式方式施展野兽知觉与动物交谈，施法属性为感知。',
    description: '你可以仅以仪式方式施展“野兽知觉”与“动物交谈”，施法属性为感知。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-wild-heart-rage-of-the-wilds', subclassId: 'subclass-2024-barbarian-path-of-wild-heart', name: '兽性狂暴', englishName: 'Rage of the Wilds', level: 3,
    summary: '每次进入狂暴时选择熊（多重抗性）、鹰（撤离＋疾走）或狼（盟友对 5 尺内敌人攻击优势）。',
    description: '你的狂暴解放动物的原初之力。每次激活狂暴时，从以下效果中选择一项：熊——狂暴期间获得除力场、心灵、暗蚀、光耀外所有伤害类型的抗性；鹰——进入狂暴的附赠动作中可同时执行撤离与疾走，狂暴期间也可用附赠动作同时执行这两个动作；狼——狂暴期间，你的盟友对位于你 5 尺内的敌人进行的攻击检定具有优势。该选择在每次进入狂暴时重新决定，不固化保存。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-wild-heart-aspect-of-the-wilds', subclassId: 'subclass-2024-barbarian-path-of-wild-heart', name: '兽之形貌', englishName: 'Aspect of the Wilds', level: 6,
    summary: '从枭（黑暗视觉）、豹（攀爬速度）、鲑（游泳速度）中选择一项持续强化；长休可更换。',
    description: '你从枭、豹、鲑中选择一项获得持续能力：枭——60 尺黑暗视觉，若已有黑暗视觉则其范围增加 60 尺；豹——获得等于你速度的攀爬速度；鲑——获得等于你速度的游泳速度。完成一次长休时，你可以改变该选择。',
    kind: 'choice', requiresChoice: true, optionIds: ['barbarian-2024-aspect-owl', 'barbarian-2024-aspect-panther', 'barbarian-2024-aspect-salmon'], status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-wild-heart-nature-speaker', subclassId: 'subclass-2024-barbarian-path-of-wild-heart', name: '自然语者', englishName: 'Nature Speaker', level: 10,
    summary: '可以仪式方式施展问道自然，施法属性为感知。',
    description: '你可以仅以仪式方式施展“问道自然”，施法属性为感知。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-wild-heart-power-of-the-wilds', subclassId: 'subclass-2024-barbarian-path-of-wild-heart', name: '兽力威能', englishName: 'Power of the Wilds', level: 14,
    summary: '每次进入狂暴时选择猎鹰（无甲飞行）、雄狮（5 尺内敌人攻击劣势）或角羊（命中令倒地）。',
    description: '每次激活狂暴时，从以下效果中选择一项：猎鹰——狂暴期间，若你未着装任何护甲，获得等于你速度的飞行速度；雄狮——狂暴期间，位于你 5 尺内的敌人不以你（或另一个选择该项的野蛮人）为目标的攻击检定具有劣势；角羊——狂暴期间，你的近战攻击命中体型不超过大型的生物时，可以令其陷入倒地状态。该选择在每次进入狂暴时重新决定。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 世界树道途 ============
  {
    id: 'barbarian-2024-world-tree-vitality-of-the-tree', subclassId: 'subclass-2024-barbarian-path-of-the-world-tree', name: '圣树活力', englishName: 'Vitality of the Tree', level: 3,
    summary: '进入狂暴获得等同野蛮人等级的临时生命；狂暴期间每回合可给 10 尺内盟友临时生命（d6×狂暴伤害加值）。',
    description: '你的狂暴浸润世界树的生命力：当你激活狂暴时，获得等于你野蛮人等级的临时生命值；狂暴激活期间，在你的每个回合开始时，你可以赋予 10 尺内另一名生物临时生命值——投掷数量等于你狂暴伤害加值的 d6 并相加作为该数值。该生物在狂暴结束时失去由此获得的剩余临时生命值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-world-tree-branches-of-the-tree', subclassId: 'subclass-2024-barbarian-path-of-the-world-tree', name: '灵树枝杈', englishName: 'Branches of the Tree', level: 6,
    summary: '狂暴期间，30 尺内可见生物回合开始时可用反应令其力量豁免，失败传送至你 5 尺内并可令其速度归零。',
    description: '狂暴激活期间，当一个位于你 30 尺内且你可见的生物开始其回合时，你可以用反应在其周围召出世界树的灵体枝条：目标进行一次力量豁免（DC=8＋力量调整值＋熟练加值），失败则被传送至你 5 尺内或距你最近的、你可见的未占据空间；被传送后，你可以令其速度降至 0 直到当前回合结束。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-world-tree-battering-roots', subclassId: 'subclass-2024-barbarian-path-of-the-world-tree', name: '根击千钧', englishName: 'Battering Roots', level: 10,
    summary: '回合内持用重型或多用近战武器时触及 +10 尺；命中时可改用推离或失衡精通。',
    description: '在你的回合内，你持用的任何具有重型或多用词条的近战武器触及增加 10 尺。当你在自己回合内用该武器命中时，除了该武器原本的精通词条外，你还可以改用推离或失衡精通词条。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-world-tree-travel-along-the-tree', subclassId: 'subclass-2024-barbarian-path-of-the-world-tree', name: '世界树之奇旅', englishName: 'Travel along the Tree', level: 14,
    summary: '进入狂暴时可传送至多 60 尺，狂暴期间可用附赠动作传送；每次狂暴一次可提升至 150 尺并携带至多 6 名同伴。',
    description: '当你激活狂暴时，你可以传送至多 60 尺，到达一处你可见的未占据空间；狂暴激活期间，你也可以用一个附赠动作进行传送。每次狂暴期间仅一次，你可以把传送距离提升至 150 尺，并携带至多 6 名位于你 10 尺内的自愿生物；每名其他生物分别到达你目的地 10 尺内由你选择的未占据空间。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },

  // ============ 狂热者道途 ============
  {
    id: 'barbarian-2024-zealot-divine-fury', subclassId: 'subclass-2024-barbarian-path-of-the-zealot', name: '神性之怒', englishName: 'Divine Fury', level: 3,
    summary: '狂暴期间每回合首次命中追加 1d6＋野蛮人等级一半的伤害，类型为光耀或暗蚀。',
    description: '狂暴激活期间，你在每个回合中首次以武器或徒手打击命中生物时，对其造成 1d6＋你野蛮人等级一半（向下取整）的额外伤害；每次造成伤害时选择光耀或暗蚀作为伤害类型。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-zealot-warrior-of-the-gods', subclassId: 'subclass-2024-barbarian-path-of-the-zealot', name: '神之勇者', englishName: 'Warrior of the Gods', level: 3,
    summary: '获得 d12 治疗池（3 级 4 枚、6 级 5 枚、12 级 6 枚、17 级 7 枚）；附赠动作消耗任意枚骰子治疗自己；长休回满。',
    description: '你获得一个 d12 治疗池：以一个附赠动作，你可以消耗其中任意数量的骰子恢复自己的生命值，投掷并相加所消耗的骰子即为恢复量。治疗池上限随等级提升：3 级 4 枚、6 级 5 枚、12 级 6 枚、17 级 7 枚；完成长休后恢复全部已消耗骰子。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: ZEALOT_POOL_MAX, recovery: 'long-rest', unit: 'd12', note: '附赠动作消耗任意枚骰子治疗自己' },
  },
  {
    id: 'barbarian-2024-zealot-fanatical-focus', subclassId: 'subclass-2024-barbarian-path-of-the-zealot', name: '专心炽志', englishName: 'Fanatical Focus', level: 6,
    summary: '每次狂暴期间一次，豁免失败可重掷并加上狂暴伤害加值，必须采用新结果。',
    description: '每次狂暴期间仅一次，当你某次豁免检定失败时，你可以重掷该检定并在结果上加上你的狂暴伤害加值；你必须采用重掷后的结果。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-zealot-zealous-presence', subclassId: 'subclass-2024-barbarian-path-of-the-zealot', name: '狂热威仪', englishName: 'Zealous Presence', level: 10,
    summary: '附赠动作战吼，至多 10 名 60 尺内生物到下回合开始攻击与豁免优势；每次长休 1 次，可消耗狂暴次数重置。',
    description: '以一个附赠动作发出神圣战吼，选择至多 10 名位于你 60 尺内的生物：直到你的下个回合开始，他们的攻击检定与豁免检定具有优势。该特性使用后需完成长休才能再次使用；你也可以消耗一次狂暴使用次数（无需动作）来重置其使用权。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'barbarian-2024-zealot-rage-of-the-gods', subclassId: 'subclass-2024-barbarian-path-of-the-zealot', name: '神之狂暴', englishName: 'Rage of the Gods', level: 14,
    summary: '激活狂暴时呈现圣斗士姿态（1 分钟）：飞行、暗蚀／心灵／光耀抗性、反应救人至 30 尺内 0 HP 者；每次长休 1 次。',
    description: '当你激活狂暴时，你可以呈现圣斗士姿态，持续 1 分钟（生命值降至 0 时提前结束）；该特性使用后需完成长休才能再次使用。姿态期间：获得等于你速度的飞行速度并可悬浮；获得暗蚀、心灵与光耀伤害抗性；当位于你 30 尺内的生物生命值将要降至 0 时，你可以用反应消耗一次狂暴使用次数，使该生物的生命值改为等于你野蛮人等级的值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const barbarianSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-barbarian-path-of-the-berserker',
    classId: 'class-2024-barbarian',
    ruleset: '5e-2024',
    name: '狂战士道途',
    englishName: 'Path of the Berserker',
    selectionLevel: 3,
    summary: '把狂暴集中为直接的近战压力：追加伤害、免疫魅惑与恐慌、反击与群体恐惧。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: barbarianSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-barbarian-path-of-the-berserker'),
  },
  {
    id: 'subclass-2024-barbarian-path-of-wild-heart',
    classId: 'class-2024-barbarian',
    ruleset: '5e-2024',
    name: '兽心道途',
    englishName: 'Path of Wild Heart',
    selectionLevel: 3,
    summary: '与动物世界同行：按动物灵性在防御、机动、团队协作与探索能力之间切换。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: barbarianSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-barbarian-path-of-wild-heart'),
  },
  {
    id: 'subclass-2024-barbarian-path-of-the-world-tree',
    classId: 'class-2024-barbarian',
    ruleset: '5e-2024',
    name: '世界树道途',
    englishName: 'Path of the World Tree',
    selectionLevel: 3,
    summary: '以世界树的生命力与根系作战：临时生命、位移控制、延长触及与传送。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: barbarianSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-barbarian-path-of-the-world-tree'),
  },
  {
    id: 'subclass-2024-barbarian-path-of-the-zealot',
    classId: 'class-2024-barbarian',
    ruleset: '5e-2024',
    name: '狂热者道途',
    englishName: 'Path of the Zealot',
    selectionLevel: 3,
    summary: '以神圣信念强化狂暴：神性伤害、治疗池、豁免重掷、团队战吼与圣斗士姿态。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: barbarianSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-barbarian-path-of-the-zealot'),
  },
]
