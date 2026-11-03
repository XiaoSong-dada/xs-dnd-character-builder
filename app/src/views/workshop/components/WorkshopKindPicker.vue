<script setup lang="ts">
import UiModal from '@/components/ui/UiModal.vue'
import { CUSTOM_KIND_OPTIONS } from '@/features/custom-content/dictionary'
import type { CustomContentKind } from '@/types/custom-content'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; select: [kind: CustomContentKind] }>()
</script>

<template>
  <UiModal :open="props.open" title="新建自定义内容" @close="emit('close')">
    <ul class="workshop-kind-picker">
      <li v-for="option in CUSTOM_KIND_OPTIONS" :key="option.kind">
        <button type="button" class="workshop-kind-picker__option" @click="emit('select', option.kind)">
          <strong>{{ option.label }}</strong>
          <span>{{ option.description }}</span>
        </button>
      </li>
    </ul>
  </UiModal>
</template>

<style scoped lang="scss">
.workshop-kind-picker {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;

  &__option {
    display: grid;
    width: 100%;
    gap: 0.25rem;
    min-height: 3.25rem;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    text-align: left;

    strong {
      color: var(--color-text);
    }

    span {
      color: var(--color-text-muted);
      font-size: 0.8rem;
      line-height: 1.5;
    }
  }
}
</style>
