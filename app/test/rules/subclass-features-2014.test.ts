import { describe, expect, it } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import { subclasses2014 } from '@/rules/data/subclasses-2014'
import { getSubclassFeatures2014, subclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import { validateDraft, validateSubclassSelections } from '@/rules/validate'
import { getDependencyImpact } from '@/rules/dependency'
import { deriveCharacter } from '@/rules/derive'
import { getSubclassDerivedEffects, ZERO_SUBCLASS_EFFECTS } from '@/rules/subclass-effects'
import type { CharacterDraft } from '@/types/character'

function createDraft(): CharacterDraft {
  return {
    schemaVersion: 4,
    id: 'test',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 3,
    abilityMethod: 'standard-array',
    preferences: [],
    raceAbilityChoices: [],
    backgroundSkillIds: [],
    backgroundToolIds: [],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    equipmentNeedsReview: false,
    name: '凯恩',
    alignment: '',
    notes: '',
    currentStep: 'validation',
  }
}

describe('2014 subclass features catalog', () => {
  it('registers features with unique ids that all belong to catalog subclasses', () => {
    expect(subclassFeatures2014.length).toBeGreaterThan(0)
    expect(new Set(subclassFeatures2014.map((feature) => feature.id)).size).toBe(subclassFeatures2014.length)
    const subclassIds = new Set(subclasses2014.map((subclass) => subclass.id))
    for (const feature of subclassFeatures2014) {
      expect(subclassIds.has(feature.subclassId)).toBe(true)
      expect(feature.name.length).toBeGreaterThan(0)
      expect(feature.englishName.length).toBeGreaterThan(0)
      expect(feature.summary.length).toBeGreaterThan(0)
      expect(feature.description.length).toBeGreaterThan(0)
      expect(feature.level).toBeGreaterThan(0)
      expect(['implemented', 'index-only']).toContain(feature.status)
      expect(feature.sourceIds.length).toBeGreaterThan(0)
    }
  })

  it('requires option ids for every choice feature and keeps feature levels at or after selection level', () => {
    for (const feature of subclassFeatures2014) {
      if (feature.requiresChoice) {
        expect(feature.optionIds?.length).toBeGreaterThan(0)
      }
      const subclass = rulesRepository.getSubclass(feature.subclassId)
      expect(feature.level).toBeGreaterThanOrEqual(subclass?.selectionLevel ?? 0)
    }
  })

  it('looks up features per subclass via getSubclassFeatures2014', () => {
    expect(getSubclassFeatures2014('subclass-2014-barbarian-totem-warrior')).toHaveLength(5)
    expect(getSubclassFeatures2014('subclass-2014-ranger-hunter')).toHaveLength(4)
    expect(getSubclassFeatures2014('subclass-2014-wizard-abjuration')).toHaveLength(4)
    expect(getSubclassFeatures2014('subclass-2014-wizard-unknown')).toEqual([])
    const totemSpirit = getSubclassFeatures2014('subclass-2014-barbarian-totem-warrior')
      .find((feature) => feature.kind === 'choice')
    expect(totemSpirit?.optionIds).toEqual(['totem-bear', 'totem-eagle', 'totem-wolf'])
  })

  it('registers batch 2 core subclass features with implemented status', () => {
    const batchTwo = [
      'subclass-2014-bard-lore', 'subclass-2014-bard-valor', 'subclass-2014-cleric-life', 'subclass-2014-cleric-war',
      'subclass-2014-druid-land', 'subclass-2014-druid-moon', 'subclass-2014-sorcerer-draconic-bloodline', 'subclass-2014-sorcerer-wild-magic',
    ]
    for (const id of batchTwo) {
      expect(getSubclassFeatures2014(id).length).toBeGreaterThan(0)
      expect(rulesRepository.getSubclass(id)?.status).toBe('implemented')
    }
    expect(getSubclassFeatures2014('subclass-2014-cleric-life')).toHaveLength(7)
    expect(getSubclassFeatures2014('subclass-2014-sorcerer-wild-magic')).toHaveLength(5)
  })

  it('registers batch 3 expanded subclass features and promotes all player subclasses to implemented', () => {
    const playerSubclasses = subclasses2014.filter((subclass) => subclass.availability === 'player')
    const implemented = playerSubclasses.filter((subclass) => subclass.status === 'implemented')
    expect(implemented.length).toBe(112)
    for (const subclass of implemented) {
      expect(getSubclassFeatures2014(subclass.id).length).toBeGreaterThan(0)
    }
    const spotChecks = [
      'subclass-2014-barbarian-zealot', 'subclass-2014-cleric-twilight', 'subclass-2014-fighter-rune-knight',
      'subclass-2014-monk-kensei', 'subclass-2014-warlock-hexblade', 'subclass-2014-wizard-bladesinging',
    ]
    for (const id of spotChecks) {
      expect(getSubclassFeatures2014(id).length).toBeGreaterThan(0)
    }
  })

  it('registers a detailed description for every subclass feature', () => {
    const empty = subclassFeatures2014.filter((feature) => !feature.description?.length)
    expect(empty).toEqual([])
    const sample = getSubclassFeatures2014('subclass-2014-sorcerer-draconic-bloodline')
      .find((feature) => feature.id === 'sorcerer-draconic-bloodline-draconic-resilience')
    expect(sample?.description.length).toBeGreaterThan(sample?.summary.length ?? 0)
    expect(sample?.description).toContain('13 + 敏捷调整值')
  })
})

describe('validateSubclassSelections', () => {
  it('accepts a subclass that matches the class and target level', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-fighter',
      subclassId: 'subclass-2014-fighter-eldritch-knight',
    }
    const ids = validateSubclassSelections(draft).map((issue) => issue.id)
    expect(ids).not.toContain('subclass-class-mismatch')
    expect(ids).not.toContain('subclass-level-too-early')
    expect(ids).not.toContain('subclass-index-only')
  })

  it('reports subclass that does not belong to the selected class', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-fighter',
      subclassId: 'subclass-2014-barbarian-berserker',
    }
    expect(validateSubclassSelections(draft).some((issue) => issue.id === 'subclass-class-mismatch')).toBe(true)
  })

  it('reports subclass selected before its selection level', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-barbarian',
      subclassId: 'subclass-2014-barbarian-berserker',
      targetLevel: 2,
    }
    expect(validateSubclassSelections(draft).some((issue) => issue.id === 'subclass-level-too-early')).toBe(true)
  })

  it('warns when a required choice feature has no selection and errors on mutually exclusive multi-selection', () => {
    const base: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-barbarian',
      subclassId: 'subclass-2014-barbarian-totem-warrior',
    }
    const missingIds = validateSubclassSelections(base).map((issue) => issue.id)
    expect(missingIds.some((id) => id.startsWith('subclass-feature-choice-'))).toBe(true)

    const duplicated: CharacterDraft = {
      ...base,
      selections: [{ checkpointId: 'subclass-feature-barbarian-totem-warrior-totem-spirit', optionIds: ['totem-bear', 'totem-eagle'], confirmedAt: '' }],
    }
    expect(validateSubclassSelections(duplicated).some((issue) => issue.id.startsWith('subclass-feature-exclusive-'))).toBe(true)
  })

  it('returns no issues when no class or subclass is selected', () => {
    expect(validateSubclassSelections(createDraft())).toEqual([])
  })

  it('reports an incomplete subclass feature choice as a checkpoint error via validateDraft', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-barbarian',
      subclassId: 'subclass-2014-barbarian-totem-warrior',
      targetLevel: 3,
      selections: [{ checkpointId: 'barbarian-2014-subclass-3', optionIds: ['subclass-2014-barbarian-totem-warrior'], confirmedAt: '' }],
    }
    expect(validateDraft(draft).some((issue) => issue.id.startsWith('checkpoint-subclass-feature-'))).toBe(true)

    const complete: CharacterDraft = {
      ...draft,
      selections: [
        ...draft.selections,
        { checkpointId: 'subclass-feature-barbarian-totem-warrior-totem-spirit', optionIds: ['totem-bear'], confirmedAt: '' },
      ],
    }
    expect(validateDraft(complete).some((issue) => issue.id.startsWith('checkpoint-subclass-feature-'))).toBe(false)
  })
})

describe('subclass dependency impact', () => {
  it('invalidates subclass checkpoint selections when the subclass changes', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-barbarian',
      selections: [{ checkpointId: 'barbarian-2014-subclass-3', optionIds: ['subclass-2014-barbarian-berserker'], confirmedAt: '' }],
    }
    const impact = getDependencyImpact(draft, { kind: 'subclass', value: 'subclass-2014-barbarian-totem-warrior' })
    expect(impact.invalidated).toContain('barbarian-2014-subclass-3')
  })
})

describe('subclass derived effects hook', () => {
  it('returns zero effects while features remain index-only and does not change derived values', () => {
    expect(getSubclassDerivedEffects('subclass-2014-barbarian-berserker')).toEqual(ZERO_SUBCLASS_EFFECTS)
    expect(getSubclassDerivedEffects(undefined)).toEqual(ZERO_SUBCLASS_EFFECTS)

    const baseDraft = { ...createDraft(), classId: 'class-2014-barbarian' as const }
    const withoutSubclass = deriveCharacter(baseDraft)
    const withSubclass = deriveCharacter({ ...baseDraft, subclassId: 'subclass-2014-barbarian-berserker' })
    expect(withSubclass.armorClass.value).toBe(withoutSubclass.armorClass.value)
    expect(withSubclass.speed.value).toBe(withoutSubclass.speed.value)
    expect(withSubclass.attackBonus.value).toBe(withoutSubclass.attackBonus.value)
    expect(withSubclass.hitPoints.value).toBe(withoutSubclass.hitPoints.value)
  })

  it('applies draconic resilience as armor class base and per-level hit point bonus', () => {
    const baseDraft = {
      ...createDraft(),
      classId: 'class-2014-sorcerer' as const,
      targetLevel: 3,
      baseAbilities: { str: 8, dex: 14, con: 13, int: 12, wis: 10, cha: 15 },
    }
    const without = deriveCharacter(baseDraft)
    const withDraconic = deriveCharacter({ ...baseDraft, subclassId: 'subclass-2014-sorcerer-draconic-bloodline' })
    expect(withDraconic.armorClass.value).toBe(13 + 2)
    expect(withDraconic.hitPoints.value).toBe(without.hitPoints.value + 3)
    expect(withDraconic.speed.value).toBe(without.speed.value)
    const armorSource = withDraconic.armorClass.sources.find((source) => source.id === 'armor-base')
    expect(armorSource?.label).toContain('子职护甲公式')
    expect(armorSource?.detail).toBe('13 + 敏捷调整值')
  })
})
