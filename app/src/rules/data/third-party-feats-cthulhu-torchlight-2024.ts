import type { FeatRule } from '@/types/rules'

/**
 * G3-I4：火炬光下的克苏鲁（Cthulhu: Torchlight，第三方）2024 版式起源专长 5 条。
 *
 * 来源 ID `source-2024-tp-cthulhu-torchlight`；第三方合作内容，来源默认关闭、需 DM 同意。
 *
 * 登记口径：
 * - 5 条均为起源专长（`category: 'origin'`），由同书调查员背景授予，本模块不重复登记背景；
 * - 中英文名与全部增益项取自 CHM v2026.09.13 第二章原文，`detail` 为原创中文转述；
 * - 原文未写属性提升与先决条件，故省略 `prerequisite`，不做补写；
 * - 条目状态 `selectable`，效果不进入自动计算，最终裁定以第三方原书为准。
 */
const cthulhuTorchlight = ['source-2024-tp-cthulhu-torchlight'] as const

const originFeat = (
  slug: string,
  name: string,
  englishName: string,
  description: string,
  detail: string,
): FeatRule => ({
  id: `feat-2024-tp-cbt-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  description,
  detail,
  tags: ['起源'],
  category: 'origin',
  status: 'selectable',
  sourceIds: cthulhuTorchlight,
})

export const cthulhuTorchlightFeats2024: readonly FeatRule[] = [
  originFeat('fought-and-lived', '我曾斗战而归', 'I Fought, I Lived',
    '浴血时伤害取满，并掷骰摆脱恐慌。',
    '起源专长，无属性提升与先决。不屈打击：你处于浴血期间，以法术或武器攻击命中时可将该次伤害掷骰全部取最大值；一经使用，直至完成长休都无法再次使用。不挠之心：若你在自己回合开始时已陷入恐慌状态，投掷一次 d20，骰值不低于 10 则不再具有该状态，此检定不限次数。'),
  originFeat('hid-from-the-terror', '我曾躲过惧怖', 'I Hid from the Terror',
    '隐形攻击不现形，并可躲藏于巨物之侧。',
    '起源专长，无属性提升与先决。阴影打击：若一次攻击会终止你的隐形状态，你可令该次攻击后仍保持隐形；可用次数等于熟练加值，完成长休时重获全部已消耗次数。不值一哂：对体型大于你的生物躲藏时，只要你处于轻度遮蔽下或距其超过 30 尺即可躲藏，且仅对该生物视为躲藏。融身入影：你隐形期间，寻找你的感知（察觉）检定具有劣势。'),
  originFeat('pierced-the-illusion', '我曾冲破幻象', 'I Pierced the Illusion',
    '掷骰摆脱魅惑，识破谎言并善加审问。',
    '起源专长，无属性提升与先决。洞彻感知：若你在自己回合开始时已陷入魅惑状态，投掷一次 d20，骰值不低于 10 则不再具有该状态，此检定不限次数。闻听破谎：NPC 对你说话时，若其陈述含有谬误，你可使用此增益得知其说谎，但无法获知真相或缘由；可用次数等于熟练加值，完成长休时重获全部已消耗次数。巧妙审问：你对正与你交谈的生物进行感知（洞悉）检定具有优势。'),
  originFeat('opened-the-gate', '我曾打开大门', 'I Opened the Gate',
    '习得三门语言，并以麻痹换取法术 DC。',
    '起源专长，无属性提升与先决。探秘寻古：你习得三种自选语言。邪恶奥秘：你施展一道法术时，可令该法术的豁免 DC 获得 +2 加值，代价是你陷入麻痹状态直至你的下个回合开始；可用次数等于熟练加值，完成长休时重获全部已消耗次数。若该法术无需豁免，加值不产生实际作用，由 DM 裁定。'),
  originFeat('survived-to-tell', '我曾幸存以述', 'I Survived to Tell the Tale',
    '免于倒地一次，速度提升且可挣脱束缚。',
    '起源专长，无属性提升与先决。生存本能：当你受到将令你生命值降至 0 的伤害时，你立即恢复等于你等级的生命值；一经使用，直至完成长休都无法再次使用。超级速度：你的速度获得 +10 尺加值，持续生效。无拘无束：若你在自己回合开始时已陷入束缚状态，投掷一次 d20，骰值不低于 10 则不再具有该状态，此检定不限次数。'),
]
