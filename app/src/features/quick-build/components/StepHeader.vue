<script setup lang="ts">
import UiProgress from '@/components/ui/UiProgress.vue'

defineProps<{
  eyebrow: string
  title: string
  current?: number
  total?: number
}>()
</script>

<template>
  <header class="step-header">
    <div class="step-header__row">
      <div>
        <span>{{ eyebrow }}</span>
        <h1>{{ title }}</h1>
      </div>
      <b v-if="current && total">{{ current }}/{{ total }}</b>
    </div>
    <UiProgress v-if="current && total" :value="current" :max="total" />
  </header>
</template>

<style scoped lang="scss">
.step-header {
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    span { color: var(--color-primary); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; }
    h1 { margin: 0.2rem 0 0; font-size: clamp(1.3rem, 6vw, 1.65rem); line-height: 1.3; }
    b { flex: none; padding: 0.35rem 0.6rem; border: 1px solid var(--color-border); border-radius: 999px; color: var(--color-text-muted); font-size: 0.7rem; }
  }
}
</style>
