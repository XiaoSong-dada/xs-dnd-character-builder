<script setup lang="ts">
import { computed } from 'vue'

import UiChip from '@/components/ui/UiChip.vue'
import { getClassRecommendation } from '@/rules/recommend'
import { rulesRepository } from '@/rules/repository'
import { playPreferences2014 } from '@/rules/data/preferences-2014'

const props = defineProps<{ selected: readonly string[] }>()
const emit = defineEmits<{ change: [value: readonly string[]] }>()

const topClasses = computed(() => {
  if (props.selected.length === 0) return []
  return [...rulesRepository.classes]
    .map((classRule) => ({ classRule, recommendation: getClassRecommendation(classRule, props.selected) }))
    .filter(({ recommendation }) => recommendation.score > 0)
    .sort((a, b) => b.recommendation.score - a.recommendation.score)
    .slice(0, 3)
    .map(({ classRule }) => classRule.name)
})

function toggle(id: string): void {
  emit('change', props.selected.includes(id) ? props.selected.filter((item) => item !== id) : [...props.selected, id])
}
</script>

<template>
  <section class="preferences-step">
    <p>凭直觉选择，可多选。推荐只用于排序，不会替你决定职业。</p>
    <div>
      <UiChip
        v-for="preference in playPreferences2014"
        :key="preference.id"
        :selected="selected.includes(preference.id)"
        :title="preference.description"
        @toggle="toggle(preference.id)"
      >{{ preference.label }}</UiChip>
    </div>
    <aside><strong>当前推荐方向</strong><span v-if="topClasses.length">{{ topClasses.join(' · ') }}</span><span v-else>选择偏好后查看推荐方向</span></aside>
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
