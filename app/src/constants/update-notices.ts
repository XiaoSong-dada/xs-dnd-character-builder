import type { UpdateNotice } from '@/types/update-notice'
import { normalizeVersion } from '@/utils/version'

export const updateNotices: readonly UpdateNotice[] = [
  {
    version: '1.1.9',
    title: '版本更新公告',
    items: [
      'Artificer 职业名对齐 5e 不全书：工匠 → 奇械师（职业选择、检查点标题与相关文案同步更新）。',
      '修复奇械师创建时「选择一套工匠工具」显示英文的问题：炼金/酿酒/书法/木匠/石匠/铁匠/木雕 7 种工具已补齐中文名。',
    ],
  },
  {
    version: '1.1.8',
    title: '版本更新公告',
    items: [
      '种族与背景特性展示：角色卡与跑团助手「能力」页签新增分组区块（种族特性 · 基础种族 / 种族特性 · 子种族 / 背景特性 · 背景），共登记 240 条种族特性与 44 条背景特性，按等级过滤并可展开详情。',
    ],
  },
  {
    version: '1.1.7',
    title: '版本更新公告',
    items: [
      '职业特性译名全面对齐 5e 不全书：78 条职业等级特性按不全书译名更新（如 神恩斩击→至圣斩、吟游激励→诗人激励、气功→坚强防御、荒野变形→荒野形态），稳定 ID 不变，旧草稿完全兼容。',
      '补录术士 2 级「术法点 Sorcery Points」条目（原「术法点」为魔力泉涌 Font of Magic 之误译，已改正）。',
    ],
  },
  {
    version: '1.1.6',
    title: '版本更新公告',
    items: [
      '子职译名全面对齐 5e 不全书：36 条子职名与 444 条子职能力名按不全书译名更新（如 博闻学院→逸闻学院、群聚守卫→集群牧者、改良暴击→精通重击、誓约法术→圣誓法术），稳定 ID 不变，旧草稿完全兼容。',
      '清理 2024 概念混入条目并修正等级错位：删除 13 条、补录 8 条（兽之形、月火、阴晴圆缺、精宸所与、雾行漫游、牙鳞之联、巨人之灾、元素战刃），英文名同步对齐 2014 官方名。',
    ],
  },
  {
    version: '1.1.5',
    title: '版本更新公告',
    items: [
      '法术译名全面对齐 5e 不全书：273 条法术名按不全书译名更新（如 烙印斩击→印记斩、远距传讯→短讯术、引导箭→光导箭、恶毒嘲笑→恶言相加），稳定 ID 与英文名不变，旧草稿完全兼容。',
    ],
  },
  {
    version: '1.1.4',
    title: '版本更新公告',
    items: [
      '修复专长详情中的翻译错误：法术名对齐项目术语（迷踪步、解除魔法、漂浮术、大步奔行、行动无踪等），并修正工具名、技能名与两处错别字。',
      '修正专长规则表述：冲锋手、战地施法者、哨兵、骑乘战斗、地城探索者、领袖之证的详情与 2014 规则原文对齐。',
    ],
  },
]

export function getUpdateNotice(version: string): UpdateNotice | undefined {
  const target = normalizeVersion(version)
  return updateNotices.find((notice) => normalizeVersion(notice.version) === target)
}
