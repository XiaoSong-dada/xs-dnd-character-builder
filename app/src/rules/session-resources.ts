import { getRulesRepository } from '@/rules/repositories'
import { getClassLevel } from '@/rules/multiclass'
import { getDicePoolCount, getDicePoolDie, getResourceMax, getResourceRecovery } from '@/rules/resources'
import { getSpellFreeCastings } from '@/rules/spellcasting'
import { getEffectiveSpeciesFeatures } from '@/rules/origins'
import { listCharacterFeatures } from '@/rules/multiclass-features'
import type { AbilityKey, CharacterDraft } from '@/types/character'
import type { ClassFeature, ClassResource, RulesRepository, SubclassFeature } from '@/types/rules'
import type { SessionState } from '@/types/session-state'

/**
 * 跑团资源结算：职业、子职、有效种族特性和免费施法沿用同一计数与休息管道。
 * 未登记结构化资源的旧特性不从摘要推断次数。
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
  /** 免费施法条目对应的法术 id（用于施法弹窗绑定免费施放按钮）。 */
  readonly spellId?: string
  readonly castingLevel?: number
  /**
   * 合并来源（MC-E05，R5.3）：同名资源来自多个职业时列出各来源特性名。
   * 只有 1 个来源时不提供该字段。
   */
  readonly sharedSources?: readonly string[]
}

function abilityModifierOf(modifiers: Partial<Record<AbilityKey, number>>, ability: AbilityKey): number {
  return modifiers[ability] ?? 0
}

/** 收集草稿已获得的职业与子职特性（按**各职业自己的等级**过滤，MC-C02）。 */
function grantedFeatures(draft: CharacterDraft, repository: RulesRepository): readonly (ClassFeature | SubclassFeature)[] {
  return listCharacterFeatures(draft, repository)
}

/**
 * 特性归属的职业 id（MC-E05）：职业特性自带 `classId`；子职特性经其子职反查。
 * 种族特性两者皆无 → 返回空串，调用方按角色总等级取值。
 * 由调用方用 `in` 收窄后传入字段：种族特性类型与两个特性类型无公共属性，无法用联合类型直接接收。
 */
function resolveOwningClassId(
  classId: string | undefined,
  subclassId: string | undefined,
  repository: RulesRepository,
): string {
  if (classId) return classId
  return subclassId ? repository.getSubclass(subclassId)?.classId ?? '' : ''
}

/**
 * 同名资源合并为一个计数池（R5.3「同名资源的已用量在跑团状态中合并为一个计数池」）。
 * `max` 取各来源在**各自等级**下的最大值；`id` 取首个来源，保证单职业结果与既有记录完全一致。
 * `source` 是归属名（职业名／种族名），仅在确实来自 2 个以上来源时才输出 `sharedSources`。
 */
function mergeSameNameResources(entries: readonly { readonly resource: SessionResource; readonly source?: string }[]): readonly SessionResource[] {
  const merged = new Map<string, { resource: SessionResource; sources: string[] }>()
  for (const { resource, source } of entries) {
    const previous = merged.get(resource.name)
    if (!previous) {
      merged.set(resource.name, { resource, sources: source ? [source] : [] })
      continue
    }
    if (source && !previous.sources.includes(source)) previous.sources.push(source)
    if (resource.max > previous.resource.max) {
      const { max, recovery, shortRestRecovery } = resource
      previous.resource = { ...previous.resource, max, recovery, ...(shortRestRecovery === undefined ? {} : { shortRestRecovery }) }
    }
  }
  return [...merged.values()].map(({ resource, sources }) =>
    sources.length > 1 ? { ...resource, sharedSources: sources } : resource)
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
  const speciesFeatures = getEffectiveSpeciesFeatures(draft, repository)
    .map((feature) => ({ ...feature, dicePool: undefined }))
  const features = [...grantedFeatures(draft, repository), ...speciesFeatures]

  const resources: { resource: SessionResource; source?: string }[] = []
  const seen = new Set<string>()
  for (const feature of features) {
    if (seen.has(feature.id)) continue
    // 等级口径（MC-E05）：职业／子职特性按所属职业等级；种族特性按角色总等级。
    const classId = resolveOwningClassId(
      'classId' in feature ? feature.classId : undefined,
      'subclassId' in feature ? feature.subclassId : undefined,
      repository,
    )
    const level = classId ? getClassLevel(draft, classId) || draft.targetLevel : draft.targetLevel
    const count = feature.resource
      ? getResourceMax(feature.resource, level, feature.resource.maxFromAbility
        ? abilityModifierOf(modifiers, feature.resource.maxFromAbility.ability)
        : feature.resource.abilityBonus ? abilityModifierOf(modifiers, feature.resource.abilityBonus) : 0)
      : 0
    const poolCount = feature.dicePool ? getDicePoolCount(feature.dicePool, level) : 0
    const poolDie = feature.dicePool ? getDicePoolDie(feature.dicePool, level) : ''
    // 只把「可消耗」的条目纳入结算：资源本身，或 recovery 不为 none 的骰池。
    const isConsumablePool = Boolean(feature.dicePool && feature.dicePool.recovery && feature.dicePool.recovery !== 'none')
    if (!feature.resource && !isConsumablePool) continue
    const max = feature.resource ? count : poolCount
    if (max <= 0) continue
    seen.add(feature.id)
    const shortRestRecovery = feature.resource?.shortRestRecovery ?? feature.dicePool?.shortRestRecovery
    resources.push({
      resource: {
        id: feature.id,
        name: feature.name,
        max,
        recovery: feature.resource
          ? getResourceRecovery(feature.resource, level)
          : feature.dicePool?.recovery ?? 'none',
        unit: feature.resource?.unit ?? (poolDie || '次'),
        dice: Boolean(feature.dicePool && !feature.resource),
        ...(shortRestRecovery !== undefined ? { shortRestRecovery } : {}),
      },
      source: classId ? repository.getClass(classId)?.name : undefined,
    })
  }
  // 免费施法（专长／物种／职业与子职特性／选项）：复用同一已用计数与休息回充管道。
  for (const grant of getSpellFreeCastings(draft, repository)) {
    const key = `${grant.sourceId}:${grant.spellId}`
    if (seen.has(key)) continue
    const spell = repository.getSpell(grant.spellId)
    if (!spell || grant.count <= 0) continue
    seen.add(key)
    resources.push({
      resource: {
        id: key,
        name: `${spell.name}（${grant.sourceName}）`,
        max: grant.count,
        recovery: grant.recovery,
        unit: '次',
        dice: false,
        spellId: grant.spellId,
        ...(grant.castingLevel === undefined ? {} : { castingLevel: grant.castingLevel }),
      },
    })
  }
  // 同名资源合并（R5.3）。免费施法的名称已带来源后缀，不会与其他条目同名。
  return mergeSameNameResources(resources)
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
