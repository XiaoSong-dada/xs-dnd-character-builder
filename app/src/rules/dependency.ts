import { deriveCharacter, proficiencyBonus } from '@/rules/derive'
import { getRulesRepository } from '@/rules/repositories'
import { getCheckpointSelectionBounds } from '@/rules/feats'
import { buildTimelineForDraft } from '@/rules/timeline'
import { getClassEntries, rebuildLevelOrder } from '@/rules/multiclass'
import { getRequiredCantripCount, getRequiredSpellbookCount, getRequiredSpellCount, getSelectedSpellIds, getSpellcastingConfig } from '@/rules/spellcasting'
import type { CharacterDraft, DependencyCheckpointRef, DependencyImpact } from '@/types/character'
import type { ClassLevelEntry } from '@/types/multiclass'
import type { CheckpointKind } from '@/types/rules'

export type DraftChange =
  | { readonly kind: 'target-level'; readonly value: number }
  | { readonly kind: 'class'; readonly value: string }
  | { readonly kind: 'subclass'; readonly value: string }
  /**
   * 兼职等级分配变更（MC-C03，决策 D2／D5／D6）：
   * 提升某职业、新增职业、移除职业、关闭开关触发的合并都走这一种变更。
   */
  | {
    readonly kind: 'class-allocation'
    readonly classes: readonly ClassLevelEntry[]
    readonly levelOrder?: readonly string[]
    readonly enabled?: boolean
    readonly primaryClassId?: string
  }
  | { readonly kind: 'race'; readonly value: string }
  | { readonly kind: 'subrace'; readonly value?: string }
  | { readonly kind: 'background'; readonly value: string; readonly previousValue?: string }
  | { readonly kind: 'abilities' }

/** 界面展示用的检查点标签：等级 + 标题。 */
function checkpointLabel(level: number, title: string): string {
  return `${level}级 · ${title}`
}

/** 当前草稿中某检查点已完成（未失效）的选择数量。 */
function completedSelectionCount(draft: CharacterDraft, checkpointId: string): number {
  return draft.selections.find((item) => item.checkpointId === checkpointId && !item.invalidatedAt)?.optionIds.length ?? 0
}

/** 统计某目标等级时间线中指定类型检查点的数量。 */
function countCheckpointKind(draft: CharacterDraft, level: number, kind: CheckpointKind): number {
  return buildTimelineForDraft(draft, { targetLevelOverride: level })
    .filter((checkpoint) => checkpoint.kind === kind).length
}

/** 统计某目标等级时间线中战技选择检查点的数量（战技选项统一 maneuver- 前缀）。 */
function countManeuverCheckpoints(draft: CharacterDraft, level: number): number {
  return buildTimelineForDraft(draft, { targetLevelOverride: level })
    .filter((checkpoint) => checkpoint.optionIds.length > 0 && checkpoint.optionIds.every((optionId) => optionId.startsWith('maneuver-')))
    .length
}

/** 升级时：按新等级统计施法配置需补全的说明（已知/准备/法术书/戏法数量不足时）。 */
function buildSpellUpdates(draft: CharacterDraft, newLevel: number): readonly string[] | undefined {
  const config = getSpellcastingConfig(draft)
  if (!config || newLevel < config.startsAtLevel) return undefined
  const next = { ...draft, targetLevel: newLevel }
  const parts: string[] = []
  const requiredCount = getRequiredSpellCount(next, config)
  const selectedCount = getSelectedSpellIds(draft, config).length
  if (selectedCount < requiredCount) {
    const label = config.mode === 'prepared' || config.mode === 'spellbook' ? '准备法术' : '已知法术'
    parts.push(`${label} ${selectedCount}/${requiredCount}`)
  }
  if (config.mode === 'spellbook') {
    const requiredBook = getRequiredSpellbookCount(next, config)
    const bookCount = draft.spellSelections.spellbookSpellIds.length
    if (bookCount < requiredBook) parts.push(`法术书 ${bookCount}/${requiredBook}`)
  }
  const requiredCantrips = getRequiredCantripCount(next, config)
  const cantripCount = draft.spellSelections.cantripIds.length
  if (cantripCount < requiredCantrips) parts.push(`戏法 ${cantripCount}/${requiredCantrips}`)
  return parts.length > 0 ? parts : undefined
}

/** 降级时按新等级计算"数量减少、需复查"的资源清单。 */
function buildLevelReductionReviews(draft: CharacterDraft, newLevel: number): readonly string[] {
  const oldLevel = draft.targetLevel
  if (!Number.isInteger(oldLevel) || !Number.isInteger(newLevel) || newLevel >= oldLevel) return []
  const reviews: string[] = []
  const oldPb = proficiencyBonus(oldLevel)
  const newPb = proficiencyBonus(newLevel)
  if (newPb !== oldPb) reviews.push(`熟练加值由 +${oldPb} 变为 +${newPb}`)
  const oldAsi = countCheckpointKind(draft, oldLevel, 'ability-improvement')
  const newAsi = countCheckpointKind(draft, newLevel, 'ability-improvement')
  if (newAsi < oldAsi) reviews.push(`属性提升/专长次数由 ${oldAsi} 次减少为 ${newAsi} 次，超出部分的选择将标记失效并需重新分配`)
  const oldManeuvers = countManeuverCheckpoints(draft, oldLevel)
  const newManeuvers = countManeuverCheckpoints(draft, newLevel)
  if (newManeuvers < oldManeuvers) reviews.push(`战技数量由 ${oldManeuvers} 项减少为 ${newManeuvers} 项，需移除多余战技`)
  if (draft.subclassId) {
    const subclassFeatures = getRulesRepository(draft.ruleset).getSubclass(draft.subclassId)?.features ?? []
    const featureCount = (level: number): number =>
      subclassFeatures.filter((feature) => feature.level <= level).length
    const oldFeatures = featureCount(oldLevel)
    const newFeatures = featureCount(newLevel)
    if (newFeatures < oldFeatures) reviews.push(`子职特性由 ${oldFeatures} 项减少为 ${newFeatures} 项（更高等级的特性不再生效）`)
  }
  // 按等级变化的检查点（如 2024 战士武器精通）：降级后数量减少时提示移除多余选择。
  const masteryCheckpoint = buildTimelineForDraft(draft, { targetLevelOverride: oldLevel })
    .find((checkpoint) => checkpoint.candidateKind === 'weapon-mastery')
  if (masteryCheckpoint) {
    const oldBound = getCheckpointSelectionBounds(draft, masteryCheckpoint).max
    const newBound = getCheckpointSelectionBounds({ ...draft, targetLevel: newLevel }, masteryCheckpoint).max
    if (newBound < oldBound) reviews.push(`武器精通数量由 ${oldBound} 项减少为 ${newBound} 项，需移除多余精通`)
  }
  const spellcasting = getSpellcastingConfig(draft)
  const knownByLevel = spellcasting?.mode === 'known' ? spellcasting.spellsKnownByLevel : undefined
  if (knownByLevel) {
    const oldMax = knownByLevel[oldLevel - 1] ?? 0
    const newMax = knownByLevel[newLevel - 1] ?? 0
    const currentKnown = draft.spellSelections.knownSpellIds.length
    if (newMax < currentKnown) reviews.push(`已知法术上限由 ${oldMax} 减少为 ${newMax}，当前已选 ${currentKnown} 个，需移除 ${currentKnown - newMax} 个法术`)
  }
  const oldHp = deriveCharacter(draft).hitPoints.value
  const newHp = deriveCharacter({ ...draft, targetLevel: newLevel }).hitPoints.value
  if (newHp !== oldHp) reviews.push(`生命值上限由 ${oldHp} 变为 ${newHp}（按新等级与体质调整值重算）`)
  return reviews
}

export function getDependencyImpact(draft: CharacterDraft, change: DraftChange): DependencyImpact {
  if (change.kind === 'class') {
    return {
      invalidated: draft.selections.map((item) => item.checkpointId),
      review: ['装备选择', '属性分配'],
      preserved: ['姓名与人物细节', '种族与背景'],
    }
  }
  if (change.kind === 'subclass') {
    return {
      invalidated: draft.selections
        .filter((item) => item.checkpointId.includes('-subclass-') || item.checkpointId.startsWith('subclass-feature-'))
        .map((item) => item.checkpointId),
      review: ['子职特性选择', '子职派生值', '角色卡子职部分'],
      preserved: ['职业与等级', '起源', '基础属性'],
    }
  }
  if (change.kind === 'target-level') {
    if (change.value === draft.targetLevel) {
      return {
        invalidated: [],
        review: ['生命值', '熟练加值', '等级相关资源', '法术位'],
        preserved: ['职业', '起源', '基础属性'],
      }
    }
    const oldTimeline = buildTimelineForDraft(draft)
    const newTimeline = buildTimelineForDraft(draft, { targetLevelOverride: change.value })
    const validIds = new Set(newTimeline.map((item) => item.id))
    const invalidatedIds = draft.selections
      .filter((item) => !validIds.has(item.checkpointId) && !item.invalidatedAt)
      .map((item) => item.checkpointId)
    const titleById = new Map(oldTimeline.map((item) => [item.id, checkpointLabel(item.level, item.title)]))
    const invalidatedDetails: readonly DependencyCheckpointRef[] = invalidatedIds.map((checkpointId) => ({
      checkpointId,
      title: titleById.get(checkpointId) ?? checkpointId,
    }))
    const added: readonly DependencyCheckpointRef[] = change.value > draft.targetLevel
      ? newTimeline
        .filter((checkpoint) => completedSelectionCount(draft, checkpoint.id) < checkpoint.minSelections)
        .map((checkpoint) => ({ checkpointId: checkpoint.id, title: checkpointLabel(checkpoint.level, checkpoint.title) }))
      : []
    return {
      invalidated: invalidatedIds,
      review: ['生命值', '熟练加值', '等级相关资源', '法术位'],
      preserved: ['职业', '起源', '基础属性'],
      added: change.value > draft.targetLevel ? added : undefined,
      spellUpdates: change.value > draft.targetLevel ? buildSpellUpdates(draft, change.value) : undefined,
      invalidatedDetails: invalidatedIds.length ? invalidatedDetails : undefined,
      reviews: change.value < draft.targetLevel ? buildLevelReductionReviews(draft, change.value) : undefined,
    }
  }
  if (change.kind === 'class-allocation') {
    // 兼职等级分配变更（MC-C03）：实现为「旧分配 vs 新分配」两条时间线求差，
    // 与 target-level 分支共用 added / invalidatedDetails / reviews / spellUpdates 语义。
    // 起始职业（SC-A03）：取 `primaryClassId` 而不是 `classes[0]`——允许切换起始职业后两者不再等价，
    // 而 `classId`／`subclassId` 决定装备起始档位、豁免熟练与 1 级生命值。
    const primaryClassId = change.primaryClassId ?? draft.multiclass?.primaryClassId ?? change.classes[0]?.classId
    const nextEntry = change.classes.find((entry) => entry.classId === primaryClassId) ?? change.classes[0]
    const nextClassId = nextEntry?.classId
    if (!nextClassId) {
      return {
        invalidated: draft.selections.map((item) => item.checkpointId),
        review: ['职业与等级', '生命值', '熟练加值', '法术位', '装备选择'],
        preserved: ['姓名与人物细节', '种族与背景'],
      }
    }
    const nextSubclassId = nextEntry?.subclassId
    const primaryChanged = primaryClassId !== undefined && primaryClassId !== (draft.multiclass?.primaryClassId ?? getClassEntries(draft)[0]?.classId)
    const { subclassId: _previousSubclassId, ...withoutSubclass } = draft
    const nextDraft: CharacterDraft = {
      ...(nextSubclassId ? draft : withoutSubclass),
      multiclass: {
        enabled: change.enabled ?? draft.multiclass?.enabled ?? true,
        primaryClassId: primaryClassId ?? nextClassId,
        classes: change.classes,
        levelOrder: change.levelOrder ?? rebuildLevelOrder(change.classes),
      },
      classId: nextClassId,
      targetLevel: change.classes.reduce((sum, entry) => sum + entry.level, 0),
      ...(nextSubclassId ? { subclassId: nextSubclassId } : {}),
    }

    const oldTimeline = buildTimelineForDraft(draft)
    const newTimeline = buildTimelineForDraft(nextDraft)
    const validIds = new Set(newTimeline.map((item) => item.id))
    const invalidatedIds = draft.selections
      .filter((item) => !validIds.has(item.checkpointId) && !item.invalidatedAt)
      .map((item) => item.checkpointId)
    const titleById = new Map(oldTimeline.map((item) => [item.id, checkpointLabel(item.level, item.title)]))
    const invalidatedDetails: readonly DependencyCheckpointRef[] = invalidatedIds.map((checkpointId) => ({
      checkpointId,
      title: titleById.get(checkpointId) ?? checkpointId,
    }))
    const added: readonly DependencyCheckpointRef[] = newTimeline
      .filter((checkpoint) => completedSelectionCount(draft, checkpoint.id) < checkpoint.minSelections)
      .map((checkpoint) => ({ checkpointId: checkpoint.id, title: checkpointLabel(checkpoint.level, checkpoint.title) }))
    const nextTotal = nextDraft.targetLevel
    return {
      invalidated: invalidatedIds,
      review: primaryChanged
        ? ['起始职业已更换（1 级生命值、起始装备、豁免熟练）', '生命值', '熟练加值', '等级相关资源', '法术位与法术归属']
        : ['生命值', '熟练加值', '起始职业豁免熟练', '等级相关资源', '法术位与法术归属'],
      preserved: primaryChanged ? ['起源', '基础属性'] : ['起源', '基础属性', '装备与金币'],
      added,
      spellUpdates: nextTotal > draft.targetLevel ? buildSpellUpdates(draft, nextTotal) : undefined,
      invalidatedDetails: invalidatedIds.length ? invalidatedDetails : undefined,
      reviews: nextTotal < draft.targetLevel ? buildLevelReductionReviews(draft, nextTotal) : undefined,
    }
  }
  if (change.kind === 'race' || change.kind === 'subrace') {
    return {
      invalidated: draft.selections
        .filter((item) => item.checkpointId.startsWith('race-2014-') || item.checkpointId.includes('-origin-feat') || item.checkpointId.includes('-spellcasting-ability'))
        .map((item) => item.checkpointId),
      review: draft.ruleset === '5e-2024'
        ? ['物种体型与语言', '血统／传承法术', '专长前置条件', '生命值、护甲等级与攻击']
        : ['种族属性加值', '专长前置条件', '生命值、护甲等级与攻击'],
      preserved: ['职业选择', '背景选择', '姓名与人物细节'],
    }
  }
  if (change.kind === 'background') {
    // 换背景后旧背景的起源专长选择不再适用（H1）：标为失效，未标失效的孤立选择由规则层兜底过滤。
    const previousId = change.previousValue
    const previousCheckpointId = previousId && previousId !== change.value ? `${previousId}-origin-feat` : undefined
    return {
      invalidated: previousCheckpointId ? [previousCheckpointId] : [],
      review: draft.ruleset === '5e-2024'
        ? ['背景属性加值', '背景技能、工具与语言', '背景授予的起源专长与重复选择', '重复熟练替换']
        : ['背景技能、工具与语言', '重复熟练替换'],
      preserved: ['职业选择', '种族选择', '等级时间线'],
    }
  }
  return {
    invalidated: [],
    review: ['HP', 'AC', '攻击与技能'],
    preserved: ['职业与等级', '姓名与人物细节'],
  }
}
