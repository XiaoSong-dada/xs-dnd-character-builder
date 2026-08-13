import type { CharacterDraft, LegacyDraftRecord } from '@/types/character'
import { EMPTY_CURRENCY } from '@/rules/starting-equipment'

const STORAGE_KEY = 'dnd-character-builder:drafts:v3'
const PREVIOUS_STORAGE_KEY = 'dnd-character-builder:drafts:v2'
const LEGACY_STORAGE_KEY = 'dnd-character-builder:drafts:v1'

function isDraft(value: unknown): value is CharacterDraft {
  if (!value || typeof value !== 'object') return false
  const draft = value as Partial<CharacterDraft>
  return draft.schemaVersion === 3 && draft.ruleset === '5e-2014' && typeof draft.id === 'string'
}

function normalizeDraft(draft: CharacterDraft): CharacterDraft {
  return {
    ...draft,
    raceAbilityChoices: draft.raceAbilityChoices ?? [],
    backgroundSkillIds: draft.backgroundSkillIds ?? [],
    backgroundToolIds: draft.backgroundToolIds ?? [],
    languages: draft.languages ?? [],
    proficiencyReplacements: draft.proficiencyReplacements ?? [],
    startingEquipmentSelections: draft.startingEquipmentSelections ?? [],
    inventory: draft.inventory ?? [],
    currency: draft.currency ?? EMPTY_CURRENCY,
    adventureGold: draft.adventureGold ?? 0,
    equipmentNeedsReview: draft.equipmentNeedsReview ?? false,
    spellSelections: draft.spellSelections ?? {
      cantripIds: [],
      knownSpellIds: [],
      preparedSpellIds: [],
      spellbookSpellIds: [],
    },
  }
}

function migrateV2(value: unknown): CharacterDraft | undefined {
  if (!value || typeof value !== 'object') return undefined
  const draft = value as Record<string, unknown>
  if (draft.schemaVersion !== 2 || draft.ruleset !== '5e-2014' || typeof draft.id !== 'string') return undefined
  const inventoryItemIds = Array.isArray(draft.inventoryItemIds)
    ? draft.inventoryItemIds.filter((item): item is string => typeof item === 'string')
    : []
  const equippedItemIds = new Set(Array.isArray(draft.equippedItemIds)
    ? draft.equippedItemIds.filter((item): item is string => typeof item === 'string')
    : [])
  const quantityById = new Map<string, number>()
  for (const itemId of inventoryItemIds) quantityById.set(itemId, (quantityById.get(itemId) ?? 0) + 1)
  return normalizeDraft({
    ...draft,
    schemaVersion: 3,
    startingEquipmentSelections: [],
    inventory: [...quantityById].map(([itemId, quantity]) => ({
      id: `legacy:${draft.id}:${itemId}`,
      itemId,
      quantity,
      sourceKind: 'legacy' as const,
      sourceId: draft.id as string,
      equippedQuantity: equippedItemIds.has(itemId) ? 1 : 0,
    })),
    currency: EMPTY_CURRENCY,
    equipmentNeedsReview: true,
  } as unknown as CharacterDraft)
}

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
    const currentIds = new Set(current.map((draft) => draft.id))
    const migrated = readArray(PREVIOUS_STORAGE_KEY)
      .map(migrateV2)
      .filter((draft): draft is CharacterDraft => Boolean(draft && !currentIds.has(draft.id)))
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
