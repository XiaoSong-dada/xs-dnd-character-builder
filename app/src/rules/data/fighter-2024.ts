import type { ChoiceCheckpoint, ClassFeature, ClassRule, RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'
import { spells2024 } from '@/rules/data/spells-2024'

/**
 * 2024 战士与勇士（B08-01）。
 *
 * 规则依据：B01《职业》CF-001—018、《职业-全量》CV-001／CV-002、
 * `docs/classes/subclasses/fighter/fighter.md` 与 `fighter-champion.md`；
 * 装备引用使用 B07-A 的 2024 普通装备目录。
 * 特性 `summary`／`description` 为原创中文转述，只提供服务端选择、展示与校验元数据。
 */
const sourceIds = ['source-2024-phb'] as const

/** 2024 战斗大师战技候选（与 fighterOptions2024 保持一致）。 */
const MANEUVER_2024_IDS: readonly string[] = [
  'maneuver-2024-ambush', 'maneuver-2024-bait-and-switch', 'maneuver-2024-commanders-strike', 'maneuver-2024-commanding-presence',
  'maneuver-2024-disarming-attack', 'maneuver-2024-distracting-strike', 'maneuver-2024-evasive-footwork', 'maneuver-2024-feinting-attack',
  'maneuver-2024-goading-attack', 'maneuver-2024-lunging-attack', 'maneuver-2024-maneuvering-attack', 'maneuver-2024-menacing-attack',
  'maneuver-2024-parry', 'maneuver-2024-precision-attack', 'maneuver-2024-pushing-attack', 'maneuver-2024-rally',
  'maneuver-2024-riposte', 'maneuver-2024-sweeping-attack', 'maneuver-2024-tactical-assessment', 'maneuver-2024-trip-attack',
]

const FIGHTER_SKILL_OPTION_IDS = [
  'skill-acrobatics',
  'skill-animal-handling',
  'skill-athletics',
  'skill-history',
  'skill-insight',
  'skill-intimidation',
  'skill-persuasion',
  'skill-perception',
  'skill-survival',
] as const

/** 武器精通数量：1—3 级 3 种、4—9 级 4 种、10—15 级 5 种、16 级起 6 种。 */
const WEAPON_MASTERY_COUNTS = [
  3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6,
] as const

/** 回气次数：1—3 级 2 次、4—9 级 3 次、10 级起 4 次。 */
const SECOND_WIND_MAX = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] as const

/** 动作如潮：2—16 级 1 次、17 级起 2 次。 */
const ACTION_SURGE_MAX = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2] as const

/** 不屈：9—12 级 1 次、13—16 级 2 次、17 级起 3 次。 */
const INDOMITABLE_MAX = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3] as const

export const fighterFeatures2024: readonly ClassFeature[] = [
  {
    id: 'fighter-2024-class-fighting-style', classId: 'class-2024-fighter', name: '战斗风格', englishName: 'Fighting Style', level: 1,
    summary: '获得一项战斗风格专长；每次获得战士等级时可替换为另一项。',
    description: '你获得一项由你选择的战斗风格专长。每当你获得一个战士等级时，你可以把该特性授予的战斗风格专长替换为另一个战斗风格专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-fighter-style-1'], status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-class-second-wind', classId: 'class-2024-fighter', name: '回气', englishName: 'Second Wind', level: 1,
    summary: '以附赠动作恢复 1d10＋战士等级生命值；1—3 级 2 次、4—9 级 3 次、10 级起 4 次；短休恢复 1 次，长休回满。',
    description: '以一个附赠动作恢复 1d10＋你的战士等级点生命值。使用次数：1—3 级 2 次、4—9 级 3 次、10 级起 4 次；完成短休后恢复 1 次已消耗次数，完成长休后恢复全部。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
    resource: { maxByLevel: SECOND_WIND_MAX, recovery: 'short-rest', shortRestRecovery: 1, note: '短休恢复 1 次，长休回满' },
  },
  {
    id: 'fighter-2024-class-weapon-mastery', classId: 'class-2024-fighter', name: '武器精通', englishName: 'Weapon Mastery', level: 1,
    summary: '选择 3／4／5／6 种简易或军用武器的精通词条（1／4／10／16 级）；长休可替换一种。',
    description: '你对武器的训练让你能运用所选武器种类的精通词条：1 级选择 3 种简易或军用武器，4 级起 4 种、10 级起 5 种、16 级起 6 种。每次完成长休时可以重新演练并替换其中一种。持有或熟练某种武器不会自动获得其精通词条。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-fighter-mastery-1'], status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-class-action-surge', classId: 'class-2024-fighter', name: '动作如潮', englishName: 'Action Surge', level: 2,
    summary: '本回合额外执行一个非魔法动作；2 级 1 次、17 级 2 次，每回合至多一次，短休／长休恢复。',
    description: '在你的回合中，你可以执行一个额外的动作，该动作不能用于魔法动作。使用后需完成短休或长休才能再次使用；17 级起每次休息之间可使用 2 次，但每回合只能使用一次。',
    kind: 'action', status: 'implemented', sourceIds,
    resource: { maxByLevel: ACTION_SURGE_MAX, recovery: 'short-rest', note: '每回合至多使用一次' },
  },
  {
    id: 'fighter-2024-class-tactical-mind', classId: 'class-2024-fighter', name: '战术思维', englishName: 'Tactical Mind', level: 2,
    summary: '属性检定失败后消耗一次回气，掷 1d10 加入结果；加值后仍失败则不消耗。',
    description: '当你在一次属性检定中失败时，你可以消耗一次回气次数，掷 1d10 并把结果加入检定（而非恢复生命值）；若加入后检定仍然失败，则不消耗该次数。该能力不作用于攻击检定与豁免检定。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-class-subclass', classId: 'class-2024-fighter', name: '战士子职', englishName: 'Fighter Subclass', level: 3,
    summary: '选择一项战士子职，并在 3、7、10、15、18 级获得其特性。',
    description: '你在 3 级选择一项战士子职。此后获得该子职的能力，前提是所需等级不超过你的战士等级；战士特性表列出了子职提供新特性的等级。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-fighter-subclass-3'], status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-class-extra-attack', classId: 'class-2024-fighter', name: '额外攻击', englishName: 'Extra Attack', level: 5,
    summary: '攻击动作可进行两次攻击。',
    description: '你在自己回合内执行攻击动作时，可以发动两次攻击而非一次。不同职业的同名特性不叠加。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-class-tactical-shift', classId: 'class-2024-fighter', name: '战术转进', englishName: 'Tactical Shift', level: 5,
    summary: '以附赠动作回气时可移动至多半速，且不引发借机攻击。',
    description: '每当你使用附赠动作进行回气时，你可以移动至多相当于你速度一半的距离，且该移动不会引发借机攻击。该移动与本次回气绑定，不是常驻移动加成。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-class-indomitable', classId: 'class-2024-fighter', name: '不屈', englishName: 'Indomitable', level: 9,
    summary: '豁免失败时重掷并加战士等级，必须采用新结果；9／13／17 级 1／2／3 次，长休恢复。',
    description: '当你在一次豁免检定中失败时，你可以重掷并加上等同你战士等级的值；你必须采用新的掷骰结果。使用次数：9—12 级 1 次、13—16 级 2 次、17 级起 3 次；完成长休后恢复全部已消耗次数。',
    kind: 'passive', status: 'implemented', sourceIds,
    resource: { maxByLevel: INDOMITABLE_MAX, recovery: 'long-rest', note: '必须采用重掷结果' },
  },
  {
    id: 'fighter-2024-class-tactical-master', classId: 'class-2024-fighter', name: '战术主宰', englishName: 'Tactical Master', level: 9,
    summary: '使用已解锁精通的武器攻击时，可把本次攻击的精通词条改为推离、削弱或缓速。',
    description: '每当你用武器发动攻击且可以使用该武器的精通词条时，你可以把这次攻击的精通词条改为推离、削弱或缓速中的一种。替换只影响本次攻击，不叠加原本的精通。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-class-extra-attack-2', classId: 'class-2024-fighter', name: '额外攻击（强化）', englishName: 'Two Extra Attacks', level: 11,
    summary: '攻击动作可进行三次攻击。',
    description: '你在自己回合内执行攻击动作时，可以发动三次攻击而非一次。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-class-indomitable-2', classId: 'class-2024-fighter', name: '不屈（强化）', englishName: 'Indomitable', level: 13,
    summary: '不屈每两次长休之间可用次数增至 2 次。',
    description: '不屈的使用次数增至 2 次（每两次长休之间）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-class-studied-attacks', classId: 'class-2024-fighter', name: '究明攻击', englishName: 'Studied Attacks', level: 13,
    summary: '对目标攻击失手后，直到自己下回合结束前对该目标的下次攻击具有优势。',
    description: '如果你对一个生物进行攻击检定但失手，那么直到你的下个回合结束前，你对该生物的下一次攻击检定具有优势。该优势不能视为永久命中加值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-class-action-surge-2', classId: 'class-2024-fighter', name: '动作如潮（强化）', englishName: 'Action Surge', level: 17,
    summary: '动作如潮每两次休息之间可用次数增至 2 次（每回合仍限一次）。',
    description: '动作如潮的使用次数增至 2 次（每短休或长休之间），每回合仍只能使用一次。',
    kind: 'action', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-class-indomitable-3', classId: 'class-2024-fighter', name: '不屈（强化）', englishName: 'Indomitable', level: 17,
    summary: '不屈每两次长休之间可用次数增至 3 次。',
    description: '不屈的使用次数增至 3 次（每两次长休之间）。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-class-epic-boon', classId: 'class-2024-fighter', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长，或其他一项满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一项你选择的、满足条件且适用的专长。该选择与其他属性提升／专长机会相互独立。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-fighter-feat-19'], status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-class-extra-attack-3', classId: 'class-2024-fighter', name: '额外攻击（强化）', englishName: 'Three Extra Attacks', level: 20,
    summary: '攻击动作可进行四次攻击。',
    description: '你在自己回合内执行攻击动作时，可以发动四次攻击而非一次。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const fighterRule2024: ClassRule = {
  id: 'class-2024-fighter',
  ruleset: '5e-2024',
  name: '战士',
  englishName: 'Fighter',
  summary: '2024版武器专家：战斗风格、武器精通、回气与动作如潮。',
  introduction: '战场上的武器与护甲专家：武器精通与额外攻击提供稳定输出，回气与动作如潮增强持续作战，范型覆盖从勇士到战斗大师的多种风格。',
  hitDie: 10,
  primaryAbilities: ['str', 'dex'],
  playStyleTags: ['frontline', 'durable', 'striker', 'ranged'],
  savingThrowAbilities: ['str', 'con'],
  status: 'implemented',
  sourceIds,
  armorTraining: ['light', 'medium', 'heavy', 'shield'],
  weaponTraining: { categories: ['simple', 'martial'] },
  features: fighterFeatures2024,
  checkpoints: [
    {
      id: 'class-2024-fighter-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择2项战士技能', description: '从战士技能列表中选择2项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: FIGHTER_SKILL_OPTION_IDS,
    },
    {
      id: 'class-2024-fighter-style-1', level: 1, step: 'timeline', kind: 'fighting-style',
      title: '选择战斗风格', description: '战斗风格专长由战士1级特性授予；升级时可替换。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['fighting-style'],
    },
    {
      id: 'class-2024-fighter-mastery-1', level: 1, step: 'timeline', kind: 'weapon-mastery',
      title: '选择武器精通', description: '选择精通词条的武器种类；1／4／10／16级起为3／4／5／6种，长休可替换一种。',
      required: true, minSelections: 3, maxSelections: 3, optionIds: [],
      candidateKind: 'weapon-mastery', selectionCountByLevel: WEAPON_MASTERY_COUNTS,
    },
    ...[4, 6, 8, 12, 14, 16].map((level): ChoiceCheckpoint => ({
      id: `class-2024-fighter-feat-${level}`, level, step: 'timeline' as const, kind: 'ability-improvement' as const,
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    {
      id: 'class-2024-fighter-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '19级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
}

export const fighterSubclassFeatures2024: readonly SubclassFeature[] = [
  {
    id: 'fighter-2024-champion-improved-critical', subclassId: 'subclass-2024-fighter-champion', name: '精通重击', englishName: 'Improved Critical', level: 3,
    summary: '武器或徒手攻击掷出自然 19—20 时造成重击。',
    description: '你的武器或徒手攻击检定在原始 d20 掷出 19 或 20 时造成重击。15 级的“高效重击”会覆盖该范围，而不是叠加。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-champion-remarkable-athlete', subclassId: 'subclass-2024-fighter-champion', name: '运动健将', englishName: 'Remarkable Athlete', level: 3,
    summary: '先攻与力量（运动）检定具有优势；重击后可半速移动且不引发借机攻击。',
    description: '你的先攻检定与力量（运动）检定具有优势。当你造成重击后，可以立即移动至多相当于你速度一半的距离，且该移动不会引发借机攻击。该特性不提供 2014 版“未熟练体能检定加半熟练”的效果。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-champion-additional-fighting-style', subclassId: 'subclass-2024-fighter-champion', name: '额外战斗风格', englishName: 'Additional Fighting Style', level: 7,
    summary: '再获得一项战斗风格专长；不能重复已选风格。',
    description: '你再获得一项由你选择的战斗风格专长，用于扩展武器或防御路线。不能选择你已经拥有的战斗风格专长（除非该专长允许复选）。',
    kind: 'choice', requiresChoice: true, featCategories: ['fighting-style'], status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-champion-heroic-warrior', subclassId: 'subclass-2024-fighter-champion', name: '勇战英豪', englishName: 'Heroic Warrior', level: 10,
    summary: '战斗中自己回合开始时若没有英雄激励，则可获得一份。',
    description: '战斗期间，若你在自己回合开始时没有英雄激励，则你可以获得一份英雄激励。英雄激励只持有一份，可用于重掷任意一个骰子（不限于 d20），消耗后按通用规则处理。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-champion-superior-critical', subclassId: 'subclass-2024-fighter-champion', name: '高效重击', englishName: 'Superior Critical', level: 15,
    summary: '武器或徒手攻击的重击范围改为自然 18—20。',
    description: '你的武器或徒手攻击检定在原始 d20 掷出 18、19 或 20 时造成重击。该范围覆盖“精通重击”，不与其叠加。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-champion-survivor', subclassId: 'subclass-2024-fighter-champion', name: '百折不挠', englishName: 'Survivor', level: 18,
    summary: '死亡豁免优势且自然 18—20 视为 20；浴血且未昏迷时回合开始恢复 5＋体质调整值。',
    description: '该特性包含两项效果：蔑视死亡——你的死亡豁免检定具有优势，且原始结果为 18—20 时视为掷出 20；英气风发——若你在自己回合开始时已浴血（生命值不高于上限一半）且至少有 1 点生命值，则恢复 5＋你的体质调整值点生命值。恢复受最大生命值限制，不会因为恢复后超过半血而被截断；生命值为 0 时不触发。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 奥法骑士 ============
  {
    id: 'fighter-2024-eldritch-knight-spellcasting', subclassId: 'subclass-2024-fighter-eldritch-knight', name: '施法', englishName: 'Spellcasting', level: 3,
    summary: '智力的三分之一施法者（法师法术表）：3 级 2 戏法、3 道准备；每获得战士等级可替换一道准备法术。',
    description: '你习得两道法师戏法，并准备三道来自法师法术列表的一环法术；施法属性为智力，可用奥术法器作为法器。准备数量与法术位按三分之一施法者表随战士等级提升；每获得一级战士等级可替换一道准备法术。10 级额外习得一道法师戏法。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-eldritch-knight-war-bond', subclassId: 'subclass-2024-fighter-eldritch-knight', name: '战争联结', englishName: 'War Bond', level: 3,
    summary: '仪式绑定最多两把武器：不能在 5 尺外被缴械，可用附赠动作召唤回手中。',
    description: '你可以进行一道 1 小时仪式将一把你触摸的武器与你绑定（最多两把）。绑定期间，该武器不能在你 5 尺外被缴械；如果你与它的距离超过 5 尺，可以用附赠动作将其召唤回手中。若你死亡或与另一把武器绑定超过上限，则原绑定结束。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-eldritch-knight-war-magic', subclassId: 'subclass-2024-fighter-eldritch-knight', name: '战争魔法', englishName: 'War Magic', level: 7,
    summary: '执行攻击动作时可把一次攻击替换为施展一道法师戏法。',
    description: '当你在自己回合内执行攻击动作时，你可以将其中一次攻击替换为施展一道施法时间为动作的法师戏法。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-eldritch-knight-eldritch-strike', subclassId: 'subclass-2024-fighter-eldritch-knight', name: '奥法打击', englishName: 'Eldritch Strike', level: 10,
    summary: '武器命中后，目标对抗你下一道法术的豁免具有劣势（持续至你下回合结束）。',
    description: '当你以武器攻击检定命中一个生物后，该生物对抗你接下来施展的一道法术所进行的豁免检定具有劣势，持续至你的下个回合结束。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-eldritch-knight-arcane-charge', subclassId: 'subclass-2024-fighter-eldritch-knight', name: '奥能冲锋', englishName: 'Arcane Charge', level: 15,
    summary: '使用动作如潮时可传送至多 30 尺到一处可见空位。',
    description: '当你使用动作如潮时，你可以传送至多 30 尺到一处你可见的未占据空间，传送前或后均可以继续正常行动。该传送不消耗移动力，也不引发借机攻击。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-eldritch-knight-improved-war-magic', subclassId: 'subclass-2024-fighter-eldritch-knight', name: '精通战争魔法', englishName: 'Improved War Magic', level: 18,
    summary: '执行攻击动作时可把两次攻击替换为施展一道一环或二环法师法术。',
    description: '当你在自己回合内执行攻击动作时，你可以将其中两次攻击替换为施展一道一环或二环的法师法术。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 战斗大师 ============
  {
    id: 'fighter-2024-battle-master-combat-superiority', subclassId: 'subclass-2024-fighter-battle-master', name: '卓越战技', englishName: 'Combat Superiority', level: 3,
    summary: '习得 3 项战技与 4 枚 d8 卓越骰（短休／长休全部恢复）；7／10／15 级各再习得 2 项战技。',
    description: '你从战技项中习得三种自选战技，并获得四枚 d8 卓越骰；卓越骰一经使用即消耗，完成短休或长休后全部恢复。你在 7、10、15 级各再习得两种战技，并可额外替换一个已有战技；7 级骰数增至 5 枚，10 级骰面变为 d10，15 级骰数增至 6 枚，18 级骰面变为 d12。若战技需要豁免，其 DC = 8 + 你的力量或敏捷调整值（由你选择）+ 熟练加值。每次攻击只能应用一次战技。',
    kind: 'resource', status: 'implemented', sourceIds,
    requiresChoice: true, optionIds: MANEUVER_2024_IDS, minSelections: 3, maxSelections: 3,
    dicePool: { diceByLevel: [0, 0, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6], dieByLevel: ['', '', 'd8', 'd8', 'd8', 'd8', 'd8', 'd8', 'd8', 'd10', 'd10', 'd10', 'd10', 'd10', 'd10', 'd10', 'd10', 'd12', 'd12', 'd12'], recovery: 'short-rest', note: '短休或长休全部恢复；每次攻击只能应用一次战技' },
  },
  {
    id: 'fighter-2024-battle-master-student-of-war', subclassId: 'subclass-2024-fighter-battle-master', name: '战争学者', englishName: 'Student of War', level: 3,
    summary: '获得一种工匠工具熟练，以及一项战士 1 级可用技能的熟练。',
    description: '你选择一种工匠工具并获得其熟练；此外，你选择一项战士 1 级可用的技能，并获得该技能的熟练（若已熟练则按规则处理）。工具与技能的正式选项录入随语言／工具流程后续补齐。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-battle-master-additional-maneuvers', subclassId: 'subclass-2024-fighter-battle-master', name: '额外战技（7 级）', englishName: 'Additional Maneuvers', level: 7,
    summary: '再习得两种自选战技，并可额外替换一个已有战技。',
    description: '你在 7 级再习得两种由你选择的新战技，并可以额外替换一个已经习得的战技。',
    kind: 'choice', requiresChoice: true, optionIds: MANEUVER_2024_IDS, minSelections: 2, maxSelections: 2, status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-battle-master-know-your-enemy', subclassId: 'subclass-2024-fighter-battle-master', name: '料敌机先', englishName: 'Know Your Enemy', level: 7,
    summary: '研究或交互 1 分钟后可知目标的免疫、抗性、易伤或能力对比信息。',
    description: '当你花至少 1 分钟观察或与另一个生物交互时，你可以了解其部分能力对比：免疫、抗性、易伤；或得知你或它哪项属性、防御或能力更强。具体信息由规则文本裁定。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-battle-master-improved-combat-superiority', subclassId: 'subclass-2024-fighter-battle-master', name: '精通战技', englishName: 'Improved Combat Superiority', level: 10,
    summary: '卓越骰骰面提升为 d10；另习得两种战技。',
    description: '你的卓越骰骰面提升为 d10（在 18 级进一步变为 d12）；你在 10 级再习得两种自选战技。',
    kind: 'choice', requiresChoice: true, optionIds: MANEUVER_2024_IDS, minSelections: 2, maxSelections: 2, status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-battle-master-relentless', subclassId: 'subclass-2024-fighter-battle-master', name: '坚韧', englishName: 'Relentless', level: 15,
    summary: '投先攻时若没有卓越骰则获得 1 枚；另习得两种战技且骰数增至 6。',
    description: '当你投掷先攻时，若你没有卓越骰，则你获得一枚卓越骰；此外，你在 15 级再习得两种自选战技，且卓越骰数量增至 6 枚。',
    kind: 'choice', requiresChoice: true, optionIds: MANEUVER_2024_IDS, minSelections: 2, maxSelections: 2, status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-battle-master-ultimate-combat-superiority', subclassId: 'subclass-2024-fighter-battle-master', name: '究极战技', englishName: 'Ultimate Combat Superiority', level: 18,
    summary: '卓越骰骰面提升为 d12。',
    description: '你的卓越骰骰面提升为 d12。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 灵能武士 ============
  {
    id: 'fighter-2024-psi-warrior-psionic-power', subclassId: 'subclass-2024-fighter-psi-warrior', name: '灵能力量', englishName: 'Psionic Power', level: 3,
    summary: '灵能骰池（3 级 4d6 → 17 级 12d12；短休恢复 1 枚、长休全部）；庇护力场、灵能打击与念力控物。',
    description: '你获得灵能骰池：3 级 4d6、5 级 6d8、9 级 8d8、11 级 8d10、13 级 10d10、17 级 12d12；完成短休时可重获 1 枚已消耗骰，完成长休时全部重获。可用能力：庇护力场——反应消耗 1 枚灵能骰，为你或 30 尺内一个可见生物降低骰值＋智力调整值的伤害（至少 1）；灵能打击——每回合一次，武器命中 30 尺内目标后消耗 1 枚骰，追加骰值＋智力调整值的力场伤害；念力控物——魔法动作将 30 尺内一个自愿生物或至多大型的未固定物件移动至多 30 尺，每次短休或长休 1 次（可消耗 1 枚灵能骰重置）。',
    kind: 'resource', status: 'implemented', sourceIds,
    dicePool: { diceByLevel: [0, 0, 4, 4, 6, 6, 6, 6, 8, 8, 8, 8, 10, 10, 10, 10, 12, 12, 12, 12], dieByLevel: ['', '', 'd6', 'd6', 'd8', 'd8', 'd8', 'd8', 'd8', 'd8', 'd10', 'd10', 'd10', 'd10', 'd10', 'd10', 'd12', 'd12', 'd12', 'd12'], recovery: 'short-rest', shortRestRecovery: 1, note: '短休恢复 1 枚，长休全部恢复' },
  },
  {
    id: 'fighter-2024-psi-warrior-telekinetic-adept', subclassId: 'subclass-2024-fighter-psi-warrior', name: '念力精通', englishName: 'Telekinetic Adept', level: 7,
    summary: '获得念力推拉与念力飞跃：可用灵能骰强化移动或推送目标。',
    description: '你掌握更精细的念力：念力推拉——可用灵能骰推动或拉近目标；念力飞跃——可用灵能骰提升跳跃与移动能力。具体数值与动作以规则文本为准，本条目只登记规则关系。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-psi-warrior-guarded-mind', subclassId: 'subclass-2024-fighter-psi-warrior', name: '意念守护', englishName: 'Guarded Mind', level: 10,
    summary: '获得心灵伤害抗性；可在回合结束时消耗 1 枚灵能骰结束魅惑或恐慌状态。',
    description: '你获得对心灵伤害的抗性。此外，若你被魅惑或恐慌，你可以在你的回合结束时消耗一枚灵能骰来结束该状态。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-psi-warrior-bulwark-of-force', subclassId: 'subclass-2024-fighter-psi-warrior', name: '力场壁垒', englishName: 'Bulwark of Force', level: 15,
    summary: '附赠动作消耗 1 枚灵能骰，为 30 尺内若干生物提供半身掩护 1 分钟。',
    description: '以一个附赠动作，你可以消耗一枚灵能骰，选择至多等于你智力调整值（至少 1）个位于你 30 尺内的生物（可包括你自己），使其获得半身掩护 1 分钟或直至你陷入失能。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'fighter-2024-psi-warrior-telekinetic-master', subclassId: 'subclass-2024-fighter-psi-warrior', name: '念力宗师', englishName: 'Telekinetic Master', level: 18,
    summary: '始终准备心灵遥控；可用灵能骰免费施展。',
    description: '你始终准备着法术心灵遥控（不占准备上限）。你可以消耗一枚灵能骰无需法术位施展该法术。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const fighterSubclasses2024: readonly SubclassRule[] = [{
  id: 'subclass-2024-fighter-champion',
  classId: 'class-2024-fighter',
  ruleset: '5e-2024',
  name: '勇士',
  englishName: 'Champion',
  selectionLevel: 3,
  summary: '扩大重击范围、强化运动能力，并在高等级获得英雄激励与持续恢复。',
  status: 'implemented',
  availability: 'player',
  sourceIds,
  features: fighterSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-fighter-champion'),
}, {
  id: 'subclass-2024-fighter-eldritch-knight',
  classId: 'class-2024-fighter',
  ruleset: '5e-2024',
  name: '奥法骑士',
  englishName: 'Eldritch Knight',
  selectionLevel: 3,
  summary: '以智力的三分之一施法能力结合武器：战争联结、战争魔法与高等级奥法打击。',
  status: 'implemented',
  availability: 'player',
  sourceIds,
  features: fighterSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-fighter-eldritch-knight'),
  spellcasting: {
    ruleset: '5e-2024',
    mode: 'prepared',
    ability: 'int',
    startsAtLevel: 3,
    preparedCountByLevel: [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13],
    cantripsKnownByLevel: [0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    maxSpellLevelByClassLevel: [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4],
    slotsByClassLevel: [[], [], [2], [3], [3], [3], [4, 2], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2], [4, 3, 2], [4, 3, 3], [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1]],
    classSpellIds: spells2024.filter((spell) => spell.classIds.includes('class-2024-wizard')).map((spell) => spell.id),
  },
}, {
  id: 'subclass-2024-fighter-battle-master',
  classId: 'class-2024-fighter',
  ruleset: '5e-2024',
  name: '战斗大师',
  englishName: 'Battle Master',
  selectionLevel: 3,
  summary: '以卓越骰驱动战技：推倒、缴械、指挥同伴与防守反击，战术选择丰富。',
  status: 'implemented',
  availability: 'player',
  sourceIds,
  features: fighterSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-fighter-battle-master'),
}, {
  id: 'subclass-2024-fighter-psi-warrior',
  classId: 'class-2024-fighter',
  ruleset: '5e-2024',
  name: '灵能武士',
  englishName: 'Psi Warrior',
  selectionLevel: 3,
  summary: '以灵能骰强化防御与打击：庇护力场、灵能打击、念力控物与力场壁垒。',
  status: 'implemented',
  availability: 'player',
  sourceIds,
  features: fighterSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-fighter-psi-warrior'),
}]

/** 2024 战斗大师战技选项（20 项，短休可更换；跨等级不可重复）。 */
export const fighterOptions2024: readonly RuleOption[] = [
  { id: 'maneuver-2024-ambush', name: '伏击', englishName: 'Ambush', description: '敏捷（隐匿）或先攻检定时消耗一枚卓越骰加入结果。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-bait-and-switch', name: '换位诈术', englishName: 'Bait and Switch', description: '与 5 尺内自愿生物互换位置（消耗 5 尺移动力），可选一枚卓越骰增强自身或同伴 AC。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-commanders-strike', name: '指挥官奇袭', englishName: "Commander's Strike", description: '放弃一次攻击，让同伴以反应发动一次武器攻击并加上卓越骰伤害。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-commanding-presence', name: '领导风范', englishName: 'Commanding Presence', description: '魅力（威吓／表演／游说）检定加入一枚卓越骰。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-disarming-attack', name: '缴械攻击', englishName: 'Disarming Attack', description: '命中时消耗卓越骰加伤，目标力量豁免失败则弃械。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-distracting-strike', name: '扰乱打击', englishName: 'Distracting Strike', description: '命中时消耗卓越骰加伤，你下回合前同伴对目标的首次攻击具有优势。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-evasive-footwork', name: '灵巧步法', englishName: 'Evasive Footwork', description: '附赠动作消耗卓越骰并撤离，骰值加入 AC 直到你下回合开始。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-feinting-attack', name: '诡诈攻击', englishName: 'Feinting Attack', description: '附赠动作指定 5 尺内目标：本回合对其下次攻击具有优势，命中后加卓越骰伤害。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-goading-attack', name: '挑衅攻击', englishName: 'Goading Attack', description: '命中时消耗卓越骰加伤，目标感知豁免失败则攻击除你外生物具有劣势。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-lunging-attack', name: '突刺攻击', englishName: 'Lunging Attack', description: '附赠动作疾走；若直线移动 5 尺后命中，可将卓越骰加在所攻击伤害中。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-maneuvering-attack', name: '灵动攻击', englishName: 'Maneuvering Attack', description: '命中时消耗卓越骰加伤，并让同伴以反应移动半速且不引发目标借机攻击。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-menacing-attack', name: '恐吓攻击', englishName: 'Menacing Attack', description: '命中时消耗卓越骰加伤，目标感知豁免失败则陷入恐慌至你下回合结束。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-parry', name: '格挡', englishName: 'Parry', description: '被近战攻击时反应消耗卓越骰，减少骰值＋力量或敏捷调整值的伤害。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-precision-attack', name: '精准攻击', englishName: 'Precision Attack', description: '攻击失手时消耗卓越骰加入攻击检定。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-pushing-attack', name: '推撞攻击', englishName: 'Pushing Attack', description: '命中时消耗卓越骰加伤，大型及以下目标力量豁免失败则被推离 15 尺。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-rally', name: '重整旗鼓', englishName: 'Rally', description: '附赠动作消耗卓越骰，30 尺内同伴获得战士等级一半＋骰值的临时生命。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-riposte', name: '反击', englishName: 'Riposte', description: '近战攻击失手时反应消耗卓越骰，以武器或徒手反击并加骰值伤害。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-sweeping-attack', name: '横扫攻击', englishName: 'Sweeping Attack', description: '命中时消耗卓越骰，对触及内第二个目标造成骰值伤害（同类型）。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-tactical-assessment', name: '战术预估', englishName: 'Tactical Assessment', description: '智力（调查／历史）或感知（洞悉）检定加入一枚卓越骰。', status: 'implemented', sourceIds },
  { id: 'maneuver-2024-trip-attack', name: '摔绊攻击', englishName: 'Trip Attack', description: '命中时消耗卓越骰加伤，大型及以下目标力量豁免失败则倒地。', status: 'implemented', sourceIds },
]
