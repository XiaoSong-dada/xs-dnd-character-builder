import { officialExpansionRaces2014 } from '@/rules/data/races-official-expansions-2014'
import { rulesRepository } from '@/rules/repository'
import { SKILL_IDS } from '@/rules/data/skill-ids'
import { draft2024, selection } from './draft-2024'

export const officialIds = [...officialExpansionRaces2014.filter((race) => !race.requiresSubrace).map((race) => race.id), 'race-2014-centaur', 'race-2014-minotaur', 'race-2014-triton']
export function officialDraft(id: string, targetLevel = 5) {
  const race = rulesRepository.getRace(id)
  if (!race) throw new Error(`Missing race ${id}`)
  const sources = rulesRepository.sources.filter((source) => source.category === 'supplement' && source.contentKind !== 'third-party').map((source) => source.id)
  const choices = (race.choices ?? []).filter((choice) => !choice.parentCheckpointId).map((choice) => selection(choice.id, choice.optionIds.slice(0, choice.minSelections)))
  if (race.spellcastingAbilityChoices?.length) choices.push(selection(`${race.id}-spellcasting-ability`, ['spell-ability-wis']))
  if (race.originFeatChoices) choices.push(selection(`${race.id}-origin-feat`, ['feat-tough']))
  return draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel, raceId: race.parentRaceId ?? race.id, subraceId: race.parentRaceId ? race.id : undefined, enabledSourceIds: sources, name: race.name, baseAbilities: { str: 14, dex: 13, con: 12, int: 10, wis: 10, cha: 8 }, raceAbilityChoices: race.flexibleBonusGroups?.length ? ['con'] : race.flexibleBonusAlternatives?.length ? ['con', 'dex'] : [], speciesSizeChoice: race.sizeChoices?.[0], raceSkillChoices: (race.skillProficiencyChoices?.optionIds ?? SKILL_IDS).slice(0, race.skillProficiencyChoices?.count ?? 0), raceToolChoices: race.toolProficiencyChoices?.optionIds?.slice(0, race.toolProficiencyChoices.count), inventory: [], selections: choices, languages: [] })
}
