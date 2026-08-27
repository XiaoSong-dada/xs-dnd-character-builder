<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiScrollModal from '@/components/ui/UiScrollModal.vue'
import { rulesRepository } from '@/rules/repository'
import type { ManualAddedSpell, ManualSpellDestination, SpellcastingMode } from '@/types/character'
import { formatSpellLabel } from '@/utils/format-spell-label'

const props = defineProps<{ open: boolean; mode?: SpellcastingMode; existingIds: readonly string[] }>()
const emit = defineEmits<{ close: []; add: [spell: ManualAddedSpell] }>()
const search = ref('')
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
  search.value = ''
  selectedId.value = ''
  destination.value = options.value[0]?.value ?? 'granted'
  prepared.value = false
})
const filtered = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return rulesRepository.spells.filter((spell) => !props.existingIds.includes(spell.id)
    && (!query || `${spell.name} ${spell.englishName} ${spell.id}`.toLocaleLowerCase().includes(query)))
})
function submit(): void {
  if (!selectedId.value) return
  emit('add', { spellId: selectedId.value, destination: destination.value, prepared: prepared.value })
  emit('close')
}
</script>

<template>
  <UiScrollModal :open="open" title="添加系统法术" :body-scroll="false" @close="$emit('close')">
    <div class="manual-spell-modal">
      <div class="manual-spell-modal__controls">
        <input v-model="search" type="search" placeholder="搜索中英文法术名" aria-label="搜索系统法术">
        <select v-model="destination" aria-label="法术加入方式">
          <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <label><input v-model="prepared" type="checkbox"> 加入后标记为已准备</label>
      </div>
      <div class="manual-spell-modal__result-area">
        <ListShell>
          <ExpandableOptionCard
            v-for="spell in filtered"
            :key="spell.id"
            :title="spell.name"
            :description="formatSpellLabel(spell)"
            :state="selectedId === spell.id ? 'selected' : 'default'"
            expanded-label="法术效果"
            @select="selectedId = spell.id"
          >
            <template #expanded>{{ spell.description }}</template>
          </ExpandableOptionCard>
        </ListShell>
        <p v-if="filtered.length === 0">没有可添加的匹配法术。</p>
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

    > input,
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
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;

    p {
      color: var(--color-text-muted);
    }
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
