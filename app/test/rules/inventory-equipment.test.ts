import { describe, expect, it } from 'vitest'
import { getRulesRepository } from '@/rules/repositories'
import { toggleInventoryEquipment } from '@/rules/starting-equipment'
import type { InventoryEntry, RulesetId } from '@/types/character'

describe('装备与卸下', () => {
  it.each(['5e-2014', '5e-2024'] as const)('%s 各来源可卸下全部装备而不删除物品，再装备一件', (ruleset: RulesetId) => {
    const repository = getRulesRepository(ruleset)
    const itemId = ruleset === '5e-2014' ? 'shield' : 'equipment-2024-shield'
    for (const sourceKind of ['class', 'background', 'legacy', 'adventure'] as const) {
      const inventory: readonly InventoryEntry[] = [
        { id: 'target', itemId, sourceKind, sourceId: 'original-source', quantity: 3, equippedQuantity: 2 },
        { id: 'other', itemId, sourceKind: 'adventure', quantity: 1, equippedQuantity: 1 },
      ]
      const off = toggleInventoryEquipment(inventory, 'target', repository)
      expect(off[0]).toEqual({ ...inventory[0], equippedQuantity: 0 })
      expect(off[1]).toBe(inventory[1])
      expect(inventory[0]?.equippedQuantity).toBe(2)
      expect(toggleInventoryEquipment(off, 'target', repository)[0]).toEqual({ ...inventory[0], equippedQuantity: 1 })
    }
  })

  it('未知条目、非装备、零数量不会激活装备', () => {
    const repository = getRulesRepository('5e-2014')
    const inventory: readonly InventoryEntry[] = [
      { id: 'custom', itemId: 'custom-item', sourceKind: 'adventure', quantity: 1, equippedQuantity: 0 },
      { id: 'rope', itemId: 'hempen-rope', sourceKind: 'class', quantity: 1, equippedQuantity: 0 },
      { id: 'empty', itemId: 'shield', sourceKind: 'class', quantity: 0, equippedQuantity: 0 },
    ]
    for (const id of ['missing', 'custom', 'rope', 'empty']) {
      expect(toggleInventoryEquipment(inventory, id, repository)).toBe(inventory)
    }
  })
})
