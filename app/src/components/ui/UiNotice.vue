<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'info' | 'success' | 'warning' | 'error'
    title: string
  }>(),
  { tone: 'info' },
)
</script>

<template>
  <aside class="ui-notice" :class="`ui-notice--${tone}`" :role="tone === 'error' ? 'alert' : 'status'">
    <span aria-hidden="true">{{ tone === 'success' ? '✓' : tone === 'info' ? 'i' : '!' }}</span>
    <div>
      <strong>{{ title }}</strong>
      <p><slot /></p>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.ui-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);

  > span {
    display: grid;
    width: 1.4rem;
    height: 1.4rem;
    flex: none;
    place-items: center;
    border: 1px solid currentColor;
    border-radius: 50%;
    font-weight: 700;
  }

  strong { font-size: 0.82rem; }
  p { margin: 0.2rem 0 0; color: var(--color-text-muted); font-size: 0.78rem; line-height: 1.55; }

  &--success { color: var(--color-success); border-color: #9ab9aa; background: var(--color-success-soft); }
  &--warning { color: var(--color-warning); border-color: #d8b07f; background: var(--color-warning-soft); }
  &--error { color: var(--color-error); border-color: #dca19d; background: var(--color-error-soft); }
  &--info { color: var(--color-primary); }
}
</style>
