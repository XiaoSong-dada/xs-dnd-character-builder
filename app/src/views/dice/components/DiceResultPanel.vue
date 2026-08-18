<script setup lang="ts">
import type { DieType, LogicalRollResult } from '@/types/dice'

defineProps<{ groups: Array<{ type: DieType; results: LogicalRollResult[] }>; total: number }>()
</script>

<template>
  <section class="dice-results" aria-live="polite" aria-atomic="true">
    <div class="dice-results__total"><span>本次总和</span><strong>{{ total }}</strong></div>
    <div class="dice-results__groups">
      <div v-for="group in groups" :key="group.type" class="dice-results__group">
        <strong>{{ group.type }}</strong>
        <div>
          <span v-for="result in group.results" :key="result.id">
            <template v-if="result.d100">{{ String(result.d100.tens).padStart(2, '0') }} + {{ result.d100.ones }} = {{ result.value }}</template>
            <template v-else>{{ result.value }}</template>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.dice-results {
  display: grid;
  grid-template-columns: minmax(7rem, 0.42fr) 1fr;
  gap: 0.8rem;
  padding: 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-subtle);

  &__total {
    display: grid;
    min-height: 5rem;
    place-items: center;
    align-content: center;
    border-radius: var(--radius-md);
    background: var(--color-primary-soft);
    span { color: var(--color-text-muted); font-size: 0.72rem; }
    strong { color: var(--color-primary); font-size: 2rem; font-variant-numeric: tabular-nums; }
  }

  &__groups { display: grid; align-content: center; gap: 0.45rem; }
  &__group {
    display: grid;
    grid-template-columns: 3.25rem 1fr;
    align-items: center;
    gap: 0.5rem;
    > strong { color: var(--color-primary); text-transform: uppercase; }
    > div {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: 0.3rem;
      span { padding: 0.25rem 0.45rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-gold-soft); font-size: 0.78rem; font-variant-numeric: tabular-nums; }
    }
  }

  @media (max-width: 25rem) { grid-template-columns: 1fr; }
}
</style>

