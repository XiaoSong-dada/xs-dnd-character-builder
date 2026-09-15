import { describe, expect, it } from 'vitest'

import { addCurrency, copperToWallet, subtractCurrency, walletToCopper } from '@/rules/currency'
import { rulesRepository2014 } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { buildStartingEquipmentState, isStartingEquipmentComplete } from '@/rules/starting-equipment'
import { getWeaponMasteryCandidates, validateWeaponMasterySelection } from '@/rules/weapon-mastery'
import { backgrounds2024 } from '@/rules/data/origins-2024'
import type { CharacterDraft } from '@/types/character'

const draft = (classId: string, backgroundId: string, groupOptions: readonly [string, string][]): CharacterDraft => ({
  schemaVersion: 8, id: 'equipment-2024-test', ruleset: '5e-2024', createdAt: '', updatedAt: '', targetLevel: 1,
  abilityMethod: 'standard-array', enabledSourceIds: [], classId, backgroundId, raceId: 'species-2024-human',
  raceAbilityChoices: [], backgroundSkillIds: [], backgroundToolIds: [], languages: [], proficiencyReplacements: [],
  baseAbilities: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }, selections: [],
  startingEquipmentSelections: groupOptions.map(([groupId, optionId]) => ({ groupId, optionId, pickedItemIds: [] })),
  inventory: [], infusionAssignments: [], currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }, adventureGold: 0,
  equipmentNeedsReview: false, spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
  manualEdits: { abilityAdjustments: {}, proficiencyBonusAdjustment: 0, derivedAdjustments: {}, savingThrowAdjustments: {}, skillAdjustments: {}, spellSlotAdjustments: {}, addedSpells: [] },
  name: '装备测试', alignment: '', notes: '', currentStep: 'equipment',
})

describe('2024 首批装备闭环', () => {
  it('装配父目录、子规格、套组与独立精通注册表', () => {
    expect(rulesRepository2024.equipment.length).toBeGreaterThanOrEqual(200)
    expect(new Set(rulesRepository2024.equipment.map((item) => item.id)).size).toBe(rulesRepository2024.equipment.length)
    expect(rulesRepository2024.equipment.every((item) => item.ruleset === '5e-2024')).toBe(true)
    expect(rulesRepository2024.weaponMasteries).toHaveLength(8)
    expect(rulesRepository2014.weaponMasteries).toEqual([])
    expect(rulesRepository2024.equipment.filter((item) => item.category === 'weapon' && item.sourceIds.includes('source-2024-phb')).every((item) => item.masteryId)).toBe(true)
    expect(rulesRepository2024.getEquipment('equipment-2024-potion-of-healing')).toBeUndefined()
    expect(rulesRepository2024.getEquipment('equipment-2024-spell-scroll')).toBeUndefined()
  })

  it('所有套组、背景装备和工具引用都能解析', () => {
    const referenced = rulesRepository2024.equipment.flatMap((item) => item.contents?.map((entry) => entry.itemId) ?? [])
    expect(referenced.every((id) => rulesRepository2024.getEquipment(id))).toBe(true)
    expect(backgrounds2024.flatMap((item) => [...(item.startingEquipmentOptionA ?? []), ...item.toolIds, ...(item.toolChoices?.optionIds ?? [])]).every((id) => rulesRepository2024.getEquipment(id))).toBe(true)
  })

  it('战士装备与背景金币互斥并合并职业金币', () => {
    const selected = draft('class-2024-fighter', 'background-2024-sage', [['fighter-2024-starting', 'fighter-2024-a'], ['background-2024-sage-starting', 'background-2024-sage-b']])
    expect(isStartingEquipmentComplete(selected)).toBe(true)
    const result = buildStartingEquipmentState(selected, false)
    expect(result.currency.gp).toBe(54)
    expect(result.inventory.some((entry) => entry.itemId === 'equipment-2024-chain-mail')).toBe(true)
    expect(result.inventory.some((entry) => entry.sourceKind === 'background')).toBe(false)
  })

  it('金币工具以铜币整数运算且余额不足不透支', () => {
    expect(walletToCopper({ gp: 1, sp: 2, cp: 3 })).toBe(123)
    expect(copperToWallet(1155)).toEqual({ pp: 1, gp: 1, ep: 1, sp: 0, cp: 5 })
    expect(addCurrency({ gp: 4 }, { gp: 50 }).gp).toBe(54)
    expect(subtractCurrency({ gp: 1 }, 101)).toBeUndefined()
  })

  it('精通候选与选择校验不依赖持有物品', () => {
    const candidates = getWeaponMasteryCandidates(rulesRepository2024)
    expect(candidates.length).toBe(38)
    expect(validateWeaponMasterySelection(rulesRepository2024, { optionIds: [candidates[0]!.id] }, 1)).toEqual([])
    expect(validateWeaponMasterySelection(rulesRepository2024, { optionIds: ['equipment-2024-longbow', 'equipment-2024-longbow'] }, 2)).toContain('同一种武器不能重复选择。')
    expect(validateWeaponMasterySelection(rulesRepository2024, { optionIds: ['longsword'] }, 1)).toContain('精通选择包含当前规则版本不可用的武器。')
  })
})
