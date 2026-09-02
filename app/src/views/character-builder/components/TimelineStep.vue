<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import ListShell from '@/components/ui/ListShell.vue'
import OptionCard from '@/components/ui/OptionCard.vue'
import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import FeatChoicePanel from '@/views/character-builder/components/FeatChoicePanel.vue'
import { rulesRepository } from '@/rules/repository'
import { buildTimeline } from '@/rules/timeline'
import { getCheckpointCandidates } from '@/rules/spellcasting'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import { getClassFeatures2014 } from '@/rules/data/class-features-2014'
import type { CharacterDraft, ChoiceSelection } from '@/types/character'
import type { ChoiceCheckpoint, SpellRule, SubclassFeature } from '@/types/rules'
import { formatSpellLabel } from '@/utils/format-spell-label'

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

const checkpoints = computed(() => buildTimeline(props.classId, props.targetLevel, { subraceId: props.subraceId, subclassId: props.draft.subclassId, enabledSourceIds: props.draft.enabledSourceIds, selections: props.draft.selections }))

/** 当前已熟练的技能与盗贼工具：职业技能选择 + 背景技能。与 validate.ts 的专精校验口径一致。 */
const proficientSkillIds = computed(() => {
  const classSkillIds = checkpoints.value
    .filter((checkpoint) => checkpoint.kind === 'skills')
    .flatMap((checkpoint) => selectedIds(checkpoint.id))
  return new Set([...classSkillIds, ...props.backgroundSkillIds, 'tool-thieves-tools'])
})

const selectedSubclassId = computed(() => {
  const subclassCheckpoint = checkpoints.value.find((checkpoint) => checkpoint.kind === 'subclass')
  return subclassCheckpoint ? selectedIds(subclassCheckpoint.id)[0] : undefined
})
const subclassFeatures = computed(() => selectedSubclassId.value ? getSubclassFeatures2014(selectedSubclassId.value) : [])
/** 职业基础特性（只读展示）：只列自动获得项，需玩家选择的特性已在对应检查点提供选择入口。 */
const classFeatures = computed(() => getClassFeatures2014(props.classId).filter((feature) => !feature.requiresChoice))
const firstClassCheckpointId = computed(() => checkpoints.value.find((checkpoint) => checkpoint.kind !== 'subclass-feature')?.id)
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
  const group = checkpoint?.uniqueGroup
  if (!group) return false
  return checkpoints.value
    .filter((item) => item.id !== checkpointId && item.uniqueGroup === group)
    .some((item) => selectedIds(item.id).includes(optionId))
}

function isBackgroundSkill(checkpointId: string, optionId: string): boolean {
  return checkpoints.value.find((item) => item.id === checkpointId)?.kind === 'skills'
    && props.backgroundSkillIds.includes(optionId)
}

/** 专精只能选择已熟练的技能（职业或背景），未熟练技能应锁定并提示。 */
function isExpertiseLocked(checkpointId: string, optionId: string): boolean {
  const checkpoint = checkpoints.value.find((item) => item.id === checkpointId)
  if (checkpoint?.kind !== 'expertise') return false
  return !proficientSkillIds.value.has(optionId)
}

function toggle(checkpointId: string, optionId: string, max: number): void {
  const current = selectedIds(checkpointId)
  const alreadySelected = current.includes(optionId)
  if (
    !alreadySelected
    && (isUniqueOptionUsedElsewhere(checkpointId, optionId) || isBackgroundSkill(checkpointId, optionId) || isExpertiseLocked(checkpointId, optionId))
  ) return
  const next = alreadySelected
    ? current.filter((id) => id !== optionId)
    : max === 1
      ? [optionId]
      : [...current, optionId].slice(0, max)
  emit('select', checkpointId, next)
}

function saveSpecialSelection(checkpointId: string, optionId?: string): void {
  emit('select', checkpointId, optionId ? [optionId] : [])
}

/** 法术级候选（candidateKind）的搜索关键词：切换检查点时重置。 */
const spellCandidateSearch = ref('')
watch(currentCheckpointId, () => {
  spellCandidateSearch.value = ''
})

/** 当前检查点的候选选项：静态 optionIds 或动态候选池。 */
function checkpointCandidates(checkpoint: ChoiceCheckpoint): readonly string[] {
  return getCheckpointCandidates(props.draft, checkpoint)
}

/** 法术级候选按环级分组并应用搜索过滤（魔法奥秘、法术精通、招牌法术）。 */
function spellCandidateGroups(checkpoint: ChoiceCheckpoint): ReadonlyArray<{
  readonly level: number
  readonly spells: readonly NonNullable<ReturnType<typeof rulesRepository.getSpell>>[]
}> {
  if (!checkpoint.candidateKind) return []
  const query = spellCandidateSearch.value.trim().toLocaleLowerCase('zh-CN')
  const spells = checkpointCandidates(checkpoint)
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is NonNullable<typeof spell> => Boolean(spell))
    .filter((spell) => !query || spell.name.toLocaleLowerCase('zh-CN').includes(query))
  const byLevel = new Map<number, NonNullable<ReturnType<typeof rulesRepository.getSpell>>[]>()
  for (const spell of spells) {
    const list = byLevel.get(spell.level) ?? []
    list.push(spell)
    byLevel.set(spell.level, list)
  }
  return [...byLevel.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([level, items]) => ({ level, spells: items }))
}

function spellCandidateDescription(spell: SpellRule): string {
  return [formatSpellLabel(spell), spell.description].filter(Boolean).join(' · ')
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
        <ListShell
          v-else-if="checkpoint.optionIds.length"
        >
          <OptionCard
            v-for="optionId in checkpoint.optionIds"
            :key="optionId"
            :title="rulesRepository.getOption(optionId)?.name ?? featureOptionLabel(checkpoint.id, optionId) ?? optionId"
            :description="rulesRepository.getOption(optionId)?.description"
            :state="selectedIds(checkpoint.id).includes(optionId)
              ? 'selected'
              : isUniqueOptionUsedElsewhere(checkpoint.id, optionId) || isBackgroundSkill(checkpoint.id, optionId) || isExpertiseLocked(checkpoint.id, optionId)
                ? 'locked'
                : rulesRepository.getOption(optionId)?.status === 'index-only'
                  ? 'incompatible'
                  : 'default'"
            :disabled-reason="isUniqueOptionUsedElsewhere(checkpoint.id, optionId)
              ? checkpoint.kind === 'expertise' ? '已在较低等级获得专精' : '已在同一选项组的其他等级掌握'
              : isBackgroundSkill(checkpoint.id, optionId)
                ? '背景已提供此技能，请选择另一项职业技能'
                : isExpertiseLocked(checkpoint.id, optionId)
                  ? '需先获得该技能熟练（职业技能或背景）'
                  : ''"
            @select="toggle(checkpoint.id, optionId, checkpoint.maxSelections)"
          >
            <template #suffix>
              <UiBadge v-if="rulesRepository.getOption(optionId)?.status === 'index-only'" tone="warning">仅索引</UiBadge>
              <UiBadge v-else-if="rulesRepository.getOption(optionId)?.status === 'selectable'" tone="warning">可选择 · 部分效果需手动处理</UiBadge>
            </template>
          </OptionCard>
        </ListShell>
        <div v-else-if="checkpoint.candidateKind" class="timeline-step__spell-candidates">
          <label class="timeline-step__spell-search">
            <input v-model="spellCandidateSearch" type="search" placeholder="搜索法术名称" aria-label="搜索法术名称">
          </label>
          <section v-for="group in spellCandidateGroups(checkpoint)" :key="group.level" class="timeline-step__spell-group">
            <h4>{{ group.level }} 环</h4>
            <ListShell>
              <OptionCard
                v-for="spell in group.spells"
                :key="spell.id"
                :title="spell.name"
                :description="spellCandidateDescription(spell)"
                :state="selectedIds(checkpoint.id).includes(spell.id) ? 'selected' : 'default'"
                @select="toggle(checkpoint.id, spell.id, checkpoint.maxSelections)"
              >
                <template #suffix>
                  <UiBadge v-if="selectedIds(checkpoint.id).includes(spell.id)" tone="success">已选</UiBadge>
                </template>
              </OptionCard>
            </ListShell>
          </section>
          <p v-if="spellCandidateGroups(checkpoint).length === 0" class="timeline-step__spell-empty">没有匹配的法术{{ checkpoint.candidateKind.startsWith('spellbook') ? '（需先在法术步骤将法术写入法术书）' : '' }}。</p>
        </div>
        <div v-if="checkpoint.kind === 'subclass' && subclassFeatures.length" class="timeline-step__subclass-features">
          <h4>子职特性 · {{ rulesRepository.getSubclass(selectedSubclassId ?? '')?.name ?? '' }}</h4>
          <ExpandableOptionCard
            v-for="feature in subclassFeatures"
            :key="feature.id"
            :title="feature.name"
            :description="`${feature.level}级 · ${feature.englishName}`"
            expanded-label="特性详情"
          >
            <template #suffix>
              <UiBadge v-if="feature.status === 'index-only'" tone="warning">仅索引</UiBadge>
              <UiBadge v-else-if="feature.status === 'selectable'" tone="warning">可选择 · 情境效果</UiBadge>
            </template>
            <template #expanded>{{ feature.description }}</template>
          </ExpandableOptionCard>
        </div>
        <div v-if="checkpoint.id === firstClassCheckpointId && classFeatures.length" class="timeline-step__subclass-features">
          <h4>职业特性 · {{ rulesRepository.getClass(classId)?.name ?? '' }}</h4>
          <ExpandableOptionCard
            v-for="feature in classFeatures"
            :key="feature.id"
            :title="feature.name"
            :description="`${feature.level}级 · ${feature.englishName}`"
            expanded-label="特性详情"
          >
            <template #suffix>
              <UiBadge v-if="feature.status === 'index-only'" tone="warning">仅索引</UiBadge>
              <UiBadge v-else-if="feature.status === 'selectable'" tone="warning">可选择 · 情境效果</UiBadge>
            </template>
            <template #expanded>{{ feature.description }}</template>
          </ExpandableOptionCard>
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

  &__spell-candidates { display: grid; gap: 0.75rem; }
  &__spell-search input {
    width: 100%;
    min-height: 2.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    background: var(--color-surface);
    font-size: 0.82rem;
  }
  &__spell-group { display: grid; gap: 0.5rem; }
  &__spell-group h4 { margin: 0; font-size: 0.78rem; color: var(--color-text-muted); }
  &__spell-empty { margin: 0; padding: 0.6rem 0.75rem; border-radius: var(--radius-md); color: var(--color-text-muted); background: var(--color-surface-muted, #f4efe6); font-size: 0.75rem; line-height: 1.5; }

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
