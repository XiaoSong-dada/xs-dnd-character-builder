<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

import AppUpdatePrompt from '@/features/app-update/components/AppUpdatePrompt.vue'
import UpdateNoticeModal from '@/features/update-notice/components/UpdateNoticeModal.vue'
import { useOwlbearEmbed } from '@/hooks/useOwlbearEmbed'
import { useAppUpdateStore } from '@/stores/app-update'
import { useUpdateNoticeStore } from '@/stores/update-notice'

const updateNoticeStore = useUpdateNoticeStore()
const appUpdateStore = useAppUpdateStore()
const owlbearEmbed = useOwlbearEmbed()
// onMounted 只在浏览器端执行：vite-ssg 预渲染期不会触碰 Service Worker API。
onMounted(() => {
  updateNoticeStore.initialize()
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const initialize = () => { void appUpdateStore.initialize() }
    if ('requestIdleCallback' in window) window.requestIdleCallback(initialize, { timeout: 2000 })
    else setTimeout(initialize, 0)
  }))
})
</script>

<template>
  <RouterView />
  <UpdateNoticeModal v-if="!owlbearEmbed" />
  <AppUpdatePrompt v-if="!owlbearEmbed" />
</template>
