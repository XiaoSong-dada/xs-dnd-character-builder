<script setup lang="ts">
import { computed } from 'vue'

import UiNotice from '@/components/ui/UiNotice.vue'
import type { RulesetId, ValidationIssue } from '@/types/character'

const props = withDefaults(defineProps<{ issues: readonly ValidationIssue[]; ruleset?: RulesetId }>(), { ruleset: '5e-2014' })
defineEmits<{ go: [step: string] }>()

/** 错误阻断完成；提示（warning）只提醒，不阻断角色卡（B09-04）。 */
const errors = computed(() => props.issues.filter((issue) => issue.severity === 'error'))
const warnings = computed(() => props.issues.filter((issue) => issue.severity !== 'error'))
</script>

<template>
  <section class="validation-step">
    <UiNotice v-if="!issues.length" tone="success" title="规则校验通过">所有必选项均已完成，可以生成角色卡。</UiNotice>
    <UiNotice v-else-if="errors.length" tone="error" title="仍有需要处理的项目">错误会阻止合法完成；提示项允许预览但建议补齐。</UiNotice>
    <UiNotice v-else tone="warning" title="可以继续，但存在提示项">提示不影响完成；补齐后角色更完整。</UiNotice>
    <UiNotice v-if="ruleset === '5e-2024'" tone="info" title="2024 支持">
      2024 车卡、跑团资源结算与导出已完成；魔法物品为自由添加、仅索引条目不可加入。本页只校验车卡范围内的必选项。
    </UiNotice>
    <template v-if="errors.length">
      <h3 class="validation-step__group">需要处理（{{ errors.length }}）</h3>
      <button v-for="issue in errors" :key="issue.id" type="button" :class="`validation-step__issue--${issue.severity}`" @click="$emit('go', issue.step)">
        <span><strong>{{ issue.message }}</strong><small>{{ issue.resolution }}</small></span><b>去处理 ›</b>
      </button>
    </template>
    <template v-if="warnings.length">
      <h3 class="validation-step__group">提示（不阻断，{{ warnings.length }}）</h3>
      <button v-for="issue in warnings" :key="issue.id" type="button" :class="`validation-step__issue--${issue.severity}`" @click="$emit('go', issue.step)">
        <span><strong>{{ issue.message }}</strong><small>{{ issue.resolution }}</small></span><b>去查看 ›</b>
      </button>
    </template>
  </section>
</template>

<style scoped lang="scss">
.validation-step {
  display: grid;
  gap: 0.65rem;

  &__group {
    margin: 0.5rem 0 0;
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  > button {
    display: flex;
    min-height: 4rem;
    align-items: center;
    gap: 0.75rem;
    padding: 0.7rem;
    border: 1px solid var(--color-border);
    border-left-width: 0.25rem;
    border-radius: var(--radius-md);
    color: var(--color-text);
    background: var(--color-surface);
    text-align: left;

    span { display: grid; flex: 1; }
    small { color: var(--color-text-muted); line-height: 1.45; }
    b { color: var(--color-primary); font-size: 0.72rem; }
  }

  &__issue {
    &--error { border-left-color: var(--color-error) !important; }
    &--warning { border-left-color: var(--color-warning) !important; }
  }
}
</style>
