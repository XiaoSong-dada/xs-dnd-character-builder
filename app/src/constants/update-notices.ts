import type { UpdateNotice } from '@/types/update-notice'
import { normalizeVersion } from '@/utils/version'

export const updateNotices: readonly UpdateNotice[] = [
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
