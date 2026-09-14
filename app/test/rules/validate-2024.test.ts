import { describe, expect, it } from 'vitest'

import { buildTimeline } from '@/rules/timeline'
import { validateDraft } from '@/rules/validate'
import { draft2024, emptySpellSelections, selection } from '../fixtures/draft-2024'

function issueIds(draft: Parameters<typeof validateDraft>[0]): readonly string[] {
  return validateDraft(draft).map((issue) => issue.id)
}

describe('2024 专长时间线约束', () => {
  it('战士成长检查点按等级展开四类候选池', () => {
    const timeline = buildTimeline('class-2024-fighter', 19, { ruleset: '5e-2024' })
    const style = timeline.find((checkpoint) => checkpoint.id === 'class-2024-fighter-style-1')
    const levelFour = timeline.find((checkpoint) => checkpoint.id === 'class-2024-fighter-feat-4')
    const levelNineteen = timeline.find((checkpoint) => checkpoint.id === 'class-2024-fighter-feat-19')
    expect(style?.kind).toBe('fighting-style')
    expect(style?.optionIds).toHaveLength(10)
    expect(style?.optionIds).toContain('feat-2024-archery')
    expect(levelFour?.optionIds).toHaveLength(43)
    expect(levelFour?.optionIds).not.toContain('feat-2024-boon-of-fate')
    expect(levelNineteen?.optionIds).toHaveLength(55)
    expect(levelNineteen?.optionIds).toContain('feat-2024-boon-of-fate')
  })

  it('人类授予额外起源专长检查点，法师不出现战斗风格候选', () => {
    const timeline = buildTimeline('class-2024-wizard', 4, { ruleset: '5e-2024', raceId: 'species-2024-human' })
    const speciesFeat = timeline.find((checkpoint) => checkpoint.id === 'species-2024-human-origin-feat')
    expect(speciesFeat?.kind).toBe('feat')
    expect(speciesFeat?.optionIds).toHaveLength(10)
    expect(timeline.some((checkpoint) => checkpoint.kind === 'fighting-style')).toBe(false)
  })
})

describe('2024 专长校验', () => {
  it('前置按获得节点校验：4 级属性不足时，最终属性满足也报错（TC-011）', () => {
    const draft = draft2024({
      targetLevel: 8,
      baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 12 },
      selections: [
        selection('class-2024-fighter-feat-4', ['feat-2024-actor']),
        selection('feat-child:class-2024-fighter-feat-4:feat-2024-actor:ability', ['feat-bonus-cha-1']),
        selection('class-2024-fighter-feat-8', ['feat-2024-ability-score-improvement']),
        selection('feat-child:class-2024-fighter-feat-8:feat-2024-ability-score-improvement:ability-score', ['asi-2024-cha-2']),
      ],
    })
    const issues = validateDraft(draft)
    expect(issues.some((issue) => issue.id.startsWith('feat-prerequisite-class-2024-fighter-feat-4-feat-2024-actor'))).toBe(true)
    expect(issues.some((issue) => issue.resolution.includes('魅力需要达到13'))).toBe(true)
  })

  it('同一不可复选专长跨等级重复取得时报错并说明来源', () => {
    const draft = draft2024({
      targetLevel: 6,
      selections: [
        selection('class-2024-fighter-feat-4', ['feat-2024-tough']),
        selection('class-2024-fighter-feat-6', ['feat-2024-tough']),
      ],
    })
    const issues = validateDraft(draft)
    expect(issues.some((issue) => issue.id === 'feat-duplicate-feat-2024-tough')).toBe(true)
    expect(issues.some((issue) => issue.message.includes('不可复选专长「健壮」被重复取得'))).toBe(true)
  })

  it('背景与人类同授可复选专长时不报重复（魔法学徒按换表处理）', () => {
    const draft = draft2024({
      raceId: 'species-2024-human',
      backgroundId: 'background-2024-sage',
      selections: [selection('species-2024-human-origin-feat', ['feat-2024-magic-initiate'])],
    })
    expect(validateDraft(draft).some((issue) => issue.id.startsWith('feat-duplicate-'))).toBe(false)
  })

  it('法师无法取得战斗风格专长', () => {
    const draft = draft2024({
      classId: 'class-2024-wizard',
      selections: [selection('class-2024-wizard-feat-4', ['feat-2024-archery'])],
    })
    expect(issueIds(draft).some((id) => id.startsWith('feat-prerequisite-class-2024-wizard-feat-4-feat-2024-archery'))).toBe(true)
  })

  it('普通属性提升不能超过 20', () => {
    const draft = draft2024({
      baseAbilities: { str: 19, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
      selections: [
        selection('class-2024-fighter-feat-4', ['feat-2024-ability-score-improvement']),
        selection('feat-child:class-2024-fighter-feat-4:feat-2024-ability-score-improvement:ability-score', ['asi-2024-str-2']),
      ],
    })
    expect(issueIds(draft).some((id) => id.includes('ability-improvement') && id.includes('asi-2024-str-2'))).toBe(true)
  })

  it('强健身心不能选择已有豁免熟练的属性', () => {
    const draft = draft2024({
      selections: [
        selection('class-2024-fighter-feat-4', ['feat-2024-resilient']),
        selection('feat-child:class-2024-fighter-feat-4:feat-2024-resilient:ability', ['feat-bonus-str-1']),
      ],
    })
    expect(issueIds(draft).some((id) => id.startsWith('feat-save-proficiency-'))).toBe(true)
  })

  it('19 级传奇恩惠允许属性超过 20', () => {
    const draft = draft2024({
      targetLevel: 19,
      baseAbilities: { str: 15, dex: 14, con: 20, int: 8, wis: 12, cha: 10 },
      selections: [
        selection('class-2024-fighter-feat-19', ['feat-2024-boon-of-fortitude']),
        selection('feat-child:class-2024-fighter-feat-19:feat-2024-boon-of-fortitude:ability', ['feat-bonus-con-1']),
      ],
    })
    expect(issueIds(draft).some((id) => id.startsWith('feat-ability-cap-'))).toBe(false)
  })
})

const FIGHTER_SKILLS = ['skill-athletics', 'skill-perception'] as const
const CHAMPION_SUBCLASS_FEATURE = 'subclass-feature-fighter-2024-champion-additional-fighting-style'

function fighterBaseSelections(masteryIds: readonly string[]) {
  return [
    selection('class-2024-fighter-skills-1', FIGHTER_SKILLS),
    selection('class-2024-fighter-style-1', ['feat-2024-archery']),
    selection('class-2024-fighter-mastery-1', masteryIds),
  ]
}

describe('2024 战士武器精通与勇士校验（B08-01）', () => {
  it('合法精通选择不报错', () => {
    const draft = draft2024({
      selections: fighterBaseSelections(['equipment-2024-longsword', 'equipment-2024-dagger', 'equipment-2024-mace', 'equipment-2024-battleaxe']),
    })
    const ids = issueIds(draft)
    expect(ids).not.toContain('checkpoint-class-2024-fighter-mastery-1')
    expect(ids.some((id) => id.startsWith('weapon-mastery-'))).toBe(false)
  })

  it('重复武器与非武器候选分别报错', () => {
    const duplicate = draft2024({
      selections: fighterBaseSelections(['equipment-2024-longsword', 'equipment-2024-longsword', 'equipment-2024-mace', 'equipment-2024-battleaxe']),
    })
    expect(validateDraft(duplicate).some((issue) => issue.message === '同一种武器不能重复选择。')).toBe(true)

    const invalid = draft2024({
      selections: fighterBaseSelections(['equipment-2024-wand', 'equipment-2024-dagger', 'equipment-2024-mace', 'equipment-2024-battleaxe']),
    })
    expect(issueIds(invalid)).toContain('checkpoint-candidate-class-2024-fighter-mastery-1-equipment-2024-wand')
  })

  it('精通数量按等级校验（10 级需要 5 种）', () => {
    const four = draft2024({
      targetLevel: 10,
      selections: fighterBaseSelections(['equipment-2024-longsword', 'equipment-2024-dagger', 'equipment-2024-mace', 'equipment-2024-battleaxe']),
    })
    expect(issueIds(four)).toContain('checkpoint-class-2024-fighter-mastery-1')

    const five = draft2024({
      targetLevel: 10,
      selections: fighterBaseSelections(['equipment-2024-longsword', 'equipment-2024-dagger', 'equipment-2024-mace', 'equipment-2024-battleaxe', 'equipment-2024-greataxe']),
    })
    expect(issueIds(five)).not.toContain('checkpoint-class-2024-fighter-mastery-1')
  })

  it('勇士 7 级额外战斗风格不能重复已选风格', () => {
    const draft = draft2024({
      targetLevel: 7,
      subclassId: 'subclass-2024-fighter-champion',
      selections: [
        ...fighterBaseSelections(['equipment-2024-longsword', 'equipment-2024-dagger', 'equipment-2024-mace', 'equipment-2024-battleaxe']),
        selection('class-2024-fighter-subclass-3', ['subclass-2024-fighter-champion']),
        selection('subclass-feature-fighter-2024-champion-additional-fighting-style', ['feat-2024-archery']),
      ],
    })
    expect(issueIds(draft)).toContain('feat-duplicate-feat-2024-archery')
  })

  it('勇士 7 级未完成额外战斗风格时提示补选', () => {
    const draft = draft2024({
      targetLevel: 7,
      subclassId: 'subclass-2024-fighter-champion',
      selections: [
        ...fighterBaseSelections(['equipment-2024-longsword', 'equipment-2024-dagger', 'equipment-2024-mace', 'equipment-2024-battleaxe']),
        selection('class-2024-fighter-subclass-3', ['subclass-2024-fighter-champion']),
      ],
    })
    expect(issueIds(draft)).toContain(`checkpoint-${CHAMPION_SUBCLASS_FEATURE}`)
  })
})

describe('2024 法师学者与法术选择（B08-02）', () => {
  it('学者专精只能选择已熟练的知识技能', () => {
    const unproficient = draft2024({
      classId: 'class-2024-wizard',
      subclassId: 'subclass-2024-wizard-evoker',
      targetLevel: 2,
      selections: [
        selection('class-2024-wizard-skills-1', ['skill-history', 'skill-insight']),
        selection('class-2024-wizard-scholar-2', ['skill-arcana']),
      ],
    })
    expect(issueIds(unproficient)).toContain('expertise-without-proficiency')

    const proficient = draft2024({
      classId: 'class-2024-wizard',
      subclassId: 'subclass-2024-wizard-evoker',
      targetLevel: 2,
      selections: [
        selection('class-2024-wizard-skills-1', ['skill-arcana', 'skill-insight']),
        selection('class-2024-wizard-scholar-2', ['skill-arcana']),
      ],
    })
    expect(issueIds(proficient)).not.toContain('expertise-without-proficiency')
  })

  it('法术精通候选不含反应施法的护盾术', () => {
    const draft = draft2024({
      classId: 'class-2024-wizard',
      subclassId: 'subclass-2024-wizard-evoker',
      targetLevel: 18,
      spellSelections: {
        ...emptySpellSelections(),
        spellbookSpellIds: ['spell-2024-magic-missile', 'spell-2024-shield'],
      },
      selections: [selection('class-2024-wizard-spell-mastery-1', ['spell-2024-shield'])],
    })
    expect(issueIds(draft)).toContain('checkpoint-candidate-class-2024-wizard-spell-mastery-1-spell-2024-shield')
  })

  it('塑能额外入书超出名额或学派不符时报告问题', () => {
    const draft = draft2024({
      classId: 'class-2024-wizard',
      subclassId: 'subclass-2024-wizard-evoker',
      targetLevel: 3,
      spellSelections: {
        ...emptySpellSelections(),
        spellbookSpellIds: ['spell-2024-shield'],
        spellbookExtraSpellIds: ['spell-2024-shield'],
      },
    })
    expect(issueIds(draft)).toContain('spellbook-extra-invalid')
  })
})

describe('2024 野蛮人校验（B08-03）', () => {
  it('原初学识不能与 1 级技能重复', () => {
    const duplicate = draft2024({
      classId: 'class-2024-barbarian',
      targetLevel: 3,
      selections: [
        selection('class-2024-barbarian-skills-1', ['skill-athletics', 'skill-perception']),
        selection('class-2024-barbarian-primal-knowledge-3', ['skill-athletics']),
      ],
    })
    expect(issueIds(duplicate)).toContain('duplicate-option-group-barbarian-skills')

    const distinct = draft2024({
      classId: 'class-2024-barbarian',
      targetLevel: 3,
      selections: [
        selection('class-2024-barbarian-skills-1', ['skill-athletics', 'skill-perception']),
        selection('class-2024-barbarian-primal-knowledge-3', ['skill-survival']),
      ],
    })
    expect(issueIds(distinct)).not.toContain('duplicate-option-group-barbarian-skills')
  })

  it('野蛮人武器精通只允许近战武器，数量按等级校验', () => {
    const ranged = draft2024({
      classId: 'class-2024-barbarian',
      targetLevel: 1,
      selections: [selection('class-2024-barbarian-mastery-1', ['equipment-2024-longbow', 'equipment-2024-dagger'])],
    })
    expect(issueIds(ranged)).toContain('checkpoint-candidate-class-2024-barbarian-mastery-1-equipment-2024-longbow')

    const levelTen = draft2024({
      classId: 'class-2024-barbarian',
      targetLevel: 10,
      selections: [selection('class-2024-barbarian-mastery-1', ['equipment-2024-longsword', 'equipment-2024-dagger', 'equipment-2024-mace'])],
    })
    expect(issueIds(levelTen)).toContain('checkpoint-class-2024-barbarian-mastery-1')

    const levelTenFull = draft2024({
      classId: 'class-2024-barbarian',
      targetLevel: 10,
      selections: [selection('class-2024-barbarian-mastery-1', ['equipment-2024-longsword', 'equipment-2024-dagger', 'equipment-2024-mace', 'equipment-2024-battleaxe'])],
    })
    expect(issueIds(levelTenFull)).not.toContain('checkpoint-class-2024-barbarian-mastery-1')
  })
})

describe('2024 游荡者校验（B08-04）', () => {
  it('专精只能选择已熟练技能，且两次专精不能重复', () => {
    const notProficient = draft2024({
      classId: 'class-2024-rogue',
      targetLevel: 1,
      selections: [
        selection('class-2024-rogue-skills-1', ['skill-athletics', 'skill-deception', 'skill-perception', 'skill-stealth']),
        selection('class-2024-rogue-expertise-1', ['skill-arcana']),
      ],
    })
    expect(issueIds(notProficient)).toContain('expertise-without-proficiency')

    const duplicate = draft2024({
      classId: 'class-2024-rogue',
      targetLevel: 6,
      selections: [
        selection('class-2024-rogue-skills-1', ['skill-athletics', 'skill-deception', 'skill-perception', 'skill-stealth']),
        selection('class-2024-rogue-expertise-1', ['skill-stealth', 'skill-perception']),
        selection('class-2024-rogue-expertise-6', ['skill-stealth', 'skill-deception']),
      ],
    })
    expect(issueIds(duplicate)).toContain('duplicate-expertise')
  })

  it('武器精通只允许熟练武器', () => {
    const draft = draft2024({
      classId: 'class-2024-rogue',
      targetLevel: 1,
      selections: [selection('class-2024-rogue-mastery-1', ['equipment-2024-longsword', 'equipment-2024-dagger'])],
    })
    expect(issueIds(draft)).toContain('checkpoint-candidate-class-2024-rogue-mastery-1-equipment-2024-longsword')
  })
})
