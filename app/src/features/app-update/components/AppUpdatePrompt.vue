<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useAppUpdateStore } from '@/stores/app-update'

const store = useAppUpdateStore()
const { updateAvailable, applying } = storeToRefs(store)

/** 「稍后」只静默本轮；下次进入应用若新版本仍在，会再次提示。 */
const postponed = ref(false)

watch(updateAvailable, (available) => {
  if (available) postponed.value = false
})
</script>

<template>
  <div
    v-if="updateAvailable && !postponed"
    class="app-update"
    role="status"
    aria-live="polite"
  >
    <div class="app-update__body">
      <p class="app-update__title">新版本已就绪</p>
      <p class="app-update__text">刷新后生效；已经保存的角色草稿不会丢失。</p>
    </div>
    <div class="app-update__actions">
      <button
        class="app-update__primary"
        type="button"
        :disabled="applying"
        @click="void store.applyUpdate()"
      >
        {{ applying ? '正在切换…' : '立即刷新' }}
      </button>
      <button
        class="app-update__ghost"
        type="button"
        :disabled="applying"
        @click="postponed = true"
      >
        稍后
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-update {
  position: fixed;
  z-index: 90;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: max(0.75rem, env(safe-area-inset-top)) 1rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: 0 0.25rem 1.25rem rgb(50 38 27 / 12%);

  &__body {
    min-width: 12rem;
    flex: 1;
  }

  &__title,
  &__text {
    margin: 0;
  }

  &__title {
    color: var(--color-primary);
    font-size: 0.9rem;
    font-weight: 700;
  }

  &__text {
    margin-top: 0.15rem;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    flex: none;
    gap: 0.5rem;
  }

  &__primary,
  &__ghost {
    min-height: 2.75rem;
    padding: 0.5rem 0.9rem;
    border-radius: var(--radius-md);
    font-weight: 700;
    cursor: pointer;

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }

    &:focus-visible {
      outline: 0.15rem solid var(--color-primary);
      outline-offset: 0.1rem;
    }
  }

  &__primary {
    border: 1px solid transparent;
    color: var(--color-surface);
    background: var(--color-primary);
  }

  &__ghost {
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    background: var(--color-surface);
  }
}
</style>
