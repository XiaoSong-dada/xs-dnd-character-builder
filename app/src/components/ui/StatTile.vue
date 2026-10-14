<script setup lang="ts">
import StatNote from '@/components/ui/StatNote.vue'

/**
 * 数值 tile（跑团助手总览）。
 * 说明区自 D23—D27 起由 `StatNote` 承担：两行截断，被截断时双击 / 触屏双击 / 键盘可看逐条明细。
 * 跑团助手是只读视图，因此说明始终可交互。
 */
withDefaults(defineProps<{
  label: string
  value: string | number
  /** 逐条来源说明（推荐）：弹窗按条列出，内联用 ` · ` 拼接后两行截断。 */
  details?: readonly string[]
  /** 兼容入口：单条说明原文。 */
  note?: string
}>(), { details: undefined, note: undefined })
</script>

<template>
  <div class="stat-tile">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <StatNote v-if="details?.length || note" :items="details" :fallback="note" :label="label" :value="value" interactive />
  </div>
</template>

<style scoped lang="scss">
.stat-tile {
  display: grid;
  min-width: 0;
  min-height: 4rem;
  place-items: center;
  align-content: center;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: center;

  span, small { color: var(--color-text-muted); font-size: 0.68rem; }
  strong { font-size: 1.2rem; font-variant-numeric: tabular-nums; }
}
</style>
