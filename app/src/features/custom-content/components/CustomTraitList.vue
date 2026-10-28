<script setup lang="ts">
import type { CustomTrait } from '@/types/custom-content'

const props = withDefaults(
  defineProps<{ items: readonly CustomTrait[]; addLabel?: string; levelHint?: string }>(),
  { addLabel: '＋ 添加一条特性', levelHint: '获得等级（1—20）' },
)
const emit = defineEmits<{ 'update:items': [items: readonly CustomTrait[]] }>()

let sequence = 0

function newId(): string {
  sequence += 1
  return `trait-${Date.now().toString(36)}-${sequence}`
}

function addItem(): void {
  emit('update:items', [...props.items, { id: newId(), name: '', level: 1, summary: '', description: '' }])
}

function removeItem(index: number): void {
  emit('update:items', props.items.filter((_, position) => position !== index))
}

function patch(index: number, changes: Partial<CustomTrait>): void {
  emit('update:items', props.items.map((item, position) => (position === index ? { ...item, ...changes } : item)))
}
</script>

<template>
  <div class="custom-trait-list">
    <p v-if="props.items.length === 0" class="custom-trait-list__empty">
      还没有条目。特性会作为文字展示在角色卡上，不参与自动计算。
    </p>

    <div v-for="(item, index) in props.items" :key="item.id" class="custom-trait-list__row">
      <div class="custom-trait-list__grid">
        <label class="custom-trait-list__field">
          <span>名称</span>
          <input :value="item.name" placeholder="例如：黑暗视觉" @input="patch(index, { name: ($event.target as HTMLInputElement).value })">
        </label>
        <label class="custom-trait-list__field custom-trait-list__field--level">
          <span>{{ props.levelHint }}</span>
          <input
            :value="item.level"
            type="number"
            min="1"
            max="20"
            @input="patch(index, { level: Number(($event.target as HTMLInputElement).value) || 1 })"
          >
        </label>
      </div>
      <label class="custom-trait-list__field">
        <span>一句话概括</span>
        <input :value="item.summary" placeholder="例如：在黑暗中看清 60 尺" @input="patch(index, { summary: ($event.target as HTMLInputElement).value })">
      </label>
      <label class="custom-trait-list__field">
        <span>详细说明</span>
        <textarea :value="item.description" rows="3" @input="patch(index, { description: ($event.target as HTMLTextAreaElement).value })" />
      </label>
      <button type="button" class="custom-trait-list__remove" @click="removeItem(index)">删除这一条</button>
    </div>

    <button type="button" class="custom-trait-list__add" @click="addItem">{{ props.addLabel }}</button>
  </div>
</template>

<style scoped lang="scss">
.custom-trait-list {
  display: grid;
  gap: 0.75rem;

  &__empty {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    line-height: 1.5;
  }

  &__row {
    display: grid;
    gap: 0.5rem;
    padding: 0.65rem;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
  }

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 7rem;
    gap: 0.5rem;
  }

  &__field {
    display: grid;
    gap: 0.25rem;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    font-weight: 600;

    input,
    textarea {
      min-height: 2.5rem;
      padding: 0.55rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font: inherit;
      font-weight: 400;
    }

    textarea {
      resize: vertical;
    }
  }

  &__remove {
    justify-self: start;
    min-height: 2.25rem;
    padding: 0 0.5rem;
    border: 0;
    background: none;
    color: var(--color-danger, #c0392b);
    font-weight: 600;
  }

  &__add {
    justify-self: start;
    min-height: 2.5rem;
    padding: 0 0.9rem;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-primary);
    font-weight: 600;
  }
}
</style>
