<script setup lang="ts">
import UiModal from '@/components/ui/UiModal.vue'

const props = defineProps<{ open: boolean; added: number; replaced: number; skipped: number }>()
const emit = defineEmits<{ close: []; confirm: [] }>()
</script>

<template>
  <UiModal :open="props.open" title="导入自定义内容" @close="emit('close')">
    <p class="custom-import__lead">
      将把文件中的内容合并到本机内容库：新增 {{ props.added }} 项，覆盖 {{ props.replaced }} 项同 ID 内容。
    </p>
    <p v-if="props.skipped > 0" class="custom-import__warning">
      另有 {{ props.skipped }} 条记录无法识别，导入时会跳过。
    </p>
    <p class="custom-import__hint">本机独有的内容不会被删除；被覆盖的条目以文件版本为准。</p>

    <template #footer>
      <div class="custom-import__actions">
        <button type="button" class="custom-import__button" @click="emit('close')">取消</button>
        <button type="button" class="custom-import__button custom-import__button--primary" @click="emit('confirm')">
          确认导入
        </button>
      </div>
    </template>
  </UiModal>
</template>

<style scoped lang="scss">
.custom-import {
  &__lead {
    margin: 0 0 0.5rem;
    font-size: 0.88rem;
    line-height: 1.6;
  }

  &__warning {
    margin: 0 0 0.5rem;
    color: var(--color-warning);
    font-size: 0.8rem;
  }

  &__hint {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.78rem;
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    width: 100%;
    gap: 0.5rem;
  }

  &__button {
    min-height: 2.75rem;
    flex: 1;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    font-weight: 600;

    &--primary {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
  }
}
</style>
