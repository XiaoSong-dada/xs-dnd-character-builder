import { describe, expect, it } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import { deriveWeaponAttack } from '@/rules/weapon-attacks'
import { rulesRepository2024 } from '@/rules/repositories'
import type { EquipmentRule } from '@/types/rules'
import { fighterDraft } from '../fixtures/export-character'
import { draft2024 } from '../fixtures/draft-2024'

function weapon(overrides: Partial<EquipmentRule>): EquipmentRule {
  return { id: 'test-weapon', ruleset: '5e-2014', name: '测试武器', summary: '', description: '', category: 'weapon', equippable: true, status: 'implemented', sourceIds: [], weaponKind: 'martial-melee', damageDice: '1d8', damageType: '穿刺', ...overrides }
}

describe('逐武器攻击派生', () => {
  it('灵巧取力量/敏捷较高值，远程固定敏捷，两用保留双手伤害骰', () => {
    const draft = { ...fighterDraft, baseAbilities: { str: 8, dex: 15, con: 13, int: 14, wis: 12, cha: 10 } }
    const derived = deriveCharacter(draft)
    expect(deriveWeaponAttack(draft, derived, weapon({ weaponProperties: ['finesse', 'versatile'], versatileDamageDice: '1d10' }))?.ability).toBe('dex')
    expect(deriveWeaponAttack(draft, derived, weapon({ weaponKind: 'martial-ranged', range: [80, 320] }))?.ability).toBe('dex')
    expect(deriveWeaponAttack(draft, derived, weapon({ versatileDamageDice: '1d10' }))?.versatileDamageDice).toBe('1d10')
  })

  it('叠加职业熟练、魔法攻击与伤害加值', () => {
    const derived = deriveCharacter(fighterDraft)
    const normal = deriveWeaponAttack(fighterDraft, derived, weapon({}))!
    const magic = deriveWeaponAttack(fighterDraft, derived, weapon({ magicBonus: 2 }))!
    expect(normal.proficient).toBe(true)
    expect(magic.attackBonus).toBe(normal.attackBonus + 2)
    expect(magic.damageBonus).toBe(normal.damageBonus + 2)
  })

  it('2024 职业武器训练决定熟练（战士简易＋军用，法师简易）', () => {
    const longsword = rulesRepository2024.getEquipment('equipment-2024-longsword')
    const dagger = rulesRepository2024.getEquipment('equipment-2024-dagger')
    if (!longsword || !dagger) throw new Error('缺少 2024 武器数据')

    const fighter = draft2024({ targetLevel: 1 })
    const fighterDerived = deriveCharacter(fighter)
    expect(deriveWeaponAttack(fighter, fighterDerived, longsword)?.proficient).toBe(true)
    expect(deriveWeaponAttack(fighter, fighterDerived, dagger)?.proficient).toBe(true)

    const wizard = draft2024({ targetLevel: 1, classId: 'class-2024-wizard' })
    const wizardDerived = deriveCharacter(wizard)
    expect(deriveWeaponAttack(wizard, wizardDerived, longsword)?.proficient).toBe(false)
    expect(deriveWeaponAttack(wizard, wizardDerived, dagger)?.proficient).toBe(true)
  })

  it('2024 游荡者武器训练支持灵巧／轻型军用武器', () => {
    const rogue = draft2024({ classId: 'class-2024-rogue', targetLevel: 1 })
    const derived = deriveCharacter(rogue)
    const rapier = rulesRepository2024.getEquipment('equipment-2024-rapier')
    const dagger = rulesRepository2024.getEquipment('equipment-2024-dagger')
    const longsword = rulesRepository2024.getEquipment('equipment-2024-longsword')
    if (!rapier || !dagger || !longsword) throw new Error('缺少 2024 武器数据')
    expect(deriveWeaponAttack(rogue, derived, rapier)?.proficient).toBe(true)
    expect(deriveWeaponAttack(rogue, derived, dagger)?.proficient).toBe(true)
    expect(deriveWeaponAttack(rogue, derived, longsword)?.proficient).toBe(false)
  })

  it('2024 武僧武器训练为简易＋轻型军用', () => {
    const monk = draft2024({ classId: 'class-2024-monk', targetLevel: 1 })
    const derived = deriveCharacter(monk)
    const shortsword = rulesRepository2024.getEquipment('equipment-2024-shortsword')
    const dagger = rulesRepository2024.getEquipment('equipment-2024-dagger')
    const longsword = rulesRepository2024.getEquipment('equipment-2024-longsword')
    const greataxe = rulesRepository2024.getEquipment('equipment-2024-greataxe')
    if (!shortsword || !dagger || !longsword || !greataxe) throw new Error('缺少 2024 武器数据')
    expect(deriveWeaponAttack(monk, derived, shortsword)?.proficient).toBe(true)
    expect(deriveWeaponAttack(monk, derived, dagger)?.proficient).toBe(true)
    expect(deriveWeaponAttack(monk, derived, longsword)?.proficient).toBe(false)
    expect(deriveWeaponAttack(monk, derived, greataxe)?.proficient).toBe(false)
  })

  it('2024 吟游诗人勇气学院·战争训练授予军用武器熟练', () => {
    const longsword = rulesRepository2024.getEquipment('equipment-2024-longsword')
    const dagger = rulesRepository2024.getEquipment('equipment-2024-dagger')
    if (!longsword || !dagger) throw new Error('缺少 2024 武器数据')

    const plain = draft2024({ classId: 'class-2024-bard', targetLevel: 3 })
    expect(deriveWeaponAttack(plain, deriveCharacter(plain), longsword)?.proficient).toBe(false)
    expect(deriveWeaponAttack(plain, deriveCharacter(plain), dagger)?.proficient).toBe(true)

    const valor = draft2024({
      classId: 'class-2024-bard',
      subclassId: 'subclass-2024-bard-college-of-valor',
      targetLevel: 3,
    })
    expect(deriveWeaponAttack(valor, deriveCharacter(valor), longsword)?.proficient).toBe(true)
  })

  it('2024 德鲁伊原初职能·卫士授予军用武器熟练', () => {
    const longsword = rulesRepository2024.getEquipment('equipment-2024-longsword')
    const sickle = rulesRepository2024.getEquipment('equipment-2024-sickle')
    if (!longsword || !sickle) throw new Error('缺少 2024 武器数据')

    const plain = draft2024({ classId: 'class-2024-druid', targetLevel: 1 })
    expect(deriveWeaponAttack(plain, deriveCharacter(plain), longsword)?.proficient).toBe(false)
    expect(deriveWeaponAttack(plain, deriveCharacter(plain), sickle)?.proficient).toBe(true)

    const warden = draft2024({
      classId: 'class-2024-druid',
      targetLevel: 1,
      selections: [{ checkpointId: 'class-2024-druid-primal-order-1', optionIds: ['druid-2024-primal-order-warden'], confirmedAt: '2026-09-15T00:00:00.000Z' }],
    })
    expect(deriveWeaponAttack(warden, deriveCharacter(warden), longsword)?.proficient).toBe(true)
  })

  it('2024 牧师圣职·保护者授予军用武器熟练', () => {
    const longsword = rulesRepository2024.getEquipment('equipment-2024-longsword')
    const mace = rulesRepository2024.getEquipment('equipment-2024-mace')
    if (!longsword || !mace) throw new Error('缺少 2024 武器数据')

    const plain = draft2024({ classId: 'class-2024-cleric', targetLevel: 1 })
    const plainDerived = deriveCharacter(plain)
    expect(deriveWeaponAttack(plain, plainDerived, mace)?.proficient).toBe(true)
    expect(deriveWeaponAttack(plain, plainDerived, longsword)?.proficient).toBe(false)

    const protector = draft2024({
      classId: 'class-2024-cleric',
      targetLevel: 1,
      selections: [{ checkpointId: 'class-2024-cleric-divine-order-1', optionIds: ['cleric-2024-divine-order-protector'], confirmedAt: '2026-09-15T00:00:00.000Z' }],
    })
    expect(deriveWeaponAttack(protector, deriveCharacter(protector), longsword)?.proficient).toBe(true)
  })
})
