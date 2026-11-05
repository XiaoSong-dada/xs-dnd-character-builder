<script setup lang="ts">
import { formatDiceExpression } from '@/rules/dice'
import type { DicePoolPreset } from '@/types/dice'

defineProps<{
  presets: DicePoolPreset[]
  maximum: number
  disabled: boolean
  deleteFeedback?: { message: string; error?: boolean }
  applyFeedback?: { message: string; presetId: string }
}>()

defineEmits<{ apply: [id: string]; delete: [id: string] }>()

function presetExpression(preset: DicePoolPreset): string {
  return formatDiceExpression(preset.pool, preset.modifier)
}
</script>

<template>
  <section class="dice-presets" aria-labelledby="dice-presets-title">
    <div class="dice-presets__heading">
      <h2 id="dice-presets-title">骰池预设</h2>
      <span>{{ presets.length }}/{{ maximum }}</span>
    </div>
    <p
      v-if="deleteFeedback"
      :class="deleteFeedback.error ? 'dice-presets__error' : 'dice-presets__notice'"
      :role="deleteFeedback.error ? 'alert' : 'status'"
    >{{ deleteFeedback.message }}</p>
    <ul v-if="presets.length" class="dice-presets__list">
      <li v-for="preset in presets" :key="preset.id" class="dice-presets__item">
        <div class="dice-presets__row">
          <span class="dice-presets__expression">{{ presetExpression(preset) }}</span>
          <span class="dice-presets__actions">
            <button type="button" :disabled="disabled" :aria-label="`应用预设 ${presetExpression(preset)}`" @click="$emit('apply', preset.id)">应用</button>
            <button type="button" class="dice-presets__delete" :disabled="disabled" :aria-label="`删除预设 ${presetExpression(preset)}`" @click="$emit('delete', preset.id)">删除</button>
          </span>
        </div>
        <p v-if="applyFeedback?.presetId === preset.id" class="dice-presets__notice" role="status">{{ applyFeedback.message }}</p>
      </li>
    </ul>
    <p v-else class="dice-presets__empty">保存常用的投掷组合后，可以在这里一键应用。</p>
  </section>
</template>

<style scoped lang="scss">
.dice-presets {
  display: grid;
  gap: 0.6rem;
  padding: 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-subtle);

  &__heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;

    h2 { margin: 0; font-size: 0.95rem; }
    > span { color: var(--color-text-muted); font-size: 0.72rem; white-space: nowrap; }
  }

  &__notice,
  &__error,
  &__empty { margin: 0; padding: 0.55rem 0.7rem; border-radius: var(--radius-md); font-size: 0.78rem; line-height: 1.5; }
  &__notice { color: var(--color-primary); background: var(--color-gold-soft); }
  &__error { color: var(--color-error); background: var(--color-error-soft); }
  &__empty { color: var(--color-text-muted); background: var(--color-gold-soft); }

  &__list { display: grid; gap: 0.45rem; margin: 0; padding: 0; list-style: none; }

  &__item {
    min-width: 0;
    padding: 0.35rem 0.35rem 0.35rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-gold-soft);

    > p { padding-inline: 0; overflow-wrap: anywhere; }
  }

  &__row {
    display: flex;
    min-height: 2.75rem;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
  }

  &__expression {
    min-width: 0;
    color: var(--color-primary);
    font-size: 0.95rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }

  &__actions {
    display: inline-flex;
    flex-shrink: 0;
    gap: 0.3rem;

    button {
      min-width: 2.75rem;
      min-height: 2.75rem;
      padding: 0 0.55rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-primary);
      background: var(--color-surface);
      font-size: 0.78rem;
      cursor: pointer;
      &:disabled { opacity: 0.55; cursor: not-allowed; }
      &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    }
  }

  &__delete { color: var(--color-text-muted); }

  @media (max-width: 24rem) {
    &__item { padding-left: 0.35rem; }
    &__row { align-items: stretch; flex-direction: column; }
    &__expression { padding: 0.35rem 0.4rem 0; }
    &__actions button { flex: 1; }
  }
}
</style>
