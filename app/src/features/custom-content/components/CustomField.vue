<script setup lang="ts">
import UiBadge from '@/components/ui/UiBadge.vue'

const props = withDefaults(
  defineProps<{
    label: string
    hint?: string
    required?: boolean
    /** `computed` 标注"会影响自动计算"，`display` 标注"仅展示"；不传则不标注。 */
    automation?: 'computed' | 'display'
    error?: string
    /** 传入时渲染为 `<label for>`；多控件组（chip 组）请用 `<fieldset>` 自行组织。 */
    forId?: string
  }>(),
  { hint: '', required: false, error: '', forId: '' },
)
</script>

<template>
  <div class="custom-field">
    <label v-if="props.forId" class="custom-field__label" :for="props.forId">
      {{ props.label }}<span v-if="props.required" class="custom-field__required" aria-hidden="true">*</span>
      <UiBadge v-if="props.automation === 'computed'" tone="success">会影响自动计算</UiBadge>
      <UiBadge v-else-if="props.automation === 'display'" tone="neutral">仅展示</UiBadge>
    </label>
    <span v-else class="custom-field__label">
      {{ props.label }}<span v-if="props.required" class="custom-field__required" aria-hidden="true">*</span>
      <UiBadge v-if="props.automation === 'computed'" tone="success">会影响自动计算</UiBadge>
      <UiBadge v-else-if="props.automation === 'display'" tone="neutral">仅展示</UiBadge>
    </span>
    <slot />
    <span v-if="props.hint" class="custom-field__hint">{{ props.hint }}</span>
    <span v-if="props.error" class="custom-field__error" role="alert">{{ props.error }}</span>
  </div>
</template>

<style scoped lang="scss">
.custom-field {
  display: grid;
  gap: 0.35rem;

  &__label {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    font-weight: 600;
  }

  &__required {
    color: var(--color-danger, #c0392b);
  }

  &__hint {
    color: var(--color-text-muted);
    font-size: 0.72rem;
    line-height: 1.5;
  }

  &__error {
    color: var(--color-danger, #c0392b);
    font-size: 0.75rem;
  }

  :deep(input),
  :deep(select),
  :deep(textarea) {
    min-height: 2.75rem;
    padding: 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font: inherit;
  }

  :deep(textarea) {
    resize: vertical;
  }
}
</style>
