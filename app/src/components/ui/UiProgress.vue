<script setup lang="ts">
const props = defineProps<{ value: number; max: number; label?: string }>()
const percent = () => Math.min(100, Math.max(0, (props.value / Math.max(1, props.max)) * 100))
</script>

<template>
  <div class="ui-progress">
    <span v-if="label" class="ui-progress__label">{{ label }}</span>
    <div
      class="ui-progress__track"
      role="progressbar"
      :aria-label="label"
      :aria-valuenow="value"
      aria-valuemin="0"
      :aria-valuemax="max"
    >
      <i :style="{ width: `${percent()}%` }" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-progress {
  display: grid;
  gap: 0.35rem;

  &__label { color: var(--color-text-muted); font-size: 0.75rem; }

  &__track {
    height: 0.25rem;
    overflow: hidden;
    border-radius: 999px;
    background: #e8decd;

    i { display: block; height: 100%; background: var(--color-primary); }
  }
}
</style>
