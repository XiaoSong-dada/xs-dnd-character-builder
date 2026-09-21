<script setup lang="ts">
import type { SelectionTask } from '@/views/character-builder/selection-task'

const props = defineProps<{
  tasks: readonly SelectionTask[]
  modelValue: string
  completed: number
}>()

const emit = defineEmits<{ 'update:modelValue': [id: string] }>()

function displayStatus(task: SelectionTask): string {
  if (task.id === props.modelValue) return '当前'
  if (task.status === 'complete') return '已完成'
  if (task.status === 'invalid') return '需修正'
  if (!task.required) return '可选'
  return '待完成'
}

function handleKeydown(event: KeyboardEvent, index: number): void {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const last = props.tasks.length - 1
  const nextIndex = event.key === 'Home'
    ? 0
    : event.key === 'End'
      ? last
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
        ? index === 0 ? last : index - 1
        : index === last ? 0 : index + 1
  const task = props.tasks[nextIndex]
  if (!task) return
  emit('update:modelValue', task.id)
  requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-task-id="${task.id}"]`)?.focus())
}
</script>

<template>
  <section id="builder-step-tasks" class="selection-task-nav" aria-label="本步骤任务">
    <header>
      <strong>本步任务</strong>
      <span>{{ completed }} / {{ tasks.length }} 已完成</span>
    </header>
    <div class="selection-task-nav__list" role="tablist" aria-label="选择要完成的任务">
      <button
        v-for="(task, index) in tasks"
        :key="task.id"
        type="button"
        role="tab"
        :data-task-id="task.id"
        :aria-selected="task.id === modelValue"
        :class="[`selection-task-nav__item--${task.status}`, { 'selection-task-nav__item--current': task.id === modelValue }]"
        @click="$emit('update:modelValue', task.id)"
        @keydown="handleKeydown($event, index)"
      >
        <span class="selection-task-nav__head">
          <span class="selection-task-nav__mark" aria-hidden="true">{{ task.status === 'complete' ? '✓' : task.required ? '•' : '○' }}</span>
          <strong class="selection-task-nav__label">{{ task.label }}</strong>
          <span class="selection-task-nav__state">{{ displayStatus(task) }}</span>
        </span>
        <span class="selection-task-nav__meta">
          <span v-if="task.progress" class="selection-task-nav__progress">{{ task.progress }}</span>
          <small class="selection-task-nav__summary">{{ task.summary }}</small>
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.selection-task-nav {
  display: grid;
  gap: 0.55rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);

  > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;

    strong { font-size: 0.85rem; }
    span { color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; }
  }

  &__list {
    display: grid;
    // 固定 2 列（v1.9.1 追加）：车卡容器恒为 32rem，原来 ≥680px 视口切 3 列会把每张卡压到约 147px，
    // 任务名与说明只能被截断；列数必须只看容器，不跟随视口。
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
  }

  // 两行结构：第一行状态标记 + 任务名 + 状态词，第二行进度 + 说明（整卡宽度），
  // 避免四类信息在同一行互相抢宽度。
  &__list > button {
    display: grid;
    min-width: 0;
    min-height: 3.75rem;
    align-content: center;
    gap: 0.2rem;
    padding: 0.55rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    background: var(--color-background);
    text-align: left;

    &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
  }

  &__item--current { border-color: var(--color-primary) !important; background: var(--color-primary-soft) !important; }
  &__item--complete .selection-task-nav__mark { color: var(--color-success); }
  &__item--invalid { border-color: var(--color-error) !important; }

  &__head {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.35rem;
  }

  &__mark { width: 1rem; flex: none; color: var(--color-primary); font-weight: 800; text-align: center; }
  &__label { overflow: hidden; min-width: 0; flex: 1; font-size: 0.78rem; text-overflow: ellipsis; white-space: nowrap; }
  &__state { flex: none; color: var(--color-primary); font-size: 0.65rem; font-weight: 700; white-space: nowrap; }

  &__meta {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.35rem;
    color: var(--color-text-muted);
    font-size: 0.66rem;
    line-height: 1.4;
  }

  &__progress { flex: none; font-weight: 700; }
  &__summary { overflow: hidden; min-width: 0; text-overflow: ellipsis; white-space: nowrap; }
}
</style>
