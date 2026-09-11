import { describe, expect, it } from 'vitest'

import { abilityFromSpeciesSpellAbilityOption } from '@/rules/data/spell-lists-2024'
import { rulesRepository2024 } from '@/rules/repositories'
import { collectSpeciesSpellGrants, getSpeciesSpellAbility } from '@/rules/spellcasting'
import type { RaceRule } from '@/types/rules'

const testElf: RaceRule = {
  id: 'race-test-elf',
  ruleset: '5e-2024',
  name: '测试精灵',
  englishName: 'Elf',
  summary: '测试用物种。',
  description: '测试用物种。',
  subraceIds: [],
  fixedAbilityBonuses: {},
  recommendedClassIds: [],
  status: 'unavailable',
  sourceIds: ['source-2024-phb'],
  spellcastingAbilityChoices: ['int', 'wis', 'cha'],
  spellGrants: [
    { spellId: 'spell-2024-dancing-lights', minimumLevel: 1, alwaysPrepared: true },
    { spellId: 'spell-2024-faerie-fire', minimumLevel: 3, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
    { spellId: 'spell-2024-darkness', minimumLevel: 5, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
  ],
}

describe('物种授予接口（B06 数据接入前）', () => {
  it('物种固定法术按获得等级生效', () => {
    expect(collectSpeciesSpellGrants(testElf, 1).map((grant) => grant.spellId)).toEqual(['spell-2024-dancing-lights'])
    expect(collectSpeciesSpellGrants(testElf, 3).map((grant) => grant.spellId)).toEqual([
      'spell-2024-dancing-lights',
      'spell-2024-faerie-fire',
    ])
    expect(collectSpeciesSpellGrants(testElf, 5)).toHaveLength(3)
    expect(collectSpeciesSpellGrants(undefined, 5)).toEqual([])
  })

  it('物种法术施法属性来自 spell-ability-* 选择，失效选择不生效', () => {
    expect(getSpeciesSpellAbility(testElf, [])).toBeUndefined()
    expect(getSpeciesSpellAbility(testElf, [{
      checkpointId: 'race-test-elf-spellcasting-ability',
      optionIds: ['spell-ability-cha'],
      confirmedAt: '2026-09-11T00:00:00.000Z',
    }])).toBe('cha')
    expect(getSpeciesSpellAbility(testElf, [{
      checkpointId: 'race-test-elf-spellcasting-ability',
      optionIds: ['spell-ability-wis'],
      confirmedAt: '2026-09-11T00:00:00.000Z',
      invalidatedAt: '2026-09-11T01:00:00.000Z',
    }])).toBeUndefined()
  })

  it('物种法术属性选项已注册到 2024 仓库', () => {
    expect(rulesRepository2024.getOption('spell-ability-int')?.name).toBe('智力')
    expect(rulesRepository2024.getOption('spell-ability-wis')?.name).toBe('感知')
    expect(rulesRepository2024.getOption('spell-ability-cha')?.name).toBe('魅力')
    expect(abilityFromSpeciesSpellAbilityOption('spell-ability-cha')).toBe('cha')
    expect(abilityFromSpeciesSpellAbilityOption('feat-bonus-str-1')).toBeUndefined()
  })
})
