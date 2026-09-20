import { describe, expect, it } from 'vitest'

import { backgrounds2024, races2024 } from '@/rules/data/origins-2024'
import { speciesTraits2024 } from '@/rules/data/species-traits-2024'
import { feats2024 } from '@/rules/data/feats-2024'
import { spells2024 } from '@/rules/data/spells-2024'
import { getBackgroundAbilityBonuses, getBackgroundAllocationIssue, getSpeciesHitPointBonus } from '@/rules/origins'
import { rulesRepository2024 } from '@/rules/repositories'
import { getAlwaysPreparedSpellIds, getSpellFreeCastings } from '@/rules/spellcasting'
import { validateDraft } from '@/rules/validate'
import { deriveCharacter } from '@/rules/derive'
import type { CharacterDraft } from '@/types/character'
import { draft2024, selection } from '../fixtures/draft-2024'

const featIds = new Set(feats2024.map((feat) => feat.id))
const spellIds = new Set(spells2024.map((spell) => spell.id))
const abilityKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const

function issueIds(draft: CharacterDraft): readonly string[] {
  return validateDraft(draft).map((issue) => issue.id)
}

describe('2024 起源目录', () => {
  it('核心背景 16 条齐备、主物种 10 条、血统／传承 8 条', () => {
    // 背景总数随批次增长（G 批次新增 18 条第三方背景），按「核心 16 条齐备」断言。
    const coreBackgrounds = backgrounds2024.filter((background) => background.sourceIds.includes('source-2024-phb'))
    expect(coreBackgrounds).toHaveLength(16)
    expect(backgrounds2024.length).toBeGreaterThanOrEqual(16)
    expect(races2024.filter((race) => !race.parentRaceId)).toHaveLength(10)
    expect(races2024.filter((race) => race.parentRaceId)).toHaveLength(8)
    expect(races2024.every((race) => race.ruleset === '5e-2024')).toBe(true)
    expect(backgrounds2024.every((background) => background.ruleset === '5e-2024')).toBe(true)
    expect(backgrounds2024.every((background) => background.id.startsWith('background-2024-'))).toBe(true)
    expect(races2024.every((race) => race.id.startsWith('species-2024-'))).toBe(true)
  })

  it('背景引用完整：属性候选 3 项、起源专长存在、技能与装备有效', () => {
    for (const background of backgrounds2024) {
      // PHB 2024 核心背景固定为三项属性候选、两项技能与固定起源专长；
      // 第三方背景按原书可有不同结构（如不含属性提升行或技能自选），故只对核心断言。
      const isCore = background.sourceIds.includes('source-2024-phb')
      if (isCore) {
        expect(background.abilityChoices, background.id).toHaveLength(3)
        expect(background.skillIds.length, background.id).toBe(2)
      }
      // 若声明了固定起源专长，必须指向已登记专长（含第三方专长，故按仓库解析）
      if (background.originFeatId) {
        expect(rulesRepository2024.getFeat(background.originFeatId), background.id).toBeDefined()
      }
      expect(background.languageChoices).toBe(0)
      expect(background.startingEquipmentGold).toBe(50)
      // 技能引用必须为合法技能 ID（第三方背景含技能自选，可能为空）
      for (const skillId of background.skillIds) {
        expect(skillId.startsWith('skill-'), background.id).toBe(true)
      }
      // 工具引用必须能在 2024 装备库解析（第三方背景含工具自选，toolIds 可能为空）
      for (const toolId of background.toolIds) {
        expect(rulesRepository2024.getEquipment(toolId), `${background.id}:${toolId}`).toBeDefined()
      }
    }
  })

  it('物种法术授予引用的法术与血统关系有效', () => {
    for (const race of races2024) {
      for (const grant of race.spellGrants ?? []) {
        expect(spellIds.has(grant.spellId)).toBe(true)
        expect(grant.minimumLevel).toBeGreaterThanOrEqual(1)
      }
      if (race.parentRaceId) {
        const parent = races2024.find((item) => item.id === race.parentRaceId)
        expect(parent?.subraceIds).toContain(race.id)
      }
    }
    expect(speciesTraits2024.length).toBeGreaterThan(30)
    expect(speciesTraits2024.every((trait) => races2024.some((race) => race.id === trait.raceId))).toBe(true)
  })

  it('2024 仓库按版本提供起源与特性查询', () => {
    expect(rulesRepository2024.getBackground('background-2024-sage')?.name).toBe('学者')
    expect(rulesRepository2024.getRace('species-2024-elf')?.name).toBe('精灵')
    expect(rulesRepository2024.getRaceFeatures('species-2024-dwarf').length).toBeGreaterThan(0)
    expect(rulesRepository2024.getBackgroundFeatures('background-2024-sage')).toEqual([])
    // 2014 仓库不受影响
    expect(rulesRepository2024.getRace('race-2014-dwarf')).toBeUndefined()
  })
})

describe('2024 背景属性分配', () => {
  it('三候选内 +2/+1 或三项各 +1 合法，并计入派生（TC-008）', () => {
    const split = draft2024({
      backgroundId: 'background-2024-sage',
      backgroundAbilityAllocation: { con: 2, wis: 1 },
    })
    expect(getBackgroundAllocationIssue(split, rulesRepository2024)).toBe('')
    const derived = deriveCharacter(split)
    expect(derived.abilities.con).toBe(15)
    expect(derived.abilities.wis).toBe(13)

    const even = draft2024({
      backgroundId: 'background-2024-sage',
      backgroundAbilityAllocation: { con: 1, int: 1, wis: 1 },
    })
    expect(getBackgroundAllocationIssue(even, rulesRepository2024)).toBe('')
  })

  it('候选外属性、非法组合与超过 20 被拒绝', () => {
    const outside = draft2024({
      backgroundId: 'background-2024-sage',
      backgroundAbilityAllocation: { str: 2, con: 1 },
    })
    expect(getBackgroundAllocationIssue(outside, rulesRepository2024)).toContain('候选之外')
    expect(issueIds(outside)).toContain('background-ability-allocation')

    const invalidPattern = draft2024({
      backgroundId: 'background-2024-sage',
      backgroundAbilityAllocation: { con: 2, int: 2 },
    })
    expect(getBackgroundAllocationIssue(invalidPattern, rulesRepository2024)).toContain('+2')

    const capped = draft2024({
      backgroundId: 'background-2024-sage',
      baseAbilities: { str: 15, dex: 14, con: 20, int: 8, wis: 12, cha: 10 },
      backgroundAbilityAllocation: { con: 2, wis: 1 },
    })
    expect(getBackgroundAllocationIssue(capped, rulesRepository2024)).toContain('20')
  })

  it('2014 草稿不产生背景分配收益', () => {
    const legacy = { ...draft2024(), ruleset: '5e-2014' as const, backgroundAbilityAllocation: { con: 2, wis: 1 } }
    expect(getBackgroundAbilityBonuses(legacy, rulesRepository2024)).toEqual({})
    expect(getBackgroundAllocationIssue(legacy, rulesRepository2024)).toBe('')
  })
})

describe('2024 物种必选项与派生', () => {
  it('可选体型的物种必须选择体型', () => {
    const missing = draft2024({ raceId: 'species-2024-human' })
    expect(issueIds(missing)).toContain('species-size-required')
    const chosen = draft2024({ raceId: 'species-2024-human', speciesSizeChoice: 'small' })
    expect(issueIds(chosen)).not.toContain('species-size-required')
  })

  it('语言必须为通用语之外的标准表 2 种', () => {
    const missing = draft2024({ languages: ['龙语'] })
    expect(issueIds(missing)).toContain('background-languages')
    const invalid = draft2024({ languages: ['龙语', '深渊语'] })
    expect(issueIds(invalid)).toContain('language-invalid')
    const valid = draft2024({ languages: ['龙语', '精灵语'] })
    expect(issueIds(valid)).not.toContain('background-languages')
    expect(issueIds(valid)).not.toContain('language-invalid')
  })

  it('矮人物种提供每级 +1 最大生命值', () => {
    const base = draft2024({ targetLevel: 5 })
    const dwarf = draft2024({ targetLevel: 5, raceId: 'species-2024-dwarf', speciesSizeChoice: undefined })
    expect(getSpeciesHitPointBonus(dwarf, rulesRepository2024)).toBe(5)
    expect(deriveCharacter(dwarf).hitPoints.value).toBe(deriveCharacter(base).hitPoints.value + 5)
    expect(deriveCharacter(dwarf).hitPoints.sources.some((source) => source.label === '物种生命加成')).toBe(true)
  })

  it('精灵血统法术按等级始终准备并带免费次数与施法属性', () => {
    const draft = draft2024({
      targetLevel: 5,
      raceId: 'species-2024-elf',
      subraceId: 'species-2024-elf-drow-lineage',
      selections: [selection('species-2024-elf-spellcasting-ability', ['spell-ability-cha'])],
    })
    const alwaysPrepared = getAlwaysPreparedSpellIds(draft)
    expect(alwaysPrepared).toEqual(expect.arrayContaining([
      'spell-2024-dancing-lights',
      'spell-2024-faerie-fire',
      'spell-2024-darkness',
    ]))
    const free = getSpellFreeCastings(draft)
    expect(free.find((grant) => grant.spellId === 'spell-2024-faerie-fire')).toMatchObject({ count: 1, recovery: 'long-rest', ability: 'cha' })
    expect(free.some((grant) => grant.spellId === 'spell-2024-dancing-lights')).toBe(false)
  })

  it('森林侏儒动物交谈的免费次数随熟练加值', () => {
    const draft = draft2024({
      targetLevel: 5,
      raceId: 'species-2024-gnome',
      subraceId: 'species-2024-gnome-forest-lineage',
      selections: [selection('species-2024-gnome-spellcasting-ability', ['spell-ability-wis'])],
    })
    const free = getSpellFreeCastings(draft)
    expect(free.find((grant) => grant.spellId === 'spell-2024-speak-with-animals')).toMatchObject({ count: 3, ability: 'wis' })
  })

  it('提夫林传承在 3／5 级获得法术，1 级不获得', () => {
    const low = draft2024({
      targetLevel: 1,
      raceId: 'species-2024-tiefling',
      subraceId: 'species-2024-tiefling-infernal-legacy',
      speciesSizeChoice: 'medium',
      selections: [selection('species-2024-tiefling-spellcasting-ability', ['spell-ability-cha'])],
    })
    expect(getAlwaysPreparedSpellIds(low)).toContain('spell-2024-thaumaturgy')
    expect(getAlwaysPreparedSpellIds(low)).not.toContain('spell-2024-hellish-rebuke')
    const high = { ...low, targetLevel: 5 }
    expect(getAlwaysPreparedSpellIds(high)).toEqual(expect.arrayContaining([
      'spell-2024-hellish-rebuke',
      'spell-2024-darkness',
    ]))
  })

  it('未选血统的物种按必选项报错', () => {
    const draft = draft2024({ raceId: 'species-2024-elf' })
    expect(issueIds(draft)).toContain('subrace-required')
  })
})
