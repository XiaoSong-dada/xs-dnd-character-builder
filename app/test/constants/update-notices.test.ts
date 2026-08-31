import { describe, expect, it } from 'vitest'

import { getUpdateNotice } from '@/constants/update-notices'
import { normalizeVersion } from '@/utils/version'

describe('版本更新公告配置', () => {
  it('归一化前导 v 与空白，并按当前版本查找公告', () => {
    expect(normalizeVersion(' v1.1.2 ')).toBe('1.1.2')
    expect(normalizeVersion('   ')).toBeUndefined()
    expect(getUpdateNotice('v1.1.2')?.items.length).toBeGreaterThan(0)
  })

  it('缺少版本公告时返回 undefined', () => {
    expect(getUpdateNotice('9.9.9')).toBeUndefined()
  })
})
