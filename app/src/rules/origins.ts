import { ABILITY_LABELS } from '@/rules/data/ability-labels'
import { SKILL_IDS } from '@/rules/data/skill-ids'
import { getRequiredLanguageCount } from '@/rules/languages'
import { isSourceEnabled } from '@/rules/source-books'
import type { AbilityKey, AbilityScores, CharacterDraft } from '@/types/character'
import type { RaceRule, RulesRepository } from '@/types/rules'

export const ABILITY_KEYS_ORDER: readonly AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

/** 角色物种链规则（子种族起沿 parentRaceId 叠加，来源关闭时跳过）；2014 与 2024 通用。 */
export function getDraftSpeciesRules(draft: CharacterDraft, repository: RulesRepository): readonly RaceRule[] {
  const rules: RaceRule[] = []
  const visited = new Set<string>()
  const visit = (raceId: string | undefined): void => {
    if (!raceId || visited.has(raceId)) return
    visited.add(raceId)
    const race = repository.getRace(raceId)
    if (!race || !isSourceEnabled(race.sourceIds, draft.enabledSourceIds, repository)) return
    if (race.parentRaceId) visit(race.parentRaceId)
    rules.push(race)
  }
  visit(draft.subraceId ?? draft.raceId)
  return rules
}

/** 物种无条件派生：每级最大生命值加成（矮人坚韧等）。 */
export function getSpeciesHitPointBonus(draft: CharacterDraft, repository: RulesRepository): number {
  if (draft.ruleset !== '5e-2024') return 0
  return getDraftSpeciesRules(draft, repository)
    .reduce((sum, race) => sum + (race.hitPointBonusPerLevel ?? 0) * draft.targetLevel, 0)
}

/** 2024 背景属性分配收益（+2/+1 或各 +1）；非法或缺失时返回空。 */
export function getBackgroundAbilityBonuses(
  draft: CharacterDraft,
  repository: RulesRepository,
): Partial<AbilityScores> {
  if (draft.ruleset !== '5e-2024') return {}
  const allocation = draft.backgroundAbilityAllocation
  const background = draft.backgroundId ? repository.getBackground(draft.backgroundId) : undefined
  if (!allocation || !background || !isSourceEnabled(background.sourceIds, draft.enabledSourceIds, repository)) return {}
  const bonuses: Partial<Record<AbilityKey, number>> = {}
  for (const key of ABILITY_KEYS_ORDER) {
    const value = allocation[key]
    if (value) bonuses[key] = value
  }
  return bonuses
}

/**
 * 2024 背景属性分配是否合法：三候选内、且为“一项 +2 与另一项 +1”或“三项各 +1”。
 * 返回中文原因；合法时返回空字符串。
 */
export function getBackgroundAllocationIssue(
  draft: CharacterDraft,
  repository: RulesRepository,
): string {
  if (draft.ruleset !== '5e-2024') return ''
  const background = draft.backgroundId ? repository.getBackground(draft.backgroundId) : undefined
  if (!background?.abilityChoices?.length) return ''
  const allocation = draft.backgroundAbilityAllocation ?? {}
  const entries = ABILITY_KEYS_ORDER
    .map((key) => [key, allocation[key] ?? 0] as const)
    .filter(([, value]) => value > 0)
  if (entries.length === 0) return '背景属性加值尚未分配。'
  if (entries.some(([key]) => !background.abilityChoices?.includes(key))) {
    return '背景属性分配包含候选之外的属性。'
  }
  const values = entries.map(([, value]) => value).sort((left, right) => left - right)
  const validPattern = (values.length === 3 && values.every((value) => value === 1))
    || (values.length === 2 && values[0] === 1 && values[1] === 2)
  if (!validPattern) return '背景属性分配必须是“一项 +2 与另一项 +1”或“三项各 +1”。'
  const exceeded = entries.find(([key, value]) => draft.baseAbilities[key] + value > 20)
  if (exceeded) return `${ABILITY_LABELS[exceeded[0]]}加上背景加值后会超过 20。`
  return ''
}

/** 来源步骤阻塞项：id 与 `validateDraft` 的 issue id 对齐，message／resolution 供界面与校验共用。 */
export interface OriginStepBlocker {
  readonly id: string
  readonly message: string
  readonly resolution: string
}

/**
 * 物种自选熟练中的错误级问题（与 `validateRaceSkillChoices` 同源）：
 * 技能数量（吉斯洋基可选工具替代）、非法技能选项、吉斯洋基技能／工具互斥。
 * 工具未选保持提示级，不作为阻塞项。
 */
export function getSpeciesProficiencyBlockers(
  draft: CharacterDraft,
  repository: RulesRepository,
): readonly OriginStepBlocker[] {
  // 沿物种链（血统 → 父物种）取熟练规格：2024 血统把技能选择放在父物种上。
  const chain = getDraftSpeciesRules(draft, repository)
  const skillOwner = chain.find((item) => item.skillProficiencyChoices)
  if (!chain.length || !skillOwner?.skillProficiencyChoices) return []
  const displayName = chain[0]?.name ?? skillOwner.name
  const isGithyanki = chain.some((item) => item.id === 'race-2014-gith-githyanki')
  const chosen = draft.raceSkillChoices ?? []
  const toolChosen = Boolean(chain.some((item) => item.toolProficiencyChoices) && draft.raceToolChoice)
  const spec = skillOwner.skillProficiencyChoices
  const blockers: OriginStepBlocker[] = []
  if (!(isGithyanki && toolChosen) && chosen.length !== spec.count) {
    blockers.push({
      id: 'race-skill-choice-count',
      message: isGithyanki && chosen.length === 0
        ? `${displayName}需要选择一项技能或工具熟练。`
        : `${displayName}需要选择${spec.count}项技能熟练。`,
      resolution: `已选 ${chosen.length} 项，请在本步补选或移除。`,
    })
  }
  const allowed = spec.optionIds ?? SKILL_IDS
  for (const skillId of chosen) {
    if (!allowed.includes(skillId)) {
      blockers.push({
        id: `race-skill-choice-invalid-${skillId}`,
        message: `${displayName}的技能熟练选项“${skillId}”不在可选范围内。`,
        resolution: '请重新选择物种技能熟练。',
      })
    }
  }
  if (isGithyanki && toolChosen && chosen.length > 0) {
    blockers.push({
      id: 'githyanki-choice-exclusive',
      message: '吉斯洋基人的腐化精通只能选择一项技能或工具熟练。',
      resolution: '请只保留技能或工具其中一项。',
    })
  }
  return blockers
}

/**
 * 起源步骤阻塞项（单一来源，B09-07）：
 * 供步骤门禁、起源页提示、完成度与校验共用；仅纳入 `validateDraft` 中错误级的项，
 * 提示级（warning）项目不入闸。
 */
export function getOriginStepBlockers(
  draft: CharacterDraft,
  repository: RulesRepository,
): readonly OriginStepBlocker[] {
  const blockers: OriginStepBlocker[] = []
  if (!draft.raceId || !draft.backgroundId) {
    blockers.push({
      id: 'origin-required',
      message: '角色起源尚未完成。',
      resolution: draft.ruleset === '5e-2024' ? '选择物种与背景。' : '选择种族和背景。',
    })
  }
  const race = draft.raceId ? repository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? repository.getRace(draft.subraceId) : undefined
  if (race?.requiresSubrace && !subrace) {
    blockers.push({
      id: 'subrace-required',
      message: `${race.name}需要选择子种族。`,
      resolution: '在物种卡片下选择一个血统。',
    })
  }
  if (subrace && subrace.parentRaceId !== draft.raceId) {
    blockers.push({
      id: 'subrace-mismatch',
      message: '所选子种族不属于当前物种。',
      resolution: '重新选择当前物种的血统。',
    })
  }
  const requiredLanguages = getRequiredLanguageCount(draft, repository)
  if (
    requiredLanguages > 0
    && (draft.languages.length !== requiredLanguages || new Set(draft.languages).size !== draft.languages.length)
  ) {
    blockers.push({
      id: 'background-languages',
      message: draft.ruleset === '5e-2024' ? '语言选择尚未完成。' : '背景语言选择尚未完成。',
      resolution: `请选择${requiredLanguages}种不同的额外语言。`,
    })
  }
  const allocationIssue = getBackgroundAllocationIssue(draft, repository)
  if (allocationIssue) {
    blockers.push({
      id: 'background-ability-allocation',
      message: '背景属性加值分配不合法。',
      resolution: allocationIssue,
    })
  }
  const sizeRules = getDraftSpeciesRules(draft, repository).filter((item) => (item.sizeChoices?.length ?? 0) > 0)
  if (sizeRules.length > 0) {
    const size = draft.speciesSizeChoice
    if (!size || !sizeRules.some((item) => item.sizeChoices?.includes(size))) {
      blockers.push({
        id: 'species-size-required',
        message: '物种需要选择体型。',
        resolution: '选择小型或中型。',
      })
    }
  }
  blockers.push(...getSpeciesProficiencyBlockers(draft, repository))
  return blockers
}

/** 起源步骤是否可继续（阻塞项为空）。 */
export function isOriginStepComplete(draft: CharacterDraft, repository: RulesRepository): boolean {
  return getOriginStepBlockers(draft, repository).length === 0
}
