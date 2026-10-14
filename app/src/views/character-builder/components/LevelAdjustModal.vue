<script setup lang="ts">
import { computed } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import UiModal from '@/components/ui/UiModal.vue'
import ClassAllocationControl from '@/views/character-builder/components/ClassAllocationControl.vue'
import { getClassEntries, getTotalLevel } from '@/rules/multiclass'
import type { CharacterDraft } from '@/types/character'

/**
 * 等级调整弹窗（MC-E03）。
 *
 * 与第 1 步、第 3 步共用同一个 `ClassAllocationControl` 与同一份分配数据（决策 D2／D6）：
 * 单职业时等级滑杆直接设置该职业等级，开启兼职后另有逐职业 −/＋ 与「设置起始职业」入口；
 * 总等级恒为各职业等级之和。页面收到 `apply`／`applyTotalLevel` 后走依赖影响确认
 * （滑杆使用更轻的策略：仅在有选择失效时确认）。
 */
const props = defineProps<{
  open: boolean
  draft: CharacterDraft
}>()

defineEmits<{
  close: []
  /** 分配控件提交的新草稿（逐职业步进、开关、起始职业切换、确认按钮）。 */
  apply: [draft: CharacterDraft]
  /** 总等级滑杆提交的新草稿（需求 §3.4）。 */
  totalLevel: [draft: CharacterDraft]
}>()

const hasClass = computed(() => getClassEntries(props.draft).length > 0)
const totalLevel = computed(() => getTotalLevel(props.draft))
</script>

<template>
  <UiModal
    :open="open"
    :title="hasClass ? `调整等级（当前 ${totalLevel} 级）` : '调整等级'"
    @close="$emit('close')"
  >
    <p v-if="!hasClass" class="level-adjust__hint">尚未选择职业，请先在第 1 步或第 3 步选择职业后再分配等级。</p>
    <ClassAllocationControl
      v-else
      :draft="draft"
      compact
      @apply="(next) => $emit('apply', next)"
      @apply-total-level="(next) => $emit('totalLevel', next)"
      @cancel="$emit('close')"
    />
    <template v-if="!hasClass" #footer>
      <BaseButton variant="secondary" @click="$emit('close')">关闭</BaseButton>
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
}
</style>
