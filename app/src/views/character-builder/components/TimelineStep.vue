<script setup lang="ts">
import { computed, ref } from 'vue'

import OptionCard from '@/components/ui/OptionCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import FeatChoicePanel from '@/views/character-builder/components/FeatChoicePanel.vue'
import { rulesRepository } from '@/rules/repository'
import { buildTimeline } from '@/rules/timeline'
import type { CharacterDraft, ChoiceSelection } from '@/types/character'

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

const checkpoints = computed(() => buildTimeline(props.classId, props.targetLevel, { subraceId: props.subraceId }))

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
          :title="rulesRepository.getOption(optionId)?.name ?? optionId"
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
}
</style>
