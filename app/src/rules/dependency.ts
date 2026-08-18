import { deriveCharacter, proficiencyBonus } from '@/rules/derive'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import { rulesRepository } from '@/rules/repository'
import { buildTimeline } from '@/rules/timeline'
import type { CharacterDraft, DependencyCheckpointRef, DependencyImpact } from '@/types/character'
import type { CheckpointKind } from '@/types/rules'

export type DraftChange =
  | { readonly kind: 'target-level'; readonly value: number }
  | { readonly kind: 'class'; readonly value: string }
  | { readonly kind: 'subclass'; readonly value: string }
  | { readonly kind: 'race'; readonly value: string }
  | { readonly kind: 'subrace'; readonly value?: string }
  | { readonly kind: 'background'; readonly value: string }
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
  return buildTimeline(draft.classId ?? '', level, { subraceId: draft.subraceId, subclassId: draft.subclassId })
    .filter((checkpoint) => checkpoint.kind === kind).length
}

/** 统计某目标等级时间线中战技选择检查点的数量（战技选项统一 maneuver- 前缀）。 */
function countManeuverCheckpoints(draft: CharacterDraft, level: number): number {
  return buildTimeline(draft.classId ?? '', level, { subraceId: draft.subraceId, subclassId: draft.subclassId })
    .filter((checkpoint) => checkpoint.optionIds.length > 0 && checkpoint.optionIds.every((optionId) => optionId.startsWith('maneuver-')))
    .length
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
    const featureCount = (level: number): number =>
      getSubclassFeatures2014(draft.subclassId ?? '').filter((feature) => feature.level <= level).length
    const oldFeatures = featureCount(oldLevel)
    const newFeatures = featureCount(newLevel)
    if (newFeatures < oldFeatures) reviews.push(`子职特性由 ${oldFeatures} 项减少为 ${newFeatures} 项（更高等级的特性不再生效）`)
  }
  const classRule = draft.classId ? rulesRepository.getClass(draft.classId) : undefined
  const knownByLevel = classRule?.spellcasting?.mode === 'known' ? classRule.spellcasting.spellsKnownByLevel : undefined
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
    const context = { subraceId: draft.subraceId, subclassId: draft.subclassId }
    const oldTimeline = buildTimeline(draft.classId ?? '', draft.targetLevel, context)
    const newTimeline = buildTimeline(draft.classId ?? '', change.value, context)
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
      invalidatedDetails: invalidatedIds.length ? invalidatedDetails : undefined,
      reviews: change.value < draft.targetLevel ? buildLevelReductionReviews(draft, change.value) : undefined,
    }
  }
  if (change.kind === 'race' || change.kind === 'subrace') {
    return {
      invalidated: draft.selections
        .filter((item) => item.checkpointId.startsWith('race-2014-'))
        .map((item) => item.checkpointId),
      review: ['种族属性加值', '专长前置条件', '生命值、护甲等级与攻击'],
      preserved: ['职业选择', '背景选择', '姓名与人物细节'],
    }
  }
  if (change.kind === 'background') {
    return {
      invalidated: [],
      review: ['背景技能、工具与语言', '重复熟练替换'],
      preserved: ['职业选择', '种族选择', '等级时间线'],
    }
  }
  return {
    invalidated: [],
    review: ['HP', 'AC', '攻击与技能'],
    preserved: ['职业与等级', '姓名与人物细节'],
  }
}
