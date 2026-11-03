<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import SpellPickerList from '@/components/spell/SpellPickerList.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import UiScrollModal from '@/components/ui/UiScrollModal.vue'
import { useRulesRepository } from '@/hooks/useRulesRepository'
import type { RulesetId } from '@/types/character'
import type { ManualAddedSpell, ManualSpellDestination, SpellcastingMode } from '@/types/character'

const props = withDefaults(defineProps<{ open: boolean; mode?: SpellcastingMode; existingIds: readonly string[]; ruleset?: RulesetId }>(), { ruleset: '5e-2014' })
/** 人工添加法术的候选按草稿版本解析（B09-02）。 */
const repository = useRulesRepository(() => props.ruleset)
const emit = defineEmits<{ close: []; add: [spell: ManualAddedSpell] }>()
const selectedId = ref('')
const destination = ref<ManualSpellDestination>('granted')
const prepared = ref(false)

const options = computed(() => {
  const granted = { value: 'granted' as const, label: '作为人工获得法术' }
  if (props.mode === 'known') return [{ value: 'known' as const, label: '加入已掌握法术' }, granted]
  if (props.mode === 'pact') return [{ value: 'pact-known' as const, label: '加入已掌握契约法术' }, granted]
  if (props.mode === 'prepared') return [{ value: 'prepared-list' as const, label: '加入额外可准备列表' }, granted]
  if (props.mode === 'spellbook') return [
    { value: 'spellbook' as const, label: '加入法术书' },
    { value: 'prepared-list' as const, label: '加入额外可准备列表' },
    granted,
  ]
  return [{ value: 'granted' as const, label: '作为人工获得法术' }]
})
watch(() => props.open, (open) => {
  if (!open) return
  selectedId.value = ''
  destination.value = options.value[0]?.value ?? 'granted'
  prepared.value = false
})
const availableSpells = computed(() =>
  repository.value.spells.filter((spell) => !props.existingIds.includes(spell.id)),
)
function onToggle(spellId: string): void {
  selectedId.value = selectedId.value === spellId ? '' : spellId
}
function submit(): void {
  if (!selectedId.value || !repository.value.getSpell(selectedId.value)) return
  emit('add', { spellId: selectedId.value, destination: destination.value, prepared: prepared.value })
  emit('close')
}
</script>

<template>
  <UiScrollModal :open="open" title="添加系统法术" :body-scroll="false" @close="$emit('close')">
    <div class="manual-spell-modal">
      <div class="manual-spell-modal__controls">
        <select v-model="destination" aria-label="法术加入方式">
          <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <label><input v-model="prepared" type="checkbox"> 加入后标记为已准备</label>
      </div>
      <div class="manual-spell-modal__result-area">
        <SpellPickerList
          :spells="availableSpells"
          :selected-ids="selectedId ? [selectedId] : []"
          :multiple="false"
          search-label="搜索系统法术"
          empty-hint="没有可添加的匹配法术。"
          @toggle="onToggle"
        />
      </div>
    </div>
    <template #footer>
      <div class="manual-spell-modal__actions">
        <BaseButton class="manual-spell-modal__action" variant="secondary" @click="$emit('close')">取消</BaseButton>
        <BaseButton class="manual-spell-modal__action" :disabled="!selectedId" @click="submit">添加法术</BaseButton>
      </div>
    </template>
  </UiScrollModal>
</template>

<style scoped lang="scss">
.manual-spell-modal {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 0.75rem;

  &__controls {
    display: grid;
    flex-shrink: 0;
    gap: 0.75rem;

    > select {
      min-height: 2.75rem;
      padding: 0.65rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }

    label {
      display: flex;
      min-height: 2.75rem;
      align-items: center;
      gap: 0.5rem;
    }
  }

  &__result-area {
    display: flex;
    flex: 1;
    min-height: 0;
    flex-direction: column;
  }

  &__actions {
    display: flex;
    width: 100%;
    gap: 0.75rem;
  }

  &__action {
    flex: 1;
  }
}
</style>
