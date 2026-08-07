<script setup lang="ts">
import { computed } from 'vue'

import ClassOptionCard from '@/views/character-builder/components/ClassOptionCard.vue'
import { getClassGrowthSummary, getClassRecommendation } from '@/rules/recommend'
import { rulesRepository } from '@/rules/repository'

const props = defineProps<{ selected?: string; preferences: readonly string[] }>()
defineEmits<{ select: [id: string] }>()

const orderLabels = ['①', '②', '③'] as const

const rankedClasses = computed(() => [...rulesRepository.classes]
  .map((classRule) => ({
    classRule,
    recommendation: getClassRecommendation(classRule, props.preferences),
    growth: getClassGrowthSummary(classRule, rulesRepository),
  }))
  .sort((a, b) => b.recommendation.score - a.recommendation.score))
</script>

<template>
  <section class="class-step">
    <p class="class-step__match">推荐只用于排序，不限制职业选择。</p>
    <ClassOptionCard
      v-for="({ classRule, recommendation, growth }, index) in rankedClasses"
      :key="classRule.id"
      :title="classRule.name"
      :summary="classRule.summary"
      :state="selected === classRule.id ? 'selected' : recommendation.score > 0 && index < 3 ? 'recommended' : 'default'"
      :rank-label="recommendation.score > 0 && index < 3 ? `${orderLabels[index]} 推荐 · 匹配${recommendation.matchedPreferenceLabels.length}项偏好` : ''"
      :is-index-only="classRule.status !== 'implemented'"
      :growth="growth"
      @select="$emit('select', classRule.id)"
    />
  </section>
</template>

<style scoped lang="scss">
.class-step {
  display: grid;
  gap: 0.75rem;

  &__match { margin: 0; color: var(--color-primary); font-size: 0.8rem; font-weight: 700; }
}
</style>
