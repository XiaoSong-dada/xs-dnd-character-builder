import type { RuleOption } from '@/types/rules'

/**
 * 2014 术士超魔选项（Metamagic）。
 *
 * 规则：3 级获得超魔法并选择 2 项，10 级与 17 级各再选 1 项（共 4 项，不可重复）；
 * 施法时消耗术法点改变法术效果，每次施法只能应用一种超魔。
 * 选项：2014《玩家手册》8 项（SRD 5.1 收录）+《塔莎的万事坩埚》新增 2 项。
 * 全部登记原创中文摘要（效果要点转述）并核验为 `implemented`；
 * 术法点消耗仅作摘要展示，不做施法时消耗的自动计算。
 *
 * 规则集：`5e-2014`。
 */
export const METAMAGIC_OPTION_IDS: readonly string[] = [
  'metamagic-careful',
  'metamagic-distant',
  'metamagic-empowered',
  'metamagic-extended',
  'metamagic-heightened',
  'metamagic-quickened',
  'metamagic-subtle',
  'metamagic-twinned',
  'metamagic-seeking',
  'metamagic-transmuted',
]

export const metamagicOptions2014: readonly RuleOption[] = [
  {
    id: 'metamagic-careful',
    name: '谨慎法术',
    englishName: 'Careful Spell',
    description: '施放需要豁免检定的范围法术时，消耗 1 点术法点，选择至多等于魅力调整值的若干目标，其豁免自动视为成功（不受法术效果影响）。',

    status: 'implemented',
    sourceIds: ['basic-rules-2014'],
  },
  {
    id: 'metamagic-distant',
    name: '增远法术',
    englishName: 'Distant Spell',
    description: '施放法术时消耗 1 点术法点：射程翻倍；或将施法距离为触碰的法术改为 30 尺。',

    status: 'implemented',
    sourceIds: ['basic-rules-2014'],
  },
  {
    id: 'metamagic-empowered',
    name: '强化法术',
    englishName: 'Empowered Spell',
    description: '施放造成伤害的法术时消耗 1 点术法点，可重掷至多等于魅力调整值的伤害骰，必须使用新结果。',

    status: 'implemented',
    sourceIds: ['basic-rules-2014'],
  },
  {
    id: 'metamagic-extended',
    name: '延展法术',
    englishName: 'Extended Spell',
    description: '施放持续时间至少 1 分钟的法术时消耗 1 点术法点，持续时间翻倍（最长 24 小时）。',

    status: 'implemented',
    sourceIds: ['basic-rules-2014'],
  },
  {
    id: 'metamagic-heightened',
    name: '威能法术',
    englishName: 'Heightened Spell',
    description: '施放法术时消耗 3 点术法点，迫使一名豁免目标在首次豁免时具有劣势。',

    status: 'implemented',
    sourceIds: ['basic-rules-2014'],
  },
  {
    id: 'metamagic-quickened',
    name: '迅捷法术',
    englishName: 'Quickened Spell',
    description: '施放法术时消耗 2 点术法点，将施法时间改为一个附赠动作；本回合仅能以此法施放一个法术，原施法时间为附赠动作的法术不可用。',

    status: 'implemented',
    sourceIds: ['basic-rules-2014'],
  },
  {
    id: 'metamagic-subtle',
    name: '隐蔽法术',
    englishName: 'Subtle Spell',
    description: '施放法术时消耗 1 点术法点，省略言语与姿势成分。',

    status: 'implemented',
    sourceIds: ['basic-rules-2014'],
  },
  {
    id: 'metamagic-twinned',
    name: '孪生法术',
    englishName: 'Twinned Spell',
    description: '施放仅影响单一目标、不以自身为目标且非范围效应的法术时，消耗等于法术环级的术法点（戏法消耗 1 点），将目标改为两个。',

    status: 'implemented',
    sourceIds: ['basic-rules-2014'],
  },
  {
    id: 'metamagic-seeking',
    name: '寻求法术',
    englishName: 'Seeking Spell',
    description: '施放需要攻击骰的法术时消耗 2 点术法点，在攻击骰判定后、结果确认前重掷；若该攻击骰具有劣势则不可使用本超魔。',

    status: 'implemented',
    sourceIds: ['tcoe-2020-index'],
  },
  {
    id: 'metamagic-transmuted',
    name: '易变法术',
    englishName: 'Transmuted Spell',
    description: '施放造成伤害的法术时消耗 1 点术法点，将一种伤害类型改为另一种（如闪电改为火焰）。',

    status: 'implemented',
    sourceIds: ['tcoe-2020-index'],
  },
]
