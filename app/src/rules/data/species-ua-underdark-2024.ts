import type { RaceRule, SpeciesSpellGrant } from '@/types/rules'

/**
 * 《破解奥秘 UA：幽暗地域二期 Underdark Options 2》玩家种族 5 条（X05 批次）。
 *
 * 文章身份与登记口径：
 * - 文章身份＝**Underdark Options 2**（破解奥秘 Unearthed Arcana 系列；CHM v2026.09.13 索引节
 *   389「幽暗地域Ⅱ」即该文总引言页）。导言自述本材料**使用《玩家手册 2024》规则**，并明确标注为
 *   **游玩测试内容 This is Playtest Material**：此处选项属实验性草案、强度可能高于或低于 PHB 2024，
 *   经反馈后才可能被正式采纳。故规则集登记为 `5e-2024`、来源 `source-2024-ua-underdark`
 *   （`contentKind: 'playtest'`，默认关闭、须在来源步骤显式启用），条目 `status` 最高只到 `selectable`。
 * - 节 384 为前一篇《幽暗地域 Underdark Options》（只有子职与暗耀道途、**不含种族**），不在本文件范围。
 * - 2024 写法：物种栏位为「生物类型／体型／速度」，**通篇无固定属性加值**（2024 物种的属性来自背景），
 *   故本文件 5 条 `fixedAbilityBonuses` **一律为 `{}`**；法术授予按 2024 物种范式登记
 *   `spellGrants`（戏法＋3 级／5 级「始终准备」＋各一次免法术位施展＋长休重获）与
 *   `spellcastingAbilityChoices`（施法属性在选取种族时从智／感／魅选一）。
 * - 生物类型：`RaceRule` **没有**独立的生物类型字段（`app/src/types/rules.ts` 中不存在
 *   `creatureType` 一类字段），按 2024 物种既有约定写在 `description` 首句「生物类型：…」。
 *   蕈人为**植物**、蛛化卓尔为**怪兽**，均按 2024 术语**如实登记**，**不得改写成类人生物**——
 *   生物类型会实际影响依赖「类人生物」的法术与效果判定。
 * - 五项**全部是玩家种族**，无一属怪物数据；但**蛛化卓尔、蕈人、寇涛另有同名的官方怪物／NPC 条目**，
 *   两者须**独立登记、不合并、不覆盖**，也不共享条目 ID 与数值。
 * - 本地正文**疑似节选**（CHM v2026.09.13）：392／394／395 均未见语言等条目；393 的「第二形态」
 *   清单未展开，且正文自带译注（原文 `actions` 未大写，是否含附赠动作请自行判断）。
 *   **不得由名称或惯例补齐**，已在各条 `description` 末尾保留「待官方原文核验」标注。
 * - UA 条目按项目对第三方／UA 物种的既有口径处理（《合作与UA种族X01-X05更新计划》§2.1 第 3 条）：
 *   特性要点写进 `RaceRule.description`，**不登记 `RaceFeature`**。
 * - 内容为原创中文转述，只保留机械要点与必要的情境限制；不复制正文叙事（伊玛斯卡帝国史、
 *   寇涛造神故事、蕈人寿命与回归土壤等）。
 * - ID 核验：法术 ID 逐一核对 `app/src/rules/data/spells-2024.ts`（该模块以 `spell-2024-<slug>`
 *   生成 ID，slug 全部实际存在）——`find-familiar`（寻获魔宠）、`mage-hand`（法师之手）、
 *   `command`（命令术）、`levitate`（浮空术）、`dancing-lights`（舞光术）、`faerie-fire`（妖火）、
 *   `web`（蛛网术）。本文件不引用技能或工具 ID。
 * - 无法用现有字段表达的机制（只写入 `description`，不新增字段）：英雄激励、暗耀晶辉的光照、
 *   3 级暗耀灵光的三选一与「熟练加值一半向下取整 AC」「体质豁免 DC＝8＋魅力＋熟练」「消耗生命骰追加
 *   光耀伤害」、抗擒抱／束缚豁免优势、12 级以下的分级能力、魔宠形态与天族生物类型、通念孢子与技艺
 *   融合的临时效果、载重视为大一级体型、3 级起蜘蛛攀爬的双手空闲与天花板移动、蛛网行者。
 */

const uaUnderdark = ['source-2024-ua-underdark'] as const
const SPELL_ABILITY = ['int', 'wis', 'cha'] as const

const uaSpecies = (
  slug: string,
  name: string,
  englishName: string,
  summary: string,
  description: string,
  extra: Partial<RaceRule> = {},
): RaceRule => ({
  id: `species-2024-ua-underdark-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  summary,
  description,
  subraceIds: [],
  fixedAbilityBonuses: {},
  recommendedClassIds: [],
  status: 'selectable',
  sourceIds: uaUnderdark,
  ...extra,
})

const grant = (slug: string, minimumLevel: number, extra: Partial<SpeciesSpellGrant> = {}): SpeciesSpellGrant => ({
  spellId: `spell-2024-${slug}`,
  minimumLevel,
  alwaysPrepared: true,
  ...extra,
})

const freeOncePerLongRest = { freeCastings: 1, recovery: 'long-rest' } as const

export const uaUnderdarkSpecies2024: readonly RaceRule[] = [
  uaSpecies(
    'deep-imaskari',
    '地渊伊玛斯卡人',
    'Deep Imaskari',
    '类人；光耀抗性、每次长休获得英雄激励，3 级暗耀灵光在防护／璀璨／腐化间三选一。',
    '生物类型：类人；体型为中型（约 4—6 尺）或小型（约 2—4 尺），创建时决定；速度 30 尺。'
    + '抗光体质：具有光耀伤害抗性。'
    + '适应力：每次完成长休获得英雄激励。'
    + '暗耀晶辉：可用动作令体表晶体发出源自你的 5 尺明亮光照，直至你再用动作结束；'
    + '你死亡或陷入昏迷时同样停止。'
    + '暗耀灵光（3 级起）：可用附赠动作创造源自你、发出明亮光照的 10 尺光环，'
    + '持续 1 分钟或由你令其终止（无需动作）；'
    + '每次创造从三项中选一，用过便须完成长休才能再次使用——'
    + '防护：你与光环内盟友获得等于你熟练加值一半（向下取整）的 AC 加值；'
    + '璀璨：除盟友外，在光环区域内开始回合的生物须通过体质豁免（DC = 8 + 魅力调整值 + 熟练加值），'
    + '失败则目盲至你下回合结束；'
    + '腐化：你造成伤害时可将伤害类型改为光耀，并可掷一枚未消耗的生命骰造成等量额外光耀伤害，'
    + '随后消耗该骰。'
    + '注：本地正文未见语言条目，节选与否待官方原文核验；不补齐、不推断。',
    {
      sizeChoices: ['small', 'medium'],
      speed: 30,
      damageResistances: ['光耀'],
    },
  ),
  uaSpecies(
    'kuo-toa',
    '寇涛',
    'Kuo-toa',
    '类人；两栖且游泳速度等于速度、抗擒抱与束缚豁免优势，始终准备寻获魔宠并可选用特殊形态。',
    '生物类型：类人；中型（约 5—6 尺）；速度 30 尺。'
    + '水陆两栖：能在空气与水中呼吸，并具有等于你速度的游泳速度。'
    + '滑溜：为避免陷入或结束受擒、束缚状态而作的豁免检定具有优势。'
    + '神性显化：你始终准备「寻获魔宠」，施展该法术时无需材料成分；可不消耗法术位施展一次，'
    + '完成长休后重获该次使用。该法术的魔宠可为常规形态，或从人工生命体、蕈人幼体等特殊形态中选一；'
    + '其生物类型为天族。此外魔宠被视为多种生物的神圣融合体——你可从可用形态中再选第二种，'
    + '魔宠由此获得第二形态的一项动作、反应或特质。'
    + '注：本地正文未展开特殊形态与第二形态的完整清单，且自带译注对原文「动作」是否含附赠动作存疑，'
    + '均待官方原文核验；不补齐、不推断。',
    {
      size: 'medium',
      speed: 30,
      swimSpeed: 30,
      spellGrants: [
        grant('find-familiar', 1, {
          ...freeOncePerLongRest,
          waivesMaterialComponents: true,
          canCastWithSpellSlots: true,
          castingNote: '魔宠可为常规形态，或人工生命体／蕈人幼体等特殊形态；魔宠生物类型为天族，'
            + '并可从所选第二形态获得一项动作、反应或特质（形态清单与「动作」范围待官方原文核验）。',
        }),
      ],
    },
  ),
  uaSpecies(
    'illithidkin',
    '灵吸裔',
    'Illithidkin',
    '类人；黑暗视觉 120 尺、心灵抗性与抗魅惑豁免优势、灵能天赋法术、30 尺心灵感应。',
    '生物类型：类人；体型为中型（约 5—6 尺）或小型（约 2—4 尺），创建时决定；速度 30 尺。'
    + '黑暗视觉：120 尺。'
    + '灵能天赋：你知晓戏法「法师之手」，并能使该法术的幽灵手隐形；3 级起始终准备「命令术」，'
    + '5 级起始终准备「浮空术」；这些法术各可不消耗法术位施展一次，用掉后须完成长休才能再次以该特质施展。'
    + '以此特质施法时，智力、感知或魅力之一为你的施法属性（创建时选定）。'
    + '明晰思维：具有心灵伤害抗性，且为避免或结束魅惑状态而作的豁免检定具有优势。'
    + '心灵感应：具有 30 尺心灵感应。'
    + '注：本地正文未见语言等条目，节选与否待官方原文核验；不补齐、不推断。',
    {
      sizeChoices: ['small', 'medium'],
      speed: 30,
      darkvision: 120,
      damageResistances: ['心灵'],
      senses: ['30 尺心灵感应'],
      spellcastingAbilityChoices: SPELL_ABILITY,
      spellGrants: [
        grant('mage-hand', 1, { castingNote: '可使该法术的幽灵手隐形。' }),
        grant('command', 3, { ...freeOncePerLongRest, canCastWithSpellSlots: true }),
        grant('levitate', 5, { ...freeOncePerLongRest, canCastWithSpellSlots: true }),
      ],
    },
  ),
  uaSpecies(
    'myconid',
    '蕈人',
    'Myconid',
    '植物；黑暗视觉 120 尺与 30 尺心灵感应，通念孢子赋予群体心灵感应，长休以技艺融合分享技能熟练。',
    '生物类型：植物；体型为中型（约 4—7 尺）或小型（约 2—4 尺），创建时决定；速度 30 尺。'
    + '黑暗视觉：120 尺。'
    + '心灵感应：具有 30 尺心灵感应。'
    + '通念孢子：可用动作喷吐孢子，形成源自你的 30 尺光环区域；区域内智力值不低于 2 且非构装、'
    + '非元素、非亡灵的每个生物获得 30 尺心灵感应，持续 1 小时；使用后须完成长休才能再次使用。'
    + '技艺融合：完成长休时可举行融合仪式分享知识与经验，选择 30 尺内至多六名盟友（可包括你自己）参与，'
    + '并指定一项至少有一名参与者具备熟练的技能；每名被选中的生物获得该技能的熟练，直至其完成一次长休。'
    + '注：本地正文未见语言等条目，节选与否待官方原文核验；不补齐、不推断。'
    + '本条生物类型为植物（2024 术语），不属类人生物。',
    {
      sizeChoices: ['small', 'medium'],
      speed: 30,
      darkvision: 120,
      senses: ['30 尺心灵感应'],
    },
  ),
  uaSpecies(
    'drider',
    '蛛化卓尔',
    'Drider',
    '怪兽；载重按大一级体型计算、黑暗视觉 120 尺、蛛后法术，攀爬等于速度并有蛛网行者。',
    '生物类型：怪兽；中型（约 6—8 尺）；速度 30 尺。'
    + '蛛形体魄：计算载重时你视为大一级的体型。'
    + '黑暗视觉：120 尺。'
    + '蛛后法术：你知晓戏法「舞光术」；3 级起始终准备「妖火」，5 级起始终准备「蛛网术」；'
    + '这些法术各可不消耗法术位施展一次，用掉后须完成长休才能再次以该特质施展。'
    + '以此特质施法时，智力、感知或魅力之一为你的施法属性（创建时选定）。'
    + '蛛行：具有等于你速度的攀爬速度；3 级起可在垂直表面上移动、上下左右攀行，并能倒挂于天花板，'
    + '期间双手保持空闲。'
    + '蛛网行者：在蛛网中移动时不受蛛网造成的移动限制，并知晓其他与同一张蛛网接触的生物的准确位置。'
    + '本条生物类型为怪兽（2024 术语），不属类人生物。',
    {
      size: 'medium',
      speed: 30,
      climbSpeed: 30,
      darkvision: 120,
      spellcastingAbilityChoices: SPELL_ABILITY,
      spellGrants: [
        grant('dancing-lights', 1),
        grant('faerie-fire', 3, { ...freeOncePerLongRest, canCastWithSpellSlots: true }),
        grant('web', 5, { ...freeOncePerLongRest, canCastWithSpellSlots: true }),
      ],
    },
  ),
]
