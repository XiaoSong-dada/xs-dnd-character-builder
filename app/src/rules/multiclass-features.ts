import { getRulesRepository } from '@/rules/repositories'
import { isSourceEnabled } from '@/rules/source-books'
import { getClassEntries, getClassSubclassId } from '@/rules/multiclass'
import type { CharacterDraft } from '@/types/character'
import type { ClassFeature, RulesRepository, SubclassFeature } from '@/types/rules'

/**
 * 兼职特性互斥、去重与资源合并（MC-C02）。
 *
 * 规则依据（需求 §2.7 与 R5）：
 * - **额外攻击不叠加**：多个职业提供额外攻击时仍只能攻击两次，
 *   除非特性自身写明可以更多（战士「额外攻击（二）／（三）」→ 3／4 次）；
 *   魔契师祈唤「饥渴魔刃」不会在有额外攻击时再增加次数。
 * - **AC 计算方式同时只能使用一种**：无甲防御、龙族体魄、炫目舞步等并存时取其一。
 * - **引导神力共享使用次数池**：次数由等级最高的那条特性决定，使用方式取并集。
 *   次数合并的落地在 `rules/session-resources.ts`（`listSessionResources`）：那里同时持有
 *   各职业的当前等级与属性调整值，能按各来源自己的等级取上限后再合并（MC-E05）。
 * - 同名特性不重复授予；特性资源按角色汇总（`listSessionResources` 的既有语义）。
 */

type CharacterFeature = ClassFeature | SubclassFeature

/** 角色当前有效的全部职业与子职特性（按各职业等级过滤）。 */
export function listCharacterFeatures(
  draft: Pick<CharacterDraft, 'ruleset' | 'enabledSourceIds'> & Parameters<typeof getClassEntries>[0],
  repository: RulesRepository = getRulesRepository(draft.ruleset),
): readonly CharacterFeature[] {
  const features: CharacterFeature[] = []
  for (const entry of getClassEntries(draft)) {
    const classRule = repository.getClass(entry.classId)
    if (!classRule || !isSourceEnabled(classRule.sourceIds, draft.enabledSourceIds, repository)) continue
    features.push(...(classRule.features ?? []).filter((feature) => feature.level <= entry.level))
    const subclassId = getClassSubclassId(draft, entry.classId)
    const subclass = subclassId ? repository.getSubclass(subclassId) : undefined
    if (!subclass || subclass.classId !== entry.classId) continue
    if (!isSourceEnabled(subclass.sourceIds, draft.enabledSourceIds, repository)) continue
    features.push(...subclass.features.filter((feature) => feature.level <= entry.level))
  }
  return features
}

/** 攻击次数：取所有来源的最大值（额外攻击不叠加），无来源时为 1。 */
export interface ExtraAttackResolution {
  /** 每次攻击动作可发动的攻击次数（无额外攻击时为 1）。 */
  readonly attacks: number
  /** 提供该次数的特性名（用于来源说明）。 */
  readonly sourceNames: readonly string[]
  /** 是否由多个职业共同提供（用于提示「不叠加」）。 */
  readonly multipleSources: boolean
}

/** 从特性摘要里解析攻击次数：形如「攻击动作可进行两次攻击。」→ 2。 */
function attackCountFromSummary(summary: string): number {
  const numerals: Readonly<Record<string, number>> = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5 }
  const match = /可进行([一二两三四五])次攻击/.exec(summary)
  if (match) return numerals[match[1] as string] ?? 1
  const digits = /攻击动作可进行(\d+)次攻击/.exec(summary)
  if (digits) return Number(digits[1])
  return 2
}

function isExtraAttackFeature(feature: CharacterFeature): boolean {
  return feature.englishName === 'Extra Attack'
    || feature.englishName === 'Two Extra Attacks'
    || feature.englishName === 'Three Extra Attacks'
}

/**
 * 解析攻击次数。魔契师的「饥渴魔刃」祈唤按规则也不会在有额外攻击时再增加次数，
 * 因此不参与此处计算（其单独效果由祈唤自身的展示说明承担）。
 */
export function resolveExtraAttack(
  draft: Pick<CharacterDraft, 'ruleset' | 'enabledSourceIds'> & Parameters<typeof getClassEntries>[0],
  repository: RulesRepository = getRulesRepository(draft.ruleset),
): ExtraAttackResolution {
  const sources = listCharacterFeatures(draft, repository).filter(isExtraAttackFeature)
  if (sources.length === 0) return { attacks: 1, sourceNames: [], multipleSources: false }
  const attacks = sources.reduce((max, feature) => Math.max(max, attackCountFromSummary(feature.summary)), 1)
  const best = sources.filter((feature) => attackCountFromSummary(feature.summary) === attacks)
  const classIds = new Set(sources.map((feature) => 'classId' in feature ? feature.classId : feature.subclassId))
  return {
    attacks,
    sourceNames: best.map((feature) => feature.name),
    multipleSources: classIds.size > 1,
  }
}

/** AC 计算方式来源。 */
export interface AcFormulaOption {
  readonly id: string
  readonly label: string
  /** 基础值（未着甲时替代 10）。 */
  readonly base: number
  /** 叠加的属性调整值。 */
  readonly abilities: readonly ('str' | 'dex' | 'con' | 'int' | 'wis' | 'cha')[]
  /** 持盾时是否仍受益。 */
  readonly allowsShield: boolean
  readonly sourceName: string
  readonly classId?: string
  readonly subclassId?: string
}

/**
 * 收集角色当前可用的 AC 计算方式。
 * 规则要求同一时间只用一种；本项目按「取最高」自动择一，并在存在多个来源时给出提示文案。
 */
export function resolveArmorClassFormula(
  draft: Pick<CharacterDraft, 'ruleset' | 'enabledSourceIds' | 'classId' | 'subclassId'> & Parameters<typeof getClassEntries>[0],
  repository: RulesRepository = getRulesRepository(draft.ruleset),
): readonly AcFormulaOption[] {
  const options: AcFormulaOption[] = []
  for (const entry of getClassEntries(draft)) {
    const classRule = repository.getClass(entry.classId)
    if (!classRule || !isSourceEnabled(classRule.sourceIds, draft.enabledSourceIds, repository)) continue
    if (classRule.unarmoredDefense) {
      options.push({
        id: `${classRule.id}-unarmored-defense`,
        label: `${classRule.name}无甲防御`,
        base: 10,
        abilities: ['dex', classRule.unarmoredDefense.ability],
        allowsShield: classRule.unarmoredDefense.allowsShield,
        sourceName: classRule.name,
        classId: classRule.id,
      })
    }
    const subclassId = getClassSubclassId(draft, entry.classId)
    const subclass = subclassId ? repository.getSubclass(subclassId) : undefined
    if (!subclass || subclass.classId !== entry.classId) continue
    if (!isSourceEnabled(subclass.sourceIds, draft.enabledSourceIds, repository)) continue
    if (subclass.unarmoredDefense) {
      options.push({
        id: `${subclass.id}-unarmored-defense`,
        label: `${subclass.name}无甲防御`,
        base: 10,
        abilities: ['dex', subclass.unarmoredDefense.ability],
        allowsShield: subclass.unarmoredDefense.allowsShield,
        sourceName: subclass.name,
        classId: subclass.classId,
        subclassId: subclass.id,
      })
    }
  }
  return options
}

