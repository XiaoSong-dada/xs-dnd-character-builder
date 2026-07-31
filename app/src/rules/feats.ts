import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  abilityImprovementOptions2014,
} from '@/rules/data/feats-2014'
import type { AbilityKey, AbilityScores } from '@/types/character'
import type { FeatRule } from '@/types/rules'

export type AbilityImprovementMode = 'single' | 'split'

export interface AbilityImprovementSelection {
  readonly mode: AbilityImprovementMode
  readonly abilities: readonly AbilityKey[]
}

export interface FeatEligibilityContext {
  readonly abilities: AbilityScores
  readonly classId: string
  readonly canCastSpells: boolean
}

const classCapabilities: Readonly<Record<string, readonly string[]>> = {
  'class-2014-barbarian': ['armor-light', 'armor-medium'],
  'class-2014-bard': ['armor-light'],
  'class-2014-cleric': ['armor-light', 'armor-medium'],
  'class-2014-druid': ['armor-light', 'armor-medium'],
  'class-2014-fighter': ['armor-light', 'armor-medium', 'armor-heavy'],
  'class-2014-paladin': ['armor-light', 'armor-medium', 'armor-heavy'],
  'class-2014-ranger': ['armor-light', 'armor-medium'],
  'class-2014-rogue': ['armor-light'],
  'class-2014-warlock': ['armor-light'],
}

export function encodeAbilityImprovement(selection: AbilityImprovementSelection): string | undefined {
  if (selection.mode === 'single' && selection.abilities.length === 1) {
    return `asi-${selection.abilities[0]}-2`
  }
  if (selection.mode !== 'split' || selection.abilities.length !== 2) return undefined
  const unique = [...new Set(selection.abilities)]
  if (unique.length !== 2) return undefined
  const ordered = [...unique].sort((left, right) => ABILITY_KEYS.indexOf(left) - ABILITY_KEYS.indexOf(right))
  return `asi-${ordered[0]}-${ordered[1]}`
}

export function decodeAbilityImprovement(optionId: string): AbilityImprovementSelection | undefined {
  if (!abilityImprovementOptions2014.some((option) => option.id === optionId)) return undefined
  const [, first, second] = optionId.split('-') as [string, AbilityKey, AbilityKey | '2']
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
): { available: boolean; reason: string } {
  const bonuses = abilityImprovementBonuses(optionId)
  const exceeded = ABILITY_KEYS.find((ability) => abilities[ability] + (bonuses[ability] ?? 0) > 20)
  return exceeded
    ? { available: false, reason: `${ABILITY_LABELS[exceeded]}提高后会超过20` }
    : { available: true, reason: '' }
}

export function applyAbilityImprovement(abilities: AbilityScores, optionId: string): AbilityScores {
  const bonuses = abilityImprovementBonuses(optionId)
  return Object.fromEntries(ABILITY_KEYS.map((ability) => [
    ability,
    Math.min(20, abilities[ability] + (bonuses[ability] ?? 0)),
  ])) as unknown as AbilityScores
}

export function getFeatEligibility(
  selectedFeat: FeatRule,
  context: FeatEligibilityContext,
): { available: boolean; reasons: readonly string[] } {
  const reasons: string[] = []
  const minimum = selectedFeat.prerequisite?.abilityMinimum
  if (minimum && !minimum.anyOf.some((ability) => context.abilities[ability] >= minimum.score)) {
    reasons.push(`${minimum.anyOf.map((ability) => ABILITY_LABELS[ability]).join('或')}需要达到${minimum.score}`)
  }
  const requiredCapability = selectedFeat.prerequisite?.requiredCapability
  if (requiredCapability === 'spellcasting' && !context.canCastSpells) reasons.push('需要能够施放至少一个法术')
  if (
    requiredCapability
    && requiredCapability !== 'spellcasting'
    && !classCapabilities[context.classId]?.includes(requiredCapability)
  ) {
    const labels = {
      'armor-light': '轻甲熟练',
      'armor-medium': '中甲熟练',
      'armor-heavy': '重甲熟练',
    }
    reasons.push(`需要${labels[requiredCapability]}`)
  }
  return { available: reasons.length === 0, reasons }
}
