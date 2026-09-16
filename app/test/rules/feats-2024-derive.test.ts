import { describe, expect, it } from 'vitest'

import { abilityModifier, deriveCharacter, proficiencyBonus } from '@/rules/derive'
import { rulesRepository2024 } from '@/rules/repositories'
import { draft2024, selection } from '../fixtures/draft-2024'

const ASI_ROOT = 'class-2024-fighter-feat-4'
const child = (featId: string, choiceId: string, parent = ASI_ROOT) => `feat-child:${parent}:${featId}:${choiceId}`

describe('2024 专长派生效果', () => {
  it('健壮按角色等级提升最大生命值', () => {
    const base = deriveCharacter(draft2024({ targetLevel: 5 }))
    const withFeat = deriveCharacter(draft2024({
      targetLevel: 5,
      selections: [selection('class-2024-fighter-feat-4', ['feat-2024-tough'])],
    }))
    expect(withFeat.hitPoints.value - base.hitPoints.value).toBe(10)
    expect(withFeat.hitPoints.sources.some((source) => source.label === '专长生命加成')).toBe(true)
  })

  it('飙速跑者提供 +10 尺速度并解释来源', () => {
    const base = deriveCharacter(draft2024({ raceId: 'species-2024-human' }))
    const withFeat = deriveCharacter(draft2024({
      raceId: 'species-2024-human',
      selections: [
        selection(ASI_ROOT, ['feat-2024-speedy']),
        selection(child('feat-2024-speedy', 'ability'), ['feat-bonus-dex-1']),
      ],
    }))
    expect(withFeat.abilities.dex).toBe(15)
    expect(withFeat.speed.value - base.speed.value).toBe(10)
    expect(withFeat.speed.sources.some((source) => source.label === '专长移动加值')).toBe(true)
  })

  it('强健身心提升属性并获得对应豁免熟练', () => {
    const base = deriveCharacter(draft2024())
    const withFeat = deriveCharacter(draft2024({
      selections: [
        selection(ASI_ROOT, ['feat-2024-resilient']),
        selection(child('feat-2024-resilient', 'ability'), ['feat-bonus-wis-1']),
      ],
    }))
    expect(withFeat.abilities.wis).toBe(13)
    expect(withFeat.savingThrows.wis.value).toBe(base.savingThrows.wis.value + proficiencyBonus(4))
    expect(withFeat.savingThrows.wis.sources.some((source) => source.label === '专长豁免熟练')).toBe(true)
  })

  it('固定属性加值通过子选择派生（演员魅力 +1）', () => {
    const draft = deriveCharacter(draft2024({
      selections: [
        selection(ASI_ROOT, ['feat-2024-actor']),
        selection(child('feat-2024-actor', 'ability'), ['feat-bonus-cha-1']),
      ],
    }))
    expect(draft.abilities.cha).toBe(11)
    expect(draft.abilities.str).toBe(15)
  })

  it('2024 属性值提升专长支持单属性 +2 与两项各 +1', () => {
    const single = deriveCharacter(draft2024({
      selections: [
        selection(ASI_ROOT, ['feat-2024-ability-score-improvement']),
        selection(child('feat-2024-ability-score-improvement', 'ability-score'), ['asi-2024-str-2']),
      ],
    }))
    expect(single.abilities.str).toBe(17)
    const split = deriveCharacter(draft2024({
      selections: [
        selection(ASI_ROOT, ['feat-2024-ability-score-improvement']),
        selection(child('feat-2024-ability-score-improvement', 'ability-score'), ['asi-2024-str-dex']),
      ],
    }))
    expect(split.abilities.str).toBe(16)
    expect(split.abilities.dex).toBe(15)
  })

  it('技艺专家提供技能熟练与专精', () => {
    const draft = deriveCharacter(draft2024({
      selections: [
        selection(ASI_ROOT, ['feat-2024-skill-expert']),
        selection(child('feat-2024-skill-expert', 'ability'), ['feat-bonus-int-1']),
        selection(child('feat-2024-skill-expert', 'proficiency'), ['skill-arcana']),
        selection(child('feat-2024-skill-expert', 'expertise'), ['skill-arcana']),
      ],
    }))
    expect(draft.skills['skill-arcana']?.value).toBe(abilityModifier(9) + proficiencyBonus(4) * 2)
    expect(draft.skills['skill-arcana']?.sources.some((source) => source.label === '专精')).toBe(true)
  })

  it('博学多才之恩惠授予全部技能熟练并允许专精', () => {
    const draft = deriveCharacter(draft2024({
      targetLevel: 19,
      selections: [
        selection('class-2024-fighter-feat-19', ['feat-2024-boon-of-skill']),
        selection(child('feat-2024-boon-of-skill', 'ability', 'class-2024-fighter-feat-19'), ['feat-bonus-dex-1']),
        selection(child('feat-2024-boon-of-skill', 'expertise', 'class-2024-fighter-feat-19'), ['skill-stealth']),
      ],
    }))
    expect(draft.skills['skill-history']?.value).toBe(abilityModifier(8) + proficiencyBonus(19))
    expect(draft.skills['skill-stealth']?.value).toBe(abilityModifier(15) + proficiencyBonus(19) * 2)
  })

  it('传奇恩惠允许属性超过 20（上限 30）', () => {
    const base = draft2024({ targetLevel: 19, baseAbilities: { str: 15, dex: 14, con: 20, int: 8, wis: 12, cha: 10 } })
    const withBoon = draft2024({
      targetLevel: 19,
      baseAbilities: { str: 15, dex: 14, con: 20, int: 8, wis: 12, cha: 10 },
      selections: [
        selection('class-2024-fighter-feat-19', ['feat-2024-boon-of-fortitude']),
        selection(child('feat-2024-boon-of-fortitude', 'ability', 'class-2024-fighter-feat-19'), ['feat-bonus-con-1']),
      ],
    })
    const derived = deriveCharacter(withBoon)
    expect(derived.abilities.con).toBe(21)
    expect(derived.hitPoints.value).toBe(deriveCharacter(base).hitPoints.value + 40)
  })

  it('2024 专长仓储与派生不污染 2014 仓库', () => {
    expect(rulesRepository2024.getFeat('feat-2014-alert')).toBeUndefined()
    expect(rulesRepository2024.getClass('class-2014-fighter')).toBeUndefined()
  })
})
