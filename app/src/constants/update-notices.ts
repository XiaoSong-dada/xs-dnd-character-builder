import type { UpdateNotice } from '@/types/update-notice'
import { normalizeVersion } from '@/utils/version'

export const updateNotices: readonly UpdateNotice[] = [
  {
    version: '1.1.3',
    title: '版本更新公告',
    items: [
      '专长译名全面对齐 5e 不全书：2014 体系 46 项专长与 2024 专长索引均按不全书命名更新（如 坚韧→强健身心、医者→医疗师、熟练→熟习）。',
      '强健身心（Resilient）新增属性子选择：选择一项属性 +1，并获得该属性的豁免熟练，角色卡豁免自动派生。',
    ],
  },
]

export function getUpdateNotice(version: string): UpdateNotice | undefined {
  const target = normalizeVersion(version)
  return updateNotices.find((notice) => normalizeVersion(notice.version) === target)
}
