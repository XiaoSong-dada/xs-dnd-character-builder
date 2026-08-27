import { computed, ref } from 'vue'

import { adjustmentForEnteredValue, EMPTY_MANUAL_EDITS, hasManualEdits, normalizeManualEdits, setRecordAdjustment } from '@/rules/manual-edits'
import { getEffectiveSpellSlots, getSpellcastingConfig } from '@/rules/spellcasting'
import type {
  AbilityKey,
  CharacterDraft,
  CharacterManualEdits,
  DerivedCharacter,
  ManualAddedSpell,
  ManualDerivedField,
} from '@/types/character'

export function useCharacterSheetEditing(
  getDraft: () => CharacterDraft,
  getDerived: () => DerivedCharacter,
  update: (edits: CharacterManualEdits) => void,
) {
  const editMode = ref(false)
  const showResetConfirm = ref(false)
  const manual = computed(() => normalizeManualEdits(getDraft().manualEdits))
  const hasEdits = computed(() => hasManualEdits(manual.value))

  function commitAbility(key: AbilityKey, entered: number): void {
    const current = manual.value
    const adjustment = adjustmentForEnteredValue(entered, getDerived().abilities[key] - (current.abilityAdjustments[key] ?? 0))
    update({ ...current, abilityAdjustments: setRecordAdjustment(current.abilityAdjustments, key, adjustment) })
  }

  function commitProficiency(entered: number): void {
    const current = manual.value
    const baseline = getDerived().proficiencyBonus.value - current.proficiencyBonusAdjustment
    update({ ...current, proficiencyBonusAdjustment: adjustmentForEnteredValue(entered, baseline) })
  }

  function commitDerived(key: ManualDerivedField, entered: number): void {
    const current = manual.value
    const value = key === 'passivePerception'
      ? getDerived().passivePerception.value
      : key === 'spellAttackBonus'
        ? getDerived().spellAttackBonus?.value ?? 0
        : key === 'spellSaveDc'
          ? getDerived().spellSaveDc?.value ?? 0
          : getDerived()[key].value
    const baseline = value - (current.derivedAdjustments[key] ?? 0)
    update({ ...current, derivedAdjustments: setRecordAdjustment(current.derivedAdjustments, key, adjustmentForEnteredValue(entered, baseline)) })
  }

  function commitSavingThrow(key: AbilityKey, entered: number): void {
    const current = manual.value
    const baseline = getDerived().savingThrows[key].value - (current.savingThrowAdjustments[key] ?? 0)
    update({ ...current, savingThrowAdjustments: setRecordAdjustment(current.savingThrowAdjustments, key, adjustmentForEnteredValue(entered, baseline)) })
  }

  function commitSkill(skillId: string, entered: number): void {
    const current = manual.value
    const baseline = (getDerived().skills[skillId]?.value ?? 0) - (current.skillAdjustments[skillId] ?? 0)
    const skillAdjustments = { ...current.skillAdjustments }
    const adjustment = adjustmentForEnteredValue(entered, baseline)
    if (adjustment === 0) delete skillAdjustments[skillId]
    else skillAdjustments[skillId] = adjustment
    update({ ...current, skillAdjustments })
  }

  function commitSpellSlot(level: number, entered: number): void {
    const current = manual.value
    const finalCount = getEffectiveSpellSlots(getDraft()).find((slot) => slot.level === level)?.count ?? 0
    const baseline = finalCount - (current.spellSlotAdjustments[level] ?? 0)
    const spellSlotAdjustments = { ...current.spellSlotAdjustments }
    const adjustment = adjustmentForEnteredValue(entered, baseline)
    if (adjustment === 0) delete spellSlotAdjustments[level]
    else spellSlotAdjustments[level] = adjustment
    update({ ...current, spellSlotAdjustments })
  }

  function addSpell(spell: ManualAddedSpell): void {
    const current = manual.value
    if (current.addedSpells.some((item) => item.spellId === spell.spellId)) return
    update({ ...current, addedSpells: [...current.addedSpells, spell] })
  }

  function removeSpell(spellId: string): void {
    const current = manual.value
    update({ ...current, addedSpells: current.addedSpells.filter((item) => item.spellId !== spellId) })
  }

  function resetAll(): void {
    update(EMPTY_MANUAL_EDITS)
    showResetConfirm.value = false
  }

  const spellMode = computed(() => getSpellcastingConfig(getDraft())?.mode)

  return {
    editMode,
    showResetConfirm,
    manual,
    hasEdits,
    spellMode,
    commitAbility,
    commitProficiency,
    commitDerived,
    commitSavingThrow,
    commitSkill,
    commitSpellSlot,
    addSpell,
    removeSpell,
    resetAll,
  } as const
}
