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

  it('imports a 2014 v2 draft as schema v6 without silently dropping equipment', () => {
    const imported = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 2,
      id: 'old-wizard',
      ruleset: '5e-2014',
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      selections: [],
      inventoryItemIds: ['dagger', 'dagger', 'spellbook'],
      equippedItemIds: ['dagger'],
    }))

    expect(imported.schemaVersion).toBe(7)
    expect(imported.equipmentNeedsReview).toBe(true)
    expect(imported.adventureGold).toBe(0)
    expect(imported.inventory.find((entry) => entry.itemId === 'dagger')).toMatchObject({
      quantity: 2,
      equippedQuantity: 1,
      sourceKind: 'legacy',
    })
    expect(imported.manualEdits.addedSpells).toEqual([])
  })

  it('v3 导入保留 adventureGold，缺省时兜底为 0，并升级为 v6 补全转录字段', () => {
    const withGold = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 3,
      id: 'v3-with-gold',
      ruleset: '5e-2014',
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      selections: [],
      adventureGold: 42,
    }))
    expect(withGold.adventureGold).toBe(42)
    expect(withGold.schemaVersion).toBe(7)
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

  it('v4 导入升级到 v6，导出往返保留 transcribedSpellIds 与人工编辑', () => {
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
    expect(imported.schemaVersion).toBe(7)
    expect(imported.spellSelections.transcribedSpellIds).toEqual(['spell-2014-magic-missile'])
    const roundTrip = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(imported))
    expect(roundTrip.spellSelections.transcribedSpellIds).toEqual(['spell-2014-magic-missile'])
    expect(roundTrip.manualEdits).toEqual(imported.manualEdits)
  })

  it('普通 JSON 导出移除媒体引用，避免跨设备产生失效图片', () => {
    const draft = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 7,
      id: 'with-media',
      ruleset: '5e-2014',
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      selections: [],
      media: { avatar: { mediaId: 'missing', mimeType: 'image/webp', width: 512, height: 512 } },
    }), { preserveMedia: true })
    expect(CharacterJsonService.exportDraft(draft)).not.toContain('mediaId')
    expect(CharacterJsonService.importDraft(JSON.stringify(draft)).media).toBeUndefined()
  })
})
