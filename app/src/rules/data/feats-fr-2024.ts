import type { FeatRule } from '@/types/rules'

/**
 * 《被遗忘的国度：费伦冒险》（FR:AI 2025）第一章起源专长（G3 批次 G3-B）。
 *
 * 8 条起源专长，授予该书 8 个对应背景（竖琴手、紫龙骑士侍从、龙巫教信徒等）。
 * 登记口径：
 * - 来源为 `source-2024-fr-ai`（官方 2024 扩展，可切换）；
 * - 增益条目逐条取自 CHM v2026.09.13 `被遗忘的国度_费伦英雄_第一章_专长_起源专长.md`，
 *   中英文名以 CHM 原文为准；`detail` 为原创中文转述并保留机制要点；
 * - 涉及「英雄激励」「戏法选择」「施法属性选择」「技能／乐器自选」的子项以 `choices` 或
 *   文字说明登记，未接入的自动计算项在文本中注明按原书处理。
 */
const faerun = ['source-2024-fr-ai'] as const

/** 施法属性候选（咒火火花、翠绿闲庭新羽等「智力、感知或魅力」三选一）。 */
const SPELL_ABILITY_CHOICE = {
  id: 'fr-ai-spellcasting-ability',
  title: '选择施法属性',
  description: '选择智力、感知或魅力作为该专长法术的施法属性。',
  minSelections: 1,
  maxSelections: 1,
  optionIds: ['spell-ability-int', 'spell-ability-wis', 'spell-ability-cha'],
} as const

const faerunFeat = (
  slug: string,
  name: string,
  englishName: string,
  detail: string,
  extra: Pick<FeatRule, 'choices'> = {},
): FeatRule => ({
  id: `feat-2024-fr-ai-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  description: detail.split('；')[0] ?? detail,
  detail,
  tags: ['起源'],
  category: 'origin',
  status: 'selectable',
  sourceIds: faerun,
  ...extra,
})

export const faerunOriginFeats2024: readonly FeatRule[] = [
  faerunFeat('cult-of-the-dragon-initiate', '新晋龙巫教徒', 'Cult of the Dragon Initiate',
    '龙之舌：你懂得龙语；若选取时已懂龙语，可从《玩家手册》或本书第二章语言表中另选一门语言习得。龙之威：以魔法动作使 30 尺内一名可见生物进行一次感知豁免（DC = 8 + 感知调整值 + 熟练加值），失败则恐慌至你的下个回合结束；豁免成功或效应结束时，该目标 24 小时内免疫此效应。饮惧为励：当你使一名以你为恐惧源的生物陷入恐慌且你无英雄激励时，你获得英雄激励；此增益一经使用，直至完成短休或长休都无法再次使用。'),
  faerunFeat('emerald-enclave-fledgling', '翠绿闲庭新羽', 'Emerald Enclave Fledgling',
    '动物交谈：你始终准备着法术「动物交谈」，可用任意法术位施展；施法属性于选取时从智力、感知、魅力中选择；以仪式施展时持续时间为 8 小时。双人轮打：执行协助动作时，作为该动作的一部分，你可与 5 尺内一名自愿盟友交换位置，且不引发借机攻击；若该盟友失能则无法使用。',
    { choices: [SPELL_ABILITY_CHOICE] }),
  faerunFeat('harper-agent', '竖琴手特工', 'Harper Agent',
    '盗贼黑话：你懂得盗贼黑话。乐器训练：你获得一项自选乐器的熟练。分神旋律：当你执行协助动作辅助盟友的攻击检定时，只要 30 尺内的敌人能看见或听见你，你即可分散其注意力（不必位于 5 尺内）。'),
  faerunFeat('lords-alliance-agent', '领主联盟特工', "Lords' Alliance Agent",
    '激励打击：每回合一次，当你对生物造成重击时，可选择 30 尺内一名能看见或听见你、且不具有英雄激励的盟友，使其获得英雄激励。重获荣誉：当一名你可见的敌人对你 5 尺内的盟友造成伤害时，你在下个回合结束前对该敌人的下次攻击检定具有优势。'),
  faerunFeat('purple-dragon-rook', '紫龙新兵', 'Purple Dragon Rook',
    '待人接物：你获得洞悉、表演或游说之一的技能熟练。振军战吼：当你投掷先攻且未失能时，可选择数量等于你熟练加值、位于你 30 尺内且可见的生物，使其获得英雄激励；此增益一经使用，直至完成长休都无法再次使用。',
    { choices: [{ id: 'fr-ai-rook-skill', title: '选择技能熟练', description: '获得洞悉、表演或游说之一的熟练。', minSelections: 1, maxSelections: 1, optionIds: ['skill-insight', 'skill-performance', 'skill-persuasion'] }] }),
  faerunFeat('spellfire-spark', '咒火火花', 'Spellfire Spark',
    '魔法吸收：每回合一次，当你受到来自法术或魔法效应的伤害时，使该次总伤害减少 1d4；失能期间无法使用。咒火之焰：你习得戏法「圣火术」，施法属性于选取时从智力、感知、魅力中选择；你还能以附赠动作施展该戏法，次数等于你的熟练加值，完成长休时重获全部次数。',
    { choices: [SPELL_ABILITY_CHOICE] }),
  faerunFeat('tyro-of-the-gauntlet', '新锻臂铠', 'Tyro of the Gauntlet',
    '比肩而立：当 5 尺内一名盟友将受到推离或拉近它的效应时，你能以反应阻止该位移；若该盟友失能则无法受益。警惕：当你执行预备动作后，在你下个回合开始前对你进行的下次攻击检定具有劣势。'),
  faerunFeat('zhentarim-ruffian', '散塔林会暴徒', 'Zhentarim Ruffian',
    '见缝插针：为借机攻击进行伤害掷骰时，你可投掷两次伤害骰并选用其中一个结果。家人至上：当你投掷先攻且具有英雄激励时，可消耗英雄激励，使你与你的盟友的此次先攻掷骰具有优势。'),
]
