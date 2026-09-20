import {
  CHARACTER_SHEET_FONT_URL,
  CHARACTER_SHEET_PDF_TEMPLATE_URL,
  CHARACTER_SHEET_XLSX_TEMPLATE_URL,
} from '@/services/character-sheet-templates'

/**
 * 离线资源清单：导出角色卡时按需 fetch 的模板文件。
 *
 * 这些文件不进 Service Worker 预缓存（合计约 2.5 MB，会明显拖慢首次安装），
 * 改为运行时按需缓存：正常导出过一次就会留在本地，也可以在「关于本站 → 离线使用」里一键下载。
 *
 * 与 `vite.config.ts` 的 workbox 规则通过 `/templates/` 前缀耦合：
 * 新增或移动模板文件时，必须同时更新本清单与那条运行时缓存正则。
 * `approximateKb` 为 `app/public/templates/` 下的实测体积，仅用于界面说明，不参与逻辑。
 */
export interface OfflineAsset {
  readonly id: 'pdf-template' | 'xlsx-template' | 'font'
  readonly label: string
  readonly description: string
  readonly url: string
  readonly approximateKb: number
}

export const offlineAssets: readonly OfflineAsset[] = [
  {
    id: 'pdf-template',
    label: 'PDF 角色卡模板',
    description: '导出 PDF 角色卡使用',
    url: CHARACTER_SHEET_PDF_TEMPLATE_URL,
    approximateKb: 1277,
  },
  {
    id: 'xlsx-template',
    label: 'Excel 角色卡模板',
    description: '导出 XLSX 表格使用',
    url: CHARACTER_SHEET_XLSX_TEMPLATE_URL,
    approximateKb: 50,
  },
  {
    id: 'font',
    label: '中文字体子集',
    description: 'PDF 中文渲染使用',
    url: CHARACTER_SHEET_FONT_URL,
    approximateKb: 1182,
  },
]

export interface OfflineAssetStatus {
  readonly asset: OfflineAsset
  readonly cached: boolean
}

export interface OfflineAssetDownloadProgress {
  readonly completed: number
  readonly total: number
  readonly failedIds: readonly string[]
}

export type OfflineAssetDownloadOutcome = 'completed' | 'partial' | 'unavailable'

export interface OfflineAssetDownloadResult {
  readonly outcome: OfflineAssetDownloadOutcome
  readonly failedIds: readonly string[]
}

/**
 * 只有「浏览器支持 Cache Storage」且「Service Worker 已接管当前页面」时下载才有意义：
 * 否则请求不经过 Service Worker，也就不会被离线保存下来。
 */
function activeCacheStorage(): CacheStorage | undefined {
  if (typeof caches === 'undefined' || typeof navigator === 'undefined') return undefined
  if (!navigator.serviceWorker?.controller) return undefined
  return caches
}

/** 读取各离线资源是否已在本地，用于界面展示「已下载 / 未下载」。 */
export async function readOfflineAssetStatus(
  storage: CacheStorage | undefined = activeCacheStorage(),
): Promise<readonly OfflineAssetStatus[]> {
  if (!storage) return offlineAssets.map((asset) => ({ asset, cached: false }))
  return Promise.all(offlineAssets.map(async (asset) => ({
    asset,
    cached: Boolean(await storage.match(asset.url, { ignoreSearch: true })),
  })))
}

async function cacheOneAsset(asset: OfflineAsset): Promise<boolean> {
  try {
    // cache: 'reload' 跳过 HTTP 缓存，确保确实产生一次网络往返；
    // 否则浏览器直接返回 HTTP 缓存副本时，Service Worker 的缓存仍可能是空的。
    const response = await fetch(asset.url, { cache: 'reload' })
    if (!response.ok) return false
    // 读完 body，保证响应被完整消费后再去复查缓存。
    await response.arrayBuffer()
    return true
  } catch {
    return false
  }
}

/**
 * 逐个下载离线资源并确认已落到本地缓存。
 * 逐个而非并发：失败时能指出具体是哪一个，也避免一次性打满弱网连接。
 */
export async function downloadOfflineAssets(
  onProgress?: (progress: OfflineAssetDownloadProgress) => void,
  storage: CacheStorage | undefined = activeCacheStorage(),
): Promise<OfflineAssetDownloadResult> {
  if (!storage) return { outcome: 'unavailable', failedIds: [] }

  const failedIds: string[] = []
  let completed = 0
  for (const asset of offlineAssets) {
    const fetched = await cacheOneAsset(asset)
    // 请求成功还不够：必须能在缓存里复查到，否则断网时依然拿不到资源。
    const stored = fetched ? Boolean(await storage.match(asset.url, { ignoreSearch: true })) : false
    if (!stored) failedIds.push(asset.id)
    completed += 1
    onProgress?.({ completed, total: offlineAssets.length, failedIds: [...failedIds] })
  }
  return { outcome: failedIds.length === 0 ? 'completed' : 'partial', failedIds }
}
