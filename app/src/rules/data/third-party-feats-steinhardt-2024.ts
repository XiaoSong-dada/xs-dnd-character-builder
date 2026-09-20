import type { FeatRule } from '@/types/rules'

/**
 * G3-I4：斯坦哈德的诡怖猎杀指南（Steinhardt's Guide to the Eldritch Hunt，第三方）
 * 2024 版式通用专长 2 条。
 *
 * 来源 ID `source-2024-tp-steinhardt`；第三方合作内容，来源默认关闭、需 DM 同意。
 *
 * 登记口径：
 * - 本模块只登记「通用专长」（暴徒、炮手），两条均为 `category: 'general'`；
 * - 同书 2 条起源专长（虔信、霜鬓）已由 `third-party-feats-g3-2024.ts` 登记，本模块不重复登记；
 * - 中英文名与全部增益项取自 CHM v2026.09.13 通用专长章节原文，`detail` 为原创中文转述；
 * - 属性先决按原文登记为力量 16+／18+；加农炮等武器数据属装备范围，本模块不登记；
 * - 条目状态 `selectable`，效果不进入自动计算，最终裁定以第三方原书为准。
 */
const steinhardt = ['source-2024-tp-steinhardt'] as const

const generalFeat = (
  slug: string,
  name: string,
  englishName: string,
  prerequisite: FeatRule['prerequisite'],
  description: string,
  detail: string,
): FeatRule => ({
  id: `feat-2024-tp-sh-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  description,
  detail,
  tags: ['通用'],
  category: 'general',
  status: 'selectable',
  sourceIds: steinhardt,
  ...(prerequisite ? { prerequisite } : {}),
})

export const steinhardtGeneralFeats2024: readonly FeatRule[] = [
  generalFeat('brutalizer', '暴徒', 'Brutalizer',
    { minimumLevel: 4, abilityMinimum: { anyOf: ['str'], score: 16 } },
    '单手挥动双手武器并获得追击优势。',
    '通用专长（先决：等级 4+，力量 16+）。属性值提升：力量或敏捷 +1，至多 20。凶残之武：只要你的另一只手空闲或正持用一把单手武器，你就能以单手握持并挥舞具有双手词条的武器。杀戮连锁：当你令一名生物的生命值降至 0 时，直至你的下个回合开始前，你的下次攻击检定具有优势；无次数限制。'),
  generalFeat('cannoneer', '炮手', 'Cannoneer',
    { minimumLevel: 4, abilityMinimum: { anyOf: ['str'], score: 18 } },
    '精通加农炮装填与攻城轰击。',
    '通用专长（先决：等级 4+，力量 18+）。属性值提升：力量 +1，至多 20。加农熟练：你获得加农炮熟练，并能以附赠动作而非动作装填加农炮，但仅当你本回合尚未移动时可用，且用后速度降至 0 直至回合结束；11 级起不再降速，且攻击动作中可用装填替代一次攻击；20 级起可忽略火炮词条。攻城巨炮：以加农炮攻击物件与建筑造成双倍伤害。强健脊背：加农炮与炮弹重量对你减半。'),
]
