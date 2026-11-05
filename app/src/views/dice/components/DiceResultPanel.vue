<script setup lang="ts">
import type { DieType, LogicalRollResult } from '@/types/dice'

defineProps<{ groups: Array<{ type: DieType; results: LogicalRollResult[] }>; total: number; canReroll: boolean }>()
const emit = defineEmits<{ reroll: [logicalId: string] }>()
</script>

<template>
  <section class="dice-results" aria-live="polite" aria-atomic="false">
    <div class="dice-results__total"><span>本次总和</span><strong>{{ total }}</strong></div>
    <div class="dice-results__groups">
      <div v-for="group in groups" :key="group.type" class="dice-results__group">
        <strong>{{ group.type }}</strong>
        <div>
          <button
            v-for="(result, index) in group.results"
            :key="result.id"
            class="dice-results__die touch-manipulation"
            type="button"
            :disabled="!canReroll"
            :aria-label="`重掷 ${group.type} 第 ${index + 1} 颗，当前 ${result.value} 点`"
            :title="`重掷这一颗 ${group.type}`"
            @click="emit('reroll', result.id)"
          >
            <template v-if="result.d100">{{ String(result.d100.tens).padStart(2, '0') }} + {{ result.d100.ones }} = {{ result.value }}</template>
            <template v-else>{{ result.value }}</template>
            <span class="dice-results__reroll" aria-hidden="true">↻</span>
          </button>
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
    }
  }

  &__die {
    min-width: 2.5rem;
    min-height: 2.25rem;
    padding: 0.25rem 0.45rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text);
    background: var(--color-gold-soft);
    font-size: 0.78rem;
    font-variant-numeric: tabular-nums;
    cursor: pointer;

    &:hover:not(:disabled) { border-color: var(--color-primary); }
    &:focus-visible { outline: 3px solid var(--color-primary-soft); outline-offset: 2px; }
    &:disabled {
      color: var(--color-text-muted);
      cursor: default;
      opacity: 0.7;

      > span { color: var(--color-text-muted); }
    }
  }

  &__reroll { margin-left: 0.18rem; color: var(--color-primary); font-size: 0.72rem; }

  @media (max-width: 25rem) { grid-template-columns: 1fr; }
}
</style>
