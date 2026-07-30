<script setup lang="ts">
withDefaults(defineProps<{ open?: boolean; label: string }>(), { open: false })
defineEmits<{ close: [] }>()
</script>

<template>
  <aside class="ui-drawer" :class="{ 'ui-drawer--open': open }" :aria-label="label">
    <button v-if="open" type="button" class="ui-drawer__close" aria-label="关闭抽屉" @click="$emit('close')">×</button>
    <slot />
  </aside>
</template>

<style scoped lang="scss">
.ui-drawer {
  border-top: 1px solid var(--color-gold);
  background: var(--color-surface);
  box-shadow: 0 -0.5rem 1.25rem rgb(70 52 32 / 8%);

  &--open { max-height: 70dvh; overflow: auto; }
  &__close { float: right; min-width: 2.75rem; min-height: 2.75rem; border: 0; background: transparent; font-size: 1.4rem; }
}
</style>
