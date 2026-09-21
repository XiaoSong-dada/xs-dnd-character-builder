<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

withDefaults(
  defineProps<{
    primaryLabel: string
    secondaryLabel?: string
    primaryDisabled?: boolean
    helperText?: string
    helperHref?: string
  }>(),
  {
    secondaryLabel: '',
    primaryDisabled: false,
    helperText: '',
    helperHref: '',
  },
)

defineEmits<{ primary: []; secondary: [] }>()
</script>

<template>
  <div class="sticky-action-bar">
    <p v-if="helperText" class="sticky-action-bar__helper">
      {{ helperText }}
      <a v-if="helperHref" :href="helperHref">去完成</a>
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
    margin: 0;
    color: var(--color-warning);
    font-size: 0.72rem;
    line-height: 1.4;

    a { margin-left: 0.35rem; color: var(--color-primary); font-weight: 700; }
  }
}
</style>
