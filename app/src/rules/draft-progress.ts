import type { CharacterDraft } from '@/types/character'

/**
 * 是否已经产生构筑选择（B00-04）：职业、起源、时间线选择、法术、装备与背包等。
 * 等级、属性生成方式与属性数值属于"尚未定型的草稿参数"，不视为构筑选择。
 */
export function hasBuildChoices(draft: Pick<CharacterDraft,
  | 'classId'
  | 'subclassId'
  | 'multiclass'
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
  | 'raceToolChoices'
  | 'backgroundSkillIds'
  | 'backgroundToolIds'
  | 'languages'
>): boolean {
  if (draft.classId || draft.subclassId) return true
  // 兼职分配本身也是构筑选择（职业集合或等级分配一经改动，规则版本即不可原地切换）。
  if (draft.multiclass && (draft.multiclass.classes.length > 0 || draft.multiclass.enabled)) return true
  if (draft.raceId || draft.subraceId || draft.backgroundId || draft.backgroundVariantId) return true
  if (draft.selections.some((selection) => !selection.invalidatedAt)) return true
  const spells = draft.spellSelections
  if (
    (spells?.cantripIds?.length ?? 0) > 0
    || (spells?.knownSpellIds?.length ?? 0) > 0
    || (spells?.preparedSpellIds?.length ?? 0) > 0
    || (spells?.spellbookSpellIds?.length ?? 0) > 0
  ) return true
  if ((draft.startingEquipmentSelections?.length ?? 0) > 0 || (draft.inventory?.length ?? 0) > 0) return true
  if ((draft.infusionAssignments?.length ?? 0) > 0) return true
  if ((draft.raceSkillChoices?.length ?? 0) > 0 || draft.raceToolChoice || draft.raceToolChoices?.length) return true
  if ((draft.backgroundSkillIds?.length ?? 0) > 0 || (draft.backgroundToolIds?.length ?? 0) > 0) return true
  if ((draft.languages?.length ?? 0) > 0) return true
  return false
}
