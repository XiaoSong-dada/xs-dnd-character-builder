import type { ChoiceCheckpoint, ClassFeature, ClassRule, SubclassFeature, SubclassRule } from '@/types/rules'

/**
 * 2024 战士与勇士（B08-01）。
 *
 * 规则依据：B01《职业》CF-001—018、《职业-全量》CV-001／CV-002、
 * `docs/classes/subclasses/fighter/fighter.md` 与 `fighter-champion.md`；
 * 装备引用使用 B07-A 的 2024 普通装备目录。
 * 特性 `summary`／`description` 为原创中文转述，只提供服务端选择、展示与校验元数据。
 */
const sourceIds = ['source-2024-phb'] as const

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
    resource: { maxByLevel: SECOND_WIND_MAX, recovery: 'short-rest', note: '短休恢复 1 次，长休回满' },
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
  features: fighterSubclassFeatures2024,
}]
