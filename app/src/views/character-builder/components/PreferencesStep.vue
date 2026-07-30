<script setup lang="ts">
import UiChip from '@/components/ui/UiChip.vue'

const props = defineProps<{ selected: readonly string[] }>()
const emit = defineEmits<{ change: [value: readonly string[]] }>()
const options = [
  ['melee', '近身作战'],
  ['ranged', '远程攻击'],
  ['spellcasting', '施放法术'],
  ['support', '支援队友'],
  ['durable', '高生存'],
  ['control', '战场控制'],
] as const

function toggle(id: string): void {
  emit('change', props.selected.includes(id) ? props.selected.filter((item) => item !== id) : [...props.selected, id])
}
</script>

<template>
  <section class="preferences-step">
    <p>凭直觉选择，可多选。推荐只用于排序，不会替你决定职业。</p>
    <div>
      <UiChip v-for="[id, label] in options" :key="id" :selected="selected.includes(id)" @toggle="toggle(id)">{{ label }}</UiChip>
    </div>
    <aside><strong>当前推荐方向</strong><span>{{ selected.includes('spellcasting') ? '施法职业' : '战士 · 圣武士 · 野蛮人' }}</span></aside>
  </section>
</template>

<style scoped lang="scss">
.preferences-step {
  display: grid;
  gap: 1rem;

  > p { margin: 0; color: var(--color-text-muted); line-height: 1.7; }
  > div { display: flex; flex-wrap: wrap; gap: 0.5rem; }

  aside {
    display: grid;
    gap: 0.3rem;
    padding: 1rem;
    border: 1px solid #dfc49a;
    border-radius: var(--radius-lg);
    background: var(--color-gold-soft);

    strong { color: var(--color-primary); }
    span { color: var(--color-text-muted); font-size: 0.82rem; }
  }
}
</style>
