import type { RaceRule } from '@/types/rules'

/**
 * 《Beyond Drops》26.9 暮精 Duskling（X04 批次）。
 *
 * 登记口径与证据：
 * - 来源 `source-2024-tp-beyond-drops`。按 X04 裁定 R4（2026-10-10），该来源的
 *   `contentKind` 已就地修订为 `official`、标题改为「Beyond Drops（官方数字专栏，需 DM 同意）」，
 *   以反映「WotC 通过 D&D Beyond 免费发布的官方数字专栏」这一已核验身份；条目 ID 不变，仍默认关闭。
 *   注意该来源同时承载 26.5—26.8 期的既有内容，其中 26.5 期专长为 2014 写法，故来源内各期写法不统一。
 * - 规则版本为 **2024 写法**：正文使用「生物类型／体型／速度」物种栏位，**通篇无属性值提升**，
 *   资源以「熟练加值」计数并以长休全恢复表述；与同期 26.9 法术页的 2024 版式一致。
 * - 名称与特质要点取自 CHM v2026.09.13 `其他\beyond drops\26.9\种族-暮精.htm`，逐条原创中文转述。
 * - **疑似节选待核验**：本地正文仅 582 字，未出现技能／工具熟练、抗性、天生武器护甲、
 *   法术授予或语言条目。**不据本地页断言完整，也不由名称或惯例补齐**；官方原文核验前保持该标注。
 */
const beyondDrops = ['source-2024-tp-beyond-drops'] as const

const duskling: RaceRule = {
  id: 'species-2024-beyond-drops-duskling',
  ruleset: '5e-2024',
  name: '暮精',
  englishName: 'Duskling',
  summary: '妖精；黑暗视觉 60 尺，强力蹦跳，长休时在热忱／机敏／活力间择一的内在魔法。',
  description:
    '生物类型：妖精；中型（约 5—6 尺）；速度 30 尺。黑暗视觉 60 尺。'
    + '强力蹦跳：助跑跳高的距离增加 2 尺，助跑跳远的距离增加 10 尺。'
    + '内在魔法：完成长休时从下列三项增益中选择其一，该增益持续到你选择另一项为止；'
    + '你可以附赠动作将其转换为另一项增益。转换增益的次数等于你的熟练加值，'
    + '并在完成长休时恢复全部已消耗的次数。三选一分别为——'
    + '热忱：你的魅力属性检定与为避免或终止恐慌状态所作的豁免具有优势；'
    + '机敏：你的速度增加 10 尺，且攀爬与游泳不会额外消耗移动力；'
    + '活力：你获得等于熟练加值的临时生命值，且你的力量（运动）与敏捷（特技）检定具有优势。'
    + '注：本条目所依据的本地正文未列出技能／工具熟练、抗性、天生武器护甲、法术授予或语言；'
    + '是否为节选尚未与官方原文核对，故不补齐、不推断，待核验后再回填。',
  subraceIds: [],
  fixedAbilityBonuses: {},
  size: 'medium',
  speed: 30,
  darkvision: 60,
  recommendedClassIds: [],
  status: 'selectable',
  sourceIds: beyondDrops,
}

export const beyondDropsSpecies2024: readonly RaceRule[] = [duskling]
