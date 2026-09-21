import type { FeatRule, RuleOption } from '@/types/rules'

/**
 * 《启封奥秘》（Arcana Unleashed 2025）第一章起源专长（G3 批次 G3-C）。
 *
 * 10 条起源专长，授予该书 10 个对应背景（第九翎羽特工、瑰宝秘社间谍等）。
 * 登记口径：
 * - 来源为 `source-2024-au`（官方 2024 扩展，可切换）；
 * - 增益条目逐条取自 CHM v2026.09.13 `启封奥秘_第一章_专长_起源专长.md`，
 *   中英文名以 CHM 原文为准；`detail` 为原创中文转述并保留机制要点；
 * - 十条均含「戏法 Cantrip」子项（施法属性从智力／感知／魅力三选一），
 *   以 `choices` + `grantedSpells` 结构化登记，戏法与施法属性均可解析；
 * - 「英雄激励」「熟练加值次数／长休恢复」等按原书文字登记，不进入自动计算。
 */
const arcanaUnleashed = ['source-2024-au'] as const

/** 戏法施法属性候选（十条一律为「智力、感知或魅力」）。 */
const SPELL_ABILITY_CHOICE = {
  id: 'au-spellcasting-ability',
  title: '选择施法属性',
  description: '选择智力、感知或魅力作为该专长的戏法施法属性。',
  minSelections: 1,
  maxSelections: 1,
  optionIds: ['spell-ability-int', 'spell-ability-wis', 'spell-ability-cha'],
} as const

/** 奥法殡葬师的戏法需自选一道死灵学派牧师／法师戏法。 */
const NECROMANCY_CANTRIP_CHOICE = {
  id: 'au-undertaker-cantrip',
  title: '选择死灵学派戏法',
  description: '从牧师或法师法术列表中的死灵学派戏法里选择一道。',
  minSelections: 1,
  maxSelections: 1,
  optionIds: ['spell-2024-chill-touch', 'spell-2024-poison-spray', 'spell-2024-spare-the-dying', 'spell-2024-toll-the-dead'],
} as const

/** 穿界者的伤害抗性候选（需可解析，故同时导出为规则选项）。 */
export const damageResistanceOptions2024: readonly RuleOption[] = [
  { id: 'damage-resistance-necrotic', name: '暗蚀', description: '穿界者：你具有暗蚀伤害抗性。', status: 'selectable', sourceIds: arcanaUnleashed },
  { id: 'damage-resistance-psychic', name: '心灵', description: '穿界者：你具有心灵伤害抗性。', status: 'selectable', sourceIds: arcanaUnleashed },
  { id: 'damage-resistance-radiant', name: '光耀', description: '穿界者：你具有光耀伤害抗性。', status: 'selectable', sourceIds: arcanaUnleashed },
]

/** 穿界者的伤害抗性候选。 */
const RESISTANCE_CHOICE = {
  id: 'au-portal-resistance',
  title: '选择伤害抗性',
  description: '选择暗蚀、心灵或光耀之一作为你的抗性。',
  minSelections: 1,
  maxSelections: 1,
  optionIds: damageResistanceOptions2024.map((option) => option.id),
} as const

const auFeat = (
  slug: string,
  name: string,
  englishName: string,
  detail: string,
  cantripId: string,
  extraChoices: readonly NonNullable<FeatRule['choices']>[number][] = [],
): FeatRule => ({
  id: `feat-2024-au-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  description: detail.split('。')[0] ?? detail,
  detail,
  tags: ['起源'],
  category: 'origin',
  status: 'selectable',
  sourceIds: arcanaUnleashed,
  ...(cantripId ? { grantedSpells: [{ spellId: cantripId, alwaysPrepared: true }] } : {}),
  choices: [SPELL_ABILITY_CHOICE, ...extraChoices],
})

export const arcanaUnleashedOriginFeats2024: readonly FeatRule[] = [
  auFeat('arcane-artist', '奥法艺术家', 'Arcane Artist',
    '戏法：你习得戏法「次级幻象」，施法属性于选取时从智力、感知、魅力中选择。激励魔法：当你施展一道幻术学派法术时，可选择 30 尺内一名能看见你的盟友，使其获得英雄激励；此增益一经使用，直至完成长休都无法再次使用。',
    'spell-2024-minor-illusion'),
  auFeat('arcane-eloquence', '奥法雄辩家', 'Arcane Eloquence',
    '戏法：你习得戏法「恶言相加」，施法属性于选取时从智力、感知、魅力中选择。巧舌如簧：当你进行魅力（欺瞒、威吓或游说）检定时，可投掷 1d4 并将骰值加入该属性检定。',
    'spell-2024-vicious-mockery'),
  auFeat('arcane-infiltrator', '奥法渗透者', 'Arcane Infiltrator',
    '戏法：你习得戏法「交友术」，施法属性于选取时从智力、感知、魅力中选择。诡影迷踪：你能以附赠动作执行回避动作，可用次数等于你的熟练加值，完成长休时重获全部次数。',
    'spell-2024-friends'),
  auFeat('arcane-omens', '奥法预言家', 'Arcane Omens',
    '戏法：你习得戏法「神导术」，施法属性于选取时从智力、感知、魅力中选择。助人预兆：当你或 30 尺内一名可见生物豁免失败时，你能以反应投掷 1d4 并将骰值加入该豁免总值（可能使失败改为成功）；可用次数等于你的熟练加值，完成长休时重获全部次数。',
    'spell-2024-guidance'),
  auFeat('arcane-overload', '奥法超负荷', 'Arcane Overload',
    '戏法：你习得戏法「火焰箭」，施法属性于选取时从智力、感知、魅力中选择。能量如潮：当你施展塑能法术并以其造成伤害时，可将你的熟练加值加入该法术的其中一枚伤害骰；此增益一经使用，直至完成长休都无法再次使用。',
    'spell-2024-fire-bolt'),
  auFeat('arcane-safeguard', '奥法护佑者', 'Arcane Safeguard',
    '戏法：你习得戏法「抵抗术」，施法属性于选取时从智力、感知、魅力中选择；你还能以附赠动作施展「抵抗术」，可用次数等于你的熟练加值，完成长休时重获全部次数。庇护之援：当你执行协助动作辅助盟友的属性检定时，该盟友获得等于你熟练加值的临时生命值。',
    'spell-2024-resistance'),
  auFeat('arcane-undertaker', '奥法殡葬师', 'Arcane Undertaker',
    '戏法：你习得一道自选的牧师或法师死灵学派戏法，施法属性于选取时从智力、感知、魅力中选择。源死之识：当你进行智力（历史）或感知（医药）检定时，可投掷 1d4 并将骰值加入该属性检定。晓亡之理：当你执行协助动作稳定一名 0 生命值生物的伤势时获得英雄激励；此增益一经使用，直至完成长休都无法再次使用。',
    '', [NECROMANCY_CANTRIP_CHOICE]),
  auFeat('familiar-friend', '魔宠密友', 'Familiar Friend',
    '忠实伙伴：你始终准备着法术「寻获魔宠」，施法属性于选取时从智力、感知、魅力中选择；你可无需法术位与材料成分地施展该法术一次，完成长休时重获；也能以任意法术位施展。强韧魔宠：当你施展「寻获魔宠」时，魔宠的生命值上限与当前生命值提升等于你角色等级两倍的数值。得力助手：当你使用已熟练的技能进行属性检定且魔宠位于你 5 尺内时，该检定具有优势；可用次数等于你的熟练加值，完成长休时重获全部次数。',
    'spell-2024-find-familiar'),
  auFeat('portal-jumper', '穿界者', 'Portal Jumper',
    '异界抗性：你具有暗蚀、心灵或光耀之一的伤害抗性（选取时决定）。穿界步：你能消耗 15 尺移动力传送至 15 尺内一处你可见的未占据空间；可用次数等于你的熟练加值，但每回合限一次，完成长休时重获全部次数。',
    '', [RESISTANCE_CHOICE]),
  auFeat('transmuted-anatomy', '万化本质', 'Transmuted Anatomy',
    '大步流星：你的速度提升 5 尺。强韧内构：你对抗将迫使你违背意愿变形的效应时进行的豁免具有优势。此外，当你的体质豁免失败时，你能以反应投掷 1d4 并将骰值加入该豁免总值（可能使失败改为成功）；可用次数等于你的熟练加值，完成长休时重获全部次数。',
    ''),
]
