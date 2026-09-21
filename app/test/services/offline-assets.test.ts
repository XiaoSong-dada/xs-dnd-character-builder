import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  downloadOfflineAssets,
  offlineAssets,
  readOfflineAssetStatus,
} from '@/services/offline-assets'

/** 只实现服务用到的最小接口：match(url, options)。 */
function createCacheStorage(initial: readonly string[] = []) {
  const stored = new Set<string>(initial)
  return {
    stored,
    match: async (url: string) => (stored.has(url) ? {} : undefined),
  } as unknown as CacheStorage & { stored: Set<string> }
}

function stubFetch(handler: (url: string) => Promise<unknown>): void {
  vi.stubGlobal('fetch', vi.fn((input: unknown) => handler(String(input))))
}

describe('离线资源清单', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('全部位于 /templates/ 下，与 vite.config.ts 的运行时缓存规则保持耦合', () => {
    // 这条断言守住一个隐性约定：Service Worker 只缓存 /templates/ 前缀的请求。
    // 若把模板挪出该目录，一键下载会「看起来成功」但断网时仍然取不到。
    expect(offlineAssets.length).toBeGreaterThan(0)
    for (const asset of offlineAssets) {
      expect(asset.url).toContain('/templates/')
    }
  })

  it('没有缓存能力时全部报告为未下载', async () => {
    const statuses = await readOfflineAssetStatus(undefined)

    expect(statuses).toHaveLength(offlineAssets.length)
    expect(statuses.every((item) => item.cached === false)).toBe(true)
  })

  it('按 URL 命中情况分别报告已下载状态', async () => {
    const storage = createCacheStorage([offlineAssets[0]!.url])

    const statuses = await readOfflineAssetStatus(storage)

    expect(statuses[0]!.cached).toBe(true)
    expect(statuses.slice(1).every((item) => item.cached === false)).toBe(true)
  })

  it('缺少 Cache Storage 时下载直接返回不可用', async () => {
    vi.stubGlobal('caches', undefined)

    await expect(downloadOfflineAssets(undefined, undefined)).resolves.toEqual({
      outcome: 'unavailable',
      failedIds: [],
    })
  })

  it('逐个下载成功后报告完成，并按资源数量推进进度', async () => {
    const storage = createCacheStorage()
    stubFetch(async (url) => {
      // 真实环境下请求会经过 Service Worker，命中 CacheFirst 后写入缓存。
      storage.stored.add(url)
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(0) }
    })
    const progress: number[] = []

    const result = await downloadOfflineAssets((state) => progress.push(state.completed), storage)

    expect(result).toEqual({ outcome: 'completed', failedIds: [] })
    expect(progress).toEqual([1, 2, 3])
    expect(storage.stored.size).toBe(offlineAssets.length)
  })

  it('单个资源请求失败时报告部分失败并指明是哪一个', async () => {
    const storage = createCacheStorage()
    const broken = offlineAssets[1]!
    stubFetch(async (url) => {
      if (url === broken.url) return { ok: false, arrayBuffer: async () => new ArrayBuffer(0) }
      storage.stored.add(url)
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(0) }
    })

    const result = await downloadOfflineAssets(undefined, storage)

    expect(result.outcome).toBe('partial')
    expect(result.failedIds).toEqual([broken.id])
  })

  it('请求成功但没有落到缓存时不算成功', async () => {
    // 对应「Service Worker 没接管页面」这类环境：响应回来了，但断网时依然拿不到资源。
    const storage = createCacheStorage()
    stubFetch(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) }))

    const result = await downloadOfflineAssets(undefined, storage)

    expect(result.outcome).toBe('partial')
    expect(result.failedIds).toHaveLength(offlineAssets.length)
  })

  it('网络异常时不抛出，只报告失败', async () => {
    const storage = createCacheStorage()
    stubFetch(async () => {
      throw new TypeError('Failed to fetch')
    })

    const result = await downloadOfflineAssets(undefined, storage)

    expect(result.outcome).toBe('partial')
    expect(result.failedIds).toHaveLength(offlineAssets.length)
  })
})
