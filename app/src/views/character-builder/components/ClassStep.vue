<script setup lang="ts">
import { computed } from 'vue'

import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { getClassDetailSummary, getClassGrowthSummary } from '@/rules/recommend'
import { getRulesRepository } from '@/rules/repositories'
import { isSourceEnabled } from '@/rules/source-books'
import type { RulesetId } from '@/types/character'

const props = withDefaults(defineProps<{ selected?: string; enabledSourceIds?: readonly string[]; ruleset?: RulesetId }>(), { ruleset: '5e-2014' })
defineEmits<{ select: [id: string] }>()

const repository = computed(() => getRulesRepository(props.ruleset))
const visibleClasses = computed(() => repository.value.classes
  .filter((classRule) => isSourceEnabled(classRule.sourceIds, props.enabledSourceIds, repository.value))
  .map((classRule) => ({
    classRule,
    detail: getClassDetailSummary(classRule),
    growth: getClassGrowthSummary(classRule, repository.value),
  })))
</script>

<template>
  <section class="class-step">
    <p class="class-step__match">当前仅显示核心规则与第 2 步已启用来源中的职业。</p>
    <ListShell>
      <ExpandableOptionCard
        v-for="({ classRule, detail, growth }) in visibleClasses"
        :key="classRule.id"
        :title="classRule.name"
        :description="classRule.summary"
        :state="selected === classRule.id ? 'selected' : 'default'"
        expanded-label="职业详情"
        @select="$emit('select', classRule.id)"
      >
        <template #suffix>
          <UiBadge v-if="classRule.status !== 'implemented'" tone="warning">{{ classRule.status === 'selectable' ? '可选择 · 部分效果需手动处理' : '资料索引' }}</UiBadge>
        </template>
        <template #expanded>
          <p v-if="classRule.introduction" class="class-step__intro">{{ classRule.introduction }}</p>
          <dl class="class-step__facts">
            <div><dt>主要属性</dt><dd>{{ detail.abilities.join('、') }}</dd></div>
            <div><dt>生命骰</dt><dd>{{ detail.hitDie }}</dd></div>
            <div><dt>豁免熟练</dt><dd>{{ detail.savingThrows.join('、') }}</dd></div>
          </dl>
          <strong class="class-step__growth-title">职业成长</strong>
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

  // 职业详情（U02）：职业介绍 + 主要属性／生命骰／豁免熟练，位于「职业成长」之前。
  &__intro {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.78rem;
    line-height: 1.6;
  }

  &__facts {
    display: grid;
    gap: 0.2rem;
    margin: 0;

    div { display: flex; gap: 0.4rem; }
    dt { flex: none; color: var(--color-text-muted); font-size: 0.72rem; }
    dd { margin: 0; font-size: 0.75rem; }
  }

  &__growth-title { color: var(--color-primary); font-size: 0.8rem; }

  &__growth-list {
    margin: 0;
    padding-left: 1rem;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.7;
  }
}
</style>
