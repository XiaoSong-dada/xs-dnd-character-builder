// G3-I5：《吸血鬼：避世潜藏》(Vampire: The Masquerade — Blood Bound) 第三方魔法物品 1 条。
// 来源 `source-2024-tp-vtm`（2024 注册表；第三方合作内容，来源默认关闭、需 DM 同意）。
// 说明：该书的「新装备」一节以**普通武器与装备**为主（银制武器与弹药、木制武器与弹药、猎魔工具包、
// 皮革内衬等），魔法物品仅「血族绯血」一条，本模块只登记该条；普通装备不属于 G3-I5 范围。
import type { EquipmentRule } from '@/types/rules'

export const vtmItems2024: readonly EquipmentRule[] = [
  {
    id: 'equipment-2024-tp-vtm-kindred-vitae',
    name: '血族绯血',
    englishName: 'Kindred Vitae',
    ruleset: '5e-2024',
    status: 'index-only',
    description: '药水·非普通·无需同调，一次性消耗。绯血取自血族体内，非血族饮用时获得其力量：力量 +2、速度 +5 尺，持续 1 周；获得 2d6 临时生命值；接下来一年内无视自然衰老。代价是饮下者更易受亡灵力量影响——同一期间对抗亡灵造成的魅惑或恐慌的豁免具有劣势。单个血点须存于可饮用容器，未经炼金处理最多保存 48 小时。',
    classIds: [],
    equippable: false,
    category: 'magic',
    rarity: 'uncommon',
    magicItemCategory: 'potion',
    attunement: 'none',
    itemAction: 'action',
    magicItemUsage: { charged: false, consumable: true, recovery: [] },
    sourceIds: ['source-2024-tp-vtm'],
  },
]
