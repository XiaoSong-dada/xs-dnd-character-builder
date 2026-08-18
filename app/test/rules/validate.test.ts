import { describe, expect, it } from 'vitest'

import { buildStartingEquipmentState } from '@/rules/starting-equipment'
import { validateDraft } from '@/rules/validate'
import type { CharacterDraft } from '@/types/character'

function createDraft(): CharacterDraft {
  return {
    schemaVersion: 3,
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
    name: '',
    alignment: '',
    notes: '',
    currentStep: 'validation',
  }
}

describe('validateDraft', () => {
  it('报告缺失职业、起源和姓名', () => {
    const issueIds = validateDraft(createDraft()).map((issue) => issue.id)
    expect(issueIds).toContain('class-required')
    expect(issueIds).toContain('origin-required')
    expect(issueIds).toContain('name-required')
  })

  it('报告职业时间线缺失选择', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-soldier',
      raceId: 'race-2014-human',
      name: '凯恩',
    }
    expect(validateDraft(draft).some((issue) => issue.id === 'checkpoint-fighter-2014-skills-1')).toBe(true)
    expect(validateDraft(draft).some((issue) => issue.id === 'checkpoint-fighter-2014-subclass-3')).toBe(true)
  })

  it('报告费兹本龙裔缺少子种族与自选属性数量不足', () => {
    const withoutSubrace: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-soldier',
      raceId: 'race-2014-dragonborn-fizban',
      name: '凯恩',
      raceAbilityChoices: ['str', 'con'],
    }
    expect(validateDraft(withoutSubrace).some((issue) => issue.id === 'subrace-required')).toBe(true)

    const partialChoices: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-soldier',
      raceId: 'race-2014-dragonborn-fizban',
      subraceId: 'race-2014-dragonborn-fizban-chromatic',
      name: '凯恩',
      raceAbilityChoices: ['str'],
    }
    expect(validateDraft(partialChoices).some((issue) => issue.id === 'race-ability-choice')).toBe(true)
  })

  it('报告超过20的属性提升和不满足前置条件的专长', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      targetLevel: 8,
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-soldier',
      raceId: 'race-2014-human',
      name: '凯恩',
      baseAbilities: { str: 20, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
      selections: [
        { checkpointId: 'fighter-2014-asi-4', optionIds: ['asi-str-2'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-6', optionIds: ['feat-actor'], confirmedAt: '' },
      ],
    }
    const issues = validateDraft(draft)
    expect(issues.some((issue) => issue.id.startsWith('ability-improvement-'))).toBe(true)
    expect(issues.some((issue) => issue.id.startsWith('feat-prerequisite-'))).toBe(true)
  })

  it('27点预算只校验基础值，不计入等级属性提升', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      targetLevel: 4,
      abilityMethod: 'point-buy',
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-soldier',
      raceId: 'race-2014-human',
      name: '凯恩',
      baseAbilities: { str: 18, dex: 16, con: 15, int: 8, wis: 10, cha: 8 },
      selections: [
        { checkpointId: 'fighter-2014-asi-4', optionIds: ['asi-int-2'], confirmedAt: '' },
      ],
    }

    const issues = validateDraft(draft)

    expect(issues.some((issue) => issue.id === 'ability-method-invalid')).toBe(false)
    expect(issues.some((issue) => issue.id.startsWith('ability-improvement-'))).toBe(false)
  })

  it('属性提升超过20时只报告属性提升错误，不误报27点预算', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      targetLevel: 4,
      abilityMethod: 'point-buy',
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-soldier',
      raceId: 'race-2014-human',
      name: '凯恩',
      baseAbilities: { str: 18, dex: 16, con: 15, int: 8, wis: 10, cha: 8 },
      selections: [
        { checkpointId: 'fighter-2014-asi-4', optionIds: ['asi-str-2'], confirmedAt: '' },
      ],
    }

    const issues = validateDraft(draft)

    expect(issues.some((issue) => issue.id === 'ability-method-invalid')).toBe(false)
    expect(issues.some((issue) => issue.id.startsWith('ability-improvement-'))).toBe(true)
  })

  it('吟游诗人专精选择已熟练技能时不报未熟练错误', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      targetLevel: 3,
      classId: 'class-2014-bard',
      backgroundId: 'background-2014-sage',
      raceId: 'race-2014-human',
      name: '诗人',
      spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
      selections: [
        { checkpointId: 'bard-2014-skills-1', optionIds: ['skill-insight', 'skill-history', 'skill-persuasion'], confirmedAt: '' },
        { checkpointId: 'bard-2014-expertise-3', optionIds: ['skill-insight', 'skill-history'], confirmedAt: '' },
      ],
    }

    const issues = validateDraft(draft)

    expect(issues.some((issue) => issue.id === 'expertise-without-proficiency')).toBe(false)
  })

  it('吟游诗人专精选择未熟练技能时报告未熟练错误', () => {
    const draft: CharacterDraft = {
      ...createDraft(),
      targetLevel: 3,
      classId: 'class-2014-bard',
      backgroundId: 'background-2014-sage',
      raceId: 'race-2014-human',
      name: '诗人',
      spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
      selections: [
        { checkpointId: 'bard-2014-skills-1', optionIds: ['skill-insight', 'skill-history', 'skill-persuasion'], confirmedAt: '' },
        { checkpointId: 'bard-2014-expertise-3', optionIds: ['skill-deception', 'skill-history'], confirmedAt: '' },
      ],
    }

    const issues = validateDraft(draft)

    expect(issues.some((issue) => issue.id === 'expertise-without-proficiency')).toBe(true)
  })

  it('冒险净增金币不触发起始装备不同步', () => {
    const base: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-soldier',
      name: '凯恩',
      targetLevel: 1,
      startingEquipmentSelections: [
        { groupId: 'fighter-armor', optionId: 'chain-mail', pickedItemIds: [] },
        { groupId: 'fighter-primary', optionId: 'two-weapons', pickedItemIds: ['longsword', 'longsword'] },
        { groupId: 'fighter-ranged', optionId: 'handaxes', pickedItemIds: [] },
        { groupId: 'fighter-pack', optionId: 'explorer-pack', pickedItemIds: [] },
      ],
    }
    const synced = buildStartingEquipmentState(base, false)
    const draft: CharacterDraft = {
      ...base,
      inventory: synced.inventory,
      currency: synced.currency,
      adventureGold: 42,
    }
    expect(validateDraft(draft).some((issue) => issue.id === 'starting-equipment-out-of-sync')).toBe(false)
  })

  it('冒险来源自定义物品不触发 inventory-invalid，非冒险未知物品仍报错', () => {
    const adventureCustom: CharacterDraft = {
      ...createDraft(),
      inventory: [{
        id: 'adventure:test:custom-potion:1',
        itemId: '自定义药水',
        quantity: 1,
        sourceKind: 'adventure',
        sourceId: 'adventure',
        equippedQuantity: 0,
      }],
    }
    expect(validateDraft(adventureCustom).some((issue) => issue.id === 'inventory-invalid')).toBe(false)

    const classUnknown: CharacterDraft = {
      ...createDraft(),
      inventory: [{
        id: 'class:test:unknown-item:1',
        itemId: '不存在物品',
        quantity: 1,
        sourceKind: 'class',
        sourceId: 'test',
        equippedQuantity: 0,
      }],
    }
    expect(validateDraft(classUnknown).some((issue) => issue.id === 'inventory-invalid')).toBe(true)
  })
})

describe('validateSubclassSelections 子职特性多选校验', () => {
  const battleMasterSelections = (combatSuperiority: readonly string[] = [], extra7: readonly string[] = [], extra10: readonly string[] = []) => [
    { checkpointId: 'fighter-2014-skills-1', optionIds: ['skill-acrobatics', 'skill-athletics'], confirmedAt: '' },
    { checkpointId: 'fighter-2014-style-1', optionIds: ['style-dueling'], confirmedAt: '' },
    { checkpointId: 'fighter-2014-subclass-3', optionIds: ['subclass-2014-fighter-battle-master'], confirmedAt: '' },
    ...(combatSuperiority.length ? [{ checkpointId: 'subclass-feature-fighter-battle-master-combat-superiority', optionIds: combatSuperiority, confirmedAt: '' }] : []),
    ...(extra7.length ? [{ checkpointId: 'subclass-feature-fighter-battle-master-extra-maneuvers-7', optionIds: extra7, confirmedAt: '' }] : []),
    ...(extra10.length ? [{ checkpointId: 'subclass-feature-fighter-battle-master-extra-maneuvers-10', optionIds: extra10, confirmedAt: '' }] : []),
  ]

  function battleMasterDraft(targetLevel: number, selections: CharacterDraft['selections']): CharacterDraft {
    return {
      ...createDraft(),
      targetLevel,
      classId: 'class-2014-fighter',
      subclassId: 'subclass-2014-fighter-battle-master',
      selections,
    }
  }

  function issueIds(draft: CharacterDraft): string[] {
    return validateDraft(draft).map((issue) => issue.id)
  }

  it('选满 3 项战技：无互斥与未完成提示（仅 index-only 提示）', () => {
    const draft = battleMasterDraft(3, battleMasterSelections(['maneuver-precision', 'maneuver-trip', 'maneuver-rally']))
    const ids = issueIds(draft)
    expect(ids.some((id) => id.startsWith('subclass-feature-exclusive-'))).toBe(false)
    expect(ids.some((id) => id.startsWith('subclass-feature-choice-'))).toBe(false)
    expect(ids.some((id) => id.startsWith('checkpoint-subclass-feature-fighter-battle-master-combat-superiority'))).toBe(false)
    // 战技为索引数据，index-only 提示仍存在（不影响生成角色卡）。
    expect(ids.some((id) => id.startsWith('index-only-subclass-feature-fighter-battle-master-combat-superiority'))).toBe(true)
  })

  it('只选 2 项战技：无互斥报错，检查点报未完成', () => {
    const draft = battleMasterDraft(3, battleMasterSelections(['maneuver-precision', 'maneuver-trip']))
    const ids = issueIds(draft)
    expect(ids.some((id) => id.startsWith('subclass-feature-exclusive-'))).toBe(false)
    expect(ids).toContain('checkpoint-subclass-feature-fighter-battle-master-combat-superiority')
  })

  it('选 4 项战技（超选）：报最多只能选择 3 项', () => {
    const draft = battleMasterDraft(3, battleMasterSelections(['maneuver-precision', 'maneuver-trip', 'maneuver-rally', 'maneuver-menacing']))
    const exclusive = validateDraft(draft).find((issue) => issue.id === 'subclass-feature-exclusive-fighter-battle-master-combat-superiority')
    expect(exclusive?.severity).toBe('error')
    expect(exclusive?.message).toContain('最多只能选择 3 项')
  })

  it('单选特性互斥语义保持：图腾之灵选 2 项仍报选项互斥', () => {
    const totemDraft: CharacterDraft = {
      ...createDraft(),
      classId: 'class-2014-barbarian',
      subclassId: 'subclass-2014-barbarian-totem-warrior',
      selections: [
        { checkpointId: 'barbarian-2014-subclass-3', optionIds: ['subclass-2014-barbarian-totem-warrior'], confirmedAt: '' },
        { checkpointId: 'subclass-feature-barbarian-totem-warrior-totem-spirit', optionIds: ['totem-bear', 'totem-eagle'], confirmedAt: '' },
      ],
    }
    const exclusive = validateDraft(totemDraft).find((issue) => issue.id === 'subclass-feature-exclusive-barbarian-totem-warrior-totem-spirit')
    expect(exclusive?.severity).toBe('error')
    expect(exclusive?.message).toContain('选项互斥')
    expect(exclusive?.resolution).toContain('每个特性只能选择其中一项')
  })

  it('3 级战斗大师未选战技：不出现高等级额外战技提示，战斗超驰提示存在', () => {
    const draft = battleMasterDraft(3, battleMasterSelections())
    const ids = issueIds(draft)
    // 7/10/15 级额外战技未解锁，不校验。
    expect(ids.some((id) => id.includes('extra-maneuvers'))).toBe(false)
    expect(ids).toContain('subclass-feature-choice-fighter-battle-master-combat-superiority')
    expect(ids).toContain('checkpoint-subclass-feature-fighter-battle-master-combat-superiority')
  })

  it('10 级完成 3/7 级战技、未完成 10 级：仅 10 级额外战技提示', () => {
    const draft = battleMasterDraft(10, battleMasterSelections(
      ['maneuver-precision', 'maneuver-trip', 'maneuver-rally'],
      ['maneuver-riposte', 'maneuver-menacing'],
    ))
    const ids = issueIds(draft)
    // 排除 index-only 提示（只针对已选选项生成，ID 也含特性名）。
    const relevant = (id: string): boolean => id.startsWith('subclass-feature-') || id.startsWith('checkpoint-subclass-feature-')
    expect(ids.some((id) => relevant(id) && id.includes('combat-superiority'))).toBe(false)
    expect(ids.some((id) => relevant(id) && id.includes('extra-maneuvers-7'))).toBe(false)
    expect(ids).toContain('subclass-feature-choice-fighter-battle-master-extra-maneuvers-10')
    expect(ids).toContain('checkpoint-subclass-feature-fighter-battle-master-extra-maneuvers-10')
  })

  it('10 级全部选满（3/2/2）：无子职特性选择相关报错', () => {
    const draft = battleMasterDraft(10, battleMasterSelections(
      ['maneuver-precision', 'maneuver-trip', 'maneuver-rally'],
      ['maneuver-riposte', 'maneuver-menacing'],
      ['maneuver-pushing', 'maneuver-disarming'],
    ))
    const ids = issueIds(draft)
    expect(ids.some((id) => id.startsWith('subclass-feature-exclusive-'))).toBe(false)
    expect(ids.some((id) => id.startsWith('subclass-feature-choice-'))).toBe(false)
    expect(ids.some((id) => id.startsWith('checkpoint-subclass-feature-fighter-battle-master-'))).toBe(false)
  })
})
