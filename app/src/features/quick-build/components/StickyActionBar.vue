<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

withDefaults(
  defineProps<{
    primaryLabel: string
    secondaryLabel?: string
    primaryDisabled?: boolean
    helperText?: string
    /** 提示行是否需要「去完成」动作；动作本身由页面接线到当前步骤（v1.9.1 R3-6）。 */
    helperAction?: boolean
  }>(),
  {
    secondaryLabel: '',
    primaryDisabled: false,
    helperText: '',
    helperAction: false,
  },
)

defineEmits<{ primary: []; secondary: []; helperAction: [] }>()
</script>

<template>
  <div class="sticky-action-bar">
    <p v-if="helperText" class="sticky-action-bar__helper">
      {{ helperText }}
      <button v-if="helperAction" type="button" class="sticky-action-bar__action" @click="$emit('helperAction')">
        去完成
      </button>
    </p>
    <BaseButton v-if="secondaryLabel" variant="secondary" @click="$emit('secondary')">
      {{ secondaryLabel }}
    </BaseButton>
    <BaseButton :disabled="primaryDisabled" @click="$emit('primary')">{{ primaryLabel }}</BaseButton>
  </div>
</template>

<style scoped lang="scss">
.sticky-action-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr);
  gap: 0.65rem;
  padding: 0.75rem 1rem max(0.75rem, env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-border);
  background: var(--color-background);

  > :only-child { grid-column: 1 / -1; }

  &__helper {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
    color: var(--color-warning);
    font-size: 0.72rem;
    line-height: 1.4;
  }

  &__action {
    min-height: 2.75rem;
    padding: 0 0.25rem;
    border: 0;
    color: var(--color-primary);
    background: transparent;
    font-weight: 700;
    text-decoration: underline;
    cursor: pointer;

    &:focus-visible { outline: 0.15rem solid var(--color-primary); outline-offset: 0.15rem; }
  }
}
</style>
