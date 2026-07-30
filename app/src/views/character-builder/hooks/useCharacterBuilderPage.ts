import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import { deriveCharacter, getRaceAbilityBonuses } from '@/rules/derive'
import { areBaseAbilitiesValid, STANDARD_ARRAY_DEFAULT } from '@/rules/abilities'
import { getDependencyImpact, type DraftChange } from '@/rules/dependency'
import { rulesRepository } from '@/rules/repository'
import { buildTimeline } from '@/rules/timeline'
import { validateSpellSelections } from '@/rules/spellcasting'
import { buildStartingEquipmentState, isStartingEquipmentComplete } from '@/rules/starting-equipment'
import { CharacterImportError, CharacterJsonService } from '@/services/character-json'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import type {
  AbilityKey,
  AbilityMethod,
  AbilityScores,
  CharacterDraft,
  CurrencyWallet,
  DraftStep,
  InventoryEntry,
  SpellSelections,
  StartingEquipmentSelection,
} from '@/types/character'

const STEP_ORDER: readonly DraftStep[] = ['setup', 'preferences', 'class', 'origin', 'abilities', 'timeline', 'equipment', 'spells', 'identity', 'validation', 'sheet']
const STEP_META: Record<DraftStep, { eyebrow: string; title: string }> = {
  setup: { eyebrow: '第1步', title: '先确定冒险规模' },
  preferences: { eyebrow: '第2步', title: '你想怎样参与战斗？' },
  class: { eyebrow: '第3步', title: '选择推荐职业' },
  origin: { eyebrow: '第4步', title: '确定角色起源' },
  abilities: { eyebrow: '第5步', title: '分配六项属性' },
  timeline: { eyebrow: '第6步', title: '完成等级时间线' },
  equipment: { eyebrow: '第7步', title: '选择并装备物品' },
  spells: { eyebrow: '第8步', title: '配置职业法术' },
  identity: { eyebrow: '第9步', title: '让角色成为一个人' },
  validation: { eyebrow: '最终检查', title: '规则校验' },
  sheet: { eyebrow: '角色完成', title: '角色卡' },
}

function isDraftStep(value: unknown): value is DraftStep {
  return typeof value === 'string' && STEP_ORDER.includes(value as DraftStep)
}

export function useCharacterBuilderPage() {
  const route = useRoute()
  const router = useRouter()
  const store = useCharacterDraftsStore()
  const { drafts, legacyDrafts, activeDraft, derivedSummary, validationIssues, completion } = storeToRefs(store)
  const importError = ref('')
  const pendingChange = ref<{
    readonly title: string
    readonly affected: readonly string[]
    readonly apply: () => void
  }>()
  const derived = computed(() => activeDraft.value ? deriveCharacter(activeDraft.value) : undefined)
  const raceAbilityBonuses = computed(() => activeDraft.value ? getRaceAbilityBonuses(activeDraft.value) : {})
  const raceFlexibleCount = computed(() => {
    const draft = activeDraft.value
    if (!draft) return 0
    const race = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
    const subrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
    return subrace?.flexibleBonusCount ?? race?.flexibleBonusCount ?? 0
  })
  const excludedRaceAbilityChoices = computed(() => {
    const draft = activeDraft.value
    if (!draft) return []
    const race = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
    const subrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
    return subrace?.excludedFlexibleAbilityKeys ?? race?.excludedFlexibleAbilityKeys ?? []
  })
  const step = computed(() => activeDraft.value?.currentStep ?? 'setup')
  const stepMeta = computed(() => STEP_META[step.value])
  const stepNumber = computed(() => Math.max(1, STEP_ORDER.indexOf(step.value) + 1))
  const timelineComplete = computed(() => {
    const draft = activeDraft.value
    if (!draft?.classId) return false
    const classRule = rulesRepository.getClass(draft.classId)
    if (classRule?.status !== 'implemented') return true
    const timeline = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId })
    return timeline.length > 0 && timeline.every((checkpoint) => {
      const selection = draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)
      return (selection?.optionIds.length ?? 0) >= checkpoint.minSelections
    })
  })
  const canContinue = computed(() => {
    const draft = activeDraft.value
    if (!draft) return false
    if (step.value === 'class') return Boolean(draft.classId)
    if (step.value === 'preferences') return draft.preferences.length > 0
    if (step.value === 'origin') {
      const race = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
      const background = draft.backgroundId ? rulesRepository.getBackground(draft.backgroundId) : undefined
      return Boolean(
        background
        && race
        && (!race.requiresSubrace || draft.subraceId)
        && draft.languages.length === background.languageChoices,
      )
    }
    if (step.value === 'abilities') {
      return draft.raceAbilityChoices.length === raceFlexibleCount.value
        && areBaseAbilitiesValid(draft.baseAbilities, draft.abilityMethod)
    }
    if (step.value === 'timeline') return timelineComplete.value
    if (step.value === 'equipment') {
      return isStartingEquipmentComplete(draft) && !draft.equipmentNeedsReview
    }
    if (step.value === 'spells') return validateSpellSelections(draft)
    if (step.value === 'identity') return Boolean(draft.name.trim())
    if (step.value === 'validation') return !validationIssues.value.some((issue) => issue.severity === 'error')
    return true
  })

  function syncRoute(draft: CharacterDraft): void {
    void router.replace({ name: 'character-builder', query: { draft: draft.id, step: draft.currentStep } })
  }

  function createDraft(): void {
    syncRoute(store.createDraft())
  }

  function openDraft(id: string): void {
    if (store.activateDraft(id) && store.activeDraft) syncRoute(store.activeDraft)
  }

  function deleteDraft(id: string): void {
    const deletingActiveDraft = store.activeDraftId === id
    if (!store.deleteDraft(id)) return
    if (deletingActiveDraft) void router.replace({ name: 'character-builder' })
  }

  function importDraft(raw: string): void {
    try {
      importError.value = ''
      syncRoute(store.importDraft(raw))
    } catch (error) {
      importError.value = error instanceof CharacterImportError ? error.message : '无法导入角色文件。'
    }
  }

  function setStep(next: DraftStep): void {
    store.setStep(next)
    if (store.activeDraft) syncRoute(store.activeDraft)
  }

  function nextStep(): void {
    if (!canContinue.value) return
    const next = STEP_ORDER[Math.min(STEP_ORDER.length - 1, STEP_ORDER.indexOf(step.value) + 1)]
    if (next) setStep(next)
  }

  function previousStep(): void {
    const previous = STEP_ORDER[Math.max(0, STEP_ORDER.indexOf(step.value) - 1)]
    if (previous) setStep(previous)
  }

  function requestChange(
    change: DraftChange,
    title: string,
    apply: () => void,
    additionalAffected: readonly string[] = [],
  ): void {
    const draft = activeDraft.value
    if (!draft) return
    const impact = getDependencyImpact(draft, change)
    const affected = [
      ...impact.invalidated.filter((checkpointId) =>
        draft.selections.some((selection) => selection.checkpointId === checkpointId && !selection.invalidatedAt)),
      ...additionalAffected,
    ]
    if (!affected.length) {
      apply()
      return
    }
    pendingChange.value = { title, affected, apply }
  }

  function confirmPendingChange(): void {
    const pending = pendingChange.value
    if (!pending) return
    pending.apply()
    pendingChange.value = undefined
  }

  function cancelPendingChange(): void {
    pendingChange.value = undefined
  }

  function updateSetup(targetLevel: number, abilityMethod: AbilityMethod): void {
    const draft = activeDraft.value
    const abilityPatch = draft
      && abilityMethod === 'standard-array'
      && !areBaseAbilitiesValid(draft.baseAbilities, 'standard-array')
      ? { baseAbilities: STANDARD_ARRAY_DEFAULT }
      : {}
    if (!draft || targetLevel === draft.targetLevel) {
      store.updateDraft({ targetLevel, abilityMethod, ...abilityPatch })
      return
    }
    const change = { kind: 'target-level', value: targetLevel } as const
    requestChange(change, '修改目标等级', () => {
      const impact = getDependencyImpact(draft, change)
      store.invalidateSelections(impact.invalidated, `目标等级调整为${targetLevel}级`)
      store.updateDraft({ targetLevel, abilityMethod, ...abilityPatch })
    })
  }

  function selectClass(classId: string): void {
    const draft = activeDraft.value
    if (!draft || draft.classId === classId) return
    const change = { kind: 'class', value: classId } as const
    requestChange(change, '更换职业', () => {
      const impact = getDependencyImpact(draft, change)
      store.invalidateSelections(impact.invalidated, '更换职业后需要重新确认')
      const equipmentDraft = { ...draft, classId, startingEquipmentSelections: [] }
      const equipment = buildStartingEquipmentState(equipmentDraft)
      store.updateDraft({
        classId,
        subclassId: undefined,
        startingEquipmentSelections: [],
        inventory: equipment.inventory,
        currency: equipment.currency,
        equipmentNeedsReview: false,
      })
    }, draft.inventory.some((entry) => entry.sourceKind === 'class') ? ['职业起始装备'] : [])
  }

  function selectRace(id: string): void {
    const draft = activeDraft.value
    if (!draft || draft.raceId === id) return
    const change = { kind: 'race', value: id } as const
    requestChange(change, '更换种族', () => {
      const impact = getDependencyImpact(draft, change)
      store.invalidateSelections(impact.invalidated, '更换种族后需要重新确认')
      store.updateDraft({ raceId: id, subraceId: undefined, raceAbilityChoices: [] })
    })
  }

  function selectSubrace(id: string | undefined): void {
    const draft = activeDraft.value
    if (!draft || draft.subraceId === id) return
    const change = { kind: 'subrace', value: id } as const
    requestChange(change, '更换子种族', () => {
      const impact = getDependencyImpact(draft, change)
      store.invalidateSelections(impact.invalidated, '更换子种族后需要重新确认')
      store.updateDraft({ subraceId: id, raceAbilityChoices: [] })
    })
  }

  function selectBackground(id: string): void {
    const background = rulesRepository.getBackground(id)
    const draft = activeDraft.value
    if (!draft || draft.backgroundId === id) return
    const apply = () => {
      const equipment = buildStartingEquipmentState({ ...draft, backgroundId: id })
      store.updateDraft({
        backgroundId: id,
        backgroundVariantId: undefined,
        backgroundSkillIds: background?.skillIds ?? [],
        backgroundToolIds: background?.toolIds ?? [],
        languages: [],
        inventory: equipment.inventory,
        currency: equipment.currency,
      })
    }
    requestChange(
      { kind: 'background', value: id },
      '更换背景',
      apply,
      draft.inventory.some((entry) => entry.sourceKind === 'background') ? ['背景固定装备与起始金币'] : [],
    )
  }

  function selectBackgroundVariant(id: string | undefined): void {
    const draft = activeDraft.value
    if (!draft || draft.backgroundVariantId === id) return
    const equipment = buildStartingEquipmentState({ ...draft, backgroundVariantId: id })
    store.updateDraft({
      backgroundVariantId: id,
      inventory: equipment.inventory,
      currency: equipment.currency,
    })
  }

  function saveTimelineSelection(checkpointId: string, optionIds: readonly string[]): void {
    store.saveSelection(checkpointId, optionIds)
    const draft = activeDraft.value
    if (!draft?.classId) return
    const checkpoint = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId })
      .find((item) => item.id === checkpointId)
    if (checkpoint?.kind === 'subclass') {
      store.updateDraft({ subclassId: optionIds[0] })
    }
  }

  function updateEquipment(
    startingEquipmentSelections: readonly StartingEquipmentSelection[],
    inventory: readonly InventoryEntry[],
    currency: CurrencyWallet,
  ): void {
    store.updateDraft({
      startingEquipmentSelections,
      inventory,
      currency,
      equipmentNeedsReview: false,
    })
  }

  function updateSpells(value: SpellSelections): void {
    store.updateDraft({ spellSelections: value })
  }

  function updateIdentity(value: Pick<CharacterDraft, 'name' | 'alignment' | 'notes'>): void {
    store.updateDraft(value)
  }

  function updateAbilities(value: AbilityScores): void {
    store.updateDraft({ baseAbilities: value })
  }

  function updateRaceAbilityChoices(value: readonly AbilityKey[]): void {
    store.updateDraft({ raceAbilityChoices: value })
  }

  function exportDraft(): void {
    if (activeDraft.value) CharacterJsonService.downloadDraft(activeDraft.value)
  }

  onMounted(() => {
    const draftId = typeof route.query.draft === 'string' ? route.query.draft : undefined
    if (draftId && store.activateDraft(draftId)) {
      const routeStep = route.query.step
      if (isDraftStep(routeStep) && routeStep !== store.activeDraft?.currentStep) store.setStep(routeStep)
    }
  })

  watch(
    () => [route.query.draft, route.query.step] as const,
    ([draftId, routeStep]) => {
      if (typeof draftId === 'string' && draftId !== store.activeDraftId) store.activateDraft(draftId)
      if (isDraftStep(routeStep) && routeStep !== store.activeDraft?.currentStep) store.setStep(routeStep)
    },
  )

  return {
    title: '辅助车卡',
    drafts,
    legacyDrafts,
    activeDraft,
    derived,
    raceAbilityBonuses,
    raceFlexibleCount,
    excludedRaceAbilityChoices,
    derivedSummary,
    validationIssues,
    completion,
    importError,
    pendingChange,
    step,
    stepMeta,
    stepNumber,
    canContinue,
    createDraft,
    openDraft,
    deleteDraft,
    importDraft,
    nextStep,
    previousStep,
    setStep,
    updateSetup,
    selectClass,
    selectRace,
    selectSubrace,
    selectBackground,
    selectBackgroundVariant,
    saveTimelineSelection,
    updateEquipment,
    updateSpells,
    updateIdentity,
    updateAbilities,
    updateRaceAbilityChoices,
    exportDraft,
    exportLegacyDraft: store.exportLegacyDraft,
    confirmPendingChange,
    cancelPendingChange,
    updateDraft: store.updateDraft,
  } as const
}
