import { getRulesRepository } from '@/rules/repositories'
import { getDicePoolCount, getDicePoolDie, getResourceMax } from '@/rules/resources'
import type { AbilityKey, CharacterDraft } from '@/types/character'
import type { ClassFeature, ClassResource, RulesRepository, SubclassFeature } from '@/types/rules'
import type { SessionState } from '@/types/session-state'

/**
 * 跑团资源结算（B10-02，仅 2024 生效）。
 *
 * 枚举职业特性与已选子职特性中登记的资源／可消耗骰池；2014 数据没有这类登记，天然为空，
 * 因此 2014 行为保持不变（Q-B10-1）。
 */

export interface SessionResource {
  /** 稳定标识：特性 id（跨角色编辑保持一致）。 */
  readonly id: string
  readonly name: string
  readonly max: number
  readonly recovery: ClassResource['recovery']
  /** 展示单位：次 或 骰面（如 d8）。 */
  readonly unit: string
  /** 是否为骰池（消耗骰数）。 */
  readonly dice: boolean
  /** 短休只恢复固定数量；缺省为全部恢复。 */
  readonly shortRestRecovery?: number
}

function abilityModifierOf(modifiers: Partial<Record<AbilityKey, number>>, ability: AbilityKey): number {
  return modifiers[ability] ?? 0
}

/** 收集草稿已获得的职业与子职特性（按目标等级过滤）。 */
function grantedFeatures(draft: CharacterDraft, repository: RulesRepository): readonly (ClassFeature | SubclassFeature)[] {
  return [
    ...(draft.classId ? repository.getClass(draft.classId)?.features ?? [] : []),
    ...(draft.subclassId ? repository.getSubclass(draft.subclassId)?.features ?? [] : []),
  ].filter((feature) => feature.level <= draft.targetLevel)
}

/** 短休额外降低的力竭层数（如 2024 游侠·不知疲倦）；多个来源取最大值，2014 无登记时为 0。 */
export function getShortRestExhaustionReduction(
  draft: CharacterDraft,
  repository: RulesRepository = getRulesRepository(draft.ruleset),
): number {
  return grantedFeatures(draft, repository)
    .reduce((max, feature) => Math.max(max, feature.shortRestExhaustionReduction ?? 0), 0)
}

/** 枚举当前角色的可消耗资源（上限为 0 的不进入列表）。 */
export function listSessionResources(
  draft: CharacterDraft,
  modifiers: Partial<Record<AbilityKey, number>> = {},
  repository: RulesRepository = getRulesRepository(draft.ruleset),
): readonly SessionResource[] {
  const features = grantedFeatures(draft, repository)

  const resources: SessionResource[] = []
  const seen = new Set<string>()
  for (const feature of features) {
    if (seen.has(feature.id)) continue
    const count = feature.resource
      ? getResourceMax(feature.resource, draft.targetLevel, feature.resource.maxFromAbility
        ? abilityModifierOf(modifiers, feature.resource.maxFromAbility.ability)
        : feature.resource.abilityBonus ? abilityModifierOf(modifiers, feature.resource.abilityBonus) : 0)
      : 0
    const poolCount = feature.dicePool ? getDicePoolCount(feature.dicePool, draft.targetLevel) : 0
    const poolDie = feature.dicePool ? getDicePoolDie(feature.dicePool, draft.targetLevel) : ''
    // 只把「可消耗」的条目纳入结算：资源本身，或 recovery 不为 none 的骰池。
    const isConsumablePool = Boolean(feature.dicePool && feature.dicePool.recovery && feature.dicePool.recovery !== 'none')
    if (!feature.resource && !isConsumablePool) continue
    const max = feature.resource ? count : poolCount
    if (max <= 0) continue
    seen.add(feature.id)
    const shortRestRecovery = feature.resource?.shortRestRecovery ?? feature.dicePool?.shortRestRecovery
    resources.push({
      id: feature.id,
      name: feature.name,
      max,
      recovery: feature.resource?.recovery ?? feature.dicePool?.recovery ?? 'none',
      unit: feature.resource?.unit ?? (poolDie || '次'),
      dice: Boolean(feature.dicePool && !feature.resource),
      ...(shortRestRecovery !== undefined ? { shortRestRecovery } : {}),
    })
  }
  return resources
}

/** 已用数量（未记录视为 0）。 */
export function getResourceUsed(state: SessionState, id: string): number {
  return state.resourceUsage?.[id] ?? 0
}

/** 消耗（delta > 0）或恢复（delta < 0）资源，钳制在 [0, max]；越界或无变化返回原状态。 */
export function applyResourceChange(
  state: SessionState,
  id: string,
  delta: number,
  max: number,
): { readonly state: SessionState; readonly clamped: boolean } {
  const current = getResourceUsed(state, id)
  const requested = current + delta
  const clamped = requested > max || requested < 0
  const next = Math.min(Math.max(0, max), Math.max(0, requested))
  if (next === current) return { state, clamped }
  return {
    state: {
      ...state,
      resourceUsage: { ...(state.resourceUsage ?? {}), [id]: next },
      updatedAt: new Date().toISOString(),
    },
    clamped,
  }
}

/**
 * 按休息时机回充：短休回充短休类（`shortRestRecovery` 有值时只回该数量），
 * 长休回充短休类与长休类；`none`／`special` 不动。
 */
export function applyRestRecovery(
  state: SessionState,
  resources: readonly SessionResource[],
  timing: 'short-rest' | 'long-rest',
): SessionState {
  const usage = { ...(state.resourceUsage ?? {}) }
  let changed = false
  for (const resource of resources) {
    const used = usage[resource.id] ?? 0
    if (used === 0) continue
    if (timing === 'short-rest' && resource.recovery !== 'short-rest') continue
    if (timing === 'long-rest' && resource.recovery !== 'short-rest' && resource.recovery !== 'long-rest') continue
    const regained = timing === 'short-rest' && resource.shortRestRecovery !== undefined
      ? resource.shortRestRecovery
      : used
    const next = Math.max(0, used - regained)
    usage[resource.id] = next
    changed = changed || next !== used
  }
  if (!changed) return state
  return { ...state, resourceUsage: usage, updatedAt: new Date().toISOString() }
}
