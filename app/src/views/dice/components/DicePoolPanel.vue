<script setup lang="ts">
import type { DicePoolEntry, DieType } from '@/types/dice'

defineProps<{
  entries: DicePoolEntry[]
  expression: string
  physicalCount: number
  remaining: number
  maximum: number
  disabled: boolean
  canAdd: (type: DieType) => boolean
}>()

defineEmits<{ add: [type: DieType]; remove: [type: DieType] }>()
</script>

<template>
  <section class="dice-pool" aria-labelledby="dice-pool-title">
    <div class="dice-pool__heading">
      <div>
        <p>当前骰池</p>
        <h2 id="dice-pool-title">{{ expression || '尚未添加骰子' }}</h2>
      </div>
      <span>{{ physicalCount }}/{{ maximum }} 个物理骰</span>
    </div>
    <div v-if="entries.length" class="dice-pool__entries">
      <div v-for="entry in entries" :key="entry.type" class="dice-pool__entry">
        <strong>{{ entry.type }}</strong>
        <button type="button" :disabled="disabled" :aria-label="`减少一颗 ${entry.type}`" @click="$emit('remove', entry.type)">−</button>
        <span :aria-label="`${entry.quantity} 颗`">{{ entry.quantity }}</span>
        <button type="button" :disabled="disabled || !canAdd(entry.type)" :aria-label="`增加一颗 ${entry.type}`" @click="$emit('add', entry.type)">+</button>
      </div>
    </div>
    <p v-else class="dice-pool__empty">从上方选择骰型，支持相同或不同骰子一起投掷。</p>
    <small v-if="remaining === 0" class="dice-pool__limit">已达到单次投掷上限。</small>
    <small v-else>还可加入 {{ remaining }} 个物理骰；一颗 d100 占两个。</small>
  </section>
</template>

<style scoped lang="scss">
.dice-pool {
  display: grid;
  gap: 0.7rem;
  padding: 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-subtle);

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    p, h2 { margin: 0; }
    p { color: var(--color-text-muted); font-size: 0.72rem; }
    h2 { margin-top: 0.12rem; color: var(--color-primary); font-size: 1.05rem; font-variant-numeric: tabular-nums; }
    > span { color: var(--color-text-muted); font-size: 0.72rem; white-space: nowrap; }
  }

  &__entries { display: flex; flex-wrap: wrap; gap: 0.45rem; }

  &__entry {
    display: inline-grid;
    min-height: 2.75rem;
    grid-template-columns: auto 2.25rem 1.5rem 2.25rem;
    align-items: center;
    gap: 0.15rem;
    padding-left: 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-gold-soft);

    strong { min-width: 2.2rem; color: var(--color-primary); text-transform: uppercase; }
    span { text-align: center; font-variant-numeric: tabular-nums; }
    button {
      width: 2.25rem;
      height: 2.25rem;
      padding: 0;
      border: 0;
      border-radius: 50%;
      color: var(--color-primary);
      background: var(--color-surface);
      font-size: 1.15rem;
      cursor: pointer;
      &:disabled { color: #a59d91; cursor: not-allowed; }
    }
  }

  &__empty,
  > small { margin: 0; color: var(--color-text-muted); font-size: 0.75rem; line-height: 1.5; }
  &__limit { color: var(--color-warning) !important; font-weight: 700; }
}
</style>

