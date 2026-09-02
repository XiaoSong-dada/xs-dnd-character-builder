import { rulesRepository } from '@/rules/repository'
import { FEAT_OPTION_IDS } from '@/rules/data/feats-2014'
import { getPlayerSubclassIds2014 } from '@/rules/data/subclasses-2014'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import { isSourceEnabled } from '@/rules/source-books'
import type { ChoiceCheckpoint } from '@/types/rules'
import type { ChoiceSelection } from '@/types/character'
import { SKILL_IDS } from '@/rules/derive'

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
  readonly enabledSourceIds?: readonly string[]
  readonly selections?: readonly ChoiceSelection[]
}

const subclassTitles: Readonly<Record<string, string>> = {
  'class-2014-artificer': '选择工匠专职',
  'class-2014-barbarian': '选择原初道途',
  'class-2014-bard': '选择吟游诗人学院',
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

function inferredUniqueGroup(checkpoint: ChoiceCheckpoint): string | undefined {
  if (checkpoint.uniqueGroup) return checkpoint.uniqueGroup
  if (checkpoint.kind === 'expertise') return 'expertise'
  if (checkpoint.optionIds.length > 0 && checkpoint.optionIds.every((id) => id.startsWith('maneuver-'))) return 'battle-master-maneuvers'
  if (checkpoint.optionIds.length > 0 && checkpoint.optionIds.every((id) => id.startsWith('metamagic-'))) return 'sorcerer-metamagic'
  return undefined
}

function buildSubclassCheckpoint(classId: string, enabledSourceIds?: readonly string[]): ChoiceCheckpoint | undefined {
  const optionIds = getPlayerSubclassIds2014(classId).filter((id) => {
    const subclass = rulesRepository.getSubclass(id)
    return Boolean(subclass && (enabledSourceIds === undefined || isSourceEnabled(subclass.sourceIds, enabledSourceIds)))
  })
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

/** 子职特性选择检查点：由 `requiresChoice` 且带选项的特性生成（按特性多选规格）。 */
function buildSubclassFeatureCheckpoints(subclassId: string, enabledSourceIds?: readonly string[]): readonly ChoiceCheckpoint[] {
  return getSubclassFeatures2014(subclassId)
    .filter((feature) =>
      feature.requiresChoice
      && (feature.optionIds?.length ?? 0) > 0,
    )
    .map((feature) => ({
      id: `subclass-feature-${feature.id}`,
      level: feature.level,
      step: 'timeline' as const,
      kind: 'subclass-feature' as const,
      title: `选择${feature.name}`,
      description: feature.summary,
      required: true,
      minSelections: feature.minSelections ?? 1,
      maxSelections: feature.maxSelections ?? 1,
      optionIds: (feature.optionIds ?? []).filter((id) => {
        const option = rulesRepository.getOption(id)
        return !option || enabledSourceIds === undefined || isSourceEnabled(option.sourceIds, enabledSourceIds)
      }),
      uniqueGroup: feature.optionIds?.length && feature.id.includes('arcane-shot') ? 'arcane-archer-shots' : undefined,
    }))
}

function buildFeatChoiceCheckpoints(
  parentCheckpoints: readonly ChoiceCheckpoint[],
  selections: readonly ChoiceSelection[],
): readonly ChoiceCheckpoint[] {
  return parentCheckpoints.flatMap((parent) => {
    const selected = selections.find((item) => item.checkpointId === parent.id && !item.invalidatedAt)
    const feat = selected?.optionIds.flatMap((id) => rulesRepository.getFeat(id) ?? [])[0]
    if (!feat?.choices?.length) return []
    return feat.choices.map((choice) => ({
      id: `feat-child:${parent.id}:${feat.id}:${choice.id}`,
      level: parent.level,
      step: 'timeline' as const,
      kind: choice.candidateKind === 'proficient-skills' ? 'expertise' as const : 'feat-feature' as const,
      title: `${feat.name} · ${choice.title}`,
      description: choice.description,
      required: true,
      minSelections: choice.minSelections,
      maxSelections: choice.maxSelections,
      optionIds: choice.optionIds.length > 0 ? choice.optionIds : SKILL_IDS,
      uniqueGroup: choice.uniqueGroup,
      parentCheckpointId: parent.id,
      parentOptionId: feat.id,
      abilityBonus: choice.abilityBonus,
      grantSavingThrowProficiency: choice.grantSavingThrowProficiency,
    }))
  })
}

export function buildTimeline(classId: string, targetLevel: number, context: TimelineContext = {}): readonly ChoiceCheckpoint[] {
  const classRule = rulesRepository.getClass(classId)
  if (!classRule) return []
  const subclassCheckpoint = buildSubclassCheckpoint(classId, context.enabledSourceIds)
  const classCheckpoints = classRule.checkpoints.map((checkpoint) =>
    checkpoint.kind === 'subclass' && subclassCheckpoint
      ? { ...checkpoint, optionIds: subclassCheckpoint.optionIds }
      : checkpoint,
  )
  if (subclassCheckpoint && !classCheckpoints.some((checkpoint) => checkpoint.kind === 'subclass')) {
    classCheckpoints.push(subclassCheckpoint)
  }
  const baseTimeline = [
    ...(context.subraceId === 'race-2014-human-variant' ? [variantHumanCheckpoint] : []),
    ...classCheckpoints,
    ...(context.subclassId ? buildSubclassFeatureCheckpoints(context.subclassId, context.enabledSourceIds) : []),
  ]
    .filter((checkpoint) => checkpoint.level <= targetLevel)
    .map((checkpoint) => ({
      ...checkpoint,
      uniqueGroup: inferredUniqueGroup(checkpoint),
      optionIds: checkpoint.optionIds.filter((id) => {
        const option = rulesRepository.getOption(id) ?? rulesRepository.getFeat(id)
        return !option || context.enabledSourceIds === undefined || isSourceEnabled(option.sourceIds, context.enabledSourceIds)
      }),
    }))
  return [...baseTimeline, ...buildFeatChoiceCheckpoints(baseTimeline, context.selections ?? [])]
    .sort((left, right) => left.level - right.level)
}
