<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'

import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import UiTabs from '@/components/ui/UiTabs.vue'
import { ABILITY_LABELS } from '@/rules/data/ability-labels'
import { getRulesRepository } from '@/rules/repositories'
import {
  getAlwaysPreparedSpellIds,
  getMaximumSpellLevel,
  getSpellbookExtraCandidates,
  getSpellSlots,
  usesPreparedSelection,
} from '@/rules/spellcasting'
import type { CharacterDraft, SpellSelections } from '@/types/character'
import type { SpellRule } from '@/types/rules'
import { formatSpellLabel } from '@/utils/format-spell-label'
import SelectionTaskNavigator from '@/views/character-builder/components/SelectionTaskNavigator.vue'
import { useSpellcastingStepFlow } from '@/views/character-builder/hooks/useSpellcastingStepFlow'

const props = defineProps<{ draft: CharacterDraft }>()
const emit = defineEmits<{ change: [value: SpellSelections] }>()
const draft = toRef(() => props.draft)
const stepFlow = useSpellcastingStepFlow(draft)
const { config, availableSpells, requiredCantripCount, requiredSpellCount, requiredSpellbookCount, selectedSpellIds, spellbookExtraIds, spellbookExtraAllowance, normalSpellbookCount, invalidSpellSelectionCount, tasks, flow } = stepFlow
const repository = computed(() => getRulesRepository(props.draft.ruleset))

const search = ref('')
const sourceFilter = ref('all')
const schoolFilter = ref('all')
const ritualFilter = ref('all')
const concentrationFilter = ref('all')
const levelFilter = ref('all')

const sourceOptions = computed(() => [
  { id: 'all', label: '全部来源' },
  ...repository.value.sources
    .filter((source) => source.category === 'core' || (props.draft.enabledSourceIds ?? []).includes(source.id))
    .map((source) => ({ id: source.id, label: source.shortTitle })),
])
const schoolOptions = computed(() => [...new Set(taskCandidates.value.map((spell) => spell.school).filter((school): school is string => Boolean(school)))])
const hasConcentrationMetadata = computed(() => taskCandidates.value.some((spell) => spell.concentration !== undefined))
const castingSourceName = computed(() => {
  if (props.draft.subclassId) {
    const subclass = repository.value.getSubclass(props.draft.subclassId)
    if (subclass?.spellcasting) return subclass.name
  }
  return props.draft.classId ? repository.value.getClass(props.draft.classId)?.name ?? '' : ''
})
const maximumLevel = computed(() => config.value ? getMaximumSpellLevel(config.value, props.draft.targetLevel) : 0)
const spellSlots = computed(() => config.value ? getSpellSlots(config.value, props.draft.targetLevel) : [])
const spellSlotsLabel = computed(() => {
  if (!spellSlots.value.length) return ''
  const first = spellSlots.value[0]
  if (first?.pact) return `${first.count} 个 ${first.level} 环契约法术位（短休恢复）`
  return spellSlots.value.map((slot) => `${slot.level}环×${slot.count}`).join(' · ')
})
const alwaysPreparedSpells = computed(() => getAlwaysPreparedSpellIds(props.draft).map((id) => repository.value.getSpell(id)).filter((spell): spell is SpellRule => Boolean(spell)))
const spellbookExtraCandidates = computed(() => config.value ? getSpellbookExtraCandidates(props.draft, config.value) : [])

const taskSelectedIds = computed<readonly string[]>(() => {
  switch (flow.activeTaskId.value) {
    case 'cantrips': return props.draft.spellSelections.cantripIds
    case 'spellbook': return props.draft.spellSelections.spellbookSpellIds
    case 'spellbook-extra': return spellbookExtraIds.value
    default: return selectedSpellIds.value
  }
})
const taskCandidates = computed<readonly SpellRule[]>(() => {
  switch (flow.activeTaskId.value) {
    case 'cantrips': return availableSpells.value.filter((spell) => spell.level === 0)
    case 'spellbook': return availableSpells.value.filter((spell) => spell.level > 0)
    case 'spellbook-extra': return spellbookExtraCandidates.value
    case 'spells': return config.value?.mode === 'spellbook'
      ? availableSpells.value.filter((spell) => spell.level > 0 && props.draft.spellSelections.spellbookSpellIds.includes(spell.id))
      : availableSpells.value.filter((spell) => spell.level > 0)
    default: return []
  }
})
watch(() => flow.activeTaskId.value, () => {
  search.value = ''
  sourceFilter.value = 'all'
  schoolFilter.value = 'all'
  ritualFilter.value = 'all'
  concentrationFilter.value = 'all'
  const firstCandidate = taskCandidates.value[0]
  levelFilter.value = firstCandidate ? String(firstCandidate.level) : 'all'
}, { immediate: true, flush: 'post' })
const levelTabs = computed(() => {
  const levels = [...new Set(taskCandidates.value.map((spell) => spell.level))].sort((left, right) => left - right)
  return [
    { id: 'all', label: '全部' },
    ...levels.map((level) => ({ id: String(level), label: level === 0 ? '戏法' : `${level}环` })),
    { id: 'selected', label: `已选择 ${taskSelectedIds.value.length}` },
  ]
})
const filteredCandidates = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('zh-CN')
  return taskCandidates.value.filter((spell) => {
    const selected = taskSelectedIds.value.includes(spell.id)
    if (levelFilter.value === 'selected' && !selected) return false
    if (levelFilter.value !== 'all' && levelFilter.value !== 'selected' && spell.level !== Number(levelFilter.value)) return false
    if (sourceFilter.value !== 'all' && !spell.sourceIds.includes(sourceFilter.value)) return false
    if (schoolFilter.value !== 'all' && spell.school !== schoolFilter.value) return false
    if (ritualFilter.value === 'ritual' && !spell.ritual) return false
    if (ritualFilter.value === 'non-ritual' && spell.ritual) return false
    if (concentrationFilter.value === 'concentration' && !spell.concentration) return false
    if (concentrationFilter.value === 'non-concentration' && spell.concentration) return false
    if (query && !`${spell.name}${spell.englishName}`.toLocaleLowerCase('zh-CN').includes(query)) return false
    return levelFilter.value === 'selected' || !selected
  })
})
const selectedSpells = computed(() => taskSelectedIds.value.map((id) => repository.value.getSpell(id)).filter((spell): spell is SpellRule => Boolean(spell)))
const activeRequiredCount = computed(() => flow.activeTaskId.value === 'cantrips' ? requiredCantripCount.value
  : flow.activeTaskId.value === 'spellbook' ? requiredSpellbookCount.value
    : flow.activeTaskId.value === 'spellbook-extra' ? spellbookExtraAllowance.value
      : requiredSpellCount.value)
const activeCount = computed(() => flow.activeTaskId.value === 'spellbook' ? normalSpellbookCount.value : taskSelectedIds.value.length)
const activeFull = computed(() => activeCount.value >= activeRequiredCount.value)
const selectedCountLabel = computed(() => {
  if (flow.activeTaskId.value !== 'spellbook') return `${activeCount.value} / ${activeRequiredCount.value}`
  const transcribedCount = props.draft.spellSelections.transcribedSpellIds.length
  return `${activeCount.value} / ${activeRequiredCount.value}${transcribedCount ? `（另有抄录 ${transcribedCount}）` : ''}`
})

function toggleSpell(id: string): void {
  const current = selectedSpellIds.value
  const next = current.includes(id) ? current.filter((spellId) => spellId !== id) : current.length < requiredSpellCount.value ? [...current, id] : current
  if (!config.value || next === current) return
  emit('change', { ...props.draft.spellSelections, ...(usesPreparedSelection(config.value) ? { preparedSpellIds: next } : { knownSpellIds: next }) })
}
function toggleCantrip(id: string): void {
  const current = props.draft.spellSelections.cantripIds
  const next = current.includes(id) ? current.filter((spellId) => spellId !== id) : current.length < requiredCantripCount.value ? [...current, id] : current
  if (next !== current) emit('change', { ...props.draft.spellSelections, cantripIds: next })
}
function toggleSpellbook(id: string): void {
  const current = props.draft.spellSelections.spellbookSpellIds
  const transcribed = props.draft.spellSelections.transcribedSpellIds
  const removing = current.includes(id)
  if (removing && transcribed.includes(id)) return
  const nextBook = removing ? current.filter((spellId) => spellId !== id) : normalSpellbookCount.value < requiredSpellbookCount.value ? [...current, id] : current
  if (nextBook === current) return
  emit('change', {
    ...props.draft.spellSelections,
    spellbookSpellIds: nextBook,
    ...(removing ? { spellbookExtraSpellIds: spellbookExtraIds.value.filter((spellId) => spellId !== id) } : {}),
    preparedSpellIds: removing ? props.draft.spellSelections.preparedSpellIds.filter((spellId) => spellId !== id) : props.draft.spellSelections.preparedSpellIds,
  })
}
function toggleSpellbookExtra(id: string): void {
  const book = props.draft.spellSelections.spellbookSpellIds
  if (spellbookExtraIds.value.includes(id)) {
    emit('change', { ...props.draft.spellSelections, spellbookSpellIds: book.filter((spellId) => spellId !== id), spellbookExtraSpellIds: spellbookExtraIds.value.filter((spellId) => spellId !== id), preparedSpellIds: props.draft.spellSelections.preparedSpellIds.filter((spellId) => spellId !== id) })
    return
  }
  if (book.includes(id) || spellbookExtraIds.value.length >= spellbookExtraAllowance.value) return
  emit('change', { ...props.draft.spellSelections, spellbookSpellIds: [...book, id], spellbookExtraSpellIds: [...spellbookExtraIds.value, id] })
}
function toggleForTask(id: string): void {
  if (flow.activeTaskId.value === 'cantrips') toggleCantrip(id)
  else if (flow.activeTaskId.value === 'spellbook') toggleSpellbook(id)
  else if (flow.activeTaskId.value === 'spellbook-extra') toggleSpellbookExtra(id)
  else toggleSpell(id)
}
function canRemove(spellId: string): boolean { return !(flow.activeTaskId.value === 'spellbook' && props.draft.spellSelections.transcribedSpellIds.includes(spellId)) }
</script>

<template>
  <section class="spellcasting-step">
    <UiNotice v-if="!config" tone="info" title="当前职业无需配置法术">这一步会自动跳过，不影响角色完成。</UiNotice>
    <UiNotice v-else-if="draft.targetLevel < config.startsAtLevel" tone="info" title="施法尚未开始">{{ castingSourceName }}从{{ config.startsAtLevel }}级开始施法；当前等级无需选择法术。</UiNotice>
    <template v-else>
      <header class="spellcasting-step__summary">
        <div><span>{{ ABILITY_LABELS[config.ability] }}施法 · 最高{{ maximumLevel }}环</span><p v-if="spellSlots.length">{{ spellSlotsLabel }}</p><h3>{{ castingSourceName }}法术配置</h3></div>
        <strong>{{ tasks.filter((task) => task.status === 'complete').length }} / {{ tasks.length }}</strong>
      </header>
      <SelectionTaskNavigator v-model="flow.activeTaskId.value" :tasks="tasks" :completed="flow.completedCount.value" />
      <UiNotice v-if="alwaysPreparedSpells.length" tone="success" title="自动获得／始终准备">{{ alwaysPreparedSpells.map((spell) => spell.name).join('、') }}（不占选择上限）</UiNotice>
      <UiNotice v-if="invalidSpellSelectionCount" tone="warning" title="保留了需要重新确认的旧选择">有 {{ invalidSpellSelectionCount }} 项法术来自之前的职业、等级或法术书状态；它们没有被静默删除，但不会计入合法完成。</UiNotice>
      <UiNotice v-if="activeFull && filteredCandidates.length && levelFilter !== 'selected'" tone="info" title="当前名额已选满">请先从上方“当前已选”移除一项，再选择其他法术。</UiNotice>

      <section class="spellcasting-step__panel" role="tabpanel">
        <h2 ref="flow.heading" tabindex="-1">{{ flow.activeTask.value?.label }}</h2>
        <p v-if="flow.activeTaskId.value === 'spellbook-extra'" class="spellcasting-step__hint">子职提供的额外入书名额不占升级名额；该任务可选。</p>
        <p v-else-if="config.mode === 'spellbook' && flow.activeTaskId.value === 'spellbook'" class="spellcasting-step__hint">先把升级获得的法术写入法术书，之后再从书中准备法术。</p>

        <ListShell v-if="selectedSpells.length" title="当前已选" :count="selectedCountLabel">
          <ExpandableOptionCard v-for="spell in selectedSpells" :key="`selected-${spell.id}`" :title="spell.name" :description="formatSpellLabel(spell)" expanded-label="法术效果" state="selected" @select="canRemove(spell.id) && toggleForTask(spell.id)">
            <template #suffix><span v-if="!canRemove(spell.id)">在书中（抄录，不可移除）</span><span v-else>点击移除</span></template>
            <template v-if="spell.description" #expanded>{{ spell.description }}</template>
          </ExpandableOptionCard>
        </ListShell>

        <UiTabs v-model="levelFilter" :items="levelTabs" />
        <div class="spellcasting-step__filters">
          <input v-model="search" type="search" placeholder="搜索中英文法术名" aria-label="搜索法术">
          <select v-model="sourceFilter" aria-label="按法术来源筛选"><option v-for="source in sourceOptions" :key="source.id" :value="source.id">{{ source.label }}</option></select>
          <select v-if="schoolOptions.length" v-model="schoolFilter" aria-label="按法术学派筛选"><option value="all">全部学派</option><option v-for="school in schoolOptions" :key="school" :value="school">{{ school }}</option></select>
          <select v-model="ritualFilter" aria-label="按仪式筛选"><option value="all">仪式不限</option><option value="ritual">仅仪式</option><option value="non-ritual">非仪式</option></select>
          <select v-if="hasConcentrationMetadata" v-model="concentrationFilter" aria-label="按专注筛选"><option value="all">专注不限</option><option value="concentration">仅专注</option><option value="non-concentration">非专注</option></select>
        </div>

        <ListShell :empty="filteredCandidates.length === 0" empty-text="没有匹配的法术。">
          <ExpandableOptionCard v-for="spell in filteredCandidates" :key="`${flow.activeTaskId.value}-${spell.id}`" :title="spell.name" :description="`${formatSpellLabel(spell)}${spell.summary ? ` · ${spell.summary}` : ''}`" expanded-label="法术效果" :state="taskSelectedIds.includes(spell.id) ? 'selected' : 'default'" @select="toggleForTask(spell.id)">
            <template #suffix><span v-if="taskSelectedIds.includes(spell.id)">已选</span><span v-else-if="activeFull">已满</span><span v-else>{{ flow.activeTaskId.value.includes('spellbook') ? '写入' : '选择' }}</span></template>
            <template v-if="spell.description" #expanded>{{ spell.description }}</template>
          </ExpandableOptionCard>
        </ListShell>
      </section>
    </template>
  </section>
</template>

<style scoped lang="scss">
.spellcasting-step {
  display: grid;
  gap: 0.85rem;

  &__summary { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.9rem; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); }
  &__summary span { color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; }
  &__summary p { margin: 0.15rem 0 0; color: var(--color-primary); font-size: 0.78rem; font-weight: 600; }
  &__summary h3 { margin: 0.2rem 0 0; }
  &__summary > strong { min-width: 4.5rem; padding: 0.5rem 0.7rem; border-radius: var(--radius-md); color: var(--color-primary); background: var(--color-primary-soft); text-align: center; }
  &__panel { display: grid; gap: 0.65rem; }
  &__panel > h2 { margin: 0; font-size: 1rem; outline: none; }
  &__hint { margin: 0; color: var(--color-text-muted); font-size: 0.75rem; line-height: 1.5; }
  &__filters { display: grid; grid-template-columns: minmax(12rem, 2fr) repeat(4, minmax(7rem, 1fr)); gap: 0.5rem; }
  &__filters input,
  &__filters select { min-height: 2.75rem; min-width: 0; padding: 0 0.65rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); }
  @media (max-width: 760px) { &__filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } &__filters input { grid-column: 1 / -1; } }
  @media (max-width: 430px) { &__filters { grid-template-columns: 1fr; } &__filters input { grid-column: auto; } }
}
</style>
