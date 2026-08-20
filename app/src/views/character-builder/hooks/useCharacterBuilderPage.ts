import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import { deriveCharacter, getFlexibleBonusRule, getRaceAbilityBonuses } from '@/rules/derive'
import { areBaseAbilitiesValid, areOriginAbilitiesWithinCap, STANDARD_ARRAY_DEFAULT } from '@/rules/abilities'
import { getDependencyImpact, type DraftChange } from '@/rules/dependency'
import { rulesRepository } from '@/rules/repository'
import { buildTimeline } from '@/rules/timeline'
import { validateSpellSelections } from '@/rules/spellcasting'
import { buildStartingEquipmentState, isStartingEquipmentComplete } from '@/rules/starting-equipment'
import { STEP_META, STEP_ORDER } from '@/views/character-builder/steps'
import { CharacterImportError, CharacterJsonService } from '@/services/character-json'
import { downloadXlsx, fillTemplate, loadCharacterSheetTemplate } from '@/services/export-xlsx'
import { buildCharacterSheetPdf, downloadPdf } from '@/services/export-pdf'
import { buildCharacterExportModel, type ExportDiagnostic } from '@/features/character-export/build-export-data'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import type {
  AbilityKey,
  AbilityMethod,
  AbilityScores,
  CharacterDraft,
  CurrencyWallet,
  DependencyImpact,
  DraftStep,
  InventoryEntry,
  SpellSelections,
  StartingEquipmentSelection,
} from '@/types/character'

function isDraftStep(value: unknown): value is DraftStep {
  return typeof value === 'string' && STEP_ORDER.includes(value as DraftStep)
}

export function useCharacterBuilderPage() {
  const route = useRoute()
  const router = useRouter()
  const store = useCharacterDraftsStore()
  const { drafts, legacyDrafts, activeDraft, derivedSummary, validationIssues, completion } = storeToRefs(store)
  const importError = ref('')
  const exportingFormat = ref<'pdf' | 'xlsx'>()
  const exportNotice = ref<{ readonly tone: 'warning' | 'error' | 'success'; readonly title: string; readonly message: string }>()
  const pendingChange = ref<{
    readonly title: string
    readonly affected: readonly string[]
    readonly impact?: DependencyImpact
    readonly apply: () => void
  }>()
  const derived = computed(() => activeDraft.value ? deriveCharacter(activeDraft.value) : undefined)
  const raceAbilityBonuses = computed(() => activeDraft.value ? getRaceAbilityBonuses(activeDraft.value) : {})
  const raceFlexibleCount = computed(() => {
    const draft = activeDraft.value
    if (!draft) return 0
    const race = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
    const subrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
    const flexibleRule = getFlexibleBonusRule(race, subrace)
    return flexibleRule?.flexibleBonusGroups?.reduce((sum, group) => sum + group.count, 0)
      ?? flexibleRule?.flexibleBonusCount ?? 0
  })
  const raceFlexibleGroups = computed(() => {
    const draft = activeDraft.value
    if (!draft) return undefined
    const race = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
    const subrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
    return getFlexibleBonusRule(race, subrace)?.flexibleBonusGroups
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
    const timeline = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId, subclassId: draft.subclassId })
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
        && areOriginAbilitiesWithinCap(draft.baseAbilities, raceAbilityBonuses.value)
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

  function returnToStart(): void {
    store.closeActiveDraft()
    void router.replace({ name: 'character-builder' })
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
    options: { readonly alwaysConfirm?: boolean } = {},
  ): void {
    const draft = activeDraft.value
    if (!draft) return
    const impact = getDependencyImpact(draft, change)
    const affected = [
      ...impact.invalidated.filter((checkpointId) =>
        draft.selections.some((selection) => selection.checkpointId === checkpointId && !selection.invalidatedAt)),
      ...additionalAffected,
    ]
    if (!affected.length && !options.alwaysConfirm) {
      apply()
      return
    }
    pendingChange.value = { title, affected, impact, apply }
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

  /** 角色完成后升级/降级引导条：升级提示补全新检查点，降级提示复查失效选择。 */
  const levelAdjustNotice = ref<{ tone: 'success' | 'warning'; message: string; step?: DraftStep }>()

  function buildLevelAdjustNotice(
    direction: 'up' | 'down',
    targetLevel: number,
    impact: DependencyImpact,
  ): { tone: 'success' | 'warning'; message: string; step?: DraftStep } {
    if (direction === 'up') {
      const added = impact.added ?? []
      if (added.length === 0) return { tone: 'success', message: `等级已提升至 ${targetLevel} 级，派生数值已更新。` }
      return {
        tone: 'success',
        message: `等级提升至 ${targetLevel} 级，请完成新增检查点：${added.map((item) => item.title).join('、')}`,
        step: 'timeline',
      }
    }
    const invalidated = impact.invalidatedDetails ?? []
    const reviews = impact.reviews ?? []
    const parts = [...invalidated.map((item) => item.title), ...reviews]
    return {
      tone: 'warning',
      message: parts.length
        ? `等级降至 ${targetLevel} 级，需复查：${parts.join('、')}`
        : `等级已降至 ${targetLevel} 级，派生数值已更新。`,
      step: 'timeline',
    }
  }

  function dismissLevelAdjustNotice(): void {
    levelAdjustNotice.value = undefined
  }

  /** 角色完成后调整等级（升级/降级），始终弹确认并展示受影响清单。 */
  function adjustLevel(targetLevel: number): void {
    const draft = activeDraft.value
    if (!draft?.classId || targetLevel === draft.targetLevel) return
    if (targetLevel < 1 || targetLevel > 20) return
    const change = { kind: 'target-level', value: targetLevel } as const
    const direction = targetLevel > draft.targetLevel ? 'up' : 'down'
    requestChange(
      change,
      direction === 'up' ? `升级至 ${targetLevel} 级` : `降级至 ${targetLevel} 级`,
      () => {
        const impact = getDependencyImpact(draft, change)
        store.invalidateSelections(impact.invalidated, `目标等级调整为${targetLevel}级`)
        store.updateDraft({ targetLevel })
        levelAdjustNotice.value = buildLevelAdjustNotice(direction, targetLevel, impact)
        if (direction === 'up' && (impact.added?.length ?? 0) > 0) {
          setStep('timeline')
        }
      },
      [],
      { alwaysConfirm: true },
    )
  }

  /** 角色完成后重新编辑：智能定位到需要处理的步骤，否则进入属性步骤。 */
  function startReedit(): void {
    const draft = activeDraft.value
    if (!draft) return
    if (!draft.classId) {
      setStep('setup')
      return
    }
    const timeline = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId, subclassId: draft.subclassId })
    const hasInvalidated = draft.selections.some((selection) => Boolean(selection.invalidatedAt))
    const hasIncompleteCheckpoint = timeline.some((checkpoint) => {
      const selection = draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)
      return (selection?.optionIds.length ?? 0) < checkpoint.minSelections
    })
    if (hasInvalidated || hasIncompleteCheckpoint) {
      setStep('timeline')
      return
    }
    if (!validateSpellSelections(draft)) {
      setStep('spells')
      return
    }
    setStep('abilities')
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
      store.updateDraft({ raceId: id, subraceId: undefined, raceAbilityChoices: [], raceSkillChoices: [], raceToolChoice: undefined })
    })
  }

  function selectSubrace(id: string | undefined): void {
    const draft = activeDraft.value
    if (!draft || draft.subraceId === id) return
    const change = { kind: 'subrace', value: id } as const
    requestChange(change, '更换子种族', () => {
      const impact = getDependencyImpact(draft, change)
      store.invalidateSelections(impact.invalidated, '更换子种族后需要重新确认')
      store.updateDraft({ subraceId: id, raceAbilityChoices: [], raceSkillChoices: [], raceToolChoice: undefined })
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
    const checkpoint = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId, subclassId: draft.subclassId })
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

  function updateInventory(inventory: readonly InventoryEntry[]): void {
    store.updateDraft({ inventory })
  }

  function updateAdventureGold(adventureGold: number): void {
    store.updateDraft({ adventureGold })
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

  function diagnosticSummary(diagnostics: readonly ExportDiagnostic[]): string {
    const warnings = [...new Set(diagnostics.filter((item) => item.severity === 'warning').map((item) => item.message))]
    return warnings.length ? warnings.join('；') : ''
  }

  function blockingMessage(diagnostics: readonly ExportDiagnostic[]): string | undefined {
    const first = diagnostics.find((item) => item.severity === 'error')
    return first?.message
  }

  function exportErrorMessage(error: unknown): string {
    return error instanceof Error && error.message ? error.message : '导出失败，请稍后重试。'
  }

  /** PDF 角色卡导出：统一模型 → 三页 AcroForm 模板 → 诊断 → 下载。 */
  async function exportPdf(): Promise<void> {
    const draft = activeDraft.value
    const currentDerived = derived.value
    if (!draft || !currentDerived || exportingFormat.value) return
    exportingFormat.value = 'pdf'
    exportNotice.value = undefined
    try {
      const model = buildCharacterExportModel(draft, currentDerived)
      const modelBlocker = blockingMessage(model.diagnostics)
      if (modelBlocker) throw new Error(modelBlocker)
      const result = await buildCharacterSheetPdf(model)
      const blocker = blockingMessage(result.diagnostics)
      if (blocker) throw new Error(blocker)
      await downloadPdf(result.bytes, `${draft.name.trim() || 'dnd-character'}-dnd5e.pdf`)
      const warning = diagnosticSummary(result.diagnostics)
      exportNotice.value = warning ? { tone: 'warning', title: 'PDF 已导出，但有内容省略', message: warning } : { tone: 'success', title: 'PDF 导出完成', message: '三页角色卡已生成并开始下载。' }
    } catch (error) {
      exportNotice.value = { tone: 'error', title: 'PDF 导出失败', message: exportErrorMessage(error) }
    } finally {
      exportingFormat.value = undefined
    }
  }

  async function exportXlsx(): Promise<void> {
    const draft = activeDraft.value
    const currentDerived = derived.value
    if (!draft || !currentDerived || exportingFormat.value) return
    exportingFormat.value = 'xlsx'
    exportNotice.value = undefined
    try {
      const model = buildCharacterExportModel(draft, currentDerived)
      const modelBlocker = blockingMessage(model.diagnostics)
      if (modelBlocker) throw new Error(modelBlocker)
      const workbook = await loadCharacterSheetTemplate()
      const result = fillTemplate(workbook, model)
      const blocker = blockingMessage(result.diagnostics)
      if (blocker) throw new Error(blocker)
      await downloadXlsx(workbook, `${draft.name.trim() || 'dnd-character'}-dnd5e.xlsx`)
      const warning = diagnosticSummary(result.diagnostics)
      exportNotice.value = warning ? { tone: 'warning', title: 'XLSX 已导出，但有内容省略', message: warning } : { tone: 'success', title: 'XLSX 导出完成', message: '自动计算角色卡已校验并开始下载。' }
    } catch (error) {
      exportNotice.value = { tone: 'error', title: 'XLSX 导出失败', message: exportErrorMessage(error) }
    } finally {
      exportingFormat.value = undefined
    }
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
    raceFlexibleGroups,
    excludedRaceAbilityChoices,
    derivedSummary,
    validationIssues,
    completion,
    importError,
    exportingFormat,
    exportNotice,
    pendingChange,
    step,
    stepMeta,
    stepNumber,
    canContinue,
    createDraft,
    openDraft,
    returnToStart,
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
    updateInventory,
    updateAdventureGold,
    updateSpells,
    updateIdentity,
    updateAbilities,
    updateRaceAbilityChoices,
    exportDraft,
    exportPdf,
    exportXlsx,
    exportLegacyDraft: store.exportLegacyDraft,
    confirmPendingChange,
    cancelPendingChange,
    levelAdjustNotice,
    dismissLevelAdjustNotice,
    adjustLevel,
    startReedit,
    updateDraft: store.updateDraft,
  } as const
}
