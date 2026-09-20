import type { FeatRule } from '@/types/rules'

/**
 * G3 批次 G3-E：第三方起源／位面契约专长。
 *
 * - **吸血鬼：避世潜藏-血之缚**（VtM 联名，2024 写法）5 条，来源 `source-2024-tp-vtm`；
 * - **斯坦哈德**（第三方，2024 写法）2 条，来源 `source-2024-tp-steinhardt`；
 * - **Beyond Drops 26.5**（试行内容）4 条位面契约／衍生通用专长，来源 `source-2024-tp-beyond-drops`。
 *
 * 登记口径：
 * - 中英文名与全部增益项取自 CHM v2026.09.13 对应章节原文，未回译；
 * - 第三方专长条目状态 `selectable`，界面按「合作内容，需 DM 同意」呈现；
 * - Beyond Drops 为线上试行内容，下游背景已按 `dm-only` 登记，其专长同样标注试行；
 * - 「薄血」按原书为「可替代任何起源专长」，作为避世潜藏各背景的二选一候选项登记。
 */
const vtm = ['source-2024-tp-vtm'] as const
const steinhardt = ['source-2024-tp-steinhardt'] as const
const beyondDrops = ['source-2024-tp-beyond-drops'] as const

const thirdPartyFeat = (
  sourceIds: readonly string[],
  slug: string,
  name: string,
  englishName: string,
  detail: string,
  extra: Pick<FeatRule, 'choices' | 'grantedSpells' | 'category'> = {},
): FeatRule => ({
  id: `feat-2024-tp-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  description: detail.split('。')[0] ?? detail,
  detail,
  tags: ['起源'],
  category: 'origin',
  status: 'selectable',
  sourceIds,
  ...extra,
})

export const vtmOriginFeats2024: readonly FeatRule[] = [
  thirdPartyFeat(vtm, 'healthy', '康健', 'Healthy',
    '生命骰运用：当你首次在完成短休或长休后将要消耗生命值骰时，你直接获得消耗该生命骰的增益，但无需实际消耗它。豁免熟练：选择一项你尚未获得豁免熟练的属性，你获得该属性的豁免熟练。'),
  thirdPartyFeat(vtm, 'nocturnal', '夜行', 'Nocturnal',
    '黑暗视觉：你具有 60 尺黑暗视觉；若你已拥有黑暗视觉，其范围增加 30 尺。潜隐暗影：若你身处微光光照或黑暗环境中，每当你进行敏捷（隐匿）检定时，可将 d20 投出的 9 或更低结果视为 10。'),
  thirdPartyFeat(vtm, 'protected', '受护', 'Protected',
    '好运点：你具有数量等于熟练加值的好运点，完成长休时重获全部已消耗点数。重掷：每当你进行一次 D20 检定且 d20 掷出 9 或更低时，可消耗 1 好运点重掷该 d20，且必须接受第二次结果。稳定：当你的生命值降至 0 且未被立即杀死时，可消耗 1 好运点使生命值改为降至 1。'),
  thirdPartyFeat(vtm, 'well-read', '博学', 'Well-Read',
    '生物学识：当你投掷先攻时，可回想起 30 尺内一名可见生物的相关学识，知晓其一项免疫、抗性、易伤或特质（由你决定知晓哪一项）。实用智库：当你的智力（奥秘或历史）检定掷出 1 时，你可重掷该骰并必须使用新结果。稀世秘闻：若你成功进行一次智力（奥秘或历史）检定，你会获得额外学识，内容由 DM 决定（可能以隐喻或诗歌形式呈现）。'),
  thirdPartyFeat(vtm, 'thin-blooded', '薄血', 'Thin-Blooded',
    '原书说明：本专长**可替代任何起源专长**被选择，故同时作为避世潜藏各背景的二选一候选。吸血能力：你能以动作吸食 5 尺内生物的血液（目标需自愿、被你魅惑，或处于失能／受擒／麻痹／束缚／震慑／昏迷），每回合仅一次；你具有 2d6 血饲骰，吸血时投掷不超过上限的血饲骰并加体质调整值（至少 1），目标受到等量暗蚀伤害且生命值上限同等减少；血饲骰掷出 6 或目标生命值上限降至 0 时，你重获 1 点已消耗的鲜血点。自愿饲血：吸食自愿或被你魅惑的生物时，其可消耗 1 枚生命骰以降低等量生命值上限，你重获 1 点鲜血点，且不会终止魅惑。生命骰告罄：目标无剩余生命骰时，其受到等于血饲骰骰值加体质调整值的暗蚀伤害且上限同等减少。血饲成功上限：鲜血点按体型提供（小型 1／中型 3／大型 5／巨型 7／超巨型 10），生物完成长休时重获全部。可吸血生物：具有血液或其他维生体液的生物（异怪、野兽、龙类、妖精、巨人、怪兽、类人最常见；构装、元素、泥怪与植物通常无血），具体由 DM 裁定。似血非血：选取血族专长时无视血族职业先决，但无法获得血族职业等级。血族绯血：你具有的鲜血点数量等于熟练加值减一。超自然施法：血族专长法术以魅力为施法属性，无需言语与姿势成分，材料成分除非被消耗或在法术中详述否则也无需，且受到伤害不会打断专注。代价：你对火焰与光耀伤害具有**易伤**；当你被造成穿刺伤害的木质武器攻击且生命值降至 0 或该攻击重击时，心脏被木桩穿过，你陷入麻痹直至武器移除。'),
]

export const steinhardtOriginFeats2024: readonly FeatRule[] = [
  thirdPartyFeat(steinhardt, 'faithful', '虔信', 'Faithful',
    '神清圣明：若你对抗魅惑或恐慌状态的豁免失败，你可选择改为成功；此增益一经使用，直至完成长休都无法再次使用。信仰试炼：每当你的 D20 检定掷出 1 时，你获得英雄激励。'),
  thirdPartyFeat(steinhardt, 'grizzled', '霜鬓', 'Grizzled',
    '克服：每当你对抗恐慌状态进行豁免检定时，该豁免获得等于你熟练加值的加值。求生：你维持生存所需的食物和饮水减半，且为搜寻食物和饮水进行的感知（生存）检定具有优势。耐受（Withstand）：每当你进入浴血时，你获得英雄激励。'),
]

export const beyondDropsFeats2024: readonly FeatRule[] = [
  thirdPartyFeat(beyondDrops, 'fey-pact', '妖精契约', 'Fey Pact',
    '位面契约专长（先决：不具有其他位面契约专长）。妖精连结：你习得木族语；若选取时已习得木族语，可从《玩家手册》语言表另选一门语言，并额外获得自然技能熟练。妖精戏法：你知晓戏法「德鲁伊伎俩」以及另一个预言或惑控学派的戏法，施法属性于选取时从感知、智力、魅力中选择。甜言蜜语：当你为魅力（欺瞒或游说）检定失败时，可重骰该检定并必须使用新结果；一旦以此增益把一次失败改为成功，直至完成长休都无法再次使用。试行内容（Beyond Drops 26.5），需 DM 同意。',
    { grantedSpells: [{ spellId: 'spell-2024-druidcraft', alwaysPrepared: true }] }),
  thirdPartyFeat(beyondDrops, 'infernal-pact', '地狱契约', 'Infernal Pact',
    '位面契约专长（先决：不具有其他位面契约专长）。地狱抗性：你获得对火焰**或**毒素伤害的抗性（选取时决定）。地狱视界：你获得 30 尺黑暗视觉，且不受魔法黑暗阻碍。伶牙俐齿：你获得欺瞒技能熟练。试行内容（Beyond Drops 26.5），需 DM 同意。'),
  thirdPartyFeat(beyondDrops, 'fey-sentinel', '妖精哨卫', 'Fey Sentinel',
    '通用专长（先决：等级 4+，且已获得妖精契约专长）。属性值提升：你的智力、感知或魅力提升 1，至多 20。匿踪目标：当一名敌人对你的攻击检定失手时，你能以反应获得隐形状态直至你的下个回合开始（或在攻击、造成伤害、施法后提前终止）；此增益一经使用，直至完成长休都无法再次使用。妖精传送：当你执行疾走动作时，可放弃额外移动力，传送至多等于你速度一半的距离至一处你能看见且未被占据的空间。自然根系：你始终准备着法术「纠缠术」，可无需法术位施展一次并在完成长休后重获，也能以任意合适环阶法术位施展；施法属性为通过本专长提升的属性。当你的角色等级到达 5 级时，你始终准备着「植物滋长」并可用相同方式施展。试行内容（Beyond Drops 26.5），需 DM 同意。',
    { category: 'general', grantedSpells: [
      { spellId: 'spell-2024-entangle', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
      { spellId: 'spell-2024-plant-growth', alwaysPrepared: true, minimumLevel: 5 },
    ] }),
  thirdPartyFeat(beyondDrops, 'infernal-bulwark', '地狱守卫', 'Infernal Bulwark',
    '通用专长（先决：等级 4+，且已获得地狱契约专长）。属性值提升：你的体质或魅力提升 1，至多 20。魔鬼血肉：你的皮肤变厚并呈鳞片皮革质感；若你未着装护甲且未持用盾牌，基础护甲等级等于 10 + 敏捷调整值 + 本专长提升属性的调整值。地狱守护：你始终准备着「黯冰狱铠」，可无需法术位施展一次并在完成长休后重获；以此方式施展时使用二环版本且造成**火焰**伤害而非寒冷，也能以任意合适环阶法术位施展；魅力为该法术施法属性。复仇如潮：当 60 尺内一名可见生物迫使你进行豁免检定时，你能以反应对其造成 1d10 火焰伤害；可用次数等于熟练加值，完成长休时重获全部次数。试行内容（Beyond Drops 26.5），需 DM 同意。',
    { category: 'general', grantedSpells: [{ spellId: 'spell-2024-armor-of-agathys', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' }] }),
  thirdPartyFeat(beyondDrops, 'infernal-dragoon', '地狱怖兵', 'Infernal Dragoon',
    '通用专长（先决：等级 4+，且已获得地狱契约专长）。属性值提升：你的体质或魅力提升 1，至多 20。魔鬼灵光：你能以魔法动作显化覆盖自身 30 尺光环的恐惧灵光，区域内每个由你选择的生物需进行一次魅力豁免（DC = 8 + 本专长提升属性的调整值 + 熟练加值），失败则恐慌直至其下个回合结束；成功者不受影响并在 24 小时内免疫。魔鬼偏爱：你能呼唤地狱宗主援助，在一次 D20 检定上添加 +2 加值；此增益一经使用，直至完成长休都无法再次使用。险恶赋能：你始终准备着「魔化武器」，可无需法术位施展一次并在完成长休后重获，以此方式施展时持续时间变为 8 小时，也能以任意合适环阶法术位施展；魅力为该法术施法属性。试行内容（Beyond Drops 26.5），需 DM 同意。',
    { category: 'general', grantedSpells: [{ spellId: 'spell-2024-magic-weapon', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' }] }),
]

/** 避世潜藏 5 条起源专长的稳定 ID（供背景二选一候选引用）。 */
export const VTM_FEAT_IDS: readonly string[] = vtmOriginFeats2024.map((feat) => feat.id)

/** 斯坦哈德 2 条起源专长 ID。 */
export const STEINHARDT_FEAT_IDS: readonly string[] = steinhardtOriginFeats2024.map((feat) => feat.id)
