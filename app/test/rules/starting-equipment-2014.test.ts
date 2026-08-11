import { describe, expect, it } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import {
  buildStartingEquipmentState,
  isStartingEquipmentComplete,
  updateEquippedQuantity,
} from '@/rules/starting-equipment'
import type { CharacterDraft } from '@/types/character'

function wizardDraft(patch: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    schemaVersion: 3,
    id: 'wizard-equipment',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 1,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-wizard',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-sage',
    backgroundSkillIds: ['skill-arcana', 'skill-history'],
    backgroundToolIds: [],
    languages: ['精灵语', '矮人语'],
    proficiencyReplacements: [],
    baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    selections: [],
    startingEquipmentSelections: [
      { groupId: 'wizard-weapon', optionId: 'quarterstaff', pickedItemIds: [] },
      { groupId: 'wizard-focus', optionId: 'arcane-focus', pickedItemIds: [] },
      { groupId: 'wizard-pack', optionId: 'scholar-pack', pickedItemIds: [] },
    ],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    equipmentNeedsReview: false,
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
    name: '伊莱恩',
    alignment: '',
    notes: '',
    currentStep: 'equipment',
    ...patch,
  }
}

describe('2014 starting equipment', () => {
  it('covers all twelve classes and thirty-five base backgrounds with resolvable item references', () => {
    expect(rulesRepository.classStartingEquipment).toHaveLength(12)
    const baseBackgrounds = rulesRepository.backgrounds.filter((background) => !background.parentBackgroundId)
    expect(baseBackgrounds).toHaveLength(35)

    const grants = [
      ...rulesRepository.classStartingEquipment.flatMap((profile) => [
        ...profile.fixedGrants,
        ...profile.groups.flatMap((group) => group.options.flatMap((option) => option.grants)),
      ]),
      ...rulesRepository.backgroundStartingEquipment.flatMap((profile) => profile.grants),
    ]
    expect(grants.every((grant) => Boolean(rulesRepository.getEquipment(grant.itemId)))).toBe(true)
    expect(rulesRepository.equipment.flatMap((item) => item.contents ?? [])
      .every((grant) => Boolean(rulesRepository.getEquipment(grant.itemId)))).toBe(true)
  })

  it('builds the complete wizard package, expands the scholar pack and merges sage equipment', () => {
    const draft = wizardDraft()
    const state = buildStartingEquipmentState(draft)
    const byId = new Map(state.inventory.map((entry) => [entry.itemId, entry]))

    expect(isStartingEquipmentComplete(draft)).toBe(true)
    expect(byId.get('spellbook')?.quantity).toBe(1)
    expect(byId.get('quarterstaff')?.equippedQuantity).toBe(1)
    expect(byId.get('arcane-focus')?.quantity).toBe(1)
    expect(byId.get('parchment-sheet')?.quantity).toBe(10)
    expect(byId.get('colleague-letter')?.sourceKind).toBe('background')
    expect(state.currency.gp).toBe(10)
  })

  it('validates constrained picks and preserves duplicate weapon quantities', () => {
    const fighter = rulesRepository.getClassStartingEquipment('class-2014-fighter')
    expect(fighter).toBeDefined()
    const draft = wizardDraft({
      classId: 'class-2014-fighter',
      startingEquipmentSelections: [
        { groupId: 'fighter-armor', optionId: 'chain-mail', pickedItemIds: [] },
        { groupId: 'fighter-primary', optionId: 'two-weapons', pickedItemIds: ['longsword', 'longsword'] },
        { groupId: 'fighter-ranged', optionId: 'handaxes', pickedItemIds: [] },
        { groupId: 'fighter-pack', optionId: 'explorer-pack', pickedItemIds: [] },
      ],
    })
    const state = buildStartingEquipmentState(draft)

    expect(isStartingEquipmentComplete(draft)).toBe(true)
    expect(state.inventory.find((entry) => entry.itemId === 'longsword')?.quantity).toBe(2)
    expect(isStartingEquipmentComplete({
      ...draft,
      startingEquipmentSelections: draft.startingEquipmentSelections.map((selection) =>
        selection.groupId === 'fighter-primary'
          ? { ...selection, pickedItemIds: ['dagger', 'dagger'] }
          : selection),
    })).toBe(false)
  })

  it('uses explicit variant replacements and keeps equipped quantity within ownership', () => {
    const gladiator = wizardDraft({
      backgroundId: 'background-2014-entertainer',
      backgroundVariantId: 'background-2014-entertainer-gladiator',
    })
    const state = buildStartingEquipmentState(gladiator)
    expect(state.inventory.some((entry) => entry.itemId === 'trident')).toBe(true)
    expect(state.inventory.some((entry) => entry.itemId === 'musical-instrument' && entry.sourceKind === 'background')).toBe(false)

    const quarterstaff = state.inventory.find((entry) => entry.itemId === 'quarterstaff')
    expect(quarterstaff).toBeDefined()
    const updated = updateEquippedQuantity(state.inventory, quarterstaff!.id, 99)
    expect(updated.find((entry) => entry.id === quarterstaff!.id)?.equippedQuantity).toBe(quarterstaff!.quantity)
  })
})
