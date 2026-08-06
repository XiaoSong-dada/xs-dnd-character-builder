<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import UiModal from '@/components/ui/UiModal.vue'
import { getDependencyImpact } from '@/rules/dependency'
import type { CharacterDraft } from '@/types/character'

const props = defineProps<{
  open: boolean
  draft: CharacterDraft
}>()

defineEmits<{
  close: []
  confirm: [level: number]
}>()

const selectedLevel = ref(props.draft.targetLevel)

watch(
  () => props.open,
  (open) => {
    if (open) selectedLevel.value = props.draft.targetLevel
  },
)

const isUnchanged = computed(() => selectedLevel.value === props.draft.targetLevel)

/** 选择新等级后的影响摘要（复用规则层依赖影响计算）。 */
const summary = computed(() => {
  if (!props.draft.classId) return '尚未选择职业，请先在车卡流程中选择职业后再调整等级。'
  if (isUnchanged.value) return '保持当前等级，不产生变化。'
  const impact = getDependencyImpact(props.draft, { kind: 'target-level', value: selectedLevel.value })
  const added = impact.added?.length ?? 0
  const invalidated = impact.invalidated?.length ?? 0
  const reviews = impact.reviews?.length ?? 0
  const direction = selectedLevel.value > props.draft.targetLevel ? '提升' : '降低'
  return `等级${direction}至 ${selectedLevel.value} 级：新增 ${added} 项检查点待补全 · ${invalidated} 项选择将失效 · ${reviews} 项需复查`
})

const levels = Array.from({ length: 20 }, (_, index) => index + 1)
</script>

<template>
  <UiModal
    :open="open"
    :title="isUnchanged ? '调整等级' : `调整等级至 ${selectedLevel} 级`"
    @close="$emit('close')"
  >
    <p class="level-adjust__hint">当前等级 {{ draft.targetLevel }} 级，可直接跳到任意目标等级（1—20）。</p>
    <div class="level-adjust__grid" role="radiogroup" aria-label="目标等级">
      <button
        v-for="level in levels"
        :key="level"
        type="button"
        class="level-adjust__cell"
        :class="{
          'level-adjust__cell--current': level === draft.targetLevel,
          'level-adjust__cell--selected': level === selectedLevel,
        }"
        :aria-pressed="level === selectedLevel"
        @click="selectedLevel = level"
      >
        {{ level }}
      </button>
    </div>
    <p class="level-adjust__summary">{{ summary }}</p>
    <template #footer>
      <BaseButton variant="secondary" @click="$emit('close')">取消</BaseButton>
      <BaseButton :disabled="isUnchanged || !draft.classId" @click="$emit('confirm', selectedLevel)">确认调整</BaseButton>
    </template>
  </UiModal>
</template>

<style scoped lang="scss">
.level-adjust {
  &__hint {
    margin: 0 0 0.75rem;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    line-height: 1.6;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
  }

  &__cell {
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    background: var(--color-surface);
    font-weight: 700;

    &--current {
      color: var(--color-text-muted);
      border-style: dashed;
    }

    &--selected {
      color: white;
      border-color: var(--color-primary);
      background: var(--color-primary);
    }
  }

  &__summary {
    margin: 0.75rem 0 0;
    padding: 0.6rem 0.75rem;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    background: var(--color-surface-muted, #f4efe6);
    font-size: 0.78rem;
    line-height: 1.55;
  }
}
</style>
