import type { UpdateNotice } from '@/types/update-notice'
import { normalizeVersion } from '@/utils/version'

export const updateNotices: readonly UpdateNotice[] = [
  {
    version: '1.1.2',
    title: '版本更新公告',
    items: [
      '新增版本更新公告：首次访问或网站版本变化时展示最新内容，确认后同一版本不再重复提示。',
      '修复“添加物品”弹窗展开装备详情后内容被裁切的问题，详情现在会完整撑开卡片。',
    ],
  },
]

export function getUpdateNotice(version: string): UpdateNotice | undefined {
  const target = normalizeVersion(version)
  return updateNotices.find((notice) => normalizeVersion(notice.version) === target)
}
