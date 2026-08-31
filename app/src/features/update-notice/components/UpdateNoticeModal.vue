<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import UiScrollModal from '@/components/ui/UiScrollModal.vue'
import { useUpdateNoticeStore } from '@/stores/update-notice'

const store = useUpdateNoticeStore()
const { isOpen, notice } = storeToRefs(store)
const confirmButton = ref<HTMLButtonElement>()
let previousFocus: HTMLElement | null = null

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !isOpen.value) return
  event.preventDefault()
  store.dismiss()
}

watch(isOpen, async (open, wasOpen) => {
  if (open) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick()
    confirmButton.value?.focus()
  } else if (wasOpen) {
    await nextTick()
    previousFocus?.focus()
    previousFocus = null
  }
})

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <UiScrollModal
    :open="isOpen && Boolean(notice)"
    :title="notice ? `已更新至 v${notice.version}` : '版本更新公告'"
    @close="store.dismiss"
  >
    <article v-if="notice" class="update-notice">
      <p class="update-notice__eyebrow">{{ notice.title }}</p>
      <p class="update-notice__intro">感谢使用 D&amp;D 车卡辅助，本次更新包括：</p>
      <ul class="update-notice__items">
        <li v-for="item in notice.items" :key="item">{{ item }}</li>
      </ul>
    </article>

    <template #footer>
      <button ref="confirmButton" type="button" class="update-notice__confirm" @click="store.dismiss">
        我知道了
      </button>
    </template>
  </UiScrollModal>
</template>

<style scoped lang="scss">
.update-notice {
  display: grid;
  gap: 0.9rem;

  &__eyebrow,
  &__intro,
  &__items {
    margin: 0;
  }

  &__eyebrow {
    color: var(--color-primary);
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  &__intro {
    color: var(--color-text-muted);
    line-height: 1.7;
  }

  &__items {
    display: grid;
    gap: 0.75rem;
    padding-left: 1.25rem;

    li {
      padding-left: 0.25rem;
      line-height: 1.75;
    }
  }

  &__confirm {
    width: 100%;
    min-height: 3rem;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    color: var(--color-surface);
    background: var(--color-primary);
    font-weight: 700;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  }
}
</style>
