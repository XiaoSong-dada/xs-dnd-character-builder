<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import BottomNavigation from '@/layout/components/BottomNavigation.vue'

const route = useRoute()
const contentElement = ref<HTMLElement | null>(null)

watch(
  () => route.name,
  (currentRouteName, previousRouteName) => {
    if (previousRouteName !== undefined && currentRouteName !== previousRouteName) {
      void nextTick(() => contentElement.value?.scrollTo({ top: 0 }))
    }
  },
)
</script>

<template>
  <div class="main-layout">
    <div ref="contentElement" class="main-layout__content">
      <RouterView />
    </div>
    <BottomNavigation />
  </div>
</template>

<style scoped lang="scss">
.main-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-background);

  &__content {
    min-height: 0;
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    scrollbar-gutter: stable;
  }
}
</style>
