import { describe, expect, it } from 'vitest'

import { CharacterImportError, CharacterJsonService } from '@/services/character-json'

describe('CharacterJsonService', () => {
  it('区分无效 JSON、未知数据版本与旧版 2024 格式', () => {
    expect(() => CharacterJsonService.importDraft('{')).toThrowError(CharacterImportError)
    expect(() => CharacterJsonService.importDraft(JSON.stringify({ schemaVersion: 1, ruleset: '5e-2024' }))).toThrowError('版本不受支持')
    expect(() => CharacterJsonService.importDraft(JSON.stringify({ schemaVersion: 2, ruleset: '5e-2024' }))).toThrowError('旧版 2024 草稿格式')
    expect(() => CharacterJsonService.importDraft(JSON.stringify({ schemaVersion: 7, ruleset: '5e-2024' }))).toThrowError('旧版 2024 草稿格式')
  })

  it('缺少或未知规则版本给出中文原因', () => {
    const base = { schemaVersion: 8, id: 'ruleset-check', baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 }, selections: [] }
    expect(() => CharacterJsonService.importDraft(JSON.stringify(base))).toThrowError('角色文件缺少有效的规则版本')
    expect(() => CharacterJsonService.importDraft(JSON.stringify({ ...base, ruleset: '5e-2025' }))).toThrowError('不支持的规则版本：5e-2025')
  })

  it('imports a 2014 v2 draft as schema v8 without silently dropping equipment', () => {
    const imported = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 2,
      id: 'old-wizard',
      ruleset: '5e-2014',
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      selections: [],
      inventoryItemIds: ['dagger', 'dagger', 'spellbook'],
      equippedItemIds: ['dagger'],
    }))

    expect(imported.schemaVersion).toBe(8)
    expect(imported.equipmentNeedsReview).toBe(true)
    expect(imported.adventureGold).toBe(0)
    expect(imported.inventory.find((entry) => entry.itemId === 'dagger')).toMatchObject({
      quantity: 2,
      equippedQuantity: 1,
      sourceKind: 'legacy',
    })
    expect(imported.manualEdits.addedSpells).toEqual([])
  })

  it('v3 导入保留 adventureGold，缺省时兜底为 0，并升级为 v8 补全转录字段', () => {
    const withGold = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 3,
      id: 'v3-with-gold',
      ruleset: '5e-2014',
      baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      selections: [],
      adventureGold: 42,
    }))
    expect(withGold.adventureGold).toBe(42)
    expect(withGold.schemaVersion).toBe(8)
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

  it('v4 导入升级到 v8，导出往返保留 transcribedSpellIds 与人工编辑', () => {
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
    expect(imported.schemaVersion).toBe(8)
    expect(imported.spellSelections.transcribedSpellIds).toEqual(['spell-2014-magic-missile'])
    const roundTrip = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(imported))
    expect(roundTrip.spellSelections.transcribedSpellIds).toEqual(['spell-2014-magic-missile'])
    expect(roundTrip.manualEdits).toEqual(imported.manualEdits)
  })

  it('v8 2024 草稿导出往返保留规则版本与原始选择', () => {
    const imported = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 8,
      id: 'v8-2024',
      ruleset: '5e-2024',
      baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
      selections: [{ checkpointId: 'fighter-2024-style-1', optionIds: ['style-defense'], confirmedAt: '2026-09-11T00:00:00.000Z' }],
      enabledSourceIds: ['source-2024-ua-eberron'],
    }))
    expect(imported.schemaVersion).toBe(8)
    expect(imported.ruleset).toBe('5e-2024')
    expect(imported.enabledSourceIds).toEqual(['source-2024-ua-eberron'])
    const roundTrip = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(imported))
    expect(roundTrip.ruleset).toBe('5e-2024')
    expect(roundTrip.selections).toEqual(imported.selections)
    expect(roundTrip.enabledSourceIds).toEqual(['source-2024-ua-eberron'])
  })

  it('v8 2024 草稿完整往返保留装备、法术、语言与背景属性分配，且 JSON 不含图片', () => {
    const imported = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 8,
      id: 'v8-2024-rich',
      ruleset: '5e-2024',
      baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
      enabledSourceIds: ['source-2024-ua-eberron'],
      classId: 'class-2024-cleric',
      subclassId: 'subclass-2024-cleric-life-domain',
      targetLevel: 3,
      backgroundId: 'background-2024-sage',
      backgroundAbilityAllocation: { int: 2, wis: 1 },
      languages: ['通用手语', '龙语'],
      selections: [{ checkpointId: 'class-2024-cleric-divine-order-1', optionIds: ['cleric-2024-divine-order-protector'], confirmedAt: '2026-09-11T00:00:00.000Z' }],
      inventory: [{ id: 'inv-longsword', itemId: 'equipment-2024-longsword', quantity: 1, equippedQuantity: 1, sourceKind: 'class' }],
      spellSelections: {
        cantripIds: ['spell-2024-guidance'],
        knownSpellIds: [],
        preparedSpellIds: ['spell-2024-bless'],
        spellbookSpellIds: [],
        transcribedSpellIds: [],
      },
      media: { avatar: { mediaId: 'media-1', mimeType: 'image/webp', width: 64, height: 64 } },
    }), { preserveMedia: true })

    const exported = CharacterJsonService.exportDraft(imported)
    expect(exported).not.toContain('media')
    const roundTrip = CharacterJsonService.importDraft(exported)
    expect(roundTrip.ruleset).toBe('5e-2024')
    expect(roundTrip.enabledSourceIds).toEqual(['source-2024-ua-eberron'])
    expect(roundTrip.selections).toEqual(imported.selections)
    expect(roundTrip.inventory).toEqual(imported.inventory)
    expect(roundTrip.spellSelections).toEqual(imported.spellSelections)
    expect(roundTrip.languages).toEqual(['通用手语', '龙语'])
    expect(roundTrip.backgroundAbilityAllocation).toEqual({ int: 2, wis: 1 })
    expect(roundTrip.media).toBeUndefined()
  })

  it('v8 导入为缺失的子职额外入书字段补默认值，并保留已有选择', () => {
    const withoutField = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 8,
      id: 'v8-no-extra',
      ruleset: '5e-2024',
      baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
      selections: [],
      spellSelections: {
        cantripIds: [],
        knownSpellIds: [],
        preparedSpellIds: [],
        spellbookSpellIds: [],
        transcribedSpellIds: [],
      },
    }))
    expect(withoutField.spellSelections.spellbookExtraSpellIds).toEqual([])

    const withExtras = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 8,
      id: 'v8-with-extra',
      ruleset: '5e-2024',
      baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
      selections: [],
      spellSelections: {
        cantripIds: [],
        knownSpellIds: [],
        preparedSpellIds: [],
        spellbookSpellIds: ['spell-2024-scorching-ray'],
        transcribedSpellIds: [],
        spellbookExtraSpellIds: ['spell-2024-scorching-ray'],
      },
    }))
    const roundTrip = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(withExtras))
    expect(roundTrip.spellSelections.spellbookExtraSpellIds).toEqual(['spell-2024-scorching-ray'])
  })

  it('普通 JSON 导出移除媒体引用，避免跨设备产生失效图片', () => {
    const draft = CharacterJsonService.importDraft(JSON.stringify({
      schemaVersion: 8,
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
