import { describe, expect, it } from 'vitest'
import { deriveCharacter, getRaceAbilityBonuses } from '@/rules/derive'
import { rulesRepository } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { getDefaultEnabledSourceIds } from '@/rules/source-books'
import { buildTimeline } from '@/rules/timeline'
import { validateDraft } from '@/rules/validate'
import { getEffectiveSelectedSpellIds, getEffectiveSpellSlots, getSpeciesSpellcastingProfiles, getSpellFreeCastings } from '@/rules/spellcasting'
import { applyResourceChange, applyRestRecovery, listSessionResources } from '@/rules/session-resources'
import { createInitialSessionState, getAvailableSlotLevels } from '@/rules/session-state'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { getRequiredLanguageCount } from '@/rules/languages'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import { draft2024, selection } from '../fixtures/draft-2024'

const id = 'race-2014-motm-fairy'
const spells = ['spell-2014-druidcraft', 'spell-2014-faerie-fire', 'spell-2014-enlarge-reduce']
const draftFor = (targetLevel = 5) => draft2024({
  ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel, raceId: id,
  backgroundId: 'background-2014-criminal', enabledSourceIds: ['motm-2022-index'],
  raceAbilityChoices: ['str', 'dex'], languages: ['精灵语'],
  selections: [selection(`${id}-spellcasting-ability`, ['spell-ability-wis'])],
})

describe('仙灵正式双来源接入', () => {
  it('主种族为小型而非微型，两种属性方案及语言正确，两来源任一启用且不重复', () => {
    expect(rulesRepository.getRace(id)).toMatchObject({ size: 'small', speed: 30, flySpeed: 30, sourceIds: ['motm-2022-index', 'twbtw-2021-index'] })
    expect(rulesRepository.races.filter((race) => race.englishName === 'Fairy')).toHaveLength(1)
    expect(rulesRepository2024.getRace(id)).toBeUndefined()
    for (const source of ['motm-2022-index', 'twbtw-2021-index']) expect(getDefaultEnabledSourceIds()).toContain(source)
    for (const sources of [['motm-2022-index'], ['twbtw-2021-index'], ['motm-2022-index', 'twbtw-2021-index']]) {
      const draft = { ...draftFor(), enabledSourceIds: sources }
      expect(getRaceAbilityBonuses(draft)).toEqual({ str: 2, dex: 1 })
      expect(getRequiredLanguageCount(draft, rulesRepository)).toBe(1)
      expect(getEffectiveSelectedSpellIds(draft)).toEqual(spells)
      expect(listSessionResources(draft)).toHaveLength(2)
    }
    expect(getRaceAbilityBonuses({ ...draftFor(), raceAbilityBonusOptionId: 'three-one', raceAbilityChoices: ['str', 'dex', 'con'] })).toEqual({ str: 1, dex: 1, con: 1 })
  })

  it('等级边界1/3/5至20授予正确，施法属性任务必选且职业选择不被改写', () => {
    for (const level of [1, 2, 3, 4, 5, 20]) {
      const draft = draftFor(level)
      const count = level >= 5 ? 3 : level >= 3 ? 2 : 1
      expect(getEffectiveSelectedSpellIds(draft)).toEqual(spells.slice(0, count))
      expect(getSpellFreeCastings(draft)).toHaveLength(count - 1)
      expect(draft.spellSelections.preparedSpellIds).toEqual([])
      const model = buildCharacterExportModel(draft, deriveCharacter(draft))
      expect(model.spellcasting?.spells.map((spell) => spell.id)).toEqual(spells.slice(0, count))
      expect(model.features.some((feature) => feature.id === `${id}-faerie-fire`)).toBe(level >= 3)
      expect(model.features.some((feature) => feature.id === `${id}-enlarge-reduce`)).toBe(level >= 5)
    }
    const draft = draftFor()
    expect(buildTimeline(draft.classId ?? '', 5, draft).find((checkpoint) => checkpoint.id === `${id}-spellcasting-ability`)).toMatchObject({ required: true, minSelections: 1, maxSelections: 1 })
    expect(getSpeciesSpellcastingProfiles(draft)).toEqual([expect.objectContaining({ sourceId: id, ability: 'wis', attackBonus: 4, saveDc: 12, spellIds: spells })])
    expect(getSpeciesSpellcastingProfiles({ ...draft, selections: [] })).toEqual([])
    expect(validateDraft({ ...draft, selections: [] })).toContainEqual(expect.objectContaining({ id: `checkpoint-${id}-spellcasting-ability`, severity: 'error' }))
    for (const ability of ['int', 'wis', 'cha']) {
      const selected = { ...draft, selections: [selection(`${id}-spellcasting-ability`, [`spell-ability-${ability}`])] }
      expect(getSpeciesSpellcastingProfiles(selected)[0]?.ability).toBe(ability)
    }
  })

  it('免费次数为每法术一次且独立，短休不恢复，长休分别恢复', () => {
    const resources = listSessionResources(draftFor())
    expect(resources).toEqual([
      expect.objectContaining({ id: `${id}:${spells[1]}`, max: 1, recovery: 'long-rest' }),
      expect.objectContaining({ id: `${id}:${spells[2]}`, max: 1, recovery: 'long-rest' }),
    ])
    const initial = createInitialSessionState('fairy', 30)
    const spent = applyResourceChange(initial, `${id}:${spells[1]}`, 1, 1).state
    expect(spent.resourceUsage?.[`${id}:${spells[2]}`]).toBeUndefined()
    expect(applyRestRecovery(spent, resources, 'short-rest').resourceUsage?.[`${id}:${spells[1]}`]).toBe(1)
    expect(applyRestRecovery(spent, resources, 'long-rest').resourceUsage?.[`${id}:${spells[1]}`]).toBe(0)
    expect(getSpellFreeCastings(draftFor()).every((grant) => grant.count === 1 && grant.ability === 'wis')).toBe(true)
  })

  it('职业法术位可用于对应有环法术，材料条件与飞行护甲限制不被免除', () => {
    const draft = { ...draftFor(), classId: 'class-2014-wizard' }
    const slots = getEffectiveSpellSlots(draft)
    const state = createInitialSessionState('fairy-wizard', 30)
    expect(getAvailableSlotLevels(state, 1, slots)).toEqual([1, 2, 3])
    expect(getAvailableSlotLevels(state, 2, slots)).toEqual([2, 3])
    const features = rulesRepository.getRaceFeatures(id)
    expect(features.find((feature) => feature.id === `${id}-flight`)?.summary).toContain('穿中甲或重甲时不可使用')
    expect(features.find((feature) => feature.id === `${id}-fairy-magic`)?.description).toContain('法术成分不免除')
    for (const itemId of ['leather-armor', 'scale-mail', 'chain-mail']) {
      expect(rulesRepository.getEquipment(itemId)?.category).toBe('armor')
      const armored = { ...draftFor(), inventory: [{ id: 'fairy-armor', itemId, quantity: 1, equippedQuantity: 1, sourceKind: 'adventure' as const }] }
      expect(deriveCharacter(armored).speed.value).toBe(30)
      expect(buildCharacterExportModel(armored, deriveCharacter(armored)).features).toContainEqual(expect.objectContaining({ id: `${id}-flight`, summary: expect.stringContaining('穿中甲或重甲时不可使用') }))
    }
  })

  it('JSON/ZIP保存独立ID与选择，关闭全部来源停用法术资源导出，恢复后不丢选择', async () => {
    const original = draftFor()
    const restored = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(original))
    const bytes = await CharacterPackageService.build(original)
    const zipped = await CharacterPackageService.import(new Blob([bytes as BlobPart]))
    for (const draft of [restored, zipped]) {
      expect(draft.raceId).toBe(id)
      expect(draft.selections).toEqual(original.selections)
      expect(getEffectiveSelectedSpellIds(draft)).toEqual(spells)
      expect(buildCharacterExportModel(draft, deriveCharacter(draft)).spellcasting).toMatchObject({ className: '仙灵', abilityLabel: '感知', attackBonus: 4, saveDc: 12 })
      const disabled = { ...draft, enabledSourceIds: [] }
      expect(getEffectiveSelectedSpellIds(disabled)).toEqual([])
      expect(listSessionResources(disabled)).toEqual([])
      const model = buildCharacterExportModel(disabled, deriveCharacter(disabled))
      expect(model.spellcasting).toBeUndefined()
      expect(model.features.some((feature) => feature.id.startsWith(id))).toBe(false)
      expect(getEffectiveSelectedSpellIds({ ...disabled, enabledSourceIds: ['twbtw-2021-index'] })).toEqual(spells)
    }
  })
})
