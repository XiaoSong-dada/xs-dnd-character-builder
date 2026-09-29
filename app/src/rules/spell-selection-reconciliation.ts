import {
  getAvailableSpells,
  getRequiredCantripCount,
  getRequiredSpellbookCount,
  getRequiredSpellCount,
  getSpellbookExtraAllowance,
  getSpellcastingConfig,
  usesPreparedSelection,
} from '@/rules/spellcasting'
import type {
  CharacterDraft,
  InactiveSpellBucket,
  InactiveSpellReason,
  InactiveSpellSelection,
  SpellSelections,
} from '@/types/character'

const ACTIVE_BUCKETS = [
  'cantripIds',
  'knownSpellIds',
  'preparedSpellIds',
  'spellbookSpellIds',
  'transcribedSpellIds',
  'spellbookExtraSpellIds',
  'spellbookReservedSpellIds',
] as const satisfies readonly Exclude<InactiveSpellBucket, 'manualAddedSpells'>[]

type ActiveSpellBucket = typeof ACTIVE_BUCKETS[number]

export interface SpellSelectionReconciliationChange {
  readonly nextClassId?: string
  readonly nextSubclassId?: string
  readonly nextTargetLevel: number
  readonly reason: Extract<InactiveSpellReason, 'class-changed' | 'level-reduced' | 'source-removed'>
  readonly invalidatedAt: string
}

export interface SpellSelectionReconciliationResult {
  readonly spellSelections: SpellSelections
  readonly inactiveSpellSelections: readonly InactiveSpellSelection[]
  readonly archived: readonly InactiveSpellSelection[]
}

export interface InactiveSpellRestoreStatus {
  readonly available: boolean
  readonly reason: string
}

function bucketIds(selections: SpellSelections, bucket: ActiveSpellBucket): readonly string[] {
  return selections[bucket] ?? []
}

function inactiveId(
  reason: InactiveSpellReason,
  invalidatedAt: string,
  bucket: ActiveSpellBucket,
  spellId: string,
): string {
  return `inactive-spell:${reason}:${invalidatedAt}:${bucket}:${spellId}`
}

/**
 * 在职业或等级变化发生时，把不再属于当前有效构筑的法术移入历史。
 * 合法但超出新数量上限的项目不会被自动挑选删除，仍留给用户在当前页面处理。
 */
export function reconcileSpellSelections(
  draft: CharacterDraft,
  change: SpellSelectionReconciliationChange,
): SpellSelectionReconciliationResult {
  const nextDraft: CharacterDraft = {
    ...draft,
    classId: change.nextClassId ?? draft.classId,
    subclassId: change.nextSubclassId,
    targetLevel: change.nextTargetLevel,
  }
  const config = getSpellcastingConfig(nextDraft)
  const available = config && nextDraft.targetLevel >= config.startsAtLevel
    ? getAvailableSpells(nextDraft, config)
    : []
  const availableCantrips = new Set(available.filter((spell) => spell.level === 0).map((spell) => spell.id))
  const availableSpells = new Set(available.filter((spell) => spell.level > 0).map((spell) => spell.id))
  const archiveAll = change.reason === 'class-changed'
  const archived: InactiveSpellSelection[] = []
  const existingHistory = [...(draft.inactiveSpellSelections ?? [])]

  const nextBuckets = Object.fromEntries(ACTIVE_BUCKETS.map((bucket) => {
    const retained: string[] = []
    for (const spellId of bucketIds(draft.spellSelections, bucket)) {
      const remainsAvailable = bucket === 'cantripIds' ? availableCantrips.has(spellId) : availableSpells.has(spellId)
      if (!archiveAll && remainsAvailable) {
        retained.push(spellId)
        continue
      }
      if (existingHistory.some((item) => item.spellId === spellId && item.originalBucket === bucket)) continue
      archived.push({
        id: inactiveId(change.reason, change.invalidatedAt, bucket, spellId),
        spellId,
        originalBucket: bucket,
        reason: change.reason,
        sourceKey: draft.classId,
        invalidatedAt: change.invalidatedAt,
      })
    }
    return [bucket, retained]
  })) as unknown as Record<ActiveSpellBucket, readonly string[]>

  // 法术书子集合与准备列表不能引用已退出法术书的项目。
  const retainedBook = new Set(nextBuckets.spellbookSpellIds)
  if (config?.mode === 'spellbook' && !archiveAll) {
    for (const bucket of ['preparedSpellIds', 'transcribedSpellIds', 'spellbookExtraSpellIds', 'spellbookReservedSpellIds'] as const) {
      const retained: string[] = []
      for (const spellId of nextBuckets[bucket]) {
        if (retainedBook.has(spellId)) retained.push(spellId)
        else if (!existingHistory.some((item) => item.spellId === spellId && item.originalBucket === bucket)
          && !archived.some((item) => item.spellId === spellId && item.originalBucket === bucket)) {
          archived.push({
            id: inactiveId(change.reason, change.invalidatedAt, bucket, spellId),
            spellId,
            originalBucket: bucket,
            reason: change.reason,
            sourceKey: draft.classId,
            invalidatedAt: change.invalidatedAt,
          })
        }
      }
      nextBuckets[bucket] = retained
    }
  }

  return {
    spellSelections: {
      cantripIds: nextBuckets.cantripIds,
      knownSpellIds: nextBuckets.knownSpellIds,
      preparedSpellIds: nextBuckets.preparedSpellIds,
      spellbookSpellIds: nextBuckets.spellbookSpellIds,
      transcribedSpellIds: nextBuckets.transcribedSpellIds,
      spellbookExtraSpellIds: nextBuckets.spellbookExtraSpellIds,
      spellbookReservedSpellIds: nextBuckets.spellbookReservedSpellIds,
    },
    inactiveSpellSelections: [...existingHistory, ...archived],
    archived,
  }
}

/** 当前构筑是否允许把某条停用记录恢复到原来的选择集合。 */
export function getInactiveSpellRestoreStatus(
  draft: CharacterDraft,
  entry: InactiveSpellSelection,
): InactiveSpellRestoreStatus {
  if (entry.originalBucket === 'manualAddedSpells') return { available: false, reason: '请从角色卡的人工法术入口重新添加。' }
  const config = getSpellcastingConfig(draft)
  if (!config || draft.targetLevel < config.startsAtLevel) return { available: false, reason: '当前职业或等级没有可用的施法配置。' }
  const spell = getAvailableSpells(draft, config).find((candidate) => candidate.id === entry.spellId)
  if (!spell) return { available: false, reason: '当前职业、等级或来源尚不允许该法术。' }
  const current = bucketIds(draft.spellSelections, entry.originalBucket)
  if (current.includes(entry.spellId)) return { available: false, reason: '该法术已经恢复。' }

  if (entry.originalBucket === 'cantripIds') {
    if (spell.level !== 0) return { available: false, reason: '该记录不是当前可用戏法。' }
    return current.length < getRequiredCantripCount(draft, config)
      ? { available: true, reason: '' }
      : { available: false, reason: '请先腾出一个戏法名额。' }
  }
  if (spell.level === 0) return { available: false, reason: '该记录不能恢复到法术选择。' }

  if (entry.originalBucket === 'knownSpellIds') {
    if (usesPreparedSelection(config)) return { available: false, reason: '当前施法模式不使用已知法术列表。' }
    return current.length < getRequiredSpellCount(draft, config)
      ? { available: true, reason: '' }
      : { available: false, reason: '请先腾出一个已知法术名额。' }
  }
  if (entry.originalBucket === 'preparedSpellIds') {
    if (!usesPreparedSelection(config)) return { available: false, reason: '当前施法模式不使用准备法术列表。' }
    if (config.mode === 'spellbook' && !draft.spellSelections.spellbookSpellIds.includes(entry.spellId)) {
      return { available: false, reason: '请先把该法术恢复到法术书。' }
    }
    return current.length < getRequiredSpellCount(draft, config)
      ? { available: true, reason: '' }
      : { available: false, reason: '请先腾出一个准备法术名额。' }
  }
  if (config.mode !== 'spellbook') return { available: false, reason: '当前施法模式没有法术书。' }
  if (entry.originalBucket === 'spellbookSpellIds') {
    const transcribedHistory = draft.inactiveSpellSelections.some((item) =>
      item.spellId === entry.spellId && item.originalBucket === 'transcribedSpellIds')
    const extraHistory = draft.inactiveSpellSelections.some((item) =>
      item.spellId === entry.spellId && item.originalBucket === 'spellbookExtraSpellIds')
    const normalCount = draft.spellSelections.spellbookSpellIds.filter((id) =>
      !(draft.spellSelections.transcribedSpellIds ?? []).includes(id)
      && !(draft.spellSelections.spellbookExtraSpellIds ?? []).includes(id)).length
    return transcribedHistory || extraHistory || normalCount < getRequiredSpellbookCount(draft, config)
      ? { available: true, reason: '' }
      : { available: false, reason: '请先腾出一个正常学习法术名额。' }
  }
  if (!draft.spellSelections.spellbookSpellIds.includes(entry.spellId)) {
    return { available: false, reason: '请先把该法术恢复到法术书。' }
  }
  if (entry.originalBucket === 'spellbookExtraSpellIds'
    && (draft.spellSelections.spellbookExtraSpellIds?.length ?? 0) >= getSpellbookExtraAllowance(draft, config)) {
    return { available: false, reason: '子职额外入书名额已满。' }
  }
  return { available: true, reason: '' }
}

export function restoreInactiveSpellSelection(
  draft: CharacterDraft,
  inactiveIdToRestore: string,
): Pick<CharacterDraft, 'spellSelections' | 'inactiveSpellSelections'> | undefined {
  const entry = draft.inactiveSpellSelections.find((item) => item.id === inactiveIdToRestore)
  if (!entry || !getInactiveSpellRestoreStatus(draft, entry).available || entry.originalBucket === 'manualAddedSpells') return undefined
  const bucket = entry.originalBucket
  return {
    spellSelections: {
      ...draft.spellSelections,
      [bucket]: [...bucketIds(draft.spellSelections, bucket), entry.spellId],
    },
    inactiveSpellSelections: draft.inactiveSpellSelections.filter((item) => item.id !== entry.id),
  }
}

export function deleteInactiveSpellSelection(
  draft: CharacterDraft,
  inactiveIdToDelete: string,
): readonly InactiveSpellSelection[] {
  return draft.inactiveSpellSelections.filter((item) => item.id !== inactiveIdToDelete)
}
