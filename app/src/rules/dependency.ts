import { buildTimeline } from '@/rules/timeline'
import type { CharacterDraft, DependencyImpact } from '@/types/character'

export type DraftChange =
  | { readonly kind: 'target-level'; readonly value: number }
  | { readonly kind: 'class'; readonly value: string }
  | { readonly kind: 'subclass'; readonly value: string }
  | { readonly kind: 'race'; readonly value: string }
  | { readonly kind: 'subrace'; readonly value?: string }
  | { readonly kind: 'background'; readonly value: string }
  | { readonly kind: 'abilities' }

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
        .filter((item) => item.checkpointId.includes('-subclass-'))
        .map((item) => item.checkpointId),
      review: ['子职特性选择', '子职派生值', '角色卡子职部分'],
      preserved: ['职业与等级', '起源', '基础属性'],
    }
  }
  if (change.kind === 'target-level') {
    const validIds = new Set(buildTimeline(draft.classId ?? '', change.value, { subraceId: draft.subraceId }).map((item) => item.id))
    return {
      invalidated: draft.selections.filter((item) => !validIds.has(item.checkpointId)).map((item) => item.checkpointId),
      review: ['生命值', '熟练加值', '等级相关资源'],
      preserved: ['职业', '起源', '基础属性'],
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
