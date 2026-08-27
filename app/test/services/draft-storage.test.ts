import { beforeEach, describe, expect, it } from 'vitest'

import { DraftStorageService } from '@/services/draft-storage'

const V6_KEY = 'dnd-character-builder:drafts:v6'
const V5_KEY = 'dnd-character-builder:drafts:v5'
const V4_KEY = 'dnd-character-builder:drafts:v4'
const V3_KEY = 'dnd-character-builder:drafts:v3'
const V2_KEY = 'dnd-character-builder:drafts:v2'

function setJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

describe('DraftStorageService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('v4 草稿迁移到 v6，缺省字段（含来源、转录法术与人工编辑）被补全', () => {
    setJson(V4_KEY, [{
      schemaVersion: 4, id: 'v4-1', ruleset: '5e-2014', name: 'v4角色',
      spellSelections: {
        cantripIds: ['spell-2014-fire-bolt'], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: ['spell-2014-magic-missile'],
      },
    }])
    const drafts = DraftStorageService.loadAll()
    expect(drafts).toHaveLength(1)
    expect(drafts[0]?.schemaVersion).toBe(6)
    expect(drafts[0]?.enabledSourceIds).toBeDefined()
    expect(drafts[0]?.spellSelections.transcribedSpellIds).toEqual([])
    expect(drafts[0]?.spellSelections.spellbookSpellIds).toEqual(['spell-2014-magic-missile'])
    expect(drafts[0]?.manualEdits).toMatchObject({
      abilityAdjustments: {},
      derivedAdjustments: {},
      savingThrowAdjustments: {},
      skillAdjustments: {},
      spellSlotAdjustments: {},
      addedSpells: [],
    })
  })

  it('v3 草稿迁移为 v6 并补空转录字段', () => {
    setJson(V3_KEY, [{
      schemaVersion: 3, id: 'v3-1', ruleset: '5e-2014', name: 'v3角色',
      spellSelections: {
        cantripIds: [], knownSpellIds: [], preparedSpellIds: ['spell-2014-magic-missile'], spellbookSpellIds: ['spell-2014-magic-missile'],
      },
      adventureGold: 12,
    }])
    const drafts = DraftStorageService.loadAll()
    expect(drafts).toHaveLength(1)
    expect(drafts[0]?.schemaVersion).toBe(6)
    expect(drafts[0]?.adventureGold).toBe(12)
    expect(drafts[0]?.spellSelections.transcribedSpellIds).toEqual([])
    expect(drafts[0]?.spellSelections.preparedSpellIds).toEqual(['spell-2014-magic-missile'])
  })

  it('v2 草稿迁移为 v6（物品转 legacy，transcribedSpellIds 补空）', () => {
    setJson(V2_KEY, [{
      schemaVersion: 2, id: 'v2-1', ruleset: '5e-2014', name: 'v2角色',
      inventoryItemIds: ['dagger', 'dagger'], equippedItemIds: ['dagger'],
    }])
    const drafts = DraftStorageService.loadAll()
    expect(drafts).toHaveLength(1)
    const draft = drafts[0] as NonNullable<typeof drafts[0]>
    expect(draft.schemaVersion).toBe(6)
    expect(draft.equipmentNeedsReview).toBe(true)
    expect(draft.inventory[0]).toMatchObject({ itemId: 'dagger', quantity: 2, equippedQuantity: 1, sourceKind: 'legacy' })
    expect(draft.spellSelections.transcribedSpellIds).toEqual([])
  })

  it('同 id 草稿以 v4 为准，旧版本不重复合并', () => {
    setJson(V4_KEY, [{ schemaVersion: 4, id: 'same', ruleset: '5e-2014', name: '新版' }])
    setJson(V3_KEY, [{ schemaVersion: 3, id: 'same', ruleset: '5e-2014', name: '旧版' }])
    const drafts = DraftStorageService.loadAll()
    expect(drafts).toHaveLength(1)
    expect(drafts[0]?.name).toBe('新版')
  })

  it('v5 草稿迁移为 v6，并保留已有数据', () => {
    setJson(V5_KEY, [{
      schemaVersion: 5,
      id: 'v5-1',
      ruleset: '5e-2014',
      name: 'v5角色',
      adventureGold: 23,
    }])
    const drafts = DraftStorageService.loadAll()
    expect(drafts).toHaveLength(1)
    expect(drafts[0]?.schemaVersion).toBe(6)
    expect(drafts[0]?.adventureGold).toBe(23)
    expect(drafts[0]?.manualEdits.addedSpells).toEqual([])
  })

  it('saveAll 写入 v6 key', () => {
    DraftStorageService.saveAll([{ schemaVersion: 6, id: 'save-1', ruleset: '5e-2014', name: '保存' } as never])
    const raw = JSON.parse(localStorage.getItem(V6_KEY) ?? '[]') as Array<{ id: string }>
    expect(raw).toHaveLength(1)
    expect(raw[0]?.id).toBe('save-1')
  })
})
