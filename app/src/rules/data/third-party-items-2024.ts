import type { EquipmentRule } from '@/types/rules'

import { beyondDropsItems2024 } from '@/rules/data/third-party-items-beyond-drops-2024'
import { crookedMoonItems2024 } from '@/rules/data/third-party-items-crooked-moon-2024'
import { steinhardtItems2024 } from '@/rules/data/third-party-items-steinhardt-2024'
import { valdasSpireItems2024 } from '@/rules/data/third-party-items-valdas-spire-2024'
import { vtmItems2024 } from '@/rules/data/third-party-items-vtm-2024'

/**
 * G3-I5：第三方合作魔法物品（2024 口径）汇总入口。
 *
 * 每书一个模块，本文件只做拼接，供 `repositories.ts` 一次性并入 2024 物品池。
 * 来源默认关闭、需 DM 同意；2024 条目的 `itemAction` 使用 2024 的「魔法动作」取值。
 */
export const thirdPartyItems2024: readonly EquipmentRule[] = [
  ...valdasSpireItems2024,
  ...steinhardtItems2024,
  ...beyondDropsItems2024,
  ...crookedMoonItems2024,
  ...vtmItems2024,
]
