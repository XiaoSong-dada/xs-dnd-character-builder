<script setup lang="ts">
import type { DieType } from '@/types/dice'

defineProps<{
  dieTypes: readonly DieType[]
  disabled: boolean
  canAdd: (type: DieType) => boolean
}>()

defineEmits<{ add: [type: DieType] }>()
</script>

<template>
  <section class="dice-selector" aria-labelledby="dice-selector-title">
    <div class="dice-selector__heading">
      <div>
        <p class="dice-selector__eyebrow">选择骰型</p>
        <h2 id="dice-selector-title">向骰池添加骰子</h2>
      </div>
      <small>点击即可添加一颗</small>
    </div>
    <div class="dice-selector__grid">
      <button
        v-for="type in dieTypes"
        :key="type"
        class="dice-selector__die"
        :disabled="disabled || !canAdd(type)"
        type="button"
        :aria-label="`添加一颗 ${type}`"
        @click="$emit('add', type)"
      >
        <span class="dice-selector__shape" aria-hidden="true">◇</span>
        <strong>{{ type }}</strong>
        <small>{{ type === 'd100' ? '百分骰' : `${type.slice(1)} 面` }}</small>
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.dice-selector {
  display: grid;
  gap: 0.85rem;

  &__heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;

    h2,
    p { margin: 0; }
    h2 { margin-top: 0.18rem; font-size: 1.05rem; }
    small { color: var(--color-text-muted); }
  }

  &__eyebrow {
    color: var(--color-primary);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(4.4rem, 1fr));
    gap: 0.55rem;
  }

  &__die {
    display: grid;
    min-width: 0;
    min-height: 5.25rem;
    place-items: center;
    align-content: center;
    gap: 0.08rem;
    padding: 0.45rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    background: var(--color-surface);
    box-shadow: 0 0.25rem 0.8rem rgb(70 52 32 / 6%);
    cursor: pointer;

    &:not(:disabled):active { border-color: var(--color-primary); background: var(--color-primary-soft); transform: translateY(1px); }
    &:disabled { opacity: 0.48; cursor: not-allowed; }
    strong { color: var(--color-primary); font-size: 1rem; text-transform: uppercase; }
    small { color: var(--color-text-muted); font-size: 0.66rem; }
  }

  &__shape { color: var(--color-gold); font-size: 1.25rem; line-height: 1; }
}
</style>

