import type { FeatRule } from '@/types/rules'

/**
 * 《胧忆岛：蒿野物语》（OBO）第三方专长 · 2014 写法，共 20 条。
 *
 * 登记口径：
 * - 2014 写法（无 2024 专长类别），登记进 `5e-2014` 仓库，来源 `tp-obojima-index`（第三方、默认关闭、需 DM 同意）；
 * - 中英文名以 CHM v2026.09.13 `第三方_胧忆岛_专长.md` 的实际标题为准，逐条核对，共 20 条；
 * - `detail` 为原创中文转述：写清前置、属性提升、关键数值、使用次数与恢复时机，不逐句照抄原文；
 * - 需要玩家二选一的内容（属性二选一、法术与生物类型选择等）只写进 `detail`，本批不登记 `RuleOption`／`choices`；
 * - 组织成员、道场试炼等叙事性前置无法用 `FeatPrerequisite` 结构表达，只登记进 `detail`；种族类前置写入 `requiredRaceIds`
 *   （鸣玉族 ID 取自 `races-third-party-2014.ts`）；
 * - 本模块只登记条目数据，接入 `repository.ts`／`feats-2014.ts` 由后续批次处理。
 */
const OBOJIMA = ['tp-obojima-index'] as const

interface FeatSeed {
  /** 条目 slug，与本批统一前缀组成稳定 ID `feat-2014-tp-obojima-<slug>`。 */
  readonly slug: string
  readonly name: string
  readonly englishName: string
  /** 一句话概括（20—40 字）。 */
  readonly description: string
  /** 原创中文详细效果（60—160 字）：前置、属性提升、关键数值、次数与恢复。 */
  readonly detail: string
  readonly tags: readonly string[]
  readonly prerequisite?: FeatRule['prerequisite']
}

const seeds: readonly FeatSeed[] = [
  {
    slug: 'boomerang-expert',
    name: '回旋镖专家',
    englishName: 'Boomerang Expert',
    description: '提升回旋镖的伤害骰，并让远程投掷的回收与远距离攻击更可靠。',
    detail: '你已熟练掌握回旋镖的多种用法。以回旋镖攻击时，其伤害骰提升为 d8；在常规射程之外进行远程攻击不再因此承受劣势；投掷后你可以自动接住回旋镖，无需消耗反应，因此能持续投掷而不必担心失去武器。',
    tags: ['专长', '战斗'],
  },
  {
    slug: 'bumbling-fool',
    name: '傻人傻福',
    englishName: 'Bumbling Fool',
    description: '属性检定失手时仍可能侥幸挽回，全凭出人意料的运气。',
    detail: '你以笨拙却总能因祸得福的方式行事。当你的一次属性检定失败，且 d20 掷出的结果不大于你等级的一半（向上取整）时，你可以把该结果替换为 15。该能力可使用三次，完成一次长休后恢复全部已消耗的次数。',
    tags: ['专长', '检定'],
  },
  {
    slug: 'canden-and-moons-master-cut',
    name: '寒传月闪流精要',
    englishName: "Canden and Moon's Master Cut",
    description: '得自胧忆岛第一剑术流派的训练，兼顾机动、先手突进与防御。',
    detail: '前置：须在寒传月闪流道场击败一位大师。步行速度 +5 尺。掷先攻后、首回合开始前，可用反应拔出武器并移动不超过速度一半（向上取整）的距离；若结束时处于其他生物触及范围内，可用该武器对其发动一次近战攻击。被命中时可用反应摆出防御姿态，直到你下回合开始 AC +5，并同样作用于触发它的攻击；姿态用过后须长休才能再用。',
    tags: ['专长', '战斗', '移动'],
  },
  {
    slug: 'cloud-hopper',
    name: '云端漫步者',
    englishName: 'Cloud Hopper',
    description: '与风之精魂接触后可在空中踏云移动，并获得两项风系法术。',
    detail: '与伟大的风之精魂接触改变了你。自己回合内移动时，你可在脚下召唤微型云朵，借此进入空中的未占据空间，可如此移动等于熟练加值 × 5 尺的距离，用尽后云朵不再出现；若停在半空则如常坠落。你习得云雾术与造风术，各可不消耗法术位施放一次，长休后重获，也能以相应环阶法术位施放；施法关键属性为智力、感知或魅力（由你选择）。',
    tags: ['专长', '移动', '施法'],
  },
  {
    slug: 'coven-witch',
    name: '魔女盟誓',
    englishName: 'Coven Witch',
    description: '成为魔女集会正式成员，获得属性提升、药水配方与两项法术。',
    detail: '前置：须为某个魔女集会的成员。你的智力或感知 +1（上限 20）。你从所属集会习得两份随机配方，涵盖普通与非普通药水。另学会两个一环法术，须出自预言、咒法或变化学派；每个法术可不消耗法术位施放一次，长休后重获，也能以相应环级的法术位施放。这些法术的施法关键属性为本次提升的属性。',
    tags: ['专长', '施法'],
  },
  {
    slug: 'forager',
    name: '采集者',
    englishName: 'Forager',
    description: '长年探索岛屿搜寻材料，野外求生与采集收获显著提升。',
    detail: '你花费大量时间在岛上搜寻材料。感知 +1（上限 20）。获得求生技能熟练；若已具有该熟练，则改为获得该技能的专精。进行采集活动时，你获得的普通材料与非普通材料数量翻倍。',
    tags: ['专长', '探索'],
  },
  {
    slug: 'freediver',
    name: '自由潜者',
    englishName: 'Freediver',
    description: '经过深水训练，获得游泳速度、强化闭气与冷冻伤害抗性。',
    detail: '你经历过深入水下的训练。体质 +1（上限 20）。获得游泳速度，数值为体质的两倍（向上取整到最近的 5 尺）；若已拥有游泳速度，则改为增加 10 尺。计算闭气时间时，你的体质调整值按三倍计算。此外你获得冷冻伤害抗性。',
    tags: ['专长', '生存'],
  },
  {
    slug: 'group-combatant',
    name: '群战专家',
    englishName: 'Group Combatant',
    description: '面对围攻与单挑都游刃有余，能减伤并摆脱夹击和借机攻击。',
    detail: '你磨练出应对多人战斗与一对一决斗的技巧。你受到的非魔法攻击所造成的钝击、穿刺与挥砍伤害减少 2 点，但至少仍受 1 点。使用可选夹击规则时，生物无法因夹击获得对你攻击的优势。在你的回合中触发一次借机攻击后，该回合剩余时间内你的移动不再引发借机攻击。',
    tags: ['专长', '战斗', '防御'],
  },
  {
    slug: 'light-foot',
    name: '身轻如燕',
    englishName: 'Light Foot',
    description: '以超凡速度与敏捷获得护甲加值、额外移动和穿行能力。',
    detail: '你拥有非凡的速度与敏捷。未穿着重甲时 AC +1。每当你采取攻击动作，可放弃其中一次攻击，改为移动最多等于你速度一半的距离。非魔法困难地形不会消耗你额外的移动力。你还能穿过敌对生物所占据的空间，无论其体型大小。',
    tags: ['专长', '移动', '防御'],
  },
  {
    slug: 'magically-mischievous',
    name: '捣蛋魔偷',
    englishName: 'Magically Mischievous',
    description: '获得巧手熟练，并能让偷到的小物件魔法性地隐形。',
    detail: '你学会了一些助你恶作剧的魔法手法。获得巧手技能熟练；若已具有该熟练，改为获得该技能的专精。以敏捷（巧手）成功偷取物品时，可作为该动作的一部分令物品魔法性隐形，如同施放了遮蔽物体法术；物品须小到能放入你的手掌，效果持续 1 分钟。该能力每天可用次数等于你的熟练加值，完成长休后全部恢复。',
    tags: ['专长', '技能'],
  },
  {
    slug: 'member-of-aha',
    name: 'AHA成员',
    englishName: 'Member of AHA',
    description: '作为 AHA 正式成员，获得智力提升、一项戏法与一个自选法术。',
    detail: '前置：须为 AHA 组织的成员。智力 +1（上限 20）。你学会戏法电击术。此外可从通晓语言、侦测魔法、鉴定术或迷幻手稿中选择一个学会；该法术可不消耗法术位施放一次，须完成长休才能再次以此方式施放，也能用你拥有的任意法术位施放。这些法术以智力为施法关键属性。',
    tags: ['专长', '施法'],
  },
  {
    slug: 'minor-corruption',
    name: '轻度侵蚀',
    englishName: 'Minor Corruption',
    description: '被侵蚀之力改变，残血时更坚韧，并能以反应抵消来袭伤害。',
    detail: '你曾被毒害岛屿的黑暗魔法「侵蚀」触及。生命值低于一半时 AC +1；施法不需法器，可忽略无价值且不被消耗的材料成分；受到伤害时可用反应抵消等于你等级三倍的伤害，超出部分照常承受，并在下回合结束进行体质豁免（DC 取 10 或原伤害三分之一的高者），失败即受被抵消的伤害，其后 1 分钟内每回合重复豁免。用过须完成长休。',
    tags: ['专长', '防御', '施法'],
  },
  {
    slug: 'nakudama-electric-bloodline',
    name: '雷血鸣玉',
    englishName: "Nakudama's Electric Bloodline",
    description: '鸣玉族血脉技艺：闪电抗性、带电舌击与挣脱擒抱的电击。',
    detail: '前置：须为鸣玉族。你唤醒先祖技艺获得闪电伤害抗性；舌头带电，视为具灵巧与触及特性的徒手打击，命中造成 1d6 + 力量或敏捷调整值闪电伤害（5 级 1d8、11 级 1d10、17 级 1d12）。被擒抱时可用反应令其进行体质豁免（DC = 8 + 体质调整值 + 熟练加值），失败则受 1d10 闪电伤害且擒抱终止。',
    tags: ['专长', '种族'],
    prerequisite: { requiredRaceIds: ['race-2014-tp-nakudama'] },
  },
  {
    slug: 'nakudama-toxin-bloodline',
    name: '毒血鸣玉',
    englishName: "Nakudama's Toxin Bloodline",
    description: '鸣玉族血脉：毒素抗性、中毒豁免优势与喷吐毒液的能力。',
    detail: '前置：须为鸣玉族。你唤醒先祖技艺，获得毒素伤害抗性，对抗中毒状态的豁免具有优势。你能鼓颊含毒，以一个动作连续喷射数团毒液，目标数量等于你的熟练加值；每个目标须在你 30 尺内，各进行一次体质豁免（DC = 8 + 你的体质调整值 + 熟练加值），失败者受 1d8 + 熟练加值毒素伤害，成功则减半。',
    tags: ['专长', '种族'],
    prerequisite: { requiredRaceIds: ['race-2014-tp-nakudama'] },
  },
  {
    slug: 'postal-knight',
    name: '驿骑士',
    englishName: 'Postal Knight',
    description: '速递队的严格训练：属性提升、技能熟练与力竭抗性。',
    detail: '前置：须为速递队的成员。作为速递队的一员，你受过严格训练：体质或感知 +1（上限 20）；获得运动与求生技能熟练；力竭状态不会使你的属性检定具有劣势。',
    tags: ['专长', '技能'],
  },
  {
    slug: 'potion-brewer',
    name: '药剂师',
    englishName: 'Potion Brewer',
    description: '精于调配药水原料，可降低用料门槛并有机会一次成双。',
    detail: '你对魔法药水与灵药的知识让你能按需调配原料。酿造药水时，你可以改用配方中第二高的原料属性，而不必使用最高的那一项；你也可以掷一次 d100，若结果不大于你的等级，则本次制作可一次产出两瓶药水而非一瓶。',
    tags: ['专长', '工具'],
  },
  {
    slug: 'tellu-and-scales-master-cut',
    name: '辉流鳞斩流精要',
    englishName: "Tellu and Scale's Master Cut",
    description: '山谷剑术道场的精髓：单手反击与双手破衡的攻防转换。',
    detail: '前置：须在辉流鳞斩流剑术道场击败一位大师。单手持握多用武器时，触及范围内的生物对你发动的近战攻击未命中，你可立即反击，使其受到等于熟练加值两倍的武器伤害（下回合开始前）。双手持握多用武器时，触及范围内的敌人近战攻击你而未命中，你可用反应迫使其进行敏捷豁免（DC = 8 + 力量调整值 + 熟练加值），失败则倒地。',
    tags: ['专长', '战斗'],
  },
  {
    slug: 'toraf-and-bolders-master-cut',
    name: '虎岚断岩流精要',
    englishName: "Toraf and Bolder's Master Cut",
    description: '虎岚断岩流的精准打击：以命中换部位破坏的面、胴、足三式。',
    detail: '前置：须在虎岚断岩流道场击败一位大师。以熟练武器发动近战攻击前，可让该次攻击承受 -5 攻击检定减值，换取一种部位打击（每次攻击限一种）：面打使目标在下回合结束前的下次攻击检定具有劣势；胴打使目标在你下回合开始前无法说话，此后 1 分钟内免疫胴打；足打使目标速度降低 10 尺（最低 10 尺），持续到你下回合开始。',
    tags: ['专长', '战斗'],
  },
  {
    slug: 'vocalist-arcanist',
    name: '咏术师',
    englishName: 'Vocalist Arcanist',
    description: '以魔法歌声强化法术，让熟练加值在关键一击或豁免中翻倍。',
    detail: '当你施展迫使目标进行豁免或需你进行法术攻击检定的法术时，可选择以歌声强化该法术。你可在掷出 d20 后再决定是否使用，但须在 DM 宣布结果前决定。此时进行一次魅力（表演）检定，DC 为 10 + 法术环级；成功则该次法术攻击检定或该法术豁免 DC 计算时，你的熟练加值视为翻倍。在下一个黎明前成功使用三次后即失效。',
    tags: ['专长', '施法'],
  },
  {
    slug: 'wetland-explorer',
    name: '沼地探索者',
    englishName: 'Wetland Explorer',
    description: '熟习危险生物的习性，针对所选生物类型强化先攻、潜行与攻击。',
    detail: '你深入了解各地的危险生物。选择两种生物类型：战斗开始时掷先攻，若战斗中有一个或多个你所选类型的敌对生物，你可将熟练加值加入先攻掷骰（若某生物以魔法改变形态伪装成其他类型，则不给此加值）。涉及你所选生物类型时，你的敏捷（隐匿）与感知（求生）检定获得 +5 加值；对这些类型的目标进行攻击检定时获得 +2 加值。',
    tags: ['专长', '探索'],
  },
]

export const obojimaFeats2014: readonly FeatRule[] = seeds.map((seed) => ({
  id: `feat-2014-tp-obojima-${seed.slug}`,
  ruleset: '5e-2014',
  name: seed.name,
  englishName: seed.englishName,
  description: seed.description,
  detail: seed.detail,
  tags: seed.tags,
  prerequisite: seed.prerequisite,
  status: 'selectable',
  sourceIds: OBOJIMA,
}))
