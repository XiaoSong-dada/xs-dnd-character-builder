<script setup lang="ts">
import { computed } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import UiScrollModal from '@/components/ui/UiScrollModal.vue'
import { buildManualFeatChoiceCheckpoints, getCheckpointSelectionBounds } from '@/rules/feats'
import { getRulesRepository } from '@/rules/repositories'
import { getCheckpointCandidates } from '@/rules/spellcasting'
import type { CharacterDraft, ManualFeatGrant } from '@/types/character'
import type { ChoiceCheckpoint } from '@/types/rules'
import { formatSpellLabel } from '@/utils/format-spell-label'

const props = defineProps<{ open: boolean; draft: CharacterDraft; grant?: ManualFeatGrant }>()
const emit = defineEmits<{ close: []; select: [checkpointId: string, optionIds: readonly string[]] }>()
const repository = computed(() => getRulesRepository(props.draft.ruleset))
const feat = computed(() => props.grant ? repository.value.getFeat(props.grant.featId) : undefined)
const checkpoints = computed(() => props.grant
  ? buildManualFeatChoiceCheckpoints([props.grant], repository.value, props.draft.targetLevel)
  : [])

function selectedIds(checkpointId: string): readonly string[] {
  return props.draft.selections.find((selection) => selection.checkpointId === checkpointId && !selection.invalidatedAt)?.optionIds ?? []
}
function candidates(checkpoint: ChoiceCheckpoint): readonly string[] {
  return getCheckpointCandidates(props.draft, checkpoint)
}
function optionTitle(optionId: string): string {
  return repository.value.getOption(optionId)?.name
    ?? repository.value.getSpell(optionId)?.name
    ?? repository.value.getFeat(optionId)?.name
    ?? optionId
}
function optionDescription(optionId: string): string {
  const spell = repository.value.getSpell(optionId)
  return repository.value.getOption(optionId)?.description
    ?? (spell ? `${formatSpellLabel(spell)} · ${spell.description}` : undefined)
    ?? repository.value.getFeat(optionId)?.description
    ?? ''
}
function isUsedInUniqueGroup(checkpoint: ChoiceCheckpoint, optionId: string): boolean {
  if (!checkpoint.uniqueGroup) return false
  return checkpoints.value.some((other) => other.id !== checkpoint.id
    && other.uniqueGroup === checkpoint.uniqueGroup
    && selectedIds(other.id).includes(optionId))
}
function toggle(checkpoint: ChoiceCheckpoint, optionId: string): void {
  const current = selectedIds(checkpoint.id)
  if (!current.includes(optionId) && isUsedInUniqueGroup(checkpoint, optionId)) return
  const bounds = getCheckpointSelectionBounds(props.draft, checkpoint)
  const next = current.includes(optionId)
    ? current.filter((id) => id !== optionId)
    : bounds.max === 1 ? [optionId] : [...current, optionId].slice(0, bounds.max)
  emit('select', checkpoint.id, next)
}
const incompleteCount = computed(() => checkpoints.value.filter((checkpoint) => {
  const count = selectedIds(checkpoint.id).length
  const bounds = getCheckpointSelectionBounds(props.draft, checkpoint)
  return count < bounds.min || count > bounds.max
}).length)
</script>

<template>
  <UiScrollModal :open="open" :title="feat ? `配置专长 · ${feat.name}` : '配置专长'" @close="$emit('close')">
    <div v-if="feat" class="manual-feat-config">
      <UiNotice v-if="incompleteCount" tone="warning" title="配置尚未完成">还有 {{ incompleteCount }} 项必选内容；可以稍后从能力页继续配置。</UiNotice>
      <UiNotice v-else tone="success" title="配置完成">结构化选择已生效并与此手动实例绑定。</UiNotice>
      <p class="manual-feat-config__intro">{{ feat.detail }}</p>
      <section v-for="checkpoint in checkpoints" :key="checkpoint.id" class="manual-feat-config__choice">
        <header><h3>{{ checkpoint.title }}</h3><UiBadge :tone="selectedIds(checkpoint.id).length >= getCheckpointSelectionBounds(draft, checkpoint).min ? 'success' : 'warning'">{{ selectedIds(checkpoint.id).length }}/{{ getCheckpointSelectionBounds(draft, checkpoint).max }}</UiBadge></header>
        <p>{{ checkpoint.description }}</p>
        <ListShell :empty="candidates(checkpoint).length === 0" empty-text="请先完成上方依赖选择，或当前没有合法候选。">
          <ExpandableOptionCard
            v-for="optionId in candidates(checkpoint)"
            :key="optionId"
            :title="optionTitle(optionId)"
            :description="optionDescription(optionId)"
            :state="selectedIds(checkpoint.id).includes(optionId) ? 'selected' : isUsedInUniqueGroup(checkpoint, optionId) ? 'locked' : 'default'"
            :disabled-reason="isUsedInUniqueGroup(checkpoint, optionId) ? '同一组中已选择该项' : ''"
            expanded-label="详情"
            @select="toggle(checkpoint, optionId)"
          ><template #expanded>{{ optionDescription(optionId) }}</template></ExpandableOptionCard>
        </ListShell>
      </section>
      <p v-if="!checkpoints.length" class="manual-feat-config__empty">该专长没有需要配置的结构化子选择。</p>
    </div>
    <template #footer><BaseButton class="manual-feat-config__done" @click="$emit('close')">{{ incompleteCount ? '保存，稍后继续' : '完成' }}</BaseButton></template>
  </UiScrollModal>
</template>

<style scoped lang="scss">
.manual-feat-config { display: grid; gap: 1rem; }
.manual-feat-config__intro, .manual-feat-config__choice > p, .manual-feat-config__empty { margin: 0; color: var(--color-text-muted); line-height: 1.6; }
.manual-feat-config__choice { display: grid; gap: 0.65rem; }
.manual-feat-config__choice header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.manual-feat-config__choice h3 { margin: 0; font-size: 0.95rem; }
.manual-feat-config__done { width: 100%; }
</style>
