import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { deriveCharacter } from '@/rules/derive'
import type { CharacterDraft } from '@/types/character'

export const fighterDraft: CharacterDraft = {
  schemaVersion: 3, id: 'export-data-fixture', ruleset: '5e-2014', createdAt: '', updatedAt: '', targetLevel: 4,
  abilityMethod: 'standard-array', preferences: [], classId: 'class-2014-fighter', backgroundId: 'background-2014-soldier',
  raceId: 'race-2014-half-orc', raceAbilityChoices: [], backgroundSkillIds: ['skill-athletics', 'skill-intimidation'],
  backgroundToolIds: [], languages: ['兽人语', '精灵语'], proficiencyReplacements: [],
  baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 }, selections: [], startingEquipmentSelections: [],
  inventory: [
    { id: 'entry-longsword', itemId: 'longsword', quantity: 1, sourceKind: 'class', sourceId: 'class-2014-fighter', equippedQuantity: 1 },
    { id: 'entry-longsword-extra', itemId: 'longsword', quantity: 1, sourceKind: 'adventure', sourceId: 'draft', equippedQuantity: 0 },
    { id: 'entry-potion', itemId: 'potion-of-healing', quantity: 2, sourceKind: 'adventure', sourceId: 'draft', equippedQuantity: 0 },
  ],
  currency: { cp: 5, sp: 4, ep: 3, gp: 10, pp: 2 }, adventureGold: 7, equipmentNeedsReview: false,
  spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
  name: '测试角色', alignment: '守序善良', notes: '来自测试夹具的背景故事。', currentStep: 'sheet',
}

export const wizardDraft: CharacterDraft = {
  ...fighterDraft, id: 'export-wizard-fixture', classId: 'class-2014-wizard', subclassId: 'subclass-2014-wizard-evocation', targetLevel: 3,
  inventory: [{ id: 'entry-quarterstaff', itemId: 'quarterstaff', quantity: 1, sourceKind: 'class', sourceId: 'class-2014-wizard', equippedQuantity: 1 }],
  spellSelections: {
    cantripIds: ['spell-2014-fire-bolt', 'spell-2014-mage-hand'], knownSpellIds: [], preparedSpellIds: ['spell-2014-magic-missile'],
    spellbookSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield'],
  },
}

export const levelSixWizardDraft: CharacterDraft = {
  ...wizardDraft,
  id: 'export-level-six-wizard-fixture',
  targetLevel: 6,
  subclassId: 'subclass-2014-wizard-chronurgy',
  spellSelections: {
    cantripIds: ['spell-2014-friends', 'spell-2014-mage-hand', 'spell-2014-fire-bolt', 'spell-2014-toll-the-dead'],
    knownSpellIds: [],
    preparedSpellIds: [
      'spell-2014-chromatic-orb', 'spell-2014-mage-armor', 'spell-2014-silvery-barbs',
      'spell-2014-detect-thoughts', 'spell-2014-hold-person', 'spell-2014-misty-step',
      'spell-2014-counterspell', 'spell-2014-lightning-bolt', 'spell-2014-fireball',
    ],
    spellbookSpellIds: [
      'spell-2014-find-familiar', 'spell-2014-detect-magic', 'spell-2014-magic-missile', 'spell-2014-mage-armor',
      'spell-2014-silvery-barbs', 'spell-2014-thunderwave', 'spell-2014-hold-person', 'spell-2014-ray-of-enfeeblement',
      'spell-2014-scorching-ray', 'spell-2014-counterspell', 'spell-2014-fireball', 'spell-2014-lightning-bolt',
      'spell-2014-misty-step', 'spell-2014-chromatic-orb', 'spell-2014-detect-thoughts', 'spell-2014-rime-s-binding-ice',
    ],
  },
}

export function fighterExportModel() { return buildCharacterExportModel(fighterDraft, deriveCharacter(fighterDraft)) }
export function wizardExportModel() { return buildCharacterExportModel(wizardDraft, deriveCharacter(wizardDraft)) }
export function levelSixWizardExportModel() { return buildCharacterExportModel(levelSixWizardDraft, deriveCharacter(levelSixWizardDraft)) }
