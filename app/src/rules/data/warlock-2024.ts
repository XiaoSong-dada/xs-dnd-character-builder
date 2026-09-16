import type { ChoiceCheckpoint, ClassFeature, ClassRule, RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'
import { spells2024 } from '@/rules/data/spells-2024'
import { invocations2024 } from '@/rules/data/invocations-2024'

/**
 * 2024 魔契师与 4 个宗主（B08-10）。
 *
 * 规则依据：B01《职业-全量》CV-060、CV-056—059 与项目内《5e 不全书》2024 魔契师章节；
 * `docs/classes/subclasses/warlock/*.md` 提供结构与边界说明。
 * 特性名称采用 5e 不全书译名，摘要与详情为原创中文转述。
 * 魔能祈唤按 B08 计划 §11.2-5 以“选择＋描述＋类别标记”登记，不拆散派生（书之魔契子选择、契约武器实例保持边界）。
 */
const sourceIds = ['source-2024-phb'] as const

/** 魔契师技能候选：奥秘、欺瞒、历史、威吓、调查、自然、宗教。 */
const WARLOCK_SKILL_OPTION_IDS = [
  'skill-arcana',
  'skill-deception',
  'skill-history',
  'skill-intimidation',
  'skill-investigation',
  'skill-nature',
  'skill-religion',
] as const

// 2024 魔契师成长表（B01 CV-060 核对）。
const WARLOCK_PREPARED = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15] as const
const WARLOCK_CANTRIPS = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] as const
/** 契约法术位：[数量, 契约环级]。 */
const PACT_SLOTS: readonly (readonly [number, number])[] = [
  [1, 1], [2, 1], [2, 2], [2, 2], [2, 3], [2, 3], [2, 4], [2, 4], [2, 5], [2, 5],
  [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [4, 5], [4, 5], [4, 5], [4, 5],
]
/** 可准备法术的环级上限＝契约环级（1—5）；六至九环由玄奥秘法提供。 */
const PACT_LEVELS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] as const

/** 各祈唤检查点的选择数量（1／2／5／7／9／12／15／18 级累计到 10 项）。 */
const INVOCATION_CHECKPOINTS = [
  { id: 'class-2024-warlock-invocations-1', level: 1, count: 1 },
  { id: 'class-2024-warlock-invocations-2', level: 2, count: 2 },
  { id: 'class-2024-warlock-invocations-5', level: 5, count: 2 },
  { id: 'class-2024-warlock-invocations-7', level: 7, count: 1 },
  { id: 'class-2024-warlock-invocations-9', level: 9, count: 1 },
  { id: 'class-2024-warlock-invocations-12', level: 12, count: 1 },
  { id: 'class-2024-warlock-invocations-15', level: 15, count: 1 },
  { id: 'class-2024-warlock-invocations-18', level: 18, count: 1 },
] as const

/** 天界宗主治愈之光：等级 +1 枚 d6，长休全部恢复。 */
const HEALING_LIGHT_DICE = [0, 0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] as const

/** N 级起每次长休 1 次（用于限次特性资源登记）。 */
const onceFromLevel = (level: number): readonly number[] =>
  Array.from({ length: 20 }, (_, index) => (index + 1 >= level ? 1 : 0))

const warlockClassSpellIds2024 = spells2024
  .filter((spell) => spell.classIds.includes('class-2024-warlock'))
  .map((spell) => spell.id)

/** 按检查点等级筛选可选的魔能祈唤（等级先决）。 */
function invocationIdsAt(level: number): readonly string[] {
  return invocations2024
    .filter((option) => (option.minimumLevel ?? 1) <= level)
    .map((option) => option.id)
}

/** 宗主法术始终准备。 */
const ARCHFEY_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-faerie-fire', 'spell-2024-sleep', 'spell-2024-calm-emotions', 'spell-2024-misty-step', 'spell-2024-phantasmal-force'],
  5: ['spell-2024-blink', 'spell-2024-plant-growth'],
  7: ['spell-2024-dominate-beast', 'spell-2024-greater-invisibility'],
  9: ['spell-2024-dominate-person', 'spell-2024-seeming'],
}
const CELESTIAL_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-light', 'spell-2024-sacred-flame', 'spell-2024-cure-wounds', 'spell-2024-guiding-bolt', 'spell-2024-aid', 'spell-2024-lesser-restoration'],
  5: ['spell-2024-daylight', 'spell-2024-revivify'],
  7: ['spell-2024-guardian-of-faith', 'spell-2024-wall-of-fire'],
  9: ['spell-2024-greater-restoration', 'spell-2024-summon-celestial'],
}
const FIEND_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-burning-hands', 'spell-2024-command', 'spell-2024-scorching-ray', 'spell-2024-suggestion'],
  5: ['spell-2024-fireball', 'spell-2024-stinking-cloud'],
  7: ['spell-2024-fire-shield', 'spell-2024-wall-of-fire'],
  9: ['spell-2024-geas', 'spell-2024-insect-plague'],
}
const GREAT_OLD_ONE_SPELLS: Readonly<Record<number, readonly string[]>> = {
  3: ['spell-2024-dissonant-whispers', 'spell-2024-tasha-s-hideous-laughter', 'spell-2024-phantasmal-force', 'spell-2024-detect-thoughts'],
  5: ['spell-2024-clairvoyance', 'spell-2024-hunger-of-hadar'],
  7: ['spell-2024-confusion', 'spell-2024-summon-aberration'],
  9: ['spell-2024-modify-memory', 'spell-2024-telekinesis'],
}

/** 魔契师职业专属选项：魔能祈唤并入仓库选项表。 */
export const warlockOptions2024: readonly RuleOption[] = [...invocations2024]

export const warlockFeatures2024: readonly ClassFeature[] = [
  {
    id: 'warlock-2024-class-eldritch-invocations', classId: 'class-2024-warlock', name: '魔能祈唤', englishName: 'Eldritch Invocations', level: 1,
    summary: '1 级选择 1 项祈唤，至 18 级累计 10 项；先决按等级与依赖校验，可替换，不可重复（复选祈唤除外）。',
    description: '你在研习禁忌知识的过程中发掘出魔能祈唤：1 级获得 1 项，2／5／7／9／12／15／18 级逐步增加至 10 项。具有先决的祈唤必须满足等级或依赖（如魔能斩需先选刃之魔契）；每获得一级魔契师等级可用新祈唤替换一个已有祈唤，但不能替换其他祈唤的先决项；除非祈唤说明可复选，否则不能重复选择。',
    kind: 'choice', requiresChoice: true, checkpointIds: INVOCATION_CHECKPOINTS.map((item) => item.id), status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-class-pact-magic', classId: 'class-2024-warlock', name: '契约魔法', englishName: 'Pact Magic', level: 1,
    summary: '魅力施法：1 级 2 戏法、2 道准备法术；契约法术位同环级（1—5 环），短休或长休全部恢复。',
    description: '施法属性为魅力，可使用奥术法器作为施法法器。1 级时知晓 2 道魔契师戏法，并准备 2 道魔契师法术；4 级与 10 级各额外习得一道戏法。契约法术位全部属于同一环级（1 级 1 枚一环、3 级 2 枚二环……17 级 4 枚五环），完成短休或长休时全部恢复；施展低环法术时须按契约环级施展。准备法术数量按职业表提升，所选法术环级不得高于契约环级。每获得一级魔契师等级可替换一道准备法术。其他特性授予的始终准备法术不计入准备数量。',
    kind: 'resource', status: 'implemented', sourceIds,
    // 契约法术位由 `usedSpellSlots`／契约环级结算（B10-01）；不再重复登记为资源（B10-02 第 4 批去重）。
  },
  {
    id: 'warlock-2024-class-magical-cunning', classId: 'class-2024-warlock', name: '秘法回流', englishName: 'Magical Cunning', level: 2,
    summary: '1 分钟秘传仪式后重获一半已消耗的契约法术位（向上取整）；每次长休 1 次。',
    description: '你可以举行一道耗时 1 分钟的秘传仪式，并在仪式结束后重获一半已消耗的契约法术位（向上取整）。此特性一经使用，直至完成长休前都无法再次使用。',
    kind: 'passive', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(2), recovery: 'long-rest', note: '仪式后手动恢复一半契约法术位（向上取整）；每次长休 1 次' },
  },
  {
    id: 'warlock-2024-class-subclass', classId: 'class-2024-warlock', name: '魔契师子职', englishName: 'Warlock Subclass', level: 3,
    summary: '选择至高妖精、天界、邪魔或旧日支配者宗主，并在 3、6、10、14 级获得其特性。',
    description: '你在 3 级选择一项魔契师子职：至高妖精宗主、天界宗主、邪魔宗主或旧日支配者宗主。此后获得该宗主的全部能力，前提是所需等级不超过你的魔契师等级。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-warlock-subclass-3'], status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-class-contact-patron', classId: 'class-2024-warlock', name: '联络宗主', englishName: 'Contact Patron', level: 9,
    summary: '始终准备异界探知；可无需法术位施展一次联系宗主并自动通过豁免，每次长休恢复。',
    description: '你始终准备着法术异界探知。你可以无需消耗法术位地以此特性施展该法术联系宗主，并自动通过该法术的豁免。一旦以此法施展，直至完成长休前都无法再次以此法施展。',
    kind: 'passive', status: 'implemented', sourceIds,
    grantedSpells: [{ spellId: 'spell-2024-contact-other-plane', freeCastings: 1, recovery: 'long-rest' }],
  },
  {
    id: 'warlock-2024-class-mystic-arcanum', classId: 'class-2024-warlock', name: '玄奥秘法', englishName: 'Mystic Arcanum', level: 11,
    summary: '11／13／15／17 级各选一道六／七／八／九环魔契师法术，始终准备，各可免费施展一次（长休恢复）。',
    description: '宗主赐予你称为秘法的魔法奥秘：11 级选择一道六环魔契师法术，13／15／17 级分别追加一道七／八／九环法术。每道秘法始终准备（不占准备上限），可不消耗法术位施展一次，完成长休后重获所有已消耗的施展次数；每获得一级魔契师等级可将一道秘法替换为同环阶的魔契师法术。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-warlock-arcanum-11', 'class-2024-warlock-arcanum-13', 'class-2024-warlock-arcanum-15', 'class-2024-warlock-arcanum-17'], status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-class-epic-boon', classId: 'class-2024-warlock', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长，或其他满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一项你选择的、满足条件且适用的专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-warlock-feat-19'], status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-class-eldritch-master', classId: 'class-2024-warlock', name: '魔能掌控', englishName: 'Eldritch Master', level: 20,
    summary: '使用秘法回流时改为重获所有已消耗的契约法术位。',
    description: '当你使用秘法回流特性时，改为重获所有已消耗的魔契师法术位。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const warlockRule2024: ClassRule = {
  id: 'class-2024-warlock',
  ruleset: '5e-2024',
  name: '魔契师',
  englishName: 'Warlock',
  summary: '2024版契约施法者：契约法术位短休恢复，魔能祈唤塑造能力，宗主决定力量来源与法术。',
  hitDie: 8,
  primaryAbilities: ['cha'],
  playStyleTags: ['spellcaster', 'striker', 'utility'],
  savingThrowAbilities: ['wis', 'cha'],
  status: 'implemented',
  sourceIds,
  armorTraining: ['light'],
  weaponTraining: { categories: ['simple'] },
  features: warlockFeatures2024,
  checkpoints: [
    {
      id: 'class-2024-warlock-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择2项魔契师技能', description: '从魔契师技能列表中选择2项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: WARLOCK_SKILL_OPTION_IDS,
    },
    ...INVOCATION_CHECKPOINTS.map((item): ChoiceCheckpoint => ({
      id: item.id, level: item.level, step: 'timeline', kind: 'class-choice',
      title: `选择${item.count}项魔能祈唤`,
      description: `从当前等级可选的魔能祈唤中选择${item.count}项；先决与复选规则见祈唤说明。`,
      required: true, minSelections: item.count, maxSelections: item.count,
      optionIds: invocationIdsAt(item.level),
    })),
    ...([4, 8, 12, 16] as const).map((level): ChoiceCheckpoint => ({
      id: `class-2024-warlock-feat-${level}`, level, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    ...([6, 7, 8, 9] as const).map((spellLevel, index): ChoiceCheckpoint => {
      const level = [11, 13, 15, 17][index] as number
      return {
        id: `class-2024-warlock-arcanum-${level}`, level, step: 'timeline', kind: 'class-choice',
        title: `选择1道${['六', '七', '八', '九'][index]}环玄奥秘法`,
        description: `从魔契师法术中选择1道${spellLevel}环法术作为秘法：始终准备，可不消耗法术位施展一次（长休恢复）。`,
        required: true, minSelections: 1, maxSelections: 1, optionIds: [],
        candidateKind: 'spell-pool', spellPool: { level: spellLevel, classIds: ['class-2024-warlock'] },
        spellGrant: { alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
      }
    }),
    {
      id: 'class-2024-warlock-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '19级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
  spellcasting: {
    ruleset: '5e-2024',
    mode: 'pact',
    ability: 'cha',
    startsAtLevel: 1,
    preparedCountByLevel: WARLOCK_PREPARED,
    cantripsKnownByLevel: WARLOCK_CANTRIPS,
    maxSpellLevelByClassLevel: PACT_LEVELS,
    pactSlotsByClassLevel: PACT_SLOTS,
    classSpellIds: warlockClassSpellIds2024,
    alwaysPreparedSpellIdsByLevel: { 9: ['spell-2024-contact-other-plane'] },
  },
}

export const warlockSubclassFeatures2024: readonly SubclassFeature[] = [
  // ============ 至高妖精宗主 ============
  {
    id: 'warlock-2024-archfey-spells', subclassId: 'subclass-2024-warlock-archfey-patron', name: '至高妖精法术', englishName: 'Archfey Spells', level: 3,
    summary: '3／5／7／9 级获得始终准备的妖精主题法术（妖火、迷踪步、闪现术、高等隐形术等）。',
    description: '宗主赐予的魔法使你始终准备特定法术：3 级——妖火、睡眠术、安定心神、迷踪步、魅影之力；5 级——闪现术、植物滋长；7 级——支配野兽、高等隐形术；9 级——支配类人、伪装术。这些法术不计入准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-archfey-steps-of-the-fey', subclassId: 'subclass-2024-warlock-archfey-patron', name: '妖精步伐', englishName: 'Steps of the Fey', level: 3,
    summary: '可无需法术位施展迷踪步等于魅力调整值次（至少 1 次，长休恢复）；每次可选复苏步伐（1d10 临时生命）或嘲弄步伐（感知豁免失败则对他人攻击有劣势）。',
    description: '你可以无需消耗法术位地施展迷踪步，次数等于你的魅力调整值（至少 1 次），完成长休时重获全部次数。每次施展时可选择额外效应之一：复苏步伐——传送后你或 10 尺内一个可见生物获得 1d10 临时生命；嘲弄步伐——传送前空间 5 尺内的生物感知豁免失败，则在对除你之外的生物攻击时具有劣势直到你的下回合开始。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { recovery: 'long-rest', maxFromAbility: { ability: 'cha', minimum: 1 }, note: '免费施展迷踪步；每次可选复苏步伐或嘲弄步伐' },
  },
  {
    id: 'warlock-2024-archfey-misty-escape', subclassId: 'subclass-2024-warlock-archfey-patron', name: '雾遁', englishName: 'Misty Escape', level: 6,
    summary: '受到伤害时可用反应施展迷踪步；妖精步伐追加无踪步伐（隐形）与惊惧步伐（2d10 心灵伤害）。',
    description: '当你受到伤害时，你可以用反应施展迷踪步。此外，你的妖精步伐获得新选项：无踪步伐——你获得隐形状态直到你的下回合开始或你进行攻击检定、造成伤害或施展法术后；惊惧步伐——传送前或后空间 5 尺内的生物感知豁免失败受 2d10 心灵伤害。',
    kind: 'reaction', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(6), recovery: 'long-rest', note: '每次长休 1 次；可消耗 1 个契约法术位重置（手动）' },
  },
  {
    id: 'warlock-2024-archfey-beguiling-defenses', subclassId: 'subclass-2024-warlock-archfey-patron', name: '斗转星移', englishName: 'Beguiling Defenses', level: 10,
    summary: '免疫魅惑；被命中时可用反应使该次伤害减半，并迫使攻击者感知豁免失败受等量心灵伤害（每次长休 1 次，可消耗契约法术位重置）。',
    description: '你获得对魅惑状态的免疫。此外，当一个你能看见的敌人的攻击检定命中你后，你可以立即用反应令该次攻击伤害减半（向下取整），并迫使攻击者进行一次对抗你法术豁免 DC 的感知豁免，失败则受到等于你实际承受伤害的心灵伤害。此反应每次长休 1 次；你也可以消耗一枚契约法术位（无需动作）重置其使用权。',
    kind: 'reaction', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(10), recovery: 'long-rest', note: '每次长休 1 次；可消耗 1 个契约法术位重置（手动）' },
  },
  {
    id: 'warlock-2024-archfey-bewitching-magic', subclassId: 'subclass-2024-warlock-archfey-patron', name: '醉心魔法', englishName: 'Bewitching Magic', level: 14,
    summary: '以动作消耗法术位施展幻术或惑控法术后，可无需法术位立即施展迷踪步作为该动作的一部分。',
    description: '当你以一个动作消耗法术位施展一道幻术或惑控法术时，你可以无需法术位地立刻施展迷踪步，作为该动作的一部分。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 天界宗主 ============
  {
    id: 'warlock-2024-celestial-spells', subclassId: 'subclass-2024-warlock-celestial-patron', name: '天界法术', englishName: 'Celestial Spells', level: 3,
    summary: '3／5／7／9 级获得始终准备的光耀与治疗主题法术（圣火术、疗伤术、回生术、天界召唤术等）。',
    description: '宗主赐予的魔法使你始终准备特定法术：3 级——光亮术、圣火术、疗伤术、光导箭、援助术、次等复原术；5 级——昼明术、回生术；7 级——信仰守卫、火墙术；9 级——高等复原术、天界召唤术。这些法术不计入准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-celestial-healing-light', subclassId: 'subclass-2024-warlock-celestial-patron', name: '治愈之光', englishName: 'Healing Light', level: 3,
    summary: '骰池＝1＋魔契师等级枚 d6，长休全部恢复；附赠动作消耗至多魅力调整值枚骰，治疗 60 尺内自己或可见生物。',
    description: '你获得一个由 1 + 你的魔契师等级枚 d6 组成的骰池。以一个附赠动作，你可以消耗骰池中任意数量的骰子（每次不超过你的魅力调整值，至少 1 枚），治疗你自己或 60 尺内一个可见生物，恢复骰值合计的生命值。完成长休时骰池恢复所有已消耗骰子。',
    kind: 'resource', status: 'implemented', sourceIds,
    dicePool: { diceByLevel: HEALING_LIGHT_DICE, die: 'd6', recovery: 'long-rest', note: '附赠动作；每次消耗不超过魅力调整值枚' },
  },
  {
    id: 'warlock-2024-celestial-radiant-soul', subclassId: 'subclass-2024-warlock-celestial-patron', name: '光耀之魂', englishName: 'Radiant Soul', level: 6,
    summary: '获得光耀伤害抗性；每回合一次，造成光耀或火焰伤害的法术可对其中一个目标追加魅力调整值伤害。',
    description: '你获得对光耀伤害的抗性。每回合一次，当你施展的法术造成光耀伤害或火焰伤害时，你可以将你的魅力调整值加到该法术对其中一个目标造成的伤害上。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-celestial-resilience', subclassId: 'subclass-2024-warlock-celestial-patron', name: '天界韧性', englishName: 'Celestial Resilience', level: 10,
    summary: '使用秘法回流或完成短休／长休时获得等级＋魅力调整值临时生命；另可给予至多五个可见生物等级一半＋魅力调整值临时生命。',
    description: '每当你使用秘法回流，或完成一次短休或长休后，你获得等于魔契师等级 + 魅力调整值的临时生命值。此外，获得该临时生命时你可以选择至多五个可见生物，使其获得等于魔契师等级一半 + 魅力调整值的临时生命值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-celestial-searing-vengeance', subclassId: 'subclass-2024-warlock-celestial-patron', name: '灼光复仇', englishName: 'Searing Vengeance', level: 14,
    summary: '自身或 60 尺内盟友将进行死亡豁免时，可令其恢复半血生命并可选结束倒地；周围 30 尺内选定生物受 2d8＋魅力光耀并目盲至本回合结束；每次长休 1 次。',
    description: '当你或位于你 60 尺内的一名盟友将要进行死亡豁免时，你可以释放光能：该生物恢复等于其生命上限一半的生命值，并可以选择结束自身的倒地状态；随后每个由你选择、位于该生物 30 尺内的生物受到 2d8 + 你的魅力调整值的光耀伤害，并陷入目盲直至当前回合结束。此特性每次长休 1 次。',
    kind: 'reaction', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(14), recovery: 'long-rest', note: '每次长休 1 次' },
  },

  // ============ 邪魔宗主 ============
  {
    id: 'warlock-2024-fiend-spells', subclassId: 'subclass-2024-warlock-fiend-patron', name: '邪魔法术', englishName: 'Fiend Spells', level: 3,
    summary: '3／5／7／9 级获得始终准备的火焰与折磨主题法术（燃烧之手、火球术、火墙术、疫病虫群等）。',
    description: '宗主赐予的魔法使你始终准备特定法术：3 级——燃烧之手、命令术、灼热射线、暗示术；5 级——火球术、臭云术；7 级——火焰护盾、火墙术；9 级——指使术、疫病虫群。这些法术不计入准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-fiend-dark-ones-blessing', subclassId: 'subclass-2024-warlock-fiend-patron', name: '黑暗赐福', englishName: "Dark One's Blessing", level: 3,
    summary: '你或 10 尺内你可见的敌人生命降至 0 时，获得魅力调整值＋魔契师等级的临时生命（最低 1）。',
    description: '当你将一个敌人的生命值降至 0 时，你获得等于你的魅力调整值 + 你的魔契师等级的临时生命值（最低 1）。若其他人将一个位于你 10 尺内的敌人的生命值降至 0，你也会获得此增益。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-fiend-dark-ones-own-luck', subclassId: 'subclass-2024-warlock-fiend-patron', name: '黑暗强运', englishName: "Dark One's Own Luck", level: 6,
    summary: '属性检定或豁免时可加 1d10（看到结果后、生效前使用）；次数＝魅力调整值（至少 1），长休恢复。',
    description: '当你进行属性检定或豁免检定时，你可以为此次掷骰增添一个 d10。你可以在看到掷骰结果后、结果生效前使用此特性；每次检定只能使用一次。使用次数等于你的魅力调整值（至少 1 次），完成长休时重获全部次数。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { recovery: 'long-rest', maxFromAbility: { ability: 'cha', minimum: 1 }, note: '属性检定或豁免 +1d10；每次检定只能使用一次' },
  },
  {
    id: 'warlock-2024-fiend-fiendish-resilience', subclassId: 'subclass-2024-warlock-fiend-patron', name: '邪魔体魄', englishName: 'Fiendish Resilience', level: 10,
    summary: '每次短休或长休后选择一种除力场外的伤害类型，获得该类型抗性直到更换。',
    description: '每当你完成一次短休或长休时，选择一种除力场之外的伤害类型；直到你以此特性选择另一种伤害类型前，你具有对所选伤害类型的抗性。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-fiend-hurl-through-hell', subclassId: 'subclass-2024-warlock-fiend-patron', name: '直坠噩梦', englishName: 'Hurl Through Hell', level: 14,
    summary: '每回合一次，攻击命中时可迫使目标魅力豁免：失败则消失并于下回合结束返回，非邪魔额外受 8d10 心灵伤害；每次长休 1 次，可消耗契约法术位重置。',
    description: '每回合一次，当你以攻击检定命中一个生物时，你可以迫使其进行一次对抗你法术豁免 DC 的魅力豁免：失败则目标立刻消失并坠入噩梦景象，非邪魔额外受到 8d10 心灵伤害；目标陷入失能直至你的下回合结束，随后返回先前或最近的未被占据空间。此特性每次长休 1 次；你也可以消耗一枚契约法术位（无需动作）重置其使用权。',
    kind: 'passive', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(14), recovery: 'long-rest', note: '每次长休 1 次；可消耗 1 个契约法术位重置（手动）' },
  },

  // ============ 旧日支配者宗主 ============
  {
    id: 'warlock-2024-goo-spells', subclassId: 'subclass-2024-warlock-great-old-one-patron', name: '旧日支配者法术', englishName: 'Great Old One Spells', level: 3,
    summary: '3／5／7／9 级获得始终准备的心灵与异怪主题法术（不谐低语、侦测思想、异怪召唤术、心灵遥控等）。',
    description: '宗主赐予的魔法使你始终准备特定法术：3 级——不谐低语、塔莎狂笑术、魅影之力、侦测思想；5 级——鹰眼术、哈达之欲；7 级——困惑术、异怪召唤术；9 级——篡改记忆、心灵遥控。这些法术不计入准备上限。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-goo-awakened-mind', subclassId: 'subclass-2024-warlock-great-old-one-patron', name: '唤醒心灵', englishName: 'Awakened Mind', level: 3,
    summary: '附赠动作与 30 尺内可见生物建立心灵链接：可用互相知晓的语言心灵交流，距离不超过魅力调整值英里（至少 1），持续魔契师等级分钟。',
    description: '以一个附赠动作，你指定 30 尺内一个可见生物并建立心灵链接。当你们相距不超过等于你魅力调整值（至少 1）的英里数时，可以用心灵感应交谈，但双方必须使用对方知晓的语言。链接持续等于你魔契师等级的分钟数，在你建立另一道链接时提前结束。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-goo-psychic-spells', subclassId: 'subclass-2024-warlock-great-old-one-patron', name: '心灵法术', englishName: 'Psychic Spells', level: 3,
    summary: '造成伤害的魔契师法术可改为心灵伤害；施展惑控或幻术学派魔契师法术时可去除言语与姿势成分。',
    description: '当你施展一道造成伤害的魔契师法术时，你可以将其伤害类型改为心灵伤害。此外，当你施展一道惑控或幻术学派的魔契师法术时，你可以令该法术不再具有言语与姿势成分。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-goo-clairvoyant-combatant', subclassId: 'subclass-2024-warlock-great-old-one-patron', name: '锐眼斗士', englishName: 'Clairvoyant Combatant', level: 6,
    summary: '以唤醒心灵建立链接时可迫使对方感知豁免：失败则链接期间对你攻击具有劣势、你对它攻击具有优势；每次短休或长休 1 次，可消耗契约法术位重置。',
    description: '当你用唤醒心灵与一个生物形成心灵链接时，你可以迫使对方进行一次对抗你法术豁免 DC 的感知豁免：失败则链接期间该生物对你进行的攻击检定具有劣势，而你对它的攻击检定具有优势。此特性每次短休或长休 1 次；你也可以消耗一枚契约法术位（无需动作）重置其使用权。',
    kind: 'passive', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(6), recovery: 'short-rest', note: '短休或长休后恢复；可消耗 1 个契约法术位重置（手动）' },
  },
  {
    id: 'warlock-2024-goo-eldritch-hex', subclassId: 'subclass-2024-warlock-great-old-one-patron', name: '骇异恶咒', englishName: 'Eldritch Hex', level: 10,
    summary: '始终准备脆弱诅咒；施展时目标还会在以所选属性进行的豁免上具有劣势。',
    description: '你始终准备着脆弱诅咒法术（不占准备上限）。当你施展脆弱诅咒并选择一项属性时，目标在法术持续时间内还会在以该项属性进行的豁免检定上具有劣势。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-goo-thought-shield', subclassId: 'subclass-2024-warlock-great-old-one-patron', name: '思维之盾', englishName: 'Thought Shield', level: 10,
    summary: '思维无法被读取（除非你允许）；获得心灵伤害抗性，且对造成你心灵伤害的生物反弹等量伤害。',
    description: '除非获得你的允许，否则你的思维无法被心灵感应或其他手段阅读。此外你具有对心灵伤害的抗性，且每当一个生物对你造成心灵伤害时，该生物将受到与你承受的同等的伤害。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'warlock-2024-goo-create-thrall', subclassId: 'subclass-2024-warlock-great-old-one-patron', name: '创造奴仆', englishName: 'Create Thrall', level: 14,
    summary: '施展异怪召唤术时可改为无需专注、持续 1 分钟；召唤物获得等级＋魅力临时生命，且首次命中被脆弱诅咒目标时追加该法术的额外伤害。',
    description: '当你施展异怪召唤术时，你可以修改该法术使其无需专注；以此法施展时持续时间为 1 分钟，且召唤来的异怪拥有等于你魔契师等级 + 魅力调整值的临时生命值。此外，该异怪在每个回合中第一次命中一个受你脆弱诅咒影响的生物时，会对目标额外造成等于该法术附加伤害的心灵伤害。召唤生物数据卡未装配前，本条目只登记规则边界，不生成具体数值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const warlockSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-warlock-archfey-patron',
    classId: 'class-2024-warlock',
    ruleset: '5e-2024',
    name: '至高妖精宗主',
    englishName: 'Archfey Patron',
    selectionLevel: 3,
    summary: '以妖精魔法穿梭与迷惑：宗主法术、妖精步伐、雾遁、斗转星移与醉心魔法。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: warlockSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-warlock-archfey-patron'),
    alwaysPreparedSpellIdsByLevel: ARCHFEY_SPELLS,
  },
  {
    id: 'subclass-2024-warlock-celestial-patron',
    classId: 'class-2024-warlock',
    ruleset: '5e-2024',
    name: '天界宗主',
    englishName: 'Celestial Patron',
    selectionLevel: 3,
    summary: '以天界之光治疗与灼烧：治愈之光骰池、光耀之魂、天界韧性与灼光复仇。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: warlockSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-warlock-celestial-patron'),
    alwaysPreparedSpellIdsByLevel: CELESTIAL_SPELLS,
  },
  {
    id: 'subclass-2024-warlock-fiend-patron',
    classId: 'class-2024-warlock',
    ruleset: '5e-2024',
    name: '邪魔宗主',
    englishName: 'Fiend Patron',
    selectionLevel: 3,
    summary: '以邪魔之力碾压敌人：黑暗赐福、黑暗强运、邪魔体魄与直坠噩梦。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: warlockSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-warlock-fiend-patron'),
    alwaysPreparedSpellIdsByLevel: FIEND_SPELLS,
  },
  {
    id: 'subclass-2024-warlock-great-old-one-patron',
    classId: 'class-2024-warlock',
    ruleset: '5e-2024',
    name: '旧日支配者宗主',
    englishName: 'Great Old One Patron',
    selectionLevel: 3,
    summary: '以异界心灵力量作战：唤醒心灵、心灵法术、锐眼斗士、骇异恶咒、思维之盾与创造奴仆。',
    status: 'implemented',
    availability: 'player',
    sourceIds,
    features: warlockSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-warlock-great-old-one-patron'),
    alwaysPreparedSpellIdsByLevel: GREAT_OLD_ONE_SPELLS,
  },
]
