import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  abilityImprovementOptions2014,
} from '@/rules/data/feats-2014'
import { ABILITY_IMPROVEMENT_OPTION_IDS_2024 } from '@/rules/data/feats-2024'
import { isSourceEnabled } from '@/rules/source-books'
import type { AbilityKey, AbilityScores, CharacterDraft, RulesetId } from '@/types/character'
import type { ArmorTraining, ChoiceCheckpoint, FeatCategory, FeatChoiceSpec, FeatRule, RulesRepository } from '@/types/rules'

export type AbilityImprovementMode = 'single' | 'split'

export interface AbilityImprovementSelection {
  readonly mode: AbilityImprovementMode
  readonly abilities: readonly AbilityKey[]
}

export interface FeatEligibilityContext {
  readonly abilities: AbilityScores
  readonly classId: string
  readonly canCastSpells: boolean
  readonly raceId?: string
  readonly subraceId?: string
  /** 获得节点等级；2024 条目在缺少等级时视为不满足等级前置。 */
  readonly level?: number
  /** 是否拥有战斗风格特性（职业或子职授予）。 */
  readonly hasFightingStyle?: boolean
  /** 当前护甲训练；提供时优先于 2014 职业映射（2024 使用）。 */
  readonly armorTrainings?: readonly ArmorTraining[]
}

/** 专长授予来源；用于重复选择校验与数值来源解释。 */
export interface FeatGrant {
  readonly featId: string
  readonly sourceKind: 'background' | 'species' | 'class' | 'subclass'
  readonly sourceId: string
  readonly checkpointId?: string
}

const abilityImprovementOptionIds = new Set([
  ...abilityImprovementOptions2014.map((option) => option.id),
  ...ABILITY_IMPROVEMENT_OPTION_IDS_2024,
])

const armorTrainingByCapability: Readonly<Record<string, ArmorTraining>> = {
  'armor-light': 'light',
  'armor-medium': 'medium',
  'armor-heavy': 'heavy',
  shield: 'shield',
}

const capabilityLabels: Readonly<Record<string, string>> = {
  'armor-light': '轻甲熟练',
  'armor-medium': '中甲熟练',
  'armor-heavy': '重甲熟练',
  shield: '盾牌熟练',
  'spellcasting': '能够施放至少一个法术',
  'spellcasting-or-pact': '施法或契约魔法特性',
  'fighting-style': '战斗风格特性',
}

const classCapabilities: Readonly<Record<string, readonly string[]>> = {
  'class-2014-barbarian': ['armor-light', 'armor-medium'],
  'class-2014-artificer': ['armor-light', 'armor-medium'],
  'class-2014-bard': ['armor-light'],
  'class-2014-cleric': ['armor-light', 'armor-medium'],
  'class-2014-druid': ['armor-light', 'armor-medium'],
  'class-2014-fighter': ['armor-light', 'armor-medium', 'armor-heavy', 'shield'],
  'class-2014-paladin': ['armor-light', 'armor-medium', 'armor-heavy', 'shield'],
  'class-2014-ranger': ['armor-light', 'armor-medium'],
  'class-2014-rogue': ['armor-light'],
  'class-2014-warlock': ['armor-light'],
}

function abilityImprovementPrefix(ruleset: RulesetId): string {
  return ruleset === '5e-2024' ? 'asi-2024' : 'asi'
}

export function encodeAbilityImprovement(
  selection: AbilityImprovementSelection,
  ruleset: RulesetId = '5e-2014',
): string | undefined {
  const prefix = abilityImprovementPrefix(ruleset)
  if (selection.mode === 'single' && selection.abilities.length === 1) {
    return `${prefix}-${selection.abilities[0]}-2`
  }
  if (selection.mode !== 'split' || selection.abilities.length !== 2) return undefined
  const unique = [...new Set(selection.abilities)]
  if (unique.length !== 2) return undefined
  const ordered = [...unique].sort((left, right) => ABILITY_KEYS.indexOf(left) - ABILITY_KEYS.indexOf(right))
  return `${prefix}-${ordered[0]}-${ordered[1]}`
}

export function decodeAbilityImprovement(optionId: string): AbilityImprovementSelection | undefined {
  if (!abilityImprovementOptionIds.has(optionId)) return undefined
  const match = /^asi-(?:2024-)?(str|dex|con|int|wis|cha)-(str|dex|con|int|wis|cha|2)$/.exec(optionId)
  if (!match) return undefined
  const [, first, second] = match as unknown as [string, AbilityKey, AbilityKey | '2']
  return second === '2'
    ? { mode: 'single', abilities: [first] }
    : { mode: 'split', abilities: [first, second] }
}

export function abilityImprovementBonuses(optionId: string): Partial<AbilityScores> {
  const selection = decodeAbilityImprovement(optionId)
  if (!selection) return {}
  return selection.mode === 'single'
    ? { [selection.abilities[0] as AbilityKey]: 2 }
    : Object.fromEntries(selection.abilities.map((ability) => [ability, 1]))
}

export function getAbilityImprovementEligibility(
  abilities: AbilityScores,
  optionId: string,
  abilityCap = 20,
): { available: boolean; reason: string } {
  const bonuses = abilityImprovementBonuses(optionId)
  const exceeded = ABILITY_KEYS.find((ability) => abilities[ability] + (bonuses[ability] ?? 0) > abilityCap)
  return exceeded
    ? { available: false, reason: `${ABILITY_LABELS[exceeded]}提高后会超过${abilityCap}` }
    : { available: true, reason: '' }
}

export function applyAbilityImprovement(abilities: AbilityScores, optionId: string, abilityCap = 20): AbilityScores {
  const bonuses = abilityImprovementBonuses(optionId)
  return Object.fromEntries(ABILITY_KEYS.map((ability) => [
    ability,
    Math.min(abilityCap, abilities[ability] + (bonuses[ability] ?? 0)),
  ])) as unknown as AbilityScores
}

/** 专长属性上限：传奇恩惠 30，其余 20；子选择可单独声明。 */
export function getFeatAbilityCap(feat: FeatRule, choice?: FeatChoiceSpec): number {
  if (choice?.abilityCap !== undefined) return choice.abilityCap
  return feat.category === 'epic-boon' ? 30 : 20
}

export function getFeatEligibility(
  selectedFeat: FeatRule,
  context: FeatEligibilityContext,
): { available: boolean; reasons: readonly string[] } {
  const reasons: string[] = []
  const minimumLevel = selectedFeat.prerequisite?.minimumLevel
  if (minimumLevel !== undefined && (context.level === undefined || context.level < minimumLevel)) {
    reasons.push(`需要${minimumLevel}级`)
  }
  const minimum = selectedFeat.prerequisite?.abilityMinimum
  if (minimum && !minimum.anyOf.some((ability) => context.abilities[ability] >= minimum.score)) {
    reasons.push(`${minimum.anyOf.map((ability) => ABILITY_LABELS[ability]).join('或')}需要达到${minimum.score}`)
  }
  const requiredCapability = selectedFeat.prerequisite?.requiredCapability
  const requiredRaces = selectedFeat.prerequisite?.requiredRaceIds
  if (requiredRaces && !requiredRaces.includes(context.raceId ?? '')) reasons.push('种族前置不满足')
  const requiredSubraces = selectedFeat.prerequisite?.requiredSubraceIds
  if (requiredSubraces && !requiredSubraces.includes(context.subraceId ?? '')) reasons.push('子种族前置不满足')
  if (requiredCapability === 'spellcasting' && !context.canCastSpells) {
    reasons.push(`需要${capabilityLabels.spellcasting}`)
  }
  if (requiredCapability === 'spellcasting-or-pact' && !context.canCastSpells) {
    reasons.push(`需要${capabilityLabels['spellcasting-or-pact']}`)
  }
  if (requiredCapability === 'fighting-style' && !context.hasFightingStyle) {
    reasons.push(`需要${capabilityLabels['fighting-style']}`)
  }
  if (requiredCapability === 'fighting-style') return { available: reasons.length === 0, reasons }
  if (requiredCapability && requiredCapability !== 'spellcasting' && requiredCapability !== 'spellcasting-or-pact') {
    if (context.armorTrainings) {
      const training = armorTrainingByCapability[requiredCapability]
      if (!training || !context.armorTrainings.includes(training)) {
        reasons.push(`需要${capabilityLabels[requiredCapability] ?? requiredCapability}`)
      }
    } else if (!classCapabilities[context.classId]?.includes(requiredCapability)) {
      reasons.push(`需要${capabilityLabels[requiredCapability] ?? requiredCapability}`)
    }
  }
  return { available: reasons.length === 0, reasons }
}

/** 按类别与获得节点等级筛选专长候选池；只返回当前仓库、来源启用且状态可选的条目。 */
export function getFeatPool(
  repository: RulesRepository,
  categories: readonly FeatCategory[],
  options: { readonly level?: number; readonly enabledSourceIds?: readonly string[] } = {},
): readonly FeatRule[] {
  return repository.feats.filter((feat) => {
    if (!feat.category || !categories.includes(feat.category)) return false
    if (feat.status === 'unavailable') return false
    const minimumLevel = feat.prerequisite?.minimumLevel ?? 0
    if (options.level !== undefined && minimumLevel > options.level) return false
    if (options.enabledSourceIds !== undefined && !isSourceEnabled(feat.sourceIds, options.enabledSourceIds, repository)) return false
    return true
  })
}

function grantSourceKind(checkpointId: string): FeatGrant['sourceKind'] {
  if (checkpointId.startsWith('race-') || checkpointId.startsWith('species-')) return 'species'
  if (checkpointId.includes('-subclass-') || checkpointId.startsWith('subclass-feature-')) return 'subclass'
  return 'class'
}

/** 汇总角色当前实际获得的专长（背景固定授予 + 时间线选择），用于派生、重复校验与来源解释。 */
export function listFeatGrants(draft: CharacterDraft, repository: RulesRepository): readonly FeatGrant[] {
  const grants: FeatGrant[] = []
  const background = draft.backgroundId ? repository.getBackground(draft.backgroundId) : undefined
  if (
    background?.originFeatId
    && isSourceEnabled(background.sourceIds, draft.enabledSourceIds, repository)
  ) {
    grants.push({ featId: background.originFeatId, sourceKind: 'background', sourceId: background.id })
  }
  for (const selection of draft.selections) {
    if (selection.invalidatedAt) continue
    for (const optionId of selection.optionIds) {
      const feat = repository.getFeat(optionId)
      if (!feat) continue
      if (!isSourceEnabled(feat.sourceIds, draft.enabledSourceIds, repository)) continue
      grants.push({
        featId: feat.id,
        sourceKind: grantSourceKind(selection.checkpointId),
        sourceId: selection.checkpointId,
        checkpointId: selection.checkpointId,
      })
    }
  }
  return grants
}

/** 角色当前生效的专长条目（按授予顺序去重）。 */
export function listActiveFeats(draft: CharacterDraft, repository: RulesRepository): readonly FeatRule[] {
  const seen = new Set<string>()
  const feats: FeatRule[] = []
  for (const grant of listFeatGrants(draft, repository)) {
    if (seen.has(grant.featId)) continue
    const feat = repository.getFeat(grant.featId)
    if (!feat) continue
    seen.add(grant.featId)
    feats.push(feat)
  }
  return feats
}

/** 专长授予的技能熟练、专精与“未熟练则熟练／已熟练则专精”选择。 */
export interface FeatSkillSelections {
  readonly proficiencies: Set<string>
  readonly expertise: Set<string>
  readonly conditional: readonly string[]
  readonly allSkills: boolean
}

export function collectFeatSkillSelections(draft: CharacterDraft, repository: RulesRepository): FeatSkillSelections {
  // 2014 同类专长保持既有派生行为（B04 不改变 2014）；仅 2024 接入技能熟练与专精派生。
  if (repository.ruleset !== '5e-2024') {
    return { proficiencies: new Set(), expertise: new Set(), conditional: [], allSkills: false }
  }
  const proficiencies = new Set<string>()
  const expertise = new Set<string>()
  const conditional: string[] = []
  const allSkills = listActiveFeats(draft, repository).some((feat) => feat.grantsAllSkillProficiencies === true)
  for (const selection of draft.selections) {
    if (selection.invalidatedAt || !selection.checkpointId.startsWith('feat-child:')) continue
    const [, parentCheckpointId, featId, choiceId] = selection.checkpointId.split(':')
    const feat = featId ? repository.getFeat(featId) : undefined
    if (!feat) continue
    const parentActive = draft.selections.some((item) => item.checkpointId === parentCheckpointId && !item.invalidatedAt && item.optionIds.includes(featId ?? ''))
    if (!parentActive) continue
    const choice = feat.choices?.find((item) => item.id === choiceId)
    if (!choice) continue
    for (const optionId of selection.optionIds) {
      if (!optionId.startsWith('skill-')) continue
      if (choice.candidateKind === 'proficient-skills') {
        expertise.add(optionId)
        continue
      }
      if (choice.candidateKind !== 'all-skills') continue
      if (choice.expertiseIfProficient) conditional.push(optionId)
      else proficiencies.add(optionId)
    }
  }
  return { proficiencies, expertise, conditional, allSkills }
}

/** 角色当前护甲训练：职业授予 + 已生效专长授予。 */
export function collectArmorTrainings(draft: CharacterDraft, repository: RulesRepository): readonly ArmorTraining[] {
  const trainings = new Set<ArmorTraining>()
  const classRule = draft.classId ? repository.getClass(draft.classId) : undefined
  for (const training of classRule?.armorTraining ?? []) trainings.add(training)
  for (const feat of listActiveFeats(draft, repository)) {
    for (const training of feat.armorTraining ?? []) trainings.add(training)
  }
  // 选择类特性可附带训练（如 2024 牧师圣职·保护者）。
  for (const selection of draft.selections) {
    if (selection.invalidatedAt) continue
    for (const optionId of selection.optionIds) {
      for (const training of repository.getOption(optionId)?.armorTraining ?? []) trainings.add(training)
    }
  }
  return [...trainings]
}

/** 职业是否在指定等级前授予战斗风格特性（用于战斗风格专长前置）。 */
export function classHasFightingStyle(
  repository: RulesRepository,
  classId: string | undefined,
  level: number,
): boolean {
  if (!classId) return false
  const classRule = repository.getClass(classId)
  return Boolean(classRule?.checkpoints.some((checkpoint) => checkpoint.kind === 'fighting-style' && checkpoint.level <= level))
}

/** 检查点动态选择数量：默认取 min/max；声明按熟练加值时取当前熟练加值。 */
export function getCheckpointSelectionBounds(
  draft: CharacterDraft,
  checkpoint: ChoiceCheckpoint,
): { readonly min: number; readonly max: number } {
  if (checkpoint.selectionCountFrom === 'proficiency-bonus') {
    const bonus = 2 + Math.floor((Math.max(1, draft.targetLevel) - 1) / 4)
    return { min: bonus, max: bonus }
  }
  if (checkpoint.selectionCountByLevel?.length) {
    const level = Math.min(Math.max(1, Math.trunc(draft.targetLevel)), checkpoint.selectionCountByLevel.length)
    const count = Math.max(0, checkpoint.selectionCountByLevel[level - 1] ?? 0)
    return { min: count, max: count }
  }
  return { min: checkpoint.minSelections, max: checkpoint.maxSelections }
}

/** 解析专长子选择中的属性提升选择（`feat-bonus-<ability>-1`），用于授予法术的施法属性。 */
export function getFeatChosenAbility(
  draft: CharacterDraft,
  parentCheckpointId: string | undefined,
  featId: string,
): AbilityKey | undefined {
  if (!parentCheckpointId) return undefined
  const selection = draft.selections.find((item) =>
    item.checkpointId === `feat-child:${parentCheckpointId}:${featId}:ability` && !item.invalidatedAt)
  for (const optionId of selection?.optionIds ?? []) {
    const match = /^feat-bonus-(str|dex|con|int|wis|cha)-[12]$/.exec(optionId)
    if (match) return match[1] as AbilityKey
  }
  return undefined
}
