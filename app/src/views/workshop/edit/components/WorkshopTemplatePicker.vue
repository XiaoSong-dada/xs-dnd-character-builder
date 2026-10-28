<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import UiModal from '@/components/ui/UiModal.vue'
import type { CustomTemplateOption } from '@/features/custom-content/templates'

const props = defineProps<{
  open: boolean
  title: string
  options: readonly CustomTemplateOption[]
}>()
const emit = defineEmits<{ close: []; select: [id: string] }>()

const query = ref('')

watch(() => props.open, (open) => {
  if (open) query.value = ''
})

const visibleOptions = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase('zh-CN')
  if (!keyword) return props.options.slice(0, 60)
  return props.options
    .filter((option) => `${option.name} ${option.summary}`.toLocaleLowerCase('zh-CN').includes(keyword))
    .slice(0, 60)
})
</script>

<template>
  <UiModal :open="props.open" :title="props.title" @close="emit('close')">
    <div class="template-picker">
      <input
        v-model="query"
        type="search"
        class="template-picker__search"
        placeholder="搜索内置条目名称"
        aria-label="搜索内置条目"
      >
      <p class="template-picker__hint">
        复制后是一条新的自定义内容（名称带「（自制）」），不会改动内置资料。
      </p>
      <ul v-if="visibleOptions.length > 0" class="template-picker__list">
        <li v-for="option in visibleOptions" :key="option.id">
          <button type="button" class="template-picker__option" @click="emit('select', option.id)">
            <strong>{{ option.name }}</strong>
            <span v-if="option.summary">{{ option.summary }}</span>
          </button>
        </li>
      </ul>
      <p v-else class="template-picker__empty">没有匹配的内置条目。</p>
    </div>
  </UiModal>
</template>

<style scoped lang="scss">
.template-picker {
  display: grid;
  gap: 0.6rem;
  min-height: 0;

  &__search {
    min-height: 2.75rem;
    padding: 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
  }

  &__hint {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.5;
  }

  &__list {
    display: grid;
    gap: 0.4rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__option {
    display: grid;
    width: 100%;
    gap: 0.2rem;
    min-height: 2.75rem;
    padding: 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    text-align: left;

    strong {
      color: var(--color-text);
    }

    span {
      color: var(--color-text-muted);
      font-size: 0.76rem;
      line-height: 1.5;
    }
  }

  &__empty {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.8rem;
  }
}
</style>
