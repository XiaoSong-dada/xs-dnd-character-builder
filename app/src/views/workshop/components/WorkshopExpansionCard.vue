<script setup lang="ts">
import UiBadge from '@/components/ui/UiBadge.vue'
import type { WorkshopExpansionItem } from '@/views/workshop/hooks/useWorkshopPage'

const props = defineProps<{ item: WorkshopExpansionItem }>()
const emit = defineEmits<{ open: [id: string] }>()
</script>

<template>
  <article class="workshop-expansion-card">
    <button type="button" class="workshop-expansion-card__main" @click="emit('open', props.item.id)">
      <span class="workshop-expansion-card__title-row">
        <strong class="workshop-expansion-card__title">{{ props.item.title }}</strong>
        <UiBadge tone="primary">自定义扩展</UiBadge>
        <UiBadge :tone="props.item.defaultEnabled ? 'success' : 'neutral'">
          {{ props.item.defaultEnabled ? '新车卡默认启用' : '需手动启用' }}
        </UiBadge>
      </span>
      <span class="workshop-expansion-card__meta">
        简称 {{ props.item.shortTitle }} · 含 {{ props.item.entryCount }} 条内容
      </span>
      <span v-if="props.item.note" class="workshop-expansion-card__note">{{ props.item.note }}</span>
    </button>
  </article>
</template>

<style scoped lang="scss">
.workshop-expansion-card {
  padding: 0.75rem;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);

  &__main {
    display: grid;
    width: 100%;
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

  &__title {
    overflow: hidden;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    color: var(--color-text-muted);
    font-size: 0.78rem;
  }

  &__note {
    color: var(--color-text-muted);
    font-size: 0.8rem;
    line-height: 1.5;
  }
}
</style>
