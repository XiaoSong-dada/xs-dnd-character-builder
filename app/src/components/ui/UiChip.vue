<script setup lang="ts">
withDefaults(
  defineProps<{
    selected?: boolean
    disabled?: boolean
  }>(),
  {
    selected: false,
    disabled: false,
  },
)

defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    type="button"
    class="ui-chip"
    :class="{ 'ui-chip--selected': selected }"
    :disabled="disabled"
    :aria-pressed="selected"
    @click="$emit('toggle')"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.ui-chip {
  min-height: 2.75rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
  background: var(--color-surface);
  font-size: 0.8rem;
  cursor: pointer;

  &--selected {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: var(--color-primary-soft);
    font-weight: 700;

    &::before {
      content: "✓";
      margin-right: 0.3rem;
    }
  }
}
</style>
