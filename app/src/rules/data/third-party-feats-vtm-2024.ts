import type { FeatCategory, FeatRule } from '@/types/rules'

/**
 * G3 批次 G3-E：第三方《吸血鬼：避世潜藏》2024 版式**血族专长**与**传奇恩惠专长**。
 *
 * - **血族专长**（Kindred Feats）19 条，`category: 'bloodline'`（标签「血族」）；
 * - **传奇恩惠专长**（Epic Boon Feats）1 条，`category: 'epic-boon'`；
 * - 来源统一为 `source-2024-tp-vtm`（VtM 联名，2024 写法），状态 `selectable`，
 *   界面按「合作内容，需 DM 同意」呈现。
 *
 * 登记口径：
 * - 中英文名与全部增益项取自 CHM v2026.09.13 `第三方_吸血鬼：避世潜藏_专长_血族专长.md`
 *   与 `第三方_吸血鬼：避世潜藏_专长_传奇恩惠专长.md`，`detail` 为原创中文转述，未回译；
 * - 同书 5 条起源专长（康健／夜行／受护／薄血／博学）已由 `third-party-feats-g3-2024.ts` 登记，
 *   本文件不重复登记；
 * - 原书前置「血族职业」在本项目无对应职业条目，`FeatPrerequisite` 亦无职业字段，
 *   故职业前置只能写进 `detail` 首句，仅等级前置落到 `prerequisite.minimumLevel`；
 * - 血律研习四阶（研习／高等／卓越／至高）按资料逐条登记，高阶条目以
 *   `prerequisite.requiredFeatIds` 表达「须先获得较低阶血律研习专长」，
 *   并以 `repeatable: true` 表达原书「复选」；
 * - 原书要求玩家在多选项中挑选（十项血律取一、属性任选一项等）时，
 *   可选范围以文字写入 `detail`，不新建 `RuleOption`、不设 `choices`；
 * - 补漏登记：资料同章的「日行者」「坚硬表皮」两条，初次标题抽取时因加粗标记未同行闭合而遗漏，
 *   现按本文件同一口径补入（血族专长合计 19 条）。
 */
const vtm = ['source-2024-tp-vtm'] as const

const buildVtmFeat = (
  category: FeatCategory,
  tags: readonly string[],
  slug: string,
  name: string,
  englishName: string,
  description: string,
  detail: string,
  extra: Pick<FeatRule, 'prerequisite' | 'repeatable'>,
): FeatRule => ({
  id: `feat-2024-tp-vtm-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  description,
  detail,
  tags,
  category,
  status: 'selectable',
  sourceIds: vtm,
  ...extra,
})

/** 血族专长：`category: 'bloodline'`，`tags` 含「血族」。 */
const bloodlineFeat = (
  slug: string,
  name: string,
  englishName: string,
  description: string,
  detail: string,
  extra: Pick<FeatRule, 'prerequisite' | 'repeatable'> = {},
): FeatRule => buildVtmFeat('bloodline', ['血族'], slug, name, englishName, description, detail, extra)

/** 传奇恩惠专长：`category: 'epic-boon'`，`tags` 含「传奇恩惠」。 */
const epicBoonFeat = (
  slug: string,
  name: string,
  englishName: string,
  description: string,
  detail: string,
  extra: Pick<FeatRule, 'prerequisite' | 'repeatable'> = {},
): FeatRule => buildVtmFeat('epic-boon', ['传奇恩惠'], slug, name, englishName, description, detail, extra)

export const vtmBloodlineFeats2024: readonly FeatRule[] = [
  bloodlineFeat('daywalker', '日行者', 'Daywalker',
    '阳光伤害降低 2，可耗鲜血点移除光耀易伤，长休豁免成功则保有鲜血点。',
    '先决：血族职业。半血裔恩惠：你受到来自阳光的伤害时，该伤害降低 2。光耀耐受：你能以附赠动作消耗 1 鲜血点，移除自身对光耀伤害的易伤，持续 1 分钟。舒夜昼醒：开始长休时你可进行一次 DC 12 的体质豁免，成功则本次长休期间视为至少具有 1 鲜血点。'),
  bloodlineFeat('the-kiss', '血吻', 'The Kiss',
    '啃咬使猎物迷醉，血饲骰可改用 d4 并可能重获鲜血点。',
    '先决：血族职业。极乐血饲：你吸血时可选择投 d4 代替血饲骰 d6；若该 d4 掷出 4，你重获 1 鲜血点，且该生物因你陷入魅惑，此魅惑持续至你的下个回合结束。'),
  bloodlineFeat('alacrity', '超凡神速', 'Alacrity',
    '附赠动作耗 1 鲜血点换取额外动作，速度 +10 尺且先攻取优。',
    '先决：等级 2+，血族职业。极速爆发：以附赠动作消耗 1 鲜血点获得一个额外动作，该动作仅能用于执行攻击（仅限一次攻击）或撤离。迅捷：你的速度提升 10 尺，先攻掷骰具有优势。',
    { prerequisite: { minimumLevel: 2 } }),
  bloodlineFeat('cloak-of-shadows', '暗影斗篷', 'Cloak of Shadows',
    '附赠动作为隐匿检定取优，魔法动作隐形且次数随熟练加值。',
    '先决：等级 2+，血族职业。暗影掩蔽：以附赠动作令你当前回合的下一次敏捷（隐匿）检定具有优势。无形位移：以魔法动作获得隐形状态，持续至你的下个回合结束；可用次数等于熟练加值，完成长休时重获全部已消耗次数。',
    { prerequisite: { minimumLevel: 2 } }),
  bloodlineFeat('feral-whispers', '野性低语', 'Feral Whispers',
    '耗 1 鲜血点召唤野兽助战，并可以仪式方式施展动物交谈。',
    '先决：等级 2+，血族职业。荒野呼唤：以魔法动作消耗 1 鲜血点召唤不超过大型的野兽，数量等于魅力调整值（至少 1），挑战等级总和不超过熟练加值；野兽于 1d4+1 轮后抵达并被你魅惑 1 分钟，共享你的先攻、在你回合后行动并听从口头命令，无命令时执行回避动作。通感之灵：你只能以仪式方式施展「动物交谈」。',
    { prerequisite: { minimumLevel: 2 } }),
  bloodlineFeat('forceful-presence', '强力威仪', 'Forceful Presence',
    '附赠动作强化社交检定，或以威吓结果作 DC 使目标恐慌。',
    '先决：等级 2+，血族职业。敬畏：以附赠动作使你的魅力（威吓、表演、游说）检定获得优势，持续 10 分钟。恫吓：以附赠动作作一次魅力（威吓）检定，令 30 尺内一名可见生物以该结果为 DC 作感知豁免，失败则恐慌 1 分钟且每回合结束可重复豁免；智力不超过 3 的生物自动成功。两项增益次数均等于熟练加值，长休全部重获。',
    { prerequisite: { minimumLevel: 2 } }),
  bloodlineFeat('heightened-senses', '感官强化', 'Heightened Senses',
    '洞悉与察觉取优，获得 30 尺盲视与免法术位识破隐形。',
    '先决：等级 2+，血族职业。超凡感知：你的感知（洞悉、察觉）检定具有优势。感知无形：你具有 30 尺盲视；此外可无需法术位施展「识破隐形」，次数等于熟练加值，完成长休时重获全部已消耗次数。',
    { prerequisite: { minimumLevel: 2 } }),
  bloodlineFeat('mind-tricks', '心灵诡计', 'Mind Tricks',
    '免法术位施展命令术，并额外获得「遗忘」特殊命令。',
    '先决：等级 2+，血族职业。过眼云烟：可无需法术位施展「命令术」，次数等于熟练加值，完成长休时重获全部已消耗次数；此外你获得一条额外命令「遗忘」，使目标对过去 5 分钟的记忆变得模糊且不确定。',
    { prerequisite: { minimumLevel: 2 } }),
  bloodlineFeat('self-control', '自我控制', 'Self-Control',
    '感知 +1（上限 20），可用反应立即结束心兽饥渴效应。',
    '先决：等级 2+，血族职业。属性值提升：感知 +1，至多提升至 20。悬崖勒心：当你受心兽特性的饥渴影响时，能以反应立即结束该效应；可用次数等于你的感知调整值（至少 1 次），完成长休时重获全部已消耗次数。',
    { prerequisite: { minimumLevel: 2 } }),
  bloodlineFeat('touch-of-darkness', '黑暗触碰', 'Touch of Darkness',
    '黑暗与微光中可视 120 尺且不论魔法与否，隐匿检定取优。',
    '先决：等级 2+，血族职业。暗夜之眼：你在黑暗与微光光照中的可视距离为 120 尺，且不论该光照属于魔法性还是非魔法性。影子游戏：你的敏捷（隐匿）检定具有优势。',
    { prerequisite: { minimumLevel: 2 } }),
  bloodlineFeat('discipline-acquisition', '血律研习', 'Discipline Acquisition',
    '自十项血律中选一项获得基础增益，可复选但每次须换血律。',
    '先决：等级 4+，血族职业。从十项血律取一：兽性（自然、求生）、观占（调查、察觉）、支配（欺瞒、威吓）、模糊（巧手、隐匿）、威仪（表演、游说）各给予两项技能熟练，已熟练者改获专精；迅捷给予额外一个反应；坚韧使除火焰与光耀外的受伤降低熟练加值；湮灭给予 90 尺暗视（含魔法黑暗）；巨力使近战或徒手命中额外造成熟练加值伤害；变形使徒手命中加 1d6 挥砍伤害。可复选，每次须换血律。',
    { prerequisite: { minimumLevel: 4 }, repeatable: true }),
  bloodlineFeat('lethal-body', '致命之躯', 'Lethal Body',
    '徒手打击额外造成 1d8 伤害，对手逃脱擒抱的检定取劣。',
    '先决：等级 4+，血族职业。粉碎重击：当你以徒手打击命中目标时，可额外造成 1d8 伤害，其伤害类型与该次打击造成的类型相同。钢铁之握：生物为逃脱你的擒抱而进行的属性检定与豁免检定具有劣势。',
    { prerequisite: { minimumLevel: 4 } }),
  bloodlineFeat('vitae-concentration', '绯血凝练', 'Vitae Concentration',
    '体质 +1（上限 20），鲜血点上限提高体质调整值。',
    '先决：等级 4+，血族职业。属性值提升：体质 +1，至多提升至 20。血池扩容：你的鲜血点上限增加等于你体质调整值的数值（至少增加 1 点）。',
    { prerequisite: { minimumLevel: 4 } }),
  bloodlineFeat('convincing-thoughts', '潜入意念', 'Convincing Thoughts',
    '魅力 +1（上限 20），免法术位魅惑类人且目标事后不觉察。',
    '先决：等级 7+，血族职业。属性值提升：魅力 +1，至多提升至 20。惑然一笑：可无需法术位施展「魅惑类人」，次数等于熟练加值，完成长休时重获全部已消耗次数。自圆其说：当造成魅惑的法术或效应结束时，目标不会意识到其曾因你陷入魅惑。',
    { prerequisite: { minimumLevel: 7 } }),
  bloodlineFeat('hardened-skin', '坚硬表皮', 'Hardened Skin',
    '体质 +1，并从钝击或挥砍伤害中择一获得抗性。',
    '先决：等级 7+，血族职业。属性值提升：体质 +1，至多提升至 20。伤害抗性：从钝击或挥砍伤害中选定一种，你获得该伤害类型的抗性，此抗性无需动作、持续生效。',
    { prerequisite: { minimumLevel: 7 } }),
  bloodlineFeat('loyal-servant', '忠心仆役', 'Loyal Servant',
    '获得一名血缚同伴，其可持有一项血族专长并以生命骰代鲜血点。',
    '先决：等级 7+，血族职业。伴侣：一名野兽或类人生物与你缔结血缚，所选数据卡的最高挑战等级不超过你熟练加值的一半（经 DM 允许可另择来源）。鲜血之力：仆役获得一项由你选择的血族专长，判定前置时视为 2 级血族，并可消耗 1 枚生命骰代替 1 鲜血点。替换仆役：仆役死亡或离去后须待 30 天方可另选（DM 可增减）。',
    { prerequisite: { minimumLevel: 7 } }),
  bloodlineFeat('greater-discipline-acquisition', '高等血律研习', 'Greater Discipline Acquisition',
    '在你已研习过的血律上取得进阶增益，须先有血律研习。',
    '先决：等级 8+，血族职业，且已获得「血律研习」专长。从你已研习过基础血律的血律中再选一项取得进阶：兽性可仪式施展「动物交谈」「动物信使」，免法术位施展「化兽为友」；观占可耗 1 鲜血点使智力与感知的检定、豁免获优势 1 分钟；迅捷可耗 1 鲜血点使速度翻倍、AC +3 至你下回合开始；支配可施展「魅惑类人」「暗示术」，免法术位次数共为熟练加值；坚韧使体质豁免具优势，面对半伤效应成功则免伤、失败则半伤（失能时失效）；模糊使完全身处黑暗的你对依赖黑暗视觉者隐形；湮灭可耗 1 鲜血点免专注施展「黑暗术」；巨力可耗 2 鲜血点使近战或徒手命中额外造成 1d10 力场伤害 1 分钟，对物件与建筑双倍伤害；威仪可耗 3 鲜血点施展「恐惧术」，免专注且目标豁免具劣势；变形可耗 2 鲜血点使徒手命中加 2d6 挥砍伤害 1 分钟。可复选，每次须换血律。',
    { prerequisite: { minimumLevel: 8, requiredFeatIds: ['feat-2024-tp-vtm-discipline-acquisition'] }, repeatable: true }),
  bloodlineFeat('superior-discipline-acquisition', '卓越血律研习', 'Superior Discipline Acquisition',
    '血律运用近乎本能，须先有高等血律研习，可复选。',
    '先决：等级 12+，血族职业，且已获得「高等血律研习」专长。从你已研习过高阶血律的血律中再选一项：兽性可耗 1 鲜血点施展「魅惑怪物」或「支配野兽」，目标豁免具劣势；观占可以仪式施展「侦测魔法」，并各免法术位施展「鹰眼术」与「心灵感应」一次（长休后重获）；迅捷可耗 1 鲜血点获得一个额外动作，限攻击（仅一次攻击）、疾走、撤离、回避、躲藏或操作；支配可耗 3 鲜血点施展「群体暗示术」，目标豁免具劣势；坚韧可以反应将除火焰与光耀外的受伤减少熟练加值加体质调整值（至少 1）；模糊可免法术位施展「隐形术」共熟练加值次，并可耗至多 3 鲜血点令 30 尺内等量可见同伴隐形 1 分钟；湮灭可耗 2 鲜血点施展「艾伐黑触手」，伤害改为 1d6 钝击加 2d6 寒冷；巨力可以附赠动作耗至多 6 鲜血点使力量提高等量数值 1 小时；威仪可免法术位施展「暗示术」；变形可耗 1 鲜血点对自身施展「融身入石」，目标须为土、沙或泥且持续 24 小时。可复选，每次须换血律。',
    { prerequisite: { minimumLevel: 12, requiredFeatIds: ['feat-2024-tp-vtm-greater-discipline-acquisition'] }, repeatable: true }),
  bloodlineFeat('supreme-discipline-acquisition', '至高血律研习', 'Supreme Discipline Acquisition',
    '穷尽某一血律的全部奥秘，须先有卓越血律研习，可复选。',
    '先决：等级 16+，血族职业，且已获得「卓越血律研习」专长。从你已研习至顶阶的血律中再选一项：兽性可免法术位免专注施展七环「支配野兽」（长休后重获）；观占可耗 2 鲜血点对自身施展「真知术」；迅捷可耗 2 鲜血点对自身施展「加速术」，其结束时你不失能且速度不降为 0；支配可免法术位免专注施展七环「支配类人」（长休后重获）；坚韧可以反应耗 2 鲜血点将除火焰与光耀外的受伤减半（向下取整），或耗 4 鲜血点降为 0；模糊可耗 1 鲜血点免专注施展「高等隐形术」，且敏捷（隐匿）检定具优势；湮灭可在 10 尺内可见生物攻击失手时以反应耗 1 鲜血点，造成 2d8 钝击加 2d8 寒冷伤害；巨力可以附赠动作耗 2 鲜血点使力量攻击检定具优势 1 分钟，并可重掷其中一颗骰一次；威仪可耗 3 鲜血点对自身施展「庇护术」，该法术不因你攻击、施法或造成伤害而结束；变形可耗 3 鲜血点对自身施展「变形术」变为蝙蝠、猫、鼠、渡鸦或狼，额外耗 1 鲜血点可变恐狼、巨蝙蝠、巨鼠或豹，变形期间保留智力、感知与魅力。可复选，每次须换血律。',
    { prerequisite: { minimumLevel: 16, requiredFeatIds: ['feat-2024-tp-vtm-superior-discipline-acquisition'] }, repeatable: true }),
]

export const vtmEpicBoonFeats2024: readonly FeatRule[] = [
  epicBoonFeat('boon-of-generations', '世代传承之恩惠', 'Boon of Generations',
    '任选一项属性 +1（上限 30），血饲骰可重掷 1，鲜血点上限 +5。',
    '先决：等级 19+，血族职业。属性值提升：你选择的一项属性提升 1，至多提升至 30。深度血饲：每当你为血饲特性投掷血饲骰时，若掷出 1 可重掷该骰，且必须使用新的结果。浓醇之血：你的鲜血点上限增加 5。',
    { prerequisite: { minimumLevel: 19 } }),
]
