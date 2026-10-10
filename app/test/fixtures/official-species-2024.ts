import { officialSpecies2024 } from '@/rules/data/species-official-expansions-2024'
import { rulesRepository2024 } from '@/rules/repositories'
import { getSpeciesChoiceCheckpoints } from '@/rules/origins'
import { draft2024, selection } from './draft-2024'

export const officialSpeciesIds = officialSpecies2024.map((item) => item.id)
export function officialSpeciesDraft(id: string) {
  const race = rulesRepository2024.getRace(id)
  if (!race) throw new Error(id)
  let draft = draft2024({ id, targetLevel: 5, raceId: race.parentRaceId ?? id, subraceId: race.parentRaceId ? id : undefined,
    enabledSourceIds: ['source-2024-efa', 'source-2024-rthw', 'source-2024-lfl'], speciesSizeChoice: 'small',
    raceSkillChoices: race.skillProficiencyChoices ? (race.skillProficiencyChoices.optionIds ?? ['skill-athletics']).slice(0, race.skillProficiencyChoices.count) : [],
    raceToolChoices: race.toolProficiencyChoices?.optionIds?.slice(0, race.toolProficiencyChoices.count),
    selections: [selection(`${race.parentRaceId ?? id}-spellcasting-ability`, ['spell-ability-wis'])],
  })
  for (let pass = 0; pass < 2; pass++) {
    for (const checkpoint of getSpeciesChoiceCheckpoints(draft, rulesRepository2024)) {
      if (!checkpoint.required || draft.selections.some((item) => item.checkpointId === checkpoint.id)) continue
      draft = { ...draft, selections: [...draft.selections, selection(checkpoint.id, checkpoint.optionIds.slice(0, checkpoint.minSelections))] }
    }
  }
  return draft
}
