<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import UiNotice from '@/components/ui/UiNotice.vue'
import BottomNavigation from '@/layout/components/BottomNavigation.vue'
import { useOwlbearEmbed, useOwlbearStorageUnavailable } from '@/hooks/useOwlbearEmbed'

const route = useRoute()
const owlbearEmbed = useOwlbearEmbed()
const contentElement = ref<HTMLElement | null>(null)
const storageUnavailable = useOwlbearStorageUnavailable(() => owlbearEmbed.value && route.name !== 'session-assistant')
const destinations = [
  { name: 'character-builder', label: '辅助车卡' },
  { name: 'session-assistant', label: '跑团助手' },
  { name: 'workshop', label: '内容工坊' },
] as const

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
    <nav v-if="owlbearEmbed" class="main-layout__embed-nav" aria-label="枭熊车卡助手">
      <RouterLink
        v-for="destination in destinations"
        :key="destination.name"
        :to="route.name === destination.name || (destination.name === 'workshop' && route.name === 'workshop-editor')
          ? route.fullPath
          : { name: destination.name, query: { embed: 'owlbear' } }"
      >{{ destination.label }}</RouterLink>
    </nav>
    <div ref="contentElement" class="main-layout__content">
      <UiNotice v-if="storageUnavailable" tone="warning" title="无法保存角色和自定义内容">
        请允许嵌入页面使用本地存储后重新打开弹窗。
      </UiNotice>
      <RouterView v-else />
    </div>
    <BottomNavigation v-if="!owlbearEmbed" />
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

  &__embed-nav {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.25rem;
    padding: 0.375rem 0.5rem;
    border-bottom: 1px solid var(--color-border);

    a {
      padding: 0.625rem 0.125rem;
      border-radius: 0.5rem;
      color: inherit;
      text-align: center;
      text-decoration: none;

      &[aria-current='page'] {
        background: var(--color-surface-muted);
        font-weight: 700;
      }
    }
  }

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
