<script setup lang="ts">
import { computed } from 'vue'

/**
 * 等级单元格表格（需求 §4／§6，决策 D38／D40）。
 *
 * 固定渲染 1—20 个单元格，越界单元格禁用（可选范围变化时网格高度不变）；
 * 点当前值不产生事件；选中即 `emit select`，由调用方决定后续（进入页面的确认流程）。
 * 展开／收起状态由调用方持有：总等级表格与「单行展开」的职业表格共用同一组件。
 */
const props = defineProps<{
  /** 可选下限（含）。 */
  min: number
  /** 可选上限（含）。 */
  max: number
  /** 当前值。 */
  value: number
  /** 读屏用的名称（如「总等级」「战士等级」）。 */
  label: string
}>()

const emit = defineEmits<{ select: [level: number] }>()

const LEVELS = Array.from({ length: 20 }, (_, index) => index + 1)
const current = computed(() => props.value)

function pick(level: number): void {
  if (level < props.min || level > props.max || level === props.value) return
  emit('select', level)
}
</script>

<template>
  <ul class="level-grid" role="group" :aria-label="`选择${label}`">
    <li v-for="level in LEVELS" :key="level">
      <button
        type="button"
        class="level-grid__cell"
        :class="{ 'level-grid__cell--current': level === current }"
        :disabled="level < min || level > max"
        :aria-pressed="level === current"
        :aria-label="`${label} ${level} 级`"
        @click="pick(level)"
      >{{ level }}</button>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.level-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(2.5rem, 1fr));
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;

  &__cell {
    width: 100%;
    min-height: 2.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    background: var(--color-surface);
    font-weight: 700;
    cursor: pointer;

    &:disabled {
      color: #9d968b;
      background: #e5ddd1;
      cursor: not-allowed;
    }

    &--current {
      color: var(--color-surface);
      border-color: var(--color-primary);
      background: var(--color-primary);
    }
  }
}
</style>
