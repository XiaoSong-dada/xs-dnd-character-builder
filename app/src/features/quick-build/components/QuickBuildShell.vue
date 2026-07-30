<script setup lang="ts">
defineProps<{ hasDrawer?: boolean; hasActions?: boolean }>()
</script>

<template>
  <div
    class="quick-build-shell"
    :class="{
      'quick-build-shell--drawer': hasDrawer,
      'quick-build-shell--actions': hasActions,
    }"
  >
    <slot name="header" />
    <main class="quick-build-shell__content"><slot /></main>
    <div v-if="$slots.drawer" class="quick-build-shell__drawer"><slot name="drawer" /></div>
    <div v-if="$slots.actions" class="quick-build-shell__actions"><slot name="actions" /></div>
  </div>
</template>

<style scoped lang="scss">
.quick-build-shell {
  position: relative;
  width: min(100%, 32rem);
  min-height: 100%;
  margin-inline: auto;
  background: var(--color-background);

  &__content { padding: 0.75rem 1rem 2rem; }
  &--drawer &__content { padding-bottom: 6.5rem; }
  &--actions &__content { padding-bottom: 6rem; }
  &--drawer#{&}--actions &__content { padding-bottom: 10.5rem; }
  &--drawer#{&}--actions &__drawer { bottom: 4.75rem; }

  &__drawer,
  &__actions {
    position: sticky;
    z-index: 5;
    bottom: 0;
  }
}
</style>
