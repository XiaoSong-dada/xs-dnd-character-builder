<script setup lang="ts">
import { computed, ref } from 'vue'

import OptionCard from '@/components/ui/OptionCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { getBackgroundRecommendationReason, getRaceRecommendationReason } from '@/rules/recommend'
import { rulesRepository } from '@/rules/repository'

const props = defineProps<{
  classId?: string
  raceId?: string
  subraceId?: string
  backgroundId?: string
  backgroundVariantId?: string
  languages: readonly string[]
}>()
const raceSearch = ref('')
const backgroundSearch = ref('')
const classRule = computed(() => props.classId ? rulesRepository.getClass(props.classId) : undefined)
const baseRaces = computed(() => rulesRepository.races
  .filter((item) => !item.parentRaceId && `${item.name}${item.englishName}`.toLowerCase().includes(raceSearch.value.trim().toLowerCase()))
  .sort((a, b) => Number(b.recommendedClassIds.includes(props.classId ?? '')) - Number(a.recommendedClassIds.includes(props.classId ?? ''))))
const subraces = computed(() => props.raceId
  ? rulesRepository.races.filter((item) => item.parentRaceId === props.raceId)
  : [])
const baseBackgrounds = computed(() => rulesRepository.backgrounds
  .filter((item) => !item.parentBackgroundId && `${item.name}${item.englishName}`.toLowerCase().includes(backgroundSearch.value.trim().toLowerCase()))
  .sort((a, b) => Number(b.recommendedClassIds.includes(props.classId ?? '')) - Number(a.recommendedClassIds.includes(props.classId ?? ''))))
const variants = computed(() => props.backgroundId
  ? rulesRepository.backgrounds.filter((item) => item.parentBackgroundId === props.backgroundId)
  : [])
const languageChoiceCount = computed(() => props.backgroundId ? rulesRepository.getBackground(props.backgroundId)?.languageChoices ?? 0 : 0)
const languageOptions = ['矮人语', '精灵语', '巨人语', '侏儒语', '地精语', '半身人语', '兽人语', '龙语', '炼狱语', '天界语'] as const

function toggleLanguage(id: string): void {
  const next = props.languages.includes(id)
    ? props.languages.filter((item) => item !== id)
    : [...props.languages, id].slice(-languageChoiceCount.value)
  emit('languages', next)
}

const emit = defineEmits<{
  race: [id: string]
  subrace: [id: string | undefined]
  background: [id: string]
  variant: [id: string | undefined]
  languages: [ids: readonly string[]]
}>()
</script>

<template>
  <section class="origin-step">
    <header>
      <span>2014种族</span>
      <h2>选择种族</h2>
      <p>职业只提供推荐，所有种族均可自由选择。</p>
    </header>
    <label>
      <span>搜索种族</span>
      <input v-model="raceSearch" type="search" placeholder="中文或英文名称">
    </label>
    <OptionCard
      v-for="race in baseRaces"
      :key="race.id"
      :title="race.name"
      :description="[race.summary, getRaceRecommendationReason(race, classRule)].filter(Boolean).join(' · ')"
      :state="raceId === race.id ? 'selected' : race.recommendedClassIds.includes(classId ?? '') ? 'recommended' : 'default'"
      @select="$emit('race', race.id)"
    >
      <template #suffix><UiBadge v-if="race.recommendedClassIds.includes(classId ?? '')" tone="primary">推荐</UiBadge></template>
    </OptionCard>

    <div v-if="subraces.length" class="origin-step__branches">
      <strong>选择子种族</strong>
      <OptionCard
        v-for="subrace in subraces"
        :key="subrace.id"
        :title="subrace.name"
        :description="[subrace.summary, getRaceRecommendationReason(subrace, classRule)].filter(Boolean).join(' · ')"
        :state="subraceId === subrace.id ? 'selected' : subrace.recommendedClassIds.includes(classId ?? '') ? 'recommended' : 'default'"
        @select="$emit('subrace', subraceId === subrace.id ? undefined : subrace.id)"
      >
        <template #suffix>
          <UiBadge v-if="subrace.status === 'dm-only'" tone="warning">可选规则</UiBadge>
          <UiBadge v-else-if="subrace.recommendedClassIds.includes(classId ?? '')" tone="primary">推荐</UiBadge>
        </template>
      </OptionCard>
    </div>

    <header>
      <span>2014背景</span>
      <h2>选择背景</h2>
      <p>背景不提供属性加值；它提供技能、工具、语言和背景特性。</p>
    </header>
    <label>
      <span>搜索背景</span>
      <input v-model="backgroundSearch" type="search" placeholder="中文或英文名称">
    </label>
    <OptionCard
      v-for="background in baseBackgrounds"
      :key="background.id"
      :title="background.name"
      :description="[background.summary, background.featureName, getBackgroundRecommendationReason(background, classRule)].filter(Boolean).join(' · ')"
      :state="backgroundId === background.id ? 'selected' : background.recommendedClassIds.includes(classId ?? '') ? 'recommended' : 'default'"
      @select="$emit('background', background.id)"
    >
      <template #suffix><UiBadge v-if="background.recommendedClassIds.includes(classId ?? '')" tone="primary">推荐</UiBadge></template>
    </OptionCard>

    <div v-if="variants.length" class="origin-step__branches">
      <strong>正式背景变体（可选）</strong>
      <OptionCard
        v-for="variant in variants"
        :key="variant.id"
        :title="variant.name"
        :description="variant.summary"
        :state="backgroundVariantId === variant.id ? 'selected' : 'default'"
        @select="$emit('variant', backgroundVariantId === variant.id ? undefined : variant.id)"
      />
    </div>

    <div v-if="languageChoiceCount" class="origin-step__languages">
      <strong>背景允许选择{{ languageChoiceCount }}种额外语言</strong>
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

  label {
    display: grid;
    gap: 0.3rem;
    color: var(--color-text-muted);
    font-size: 0.75rem;

    input { min-height: 2.75rem; padding: 0.65rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); }
  }

  &__branches {
    display: grid;
    gap: 0.55rem;
    padding: 0.75rem;
    border-left: 0.2rem solid var(--color-gold);
    background: var(--color-gold-soft);

    > strong { font-size: 0.8rem; }
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
}
</style>
