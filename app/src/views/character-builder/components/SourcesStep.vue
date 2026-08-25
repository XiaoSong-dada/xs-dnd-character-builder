<script setup lang="ts">
import UiChip from '@/components/ui/UiChip.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import { getSelectableSources } from '@/rules/source-books'
import { rulesRepository } from '@/rules/repository'

const props = defineProps<{ selected: readonly string[] }>()
const emit = defineEmits<{ change: [value: readonly string[]] }>()

const coreSources = rulesRepository.sources.filter((source) => source.category === 'core')
const selectableSources = getSelectableSources()

function toggle(id: string): void {
  emit('change', props.selected.includes(id)
    ? props.selected.filter((item) => item !== id)
    : [...props.selected, id])
}
</script>

<template>
  <section class="sources-step">
    <UiNotice tone="info" title="核心规则始终启用">
      {{ coreSources.map((source) => source.title).join('、') }} 不受扩展书开关影响。
    </UiNotice>
    <div class="sources-step__toolbar">
      <button type="button" @click="$emit('change', selectableSources.map((source) => source.id))">全部启用</button>
      <button type="button" @click="$emit('change', [])">只用核心规则</button>
    </div>
    <div class="sources-step__list" aria-label="可选扩展书">
      <UiChip
        v-for="source in selectableSources"
        :key="source.id"
        :selected="selected.includes(source.id)"
        :title="source.title"
        @toggle="toggle(source.id)"
      >
        {{ source.shortTitle }} · {{ source.title }}
      </UiChip>
    </div>
    <p class="sources-step__summary">已启用 {{ selected.length }} / {{ selectableSources.length }} 本扩展资料。关闭来源不会删除已选内容，但相关选择会暂时失效。</p>
  </section>
</template>

<style scoped lang="scss">
.sources-step {
  display: grid;
  gap: 1rem;

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;

    button {
      min-height: 44px;
      padding: 0.55rem 0.9rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-primary);
      cursor: pointer;
    }
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  &__summary {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.85rem;
    line-height: 1.6;
  }
}
</style>
