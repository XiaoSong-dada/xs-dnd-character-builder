<script setup lang="ts">
import UiNotice from '@/components/ui/UiNotice.vue'
import type { ValidationIssue } from '@/types/character'

defineProps<{ issues: readonly ValidationIssue[] }>()
defineEmits<{ go: [step: string] }>()
</script>

<template>
  <section class="validation-step">
    <UiNotice v-if="!issues.length" tone="success" title="规则校验通过">所有必选项均已完成，可以生成角色卡。</UiNotice>
    <UiNotice v-else tone="error" title="仍有需要处理的项目">错误会阻止合法完成；警告允许预览但需要确认。</UiNotice>
    <button v-for="issue in issues" :key="issue.id" type="button" :class="`validation-step__issue--${issue.severity}`" @click="$emit('go', issue.step)">
      <span><strong>{{ issue.message }}</strong><small>{{ issue.resolution }}</small></span><b>去处理 ›</b>
    </button>
  </section>
</template>

<style scoped lang="scss">
.validation-step {
  display: grid;
  gap: 0.65rem;

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
