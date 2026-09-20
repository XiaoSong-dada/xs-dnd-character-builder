// G3-I5：《邪狱使》(The Illrigger) 第三方魔法物品 2 条。
// 来源 `tp-illrigger-index`（2014 注册表；第三方合作内容，来源默认关闭、需 DM 同意）。
// 口径：本书按 2014 版式撰写，`itemAction` 不使用 2024 的「魔法动作」取值。
// 只登记结构化事实与原创机制摘要，不复制原书正文；含随机／成分表的条目记 `index-only`。
import type { EquipmentRule } from '@/types/rules'

const sourceIds = ['tp-illrigger-index'] as const

export const illriggerItems2014: readonly EquipmentRule[] = [
  {
    id: 'equipment-2014-tp-ill-true-name',
    name: '真名',
    englishName: 'True Name',
    ruleset: '5e-2014',
    status: 'selectable',
    description: '武器（任意）·非普通／珍稀／极珍稀／传说·需同调（仅限邪狱使）。同调时须对武器低声说出真名，名字以炼狱符文烙印其上后消失。典型为非普通版本，可强化邪狱使的极恶禁令：以该武器攻击检定掷出 18—20 且施加缄印时，可额外施加一枚。珍稀 +1、缄印伤害 +1d6；极珍稀 +2、+2d6，击杀时可重获 1 枚缄印并获得等于邪狱使等级的临时生命值（每黄昏一次）；传说 +3、+3d6，击杀时重获 2 枚。',
    classIds: [],
    equippable: true,
    category: 'weapon',
    rarity: 'varies',
    magicItemCategory: 'weapon',
    attunement: 'conditional',
    attunementCondition: '仅限邪狱使',
    itemAction: 'varies',
    sourceIds,
  },
  {
    id: 'equipment-2014-tp-ill-bloodsbane',
    name: '血毒',
    englishName: 'Bloodsbane',
    ruleset: '5e-2014',
    status: 'index-only',
    description: '药水（油剂）·极珍稀·无需同调。可涂抹在一把挥砍或穿刺武器或至多五发同类弹药上，耗时 1 分钟，期间须由一名自愿生物献一滴血激活。被涂油武器命中的生物须通过 DC 15 体质豁免，否则受所混成分对应的效应（成分—效应见原表：诚实之域 10 分钟、麻痹 1 分钟、提供血液者获知方位 24 小时、魅惑类人 1 小时等）；若血液来自邪狱使且豁免失败，该生物被施加一枚不计入上限的缄印。油剂可在短休或长休时混入成分，混入后难以察觉。',
    classIds: [],
    equippable: false,
    category: 'magic',
    rarity: 'very-rare',
    magicItemCategory: 'potion',
    attunement: 'none',
    itemAction: 'varies',
    magicItemUsage: { charged: false, consumable: true, recovery: [] },
    sourceIds,
  },
]
