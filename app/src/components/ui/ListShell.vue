<script setup lang="ts">
import { computed } from 'vue'

import UiChip from '@/components/ui/UiChip.vue'

/**
 * 列表容器壳（无业务感知）：
 * 统一"标题/计数徽章、搜索框、分类筛选 chips、空状态、滚动容器、条目网格"的外壳 UI。
 * 过滤/排序/状态映射等业务逻辑全部由调用方通过 v-model 与插槽完成。
 */
const props = withDefaults(
  defineProps<{
    title?: string
    /** 计数徽章内容（数字或"3/5"等文本），配合 countLabel 使用。 */
    count?: number | string
    countLabel?: string
    searchable?: boolean
    searchPlaceholder?: string
    searchLabel?: string
    query?: string
    filters?: readonly { id: string; label: string }[]
    filter?: string
    /** 为 true 时显示空状态（默认文案 emptyText，或用 empty 插槽自定义）。 */
    empty?: boolean
    emptyText?: string
    /** 设置后内部提供滚动容器（滚动在最外层，内层网格保持非滚动）。 */
    maxHeight?: string
    /** 条目插槽外自动包 grid 容器；分组等场景可关闭自行布局。 */
    grid?: boolean
  }>(),
  {
    title: '',
    count: undefined,
    countLabel: '',
    searchable: false,
    searchPlaceholder: '搜索',
    searchLabel: '搜索',
    query: '',
    filters: undefined,
    filter: 'all',
    empty: false,
    emptyText: '没有匹配的条目。',
    maxHeight: '',
    grid: true,
  },
)

const emit = defineEmits<{
  'update:query': [value: string]
  'update:filter': [value: string]
}>()

const queryModel = computed({
  get: () => props.query,
  set: (value: string) => emit('update:query', value),
})

const filterModel = computed({
  get: () => props.filter,
  set: (value: string) => emit('update:filter', value),
})
</script>

<template>
  <section class="list-shell">
    <header v-if="title || count !== undefined || $slots.header" class="list-shell__header">
      <slot name="header">
        <div class="list-shell__title-row">
          <h3 v-if="title" class="list-shell__title">{{ title }}</h3>
          <span v-if="count !== undefined" class="list-shell__count">{{ countLabel }}{{ count }}</span>
        </div>
      </slot>
    </header>

    <label v-if="searchable" class="list-shell__search">
      <span v-if="searchLabel" class="list-shell__search-label">{{ searchLabel }}</span>
      <input v-model="queryModel" type="search" :placeholder="searchPlaceholder" :aria-label="searchLabel || searchPlaceholder" />
    </label>

    <div v-if="filters?.length" class="list-shell__filters" role="group" :aria-label="title || '筛选'">
      <UiChip
        v-for="item in filters"
        :key="item.id"
        :selected="filterModel === item.id"
        @toggle="filterModel = item.id"
      >
        {{ item.label }}
      </UiChip>
    </div>

    <div v-if="maxHeight" class="list-shell__scroll" :style="{ maxHeight }">
      <div v-if="grid" class="list-shell__grid"><slot /></div>
      <slot v-else />
      <p v-if="empty" class="list-shell__empty"><slot name="empty">{{ emptyText }}</slot></p>
    </div>
    <template v-else>
      <div v-if="grid" class="list-shell__grid"><slot /></div>
      <slot v-else />
      <p v-if="empty" class="list-shell__empty"><slot name="empty">{{ emptyText }}</slot></p>
    </template>
  </section>
</template>

<style scoped lang="scss">
.list-shell {
  display: grid;
  gap: 0.6rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__title {
    margin: 0;
    font-size: 0.85rem;
  }

  &__count {
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
    color: var(--color-primary);
    background: var(--color-primary-soft);
    font-size: 0.72rem;
    font-weight: 700;
    white-space: nowrap;
  }

  &__search {
    display: grid;
    gap: 0.3rem;

    &-label {
      color: var(--color-text-muted);
      font-size: 0.72rem;
      font-weight: 700;
    }

    input {
      min-height: 2.75rem;
      padding: 0 0.7rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-background);
    }
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__scroll {
    overflow: auto;
  }

  &__grid {
    display: grid;
    gap: 0.5rem;
  }

  &__empty {
    margin: 0;
    padding: 0.6rem 0;
    color: var(--color-text-muted);
    font-size: 0.76rem;
  }
}
</style>
