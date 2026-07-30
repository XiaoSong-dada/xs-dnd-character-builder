<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

withDefaults(
  defineProps<{
    primaryLabel: string
    secondaryLabel?: string
    primaryDisabled?: boolean
  }>(),
  {
    secondaryLabel: '',
    primaryDisabled: false,
  },
)

defineEmits<{ primary: []; secondary: [] }>()
</script>

<template>
  <div class="sticky-action-bar">
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
}
</style>
