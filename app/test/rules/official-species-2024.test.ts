import { describe, expect, it } from 'vitest'
import { rulesRepository2014 } from '@/rules/repository'
import { rulesRepository2024 as repository } from '@/rules/repositories'
import { collectRaceSkillIds, deriveCharacter, getRaceAbilityBonuses } from '@/rules/derive'
import { getEffectiveSpeciesFeatures, getSpeciesChoiceCheckpoints, getSpeciesToolProficiencies, getValidSpeciesChoice } from '@/rules/origins'
import { getAlwaysPreparedSpellIds, getSpeciesCastingMethods, getSpellFreeCastings, getSpeciesSpellcastingProfiles } from '@/rules/spellcasting'
import { applyResourceChange, applyRestRecovery, listSessionResources } from '@/rules/session-resources'
import { createInitialSessionState } from '@/rules/session-state'
import { buildTimeline } from '@/rules/timeline'
import { draft2024, selection } from '../fixtures/draft-2024'
import { officialSpeciesDraft, officialSpeciesIds } from '../fixtures/official-species-2024'

const ids = ['efa-changeling', 'efa-shifter', 'efa-warforged', 'efa-kalashtar', 'efa-khoravar', 'rthw-lupin', 'rthw-dhampir', 'rthw-reborn', 'rthw-hexblood', 'lfl-changeling', 'lfl-rimekin', 'lfl-boggart', 'lfl-faerie', 'lfl-shadowmoor-faerie', 'lfl-flamekin', 'lfl-kithkin', 'lfl-shadowmoor-kithkin', 'lfl-lorwyn-elf-lineage', 'lfl-shadowmoor-elf-lineage']
const base = draft2024({ enabledSourceIds: ['source-2024-efa', 'source-2024-rthw', 'source-2024-lfl'], speciesSizeChoice: 'small' })
const khoravar = 'species-2024-efa-khoravar'
const ability = (id: string) => selection(`${id}-spellcasting-ability`, ['spell-ability-wis'])

describe('N00 / N01 独立版本及逐项验收', () => {
  it.each(officialSpeciesIds)('%s 逐级资源及来源恢复保留选择', (id) => {
    const original = officialSpeciesDraft(id)
    for (let targetLevel = 1; targetLevel <= 20; targetLevel++) {
      const draft = { ...original, targetLevel }
      const resources = listSessionResources(draft).filter((item) => item.id.startsWith(id))
      const proficiency = 2 + Math.floor((targetLevel - 1) / 4)
      for (const resource of resources) expect([1, proficiency]).toContain(resource.max)
      const disabled = { ...draft, enabledSourceIds: [] }
      expect(listSessionResources(disabled).filter((item) => item.id.startsWith(id))).toEqual([])
      expect(disabled.selections).toEqual(draft.selections)
      expect(listSessionResources({ ...disabled, enabledSourceIds: draft.enabledSourceIds }).filter((item) => item.id.startsWith(id))).toEqual(resources)
    }
  })
  it.each(ids)('%s 1—20级引用、来源及属性隔离', (slug) => {
    const id = `species-2024-${slug}`
    const race = repository.getRace(id)
    expect(race).toBeDefined()
    expect(rulesRepository2014.getRace(id)).toBeUndefined()
    if (!race) throw new Error(id)
    for (let targetLevel = 1; targetLevel <= 20; targetLevel++) {
      const draft = { ...base, targetLevel, raceId: race.parentRaceId ?? id, subraceId: race.parentRaceId ? id : undefined }
      expect(getRaceAbilityBonuses(draft)).toEqual({})
      expect(getEffectiveSpeciesFeatures(draft, repository).some((item) => item.raceId === id)).toBe(true)
      expect(getEffectiveSpeciesFeatures({ ...draft, enabledSourceIds: [] }, repository).some((item) => item.raceId === id)).toBe(false)
      for (const grant of race.spellGrants ?? []) expect(repository.getSpell(grant.spellId), grant.spellId).toBeDefined()
    }
  })
})
describe('S08-A / S08-B', () => {
  it('战俑与穿甲、手动盾牌、无甲防御及人工AC修正各加一次', () => {
    const baseDraft = officialSpeciesDraft('species-2024-efa-warforged')
    const armor = { id: 'armor', itemId: 'equipment-2024-leather-armor', quantity: 1, equippedQuantity: 1 }
    const shield = { id: 'shield', itemId: 'equipment-2024-shield', quantity: 1, equippedQuantity: 1 }
    for (const inventory of [[], [armor], [shield], [armor, shield], [{ ...shield, equippedQuantity: 0 }]]) {
      const draft = { ...baseDraft, inventory, manualEdits: { ...baseDraft.manualEdits, derivedAdjustments: { armorClass: 3 } } }
      expect(deriveCharacter(draft).armorClass.value - deriveCharacter({ ...draft, enabledSourceIds: [] }).armorClass.value).toBe(1)
      expect(deriveCharacter(draft).armorClass.value - deriveCharacter({ ...draft, manualEdits: baseDraft.manualEdits }).armorClass.value).toBe(3)
    }
    const monk = { ...baseDraft, classId: 'class-2024-monk' }
    expect(deriveCharacter(monk).armorClass.value - deriveCharacter({ ...monk, enabledSourceIds: [] }).armorClass.value).toBe(1)
    const tools = repository.getRace(baseDraft.raceId ?? '')?.toolProficiencyChoices?.optionIds
    expect(tools).toContain('equipment-2024-lute')
    expect(tools).toContain('equipment-2024-dice')
    expect(tools).not.toContain('equipment-2024-musical-instrument')
    expect(tools).not.toContain('equipment-2024-gaming-set')
  })
  it('化兽必选有效才授予资源，兽皮不常驻AC', () => {
    const id = 'species-2024-efa-shifter'
    const draft = { ...base, raceId: id }
    expect(listSessionResources(draft).filter((item) => item.id.includes(id))).toEqual([])
    const selected = { ...draft, selections: [selection(`${id}-shifting-choice`, [`${id}-beasthide`])] }
    expect(listSessionResources(selected).find((item) => item.id === `${id}-shifting`)?.max).toBe(2)
    expect(deriveCharacter(selected).armorClass.value).toBe(deriveCharacter(draft).armorClass.value)
  })
  it('战俑AC+1有来源，关闭后停止；一工具必选具体候选', () => {
    const id = 'species-2024-efa-warforged'
    const draft = { ...base, raceId: id }
    expect(deriveCharacter(draft).armorClass.value - deriveCharacter({ ...draft, enabledSourceIds: [] }).armorClass.value).toBe(1)
    expect(deriveCharacter(draft).armorClass.sources.filter((item) => item.id === 'species-armor-class')).toHaveLength(1)
    const tool = repository.getRace(id)?.toolProficiencyChoices?.optionIds?.[0]
    if (!tool) throw new Error('Missing tools')
    expect(getSpeciesToolProficiencies({ ...draft, raceToolChoices: [tool] }, repository)).toHaveLength(1)
    expect(getSpeciesToolProficiencies({ ...draft, raceToolChoices: [tool, tool] }, repository)).toEqual([])
    expect(collectRaceSkillIds({ ...base, raceId: 'species-2024-efa-kalashtar' })).toEqual([])
  })
})
describe('S08-C 科拉瓦', () => {
  it('默认交友术与合法替换；非法、失效记录不回退默认', () => {
    const draft = { ...base, raceId: khoravar, selections: [ability(khoravar)] }
    expect(getAlwaysPreparedSpellIds(draft)).toContain('spell-2024-friends')
    const replaced = { ...draft, selections: [...draft.selections, selection(`${khoravar}-cantrip`, ['spell-2024-guidance'])] }
    expect(getAlwaysPreparedSpellIds(replaced)).toContain('spell-2024-guidance')
    expect(getAlwaysPreparedSpellIds(replaced)).not.toContain('spell-2024-friends')
    for (const optionIds of [['spell-2024-fireball'], ['spell-2024-guidance', 'spell-2024-guidance']]) {
      const invalid = { ...draft, selections: [...draft.selections, selection(`${khoravar}-cantrip`, optionIds)] }
      expect(getAlwaysPreparedSpellIds(invalid)).not.toContain('spell-2024-friends')
      expect(getSpeciesCastingMethods(invalid, 'spell-2024-guidance')).toEqual([])
    }
  })
  it('技能与工具互斥，旧值保留不生效；工具中文进入特性', () => {
    const tool = 'equipment-2024-thieves-tools'
    const records = [selection(`${khoravar}-skill-choice`, ['skill-stealth']), selection(`${khoravar}-tool-choice`, [tool])]
    const draft = { ...base, raceId: khoravar, selections: [...records, selection(`${khoravar}-versatility`, [`${khoravar}-tool`])] }
    expect(collectRaceSkillIds(draft)).toEqual([])
    expect(getSpeciesToolProficiencies(draft, repository).map((item) => item.name)).toEqual(['盗贼工具'])
    const skill = { ...draft, selections: [...records, selection(`${khoravar}-versatility`, [`${khoravar}-skill`])] }
    expect(collectRaceSkillIds(skill)).toEqual(['skill-stealth'])
    expect(getSpeciesToolProficiencies(skill, repository)).toEqual([])
  })
  it('特殊恢复不因普通长休回充，仍可手动恢复', () => {
    const draft = { ...base, raceId: khoravar }
    const resource = listSessionResources(draft).find((item) => item.id.endsWith('lethargy-resilience'))
    if (!resource) throw new Error('Missing resource')
    const state = applyResourceChange(createInitialSessionState(draft.id, 10), resource.id, 1, resource.max).state
    expect(applyRestRecovery(state, [resource], 'long-rest').resourceUsage?.[resource.id]).toBe(1)
    expect(applyResourceChange(state, resource.id, -1, resource.max).state.resourceUsage?.[resource.id]).toBe(0)
  })
})
describe('S09 新鸦阁', () => {
  it('半血裔不套简单武器命中或旧祖先遗产，3级蛛行边界', () => {
    const id = 'species-2024-rthw-dhampir'
    expect(repository.getRace(id)?.lineage).toBeUndefined()
    expect(repository.getRace(id)?.skillProficiencyChoices).toBeUndefined()
    expect(getEffectiveSpeciesFeatures({ ...base, raceId: id, targetLevel: 2 }, repository).some((item) => item.id.endsWith('spider-climb'))).toBe(false)
    const bite = getEffectiveSpeciesFeatures({ ...base, raceId: id, targetLevel: 3 }, repository).find((item) => item.id.endsWith('-bite'))
    expect(bite?.naturalAttack).toBeUndefined()
    expect(bite?.description).toContain('不替换命中属性')
  })
  it('复生者抗性必选且无效不生效；嚎叫显示当前体质DC', () => {
    const id = 'species-2024-rthw-reborn'
    const draft = { ...base, raceId: id, selections: [selection(`${id}-resistance`, [`${id}-cold`])] }
    expect(getEffectiveSpeciesFeatures(draft, repository).find((item) => item.id === `${id}-resistance-selected`)?.summary).toBe('寒冷伤害抗性')
    expect(getValidSpeciesChoice({ ...draft, selections: [selection(`${id}-resistance`, ['cold'])] }, repository, `${id}-resistance`)).toBeUndefined()
    const lupin = { ...base, raceId: 'species-2024-rthw-lupin' }
    expect(getEffectiveSpeciesFeatures(lupin, repository, undefined, deriveCharacter(lupin)).find((item) => item.id.endsWith('-howl'))?.summary).toContain('当前DC 11')
  })
})
describe('S10 洛温', () => {
  it.each(['int', 'wis', 'cha'])('施法属性%s独立，职业同名法术不重复且免费次数分开', (key) => {
    const id = 'species-2024-lfl-rimekin'
    const draft = { ...officialSpeciesDraft(id), classId: 'class-2024-druid', selections: [selection(`${id}-spellcasting-ability`, [`spell-ability-${key}`])], spellSelections: { ...base.spellSelections, preparedSpellIds: ['spell-2024-flame-blade'] } }
    expect(getSpeciesSpellcastingProfiles(draft).find((item) => item.sourceId === id)?.ability).toBe(key)
    expect(getAlwaysPreparedSpellIds(draft).filter((spell) => spell === 'spell-2024-flame-blade')).toHaveLength(1)
    expect(getSpellFreeCastings(draft).filter((item) => item.sourceId === id)).toHaveLength(2)
    expect(getSpeciesCastingMethods(draft, 'spell-2024-flame-blade')[0]?.canCastWithSpellSlots).toBe(true)
    const missing = { ...draft, selections: [] }
    expect(getSpellFreeCastings(missing).filter((item) => item.sourceId === id)).toEqual([])
  })
  it('精灵两血系可选，默认戏法继承父项施法属性，来源过滤', () => {
    const parent = 'species-2024-elf'
    const child = 'species-2024-lfl-lorwyn-elf-lineage'
    expect(repository.getRace(parent)?.subraceIds).toContain(child)
    const draft = { ...base, raceId: parent, subraceId: child, selections: [ability(parent)] }
    expect(getAlwaysPreparedSpellIds(draft)).toContain('spell-2024-thorn-whip')
    expect(getSpeciesCastingMethods({ ...draft, targetLevel: 5 }, 'spell-2024-command')[0]?.ability).toBe('wis')
    expect(getSpeciesCastingMethods({ ...draft, targetLevel: 5 }, 'spell-2024-command')[0]?.canCastWithSpellSlots).toBe(true)
    expect(getAlwaysPreparedSpellIds({ ...draft, targetLevel: 5, selections: [] })).not.toContain('spell-2024-command')
    expect(getSpellFreeCastings({ ...draft, targetLevel: 5, selections: [] }).filter((item) => item.sourceId === child)).toEqual([])
    expect(getSpeciesChoiceCheckpoints(draft, repository).find((item) => item.id === `${child}-cantrip`)?.description).toContain('长休')
    expect(buildTimeline('class-2024-fighter', 5, { repository, ruleset: '5e-2024', raceId: parent, subraceId: child, selections: draft.selections, enabledSourceIds: [] }).some((item) => item.id === `${child}-cantrip`)).toBe(false)
  })
  it('霜身每级授予和独立免费次数、寒冷只在种族路径说明', () => {
    const id = 'species-2024-lfl-rimekin'
    for (let targetLevel = 1; targetLevel <= 20; targetLevel++) {
      const draft = { ...base, raceId: id, targetLevel, selections: [ability(id)] }
      expect(getSpellFreeCastings(draft).filter((item) => item.sourceId === id)).toHaveLength(targetLevel >= 5 ? 2 : targetLevel >= 3 ? 1 : 0)
    }
    expect(getSpeciesCastingMethods({ ...base, raceId: id, targetLevel: 5, selections: [ability(id)] }, 'spell-2024-flame-blade')[0]?.note).toContain('寒冷')
    expect(repository.getSpell('spell-2024-flame-blade')?.description).not.toContain('冷火魔法')
    expect(repository.getRace('species-2024-lfl-shadowmoor-kithkin')?.darkvision).toBe(120)
    expect(repository.getRace('species-2024-lfl-shadowmoor-faerie')?.darkvision).toBe(120)
  })
})
