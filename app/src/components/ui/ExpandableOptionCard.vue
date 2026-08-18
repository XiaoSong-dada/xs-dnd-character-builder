<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    /** 展开区标题（如"法术效果"），为空不显示。 */
    expandedLabel?: string
    state?: 'default' | 'selected' | 'recommended' | 'complete' | 'locked' | 'incompatible' | 'error'
    disabledReason?: string
    /** 单击选择时同时展开介绍区（用于弹窗类紧凑列表的下拉式介绍）。 */
    expandOnSelect?: boolean
    /** 是否显示左侧单选标记（radio 样式：圆形，选中时显示实心圆点）；默认关闭（不显示选择框）。 */
    radio?: boolean
  }>(),
  {
    description: '',
    expandedLabel: '',
    state: 'default',
    disabledReason: '',
    expandOnSelect: false,
    radio: false,
  },
)

const emit = defineEmits<{ select: []; toggle: [expanded: boolean] }>()

const open = ref(false)
const panelId = `expandable-option-card-panel-${useId()}`
const slots = useSlots()
/** 调用方未提供展开内容时显示占位提示。 */
const hasExpandedContent = computed(() => Boolean(slots.expanded))
/** 双击判定窗口（毫秒）：窗口内第二次点击视为双击，切换展开并抑制该次选择。 */
const DOUBLE_CLICK_MS = 250
let lastClickAt = 0
let selectTimer: ReturnType<typeof setTimeout> | undefined

function toggleExpanded(): void {
  open.value = !open.value
  emit('toggle', open.value)
}

/** 单击 = 选择（延迟判定）；双击 = 展开/收起（抑制选择）。 */
function handleMainClick(): void {
  const now = Date.now()
  if (now - lastClickAt <= DOUBLE_CLICK_MS) {
    if (selectTimer) {
      clearTimeout(selectTimer)
      selectTimer = undefined
    }
    lastClickAt = 0
    toggleExpanded()
    return
  }
  lastClickAt = now
  if (selectTimer) clearTimeout(selectTimer)
  selectTimer = setTimeout(() => {
    selectTimer = undefined
    if (props.expandOnSelect) open.value = true
    emit('select')
  }, DOUBLE_CLICK_MS)
}

onBeforeUnmount(() => {
  if (selectTimer) clearTimeout(selectTimer)
})
</script>

<template>
  <div class="expandable-option-card" :class="`expandable-option-card--${state}`">
    <div class="expandable-option-card__head">
      <button
        type="button"
        class="expandable-option-card__main"
        :disabled="state === 'locked'"
        :aria-pressed="state === 'selected'"
        @click="handleMainClick"
      >
        <span v-if="radio" class="expandable-option-card__mark" aria-hidden="true" />
        <span class="expandable-option-card__content">
          <span class="expandable-option-card__title-line">
            <strong>{{ title }}</strong>
          </span>
          <span v-if="description" class="expandable-option-card__summary">{{ description }}</span>
          <span v-if="disabledReason" class="expandable-option-card__reason">{{ disabledReason }}</span>
        </span>
      </button>
      <div class="expandable-option-card__badges"><slot name="suffix" /></div>
      <button
        type="button"
        class="expandable-option-card__arrow"
        :class="{ 'expandable-option-card__arrow--open': open }"
        :aria-expanded="open"
        :aria-controls="panelId"
        :aria-label="open ? '收起' + title : '展开' + title"
        @click="toggleExpanded"
      >›</button>
    </div>
    <div v-if="open" :id="panelId" class="expandable-option-card__growth">
      <strong v-if="expandedLabel">{{ expandedLabel }}</strong>
      <slot name="expanded" />
      <p v-if="!hasExpandedContent" class="expandable-option-card__placeholder">暂无摘要，效果以规则来源为准。</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.expandable-option-card {
  display: grid;
  // 滚动 grid 容器（如添加物品弹窗列表）中，item 的 overflow 非 visible 时 min-height:auto
  // 解析为 0 会导致卡片塌缩成仅边框的细条；显式 min-height 与内部 __main 保持一致。
  min-height: 4.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  overflow: hidden;

  &__head { display: flex; align-items: stretch; }

  &__main {
    display: flex;
    width: 100%;
    min-height: 4.25rem;
    flex: 1;
    align-items: center;
    gap: 0.7rem;
    padding: 0.7rem 0 0.7rem 0.8rem;
    border: 0;
    color: var(--color-text);
    background: transparent;
    text-align: left;
    cursor: pointer;

    &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: -2px; }
  }

  &__mark {
    display: grid;
    width: 1.4rem;
    height: 1.4rem;
    flex: none;
    place-items: center;
    border: 1px solid var(--color-border);
    border-radius: 50%;
    color: var(--color-surface);
    font-size: 0.75rem;

    // 单选标记：选中时显示实心圆点（radio 样式）
    &::after {
      content: '';
      width: 0.6rem;
      height: 0.6rem;
      border-radius: 50%;
      background: transparent;
      transition: background 0.15s ease;
    }
  }

  &__content {
    display: grid;
    min-width: 0;
    flex: 1;
    gap: 0.2rem;
  }

  &__title-line {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.4rem;

    strong { font-size: 0.9rem; }
  }

  &__badges {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding-right: 0.4rem;
    // 纯文本 suffix（如"已选/已满"）统一字号，避免继承根字号（16px）与 UiBadge 视觉不一致
    font-size: 0.75rem;

    // 操作位内的按钮由调用方设定固定高度，此处兜底防止被拉伸
    :deep(button) {
      height: 2.25rem;
    }
  }

  &__summary {
    overflow: hidden;
    color: var(--color-text-muted);
    font-size: 0.78rem;
    line-height: 1.45;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__reason {
    overflow: hidden;
    color: var(--color-error) !important;
    font-size: 0.78rem;
    line-height: 1.45;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__arrow {
    display: grid;
    width: 2.4rem;
    flex: none;
    place-items: center;
    border: 0;
    color: var(--color-text-muted);
    background: transparent;
    font-size: 1.25rem;
    cursor: pointer;
    transition: transform 0.15s ease;

    &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: -2px; }

    &--open { transform: rotate(90deg); }
  }

  &__growth {
    display: grid;
    gap: 0.3rem;
    padding: 0.6rem 0.8rem 0.7rem;
    border-top: 1px dashed var(--color-border);
    color: var(--color-text-muted);
    background: var(--color-surface);
    font-size: 0.78rem;
    line-height: 1.7;

    > strong {
      color: var(--color-primary);
      font-size: 0.8rem;
    }
  }

  &__placeholder {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.78rem;
  }

  &--selected {
    border-color: var(--color-primary);
    background: #fff9f6;
    box-shadow: inset 0.2rem 0 var(--color-primary);
  }

  &--complete {
    border-color: var(--color-success);
    background: var(--color-success-soft);
  }

  &--selected &__mark { border-color: var(--color-primary); }
  &--selected &__mark::after { background: var(--color-primary); }
  &--complete &__mark { border-color: var(--color-success); }
  &--complete &__mark::after { background: var(--color-success); }
  &--incompatible { border-color: var(--color-warning); background: var(--color-warning-soft); }
  &--error { border-color: var(--color-error); background: var(--color-error-soft); }
  &--locked { opacity: 0.6; }
  &--locked &__main { cursor: not-allowed; }
}
</style>
