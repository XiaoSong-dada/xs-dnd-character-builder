import { rulesRepository } from '@/rules/repository'
import type { ChoiceCheckpoint } from '@/types/rules'

const variantHumanCheckpoint: ChoiceCheckpoint = {
  id: 'race-2014-human-variant-feat-1',
  level: 1,
  step: 'timeline',
  kind: 'class-choice',
  title: '选择变体人类专长',
  description: '变体人类属于2014可选规则，并在1级获得一项专长。',
  required: true,
  minSelections: 1,
  maxSelections: 1,
  optionIds: ['feat-alert', 'feat-great-weapon-master', 'feat-sentinel'],
}

export interface TimelineContext {
  readonly subraceId?: string
}

export function buildTimeline(classId: string, targetLevel: number, context: TimelineContext = {}): readonly ChoiceCheckpoint[] {
  const classRule = rulesRepository.getClass(classId)
  if (!classRule) return []
  return [
    ...(context.subraceId === 'race-2014-human-variant' ? [variantHumanCheckpoint] : []),
    ...classRule.checkpoints,
  ]
    .filter((checkpoint) => checkpoint.level <= targetLevel)
    .sort((left, right) => left.level - right.level)
}
