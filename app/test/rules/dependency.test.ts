import { describe, expect, it } from 'vitest'

import { getDependencyImpact } from '@/rules/dependency'
import type { CharacterDraft } from '@/types/character'

function makeFighterDraft(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    schemaVersion: 3,
    id: 'test-fighter',
    ruleset: '5e-2014',
    createdAt: '2026-08-06T00:00:00.000Z',
    updatedAt: '2026-08-06T00:00:00.000Z',
    targetLevel: 5,
    abilityMethod: 'standard-array',
    preferences: [],
    classId: 'class-2014-fighter',
    subclassId: 'subclass-2014-fighter-battle-master',
    raceId: 'race-2014-half-orc',
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
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
    name: '',
    alignment: '',
    notes: '',
    currentStep: 'sheet',
    ...overrides,
  }
}

/** 5 级战斗大师战士已完成 1—5 级全部时间线检查点的选择。 */
const level5Selections = [
  { checkpointId: 'fighter-2014-skills-1', optionIds: ['skill-acrobatics', 'skill-athletics'], confirmedAt: '' },
  { checkpointId: 'fighter-2014-style-1', optionIds: ['style-dueling'], confirmedAt: '' },
  { checkpointId: 'fighter-2014-subclass-3', optionIds: ['subclass-2014-fighter-battle-master'], confirmedAt: '' },
  { checkpointId: 'fighter-2014-maneuvers-3', optionIds: ['maneuver-precision', 'maneuver-trip', 'maneuver-rally'], confirmedAt: '' },
  { checkpointId: 'fighter-2014-asi-4', optionIds: ['asi-str-2'], confirmedAt: '' },
]

const draft = {
  classId: 'class-2014-fighter',
  subraceId: 'race-2014-human-variant',
  selections: [
    { checkpointId: 'fighter-2014-asi-8', optionIds: ['asi-str-2'], confirmedAt: '' },
    { checkpointId: 'race-2014-human-variant-feat-1', optionIds: ['feat-alert'], confirmedAt: '' },
  ],
} as CharacterDraft

describe('getDependencyImpact', () => {
  it('keeps but invalidates choices above a lowered target level', () => {
    expect(getDependencyImpact(draft, { kind: 'target-level', value: 4 }).invalidated)
      .toEqual(['fighter-2014-asi-8'])
  })

  it('invalidates the variant-human checkpoint when origin changes', () => {
    expect(getDependencyImpact(draft, { kind: 'subrace', value: undefined }).invalidated)
      .toEqual(['race-2014-human-variant-feat-1'])
  })

  it('invalidates subclass feature selections when the subclass changes', () => {
    const totemDraft = {
      ...draft,
      classId: 'class-2014-barbarian',
      selections: [
        { checkpointId: 'barbarian-2014-subclass-3', optionIds: ['subclass-2014-barbarian-totem-warrior'], confirmedAt: '' },
        { checkpointId: 'subclass-feature-barbarian-totem-warrior-totem-spirit', optionIds: ['totem-bear'], confirmedAt: '' },
      ],
    } as CharacterDraft
    const impact = getDependencyImpact(totemDraft, { kind: 'subclass', value: 'subclass-2014-barbarian-berserker' })
    expect(impact.invalidated).toEqual([
      'barbarian-2014-subclass-3',
      'subclass-feature-barbarian-totem-warrior-totem-spirit',
    ])
  })
})

describe('getDependencyImpact target-level 升级与降级', () => {
  it('升级时列出新增且未完成的检查点，不影响已完成选择', () => {
    const draft = makeFighterDraft({ selections: level5Selections })
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 6 })
    expect(impact.invalidated).toEqual([])
    expect(impact.added).toContainEqual({ checkpointId: 'fighter-2014-asi-6', title: '6级 · 属性提升或专长' })
    expect(impact.added).not.toContainEqual(expect.objectContaining({ checkpointId: 'fighter-2014-asi-4' }))
    expect(impact.invalidatedDetails).toBeUndefined()
    expect(impact.reviews).toBeUndefined()
  })

  it('降级时作废超限选择并给出针对性复查项', () => {
    const draft = makeFighterDraft({
      targetLevel: 10,
      selections: [
        ...level5Selections,
        { checkpointId: 'fighter-2014-asi-6', optionIds: ['asi-con-2'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-maneuvers-7', optionIds: ['maneuver-riposte', 'maneuver-menacing'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-8', optionIds: ['asi-dex-2'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-maneuvers-10', optionIds: ['maneuver-pushing', 'maneuver-disarming'], confirmedAt: '' },
      ],
    })
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 7 })
    expect(impact.invalidated).toEqual(['fighter-2014-asi-8', 'fighter-2014-maneuvers-10'])
    expect(impact.invalidatedDetails).toContainEqual({ checkpointId: 'fighter-2014-asi-8', title: '8级 · 属性提升或专长' })
    expect(impact.added).toBeUndefined()
    expect(impact.reviews).toContain('熟练加值由 +4 变为 +3')
    expect(impact.reviews).toContain('属性提升/专长次数由 3 次减少为 2 次，超出部分的选择将标记失效并需重新分配')
    expect(impact.reviews).toContain('战技数量由 3 项减少为 2 项，需移除多余战技')
    expect(impact.reviews.some((review) => /生命值上限由 \d+ 变为 \d+/.test(review))).toBe(true)
  })

  it('同级修改返回无变化', () => {
    const draft = makeFighterDraft({ selections: level5Selections })
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 5 })
    expect(impact.invalidated).toEqual([])
    expect(impact.added).toBeUndefined()
    expect(impact.invalidatedDetails).toBeUndefined()
    expect(impact.reviews).toBeUndefined()
  })

  it('1/20 级边界：升至 20 级列出全部待补属性提升', () => {
    const draft = makeFighterDraft({ selections: level5Selections })
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 20 })
    expect(impact.invalidated).toEqual([])
    expect(impact.added).toContainEqual({ checkpointId: 'fighter-2014-asi-19', title: '19级 · 属性提升或专长' })
  })

  it('1/20 级边界：从 16 级降至 15 级作废 16 级属性提升', () => {
    const draft = makeFighterDraft({
      targetLevel: 16,
      selections: [
        ...level5Selections,
        { checkpointId: 'fighter-2014-asi-6', optionIds: ['asi-con-2'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-maneuvers-7', optionIds: ['maneuver-riposte', 'maneuver-menacing'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-8', optionIds: ['asi-dex-2'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-maneuvers-10', optionIds: ['maneuver-pushing', 'maneuver-disarming'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-12', optionIds: ['asi-wis-2'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-14', optionIds: ['asi-cha-2'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-maneuvers-15', optionIds: ['maneuver-goading', 'maneuver-maneuvering'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-16', optionIds: ['asi-str-2'], confirmedAt: '' },
      ],
    })
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 15 })
    expect(impact.invalidated).toEqual(['fighter-2014-asi-16'])
    expect(impact.invalidatedDetails).toContainEqual({ checkpointId: 'fighter-2014-asi-16', title: '16级 · 属性提升或专长' })
    expect(impact.reviews?.length ?? 0).toBeGreaterThan(0)
  })

  it('降级时已失效的选择不再重复列入清单', () => {
    const draft = makeFighterDraft({
      targetLevel: 10,
      selections: [
        ...level5Selections,
        { checkpointId: 'fighter-2014-asi-6', optionIds: ['asi-con-2'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-maneuvers-7', optionIds: ['maneuver-riposte', 'maneuver-menacing'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-8', optionIds: ['asi-dex-2'], confirmedAt: '', invalidatedAt: '2026-08-06T00:00:00.000Z', invalidatedReason: '上次调整' },
        { checkpointId: 'fighter-2014-maneuvers-10', optionIds: ['maneuver-pushing', 'maneuver-disarming'], confirmedAt: '' },
      ],
    })
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 7 })
    expect(impact.invalidated).toEqual(['fighter-2014-maneuvers-10'])
    expect(impact.invalidatedDetails).not.toContainEqual(expect.objectContaining({ checkpointId: 'fighter-2014-asi-8' }))
  })
})
