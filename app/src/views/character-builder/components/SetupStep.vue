<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import OptionCard from '@/components/ui/OptionCard.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import { useRulesRepository } from '@/hooks/useRulesRepository'
import { getClassEntries, getPrimaryClassId, getTotalLevel, isMulticlassActive } from '@/rules/multiclass'
import type { AbilityMethod, CharacterDraft, RulesetId } from '@/types/character'
import ClassAllocationControl from '@/views/character-builder/components/ClassAllocationControl.vue'
import SelectionTaskNavigator from '@/views/character-builder/components/SelectionTaskNavigator.vue'
import { useSelectionTaskFlow } from '@/views/character-builder/hooks/useSelectionTaskFlow'
import type { SelectionTask } from '@/views/character-builder/selection-task'

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
/** 任务卡摘要用短名称；选项卡的完整说明仍留在模板里（27 点购点说明随规则版本变化）。 */
const METHOD_LABELS: Readonly<Record<AbilityMethod, string>> = {
  'standard-array': '标准数组',
  'point-buy': '27点购点',
  custom: '自定义',
}
/** 本步任务顺序：当前项的值变化后只沿这条顺序向后推进，最后一项停在本步。 */
const TASK_ORDER = ['ruleset', 'level', 'ability-method'] as const

const repository = useRulesRepository(() => props.draft.ruleset)
const classEntries = computed(() => getClassEntries(props.draft))
const totalLevel = computed(() => getTotalLevel(props.draft))
const multiclassActive = computed(() => isMulticlassActive(props.draft))
const currentRuleset = computed(() => RULESETS.find((option) => option.id === props.ruleset) ?? RULESETS[0]!)

function className(classId: string): string {
  return repository.value.getClass(classId)?.name ?? classId
}

/** 已选摘要：未选职业时说明滑杆写在目标等级上，与等级卡口径一致。 */
const levelSummary = computed(() => {
  if (classEntries.value.length === 0) return `目标 ${props.draft.targetLevel} 级 · 尚未选职业`
  if (!multiclassActive.value) {
    const entry = classEntries.value[0]!
    return `${className(entry.classId)} ${entry.level} 级`
  }
  return `${classEntries.value.map((entry) => `${className(entry.classId)}${entry.level}`).join(' / ')}（${totalLevel.value} 级角色）`
})
const primaryClassName = computed(() => {
  const classId = getPrimaryClassId(props.draft)
  return classId ? className(classId) : ''
})

/**
 * 第 1 步的三个任务（参照第 4 步任务式引导）。
 *
 * 三项都有可用的默认值（2014 核心规则、新建默认等级、标准数组），沿用默认值即可直接继续，
 * 因此任务开始即为「已完成」；已选摘要让新手看清当前值，当前项由任务卡高亮。
 */
const tasks = computed<readonly SelectionTask[]>(() => [
  { id: 'ruleset', label: '规则版本', group: '规则', required: true, status: 'complete', summary: currentRuleset.value.title },
  {
    id: 'level',
    label: '等级与兼职',
    group: '角色',
    required: true,
    status: 'complete',
    summary: levelSummary.value,
    ...(multiclassActive.value ? { progress: `起始职业：${primaryClassName.value}` } : {}),
  },
  { id: 'ability-method', label: '属性生成方式', group: '属性', required: true, status: 'complete', summary: METHOD_LABELS[props.abilityMethod] },
])

const headingEl = ref<HTMLElement>()
const flow = useSelectionTaskFlow(tasks, headingEl)

/** 当前项的值真正变化后（含等级确认弹窗确认后）才推进到下一项，取消或回退不跳转。 */
function advanceFrom(taskId: typeof TASK_ORDER[number]): void {
  if (flow.activeTaskId.value !== taskId) return
  const next = TASK_ORDER[TASK_ORDER.indexOf(taskId) + 1]
  if (next) flow.selectTask(next)
}

watch(() => props.draft.ruleset, (next, previous) => {
  if (next !== previous) advanceFrom('ruleset')
})
/** 等级签名覆盖滑杆、步进、等级表格与增删／切换职业：任何写入都会让当前项推进。 */
const levelSignature = computed(() => `${classEntries.value.map((entry) => `${entry.classId}:${entry.level}`).join(',')}|${props.draft.targetLevel}|${Boolean(props.draft.multiclass?.enabled)}`)
watch(levelSignature, (next, previous) => {
  if (next !== previous) advanceFrom('level')
})
watch(() => props.draft.abilityMethod, (next, previous) => {
  if (next !== previous) advanceFrom('ability-method')
})

const nextTask = computed(() => {
  const index = TASK_ORDER.indexOf(flow.activeTaskId.value as typeof TASK_ORDER[number])
  if (index < 0) return undefined
  return tasks.value.find((task) => task.id === TASK_ORDER[index + 1])
})
</script>

<template>
  <section class="setup-step">
    <UiNotice v-if="rulesetFallback" tone="warning" title="已改用 2014 新建">
      上次选择的 {{ rulesetFallback === '5e-2024' ? '2024' : '2014' }} 规则版本暂未开放，本次新建已回退为 2014；已有角色不受影响。
    </UiNotice>
    <SelectionTaskNavigator v-model="flow.activeTaskId.value" :tasks="tasks" :completed="flow.completedCount.value" />
    <section class="setup-step__panel" role="tabpanel">
      <header>
        <span>{{ flow.activeTask.value?.group }}</span>
        <h2 ref="headingEl" tabindex="-1">{{ flow.activeTask.value?.label }}</h2>
      </header>

      <template v-if="flow.activeTaskId.value === 'ruleset'">
        <p class="setup-step__hint">
          规则版本决定后续可选的职业、种族、背景、法术与装备，也决定默认选项；新手建议沿用「2014 核心规则」（当前完整支持）。
        </p>
        <OptionCard
          v-for="option in RULESETS"
          :key="option.id"
          :title="option.title"
          :description="option.description"
          :state="ruleset === option.id ? 'selected' : 'default'"
          :disabled-reason="rulesetLocked && ruleset !== option.id ? '已有构筑：选择它将另建一张新角色卡，当前角色保持原样。' : ''"
          @select="emit('ruleset', option.id)"
        />
        <p v-if="rulesetLocked" class="setup-step__note">已有构筑选择：改用另一版本会另建角色，不会原地转换或修改当前卡。</p>
      </template>

      <template v-else-if="flow.activeTaskId.value === 'level'">
        <p class="setup-step__hint">
          等级决定熟练加值、生命值与要完成的职业选择；默认 1 级，选职业后可在第 3 步继续调整。兼职是可选规则，开启时先设置起始职业。
        </p>
        <!-- 等级由滑杆设置（需求 §3）：未选职业时即目标等级，已选职业时即该职业等级 -->
        <ClassAllocationControl
          :draft="draft"
          @apply="(next) => emit('allocation', next)"
          @apply-total-level="(next) => emit('totalLevel', next)"
          @cancel="emit('level', getTotalLevel(props.draft))"
        />
        <p v-if="multiclassActive" class="setup-step__note">
          当前起始职业：{{ primaryClassName }}。它承载 1 级生命值、起始装备与豁免熟练，可在下方「设置起始职业」切换。
        </p>
      </template>

      <template v-else-if="flow.activeTaskId.value === 'ability-method'">
        <p class="setup-step__hint">
          属性生成方式决定第 5 步如何得到六项属性；新手建议沿用「标准数组」，无需现场计算。
        </p>
        <OptionCard title="标准数组" description="15、14、13、12、10、8；适合第一次车卡。" :state="abilityMethod === 'standard-array' ? 'selected' : 'default'" @select="$emit('method', 'standard-array')" />
        <OptionCard title="27点购点" :description="ruleset === '5e-2024' ? '2024 官方购点：基础值 8—15，使用递增费用，总消耗不得超过27点。' : '自由调整六项属性，总消耗不得超过27点。'" :state="abilityMethod === 'point-buy' ? 'selected' : 'default'" @select="$emit('method', 'point-buy')" />
        <OptionCard title="自定义" description="适合已有投骰结果或明确团规。" :state="abilityMethod === 'custom' ? 'selected' : 'default'" @select="$emit('method', 'custom')" />
      </template>

      <p class="setup-step__hint">
        <template v-if="nextTask">完成后会自动进入下一项「{{ nextTask.label }}」，也可以点上方任务卡自由跳转。</template>
        <template v-else>本步设置都可以沿用默认值；点底部「继续」进入第 2 步：规则来源。</template>
      </p>
    </section>
  </section>
</template>

<style scoped lang="scss">
.setup-step {
  display: grid;
  gap: 0.75rem;

  &__panel { display: grid; gap: 0.65rem; }
  &__panel > header {
    span { color: var(--color-primary); font-size: 0.7rem; font-weight: 700; }
    h2 { margin: 0.2rem 0; font-size: 1.05rem; outline: none; }
  }
  &__hint { margin: 0; color: var(--color-text-muted); font-size: 0.75rem; line-height: 1.6; }
  &__note { margin: 0; color: var(--color-text-muted); font-size: 0.75rem; line-height: 1.6; }
}
</style>
