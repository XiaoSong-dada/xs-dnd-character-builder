import { describe, expect, it } from 'vitest'

import { ABILITY_LABELS, formatAbilityModifierLabel } from '@/rules/data/ability-labels'
import { SKILL_IDS } from '@/rules/data/skill-ids'
import { deriveCharacter } from '@/rules/derive'
import { getBackgroundAllocationIssue } from '@/rules/origins'
import { getRulesRepository } from '@/rules/repositories'
import type { CharacterDraft, DerivedCharacter } from '@/types/character'
import { draft2024 } from '../fixtures/draft-2024'

const FORBIDDEN = /(?<![A-Za-z])(STR|DEX|CON|INT|WIS|CHA)(?![A-Za-z])/
const repository2024 = getRulesRepository('5e-2024')

/** 汇总一份派生结果中的全部展示文案（来源标签与明细）。 */
function derivedTexts(derived: DerivedCharacter): readonly string[] {
  const values = [
    derived.armorClass,
    derived.hitPoints,
    derived.initiative,
    derived.speed,
    derived.proficiencyBonus,
    derived.attackBonus,
    derived.attackDamageBonus,
    derived.passivePerception,
    ...Object.values(derived.skills),
    ...Object.values(derived.savingThrows),
    ...(derived.spellAttackBonus ? [derived.spellAttackBonus] : []),
    ...(derived.spellSaveDc ? [derived.spellSaveDc] : []),
  ]
  return values.flatMap((value) => value.sources.flatMap((source) => [source.label, source.detail]))
}

describe('B09-11 属性标签中文化（能力与技能）', () => {
  const fighter = draft2024({
    classId: 'class-2024-fighter',
    raceId: 'species-2024-human',
    backgroundId: 'background-2024-soldier',
    targetLevel: 5,
  })

  it('18 项技能的来源标签使用中文属性调整值', () => {
    const derived = deriveCharacter(fighter)
    const expected = new Set(Object.values(ABILITY_LABELS).map((label) => `${label}调整值`))
    for (const skillId of SKILL_IDS) {
      const labels = derived.skills[skillId]?.sources.map((source) => source.label) ?? []
      expect(labels.some((label) => expected.has(label)), `${skillId} 缺少中文属性调整值标签`).toBe(true)
    }
  })

  it('6 项豁免的来源明细使用中文属性名', () => {
    const derived = deriveCharacter(fighter)
    for (const [key, value] of Object.entries(derived.savingThrows)) {
      const detail = value.sources.find((source) => source.label === '属性调整值')?.detail ?? ''
      expect(detail).toBe(`${ABILITY_LABELS[key as keyof typeof ABILITY_LABELS]} ${derived.abilities[key as keyof typeof ABILITY_LABELS]}`)
    }
  })

  it('武器攻击与法术来源标签为中文（含法术头部口径）', () => {
    expect(formatAbilityModifierLabel('str')).toBe('力量调整值')
    const fighterTexts = derivedTexts(deriveCharacter(fighter))
    expect(fighterTexts).toContain('力量调整值')

    const wizard = draft2024({ classId: 'class-2024-wizard', targetLevel: 5, subclassId: 'subclass-2024-wizard-evoker' })
    const wizardTexts = derivedTexts(deriveCharacter(wizard))
    expect(wizardTexts).toContain('智力调整值')
  })

  it('无甲防御公式使用中文（2024 野蛮人 = 体质）', () => {
    const barbarian = draft2024({ classId: 'class-2024-barbarian', targetLevel: 5, baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 } })
    const detail = deriveCharacter(barbarian).armorClass.sources[0]?.detail ?? ''
    expect(detail).toBe('10 + 敏捷调整值 + 体质调整值')
  })

  it('派生文案与校验提示不含英文属性简写（扫描型断言）', () => {
    const drafts: readonly CharacterDraft[] = [
      fighter,
      draft2024({ classId: 'class-2024-wizard', targetLevel: 5 }),
      draft2024({ classId: 'class-2024-barbarian', targetLevel: 5 }),
      { ...draft2024(), ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5 },
    ]
    for (const draft of drafts) {
      const offenders = derivedTexts(deriveCharacter(draft)).filter((text) => FORBIDDEN.test(text))
      expect(offenders, `${draft.classId} 存在英文属性简写`).toEqual([])
    }
  })

  it('背景属性超上限提示使用中文属性名', () => {
    const exceeded = draft2024({
      backgroundId: 'background-2024-sage',
      baseAbilities: { str: 8, dex: 14, con: 13, int: 20, wis: 12, cha: 10 },
      backgroundAbilityAllocation: { int: 1, con: 2 },
    })
    expect(getBackgroundAllocationIssue(exceeded, repository2024)).toBe('智力加上背景加值后会超过 20。')
  })
})
