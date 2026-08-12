<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    state?: 'default' | 'selected' | 'recommended' | 'complete' | 'locked' | 'incompatible' | 'error'
    disabledReason?: string
  }>(),
  {
    description: '',
    state: 'default',
    disabledReason: '',
  },
)

defineEmits<{ select: [] }>()
</script>

<template>
  <button
    type="button"
    class="option-card"
    :class="`option-card--${state}`"
    :disabled="state === 'locked'"
    :aria-pressed="state === 'selected'"
    @click="$emit('select')"
  >
    <span class="option-card__mark" aria-hidden="true">
      {{ state === 'selected' || state === 'complete' ? '✓' : '' }}
    </span>
    <span class="option-card__content">
      <strong>{{ title }}</strong>
      <small v-if="description">{{ description }}</small>
      <small v-if="disabledReason" class="option-card__reason">{{ disabledReason }}</small>
    </span>
    <span class="option-card__suffix"><slot name="suffix">›</slot></span>
  </button>
</template>

<style scoped lang="scss">
.option-card {
  display: flex;
  width: 100%;
  min-height: 4.25rem;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  background: var(--color-surface);
  text-align: left;
  cursor: pointer;

  &__mark {
    display: grid;
    width: 1.4rem;
    height: 1.4rem;
    flex: none;
    place-items: center;
    border: 1px solid var(--color-border);
    border-radius: 50%;
    color: var(--color-surface);
    font-size: 0.75rem;
  }

  &__content {
    display: grid;
    min-width: 0;
    flex: 1;
    gap: 0.15rem;

    strong { font-size: 0.9rem; }
    small { color: var(--color-text-muted); line-height: 1.45; }
  }

  &__reason { color: var(--color-error) !important; }
  &__suffix {
    // flex 居中：suffix 内徽章为 inline-flex，行内基线对齐会导致视觉偏上，几何居中消除偏移
    display: flex;
    flex: none;
    align-items: center;
    color: var(--color-text-muted);
    font-size: 1.25rem;
  }

  &--selected,
  &--recommended {
    border-color: var(--color-primary);
    background: #fff9f6;
    box-shadow: inset 0.2rem 0 var(--color-primary);
  }

  &--complete {
    border-color: var(--color-success);
    background: var(--color-success-soft);
  }

  &--selected &__mark,
  &--recommended &__mark { border-color: var(--color-primary); background: var(--color-primary); }
  &--complete &__mark { border-color: var(--color-success); background: var(--color-success); }
  &--incompatible { border-color: var(--color-warning); background: var(--color-warning-soft); }
  &--error { border-color: var(--color-error); background: var(--color-error-soft); }
  &--locked { opacity: 0.6; cursor: not-allowed; }
}
</style>
