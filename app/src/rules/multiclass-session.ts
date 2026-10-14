import { abilityModifier } from '@/rules/derive'
import { getMulticlassClassRule2014 } from '@/rules/data/multiclass-2014'
import { multiclassProficiencyGrants2024 } from '@/rules/data/multiclass-2024'
import { getClassEntries, getPrimaryClassId, getTotalLevel, rebuildLevelOrder } from '@/rules/multiclass'
import { isSourceEnabled } from '@/rules/source-books'
import { getRulesRepository } from '@/rules/repositories'
import { isWeaponTrainingCovered } from '@/rules/weapon-training'
import type { AbilityKey, CharacterDraft, RulesetId } from '@/types/character'
import type { ArmorTraining, EquipmentRule, RulesRepository, WeaponTraining } from '@/types/rules'

/**
 * 兼职熟练项合并（MC-B02）与生命值／生命骰（MC-B03）。
 *
 * 规则依据（需求 §2.6、§2.4）：
 * - **豁免熟练只来自起始职业**：「作为兼职角色」条目里没有任何豁免熟练（官方 2025 裁定）；
 *   但通过职业**特性**获得的熟练照常生效（由专长／选项／特性管道处理，不在本模块）。
 * - 2014 用「兼职熟练项」总表，2024 用各职业「作为兼职角色」条目；两版独立登记，禁止共享。
 * - 兼职**不获得**新职业的起始装备（`:18`）。
 * - HP：1 级最大生命值只在角色 1 级时获得一次（起始职业），此后每级按**所升职业**的后续升级生命值。
 */

export interface MulticlassProficiencySource {
  readonly classId: string
  readonly className: string
  readonly armorTraining: readonly ArmorTraining[]
  readonly weaponTraining?: WeaponTraining
  /** 需要玩家选择的技能项（数量 + 候选）。 */
  readonly skillChoices?: { readonly count: number; readonly optionIds: readonly string[] }
  readonly toolProficiencies: readonly string[]
  readonly toolChoices?: { readonly count: number; readonly optionIds: readonly string[] }
}

export interface MulticlassProficiencyReport {
  /** 起始职业：豁免熟练与完整熟练的唯一来源。 */
  readonly primaryClassId?: string
  /** 各职业的兼职条目熟练项（含起始职业，便于展示来源）。 */
  readonly sources: readonly MulticlassProficiencySource[]
  readonly armorTraining: readonly ArmorTraining[]
  readonly weaponTraining: readonly WeaponTraining[]
  readonly toolProficiencies: readonly string[]
  /** 需要玩家完成的兼职技能／工具选择。 */
  readonly skillChoices: readonly { readonly classId: string; readonly className: string; readonly count: number; readonly optionIds: readonly string[] }[]
  readonly toolChoices: readonly { readonly classId: string; readonly className: string; readonly count: number; readonly optionIds: readonly string[] }[]
}

const ARMOR_ORDER: readonly ArmorTraining[] = ['light', 'medium', 'heavy', 'shield']

function readProficiencies(ruleset: RulesetId, classId: string): { armorTraining: readonly ArmorTraining[]; weaponTraining?: WeaponTraining; skillChoices?: { count: number; optionIds: readonly string[] }; toolProficiencies: readonly string[]; toolChoices?: { count: number; optionIds: readonly string[] } } | undefined {
  if (ruleset === '5e-2014') {
    const grant = getMulticlassClassRule2014(classId)?.proficiencies
    if (!grant) return undefined
    return {
      armorTraining: grant.armorTraining ?? [],
      ...(grant.weaponTraining ? { weaponTraining: grant.weaponTraining } : {}),
      ...(grant.skillChoices
        ? { skillChoices: { count: grant.skillChoices.count, optionIds: grant.skillChoices.optionIds ?? [] } }
        : {}),
      toolProficiencies: grant.toolProficiencies ?? [],
      ...(grant.toolChoices
        ? { toolChoices: { count: grant.toolChoices.count, optionIds: grant.toolChoices.optionIds ?? [] } }
        : {}),
    }
  }
  const grant = multiclassProficiencyGrants2024[classId]
  if (!grant) return undefined
  return {
    armorTraining: grant.armorTraining ?? [],
    ...(grant.weaponTraining ? { weaponTraining: grant.weaponTraining } : {}),
    ...(grant.skillChoices
      ? { skillChoices: { count: grant.skillChoices.count, optionIds: grant.skillChoices.optionIds ?? [] } }
      : {}),
    toolProficiencies: grant.toolProficiencies ?? [],
    ...(grant.toolChoices
      ? { toolChoices: { count: grant.toolChoices.count, optionIds: grant.toolChoices.optionIds ?? [] } }
      : {}),
  }
}

/** 合并各职业的兼职熟练项；未登记条目的职业只有起始职业豁免，不推断熟练。 */
export function getMulticlassProficiencyReport(
  draft: Pick<CharacterDraft, 'ruleset' | 'enabledSourceIds'> & Parameters<typeof getClassEntries>[0],
): MulticlassProficiencyReport {
  const repository = getRulesRepository(draft.ruleset)
  const sources: MulticlassProficiencySource[] = []
  const armor = new Set<ArmorTraining>()
  const weaponTraining: WeaponTraining[] = []
  const tools = new Set<string>()
  const skillChoices: MulticlassProficiencyReport['skillChoices'][number][] = []
  const toolChoices: MulticlassProficiencyReport['toolChoices'][number][] = []
  for (const entry of getClassEntries(draft)) {
    const classRule = repository.getClass(entry.classId)
    if (classRule && !isSourceEnabled(classRule.sourceIds, draft.enabledSourceIds, repository)) continue
    const className = classRule?.name ?? entry.classId
    const grant = readProficiencies(draft.ruleset, entry.classId)
    if (!grant) {
      sources.push({ classId: entry.classId, className, armorTraining: [], toolProficiencies: [] })
      continue
    }
    for (const item of grant.armorTraining) armor.add(item)
    if (grant.weaponTraining) weaponTraining.push(grant.weaponTraining)
    for (const tool of grant.toolProficiencies) tools.add(tool)
    if (grant.skillChoices) skillChoices.push({ classId: entry.classId, className, count: grant.skillChoices.count, optionIds: grant.skillChoices.optionIds })
    if (grant.toolChoices) toolChoices.push({ classId: entry.classId, className, count: grant.toolChoices.count, optionIds: grant.toolChoices.optionIds })
    sources.push({
      classId: entry.classId,
      className,
      armorTraining: grant.armorTraining,
      ...(grant.weaponTraining ? { weaponTraining: grant.weaponTraining } : {}),
      ...(grant.skillChoices ? { skillChoices: grant.skillChoices } : {}),
      toolProficiencies: grant.toolProficiencies,
      ...(grant.toolChoices ? { toolChoices: grant.toolChoices } : {}),
    })
  }
  return {
    primaryClassId: getPrimaryClassId(draft),
    sources,
    armorTraining: ARMOR_ORDER.filter((item) => armor.has(item)),
    weaponTraining,
    toolProficiencies: [...tools],
    skillChoices,
    toolChoices,
  }
}

/** 兼职与起始职业的武器受训是否覆盖某件武器。 */
export function isMulticlassWeaponCovered(report: MulticlassProficiencyReport, equipment: EquipmentRule): boolean {
  return report.weaponTraining.some((training) => isWeaponTrainingCovered(training, equipment))
}

/** 起始职业的豁免熟练属性；无职业时返回空数组。 */
export function getPrimarySavingThrowAbilities(
  draft: Pick<CharacterDraft, 'ruleset'> & Parameters<typeof getClassEntries>[0],
): readonly AbilityKey[] {
  const primaryClassId = getPrimaryClassId(draft)
  if (!primaryClassId) return []
  return getRulesRepository(draft.ruleset).getClass(primaryClassId)?.savingThrowAbilities ?? []
}

/** 生命骰骰面列表（按升级顺序逐级展开），供跑团按骰面记账。 */
export function getHitDiceFaces(
  draft: Pick<CharacterDraft, 'ruleset' | 'classId' | 'targetLevel'> & Parameters<typeof getClassEntries>[0],
): readonly number[] {
  const repository = getRulesRepository(draft.ruleset)
  const faces: number[] = []
  for (const entry of getClassEntries(draft)) {
    const hitDie = repository.getClass(entry.classId)?.hitDie ?? 8
    for (let index = 0; index < entry.level; index += 1) faces.push(hitDie)
  }
  return faces
}

export interface MulticlassHitPointDetail {
  /** 起始职业 1 级最大生命值。 */
  readonly firstLevel: number
  /** 后续每一级按骰面得到的固定值（不含体质）。 */
  readonly perLevel: readonly number[]
  /** 与 `perLevel` 对应的职业 id：索引 i = 角色第 i+2 级所升的职业。 */
  readonly levelClassIds: readonly string[]
  /** Σ 后续等级的（固定值 + 体质调整值）。 */
  readonly subsequentTotal: number
  readonly constitutionModifier: number
  readonly total: number
}

/**
 * 兼职生命值：起始职业 1 级骰面最大值 + 体质，之后每个等级按**所升职业**的固定值 + 体质。
 * 固定值 = floor(骰面 / 2) + 1（与既有单职业口径一致：d6→4、d8→5、d10→6、d12→7）。
 *
 * 注意：后续等级的职业归属取自 `levelOrder`（升级顺序）；缺失时按各职业等级重建。
 */
export function deriveMulticlassHitPoints(
  draft: Pick<CharacterDraft, 'ruleset' | 'classId' | 'targetLevel'> & Parameters<typeof getClassEntries>[0],
  constitutionScore: number,
): MulticlassHitPointDetail {
  const repository = getRulesRepository(draft.ruleset)
  const constitutionModifier = abilityModifier(constitutionScore)
  const primaryClassId = getPrimaryClassId(draft)
  const primaryHitDie = (primaryClassId ? repository.getClass(primaryClassId)?.hitDie : undefined) ?? 8
  const faces = getHitDiceFaces(draft)
  const firstLevel = primaryHitDie + constitutionModifier
  // 后续等级的职业归属：优先升级顺序，其次各职业等级重建（两者长度都已对齐总等级）。
  const order = getLevelOrder(draft)
  const levelClassIds = faces.slice(1).map((_, index) => order[index + 1] ?? primaryClassId ?? '')
  const perLevel = faces.slice(1).map((die) => Math.max(1, Math.floor(die / 2) + 1))
  const subsequentTotal = perLevel.reduce((sum, value) => sum + value + constitutionModifier, 0)
  return {
    firstLevel,
    perLevel,
    levelClassIds,
    subsequentTotal,
    constitutionModifier,
    total: firstLevel + subsequentTotal,
  }
}

/** 升级顺序（长度已对齐总等级）：优先草稿字段，缺失时由各职业等级重建。 */
export function getLevelOrder(
  draft: Parameters<typeof getClassEntries>[0],
): readonly string[] {
  const state = draft.multiclass
  const entries = getClassEntries(draft)
  const total = entries.reduce((sum, entry) => sum + entry.level, 0)
  if (state?.levelOrder?.length === total) return state.levelOrder
  return rebuildLevelOrder(entries)
}

/** 总等级（供派生与校验统一口径）。 */
export function getMulticlassTotalLevel(draft: Parameters<typeof getClassEntries>[0]): number {
  return getTotalLevel(draft)
}

/**
 * 职业展示标签（MC-E05，需求 §3.1 的统一格式）。
 *
 * - 未选职业、或职业全部无法解析（如导入的未知第三方职业 id）：空串，调用方退回「N 级」。
 * - 单职业：`战士5`——不出现括号，避免单职业玩家看到多余信息。
 * - 多职业：`战士3 / 游荡者2（5 级角色）`——每个职业各自带等级，并在括号内给出角色总等级，
 *   避免把总等级误读成某个职业的等级。
 *
 * 无法解析的职业**跳过**而不是打印原始 id：需求要求界面不暴露英文 id，全部无法解析时退回「N 级」。
 * 角色卡头部、草稿列表、车卡吸底摘要、跑团助手标题与导出共用本函数。
 */
export function getClassLevelLabel(
  draft: Pick<CharacterDraft, 'ruleset' | 'targetLevel'> & Parameters<typeof getClassEntries>[0],
  repository: RulesRepository = getRulesRepository(draft.ruleset),
): string {
  const entries = getClassEntries(draft)
  const resolved = entries.flatMap((entry) => {
    const name = repository.getClass(entry.classId)?.name
    return name ? [{ name, level: entry.level }] : []
  })
  if (resolved.length === 0) return ''
  const parts = resolved.map((entry) => `${entry.name}${entry.level}`)
  return resolved.length > 1 ? `${parts.join(' / ')}（${getTotalLevel(draft)} 级角色）` : parts.join(' / ')
}
