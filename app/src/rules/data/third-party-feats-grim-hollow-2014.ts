import type { FeatRule } from '@/types/rules'

/**
 * G3-I4：《鬼魅幽谷》(Grim Hollow)「艾弗瑞斯之巢·附录A 专长」第三方专长（2014 口径，2 条）。
 * 来源 ID `tp-grim-hollow-index` 为第三方合作内容，来源默认关闭、需 DM 同意。
 *
 * 收录口径：
 * - 中英文名与全部增益项取自 CHM v2026.09.13「艾弗瑞斯之巢／附录A／专长」章节逐条核对；
 * - 该页候选专长共 2 条（高明工匠／谨慎工匠），资料未给出任何前置条件，故两条均省略 `prerequisite`；
 * - 两条专长围绕项目「制造规则」生效，具体制造流程、属性检定与耗时由战役采用的制造规则与 DM 裁定；
 * - 沿用 G3-I2／I3 约定：只登记选择与展示所需元数据与原创中文转述，效果不进入自动计算。
 */

const GRIM_HOLLOW = ['tp-grim-hollow-index'] as const

const feat = (
  slug: string,
  name: string,
  englishName: string,
  description: string,
  detail: string,
  tags: readonly string[],
): FeatRule => ({
  id: `feat-2014-tp-gh-${slug}`,
  ruleset: '5e-2014',
  name,
  englishName,
  description,
  detail,
  tags,
  status: 'selectable',
  sourceIds: GRIM_HOLLOW,
})

export const grimHollowFeats2014: readonly FeatRule[] = [
  feat('adroit-crafter', '高明工匠', 'Adroit Crafter', '精通熟练工艺，制造更快且失败时不损失材料。',
    '使用你具有熟练的技能或工具制造物品时，所需消耗的时间减半。此外，若你在完成物品制造时失败，且该失败会导致你损失制造材料，你可以防止这些材料因这次失败而损失。制造流程、属性检定与耗时按战役所采用的制造规则执行，具体由 DM 裁定。',
    ['制造', '工具']),
  feat('careful-crafter', '谨慎工匠', 'Careful Crafter', '制造检定获得优势，失败时缩短整段制造进程耗时。',
    '你为制造物品所做的任何属性检定均具有优势。制造期间，任何协助你制造的人为制造所做的属性检定同样具有优势。若你在完成物品制造时失败，则完成这一整次制造进程所需的时间减半。制造流程与判定细则按战役所采用的制造规则执行，由 DM 裁定。',
    ['制造', '检定']),
]
