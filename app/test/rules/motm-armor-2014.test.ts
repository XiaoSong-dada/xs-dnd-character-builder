import { describe, expect, it } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { getEquipmentWarnings } from '@/rules/equipment-state'
import { rulesRepository } from '@/rules/repository'
import { getEffectiveSpeciesFeatures } from '@/rules/origins'
import { draft2024, selection } from '../fixtures/draft-2024'

const equipped = (itemId: string) => ({ id: `entry-${itemId}`, itemId, quantity: 1, equippedQuantity: 1, sourceKind: 'adventure' as const, sourceId: 'motm-armor-test' })
const draftFor = (slug: string) => draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', raceId: `race-2014-motm-${slug}`, enabledSourceIds: ['motm-2022-index'], raceAbilityChoices: ['str', 'con'] })
describe('MotM B5 天生护甲与盾牌', () => {
  it('蜥蜴人13加敏捷，比较护甲与风格后只取一种公式，盾牌和人工修正只加一次', () => {
    const draft = draftFor('lizardfolk')
    expect(deriveCharacter(draft).armorClass.value).toBe(15)
    expect(deriveCharacter({ ...draft, inventory: [equipped('leather-armor')] }).armorClass.value).toBe(15)
    expect(deriveCharacter({ ...draft, inventory: [equipped('chain-mail')] }).armorClass.value).toBe(16)
    const shielded = { ...draft, inventory: [equipped('shield')], manualEdits: { ...draft.manualEdits, derivedAdjustments: { armorClass: 1 } } }
    expect(deriveCharacter(shielded).armorClass.value).toBe(18)
    const styled = { ...draft, inventory: [equipped('chain-mail'), equipped('shield')], selections: [selection('fighter-fighting-style-1', ['style-defense'])] }
    expect(deriveCharacter(styled).armorClass.value).toBe(19)
    expect(deriveCharacter({ ...shielded, inventory: [] }).armorClass.value).toBe(16)
    const leatherStyled = { ...draft, inventory: [equipped('leather-armor')], selections: [selection('fighter-fighting-style-1', ['style-defense'])] }
    expect(deriveCharacter(leatherStyled).armorClass.value).toBe(16)
    expect(deriveCharacter(leatherStyled).armorClass.sources.find((item) => item.id === 'armor-base')?.label).toContain('天生护甲')
  })
  it('龟人固定17不加敏捷，非法穿甲不授予护甲或风格，装备保留且警告', () => {
    const draft = draftFor('tortle')
    for (const dex of [3, 10, 20]) expect(deriveCharacter({ ...draft, baseAbilities: { ...draft.baseAbilities, dex } }).armorClass.value).toBe(17)
    const armored = { ...draft, inventory: [equipped('chain-mail'), equipped('shield')], selections: [selection('fighter-fighting-style-1', ['style-defense'])] }
    expect(deriveCharacter(armored).armorClass.value).toBe(19)
    expect(getEquipmentWarnings(armored)).toContainEqual(expect.objectContaining({ id: 'species-armor-forbidden', severity: 'warning' }))
    expect(armored.inventory).toHaveLength(2)
    expect(getEquipmentWarnings({ ...armored, enabledSourceIds: [] }).some((issue) => issue.id === 'species-armor-forbidden')).toBe(false)
  })
  it('无甲防御合法时与自然护甲比较，武僧持盾时其公式停用', () => {
    const base = { ...draftFor('tortle'), baseAbilities: { str: 10, dex: 18, con: 18, int: 10, wis: 18, cha: 10 } }
    for (const classId of ['class-2014-barbarian', 'class-2014-monk']) expect(deriveCharacter({ ...base, classId }).armorClass.value).toBe(18)
    expect(deriveCharacter({ ...base, classId: 'class-2014-barbarian', inventory: [equipped('shield')] }).armorClass.value).toBe(20)
    expect(deriveCharacter({ ...base, classId: 'class-2014-monk', inventory: [equipped('shield')] }).armorClass.value).toBe(19)
    expect(deriveCharacter({ ...draftFor('lizardfolk'), classId: 'class-2014-monk', baseAbilities: base.baseAbilities }).armorClass.value).toBe(18)
  })
  it('龟壳临时+4只展示，不创造有限次数或常驻AC', () => {
    const draft = draftFor('tortle')
    const feature = getEffectiveSpeciesFeatures(draft, rulesRepository).find((item) => item.id.endsWith('shell-defense'))
    expect(feature?.resource).toBeUndefined()
    expect(feature?.summary).toContain('临时AC+4')
    expect(deriveCharacter(draft).armorClass.value).toBe(17)
  })
  it('1—20级护甲灌注与手动盾牌不重复叠加，龟人非法护甲灌注不生效', () => {
    for (let level = 2; level <= 20; level++) {
      const base = { ...draftFor('lizardfolk'), classId: 'class-2014-artificer', targetLevel: level, enabledSourceIds: ['motm-2022-index', 'tcoe-2020-index'], inventory: [equipped('leather-armor'), equipped('shield')], selections: [selection('artificer-2014-infusions-2', ['infusion-2014-enhanced-defense'])], infusionAssignments: [{ infusionId: 'infusion-2014-enhanced-defense', inventoryEntryId: 'entry-leather-armor' }] }
      const bonus = level >= 10 ? 2 : 1
      expect(deriveCharacter(base).armorClass.value).toBe(17 + bonus)
      expect(deriveCharacter({ ...base, raceId: 'race-2014-motm-tortle' }).armorClass.value).toBe(19)
      const shieldInfused = { ...base, infusionAssignments: [{ infusionId: 'infusion-2014-enhanced-defense', inventoryEntryId: 'entry-shield' }] }
      expect(deriveCharacter({ ...shieldInfused, raceId: 'race-2014-motm-tortle' }).armorClass.value).toBe(19 + bonus)
    }
  })
  it('魔法护甲合法公式与天生护甲比较，魔法盾牌和人工修正只加一次', () => {
    const armor = rulesRepository.equipment.find((item) => item.category === 'armor' && item.id.includes('+1') && !item.addsDexterityToArmor)
    const shield = rulesRepository.getEquipment('shield-+1')
    if (!armor || !shield) throw new Error('Missing magic armor or shield')
    const draft = { ...draftFor('lizardfolk'), enabledSourceIds: ['motm-2022-index', ...armor.sourceIds, ...shield.sourceIds], inventory: [equipped(armor.id), equipped(shield.id)], manualEdits: { ...draftFor('lizardfolk').manualEdits, derivedAdjustments: { armorClass: 1 } } }
    expect(deriveCharacter(draft).armorClass.value).toBe(Math.max(15, armor.armorBase ?? 0) + (armor.magicBonus ?? 0) + (shield.armorClassBonus ?? 0) + 1)
    expect(deriveCharacter({ ...draft, raceId: 'race-2014-motm-tortle' }).armorClass.value).toBe(17 + (shield.armorClassBonus ?? 0) + 1)
  })
})
