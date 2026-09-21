import type { FeatRule } from '@/types/rules'

/**
 * G3 批次：第三方《谦卑林》(Humblewood) 与《谦卑林故事集》(Humblewood Tales) 专长（2014 口径）。
 *
 * - 《谦卑林》7 条，来源 `tp-humblewood-index`，ID 前缀 `feat-2014-tp-hw-`；
 * - 《谦卑林故事集》4 条，来源 `tp-humblewood-tales-index`，ID 前缀 `feat-2014-tp-hwt-`。
 *
 * 登记口径：
 * - 中英文名与全部增益项取自 CHM v2026.09.13 对应章节，`detail` 为原创中文转述，不逐句照抄；
 * - 2014 写法条目状态 `selectable`（第三方合作内容，来源默认关闭、需 DM 同意）；
 * - 属性提升按 2014 口径写进 `detail`；需要二选一的（智力或感知 +1、求生或自然熟练）只写入 `detail`，
 *   不新建 `RuleOption`、不设 `choices`；本批不设 `category`（2014 条目省略）；
 * - 前置「具有滑翔特质」是鸟族共有特质，按 `requiredRaceIds` 限定隼族／雉族／鸦族／鸮族／鸽族；
 * - 两书来源不同，故用 `bookAbbr`（hw／hwt）同时决定 ID 前缀与 `sourceIds`。
 */
interface FeatSeed {
  /** 条目 slug，与 `bookAbbr` 共同组成稳定 ID。 */
  readonly slug: string
  /** 书简称：hw＝《谦卑林》，hwt＝《谦卑林故事集》。 */
  readonly bookAbbr: 'hw' | 'hwt'
  readonly name: string
  readonly englishName: string
  /** 一句话概括（20—40 字）。 */
  readonly description: string
  /** 原创中文详细效果（60—160 字）：前置、属性提升、关键数值、次数与恢复。 */
  readonly detail: string
  readonly tags: readonly string[]
  readonly prerequisite?: FeatRule['prerequisite']
}

const sourceIdsByBook: Readonly<Record<FeatSeed['bookAbbr'], readonly string[]>> = {
  hw: ['tp-humblewood-index'],
  hwt: ['tp-humblewood-tales-index'],
}

/**
 * 鸟族共有的「滑翔」特质持有者：隼族、雉族、鸦族、鸮族、鸽族。
 * 这五项种族均须再选亚种，故按父种族 ID 登记（草稿的 `raceId` 保留父种族）。
 */
const BIRDFOLK_RACE_IDS: readonly string[] = [
  'race-2014-tp-raptor',
  'race-2014-tp-gallus',
  'race-2014-tp-corvum',
  'race-2014-tp-strig',
  'race-2014-tp-luma',
]

const glidePrerequisite: FeatRule['prerequisite'] = { requiredRaceIds: BIRDFOLK_RACE_IDS }

const seeds: readonly FeatSeed[] = [
  // ============ 《谦卑林》(Humblewood) ============
  {
    slug: 'aerial-expert',
    bookAbbr: 'hw',
    name: '飞翔专家',
    englishName: 'Aerial Expert',
    description: '精进滑翔与跳跃，可自由转向并短暂抬升高度。',
    detail: '前置：具有滑翔特质（鸟族共有）。你的跳高与跳远不再需要至少 10 尺助跑，跳跃高度或距离可用力量或敏捷计算，最大跳跃距离翻倍；滑翔期间可以执行疾走动作，额外滑行等于滑翔速度的距离，还能自由改变方向，并在滑翔结束前一次性向上抬升 10 尺。',
    tags: ['移动', '滑翔'],
    prerequisite: glidePrerequisite,
  },
  {
    slug: 'bandit-cunning',
    bookAbbr: 'hw',
    name: '强盗狡诈',
    englishName: 'Bandit Cunning',
    description: '以智力洞察敌人实力，并强化临场豁免应对。',
    detail: '当你被要求进行豁免检定时，可用反应把智力调整值加入该豁免，用后须完成长休才能再用。战斗中你还能以一个动作调查本场战斗里见过的生物，进行智力（调查）检定（DC = 10 + 其挑战等级），成功即可得知其一项情报：某项伤害抗性或免疫、状态免疫、可造成或减免伤害的特殊能力、某个动作项或特殊感官。',
    tags: ['战斗', '探索'],
  },
  {
    slug: 'heavy-glider',
    bookAbbr: 'hw',
    name: '空中堡垒',
    englishName: 'Heavy Glider',
    description: '未超负重时披重甲持重武滑翔，落地可撞倒敌人。',
    detail: '前置：具有滑翔特质（鸟族共有）。只要你未处于重载，就能在持握重型武器、穿着重甲的状态下滑翔；滑翔时还可选择降落在不超过大型的敌对生物所占据的空间，并与其进行力量检定对抗——胜出则把它推离 10 尺并击至倒地，失败则落在原定落点最近的未占据空间。',
    tags: ['移动', '滑翔', '战斗'],
    prerequisite: glidePrerequisite,
  },
  {
    slug: 'opportunistic-thief',
    bookAbbr: 'hw',
    name: '见机行窃',
    englishName: 'Opportunistic Thief',
    description: '敏捷 +1，并借敌人失手之机行窃与藏匿。',
    detail: '敏捷 +1（上限 20）。战斗中，当生物对你的近战攻击检定失手时，你可对其进行一次敏捷（巧手）检定（DC = 10 + 该生物的敏捷调整值），成功即偷走其身上一件未被持握或穿戴的物件；战斗之外，当你以巧手成功偷得物件时，可立即把它完美藏在自己身上，或把身上的另一件物件放回被偷物品原先的位置。',
    tags: ['属性', '潜行'],
  },
  {
    slug: 'perfect-landing',
    bookAbbr: 'hw',
    name: '完美着陆',
    englishName: 'Perfect Landing',
    description: '敏捷 +1，减轻坠落伤害且落地不再倒地。',
    detail: '敏捷 +1（上限 20）。计算坠落伤害时可无视至多 30 尺的坠落高度；坠落伤害的伤害骰从 d6 降为 d4；受到坠落伤害后，你也不会因此陷入倒地状态。',
    tags: ['属性', '移动'],
  },
  {
    slug: 'speech-of-the-ancient-beasts',
    bookAbbr: 'hw',
    name: '远古野兽之语',
    englishName: 'Speech of the Ancient Beasts',
    description: '魅力 +1，与大型野兽亲近并能与之交谈。',
    detail: '魅力 +1（上限 20）。体型为大型或更大的野兽对你的初始态度为友好（除非你攻击过它），你对它们进行的魅力检定具有优势。你能说并理解巨鹰语、巨赤鹿语与巨猫头鹰语；大型及更大的野兽都能听懂你的话语，即便它们并不通晓语言，智力不超过 4 的野兽往往只能领会其中简单的意思。',
    tags: ['属性', '社交', '野兽'],
  },
  {
    slug: 'woodwise',
    bookAbbr: 'hw',
    name: '林木之睿',
    englishName: 'Woodwise',
    description: '获得求生或自然熟练，无视困难地形且不迷路。',
    detail: '长期生活在参天林木之间，你已成为寻路的专家。你获得求生技能或自然技能之一的熟练项（选取时二选一）；你无视困难地形；除非受魔法效应影响，否则即使地形再险峻，你也不会在自然环境中迷路。',
    tags: ['探索', '自然'],
  },

  // ============ 《谦卑林故事集》(Humblewood Tales) ============
  {
    slug: 'field-medic',
    bookAbbr: 'hwt',
    name: '战地医者',
    englishName: 'Field Medic',
    description: '以观察判断伤情，附赠施展维生术，并可免法术位施展疗伤术。',
    detail: '你受过魔法检伤训练。通过观察即可判断一名生物是否失去生命值、其生命值是否过半；为判断目标是否受诅、染病、附身或目盲、耳聋、力竭而进行的感知（医药）或智力（奥秘、宗教）检定具有优势。你习得戏法维生术，并能以附赠动作施展；还能无需法术位施展疗伤术，次数至多为你熟练加值的一半，完成长休后重获，施法属性为感知。',
    tags: ['施法', '治疗'],
  },
  {
    slug: 'flamewoke',
    bookAbbr: 'hwt',
    name: '炎焱觉者',
    englishName: 'Flamewoke',
    description: '习得火族语与燃火术，并可强化和操控火焰。',
    detail: '你能说、读、写火族语，并习得戏法燃火术（施法属性为魅力）。以一个附赠动作增强火力：直到你下个回合结束，你下次造成火焰伤害时，可对其中一名生物额外造成 2d10 火焰伤害，用后须完成短休或长休才能再用。你还能以附赠动作向 30 尺内、可被 5 尺立方容纳的非魔法火焰低语，令其向指定方向蔓延 5 尺（需有燃料）或熄灭。',
    tags: ['施法', '火焰'],
  },
  {
    slug: 'forest-sage',
    bookAbbr: 'hwt',
    name: '森木贤者',
    englishName: 'Forest Sage',
    description: '智力或感知 +1，以双属性通晓自然学识与法术。',
    detail: '前置：德鲁伊或法师。智力或感知 +1（上限 20，选取时二选一）。进行驯兽、奥秘、自然或求生检定时，你可自行选择用智力或感知计算调整值。你还能从德鲁伊或法师的法术列表中选择两道法术学习，所选法术的环阶必须是你能够施展的，它们视为你的职业法术：法师将其加入法术书，德鲁伊将其加入已知法术。',
    tags: ['属性', '施法'],
    prerequisite: { requiredCapability: 'spellcasting' },
  },
  {
    slug: 'plantmender',
    bookAbbr: 'hwt',
    name: '植物缮者',
    englishName: 'Plantmender',
    description: '读取植物记忆，并习得植物修复等自然法术。',
    detail: '前置：感知 13。以一个动作触碰一株植物或树木，你就能身临其境地看到它与其周围过去 24 小时发生之事，并了解其健康状况与影响它的枯萎病等状态；可用次数 = 感知调整值 × 2（至少 1 次），完成长休后重获全部。你习得戏法植物修复与橡棍术，还能各施展一次树肤术与荆棘丛生，长休后重获施展权，均以感知为施法属性。',
    tags: ['施法', '自然'],
    prerequisite: { abilityMinimum: { anyOf: ['wis'], score: 13 } },
  },
]

export const humblewoodFeats2014: readonly FeatRule[] = seeds.map((seed) => ({
  id: `feat-2014-tp-${seed.bookAbbr}-${seed.slug}`,
  ruleset: '5e-2014',
  name: seed.name,
  englishName: seed.englishName,
  description: seed.description,
  detail: seed.detail,
  tags: seed.tags,
  prerequisite: seed.prerequisite,
  status: 'selectable',
  sourceIds: sourceIdsByBook[seed.bookAbbr],
}))
