import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { deriveCharacterSummary } from '@/rules/derive'
import { buildTimeline } from '@/rules/timeline'
import { validateDraft } from '@/rules/validate'
import { validateSpellSelections } from '@/rules/spellcasting'
import { CharacterJsonService } from '@/services/character-json'
import { DraftStorageService } from '@/services/draft-storage'
import type {
  AbilityScores,
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
    schemaVersion: 2,
    id: newId(),
    ruleset: '5e-2014',
    createdAt: now,
    updatedAt: now,
    targetLevel: 10,
    abilityMethod: 'standard-array',
    preferences: [],
    raceAbilityChoices: [],
    backgroundSkillIds: [],
    backgroundToolIds: [],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: DEFAULT_ABILITIES,
    selections: [],
    inventoryItemIds: [],
    equippedItemIds: [],
    spellSelections: {
      cantripIds: [],
      knownSpellIds: [],
      preparedSpellIds: [],
      spellbookSpellIds: [],
    },
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
    const timeline = draft.classId ? buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId }) : []
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
      draft.preferences.length > 0,
      Boolean(draft.classId),
      Boolean(draft.backgroundId && draft.raceId),
      abilitiesValid,
      timelineComplete,
      draft.inventoryItemIds.length > 0 && draft.equippedItemIds.length > 0,
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
    drafts.value[index] = { ...current, ...patch, updatedAt: new Date().toISOString() }
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
    deleteDraft,
    updateDraft,
    setStep,
    saveSelection,
    invalidateSelections,
    importDraft,
    exportActiveDraft,
    exportLegacyDraft,
  }
})
