import type { ChoiceSelection } from '@/types/character'
import type { RulesRepository } from '@/types/rules'

export function getWeaponMasteryCandidates(repository: RulesRepository) {
  return repository.equipment.filter((item) => item.ruleset === repository.ruleset && item.category === 'weapon' && item.masteryId)
}

export function validateWeaponMasterySelection(repository: RulesRepository, selection: Pick<ChoiceSelection, 'optionIds'>, requiredCount: number): readonly string[] {
  const issues: string[] = []
  if (selection.optionIds.length !== requiredCount) issues.push(`需要选择${requiredCount}种武器精通。`)
  if (new Set(selection.optionIds).size !== selection.optionIds.length) issues.push('同一种武器不能重复选择。')
  const candidates = new Set(getWeaponMasteryCandidates(repository).map((item) => item.id))
  if (selection.optionIds.some((id) => !candidates.has(id))) issues.push('精通选择包含当前规则版本不可用的武器。')
  return issues
}
