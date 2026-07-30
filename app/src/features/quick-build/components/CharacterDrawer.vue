<script setup lang="ts">
import { computed, ref } from 'vue'

import StatTile from '@/components/ui/StatTile.vue'
import UiDrawer from '@/components/ui/UiDrawer.vue'
import type { DerivedCharacterSummary } from '@/types/character'

const props = defineProps<{ summary: DerivedCharacterSummary; completion: number }>()
const expanded = ref(false)
const characterLabel = computed(() =>
  props.summary.className
    ? `${props.summary.level}级 ${props.summary.className}`
    : `${props.summary.level}级 · 尚未选择职业`,
)
</script>

<template>
  <UiDrawer :open="expanded" label="当前角色摘要" @close="expanded = false">
    <button type="button" class="character-drawer__summary" :aria-expanded="expanded" @click="expanded = !expanded">
      <span class="character-drawer__crest" aria-hidden="true">◇</span>
      <span><small>当前角色</small><strong>{{ characterLabel }}</strong></span>
      <span><b>{{ completion }}%</b><small>完成度</small></span>
    </button>
    <div v-if="expanded" class="character-drawer__details">
      <StatTile label="HP" :value="summary.hitPoints ?? '—'" />
      <StatTile label="AC" :value="summary.armorClass ?? '—'" />
      <StatTile label="先攻" :value="summary.initiative ?? '—'" />
      <StatTile label="速度" :value="summary.speed ? `${summary.speed}尺` : '—'" />
      <StatTile label="熟练" :value="summary.proficiencyBonus" />
    </div>
  </UiDrawer>
</template>

<style scoped lang="scss">
.character-drawer {
  &__summary {
    display: flex;
    width: 100%;
    min-height: 4.5rem;
    align-items: center;
    gap: 0.7rem;
    padding: 0.6rem 1rem;
    border: 0;
    color: var(--color-text);
    background: transparent;
    text-align: left;

    > span:nth-child(2) { display: grid; min-width: 0; flex: 1; }
    > span:last-child { display: grid; text-align: right; }
    small { color: var(--color-text-muted); font-size: 0.65rem; }
    strong { font-size: 0.82rem; }
    b { color: var(--color-primary); }
  }

  &__crest {
    display: grid;
    width: 2.25rem;
    height: 2.25rem;
    flex: none;
    place-items: center;
    border: 1px solid var(--color-gold);
    border-radius: 50%;
    color: var(--color-primary);
    background: var(--color-gold-soft);
  }

  &__details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    padding: 0 1rem 1rem;
  }
}
</style>
