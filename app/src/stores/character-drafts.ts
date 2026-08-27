import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { deriveCharacter, deriveCharacterSummary } from '@/rules/derive'
import { buildTimeline } from '@/rules/timeline'
import { validateDraft } from '@/rules/validate'
import { validateSpellSelections } from '@/rules/spellcasting'
import { EMPTY_CURRENCY, isStartingEquipmentComplete } from '@/rules/starting-equipment'
import { getDefaultEnabledSourceIds } from '@/rules/source-books'
import { EMPTY_MANUAL_EDITS, normalizeManualEdits } from '@/rules/manual-edits'
import { getEffectiveSpellSlots } from '@/rules/spellcasting'
import { reconcileSessionLimits } from '@/rules/session-state'
import { SessionStateStorageService } from '@/services/session-state-storage'
import { CharacterJsonService } from '@/services/character-json'
import { DraftStorageService } from '@/services/draft-storage'
import type {
  AbilityScores,
  CharacterManualEdits,
  CharacterDraft,
  ChoiceSelection,
  DraftStep,
  LegacyDraftRecord,
} from '@/types/character'

const DEFAULT_ABILITIES: AbilityScores = { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 }

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createCharacterDraft(): CharacterDraft {
  const now = new Date().toISOString()
  return {
    schemaVersion: 6,
    id: newId(),
    ruleset: '5e-2014',
    createdAt: now,
    updatedAt: now,
    targetLevel: 10,
    abilityMethod: 'standard-array',
    enabledSourceIds: getDefaultEnabledSourceIds(),
    raceAbilityChoices: [],
    backgroundSkillIds: [],
    backgroundToolIds: [],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: DEFAULT_ABILITIES,
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    infusionAssignments: [],
    currency: EMPTY_CURRENCY,
    adventureGold: 0,
    equipmentNeedsReview: false,
    spellSelections: {
      cantripIds: [],
      knownSpellIds: [],
      preparedSpellIds: [],
      spellbookSpellIds: [],
      transcribedSpellIds: [],
    },
    manualEdits: EMPTY_MANUAL_EDITS,
    name: '',
    alignment: '',
    notes: '',
    currentStep: 'setup',
  }
}

export const useCharacterDraftsStore = defineStore('character-drafts', () => {
  const drafts = ref<CharacterDraft[]>([...DraftStorageService.loadAll()])
  const legacyDrafts = ref<readonly LegacyDraftRecord[]>(DraftStorageService.loadLegacy())
  const activeDraftId = ref<string>()
  const activeDraft = computed(() => drafts.value.find((draft) => draft.id === activeDraftId.value))
  const derivedSummary = computed(() => activeDraft.value ? deriveCharacterSummary(activeDraft.value) : undefined)
  const validationIssues = computed(() => activeDraft.value ? validateDraft(activeDraft.value) : [])
  const completion = computed(() => {
    const draft = activeDraft.value
    if (!draft) return 0
    const timeline = draft.classId ? buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId, subclassId: draft.subclassId, enabledSourceIds: draft.enabledSourceIds, selections: draft.selections }) : []
    const timelineComplete = timeline.length > 0 && timeline.every((checkpoint) => {
      const selection = draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)
      const count = selection?.optionIds.length ?? 0
      return count >= checkpoint.minSelections && count <= checkpoint.maxSelections
    })
    const abilitiesValid = Object.values(draft.baseAbilities).every((score) => score >= 3 && score <= 20)
    const hasErrors = validationIssues.value.some((item) => item.severity === 'error')
    const hasWarnings = validationIssues.value.some((item) => item.severity === 'warning')
    const checks = [
      draft.targetLevel >= 1 && draft.targetLevel <= 20,
      true,
      Boolean(draft.classId),
      Boolean(draft.backgroundId && draft.raceId),
      abilitiesValid,
      timelineComplete,
      isStartingEquipmentComplete(draft) && !draft.equipmentNeedsReview,
      validateSpellSelections(draft),
      Boolean(draft.name.trim()),
      !hasErrors,
      !hasWarnings,
    ]
    return Math.round(checks.filter(Boolean).length * 100 / checks.length)
  })

  watch(drafts, (value) => DraftStorageService.saveAll(value), { deep: true })

  function createDraft(): CharacterDraft {
    const draft = createCharacterDraft()
    drafts.value.push(draft)
    activeDraftId.value = draft.id
    return draft
  }

  function activateDraft(id: string): boolean {
    if (!drafts.value.some((draft) => draft.id === id)) return false
    activeDraftId.value = id
    return true
  }

  function closeActiveDraft(): void {
    activeDraftId.value = undefined
  }

  function deleteDraft(id: string): boolean {
    const index = drafts.value.findIndex((draft) => draft.id === id)
    if (index < 0) return false
    drafts.value.splice(index, 1)
    if (activeDraftId.value === id) activeDraftId.value = undefined
    return true
  }

  function updateDraft(patch: Partial<Omit<CharacterDraft, 'id' | 'schemaVersion' | 'ruleset' | 'createdAt'>>): void {
    const index = drafts.value.findIndex((draft) => draft.id === activeDraftId.value)
    if (index < 0) return
    const current = drafts.value[index]
    if (!current) return
    replaceDraft(index, current, { ...current, ...patch, updatedAt: new Date().toISOString() })
  }

  function replaceDraft(index: number, current: CharacterDraft, next: CharacterDraft): void {
    next = { ...next, manualEdits: normalizeManualEdits(next.manualEdits) }
    const state = SessionStateStorageService.load(current.id)
    if (state) {
      const oldMaxHp = deriveCharacter(current).hitPoints.value
      const newMaxHp = deriveCharacter(next).hitPoints.value
      SessionStateStorageService.save(reconcileSessionLimits(state, oldMaxHp, newMaxHp, getEffectiveSpellSlots(next)))
    }
    drafts.value[index] = next
  }

  /** 按草稿 id 更新（不改变 activeDraftId）：跑团助手等非车卡流程使用。 */
  function updateDraftById(id: string, patch: Partial<Omit<CharacterDraft, 'id' | 'schemaVersion' | 'ruleset' | 'createdAt'>>): boolean {
    const index = drafts.value.findIndex((draft) => draft.id === id)
    if (index < 0) return false
    const current = drafts.value[index]
    if (!current) return false
    replaceDraft(index, current, { ...current, ...patch, updatedAt: new Date().toISOString() })
    return true
  }

  function updateManualEdits(manualEdits: CharacterManualEdits): void {
    updateDraft({ manualEdits })
  }

  function setStep(step: DraftStep): void {
    updateDraft({ currentStep: step })
  }

  function saveSelection(checkpointId: string, optionIds: readonly string[]): void {
    const draft = activeDraft.value
    if (!draft) return
    const nextSelection: ChoiceSelection = {
      checkpointId,
      optionIds,
      confirmedAt: new Date().toISOString(),
    }
    updateDraft({
      selections: [...draft.selections.filter((item) => item.checkpointId !== checkpointId), nextSelection],
    })
  }

  function invalidateSelections(checkpointIds: readonly string[], reason: string): void {
    const draft = activeDraft.value
    if (!draft) return
    const timestamp = new Date().toISOString()
    updateDraft({
      selections: draft.selections.map((selection) =>
        checkpointIds.includes(selection.checkpointId)
          ? { ...selection, invalidatedAt: timestamp, invalidatedReason: reason }
          : selection,
      ),
    })
  }

  function importDraft(raw: string): CharacterDraft {
    const imported = CharacterJsonService.importDraft(raw)
    const draft = { ...imported, id: newId(), updatedAt: new Date().toISOString() }
    drafts.value.push(draft)
    activeDraftId.value = draft.id
    return draft
  }

  function exportActiveDraft(): string | undefined {
    return activeDraft.value ? CharacterJsonService.exportDraft(activeDraft.value) : undefined
  }

  function exportLegacyDraft(id: string): void {
    const record = legacyDrafts.value.find((item) => item.id === id)
    if (!record) return
    CharacterJsonService.downloadRaw(JSON.stringify(record.raw, null, 2), `${record.name}-${record.id}-2024-backup.json`)
  }

  return {
    drafts,
    legacyDrafts,
    activeDraftId,
    activeDraft,
    derivedSummary,
    validationIssues,
    completion,
    createDraft,
    activateDraft,
    closeActiveDraft,
    deleteDraft,
    updateDraft,
    updateDraftById,
    updateManualEdits,
    setStep,
    saveSelection,
    invalidateSelections,
    importDraft,
    exportActiveDraft,
    exportLegacyDraft,
  }
})
