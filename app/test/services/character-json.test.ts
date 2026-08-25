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

  it('imports a 2014 v2 draft as schema v5 without silently dropping equipment', () => {
    const imported = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 2,
      id: 'old-wizard',
      ruleset: '5e-2014',
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      selections: [],
      inventoryItemIds: ['dagger', 'dagger', 'spellbook'],
      equippedItemIds: ['dagger'],
    }))

    expect(imported.schemaVersion).toBe(5)
    expect(imported.equipmentNeedsReview).toBe(true)
    expect(imported.adventureGold).toBe(0)
    expect(imported.inventory.find((entry) => entry.itemId === 'dagger')).toMatchObject({
      quantity: 2,
      equippedQuantity: 1,
      sourceKind: 'legacy',
    })
  })

  it('v3 导入保留 adventureGold，缺省时兜底为 0，并升级为 v5 补全转录字段', () => {
    const withGold = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 3,
      id: 'v3-with-gold',
      ruleset: '5e-2014',
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      selections: [],
      adventureGold: 42,
    }))
    expect(withGold.adventureGold).toBe(42)
    expect(withGold.schemaVersion).toBe(5)
    expect(withGold.spellSelections.transcribedSpellIds).toEqual([])

    const withoutGold = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 3,
      id: 'v3-no-gold',
      ruleset: '5e-2014',
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      selections: [],
    }))
    expect(withoutGold.adventureGold).toBe(0)
  })

  it('v4 导入升级到 v5，导出往返保留 transcribedSpellIds', () => {
    const imported = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 4,
      id: 'v4-with-transcribed',
      ruleset: '5e-2014',
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      selections: [],
      spellSelections: {
        cantripIds: [],
        knownSpellIds: [],
        preparedSpellIds: [],
        spellbookSpellIds: ['spell-2014-magic-missile'],
        transcribedSpellIds: ['spell-2014-magic-missile'],
      },
    }))
    expect(imported.schemaVersion).toBe(5)
    expect(imported.spellSelections.transcribedSpellIds).toEqual(['spell-2014-magic-missile'])
    const roundTrip = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(imported))
    expect(roundTrip.spellSelections.transcribedSpellIds).toEqual(['spell-2014-magic-missile'])
  })
})
