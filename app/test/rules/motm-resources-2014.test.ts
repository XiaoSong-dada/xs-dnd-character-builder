import { describe, expect, it } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { rulesRepository } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { applyResourceChange, applyRestRecovery, listSessionResources } from '@/rules/session-resources'
import { createInitialSessionState } from '@/rules/session-state'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { draft2024 } from '../fixtures/draft-2024'

const harengon = 'race-2014-motm-harengon'
const shadar = 'race-2014-motm-shadar-kai'
const draftFor = (raceId: string, targetLevel = 1) => draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel,
  raceId, enabledSourceIds: ['motm-2022-index'], raceAbilityChoices: ['str', 'con'], speciesSizeChoice: 'small', languages: ['精灵语'],
})

describe('MotM兔人、影灵及种族资源', () => {
  it('兔人先攻及两种资源覆盖1到20级熟练边界，人工修正只叠加一次', () => {
    for (let level = 1; level <= 20; level++) {
      const proficiency = 2 + Math.floor((level - 1) / 4)
      const rabbit = draftFor(harengon, level)
      const derived = deriveCharacter(rabbit)
      expect(derived.initiative.value).toBe(derived.modifiers.dex + proficiency)
      expect(derived.initiative.sources).toContainEqual(expect.objectContaining({ label: '种族先攻熟练', value: proficiency }))
      for (const id of [harengon, shadar]) {
        expect(listSessionResources(draftFor(id, level))).toEqual([expect.objectContaining({ max: proficiency, recovery: 'long-rest', dice: false })])
      }
    }
    const draft = draftFor(harengon, 5)
    const edited = { ...draft, manualEdits: { ...draft.manualEdits, derivedAdjustments: { initiative: 1 } } }
    expect(deriveCharacter(edited).initiative.value).toBe(deriveCharacter(draft).initiative.value + 1)
  })

  it('多来源重印任一启用即可生效，两来源同时启用不重复收益', () => {
    const original = draftFor(harengon, 5)
    for (const sources of [['motm-2022-index'], ['twbtw-2021-index'], ['motm-2022-index', 'twbtw-2021-index']]) {
      const draft = { ...original, enabledSourceIds: sources }
      expect(listSessionResources(draft)).toHaveLength(1)
      expect(deriveCharacter(draft).initiative.value).toBe(5)
    }
    const disabled = { ...original, enabledSourceIds: [] }
    expect(listSessionResources(disabled)).toEqual([])
    expect(deriveCharacter(disabled).initiative.value).toBe(2)
    expect(rulesRepository2024.getRace(harengon)).toBeUndefined()
  })

  it('消耗钳制上限，短休不恢复、长休恢复；来源关闭不删除局内用量', () => {
    const draft = draftFor(shadar, 5)
    const resources = listSessionResources(draft)
    const id = `${shadar}-blessing`
    const initial = createInitialSessionState('motm-resources', 30)
    const spent = applyResourceChange(initial, id, 4, 3)
    expect(spent.clamped).toBe(true)
    expect(spent.state.resourceUsage?.[id]).toBe(3)
    expect(applyRestRecovery(spent.state, resources, 'short-rest').resourceUsage?.[id]).toBe(3)
    expect(applyRestRecovery(spent.state, resources, 'long-rest').resourceUsage?.[id]).toBe(0)
    expect(applyRestRecovery(spent.state, listSessionResources({ ...draft, enabledSourceIds: [] }), 'long-rest').resourceUsage?.[id]).toBe(3)
  })

  it('3级抗性摘要按等级开放，临时抗性不进入常驻列表；导出资源一致', () => {
    const first = draftFor(shadar, 1)
    expect(rulesRepository.getRace(shadar)).toMatchObject({ size: 'medium', darkvision: 60, damageResistances: ['暗蚀'] })
    const firstExport = buildCharacterExportModel(first, deriveCharacter(first))
    expect(firstExport.features.some((feature) => feature.id === `${shadar}-blessing-resistance`)).toBe(false)
    const third = draftFor(shadar, 3)
    const model = buildCharacterExportModel(third, deriveCharacter(third))
    expect(model.features).toContainEqual(expect.objectContaining({ id: `${shadar}-blessing-resistance` }))
    expect(model.resources).toContainEqual(expect.objectContaining({ id: `${shadar}-blessing`, max: 2, recovery: 'long-rest' }))
    expect(model.resources.filter((resource) => resource.id.startsWith(shadar))).toHaveLength(1)
    expect(deriveCharacter(first).skills['skill-perception']?.sources.some((source) => source.label === '技能熟练')).toBe(true)
  })
})
