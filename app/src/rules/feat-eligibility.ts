import { deriveAbilities } from '@/rules/derive'
import { classHasFightingStyle, collectArmorTrainings, listAcquiredFeatSources, listFeatGrants, type FeatEligibilityContext } from '@/rules/feats'
import { getRulesRepository } from '@/rules/repositories'
import { getSpellcastingConfig } from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import type { CharacterDraft } from '@/types/character'

export interface FeatEligibilityOptions {
  readonly checkpointId?: string
  readonly checkpointLevel?: number
  /**
   * 跳过「已获得同一不可复选专长」的候选提示。
   * 最终校验由 `validateDraft` 的统一查重条目录入，逐节点前置校验不需要重复报同一问题。
   */
  readonly ignoreFeatAcquisition?: boolean
}

/** 检查点标题（含等级）——重复授予提示用等级与标题定位需要修改的节点。 */
function buildCheckpointTitles(timeline: ReturnType<typeof buildTimeline>): ReadonlyMap<string, string> {
  return new Map(timeline.map((checkpoint) => [checkpoint.id, `${checkpoint.level}级${checkpoint.title}`]))
}

/**
 * 专长资格上下文单一来源（B09-08）：
 * 时间线专长面板与 `validateDraft` 共用，避免 2024 的等级前置、护甲／盾牌训练与战斗风格前置
 * 只在界面被误判为"不满足"（历史上面板未传 `level` 等字段，导致 28 个带等级前置的 2024 专长全部锁定）。
 *
 * - 属性：2024 按"获得节点之前的属性"推导（与校验同口径）；2014 沿用草稿当前属性。
 * - 2014 保持既有最小上下文（不传 level／armorTrainings／hasFightingStyle），行为不变。
 * - 已获得专长来源：默认排除**当前节点自身**的授予，回看原节点时已选项仍显示为可选；
 *   其它节点与背景、物种、手动授予都参与，供候选禁用提示与最终查重同源判定。
 */
export function getFeatEligibilityContext(
  draft: CharacterDraft,
  options: FeatEligibilityOptions = {},
): FeatEligibilityContext {
  const repository = getRulesRepository(draft.ruleset)
  const checkpointId = options.checkpointId
  const checkpointLevel = options.checkpointLevel
  const timeline = draft.classId
    ? buildTimeline(draft.classId, draft.targetLevel, {
      subraceId: draft.subraceId,
      subclassId: draft.subclassId,
      enabledSourceIds: draft.enabledSourceIds,
      selections: draft.selections,
      ruleset: draft.ruleset,
      raceId: draft.raceId,
      backgroundId: draft.backgroundId,
    })
    : []
  const isCustomLineage = checkpointId === 'race-2014-custom-lineage-origin-feat'
  const abilities = (repository.ruleset === '5e-2024' || isCustomLineage) && checkpointLevel !== undefined
    ? deriveAbilities(draft, checkpointId, {
      belowLevel: checkpointLevel,
      checkpointLevels: new Map(timeline.map((item) => [item.id, item.level])),
    })
    : deriveAbilities(draft, checkpointId)
  const spellcasting = getSpellcastingConfig(draft)
  const canCastSpells = Boolean(
    spellcasting && checkpointLevel !== undefined && checkpointLevel >= spellcasting.startsAtLevel,
  )
  const grants = listFeatGrants(draft, repository)
  const acquiredFeatIds = grants.map((grant) => grant.featId)
  const acquiredFeatTags = [...new Set(acquiredFeatIds.flatMap((featId) => repository.getFeat(featId)?.tags ?? []))]
  const acquiredFeatSources = options.ignoreFeatAcquisition
    ? undefined
    : listAcquiredFeatSources(
      grants.filter((grant) => !checkpointId || grant.checkpointId !== checkpointId),
      repository,
      buildCheckpointTitles(timeline),
    )
  if (repository.ruleset !== '5e-2024') {
    return {
      abilities,
      classId: draft.classId ?? '',
      canCastSpells,
      raceId: draft.raceId,
      subraceId: draft.subraceId,
      acquiredFeatIds,
      raceAliasIds: draft.raceId ? repository.getRace(draft.raceId)?.countsAsRaceIds : [],
      acquiredFeatTags,
      acquiredFeatSources,
      ...(isCustomLineage ? { level: 1 } : {}),
    }
  }
  return {
    abilities,
    classId: draft.classId ?? '',
    canCastSpells,
    raceId: draft.raceId,
    subraceId: draft.subraceId,
    level: checkpointLevel,
    hasFightingStyle: classHasFightingStyle(repository, draft.classId, draft.targetLevel),
    armorTrainings: collectArmorTrainings(draft, repository),
    acquiredFeatIds,
    acquiredFeatTags,
    acquiredFeatSources,
  }
}
