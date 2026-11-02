<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import SpellPickerList from '@/components/spell/SpellPickerList.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import UiScrollModal from '@/components/ui/UiScrollModal.vue'
import { useRulesRepository } from '@/hooks/useRulesRepository'
import type { RulesetId } from '@/types/character'

const props = withDefaults(
  defineProps<{
    open: boolean
    ruleset: RulesetId
    existingIds?: readonly string[]
    multiple?: boolean
    title?: string
  }>(),
  {
    existingIds: () => [],
    multiple: true,
    title: '选择法术',
  },
)

const emit = defineEmits<{ close: []; pick: [spellIds: string[]] }>()

const repository = useRulesRepository(() => props.ruleset)
const pickedIds = ref<string[]>([])

const availableSpells = computed(() =>
  repository.value.spells.filter((spell) => !props.existingIds.includes(spell.id)),
)

watch(
  () => props.open,
  (open) => {
    if (open) {
      pickedIds.value = []
    }
  },
)

function toggle(spellId: string): void {
  if (props.multiple) {
    pickedIds.value = pickedIds.value.includes(spellId)
      ? pickedIds.value.filter((id) => id !== spellId)
      : [...pickedIds.value, spellId]
    return
  }
  pickedIds.value = pickedIds.value[0] === spellId ? [] : [spellId]
}

function confirm(): void {
  if (pickedIds.value.length === 0) {
    return
  }
  emit('pick', [...pickedIds.value])
  emit('close')
}
</script>

<template>
  <UiScrollModal :open="open" :title="title" :body-scroll="false" @close="$emit('close')">
    <div class="spell-picker-modal">
      <p v-if="existingIds.length > 0" class="spell-picker-modal__hint">
        已授予的 {{ existingIds.length }} 个法术不在列表中。
      </p>
      <SpellPickerList
        :spells="availableSpells"
        :selected-ids="pickedIds"
        :multiple="multiple"
        search-label="搜索法术"
        :empty-hint="existingIds.length > 0 ? '所有法术都已授予。' : '当前规则集没有可授予的法术。'"
        @toggle="toggle"
      />
    </div>
    <template #footer>
      <div class="spell-picker-modal__actions">
        <span class="spell-picker-modal__count">已选 {{ pickedIds.length }} 个</span>
        <BaseButton
          class="spell-picker-modal__action"
          variant="secondary"
          @click="$emit('close')"
        >
          取消
        </BaseButton>
        <BaseButton
          class="spell-picker-modal__action"
          :disabled="pickedIds.length === 0"
          @click="confirm"
        >
          添加 {{ pickedIds.length }} 个
        </BaseButton>
      </div>
    </template>
  </UiScrollModal>
</template>

<style scoped lang="scss">
.spell-picker-modal {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 0.6rem;

  &__hint {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 0.75rem;
  }

  &__count {
    flex: 1;
    color: var(--color-text-muted);
    font-size: 0.78rem;
    white-space: nowrap;
  }

  &__action {
    flex: 1;
  }
}
</style>
