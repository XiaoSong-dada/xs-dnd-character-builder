import { afterEach, describe, expect, it } from 'vitest'

import { loadItemCatalog, resetItemCatalogCache } from '@/rules/item-catalog-loader'

describe('item-catalog-loader 版本分派（B09-06）', () => {
  it('2024 返回普通装备与 DMG 2024 魔法物品，且不混入 2014 条目', async () => {
    const { equipment2024 } = await import('@/rules/data/equipment-2024')
    const { magicItems2024 } = await import('@/rules/data/magic-items-2024')
    const items = await loadItemCatalog('5e-2024')

    expect(items).toHaveLength(equipment2024.length + magicItems2024.length)
    expect(items.some((item) => item.id === 'equipment-2024-longsword')).toBe(true)
    expect(items.every((item) => item.id.includes('-2024-'))).toBe(true)
  })

  it('2014 与 2024 目录互不影响，缓存只作用于 2014 分块', async () => {
    const legacyFirst = loadItemCatalog('5e-2014')
    expect(loadItemCatalog('5e-2014')).toBe(legacyFirst)
    const modern = await loadItemCatalog('5e-2024')
    expect(modern.every((item) => item.id.includes('-2024-'))).toBe(true)
    expect(await loadItemCatalog('5e-2014')).toBe(await legacyFirst)
  })
})

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
