<script setup lang="ts">
import { computed } from 'vue'

import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { getClassGrowthSummary } from '@/rules/recommend'
import { rulesRepository } from '@/rules/repository'
import { isSourceEnabled } from '@/rules/source-books'

const props = defineProps<{ selected?: string; enabledSourceIds?: readonly string[] }>()
defineEmits<{ select: [id: string] }>()

const visibleClasses = computed(() => rulesRepository.classes
  .filter((classRule) => isSourceEnabled(classRule.sourceIds, props.enabledSourceIds))
  .map((classRule) => ({
    classRule,
    growth: getClassGrowthSummary(classRule, rulesRepository),
  })))
</script>

<template>
  <section class="class-step">
    <p class="class-step__match">当前仅显示核心规则与第 2 步已启用来源中的职业。</p>
    <ListShell>
      <ExpandableOptionCard
        v-for="({ classRule, growth }) in visibleClasses"
        :key="classRule.id"
        :title="classRule.name"
        :description="classRule.summary"
        :state="selected === classRule.id ? 'selected' : 'default'"
        expanded-label="职业成长"
        @select="$emit('select', classRule.id)"
      >
        <template #suffix>
          <UiBadge v-if="classRule.status !== 'implemented'" tone="warning">{{ classRule.status === 'selectable' ? '可选择 · 部分效果需手动处理' : '资料索引' }}</UiBadge>
        </template>
        <template #expanded>
          <ul class="class-step__growth-list">
            <li v-for="item in growth" :key="`${item.level}-${item.title}`">{{ item.level }}级 · {{ item.title }}</li>
          </ul>
        </template>
      </ExpandableOptionCard>
    </ListShell>
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
