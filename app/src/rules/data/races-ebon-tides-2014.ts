import type { RaceRule } from '@/types/rules'

/**
 * 《黯潮之书》（Book of Ebon Tides，第三方）影域种族 14 条（G3 批次 G3-I1 第三批）。
 *
 * 登记口径：
 * - 2014 写法（`属性值提升Ability Score Increase`），登记进 `5e-2014` 仓库，
 *   来源 `tp-ebon-tides-index`（默认关闭、需 DM 同意）；
 * - 名字与全部特质取自 CHM v2026.09.13 `第三方_黯潮之书_种族_*.md` 原文，逐条转述；
 * - 亚种用 `parentRaceId` + 父种族 `subraceIds` + `requiresSubrace`；
 * - **父种族来源说明**：黯潮之书的 4 个精灵／侏儒亚种在原书中指向未登记的外部书
 *   《英雄之书 Tome of Heroes》的基础种族。本项目按既定口径，把精灵系亚种的
 *   `parentRaceId` 指向**核心精灵**、侏儒亚种指向**核心侏儒**（`race-2014-elf`／
 *   `race-2014-gnome`），亚种特性取自 CHM 原文；父种族自身特质仍由核心条目提供。
 * - 熊民、影蚀人类、达拉库食尸鬼、树鼠族的亚种为本书内部亚种，父种族即本书主族。
 */
const ebt = ['tp-ebon-tides-index'] as const

const ebtRace = (
  slug: string,
  name: string,
  englishName: string,
  summary: string,
  description: string,
  extra: Partial<RaceRule> = {},
): RaceRule => ({
  id: `race-2014-tp-ebt-${slug}`,
  ruleset: '5e-2014',
  name,
  englishName,
  summary,
  description,
  subraceIds: [],
  fixedAbilityBonuses: {},
  recommendedClassIds: [],
  status: 'selectable',
  sourceIds: ebt,
  ...extra,
})

export const ebonTidesRaces2014: readonly RaceRule[] = [
  // ===== 主族（10）=====
  ebtRace('bearfolk', '熊民', 'Bearfolk',
    '力量 +2，天生护甲 13+敏捷与啃咬。',
    '属性值提升：力量 +2。生物类型：类人；中型体型（身高可达 7 尺以上）；基础步行速度 30 尺。啃咬：强健的下颚是天生武器，可发动徒手打击，命中造成 1d6 + 力量调整值的穿刺伤害。天生护甲：厚实坚韧的皮毛使你获得 13 + 敏捷调整值的 AC。身强力壮：决定负重以及能推动、拖拽或举起的重量时视为大一级体型。熊族天赋：具有运动与察觉技能熟练。语言：通用语（凡间出身）或阴影语（影域住民）。亚种：影裔熊民。',
    {
      fixedAbilityBonuses: { str: 2 },
      skillProficiencies: ['skill-athletics', 'skill-perception'],
      requiresSubrace: true,
      subraceIds: ['race-2014-tp-ebt-bearfolk-shadowborn'],
    }),
  ebtRace('darakhul', '达拉库食尸鬼', 'Darakhul',
    '体质 +1，介死之躯与不死韧性。',
    '属性值提升：体质 +1。生物类型：类人；体型与基础步行速度由**遗承亚种**决定（须选择一项遗承亚种）。黑暗视觉 60 尺。嗜肉之欲：每天必须食用 1 磅生肉，否则遭受饥饿影响；24 小时未进食将获得一级力竭，且因此获得的力竭无法通过休息移除，直到花费至少 1 小时食用 10 磅生肉。介死之躯：你被转化为亡灵但并不完全——仍为类人生物，却易受针对亡灵的效果影响；可从疗伤术等法术恢复生命值，也会受驱散亡灵等效果影响；起死回生的效果对你正常生效，但会让你以达拉库食尸鬼形态复活；完全复生术或祈愿术可将你完全恢复为活着的原种族生物。强颚：利齿为天生武器，徒手打击命中造成 1d4 + 力量调整值的穿刺伤害而非钝击。日照敏感：你、你的攻击目标或你试图察觉的对象处于阳光直射下时，攻击检定与依赖视觉的察觉检定具有劣势。不死韧性：对暗蚀与毒素伤害具有抗性，免疫疾病，对抗魅惑或中毒的豁免具有优势；完成短休时若过去 24 小时内摄入至少 1 磅生肉，可减少 1 级力竭。不死活力：无需呼吸，也不像大多数生物那样睡眠——每天进入 6 小时类似死亡的休眠（半清醒，休眠中察觉检定具有劣势），获得与人类 8 小时睡眠相同的益处。语言：达拉库食尸鬼语、阴影语以及与遗承亚种相关的一种语言。',
    {
      fixedAbilityBonuses: { con: 1 },
      darkvision: 60,
      damageResistances: ['necrotic', 'poison'],
      requiresSubrace: true,
      subraceIds: ['race-2014-tp-ebt-darakhul-bearfolk', 'race-2014-tp-ebt-darakhul-human'],
    }),
  ebtRace('shadow-goblin', '幽影地精', 'Shadow Goblin',
    '敏捷 +2 魅力 +1，机敏心智与恶目。',
    '属性值提升：敏捷 +2、魅力 +1。生物类型：类人（**并非地精亚种**）；小型体型（身高 3—4 尺）；步行速度 30 尺。黑暗视觉 60 尺。机敏心智：具有欺瞒与洞悉技能熟练。暗影伪装：在微光或黑暗中进行躲藏时，敏捷（隐匿）检定具有优势。恶目：以一个动作做出粗鲁手势与声音，分散 30 尺内一名可见生物的注意力；目标若能听见并看见你，须进行一次魅力豁免（DC = 8 + 魅力调整值 + 熟练加值），失败则在其下回合开始前进行的下一次属性检定、攻击检定或豁免具有劣势。日照敏感：你、你的攻击目标或你试图察觉的对象处于阳光直射下时，攻击检定与基于视觉的察觉检定具有劣势。邪眷祝福：对抗魅惑的豁免具有优势，且不会因魔法效应而陷入睡眠。语言：地精语与阴影语。',
    {
      fixedAbilityBonuses: { dex: 2, cha: 1 },
      size: 'small',
      darkvision: 60,
      skillProficiencies: ['skill-deception', 'skill-insight'],
    }),
  ebtRace('umbral-human', '影蚀人类', 'Umbral Human',
    '自选 +2／+1，暗影灌注与匿形。',
    '属性值提升：选择一项属性 +2、另一项属性 +1。生物类型：类人（**并非人类亚种**）；中型体型（身高 5 尺余至 6 尺以上）；步行速度 30 尺。黑暗视觉 60 尺。暗影灌注：对寒冷伤害具有抗性。匿形：当你完全静止时，可以一个动作变为隐形；若你移动或执行动作则重新变得可见；每天可用次数等于你的熟练加值。语言：通用语与阴影语。亚种：嬗变者或天赋者（须选择其一）。',
    {
      flexibleBonusGroups: [{ count: 1, value: 2 }, { count: 1, value: 1 }],
      darkvision: 60,
      damageResistances: ['cold'],
      requiresSubrace: true,
      subraceIds: ['race-2014-tp-ebt-umbral-changeling', 'race-2014-tp-ebt-umbral-gifted'],
    }),
  ebtRace('quickstep', '疾步族', 'Quickstep',
    '敏捷 +2 魅力 +1，速度 50 尺与惊人速度。',
    '属性值提升：敏捷 +2、魅力 +1。生物类型：类人；小型体型（身高 3—4 尺）；基础步行速度 **50 尺**。黑暗视觉 60 尺。妖精血统：为避免或结束魅惑状态的豁免具有优势，且不会因魔法效应陷入睡眠。灵巧：熟练于特技与巧手。惊人速度：若你在自己回合中移动了至少 10 尺，则在你下个回合开始前对你发动的攻击检定具有劣势；陷入失能或束缚时此特质无效；每天可使用的轮数等于你的等级。语言：精灵语与阴影语。',
    {
      fixedAbilityBonuses: { dex: 2, cha: 1 },
      size: 'small',
      speed: 50,
      darkvision: 60,
      skillProficiencies: ['skill-acrobatics', 'skill-sleight-of-hand'],
    }),
  ebtRace('erina-spiritfarer', '猬族（灵魂渡者）', 'Spiritfarer Erina',
    '感知 +2 且敏捷或魅力 +1，利刺与灵舌。',
    '属性值提升：感知 +2，并将敏捷或魅力之一 +1（**此特质替换基础猬族的属性值提升**）。生物类型：类人；小型体型（身高约 3 尺）；步行速度 25 尺。黑暗视觉 60 尺。掘穴者：拥有 20 尺掘穴速度，但只能穿过泥土和沙地，不能穿过泥浆、冰层或岩石。利刺：尖刺比其他猬族更长更强——对 5 尺内目标的近战攻击命中时，目标额外受到 1d6 穿刺伤害（**替换基础猬族的尖刺特质**）。敏锐本能：除非因非魔法睡眠以外的原因失能，否则不会被突袭（**替换基础猬族的敏锐感官特质**）。灵舌：天生能与灵界沟通，知晓「传讯术」；3 级起可施放「魅惑类人」（**仅能以亡灵为目标**）；5 级起可施放「注目术」；施放非戏法法术后须完成长休才能再次以此法施放；施法关键属性为感知。语言：猬族语、阴影语，以及通用语／精灵语／木族语之一。',
    {
      fixedAbilityBonuses: { wis: 2 },
      size: 'small',
      speed: 25,
      darkvision: 60,
      burrowSpeed: 20,
      spellGrants: [
        { spellId: 'spell-2014-message', minimumLevel: 1 },
        { spellId: 'spell-2014-charm-person', minimumLevel: 3, freeCastings: 1, recovery: 'long-rest' },
        { spellId: 'spell-2014-enthrall', minimumLevel: 5, freeCastings: 1, recovery: 'long-rest' },
      ],
    }),
  ebtRace('ratatosk', '树鼠族', 'Ratatosk',
    '敏捷 +2 力量 −2，锋利獠牙与心灵感应；分艾科尔／特拉德瓦克特。',
    '属性值提升：敏捷 +2、**力量 −2**。生物类型：类人；步行速度 25 尺，攀爬速度 10 尺。黑暗视觉 60 尺。陨落天族：你是天族生物的后裔但与凡世联系强烈——虽为类人生物，仍会受到针对天族生物的效果影响。锋利獠牙：獠牙为天生武器，徒手打击命中造成 1 点穿刺伤害加 1d4 点心灵伤害。心灵感应：可与视线内的生物心灵感应交谈，通讯距离为等级 × 10 尺；无需共通语言，但目标须至少能理解一种语言。语言：能理解、读写天界语与通用语，但只能通过心灵感应交流。亚种：艾科尔或特拉德瓦克特（须选择其一）。',
    {
      fixedAbilityBonuses: { dex: 2, str: -2 },
      speed: 25,
      climbSpeed: 10,
      darkvision: 60,
      requiresSubrace: true,
      subraceIds: ['race-2014-tp-ebt-ratatosk-ekorre', 'race-2014-tp-ebt-ratatosk-tradvakt'],
    }),
  ebtRace('satarre', '萨塔雷（无缚者）', 'Unbound Satarre',
    '体质 +2 感知 +1，守密者与解构之触。',
    '属性值提升：体质 +2、感知 +1（**此特质替换基础萨塔雷的属性值提升**）。生物类型：类人；中型体型（身高 6—7 尺，分节肢体）；步行速度 30 尺。黑暗视觉 60 尺。守密者：拥有奥秘技能熟练，在与位面和位面旅行相关的智力（奥秘）检定上具有优势；另可在历史、洞悉或宗教中选择一项获得熟练。传送感知：处于封闭空间时能本能知道通往当前区域最近的非魔法入口或出口的方向与距离；在寻找密门、隐形门与魔法传送门时的智力（调查）或感知（察觉）检定上具有优势（**替换基础萨塔雷的死亡之友特质**）。解构之触：以一个动作尝试撕裂维系一个生物存在的现实——选择 30 尺内一名可见生物，其须进行体质豁免（DC = 8 + 体质调整值 + 熟练加值），失败者须在其每回合使用动作重复该豁免以维持自身完整性，成功则效果终止；使用后须完成长休才能再次使用（**替换基础萨塔雷的腐败使者特质**）。语言：阴影语，以及深渊语／炼狱语／虚空语之一。',
    {
      fixedAbilityBonuses: { con: 2, wis: 1 },
      darkvision: 60,
      skillProficiencies: ['skill-arcana'],
      skillProficiencyChoices: { count: 1, optionIds: ['skill-history', 'skill-insight', 'skill-religion'] },
    }),
  ebtRace('ravenfolk', '鸦族（崇高）', 'Sublime Ravenfolk',
    '敏捷 +2 魅力 +1，永恒旋律与崇高和弦。',
    '属性值提升：敏捷 +2、魅力 +1（**此特质替换基础鸦族的属性值提升**）。生物类型：类人；中型体型（身高 4 尺至接近 6 尺）；步行速度 30 尺。永恒旋律：对抗魅惑或恐慌的豁免具有优势（**替换基础鸦族的突袭特质**）。天宇乐师：获得表演技能熟练，并获得一种自选乐器的熟练（**替换基础鸦族的诡术师特质**）。崇高和弦：以一个动作模仿神秘的崇高之音魅惑范围内生物——30 尺内所有能听到你的生物须通过 DC 13 魅力豁免，否则被你魅惑 10 分钟，被魅惑者将你视为一般朋友；若你或同伴正在与目标战斗，则目标豁免具有优势；使用后须完成长休才能再次使用（**替换基础鸦族的模仿特质**）。语言：通用语、鸦族语与阴影语。',
    {
      fixedAbilityBonuses: { dex: 2, cha: 1 },
      skillProficiencies: ['skill-performance'],
      toolProficiencyChoices: { count: 1 },
    }),
  ebtRace('stygian-shade', '幽影（冥河）', 'Stygian Shade',
    '体质 +2 与自选 +1，死亡之面与幽魂之躯。',
    '属性值提升：体质 +2，另一项自选属性 +1（**替换基础幽影的属性值提升**）。生物类型：类人；体型为**小型或中型**（创建时决定，**替换基础幽影的体型特质**）；步行速度 30 尺。黑暗视觉 60 尺。死亡之面：以一个动作剥去生者的伪装、展露真实幽魂面容——30 尺内能看见你的所有非亡灵须通过 DC 13 感知豁免，否则恐慌 1 分钟；被恐慌者可在其每回合结束时重复豁免以终止；豁免成功或效果结束的目标在接下来 24 小时内免疫你的死亡之面；每天可用次数等于你的体质调整值（**替换基础幽影的生命汲取特质**）。幽魂之躯：3 级起可以一个动作将实体溶解为灵体物质（半透明、失去颜色、周围空气变冷），持续 1 分钟或直到你以附赠动作终止；期间获得 30 尺飞行速度与悬浮，并对非魔法且非镀银武器造成的钝击／穿刺／挥砍伤害具有抗性；此外在逃脱擒抱或对抗束缚状态的属性检定与豁免上具有优势，并可将生物与固体物体视为困难地形通过；若在物体内结束回合则受到 1d10 力场伤害；使用后须完成长休才能再次使用。介死之躯：你被转化为亡灵但并不完全——可从疗伤术等法术恢复生命值，也会受驱散亡灵等效果影响；起死回生的效果让你以幽影形态复活；完全复生术或祈愿术可将你完全恢复。',
    {
      fixedAbilityBonuses: { con: 2 },
      flexibleBonusGroups: [{ count: 1, value: 1 }],
      sizeChoices: ['small', 'medium'],
      darkvision: 60,
    }),

  // ===== 亚种（4：本书内部亚种 + 精灵／侏儒亚种）=====
  ebtRace('bearfolk-shadowborn', '影裔熊民', 'Shadowborn Bearfolk',
    '熊民亚种：敏捷 +1，夜之斗篷与黑暗视觉。',
    '熊民亚种（影裔）：敏捷 +1。夜之斗篷：身处微光或黑暗期间，敏捷（隐匿）检定具有优势，并能够以附赠动作执行躲藏动作。黑暗视觉 60 尺。',
    { parentRaceId: 'race-2014-tp-ebt-bearfolk', fixedAbilityBonuses: { dex: 1 }, darkvision: 60 }),
  ebtRace('darakhul-bearfolk', '达拉库食尸鬼（熊民遗承）', 'Darakhul (Bearfolk Heritage)',
    '遗承亚种：保留前世熊民的部分特质。',
    '达拉库食尸鬼遗承亚种（熊民遗承）：在转化为亡灵前你曾是熊民，过去形态的某些残余仍然附着于你，使你与由其他种族转化而来的达拉库食尸鬼不同——你的特质可能是前世特质的变异（具体增益按原书「继承达拉库食尸鬼亚种」条目）。体型与基础步行速度以此遗承为准。',
    { parentRaceId: 'race-2014-tp-ebt-darakhul' }),
  ebtRace('darakhul-human', '达拉库食尸鬼（人类遗承）', 'Darakhul (Human Heritage)',
    '遗承亚种：保留前世人类的部分特质。',
    '达拉库食尸鬼遗承亚种（人类遗承）：在转化为亡灵前你曾是人类，过去形态的某些残余仍然附着于你，使你与由其他种族转化而来的达拉库食尸鬼不同——你的特质可能是前世特质的变异（具体增益按原书「继承达拉库食尸鬼亚种」条目）。体型与基础步行速度以此遗承为准。',
    { parentRaceId: 'race-2014-tp-ebt-darakhul' }),
  ebtRace('umbral-changeling', '影蚀人类（嬗变者）', 'Changeling Umbral Human',
    '影蚀人类亚种：魅力 +1，虚假身份与阴影魅力。',
    '影蚀人类亚种（嬗变者）：魅力 +1。嬗变者是人类在影域中世代生存、自然演化的产物，外貌带有在阴影中生活的独特印记（象牙白、墨黑或灰色调肤色，有些甚至长出初步形成的角）。虚假身份：获得欺瞒或游说之一的技能熟练。阴影魅力：按原书获得与阴影相关的魅力系能力。',
    {
      parentRaceId: 'race-2014-tp-ebt-umbral-human',
      fixedAbilityBonuses: { cha: 1 },
      skillProficiencyChoices: { count: 1, optionIds: ['skill-deception', 'skill-persuasion'] },
    }),
  ebtRace('umbral-gifted', '影蚀人类（天赋者）', 'Gifted Umbral Human',
    '影蚀人类亚种：感知 +1，诅咒注入与阴影馈赠。',
    '影蚀人类亚种（天赋者）：感知 +1。诅咒注入：对暗蚀伤害具有抗性。阴影馈赠：你与影妖精达成交易，获得一份馈赠但付出可怕代价——从以下选项中选择一个（或与 DM 商议其他选项）：①在一项自选技能上获得熟练并始终以优势进行该技能检定，同时选择第二项技能并始终以劣势进行其检定；②不再需要进食或呼吸，且只需 4 小时即可完成长休，但获得一级**无法以任何魔法或非魔法手段移除**的力竭；③将基础移动速度减半，并获得一项等于该减半值的飞行／游泳／攀爬速度；④将一项属性增加 6 点（最高 20），同时降低两项不同属性各 2 点；⑤每天黎明获得等同于你体质值的临时生命值，但不再能在短休期间消耗生命骰治疗。',
    { parentRaceId: 'race-2014-tp-ebt-umbral-human', fixedAbilityBonuses: { wis: 1 }, damageResistances: ['necrotic'] }),
  ebtRace('ratatosk-ekorre', '艾科尔树鼠族', 'Ekorre Ratatosk',
    '树鼠族亚种：智力或魅力 +1，体型微型，世界树的祝福。',
    '树鼠族亚种（艾科尔／机敏獠牙）：智力或魅力 +1。体型为**微型**（身高约 1.5 尺，体重 20—50 磅）。世界树的祝福：你与尤格德拉希尔心意相通、能够引导其力量——掌握「传讯术」与「恶言相加」戏法；5 级起获得原书列出的进一步法术能力。',
    {
      parentRaceId: 'race-2014-tp-ebt-ratatosk',
      flexibleBonusGroups: [{ count: 1, value: 1 }],
      size: 'small',
      spellGrants: [
        { spellId: 'spell-2014-message', minimumLevel: 1 },
        { spellId: 'spell-2014-vicious-mockery', minimumLevel: 1 },
      ],
    }),
  ebtRace('ratatosk-tradvakt', '特拉德瓦克特树鼠族', 'Tradvakt Ratatosk',
    '树鼠族亚种：体质 +1，体型小型，扰敌战嚣。',
    '树鼠族亚种（特拉德瓦克特／树之守护者）：体质 +1。体型为小型（身高 2—3 尺，体重 60—100 磅）。扰敌战嚣：持续不断的啁啾声会分散敌人注意力——以一个附赠动作，30 尺内能听到你声音的非树鼠族生物须通过魅力豁免（DC = 8 + 熟练加值 + 体质调整值），否则直到你的下回合开始前其攻击检定具有劣势；使用后须完成短休或长休才能再次使用。',
    { parentRaceId: 'race-2014-tp-ebt-ratatosk', fixedAbilityBonuses: { con: 1 }, size: 'small' }),
  ebtRace('shadow-fey', '影妖精', 'Shadow Fey',
    '精灵亚种：魅力 +1，暗影之道与日照敏感。',
    '**精灵亚种**（原书指向《英雄之书》的基础精灵；本项目父种族取核心精灵 `race-2014-elf`，精灵基础特质由核心条目提供）。属性值提升：魅力 +1。影妖精武器训练：拥有刺剑、短剑、短弓与长弓的熟练。暗影之道：当你处于黑暗中、微光下或足以覆盖你身体的阴影中时，可以施放「迷踪步」；每天可用次数等于魅力调整值（最少 1 次），完成长休后全部恢复；魅力为施法关键属性。日照敏感：若你、你攻击的目标或你试图感知的事物处于明亮阳光下，攻击检定与依赖视觉的察觉检定具有劣势。黑暗旅者：为了解特定暗影之路及其功能而进行的智力（奥秘）检定具有优势。语言：精灵语与阴影语。',
    {
      parentRaceId: 'race-2014-elf',
      fixedAbilityBonuses: { cha: 1 },
      weaponArmorProficiencies: ['rapier', 'shortsword', 'shortbow', 'longbow'],
      spellGrants: [{ spellId: 'spell-2014-misty-step', minimumLevel: 1, freeCastings: 1, recovery: 'long-rest' }],
    }),
  ebtRace('sable-elf', '暗精灵', 'Sable Elf',
    '精灵亚种：智力 +2 敏捷 −1，血脉亲和。',
    '**精灵亚种**（原书遗漏「拥有精灵基础种族特质」的说明，本项目父种族取核心精灵 `race-2014-elf`）。属性值提升：智力 +2、**敏捷 −1**。血脉亲和：选择一个你天生亲和的魔法学派，从该学派学会一个自选戏法；3 级起从同一学派选择一个一环法术，5 级起选择一个三环法术，你学会这些法术并可用其最低环位施放；以此特性施放其中一个法术后须完成长休才能再次以同法施放该法术；施法关键属性为智力。语言：精灵语与阴影语。',
    {
      parentRaceId: 'race-2014-elf',
      fixedAbilityBonuses: { int: 2, dex: -1 },
    }),
  ebtRace('lunar-elf', '月精灵', 'Lunar Elf',
    '精灵亚种：感知 +1，辉光与月之子。',
    '**精灵亚种**（原书指向《英雄之书》的基础精灵；本项目父种族取核心精灵 `race-2014-elf`）。属性值提升：感知 +1。辉光：你散发 15 尺半径明亮光照与额外 15 尺微光光照；可将效果抑制为仅 15 尺微光或完全抑制，也可随时激活而无需消耗动作（该效果等级等于你的熟练加值；若其范围与同等级或更低等级法术创造的黑暗区域重叠，创造黑暗的法术被驱散）。月之子：处于黑暗中、微光下或足以覆盖你身体的阴影中时，可以施放「月华之光」；每天可用次数等于感知调整值（最少 1 次），完成长休后全部恢复；感知为施法关键属性。影妖精武器训练：拥有刺剑、短剑、短弓与长弓的熟练。日照敏感：当你、你攻击的目标或你试图感知的事物处于阳光直射下时，攻击检定与依赖视觉的察觉检定具有劣势。语言：精灵语与阴影语。',
    {
      parentRaceId: 'race-2014-elf',
      fixedAbilityBonuses: { wis: 1 },
      weaponArmorProficiencies: ['rapier', 'shortsword', 'shortbow', 'longbow'],
      spellGrants: [{ spellId: 'spell-2014-moonbeam', minimumLevel: 1, freeCastings: 1, recovery: 'long-rest' }],
    }),
  ebtRace('wyrd-gnome', '玄命侏儒', 'Wyrd Gnome',
    '侏儒亚种：与生俱来的预知能力。',
    '**侏儒亚种**（原书指向《英雄之书》的基础侏儒；本项目父种族取核心侏儒 `race-2014-gnome`，侏儒基础特质由核心条目提供）。玄命侏儒天生一双异色瞳——右眼永远是蓝色、左眼永远是绿色；拥有与生俱来的预知能力，且这种能力在接近其他玄命侏儒时会变得更强。他们已聚集形成自己的小型族群，但并不总是生下玄命侏儒后代。由于聚居地的集体预知能力，这些地点常令人着迷（旅行者可能发现想点的餐食已摆在桌上，对话可能以玄命侏儒在问题被问出前就给出答案而开始）。',
    { parentRaceId: 'race-2014-gnome' }),
]
