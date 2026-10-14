import { getMulticlassClassRule2014 } from '@/rules/data/multiclass-2014'
import { getRulesRepository } from '@/rules/repositories'
import { isSourceEnabled } from '@/rules/source-books'
import { ABILITY_LABELS } from '@/rules/data/ability-labels'
import { getClassEntries } from '@/rules/multiclass'
import type { AbilityKey, AbilityScores, CharacterDraft } from '@/types/character'
import type { RulesetId } from '@/types/character'
import type { MulticlassPrerequisite } from '@/types/rules'

/**
 * 兼职先决条件（MC-B01）。
 *
 * 规则依据（需求 §2.2）：
 * - 获得一个新职业前，必须**同时**满足现有职业与新职业的属性要求；「或／及」语义由 `anyOf` 表达：
 *   外层任一组成立即满足，组内属性需全部满足。
 * - 只有**基础属性**可以满足先决，临时加值不算数（官方 2025 裁定）→ 一律读 `draft.baseAbilities`。
 * - 未登记先决的职业（UA／第三方）不得推断：返回 `pending`，界面给提示级问题且不阻断（决策 D8）。
 */

export type MulticlassPrerequisiteStatus = 'met' | 'unmet' | 'pending'

export interface MulticlassPrerequisiteRequirement {
  readonly ability: AbilityKey
  readonly minimum: number
  readonly score: number
  readonly met: boolean
}

export interface MulticlassPrerequisiteResult {
  readonly classId: string
  readonly className: string
  readonly status: MulticlassPrerequisiteStatus
  readonly requirements: readonly MulticlassPrerequisiteRequirement[]
  /** 可供玩家理解的中文原因；`met` 时为空数组。 */
  readonly reasons: readonly string[]
}

export interface MulticlassPrerequisiteReport {
  readonly results: readonly MulticlassPrerequisiteResult[]
  readonly unmetClassIds: readonly string[]
  readonly pendingClassIds: readonly string[]
  /** 是否所有已登记先决的职业都满足（未登记先决不计入失败）。 */
  readonly satisfied: boolean
}

/** 兼职先决的最小属性值（2014 与 2024 同口径）。 */
export const MULTICLASS_ABILITY_MINIMUM = 13

/** 2024 各职业的兼职先决（`anyOf` 组表达「或／及」，与 2014 表逐条一致）。 */
export const multiclassPrerequisites2024: Readonly<Record<string, MulticlassPrerequisite>> = {
  'class-2024-barbarian': { anyOf: [['str']] },
  'class-2024-bard': { anyOf: [['cha']] },
  'class-2024-cleric': { anyOf: [['wis']] },
  'class-2024-druid': { anyOf: [['wis']] },
  'class-2024-fighter': { anyOf: [['str'], ['dex']] },
  'class-2024-monk': { anyOf: [['dex', 'wis']] },
  'class-2024-paladin': { anyOf: [['str', 'cha']] },
  'class-2024-ranger': { anyOf: [['dex', 'wis']] },
  'class-2024-rogue': { anyOf: [['dex']] },
  'class-2024-sorcerer': { anyOf: [['cha']] },
  'class-2024-warlock': { anyOf: [['cha']] },
  'class-2024-wizard': { anyOf: [['int']] },
  // UA 奇械师（2024 版式）：至少 13 点智力
  'class-2024-ua-artificer': { anyOf: [['int']] },
  // UA 灵能使：智力施法，先决取智力
  'class-2024-ua-psion': { anyOf: [['int']] },
}

/** 取某职业的兼职先决；未登记时返回 undefined（调用方按 `pending` 处理，不推断）。 */
export function getMulticlassPrerequisite(ruleset: RulesetId, classId: string): MulticlassPrerequisite | undefined {
  if (ruleset === '5e-2014') return getMulticlassClassRule2014(classId)?.prerequisite
  return multiclassPrerequisites2024[classId]
}

/** 单职业先决判定：逐个属性列出当前值与是否达标，并给出中文原因。 */
export function checkMulticlassPrerequisite(
  ruleset: RulesetId,
  classId: string,
  className: string,
  baseAbilities: AbilityScores,
): MulticlassPrerequisiteResult {
  const prerequisite = getMulticlassPrerequisite(ruleset, classId)
  if (!prerequisite) {
    return {
      classId,
      className,
      status: 'pending',
      requirements: [],
      reasons: [`「${className}」的先决条件待核验：尚未登记其属性要求，请与 DM 确认后手动判定（不阻断）。`],
    }
  }
  const requirements: MulticlassPrerequisiteRequirement[] = prerequisite.anyOf
    .flatMap((group) => group.map((ability) => ({
      ability,
      minimum: MULTICLASS_ABILITY_MINIMUM,
      score: baseAbilities[ability],
      met: baseAbilities[ability] >= MULTICLASS_ABILITY_MINIMUM,
    })))
    .filter((item, index, all) => all.findIndex((candidate) => candidate.ability === item.ability) === index)
  // 「或」组：任一组全部满足即通过
  const satisfied = prerequisite.anyOf.some((group) => group.every((ability) => baseAbilities[ability] >= MULTICLASS_ABILITY_MINIMUM))
  const reasons = satisfied ? [] : [describeFailure(className, prerequisite, baseAbilities, requirements)]
  return { classId, className, status: satisfied ? 'met' : 'unmet', requirements, reasons }
}

function describeFailure(
  className: string,
  prerequisite: MulticlassPrerequisite,
  baseAbilities: AbilityScores,
  requirements: readonly MulticlassPrerequisiteRequirement[],
): string {
  const groupText = prerequisite.anyOf
    .map((group) => group.map((ability) => `${ABILITY_LABELS[ability]}${MULTICLASS_ABILITY_MINIMUM}`).join('及'))
    .join(' 或 ')
  const actual = prerequisite.anyOf
    .flatMap((group) => group.map((ability) => `${ABILITY_LABELS[ability]} ${baseAbilities[ability]}`))
    .filter((text, index, all) => all.indexOf(text) === index)
    .join('、')
  const hint = requirements.filter((item) => !item.met)
    .map((item) => `${ABILITY_LABELS[item.ability]}需提高到 ${MULTICLASS_ABILITY_MINIMUM}`)
    .join('、')
  return `兼职${className}需要 ${groupText}（当前 ${actual}）：${hint}。`
}

/**
 * 全角色先决报告：**所有职业**都要满足（含起始职业）——已兼职的情况下提升任一职业等级，
 * 同样要求当前全部职业的先决都成立（2014:`:18`，2024:`:9`）。
 */
export function getMulticlassPrerequisiteReport(
  draft: Pick<CharacterDraft, 'ruleset' | 'baseAbilities' | 'enabledSourceIds'> & Parameters<typeof getClassEntries>[0],
): MulticlassPrerequisiteReport {
  const repository = getRulesRepository(draft.ruleset)
  const results = getClassEntries(draft).map((entry) => {
    const classRule = repository.getClass(entry.classId)
    const sourceEnabled = !classRule || isSourceEnabled(classRule.sourceIds, draft.enabledSourceIds, repository)
    const className = classRule?.name ?? entry.classId
    if (!sourceEnabled) {
      return {
        classId: entry.classId,
        className,
        status: 'pending' as const,
        requirements: [],
        reasons: [`「${className}」的来源扩展书已关闭，先决条件暂不判定。`],
      }
    }
    return checkMulticlassPrerequisite(draft.ruleset, entry.classId, className, draft.baseAbilities)
  })
  const unmetClassIds = results.filter((item) => item.status === 'unmet').map((item) => item.classId)
  const pendingClassIds = results.filter((item) => item.status === 'pending').map((item) => item.classId)
  return { results, unmetClassIds, pendingClassIds, satisfied: unmetClassIds.length === 0 }
}
