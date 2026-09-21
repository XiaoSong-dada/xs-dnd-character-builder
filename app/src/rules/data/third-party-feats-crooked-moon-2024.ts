import type { FeatRule } from '@/types/rules'

/**
 * G3-I4：歪曲之月（The Crooked Moon，第三方）2024 版式通用专长 2 条。
 *
 * 来源 ID `source-2024-tp-crooked-moon`；第三方合作内容，来源默认关闭、需 DM 同意。
 *
 * 登记口径：
 * - 本模块只登记第五章「通用专长」（拒绝死亡、迅捷巫术），两条均为 `category: 'general'`；
 * - 同书第五章的 12 条起源专长已由 `third-party-feats-2024.ts` 登记，本模块不重复登记；
 * - 中英文名与全部增益项取自 CHM v2026.09.13 第五章原文，`detail` 为原创中文转述；
 * - 「施法或契约魔法特性」按项目既有口径映射为 `requiredCapability: 'spellcasting-or-pact'`；
 * - 条目状态 `selectable`，需玩家二选一的内容只写入 `detail`，不建子选项。
 */
const crookedMoon = ['source-2024-tp-crooked-moon'] as const

const generalFeat = (
  slug: string,
  name: string,
  englishName: string,
  prerequisite: FeatRule['prerequisite'],
  description: string,
  detail: string,
): FeatRule => ({
  id: `feat-2024-tp-cm-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  description,
  detail,
  tags: ['通用'],
  category: 'general',
  status: 'selectable',
  sourceIds: crookedMoon,
  ...(prerequisite ? { prerequisite } : {}),
})

export const crookedMoonFeats2024: readonly FeatRule[] = [
  generalFeat('death-defier', '拒绝死亡', 'Death Defier',
    { minimumLevel: 4 },
    '强化死亡豁免，并延后一次即死效果。',
    '通用专长（先决：等级 4+）。属性值提升：体质 +1，至多 20。紧握生命：你进行死亡豁免时加入体质调整值（至少 +1）。坚毅活力：若某个效应会直接杀死你且不触发死亡豁免，或在未造成伤害的情况下直接将你的生命值降至 0，你的生命值改为降至等于你等级的数值；你必须完成一次长休才能再次使用此增益。'),
  generalFeat('swift-witchcraft', '迅捷巫术', 'Swift Witchcraft',
    { minimumLevel: 4, requiredCapability: 'spellcasting-or-pact' },
    '以动作施展一分钟施法时间的法术。',
    '通用专长（先决：等级 4+，且具有施法或契约魔法特性）。属性值提升：智力、感知或魅力 +1，至多 20。高速咏唱：你可以使用动作来施展一道施法时间为 1 分钟的法术，把原本需要长时间吟诵的仪式压缩为一个动作；使用此增益后，直至完成一次长休为止都不能再次使用。该增益不改变法术的环阶、成分与持续时间，也不减少法术位消耗。'),
]
