import type { FeatRule, RuleOption } from '@/types/rules'

/**
 * 《鸦阁魔域：魔障深藏》（Ravenloft: The Horrors Within 2025）第一章**黑暗赠礼专长**（G3 批次 G3-D）。
 *
 * 9 条，均取自 CHM v2026.09.13 `鸦阁魔域：魔障深藏_第一章_黑暗赠礼.md`，
 * 中英文名与全部增益项以 CHM 原文为准。登记口径：
 * - `category: 'dark-gift'`（G3-A 新增类别），来源 `source-2024-rthw`；
 * - 原书规则：在 DM 允许下，每当你获得起源类别专长时可改为获得黑暗赠礼专长；
 *   该书 4 条背景即「起源专长**或**一项黑暗赠礼专长」，故同时作为背景的二选一候选；
 * - **每条都带代价**（掷出 1 后的失控效应、死亡豁免劣势、被探知劣势等），
 *   `detail` 必须完整写出代价，避免被当成纯增益；
 * - 「施法属性三选一」「技能／专精自选」「额外语言」按原书登记：可枚举的用 `choices`，
 *   语言因项目无语言选项 ID 而以文字登记。
 */
const ravenloft = ['source-2024-rthw'] as const

/** 黑暗赠礼通用的施法属性候选（汇灵低语、活体阴影、第二面目、死亡之触）。 */
const SPELL_ABILITY_CHOICE = {
  id: 'rthw-spellcasting-ability',
  title: '选择施法属性',
  description: '选择智力、感知或魅力作为该专长法术的施法属性。',
  minSelections: 1,
  maxSelections: 1,
  optionIds: ['spell-ability-int', 'spell-ability-wis', 'spell-ability-cha'],
} as const

const SKILL_IDS_2024 = [
  'skill-arcana', 'skill-deception', 'skill-history', 'skill-intimidation', 'skill-insight',
  'skill-investigation', 'skill-nature', 'skill-religion', 'skill-perception', 'skill-persuasion',
] as const

const darkGiftFeat = (
  slug: string,
  name: string,
  englishName: string,
  detail: string,
  extra: Pick<FeatRule, 'choices' | 'grantedSpells'> = {},
): FeatRule => ({
  id: `feat-2024-rthw-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  description: detail.split('。')[0] ?? detail,
  detail: `${detail}（先决：鸦阁战役；需 DM 允许——本专长用于替换一项起源专长或由 DM 在冒险中赠予。）`,
  tags: ['黑暗赠礼'],
  category: 'dark-gift',
  status: 'selectable',
  sourceIds: ravenloft,
  // 「每当你获得起源类别的专长时可改为获得黑暗赠礼专长」→ 同一角色不重复拿多项黑暗赠礼。
  prerequisite: { excludedFeatTag: '黑暗赠礼' },
  ...extra,
})

export const ravenloftDarkGiftFeats2024: readonly FeatRule[] = [
  darkGiftFeat('aberrant-anatomy', '异变内构', 'Aberrant Anatomy',
    '无呼无息：你可以屏息一小时。超感知觉：若你不具有察觉技能的熟练，你获得之，并获得该技能的专精；此外你具有 15 尺盲视。血肉扭曲（代价）：在你进行一次 D20 检定且 d20 掷出 1 后，你感染的异常力量立即爆发，你立即进行一次体质豁免（DC = 13 + 你的熟练加值），失败则陷入震慑状态直至你的下个回合结束。'),
  darkGiftFeat('echoing-soul', '灵魂回响', 'Echoing Soul',
    '通灵之力：你获得两项自选技能的熟练，并选择一项已熟练的技能获得专精；每完成长休可改变本增益的选择。原初之舌：你知晓一门自选额外语言。回响之袭（代价）：在你进行一次 D20 检定且 d20 掷出 1 后，另一世的记忆涌上心头，你立即进行一次体质豁免（DC = 13 + 你的熟练加值），失败则陷入失能直至你的下个回合结束，失能期间你的速度减半。',
    { choices: [
      { id: 'rthw-echoing-skills', title: '选择两项技能熟练', description: '获得两项自选技能的熟练。', minSelections: 2, maxSelections: 2, optionIds: SKILL_IDS_2024 },
      { id: 'rthw-echoing-expertise', title: '选择一项专精', description: '选择一项你具有熟练的技能获得专精（长休可改）。', minSelections: 1, maxSelections: 1, optionIds: [], candidateKind: 'proficient-skills' },
    ] }),
  darkGiftFeat('gathered-whispers', '汇灵低语', 'Gathered Whispers',
    '精魂低语：你习得戏法「传讯术」且无需材料成分施展；此外你始终准备着法术「卜筮术」，可无需法术位与法术成分施展一次，完成长休后重获，也能以任意环阶法术位施展；施法属性于选取时从智力、感知、魅力中选择。怪谲尖嚎：当你被一次攻击检定命中时，你能以反应将熟练加值加入对抗该次攻击的 AC（可能使之失手），可用次数等于熟练加值，完成长休时重获全部次数。彼岸之声（代价）：在你进行一次 D20 检定且 d20 掷出 1 后，你立即进行一次感知豁免（DC = 13 + 你的熟练加值），失败则陷入耳聋直至你的下个回合结束，耳聋期间你的属性与攻击检定具有劣势。',
    { choices: [SPELL_ABILITY_CHOICE], grantedSpells: [
      { spellId: 'spell-2024-message', alwaysPrepared: true },
      { spellId: 'spell-2024-augury', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
    ] }),
  darkGiftFeat('living-shadow', '活体阴影', 'Living Shadow',
    '攫取之影：你习得戏法「法师之手」且无需成分施展；施法属性于选取时从智力、感知、魅力中选择。延伸打击：当你作为攻击或魔法动作的一部分进行近战攻击检定时，你的影子伸长协助你，该次攻击触及范围提升 10 尺；可用次数等于熟练加值，完成长休时重获全部次数。不祥意志（代价）：在你进行一次 D20 检定且 d20 掷出 1 后，你立即进行一次感知豁免（DC = 13 + 你的熟练加值），失败则陷入失能直至你的下个回合开始；下个回合开始时须投掷「阴影意志」表（1d8）决定该回合行动（1 只移动并随机方向；2—6 对触及内随机生物发动一次近战攻击；7—8 倒地并结束回合）。',
    { choices: [SPELL_ABILITY_CHOICE], grantedSpells: [{ spellId: 'spell-2024-mage-hand', alwaysPrepared: true }] }),
  darkGiftFeat('mist-walker', '迷雾行者', 'Mist Walker',
    '领域旅者：当你进入迷雾意图到达某个特定领域时，你视为持有绑定该领域的迷雾护符；你需知晓目的地领域名称，但无需曾到访；无法绕过因黑暗领主意志封闭的领域边界。迷雾行走：当你受到伤害，或为避免／结束擒抱与束缚状态的豁免失败时，你能以反应传送至多 15 尺至一处你可见的未占据空间；可用次数等于熟练加值，完成长休时重获全部次数。毒害根源（代价）：当你完成长休时，你半径 10 里的世界变为吸取你生命的虹吸器；此后在该区域内每完成一次短休，你进行一次体质豁免（DC = 13 + 你的熟练加值），失败则不会因此次休息获得增益。'),
  darkGiftFeat('second-skin', '第二面目', 'Second Skin',
    '后备形貌：你始终准备着法术「变身术」，可无需法术位与法术成分施展一次，完成长休后重获，也能以任意合适环阶法术位施展；施法属性于选取时从智力、感知、魅力中选择；以此方式施展时该法术无需专注。被迫改变（代价）：选取本专长时投「改变催化」表（1d6）决定触发因素（月相／花香／钟声／旋律／纯银／相似之人）；经历催化后，在你的下个回合开始时进行一次魅力豁免（DC = 13 + 你的熟练加值），失败则立即以免法术位方式施展「变身术」；若该使用权已消耗，则改为陷入震慑直至你的下个回合开始。',
    { choices: [SPELL_ABILITY_CHOICE], grantedSpells: [{ spellId: 'spell-2024-alter-self', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' }] }),
  darkGiftFeat('symbiotic-being', '共生存在', 'Symbiotic Being',
    '交缠存在：共生体无法被指定为目标；若你死亡共生体也死亡，若你重获生命共生体也复活。第二心智：你获得奥秘、欺瞒、历史、威吓、洞悉、调查、自然、宗教、察觉或游说之一的技能熟练，并知晓一门自选额外语言。恒久共生：当你的豁免检定失败时，你能以反应消耗一枚生命骰，投掷并把骰值加入该豁免（可能使之成功）；可用次数等于熟练加值，完成长休时重获全部次数。共生目标（代价）：在你进行一次 D20 检定且 d20 掷出 1 后，你立即进行一次魅力豁免（DC = 13 + 你的熟练加值），失败则陷入魅惑 1d12 小时；魅惑期间须尝试服从共生体的命令并推进其计划（由 DM 决定）；每当你受到伤害时可重复豁免，成功则提前终止；违背其计划时 DM 也可要求你进行此豁免。',
    { choices: [
      { id: 'rthw-symbiotic-skill', title: '选择技能熟练', description: '获得奥秘、欺瞒、历史、威吓、洞悉、调查、自然、宗教、察觉或游说之一的熟练。', minSelections: 1, maxSelections: 1, optionIds: SKILL_IDS_2024 },
    ] }),
  darkGiftFeat('touch-of-death', '死亡之触', 'Touch of Death',
    '触死之亡：你习得戏法「颤栗之触」且无需成分施展；以该法术造成的暗蚀伤害忽视抗性；施法属性于选取时从智力、感知、魅力中选择。坟冢之引（代价）：你的死亡豁免具有劣势。',
    { choices: [SPELL_ABILITY_CHOICE], grantedSpells: [{ spellId: 'spell-2024-chill-touch', alwaysPrepared: true }] }),
  darkGiftFeat('watchers', '监视者', 'Watchers',
    '借目而视：你始终准备着法术「野兽感官」与「动物交谈」，可无需法术位施展每道法术各一次，完成长休后重获，也能以任意合适环阶法术位施展。疑神疑鬼：每当你执行搜索动作时，你能投掷 1d4 并将骰值加入该动作中进行的任意属性检定。无终监视（代价）：你对抗法术「探知术」的豁免具有劣势；此外在你进行一次 D20 检定且 d20 掷出 1 后，你立即进行一次感知豁免（DC = 13 + 你的熟练加值），失败则你的 D20 检定具有劣势持续 1 分钟（可在每个你的回合结束时重复豁免，成功则提前终止）。',
    { grantedSpells: [
      { spellId: 'spell-2024-beast-sense', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
      { spellId: 'spell-2024-speak-with-animals', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
    ] }),
]

/** 黑暗赠礼候选 ID 列表（供背景的 `originFeatOptions` 与规则引用使用）。 */
export const DARK_GIFT_FEAT_IDS: readonly string[] = ravenloftDarkGiftFeats2024.map((feat) => feat.id)

/** 黑暗赠礼类别说明选项（界面与资料引用）。 */
export const darkGiftCategoryNote2024: RuleOption = {
  id: 'dark-gift-note',
  name: '黑暗赠礼专长',
  description: '在 DM 允许下，每当你获得起源类别专长时，可改为获得一项黑暗赠礼专长；黑暗赠礼同时给予增益与代价。',
  status: 'selectable',
  sourceIds: ravenloft,
}
