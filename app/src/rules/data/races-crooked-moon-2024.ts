import type { RaceRule } from '@/types/rules'

/**
 * 《歪曲之月》（The Crooked Moon，第三方）第二章种族 13 条（G3 批次 G3-I1）。
 *
 * 登记口径：
 * - 2024 写法（`生物类型／体型／速度` + 特质，**无属性加值行**——2024 物种属性来自背景），
 *   故登记进 `5e-2024` 仓库，来源 `source-2024-tp-crooked-moon`（默认关闭、需 DM 同意）；
 * - 名称与全部特质取自 CHM v2026.09.13 `第三方_歪曲之月_第二章_*.md` 原文，逐条转述；
 * - 含法术授予的特质（丝虫种／丰收种／灰烬种／线偶种／苍羽种）登记 `spellGrants` +
 *   `spellcastingAbilityChoices`，戏法与法术 ID 均已核对可解析；
 * - 「熟练二选一」类特质（狼类感官等）登记 `skillProficiencyChoices`。
 */
const cm = ['source-2024-tp-crooked-moon'] as const
const ABILITY = ['int', 'wis', 'cha'] as const

const cmSpecies = (
  slug: string,
  name: string,
  englishName: string,
  summary: string,
  description: string,
  extra: Partial<RaceRule> = {},
): RaceRule => ({
  id: `species-2024-cm-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  summary,
  description,
  subraceIds: [],
  fixedAbilityBonuses: {},
  recommendedClassIds: [],
  status: 'selectable',
  sourceIds: cm,
  ...extra,
})

export const crookedMoonSpecies2024: readonly RaceRule[] = [
  cmSpecies('silkborn', '丝虫种', 'Silkborn',
    '蛛类血脉：珠宝甲壳、蛛行与丝质遗赠。',
    '生物类型：类人；中型（约 5—6 尺）；速度 30 尺且等于攀爬速度。珠宝甲壳：被一次攻击检定命中时，可以反应将熟练加值加入对抗该攻击的 AC，可能使命中改为失手；使用后须完成短休或长休才能再次使用。黑暗视觉 60 尺。蛛丝遗赠：习得戏法「奇术」；3 级起始终准备「寻获魔宠」（魔宠形态为宝石昆虫或蛛形生物），5 级起始终准备「蛛网术」；这些法术各可无需法术位与材料成分施展一次，完成长休后重获，也能以合适法术位施展；施法属性为创建时选择的智力、感知或魅力。蛛行：可在包括天花板在内的难攀爬表面攀爬而无需属性检定，且双手保持空闲。',
    {
      darkvision: 60,
      climbSpeed: 30,
      spellcastingAbilityChoices: ABILITY,
      spellGrants: [
        { spellId: 'spell-2024-thaumaturgy', minimumLevel: 1, alwaysPrepared: true },
        { spellId: 'spell-2024-find-familiar', minimumLevel: 3, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
        { spellId: 'spell-2024-web', minimumLevel: 5, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
      ],
    }),
  cmSpecies('harvestborn', '丰收种', 'Harvestborn',
    '稻草人构装：剔除劣品与苍翠赠礼。',
    '生物类型：构装；中型（约 4—7 尺）；速度 30 尺。剔除劣品：对浴血生物造成伤害时可额外造成 1d12 暗蚀伤害；可用次数等于熟练加值，完成长休时全部重获。苍翠赠礼：可以附赠动作触碰地面，选择 30 尺内一名同样接触地面的生物，其可掷出并消耗 1 枚生命骰，恢复骰值 + 你熟练加值的生命值；可用次数等于熟练加值，短休恢复 1 次、长休全部恢复。南瓜灯：习得戏法「舞光术」，施法属性为创建时选择的智力、感知或魅力。稻草人本质：无需进食、饮水或呼吸。警觉休息：无需睡眠且魔法无法使你入睡；保持 4 小时静止即可完成长休，期间保持意识清醒。',
    {
      spellcastingAbilityChoices: ABILITY,
      spellGrants: [{ spellId: 'spell-2024-dancing-lights', minimumLevel: 1, alwaysPrepared: true }],
    }),
  cmSpecies('curseborn', '咒狼种', 'Curseborn',
    '狼之诅咒：利爪、灰厄均衡与狼类感官。',
    '生物类型：类人；中型（约 5—6 尺）；速度 35 尺。诅咒利爪：拥有可徒手打击的利爪，命中造成 1d6 挥砍伤害，攻击与伤害可用力量或敏捷；以利爪命中生物时可诅咒目标直至你的下个回合开始，被诅咒期间目标散发迷雾且在 D20 检定中具有劣势；诅咒次数等于熟练加值，完成长休后全部重获。黑暗视觉 60 尺。灰厄均衡：豁免失败时可以反应将结果改为成功，但此后直至你的下个回合结束你在 D20 检定中具有劣势；该特质每次长休重置一次使用权。狼类感官：获得调查、察觉或求生之一的技能熟练。',
    {
      darkvision: 60,
      speed: 35,
      skillProficiencyChoices: { count: 1, optionIds: ['skill-investigation', 'skill-perception', 'skill-survival'] },
    }),
  cmSpecies('bogborn', '沼泽种', 'Bogborn',
    '沼泽巨人：庞躯、引导联结与再生。',
    '生物类型：巨人；中型（约 7—8 尺）；速度 30 尺。沼泽庞躯：为终止自身受擒状态而进行的属性检定具有优势；计算载重时视为大一级体型。黑暗视觉 60 尺。引导联结：可以附赠动作在 60 尺内一名可见生物身上放置魔法标记，持续 1 分钟，形态为仅你可见的短生植物／苔藓／真菌／沼泽动物；持续期间你对被标记生物的属性检定与攻击检定可加入 1d4；可用次数等于熟练加值，完成长休时全部重获。敏锐感官：获得察觉或求生之一的技能熟练。再生：可以附赠动作消耗并投掷 1 枚生命骰，恢复骰值 + 体质调整值的生命值（至少 1）；若你受到强酸或火焰伤害，该特质失效直至你的下个回合结束。',
    {
      darkvision: 60,
      skillProficiencyChoices: { count: 1, optionIds: ['skill-perception', 'skill-survival'] },
    }),
  cmSpecies('deepborn', '深潜种', 'Deepborn',
    '异怪血脉：两栖、诡怖诳语与无尽食欲。',
    '生物类型：异怪；中型（约 5—7 尺）；速度 30 尺且等于游泳速度。水陆两栖：可在空气与水中呼吸。黑暗视觉 60 尺。诡怖诳语：会说深潜语；可以魔法动作发出怪诞乱语，源自你的 30 尺光环内所有由你选择的生物须进行一次感知豁免（DC = 8 + 熟练加值 + 创建时选择的智力／感知／魅力调整值），失败则掷 1d6：1—2 攻击检定具有劣势；3—4 速度变为 0；5—6 不能执行反应；效应持续至你的下个回合开始；一旦有目标豁免失败，须完成短休或长休才能再次使用该特质。无尽食欲：可以附赠动作拥抱与饥饿者的联系，直至你的下个回合开始你知晓周边 60 尺内所有非构装非亡灵生物的位置，且对这些生物的攻击检定不具劣势；使用后须完成短休或长休才能再次使用。',
    {
      darkvision: 60,
      swimSpeed: 30,
      spellcastingAbilityChoices: ABILITY,
    }),
  cmSpecies('ashborn', '灰烬种', 'Ashborn',
    '小型邪魔：灰烬遗赠、邪魔幸运与蝎刺。',
    '生物类型：邪魔；小型（约 2—3 尺）；速度 30 尺。灰烬遗赠：习得戏法「次级幻象」；3 级起始终准备「魅惑类人」，5 级起始终准备「隐形术」；这些法术各可无需法术位施展一次，完成长休后重获，也能以合适法术位施展；施法属性为创建时选择的智力、感知或魅力。黑暗视觉 60 尺。邪魔幸运：被一次非重击的攻击检定命中时，可以反应使该攻击失手，并让 5 尺内一名由你选择的生物受到等于你熟练加值的力场伤害；使用后须完成短休或长休才能再次使用。蝎刺：拥有可徒手打击的尾刺，可用力量或敏捷进行攻击与伤害；命中造成 1d4 穿刺伤害，并可额外造成 1d6 毒素伤害；额外伤害次数等于熟练加值，短休恢复 1 次、长休全部恢复；角色等级达到 10 级时额外伤害提升为 2d6。',
    {
      darkvision: 60,
      size: 'small',
      spellcastingAbilityChoices: ABILITY,
      spellGrants: [
        { spellId: 'spell-2024-minor-illusion', minimumLevel: 1, alwaysPrepared: true },
        { spellId: 'spell-2024-charm-person', minimumLevel: 3, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
        { spellId: 'spell-2024-invisibility', minimumLevel: 5, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
      ],
    }),
  cmSpecies('plagueborn', '疫鼠种', 'Plagueborn',
    '瘟疫之鼠：污秽之子与瘟疫载体。',
    '生物类型：类人；体型为中型（约 4—6 尺）或小型（约 2—4 尺），创建时决定；速度 30 尺且等于攀爬速度。污秽之子：为避免或终止中毒状态或魔法疫病而进行的豁免具有优势。黑暗视觉 60 尺。受染狡诈：获得欺瞒或隐匿之一的技能熟练。瘟疫载体：攻击检定命中生物时可将魔法疫病传播给目标，目标须进行一次体质豁免（DC = 8 + 体质调整值 + 熟练加值），失败则被疫病感染 1 分钟；感染期间目标的攻击检定与属性检定具有劣势，并在其每个回合开始时受到 1d4 毒素伤害；目标可在其每个回合结束时重复该豁免以终止；使用后须完成长休才能再次使用。',
    {
      darkvision: 60,
      climbSpeed: 30,
      sizeChoices: ['small', 'medium'],
      skillProficiencyChoices: { count: 1, optionIds: ['skill-deception', 'skill-stealth'] },
    }),
  cmSpecies('stoneborn', '石像种', 'Stoneborn',
    '石像构装：银白闪光与银辉壁垒。',
    '生物类型：构装；体型为中型（约 4—7 尺）或小型（约 3—4 尺），创建时决定；速度 30 尺，飞行速度等于你速度的一半。银白闪光：可以附赠动作以两种方式之一引导银辉路途之光——路途恩泽：无需材料成分施展「祝福术」；狂热冲锋：执行疾走动作，且你在本回合结束前进行的下次攻击检定无论命中或失手都会对目标额外造成 2d6 光耀伤害；使用后须完成长休才能再次使用该附赠动作。银辉壁垒：受到钝击、穿刺或挥砍伤害时，可以反应获得这三种伤害的抗性直至你的下个回合开始；使用后须完成短休或长休才能再次使用。守望感官：获得洞悉、察觉或求生之一的技能熟练。',
    {
      flySpeed: 15,
      sizeChoices: ['small', 'medium'],
      skillProficiencyChoices: { count: 1, optionIds: ['skill-insight', 'skill-perception', 'skill-survival'] },
    }),
  cmSpecies('threadborn', '线偶种', 'Threadborn',
    '布偶构装：纯洁心智与抚慰之心。',
    '生物类型：构装；体型为中型（约 4—7 尺）或小型（约 2—4 尺），创建时决定；速度 30 尺。球形关节：可穿过最窄 1 尺宽的空间，如同穿过困难地形。纯洁心智：具有心灵伤害抗性。线装本质：无需进食、饮水或呼吸。抚慰之心：习得戏法「神导术」；3 级起始终准备「庇护术」，5 级起始终准备「安定心神」；这些法术各可无需法术位施展一次，完成长休后重获，也能以合适法术位施展；施法属性为创建时选择的智力、感知或魅力。你有一个朋友：当 30 尺内一名可见生物在一次使用技能的属性检定中失败时，可以反应对该生物施展「神导术」并无视其常规施法距离，该生物可在该检定中加入 1d4（可能使失败改为成功），随后法术结束；可用次数等于熟练加值，完成长休时全部重获。',
    {
      sizeChoices: ['small', 'medium'],
      damageResistances: ['psychic'],
      spellcastingAbilityChoices: ABILITY,
      spellGrants: [
        { spellId: 'spell-2024-guidance', minimumLevel: 1, alwaysPrepared: true },
        { spellId: 'spell-2024-sanctuary', minimumLevel: 3, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
        { spellId: 'spell-2024-calm-emotions', minimumLevel: 5, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
      ],
    }),
  cmSpecies('relicborn', '绘骨种', 'Relicborn',
    '亡灵绘骨：死亡之舞与不息派对。',
    '生物类型：亡灵；中型（约 4—6 尺）；速度 30 尺。死亡之舞：可以附赠动作进行一次 DC 15 的魅力（乐器或表演）检定，成功则你在本回合结束前进行的下次攻击检定具有优势；若成功且差值达 5 或更多，可掷出 1 枚生命骰但无需消耗，获得等于骰值的临时生命值。不息派对：无需睡眠；若进行 4 小时的狂欢活动（如讲述故事或演奏歌谣），可仅用这 4 小时完成长休。纪念一瞬：当 30 尺内另一名可见生物在一次 D20 检定中失败时，可以反应在目标总值中加入 1d4（可能使失败改为成功）；一旦该特质把一次失败改为成功，须完成短休或长休才能再次使用。狂欢之魂：获得表演技能或一项乐器之一的熟练。',
    {
      skillProficiencyChoices: { count: 1, optionIds: ['skill-performance'] },
    }),
  cmSpecies('azureborn', '苍羽种', 'Azureborn',
    '天空血脉：苍穹遗赠与魔法之风。',
    '生物类型：类人；中型（约 4—7 尺）；速度 30 尺且等于飞行速度。苍穹遗赠：习得戏法「神导术」；3 级起始终准备「卜筮术」，可无需法术位与材料成分施展一次，完成长休后重获，也能以合适法术位施展；施法属性为创建时选择的智力、感知或魅力。黑暗视觉 60 尺。窥视命运：投掷先攻且未被突袭时，可选择至多等于熟练加值的可见生物，使其先攻掷骰具有优势；使用后须完成短休或长休才能再次使用。魔法之风：可以附赠动作执行疾走动作，并使你的飞行速度提升 10 尺直至本回合结束；可用次数等于熟练加值，完成长休时全部重获。',
    {
      darkvision: 60,
      flySpeed: 30,
      spellcastingAbilityChoices: ABILITY,
      spellGrants: [
        { spellId: 'spell-2024-guidance', minimumLevel: 1, alwaysPrepared: true },
        { spellId: 'spell-2024-augury', minimumLevel: 3, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
      ],
    }),
  cmSpecies('gnarlborn', '诡木种', 'Gnarlborn',
    '植物血脉：根深蒂固与缠枝。',
    '生物类型：植物；中型（约 5—8 尺）；速度 30 尺。根深蒂固：为避免非自愿移动与倒地状态而进行的属性检定与豁免具有优势。长老木低语：可以汲取长老木精魂的记忆；完成长休时获得一项自选技能或工具熟练、或一门自选语言，持续至下次长休。缠枝：可以附赠动作选择 30 尺内一个大型或更小生物，其须进行一次力量豁免（DC = 8 + 熟练加值 + 体质调整值），失败则被显现的枝条束缚 1 分钟；成功则其速度减半直至你的下个回合结束；被束缚者可在其每个回合结束时重复豁免以终止，状态终止时枝条消失；使用后须完成短休或长休才能再次使用。根须感知：可以附赠动作获得 60 尺震颤感知 10 分钟；使用后须完成短休或长休才能再次使用。参天之姿：为终止自身受擒状态而进行的属性检定具有优势；计算载重时视为大一级体型。'),
  cmSpecies('graveborn', '霜墓种', 'Graveborn',
    '亡灵霜墓：吞食尸体与注魔黯龙钢。',
    '生物类型：亡灵；中型（约 4—6 尺）；速度 30 尺。黑暗视觉 60 尺。吞食尸体：可像食用新鲜食物一样食用变质与腐烂的食物；若花费 1 分钟食用非构装的小型或更大生物尸体的血肉，可掷出 1 枚生命骰但无需消耗（即使没有可用生命骰），恢复骰值 + 体质调整值的生命值（至少 1）；一旦以此恢复生命值，须完成短休或长休才能再次使用该特质。无惧霜寒：具有寒冷伤害抗性。注魔黯龙钢：对生物造成伤害时可无视其任何抗性，并令该生物额外受到等于你熟练加值的暗蚀伤害；使用后须完成短休或长休才能再次使用。',
    {
      darkvision: 60,
      damageResistances: ['cold'],
    }),
]

// ===== G3-I1 第二批：《瓦尔达的秘密尖塔》玩家包Ⅰ 种族（2 条 + 匠偶 3 个构造亚种）=====
// 来源使用 2024 注册表 id：`tp-valdas-spire-index` 属 2014 注册表，
// 2024 仓库无法开启该来源，条目会永久不可达（由 `source-reference-integrity` 用例守卫）。
const vss = ['source-2024-tp-valdas-spire'] as const

const vssSpecies = (
  slug: string,
  name: string,
  englishName: string,
  summary: string,
  description: string,
  extra: Partial<RaceRule> = {},
): RaceRule => ({
  id: `species-2024-vss-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  summary,
  description,
  subraceIds: [],
  fixedAbilityBonuses: {},
  recommendedClassIds: [],
  status: 'selectable',
  sourceIds: vss,
  ...extra,
})

export const valdasSpireSpecies2024: readonly RaceRule[] = [
  vssSpecies('geppettin', '匠偶', 'Geppettin',
    '活着的玩具构装：构造本质与手作品质，按材料分素瓷／枢木／毛绒。',
    '生物类型：构装；体型为小型（2—3 尺高）或中型（约 6 尺高，仅限枢木），创建时决定；速度 30 尺。黑暗视觉 60 尺。构装本质：无需食物、水或呼吸；无需睡眠且魔法无法使你入睡；保持 4 小时静止即可用 4 小时完成长休，期间保持意识。手作品质：获得威吓、表演或游说之一的技能熟练。匠偶构造：以材料分类，须选择一个构造亚种（素瓷／枢木／毛绒），其特质见各亚种条目。',
    {
      darkvision: 60,
      sizeChoices: ['small', 'medium'],
      requiresSubrace: true,
      subraceIds: ['species-2024-vss-geppettin-bisque', 'species-2024-vss-geppettin-marionette', 'species-2024-vss-geppettin-plushie'],
      skillProficiencyChoices: { count: 1, optionIds: ['skill-intimidation', 'skill-performance', 'skill-persuasion'] },
    }),
  vssSpecies('geppettin-bisque', '素瓷匠偶', 'Bisque Geppettin',
    '瓷娃娃构装：战斗首回合的武器伤害加成。',
    '匠偶构造（亚种）：素瓷。你出手以前与瓷娃娃别无二致。每当你在战斗的第一回合以武器攻击检定对一名生物造成伤害时，该生物额外受到等于你熟练加值的伤害，类型与造成伤害的武器一致。',
    { parentRaceId: 'species-2024-vss-geppettin' }),
  vssSpecies('geppettin-marionette', '枢木匠偶', 'Marionette Geppettin',
    '提线木偶构装：轻型武器触及 +5 尺。',
    '匠偶构造（亚种）：枢木。松散的提线悬挂在你的关节肢体上。当你在回合中使用不具有触及、双手或多用词条的武器时，其触及范围增加 5 尺。',
    { parentRaceId: 'species-2024-vss-geppettin' }),
  vssSpecies('geppettin-plushie', '毛绒匠偶', 'Plushie Geppettin',
    '填充玩偶构装：受钝击可反应抗性并击退。',
    '匠偶构造（亚种）：毛绒。当你受到钝击伤害时，可以反应获得对触发伤害的抗性，并被向远离伤害源的方向击退 5 尺；若你无法被向远离伤害源的方向击退，则无法执行该反应。',
    { parentRaceId: 'species-2024-vss-geppettin' }),
  vssSpecies('mandrake', '曼德拉', 'Mandrake',
    '植物血脉：根须魔法与藤蔓缠绕，随四季获得额外效应。',
    '生物类型：植物；中型（约 5—7 尺高）；速度 30 尺。植物本质：若一天中被阳光直射至少 4 小时则无需进食；可通过叶子呼吸，并可通过脚吸收水分与营养。自然连接：获得自然或求生之一的技能熟练。根须魔法：知晓戏法「橡棍术」，并可以自身为目标施展，使你的一条肢体在持续时间内视为短棒；3 级起始终准备「神莓术」，5 级起始终准备「树肤术」；这些法术各可无需法术位施展，一旦以此法施展某法术，须完成长休才能再次以同法施展该法术，也能以合适环阶法术位施展；施展时无需语言与材料成分；施法属性为选取种族时选择的智力、感知或魅力。藤蔓缠绕：可以附赠动作令劲草与藤蔓自地面萌发，覆盖 30 尺内一名可见的不超过大型的生物，其速度降为 0 且无法提升直至其下个回合结束（若其以一次攻击换取自身释放则提前结束）；可用次数等于熟练加值，完成长休时全部重获；3 级起按选取种族时选择的季节获得额外效应——春：可指定地面上方 30 尺内的空中生物并安全拉至地面；夏：可将目标移动至多 10 尺至一处未占据空间；秋：可影响首个目标 5 尺内的第二名目标；冬：目标受到等于你熟练加值的寒冷伤害。',
    {
      spellcastingAbilityChoices: ABILITY,
      skillProficiencyChoices: { count: 1, optionIds: ['skill-nature', 'skill-survival'] },
      spellGrants: [
        { spellId: 'spell-2024-shillelagh', minimumLevel: 1, alwaysPrepared: true },
        { spellId: 'spell-2024-goodberry', minimumLevel: 3, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
        { spellId: 'spell-2024-barkskin', minimumLevel: 5, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
      ],
    }),
]
