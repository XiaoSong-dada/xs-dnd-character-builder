import { describe, expect, it } from 'vitest'

import { OPEN_RULESETS, isRulesetOpen, rulesRepository2024 } from '@/rules/repositories'
import { rulesRepository as rulesRepository2014 } from '@/rules/repository'
import { getRequiredLanguageCount } from '@/rules/languages'
import { buildTimeline } from '@/rules/timeline'
import { validateDraft } from '@/rules/validate'
import type { CharacterDraft } from '@/types/character'
import { draft2024, emptySpellSelections } from '../fixtures/draft-2024'

/**
 * B08-14 目标矩阵复核表：12 个 2024 基础职业（60 条身份记录 ＝ 12 职业 + 48 子职）。
 * 数据来源：B01《职业-全量》CV-001—CV-060 与各批 B08 更新任务登记结果。
 * 任何一批改动导致等级节点、特性条数或子职集合变化时，本表必须先按 B00／B01 定源更新。
 */
const MATRIX: Readonly<Record<string, {
  readonly features: readonly number[]
  readonly checkpoints: readonly string[]
  readonly subclasses: Readonly<Record<string, readonly number[]>>
}>> = {
  'class-2024-barbarian': {
    features: [1, 1, 1, 2, 2, 3, 3, 5, 5, 7, 7, 9, 11, 13, 15, 17, 18, 19, 20],
    checkpoints: ['1:skills', '1:weapon-mastery', '3:skills', '4:ability-improvement', '8:ability-improvement', '12:ability-improvement', '16:ability-improvement', '19:ability-improvement'],
    subclasses: {
      'subclass-2024-barbarian-path-of-the-berserker': [3, 6, 10, 14],
      'subclass-2024-barbarian-path-of-wild-heart': [3, 3, 6, 10, 14],
      'subclass-2024-barbarian-path-of-the-world-tree': [3, 6, 10, 14],
      'subclass-2024-barbarian-path-of-the-zealot': [3, 3, 6, 10, 14],
    },
  },
  'class-2024-bard': {
    features: [1, 1, 2, 2, 3, 5, 7, 10, 18, 19, 20],
    checkpoints: ['1:skills', '1:class-choice', '2:expertise', '4:ability-improvement', '8:ability-improvement', '12:ability-improvement', '16:ability-improvement', '9:expertise', '19:ability-improvement'],
    subclasses: {
      'subclass-2024-bard-college-of-dance': [3, 6, 6, 14],
      'subclass-2024-bard-college-of-glamour': [3, 3, 6, 14],
      'subclass-2024-bard-college-of-lore': [3, 3, 6, 14],
      'subclass-2024-bard-college-of-valor': [3, 3, 6, 14],
    },
  },
  'class-2024-cleric': {
    features: [1, 1, 2, 3, 5, 7, 10, 14, 19, 20],
    checkpoints: ['1:skills', '1:class-choice', '4:ability-improvement', '8:ability-improvement', '12:ability-improvement', '16:ability-improvement', '7:class-choice', '19:ability-improvement'],
    subclasses: {
      'subclass-2024-cleric-life-domain': [3, 3, 3, 6, 17],
      'subclass-2024-cleric-light-domain': [3, 3, 3, 6, 17],
      'subclass-2024-cleric-war-domain': [3, 3, 3, 6, 17],
      'subclass-2024-cleric-trickery-domain': [3, 3, 3, 6, 17],
    },
  },
  'class-2024-druid': {
    features: [1, 1, 1, 2, 2, 3, 5, 7, 15, 18, 19, 20],
    checkpoints: ['1:skills', '1:class-choice', '4:ability-improvement', '8:ability-improvement', '12:ability-improvement', '16:ability-improvement', '7:class-choice', '19:ability-improvement'],
    subclasses: {
      'subclass-2024-druid-circle-of-the-land': [3, 3, 6, 10, 14],
      'subclass-2024-druid-circle-of-the-stars': [3, 3, 6, 10, 14],
      'subclass-2024-druid-circle-of-the-moon': [3, 3, 6, 10, 14],
      'subclass-2024-druid-circle-of-the-sea': [3, 3, 6, 10, 14],
    },
  },
  'class-2024-fighter': {
    features: [1, 1, 1, 2, 2, 3, 5, 5, 9, 9, 11, 13, 13, 17, 17, 19, 20],
    checkpoints: ['1:skills', '1:fighting-style', '1:weapon-mastery', '4:ability-improvement', '6:ability-improvement', '8:ability-improvement', '12:ability-improvement', '14:ability-improvement', '16:ability-improvement', '19:ability-improvement'],
    subclasses: {
      'subclass-2024-fighter-champion': [3, 3, 7, 10, 15, 18],
      'subclass-2024-fighter-eldritch-knight': [3, 3, 7, 10, 15, 18],
      'subclass-2024-fighter-battle-master': [3, 3, 7, 7, 10, 15, 18],
      'subclass-2024-fighter-psi-warrior': [3, 7, 10, 15, 18],
    },
  },
  'class-2024-monk': {
    features: [1, 1, 2, 2, 2, 3, 3, 4, 5, 5, 6, 7, 9, 10, 10, 13, 14, 15, 18, 19, 20],
    checkpoints: ['1:skills', '1:class-choice', '4:ability-improvement', '8:ability-improvement', '12:ability-improvement', '16:ability-improvement', '19:ability-improvement'],
    subclasses: {
      'subclass-2024-monk-warrior-of-mercy': [3, 3, 3, 6, 11, 17],
      'subclass-2024-monk-warrior-of-the-elements': [3, 3, 6, 11, 17],
      'subclass-2024-monk-warrior-of-the-open-hand': [3, 6, 11, 17],
      'subclass-2024-monk-warrior-of-shadow': [3, 6, 11, 17],
    },
  },
  'class-2024-paladin': {
    features: [1, 1, 1, 2, 2, 3, 3, 5, 5, 6, 9, 10, 11, 14, 18, 19],
    checkpoints: ['1:skills', '1:weapon-mastery', '2:fighting-style', '4:ability-improvement', '8:ability-improvement', '12:ability-improvement', '16:ability-improvement', '19:ability-improvement'],
    subclasses: {
      'subclass-2024-paladin-oath-of-devotion': [3, 3, 7, 15, 20],
      'subclass-2024-paladin-oath-of-glory': [3, 3, 3, 7, 15, 20],
      'subclass-2024-paladin-oath-of-the-ancients': [3, 3, 7, 15, 20],
      'subclass-2024-paladin-oath-of-vengeance': [3, 3, 7, 15, 20],
    },
  },
  'class-2024-ranger': {
    features: [1, 1, 1, 2, 2, 3, 5, 6, 9, 10, 13, 14, 17, 18, 19, 20],
    checkpoints: ['1:skills', '1:weapon-mastery', '2:expertise', '2:fighting-style', '4:ability-improvement', '8:ability-improvement', '12:ability-improvement', '16:ability-improvement', '9:expertise', '19:ability-improvement'],
    subclasses: {
      'subclass-2024-ranger-beast-master': [3, 7, 11, 15],
      'subclass-2024-ranger-fey-wanderer': [3, 3, 3, 7, 11, 15],
      'subclass-2024-ranger-gloom-stalker': [3, 3, 3, 7, 11, 15],
      'subclass-2024-ranger-hunter': [3, 3, 7, 11, 15],
    },
  },
  'class-2024-rogue': {
    features: [1, 1, 1, 1, 2, 3, 3, 5, 5, 7, 7, 11, 14, 15, 18, 19, 20],
    checkpoints: ['1:skills', '1:expertise', '1:weapon-mastery', '4:ability-improvement', '8:ability-improvement', '10:ability-improvement', '12:ability-improvement', '16:ability-improvement', '6:expertise', '19:ability-improvement'],
    subclasses: {
      'subclass-2024-rogue-assassin': [3, 3, 9, 13, 17],
      'subclass-2024-rogue-thief': [3, 3, 9, 13, 17],
      'subclass-2024-rogue-arcane-trickster': [3, 3, 9, 13, 17],
      'subclass-2024-rogue-soulknife': [3, 3, 9, 13, 17],
    },
  },
  'class-2024-sorcerer': {
    features: [1, 1, 2, 2, 3, 5, 7, 19, 20],
    checkpoints: ['1:skills', '2:class-choice', '4:ability-improvement', '8:ability-improvement', '12:ability-improvement', '16:ability-improvement', '10:class-choice', '17:class-choice', '19:ability-improvement'],
    subclasses: {
      'subclass-2024-sorcerer-aberrant-sorcery': [3, 3, 6, 6, 14, 18],
      'subclass-2024-sorcerer-clockwork-sorcery': [3, 3, 6, 14, 18],
      'subclass-2024-sorcerer-draconic-sorcery': [3, 3, 6, 14, 18],
      'subclass-2024-sorcerer-wild-magic-sorcery': [3, 3, 6, 14, 18],
    },
  },
  'class-2024-warlock': {
    features: [1, 1, 2, 3, 9, 11, 19, 20],
    checkpoints: ['1:skills', '1:class-choice', '2:class-choice', '5:class-choice', '7:class-choice', '9:class-choice', '12:class-choice', '15:class-choice', '18:class-choice', '4:ability-improvement', '8:ability-improvement', '12:ability-improvement', '16:ability-improvement', '11:class-choice', '13:class-choice', '15:class-choice', '17:class-choice', '19:ability-improvement'],
    subclasses: {
      'subclass-2024-warlock-archfey-patron': [3, 3, 6, 10, 14],
      'subclass-2024-warlock-celestial-patron': [3, 3, 6, 10, 14],
      'subclass-2024-warlock-fiend-patron': [3, 3, 6, 10, 14],
      'subclass-2024-warlock-great-old-one-patron': [3, 3, 3, 6, 10, 10, 14],
    },
  },
  'class-2024-wizard': {
    features: [1, 1, 1, 2, 3, 5, 18, 19, 20],
    checkpoints: ['1:skills', '4:ability-improvement', '8:ability-improvement', '12:ability-improvement', '16:ability-improvement', '2:expertise', '18:class-choice', '18:class-choice', '19:ability-improvement', '20:class-choice'],
    subclasses: {
      'subclass-2024-wizard-evoker': [3, 3, 6, 10, 14],
      'subclass-2024-wizard-illusionist': [3, 3, 6, 10, 14],
      'subclass-2024-wizard-abjurer': [3, 3, 6, 10, 14],
      'subclass-2024-wizard-diviner': [3, 3, 6, 10, 14],
    },
  },
}

describe('B08-14 2024 目标矩阵复核', () => {
  it('12 个基础职业、48 个子职与 60 条身份记录全部闭合', () => {
    const classIds = rulesRepository2024.classes.map((classRule) => classRule.id)
    expect(classIds).toEqual(Object.keys(MATRIX))
    expect(classIds).toHaveLength(12)
    const subclassIds = rulesRepository2024.subclasses.map((subclass) => subclass.id)
    expect(subclassIds).toHaveLength(48)
    expect(new Set(subclassIds).size).toBe(48)
    for (const classRule of rulesRepository2024.classes) {
      const expected = MATRIX[classRule.id]
      if (!expected) throw new Error(`矩阵缺少职业 ${classRule.id}`)
      expect(classRule.ruleset).toBe('5e-2024')
      expect(classRule.status).toBe('implemented')
      expect((classRule.features ?? []).map((feature) => feature.level)).toEqual(expected.features)
      expect(classRule.checkpoints.map((checkpoint) => `${checkpoint.level}:${checkpoint.kind}`)).toEqual(expected.checkpoints)
      const subclassIdsOfClass = rulesRepository2024.subclasses.filter((subclass) => subclass.classId === classRule.id)
      expect(subclassIdsOfClass.map((subclass) => subclass.id)).toEqual(Object.keys(expected.subclasses))
      for (const subclass of subclassIdsOfClass) {
        expect(subclass.ruleset).toBe('5e-2024')
        expect(subclass.status).toBe('implemented')
        expect(subclass.availability).toBe('player')
        expect(subclass.selectionLevel).toBe(3)
        expect((subclass.features ?? []).map((feature) => feature.level)).toEqual(expected.subclasses[subclass.id])
        expect((subclass.features ?? []).length).toBeGreaterThan(0)
      }
    }
  })

  it('等级节点单调不降、20 级覆盖与属性提升节点符合 2024 口径', () => {
    for (const classRule of rulesRepository2024.classes) {
      const featureLevels = (classRule.features ?? []).map((feature) => feature.level)
      expect(featureLevels).toEqual([...featureLevels].sort((left, right) => left - right))
      for (const level of [4, 8, 12, 16, 19]) {
        expect(classRule.checkpoints.some((checkpoint) => checkpoint.level === level && checkpoint.kind === 'ability-improvement')).toBe(true)
      }
      expect(classRule.checkpoints.some((checkpoint) => checkpoint.level === 19 && checkpoint.kind === 'ability-improvement')).toBe(true)
      expect(classRule.hitDie).toBeGreaterThan(0)
      expect(classRule.savingThrowAbilities).toHaveLength(2)
    }
  })

  it('全部检查点候选（含子职）可在仓库解析，未完成项不进入候选', () => {
    for (const classRule of rulesRepository2024.classes) {
      const subclassIds = rulesRepository2024.subclasses.filter((subclass) => subclass.classId === classRule.id).map((subclass) => subclass.id)
      for (const subclassId of [undefined, ...subclassIds]) {
        const timeline = buildTimeline(classRule.id, 20, { ruleset: '5e-2024', subclassId })
        for (const checkpoint of timeline) {
          for (const optionId of checkpoint.optionIds) {
            const resolved = rulesRepository2024.getOption(optionId) ?? rulesRepository2024.getFeat(optionId)
            expect(resolved, `${checkpoint.id} 的候选 ${optionId} 未登记`).toBeDefined()
            expect(resolved?.status).not.toBe('index-only')
          }
        }
      }
    }
  })

  it('2024 入口已开放，未按版本仍被拒绝（B09-01）', () => {
    expect([...OPEN_RULESETS]).toEqual(['5e-2014', '5e-2024'])
    expect(isRulesetOpen('5e-2024')).toBe(true)
    expect(isRulesetOpen('5e-2014')).toBe(true)
    expect(isRulesetOpen('5e-2099')).toBe(false)
    expect(isRulesetOpen(undefined)).toBe(false)
  })

  it('盗贼黑话额外语言进入语言选择与校验（2014 不受影响）', () => {
    expect(getRequiredLanguageCount({ ruleset: '5e-2024', classId: 'class-2024-rogue', targetLevel: 5 }, rulesRepository2024)).toBe(3)
    expect(getRequiredLanguageCount({ ruleset: '5e-2024', classId: 'class-2024-rogue', targetLevel: 1 }, rulesRepository2024)).toBe(3)
    expect(getRequiredLanguageCount({ ruleset: '5e-2024', classId: 'class-2024-wizard', targetLevel: 5 }, rulesRepository2024)).toBe(2)
    expect(getRequiredLanguageCount({ ruleset: '5e-2024' }, rulesRepository2024)).toBe(2)
    const legacyRepository = rulesRepository2014
    expect(getRequiredLanguageCount({ ruleset: '5e-2014', classId: 'class-2014-rogue', targetLevel: 5, backgroundId: 'background-2014-acolyte' }, legacyRepository)).toBe(2)
    expect(getRequiredLanguageCount({ ruleset: '5e-2014', backgroundId: 'background-2014-criminal' }, legacyRepository)).toBe(0)

    const missing = validateDraft(draft2024({ classId: 'class-2024-rogue', targetLevel: 5, languages: [] }))
    expect(missing.some((issue) => issue.id === 'background-languages' && issue.resolution.includes('3'))).toBe(true)
    const complete = validateDraft(draft2024({ classId: 'class-2024-rogue', targetLevel: 5, languages: ['精灵语', '龙语', '地精语'] }))
    expect(complete.some((issue) => issue.id === 'background-languages')).toBe(false)
  })

  it('诡术师缺少法师之手时给出提示级问题而非硬阻断', () => {
    const trickster = (cantripIds: readonly string[]): CharacterDraft => draft2024({
      classId: 'class-2024-rogue',
      subclassId: 'subclass-2024-rogue-arcane-trickster',
      targetLevel: 3,
      spellSelections: { ...emptySpellSelections(), cantripIds, preparedSpellIds: [] },
    })
    const missingMageHand = validateDraft(trickster(['spell-2024-fire-bolt', 'spell-2024-light', 'spell-2024-minor-illusion']))
    const issue = missingMageHand.find((item) => item.id === 'required-cantrip-missing')
    expect(issue?.severity).toBe('warning')
    expect(issue?.message).toContain('法师之手')
    const withMageHand = validateDraft(trickster(['spell-2024-mage-hand', 'spell-2024-light', 'spell-2024-minor-illusion']))
    expect(withMageHand.some((item) => item.id === 'required-cantrip-missing')).toBe(false)

    const legacyDraft: CharacterDraft = {
      ...draft2024({
        classId: 'class-2014-rogue',
        subclassId: 'subclass-2014-rogue-arcane-trickster',
        targetLevel: 3,
        spellSelections: { ...emptySpellSelections(), cantripIds: ['spell-2014-fire-bolt', 'spell-2014-light'] },
      }),
      ruleset: '5e-2014',
    }
    const legacyMissing = validateDraft(legacyDraft)
    expect(legacyMissing.find((item) => item.id === 'required-cantrip-missing')?.severity).toBe('warning')
    const legacyComplete = validateDraft({
      ...legacyDraft,
      spellSelections: { ...legacyDraft.spellSelections, cantripIds: ['spell-2014-mage-hand', 'spell-2014-light'] },
    })
    expect(legacyComplete.some((item) => item.id === 'required-cantrip-missing')).toBe(false)
  })
})
