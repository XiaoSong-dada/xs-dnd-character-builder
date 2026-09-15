import type { RuleOption } from '@/types/rules'

/**
 * 2024 术士超魔选项（Metamagic）。
 *
 * 规则：2 级获得超魔法并选择 2 项，10 级与 17 级各再选 2 项（共 6 项，不可重复）；
 * 施法时消耗术法点改变法术效果，每次施法默认只能应用一种超魔（术法化身期间最多两种）。
 * 与 `metamagic-2014.ts` 严格分离：同名选项的消耗与效果按 2024 规则独立登记。
 *
 * 规则集：`5e-2024`。
 */
export const METAMAGIC_2024_OPTION_IDS: readonly string[] = [
  'metamagic-2024-careful',
  'metamagic-2024-distant',
  'metamagic-2024-empowered',
  'metamagic-2024-extended',
  'metamagic-2024-heightened',
  'metamagic-2024-quickened',
  'metamagic-2024-seeking',
  'metamagic-2024-subtle',
  'metamagic-2024-transmuted',
  'metamagic-2024-twinned',
]

export const metamagicOptions2024: readonly RuleOption[] = [
  {
    id: 'metamagic-2024-careful',
    name: '谨慎法术',
    englishName: 'Careful Spell',
    description: '消耗 1 术法点：施放需要豁免的法术时，选择至多等于魅力调整值数量（至少 1 个）的生物，其自动通过豁免；若豁免成功仍会受半伤，这些生物不受伤害。',
    status: 'implemented',
    sourceIds: ['source-2024-phb'],
    sorceryPointCost: 1,
  },
  {
    id: 'metamagic-2024-distant',
    name: '远程法术',
    englishName: 'Distant Spell',
    description: '消耗 1 术法点：射程至少 5 尺的法术射程翻倍；射程为触碰的法术改为 30 尺。',
    status: 'implemented',
    sourceIds: ['source-2024-phb'],
    sorceryPointCost: 1,
  },
  {
    id: 'metamagic-2024-empowered',
    name: '强效法术',
    englishName: 'Empowered Spell',
    description: '消耗 1 术法点：为法术进行伤害掷骰时，重掷至多等于魅力调整值数量（至少 1 枚）的伤害骰，必须使用新结果；可与其他超魔同时使用。',
    status: 'implemented',
    sourceIds: ['source-2024-phb'],
    sorceryPointCost: 1,
  },
  {
    id: 'metamagic-2024-extended',
    name: '延效法术',
    englishName: 'Extended Spell',
    description: '消耗 1 术法点：持续时间为 1 分钟或更长的法术持续时间翻倍（至多 24 小时）；若需专注，维持专注的豁免具有优势。',
    status: 'implemented',
    sourceIds: ['source-2024-phb'],
    sorceryPointCost: 1,
  },
  {
    id: 'metamagic-2024-heightened',
    name: '升阶法术',
    englishName: 'Heightened Spell',
    description: '消耗 2 术法点：迫使生物进行豁免的法术，使其中一名生物对该法术的豁免具有劣势。',
    status: 'implemented',
    sourceIds: ['source-2024-phb'],
    sorceryPointCost: 2,
  },
  {
    id: 'metamagic-2024-quickened',
    name: '瞬发法术',
    englishName: 'Quickened Spell',
    description: '消耗 2 术法点：施法时间为动作的法术改为附赠动作；同回合内若已施展一环或更高环法术则不能使用，使用后同回合也不能再施展一环或更高环法术。',
    status: 'implemented',
    sourceIds: ['source-2024-phb'],
    sorceryPointCost: 2,
  },
  {
    id: 'metamagic-2024-seeking',
    name: '追踪法术',
    englishName: 'Seeking Spell',
    description: '消耗 1 术法点：法术攻击检定未命中时重骰 d20，必须使用新结果；可与其他超魔同时使用。',
    status: 'implemented',
    sourceIds: ['source-2024-phb'],
    sorceryPointCost: 1,
  },
  {
    id: 'metamagic-2024-subtle',
    name: '精妙法术',
    englishName: 'Subtle Spell',
    description: '消耗 1 术法点：法术不再具有言语、姿势与材料成分；被消耗或有具体价值的材料成分除外。',
    status: 'implemented',
    sourceIds: ['source-2024-phb'],
    sorceryPointCost: 1,
  },
  {
    id: 'metamagic-2024-transmuted',
    name: '转化法术',
    englishName: 'Transmuted Spell',
    description: '消耗 1 术法点：将法术伤害类型在强酸、寒冷、火焰、闪电、毒素、雷鸣之间转换。',
    status: 'implemented',
    sourceIds: ['source-2024-phb'],
    sorceryPointCost: 1,
  },
  {
    id: 'metamagic-2024-twinned',
    name: '孪生法术',
    englishName: 'Twinned Spell',
    description: '消耗 1 术法点：对能因升环施法额外增加目标的法术（如魅惑类人），将其有效环阶提升一环以增加一名目标。',
    status: 'implemented',
    sourceIds: ['source-2024-phb'],
    sorceryPointCost: 1,
  },
]
