<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import { getBackgroundRecommendationReason, getRaceRecommendationReason } from '@/rules/recommend'
import { getRulesRepository } from '@/rules/repositories'
import { getLanguageOptions, getRequiredLanguageCount } from '@/rules/languages'
import { isSourceEnabled } from '@/rules/source-books'
import { SKILL_IDS } from '@/rules/derive'
import type { AbilityKey, RulesetId } from '@/types/character'

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
  enabledSourceIds?: readonly string[]
  sizeChoice?: 'small' | 'medium'
  backgroundAbilities?: Readonly<Partial<Record<AbilityKey, number>>>
  /** 起源步骤未完成原因（与门禁同源，B09-07）。 */
  blockers?: readonly { readonly id: string; readonly message: string; readonly resolution: string }[]
}>(), { raceSkillChoices: () => [], ruleset: '5e-2014', blockers: () => [] })

const emit = defineEmits<{
  race: [id: string]
  subrace: [id: string | undefined]
  background: [id: string]
  variant: [id: string | undefined]
  languages: [ids: readonly string[]]
  raceSkills: [ids: readonly string[]]
  raceTool: [id: string | undefined]
  size: [size: 'small' | 'medium']
  backgroundAbilities: [allocation: Readonly<Partial<Record<AbilityKey, number>>>]
}>()

const repository = computed(() => getRulesRepository(props.ruleset))
const raceSearch = ref('')
const backgroundSearch = ref('')
const classRule = computed(() => props.classId ? repository.value.getClass(props.classId) : undefined)
const baseRaces = computed(() => repository.value.races
  .filter((item) => !item.parentRaceId && isSourceEnabled(item.sourceIds, props.enabledSourceIds, repository.value) && `${item.name}${item.englishName}`.toLowerCase().includes(raceSearch.value.trim().toLowerCase()))
  .sort((a, b) => Number(b.recommendedClassIds.includes(props.classId ?? '')) - Number(a.recommendedClassIds.includes(props.classId ?? ''))))
const subraces = computed(() => props.raceId
  ? repository.value.races.filter((item) => item.parentRaceId === props.raceId && isSourceEnabled(item.sourceIds, props.enabledSourceIds, repository.value))
  : [])
const baseBackgrounds = computed(() => repository.value.backgrounds
  .filter((item) => !item.parentBackgroundId && isSourceEnabled(item.sourceIds, props.enabledSourceIds, repository.value) && `${item.name}${item.englishName}`.toLowerCase().includes(backgroundSearch.value.trim().toLowerCase()))
  .sort((a, b) => Number(b.recommendedClassIds.includes(props.classId ?? '')) - Number(a.recommendedClassIds.includes(props.classId ?? ''))))
const variants = computed(() => props.backgroundId
  ? repository.value.backgrounds.filter((item) => item.parentBackgroundId === props.backgroundId && isSourceEnabled(item.sourceIds, props.enabledSourceIds, repository.value))
  : [])
const languageChoiceCount = computed(() => getRequiredLanguageCount({
  ruleset: props.ruleset,
  classId: props.classId,
  backgroundId: props.backgroundId,
  backgroundVariantId: props.backgroundVariantId,
}, repository.value))
const languageOptions = computed(() => getLanguageOptions(props.ruleset))

/** 当前物种（子种族优先）：提供熟练选择规格。 */
const currentRace = computed(() => props.subraceId
  ? repository.value.getRace(props.subraceId)
  : props.raceId
    ? repository.value.getRace(props.raceId)
    : undefined)
/** 沿父链查找熟练规格（子种族未登记时继承父物种，如山地矮人继承矮人工具熟练）。 */
function findProficiencySpec(key: 'skillProficiencyChoices' | 'toolProficiencyChoices'): { readonly count: number; readonly optionIds?: readonly string[] } | undefined {
  const visited = new Set<string>()
  const visit = (raceId: string | undefined): { readonly count: number; readonly optionIds?: readonly string[] } | undefined => {
    if (!raceId || visited.has(raceId)) return undefined
    visited.add(raceId)
    const race = repository.value.getRace(raceId)
    if (!race) return undefined
    const own = race[key]
    if (own !== undefined) return own
    return visit(race.parentRaceId)
  }
  return visit(currentRace.value?.id)
}
const raceSkillSpec = computed(() => findProficiencySpec('skillProficiencyChoices'))
const raceToolSpec = computed(() => findProficiencySpec('toolProficiencyChoices'))
const isGithyanki = computed(() => currentRace.value?.id === 'race-2014-gith-githyanki')
const raceSkillOptions = computed(() => {
  const spec = raceSkillSpec.value
  if (!spec) return []
  return (spec.optionIds ?? SKILL_IDS)
    .map((id) => ({ id, name: repository.value.getOption(id)?.name ?? id }))
})
const raceToolOptions = computed(() => repository.value.options
  .filter((option) => option.id.startsWith('tool-'))
  .map((option) => ({ id: option.id, name: option.name })))

/** 沿父链查找物种可选体型（2024 阿斯莫、人类、提夫林）。 */
const speciesSizeChoices = computed(() => {
  const visited = new Set<string>()
  const visit = (raceId: string | undefined): readonly ('small' | 'medium')[] | undefined => {
    if (!raceId || visited.has(raceId)) return undefined
    visited.add(raceId)
    const race = repository.value.getRace(raceId)
    if (!race) return undefined
    if (race.sizeChoices?.length) return race.sizeChoices
    return visit(race.parentRaceId)
  }
  return visit(currentRace.value?.id)
})

function sizeLabel(size: 'small' | 'medium'): string {
  return size === 'small' ? '小型' : '中型'
}

/** 2024 背景属性分配（+2/+1 或三项各 +1）。 */
const backgroundRule = computed(() => props.backgroundId ? repository.value.getBackground(props.backgroundId) : undefined)
const abilityCandidates = computed(() => backgroundRule.value?.abilityChoices ?? [])
const abilityLabels: Readonly<Record<AbilityKey, string>> = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' }
const allocationMode = ref<'split' | 'even'>('split')
const allocation = ref<Partial<Record<AbilityKey, number>>>({ ...(props.backgroundAbilities ?? {}) })
watch(() => props.backgroundAbilities, (value: Readonly<Partial<Record<AbilityKey, number>>> | undefined) => {
  allocation.value = { ...(value ?? {}) }
})

function setAllocationMode(mode: 'split' | 'even'): void {
  if (allocationMode.value === mode) return
  allocationMode.value = mode
  allocation.value = {}
  emit('backgroundAbilities', allocation.value)
}

function toggleBackgroundAbility(key: AbilityKey): void {
  if (!abilityCandidates.value.includes(key)) return
  const next: Partial<Record<AbilityKey, number>> = { ...allocation.value }
  const current = next[key] ?? 0
  if (allocationMode.value === 'even') {
    if (current > 0) delete next[key]
    else if (Object.keys(next).length < 3) next[key] = 1
  } else if (current > 0) {
    delete next[key]
  } else if (!Object.values(next).includes(2)) {
    next[key] = 2
  } else if (!Object.values(next).includes(1)) {
    next[key] = 1
  }
  allocation.value = next
  emit('backgroundAbilities', next)
}

function toggleRaceSkill(id: string): void {
  const spec = raceSkillSpec.value
  if (!spec) return
  const current = props.raceSkillChoices
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id].slice(0, spec.count)
  emit('raceSkills', next)
  // 吉斯洋基：选技能时清空工具侧（二选一）。
  if (isGithyanki.value && next.length > 0) emit('raceTool', undefined)
}

function toggleRaceTool(id: string): void {
  const next = props.raceToolChoice === id ? undefined : id
  emit('raceTool', next)
  // 吉斯洋基：选工具时清空技能侧（二选一）。
  if (isGithyanki.value && next) emit('raceSkills', [])
}

function toggleLanguage(id: string): void {
  const next = props.languages.includes(id)
    ? props.languages.filter((item) => item !== id)
    : [...props.languages, id].slice(-languageChoiceCount.value)
  emit('languages', next)
}
</script>

<template>
  <section class="origin-step">
    <header>
      <span>{{ ruleset === '5e-2024' ? '2024物种' : '2014种族' }}</span>
      <h2>{{ ruleset === '5e-2024' ? '选择物种' : '选择种族' }}</h2>
      <p>{{ ruleset === '5e-2024' ? '物种不提供属性加值；属性提升来自背景。职业只提供推荐。' : '职业只提供推荐，所有种族均可自由选择。' }}</p>
    </header>
    <ListShell
      searchable
      search-label="搜索种族"
      search-placeholder="中文或英文名称"
      :query="raceSearch"
      @update:query="raceSearch = $event"
    >
      <ExpandableOptionCard
        v-for="race in baseRaces"
        :key="race.id"
        :title="race.name"
        :description="[race.summary, getRaceRecommendationReason(race, classRule)].filter(Boolean).join(' · ')"
        expanded-label="种族介绍"
        :state="raceId === race.id ? 'selected' : 'default'"
        @select="$emit('race', race.id)"
      >
        <template #suffix>
          <UiBadge v-if="race.status === 'dm-only'" tone="warning">可选规则</UiBadge>
          <UiBadge v-else-if="race.recommendedClassIds.includes(classId ?? '')" tone="primary">推荐</UiBadge>
        </template>
        <template #expanded>{{ race.description }}</template>
      </ExpandableOptionCard>
    </ListShell>

    <div v-if="subraces.length" class="origin-step__branches">
      <strong>{{ ruleset === '5e-2024' ? '选择血统／传承' : '选择子种族' }}</strong>
      <ExpandableOptionCard
        v-for="subrace in subraces"
        :key="subrace.id"
        :title="subrace.name"
        :description="[subrace.summary, getRaceRecommendationReason(subrace, classRule)].filter(Boolean).join(' · ')"
        expanded-label="种族介绍"
        :state="subraceId === subrace.id ? 'selected' : 'default'"
        @select="$emit('subrace', subraceId === subrace.id ? undefined : subrace.id)"
      >
        <template #suffix>
          <UiBadge v-if="subrace.status === 'dm-only'" tone="warning">可选规则</UiBadge>
          <UiBadge v-else-if="subrace.recommendedClassIds.includes(classId ?? '')" tone="primary">推荐</UiBadge>
        </template>
        <template #expanded>{{ subrace.description }}</template>
      </ExpandableOptionCard>
    </div>

    <div v-if="speciesSizeChoices?.length" class="origin-step__branches">
      <strong>选择体型</strong>
      <div class="origin-step__choices">
        <button
          v-for="size in speciesSizeChoices"
          :key="size"
          type="button"
          :aria-pressed="sizeChoice === size"
          @click="$emit('size', size)"
        >
          {{ sizeChoice === size ? '✓ ' : '' }}{{ sizeLabel(size) }}
        </button>
      </div>
    </div>

    <div v-if="raceSkillSpec || raceToolSpec" class="origin-step__race-choices">
      <strong>{{ currentRace?.name }}熟练选择</strong>
      <template v-if="raceSkillSpec">
        <p>{{ isGithyanki ? '选择一项技能熟练' : `选择${raceSkillSpec.count}项技能熟练` }}</p>
        <div class="origin-step__choices">
          <button
            v-for="option in raceSkillOptions"
            :key="option.id"
            type="button"
            :aria-pressed="raceSkillChoices.includes(option.id)"
            @click="toggleRaceSkill(option.id)"
          >
            {{ raceSkillChoices.includes(option.id) ? '✓ ' : '' }}{{ option.name }}
          </button>
        </div>
      </template>
      <template v-if="raceToolSpec">
        <p>{{ isGithyanki ? '或选择一项工具熟练（与技能二选一）' : '选择一项工具熟练' }}</p>
        <div class="origin-step__choices">
          <button
            v-for="option in raceToolOptions"
            :key="option.id"
            type="button"
            :aria-pressed="raceToolChoice === option.id"
            @click="toggleRaceTool(option.id)"
          >
            {{ raceToolChoice === option.id ? '✓ ' : '' }}{{ option.name }}
          </button>
        </div>
      </template>
    </div>

    <header>
      <span>{{ ruleset === '5e-2024' ? '2024背景' : '2014背景' }}</span>
      <h2>选择背景</h2>
      <p>{{ ruleset === '5e-2024' ? '背景提供属性加值、起源专长、技能、工具与初始装备。' : '背景不提供属性加值；它提供技能、工具、语言和背景特性。' }}</p>
    </header>
    <ListShell
      searchable
      search-label="搜索背景"
      search-placeholder="中文或英文名称"
      :query="backgroundSearch"
      @update:query="backgroundSearch = $event"
    >
      <ExpandableOptionCard
        v-for="background in baseBackgrounds"
        :key="background.id"
        :title="background.name"
        :description="[background.summary, background.featureName, getBackgroundRecommendationReason(background, classRule)].filter(Boolean).join(' · ')"
        expanded-label="背景介绍"
        :state="backgroundId === background.id ? 'selected' : 'default'"
        @select="$emit('background', background.id)"
      >
        <template #suffix><UiBadge v-if="background.recommendedClassIds.includes(classId ?? '')" tone="primary">推荐</UiBadge></template>
        <template #expanded>{{ background.description }}</template>
      </ExpandableOptionCard>
    </ListShell>

    <div v-if="variants.length" class="origin-step__branches">
      <strong>正式背景变体（可选）</strong>
      <ExpandableOptionCard
        v-for="variant in variants"
        :key="variant.id"
        :title="variant.name"
        :description="variant.summary"
        expanded-label="变体介绍"
        :state="backgroundVariantId === variant.id ? 'selected' : 'default'"
        @select="$emit('variant', backgroundVariantId === variant.id ? undefined : variant.id)"
      >
        <template #expanded>{{ variant.description }}</template>
      </ExpandableOptionCard>
    </div>

    <div v-if="abilityCandidates.length" class="origin-step__branches">
      <strong>背景属性加值</strong>
      <div class="origin-step__choices">
        <button
          type="button"
          :aria-pressed="allocationMode === 'split'"
          @click="setAllocationMode('split')"
        >
          一项 +2、另一项 +1
        </button>
        <button
          type="button"
          :aria-pressed="allocationMode === 'even'"
          @click="setAllocationMode('even')"
        >
          三项各 +1
        </button>
      </div>
      <div class="origin-step__choices">
        <button
          v-for="key in abilityCandidates"
          :key="key"
          type="button"
          :aria-pressed="(allocation[key] ?? 0) > 0"
          @click="toggleBackgroundAbility(key)"
        >
          {{ abilityLabels[key] }}{{ allocation[key] ? ` +${allocation[key]}` : '' }}
        </button>
      </div>
      <p v-if="backgroundRule?.toolChoices" class="origin-step__hint">
        该背景还需选择 1 项工具；具体工具由装备库接入后提供（B07）。
      </p>
    </div>

    <div v-if="languageChoiceCount" class="origin-step__languages">
      <strong>{{ ruleset === '5e-2024' ? `从标准表选择${languageChoiceCount}种语言（通用语已掌握）` : `背景允许选择${languageChoiceCount}种额外语言` }}</strong>
      <button
        v-for="language in languageOptions"
        :key="language"
        type="button"
        :aria-pressed="languages.includes(language)"
        @click="toggleLanguage(language)"
      >
        {{ languages.includes(language) ? '✓ ' : '' }}{{ language }}
      </button>
    </div>
    <UiNotice
      v-if="blockers.length"
      class="origin-step__blockers"
      tone="warning"
      :title="`还差 ${blockers.length} 项才能继续`"
    >
      <ul>
        <li v-for="blocker in blockers" :key="blocker.id">
          {{ blocker.message }}<small>{{ blocker.resolution }}</small>
        </li>
      </ul>
    </UiNotice>
  </section>
</template>

<style scoped lang="scss">
.origin-step {
  display: grid;
  gap: 0.75rem;

  header {
    margin-top: 0.75rem;

    span { color: var(--color-primary); font-size: 0.7rem; font-weight: 700; }
    h2 { margin: 0.2rem 0; font-size: 1.05rem; }
    p { margin: 0; color: var(--color-text-muted); font-size: 0.8rem; line-height: 1.55; }
  }

  &__branches {
    display: grid;
    gap: 0.55rem;
    padding: 0.75rem;
    border-left: 0.2rem solid var(--color-gold);
    background: var(--color-gold-soft);

    > strong { font-size: 0.8rem; }
  }

  &__blockers {
    margin-top: 0.5rem;

    ul { margin: 0; padding-left: 1.1rem; display: grid; gap: 0.35rem; }
    li { line-height: 1.5; }
    small { display: block; color: var(--color-text-muted); }
  }

  &__languages {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);

    strong { width: 100%; font-size: 0.8rem; }
    button { min-height: 2.75rem; padding: 0.4rem 0.65rem; border: 1px solid var(--color-border); border-radius: 999px; background: var(--color-background); }
    button[aria-pressed="true"] { border-color: var(--color-primary); color: var(--color-primary); font-weight: 700; }
  }

  &__race-choices {
    display: grid;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);

    > strong { font-size: 0.8rem; }
    > p { margin: 0; color: var(--color-text-muted); font-size: 0.75rem; }
  }

  &__choices {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;

    button { min-height: 2.75rem; padding: 0.4rem 0.65rem; border: 1px solid var(--color-border); border-radius: 999px; background: var(--color-background); }
    button[aria-pressed="true"] { border-color: var(--color-primary); color: var(--color-primary); font-weight: 700; }
  }
}
</style>
