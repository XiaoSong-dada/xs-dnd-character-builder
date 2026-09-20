import { computed, onMounted, ref } from 'vue'

import {
  downloadOfflineAssets,
  offlineAssets,
  readOfflineAssetStatus,
  type OfflineAssetStatus,
} from '@/services/offline-assets'
import { isStoragePersisted, requestPersistentStorage } from '@/services/persistent-storage'

export type OfflineDownloadState = 'idle' | 'downloading' | 'completed' | 'partial' | 'unavailable'

/**
 * 关于本站「离线使用」区块：展示导出模板的本地缓存状态，并提供一键下载。
 *
 * 这些模板不进安装时的预缓存（合计约 2.5 MB），所以「没下载过 + 断网」会导致导出失败；
 * 这里让玩家可以提前把它们存到本机。
 */
export function useOfflineAssets() {
  const statuses = ref<readonly OfflineAssetStatus[]>(
    offlineAssets.map((asset) => ({ asset, cached: false })),
  )
  const state = ref<OfflineDownloadState>('idle')
  const completedCount = ref(0)
  const storagePersisted = ref(false)

  const totalCount = offlineAssets.length
  const cachedCount = computed(() => statuses.value.filter((item) => item.cached).length)
  const allCached = computed(() => totalCount > 0 && cachedCount.value === totalCount)
  const progressPercent = computed(() => (
    totalCount > 0 ? Math.round((completedCount.value / totalCount) * 100) : 0
  ))
  const estimatedSizeLabel = computed(() => (
    `${(offlineAssets.reduce((sum, asset) => sum + asset.approximateKb, 0) / 1024).toFixed(1)} MB`
  ))

  const feedback = computed(() => {
    switch (state.value) {
      case 'downloading':
        return `正在下载 ${completedCount.value}/${totalCount}…`
      case 'completed':
        return '离线资源已全部就绪，断网也能导出角色卡了。'
      case 'partial':
        return '部分资源没有下载成功，请确认网络后重试。'
      case 'unavailable':
        return '当前环境没有启用离线能力：需要通过 HTTPS 访问，并等页面完全加载后重试。'
      default:
        return ''
    }
  })

  async function refresh(): Promise<void> {
    statuses.value = await readOfflineAssetStatus()
    storagePersisted.value = await isStoragePersisted()
  }

  async function download(): Promise<void> {
    if (state.value === 'downloading') return
    state.value = 'downloading'
    completedCount.value = 0
    // 用户刚表达了「我要离线用」，这是申请持久化存储最有意义的时机：
    // 浏览器通常只在已安装 / 有收藏 / 达到使用度时才授予，页面刚打开时申请基本会被拒。
    const outcome = await requestPersistentStorage()
    if (outcome === 'granted') storagePersisted.value = true
    const result = await downloadOfflineAssets((progress) => {
      completedCount.value = progress.completed
    })
    await refresh()
    state.value = result.outcome
  }

  onMounted(() => {
    void refresh()
  })

  return {
    assets: offlineAssets,
    statuses,
    state,
    cachedCount,
    totalCount,
    allCached,
    progressPercent,
    estimatedSizeLabel,
    storagePersisted,
    feedback,
    download,
  }
}
