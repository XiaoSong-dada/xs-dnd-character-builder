import type { SpellRule } from '@/types/rules'

/**
 * 破解奥秘（UA）新增法术。
 * 只登记与核心法术不重名的条目；共享法术由职业法术列表引用既有 `spell-2024-*`。
 * 各条目自带来源（艾伯伦／奥术等）。
 */
export const uaSpells2024: readonly SpellRule[] = [
  {
    id: 'spell-2024-ua-homunculus-servant',
    ruleset: '5e-2024',
    name: '人工生命仆从',
    englishName: 'Homunculus Servant',
    level: 2,
    ritual: true,
    classIds: ['class-2024-ua-artificer'],
    summary: '二环咒法（仪式）：召唤一只微型构装仆从，使用你的先攻并听令行动。',
    description: '施法时间 1 小时或作为仪式；射程 10 尺；需价值 100+ GP 的宝石或水晶作为耗材；立即生效。召唤一只人工生命仆从（微型构装，AC 13，HP 5＋每法术环阶 5，速度 20 尺、飞行 30 尺，黑暗视觉 60 尺，免疫毒素与力竭／中毒状态，心灵感应 1 里仅与你沟通）。仆从具反射闪避与魔法连结（加入你的熟练加值）；可用力场打击（近战或 30 尺远程，命中 1d6＋法术环阶力场伤害）；你在 120 尺内施展触碰法术时，仆从可用反应传递该法术。同一时间只能有一只；升环施法提高其生命值。仆从数据未接入自动战斗结算，按桌面处理。',
    status: 'selectable',
    sourceIds: ['source-2024-ua-eberron'],
    school: '咒法',
    castingTime: '1 小时或仪式',
    range: '10 尺',
    components: 'V、S、M（价值 100+ GP 的宝石或水晶，作为耗材）',
    duration: '立即',
    concentration: false,
  },
  {
    id: 'spell-2024-ua-nystuls-magic-aura',
    ruleset: '5e-2024',
    name: '尼斯特鲁魔法灵光',
    englishName: "Nystul's Magic Aura",
    level: 2,
    ritual: false,
    classIds: [],
    summary: '二环幻术：改变目标在魔法侦测下的灵光；由奥秘领域始终准备提供（2014 PHB 条目，2024 核心未重印）。',
    description: '施法时间 1 动作；射程触碰；成分 V、S、M（一小块丝帛）；持续 24 小时。你触碰一个自愿生物或一件未被携带的物品，并选择以下一种效应：虚假灵光——目标在侦测魔法等效应下呈现你所选学派（或魔法物品）的灵光，掩盖其真实灵光；伪装——改变目标在侦测生物类型等效应中的生物类型，或使其在侦测阵营中显示为另一个阵营。重复施展于同一目标 30 日内，可使其持续至被解除。具体效果以 2014《玩家手册》与 DM 裁定为准。',
    status: 'selectable',
    sourceIds: ['source-2024-ua-arcane'],
    school: '幻术',
    castingTime: '动作',
    range: '触碰',
    components: 'V、S、M（一小块丝帛）',
    duration: '24 小时',
    concentration: false,
  },
]
