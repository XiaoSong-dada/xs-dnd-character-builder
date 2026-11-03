<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    hint?: string
    collapsible?: boolean
    defaultOpen?: boolean
  }>(),
  { hint: '', collapsible: false, defaultOpen: true },
)

const open = ref(props.collapsible ? props.defaultOpen : true)
</script>

<template>
  <section class="custom-form-section">
    <header class="custom-form-section__header">
      <button
        v-if="props.collapsible"
        type="button"
        class="custom-form-section__toggle"
        :aria-expanded="open"
        @click="open = !open"
      >
        <span>{{ props.title }}</span>
        <span aria-hidden="true">{{ open ? '▾' : '▸' }}</span>
      </button>
      <h3 v-else class="custom-form-section__title">{{ props.title }}</h3>
      <p v-if="props.hint" class="custom-form-section__hint">{{ props.hint }}</p>
    </header>
    <div v-if="open" class="custom-form-section__body"><slot /></div>
  </section>
</template>

<style scoped lang="scss">
.custom-form-section {
  display: grid;
  gap: 0.75rem;
  padding: 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);

  &__header {
    display: grid;
    gap: 0.25rem;
  }

  &__title {
    margin: 0;
    font-size: 0.95rem;
  }

  &__toggle {
    display: flex;
    min-height: 2.5rem;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0;
    border: 0;
    background: none;
    color: var(--color-text);
    font-size: 0.95rem;
    font-weight: 700;
    text-align: left;

    &:focus-visible {
      outline: 0.15rem solid var(--color-primary);
      outline-offset: 0.15rem;
    }
  }

  &__hint {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.78rem;
    line-height: 1.5;
  }

  &__body {
    display: grid;
    gap: 0.75rem;
  }
}
</style>
