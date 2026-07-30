import { abilityModifier, getRaceAbilityBonuses } from '@/rules/derive'
import { rulesRepository } from '@/rules/repository'
import type { CharacterDraft } from '@/types/character'
import type { SpellcastingConfig } from '@/types/rules'

function abilityScoreAfterOrigin(draft: CharacterDraft, ability: SpellcastingConfig['ability']): number {
  return draft.baseAbilities[ability] + (getRaceAbilityBonuses(draft)[ability] ?? 0)
}

export function getMaximumSpellLevel(config: SpellcastingConfig, classLevel: number): number {
  return config.maxSpellLevelByClassLevel[Math.max(0, classLevel - 1)] ?? 0
}

export function getRequiredSpellCount(draft: CharacterDraft, config: SpellcastingConfig): number {
  if (draft.targetLevel < config.startsAtLevel) return 0
  if (config.mode === 'known' || config.mode === 'pact') return config.spellsKnownByLevel?.[draft.targetLevel - 1] ?? 0
  if (config.preparedFormula === 'ability-plus-half-level') {
    return Math.max(1, abilityModifier(abilityScoreAfterOrigin(draft, config.ability)) + Math.floor(draft.targetLevel / 2))
  }
  if (config.preparedFormula === 'ability-plus-level') {
    return Math.max(1, abilityModifier(abilityScoreAfterOrigin(draft, config.ability)) + draft.targetLevel)
  }
  return 0
}

export function getRequiredCantripCount(draft: CharacterDraft, config: SpellcastingConfig): number {
  return config.cantripsKnownByLevel?.[draft.targetLevel - 1] ?? 0
}

export function getRequiredSpellbookCount(draft: CharacterDraft, config: SpellcastingConfig): number {
  return config.spellbookSpellsByLevel?.[draft.targetLevel - 1] ?? 0
}

export function getSelectedSpellIds(draft: CharacterDraft, config: SpellcastingConfig): readonly string[] {
  if (config.mode === 'known') return draft.spellSelections.knownSpellIds
  if (config.mode === 'prepared') return draft.spellSelections.preparedSpellIds
  if (config.mode === 'spellbook') return draft.spellSelections.preparedSpellIds
  return draft.spellSelections.knownSpellIds
}

export function getAvailableSpells(draft: CharacterDraft, config: SpellcastingConfig) {
  const maximumLevel = getMaximumSpellLevel(config, draft.targetLevel)
  return config.classSpellIds
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is NonNullable<typeof spell> => Boolean(spell && spell.level <= maximumLevel))
}

export function validateSpellSelections(draft: CharacterDraft): boolean {
  const config = draft.classId ? rulesRepository.getClass(draft.classId)?.spellcasting : undefined
  if (!config || draft.targetLevel < config.startsAtLevel) return true
  const selected = getSelectedSpellIds(draft, config)
  const availableSpells = getAvailableSpells(draft, config)
  const availableIds = new Set(availableSpells.filter((spell) => spell.level > 0).map((spell) => spell.id))
  const cantripIds = new Set(availableSpells.filter((spell) => spell.level === 0).map((spell) => spell.id))
  const requiredCantrips = getRequiredCantripCount(draft, config)
  const cantripsValid = requiredCantrips === 0
    || (draft.spellSelections.cantripIds.length === requiredCantrips
      && draft.spellSelections.cantripIds.length === new Set(draft.spellSelections.cantripIds).size
      && draft.spellSelections.cantripIds.every((id) => cantripIds.has(id)))
  const spellbookValid = config.mode !== 'spellbook'
    || (draft.spellSelections.spellbookSpellIds.length === getRequiredSpellbookCount(draft, config)
      && draft.spellSelections.spellbookSpellIds.length === new Set(draft.spellSelections.spellbookSpellIds).size
      && draft.spellSelections.spellbookSpellIds.every((id) => availableIds.has(id))
      && selected.every((id) => draft.spellSelections.spellbookSpellIds.includes(id)))
  return cantripsValid
    && spellbookValid
    && selected.length === getRequiredSpellCount(draft, config)
    && selected.length === new Set(selected).size
    && selected.every((id) => availableIds.has(id))
}
