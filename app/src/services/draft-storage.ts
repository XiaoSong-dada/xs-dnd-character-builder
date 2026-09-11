import type { AbilityKey, CharacterDraft, CharacterMedia, LegacyDraftRecord, SpellSelections } from '@/types/character'
import { EMPTY_CURRENCY } from '@/rules/starting-equipment'
import { inferEnabledSourceIds, normalizeEnabledSourceIds } from '@/rules/source-books'
import { rulesRepository } from '@/rules/repository'
import { EMPTY_MANUAL_EDITS, normalizeManualEdits } from '@/rules/manual-edits'
import { isRulesetId } from '@/rules/repositories'

const STORAGE_KEY = 'dnd-character-builder:drafts:v8'
/** 无法解析的当前键条目隔离区；与草稿键分开，避免被 saveAll 覆盖。 */
const QUARANTINE_KEY = 'dnd-character-builder:drafts:unsupported:v1'
const V7_STORAGE_KEY = 'dnd-character-builder:drafts:v7'
const V6_STORAGE_KEY = 'dnd-character-builder:drafts:v6'
const V5_STORAGE_KEY = 'dnd-character-builder:drafts:v5'
const V4_STORAGE_KEY = 'dnd-character-builder:drafts:v4'
const V3_STORAGE_KEY = 'dnd-character-builder:drafts:v3'
const V2_STORAGE_KEY = 'dnd-character-builder:drafts:v2'
const LEGACY_STORAGE_KEY = 'dnd-character-builder:drafts:v1'

const SUPPORTED_SCHEMA_VERSIONS = new Set([2, 3, 4, 5, 6, 7, 8])
const MIGRATABLE_SCHEMA_VERSIONS = new Set([2, 3, 4, 5, 6, 7])

interface QuarantinedDraftRecord {
  readonly fingerprint: string
  readonly raw: unknown
  readonly reason: string
  readonly detectedAt: string
}

/** 隔离区写入失败时的暂存条目；saveAll 会回写当前键，避免静默丢失。 */
let pendingRejections: readonly unknown[] = []

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
  return draft.schemaVersion === 8 && isRulesetId(draft.ruleset) && typeof draft.id === 'string'
}

function normalizeMedia(value: unknown): CharacterMedia | undefined {
  if (!value || typeof value !== 'object') return undefined
  const media = value as Record<string, unknown>
  const normalizeRef = (candidate: unknown) => {
    if (!candidate || typeof candidate !== 'object') return undefined
    const ref = candidate as Record<string, unknown>
    if (typeof ref.mediaId !== 'string' || ref.mimeType !== 'image/webp') return undefined
    if (!Number.isFinite(ref.width) || !Number.isFinite(ref.height)) return undefined
    const base = { mediaId: ref.mediaId, mimeType: 'image/webp' as const, width: Number(ref.width), height: Number(ref.height) }
    return base
  }
  const avatar = normalizeRef(media.avatar)
  const portraitBase = normalizeRef(media.portrait)
  const portraitSource = media.portrait as Record<string, unknown> | undefined
  const portrait = portraitBase && portraitSource ? {
    ...portraitBase,
    focusX: Math.min(1, Math.max(0, Number(portraitSource.focusX) || 0.5)),
    focusY: Math.min(1, Math.max(0, Number(portraitSource.focusY) || 0.5)),
  } : undefined
  return avatar || portrait ? { avatar, portrait } : undefined
}

/** 2014 只保留本版可选来源；2024 来源规则由 B06 接入，当前只去重、不套用 2014 白名单。 */
function normalizeDraftSourceIds(draft: CharacterDraft): readonly string[] {
  if (draft.ruleset === '5e-2014') return normalizeEnabledSourceIds(draft.enabledSourceIds)
  return [...new Set(draft.enabledSourceIds ?? [])]
}

/** 2024 背景属性分配：只保留六项属性中 1／2 的整数值。 */
function normalizeBackgroundAbilityAllocation(value: unknown): Readonly<Partial<Record<AbilityKey, number>>> {
  if (!value || typeof value !== 'object') return {}
  const source = value as Record<string, unknown>
  const allocation: Partial<Record<AbilityKey, number>> = {}
  for (const key of ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const) {
    const amount = source[key]
    if (amount === 1 || amount === 2) allocation[key] = amount
  }
  return allocation
}

function normalizeDraft(draft: CharacterDraft): CharacterDraft {
  return {
    ...draft,
    enabledSourceIds: normalizeDraftSourceIds(draft),
    backgroundAbilityAllocation: normalizeBackgroundAbilityAllocation(draft.backgroundAbilityAllocation),
    speciesSizeChoice: draft.speciesSizeChoice === 'small' || draft.speciesSizeChoice === 'medium' ? draft.speciesSizeChoice : undefined,
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
    media: normalizeMedia(draft.media),
  }
}

/** v2—v7 统一迁移入口；旧格式均为 2014 草稿，无法识别的记录返回 undefined。 */
export function migrateDraftToV8(value: unknown): CharacterDraft | undefined {
  if (!value || typeof value !== 'object') return undefined
  const draft = value as Record<string, unknown>
  const oldVersion = Number(draft.schemaVersion)
  if (!MIGRATABLE_SCHEMA_VERSIONS.has(oldVersion) || draft.ruleset !== '5e-2014' || typeof draft.id !== 'string') return undefined
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
    schemaVersion: 8,
    currentStep: draft.currentStep === 'preferences' ? 'sources' : draft.currentStep,
    enabledSourceIds,
    startingEquipmentSelections: oldVersion === 2 ? [] : draft.startingEquipmentSelections,
    inventory: migratedInventory,
    infusionAssignments: oldVersion >= 5 ? draft.infusionAssignments : [],
    currency: oldVersion === 2 ? EMPTY_CURRENCY : draft.currency,
    adventureGold: oldVersion === 2 ? 0 : draft.adventureGold,
    equipmentNeedsReview: oldVersion === 2 ? true : draft.equipmentNeedsReview,
    manualEdits: oldVersion >= 6 ? draft.manualEdits : EMPTY_MANUAL_EDITS,
    media: oldVersion >= 7 ? draft.media : undefined,
  } as unknown as CharacterDraft)
}

/** 当前键与导入共用的解析入口：v8 记录规范化，v2—v7 记录迁移；其余返回 undefined。 */
export function parseCharacterDraft(value: unknown): CharacterDraft | undefined {
  if (isDraft(value)) return normalizeDraft(value)
  return migrateDraftToV8(value)
}

/** 兼容旧调用名；统一返回当前 v8 草稿。 */
export const migrateDraftToV7 = migrateDraftToV8
export const migrateDraftToV6 = migrateDraftToV8
export const migrateDraftToV5 = migrateDraftToV8

/** 无法解析条目的中文原因；与 JSON 导入提示保持一致。 */
function draftFailureReason(value: unknown): string {
  if (!value || typeof value !== 'object') return '角色数据不是有效对象。'
  const candidate = value as Record<string, unknown>
  const schemaVersion = Number(candidate.schemaVersion)
  if (!SUPPORTED_SCHEMA_VERSIONS.has(schemaVersion)) return '角色文件版本不受支持。'
  const ruleset = candidate.ruleset
  if (typeof ruleset !== 'string' || ruleset.length === 0) return '角色文件缺少有效的规则版本。'
  if (!isRulesetId(ruleset)) return `不支持的规则版本：${ruleset}。`
  if (schemaVersion < 8 && ruleset === '5e-2024') return '该文件是旧版 2024 草稿格式，暂不支持导入；请保留原文件作为备份。'
  return '角色文件缺少必要字段。'
}

function isQuarantinedRecord(value: unknown): value is QuarantinedDraftRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<QuarantinedDraftRecord>
  return typeof record.fingerprint === 'string'
    && typeof record.reason === 'string'
    && typeof record.detectedAt === 'string'
    && 'raw' in record
}

function fingerprintOf(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

/** 隔离保留无法解析的当前键条目；写入失败时留在内存，由 saveAll 回写当前键。 */
function quarantineRejected(entries: readonly unknown[]): void {
  if (entries.length === 0) return
  try {
    const stored = readArray(QUARANTINE_KEY).filter(isQuarantinedRecord)
    const fingerprints = new Set(stored.map((record) => record.fingerprint))
    const detectedAt = new Date().toISOString()
    const additions = entries.flatMap((raw) => {
      const fingerprint = fingerprintOf(raw)
      if (fingerprints.has(fingerprint)) return []
      fingerprints.add(fingerprint)
      return [{ fingerprint, raw, reason: draftFailureReason(raw), detectedAt }]
    })
    if (additions.length > 0) localStorage.setItem(QUARANTINE_KEY, JSON.stringify([...stored, ...additions]))
    pendingRejections = []
  } catch {
    pendingRejections = entries
  }
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
    const current: CharacterDraft[] = []
    const rejected: unknown[] = []
    for (const entry of readArray(STORAGE_KEY)) {
      const draft = parseCharacterDraft(entry)
      if (draft) current.push(draft)
      else rejected.push(entry)
    }
    quarantineRejected(rejected)
    const seenIds = new Set(current.map((draft) => draft.id))
    const migrated = [
      ...readArray(V7_STORAGE_KEY).map(migrateDraftToV8),
      ...readArray(V6_STORAGE_KEY).map(migrateDraftToV8),
      ...readArray(V5_STORAGE_KEY).map(migrateDraftToV8),
      ...readArray(V4_STORAGE_KEY).map(migrateDraftToV8),
      ...readArray(V3_STORAGE_KEY).map(migrateDraftToV8),
      ...readArray(V2_STORAGE_KEY).map(migrateDraftToV8),
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
    const payload: readonly unknown[] = pendingRejections.length > 0 ? [...drafts, ...pendingRejections] : drafts
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}
