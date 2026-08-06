<script setup lang="ts">
import { computed, ref } from 'vue'

import OptionCard from '@/components/ui/OptionCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import FeatChoicePanel from '@/views/character-builder/components/FeatChoicePanel.vue'
import { rulesRepository } from '@/rules/repository'
import { buildTimeline } from '@/rules/timeline'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import type { CharacterDraft, ChoiceSelection } from '@/types/character'
import type { SubclassFeature } from '@/types/rules'

const props = defineProps<{
  classId: string
  targetLevel: number
  subraceId?: string
  backgroundSkillIds: readonly string[]
  selections: readonly ChoiceSelection[]
  draft: CharacterDraft
}>()
const emit = defineEmits<{ select: [checkpointId: string, optionIds: readonly string[]] }>()
const expandedCheckpointId = ref<string>()

const checkpoints = computed(() => buildTimeline(props.classId, props.targetLevel, { subraceId: props.subraceId, subclassId: props.draft.subclassId }))

const selectedSubclassId = computed(() => {
  const subclassCheckpoint = checkpoints.value.find((checkpoint) => checkpoint.kind === 'subclass')
  return subclassCheckpoint ? selectedIds(subclassCheckpoint.id)[0] : undefined
})
const subclassFeatures = computed(() => selectedSubclassId.value ? getSubclassFeatures2014(selectedSubclassId.value) : [])
const featureByCheckpointId = computed(() => {
  const map = new Map<string, SubclassFeature>()
  for (const checkpoint of checkpoints.value) {
    if (checkpoint.kind !== 'subclass-feature') continue
    const feature = subclassFeatures.value.find((item) => `subclass-feature-${item.id}` === checkpoint.id)
    if (feature) map.set(checkpoint.id, feature)
  }
  return map
})
function featureOptionLabel(checkpointId: string, optionId: string): string | undefined {
  return featureByCheckpointId.value.get(checkpointId)?.optionLabels?.[optionId]
}

function selectedIds(checkpointId: string): readonly string[] {
  return props.selections.find((item) => item.checkpointId === checkpointId && !item.invalidatedAt)?.optionIds ?? []
}

function isComplete(checkpointId: string, minSelections: number): boolean {
  return selectedIds(checkpointId).length >= minSelections
}

const currentCheckpointId = computed(() => (
  expandedCheckpointId.value
  ?? checkpoints.value.find((checkpoint) => !isComplete(checkpoint.id, checkpoint.minSelections))?.id
  ?? checkpoints.value[checkpoints.value.length - 1]?.id
))

function toggleCheckpoint(checkpointId: string): void {
  expandedCheckpointId.value = currentCheckpointId.value === checkpointId ? undefined : checkpointId
}

function isUniqueOptionUsedElsewhere(checkpointId: string, optionId: string): boolean {
  const checkpoint = checkpoints.value.find((item) => item.id === checkpointId)
  if (checkpoint?.kind !== 'maneuvers' && checkpoint?.kind !== 'expertise') return false
  return checkpoints.value
    .filter((item) => item.kind === checkpoint.kind && item.id !== checkpointId)
    .some((item) => selectedIds(item.id).includes(optionId))
}

function isBackgroundSkill(checkpointId: string, optionId: string): boolean {
  return checkpoints.value.find((item) => item.id === checkpointId)?.kind === 'skills'
    && props.backgroundSkillIds.includes(optionId)
}

function toggle(checkpointId: string, optionId: string, max: number): void {
  if (isUniqueOptionUsedElsewhere(checkpointId, optionId) || isBackgroundSkill(checkpointId, optionId)) return
  const current = selectedIds(checkpointId)
  const next = current.includes(optionId)
    ? current.filter((id) => id !== optionId)
    : max === 1
      ? [optionId]
      : [...current, optionId].slice(0, max)
  emit('select', checkpointId, next)
}

function saveSpecialSelection(checkpointId: string, optionId?: string): void {
  emit('select', checkpointId, optionId ? [optionId] : [])
}
</script>

<template>
  <section class="timeline-step">
    <article
      v-for="checkpoint in checkpoints"
      :key="checkpoint.id"
      :class="{ 'timeline-step__checkpoint--current': currentCheckpointId === checkpoint.id }"
    >
      <button
        class="timeline-step__header"
        type="button"
        :aria-expanded="currentCheckpointId === checkpoint.id"
        @click="toggleCheckpoint(checkpoint.id)"
      >
        <span>{{ checkpoint.level }}级</span>
        <div><strong>{{ checkpoint.title }}</strong><small>{{ checkpoint.description }}</small></div>
        <UiBadge :tone="selectedIds(checkpoint.id).length >= checkpoint.minSelections ? 'success' : 'warning'">
          {{ selectedIds(checkpoint.id).length }}/{{ checkpoint.maxSelections }}
        </UiBadge>
      </button>
      <div v-if="currentCheckpointId === checkpoint.id" class="timeline-step__options">
        <FeatChoicePanel
          v-if="checkpoint.kind === 'ability-improvement' || checkpoint.id === 'race-2014-human-variant-feat-1'"
          :checkpoint-id="checkpoint.id"
          :checkpoint-level="checkpoint.level"
          :draft="draft"
          :selected-option-id="selectedIds(checkpoint.id)[0]"
          :allow-ability-improvement="checkpoint.kind === 'ability-improvement'"
          @select="saveSpecialSelection(checkpoint.id, $event)"
        />
        <OptionCard
          v-for="optionId in checkpoint.kind === 'ability-improvement' || checkpoint.id === 'race-2014-human-variant-feat-1' ? [] : checkpoint.optionIds"
          :key="optionId"
          :title="rulesRepository.getOption(optionId)?.name ?? featureOptionLabel(checkpoint.id, optionId) ?? optionId"
          :description="rulesRepository.getOption(optionId)?.description"
          :state="selectedIds(checkpoint.id).includes(optionId)
            ? 'selected'
            : isUniqueOptionUsedElsewhere(checkpoint.id, optionId) || isBackgroundSkill(checkpoint.id, optionId)
              ? 'locked'
              : rulesRepository.getOption(optionId)?.status === 'index-only'
                ? 'incompatible'
                : 'default'"
          :disabled-reason="isUniqueOptionUsedElsewhere(checkpoint.id, optionId)
            ? checkpoint.kind === 'expertise' ? '已在较低等级获得专精' : '已在较低等级掌握'
            : isBackgroundSkill(checkpoint.id, optionId)
              ? '背景已提供此技能，请选择另一项职业技能'
              : ''"
          @select="toggle(checkpoint.id, optionId, checkpoint.maxSelections)"
        >
          <template #suffix>
            <UiBadge v-if="rulesRepository.getOption(optionId)?.status === 'index-only'" tone="warning">仅索引</UiBadge>
          </template>
        </OptionCard>
        <div v-if="checkpoint.kind === 'subclass' && subclassFeatures.length" class="timeline-step__subclass-features">
          <h4>子职特性 · {{ rulesRepository.getSubclass(selectedSubclassId ?? '')?.name ?? '' }}</h4>
          <div v-for="feature in subclassFeatures" :key="feature.id" class="timeline-step__feature">
            <span class="timeline-step__feature-level">{{ feature.level }}级</span>
            <div>
              <strong>{{ feature.name }} <small>{{ feature.englishName }}</small></strong>
              <p>{{ feature.summary }}</p>
              <small v-if="feature.status === 'index-only'" class="timeline-step__feature-note">仅索引 · 具体效果未核验，不参与自动计算</small>
            </div>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped lang="scss">
.timeline-step {
  display: grid;
  gap: 0.75rem;

  article { padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); }

  &__checkpoint--current { border-color: var(--color-primary) !important; box-shadow: var(--shadow-sm); }

  &__header {
    display: flex;
    width: 100%;
    min-height: 44px;
    align-items: center;
    gap: 0.65rem;
    padding: 0;
    border: 0;
    color: inherit;
    text-align: left;
    background: transparent;
    cursor: pointer;

    > span { display: grid; width: 2.25rem; height: 2.25rem; flex: none; place-items: center; border-radius: 50%; color: white; background: var(--color-primary); font-size: 0.72rem; font-weight: 700; }
    > div { display: grid; min-width: 0; flex: 1; }
    strong { font-size: 0.82rem; }
    small { color: var(--color-text-muted); line-height: 1.45; }
  }

  &__options { display: grid; gap: 0.5rem; margin-top: 0.75rem; }

  &__subclass-features { display: grid; gap: 0.5rem; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--color-border); }
  &__subclass-features h4 { margin: 0; font-size: 0.78rem; color: var(--color-text-muted); }

  &__feature { display: flex; gap: 0.6rem; padding: 0.5rem; border-radius: var(--radius-sm); background: var(--color-surface-alt, rgba(0, 0, 0, 0.03)); }
  &__feature-level { display: grid; width: 2rem; height: 2rem; flex: none; place-items: center; border-radius: 50%; color: white; background: var(--color-primary); font-size: 0.68rem; font-weight: 700; }
  &__feature > div { display: grid; gap: 0.2rem; min-width: 0; }
  &__feature strong { font-size: 0.8rem; }
  &__feature strong small { color: var(--color-text-muted); font-weight: 400; }
  &__feature p { margin: 0; color: var(--color-text-muted); font-size: 0.72rem; line-height: 1.45; }
  &__feature-note { color: var(--color-warning, #b58900); font-size: 0.68rem; }
}
</style>
