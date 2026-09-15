import type { CharacterDraft } from '@/types/character'

/**
 * 是否已经产生构筑选择（B00-04）：职业、起源、时间线选择、法术、装备与背包等。
 * 等级、属性生成方式与属性数值属于"尚未定型的草稿参数"，不视为构筑选择。
 */
export function hasBuildChoices(draft: Pick<CharacterDraft,
  | 'classId'
  | 'subclassId'
  | 'raceId'
  | 'subraceId'
  | 'backgroundId'
  | 'backgroundVariantId'
  | 'selections'
  | 'spellSelections'
  | 'startingEquipmentSelections'
  | 'inventory'
  | 'infusionAssignments'
  | 'raceSkillChoices'
  | 'raceToolChoice'
  | 'backgroundSkillIds'
  | 'backgroundToolIds'
  | 'languages'
>): boolean {
  if (draft.classId || draft.subclassId) return true
  if (draft.raceId || draft.subraceId || draft.backgroundId || draft.backgroundVariantId) return true
  if (draft.selections.some((selection) => !selection.invalidatedAt)) return true
  const spells = draft.spellSelections
  if (
    spells.cantripIds.length > 0
    || spells.knownSpellIds.length > 0
    || spells.preparedSpellIds.length > 0
    || spells.spellbookSpellIds.length > 0
  ) return true
  if (draft.startingEquipmentSelections.length > 0 || draft.inventory.length > 0) return true
  if (draft.infusionAssignments.length > 0) return true
  if ((draft.raceSkillChoices?.length ?? 0) > 0 || draft.raceToolChoice) return true
  if (draft.backgroundSkillIds.length > 0 || draft.backgroundToolIds.length > 0) return true
  if (draft.languages.length > 0) return true
  return false
}
