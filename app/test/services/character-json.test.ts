import { describe, expect, it } from 'vitest'

import { CharacterImportError, CharacterJsonService } from '@/services/character-json'

describe('CharacterJsonService', () => {
  it('区分无效JSON和规则版本不匹配', () => {
    expect(() => CharacterJsonService.importDraft('{')).toThrowError(CharacterImportError)
    expect(() => CharacterJsonService.importDraft(JSON.stringify({ schemaVersion: 1, ruleset: '5e-2024' }))).toThrowError('版本不受支持')
  })

  it('拒绝未知数据版本', () => {
    expect(() => CharacterJsonService.importDraft(JSON.stringify({ schemaVersion: 2, ruleset: '5e-2024' }))).toThrowError('当前仅支持 5e-2014')
  })

  it('imports a 2014 v2 draft as schema v3 without silently dropping equipment', () => {
    const imported = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 2,
      id: 'old-wizard',
      ruleset: '5e-2014',
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      selections: [],
      inventoryItemIds: ['dagger', 'dagger', 'spellbook'],
      equippedItemIds: ['dagger'],
    }))

    expect(imported.schemaVersion).toBe(3)
    expect(imported.equipmentNeedsReview).toBe(true)
    expect(imported.inventory.find((entry) => entry.itemId === 'dagger')).toMatchObject({
      quantity: 2,
      equippedQuantity: 1,
      sourceKind: 'legacy',
    })
  })
})
