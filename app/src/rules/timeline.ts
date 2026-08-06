import { rulesRepository } from '@/rules/repository'
import { FEAT_OPTION_IDS } from '@/rules/data/feats-2014'
import { getPlayerSubclassIds2014 } from '@/rules/data/subclasses-2014'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
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
  /** 已选子职：用于追加该子职需要玩家完成的特性选择检查点。 */
  readonly subclassId?: string
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

/** 已由职业时间线检查点承接选择、不再生成特性检查点的特性（如战斗大师战技）。 */
const SUBCLASS_FEATURE_CHECKPOINT_EXCLUSIONS = new Set([
  'fighter-battle-master-combat-superiority',
])

function buildSubclassFeatureCheckpoints(subclassId: string): readonly ChoiceCheckpoint[] {
  return getSubclassFeatures2014(subclassId)
    .filter((feature) =>
      feature.requiresChoice
      && (feature.optionIds?.length ?? 0) > 0
      && !SUBCLASS_FEATURE_CHECKPOINT_EXCLUSIONS.has(feature.id),
    )
    .map((feature) => ({
      id: `subclass-feature-${feature.id}`,
      level: feature.level,
      step: 'timeline' as const,
      kind: 'subclass-feature' as const,
      title: `选择${feature.name}`,
      description: feature.summary,
      required: true,
      minSelections: 1,
      maxSelections: 1,
      optionIds: feature.optionIds ?? [],
    }))
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
    ...(context.subclassId ? buildSubclassFeatureCheckpoints(context.subclassId) : []),
  ]
    .filter((checkpoint) => checkpoint.level <= targetLevel)
    .sort((left, right) => left.level - right.level)
}
