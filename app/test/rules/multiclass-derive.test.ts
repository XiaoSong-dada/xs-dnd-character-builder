import { describe, expect, it } from 'vitest'

import { deriveCharacter, deriveCharacterSummary, proficiencyBonus } from '@/rules/derive'
import { getCheckpointSelectionBounds } from '@/rules/feats'
import { hasBuildChoices } from '@/rules/draft-progress'
import { getTotalLevel } from '@/rules/multiclass'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft } from '@/types/character'
import type { ChoiceCheckpoint } from '@/types/rules'

const ABILITIES: AbilityScores = { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 }

function mc(
  classes: readonly { readonly classId: string; readonly level: number }[],
  overrides: Partial<CharacterDraft> = {},
): CharacterDraft {
  const order = classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  return draft2024({
    ruleset: '5e-2014',
    baseAbilities: ABILITIES,
    classId: classes[0]?.classId,
    targetLevel: order.length,
    multiclass: { enabled: true, primaryClassId: classes[0]?.classId ?? '', classes, levelOrder: order },
    ...overrides,
  })
}

describe('MC-B03 派生生命值接入', () => {
  it('单职业 5 级战士的生命值与既有口径一致（11 + 4×7 = 39）', () => {
    const derived = deriveCharacter(draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5, baseAbilities: ABILITIES }))
    expect(derived.hitPoints.value).toBe(39)
  })

  it('兼职逐级累加：战士3/游荡者2（体质13 → +1）为 11 + 7 + 7 + 6 + 6 = 37', () => {
    const derived = deriveCharacter(mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ]))
    expect(derived.hitPoints.value).toBe(37)
  })

  it('起始职业不同会改变生命值：游荡者3/战士2 vs 战士3/游荡者2', () => {
    const fighterFirst = deriveCharacter(mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ]))
    const rogueFirst = deriveCharacter(mc([
      { classId: 'class-2014-rogue', level: 3 },
      { classId: 'class-2014-fighter', level: 2 },
    ]))
    expect(fighterFirst.hitPoints.value).toBe(37)
    // 9 + 6 + 6 + 7 + 7 = 35
    expect(rogueFirst.hitPoints.value).toBe(35)
  })

  it('生命值来源链逐级列出职业与骰面', () => {
    const derived = deriveCharacter(mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ]))
    const detail = derived.hitPoints.sources.map((source) => `${source.label}|${source.detail}`).join('\n')
    expect(detail).toContain('起始职业 1 级生命值')
    expect(detail).toContain('第 5 级生命值')
    expect(detail).toContain('战士')
    expect(detail).toContain('游荡者')
    expect(detail).toContain('d10')
    expect(detail).toContain('d8')
  })
})

describe('MC-B04 熟练加值与总等级口径', () => {
  it('熟练加值按各职业等级之和（战士3/游荡者2 → 5 级 → +3）', () => {
    const derived = deriveCharacter(mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ]))
    expect(derived.proficiencyBonus.value).toBe(proficiencyBonus(5))
    expect(derived.proficiencyBonus.value).toBe(3)
    expect(derived.proficiencyBonus.sources[0]?.detail).toContain('5级角色')
  })

  it('兼职草稿的摘要等级与总等级一致，单职业行为不变', () => {
    const multiclassDraft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    expect(getTotalLevel(multiclassDraft)).toBe(5)
    expect(deriveCharacterSummary(multiclassDraft).level).toBe(5)

    const solo = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 7, baseAbilities: ABILITIES })
    expect(deriveCharacterSummary(solo).level).toBe(7)
    expect(deriveCharacterSummary(solo).className).toContain('战士')
  })

  it('hasBuildChoices 把兼职分配视为构筑选择', () => {
    const base = draft2024({ ruleset: '5e-2014' })
    expect(hasBuildChoices({ ...base, classId: undefined, multiclass: undefined })).toBe(false)
    expect(hasBuildChoices({ ...base, classId: undefined, multiclass: { enabled: false, primaryClassId: 'x', classes: [{ classId: 'x', level: 3 }], levelOrder: ['x', 'x', 'x'] } })).toBe(true)
    // 仅打开开关（无职业）也算已产生选择，避免规则版本被原地切换
    expect(hasBuildChoices({ ...base, classId: undefined, multiclass: { enabled: true, primaryClassId: '', classes: [], levelOrder: [] } })).toBe(true)
  })
})

describe('MC-B02 豁免熟练只来自起始职业', () => {
  it('起始职业战士时只有力量与体质熟练（游荡者的敏捷/智力不生效）', () => {
    const derived = deriveCharacter(mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ]))
    const proficient = (['str', 'dex', 'con', 'int', 'wis', 'cha'] as const)
      .filter((key) => derived.savingThrows[key].sources.some((source) => source.label === '职业豁免熟练'))
    expect(proficient).toEqual(['str', 'con'])
    expect(derived.savingThrows.str.sources.some((source) => source.detail.includes('战士'))).toBe(true)
  })

  it('起始职业游荡者时只有敏捷与智力熟练', () => {
    const derived = deriveCharacter(mc([
      { classId: 'class-2014-rogue', level: 3 },
      { classId: 'class-2014-fighter', level: 2 },
    ]))
    const proficient = (['str', 'dex', 'con', 'int', 'wis', 'cha'] as const)
      .filter((key) => derived.savingThrows[key].sources.some((source) => source.label === '职业豁免熟练'))
    expect(proficient).toEqual(['dex', 'int'])
  })
})

describe('MC-B05 检查点数量按归属职业等级', () => {
  const masteryCheckpoint: ChoiceCheckpoint = {
    id: 'class-2024-fighter-mastery-1',
    classId: 'class-2024-fighter',
    level: 1,
    step: 'timeline',
    kind: 'weapon-mastery',
    title: '选择武器精通',
    description: '',
    required: true,
    minSelections: 3,
    maxSelections: 3,
    optionIds: [],
    selectionCountByLevel: [3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 6],
  }

  it('2024 战士武器精通按战士等级取值（战士 5 级/法师 5 级 → 4 项，而非总等级 10 的 4 项）', () => {
    const draft = draft2024({
      ruleset: '5e-2024',
      baseAbilities: { ...ABILITIES, int: 13 },
      classId: 'class-2024-fighter',
      targetLevel: 10,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2024-fighter',
        classes: [{ classId: 'class-2024-fighter', level: 5 }, { classId: 'class-2024-wizard', level: 5 }],
        levelOrder: [...Array.from({ length: 5 }, () => 'class-2024-fighter'), ...Array.from({ length: 5 }, () => 'class-2024-wizard')],
      },
    })
    // 战士 5 级 → selectionCountByLevel[4] = 4
    expect(getCheckpointSelectionBounds(draft, masteryCheckpoint)).toEqual({ min: 4, max: 4 })
    // 若误按总等级 10 取值，也是 4；用战士 2 级 / 法师 8 级区分：战士 2 级应为 3
    const lowFighter = {
      ...draft,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2024-fighter',
        classes: [{ classId: 'class-2024-fighter', level: 2 }, { classId: 'class-2024-wizard', level: 8 }],
        levelOrder: [...Array.from({ length: 2 }, () => 'class-2024-fighter'), ...Array.from({ length: 8 }, () => 'class-2024-wizard')],
      },
    }
    expect(getCheckpointSelectionBounds(lowFighter, masteryCheckpoint)).toEqual({ min: 3, max: 3 })
    // 16 级战士（总等级 16）→ 5 项
    const highFighter = {
      ...draft,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2024-fighter',
        classes: [{ classId: 'class-2024-fighter', level: 16 }],
        levelOrder: Array.from({ length: 16 }, () => 'class-2024-fighter'),
      },
    }
    expect(getCheckpointSelectionBounds(highFighter, masteryCheckpoint)).toEqual({ min: 5, max: 5 })
  })

  it('未标注 classId 的检查点退回总等级（既有行为不变）', () => {
    const draft = draft2024({ ruleset: '5e-2024', classId: 'class-2024-fighter', targetLevel: 7 })
    const legacy = { ...masteryCheckpoint, classId: undefined }
    expect(getCheckpointSelectionBounds(draft, legacy)).toEqual({ min: 4, max: 4 })
  })

  it('按熟练加值取数量的检查点使用总等级', () => {
    const draft = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 9 })
    const ritual = {
      id: 'feat-2014-ritual-caster-child',
      level: 1,
      step: 'timeline',
      kind: 'feat-feature',
      title: '仪式施法者',
      description: '',
      required: true,
      minSelections: 1,
      maxSelections: 1,
      optionIds: [],
      selectionCountFrom: 'proficiency-bonus',
    } as ChoiceCheckpoint
    expect(getCheckpointSelectionBounds(draft, ritual)).toEqual({ min: 4, max: 4 })
  })
})
