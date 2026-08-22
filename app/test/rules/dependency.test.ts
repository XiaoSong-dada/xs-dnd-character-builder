import { describe, expect, it } from 'vitest'

import { getDependencyImpact } from '@/rules/dependency'
import { rulesRepository } from '@/rules/repository'
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
  { checkpointId: 'subclass-feature-fighter-battle-master-combat-superiority', optionIds: ['maneuver-precision', 'maneuver-trip', 'maneuver-rally'], confirmedAt: '' },
  { checkpointId: 'fighter-2014-asi-4', optionIds: ['asi-str-2'], confirmedAt: '' },
]

/** 从规则库取某职业指定环级的法术 ID（测试使用真实注册表数据）。 */
function spellIdsOfClass(classId: string, levels: readonly number[]): readonly string[] {
  const config = rulesRepository.getSpellcastingConfig({ classId, subclassId: undefined })
  return (config?.classSpellIds ?? [])
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is NonNullable<typeof spell> => Boolean(spell && levels.includes(spell.level)))
    .map((spell) => spell.id)
}

/** 4 级术士已完成 1 级技能/子职与 4 级属性提升的全部检查点。 */
const level4SorcererSelections = [
  { checkpointId: 'sorcerer-2014-skills-1', optionIds: ['skill-arcana', 'skill-persuasion'], confirmedAt: '' },
  { checkpointId: 'sorcerer-2014-subclass-1', optionIds: ['subclass-2014-sorcerer-draconic-bloodline'], confirmedAt: '' },
  { checkpointId: 'sorcerer-2014-asi-4', optionIds: ['asi-cha-2'], confirmedAt: '' },
]

function makeSorcererDraft(
  targetLevel: number,
  spellSelections: CharacterDraft['spellSelections'],
  selections: CharacterDraft['selections'] = level4SorcererSelections,
): CharacterDraft {
  return makeFighterDraft({
    id: 'test-sorcerer',
    classId: 'class-2014-sorcerer',
    subclassId: undefined,
    targetLevel,
    baseAbilities: { str: 10, dex: 14, con: 13, int: 8, wis: 12, cha: 15 },
    selections,
    spellSelections,
  })
}

const level1ClericSelections = [
  { checkpointId: 'cleric-2014-skills-1', optionIds: ['skill-insight', 'skill-medicine'], confirmedAt: '' },
  { checkpointId: 'cleric-2014-subclass-1', optionIds: ['subclass-2014-cleric-life'], confirmedAt: '' },
]

function makeClericDraft(spellSelections: CharacterDraft['spellSelections']): CharacterDraft {
  return makeFighterDraft({
    id: 'test-cleric',
    classId: 'class-2014-cleric',
    subclassId: undefined,
    targetLevel: 1,
    baseAbilities: { str: 10, dex: 10, con: 13, int: 8, wis: 15, cha: 12 },
    selections: level1ClericSelections,
    spellSelections,
  })
}

function makeWizardDraft(spellSelections: CharacterDraft['spellSelections']): CharacterDraft {
  return makeFighterDraft({
    id: 'test-wizard',
    classId: 'class-2014-wizard',
    subclassId: undefined,
    targetLevel: 1,
    baseAbilities: { str: 10, dex: 10, con: 13, int: 15, wis: 12, cha: 8 },
    selections: [
      { checkpointId: 'wizard-2014-skills-1', optionIds: ['skill-arcana', 'skill-insight'], confirmedAt: '' },
    ],
    spellSelections,
  })
}

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

  it('战斗大师换子职为勇士时作废旧战技选择', () => {
    const battleMaster = makeFighterDraft({ selections: level5Selections })
    const impact = getDependencyImpact(battleMaster, { kind: 'subclass', value: 'subclass-2014-fighter-champion' })
    expect(impact.invalidated).toContain('fighter-2014-subclass-3')
    expect(impact.invalidated).toContain('subclass-feature-fighter-battle-master-combat-superiority')
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
    expect(impact.spellUpdates).toBeUndefined()
  })

  it('降级时作废超限选择并给出针对性复查项', () => {
    const draft = makeFighterDraft({
      targetLevel: 10,
      selections: [
        ...level5Selections,
        { checkpointId: 'fighter-2014-asi-6', optionIds: ['asi-con-2'], confirmedAt: '' },
        { checkpointId: 'subclass-feature-fighter-battle-master-extra-maneuvers-7', optionIds: ['maneuver-riposte', 'maneuver-menacing'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-8', optionIds: ['asi-dex-2'], confirmedAt: '' },
        { checkpointId: 'subclass-feature-fighter-battle-master-extra-maneuvers-10', optionIds: ['maneuver-pushing', 'maneuver-disarming'], confirmedAt: '' },
      ],
    })
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 7 })
    expect(impact.invalidated).toEqual(['fighter-2014-asi-8', 'subclass-feature-fighter-battle-master-extra-maneuvers-10'])
    expect(impact.invalidatedDetails).toContainEqual({ checkpointId: 'fighter-2014-asi-8', title: '8级 · 属性提升或专长' })
    expect(impact.added).toBeUndefined()
    expect(impact.spellUpdates).toBeUndefined()
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
    expect(impact.spellUpdates).toBeUndefined()
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
        { checkpointId: 'subclass-feature-fighter-battle-master-extra-maneuvers-7', optionIds: ['maneuver-riposte', 'maneuver-menacing'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-8', optionIds: ['asi-dex-2'], confirmedAt: '' },
        { checkpointId: 'subclass-feature-fighter-battle-master-extra-maneuvers-10', optionIds: ['maneuver-pushing', 'maneuver-disarming'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-12', optionIds: ['asi-wis-2'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-14', optionIds: ['asi-cha-2'], confirmedAt: '' },
        { checkpointId: 'subclass-feature-fighter-battle-master-extra-maneuvers-15', optionIds: ['maneuver-goading', 'maneuver-maneuvering'], confirmedAt: '' },
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
        { checkpointId: 'subclass-feature-fighter-battle-master-extra-maneuvers-7', optionIds: ['maneuver-riposte', 'maneuver-menacing'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-8', optionIds: ['asi-dex-2'], confirmedAt: '', invalidatedAt: '2026-08-06T00:00:00.000Z', invalidatedReason: '上次调整' },
        { checkpointId: 'subclass-feature-fighter-battle-master-extra-maneuvers-10', optionIds: ['maneuver-pushing', 'maneuver-disarming'], confirmedAt: '' },
      ],
    })
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 7 })
    expect(impact.invalidated).toEqual(['subclass-feature-fighter-battle-master-extra-maneuvers-10'])
    expect(impact.invalidatedDetails).not.toContainEqual(expect.objectContaining({ checkpointId: 'fighter-2014-asi-8' }))
  })

  it('勇士降级时不出现战技数量复查提示', () => {
    const champion = makeFighterDraft({
      subclassId: 'subclass-2014-fighter-champion',
      targetLevel: 10,
      selections: [
        { checkpointId: 'fighter-2014-skills-1', optionIds: ['skill-acrobatics', 'skill-athletics'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-style-1', optionIds: ['style-dueling'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-subclass-3', optionIds: ['subclass-2014-fighter-champion'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-4', optionIds: ['asi-str-2'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-6', optionIds: ['asi-con-2'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-8', optionIds: ['asi-dex-2'], confirmedAt: '' },
      ],
    })
    const impact = getDependencyImpact(champion, { kind: 'target-level', value: 7 })
    // 降级作废 8 级属性提升属正常行为；关键是不出现战技相关作废与复查。
    expect(impact.invalidated).toEqual(['fighter-2014-asi-8'])
    expect(impact.invalidated.every((id) => !id.includes('maneuver'))).toBe(true)
    expect(impact.reviews?.some((review) => review.includes('战技数量')) ?? false).toBe(false)
  })

  it('术士升级到无新增检查点等级：spellUpdates 列出已知法术与戏法缺口', () => {
    const draft = makeSorcererDraft(4, {
      cantripIds: spellIdsOfClass('class-2014-sorcerer', [0]).slice(0, 4),
      knownSpellIds: spellIdsOfClass('class-2014-sorcerer', [1, 2]).slice(0, 5),
      preparedSpellIds: [],
      spellbookSpellIds: [],
    })
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 5 })
    expect(impact.added).toEqual([])
    expect(impact.spellUpdates).toEqual(['已知法术 5/6', '戏法 4/5'])
  })

  it('术士 5→6 级升级：无新增检查点，spellUpdates 仍提示法术缺口', () => {
    const draft = makeSorcererDraft(5, {
      cantripIds: spellIdsOfClass('class-2014-sorcerer', [0]).slice(0, 4),
      knownSpellIds: spellIdsOfClass('class-2014-sorcerer', [1, 2]).slice(0, 5),
      preparedSpellIds: [],
      spellbookSpellIds: [],
    })
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 6 })
    expect(impact.added).toEqual([])
    expect(impact.spellUpdates).toEqual(['已知法术 5/7', '戏法 4/5'])
  })

  it('术士 3→4 级升级：属性提升检查点与 spellUpdates 并存', () => {
    const draft = makeSorcererDraft(
      3,
      {
        cantripIds: spellIdsOfClass('class-2014-sorcerer', [0]).slice(0, 4),
        knownSpellIds: spellIdsOfClass('class-2014-sorcerer', [1, 2]).slice(0, 4),
        preparedSpellIds: [],
        spellbookSpellIds: [],
      },
      level4SorcererSelections.slice(0, 2),
    )
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 4 })
    expect(impact.added).toContainEqual({ checkpointId: 'sorcerer-2014-asi-4', title: '4级 · 属性提升或专长' })
    expect(impact.spellUpdates).toEqual(['已知法术 4/5', '戏法 4/5'])
  })

  it('牧师（准备施法）升级：spellUpdates 提示准备法术数量', () => {
    const draft = makeClericDraft({
      cantripIds: [],
      knownSpellIds: [],
      preparedSpellIds: spellIdsOfClass('class-2014-cleric', [1]).slice(0, 3),
      spellbookSpellIds: [],
    })
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 2 })
    expect(impact.added).toEqual([])
    expect(impact.spellUpdates).toEqual(['准备法术 3/4'])
  })

  it('法师（法术书）升级：spellUpdates 同时提示准备与法术书缺口', () => {
    const draft = makeWizardDraft({
      cantripIds: spellIdsOfClass('class-2014-wizard', [0]).slice(0, 3),
      knownSpellIds: [],
      preparedSpellIds: spellIdsOfClass('class-2014-wizard', [1]).slice(0, 3),
      spellbookSpellIds: spellIdsOfClass('class-2014-wizard', [1]).slice(0, 6),
    })
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 2 })
    expect(impact.added).toContainEqual({ checkpointId: 'wizard-2014-subclass-2', title: '2级 · 选择奥术传统' })
    expect(impact.spellUpdates).toEqual(['准备法术 3/4', '法术书 6/8'])
  })

  it('升级后法术数量已满足新等级需求时 spellUpdates 为空', () => {
    const draft = makeSorcererDraft(4, {
      cantripIds: spellIdsOfClass('class-2014-sorcerer', [0]).slice(0, 5),
      knownSpellIds: spellIdsOfClass('class-2014-sorcerer', [1, 2]).slice(0, 6),
      preparedSpellIds: [],
      spellbookSpellIds: [],
    })
    const impact = getDependencyImpact(draft, { kind: 'target-level', value: 5 })
    expect(impact.spellUpdates).toBeUndefined()
  })
})
