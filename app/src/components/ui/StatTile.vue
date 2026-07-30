<script setup lang="ts">
defineProps<{ label: string; value: string | number; note?: string }>()
</script>

<template>
  <div class="stat-tile">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <small v-if="note">{{ note }}</small>
  </div>
</template>

<style scoped lang="scss">
.stat-tile {
  display: grid;
  min-width: 0;
  min-height: 4rem;
  place-items: center;
  align-content: center;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: center;

  span, small { color: var(--color-text-muted); font-size: 0.68rem; }
  strong { font-size: 1.2rem; font-variant-numeric: tabular-nums; }
}
</style>
