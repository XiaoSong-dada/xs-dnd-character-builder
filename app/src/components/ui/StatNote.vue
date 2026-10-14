<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import UiModal from '@/components/ui/UiModal.vue'

/**
 * 数值说明区（需求 D23—D27）。
 *
 * - 说明最多显示 **2 行**，超出以省略号结尾，tile 高度不再随说明增长（D23）；
 * - 只有**实际被截断**时才可交互：非编辑态双击 / 触屏双击 / 键盘 Enter·Space 打开明细弹窗（D24／D25）；
 * - 弹窗按来源**逐条**列出；没有逐条明细时显示原文（D26）；
 * - 截断显示与弹窗明细来自同一个 `items` 数组，不会出现两套文案（R9）。
 *
 * 触屏双击沿用项目既有约定（250ms 判定窗口，与 `EditableStatTile` 一致）。
 * 编辑态由调用方传 `interactive: false`，避免与「双击编辑数值」冲突。
 */
const props = withDefaults(defineProps<{
  /** 逐条来源说明；每条在弹窗里单独一行，内联时用 ` · ` 拼接后截断。 */
  readonly items?: readonly string[]
  /** 没有逐条明细时的原文（如「当前职业无施法能力」）。 */
  readonly fallback?: string
  /** 弹窗标题使用的数值名称（如「最大生命值」）。 */
  readonly label: string
  /** 当前值，仅用于弹窗标题。 */
  readonly value?: string | number
  /** 是否允许交互：非编辑态传 true，编辑态传 false。 */
  readonly interactive?: boolean
}>(), { interactive: false })

const DOUBLE_TAP_MS = 250

const noteText = computed(() => (props.items?.length ? props.items.join(' · ') : props.fallback ?? ''))
const modalItems = computed<readonly string[]>(() => (props.items?.length ? props.items : (props.fallback ? [props.fallback] : [])))

// ---- 溢出检测：只有真的超过两行才可交互（D24）----
const textEl = ref<HTMLElement>()
const truncated = ref(false)
let observer: ResizeObserver | undefined

function measure(): void {
  const element = textEl.value
  truncated.value = element ? element.scrollHeight > element.clientHeight + 1 : false
}

onMounted(() => {
  measure()
  if (typeof ResizeObserver === 'function') {
    observer = new ResizeObserver(measure)
    if (textEl.value) observer.observe(textEl.value)
  }
  // 窗口尺寸/方向变化会改变换行行数；ResizeObserver 缺失的环境（如 jsdom）也靠它兜底。
  window.addEventListener('resize', measure)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = undefined
  window.removeEventListener('resize', measure)
})

watch(noteText, () => { void nextTick(measure) })

// ---- 交互：双击 / 触屏双击 / 键盘（D25）----
const open = ref(false)
const canOpen = computed(() => props.interactive && truncated.value && modalItems.value.length > 0)
const modalTitle = computed(() => (props.value === undefined ? props.label : `${props.label}（${props.value}）`))

let lastTapAt = 0

function show(): void {
  if (!canOpen.value) return
  open.value = true
}

function handleDblclick(): void {
  show()
}

function handlePointerUp(event: PointerEvent): void {
  // 鼠标双击由 dblclick 负责；触屏没有可靠的 dblclick，沿用 250ms 双击判定。
  if (!canOpen.value || event.pointerType === 'mouse') return
  const now = Date.now()
  if (now - lastTapAt <= DOUBLE_TAP_MS) {
    lastTapAt = 0
    show()
    return
  }
  lastTapAt = now
}

function handleKeydown(event: KeyboardEvent): void {
  if (!canOpen.value) return
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  show()
}
</script>

<template>
  <small
    ref="textEl"
    class="stat-note"
    :class="{ 'stat-note--interactive': canOpen }"
    :role="canOpen ? 'button' : undefined"
    :tabindex="canOpen ? 0 : undefined"
    :aria-label="canOpen ? `查看${label}的说明` : undefined"
    @dblclick="handleDblclick"
    @pointerup="handlePointerUp"
    @keydown="handleKeydown"
  >{{ noteText }}</small>
  <UiModal :open="open" :title="modalTitle" @close="open = false">
    <!--
      TODO(detail-list-overflow)：明细条数多时弹窗会很长（20 级角色的「最大生命值」逐级登记，
      实测 20+ 条；UiModal 自身不滚动）。用户于 2026-10-12 决定本轮不处理，留待后续：
      可选做法是按来源分组（起始职业 / 逐级 / 加成）、折叠次要条目，或让弹窗内容区可滚动。
      记录见 docs/需求文档/界面优化-时间线徽章与数值说明截断-更新任务.md §6.5 第 2 条。
    -->
    <ul class="stat-note__list">
      <li v-for="item in modalItems" :key="item">{{ item }}</li>
    </ul>
  </UiModal>
</template>

<style scoped lang="scss">
.stat-note {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: var(--color-text-muted);
  font-size: 0.68rem;
  line-height: 1.45;

  &--interactive { cursor: zoom-in; }

  &__list {
    display: grid;
    gap: 0.3rem;
    margin: 0;
    padding-left: 1rem;
    font-size: 0.78rem;
    line-height: 1.6;
  }
}
</style>
