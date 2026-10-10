import { rulesRepository } from '@/rules/repository'
import { SKILL_IDS } from '@/rules/data/skill-ids'
import { getSpeciesChoiceCheckpoints } from '@/rules/origins'
import type { CharacterDraft } from '@/types/character'
import { draft2024, selection } from './draft-2024'

export const motmSlugs = ['changeling', 'harengon', 'shadar-kai', 'fairy', 'air-genasi', 'earth-genasi', 'fire-genasi', 'water-genasi', 'satyr', 'centaur', 'minotaur', 'bugbear', 'tabaxi', 'sea-elf', 'orc', 'goblin', 'hobgoblin', 'goliath', 'kenku', 'yuan-ti', 'githzerai', 'githyanki', 'deep-gnome', 'duergar', 'firbolg', 'aarakocra', 'triton', 'shifter', 'kobold', 'aasimar', 'eladrin', 'lizardfolk', 'tortle'] as const

export function motmDraft(slug: string, targetLevel = 5): CharacterDraft {
  const raceId = `race-2014-motm-${slug}`
  const race = rulesRepository.getRace(raceId)
  if (!race) throw new Error(`Missing MotM race: ${raceId}`)
  const skillChoices = race.skillProficiencyChoices
  let draft = draft2024({ id: `motm-test-${slug}`, ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel, raceId,
    enabledSourceIds: ['motm-2022-index'], raceAbilityChoices: ['str', 'dex'], speciesSizeChoice: race.sizeChoices?.[0],
    raceSkillChoices: skillChoices ? (skillChoices.optionIds ?? SKILL_IDS).slice(0, skillChoices.count) : [],
    raceToolChoice: race.toolProficiencyChoices?.optionIds?.[0], languages: ['精灵语'], selections: [],
  })
  if (race.spellcastingAbilityChoices) draft = { ...draft, selections: [selection(`${raceId}-spellcasting-ability`, ['spell-ability-wis'])] }
  // Resolve parents before dependent choices, preserving the same stored selections as the UI.
  for (let pass = 0; pass < 3; pass++) {
    const choices = getSpeciesChoiceCheckpoints(draft, rulesRepository)
    draft = { ...draft, selections: [...draft.selections, ...choices.filter((cp) => !draft.selections.some((item) => item.checkpointId === cp.id)).map((cp) => selection(cp.id, cp.optionIds.slice(0, cp.minSelections)))] }
  }
  return draft
}
