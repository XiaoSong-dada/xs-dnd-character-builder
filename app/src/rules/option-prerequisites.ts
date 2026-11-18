import { getClassLevel } from '@/rules/multiclass'
import { getAvailableSpells, getRequiredCantripCount, getSpellcastingScope } from '@/rules/spellcasting'
import type { CharacterDraft } from '@/types/character'
import type { RuleOption, RulesRepository } from '@/types/rules'

/**
 * 选项先决条件（`RuleOption`）的统一判定。
 *
 * 只处理选项自身登记的字段：
 * - `minimumLevel`：**所属职业等级**先决（如 2014 魔能祈唤「星移步法」需邪术师 9 级），
 *   兼职时必须按该职业自身等级判定，不能读取角色总等级；
 * - `requiredOptionIds`：依赖的已选选项（如魔能斩需先选刃之魔契）；
 * - `requiredSpellIds`：依赖的已习得法术（如苦痛魔爆需先习得魔能爆）。
 *
 * 候选卡禁用与 `validate` 最终校验共用本模块，避免两处各写一套判定而分叉。
 * 本模块保持框架无关：不依赖 Vue、Pinia、Router、DOM、存储或网络。
 */

export type OptionPrerequisiteFailureKind = 'class-level' | 'required-option' | 'required-spell'

export interface OptionPrerequisiteFailure {
  readonly kind: OptionPrerequisiteFailureKind
  /** 面向玩家的中文原因；候选卡直接展示，最终校验在句首补选项名。 */
  readonly message: string
  /** 面向玩家的修正建议；最终校验用于 resolution。 */
  readonly resolution: string
}

export interface OptionPrerequisiteContext {
  readonly draft: CharacterDraft
  readonly repository: RulesRepository
  /** 选项所属职业；省略时按「哪个职业的检查点登记了该选项」反查。 */
  readonly classId?: string
}

/** 有效选择中的选项 ID：与最终校验口径一致，忽略已失效记录。 */
function getActiveOptionIds(draft: CharacterDraft): ReadonlySet<string> {
  return new Set(
    draft.selections
      .filter((item) => !item.invalidatedAt)
      .flatMap((item) => item.optionIds),
  )
}

/** 已习得法术 ID：顶层数组与按职业分桶取并集，避免兼职草稿漏读。 */
function getKnownSpellIds(draft: CharacterDraft): ReadonlySet<string> {
  const classBuckets = draft.spellSelections.classSpellSelections ?? []
  return new Set([
    ...draft.spellSelections.cantripIds,
    ...draft.spellSelections.knownSpellIds,
    ...draft.spellSelections.preparedSpellIds,
    ...draft.spellSelections.spellbookSpellIds,
    ...draft.spellSelections.transcribedSpellIds,
    ...classBuckets.flatMap((bucket) => [
      ...bucket.cantripIds,
      ...bucket.knownSpellIds,
      ...bucket.preparedSpellIds,
      ...bucket.spellbookSpellIds,
    ]),
  ])
}

/** 反查选项所属职业：选项登记在哪个职业的检查点候选里。 */
function findOwningClassId(repository: RulesRepository, optionId: string): string | undefined {
  return repository.classes
    .find((classRule) => classRule.checkpoints.some((checkpoint) => checkpoint.optionIds.includes(optionId)))
    ?.id
}

/**
 * 判定一个选项在当前草稿下是否满足全部已登记的先决条件。
 *
 * 返回空数组表示满足；否则按等级、依赖选项、依赖法术的顺序返回失败项。
 * 未登记任何先决字段的选项直接返回空数组。
 */
export function getOptionPrerequisiteFailures(
  option: RuleOption,
  context: OptionPrerequisiteContext,
): readonly OptionPrerequisiteFailure[] {
  const { draft, repository } = context
  const classId = context.classId ?? findOwningClassId(repository, option.id)
  const className = classId ? repository.getClass(classId)?.name : undefined
  const failures: OptionPrerequisiteFailure[] = []

  if (option.minimumLevel !== undefined && classId) {
    const classLevel = getClassLevel(draft, classId)
    if (classLevel <= 0) {
      failures.push({
        kind: 'class-level',
        message: `需要${className ?? '职业'} ${option.minimumLevel} 级（当前未选择该职业）`,
        resolution: className
          ? `把${className}加入职业分配并提高到 ${option.minimumLevel} 级，或移除该选择。`
          : `把所属职业提高到 ${option.minimumLevel} 级，或移除该选择。`,
      })
    } else if (classLevel < option.minimumLevel) {
      failures.push({
        kind: 'class-level',
        message: `需要${className ?? '职业'} ${option.minimumLevel} 级（当前 ${classLevel} 级）`,
        resolution: className
          ? `把${className}等级提高到 ${option.minimumLevel} 级，或移除该选择。`
          : `把所属职业等级提高到 ${option.minimumLevel} 级，或移除该选择。`,
      })
    }
  }

  if (option.requiredOptionIds?.length) {
    const activeOptionIds = getActiveOptionIds(draft)
    const missing = option.requiredOptionIds.filter((id) => !activeOptionIds.has(id))
    if (missing.length > 0) {
      const names = missing.map((id) => repository.getOption(id)?.name ?? id).join('、')
      failures.push({
        kind: 'required-option',
        message: `需要先选择${names}`,
        resolution: `先选择${names}，或移除该选择。`,
      })
    }
  }

  if (option.requiredSpellIds?.length) {
    const knownSpellIds = getKnownSpellIds(draft)
    const missing = option.requiredSpellIds.filter((id) => !knownSpellIds.has(id))
    if (missing.length > 0) {
      const names = missing.map((id) => repository.getSpell(id)?.name ?? id).join('、')
      failures.push({
        kind: 'required-spell',
        message: `需要先习得${names}`,
        resolution: `先在法术步骤习得${names}，或移除该选择。`,
      })
    }
  }

  return failures
}

/**
 * 缺失法术先决的补选方案：把「点击祈唤后能否顺手选上必需法术」的判断集中在这里。
 *
 * 只自动补**尚未习得、属于该职业候选池、且职业戏法名额仍有余量**的戏法；
 * 有环法术、不可选法术或名额不足都返回 `blockedSpellIds`，由调用方引导玩家前往法术步骤。
 * 这样候选卡提示与写入逻辑共用同一份容量计算，不会出现「提示可自动补选、实际写不进去」。
 */
export interface RequiredSpellAutoAddPlan {
  readonly classId?: string
  readonly missingSpellIds: readonly string[]
  readonly autoAddSpellIds: readonly string[]
  readonly blockedSpellIds: readonly string[]
}

export function getRequiredSpellAutoAddPlan(
  option: RuleOption,
  context: OptionPrerequisiteContext,
): RequiredSpellAutoAddPlan {
  const { draft, repository } = context
  const knownSpellIds = getKnownSpellIds(draft)
  const missingSpellIds = (option.requiredSpellIds ?? []).filter((id) => !knownSpellIds.has(id))
  if (missingSpellIds.length === 0) {
    return { missingSpellIds: [], autoAddSpellIds: [], blockedSpellIds: [] }
  }

  const classId = context.classId ?? findOwningClassId(repository, option.id)
  const scope = classId ? getSpellcastingScope(draft, classId) : undefined
  if (!scope) {
    return { classId, missingSpellIds, autoAddSpellIds: [], blockedSpellIds: missingSpellIds }
  }

  const availableCantripIds = new Set(
    getAvailableSpells(draft, scope.config, scope)
      .filter((spell) => spell.level === 0)
      .map((spell) => spell.id),
  )
  let remainingCantripSlots = Math.max(
    0,
    getRequiredCantripCount(draft, scope.config, scope) - scope.selections.cantripIds.length,
  )
  const autoAddSpellIds: string[] = []
  const blockedSpellIds: string[] = []
  for (const spellId of missingSpellIds) {
    const spell = repository.getSpell(spellId)
    if (!spell || spell.level !== 0 || !availableCantripIds.has(spellId) || remainingCantripSlots <= 0) {
      blockedSpellIds.push(spellId)
      continue
    }
    autoAddSpellIds.push(spellId)
    remainingCantripSlots -= 1
  }
  return { classId, missingSpellIds, autoAddSpellIds, blockedSpellIds }
}
