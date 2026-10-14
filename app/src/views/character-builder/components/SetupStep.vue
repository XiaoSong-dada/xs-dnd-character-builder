<script setup lang="ts">
import ClassAllocationControl from '@/views/character-builder/components/ClassAllocationControl.vue'
import OptionCard from '@/components/ui/OptionCard.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import { getTotalLevel } from '@/rules/multiclass'
import type { AbilityMethod, CharacterDraft, RulesetId } from '@/types/character'

const props = withDefaults(defineProps<{
  draft: CharacterDraft
  abilityMethod: AbilityMethod
  ruleset?: RulesetId
  /** 已有构筑选择时不能原地改版；点击另一版本将触发另建确认（B00-04）。 */
  rulesetLocked?: boolean
  /** 记忆版本尚未开放而回退时传入，用于内联说明（Q-B09-1）。 */
  rulesetFallback?: RulesetId
}>(), { ruleset: '5e-2014', rulesetLocked: false })
const emit = defineEmits<{
  level: [value: number]
  method: [value: AbilityMethod]
  /** 分配控件提交的新草稿（MC-E02，决策 D6）。 */
  allocation: [draft: CharacterDraft]
  /** 总等级滑杆提交（需求 §3.4）：页面按更轻的确认策略处理。 */
  totalLevel: [draft: CharacterDraft]
  ruleset: [value: RulesetId]
}>()

const RULESETS = [
  { id: '5e-2014' as RulesetId, title: '2014 核心规则', description: 'SRD 5.1 与既有扩展书；当前完整支持。' },
  { id: '5e-2024' as RulesetId, title: '2024 核心规则', description: '2024 玩家手册与城主指南；车卡流程可用，资源结算与导出待后续批次。' },
]
</script>

<template>
  <section class="step-stack">
    <UiNotice v-if="rulesetFallback" tone="warning" title="已改用 2014 新建">
      上次选择的 {{ rulesetFallback === '5e-2024' ? '2024' : '2014' }} 规则版本暂未开放，本次新建已回退为 2014；已有角色不受影响。
    </UiNotice>
    <h2>规则版本</h2>
    <OptionCard
      v-for="option in RULESETS"
      :key="option.id"
      :title="option.title"
      :description="option.description"
      :state="ruleset === option.id ? 'selected' : 'default'"
      :disabled-reason="rulesetLocked && ruleset !== option.id ? '已有构筑：选择它将另建一张新角色卡，当前角色保持原样。' : ''"
      @select="emit('ruleset', option.id)"
    />
    <p v-if="rulesetLocked" class="step-stack__note">已有构筑选择：改用另一版本会另建角色，不会原地转换或修改当前卡。</p>
    <!-- 等级由滑杆设置（需求 §3）：未选职业时即目标等级，已选职业时即该职业等级 -->
    <ClassAllocationControl
      :draft="draft"
      @apply="(next) => emit('allocation', next)"
      @apply-total-level="(next) => emit('totalLevel', next)"
      @cancel="emit('level', getTotalLevel(props.draft))"
    />
    <h2>属性生成方式</h2>
    <OptionCard title="标准数组" description="15、14、13、12、10、8；适合第一次车卡。" :state="abilityMethod === 'standard-array' ? 'selected' : 'default'" @select="$emit('method', 'standard-array')" />
    <OptionCard title="27点购点" :description="ruleset === '5e-2024' ? '2024 官方购点：基础值 8—15，使用递增费用，总消耗不得超过27点。' : '自由调整六项属性，总消耗不得超过27点。'" :state="abilityMethod === 'point-buy' ? 'selected' : 'default'" @select="$emit('method', 'point-buy')" />
    <OptionCard title="自定义" description="适合已有投骰结果或明确团规。" :state="abilityMethod === 'custom' ? 'selected' : 'default'" @select="$emit('method', 'custom')" />
  </section>
</template>

<style scoped lang="scss">
.step-stack {
  display: grid;
  gap: 0.75rem;

  h2 { margin: 0.75rem 0 0; font-size: 1rem; }

  &__note { margin: 0; color: var(--color-text-muted); font-size: 0.75rem; line-height: 1.6; }
}
</style>
