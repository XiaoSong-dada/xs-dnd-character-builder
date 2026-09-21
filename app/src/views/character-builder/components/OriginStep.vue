<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import { SKILL_IDS } from '@/rules/derive'
import { getFeatPool } from '@/rules/feats'
import { getLanguageOptions, getRequiredLanguageCount } from '@/rules/languages'
import { getBackgroundRecommendationReason, getRaceRecommendationReason, sortByClassRecommendation } from '@/rules/recommend'
import { getRulesRepository } from '@/rules/repositories'
import { isSourceEnabled } from '@/rules/source-books'
import type { AbilityKey, ChoiceSelection, RulesetId } from '@/types/character'
import type { BackgroundRule, FeatRule } from '@/types/rules'
import SelectionTaskNavigator from '@/views/character-builder/components/SelectionTaskNavigator.vue'
import { useSelectionTaskFlow } from '@/views/character-builder/hooks/useSelectionTaskFlow'
import type { SelectionTask, SelectionTaskFocusHandle } from '@/views/character-builder/selection-task'

const props = withDefaults(defineProps<{
  ruleset?: RulesetId
  classId?: string
  raceId?: string
  subraceId?: string
  backgroundId?: string
  backgroundVariantId?: string
  languages: readonly string[]
  raceSkillChoices?: readonly string[]
  raceToolChoice?: string
  backgroundToolIds?: readonly string[]
  enabledSourceIds?: readonly string[]
  sizeChoice?: 'small' | 'medium'
  backgroundAbilities?: Readonly<Partial<Record<AbilityKey, number>>>
  selections?: readonly ChoiceSelection[]
  blockers?: readonly { readonly id: string; readonly message: string; readonly resolution: string }[]
}>(), {
  raceSkillChoices: () => [], backgroundToolIds: () => [], selections: () => [], ruleset: '5e-2014', blockers: () => [],
})

const emit = defineEmits<{
  race: [id: string]
  subrace: [id: string | undefined]
  background: [id: string]
  variant: [id: string | undefined]
  languages: [ids: readonly string[]]
  raceSkills: [ids: readonly string[]]
  raceTool: [id: string | undefined]
  backgroundTools: [ids: readonly string[]]
  size: [size: 'small' | 'medium']
  backgroundAbilities: [allocation: Readonly<Partial<Record<AbilityKey, number>>>]
  backgroundFeat: [checkpointId: string, optionIds: readonly string[]]
}>()

const repository = computed(() => getRulesRepository(props.ruleset))
const classRule = computed(() => props.classId ? repository.value.getClass(props.classId) : undefined)
const raceSearch = ref('')
const backgroundSearch = ref('')
const raceSourceFilter = ref('all')
const backgroundSourceFilter = ref('all')
const showAllRaces = ref(false)
const showAllBackgrounds = ref(false)

const sourceOptions = computed(() => [
  { id: 'all', label: '全部来源' },
  ...repository.value.sources
    .filter((source) => source.category === 'core' || (props.enabledSourceIds ?? []).includes(source.id))
    .map((source) => ({ id: source.id, label: source.shortTitle })),
])
const availableBaseRaces = computed(() => repository.value.races.filter((item) => !item.parentRaceId && isSourceEnabled(item.sourceIds, props.enabledSourceIds, repository.value)))
const selectedRace = computed(() => props.raceId ? repository.value.getRace(props.raceId) : undefined)
const filteredRaces = computed(() => {
  const query = raceSearch.value.trim().toLocaleLowerCase('zh-CN')
  return availableBaseRaces.value.filter((item) => (raceSourceFilter.value === 'all' || item.sourceIds.includes(raceSourceFilter.value)) && (!query || `${item.name}${item.englishName}`.toLocaleLowerCase('zh-CN').includes(query)))
})
const recommendedRaces = computed(() => filteredRaces.value.filter((item) => item.recommendedClassIds.includes(props.classId ?? '')).slice(0, 6))
/** 完整目录／搜索／来源筛选共用的候选池：推荐优先，其余保持登记顺序（v1.9.1 R1-1）。 */
const orderedRaces = computed(() => sortByClassRecommendation(filteredRaces.value, props.classId))
const visibleRaces = computed(() => {
  const full = showAllRaces.value || Boolean(raceSearch.value.trim()) || raceSourceFilter.value !== 'all'
  // 已选种族保留在候选目录中并显示已选态（v1.9.1 追加），不再把当前选择从候选里移除。
  return full ? orderedRaces.value : recommendedRaces.value.length ? recommendedRaces.value : orderedRaces.value.slice(0, 6)
})
const subraces = computed(() => props.raceId ? repository.value.races.filter((item) => item.parentRaceId === props.raceId && isSourceEnabled(item.sourceIds, props.enabledSourceIds, repository.value)) : [])

const availableBaseBackgrounds = computed(() => repository.value.backgrounds.filter((item) => !item.parentBackgroundId && isSourceEnabled(item.sourceIds, props.enabledSourceIds, repository.value)))
const selectedBackground = computed(() => props.backgroundId ? repository.value.getBackground(props.backgroundId) : undefined)
const filteredBackgrounds = computed(() => {
  const query = backgroundSearch.value.trim().toLocaleLowerCase('zh-CN')
  return availableBaseBackgrounds.value.filter((item) => (backgroundSourceFilter.value === 'all' || item.sourceIds.includes(backgroundSourceFilter.value)) && (!query || `${item.name}${item.englishName}`.toLocaleLowerCase('zh-CN').includes(query)))
})
const recommendedBackgrounds = computed(() => filteredBackgrounds.value.filter((item) => item.recommendedClassIds.includes(props.classId ?? '')).slice(0, 6))
/** 背景候选池与种族同构：完整目录／搜索／来源筛选都推荐优先（v1.9.1 R1-1）。 */
const orderedBackgrounds = computed(() => sortByClassRecommendation(filteredBackgrounds.value, props.classId))
const visibleBackgrounds = computed(() => {
  const full = showAllBackgrounds.value || Boolean(backgroundSearch.value.trim()) || backgroundSourceFilter.value !== 'all'
  // 与种族同构（v1.9.1 追加）：已选背景保留在候选目录中并显示已选态。
  return full ? orderedBackgrounds.value : recommendedBackgrounds.value.length ? recommendedBackgrounds.value : orderedBackgrounds.value.slice(0, 6)
})
const variants = computed(() => props.backgroundId ? repository.value.backgrounds.filter((item) => item.parentBackgroundId === props.backgroundId && isSourceEnabled(item.sourceIds, props.enabledSourceIds, repository.value)) : [])
const effectiveBackground = computed<BackgroundRule | undefined>(() => props.backgroundVariantId ? repository.value.getBackground(props.backgroundVariantId) : selectedBackground.value)
const languageChoiceCount = computed(() => getRequiredLanguageCount({ ruleset: props.ruleset, classId: props.classId, backgroundId: props.backgroundId, backgroundVariantId: props.backgroundVariantId }, repository.value))
const languageOptions = computed(() => getLanguageOptions(props.ruleset))

const currentRace = computed(() => props.subraceId ? repository.value.getRace(props.subraceId) : selectedRace.value)
function findProficiencySpec(key: 'skillProficiencyChoices' | 'toolProficiencyChoices'): { readonly count: number; readonly optionIds?: readonly string[] } | undefined {
  const visited = new Set<string>()
  const visit = (raceId: string | undefined): { readonly count: number; readonly optionIds?: readonly string[] } | undefined => {
    if (!raceId || visited.has(raceId)) return undefined
    visited.add(raceId)
    const race = repository.value.getRace(raceId)
    return race ? race[key] ?? visit(race.parentRaceId) : undefined
  }
  return visit(currentRace.value?.id)
}
const raceSkillSpec = computed(() => findProficiencySpec('skillProficiencyChoices'))
const raceToolSpec = computed(() => findProficiencySpec('toolProficiencyChoices'))
const isGithyanki = computed(() => currentRace.value?.id === 'race-2014-gith-githyanki')
const raceSkillOptions = computed(() => (raceSkillSpec.value?.optionIds ?? SKILL_IDS).map((id) => ({ id, name: repository.value.getOption(id)?.name ?? id })))
const raceToolOptions = computed(() => repository.value.options.filter((option) => option.id.startsWith('tool-')).map((option) => ({ id: option.id, name: option.name })))
const speciesSizeChoices = computed(() => {
  const visited = new Set<string>()
  const visit = (raceId: string | undefined): readonly ('small' | 'medium')[] | undefined => {
    if (!raceId || visited.has(raceId)) return undefined
    visited.add(raceId)
    const race = repository.value.getRace(raceId)
    return race ? race.sizeChoices?.length ? race.sizeChoices : visit(race.parentRaceId) : undefined
  }
  return visit(currentRace.value?.id)
})

const backgroundRule = computed(() => selectedBackground.value)
const backgroundFeatCheckpointId = computed(() => props.backgroundId ? `${props.backgroundId}-origin-feat` : undefined)
const backgroundFixedFeat = computed<FeatRule | undefined>(() => {
  const rule = backgroundRule.value
  if (!rule || rule.originFeatOptions?.length || (rule.originFeatChoices?.count ?? 0) > 0) return undefined
  return rule.originFeatId ? repository.value.getFeat(rule.originFeatId) : undefined
})
const backgroundFeatCandidates = computed<readonly FeatRule[]>(() => {
  const rule = backgroundRule.value
  if (!rule) return []
  const ids = rule.originFeatOptions?.length ? rule.originFeatOptions : rule.originFeatChoices && rule.originFeatChoices.count > 0 ? getFeatPool(repository.value, rule.originFeatChoices.categories, { enabledSourceIds: props.enabledSourceIds }).map((feat) => feat.id) : []
  return ids.map((id) => repository.value.getFeat(id)).filter((feat): feat is FeatRule => Boolean(feat)).filter((feat) => isSourceEnabled(feat.sourceIds, props.enabledSourceIds, repository.value))
})
const backgroundFeatSelection = computed<readonly string[]>(() => backgroundFeatCheckpointId.value ? props.selections.find((item) => item.checkpointId === backgroundFeatCheckpointId.value && !item.invalidatedAt)?.optionIds ?? [] : [])
const abilityCandidates = computed(() => backgroundRule.value?.abilityChoices ?? [])
const abilityLabels: Readonly<Record<AbilityKey, string>> = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' }
const allocationMode = ref<'split' | 'even'>('split')
const allocation = ref<Partial<Record<AbilityKey, number>>>({ ...(props.backgroundAbilities ?? {}) })
watch(() => props.backgroundAbilities, (value) => { allocation.value = { ...(value ?? {}) } })

const backgroundToolSpec = computed(() => effectiveBackground.value?.toolChoices)
const fixedBackgroundToolIds = computed(() => effectiveBackground.value?.toolIds ?? [])
const selectedBackgroundToolIds = computed(() => props.backgroundToolIds.filter((id) => !fixedBackgroundToolIds.value.includes(id)))
const backgroundToolOptions = computed(() => (backgroundToolSpec.value?.optionIds ?? []).map((id) => repository.value.getEquipment(id)).filter((item): item is NonNullable<typeof item> => Boolean(item)))
function hasBlocker(prefix: string): boolean { return props.blockers.some((blocker) => blocker.id.startsWith(prefix)) }
function hasInvalidBlocker(prefix: string): boolean {
  return props.blockers.some((blocker) => blocker.id.startsWith(prefix) && (blocker.id.includes('invalid') || blocker.id.includes('mismatch') || blocker.id.includes('exclusive')))
}

const tasks = computed<readonly SelectionTask[]>(() => {
  const result: SelectionTask[] = [{ id: 'race', label: props.ruleset === '5e-2024' ? '选择物种' : '选择种族', group: '种族', required: true, status: props.raceId ? 'complete' : 'pending', summary: selectedRace.value?.name ?? '尚未选择' }]
  if (subraces.value.length) result.push({ id: 'subrace', label: props.ruleset === '5e-2024' ? '血统／传承' : '子种族', group: '种族', required: Boolean(selectedRace.value?.requiresSubrace), status: hasBlocker('subrace-mismatch') ? 'invalid' : props.subraceId ? 'complete' : selectedRace.value?.requiresSubrace ? 'pending' : 'optional', summary: props.subraceId ? repository.value.getRace(props.subraceId)?.name ?? props.subraceId : selectedRace.value?.requiresSubrace ? '尚未选择' : '可选' })
  if (speciesSizeChoices.value?.length) result.push({ id: 'species-size', label: '选择体型', group: '种族', required: true, status: hasBlocker('species-size') ? 'pending' : 'complete', summary: props.sizeChoice ? sizeLabel(props.sizeChoice) : '尚未选择' })
  if (raceSkillSpec.value || raceToolSpec.value) result.push({ id: 'race-proficiencies', label: '种族熟练', group: '种族', required: Boolean(raceSkillSpec.value), status: hasInvalidBlocker('race-skill') || hasInvalidBlocker('githyanki') ? 'invalid' : hasBlocker('race-skill') || hasBlocker('githyanki') ? 'pending' : (props.raceSkillChoices.length || props.raceToolChoice) ? 'complete' : 'optional', summary: props.raceSkillChoices.length || props.raceToolChoice ? `已选 ${props.raceSkillChoices.length + Number(Boolean(props.raceToolChoice))} 项` : '尚未选择' })
  result.push({ id: 'background', label: '选择背景', group: '背景', required: true, status: props.backgroundId ? 'complete' : 'pending', summary: selectedBackground.value?.name ?? '尚未选择' })
  if (variants.value.length) result.push({ id: 'background-variant', label: '背景变体', group: '背景', required: false, status: props.backgroundVariantId ? 'complete' : 'optional', summary: props.backgroundVariantId ? repository.value.getBackground(props.backgroundVariantId)?.name ?? props.backgroundVariantId : '可选' })
  if (languageChoiceCount.value > 0) result.push({ id: 'background-languages', label: '额外语言', group: '背景', required: true, status: hasBlocker('background-languages') ? 'pending' : 'complete', summary: props.languages.join('、') || '尚未选择', progress: `${props.languages.length}/${languageChoiceCount.value}` })
  if (abilityCandidates.value.length) result.push({ id: 'background-abilities', label: '背景属性', group: '背景', required: true, status: hasBlocker('background-ability') ? 'pending' : 'complete', summary: Object.keys(allocation.value).length ? '已分配' : '尚未分配' })
  if (backgroundFixedFeat.value || backgroundFeatCandidates.value.length) result.push({ id: 'background-feat', label: '起源专长', group: '背景', required: Boolean(backgroundFeatCandidates.value.length), status: backgroundFixedFeat.value || backgroundFeatSelection.value.length ? 'complete' : 'pending', summary: backgroundFixedFeat.value?.name ?? (backgroundFeatSelection.value[0] ? repository.value.getFeat(backgroundFeatSelection.value[0])?.name ?? '已选择' : '尚未选择') })
  if (backgroundToolSpec.value) result.push({ id: 'background-tools', label: '背景工具', group: '背景', required: true, status: hasInvalidBlocker('background-tool') ? 'invalid' : hasBlocker('background-tool') ? 'pending' : 'complete', summary: selectedBackgroundToolIds.value.map((id) => repository.value.getEquipment(id)?.name ?? id).join('、') || '尚未选择', progress: `${selectedBackgroundToolIds.value.length}/${backgroundToolSpec.value.count}` })
  return result
})
const headingEl = ref<HTMLElement>()
const flow = useSelectionTaskFlow(tasks, headingEl)

/** 吸底栏「去完成」经页面调用该句柄；页面内提示条的按钮复用同一出口（v1.9.1 R3-6）。 */
defineExpose<SelectionTaskFocusHandle>({ focusFirstIncomplete: flow.focusFirstIncomplete })

function sizeLabel(size: 'small' | 'medium'): string { return size === 'small' ? '小型' : '中型' }
function setAllocationMode(mode: 'split' | 'even'): void { if (allocationMode.value !== mode) { allocationMode.value = mode; allocation.value = {}; emit('backgroundAbilities', {}) } }
function toggleBackgroundAbility(key: AbilityKey): void {
  if (!abilityCandidates.value.includes(key)) return
  const next = { ...allocation.value }; const current = next[key] ?? 0
  if (allocationMode.value === 'even') { if (current) delete next[key]; else if (Object.keys(next).length < 3) next[key] = 1 }
  else if (current) delete next[key]; else if (!Object.values(next).includes(2)) next[key] = 2; else if (!Object.values(next).includes(1)) next[key] = 1
  allocation.value = next; emit('backgroundAbilities', next)
}
function toggleRaceSkill(id: string): void {
  const spec = raceSkillSpec.value; if (!spec) return
  const next = props.raceSkillChoices.includes(id) ? props.raceSkillChoices.filter((item) => item !== id) : [...props.raceSkillChoices, id].slice(0, spec.count)
  emit('raceSkills', next); if (isGithyanki.value && next.length) emit('raceTool', undefined)
}
function toggleRaceTool(id: string): void { const next = props.raceToolChoice === id ? undefined : id; emit('raceTool', next); if (isGithyanki.value && next) emit('raceSkills', []) }
function toggleLanguage(id: string): void { emit('languages', props.languages.includes(id) ? props.languages.filter((item) => item !== id) : [...props.languages, id].slice(-languageChoiceCount.value)) }
function toggleBackgroundTool(id: string): void {
  const spec = backgroundToolSpec.value; if (!spec) return
  const chosen = selectedBackgroundToolIds.value.includes(id) ? selectedBackgroundToolIds.value.filter((item) => item !== id) : [...selectedBackgroundToolIds.value, id].slice(-spec.count)
  emit('backgroundTools', [...fixedBackgroundToolIds.value, ...chosen])
}
function selectBackgroundFeat(featId: string): void { const checkpointId = backgroundFeatCheckpointId.value; if (checkpointId) emit('backgroundFeat', checkpointId, backgroundFeatSelection.value.includes(featId) ? [] : [featId]) }
</script>

<template>
  <section class="origin-step">
    <SelectionTaskNavigator v-model="flow.activeTaskId.value" :tasks="tasks" :completed="flow.completedCount.value" />
    <UiNotice v-if="flow.firstIncompleteTask.value" tone="warning" :title="`下一项：${flow.firstIncompleteTask.value.label}`">
      {{ blockers[0]?.resolution ?? '完成当前角色需要的选择后即可继续。' }}
      <button type="button" class="origin-step__jump" @click="flow.focusFirstIncomplete">去完成</button>
    </UiNotice>
    <section class="origin-step__panel" role="tabpanel">
      <header><span>{{ flow.activeTask.value?.group }}</span><h2 ref="headingEl" tabindex="-1">{{ flow.activeTask.value?.label }}</h2></header>

      <template v-if="flow.activeTaskId.value === 'race'">
        <ExpandableOptionCard v-if="selectedRace" :title="`已选择：${selectedRace.name}`" :description="selectedRace.summary" expanded-label="种族介绍" state="complete"><template #suffix><UiBadge tone="success">已选择</UiBadge></template><template #expanded>{{ selectedRace.description }}</template></ExpandableOptionCard>
        <p v-if="selectedRace" class="origin-step__hint">需要更改时，可从下方候选中重新选择。</p>
        <div class="origin-step__filters"><input v-model="raceSearch" type="search" placeholder="搜索中文或英文名称" aria-label="搜索种族"><select v-model="raceSourceFilter" aria-label="按种族来源筛选"><option v-for="source in sourceOptions" :key="source.id" :value="source.id">{{ source.label }}</option></select></div>
        <p v-if="!showAllRaces && !raceSearch && raceSourceFilter === 'all'" class="origin-step__hint">优先展示与当前职业常见玩法契合的候选。</p>
        <ListShell :empty="visibleRaces.length === 0" empty-text="没有匹配的种族。">
          <ExpandableOptionCard
            v-for="race in visibleRaces"
            :key="race.id"
            :title="race.name"
            :description="[race.summary, getRaceRecommendationReason(race, classRule)].filter(Boolean).join(' · ')"
            expanded-label="种族介绍"
            :state="race.id === raceId ? 'selected' : 'default'"
            @select="race.id !== raceId && $emit('race', race.id)"
          >
            <template #suffix><UiBadge v-if="race.id === raceId" tone="success">已选</UiBadge><UiBadge v-if="race.status === 'dm-only'" tone="warning">可选规则</UiBadge><UiBadge v-else-if="race.recommendedClassIds.includes(classId ?? '')" tone="primary">推荐</UiBadge></template>
            <template #expanded>{{ race.description }}</template>
          </ExpandableOptionCard>
        </ListShell>
        <BaseButton v-if="!showAllRaces && !raceSearch && raceSourceFilter === 'all' && filteredRaces.length > visibleRaces.length" variant="secondary" @click="showAllRaces = true">查看全部 {{ filteredRaces.length }} 项</BaseButton>
      </template>

      <template v-else-if="flow.activeTaskId.value === 'subrace'">
        <p class="origin-step__hint">{{ selectedRace?.requiresSubrace ? `${selectedRace.name}必须选择一个分支。` : '这是可选分支，不选择也可以继续。' }}</p>
        <ListShell><ExpandableOptionCard v-for="subrace in subraces" :key="subrace.id" :title="subrace.name" :description="subrace.summary" expanded-label="分支介绍" :state="subraceId === subrace.id ? 'selected' : 'default'" @select="$emit('subrace', subraceId === subrace.id ? undefined : subrace.id)"><template #suffix><UiBadge v-if="subraceId === subrace.id" tone="success">已选</UiBadge></template><template #expanded>{{ subrace.description }}</template></ExpandableOptionCard></ListShell>
      </template>

      <div v-else-if="flow.activeTaskId.value === 'species-size'" class="origin-step__choices"><button v-for="size in speciesSizeChoices" :key="size" type="button" :aria-pressed="sizeChoice === size" @click="$emit('size', size)">{{ sizeChoice === size ? '✓ ' : '' }}{{ sizeLabel(size) }}</button></div>

      <div v-else-if="flow.activeTaskId.value === 'race-proficiencies'" class="origin-step__race-choices">
        <template v-if="raceSkillSpec"><p>{{ isGithyanki ? '选择一项技能熟练' : `选择${raceSkillSpec.count}项技能熟练` }}</p><div class="origin-step__choices"><button v-for="option in raceSkillOptions" :key="option.id" type="button" :aria-pressed="raceSkillChoices.includes(option.id)" @click="toggleRaceSkill(option.id)">{{ raceSkillChoices.includes(option.id) ? '✓ ' : '' }}{{ option.name }}</button></div></template>
        <template v-if="raceToolSpec"><p>{{ isGithyanki ? '或选择一项工具熟练（与技能二选一）' : '选择一项工具熟练' }}</p><div class="origin-step__choices"><button v-for="option in raceToolOptions" :key="option.id" type="button" :aria-pressed="raceToolChoice === option.id" @click="toggleRaceTool(option.id)">{{ raceToolChoice === option.id ? '✓ ' : '' }}{{ option.name }}</button></div></template>
      </div>

      <template v-else-if="flow.activeTaskId.value === 'background'">
        <ExpandableOptionCard v-if="selectedBackground" :title="`已选择：${selectedBackground.name}`" :description="selectedBackground.summary" expanded-label="背景介绍" state="complete"><template #suffix><UiBadge tone="success">已选择</UiBadge></template><template #expanded>{{ selectedBackground.description }}</template></ExpandableOptionCard>
        <p v-if="selectedBackground" class="origin-step__hint">需要更改时，可从下方候选中重新选择。</p>
        <div class="origin-step__filters"><input v-model="backgroundSearch" type="search" placeholder="搜索中文或英文名称" aria-label="搜索背景"><select v-model="backgroundSourceFilter" aria-label="按背景来源筛选"><option v-for="source in sourceOptions" :key="source.id" :value="source.id">{{ source.label }}</option></select></div>
        <p v-if="!showAllBackgrounds && !backgroundSearch && backgroundSourceFilter === 'all'" class="origin-step__hint">优先展示与当前职业常见玩法契合的候选。</p>
        <ListShell :empty="visibleBackgrounds.length === 0" empty-text="没有匹配的背景。">
          <ExpandableOptionCard
            v-for="background in visibleBackgrounds"
            :key="background.id"
            :title="background.name"
            :description="[background.summary, background.featureName, getBackgroundRecommendationReason(background, classRule)].filter(Boolean).join(' · ')"
            expanded-label="背景介绍"
            :state="background.id === backgroundId ? 'selected' : 'default'"
            @select="background.id !== backgroundId && $emit('background', background.id)"
          >
            <template #suffix><UiBadge v-if="background.id === backgroundId" tone="success">已选</UiBadge><UiBadge v-if="background.recommendedClassIds.includes(classId ?? '')" tone="primary">推荐</UiBadge></template>
            <template #expanded>{{ background.description }}</template>
          </ExpandableOptionCard>
        </ListShell>
        <BaseButton v-if="!showAllBackgrounds && !backgroundSearch && backgroundSourceFilter === 'all' && filteredBackgrounds.length > visibleBackgrounds.length" variant="secondary" @click="showAllBackgrounds = true">查看全部 {{ filteredBackgrounds.length }} 项</BaseButton>
      </template>

      <template v-else-if="flow.activeTaskId.value === 'background-variant'"><UiNotice tone="info" title="可选内容">不选择背景变体也可以继续。</UiNotice><ListShell><ExpandableOptionCard v-for="variant in variants" :key="variant.id" :title="variant.name" :description="variant.summary" expanded-label="变体介绍" :state="backgroundVariantId === variant.id ? 'selected' : 'default'" @select="$emit('variant', backgroundVariantId === variant.id ? undefined : variant.id)"><template #suffix><UiBadge v-if="backgroundVariantId === variant.id" tone="success">已选</UiBadge></template><template #expanded>{{ variant.description }}</template></ExpandableOptionCard></ListShell></template>
      <div v-else-if="flow.activeTaskId.value === 'background-languages'" class="origin-step__languages"><strong>选择 {{ languageChoiceCount }} 种不同的额外语言（已选 {{ languages.length }} 种）</strong><button v-for="language in languageOptions" :key="language" type="button" :aria-pressed="languages.includes(language)" @click="toggleLanguage(language)">{{ languages.includes(language) ? '✓ ' : '' }}{{ language }}</button></div>
      <div v-else-if="flow.activeTaskId.value === 'background-abilities'" class="origin-step__branch"><div class="origin-step__choices"><button type="button" :aria-pressed="allocationMode === 'split'" @click="setAllocationMode('split')">一项 +2、另一项 +1</button><button type="button" :aria-pressed="allocationMode === 'even'" @click="setAllocationMode('even')">三项各 +1</button></div><div class="origin-step__choices"><button v-for="key in abilityCandidates" :key="key" type="button" :aria-pressed="(allocation[key] ?? 0) > 0" @click="toggleBackgroundAbility(key)">{{ abilityLabels[key] }}{{ allocation[key] ? ` +${allocation[key]}` : '' }}</button></div></div>

      <div v-else-if="flow.activeTaskId.value === 'background-feat'" class="origin-step__background-feat">
        <template v-if="backgroundFixedFeat"><p class="origin-step__hint">由背景固定授予，无需额外选择。</p><ExpandableOptionCard :title="`${backgroundFixedFeat.name} · ${backgroundFixedFeat.englishName}`" :description="backgroundFixedFeat.description" expanded-label="专长效果" state="complete"><template #suffix><UiBadge tone="success">自动获得</UiBadge></template><template #expanded>{{ backgroundFixedFeat.detail }}</template></ExpandableOptionCard></template>
        <template v-else><p class="origin-step__hint">从 {{ backgroundFeatCandidates.length }} 个候选中选择 1 项。</p><ListShell><ExpandableOptionCard v-for="feat in backgroundFeatCandidates" :key="feat.id" radio :title="`${feat.name} · ${feat.englishName}`" :description="feat.description" expanded-label="专长效果" :state="backgroundFeatSelection.includes(feat.id) ? 'selected' : 'default'" @select="selectBackgroundFeat(feat.id)"><template #suffix><UiBadge v-if="backgroundFeatSelection.includes(feat.id)" tone="success">已选</UiBadge></template><template #expanded>{{ feat.detail }}</template></ExpandableOptionCard></ListShell></template>
      </div>

      <div v-else-if="flow.activeTaskId.value === 'background-tools'" class="origin-step__branch"><p class="origin-step__hint">选择 {{ backgroundToolSpec?.count }} 项工具熟练（已选 {{ selectedBackgroundToolIds.length }} 项）。</p><div class="origin-step__choices"><button v-for="tool in backgroundToolOptions" :key="tool.id" type="button" :aria-pressed="selectedBackgroundToolIds.includes(tool.id)" @click="toggleBackgroundTool(tool.id)">{{ selectedBackgroundToolIds.includes(tool.id) ? '✓ ' : '' }}{{ tool.name }}</button></div></div>
    </section>
  </section>
</template>

<style scoped lang="scss">
.origin-step {
  display: grid;
  gap: 0.75rem;

  &__panel { display: grid; gap: 0.65rem; }
  &__panel > header { span { color: var(--color-primary); font-size: 0.7rem; font-weight: 700; } h2 { margin: 0.2rem 0; font-size: 1.05rem; outline: none; } }
  &__filters { display: grid; grid-template-columns: minmax(0, 1fr) minmax(8rem, auto); gap: 0.5rem; }
  &__filters input,
  &__filters select { min-height: 2.75rem; padding: 0 0.65rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); }
  &__jump { margin-left: 0.4rem; border: 0; color: var(--color-primary); background: transparent; font-weight: 700; text-decoration: underline; }
  &__branch,
  &__race-choices,
  &__background-feat { display: grid; gap: 0.55rem; padding: 0.75rem; border-left: 0.2rem solid var(--color-gold); background: var(--color-gold-soft); }
  &__race-choices > p { margin: 0; color: var(--color-text-muted); font-size: 0.75rem; }
  &__background-feat { border-left-color: var(--color-primary); background: var(--color-primary-soft); }
  &__hint { margin: 0; color: var(--color-text-muted); font-size: 0.75rem; line-height: 1.55; }
  &__languages,
  &__choices { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  &__languages { padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); }
  &__languages strong { width: 100%; font-size: 0.8rem; }
  &__languages button,
  &__choices button { min-height: 2.75rem; padding: 0.4rem 0.65rem; border: 1px solid var(--color-border); border-radius: 999px; background: var(--color-background); }
  &__languages button[aria-pressed="true"],
  &__choices button[aria-pressed="true"] { border-color: var(--color-primary); color: var(--color-primary); font-weight: 700; }
  @media (max-width: 430px) { &__filters { grid-template-columns: 1fr; } }
}
</style>
