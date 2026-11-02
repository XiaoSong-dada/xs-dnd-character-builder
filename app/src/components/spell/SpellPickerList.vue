<script setup lang="ts">
import { computed, ref } from 'vue'

import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiTabs from '@/components/ui/UiTabs.vue'
import {
  SPELL_LEVEL_ALL,
  SPELL_SCHOOL_ALL,
  buildSpellLevelTabs,
  filterSpells,
  isSpellArchived,
  sortSpells,
  spellMetaLabel,
} from '@/components/spell/spell-picker'
import type { SpellRule } from '@/types/rules'

const props = withDefaults(
  defineProps<{
    spells: readonly SpellRule[]
    selectedIds: readonly string[]
    multiple?: boolean
    searchLabel?: string
    emptyHint?: string
  }>(),
  {
    multiple: false,
    searchLabel: '搜索法术',
    emptyHint: '没有匹配的法术。',
  },
)

const emit = defineEmits<{ toggle: [spellId: string] }>()

const query = ref('')
const level = ref(SPELL_LEVEL_ALL)
const school = ref(SPELL_SCHOOL_ALL)

const sortedSpells = computed(() => sortSpells(props.spells))
const tabs = computed(() => buildSpellLevelTabs(props.spells))
const schools = computed(() =>
  [...new Set(props.spells.map((spell) => spell.school).filter((item): item is string => Boolean(item)))].sort(
    (left, right) => left.localeCompare(right, 'zh-CN'),
  ),
)
const filtered = computed(() =>
  filterSpells(sortedSpells.value, {
    query: query.value,
    level: level.value,
    school: school.value,
  }),
)
const selectedSet = computed(() => new Set(props.selectedIds))

type SpellCardState = 'default' | 'selected' | 'locked'

function cardState(spell: SpellRule): SpellCardState {
  if (isSpellArchived(spell)) {
    return 'locked'
  }
  return selectedSet.value.has(spell.id) ? 'selected' : 'default'
}

function toggle(spell: SpellRule): void {
  if (isSpellArchived(spell)) {
    return
  }
  emit('toggle', spell.id)
}
</script>

<template>
  <div class="spell-picker">
    <div class="spell-picker__toolbar">
      <input
        v-model="query"
        type="search"
        placeholder="搜索中英文法术名"
        :aria-label="searchLabel"
      >
      <UiTabs v-if="tabs.length > 1" v-model="level" :items="tabs" />
      <select v-if="schools.length > 1" v-model="school" aria-label="按学派筛选">
        <option :value="SPELL_SCHOOL_ALL">全部学派</option>
        <option v-for="item in schools" :key="item" :value="item">{{ item }}</option>
      </select>
    </div>
    <div class="spell-picker__rows">
      <ListShell :empty="filtered.length === 0" :empty-text="emptyHint">
        <ExpandableOptionCard
          v-for="spell in filtered"
          :key="spell.id"
          :title="spell.name"
          :description="spellMetaLabel(spell)"
          :state="cardState(spell)"
          :disabled-reason="isSpellArchived(spell) ? '已归档的自定义法术，不能授予。' : ''"
          :radio="!multiple"
          expanded-label="法术效果"
          @select="toggle(spell)"
        >
          <template #suffix>
            <UiBadge v-if="isSpellArchived(spell)" tone="warning">已归档</UiBadge>
            <UiBadge v-else-if="selectedSet.has(spell.id)" tone="success">已选</UiBadge>
          </template>
          <template #expanded>{{ spell.description || '暂无效果描述。' }}</template>
        </ExpandableOptionCard>
      </ListShell>
    </div>
  </div>
</template>

<style scoped lang="scss">
.spell-picker {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 0.6rem;

  &__toolbar {
    display: grid;
    flex-shrink: 0;
    gap: 0.5rem;

    > input,
    > select {
      min-height: 2.75rem;
      padding: 0 0.7rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-background);
    }
  }

  &__rows {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
}
</style>
