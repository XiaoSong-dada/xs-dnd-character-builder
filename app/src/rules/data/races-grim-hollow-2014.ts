import type { RaceRule } from '@/types/rules'

/**
 * 《鬼魅幽谷：玩家包》（Grim Hollow: Player Pack）玩家种族 2 条 · 2014 写法。
 *
 * 出版身份：
 * - 本条目出自《鬼魅幽谷：玩家包 Grim Hollow: Player Pack》，为 Ghostfire Gaming 的
 *   第三方合作内容，经 D&D Beyond 发行；来源 ID `tp-grim-hollow-index`
 *   （`5e-2014`，第三方来源默认关闭、需 DM 同意）。
 * - 采用 **2014 写法**：特质块使用「属性值提升 Ability Score Increase」，
 *   故登记进 `5e-2014` 仓库，不得与任何 2024 物种条目混用。
 * - 名字与全部特质取自 CHM v2026.09.13 第 5351／5352 节（版权页见第 5350 节），
 *   逐条核对后以原创中文转述登记。
 *
 * 与《玩家指南》同名条目**不是重印，不得合并**：
 * - CHM 第 5371／5373 节是《鬼魅幽谷：玩家指南》（Player's Guide）的同名条目，
 *   属另一套机制——基础特质**不给任何属性值加成**，速度基准为 30 尺且允许
 *   「体型为小型时速度 −5 尺，换取一项额外的传统特质」，并另行提供八项
 *   「传统特质」供挑选（无形之灵：抗魔之护／招敌引袭／遁入虚相／隐入以太／
 *   寒暑无惧／一魔千悟／术法学者／咒法通识；枉替之子：生物掩体／抗魔之护／
 *   匠造形体／援助之手／见隙穿身／术法学者／咒法通识／本能身法）。
 * - 本文件登记的是**玩家包**（旧版）条目：固定属性加值、固定速度、
 *   特质不可挑选。《玩家指南》条目不在本期实现范围，故两者必须独立建模。
 *
 * 版本标注：
 * - 玩家包版权页（第 5350 节）注明「本书部分内容在最新的《鬼魅幽谷：玩家指南》中
 *   有着更新的版本……将以旧版（若为整个页面）或 legacy（若为某个部分）标注」，
 *   故本文件两条属**旧版**内容，已如实按旧版数值登记并在此标注。
 *
 * 登记口径：
 * - `status: 'selectable'`，来源默认关闭；其余无法用现有字段表达的机制
 *   （销身遁形的完整限制、免疫疾病与魔法性老化、不需吃喝睡呼吸、孩童般的灵敏等）
 *   一律写入 `description`，不新增类型字段。
 */
const GRIM_HOLLOW = ['tp-grim-hollow-index'] as const

const ghRace = (
  slug: string,
  name: string,
  englishName: string,
  summary: string,
  description: string,
  extra: Partial<RaceRule> = {},
): RaceRule => ({
  id: `race-2014-tp-gh-${slug}`,
  ruleset: '5e-2014',
  name,
  englishName,
  summary,
  description,
  subraceIds: [],
  fixedAbilityBonuses: {},
  recommendedClassIds: [],
  status: 'selectable',
  sourceIds: GRIM_HOLLOW,
  ...extra,
})

export const grimHollowPlayerPackRaces2014: readonly RaceRule[] = [
  ghRace('disembodied', '无形之灵', 'The Disembodied',
    '智力 +2 敏捷 +1，可遁入以太位面，并随等级获得三道法术。',
    '属性值提升：智力 +2、敏捷 +1。体型：沿用灾难前身为类人生物时的体型，可由你选择小型或中型（体重约为原体重的四分之一）。基础步行速度 30 尺；**无黑暗视觉**。寿命：成长远慢于同类类人生物，寿命亦长，且不会因年老而死。外貌可沿用生前的原种族，但不因此获得该种族的任何特质。销身遁形：在你的回合内以一个动作遁入以太位面，持续 1 分钟，也可用附赠动作提前结束；期间你与物质位面的效应（含法术与生物）不能互相影响，但你仍能正常移动、聆听，并以灰阶视觉观察；结束时你出现在消失处最近的未占据空间；使用后须完成长休才能再次使用。位面浪人：1 级起每天 1 次羽落术（仅以自己为目标），3 级起每天 1 次朦胧术，5 级起每天 1 次闪现术，施法属性为智力。奥法起源：奥秘技能熟练。语言：任选两门语言。',
    {
      sizeChoices: ['small', 'medium'],
      speed: 30,
      fixedAbilityBonuses: { int: 2, dex: 1 },
      skillProficiencies: ['skill-arcana'],
      languageChoices: 2,
      spellGrants: [
        {
          spellId: 'spell-2014-feather-fall',
          minimumLevel: 1,
          freeCastings: 1,
          recovery: 'long-rest',
          ability: 'int',
          targetRestriction: 'self-only',
        },
        { spellId: 'spell-2014-blur', minimumLevel: 3, freeCastings: 1, recovery: 'long-rest', ability: 'int' },
        { spellId: 'spell-2014-blink', minimumLevel: 5, freeCastings: 1, recovery: 'long-rest', ability: 'int' },
      ],
    }),
  ghRace('wechselkind', '枉替之子', 'Wechselkind',
    '体质 +2 魅力 +1 的小型构装体，免疫疾病与魔法老化，可显形为孩子模样。',
    '属性值提升：体质 +2、魅力 +1。体型：小型（身高 2—3 尺、体重 35—55 磅）；基础步行速度 25 尺；**无黑暗视觉**。人造之物：作为构装生物，你在对抗中毒效应的豁免中具有优势，拥有毒素伤害抗性，免疫疾病，且不需要吃、喝、睡眠与呼吸；尽管如此，你依然被视为类人生物。免疫魔法性的老化效应：你不像普通生物那样衰老，形体会永远停留在人偶般的孩童模样，寿命取决于自然磨损与损坏，必要时也可通过修理或更换身体部件延续。仙灵的魅惑力：你可以施展一次易容术，但只能显现出你当初被留下替代的那个孩童的外貌；完成一次长休后重获该能力；施法属性为魅力。孩童般的灵敏：你可以穿过任何体型大于你的生物所占据的空间；获得特技技能熟练。语言：森林语（Sylvan；CHM 原文作「木族语」，本项目既有条目统一用「森林语」），以及额外一门自选语言。',
    {
      size: 'small',
      speed: 25,
      fixedAbilityBonuses: { con: 2, cha: 1 },
      damageResistances: ['毒素'],
      skillProficiencies: ['skill-acrobatics'],
      fixedLanguages: ['森林语'],
      languageChoices: 1,
      spellGrants: [
        {
          spellId: 'spell-2014-disguise-self',
          minimumLevel: 1,
          freeCastings: 1,
          recovery: 'long-rest',
          ability: 'cha',
          castingNote: '仅能显现你当初被留下替代的那个孩童的外貌',
        },
      ],
    }),
]
