import { describe, expect, it } from 'vitest'

import { getRaceAbilityBonuses } from '@/rules/derive'
import { rulesRepository } from '@/rules/repository'
import type { CharacterDraft } from '@/types/character'

function draft(patch: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    schemaVersion: 3,
    id: 'origin-test',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 1,
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
    currentStep: 'origin',
    ...patch,
  }
}

describe('2014 origins', () => {
  it('registers all extended core races and thirty-five base backgrounds', () => {
    expect(rulesRepository.races.filter((item) => !item.parentRaceId)).toHaveLength(35)
    expect(rulesRepository.races.filter((item) => item.parentRaceId)).toHaveLength(37)
    expect(rulesRepository.backgrounds.filter((item) => !item.parentBackgroundId)).toHaveLength(35)
    expect(rulesRepository.backgrounds.filter((item) => item.parentBackgroundId)).toHaveLength(5)
  })

  it('combines parent and subrace bonuses', () => {
    expect(getRaceAbilityBonuses(draft({
      raceId: 'race-2014-dwarf',
      subraceId: 'race-2014-dwarf-mountain',
    }))).toEqual({ con: 2, str: 2 })
  })

  it('variant human replaces the ordinary human bonuses', () => {
    expect(getRaceAbilityBonuses(draft({
      raceId: 'race-2014-human',
      subraceId: 'race-2014-human-variant',
      raceAbilityChoices: ['str', 'con'],
    }))).toEqual({ str: 1, con: 1 })
  })

  it('fizban dragonborn applies grouped flexible bonuses (+2/+1 in choice order)', () => {
    expect(getRaceAbilityBonuses(draft({
      raceId: 'race-2014-dragonborn-fizban',
      subraceId: 'race-2014-dragonborn-fizban-chromatic',
      raceAbilityChoices: ['str', 'con'],
    }))).toEqual({ str: 2, con: 1 })
  })

  it('fizban dragonborn group order follows the selection order', () => {
    expect(getRaceAbilityBonuses(draft({
      raceId: 'race-2014-dragonborn-fizban',
      subraceId: 'race-2014-dragonborn-fizban-metallic',
      raceAbilityChoices: ['con', 'dex'],
    }))).toEqual({ con: 2, dex: 1 })
  })

  it('shifter subrace supplies the full ability bonuses while the parent adds none', () => {
    expect(getRaceAbilityBonuses(draft({
      raceId: 'race-2014-shifter',
      subraceId: 'race-2014-shifter-beasthide',
    }))).toEqual({ con: 2, str: 1 })
  })

  it('扩展背景数据完整性：ID 唯一、变体引用双向有效、技能已注册、description 非空', () => {
    const backgrounds = rulesRepository.backgrounds
    const ids = backgrounds.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
    const byId = new Map(backgrounds.map((b) => [b.id, b]))
    const optionIds = new Set(rulesRepository.options.map((o) => o.id))
    for (const bg of backgrounds) {
      if (bg.parentBackgroundId) {
        expect(byId.get(bg.parentBackgroundId), `${bg.id} 的父背景应存在`).toBeTruthy()
        expect(byId.get(bg.parentBackgroundId)?.variantIds, `${bg.id} 应在父背景 variantIds 中`).toContain(bg.id)
      }
      for (const variantId of bg.variantIds) {
        expect(byId.get(variantId)?.parentBackgroundId, `${variantId} 应反向指向父背景`).toBe(bg.id)
      }
      for (const skillId of bg.skillIds) {
        expect(optionIds.has(skillId), `${bg.id} 技能 ${skillId} 已注册`).toBe(true)
      }
      for (const toolId of bg.toolIds) {
        expect(toolId, `${bg.id} 工具 ID 格式`).toMatch(/^tool-[a-z-]+$/)
      }
      expect(bg.description.trim(), `${bg.id} 应有展开介绍`).not.toBe('')
    }
  })

  it('tiefling legacy stacks its +1 on top of the parent charisma +2', () => {
    expect(getRaceAbilityBonuses(draft({
      raceId: 'race-2014-tiefling',
      subraceId: 'race-2014-tiefling-legacy-zariel',
    }))).toEqual({ cha: 2, str: 1 })
  })

  it('扩展种族数据完整性：ID 唯一、父子引用双向有效、灵活加值分组互斥', () => {
    const ids = rulesRepository.races.map((race) => race.id)
    expect(new Set(ids).size).toBe(ids.length)
    const byId = new Map(rulesRepository.races.map((race) => [race.id, race]))
    for (const race of rulesRepository.races) {
      if (race.parentRaceId) {
        expect(byId.get(race.parentRaceId), `${race.id} 的父种族应存在`).toBeTruthy()
      }
      for (const subraceId of race.subraceIds) {
        const subrace = byId.get(subraceId)
        expect(subrace, `${race.id} 声明的子种族应存在`).toBeTruthy()
        expect(subrace?.parentRaceId, `${subraceId} 应反向指向父种族`).toBe(race.id)
      }
      expect(race.flexibleBonusGroups && race.flexibleBonusCount, `${race.id} 灵活加值分组与单组互斥`).toBeFalsy()
      for (const group of race.flexibleBonusGroups ?? []) {
        expect(group.count, `${race.id} 分组 count 应为正数`).toBeGreaterThan(0)
      }
    }
  })
})
