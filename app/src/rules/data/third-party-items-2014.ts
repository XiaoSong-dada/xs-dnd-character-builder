import type { EquipmentRule } from '@/types/rules'

import { drakkenheimItems2014 } from '@/rules/data/third-party-items-drakkenheim-2014'
import { grimHollowItems2014 } from '@/rules/data/third-party-items-grim-hollow-2014'
import { griffinAccessoriesItems2014 } from '@/rules/data/third-party-items-griffin-accessories-2014'
import { griffinWeaponsItems2014 } from '@/rules/data/third-party-items-griffin-weapons-2014'
import { griffinWondrousItems2014 } from '@/rules/data/third-party-items-griffin-wondrous-2014'
import { humblewoodItems2014 } from '@/rules/data/third-party-items-humblewood-2014'
import { illriggerItems2014 } from '@/rules/data/third-party-items-illrigger-2014'
import { taldoreiItems2014 } from '@/rules/data/third-party-items-taldorei-2014'

/**
 * G3-I5：第三方合作魔法物品（2014 口径）汇总入口。
 *
 * 每书一个模块，本文件只做拼接，供 `repository.ts` 一次性并入 2014 物品池。
 * 这批物品全部来自第三方合作书，来源默认关闭、需 DM 同意；只登记结构化事实与原创机制摘要，
 * 效果不进入自动计算（含随机表或复杂情境的条目在各自模块内标记为 `index-only`）。
 */
export const thirdPartyItems2014: readonly EquipmentRule[] = [
  ...taldoreiItems2014,
  ...drakkenheimItems2014,
  ...humblewoodItems2014,
  ...grimHollowItems2014,
  ...illriggerItems2014,
  ...griffinWondrousItems2014,
  ...griffinWeaponsItems2014,
  ...griffinAccessoriesItems2014,
]
