<script setup lang="ts">
import UiModal from '@/components/ui/UiModal.vue'
import type { CustomReferenceOwner } from '@/rules/custom-content-references'

const props = defineProps<{
  open: boolean
  name: string
  referenceCount: number
  references: readonly CustomReferenceOwner[]
  blockedSubclasses: readonly string[]
}>()
const emit = defineEmits<{ close: []; archive: []; remove: [] }>()
</script>

<template>
  <UiModal :open="props.open" title="删除自定义内容" @close="emit('close')">
    <p class="custom-delete__lead">
      即将删除「{{ props.name }}」。
    </p>

    <template v-if="props.blockedSubclasses.length > 0">
      <p class="custom-delete__warning">
        该职业下还有 {{ props.blockedSubclasses.length }} 个自定义子职，不能直接删除。请先删除或改挂这些子职，或改为归档职业。
      </p>
      <ul class="custom-delete__list">
        <li v-for="name in props.blockedSubclasses" :key="name">{{ name }}</li>
      </ul>
    </template>

    <template v-if="props.referenceCount > 0">
      <p class="custom-delete__warning">
        有 {{ props.referenceCount }} 个角色正在使用它。删除后这些角色会保留记录，但对应内容不再生效。
      </p>
      <ul class="custom-delete__list">
        <li v-for="owner in props.references" :key="owner.draftId">{{ owner.draftName }}</li>
      </ul>
      <p class="custom-delete__hint">建议改为「归档」：内容退出新建候选池，已有角色继续正常解析。</p>
    </template>
    <p v-else class="custom-delete__hint">没有角色使用这条内容，可以安全删除。</p>

    <template #footer>
      <div class="custom-delete__actions">
        <button type="button" class="custom-delete__button" @click="emit('close')">取消</button>
        <button
          v-if="props.referenceCount > 0 || props.blockedSubclasses.length > 0"
          type="button"
          class="custom-delete__button custom-delete__button--primary"
          @click="emit('archive')"
        >
          改为归档
        </button>
        <button
          v-if="props.blockedSubclasses.length === 0"
          type="button"
          class="custom-delete__button custom-delete__button--danger"
          @click="emit('remove')"
        >
          {{ props.referenceCount > 0 ? '仍然删除' : '确认删除' }}
        </button>
      </div>
    </template>
  </UiModal>
</template>

<style scoped lang="scss">
.custom-delete {
  &__lead {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
  }

  &__warning {
    margin: 0 0 0.4rem;
    color: var(--color-warning);
    font-size: 0.82rem;
    line-height: 1.5;
  }

  &__list {
    display: grid;
    gap: 0.2rem;
    margin: 0 0 0.5rem;
    padding-left: 1.1rem;
    color: var(--color-text-muted);
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
    flex-wrap: wrap;
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

    &--danger {
      border-color: var(--color-danger, #c0392b);
      color: var(--color-danger, #c0392b);
    }
  }
}
</style>
