import {
  getAvailableSpells,
  getRequiredCantripCount,
  getRequiredSpellbookCount,
  getRequiredSpellCount,
  getSpellbookExtraAllowance,
  getSpellcastingConfig,
  getSpellcastingScope,
  usesPreparedSelection,
} from '@/rules/spellcasting'
import type {
  CharacterDraft,
  InactiveSpellBucket,
  InactiveSpellReason,
  InactiveSpellSelection,
  SpellSelections,
} from '@/types/character'
import type { MulticlassState } from '@/types/multiclass'

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
  /**
   * 分配变更后的职业集合（MC-D04）。提供时按**各职业自己的作用域**核对法术，
   * 并把丢失法术的 `sourceKey` 写成它真正所属的职业；省略时保持单职业口径。
   */
  readonly nextMulticlass?: MulticlassState
  /** 被移除的职业 id（即使 `nextMulticlass` 不再包含它们，也能把其法术正确归档）。 */
  readonly removedClassIds?: readonly string[]
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

function reservationCheckpointRemainsActive(checkpointId: string, classId: string | undefined, targetLevel: number): boolean {
  if (checkpointId.startsWith('wizard-2014-spell-mastery-')) return classId === 'class-2014-wizard' && targetLevel >= 18
  if (checkpointId.startsWith('wizard-2014-signature-spells-')) return classId === 'class-2014-wizard' && targetLevel >= 20
  if (checkpointId.startsWith('class-2024-wizard-spell-mastery-')) return classId === 'class-2024-wizard' && targetLevel >= 18
  if (checkpointId.startsWith('class-2024-wizard-signature-spells-')) return classId === 'class-2024-wizard' && targetLevel >= 20
  return false
}

/**
 * 在职业或等级变化发生时，把不再属于当前有效构筑的法术移入历史。
 * 合法但超出新数量上限的项目不会被自动挑选删除，仍留给用户在当前页面处理。
 *
 * 兼职口径（MC-D04）：提供 `nextMulticlass` 时逐职业核对——被移除职业的法术按
 * **该职业自己的作用域**判失效，`sourceKey` 写成它真正所属的职业，因此停用记录能区分
 * 「是哪个职业丢失的法术」。
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
    ...(change.nextMulticlass ? { multiclass: change.nextMulticlass } : {}),
  }
  const config = getSpellcastingConfig(nextDraft)
  const available = config && nextDraft.targetLevel >= config.startsAtLevel
    ? getAvailableSpells(nextDraft, config)
    : []
  const availableCantrips = new Set(available.filter((spell) => spell.level === 0).map((spell) => spell.id))
  const availableSpells = new Set(available.filter((spell) => spell.level > 0).map((spell) => spell.id))
  const archiveAll = change.reason === 'class-changed'
  const activeReservationIds = new Set(draft.selections
    .filter((selection) => !selection.invalidatedAt
      && reservationCheckpointRemainsActive(selection.checkpointId, nextDraft.classId, nextDraft.targetLevel))
    .flatMap((selection) => selection.optionIds))
  const archived: InactiveSpellSelection[] = []
  const existingHistory = [...(draft.inactiveSpellSelections ?? [])]

  /** 该法术在变更后是否仍属于此职业的可用列表（用于逐职业核对）。 */
  function remainsForClass(spellId: string, classId: string, isCantrip: boolean): boolean {
    const scope = getSpellcastingScope(nextDraft, classId)
    if (!scope) return false
    return getAvailableSpells(nextDraft, scope.config, scope)
      .some((spell) => spell.id === spellId && (isCantrip ? spell.level === 0 : spell.level > 0))
  }

  const nextBuckets = Object.fromEntries(ACTIVE_BUCKETS.map((bucket) => {
    const retained: string[] = []
    for (const spellId of bucketIds(draft.spellSelections, bucket)) {
      const remainsAvailable = bucket === 'cantripIds'
        ? availableCantrips.has(spellId)
        : availableSpells.has(spellId) && (bucket !== 'spellbookReservedSpellIds' || activeReservationIds.has(spellId))
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

  // 按职业分桶的核对（MC-D04）：被移除职业的法术带上归属职业的 sourceKey。
  const removedClassIds = new Set(change.removedClassIds ?? [])
  const perClassHistory = new Map<string, string[]>()
  if (change.nextMulticlass) {
    for (const bucket of draft.spellSelections.classSpellSelections ?? []) {
      const retainedCantrips: string[] = []
      const retainedKnown: string[] = []
      const retainedPrepared: string[] = []
      const retainedBook: string[] = []
      const removed = removedClassIds.has(bucket.classId)
      for (const [key, target] of [
        ['cantripIds', retainedCantrips],
        ['knownSpellIds', retainedKnown],
        ['preparedSpellIds', retainedPrepared],
        ['spellbookSpellIds', retainedBook],
      ] as const) {
        for (const spellId of bucket[key] ?? []) {
          const isCantrip = key === 'cantripIds'
          const remains = !removed && remainsForClass(spellId, bucket.classId, isCantrip)
          if (remains) { target.push(spellId); continue }
          if (existingHistory.some((item) => item.spellId === spellId && item.originalBucket === key)) continue
          if (archived.some((item) => item.spellId === spellId && item.originalBucket === key)) continue
          archived.push({
            id: inactiveId(change.reason, change.invalidatedAt, key, spellId),
            spellId,
            originalBucket: key,
            reason: change.reason,
            sourceKey: bucket.classId,
            invalidatedAt: change.invalidatedAt,
          })
        }
      }
      perClassHistory.set(bucket.classId, [...new Set([
        ...retainedCantrips, ...retainedKnown, ...retainedPrepared, ...retainedBook,
      ])])
    }
  }
  const nextClassSpellSelections = change.nextMulticlass
    ? (draft.spellSelections.classSpellSelections ?? []).map((bucket) => {
        const retained = new Set(perClassHistory.get(bucket.classId) ?? [])
        return {
          ...bucket,
          cantripIds: bucket.cantripIds.filter((id) => retained.has(id)),
          knownSpellIds: bucket.knownSpellIds.filter((id) => retained.has(id)),
          preparedSpellIds: bucket.preparedSpellIds.filter((id) => retained.has(id)),
          spellbookSpellIds: bucket.spellbookSpellIds.filter((id) => retained.has(id)),
        }
      })
    : undefined

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
      ...(nextClassSpellSelections ? { classSpellSelections: nextClassSpellSelections } : {}),
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
      && (!(draft.spellSelections.spellbookExtraSpellIds ?? []).includes(id)
        || (draft.spellSelections.spellbookReservedSpellIds ?? []).includes(id))).length
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
