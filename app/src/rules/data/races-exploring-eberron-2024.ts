import type { RaceRule } from '@/types/rules'

/**
 * 《探秘艾伯伦》（Exploring Eberron，第三方合作内容）第六章「种族」2024 写法物种 9 条
 * （8 个主项 ＋ 1 个变体条目）。
 *
 * ## 来源与登记口径
 * - 来源 ID：`source-2024-tp-exploring-eberron`（2024 注册表 `sources-2024.ts` X02 段，
 *   `contentKind: 'third-party'`、`defaultEnabled: false`，界面显示「合作内容，需 DM 同意」）。
 *   任务书原写「来源固定 `tp-exploring-eberron-index`」，但该 ID 在两个来源注册表中都不存在；
 *   `tp-*-index` 是 **2014 注册表**的命名，挂在 2024 仓库会导致条目永久不可达
 *   （由 `source-reference-integrity` / `third-party-source-gating` 用例守卫，参见
 *   `races-crooked-moon-2024.ts` 中 `tp-valdas-spire-index` 的同类说明）。
 *   故本模块统一使用仓库已注册的 2024 侧 ID `source-2024-tp-exploring-eberron`，
 *   与同书背景条目（`origins-2024.ts` 的幻身灵旅者／马伦蒂）及同书起源专长
 *   （`third-party-feats-2024.ts`）保持一致。
 * - 规则集 `5e-2024`、状态一律 `selectable`；**2024 物种不授予属性加值**，
 *   故 `fixedAbilityBonuses` 全部为 `{}`，属性加值来自出身（背景）分配。
 * - ID 前缀 `species-2024-ee-<slug>`。
 * - 全部内容依据本地 CHM v2026.09.13 对应 section 正文实读后**原创中文转述**：
 *   只保留生物类型／体型／速度／感官／特质要点与必要的情境限制，不抄录原文句子与叙事背景。
 *
 * ## 4916／4933 属**背景**，不在本模块登记
 * CHM 4916（幻身灵旅者 Changeling Traveler）与 4933（马伦蒂 Malenti）给出的是
 * 「属性值／专长／技能／工具／装备」背景结构，属**背景**而非种族，本文件不登记。
 * 二者此前在仓库中被错挂在德拉肯海姆（`source-2024-tp-drakkenheim`）／斯坦哈德
 * （`source-2024-tp-steinhardt`）来源下，现已按 X02 来源修正改为
 * `source-2024-tp-exploring-eberron`（见 `origins-2024.ts` 中
 * `background-2024-tp-changeling-traveler` 与 `background-2024-tp-malenti`）。
 *
 * ## CHM 标题与文件名对调（闭环证据）
 * 达坎三族中 4927／4929 的 **CHM `title` 与 `md_path`／`html_path` 文件名互相对调**，
 * 只有正文标题行与特质表是可信的：
 * - section 4927：`title` = 「达坎哥林达（大地精）」，但 `md_path` =
 *   `第三方_探秘艾伯伦_第六章_达坎伽珥达（大地精）.md`，正文标题行 =
 *   「达坎伽珥达（大地精）Dhakaani Ghaal'dar (Hobgoblins)」→ 大地精种族为 **伽珥达
 *   Ghaal'dar**，中文名取「达坎伽珥达」，slug `ghaal-dar`。
 * - section 4929：`title` = 「达坎伽珥达（地精）」，但 `md_path` =
 *   `第三方_探秘艾伯伦_第六章_达坎哥林达（地精）.md`，正文标题行 =
 *   「达坎哥林达（地精）Dhakaani Golin'dar (Goblins)」→ 地精种族为 **哥林达
 *   Golin'dar**，中文名取「达坎哥林达」，slug `golin-dar`。
 * 即：`title` 字段与文件名各自被对方的名字覆盖；以正文英文名为准，4927 是大地精、
 * 4929 是地精，本文件据此登记，未沿用 CHM `title` 的错误写法。
 *
 * ## 字段取舍说明（不新增字段）
 * - `naturalAttack` 只存在于 `RaceFeature`（`types/rules.ts`），**不是** `RaceRule` 字段，
 *   故鬣狗人的啃咬只能写入 `description`，不进入武器攻击自动结算。
 * - 鲨华鱼人的天生护甲使用 `RaceRule.naturalArmor`（12 + 敏捷、未着甲时生效、盾牌不受限）。
 * - 长肢触及 +5 尺、横行、嗜血狂怒、团结之力、强者后援等无可对应字段，一律写入 `description`。
 */
const ee = ['source-2024-tp-exploring-eberron'] as const
const ABILITY = ['int', 'wis', 'cha'] as const

const eeSpecies = (
  slug: string,
  name: string,
  englishName: string,
  summary: string,
  description: string,
  extra: Partial<RaceRule> = {},
): RaceRule => ({
  id: `species-2024-ee-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  summary,
  description,
  subraceIds: [],
  fixedAbilityBonuses: {},
  recommendedClassIds: [],
  status: 'selectable',
  sourceIds: ee,
  ...extra,
})

export const exploringEberronSpecies2024: readonly RaceRule[] = [
  eeSpecies('kalamer-landwalker', '卡拉默陆行者（人鱼）', 'Kalamer Landwalker',
    '元素人鱼：陆地行走形态与克洛卡拉学识。',
    '生物类型：元素；中型（约 5—7 尺高）；速度 10 尺，游泳速度 40 尺。黑暗视觉 60 尺。两栖：可以在空气与水中呼吸。海之祝福：你拥有天生的人鱼形态与陆行者形态两种形态；以一个魔法动作在两者间切换，进入陆行者形态时鱼尾分化为两条腿，速度提升 20 尺（变为 30 尺）而游泳速度降为 0；再以一个魔法动作可回到人鱼形态，新形态一直维持到你主动切换。克洛卡拉学识：获得自然、表演或求生之一的技能熟练。正文另列的「迅捷泳者」（游泳速度等于速度）与海之祝福给出的形态数值直接冲突，原书译注亦自承疑似错印冗余，故不写入自动计算；本条目只登记特质行给出的游泳速度 40 尺。本物种不授予属性加值。',
    {
      size: 'medium',
      speed: 10,
      swimSpeed: 40,
      darkvision: 60,
      skillProficiencyChoices: { count: 1, optionIds: ['skill-nature', 'skill-performance', 'skill-survival'] },
    }),
  eeSpecies('ruinbound', '厄兆者', 'Ruinbound',
    '异界共生体：120 尺黑暗视觉、共生体精通与毒素抗性。',
    '生物类型：类人；体型为中型（约 4—7 尺高）或小型（约 2—4 尺高），创建时选择；速度 30 尺。黑暗视觉 120 尺。独有共生体：你与一个无法剥离的异界实体永久共生，该共生体也是你以此施展法术时可见的源头；从酸液飞溅、神导术（仅自身）、光亮术、法师之手、心灵之楔、毒气喷涌、抵抗术（仅自身）、电爪、荆棘之鞭中选一项戏法，每次完成长休后可换为列表中的另一项；施法属性为创建时选择的智力、感知或魅力。共生体精通：可以额外同调一件具有共生体词条的魔法物品，该次同调不占用你的同调数量上限；每次完成长休时可以结束对一件共生体魔法物品的同调；若某效果要求以你为移除诅咒之类法术的目标才能剥离共生体，你可以无视该限制。异质坚韧：具有毒素伤害抗性，且为避免或结束中毒状态而进行的豁免具有优势。共生体外观由你与 DM 共同商定；1d8 厄兆突变表所列 8 项突变纯属外观描写，不提供任何机械增益。本物种不授予属性加值。',
    {
      sizeChoices: ['small', 'medium'],
      speed: 30,
      darkvision: 120,
      damageResistances: ['毒素'],
      spellcastingAbilityChoices: ABILITY,
    }),
  eeSpecies('jhorgun-taal', '约衮塔珥（半兽人）', "Jhorgun'taal",
    '阴影边地的两种血脉：坚韧不屈与多才多艺。',
    '生物类型：类人；中型（约 5—7 尺高）；速度 30 尺。黑暗视觉 60 尺。坚韧不屈：当你的生命值降至 0 且没有立即死亡时，可以改为使生命值降至 1；此特质一经使用，须完成长休才能再次使用。多才多艺：创建角色时额外获得一项自选的起源专长。本物种不授予任何属性加值，属性加值来自出身（背景）分配。',
    {
      size: 'medium',
      speed: 30,
      darkvision: 60,
      // 与 2024 人类「多才多艺」同一模型：走起源专长池任选，结果存入种族检查点。
      originFeatChoices: { count: 1, categories: ['origin'] },
    }),
  eeSpecies('ghaal-dar', '达坎伽珥达（大地精）', "Dhakaani Ghaal'dar",
    '达坎大地精：纪律、团结之力与战争与和平。',
    '生物类型：类人；中型（约 5—6 尺高）；速度 30 尺。黑暗视觉 60 尺。纪律严明：为避免或结束魅惑状态而进行的豁免具有优势。团结之力：当你在一次 D20 检定中失败时，可以在该次检定上获得等于 30 尺内可见盟友数量的加值（最高 +5）；此特质一经使用，须完成短休或长休才能再次使用。战争与和平：从运动、历史、威吓、表演中选择两项获得技能熟练。本物种不授予属性加值。',
    {
      size: 'medium',
      speed: 30,
      darkvision: 60,
      skillProficiencyChoices: { count: 2, optionIds: ['skill-athletics', 'skill-history', 'skill-intimidation', 'skill-performance'] },
    }),
  eeSpecies('guul-dar', '达坎古珥达（熊地精）', "Dhakaani Guul'dar",
    '达坎熊地精：勇气、长肢与强者后援。',
    '生物类型：类人；中型（约 6—8 尺高）；速度 30 尺。黑暗视觉 60 尺。勇气：为避免或结束恐慌状态而进行的豁免具有优势。长肢：当你在自己的回合进行近战攻击时，触及范围比通常多 5 尺。身强力壮：为结束自身受擒状态而进行的属性检定具有优势；计算载重时视为大一级的体型。强者后援：当一名位于你 30 尺内的可见盟友为避免或终止恐慌状态而进行的豁免失败时，你可以用反应使其重掷该豁免。本物种不授予属性加值。',
    {
      size: 'medium',
      speed: 30,
      darkvision: 60,
    }),
  eeSpecies('golin-dar', '达坎哥林达（地精）', "Dhakaani Golin'dar",
    '达坎地精：小型迅捷、纪律严明与天生善匿。',
    '生物类型：类人；小型（约 3—4 尺高）；速度 35 尺。黑暗视觉 60 尺。纪律严明：为避免或结束魅惑状态而进行的豁免具有优势。天生善匿：当体型比你大的生物为你提供遮蔽时，你可以尝试执行躲藏动作。灵巧：你可以移动穿过任何体型大于你的生物所占据的空间，但不能在其中停止。本物种不授予属性加值。',
    {
      size: 'small',
      speed: 35,
      darkvision: 60,
    }),
  eeSpecies('aasimar-variants', '阿斯莫变体（艾伯伦）', 'Fernian / Mabaran Aasimar',
    '阿斯莫变体：费尼亚的异界之火与玛巴尔的阴影绝望，只替换指定特性。',
    '本条目是变体登记，不构成独立物种：生物类型、体型（小型或中型二选一）、速度、黑暗视觉 60 尺、治愈之手与 3 级天启的使用方式，一律沿用项目既有的 2024 阿斯莫基础条目（ID：species-2024-aasimar）；本条只登记被替换的特性，且不与基础条目中被替换掉的那条特性叠加。费尼亚阿斯莫：阿斯莫之力来自费尼亚，你被注入异界之火。以「费尼亚抗性」替换基础条目的天界抗性——获得火焰与暗蚀伤害抗性，不再具有光耀抗性；以「焰焱掌者」替换基础条目的光明使者（光辉掌者）——知晓戏法燃火术，施法属性为创建时选择的智力、感知或魅力。另有外观与伤害类型变化：天启期间天堂飞翼由火焰构成、死灵环绕化作幽火之环，内耀辉光造成的伤害由光耀改为火焰。玛巴尔阿斯莫：阿斯莫之力来自玛巴尔，与阴影和绝望紧密相连，因此保留基础条目的天界抗性（仍为暗蚀与光耀）。以「告死信使」替换基础条目的光明使者（光辉掌者）——知晓戏法亡者丧钟，施法属性为创建时选择的智力、感知或魅力；以「内隐深暗」替换天启中的内耀辉光选项——显化期间你吞噬光明与生命，把半径 20 尺内的明亮光照削弱为微光光照，并在你每个回合结束时令你 10 尺内的每个生物受到等于你熟练加值的暗蚀伤害。两变体均不授予属性加值。',
    {
      countsAsRaceIds: ['species-2024-aasimar'],
      spellcastingAbilityChoices: ABILITY,
    }),
  eeSpecies('gnoll', '鬣狗人', 'Gnoll',
    '鬣狗人：啃咬天生武器、猎手感官与横行。',
    '生物类型：类人；中型（约 7—8 尺高）；速度 30 尺。黑暗视觉 60 尺。啃咬：你的牙齿是天生武器，可以用其进行徒手打击；命中时造成 1d6 + 力量调整值的穿刺伤害，代替徒手打击通常的钝击伤害。猎手感官：获得察觉、隐匿或求生之一的技能熟练。横行：当你用啃咬把一名生物降至 0 生命值，或用一次攻击把一名生物降至 0 生命值时，可以用附赠动作移动至多等于你速度一半的距离，并发动一次武器攻击或用啃咬发动一次徒手打击。本物种不授予属性加值。物种条目没有天生武器字段，故啃咬只按文字登记，不进入武器攻击的自动结算。',
    {
      size: 'medium',
      speed: 30,
      darkvision: 60,
      skillProficiencyChoices: { count: 1, optionIds: ['skill-perception', 'skill-stealth', 'skill-survival'] },
    }),
  eeSpecies('sahuagin', '鲨华鱼人', 'Sahuagin',
    '鲨华鱼人：120 尺黑暗视觉、嗜血狂怒与天生护甲。',
    '生物类型：类人；中型（约 5—7 尺高）；速度 30 尺，游泳速度等于步行速度。黑暗视觉 120 尺。嗜血狂怒：可以附赠动作进入持续 1 分钟的嗜血狂怒；期间你对任何生命值未满的生物进行的攻击检定具有优势；可用次数等于熟练加值，完成一次长休后恢复全部已消耗的次数。天生护甲：坚韧的鳞质皮肤使你在未着装任何护甲时基础护甲等级为 12 + 敏捷调整值；使用盾牌不影响该收益。有限两栖：你能在水和空气中呼吸，但必须至少每 4 小时浸入水中一次，否则离开水后有窒息风险。本物种不授予属性加值。',
    {
      size: 'medium',
      speed: 30,
      swimSpeed: 30,
      darkvision: 120,
      naturalArmor: { base: 12, addsDexterity: true, requiresUnarmored: true },
    }),
]
