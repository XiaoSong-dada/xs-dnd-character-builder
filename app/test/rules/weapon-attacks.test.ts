import { describe, expect, it } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import { deriveWeaponAttack } from '@/rules/weapon-attacks'
import type { EquipmentRule } from '@/types/rules'
import { fighterDraft } from '../fixtures/export-character'

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
})
