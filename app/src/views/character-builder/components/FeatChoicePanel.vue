<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import OptionCard from '@/components/ui/OptionCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiChip from '@/components/ui/UiChip.vue'
import { ABILITY_KEYS, ABILITY_LABELS } from '@/rules/data/feats-2014'
import { deriveAbilities } from '@/rules/derive'
import {
  decodeAbilityImprovement,
  encodeAbilityImprovement,
  getAbilityImprovementEligibility,
  getFeatEligibility,
  type AbilityImprovementMode,
} from '@/rules/feats'
import { rulesRepository } from '@/rules/repository'
import type { AbilityKey, CharacterDraft } from '@/types/character'

const props = defineProps<{
  checkpointId: string
  checkpointLevel: number
  draft: CharacterDraft
  selectedOptionId?: string
  allowAbilityImprovement: boolean
}>()

const emit = defineEmits<{ select: [optionId?: string] }>()
const selectedImprovement = computed(() => props.selectedOptionId
  ? decodeAbilityImprovement(props.selectedOptionId)
  : undefined)
const choiceKind = ref<'ability' | 'feat'>(
  props.allowAbilityImprovement ? 'ability' : 'feat',
)
const improvementMode = ref<AbilityImprovementMode>(selectedImprovement.value?.mode ?? 'single')
const draftAbilities = ref<AbilityKey[]>([...(selectedImprovement.value?.abilities ?? [])])
const search = ref('')
const tagFilter = ref('all')
const availableOnly = ref(false)
const tagFilters = ['all', '战斗', '施法', '属性', '探索', '支援'] as const

const abilitiesBeforeCheckpoint = computed(() => deriveAbilities(props.draft, props.checkpointId))
const classRule = computed(() => rulesRepository.getClass(props.draft.classId ?? ''))
const canCastSpells = computed(() => Boolean(
  classRule.value?.spellcasting
  && props.checkpointLevel >= classRule.value.spellcasting.startsAtLevel,
))
const featEntries = computed(() => rulesRepository.feats.map((feat) => ({
  feat,
  eligibility: getFeatEligibility(feat, {
    abilities: abilitiesBeforeCheckpoint.value,
    classId: props.draft.classId ?? '',
    canCastSpells: canCastSpells.value,
  }),
})))
const visibleFeats = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('zh-CN')
  return featEntries.value.filter(({ feat, eligibility }) => {
    if (availableOnly.value && !eligibility.available) return false
    if (tagFilter.value !== 'all' && !feat.tags.includes(tagFilter.value)) return false
    if (!query) return true
    return [feat.name, feat.englishName, feat.description, ...feat.tags]
      .join(' ')
      .toLocaleLowerCase('zh-CN')
      .includes(query)
  })
})
const allocatedPoints = computed(() => improvementMode.value === 'single'
  ? draftAbilities.value.length * 2
  : draftAbilities.value.length)

watch(() => props.selectedOptionId, (optionId) => {
  const improvement = optionId ? decodeAbilityImprovement(optionId) : undefined
  if (improvement) {
    choiceKind.value = 'ability'
    improvementMode.value = improvement.mode
    draftAbilities.value = [...improvement.abilities]
  } else if (optionId) {
    choiceKind.value = 'feat'
  }
})

function setChoiceKind(kind: 'ability' | 'feat'): void {
  if (choiceKind.value === kind) return
  choiceKind.value = kind
  emit('select')
}

function setImprovementMode(mode: AbilityImprovementMode): void {
  improvementMode.value = mode
  draftAbilities.value = []
  emit('select')
}

function abilityDisabled(ability: AbilityKey): boolean {
  const amount = improvementMode.value === 'single' ? 2 : 1
  return abilitiesBeforeCheckpoint.value[ability] + amount > 20
}

function toggleAbility(ability: AbilityKey): void {
  if (abilityDisabled(ability)) return
  if (improvementMode.value === 'single') {
    draftAbilities.value = [ability]
  } else if (draftAbilities.value.includes(ability)) {
    draftAbilities.value = draftAbilities.value.filter((item) => item !== ability)
  } else {
    draftAbilities.value = draftAbilities.value.length < 2
      ? [...draftAbilities.value, ability]
      : [draftAbilities.value[1] as AbilityKey, ability]
  }
  const optionId = encodeAbilityImprovement({
    mode: improvementMode.value,
    abilities: draftAbilities.value,
  })
  if (!optionId || !getAbilityImprovementEligibility(abilitiesBeforeCheckpoint.value, optionId).available) {
    emit('select')
    return
  }
  emit('select', optionId)
}

function selectFeat(featId: string, available: boolean): void {
  if (available) emit('select', featId)
}
</script>

<template>
  <div class="feat-choice">
    <div v-if="allowAbilityImprovement" class="feat-choice__kind" role="tablist" aria-label="选择属性提升或专长">
      <button :class="{ 'feat-choice__kind-button--active': choiceKind === 'ability' }" type="button" role="tab" @click="setChoiceKind('ability')">
        属性提升
      </button>
      <button :class="{ 'feat-choice__kind-button--active': choiceKind === 'feat' }" type="button" role="tab" @click="setChoiceKind('feat')">
        专长
      </button>
    </div>

    <template v-if="choiceKind === 'ability' && allowAbilityImprovement">
      <p class="feat-choice__help">任意一项属性 +2，或任意两项不同属性各 +1；最终值不能超过20。</p>
      <div class="feat-choice__modes" role="radiogroup" aria-label="属性提升方式">
        <button :class="{ 'feat-choice__mode--active': improvementMode === 'single' }" type="button" @click="setImprovementMode('single')">
          任意一项 +2
        </button>
        <button :class="{ 'feat-choice__mode--active': improvementMode === 'split' }" type="button" @click="setImprovementMode('split')">
          任意两项 +1
        </button>
      </div>
      <div class="feat-choice__ability-head">
        <span>属性</span><span>当前</span><span>本次</span><span>最终</span>
      </div>
      <div class="feat-choice__abilities">
        <button
          v-for="ability in ABILITY_KEYS"
          :key="ability"
          :class="{ 'feat-choice__ability--selected': draftAbilities.includes(ability) }"
          :disabled="abilityDisabled(ability)"
          :aria-label="`选择${ABILITY_LABELS[ability]}进行属性提升`"
          type="button"
          @click="toggleAbility(ability)"
        >
          <strong>{{ ABILITY_LABELS[ability] }}</strong>
          <span>{{ abilitiesBeforeCheckpoint[ability] }}</span>
          <span>{{ draftAbilities.includes(ability) ? improvementMode === 'single' ? '+2' : '+1' : '—' }}</span>
          <b>{{ abilitiesBeforeCheckpoint[ability] + (draftAbilities.includes(ability) ? improvementMode === 'single' ? 2 : 1 : 0) }}</b>
          <small v-if="abilityDisabled(ability)">会超过20</small>
        </button>
      </div>
      <div :class="{ 'feat-choice__status--complete': allocatedPoints === 2 }" class="feat-choice__status">
        <strong>已分配 {{ allocatedPoints }} / 2 点</strong>
        <span>{{ allocatedPoints === 2 ? '属性提升已完成' : '请完整分配2点' }}</span>
      </div>
    </template>

    <template v-else>
      <div class="feat-choice__search">
        <input v-model="search" type="search" placeholder="搜索专长名称、英文名或用途" aria-label="搜索专长">
        <UiBadge>2014 · {{ visibleFeats.length }}/{{ rulesRepository.feats.length }}</UiBadge>
      </div>
      <div class="feat-choice__filters">
        <UiChip
          v-for="filter in tagFilters"
          :key="filter"
          :selected="tagFilter === filter"
          @toggle="tagFilter = filter"
        >
          {{ filter === 'all' ? '全部' : filter }}
        </UiChip>
      </div>
      <label class="feat-choice__available">
        <input v-model="availableOnly" type="checkbox">
        <span>只看当前可选</span>
      </label>
      <div v-if="visibleFeats.length" class="feat-choice__list">
        <OptionCard
          v-for="{ feat, eligibility } in visibleFeats"
          :key="feat.id"
          :title="`${feat.name} · ${feat.englishName}`"
          :description="feat.description"
          :state="selectedOptionId === feat.id ? 'selected' : eligibility.available ? 'incompatible' : 'locked'"
          :disabled-reason="eligibility.reasons.join('；')"
          @select="selectFeat(feat.id, eligibility.available)"
        >
          <template #suffix>
            <UiBadge :tone="eligibility.available ? 'warning' : 'error'">
              {{ eligibility.available ? '仅索引' : '不可选' }}
            </UiBadge>
          </template>
        </OptionCard>
      </div>
      <div v-else class="feat-choice__empty">
        <strong>没有符合条件的专长</strong>
        <span>清除搜索或筛选后可继续浏览完整目录。</span>
        <button type="button" @click="search = ''; tagFilter = 'all'; availableOnly = false">清除筛选</button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.feat-choice {
  display: grid;
  gap: 0.75rem;

  &__kind,
  &__modes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.25rem;
    padding: 0.25rem;
    border-radius: var(--radius-md);
    background: var(--color-page);

    button {
      min-height: 44px;
      border: 0;
      border-radius: calc(var(--radius-md) - 0.2rem);
      color: var(--color-text-muted);
      background: transparent;
      cursor: pointer;
    }
  }

  &__kind-button--active,
  &__mode--active {
    color: var(--color-primary) !important;
    background: var(--color-surface) !important;
    box-shadow: var(--shadow-sm);
    font-weight: 700;
  }

  &__help { margin: 0; color: var(--color-text-muted); font-size: 0.78rem; line-height: 1.6; }

  &__ability-head,
  &__ability {
    display: grid;
    grid-template-columns: 1fr repeat(3, 3rem);
    align-items: center;
    gap: 0.35rem;
  }

  &__ability-head {
    padding: 0 0.65rem;
    color: var(--color-text-muted);
    text-align: center;
    font-size: 0.68rem;

    span {
      &:first-child { text-align: left; }
    }
  }

  &__abilities { display: grid; gap: 0.4rem; }

  &__ability {
    position: relative;
    min-height: 3.25rem;
    padding: 0.5rem 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    background: var(--color-surface);
    cursor: pointer;

    strong { text-align: left; }
    span { color: var(--color-text-muted); }
    b { color: var(--color-primary); }
    small { position: absolute; right: 0.5rem; bottom: 0.1rem; color: var(--color-error); font-size: 0.62rem; }

    &:disabled { opacity: 0.55; cursor: not-allowed; }
  }

  &__ability--selected {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
    box-shadow: inset 0.2rem 0 var(--color-primary);
  }

  &__status {
    display: flex;
    min-height: 3rem;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.65rem 0.75rem;
    border-radius: var(--radius-md);
    color: var(--color-warning);
    background: var(--color-warning-soft);
    font-size: 0.75rem;
  }

  &__status--complete { color: var(--color-success); background: var(--color-success-soft); }

  &__search {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    input {
      min-width: 0;
      min-height: 44px;
      flex: 1;
      padding: 0.65rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text);
      background: var(--color-surface);
    }
  }

  &__filters { display: flex; gap: 0.4rem; overflow-x: auto; padding-bottom: 0.15rem; }

  &__available {
    display: flex;
    min-height: 44px;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-text-muted);
    font-size: 0.78rem;

    input { width: 1.1rem; height: 1.1rem; accent-color: var(--color-primary); }
  }

  &__list { display: grid; max-height: 30rem; gap: 0.5rem; overflow-y: auto; padding-right: 0.15rem; }

  &__empty {
    display: grid;
    min-height: 10rem;
    place-items: center;
    align-content: center;
    gap: 0.4rem;
    padding: 1rem;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    text-align: center;

    button {
      min-height: 44px;
      padding: 0.5rem 0.8rem;
      border: 0;
      border-radius: var(--radius-sm);
      color: var(--color-primary);
      background: var(--color-primary-soft);
      cursor: pointer;
    }
  }
}
</style>
