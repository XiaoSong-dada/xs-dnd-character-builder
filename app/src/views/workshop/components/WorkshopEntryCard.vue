<script setup lang="ts">
import UiBadge from '@/components/ui/UiBadge.vue'
import type { WorkshopEntryItem } from '@/views/workshop/hooks/useWorkshopPage'

const props = defineProps<{ item: WorkshopEntryItem }>()
const emit = defineEmits<{
  open: [id: string, kind: WorkshopEntryItem['kind']]
  copy: [id: string]
  archive: [id: string]
  restore: [id: string]
  remove: [id: string]
}>()
</script>

<template>
  <article class="workshop-entry-card">
    <button type="button" class="workshop-entry-card__main" @click="emit('open', props.item.id, props.item.kind)">
      <span class="workshop-entry-card__title-row">
        <strong class="workshop-entry-card__name">{{ props.item.name }}</strong>
        <UiBadge v-if="props.item.archived" tone="neutral">已归档</UiBadge>
        <UiBadge tone="primary">自定义</UiBadge>
        <UiBadge :tone="props.item.automationLabel === '会参与计算' ? 'success' : 'neutral'">
          {{ props.item.automationLabel }}
        </UiBadge>
      </span>
      <span class="workshop-entry-card__meta">
        {{ props.item.kindLabel }} · {{ props.item.expansionTitle }}
        <template v-if="props.item.referenceCount > 0"> · 被 {{ props.item.referenceCount }} 个角色使用</template>
      </span>
      <span v-if="props.item.summary" class="workshop-entry-card__summary">{{ props.item.summary }}</span>
    </button>
    <div class="workshop-entry-card__actions">
      <button type="button" class="workshop-entry-card__action" @click="emit('copy', props.item.id)">复制</button>
      <button
        v-if="props.item.archived"
        type="button"
        class="workshop-entry-card__action"
        @click="emit('restore', props.item.id)"
      >
        恢复
      </button>
      <button
        v-else
        type="button"
        class="workshop-entry-card__action"
        @click="emit('archive', props.item.id)"
      >
        归档
      </button>
      <button
        type="button"
        class="workshop-entry-card__action workshop-entry-card__action--danger"
        @click="emit('remove', props.item.id)"
      >
        删除
      </button>
    </div>
  </article>
</template>

<style scoped lang="scss">
.workshop-entry-card {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);

  &__main {
    display: grid;
    flex: 1;
    min-width: 0;
    gap: 0.3rem;
    border: 0;
    background: none;
    text-align: left;
  }

  &__title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
  }

  &__name {
    overflow: hidden;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    color: var(--color-text-muted);
    font-size: 0.78rem;
  }

  &__summary {
    color: var(--color-text-muted);
    font-size: 0.8rem;
    line-height: 1.5;
  }

  &__actions {
    display: grid;
    flex: none;
    align-content: center;
    gap: 0.35rem;
  }

  &__action {
    min-height: 2.25rem;
    padding: 0 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-primary);
    font-size: 0.78rem;
    font-weight: 600;

    &--danger {
      color: var(--color-danger, #c0392b);
    }
  }
}
</style>
