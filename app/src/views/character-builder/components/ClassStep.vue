<script setup lang="ts">
import { computed } from 'vue'

import OptionCard from '@/components/ui/OptionCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { getClassRecommendation } from '@/rules/recommend'
import { rulesRepository } from '@/rules/repository'

const props = defineProps<{ selected?: string; preferences: readonly string[] }>()
defineEmits<{ select: [id: string] }>()

const rankedClasses = computed(() => rulesRepository.classes
  .map((classRule) => ({ classRule, recommendation: getClassRecommendation(classRule, props.preferences) }))
  .sort((a, b) => b.recommendation.score - a.recommendation.score))
</script>

<template>
  <section class="class-step">
    <p class="class-step__match">推荐只用于排序，不限制职业选择。</p>
    <OptionCard
      v-for="({ classRule, recommendation }, index) in rankedClasses"
      :key="classRule.id"
      :title="classRule.name"
      :description="`${classRule.summary} · ${recommendation.reason}`"
      :state="selected === classRule.id ? 'selected' : index < 3 ? 'recommended' : 'default'"
      @select="$emit('select', classRule.id)"
    >
      <template #suffix>
        <UiBadge v-if="index < 3" tone="primary">推荐 {{ recommendation.score }}%</UiBadge>
        <UiBadge v-else-if="classRule.status !== 'implemented'" tone="warning">资料索引</UiBadge>
      </template>
    </OptionCard>
    <aside v-if="selected === 'class-2014-fighter'">
      <strong>2014战士1—20级成长</strong>
      <span>1级战斗风格 · 2级动作如潮 · 3级武术范型 · 4/6/8级属性提升或专长 · 无武器精通</span>
    </aside>
  </section>
</template>

<style scoped lang="scss">
.class-step {
  display: grid;
  gap: 0.75rem;

  &__match { margin: 0; color: var(--color-primary); font-size: 0.8rem; font-weight: 700; }

  aside {
    display: grid;
    gap: 0.35rem;
    padding: 1rem;
    border-radius: var(--radius-lg);
    color: white;
    background: linear-gradient(120deg, var(--color-primary-strong), var(--color-primary));

    span { color: rgb(255 255 255 / 75%); font-size: 0.75rem; line-height: 1.6; }
  }
}
</style>
