import { isRulesetId } from '@/rules/ruleset-ids'
import type { CharacterDraft, LegacyDraftRecord } from '@/types/character'

export const STORAGE_KEY = 'dnd-character-builder:drafts:v10'
const V9_STORAGE_KEY = 'dnd-character-builder:drafts:v9'
const V8_STORAGE_KEY = 'dnd-character-builder:drafts:v8'
const V7_STORAGE_KEY = 'dnd-character-builder:drafts:v7'
const V6_STORAGE_KEY = 'dnd-character-builder:drafts:v6'
const V5_STORAGE_KEY = 'dnd-character-builder:drafts:v5'
const V4_STORAGE_KEY = 'dnd-character-builder:drafts:v4'
const V3_STORAGE_KEY = 'dnd-character-builder:drafts:v3'
const V2_STORAGE_KEY = 'dnd-character-builder:drafts:v2'
const LEGACY_STORAGE_KEY = 'dnd-character-builder:drafts:v1'

export const PREVIOUS_DRAFT_KEYS = [V9_STORAGE_KEY, V8_STORAGE_KEY, V7_STORAGE_KEY, V6_STORAGE_KEY, V5_STORAGE_KEY, V4_STORAGE_KEY, V3_STORAGE_KEY, V2_STORAGE_KEY] as const

export function readDraftArray(key: string): readonly unknown[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function loadLegacyDrafts(): readonly LegacyDraftRecord[] {
  return readDraftArray(LEGACY_STORAGE_KEY).flatMap((raw, index) => {
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
}


export type DraftSummary = Pick<CharacterDraft, 'id' | 'name' | 'ruleset' | 'targetLevel' | 'currentStep' | 'media'>

export function loadDraftSummaries(): readonly DraftSummary[] {
  const summaries = new Map<string, DraftSummary>()
  for (const key of [STORAGE_KEY, ...PREVIOUS_DRAFT_KEYS]) {
    for (const value of readDraftArray(key)) {
      if (!value || typeof value !== 'object') continue
      const draft = value as Partial<CharacterDraft>
      if (typeof draft.id !== 'string' || !draft.id || summaries.has(draft.id)) continue
      const version = draft.schemaVersion
      if (!Number.isInteger(version) || version === undefined || version < 2 || version > 10) continue
      const ruleset = version < 8 ? '5e-2014' : draft.ruleset
      if (!isRulesetId(ruleset)) continue
      const avatar = draft.media?.avatar
      summaries.set(draft.id, {
        id: draft.id,
        name: typeof draft.name === 'string' ? draft.name : '',
        ruleset,
        targetLevel: typeof draft.targetLevel === 'number' ? draft.targetLevel : 1,
        currentStep: draft.currentStep ?? 'setup',
        media: avatar && typeof avatar.mediaId === 'string' ? { avatar } : undefined,
      })
    }
  }
  return [...summaries.values()]
}
