import { ref } from 'vue'
import { defineStore } from 'pinia'

import { applyServiceWorkerUpdate, isServiceWorkerSupported, registerServiceWorker } from '@/services/service-worker'

/**
 * 离线外壳状态：Service Worker 注册与「有新版本」提示。
 *
 * 新版本不会自动刷新页面——玩家可能正停在车卡第 7 步填物品，
 * 因此这里只把状态置为可更新，由 `ServiceWorkerUpdatePrompt` 出非阻断提示，用户点了才刷新。
 */
export const useServiceWorkerStore = defineStore('service-worker', () => {
  const initialized = ref(false)
  const supported = ref(isServiceWorkerSupported())
  const updateAvailable = ref(false)
  /** 已经发出激活指令，正在等待浏览器接管并刷新；此时按钮转为进行中。 */
  const applying = ref(false)

  async function initialize(): Promise<void> {
    if (initialized.value) return
    initialized.value = true
    await registerServiceWorker(() => {
      updateAvailable.value = true
    })
  }

  function applyUpdate(): void {
    if (applying.value || !updateAvailable.value) return
    applying.value = applyServiceWorkerUpdate()
  }

  return { initialized, supported, updateAvailable, applying, initialize, applyUpdate }
})
