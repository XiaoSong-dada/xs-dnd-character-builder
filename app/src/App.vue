<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

import AppUpdatePrompt from '@/features/app-update/components/AppUpdatePrompt.vue'
import UpdateNoticeModal from '@/features/update-notice/components/UpdateNoticeModal.vue'
import { useAppUpdateStore } from '@/stores/app-update'
import { useCustomContentStore } from '@/stores/custom-content'
import { useUpdateNoticeStore } from '@/stores/update-notice'

const updateNoticeStore = useUpdateNoticeStore()
const appUpdateStore = useAppUpdateStore()
// 内容工坊：setup 阶段同步读入本机自定义内容并注册到规则仓库，早于任何页面渲染，
// 因此车卡首屏即可看到自定义条目。预渲染期无 localStorage，store 内已静默降级为空库。
useCustomContentStore()

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
