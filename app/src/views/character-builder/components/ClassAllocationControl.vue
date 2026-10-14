<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import {
  MAX_CHARACTER_LEVEL,
  MAX_CLASS_LEVEL,
  addClassEntry,
  getClassEntries,
  getClassLevel,
  getPrimaryClassId,
  getTotalLevel,
  getTotalLevelBounds,
  isMulticlassActive,
  removeClassEntry,
  setClassLevel,
  setMulticlassEnabled,
  setPrimaryClassId,
  setTotalLevel,
} from '@/rules/multiclass'
import { getMulticlassPrerequisiteReport } from '@/rules/multiclass-prerequisites'
import { getRulesRepository } from '@/rules/repositories'
import { isSourceEnabled } from '@/rules/source-books'
import type { CharacterDraft } from '@/types/character'

/**
 * 分配控件（MC-E01；起始职业与总等级滑杆改造见需求 §3、§4）。
 *
 * 交互约定：**每次分配动作立即 emit `apply`**（带上新的草稿），页面负责依赖影响确认；
 * 本控件内部的摘要、「关闭兼职」与「选择起始职业」二次确认只作用于本地待定草稿，确认后同样以 `apply` 提交。
 * 这样控件不需要复制页面的依赖影响逻辑，避免了同一份规则判断出现两个实现。
 */
const props = withDefaults(defineProps<{
  draft: CharacterDraft
  /** 角色卡弹窗模式：标题与说明略作调整，逻辑一致。 */
  compact?: boolean
}>(), { compact: false })

const emit = defineEmits<{
  apply: [draft: CharacterDraft]
  /**
   * 总等级滑杆松手后的提交（需求 §3.4）。与 `apply` 分开，因为页面要对它使用更轻的确认策略：
   * 滑杆只在「有选择将失效」时弹确认，而逐职业步进／移除职业仍保持 `alwaysConfirm`（D7 防误触）。
   */
  applyTotalLevel: [draft: CharacterDraft]
  cancel: []
}>()

const repository = computed(() => getRulesRepository(props.draft.ruleset))
const classes = computed(() => getClassEntries(props.draft))
const totalLevel = computed(() => getTotalLevel(props.draft))
const primaryClassId = computed(() => getPrimaryClassId(props.draft))
const multiclassActive = computed(() => isMulticlassActive(props.draft))
const enabled = computed(() => Boolean(props.draft.multiclass?.enabled))

/**
 * 内联模式（第 1 步／第 3 步）：每次操作立即生效，**不保留待定状态**（需求 §4 R3／D21）。
 * 弹窗模式（角色卡「调整等级」）：保留本地待定副本，「取消 / 确认」是确定与关闭的入口（D19）。
 */
const inline = computed(() => !props.compact)

/**
 * 显示与写入的基准草稿：内联用已提交的 `props.draft`，弹窗用本地待定副本。
 * 所有写入函数都以它为输入，避免内联在「页面依赖确认被取消」后残留未生效的显示。
 */
const base = computed(() => (props.compact ? pending.value : props.draft))

/** 「设置起始职业」只在真正有可切换对象时出现（D18）：与职业列表同一条件。 */
const showOriginEntry = computed(() => multiclassActive.value)

/** 兼职关闭但草稿仍保留多个职业时的提示（D20）：只读说明，不提供按钮。 */
const retainedAllocation = computed(() => {
  if (enabled.value || classes.value.length < 2) return ''
  return classes.value.map((entry) => `${className(entry.classId)}${entry.level}`).join(' / ')
})

const prerequisiteReport = computed(() => getMulticlassPrerequisiteReport(props.draft))
const prerequisiteByClass = computed(() => new Map(prerequisiteReport.value.results.map((item) => [item.classId, item])))

function className(classId: string): string {
  return repository.value.getClass(classId)?.name ?? classId
}

/** 候选职业：当前来源启用、规则数据存在（「添加职业」与「选择起始职业」共用同一口径）。 */
const availableClasses = computed(() => repository.value.classes
  .filter((classRule) => isSourceEnabled(classRule.sourceIds, props.draft.enabledSourceIds, repository.value))
  .map((classRule) => ({ id: classRule.id, name: classRule.name, summary: classRule.summary })))

/** 可添加职业：剔除已加入的职业。 */
const addableClasses = computed(() => {
  const used = new Set(classes.value.map((entry) => entry.classId))
  return availableClasses.value.filter((item) => !used.has(item.id))
})

/** 没有任何职业时滑杆只能表达目标等级，此时用 `targetLevel` 作为显示值。 */
const effectiveTotal = computed(() => classes.value.length > 0
  ? totalLevel.value
  : Math.max(1, props.draft.targetLevel ?? 1))
const totalBounds = computed(() => classes.value.length > 0
  ? getTotalLevelBounds(props.draft)
  : { min: 1, max: MAX_CHARACTER_LEVEL })

/**
 * 滑杆的本地预览值（需求 §3.4）：拖动中只改这里，松手（`change`）才提交，
 * 避免拖动过程中反复触发页面的依赖影响确认。
 */
const sliderLevel = ref(effectiveTotal.value)
watch(() => props.draft, () => { sliderLevel.value = effectiveTotal.value })

function onSliderInput(event: Event): void {
  sliderLevel.value = Number((event.target as HTMLInputElement).value)
}

async function onSliderCommit(): Promise<void> {
  const target = sliderLevel.value
  // 尚无职业（第 1 步）：只写目标等级，不下发职业分配（页面按 target-level 路径处理）。
  if (classes.value.length === 0) {
    if (target === props.draft.targetLevel) return
    const next = { ...base.value, targetLevel: target }
    if (props.compact) pending.value = next
    emit('applyTotalLevel', next)
  } else {
    const result = setTotalLevel(base.value, target)
    if (!result.ok) {
      sliderLevel.value = effectiveTotal.value
      return
    }
    if (props.compact) pending.value = result.draft
    emit('applyTotalLevel', result.draft)
  }
  if (props.compact) return
  // 内联：提交若未被页面采纳（例如依赖确认被取消），把显示回到已提交值，不残留未生效的滑杆位置。
  await nextTick()
  if (sliderLevel.value !== effectiveTotal.value) sliderLevel.value = effectiveTotal.value
}

/** 等级名的展示口径：兼职时是总等级，否则是该职业（或目标）等级。 */
const levelLabel = computed(() => multiclassActive.value ? '总等级' : '目标等级')

/** 步进按钮可用性（需求 §3.2，决策 D34）：与滑杆同一组边界，到界即禁用、不产生事件。 */
function canStepLevel(delta: number): boolean {
  const next = sliderLevel.value + delta
  return next >= totalBounds.value.min && next <= totalBounds.value.max
}

/**
 * ±1 步进（需求 §3，决策 D34／D35）：先移动本地预览值，再复用滑杆的提交通道与回滚语义——
 * 只发 `applyTotalLevel`（轻量确认策略），不新增第二条提交实现，也不引入第二套边界判断。
 */
async function stepLevel(delta: -1 | 1): Promise<void> {
  if (!canStepLevel(delta)) return
  sliderLevel.value += delta
  await onSliderCommit()
}

/** 弹窗模式的本地待定副本：内联模式不使用它（R3／D21）。 */
const pending = ref<CharacterDraft>(props.draft)
watch(() => props.draft, (next) => { pending.value = next })

function applyDraft(next: CharacterDraft): void {
  // 内联（即时生效）不保留待定副本；只有弹窗需要它来支撑「取消 / 确认」。
  if (props.compact) pending.value = next
  emit('apply', next)
}

// ---- 启用兼职：先选起始职业（需求 §4.1／§4.2）----
const originPickerOpen = ref(false)
/** 弹窗打开期间把开关显示为「已打开」，取消时回落为真实状态。 */
const pendingEnabled = ref<boolean>()
const originChoice = ref('')

/** 弹窗候选：已有职业时只列已加入的职业；没有职业时列全部可用职业。 */
const originCandidates = computed(() => classes.value.length > 0
  ? classes.value.map((entry) => ({
      id: entry.classId,
      name: className(entry.classId),
      summary: entry.classId === primaryClassId.value ? `当前起始职业 · ${entry.level} 级` : `${entry.level} 级`,
    }))
  : availableClasses.value.map((item) => ({ id: item.id, name: item.name, summary: item.summary })))

function openOriginPicker(): void {
  originChoice.value = primaryClassId.value ?? classes.value[0]?.classId ?? ''
  originPickerOpen.value = true
}

function cancelOriginPicker(): void {
  originPickerOpen.value = false
  pendingEnabled.value = undefined
  originChoice.value = ''
}

function confirmOriginPicker(): void {
  const classId = originChoice.value
  if (!classId) return
  originPickerOpen.value = false
  pendingEnabled.value = undefined
  // 草稿还没有职业：选中的职业同时成为第一个职业（等级 = 当前目标等级）与起始职业。
  if (classes.value.length === 0) {
    const added = addClassEntry(base.value, classId)
    if (!added.ok) return
    const leveled = setClassLevel(added.draft, classId, effectiveTotal.value)
    if (!leveled.ok) return
    const normalized = setPrimaryClassId(leveled.draft, classId)
    applyDraft(normalized.ok ? normalized.draft : setMulticlassEnabled(leveled.draft, true))
    return
  }
  // 已有职业：只切换起始职业并开启兼职，不改变任何职业的等级。
  const switched = setPrimaryClassId(base.value, classId)
  applyDraft(setMulticlassEnabled(switched.ok ? switched.draft : base.value, true))
}

function onToggleEnabled(value: boolean): void {
  if (value) {
    pendingEnabled.value = true
    openOriginPicker()
    return
  }
  const next = setMulticlassEnabled(base.value, false)
  // 关闭兼职（D7）：存在多个职业时必须显式选择「合并到起始职业」或取消，且不可撤销。
  if (getClassEntries(next).length > 1) {
    closeConfirmOpen.value = true
    applyDraft(next)
    return
  }
  applyDraft(next)
}

/** 手动设置起始职业（不改变兼职开关）——第 1 步／第 3 步／角色卡弹窗三处共用。 */
function switchPrimary(classId: string): void {
  if (classId === primaryClassId.value) return
  const result = setPrimaryClassId(base.value, classId)
  if (!result.ok) return
  applyDraft(result.draft)
}

const closeConfirmOpen = ref(false)

/** 合并到起始职业：总等级不变，其余职业的等级并入起始职业（不超过 19 级上限）。 */
function mergeIntoPrimary(): void {
  const entries = getClassEntries(base.value)
  const primaryClassId = getPrimaryClassId(base.value)
  if (!primaryClassId) return
  const total = entries.reduce((sum, entry) => sum + entry.level, 0)
  const primaryEntry = entries.find((entry) => entry.classId === primaryClassId)
  const merged = { classId: primaryClassId, level: Math.min(MAX_CLASS_LEVEL, total), ...(primaryEntry?.subclassId ? { subclassId: primaryEntry.subclassId } : {}) }
  applyDraft({
    ...base.value,
    multiclass: {
      enabled: false,
      primaryClassId,
      classes: [merged],
      levelOrder: Array.from({ length: merged.level }, () => primaryClassId),
    },
    classId: primaryClassId,
    subclassId: merged.subclassId,
    targetLevel: merged.level,
  })
  closeConfirmOpen.value = false
}

function cancelClose(): void {
  closeConfirmOpen.value = false
  // 取消时把开关恢复为打开，避免界面状态与数据不一致
  applyDraft(setMulticlassEnabled(base.value, true))
}

function changeLevel(classId: string, delta: number): void {
  const current = getClassLevel(base.value, classId)
  const next = current + delta
  if (next < 0 || next > MAX_CLASS_LEVEL) return
  if (next === 0) {
    // 降到 0 = 移除该职业（D5），起始职业不可移除（D16）
    const result = removeClassEntry(base.value, classId)
    if (!result.ok) return
    applyDraft(result.draft)
    return
  }
  const result = setClassLevel(base.value, classId, next)
  if (!result.ok) return
  applyDraft(result.draft)
}

function onAddClass(classId: string): void {
  const result = addClassEntry(base.value, classId)
  if (!result.ok) return
  applyDraft(result.draft)
  addPickerOpen.value = false
  addQuery.value = ''
}

const addPickerOpen = ref(false)
const addQuery = ref('')
const filteredAddable = computed(() => {
  const query = addQuery.value.trim()
  if (!query) return addableClasses.value
  return addableClasses.value.filter((item) => item.name.includes(query) || item.id.includes(query))
})

const totalWarning = computed(() => {
  if (classes.value.length === 0) return ''
  if (totalLevel.value > MAX_CHARACTER_LEVEL) return `总等级 ${totalLevel.value} 已超过 ${MAX_CHARACTER_LEVEL} 级，请降低某个职业的等级。`
  if (totalLevel.value < classes.value.length) return `每个职业至少 1 级，总等级不能低于 ${classes.value.length}。`
  return ''
})

/** 变更摘要（D2 第 8 条）：总等级前后、各职业等级前后、先决问题数。 */
const changeSummary = computed(() => {
  const before = getTotalLevel(props.draft)
  const after = getTotalLevel(base.value)
  const beforeEntries = getClassEntries(props.draft)
  const afterEntries = getClassEntries(base.value)
  const beforeById = new Map(beforeEntries.map((entry) => [entry.classId, entry.level]))
  const lines = afterEntries.map((entry) => {
    const previous = beforeById.get(entry.classId)
    const label = className(entry.classId)
    return previous === undefined
      ? `${label} 新增 ${entry.level} 级`
      : previous === entry.level ? `${label} 保持 ${entry.level} 级` : `${label} ${previous} → ${entry.level} 级`
  })
  const removed = beforeEntries.filter((entry) => !afterEntries.some((item) => item.classId === entry.classId))
  for (const entry of removed) lines.push(`${className(entry.classId)} 移除（原有 ${entry.level} 级）`)
  return { before, after, lines, direction: after > before ? 'up' as const : after < before ? 'down' as const : 'same' as const }
})

const canApply = computed(() => changeSummary.value.lines.some((line) => !line.includes('保持')) || totalLevel.value !== getTotalLevel(props.draft))
</script>

<template>
  <section class="allocation">
    <header class="allocation__header">
      <div>
        <h2>{{ compact ? '调整等级' : '职业与等级分配' }}</h2>
        <p class="allocation__hint">
          总等级为各职业等级之和。开启兼职后可以分配多个职业的等级；兼职是可选规则，需 DM 同意。
        </p>
      </div>
      <label class="allocation__switch">
        <input type="checkbox" :checked="pendingEnabled ?? enabled" @change="onToggleEnabled(($event.target as HTMLInputElement).checked)">
        <span><b>启用兼职</b><small>可选规则，需 DM 同意</small></span>
      </label>
    </header>

    <!-- 等级卡（需求 §2／§3）：滑杆 + ±1 步进；无职业、单职业与兼职三种状态共用（D34） -->
    <div class="allocation__level">
      <div class="allocation__level-head">
        <span>{{ levelLabel }}</span>
        <div class="allocation__stepper allocation__stepper--total">
          <BaseButton
            variant="secondary"
            :disabled="!canStepLevel(-1)"
            :aria-label="`${levelLabel}降一级`"
            @click="stepLevel(-1)"
          >−</BaseButton>
          <b>{{ sliderLevel }}级</b>
          <BaseButton
            variant="secondary"
            :disabled="!canStepLevel(1)"
            :aria-label="`${levelLabel}升一级`"
            @click="stepLevel(1)"
          >＋</BaseButton>
        </div>
      </div>
      <label class="allocation__slider">
        <input
          type="range"
          :min="totalBounds.min"
          :max="totalBounds.max"
          :value="sliderLevel"
          :aria-label="levelLabel"
          @input="onSliderInput"
          @change="onSliderCommit"
        >
        <small v-if="classes.length === 0">等级决定需要完成多少次职业、子职和属性提升选择；也可以点按 ± 逐级调整。</small>
        <small v-else-if="multiclassActive">
          拖动滑杆或点按 ± 调整总等级：加级给列表最后一个职业，减级从末尾往前扣；单个职业最低 1 级，调整不会移除职业。
        </small>
        <small v-else>等级决定需要完成多少次职业、子职和属性提升选择；也可以点按 ± 逐级调整。</small>
      </label>
    </div>

    <p class="allocation__total">
      <span>总等级 <b>{{ effectiveTotal }}</b> 级</span>
      <small v-if="classes.length">{{ classes.map((entry) => `${className(entry.classId)} ${entry.level}`).join(' + ') }}</small>
      <small v-else>尚未选择职业，可先在第 3 步选择，或开启兼职时直接选一个。</small>
    </p>

    <UiNotice v-if="totalWarning" tone="error" title="等级分配有误">{{ totalWarning }}</UiNotice>

    <p v-if="!multiclassActive" class="allocation__note">开启兼职前，这里直接设置唯一职业的等级。</p>

    <!-- 兼职：逐职业步进；职业数不设上限（D9） -->
    <ul v-if="multiclassActive" class="allocation__list">
      <li v-for="entry in classes" :key="entry.classId" class="allocation__row">
        <div class="allocation__row-main">
          <span class="allocation__name">
            {{ className(entry.classId) }}
            <UiBadge v-if="entry.classId === primaryClassId" tone="primary">起始职业</UiBadge>
          </span>
          <div class="allocation__stepper">
            <BaseButton variant="secondary" :disabled="entry.level <= 1 && entry.classId === primaryClassId" @click="changeLevel(entry.classId, -1)">−</BaseButton>
            <b>{{ entry.level }}</b>
            <BaseButton
              variant="secondary"
              :disabled="totalLevel >= MAX_CHARACTER_LEVEL || entry.level >= MAX_CLASS_LEVEL"
              @click="changeLevel(entry.classId, 1)"
            >＋</BaseButton>
          </div>
        </div>
        <p v-if="prerequisiteByClass.get(entry.classId)?.status === 'unmet'" class="allocation__warn">
          {{ prerequisiteByClass.get(entry.classId)?.reasons[0] }}
        </p>
        <p v-else-if="prerequisiteByClass.get(entry.classId)?.status === 'pending'" class="allocation__warn">
          {{ prerequisiteByClass.get(entry.classId)?.reasons[0] }}
        </p>
        <!-- 起始职业不可移除（D16）：必须写明移除路径，否则玩家会卡住 -->
        <p v-if="entry.classId === primaryClassId" class="allocation__note">
          起始职业不可移除；切换到其他职业后，它就会变成普通职业，可以降到 0 移除。
        </p>
        <template v-else>
          <p class="allocation__note">降到 0 级将移除该职业（不可撤销）。</p>
          <button type="button" class="allocation__switch-primary" @click="switchPrimary(entry.classId)">设为起始职业</button>
        </template>
      </li>
    </ul>

    <p v-if="multiclassActive && totalLevel >= MAX_CHARACTER_LEVEL" class="allocation__note">
      总等级已达 {{ MAX_CHARACTER_LEVEL }}，请先降低其他职业的等级。
    </p>

    <div class="allocation__actions">
      <BaseButton v-if="enabled" variant="secondary" @click="addPickerOpen = true">添加职业</BaseButton>
      <!-- 设置起始职业（需求 §4.4）：只在兼职启用且有可切换对象时出现（D18） -->
      <BaseButton v-if="showOriginEntry" variant="secondary" @click="openOriginPicker">设置起始职业</BaseButton>
    </div>
    <p v-if="!enabled" class="allocation__note">开启「启用兼职」后可以添加第二个职业。</p>
    <!-- 兼职关闭但草稿仍保留多个职业（D20）：只读说明，避免被误认为数据丢失 -->
    <p v-if="retainedAllocation" class="allocation__note">
      已保留兼职分配：{{ retainedAllocation }}，重新启用后可继续编辑。
    </p>

    <!-- 「本次变更」只属于弹窗的待定流程：内联已即时生效，没有待定状态（D19／R3） -->
    <section v-if="!inline && canApply" class="allocation__summary">
      <strong>本次变更</strong>
      <p>总等级 {{ changeSummary.before }} → {{ changeSummary.after }}</p>
      <ul>
        <li v-for="line in changeSummary.lines" :key="line">{{ line }}</li>
      </ul>
    </section>

    <!-- 底部「取消 / 确认」只在弹窗模式出现（D19）：内联每次操作已生效，这两个按钮没有作用 -->
    <footer v-if="!inline" class="allocation__footer">
      <BaseButton variant="secondary" @click="emit('cancel')">取消</BaseButton>
      <BaseButton :disabled="Boolean(totalWarning)" @click="emit('apply', pending)">确认</BaseButton>
    </footer>

    <!-- 选择起始职业（需求 §4.2）：候选按是否已有职业决定 -->
    <UiModal :open="originPickerOpen" title="选择起始职业" @close="cancelOriginPicker">
      <p>
        起始职业是角色 1 级时所选的职业（主职业），承载 <b>1 级生命值、起始装备与豁免熟练</b>；
        兼职不会获得其他职业的起始装备。
      </p>
      <p v-if="classes.length === 0" class="allocation__note">
        当前还没有职业，选中的职业会成为第一个职业，等级取当前目标等级 {{ effectiveTotal }} 级。
      </p>
      <p v-else class="allocation__note">只切换「哪一个是起始职业」，不会改变任何职业的等级。</p>
      <ul class="allocation__options">
        <li v-for="item in originCandidates" :key="item.id">
          <button
            type="button"
            :class="{ 'allocation__option--current': item.id === originChoice }"
            @click="originChoice = item.id"
          >
            <b>{{ item.name }}</b>
            <small>{{ item.summary }}</small>
          </button>
        </li>
      </ul>
      <template #footer>
        <BaseButton variant="secondary" @click="cancelOriginPicker">取消</BaseButton>
        <BaseButton :disabled="!originChoice" @click="confirmOriginPicker">确认</BaseButton>
      </template>
    </UiModal>

    <!-- 关闭兼职的破坏性确认（D7：常驻说明 + 二次确认 + 明细 + 无快捷入口） -->
    <UiModal :open="closeConfirmOpen" title="关闭兼职" @close="cancelClose">
      <p>关闭兼职会把其他职业的等级合并到起始职业，<b>总等级不变</b>。</p>
      <p class="allocation__warn">此操作不可撤销，也不会保留各职业的等级分配历史。</p>
      <ul>
        <li v-for="entry in classes.filter((item) => item.classId !== primaryClassId)" :key="entry.classId">
          将合并：{{ className(entry.classId) }} {{ entry.level }} 级
        </li>
      </ul>
      <p class="allocation__note">合并后：{{ className(primaryClassId ?? '') }} {{ Math.min(MAX_CLASS_LEVEL, totalLevel) }} 级。</p>
      <template #footer>
        <BaseButton variant="secondary" @click="cancelClose">保留兼职</BaseButton>
        <BaseButton variant="danger" @click="mergeIntoPrimary">确认合并</BaseButton>
      </template>
    </UiModal>

    <!-- 添加职业 -->
    <UiModal :open="addPickerOpen" title="添加职业" @close="addPickerOpen = false">
      <label class="allocation__search">
        <span>搜索职业</span>
        <input v-model="addQuery" type="search" placeholder="输入职业名">
      </label>
      <ul class="allocation__options">
        <li v-for="item in filteredAddable" :key="item.id">
          <button type="button" @click="onAddClass(item.id)">
            <b>{{ item.name }}</b>
            <small>{{ item.summary }}</small>
          </button>
        </li>
      </ul>
      <p v-if="filteredAddable.length === 0" class="allocation__note">没有可添加的职业（已全部加入，或来源未启用）。</p>
    </UiModal>
  </section>
</template>

<style scoped lang="scss">
.allocation {
  display: grid;
  gap: 0.75rem;

  &__header {
    display: grid;
    gap: 0.5rem;

    h2 { margin: 0; font-size: 1rem; }
  }

  &__hint { margin: 0; color: var(--color-text-muted); font-size: 0.78rem; line-height: 1.6; }

  &__switch {
    display: flex;
    min-height: 3rem;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);

    input { width: 1.25rem; height: 1.25rem; accent-color: var(--color-primary); }
    span { display: grid; gap: 0.15rem; }
    b { font-size: 0.85rem; }
    small { color: var(--color-text-muted); font-size: 0.72rem; }
  }

  /* 等级卡（需求 §2）：卡片外壳 + 头部（等级名与 ±1 步进）+ 滑杆 */
  &__level {
    display: grid;
    gap: 0.6rem;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
  }

  &__level-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    color: var(--color-text-muted);
  }

  /* 等级滑杆（需求 §3）：与改动前的第 1 步同一形态 */
  &__slider {
    display: grid;
    gap: 0.6rem;

    input { width: 100%; accent-color: var(--color-primary); }
    small { color: var(--color-text-muted); line-height: 1.6; }
  }

  &__total {
    display: grid;
    gap: 0.2rem;
    margin: 0;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);

    span { font-size: 0.9rem; }
    b { color: var(--color-primary); font-size: 1.1rem; }
    small { color: var(--color-text-muted); font-size: 0.75rem; }
  }

  &__list { display: grid; gap: 0.5rem; margin: 0; padding: 0; list-style: none; }

  &__row {
    display: grid;
    gap: 0.35rem;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
  }

  &__row-main { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }

  &__name { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; }

  &__stepper {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    b { min-width: 1.5rem; text-align: center; font-size: 0.95rem; }

    /* 总等级步进（需求 §2）：读数用主色强调，与职业行步进区分层级 */
    &--total b { min-width: 3rem; color: var(--color-primary); font-size: 1.05rem; }
  }

  &__switch-primary {
    justify-self: start;
    min-height: 2.75rem;
    padding: 0 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-primary);
    background: var(--color-surface);
    font-size: 0.75rem;
    font-weight: 700;
  }

  &__warn { margin: 0; color: var(--color-danger, #b3261e); font-size: 0.75rem; line-height: 1.5; }

  &__note { margin: 0; color: var(--color-text-muted); font-size: 0.72rem; line-height: 1.5; }

  &__actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }

  &__summary {
    display: grid;
    gap: 0.3rem;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);

    strong { font-size: 0.82rem; }
    p { margin: 0; font-size: 0.78rem; }
    ul { margin: 0; padding-left: 1rem; color: var(--color-text-muted); font-size: 0.75rem; line-height: 1.6; }
  }

  &__footer { display: flex; justify-content: flex-end; gap: 0.5rem; }

  &__search {
    display: grid;
    gap: 0.3rem;
    margin-bottom: 0.75rem;

    span { color: var(--color-text-muted); font-size: 0.75rem; }
    input { min-height: 2.5rem; padding: 0 0.6rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
  }

  &__options {
    display: grid;
    gap: 0.4rem;
    margin: 0;
    padding: 0;
    list-style: none;

    button {
      display: grid;
      width: 100%;
      gap: 0.2rem;
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      text-align: left;
    }

    b { font-size: 0.85rem; }
    small { color: var(--color-text-muted); font-size: 0.72rem; }
  }

  &__option--current {
    border-color: var(--color-primary) !important;
    color: var(--color-primary);
  }
}
</style>
