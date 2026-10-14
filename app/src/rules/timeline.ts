import { getRulesRepository } from '@/rules/repositories'
import { FEAT_OPTION_IDS } from '@/rules/data/feats-2014'
import { buildManualFeatChoiceCheckpoints, getFeatPool } from '@/rules/feats'
import { getClassEntries, getClassSubclassIds, getTotalLevel } from '@/rules/multiclass'
import { isSourceEnabled } from '@/rules/source-books'
import { getSpeciesChoiceCheckpoints } from '@/rules/origins'
import type { CheckpointKind, ChoiceCheckpoint, RulesRepository } from '@/types/rules'
import type { CharacterDraft, ChoiceSelection, ManualFeatGrant, RulesetId } from '@/types/character'
import type { ClassLevelEntry } from '@/types/multiclass'
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
  /** 各职业的子职映射（兼职，MC-C01）；提供时优先于 `subclassId`。 */
  readonly classSubclassIds?: Readonly<Record<string, string | undefined>>
  /** 兼职职业集合；省略时按「`classId` + `targetLevel`」单职业处理。 */
  readonly classes?: readonly ClassLevelEntry[]
  readonly enabledSourceIds?: readonly string[]
  readonly selections?: readonly ChoiceSelection[]
  /** 角色卡手动添加的专长实例；提供时追加实例隔离的必选子检查点。 */
  readonly manualFeatGrants?: readonly ManualFeatGrant[]
  /** 草稿规则版本；省略时按 2014 解析，保持既有调用方行为。 */
  readonly ruleset?: RulesetId
  /** 已选物种：用于展开物种授予的起源专长（如人类 Versatile）。 */
  readonly raceId?: string
  /** 已选背景：用于展开背景授予的二选一起源专长（如鸦阁「起源专长或黑暗赠礼专长」）。 */
  readonly backgroundId?: string
  /** 显式注入仓库（缺省按 `ruleset` 解析）；供测试注入探针数据，运行期调用方无需传入。 */
  readonly repository?: RulesRepository
}

/**
 * 静态选项检查点的默认展示形式：这些检查点的候选卡统一用可展开卡片
 * （`ExpandableOptionCard`）渲染，折叠只显示名称与一行摘要，展开后读详情。
 * 数据层显式声明 `optionPresentation` 时优先，便于将来单独回退为 `card`。
 */
const EXPANDABLE_CHECKPOINT_KINDS = new Set<CheckpointKind>([
  'subclass',
  'subclass-feature',
  'skills',
  'class-choice',
  'expertise',
  'fighting-style',
  'infusion',
])

const subclassTitles: Readonly<Record<string, string>> = {
  'class-2014-artificer': '选择奇械师专职',
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
  // 兼职（MC-E04）：**子职特性**检查点按归属职业限定组名，避免两个职业的子职同组名互相锁死候选。
  //
  // 其余检查点保持全局同名组：职业自带的同类检查点本身就是「同一功能在不同等级再次出现」
  // （如游荡者 1 级与 6 级的专精必须跨等级去重），加了职业前缀会让去重失效。
  const scope = checkpoint.id.startsWith('subclass-feature-') && checkpoint.classId ? `${checkpoint.classId}:` : ''
  if (checkpoint.kind === 'expertise') return `${scope}expertise`
  if (checkpoint.optionIds.length > 0 && checkpoint.optionIds.every((id) => id.startsWith('maneuver-'))) return `${scope}battle-master-maneuvers`
  if (checkpoint.optionIds.length > 0 && checkpoint.optionIds.every((id) => id.startsWith('metamagic-'))) return `${scope}sorcerer-metamagic`
  return undefined
}

function buildSubclassCheckpoint(
  classId: string,
  repository: RulesRepository,
  enabledSourceIds?: readonly string[],
): ChoiceCheckpoint | undefined {
  // 子职候选由当前规则集仓库提供；DM 专用与未接入（unavailable）条目不进入普通车卡。
  const candidates = repository.subclasses.filter((subclass) =>
    subclass.classId === classId
    && subclass.availability !== 'dm-only'
    && subclass.status !== 'unavailable'
    && (enabledSourceIds === undefined || isSourceEnabled(subclass.sourceIds, enabledSourceIds, repository)))
  const optionIds = candidates.map((subclass) => subclass.id)
  if (optionIds.length === 0) return undefined
  const firstSubclass = candidates[0]
  if (!firstSubclass) return undefined
  const className = repository.getClass(classId)?.name ?? '职业'
  return {
    id: `${classId}-subclass-${firstSubclass.selectionLevel}`,
    level: firstSubclass.selectionLevel,
    step: 'timeline',
    kind: 'subclass',
    title: subclassTitles[classId] ?? (repository.ruleset === '5e-2024' ? `选择${className}子职` : '选择子职业'),
    description: repository.ruleset === '5e-2024'
      ? `子职在 ${firstSubclass.selectionLevel} 级确定，未接入的子职不会出现在候选中。`
      : '浏览当前项目登记的全部 2014 子职业；仅索引内容会明确标注，DM 专用选项不在普通车卡中开放。',
    required: true,
    minSelections: 1,
    maxSelections: 1,
    optionIds,
  }
}

/**
 * 归一化静态选项检查点的展示形式：目标种类且候选非空时默认标为 `expandable`；
 * 数据层已显式声明者优先。动态候选池（optionIds 为空）不标注，仍走各自渲染路径。
 */
function withOptionPresentation(checkpoint: ChoiceCheckpoint): ChoiceCheckpoint {
  return {
    ...checkpoint,
    optionPresentation: checkpoint.optionPresentation
      ?? (EXPANDABLE_CHECKPOINT_KINDS.has(checkpoint.kind) && checkpoint.optionIds.length > 0 ? 'expandable' : undefined),
  }
}

/** 子职特性选择检查点：由 `requiresChoice` 且带选项的特性生成（按特性多选规格）。 */
function buildSubclassFeatureCheckpoints(
  subclassId: string,
  repository: RulesRepository,
  enabledSourceIds?: readonly string[],
): readonly ChoiceCheckpoint[] {
  return (repository.getSubclass(subclassId)?.features ?? [])
    .filter((feature) =>
      feature.requiresChoice
      && ((feature.optionIds?.length ?? 0) > 0 || (feature.featCategories?.length ?? 0) > 0 || Boolean(feature.candidateKind)),
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
      optionIds: feature.optionIds?.length
        ? feature.optionIds.filter((id) => {
            const option = repository.getOption(id)
            return !option || enabledSourceIds === undefined || isSourceEnabled(option.sourceIds, enabledSourceIds, repository)
          })
        : feature.featCategories?.length
          ? getFeatPool(repository, feature.featCategories, { level: feature.level, enabledSourceIds }).map((feat) => feat.id)
          : [],
      candidateKind: feature.candidateKind,
      spellPool: feature.spellPool,
      spellGrant: feature.spellGrant,
      spellCastingTime: feature.spellCastingTime,
      uniqueGroup: feature.uniqueGroup ?? (feature.optionIds?.length && feature.id.includes('arcane-shot') ? 'arcane-archer-shots' : undefined),
    }))
}

/** 物种授予的起源专长检查点（2024 人类 Versatile）；候选池按类别与来源展开。 */
function buildSpeciesFeatCheckpoints(
  raceId: string,
  repository: RulesRepository,
  enabledSourceIds?: readonly string[],
): readonly ChoiceCheckpoint[] {
  const race = repository.getRace(raceId)
  const choices = race?.originFeatChoices
  if (!race || !choices || choices.count <= 0) return []
  const optionIds = getFeatPool(repository, choices.categories, { level: 1, enabledSourceIds }).map((feat) => feat.id)
  if (optionIds.length === 0) return []
  return [{
    id: `${race.id}-origin-feat`,
    level: 1,
    step: 'timeline',
    kind: 'feat',
    title: '选择额外起源专长',
    description: `${race.name}授予 ${choices.count} 项额外起源专长。`,
    required: true,
    minSelections: choices.count,
    maxSelections: choices.count,
    optionIds,
  }]
}

/** 种族／物种法术施法属性检查点，按独立规则集与有效来源生成。 */
function buildSpeciesAbilityCheckpoints(
  raceIds: readonly (string | undefined)[],
  repository: RulesRepository,
  enabledSourceIds: readonly string[] | undefined,
): readonly ChoiceCheckpoint[] {
  const checkpoints: ChoiceCheckpoint[] = []
  const seen = new Set<string>()
  for (const raceId of raceIds) {
    if (!raceId || seen.has(raceId)) continue
    seen.add(raceId)
    const race = repository.getRace(raceId)
    if (!race?.spellcastingAbilityChoices?.length) continue
    if (enabledSourceIds !== undefined && !isSourceEnabled(race.sourceIds, enabledSourceIds, repository)) continue
    checkpoints.push({
      id: `${race.id}-spellcasting-ability`,
      level: 1,
      step: 'timeline',
      kind: 'class-choice',
      title: '选择物种法术施法属性',
      description: `${race.name}的物种法术需要选择智力、感知或魅力作为施法属性。`,
      required: true,
      minSelections: 1,
      maxSelections: 1,
      optionIds: race.spellcastingAbilityChoices.map((ability) => `spell-ability-${ability}`),
    })
  }
  return checkpoints
}

/**
 * 背景授予的起源专长检查点：
 * - `originFeatOptions`：显式候选列表（二选一，或「本书候选」如歪曲之月·德鲁斯肯瓦尔德居民）；
 * - `originFeatChoices`：按类别展开的任选池（如火炬光·神话调查员「选择任意起源专长」）。
 * 两者共用 `${background.id}-origin-feat` 检查点，候选需要读完整效果故走可展开渲染。
 */
function buildBackgroundFeatCheckpoints(
  backgroundId: string,
  repository: RulesRepository,
  enabledSourceIds?: readonly string[],
): readonly ChoiceCheckpoint[] {
  const background = repository.getBackground(backgroundId)
  if (!background) return []
  const options = background.originFeatOptions
  const choices = background.originFeatChoices
  const optionIds = options?.length
    ? options.filter((id) => {
        const feat = repository.getFeat(id)
        if (!feat) return false
        return enabledSourceIds === undefined || isSourceEnabled(feat.sourceIds, enabledSourceIds, repository)
      })
    : choices && choices.count > 0
      ? getFeatPool(repository, choices.categories, { enabledSourceIds }).map((feat) => feat.id)
      : []
  if (optionIds.length === 0) return []
  const count = options?.length ? 1 : Math.max(1, choices?.count ?? 1)
  return [{
    id: `${background.id}-origin-feat`,
    level: 1,
    step: 'timeline',
    kind: 'feat',
    title: '选择起源专长',
    description: options?.length
      ? `${background.name}授予其中一项专长（按原书二选一或本书候选）。`
      : `${background.name}授予任选起源专长（按原书自选）。`,
    required: true,
    minSelections: count,
    maxSelections: count,
    optionIds,
    optionPresentation: 'expandable',
  }]
}

function buildFeatChoiceCheckpoints(
  parentCheckpoints: readonly ChoiceCheckpoint[],
  selections: readonly ChoiceSelection[],
  repository: RulesRepository,
  fixedFeatIds: Readonly<Record<string, string>> = {},
  presetChoices: Readonly<Record<string, Readonly<Record<string, readonly string[]>>>> = {},
  presetFeatIds: Readonly<Record<string, string>> = {},
): readonly ChoiceCheckpoint[] {
  return parentCheckpoints.flatMap((parent) => {
    const selected = selections.find((item) => item.checkpointId === parent.id && !item.invalidatedAt)
    const selectedFeatId = selected?.optionIds[0] ?? fixedFeatIds[parent.id]
    const feat = selectedFeatId ? repository.getFeat(selectedFeatId) : undefined
    if (!feat?.choices?.length) return []
    const presets = presetFeatIds[parent.id] === feat.id ? (presetChoices[parent.id] ?? {}) : {}
    const presetLabels = Object.values(presets)
      .flatMap((ids) => ids.map((id) => repository.getOption(id)?.name ?? id))
    return feat.choices.filter((choice) => !presets[choice.id]).map((choice) => ({
      id: `feat-child:${parent.id}:${feat.id}:${choice.id}`,
      level: parent.level,
      step: 'timeline' as const,
      kind: choice.candidateKind === 'proficient-skills' ? 'expertise' as const : 'feat-feature' as const,
      title: `${feat.name} · ${choice.title}`,
      description: presetLabels.length > 0
        ? `背景已固定：${presetLabels.join('、')}。${choice.description}`
        : choice.description,
      required: true,
      minSelections: choice.minSelections,
      maxSelections: choice.maxSelections,
      optionIds: choice.optionIds.length > 0
        ? choice.optionIds
        : choice.candidateKind === 'all-skills' || choice.candidateKind === 'proficient-skills'
          ? SKILL_IDS
          : [],
      uniqueGroup: choice.uniqueGroup,
      parentCheckpointId: parent.id,
      parentOptionId: feat.id,
      abilityBonus: choice.abilityBonus,
      abilityCap: choice.abilityCap,
      grantSavingThrowProficiency: choice.grantSavingThrowProficiency,
      candidateKind: choice.candidateKind,
      spellGrant: choice.spellGrant,
      spellPool: choice.spellPool,
      selectionCountFrom: choice.selectionCountFrom,
    }))
  })
}

/**
 * 单个职业的检查点：职业自带的检查点 + 子职检查点 + 该子职的特性的选择检查点。
 * 所有产出都注入 `classId`／`classLevel`（MC-C01），供时间线按职业分组与按职业等级取值。
 */
function buildClassCheckpoints(
  classId: string,
  classLevel: number,
  repository: RulesRepository,
  context: TimelineContext,
): readonly ChoiceCheckpoint[] {
  const classRule = repository.getClass(classId)
  if (!classRule) return []
  const subclassCheckpoint = buildSubclassCheckpoint(classId, repository, context.enabledSourceIds)
  const classCheckpoints = classRule.checkpoints.map((checkpoint) => {
    const resolved = checkpoint.kind === 'subclass' && subclassCheckpoint
      ? { ...checkpoint, optionIds: subclassCheckpoint.optionIds }
      : checkpoint
    if (resolved.featCategories?.length) {
      return {
        ...resolved,
        optionIds: getFeatPool(repository, resolved.featCategories, {
          level: resolved.level,
          enabledSourceIds: context.enabledSourceIds,
        }).map((feat) => feat.id),
      }
    }
    return resolved
  })
  if (subclassCheckpoint && !classCheckpoints.some((checkpoint) => checkpoint.kind === 'subclass')) {
    classCheckpoints.push(subclassCheckpoint)
  }
  const subclassId = context.classSubclassIds?.[classId] ?? (context.classSubclassIds ? undefined : context.subclassId)
  return [
    ...classCheckpoints,
    ...(subclassId ? buildSubclassFeatureCheckpoints(subclassId, repository, context.enabledSourceIds) : []),
  ]
    .filter((checkpoint) => checkpoint.level <= classLevel)
    .map((checkpoint) => ({ ...checkpoint, classId, classLevel: checkpoint.level }))
}

/**
 * 等级时间线。
 *
 * 单职业（默认）：`classes` 省略时由 `classId` + `targetLevel` 合成，行为与改造前逐字段一致。
 * 多职业（MC-C01）：`classes` 给出「职业 + 该职业等级」，各职业只展开到**自己的等级**，
 * 产出的检查点带 `classId`／`classLevel`；`level` 仍为角色等级口径的解锁等级（单职业下两者相等）。
 */
export function buildTimeline(
  classId: string,
  targetLevel: number,
  context: TimelineContext & {
    /** 兼职职业集合；省略时按单职业处理。 */
    readonly classes?: readonly ClassLevelEntry[]
    /** 每个职业各自的子职（键为职业 id）；省略时回退到 `context.subclassId`。 */
    readonly classSubclassIds?: Readonly<Record<string, string | undefined>>
  } = {},
): readonly ChoiceCheckpoint[] {
  const repository = context.repository ?? getRulesRepository(context.ruleset ?? '5e-2014')
  if (!classId) return []
  if (!repository.getClass(classId)) return []
  const entries = context.classes?.length ? context.classes : [{ classId, level: targetLevel }]
  const classCheckpoints = entries.flatMap((entry) =>
    buildClassCheckpoints(entry.classId, entry.level, repository, context))
  const baseTimeline = [
    ...(context.subraceId === 'race-2014-human-variant' ? [variantHumanCheckpoint] : []),
    ...(context.raceId ? buildSpeciesFeatCheckpoints(context.raceId, repository, context.enabledSourceIds) : []),
    ...(context.backgroundId ? buildBackgroundFeatCheckpoints(context.backgroundId, repository, context.enabledSourceIds) : []),
    ...buildSpeciesAbilityCheckpoints([context.subraceId, context.raceId], repository, context.enabledSourceIds),
    ...getSpeciesChoiceCheckpoints({ raceId: context.raceId, subraceId: context.subraceId, enabledSourceIds: context.enabledSourceIds, selections: context.selections ?? [], targetLevel }, repository),
    ...classCheckpoints,
  ]
    .filter((checkpoint) => checkpoint.level <= targetLevel)
    .map((checkpoint) => withOptionPresentation({
      ...checkpoint,
      uniqueGroup: inferredUniqueGroup(checkpoint),
      optionIds: checkpoint.optionIds.filter((id) => {
        const option = repository.getOption(id) ?? repository.getFeat(id)
        return !option || context.enabledSourceIds === undefined || isSourceEnabled(option.sourceIds, context.enabledSourceIds, repository)
      }),
    }))
  const background = context.backgroundId ? repository.getBackground(context.backgroundId) : undefined
  const fixedBackgroundParentId = background?.originFeatId
    && !background.originFeatOptions?.length
    && !(background.originFeatChoices?.count)
    && repository.getFeat(background.originFeatId)?.choices?.length
    ? `${background.id}-origin-feat`
    : undefined
  const fixedBackgroundParent: ChoiceCheckpoint[] = fixedBackgroundParentId ? [{
    id: fixedBackgroundParentId,
    level: 1,
    step: 'timeline',
    kind: 'feat',
    title: `${background?.name ?? ''}固定专长`,
    description: '背景自动授予的专长。',
    required: false,
    minSelections: 0,
    maxSelections: 0,
    optionIds: [],
  }] : []
  const fixedFeatIds = fixedBackgroundParentId && background?.originFeatId
    ? { [fixedBackgroundParentId]: background.originFeatId }
    : {}
  const backgroundParentId = background ? `${background.id}-origin-feat` : undefined
  const presetChoices = backgroundParentId && background?.originFeatChoicePresets
    ? { [backgroundParentId]: background.originFeatChoicePresets }
    : {}
  const presetFeatIds = backgroundParentId && background?.originFeatId
    ? { [backgroundParentId]: background.originFeatId }
    : {}
  return [
    ...baseTimeline,
    ...buildFeatChoiceCheckpoints(
      [...baseTimeline, ...fixedBackgroundParent],
      context.selections ?? [],
      repository,
      fixedFeatIds,
      presetChoices,
      presetFeatIds,
    ).map(withOptionPresentation),
    ...buildManualFeatChoiceCheckpoints(context.manualFeatGrants ?? [], repository, targetLevel).map(withOptionPresentation),
  ]
    .sort((left, right) => left.level - right.level)
}

/**
 * 从草稿直接构建等级时间线（MC-C01）。
 *
 * 统一入口：自动带上职业集合（兼职）、各职业子职、来源开关、种族／背景与手动专长，
 * 调用方不需要自己拼 `TimelineContext`，避免各处漏传兼职信息。
 *
 * `targetLevelOverride` 用于「按另一个等级重算时间线」的场景（升降级影响清单、
 * 按等级统计检查点数量）：兼职职业等级按比例缩放到该总等级后再展开。
 */
export function buildTimelineForDraft(
  draft: CharacterDraft,
  context: Partial<TimelineContext> & { readonly targetLevelOverride?: number } = {},
): readonly ChoiceCheckpoint[] {
  const { targetLevelOverride, ...rest } = context
  const entries = getClassEntries(draft)
  const primaryClassId = entries[0]?.classId
  if (!primaryClassId) return []
  const targetLevel = Math.max(1, Math.trunc(targetLevelOverride ?? (getTotalLevel(draft) || draft.targetLevel)))
  const classes = targetLevelOverride === undefined ? entries : scaleClassEntries(entries, targetLevel)
  return buildTimeline(primaryClassId, targetLevel, {
    subraceId: draft.subraceId,
    subclassId: draft.subclassId,
    classSubclassIds: getClassSubclassIds(draft),
    classes,
    enabledSourceIds: draft.enabledSourceIds,
    selections: draft.selections,
    manualFeatGrants: draft.manualEdits?.addedFeats ?? [],
    ruleset: draft.ruleset,
    raceId: draft.raceId,
    backgroundId: draft.backgroundId,
    ...rest,
  })
}

/** 把职业等级按比例缩放到目标总等级（仅用于时间线预览与统计，不写回草稿）。 */
function scaleClassEntries(
  entries: readonly ClassLevelEntry[],
  targetLevel: number,
): readonly ClassLevelEntry[] {
  const current = entries.reduce((sum, entry) => sum + entry.level, 0)
  if (current === targetLevel || current <= 0) return entries
  const scaled = entries.map((entry) => ({ ...entry, level: Math.floor(entry.level * targetLevel / current) }))
  let remainder = targetLevel - scaled.reduce((sum, entry) => sum + entry.level, 0)
  for (let index = 0; remainder > 0 && index < scaled.length; index += 1) {
    const entry = scaled[index]
    if (!entry) continue
    entry.level += 1
    remainder -= 1
  }
  while (remainder < 0) {
    const last = scaled[scaled.length - 1]
    if (!last || last.level <= 0) break
    last.level -= 1
    remainder += 1
  }
  return scaled.filter((entry) => entry.level > 0)
}
