<script setup lang="ts">
defineProps<{ open: boolean; title: string }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="ui-modal" role="presentation" @click.self="$emit('close')">
      <section role="dialog" aria-modal="true" :aria-label="title">
        <header><h2>{{ title }}</h2><button type="button" aria-label="关闭" @click="$emit('close')">×</button></header>
        <div class="ui-modal__body"><slot /></div>
        <footer v-if="$slots.footer"><slot name="footer" /></footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.ui-modal {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: end center;
  padding: 1rem;
  background: rgb(33 31 26 / 48%);

  section {
    width: min(100%, 30rem);
    max-height: min(80dvh, 42rem);
    overflow: auto;
    border-radius: var(--radius-xl);
    background: var(--color-surface);
    box-shadow: var(--shadow-subtle);
  }

  header, footer { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; }
  header { border-bottom: 1px solid var(--color-border); }
  footer { border-top: 1px solid var(--color-border); }
  h2 { margin: 0; flex: 1; font-size: 1.1rem; }
  header button { min-width: 2.75rem; min-height: 2.75rem; border: 0; background: transparent; font-size: 1.5rem; }

  &__body { padding: 1rem; }
}
</style>
