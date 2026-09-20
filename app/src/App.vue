<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

import AppUpdatePrompt from '@/features/app-update/components/AppUpdatePrompt.vue'
import UpdateNoticeModal from '@/features/update-notice/components/UpdateNoticeModal.vue'
import { useAppUpdateStore } from '@/stores/app-update'
import { useUpdateNoticeStore } from '@/stores/update-notice'

const updateNoticeStore = useUpdateNoticeStore()
const appUpdateStore = useAppUpdateStore()

// onMounted 只在浏览器端执行：vite-ssg 预渲染期不会触碰 Service Worker API。
onMounted(() => {
  updateNoticeStore.initialize()
  void appUpdateStore.initialize()
})
</script>

<template>
  <RouterView />
  <UpdateNoticeModal />
  <AppUpdatePrompt />
</template>
