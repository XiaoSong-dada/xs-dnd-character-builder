<script setup lang="ts">
import { computed } from 'vue'

import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
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
    <ExpandableOptionCard
      v-for="({ classRule, recommendation, growth }, index) in rankedClasses"
      :key="classRule.id"
      :title="classRule.name"
      :description="classRule.summary"
      :state="selected === classRule.id ? 'selected' : recommendation.score > 0 && index < 3 ? 'recommended' : 'default'"
      expanded-label="职业成长"
      @select="$emit('select', classRule.id)"
    >
      <template #suffix>
        <UiBadge v-if="recommendation.score > 0 && index < 3" tone="primary">{{ orderLabels[index] }} 推荐 · 匹配{{ recommendation.matchedPreferenceLabels.length }}项偏好</UiBadge>
        <UiBadge v-if="classRule.status !== 'implemented'" tone="warning">资料索引</UiBadge>
      </template>
      <template #expanded>
        <ul class="class-step__growth-list">
          <li v-for="item in growth" :key="`${item.level}-${item.title}`">{{ item.level }}级 · {{ item.title }}</li>
        </ul>
      </template>
    </ExpandableOptionCard>
  </section>
</template>

<style scoped lang="scss">
.class-step {
  display: grid;
  gap: 0.75rem;

  &__match { margin: 0; color: var(--color-primary); font-size: 0.8rem; font-weight: 700; }

  &__growth-list {
    margin: 0;
    padding-left: 1rem;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.7;
  }
}
</style>
