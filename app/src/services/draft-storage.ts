import type { CharacterDraft, LegacyDraftRecord, SpellSelections } from '@/types/character'
import { EMPTY_CURRENCY } from '@/rules/starting-equipment'
import { inferEnabledSourceIds, normalizeEnabledSourceIds } from '@/rules/source-books'
import { rulesRepository } from '@/rules/repository'
import { EMPTY_MANUAL_EDITS, normalizeManualEdits } from '@/rules/manual-edits'

const STORAGE_KEY = 'dnd-character-builder:drafts:v6'
const V5_STORAGE_KEY = 'dnd-character-builder:drafts:v5'
const V4_STORAGE_KEY = 'dnd-character-builder:drafts:v4'
const V3_STORAGE_KEY = 'dnd-character-builder:drafts:v3'
const V2_STORAGE_KEY = 'dnd-character-builder:drafts:v2'
const LEGACY_STORAGE_KEY = 'dnd-character-builder:drafts:v1'

function emptySpellSelections(): SpellSelections {
  return {
    cantripIds: [],
    knownSpellIds: [],
    preparedSpellIds: [],
    spellbookSpellIds: [],
    transcribedSpellIds: [],
  }
}

function isDraft(value: unknown): value is CharacterDraft {
  if (!value || typeof value !== 'object') return false
  const draft = value as Partial<CharacterDraft>
  return draft.schemaVersion === 6 && draft.ruleset === '5e-2014' && typeof draft.id === 'string'
}

function normalizeDraft(draft: CharacterDraft): CharacterDraft {
  return {
    ...draft,
    enabledSourceIds: normalizeEnabledSourceIds(draft.enabledSourceIds),
    raceAbilityChoices: draft.raceAbilityChoices ?? [],
    backgroundSkillIds: draft.backgroundSkillIds ?? [],
    backgroundToolIds: draft.backgroundToolIds ?? [],
    languages: draft.languages ?? [],
    proficiencyReplacements: draft.proficiencyReplacements ?? [],
    startingEquipmentSelections: draft.startingEquipmentSelections ?? [],
    inventory: draft.inventory ?? [],
    infusionAssignments: draft.infusionAssignments ?? [],
    currency: draft.currency ?? EMPTY_CURRENCY,
    adventureGold: draft.adventureGold ?? 0,
    equipmentNeedsReview: draft.equipmentNeedsReview ?? false,
    spellSelections: draft.spellSelections
      ? { ...draft.spellSelections, transcribedSpellIds: draft.spellSelections.transcribedSpellIds ?? [] }
      : emptySpellSelections(),
    manualEdits: normalizeManualEdits(draft.manualEdits),
  }
}

/** v2—v6 统一迁移入口；旧玩法偏好不再进入当前草稿。 */
export function migrateDraftToV6(value: unknown): CharacterDraft | undefined {
  if (!value || typeof value !== 'object') return undefined
  const draft = value as Record<string, unknown>
  if (![2, 3, 4, 5, 6].includes(Number(draft.schemaVersion)) || draft.ruleset !== '5e-2014' || typeof draft.id !== 'string') return undefined
  const oldVersion = Number(draft.schemaVersion)
  const inventoryItemIds = oldVersion === 2 && Array.isArray(draft.inventoryItemIds)
    ? draft.inventoryItemIds.filter((item): item is string => typeof item === 'string')
    : []
  const equippedItemIds = new Set(oldVersion === 2 && Array.isArray(draft.equippedItemIds)
    ? draft.equippedItemIds.filter((item): item is string => typeof item === 'string')
    : [])
  const quantityById = new Map<string, number>()
  for (const itemId of inventoryItemIds) quantityById.set(itemId, (quantityById.get(itemId) ?? 0) + 1)
  const migratedInventory = oldVersion === 2
    ? [...quantityById].map(([itemId, quantity]) => ({
      id: `legacy:${draft.id}:${itemId}`,
      itemId,
      quantity,
      sourceKind: 'legacy' as const,
      sourceId: draft.id as string,
      equippedQuantity: equippedItemIds.has(itemId) ? 1 : 0,
    }))
    : (draft.inventory as CharacterDraft['inventory'] | undefined) ?? []
  const enabledSourceIds = oldVersion >= 5
    ? normalizeEnabledSourceIds(draft.enabledSourceIds as readonly string[] | undefined)
    : inferEnabledSourceIds({
      ...draft,
      inventory: migratedInventory,
    } as unknown as Partial<CharacterDraft>, rulesRepository)
  const { preferences: _preferences, inventoryItemIds: _inventoryItemIds, equippedItemIds: _equippedItemIds, ...rest } = draft
  return normalizeDraft({
    ...rest,
    schemaVersion: 6,
    currentStep: draft.currentStep === 'preferences' ? 'sources' : draft.currentStep,
    enabledSourceIds,
    startingEquipmentSelections: oldVersion === 2 ? [] : draft.startingEquipmentSelections,
    inventory: migratedInventory,
    infusionAssignments: oldVersion >= 5 ? draft.infusionAssignments : [],
    currency: oldVersion === 2 ? EMPTY_CURRENCY : draft.currency,
    adventureGold: oldVersion === 2 ? 0 : draft.adventureGold,
    equipmentNeedsReview: oldVersion === 2 ? true : draft.equipmentNeedsReview,
    manualEdits: oldVersion === 6 ? draft.manualEdits : EMPTY_MANUAL_EDITS,
  } as unknown as CharacterDraft)
}

/** 兼容旧调用名；统一返回当前 v6 草稿。 */
export const migrateDraftToV5 = migrateDraftToV6

function readArray(key: string): readonly unknown[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const DraftStorageService = {
  loadAll(): readonly CharacterDraft[] {
    const current = readArray(STORAGE_KEY).filter(isDraft).map(normalizeDraft)
    const seenIds = new Set(current.map((draft) => draft.id))
    const migrated = [
      ...readArray(V5_STORAGE_KEY).map(migrateDraftToV6),
      ...readArray(V4_STORAGE_KEY).map(migrateDraftToV5),
      ...readArray(V3_STORAGE_KEY).map(migrateDraftToV5),
      ...readArray(V2_STORAGE_KEY).map(migrateDraftToV5),
    ]
      .filter((draft): draft is CharacterDraft => {
        if (!draft || seenIds.has(draft.id)) return false
        seenIds.add(draft.id)
        return true
      })
    return [...current, ...migrated]
  },
  loadLegacy(): readonly LegacyDraftRecord[] {
    return readArray(LEGACY_STORAGE_KEY).flatMap((raw, index) => {
      if (!raw || typeof raw !== 'object') return []
      const candidate = raw as { id?: unknown; name?: unknown; ruleset?: unknown; targetLevel?: unknown }
      if (candidate.ruleset !== '5e-2024') return []
      return [{
        id: typeof candidate.id === 'string' ? candidate.id : `legacy-${index}`,
        name: typeof candidate.name === 'string' && candidate.name.trim() ? candidate.name : '未命名2024角色',
        ruleset: '5e-2024',
        targetLevel: typeof candidate.targetLevel === 'number' ? candidate.targetLevel : undefined,
        raw,
      }]
    })
  },
  saveAll(drafts: readonly CharacterDraft[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}
