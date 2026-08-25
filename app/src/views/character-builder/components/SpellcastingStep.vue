<script setup lang="ts">
import { computed, ref } from 'vue'

import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import {
  getAvailableSpells,
  getMaximumSpellLevel,
  getRequiredCantripCount,
  getRequiredSpellbookCount,
  getRequiredSpellCount,
  getSelectedSpellIds,
  getSpellSlots,
  getSpellcastingConfig,
  getAlwaysPreparedSpellIds,
} from '@/rules/spellcasting'
import { rulesRepository } from '@/rules/repository'
import type { CharacterDraft, SpellSelections } from '@/types/character'

const props = defineProps<{ draft: CharacterDraft }>()
const emit = defineEmits<{ change: [value: SpellSelections] }>()
const config = computed(() => getSpellcastingConfig(props.draft))
const search = ref('')
const sourceFilter = ref('all')
const sourceOptions = computed(() => [
  { id: 'all', label: '全部来源' },
  ...rulesRepository.sources.filter((source) => source.category === 'core' || (props.draft.enabledSourceIds ?? []).includes(source.id)).map((source) => ({ id: source.id, label: source.shortTitle })),
])
const matchesView = (spell: NonNullable<ReturnType<typeof rulesRepository.getSpell>>): boolean => {
  const keyword = search.value.trim().toLocaleLowerCase('zh-CN')
  return (sourceFilter.value === 'all' || spell.sourceIds.includes(sourceFilter.value))
    && (!keyword || `${spell.name}${spell.englishName}`.toLocaleLowerCase('zh-CN').includes(keyword))
}
/** 施法来源名称（子职施法优先，如奥法骑士/诡术师；否则职业）。 */
const castingSourceName = computed(() => {
  if (props.draft.subclassId) {
    const subclass = rulesRepository.getSubclass(props.draft.subclassId)
    if (subclass?.spellcasting) return subclass.name
  }
  return props.draft.classId ? rulesRepository.getClass(props.draft.classId)?.name ?? '' : ''
})
const requiredCount = computed(() => config.value ? getRequiredSpellCount(props.draft, config.value) : 0)
const requiredCantripCount = computed(() => config.value ? getRequiredCantripCount(props.draft, config.value) : 0)
const requiredSpellbookCount = computed(() => config.value ? getRequiredSpellbookCount(props.draft, config.value) : 0)
const selectedIds = computed(() => config.value ? getSelectedSpellIds(props.draft, config.value) : [])
const alwaysPreparedSpells = computed(() => getAlwaysPreparedSpellIds(props.draft).map((id) => rulesRepository.getSpell(id)).filter((spell): spell is NonNullable<typeof spell> => Boolean(spell)))
const cantrips = computed(() => config.value ? getAvailableSpells(props.draft, config.value).filter((spell) => spell.level === 0 && matchesView(spell)) : [])
const maximumLevel = computed(() => config.value ? getMaximumSpellLevel(config.value, props.draft.targetLevel) : 0)
const spellSlots = computed(() => config.value ? getSpellSlots(config.value, props.draft.targetLevel) : [])
const spellSlotsLabel = computed(() => {
  if (!spellSlots.value.length) return ''
  if (spellSlots.value[0]?.pact) {
    const slot = spellSlots.value[0]
    return `${slot.count} 个 ${slot.level} 环契约法术位（短休恢复）`
  }
  return spellSlots.value.map((slot) => `${slot.level}环×${slot.count}`).join(' · ')
})
const invalidSelectedCount = computed(() => {
  if (!config.value) return 0
  const availableIds = new Set(getAvailableSpells(props.draft, config.value).filter((spell) => spell.level > 0).map((spell) => spell.id))
  return selectedIds.value.filter((id) =>
    !availableIds.has(id)
    || (config.value?.mode === 'spellbook' && !props.draft.spellSelections.spellbookSpellIds.includes(id)),
  ).length
})
const groupedSpells = computed(() => {
  if (!config.value) return []
  const available = getAvailableSpells(props.draft, config.value)
  return Array.from({ length: maximumLevel.value }, (_, index) => ({
    level: index + 1,
    spells: available.filter((spell) => spell.level === index + 1 && matchesView(spell)),
  })).filter((group) => group.spells.length)
})
const modeLabel = computed(() => config.value?.mode === 'prepared' ? '准备' : config.value?.mode === 'spellbook' ? '法术书与准备' : config.value?.mode === 'pact' ? '契约法术' : '掌握')

function toggleSpell(id: string): void {
  const current = selectedIds.value
  const next = current.includes(id)
    ? current.filter((spellId) => spellId !== id)
    : current.length < requiredCount.value
      ? [...current, id]
      : current
  if (!config.value) return
  emit('change', {
    ...props.draft.spellSelections,
    ...(config.value.mode === 'prepared' || config.value.mode === 'spellbook' ? { preparedSpellIds: next } : { knownSpellIds: next }),
  })
}

function toggleCantrip(id: string): void {
  const current = props.draft.spellSelections.cantripIds
  const next = current.includes(id)
    ? current.filter((spellId) => spellId !== id)
    : current.length < requiredCantripCount.value ? [...current, id] : current
  emit('change', { ...props.draft.spellSelections, cantripIds: next })
}

function toggleSpellbook(id: string): void {
  const current = props.draft.spellSelections.spellbookSpellIds
  const transcribed = props.draft.spellSelections.transcribedSpellIds
  const removing = current.includes(id)
  // 抄录所得的法术不可移除（不可撤销约定）；升级名额按非抄录法术数计算。
  if (removing && transcribed.includes(id)) return
  const nextBook = removing
    ? current.filter((spellId) => spellId !== id)
    : current.filter((spellId) => !transcribed.includes(spellId)).length < requiredSpellbookCount.value
      ? [...current, id]
      : current
  emit('change', {
    ...props.draft.spellSelections,
    spellbookSpellIds: nextBook,
    preparedSpellIds: removing
      ? props.draft.spellSelections.preparedSpellIds.filter((spellId) => spellId !== id)
      : props.draft.spellSelections.preparedSpellIds,
  })
}
</script>

<template>
  <section class="spellcasting-step">
    <UiNotice v-if="!config" tone="info" title="当前职业无需配置法术">
      这一步会自动跳过，不影响角色完成。
    </UiNotice>
    <UiNotice v-else-if="draft.targetLevel < config.startsAtLevel" tone="info" title="施法尚未开始">
      {{ castingSourceName }}从{{ config.startsAtLevel }}级开始施法；当前等级无需选择法术。
    </UiNotice>
    <template v-else>
      <div class="spellcasting-step__filters">
        <input v-model="search" type="search" placeholder="搜索中英文法术名" aria-label="搜索法术">
        <select v-model="sourceFilter" aria-label="按法术来源筛选">
          <option v-for="source in sourceOptions" :key="source.id" :value="source.id">{{ source.label }}</option>
        </select>
      </div>
      <header>
        <div>
          <span>{{ config.ability.toUpperCase() }}施法 · 最高{{ maximumLevel }}环</span>
          <p v-if="spellSlots.length" class="spellcasting-step__slots">{{ spellSlotsLabel }}</p>
          <h3>{{ modeLabel }}法术</h3>
        </div>
        <strong :class="{ 'spellcasting-step__count--complete': selectedIds.length === requiredCount }">
          {{ selectedIds.length }} / {{ requiredCount }}
        </strong>
      </header>
      <UiNotice tone="info" :title="config.mode === 'prepared' ? '长休后可以更换' : '升级时可以替换'">
        {{ config.mode === 'spellbook'
          ? '先写入法术书，再从书中准备法术；升级时自动增加两个可写入名额。'
          : config.mode === 'prepared'
          ? '准备数量由施法属性与职业等级计算；誓言法术后续将作为始终准备法术单独列出。'
          : config.mode === 'pact'
            ? '契约法术位按短休恢复；本页负责戏法与已知法术，秘法奥秘在后续职业资源批次接入。'
            : '掌握数量来自2014职业表，所选法术必须在当前可用环级内。' }}
      </UiNotice>
      <UiNotice v-if="alwaysPreparedSpells.length" tone="success" title="子职始终准备法术">
        {{ alwaysPreparedSpells.map((spell) => spell.name).join('、') }}（不占准备上限）
      </UiNotice>
      <UiNotice v-if="invalidSelectedCount" tone="warning" title="保留了需要重新确认的旧选择">
        有{{ invalidSelectedCount }}个法术来自之前的职业、等级或法术书状态；它们没有被静默删除，但不会计入合法完成。
      </UiNotice>
      <ListShell
        v-if="requiredCantripCount"
        title="戏法"
        :count="`${draft.spellSelections.cantripIds.length} / ${requiredCantripCount}`"
      >
        <ExpandableOptionCard
          v-for="spell in cantrips"
          expanded-label="法术效果"
          :key="spell.id"
          :title="spell.name"
          :description="spell.englishName"
          :state="draft.spellSelections.cantripIds.includes(spell.id) ? 'selected' : 'default'"
          @select="toggleCantrip(spell.id)"
        >
          <template #suffix>
            {{ draft.spellSelections.cantripIds.includes(spell.id) ? '已选' : draft.spellSelections.cantripIds.length >= requiredCantripCount ? '已满' : '选择' }}
          </template>
          <template v-if="spell.description" #expanded>{{ spell.description }}</template>
        </ExpandableOptionCard>
      </ListShell>
      <ListShell
        v-if="config.mode === 'spellbook'"
        title="法术书"
        :count="`${draft.spellSelections.spellbookSpellIds.filter((id) => !draft.spellSelections.transcribedSpellIds.includes(id)).length} / ${requiredSpellbookCount}${draft.spellSelections.transcribedSpellIds.length ? `（抄录 ${draft.spellSelections.transcribedSpellIds.length}）` : ''}`"
      >
        <ExpandableOptionCard
          v-for="spell in groupedSpells.flatMap((group) => group.spells)"
          expanded-label="法术效果"
          :key="`book-${spell.id}`"
          :title="spell.name"
          :description="`${spell.level}环 · ${spell.englishName}`"
          :state="draft.spellSelections.spellbookSpellIds.includes(spell.id) ? 'complete' : 'default'"
          @select="toggleSpellbook(spell.id)"
        >
          <template #suffix>
            <span v-if="draft.spellSelections.transcribedSpellIds.includes(spell.id)">在书中（抄录）</span>
            <span v-else-if="draft.spellSelections.spellbookSpellIds.includes(spell.id)">在书中</span>
            <span v-else-if="draft.spellSelections.spellbookSpellIds.filter((id) => !draft.spellSelections.transcribedSpellIds.includes(id)).length >= requiredSpellbookCount">已满</span>
            <span v-else>写入</span>
          </template>
          <template v-if="spell.description" #expanded>{{ spell.description }}</template>
        </ExpandableOptionCard>
      </ListShell>
      <ListShell
        v-for="group in groupedSpells"
        :key="group.level"
        :title="`${group.level}环${config.mode === 'spellbook' ? '准备法术' : '法术'}`"
      >
        <ExpandableOptionCard
          v-for="spell in config.mode === 'spellbook' ? group.spells.filter((item) => draft.spellSelections.spellbookSpellIds.includes(item.id)) : group.spells"
          expanded-label="法术效果"
          :key="spell.id"
          :title="spell.name"
          :description="`${spell.englishName} · ${spell.summary}`"
          :state="selectedIds.includes(spell.id) ? 'selected' : 'default'"
          @select="toggleSpell(spell.id)"
        >
          <template #suffix>
            <span v-if="selectedIds.includes(spell.id)">已选</span>
            <span v-else-if="selectedIds.length >= requiredCount">已满</span>
            <span v-else>选择</span>
          </template>
          <template v-if="spell.description" #expanded>{{ spell.description }}</template>
        </ExpandableOptionCard>
      </ListShell>
    </template>
  </section>
</template>

<style scoped lang="scss">
.spellcasting-step {
  display: grid;
  gap: 0.85rem;

  &__filters { display: grid; grid-template-columns: minmax(0, 1fr) minmax(8rem, auto); gap: 0.5rem; }
  &__filters input,
  &__filters select { min-height: 2.75rem; padding: 0 0.65rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); }

  @media (max-width: 430px) { &__filters { grid-template-columns: 1fr; } }

  > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);

    span { color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; }
    h3 { margin: 0.2rem 0 0; }    > strong {
      min-width: 4.5rem;
      padding: 0.5rem 0.7rem;
      border-radius: var(--radius-md);
      color: var(--color-primary);
      background: var(--color-primary-soft);
      text-align: center;
    }
  }

  &__slots {
    display: block;
    margin: 0.15rem 0 0;
    color: var(--color-primary);
    font-weight: 600;
  }

  &__count--complete {
    color: var(--color-success) !important;
    background: var(--color-success-soft) !important;
  }
}
</style>
