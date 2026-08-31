import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { siteConfig } from '@/config/site'
import { getUpdateNotice } from '@/constants/update-notices'
import { UpdateNoticeStorageService } from '@/services/update-notice-storage'
import { normalizeVersion } from '@/utils/version'

export const useUpdateNoticeStore = defineStore('update-notice', () => {
  const isOpen = ref(false)
  const initialized = ref(false)
  const notice = computed(() => getUpdateNotice(siteConfig.version))

  function validateNotice(): boolean {
    if (notice.value) return true
    if (import.meta.env.DEV) {
      console.error(`当前版本 ${siteConfig.version} 缺少更新公告数据。`)
    }
    return false
  }

  function initialize(): void {
    if (initialized.value) return
    initialized.value = true
    if (!validateNotice()) return
    const currentVersion = normalizeVersion(siteConfig.version)
    isOpen.value = UpdateNoticeStorageService.loadLastSeenVersion() !== currentVersion
  }

  function openManual(): void {
    if (validateNotice()) isOpen.value = true
  }

  function dismiss(): void {
    isOpen.value = false
    if (notice.value) UpdateNoticeStorageService.saveLastSeenVersion(notice.value.version)
  }

  return { isOpen, initialized, notice, initialize, openManual, dismiss }
})
