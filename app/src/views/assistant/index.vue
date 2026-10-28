<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import { useAssistantShell } from '@/views/assistant/hooks/useAssistantShell'

const { sections, isActive } = useAssistantShell()
</script>

<template>
  <div class="assistant-shell">
    <header class="assistant-shell__header">
      <h1 class="assistant-shell__title">跑团助手</h1>
      <nav class="assistant-shell__switcher" aria-label="跑团助手功能">
        <RouterLink
          v-for="section in sections"
          :key="section.routeName"
          class="assistant-shell__switch"
          :class="{ 'assistant-shell__switch--active': isActive(section) }"
          :to="{ name: section.routeName }"
          :aria-current="isActive(section) ? 'page' : undefined"
        >
          {{ section.label }}
        </RouterLink>
      </nav>
    </header>
    <RouterView />
  </div>
</template>

<style scoped lang="scss">
.assistant-shell {
  display: flex;
  min-height: 100%;
  flex-direction: column;

  &__header {
    display: grid;
    gap: 0.75rem;
    padding: 1rem 1rem 0;
  }

  &__title {
    margin: 0;
    font-size: 1.25rem;
  }

  &__switcher {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.25rem;
    padding: 0.25rem;
    border-radius: 0.9rem;
    background: var(--color-surface-muted, #f0ece4);
  }

  &__switch {
    display: flex;
    min-height: 2.75rem;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
    color: var(--color-text-muted);
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;

    &:focus-visible {
      outline: 0.15rem solid var(--color-primary);
      outline-offset: 0.1rem;
    }

    &--active {
      background: var(--color-surface);
      color: var(--color-primary);
      font-weight: 700;
      box-shadow: 0 0.1rem 0.4rem rgb(50 38 27 / 10%);
    }
  }
}
</style>
