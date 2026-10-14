import { abilityModifier, deriveAbilities, deriveCharacter, proficiencyBonus } from '@/rules/derive'
import { ABILITY_LABELS } from '@/rules/data/ability-labels'
import { getClassEntries, getClassLevel, getClassSubclassId, getPrimaryClassId, getTotalLevel, MAX_CHARACTER_LEVEL } from '@/rules/multiclass'
import { multiclassCasterWeights2014, multiclassThirdCasterSubclasses2014 } from '@/rules/data/multiclass-2014'
import { multiclassCasterWeights2024, multiclassThirdCasterSubclasses2024 } from '@/rules/data/multiclass-2024'
import { getMulticlassSlotRow } from '@/rules/data/multiclass-spell-slots-2014'
import { getCantripScaling2014 } from '@/rules/data/cantrip-scaling-2014'
import { getCantripScaling2024 } from '@/rules/data/cantrip-scaling-2024'
import { getFeatChosenAbility, isFeatGrantParentActive, isSelectionCheckpointActive, listActiveFeats, listFeatGrants } from '@/rules/feats'
import { normalizeManualEdits } from '@/rules/manual-edits'
import { getDraftSpeciesRules, getValidSpeciesChoice } from '@/rules/origins'
import { getRulesRepository } from '@/rules/repositories'
import { getWeaponMasteryCandidates } from '@/rules/weapon-mastery'
import { isWeaponTrainingCovered } from '@/rules/weapon-training'
import { abilityFromSpeciesSpellAbilityOption } from '@/rules/data/spell-lists-2024'
import { isSourceEnabled } from '@/rules/source-books'
import type { AbilityKey, CharacterDraft, ChoiceSelection, DerivedCharacter, RulesetId, SpellSelections } from '@/types/character'
import type { ClassSpellSelections } from '@/types/multiclass'
import type { ChoiceCheckpoint, FixedSpellGrant, RaceRule, RulesRepository, SpellcastingConfig, SpeciesSpellGrant, SpellRule } from '@/types/rules'

type SpellcraftDraft = Pick<CharacterDraft, 'classId' | 'subclassId' | 'enabledSourceIds' | 'ruleset'>

function abilityScoreAfterOrigin(draft: CharacterDraft, ability: SpellcastingConfig['ability']): number {
  return deriveAbilities(draft)[ability] + (normalizeManualEdits(draft.manualEdits).abilityAdjustments[ability] ?? 0)
}

export function getMaximumSpellLevel(config: SpellcastingConfig, classLevel: number): number {
  return config.maxSpellLevelByClassLevel[Math.max(0, classLevel - 1)] ?? 0
}

/** 单个环位的法术位信息；pact 模式下 count 为契约法术位数量、level 为契约环级。 */
export interface SpellSlotInfo {
  readonly level: number
  readonly count: number
  /** 是否为契约法术位（短休恢复）；仅邪术师（pact 模式）为 true。 */
  readonly pact?: boolean
}

/** 当前职业等级的法术位明细（派生展示数据，不持久化）；越界等级或未挂表时返回空数组。 */
export function getSpellSlots(config: SpellcastingConfig, classLevel: number): readonly SpellSlotInfo[] {
  if (classLevel < 1 || classLevel > 20) return []
  if (config.mode === 'pact') {
    const pact = config.pactSlotsByClassLevel?.[classLevel - 1]
    return pact ? [{ level: pact[1], count: pact[0], pact: true }] : []
  }
  const slots = config.slotsByClassLevel?.[classLevel - 1]
  if (!slots) return []
  return slots
    .map((count, index) => ({ level: index + 1, count }))
    .filter((slot) => slot.count > 0)
}

/** 兼职施法等级结果（MC-D01）。 */
export interface MulticlassSpellcastingLevel {
  /** 用于查「兼职施法者」表的施法等级。 */
  readonly casterLevel: number
  /** 契约魔法只按魔契师（邪术师）等级结算，不参与通用池。 */
  readonly pactClassId?: string
  readonly pactCasterLevel: number
  /** 逐职业算入的施法等级（供来源说明与界面展示）。 */
  readonly contributions: readonly { readonly classId: string; readonly className: string; readonly classLevel: number; readonly weight: 'full' | 'half' | 'third'; readonly value: number }[]
}

/**
 * 兼职施法等级（需求 §2.8；决策 D1）。
 *
 * 累加规则：
 * - 全施法者（吟游诗人／牧师／德鲁伊／术士／法师）等级**全额**；
 * - 半施法者（圣武士／游侠／奇械师）等级 ÷2 **向下取整**（2014 与 2024 同口径，D1）；
 * - 奥法骑士／诡术师按其职业等级 ÷3 **向下取整**（需已选择该子职）；
 * - 魔契师走契约魔法，不进入通用池。
 */
export function getMulticlassSpellcastingLevel(
  draft: Pick<CharacterDraft, 'ruleset' | 'subclassId' | 'classId' | 'targetLevel'> & Parameters<typeof getClassEntries>[0],
): MulticlassSpellcastingLevel {
  const repository = getRulesRepository(draft.ruleset)
  const contributions: MulticlassSpellcastingLevel['contributions'][number][] = []
  let pactClassId: string | undefined
  let pactCasterLevel = 0
  for (const entry of getClassEntries(draft)) {
    const classRule = repository.getClass(entry.classId)
    // 1/3 施法子职（奥法骑士／诡术师）：其职业本身没有施法特性，施法来自子职。
    const assignment = getCasterWeightAssignment(
      draft.ruleset,
      entry.classId,
      getClassSubclassId(draft, entry.classId),
    )
    const config = classRule?.spellcasting
    const subclassConfig = assignment?.weight === 'third'
      ? repository.getSubclass(getClassSubclassId(draft, entry.classId) ?? '')?.spellcasting
      : undefined
    if (config?.mode === 'pact') {
      // 契约魔法：只记录，不并入通用池
      if (entry.level > pactCasterLevel) {
        pactCasterLevel = entry.level
        pactClassId = entry.classId
      }
      continue
    }
    if (!config && !subclassConfig) continue
    if (!assignment) continue
    const value = assignment.weight === 'full'
      ? entry.level
      : assignment.weight === 'half'
        ? Math.floor(entry.level / 2)
        : Math.floor(entry.level / 3)
    if (value <= 0) continue
    contributions.push({
      classId: entry.classId,
      className: repository.getClass(entry.classId)?.name ?? entry.classId,
      classLevel: entry.level,
      weight: assignment.weight,
      value,
    })
  }
  return {
    casterLevel: Math.min(MAX_CHARACTER_LEVEL, contributions.reduce((sum, item) => sum + item.value, 0)),
    ...(pactClassId ? { pactClassId } : {}),
    pactCasterLevel,
    contributions,
  }
}

/** 单个职业的施法系数分配：1/3 施法由子职决定，其余按职业登记。 */
function getCasterWeightAssignment(
  ruleset: RulesetId,
  classId: string,
  subclassId: string | undefined,
): { readonly weight: 'full' | 'half' | 'third' } | undefined {
  const thirdCasters = ruleset === '5e-2014' ? multiclassThirdCasterSubclasses2014 : multiclassThirdCasterSubclasses2024
  if (subclassId && thirdCasters.includes(subclassId)) return { weight: 'third' }
  const weights = ruleset === '5e-2014' ? multiclassCasterWeights2014 : multiclassCasterWeights2024
  const weight = weights[classId]
  return weight ? { weight } : undefined
}

/**
 * 兼职通用法术位池：按施法等级查「兼职施法者」表；契约法术位单独返回（`pact: true`）。
 */
export function getMulticlassSpellSlots(draft: CharacterDraft): readonly SpellSlotInfo[] {
  const level = getMulticlassSpellcastingLevel(draft)
  const slots: SpellSlotInfo[] = level.casterLevel > 0
    ? getMulticlassSlotRow(level.casterLevel)
      .map((count, index) => ({ level: index + 1, count }))
      .filter((slot) => slot.count > 0)
    : []
  // 契约魔法池：按魔契师等级查契约表，与通用池并存互不合并。
  if (level.pactClassId) {
    const pactConfig = getRulesRepository(draft.ruleset).getClass(level.pactClassId)?.spellcasting
    const pact = pactConfig?.pactSlotsByClassLevel?.[level.pactCasterLevel - 1]
    if (pact && pact[0] > 0) slots.push({ level: pact[1], count: pact[0], pact: true })
  }
  return slots
}

/** 是否需要使用兼职法术位表：两个及以上职业时。单职业保持各职业自己的表（行为不变）。 */
function usesMulticlassSlotTable(draft: CharacterDraft): boolean {
  return getClassEntries(draft).length > 1
}

/**
 * 角色最终法术位：职业表（或兼职表）加人工环位差值；无施法职业也可通过人工调整获得环位。
 *
 * 通用池与契约池**按环级分别保留**（MC-D02）：两者可以停在同一环级（如 `魔契师3/法师5`
 * 的 2 环同时有通用 3 个与契约 2 个），此前按环级去重会让契约池覆盖通用池，丢掉通用环位。
 * 人工调整施加在通用池；没有通用池时（单职业魔契师）回退到契约池，保持既有行为不变。
 */
export function getEffectiveSpellSlots(draft: CharacterDraft): readonly SpellSlotInfo[] {
  let base: readonly SpellSlotInfo[]
  if (usesMulticlassSlotTable(draft)) {
    base = getMulticlassSpellSlots(draft)
  } else {
    const config = getSpellcastingConfig(draft)
    base = config ? getSpellSlots(config, draft.targetLevel) : []
  }
  const generalByLevel = new Map(base.filter((slot) => !slot.pact).map((slot) => [slot.level, slot]))
  const pactByLevel = new Map(base.filter((slot) => slot.pact).map((slot) => [slot.level, slot]))
  const adjustments = normalizeManualEdits(draft.manualEdits).spellSlotAdjustments
  const slots: SpellSlotInfo[] = []
  for (let level = 1; level <= 9; level += 1) {
    const adjustment = adjustments[level] ?? 0
    const general = generalByLevel.get(level)
    const pact = pactByLevel.get(level)
    // 人工调整每环只施加一次：优先通用池，其次契约池，两者都没有时自行建立一个通用环位
    // （无施法职业仍可通过人工调整获得 1—9 环法术位）。
    if (general) {
      const count = general.count + adjustment
      if (count > 0) slots.push({ level, count })
      if (pact && pact.count > 0) slots.push({ level, count: pact.count, pact: true })
      continue
    }
    if (pact) {
      const count = pact.count + adjustment
      if (count > 0) slots.push({ level, count, pact: true })
      continue
    }
    if (adjustment > 0) slots.push({ level, count: adjustment })
  }
  return slots
}

/** 戏法成长在某个角色总等级下的结果（MC-D05，决策 D4／D11／D12）。 */
export interface CantripScalingAtLevel {
  readonly spellId: string
  readonly name: string
  /** 数据来源标注。 */
  readonly sourceNote: string
  /** 是否为 1 级基础值（true 表示当前等级尚未获得成长，界面无需提示「已成长」）。 */
  readonly isBase: boolean
  /** 当前等级起的伤害骰。 */
  readonly dice?: string
  /** 当前等级起的射线／光束数量。 */
  readonly count?: number
  /** 当前等级起的骰型。 */
  readonly die?: string
  /** 特殊分支说明（只作展示，不进入结算）。 */
  readonly note?: string
}

/**
 * 按**角色总等级**取戏法的成长值；未登记成长规则时返回 undefined。
 *
 * 边界（决策 D12）：未登记条目不产出成长值，界面**不显示成长行**，也不写「无成长」——
 * 避免把「未登记」呈现为规则结论（2014 侧仅法定戏法与部分扩展戏法已登记）。
 */
export function getCantripScalingAtLevel(
  ruleset: RulesetId,
  spellId: string,
  characterLevel: number,
): CantripScalingAtLevel | undefined {
  const rule = ruleset === '5e-2014' ? getCantripScaling2014(spellId) : getCantripScaling2024(spellId)
  if (!rule || rule.steps.length === 0) return undefined
  const level = Math.max(1, Math.trunc(characterLevel))
  const applicable = rule.steps.filter((step) => step.level <= level)
  const step = applicable[applicable.length - 1] ?? rule.steps[0]
  if (!step) return undefined
  return {
    spellId: rule.id,
    name: rule.name,
    sourceNote: rule.sourceNote,
    isBase: step.level <= 1,
    ...(step.dice ? { dice: step.dice } : {}),
    ...(step.count !== undefined ? { count: step.count } : {}),
    ...(step.die ? { die: step.die } : {}),
    ...(step.note ? { note: step.note } : {}),
  }
}

/** 快捷入口：按草稿的**角色总等级**取戏法成长（兼职时取各职业等级之和）。 */
export function getDraftCantripScaling(draft: CharacterDraft, spellId: string): CantripScalingAtLevel | undefined {
  return getCantripScalingAtLevel(draft.ruleset, spellId, getTotalLevel(draft) || draft.targetLevel)
}

/**
 * 单个职业的法术选择（MC-D03）。
 *
 * 规则要求为**每个职业分别**制定已知／准备列表（需求 §2.8）。存储上：
 * - 多职业草稿以 `classSpellSelections` 为事实源；
 * - 单职业草稿继续以顶层数组为准（既有行为与 JSON 往返逐字段不变）；
 * - 多职业草稿里**没有自己分桶**的职业返回空选择，绝不回退到顶层数组——
 *   否则新建兼职角色时第二个职业会读到起始职业的法术（本轮修正）。
 */
export function getClassSpellSelections(
  draft: Pick<CharacterDraft, 'spellSelections' | 'classId'> & Parameters<typeof getClassEntries>[0],
  classId: string,
): SpellSelections {
  const buckets = draft.spellSelections.classSpellSelections
  const perClass = buckets?.find((item) => item.classId === classId)
  if (perClass) {
    return {
      cantripIds: perClass.cantripIds,
      knownSpellIds: perClass.knownSpellIds,
      preparedSpellIds: perClass.preparedSpellIds,
      spellbookSpellIds: perClass.spellbookSpellIds,
      transcribedSpellIds: draft.spellSelections.transcribedSpellIds,
      spellbookExtraSpellIds: draft.spellSelections.spellbookExtraSpellIds,
      spellbookReservedSpellIds: draft.spellSelections.spellbookReservedSpellIds,
      classSpellSelections: buckets,
    }
  }
  // 未分桶：只有起始职业沿用顶层数组；其余职业视为空。
  if (getClassEntries(draft).length > 1 && classId !== getPrimaryClassId(draft)) return emptySpellSelections()
  return draft.spellSelections
}

/** 空法术选择（含共享字段的占位）。 */
function emptySpellSelections(): SpellSelections {
  return {
    cantripIds: [],
    knownSpellIds: [],
    preparedSpellIds: [],
    spellbookSpellIds: [],
    transcribedSpellIds: [],
  }
}

/** 该草稿是否以按职业分桶的法术选择为准（兼职时；分桶按需在写入时创建）。 */
export function usesClassSpellSelections(draft: CharacterDraft): boolean {
  return getClassEntries(draft).length > 1
}

/** 全部职业的法术选择（含各自归属）；单职业返回顶层视图。 */
export function listClassSpellSelections(
  draft: CharacterDraft,
): readonly { readonly classId: string; readonly selections: SpellSelections }[] {
  return getClassEntries(draft).map((entry) => ({
    classId: entry.classId,
    selections: getClassSpellSelections(draft, entry.classId),
  }))
}

/** 只落分桶的四个「按职业」数组；共享字段（抄录／额外入书／能力预留）始终在顶层。 */
const CLASS_SPELL_ARRAY_KEYS = ['cantripIds', 'knownSpellIds', 'preparedSpellIds', 'spellbookSpellIds'] as const

function classSpellArrays(source: SpellSelections): Pick<SpellSelections, typeof CLASS_SPELL_ARRAY_KEYS[number]> {
  return {
    cantripIds: source.cantripIds,
    knownSpellIds: source.knownSpellIds,
    preparedSpellIds: source.preparedSpellIds,
    spellbookSpellIds: source.spellbookSpellIds,
  }
}

/** 共享字段以 `next` 为准，未提供时保留 `base`（`SpellSelections` 里它们是可选字段）。 */
function sharedSpellFields(
  next: SpellSelections,
  base: SpellSelections,
): Pick<SpellSelections, 'transcribedSpellIds' | 'spellbookExtraSpellIds' | 'spellbookReservedSpellIds'> {
  const extra = next.spellbookExtraSpellIds ?? base.spellbookExtraSpellIds
  const reserved = next.spellbookReservedSpellIds ?? base.spellbookReservedSpellIds
  return {
    transcribedSpellIds: next.transcribedSpellIds ?? base.transcribedSpellIds,
    ...(extra ? { spellbookExtraSpellIds: extra } : {}),
    ...(reserved ? { spellbookReservedSpellIds: reserved } : {}),
  }
}

function unionIds(left: readonly string[], right: readonly string[]): readonly string[] {
  return [...new Set([...left, ...right])]
}

/** 由分桶重建顶层并集镜像（共享字段沿用 `base`；分桶是事实源，见 `getClassSpellSelections`）。 */
function withBucketUnion(base: SpellSelections, buckets: readonly ClassSpellSelections[]): SpellSelections {
  const union = (key: typeof CLASS_SPELL_ARRAY_KEYS[number]): readonly string[] =>
    [...new Set(buckets.flatMap((bucket) => bucket[key] ?? []))]
  return {
    ...base,
    cantripIds: union('cantripIds'),
    knownSpellIds: union('knownSpellIds'),
    preparedSpellIds: union('preparedSpellIds'),
    spellbookSpellIds: union('spellbookSpellIds'),
    classSpellSelections: buckets,
  }
}

/**
 * 写入某职业的法术选择（MC-D03 写入侧）：与 `getClassSpellSelections` 的读取口径**严格对称**。
 *
 * 修复背景：读取只要该职业有分桶就以分桶为准，而写入原先按「施法职业数 > 1」判断，
 * 于是「单职业 + 已有分桶」的草稿（v10 迁移给每张旧卡都建了一个分桶）写入落在顶层数组上，
 * 界面读的却是分桶 → 法术加不上也删不掉。
 *
 * 判定：
 * - **单职业草稿** → 写顶层数组（既有约定，JSON 往返逐字段不变；分桶由 `normalizeSpellSelectionBuckets` 清理）；
 * - **多职业草稿** → 分桶是事实源：先确保每个职业都有自己的分桶（按当前生效读取值补齐，
 *   避免把起始职业写在顶层的既有数据弄丢），再改目标职业的分桶，最后把顶层刷新为并集镜像。
 *
 * 共享字段（抄录／子职额外入书／能力预留）不落分桶，始终写顶层。
 */
export function applyClassSpellSelections(
  draft: CharacterDraft,
  classId: string,
  next: SpellSelections,
): SpellSelections {
  const base = draft.spellSelections
  const buckets = base.classSpellSelections ?? []
  const shared = sharedSpellFields(next, base)
  const entries = getClassEntries(draft)
  if (entries.length <= 1) {
    // 单职业：写顶层数组，并顺手清掉历史遗留的分桶（否则读取仍优先读分桶 → 写入不可见）。
    const { classSpellSelections: _dropped, ...rest } = base
    return { ...rest, ...classSpellArrays(next), ...shared }
  }
  const ensured = entries.map((entry) => buckets.find((bucket) => bucket.classId === entry.classId)
    ?? { classId: entry.classId, ...classSpellArrays(getClassSpellSelections(draft, entry.classId)) })
  const nextBuckets = ensured.map((bucket) => bucket.classId === classId
    ? { ...bucket, ...classSpellArrays(next) }
    : bucket)
  return { ...withBucketUnion(base, nextBuckets), ...shared }
}

/**
 * 分桶卫生（幂等）：让存储形态与读取约定保持一致。
 *
 * - 职业数 ≤ 1：回到「单职业以顶层数组为准」，把存活职业的分桶**并回顶层**（并集，不丢 id），
 *   并清除 `classSpellSelections`（v10 迁移给单职业草稿建的分桶、关闭兼职合并后的残留分桶都属于这一类）；
 * - 职业数 > 1：只保留仍存在职业的分桶（被移除职业的分桶丢弃——其法术在移除时已归档进
 *   `inactiveSpellSelections`），并把顶层刷新为并集镜像；
 * - 没有分桶时原值返回。
 */
export function normalizeSpellSelectionBuckets(draft: CharacterDraft): SpellSelections {
  const base = draft.spellSelections
  const buckets = base.classSpellSelections ?? []
  if (buckets.length === 0) return base
  const entries = getClassEntries(draft)
  if (entries.length <= 1) {
    const { classSpellSelections: _dropped, ...rest } = base
    const survivingClassId = entries[0]?.classId ?? draft.classId
    const bucket = buckets.find((item) => item.classId === survivingClassId)
    if (!bucket) return rest
    return {
      ...rest,
      cantripIds: unionIds(rest.cantripIds, bucket.cantripIds),
      knownSpellIds: unionIds(rest.knownSpellIds, bucket.knownSpellIds),
      preparedSpellIds: unionIds(rest.preparedSpellIds, bucket.preparedSpellIds),
      spellbookSpellIds: unionIds(rest.spellbookSpellIds, bucket.spellbookSpellIds),
    }
  }
  const kept = entries.flatMap((entry) => {
    const bucket = buckets.find((item) => item.classId === entry.classId)
    return bucket ? [bucket] : []
  })
  return withBucketUnion(base, kept)
}

/** 页面、跑团与导出共用：职业、始终授予及人工法术按 ID 去重。 */
export function getEffectiveSelectedSpellIds(draft: CharacterDraft): readonly string[] {
  const repository = getRulesRepository(draft.ruleset)
  const config = getSpellcastingConfig(draft)
  const normal = config ? getSelectedSpellIds(draft, config) : []
  const manual = normalizeManualEdits(draft.manualEdits).addedSpells
    .filter((item) => {
      const level = repository.getSpell(item.spellId)?.level
      return level === 0
        || item.prepared
        || item.destination === 'known'
        || item.destination === 'pact-known'
        || item.destination === 'granted'
    })
    .map((item) => item.spellId)
  // 兼职：合并各职业自己的戏法与已知／准备法术（每个法术都带职业归属）。
  const perClass = usesClassSpellSelections(draft)
    ? listClassSpellSelections(draft).flatMap(({ selections }) => [...selections.cantripIds, ...selections.preparedSpellIds, ...selections.knownSpellIds, ...selections.spellbookSpellIds])
    : []
  return [...new Set([...draft.spellSelections.cantripIds, ...normal, ...perClass, ...getAlwaysPreparedSpellIds(draft), ...manual])]
}

/** 人工加入准备列表/法术书、但尚未准备的有环法术。 */
export function getUnpreparedManualSpellIds(draft: CharacterDraft): readonly string[] {
  const repository = getRulesRepository(draft.ruleset)
  return normalizeManualEdits(draft.manualEdits).addedSpells
    .filter((item) => !item.prepared && (item.destination === 'prepared-list' || item.destination === 'spellbook'))
    .filter((item) => (repository.getSpell(item.spellId)?.level ?? 0) > 0)
    .map((item) => item.spellId)
}

/** 是否以“准备列表”选择法术：prepared／spellbook，或 2024 契约施法（pact 且按准备表）。 */
export function usesPreparedSelection(config: SpellcastingConfig): boolean {
  return config.mode === 'prepared' || config.mode === 'spellbook' || (config.mode === 'pact' && Boolean(config.preparedCountByLevel))
}

export function getRequiredSpellCount(draft: CharacterDraft, config: SpellcastingConfig, scope?: SpellcastingScope): number {
  const level = (scope ?? resolveScope(draft, config)).classLevel
  if (level < config.startsAtLevel) return 0
  if (config.preparedCountByLevel) return config.preparedCountByLevel[level - 1] ?? 0
  if (config.mode === 'known' || config.mode === 'pact') return config.spellsKnownByLevel?.[level - 1] ?? 0
  if (config.preparedFormula === 'ability-plus-half-level') {
    return Math.max(1, abilityModifier(abilityScoreAfterOrigin(draft, config.ability)) + Math.floor(level / 2))
  }
  if (config.preparedFormula === 'ability-plus-half-level-ceil') {
    return Math.max(1, abilityModifier(abilityScoreAfterOrigin(draft, config.ability)) + Math.ceil(level / 2))
  }
  if (config.preparedFormula === 'ability-plus-level') {
    return Math.max(1, abilityModifier(abilityScoreAfterOrigin(draft, config.ability)) + level)
  }
  return 0
}

export function getRequiredCantripCount(draft: CharacterDraft, config: SpellcastingConfig, scope?: SpellcastingScope): number {
  const resolved = scope ?? resolveScope(draft, config)
  const base = config.cantripsKnownByLevel?.[resolved.classLevel - 1] ?? 0
  if (base === 0) return 0
  // 选择类特性可追加戏法（如 2024 牧师圣职·奇术使）。
  const repository = getRulesRepository(draft.ruleset)
  let bonus = 0
  for (const selection of draft.selections) {
    if (selection.invalidatedAt || !isSelectionCheckpointActive(draft, selection.checkpointId)) continue
    for (const optionId of selection.optionIds) bonus += repository.getOption(optionId)?.cantripBonus ?? 0
  }
  return base + bonus
}

export function getRequiredSpellbookCount(draft: CharacterDraft, config: SpellcastingConfig, scope?: SpellcastingScope): number {
  const level = (scope ?? resolveScope(draft, config)).classLevel
  return config.spellbookSpellsByLevel?.[level - 1] ?? 0
}

/** 子职额外入书规则（如 2024 塑能学者）；未选择子职或子职未声明时返回 undefined。 */
export function getSpellbookExtraRule(
  draft: Pick<CharacterDraft, 'subclassId' | 'enabledSourceIds' | 'ruleset'>,
  scope?: SpellcastingScope,
): { readonly base: number; readonly perNewSpellLevel: number; readonly schools: readonly string[]; readonly startsAtLevel: number } | undefined {
  const subclassId = scope?.subclassId ?? draft.subclassId
  if (!subclassId) return undefined
  const repository = getRulesRepository(draft.ruleset)
  const subclass = repository.getSubclass(subclassId)
  const rule = subclass?.spellbookExtraSpells
  if (!subclass || !rule) return undefined
  if (!isSourceEnabled(subclass.sourceIds, draft.enabledSourceIds, repository)) return undefined
  return { ...rule, startsAtLevel: subclass.selectionLevel }
}

/** 额外入书名额：基础名额＋子职获得后每个新法术环位追加名额。 */
export function getSpellbookExtraAllowance(draft: CharacterDraft, config: SpellcastingConfig, scope?: SpellcastingScope): number {
  const resolved = scope ?? resolveScope(draft, config)
  const extra = getSpellbookExtraRule(draft, resolved)
  if (!extra || resolved.config.mode !== 'spellbook' || resolved.classLevel < extra.startsAtLevel) return 0
  const maximumLevels = resolved.config.maxSpellLevelByClassLevel ?? []
  let gained = 0
  for (let level = extra.startsAtLevel + 1; level <= resolved.classLevel; level += 1) {
    if ((maximumLevels[level - 1] ?? 0) > (maximumLevels[level - 2] ?? 0)) gained += 1
  }
  return extra.base + gained * extra.perNewSpellLevel
}

/** 额外入书候选：当前可用法术中学派匹配的部分（含已在书中的条目，供界面标记状态）。 */
export function getSpellbookExtraCandidates(draft: CharacterDraft, config: SpellcastingConfig, scope?: SpellcastingScope): readonly SpellRule[] {
  const resolved = scope ?? resolveScope(draft, config)
  const extra = getSpellbookExtraRule(draft, resolved)
  if (!extra) return []
  return getAvailableSpells(draft, resolved.config, resolved)
    .filter((spell) => spell.level > 0 && spell.school !== undefined && extra.schools.includes(spell.school))
}

export function getSelectedSpellIds(draft: CharacterDraft, config: SpellcastingConfig, scope?: SpellcastingScope): readonly string[] {
  const selections = (scope ?? resolveScope(draft, config)).selections
  if (usesPreparedSelection(config)) return selections.preparedSpellIds
  return selections.knownSpellIds
}

/** 候选池：可更换（准备）但尚未选择的法术 ID。`known`/`pact` 模式在 2014 规则中平时不可更换，无候选。 */
export interface SpellCandidates {
  /** prepared 模式：职业法术池（1 环起）中未准备的法术。 */
  readonly prepared: readonly string[]
  /** spellbook 模式：职业法术池（1 环起）中未写入法术书的法术（升级时可扩充入书）。 */
  readonly writeToBook: readonly string[]
  /** spellbook 模式：法术书中未准备的法术（长休可从书中换入准备）。 */
  readonly prepareFromBook: readonly string[]
}

export function getSpellCandidates(draft: CharacterDraft, config: SpellcastingConfig, scope?: SpellcastingScope): SpellCandidates {
  const resolved = scope ?? resolveScope(draft, config)
  const availableIds = getAvailableSpells(draft, resolved.config, resolved)
    .filter((spell) => spell.level > 0)
    .map((spell) => spell.id)
  const empty: SpellCandidates = { prepared: [], writeToBook: [], prepareFromBook: [] }
  if (resolved.config.mode === 'spellbook') {
    const book = resolved.selections.spellbookSpellIds
    const prepared = resolved.selections.preparedSpellIds
    return {
      prepared: [],
      writeToBook: availableIds.filter((id) => !book.includes(id)),
      prepareFromBook: book.filter((id) => !prepared.includes(id)),
    }
  }
  if (usesPreparedSelection(resolved.config)) {
    const selected = getSelectedSpellIds(draft, resolved.config, resolved)
    return { ...empty, prepared: availableIds.filter((id) => !selected.includes(id)) }
  }
  return empty
}

export function getAvailableSpells(draft: CharacterDraft, config: SpellcastingConfig, scope?: SpellcastingScope) {
  const repository = getRulesRepository(draft.ruleset)
  const resolved = scope ?? resolveScope(draft, config)
  const classLevel = resolved.classLevel
  const maximumLevel = getMaximumSpellLevel(resolved.config, classLevel)
  const expanded = resolved.config.expandedSpellPool && classLevel >= resolved.config.expandedSpellPool.startsAtLevel
    ? resolved.config.expandedSpellPool.spellIds
    : []
  // 专长扩表（如龙纹「纹中之法」）：仅在来源启用时加入候选。
  const featExpanded = listActiveFeats(draft, repository).flatMap((feat) => feat.expandedSpellPool ?? [])
  // 子职法术书扩表（如 EGtW 时间魔法／重力法师的秘迹学法术）：仅在选择该子职且来源启用时加入候选。
  const subclassId = resolved.subclassId
  const subclass = subclassId ? repository.getSubclass(subclassId) : undefined
  const subclassExpanded = subclass && isSourceEnabled(subclass.sourceIds, draft.enabledSourceIds, repository)
    ? subclass.spellbookSpellIds ?? []
    : []
  return [...new Set([...resolved.config.classSpellIds, ...expanded, ...featExpanded, ...subclassExpanded])]
    .map((id) => repository.getSpell(id))
    .filter((spell): spell is NonNullable<typeof spell> => Boolean(
      spell
      && spell.level <= maximumLevel
      && isSourceEnabled(spell.sourceIds, draft.enabledSourceIds, repository),
    ))
}

/** 单个环级的法术分组；组内顺序由 `groupSpellsByLevel` 保证为规则表登记顺序。 */
export interface SpellLevelGroup {
  readonly level: number
  readonly spells: readonly SpellRule[]
}

/** 规则表登记下标（按规则集缓存）；数据为静态注册表，解析后不变。 */
const spellOrderIndexes = new Map<RulesetId, ReadonlyMap<string, number>>()

function getSpellOrderIndex(ruleset: RulesetId): ReadonlyMap<string, number> {
  const cached = spellOrderIndexes.get(ruleset)
  if (cached) return cached
  const index = new Map(getRulesRepository(ruleset).spells.map((spell, position) => [spell.id, position]))
  spellOrderIndexes.set(ruleset, index)
  return index
}

/**
 * 法术排序比较器：环级升序，同环内按规则表登记顺序；不在规则表内的法术（防御性分支）排到末尾，
 * 并因 `sort` 稳定而保留其输入相对顺序。`groupSpellsByLevel` 与 `sortSpellsByLevel` 共用这一份规则，
 * 避免展示顺序再次分叉（角色卡与第 8 步同源）。
 */
function compareSpellsByLevel(order: ReadonlyMap<string, number>): (left: SpellRule, right: SpellRule) => number {
  return (left, right) =>
    left.level - right.level
    || (order.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(right.id) ?? Number.MAX_SAFE_INTEGER)
}

/**
 * 法术列表统一排序与分组（U01）：环级升序，同环内按规则表登记顺序。
 * 输入数组可能是玩家点选顺序或「候选池 + 人工添加」的拼接结果，不能直接当作展示顺序，
 * 因此这里显式按规则表重排；草稿存储顺序不受影响。
 */
export function groupSpellsByLevel(spells: readonly SpellRule[], ruleset: RulesetId): readonly SpellLevelGroup[] {
  const compare = compareSpellsByLevel(getSpellOrderIndex(ruleset))
  const byLevel = new Map<number, SpellRule[]>()
  for (const spell of spells) {
    const list = byLevel.get(spell.level) ?? []
    list.push(spell)
    byLevel.set(spell.level, list)
  }
  return [...byLevel.entries()]
    .sort(([left], [right]) => left - right)
    .map(([level, group]) => ({ level, spells: [...group].sort(compare) }))
}

/**
 * 扁平的法术列表排序（v1.9.1 追加）：环级升序（戏法 0 环最先），同环内按规则表登记顺序。
 * 与 `groupSpellsByLevel` 共用比较规则与登记下标缓存，供第 8 步候选列表与「当前已选」区块使用；
 * 只重排展示顺序，不修改入参、不改变草稿存储顺序。
 */
export function sortSpellsByLevel(spells: readonly SpellRule[], ruleset: RulesetId): readonly SpellRule[] {
  if (spells.length === 0) return []
  return [...spells].sort(compareSpellsByLevel(getSpellOrderIndex(ruleset)))
}

/** 法术精通／招牌法术检查点：两版规则使用稳定前缀，且只有这些节点会预留法术书法术。 */
export function isSpellbookReservationCheckpoint(checkpointId: string): boolean {
  return checkpointId.startsWith('wizard-2014-spell-mastery-')
    || checkpointId.startsWith('wizard-2014-signature-spells-')
    || checkpointId.startsWith('class-2024-wizard-spell-mastery-')
    || checkpointId.startsWith('class-2024-wizard-signature-spells-')
}

/** 当前有效的高等级法师能力选择；用于最终一致性校验与旧草稿兼容。 */
export function getSelectedSpellbookReservationIds(draft: Pick<CharacterDraft, 'selections'>): readonly string[] {
  return [...new Set(draft.selections
    .filter((selection) => !selection.invalidatedAt && isSpellbookReservationCheckpoint(selection.checkpointId))
    .flatMap((selection) => selection.optionIds))]
}

/**
 * 首次高等级车卡在时间线先于法术页：此时只有预留法术可以已经在书中。
 * 完成角色必须有名称；重新编辑会保留名称，因此清空既有法术书不会绕过候选限制。
 */
function isInitialWizardSpellbookBuild(draft: CharacterDraft): boolean {
  if (draft.name.trim() || draft.currentStep === 'sheet') return false
  const reserved = new Set([
    ...(draft.spellSelections.spellbookReservedSpellIds ?? []),
    ...getSelectedSpellbookReservationIds(draft),
  ])
  return draft.spellSelections.spellbookSpellIds.every((id) => reserved.has(id))
}

/**
 * 保存法术精通／招牌法术时同步法术书预留。
 * 首次构筑且法术书仅由预留组成时可安全移除被替换项；已有角色只解除锁定，不猜测并删除
 * 既有法术书记录。抄录和子职额外入书来源始终优先保留。
 */
export function applySpellbookReservationSelection(
  draft: CharacterDraft,
  checkpointId: string,
  optionIds: readonly string[],
  confirmedAt = new Date().toISOString(),
): { readonly selections: readonly ChoiceSelection[]; readonly spellSelections: SpellSelections } {
  const nextSelection: ChoiceSelection = { checkpointId, optionIds: [...new Set(optionIds)], confirmedAt }
  const selections = [...draft.selections.filter((selection) => selection.checkpointId !== checkpointId), nextSelection]
  if (!isSpellbookReservationCheckpoint(checkpointId)) return { selections, spellSelections: draft.spellSelections }

  const previousReserved = new Set(draft.spellSelections.spellbookReservedSpellIds ?? [])
  const reserved = getSelectedSpellbookReservationIds({ selections })
  const reservedSet = new Set(reserved)
  const retainedByOtherSource = new Set([
    ...draft.spellSelections.transcribedSpellIds,
    ...(draft.spellSelections.spellbookExtraSpellIds ?? []),
  ])
  const safelyReleased = isInitialWizardSpellbookBuild(draft)
    ? new Set([...previousReserved].filter((id) => !reservedSet.has(id) && !retainedByOtherSource.has(id)))
    : new Set<string>()
  // 法术书属于该职业作用域：写入走与读取对称的入口（有分桶写分桶、单职业写顶层）。
  const scopeSelections = getClassSpellSelections(draft, draft.classId ?? '')
  const spellbookSpellIds = [...new Set([
    ...scopeSelections.spellbookSpellIds.filter((id) => !safelyReleased.has(id)),
    ...reserved,
  ])]
  return {
    selections,
    spellSelections: applyClassSpellSelections(draft, draft.classId ?? '', {
      ...scopeSelections,
      spellbookSpellIds,
      spellbookReservedSpellIds: reserved,
    }),
  }
}

/**
 * 动态候选池：解析检查点在当前草稿下的候选选项。
 * 普通检查点返回静态 optionIds；法术级候选（candidateKind）按草稿状态生成：
 * `all-spells` 为全部已登记 1 环及以上法术（环级不高于当前可用最高环，魔法奥秘用）；
 * `spellbook-level-N` 通常为法术书中对应环级的法术；首次高等级车卡且法术书尚未建立时，
 * 临时使用对应版本的法师职业法术表，保存后立即预留进法术书。
 */
export function getCheckpointCandidates(draft: CharacterDraft, checkpoint: ChoiceCheckpoint): readonly string[] {
  if (checkpoint.optionIds.length > 0) return checkpoint.optionIds
  if (!checkpoint.candidateKind) return []
  const repository = getRulesRepository(draft.ruleset)
  if (checkpoint.candidateKind === 'weapon-mastery') {
    const classRule = draft.classId ? repository.getClass(draft.classId) : undefined
    const training = classRule?.weaponTraining
    return getWeaponMasteryCandidates(repository)
      .filter((item) => checkpoint.weaponMasteryFilter !== 'melee' || item.weaponKind?.endsWith('melee'))
      .filter((item) => checkpoint.weaponMasteryFilter !== 'proficient' || isWeaponTrainingCovered(training, item))
      .map((item) => item.id)
  }
  if (checkpoint.candidateKind === 'spell-pool') {
    const pool = checkpoint.spellPool
    if (!pool) return []
    const classId = pool.fromListChoiceId
      ? resolveSpellListClassId(draft, checkpoint, pool.fromListChoiceId)
      : undefined
    if (pool.fromListChoiceId && !classId) return []
    const config = getSpellcastingConfig(draft)
    const maximumLevel = pool.level ?? (config ? getMaximumSpellLevel(config, draft.targetLevel) : 0)
    const minimumLevel = pool.level === undefined && pool.includeCantrips ? 0 : 1
    return repository.spells
      .filter((spell) => pool.level !== undefined ? spell.level === pool.level : spell.level >= minimumLevel && spell.level <= maximumLevel)
      .filter((spell) => !pool.schools || (spell.school !== undefined && pool.schools.includes(spell.school)))
      .filter((spell) => !pool.ritualOnly || spell.ritual)
      .filter((spell) => !checkpoint.spellCastingTime || spell.castingTime === checkpoint.spellCastingTime)
      .filter((spell) => !classId || spell.classIds.includes(classId))
      .filter((spell) => !pool.classIds || spell.classIds.some((id) => pool.classIds?.includes(id)))
      .filter((spell) => isSourceEnabled(spell.sourceIds, draft.enabledSourceIds, repository))
      .map((spell) => spell.id)
  }
  if (checkpoint.candidateKind === 'all-spells') {
    const config = getSpellcastingConfig(draft)
    if (!config || draft.targetLevel < config.startsAtLevel) return []
    const maximumLevel = getMaximumSpellLevel(config, draft.targetLevel)
    return repository.spells
      .filter((spell) => spell.level >= 1 && spell.level <= maximumLevel && isSourceEnabled(spell.sourceIds, draft.enabledSourceIds, repository))
      .map((spell) => spell.id)
  }
  const targetLevel = checkpoint.candidateKind === 'spellbook-level-1' ? 1
    : checkpoint.candidateKind === 'spellbook-level-2' ? 2
      : 3
  const config = getSpellcastingConfig(draft)
  const candidateIds = isInitialWizardSpellbookBuild(draft) && config?.mode === 'spellbook'
    ? config.classSpellIds
    : draft.spellSelections.spellbookSpellIds
  return candidateIds
    .map((id) => repository.getSpell(id))
    .filter((spell): spell is NonNullable<typeof spell> => Boolean(
      spell
      && spell.level === targetLevel
      && (!checkpoint.spellCastingTime || spell.castingTime === checkpoint.spellCastingTime)
      && isSourceEnabled(spell.sourceIds, draft.enabledSourceIds, repository),
    ))
    .map((spell) => spell.id)
}

/** 魔法奥秘法术：从时间线检查点选择中提取（不计入已知法术上限，展示与导出用）。 */
export function getMagicalSecretsSpellIds(draft: CharacterDraft): readonly string[] {
  return draft.selections
    .filter((item) => item.checkpointId.startsWith('bard-2014-magical-secrets-') && !item.invalidatedAt)
    .flatMap((item) => item.optionIds)
    .filter((id, index, all) => all.indexOf(id) === index)
}

/**
 * 解析角色当前施法配置：子职级施法（奥法骑士、诡术师）优先，否则回退职业级。
 * 按草稿规则版本选择仓库；2014 草稿与既有行为等价。
 */
export function getSpellcastingConfig(draft: SpellcraftDraft): SpellcastingConfig | undefined {
  const repository = getRulesRepository(draft.ruleset ?? '5e-2014')
  const subclass = draft.subclassId ? repository.getSubclass(draft.subclassId) : undefined
  if (subclass && !isSourceEnabled(subclass.sourceIds, draft.enabledSourceIds, repository)) return undefined
  const classRule = draft.classId ? repository.getClass(draft.classId) : undefined
  if (classRule && !isSourceEnabled(classRule.sourceIds, draft.enabledSourceIds, repository)) return undefined
  return repository.getSpellcastingConfig(draft)
}

/**
 * 施法作用域（MC-D02／D03）：**一个职业自己的**施法配置、等级与法术选择。
 *
 * 兼职角色的每个施法职业必须独立制定已知／准备列表（需求 §2.8），
 * 因此数量、环级上限、候选池与写回目标都以作用域为单位，而不是角色总等级与顶层数组。
 */
export interface SpellcastingScope {
  readonly classId: string
  readonly className: string
  /** 该职业**自己的**等级（不是角色总等级）。 */
  readonly classLevel: number
  readonly subclassId?: string
  readonly config: SpellcastingConfig
  /** 该职业自己的法术选择分桶；单职业草稿即顶层数组。 */
  readonly selections: SpellSelections
  /** 是否为契约魔法（魔契师）：契约池按该职业自身等级查表，不并入通用池。 */
  readonly pact: boolean
}

/** 单个职业的施法作用域；该职业没有施法能力（含 1/3 施法子职）时返回 undefined。 */
export function getSpellcastingScope(draft: CharacterDraft, classId: string | undefined): SpellcastingScope | undefined {
  if (!classId) return undefined
  const repository = getRulesRepository(draft.ruleset)
  const subclassId = getClassSubclassId(draft, classId)
  const classRule = repository.getClass(classId)
  if (!classRule || !isSourceEnabled(classRule.sourceIds, draft.enabledSourceIds, repository)) return undefined
  const config = getSpellcastingConfig({
    ruleset: draft.ruleset,
    classId,
    subclassId,
    enabledSourceIds: draft.enabledSourceIds,
  })
  if (!config) return undefined
  return {
    classId,
    className: classRule.name,
    classLevel: getClassLevel(draft, classId) || draft.targetLevel,
    ...(subclassId ? { subclassId } : {}),
    config,
    selections: getClassSpellSelections(draft, classId),
    pact: config.mode === 'pact',
  }
}

/**
 * 草稿的全部施法作用域（按职业加入顺序）。
 * 单职业草稿返回 0 或 1 项，各消费方在省略作用域参数时即按本函数的第一项行为取值。
 */
export function listSpellcastingScopes(draft: CharacterDraft): readonly SpellcastingScope[] {
  const entries = getClassEntries(draft)
  const scopes = entries.flatMap((entry) => {
    const scope = getSpellcastingScope(draft, entry.classId)
    return scope ? [scope] : []
  })
  if (scopes.length > 0 || entries.length > 0) return scopes
  // 无职业字段的旧夹具：退回按 classId／targetLevel 解析，保持既有行为。
  const fallback = getSpellcastingScope(draft, draft.classId)
  return fallback ? [fallback] : []
}

/**
 * 作用域缺省值：省略 `scope` 参数时按起始职业 + 角色总等级 + 顶层数组构造，
 * 保证单职业草稿的全部调用点逐字段不变。
 */
function defaultScope(draft: CharacterDraft): SpellcastingScope | undefined {
  const config = getSpellcastingConfig(draft)
  if (!config) return undefined
  const classId = draft.classId ?? ''
  return {
    classId,
    className: getRulesRepository(draft.ruleset).getClass(classId)?.name ?? '',
    classLevel: draft.targetLevel,
    ...(draft.subclassId ? { subclassId: draft.subclassId } : {}),
    config,
    selections: draft.spellSelections,
    pact: config.mode === 'pact',
  }
}

/** 解析生效作用域：显式传入优先，其次按草稿默认口径。 */
function resolveScope(draft: CharacterDraft, config: SpellcastingConfig, scope?: SpellcastingScope): SpellcastingScope {
  if (scope) return scope
  return defaultScope(draft) ?? {
    classId: draft.classId ?? '',
    className: '',
    classLevel: draft.targetLevel,
    ...(draft.subclassId ? { subclassId: draft.subclassId } : {}),
    config,
    selections: draft.spellSelections,
    pact: config.mode === 'pact',
  }
}

/**
 * 每职业施法属性（MC-D02）：法术攻击加值与豁免 DC 按**归属职业**分别给出。
 *
 * 熟练加值取**角色总等级**口径（兼职规则：熟练加值按总等级）；属性调整值取该职业的施法属性
 * （法术只能用该职业的施法属性施展，需求 §2.8）。
 * 手动调整（`manualEdits.derivedAdjustments`）是角色级覆盖，不在此重复计入。
 */
export interface ClassSpellcastingProfile {
  readonly classId: string
  readonly className: string
  readonly classLevel: number
  readonly ability: AbilityKey
  readonly abilityLabel: string
  readonly saveDc: number
  readonly attackBonus: number
  readonly mode: SpellcastingConfig['mode']
  /** 契约魔法（魔契师）：法术位按该职业自身等级单独结算。 */
  readonly pact: boolean
  /** 该职业等级下可用的最高法术环级。 */
  readonly maxSpellLevel: number
}

export function getClassSpellcastingProfiles(draft: CharacterDraft, scopes?: readonly SpellcastingScope[]): readonly ClassSpellcastingProfile[] {
  const proficiency = proficiencyBonus(getTotalLevel(draft) || draft.targetLevel)
  return (scopes ?? listSpellcastingScopes(draft)).map((scope) => {
    const modifier = abilityModifier(abilityScoreAfterOrigin(draft, scope.config.ability))
    return {
      classId: scope.classId,
      className: scope.className,
      classLevel: scope.classLevel,
      ability: scope.config.ability,
      abilityLabel: ABILITY_LABELS[scope.config.ability],
      saveDc: 8 + proficiency + modifier,
      attackBonus: proficiency + modifier,
      mode: scope.config.mode,
      pact: scope.pact,
      maxSpellLevel: getMaximumSpellLevel(scope.config, scope.classLevel),
    }
  })
}

function findClassCheckpoint(repository: RulesRepository, checkpointId: string): ChoiceCheckpoint | undefined {
  for (const classRule of repository.classes) {
    const found = classRule.checkpoints.find((checkpoint) => checkpoint.id === checkpointId)
    if (found) return found
  }
  return undefined
}

/** 从同一专长的法术表选择中解析出职业 ID；未选择或非法时返回 undefined。 */
function resolveSpellListClassId(
  draft: CharacterDraft,
  checkpoint: ChoiceCheckpoint,
  listChoiceId: string,
): string | undefined {
  const [, parentCheckpointId, featId] = checkpoint.id.split(':')
  if (!parentCheckpointId || !featId) return undefined
  const selection = draft.selections.find((item) =>
    item.checkpointId === `feat-child:${parentCheckpointId}:${featId}:${listChoiceId}` && !item.invalidatedAt)
  const background = draft.backgroundId && parentCheckpointId === `${draft.backgroundId}-origin-feat`
    ? getRulesRepository(draft.ruleset).getBackground(draft.backgroundId)
    : undefined
  const optionId = selection?.optionIds[0] ?? background?.originFeatChoicePresets?.[listChoiceId]?.[0]
  if (!optionId || !getRulesRepository(draft.ruleset).getOption(optionId)) return undefined
  const slug = optionId.replace(/^spell-list-/, '')
  const classId = `class-${draft.ruleset.slice(3)}-${slug}`
  return getRulesRepository(draft.ruleset).getClass(classId) ? classId : undefined
}

/** 物种按等级授予的固定法术（纯函数，供派生与测试）。 */
export function collectSpeciesSpellGrants(
  race: RaceRule | undefined,
  targetLevel: number,
  draft?: CharacterDraft,
): readonly SpeciesSpellGrant[] {
  const parent = draft ? getDraftSpeciesRules(draft, getRulesRepository(draft.ruleset)).find((item) => item.id === race?.parentRaceId) : undefined
  const ability = draft && race ? getSpeciesSpellAbility(race, draft.selections, draft) ?? (parent ? getSpeciesSpellAbility(parent, draft.selections, draft) : undefined) : undefined
  const abilitySelected = !(race?.spellcastingAbilityChoices?.length || parent?.spellcastingAbilityChoices?.length) || !draft || Boolean(ability)
  const fixed = (race?.spellGrants ?? []).filter((grant) => grant.minimumLevel <= targetLevel && (grant.ability || abilitySelected))
  if (!race?.chosenCantripCheckpointId || !draft) return fixed
  const selected = getValidSpeciesChoice(draft, getRulesRepository(draft.ruleset), race.chosenCantripCheckpointId)
  return ability && selected ? [...fixed, ...selected.map((spellId) => ({ spellId, minimumLevel: 1, alwaysPrepared: true, ability, canCastWithSpellSlots: false }))] : fixed
}

/** 物种法术施法属性：从 `spell-ability-*` 时间线选择解析。 */
export function getSpeciesSpellAbility(
  race: RaceRule,
  selections: readonly ChoiceSelection[],
  draft?: CharacterDraft,
): AbilityKey | undefined {
  const records = selections.filter((item) => !item.invalidatedAt && item.checkpointId === `${race.id}-spellcasting-ability`)
  if (records.length !== 1) return undefined
  const selection = records[0]
  if (selection?.optionIds.length !== 1) return undefined
  const ability = abilityFromSpeciesSpellAbilityOption(selection.optionIds[0])
  const choice = race.choices?.find((item) => item.id === `${race.id}-spellcasting-ability`)
  if (choice && draft && !getValidSpeciesChoice(draft, getRulesRepository(draft.ruleset), choice.id)) return undefined
  return ability && (race.spellcastingAbilityChoices?.includes(ability) || choice?.optionIds.includes(selection.optionIds[0] ?? '')) ? ability : undefined
}

export interface SpeciesSpellcastingProfile {
  readonly id: string
  readonly sourceId: string
  readonly sourceName: string
  readonly ability: AbilityKey
  readonly spellIds: readonly string[]
  readonly materialFreeSpellIds: readonly string[]
  readonly castingNotes: readonly string[]
  readonly attackBonus: number
  readonly saveDc: number
}

/** 种族施法不继承职业施法的人工修正；属性与熟练修正仍参与计算。 */
export function getSpeciesSpellcastingProfiles(
  draft: CharacterDraft,
  derived: DerivedCharacter = deriveCharacter(draft),
): readonly SpeciesSpellcastingProfile[] {
  const repository = getRulesRepository(draft.ruleset)
  const races = getDraftSpeciesRules(draft, repository)
  const inheritedAbility = races.map((race) => getSpeciesSpellAbility(race, draft.selections, draft))
    .find((ability): ability is AbilityKey => Boolean(ability))
  return races.flatMap((race) => {
    const groups = new Map<AbilityKey, { spellIds: Set<string>; materialFreeSpellIds: Set<string>; castingNotes: string[] }>()
    for (const grant of collectSpeciesSpellGrants(race, draft.targetLevel, draft)) {
      const ability = grant.ability ?? getSpeciesSpellAbility(race, draft.selections, draft) ?? inheritedAbility
      if (!ability || !repository.getSpell(grant.spellId)) continue
      const group = groups.get(ability) ?? { spellIds: new Set<string>(), materialFreeSpellIds: new Set<string>(), castingNotes: [] }
      group.spellIds.add(grant.spellId)
      if (grant.waivesMaterialComponents || grant.waivedComponents?.includes('material')) group.materialFreeSpellIds.add(grant.spellId)
      const note = speciesCastingNote(grant)
      if (note) group.castingNotes.push(`${repository.getSpell(grant.spellId)?.name}：${note}`)
      groups.set(ability, group)
    }
    return [...groups].map(([ability, group]) => {
      const attackBonus = derived.proficiencyBonus.value + derived.modifiers[ability]
      return {
        id: `${race.id}-spellcasting-${ability}`, sourceId: race.id, sourceName: race.name,
        ability, spellIds: [...group.spellIds], materialFreeSpellIds: [...group.materialFreeSpellIds], castingNotes: group.castingNotes, attackBonus, saveDc: 8 + attackBonus,
      }
    })
  })
}

function speciesCastingNote(grant: SpeciesSpellGrant): string {
  const components = grant.waivedComponents ?? (grant.waivesMaterialComponents ? ['material'] : [])
  const componentNames = components.map((component) => component === 'verbal' ? '语言' : component === 'somatic' ? '姿势' : '材料')
  const componentNote = components.length === 3 ? '无需语言、姿势及材料成分（不免专注）' : componentNames.length ? `无需${componentNames.join('、')}成分（种族施放；不免专注）` : ''
  return [componentNote, grant.targetRestriction === 'snakes-only' ? '仅限蛇' : grant.targetRestriction === 'self-only' ? '仅限自身' : '', grant.atWill ? '不限次数，不耗法术位' : '', grant.castingLevel ? `种族免费施放为${grant.castingLevel}环` : '', grant.canCastWithSpellSlots === false ? '此授予不许可法术位施放' : '', grant.castingNote ?? ''].filter(Boolean).join('；')
}

export function getSpeciesCastingMethods(draft: CharacterDraft, spellId: string): readonly (SpeciesSpellGrant & { readonly sourceId: string; readonly sourceName: string; readonly ability: AbilityKey; readonly note: string })[] {
  const repository = getRulesRepository(draft.ruleset)
  const races = getDraftSpeciesRules(draft, repository)
  const inheritedAbility = races.map((race) => getSpeciesSpellAbility(race, draft.selections, draft)).find((ability): ability is AbilityKey => Boolean(ability))
  return races.flatMap((race) => collectSpeciesSpellGrants(race, draft.targetLevel, draft).flatMap((grant) => {
    const ability = grant.ability ?? getSpeciesSpellAbility(race, draft.selections, draft) ?? inheritedAbility
    return grant.spellId === spellId && ability ? [{ ...grant, sourceId: race.id, sourceName: race.name, ability, note: speciesCastingNote(grant) }] : []
  }))
}

/** 同名职业/手动法术不继承种族的目标限制或成分豁免。 */
export function canCastSpellWithSlots(draft: CharacterDraft, spellId: string): boolean {
  const methods = getSpeciesCastingMethods(draft, spellId)
  return methods.some((method) => method.canCastWithSpellSlots !== false) || canCastSpellWithNonSpeciesSlots(draft, spellId)
}

export function canCastSpellWithNonSpeciesSlots(draft: CharacterDraft, spellId: string): boolean {
  const withoutSpecies = { ...draft, raceId: undefined, subraceId: undefined }
  return getEffectiveSelectedSpellIds(withoutSpecies).includes(spellId)
}

/** 检查点或专长子选择声明的始终准备法术（法术精通、招牌法术、专长授予等）。 */
function selectionAlwaysPreparedSpellIds(draft: CharacterDraft, repository: RulesRepository): readonly string[] {
  const ids: string[] = []
  const subclass = draft.subclassId ? repository.getSubclass(draft.subclassId) : undefined
  for (const selection of draft.selections) {
    if (selection.invalidatedAt || !isSelectionCheckpointActive(draft, selection.checkpointId)) continue
    if (selection.checkpointId.startsWith('feat-child:')) {
      const [, parentCheckpointId, featId, choiceId] = selection.checkpointId.split(':')
      if (!parentCheckpointId || !featId || !isFeatGrantParentActive(draft, parentCheckpointId, featId)) continue
      if (!isSelectionCheckpointActive(draft, parentCheckpointId)) continue
      const choice = featId ? repository.getFeat(featId)?.choices?.find((item) => item.id === choiceId) : undefined
      if (choice?.spellGrant?.alwaysPrepared) ids.push(...selection.optionIds)
      continue
    }
    const checkpoint = findClassCheckpoint(repository, selection.checkpointId)
    if (checkpoint?.spellGrant?.alwaysPrepared) {
      ids.push(...selection.optionIds)
      continue
    }
    // 子职特性检查点（如 2024 逸闻学院·魔法探秘的始终准备法术）。
    if (subclass && selection.checkpointId.startsWith('subclass-feature-')) {
      const featureId = selection.checkpointId.slice('subclass-feature-'.length)
      const feature = subclass.features.find((item) => item.id === featureId)
      if (feature?.spellGrant?.alwaysPrepared) ids.push(...selection.optionIds)
    }
  }
  return ids
}

export function getAlwaysPreparedSpellIds(draft: CharacterDraft): readonly string[] {
  const repository = getRulesRepository(draft.ruleset)
  const ids = new Set<string>()
  const subclass = draft.subclassId ? repository.getSubclass(draft.subclassId) : undefined
  if (subclass && isSourceEnabled(subclass.sourceIds, draft.enabledSourceIds, repository)) {
    for (const [level, spellIds] of Object.entries(subclass.alwaysPreparedSpellIdsByLevel ?? {})) {
      if (Number(level) > draft.targetLevel) continue
      for (const id of spellIds) ids.add(id)
    }
  }
  const classRule = draft.classId ? repository.getClass(draft.classId) : undefined
  if (classRule && isSourceEnabled(classRule.sourceIds, draft.enabledSourceIds, repository)) {
    for (const [level, spellIds] of Object.entries(classRule.spellcasting?.alwaysPreparedSpellIdsByLevel ?? {})) {
      if (Number(level) > draft.targetLevel) continue
      for (const id of spellIds) ids.add(id)
    }
  }
  // 选择类选项授予的始终准备法术（如 2024 德鲁伊大地结社的地形法术）。
  for (const selection of draft.selections) {
    if (selection.invalidatedAt) continue
    for (const optionId of selection.optionIds) {
      const option = repository.getOption(optionId)
      for (const [level, spellIds] of Object.entries(option?.alwaysPreparedSpellIdsByLevel ?? {})) {
        if (Number(level) > draft.targetLevel) continue
        for (const id of spellIds) ids.add(id)
      }
    }
  }
  // 专长固定授予（如迷踪步、隐形术、侦测思想；龙纹 3 级追加授予按等级生效）。
  for (const feat of listActiveFeats(draft, repository)) {
    for (const grant of feat.grantedSpells ?? []) {
      if ((grant.minimumLevel ?? 0) > draft.targetLevel) continue
      if (grant.alwaysPrepared !== false) ids.add(grant.spellId)
    }
  }
  // 物种授予（血统法术等，按获得等级生效）。
  for (const race of getDraftSpeciesRules(draft, repository)) {
    for (const grant of collectSpeciesSpellGrants(race, draft.targetLevel, draft)) {
      if (grant.alwaysPrepared !== false) ids.add(grant.spellId)
    }
  }
  for (const id of selectionAlwaysPreparedSpellIds(draft, repository)) {
    const spell = repository.getSpell(id)
    if (spell && isSourceEnabled(spell.sourceIds, draft.enabledSourceIds, repository)) ids.add(id)
  }
  return [...ids]
}

/** 免费施法资源（每休息次数）：来自专长／物种／职业与子职特性／选项声明；跑团结算见 `session-resources`。 */
export interface FreeCastingGrant {
  readonly castingLevel?: number
  readonly spellId: string
  /** 稳定来源标识（特性 id、专长／检查点组合键、物种 id 或选项 id）。 */
  readonly sourceId: string
  /** 来源展示名（用于跑团资源列表），如“宿敌”“妖精漫游者”“森林侏儒”。 */
  readonly sourceName: string
  readonly count: number
  readonly recovery: 'long-rest' | 'short-rest'
  readonly ability?: AbilityKey
}

export function getSpellFreeCastings(
  draft: CharacterDraft,
  repository: RulesRepository = getRulesRepository(draft.ruleset),
): readonly FreeCastingGrant[] {
  const grants: FreeCastingGrant[] = []
  const seen = new Set<string>()
  const modifiers = deriveCharacter(draft).modifiers
  /** 免费次数：熟练加值、属性调整值（至少 minimum）或固定值。 */
  const countOf = (grant: FixedSpellGrant): number => {
    if (grant.freeCastingsFrom === 'proficiency-bonus') return proficiencyBonus(draft.targetLevel)
    if (grant.freeCastingsFrom) {
      return Math.max(grant.freeCastingsFrom.minimum, modifiers[grant.freeCastingsFrom.ability] ?? 0)
    }
    return grant.freeCastings ?? 0
  }
  const push = (
    spellId: string,
    sourceId: string,
    sourceName: string,
    count: number,
    recovery: 'long-rest' | 'short-rest',
    ability?: AbilityKey,
    castingLevel?: number,
  ): void => {
    const key = `${sourceId}:${spellId}`
    if (seen.has(key) || count <= 0) return
    if (!repository.getSpell(spellId)) return
    seen.add(key)
    grants.push({ spellId, sourceId, sourceName, count, recovery, ability, ...(castingLevel === undefined ? {} : { castingLevel }) })
  }
  // 专长固定授予
  for (const featGrant of listFeatGrants(draft, repository)) {
    const feat = repository.getFeat(featGrant.featId)
    for (const granted of feat?.grantedSpells ?? []) {
      if ((granted.minimumLevel ?? 0) > draft.targetLevel) continue
      push(
        granted.spellId,
        `${featGrant.sourceId}:${featGrant.featId}`,
        feat?.name ?? featGrant.featId,
        countOf(granted),
        granted.recovery ?? 'long-rest',
        granted.ability ?? getFeatChosenAbility(draft, featGrant.checkpointId, featGrant.featId),
      )
    }
  }
  // 专长子选择授予（所选法术）
  for (const selection of draft.selections) {
    if (selection.invalidatedAt || !selection.checkpointId.startsWith('feat-child:') || !isSelectionCheckpointActive(draft, selection.checkpointId)) continue
    const [, parentCheckpointId, featId, choiceId] = selection.checkpointId.split(':')
    // 孤立选择（换背景／物种后残留的旧起源专长检查点）不再授予免费施法。
    if (parentCheckpointId && !isSelectionCheckpointActive(draft, parentCheckpointId)) continue
    if (!parentCheckpointId || !featId || !isFeatGrantParentActive(draft, parentCheckpointId, featId)) continue
    const feat = featId ? repository.getFeat(featId) : undefined
    const choice = feat?.choices?.find((item) => item.id === choiceId)
    const grant = choice?.spellGrant
    if (!grant?.freeCastings || grant.freeCastings <= 0) continue
    const ability = grant.ability ?? (featId ? getFeatChosenAbility(draft, parentCheckpointId, featId) : undefined)
    for (const spellId of selection.optionIds) {
      push(spellId, selection.checkpointId, feat?.name ?? choiceId ?? '', grant.freeCastings, grant.recovery ?? 'long-rest', ability)
    }
  }
  // 检查点授予（法术精通、招牌法术、玄奥秘法等）
  for (const selection of draft.selections) {
    if (selection.invalidatedAt || selection.checkpointId.startsWith('feat-child:')) continue
    const checkpoint = findClassCheckpoint(repository, selection.checkpointId)
    const grant = checkpoint?.spellGrant
    if (!grant?.freeCastings || grant.freeCastings <= 0) continue
    for (const spellId of selection.optionIds) {
      push(spellId, selection.checkpointId, checkpoint?.title ?? selection.checkpointId, grant.freeCastings, grant.recovery ?? 'long-rest', grant.ability)
    }
  }
  // 职业特性固定授予
  const classRule = draft.classId ? repository.getClass(draft.classId) : undefined
  for (const feature of classRule?.features ?? []) {
    if (feature.level > draft.targetLevel) continue
    for (const granted of feature.grantedSpells ?? []) {
      push(granted.spellId, feature.id, feature.name, countOf(granted), granted.recovery ?? 'long-rest', granted.ability)
    }
  }
  // 子职特性固定授予
  const subclass = draft.subclassId ? repository.getSubclass(draft.subclassId) : undefined
  for (const feature of subclass?.features ?? []) {
    if (feature.level > draft.targetLevel) continue
    for (const granted of feature.grantedSpells ?? []) {
      push(granted.spellId, feature.id, feature.name, countOf(granted), granted.recovery ?? 'long-rest', granted.ability)
    }
  }
  // 已选选项（魔能祈唤等）固定授予
  for (const selection of draft.selections) {
    if (selection.invalidatedAt) continue
    for (const optionId of selection.optionIds) {
      const option = repository.getOption(optionId)
      for (const granted of option?.grantedSpells ?? []) {
        push(granted.spellId, optionId, option?.name ?? optionId, countOf(granted), granted.recovery ?? 'long-rest', granted.ability)
      }
    }
  }
  // 物种授予（血统法术的免费次数）；施法属性从物种链上的属性选择解析。
  const speciesRules = getDraftSpeciesRules(draft, repository)
  const speciesAbility = speciesRules
    .map((race) => getSpeciesSpellAbility(race, draft.selections, draft))
    .find((ability): ability is AbilityKey => Boolean(ability))
  for (const race of speciesRules) {
    for (const grant of collectSpeciesSpellGrants(race, draft.targetLevel, draft)) {
      push(grant.spellId, race.id, race.name, countOf(grant), grant.recovery ?? 'long-rest', grant.ability ?? getSpeciesSpellAbility(race, draft.selections, draft) ?? speciesAbility, grant.castingLevel)
    }
  }
  return grants
}

/**
 * 单个施法职业的法术选择是否合法（MC-D03）。
 *
 * 数量与环级上限一律按**该职业自己的等级**（`scope.classLevel`）取值：
 * `游侠4/术士3` 的游侠侧最高 1 环，因此准备 2 环游侠法术会被判为非法。
 */
export function validateSpellSelectionScope(draft: CharacterDraft, scope: SpellcastingScope): boolean {
  const config = scope.config
  if (scope.classLevel < config.startsAtLevel) return true
  const selections = scope.selections
  const selected = getSelectedSpellIds(draft, config, scope)
  const availableSpells = getAvailableSpells(draft, config, scope)
  const availableIds = new Set(availableSpells.filter((spell) => spell.level > 0).map((spell) => spell.id))
  const cantripIds = new Set(availableSpells.filter((spell) => spell.level === 0).map((spell) => spell.id))
  const requiredCantrips = getRequiredCantripCount(draft, config, scope)
  const cantripsValid = requiredCantrips === 0
    || (selections.cantripIds.length === requiredCantrips
      && selections.cantripIds.length === new Set(selections.cantripIds).size
      && selections.cantripIds.every((id) => cantripIds.has(id)))
  // 法术书校验：抄录所得与子职额外入书的法术不计入升级名额，
  // 升级名额（非抄录、非额外）至少达到 requiredSpellbookCount（抄录与额外可超出总数）。
  // 抄录与额外入书记录是法术书内部的共享标记，仍从顶层读取。
  const spellbookSpells = selections.spellbookSpellIds
  const transcribed = draft.spellSelections.transcribedSpellIds
  const extras = draft.spellSelections.spellbookExtraSpellIds ?? []
  const storedReservations = draft.spellSelections.spellbookReservedSpellIds ?? []
  const selectedReservations = getSelectedSpellbookReservationIds(draft)
  const reservationsValid = config.mode !== 'spellbook'
    || (storedReservations.length === new Set(storedReservations).size
      && storedReservations.every((id) => spellbookSpells.includes(id) && selectedReservations.includes(id))
      && selectedReservations.every((id) => spellbookSpells.includes(id) && availableIds.has(id)))
  const extraAllowance = getSpellbookExtraAllowance(draft, config, scope)
  const normalBookCount = spellbookSpells.filter((id) => !transcribed.includes(id)
    && (!extras.includes(id) || selectedReservations.includes(id))).length
  const extraCandidates = new Set(getSpellbookExtraCandidates(draft, config, scope).map((spell) => spell.id))
  const extrasValid = config.mode !== 'spellbook'
    || (extras.length <= extraAllowance
      && extras.length === new Set(extras).size
      && extras.every((id) => spellbookSpells.includes(id) && extraCandidates.has(id) && !transcribed.includes(id)))
  const spellbookValid = config.mode !== 'spellbook'
    || (normalBookCount >= getRequiredSpellbookCount(draft, config, scope)
      && spellbookSpells.length === new Set(spellbookSpells).size
      && spellbookSpells.every((id) => availableIds.has(id))
      && selected.every((id) => spellbookSpells.includes(id)))
  return cantripsValid
    && spellbookValid
    && extrasValid
    && reservationsValid
    && selected.length === getRequiredSpellCount(draft, config, scope)
    && selected.length === new Set(selected).size
    && selected.every((id) => availableIds.has(id))
}

/**
 * 法术选择整体校验（MC-D03）：**逐施法职业**校验。
 * 单职业草稿只有一个作用域，结论与改造前一致。
 */
export function validateSpellSelections(draft: CharacterDraft): boolean {
  const scopes = listSpellcastingScopes(draft)
  if (scopes.length === 0) return true
  return scopes.every((scope) => validateSpellSelectionScope(draft, scope))
}

/** 逐职业校验报告：供校验页给出「哪个职业的哪一项不合法」的中文原因。 */
export function getSpellSelectionValidationReport(draft: CharacterDraft): readonly { readonly classId: string; readonly className: string; readonly valid: boolean }[] {
  return listSpellcastingScopes(draft).map((scope) => ({
    classId: scope.classId,
    className: scope.className,
    valid: validateSpellSelectionScope(draft, scope),
  }))
}
