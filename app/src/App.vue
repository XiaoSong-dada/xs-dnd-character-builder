<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

import UpdateNoticeModal from '@/features/update-notice/components/UpdateNoticeModal.vue'
import { useUpdateNoticeStore } from '@/stores/update-notice'

const updateNoticeStore = useUpdateNoticeStore()
onMounted(() => updateNoticeStore.initialize())
</script>

<template>
  <RouterView />
  <UpdateNoticeModal />
</template>
