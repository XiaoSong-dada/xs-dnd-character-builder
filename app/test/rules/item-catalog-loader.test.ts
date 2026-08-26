import { afterEach, describe, expect, it } from 'vitest'

import { loadItemCatalog, resetItemCatalogCache } from '@/rules/item-catalog-loader'

describe('item-catalog-loader 延迟加载与缓存', () => {
  afterEach(() => {
    resetItemCatalogCache()
  })

  it('返回完整目录分块（含 description），且条目数大于最小索引目录部分', async () => {
    const items = await loadItemCatalog()
    expect(items.length).toBeGreaterThan(300)
    expect(items.some((item) => item.description.length > 0)).toBe(true)
  })

  it('同一次会话内重复调用复用同一 Promise，不重复加载', async () => {
    const first = loadItemCatalog()
    const second = loadItemCatalog()
    expect(second).toBe(first)
    const items = await first
    expect(items).toHaveLength(318)
  })

  it('清空缓存后重新加载得到新 Promise', async () => {
    const first = loadItemCatalog()
    await first
    resetItemCatalogCache()
    const second = loadItemCatalog()
    expect(second).not.toBe(first)
    await second
  })
})
