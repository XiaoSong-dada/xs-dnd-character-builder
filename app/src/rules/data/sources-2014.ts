import type { RuleSource } from '@/types/character'

const source = (
  id: string,
  shortTitle: string,
  title: string,
  category: RuleSource['category'],
  url?: string,
): RuleSource => ({
  id,
  shortTitle,
  title,
  ruleset: '5e-2014',
  category,
  selectable: category === 'supplement',
  url,
})

/** 当前 5e-2014 可编辑规则仓库的全部出版来源。2024 来源必须留在旧草稿隔离边界之外。 */
export const sources2014: readonly RuleSource[] = [
  source('basic-rules-2014', 'Basic Rules', '2014 Basic Rules / SRD 5.1', 'core', 'https://www.dndbeyond.com/sources/dnd/basic-rules-2014'),
  source('phb-2014-index', 'PHB', '2014 玩家手册', 'core'),
  source('dmg-2014-index', 'DMG', '2014 地下城主指南', 'supplement'),
  source('eepc-2015-index', 'EEPC', '元素邪恶玩家伴侣', 'supplement', 'https://media.wizards.com/2015/downloads/dnd/EE_PlayersCompanion.pdf'),
  source('scag-2015-index', 'SCAG', '剑湾冒险者指南', 'supplement'),
  source('vgm-2016-index', 'VGM', '沃罗的怪物指南', 'supplement'),
  source('tortle-2017-index', 'Tortle', '龟人包', 'supplement', 'https://www.dndbeyond.com/sources/tortle'),
  source('xgte-2017-index', 'XGtE', '珊娜萨的万事指南', 'supplement'),
  source('ggr-2018-index', 'GGR', '拉尼卡公会会长指南', 'supplement'),
  source('mtof-2018-index', 'MToF', '莫登凯恩的敌人全书', 'supplement'),
  source('erftlw-2019-index', 'ERftLW', '艾伯伦：战乱后的最后战争', 'supplement'),
  source('mot-2020-index', 'MOT', '塞洛斯神话奥德赛', 'supplement'),
  source('egtw-2020-index', 'EGtW', '荒洲探险者指南', 'supplement'),
  source('tcoe-2020-index', 'TCoE', '塔莎的万事坩埚', 'supplement'),
  source('scc-2021-index', 'SCC', '斯翠海文：混沌课程', 'supplement'),
  source('vrgtr-2021-index', 'VRGtR', '范·里希滕的鸦阁指南', 'supplement'),
  source('ftd-2021-index', 'FTD', '费兹班的巨龙宝库', 'supplement'),
  source('dsotdq-2022-index', 'DSotDQ', '龙枪：龙后之影', 'supplement'),
  source('bigby-2023-index', 'Bigby', '毕格比的巨人荣光', 'supplement'),
]

export const CORE_SOURCE_IDS = sources2014
  .filter((item) => item.category === 'core')
  .map((item) => item.id)

export const SELECTABLE_SOURCE_IDS = sources2014
  .filter((item) => item.selectable)
  .map((item) => item.id)

