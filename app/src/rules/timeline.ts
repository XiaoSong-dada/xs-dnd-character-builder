import { rulesRepository } from '@/rules/repository'
import { FEAT_OPTION_IDS } from '@/rules/data/feats-2014'
import { getPlayerSubclassIds2014 } from '@/rules/data/subclasses-2014'
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
  optionIds: FEAT_OPTION_IDS,
}

export interface TimelineContext {
  readonly subraceId?: string
}

const subclassTitles: Readonly<Record<string, string>> = {
  'class-2014-barbarian': '选择原初道途',
  'class-2014-bard': '选择吟游学院',
  'class-2014-cleric': '选择神圣领域',
  'class-2014-druid': '选择德鲁伊结社',
  'class-2014-fighter': '选择武术范型',
  'class-2014-monk': '选择武僧宗门',
  'class-2014-paladin': '选择神圣誓言',
  'class-2014-ranger': '选择游侠范型',
  'class-2014-rogue': '选择游荡者范型',
  'class-2014-sorcerer': '选择术法起源',
  'class-2014-warlock': '选择超凡宗主',
  'class-2014-wizard': '选择奥术传承',
}

function buildSubclassCheckpoint(classId: string): ChoiceCheckpoint | undefined {
  const optionIds = getPlayerSubclassIds2014(classId)
  if (optionIds.length === 0) return undefined
  const firstSubclass = rulesRepository.getSubclass(optionIds[0] ?? '')
  if (!firstSubclass) return undefined
  return {
    id: `${classId}-subclass-${firstSubclass.selectionLevel}`,
    level: firstSubclass.selectionLevel,
    step: 'timeline',
    kind: 'subclass',
    title: subclassTitles[classId] ?? '选择子职业',
    description: '浏览当前项目登记的全部 2014 子职业；仅索引内容会明确标注，DM 专用选项不在普通车卡中开放。',
    required: true,
    minSelections: 1,
    maxSelections: 1,
    optionIds,
  }
}

export function buildTimeline(classId: string, targetLevel: number, context: TimelineContext = {}): readonly ChoiceCheckpoint[] {
  const classRule = rulesRepository.getClass(classId)
  if (!classRule) return []
  const subclassCheckpoint = buildSubclassCheckpoint(classId)
  const classCheckpoints = classRule.checkpoints.map((checkpoint) =>
    checkpoint.kind === 'subclass' && subclassCheckpoint
      ? { ...checkpoint, optionIds: subclassCheckpoint.optionIds }
      : checkpoint,
  )
  if (subclassCheckpoint && !classCheckpoints.some((checkpoint) => checkpoint.kind === 'subclass')) {
    classCheckpoints.push(subclassCheckpoint)
  }
  return [
    ...(context.subraceId === 'race-2014-human-variant' ? [variantHumanCheckpoint] : []),
    ...classCheckpoints,
  ]
    .filter((checkpoint) => checkpoint.level <= targetLevel)
    .sort((left, right) => left.level - right.level)
}
