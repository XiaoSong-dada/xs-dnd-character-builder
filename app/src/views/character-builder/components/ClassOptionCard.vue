<script setup lang="ts">
import { ref } from 'vue'

import UiBadge from '@/components/ui/UiBadge.vue'
import type { ClassGrowthSummaryItem } from '@/types/rules'

withDefaults(
  defineProps<{
    title: string
    summary: string
    state?: 'default' | 'selected' | 'recommended'
    /** 推荐序号徽标文本，如"① 推荐 · 匹配2项偏好"；为空不显示。 */
    rankLabel?: string
    isIndexOnly?: boolean
    /** 职业 1—20 级成长速览条目，由规则数据推导。 */
    growth?: readonly ClassGrowthSummaryItem[]
  }>(),
  {
    state: 'default',
    rankLabel: '',
    isIndexOnly: false,
    growth: () => [],
  },
)

const emit = defineEmits<{ select: [] }>()

const growthOpen = ref(false)

function toggleGrowth(): void {
  growthOpen.value = !growthOpen.value
}
</script>

<template>
  <div class="class-option-card" :class="`class-option-card--${state}`">
    <div class="class-option-card__head">
      <button
        type="button"
        class="class-option-card__main"
        :aria-pressed="state === 'selected'"
        @click="emit('select')"
        @dblclick="toggleGrowth"
      >
        <span class="class-option-card__mark" aria-hidden="true">{{ state === 'selected' ? '✓' : '' }}</span>
        <span class="class-option-card__content">
          <span class="class-option-card__title-line">
            <strong>{{ title }}</strong>
            <span class="class-option-card__badges">
              <UiBadge v-if="rankLabel" tone="primary">{{ rankLabel }}</UiBadge>
              <UiBadge v-if="isIndexOnly" tone="warning">资料索引</UiBadge>
            </span>
          </span>
          <span class="class-option-card__summary">{{ summary }}</span>
        </span>
      </button>
      <button
        v-if="growth.length"
        type="button"
        class="class-option-card__arrow"
        :class="{ 'class-option-card__arrow--open': growthOpen }"
        :aria-expanded="growthOpen"
        :aria-label="growthOpen ? `收起${title}成长速览` : `展开${title}成长速览`"
        @click="toggleGrowth"
      >›</button>
    </div>
    <div v-if="growthOpen" class="class-option-card__growth">
      <strong>{{ title }}1—20级成长</strong>
      <ul>
        <li v-for="item in growth" :key="`${item.level}-${item.title}`">{{ item.level }}级 · {{ item.title }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.class-option-card {
  display: grid;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  overflow: hidden;

  &__head { display: flex; align-items: stretch; }

  &__main {
    display: flex;
    width: 100%;
    min-height: 4.25rem;
    flex: 1;
    align-items: center;
    gap: 0.7rem;
    padding: 0.7rem 0 0.7rem 0.8rem;
    border: 0;
    color: var(--color-text);
    background: transparent;
    text-align: left;
    cursor: pointer;

    &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: -2px; }
  }

  &__mark {
    display: grid;
    width: 1.4rem;
    height: 1.4rem;
    flex: none;
    place-items: center;
    border: 1px solid var(--color-border);
    border-radius: 50%;
    color: var(--color-surface);
    font-size: 0.75rem;
  }

  &__content {
    display: grid;
    min-width: 0;
    flex: 1;
    gap: 0.2rem;
  }

  &__title-line {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;

    strong { font-size: 0.9rem; }
  }

  &__badges {
    display: inline-flex;
    flex: none;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.25rem;
  }

  &__summary {
    overflow: hidden;
    color: var(--color-text-muted);
    font-size: 0.78rem;
    line-height: 1.45;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__arrow {
    display: grid;
    width: 2.4rem;
    flex: none;
    place-items: center;
    border: 0;
    color: var(--color-text-muted);
    background: transparent;
    font-size: 1.25rem;
    cursor: pointer;
    transition: transform 0.15s ease;

    &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: -2px; }

    &--open { transform: rotate(90deg); }
  }

  &__growth {
    display: grid;
    gap: 0.3rem;
    padding: 0.6rem 0.8rem 0.7rem;
    border-top: 1px dashed var(--color-border);
    background: var(--color-gold-soft);

    strong { font-size: 0.8rem; color: var(--color-primary); }
    ul {
      margin: 0;
      padding-left: 1rem;
      color: var(--color-text-muted);
      font-size: 0.75rem;
      line-height: 1.7;
    }
  }

  &--selected {
    border-color: var(--color-primary);
    background: #fff9f6;
    box-shadow: inset 0.2rem 0 var(--color-primary);
  }

  &--selected &__mark { border-color: var(--color-primary); background: var(--color-primary); }
}
</style>
