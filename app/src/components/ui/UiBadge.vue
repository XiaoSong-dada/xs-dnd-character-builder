<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'error'
  }>(),
  { tone: 'neutral' },
)
</script>

<template>
  <span class="ui-badge" :class="`ui-badge--${tone}`"><slot /></span>
</template>

<style scoped lang="scss">
.ui-badge {
  display: inline-flex;
  min-height: 1.5rem;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  color: var(--color-text-muted);
  background: #eee6da;
  font-size: 0.68rem;
  font-weight: 700;

  &--primary { color: var(--color-primary); background: var(--color-primary-soft); }
  &--success { color: var(--color-success); background: var(--color-success-soft); }
  &--warning { color: var(--color-warning); background: var(--color-warning-soft); }
  &--error { color: var(--color-error); background: var(--color-error-soft); }
}
</style>
