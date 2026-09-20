<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

import ServiceWorkerUpdatePrompt from '@/features/service-worker/components/ServiceWorkerUpdatePrompt.vue'
import UpdateNoticeModal from '@/features/update-notice/components/UpdateNoticeModal.vue'
import { useServiceWorkerStore } from '@/stores/service-worker'
import { useUpdateNoticeStore } from '@/stores/update-notice'

const updateNoticeStore = useUpdateNoticeStore()
const serviceWorkerStore = useServiceWorkerStore()

// onMounted 只在浏览器端执行：vite-ssg 预渲染期不会触碰 Service Worker API。
onMounted(() => {
  updateNoticeStore.initialize()
  void serviceWorkerStore.initialize()
})
</script>

<template>
  <RouterView />
  <UpdateNoticeModal />
  <ServiceWorkerUpdatePrompt />
</template>
