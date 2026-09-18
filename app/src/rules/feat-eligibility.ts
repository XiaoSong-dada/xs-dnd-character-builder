import { deriveAbilities } from '@/rules/derive'
import { classHasFightingStyle, collectArmorTrainings, listFeatGrants, type FeatEligibilityContext } from '@/rules/feats'
import { getRulesRepository } from '@/rules/repositories'
import { getSpellcastingConfig } from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import type { CharacterDraft } from '@/types/character'

export interface FeatEligibilityOptions {
  readonly checkpointId?: string
  readonly checkpointLevel?: number
}

/**
 * 专长资格上下文单一来源（B09-08）：
 * 时间线专长面板与 `validateDraft` 共用，避免 2024 的等级前置、护甲／盾牌训练与战斗风格前置
 * 只在界面被误判为"不满足"（历史上面板未传 `level` 等字段，导致 28 个带等级前置的 2024 专长全部锁定）。
 *
 * - 属性：2024 按"获得节点之前的属性"推导（与校验同口径）；2014 沿用草稿当前属性。
 * - 2014 保持既有最小上下文（不传 level／armorTrainings／hasFightingStyle），行为不变。
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
    })
    : []
  const abilities = repository.ruleset === '5e-2024' && checkpointLevel !== undefined
    ? deriveAbilities(draft, checkpointId, {
      belowLevel: checkpointLevel,
      checkpointLevels: new Map(timeline.map((item) => [item.id, item.level])),
    })
    : deriveAbilities(draft, checkpointId)
  const spellcasting = getSpellcastingConfig(draft)
  const canCastSpells = Boolean(
    spellcasting && checkpointLevel !== undefined && checkpointLevel >= spellcasting.startsAtLevel,
  )
  const acquiredFeatIds = listFeatGrants(draft, repository).map((grant) => grant.featId)
  const acquiredFeatTags = [...new Set(acquiredFeatIds.flatMap((featId) => repository.getFeat(featId)?.tags ?? []))]
  if (repository.ruleset !== '5e-2024') {
    return {
      abilities,
      classId: draft.classId ?? '',
      canCastSpells,
      raceId: draft.raceId,
      subraceId: draft.subraceId,
      acquiredFeatIds,
      acquiredFeatTags,
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
  }
}
