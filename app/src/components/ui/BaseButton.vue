<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'text' | 'danger'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    disabled: false,
    type: 'button',
  },
)
</script>

<template>
  <button
    class="base-button"
    :class="`base-button--${variant}`"
    :disabled="disabled"
    :type="type"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.base-button {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.7rem 1rem;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    color: #9d968b;
    background: #e5ddd1;
    border-color: transparent;
    cursor: not-allowed;
  }

  &--primary {
    color: var(--color-surface);
    background: var(--color-primary);
    box-shadow: 0 0.35rem 0.9rem rgb(143 45 45 / 16%);

    &:not(:disabled):active {
      background: var(--color-primary-strong);
    }
  }

  &--secondary {
    color: var(--color-primary);
    background: var(--color-surface);
    border-color: var(--color-border);
  }

  &--text {
    color: var(--color-primary);
    background: transparent;
  }

  &--danger {
    color: var(--color-surface);
    background: var(--color-error);
  }
}
</style>
