<script setup lang="ts">
import { RouterLink } from 'vue-router'

import navigationSprite from '@/assets/icons/navigation.svg?raw'
import { useBottomNavigation } from '@/layout/hooks/useBottomNavigation'

const { navigationItems, onNavigationClick } = useBottomNavigation()
</script>

<template>
  <nav class="bottom-navigation" aria-label="主要功能">
    <div
      class="bottom-navigation__sprite"
      aria-hidden="true"
      v-html="navigationSprite"
    />
    <RouterLink
      v-for="item in navigationItems"
      :key="item.routeName"
      class="bottom-navigation__link"
      :to="{ name: item.routeName }"
      @click="onNavigationClick($event, item.routeName)"
    >
      <svg
        class="bottom-navigation__icon"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
      >
        <use :href="`#${item.iconId}`" />
      </svg>
      <span class="bottom-navigation__label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped lang="scss">
.bottom-navigation {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  flex: none;
  gap: 0.25rem;
  padding: 0.5rem max(0.5rem, env(safe-area-inset-right))
    max(0.5rem, env(safe-area-inset-bottom)) max(0.5rem, env(safe-area-inset-left));
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: 0 -0.25rem 1.25rem rgb(50 38 27 / 8%);
}

.bottom-navigation__sprite {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

.bottom-navigation__link {
  display: flex;
  min-width: 0;
  min-height: 3.5rem;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.2rem;
  border-radius: 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.2;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;

  &:focus-visible {
    outline: 0.15rem solid var(--color-primary);
    outline-offset: 0.1rem;
  }

  &.router-link-exact-active {
    color: var(--color-primary);
    background: var(--color-primary-soft);
    font-weight: 700;
  }
}

.bottom-navigation__icon {
  width: 1.5rem;
  height: 1.5rem;
  flex: none;
}

.bottom-navigation__label {
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
