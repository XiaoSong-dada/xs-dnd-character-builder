import { beforeEach, describe, expect, it } from 'vitest'

import { DraftStorageService } from '@/services/draft-storage'

const V8_KEY = 'dnd-character-builder:drafts:v8'
const V7_KEY = 'dnd-character-builder:drafts:v7'
const V5_KEY = 'dnd-character-builder:drafts:v5'
const V4_KEY = 'dnd-character-builder:drafts:v4'
const V3_KEY = 'dnd-character-builder:drafts:v3'
const V2_KEY = 'dnd-character-builder:drafts:v2'
const LEGACY_KEY = 'dnd-character-builder:drafts:v1'
const QUARANTINE_KEY = 'dnd-character-builder:drafts:unsupported:v1'

function setJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function readJson<T>(key: string): T {
  return JSON.parse(localStorage.getItem(key) ?? 'null') as T
}

describe('DraftStorageService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('v4 草稿迁移到 v8，缺省字段（含来源、转录法术与人工编辑）被补全', () => {
    setJson(V4_KEY, [{
      schemaVersion: 4, id: 'v4-1', ruleset: '5e-2014', name: 'v4角色',
      spellSelections: {
        cantripIds: ['spell-2014-fire-bolt'], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: ['spell-2014-magic-missile'],
      },
    }])
    const drafts = DraftStorageService.loadAll()
    expect(drafts).toHaveLength(1)
    expect(drafts[0]?.schemaVersion).toBe(8)
    expect(drafts[0]?.ruleset).toBe('5e-2014')
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

  it('v3 草稿迁移为 v8 并补空转录字段', () => {
    setJson(V3_KEY, [{
      schemaVersion: 3, id: 'v3-1', ruleset: '5e-2014', name: 'v3角色',
      spellSelections: {
        cantripIds: [], knownSpellIds: [], preparedSpellIds: ['spell-2014-magic-missile'], spellbookSpellIds: ['spell-2014-magic-missile'],
      },
      adventureGold: 12,
    }])
    const drafts = DraftStorageService.loadAll()
    expect(drafts).toHaveLength(1)
    expect(drafts[0]?.schemaVersion).toBe(8)
    expect(drafts[0]?.adventureGold).toBe(12)
    expect(drafts[0]?.spellSelections.transcribedSpellIds).toEqual([])
    expect(drafts[0]?.spellSelections.preparedSpellIds).toEqual(['spell-2014-magic-missile'])
  })

  it('v2 草稿迁移为 v8（物品转 legacy，transcribedSpellIds 补空）', () => {
    setJson(V2_KEY, [{
      schemaVersion: 2, id: 'v2-1', ruleset: '5e-2014', name: 'v2角色',
      inventoryItemIds: ['dagger', 'dagger'], equippedItemIds: ['dagger'],
    }])
    const drafts = DraftStorageService.loadAll()
    expect(drafts).toHaveLength(1)
    const draft = drafts[0] as NonNullable<typeof drafts[0]>
    expect(draft.schemaVersion).toBe(8)
    expect(draft.equipmentNeedsReview).toBe(true)
    expect(draft.inventory[0]).toMatchObject({ itemId: 'dagger', quantity: 2, equippedQuantity: 1, sourceKind: 'legacy' })
    expect(draft.spellSelections.transcribedSpellIds).toEqual([])
  })

  it('v7 草稿迁移为 v8 并保留 2014 规则版本', () => {
    setJson(V7_KEY, [{ schemaVersion: 7, id: 'v7-1', ruleset: '5e-2014', name: 'v7角色' }])
    const rawBefore = localStorage.getItem(V7_KEY)
    const drafts = DraftStorageService.loadAll()
    expect(drafts.map((draft) => draft.id)).toEqual(['v7-1'])
    expect(drafts[0]?.schemaVersion).toBe(8)
    expect(drafts[0]?.ruleset).toBe('5e-2014')
    // 迁移只发生在读取路径，旧键原文保持不删不改。
    expect(localStorage.getItem(V7_KEY)).toBe(rawBefore)
  })

  it('同 id 草稿以 v4 为准，旧版本不重复合并', () => {
    setJson(V4_KEY, [{ schemaVersion: 4, id: 'same', ruleset: '5e-2014', name: '新版' }])
    setJson(V3_KEY, [{ schemaVersion: 3, id: 'same', ruleset: '5e-2014', name: '旧版' }])
    const drafts = DraftStorageService.loadAll()
    expect(drafts).toHaveLength(1)
    expect(drafts[0]?.name).toBe('新版')
  })

  it('v5 草稿迁移为 v8，并保留已有数据', () => {
    setJson(V5_KEY, [{
      schemaVersion: 5,
      id: 'v5-1',
      ruleset: '5e-2014',
      name: 'v5角色',
      adventureGold: 23,
    }])
    const drafts = DraftStorageService.loadAll()
    expect(drafts).toHaveLength(1)
    expect(drafts[0]?.schemaVersion).toBe(8)
    expect(drafts[0]?.adventureGold).toBe(23)
    expect(drafts[0]?.manualEdits.addedSpells).toEqual([])
  })

  it('saveAll 写入 v8 key', () => {
    DraftStorageService.saveAll([{ schemaVersion: 8, id: 'save-1', ruleset: '5e-2014', name: '保存' } as never])
    const raw = readJson<Array<{ id: string }>>(V8_KEY)
    expect(raw).toHaveLength(1)
    expect(raw[0]?.id).toBe('save-1')
  })

  it('v8 两版草稿共存，来源按规则版本分别规范化', () => {
    setJson(V8_KEY, [
      { schemaVersion: 8, id: '2014-1', ruleset: '5e-2014', name: '旧版', enabledSourceIds: ['xgte-2017-index', 'bogus-2014'] },
      { schemaVersion: 8, id: '2024-1', ruleset: '5e-2024', name: '新版', enabledSourceIds: ['xgte-2017-index', 'xgte-2017-index'] },
    ])
    const drafts = DraftStorageService.loadAll()
    expect(drafts.map((draft) => draft.ruleset)).toEqual(['5e-2014', '5e-2024'])
    expect(drafts[0]?.enabledSourceIds).toEqual(['xgte-2017-index'])
    expect(drafts[1]?.enabledSourceIds).toEqual(['xgte-2017-index'])
  })

  it('当前键中的非法条目隔离保留，不进入列表且重复加载不重复追加', () => {
    setJson(V8_KEY, [
      { schemaVersion: 8, id: 'ok', ruleset: '5e-2014', name: '有效' },
      { schemaVersion: 8, id: 'unknown-ruleset', ruleset: '5e-2025', name: '未知版本' },
      { schemaVersion: 99, id: 'future-schema', ruleset: '5e-2014', name: '未来格式' },
      { schemaVersion: 3, id: 'old-2024', ruleset: '5e-2024', name: '旧2024' },
      { schemaVersion: 8, name: '缺少版本' },
    ])
    const drafts = DraftStorageService.loadAll()
    expect(drafts.map((draft) => draft.id)).toEqual(['ok'])
    const quarantined = readJson<Array<{ reason: string }>>(QUARANTINE_KEY)
    expect(quarantined.map((record) => record.reason)).toEqual([
      '不支持的规则版本：5e-2025。',
      '角色文件版本不受支持。',
      '该文件是旧版 2024 草稿格式，暂不支持导入；请保留原文件作为备份。',
      '角色文件缺少有效的规则版本。',
    ])
    DraftStorageService.loadAll()
    expect(readJson<unknown[]>(QUARANTINE_KEY)).toHaveLength(4)
  })

  it('saveAll 只写入有效草稿，隔离区保留且不被回写', () => {
    setJson(V8_KEY, [
      { schemaVersion: 8, id: 'ok', ruleset: '5e-2014', name: '有效' },
      { schemaVersion: 8, id: 'bad', ruleset: '5e-2025', name: '未知版本' },
    ])
    const loaded = DraftStorageService.loadAll()
    DraftStorageService.saveAll(loaded)
    const current = readJson<Array<{ id: string }>>(V8_KEY)
    expect(current.map((draft) => draft.id)).toEqual(['ok'])
    expect(readJson<unknown[]>(QUARANTINE_KEY)).toHaveLength(1)
    expect(DraftStorageService.loadAll().map((draft) => draft.id)).toEqual(['ok'])
  })

  it('旧 2024 隔离记录与新 v8 2024 草稿互不影响，且保持只读', () => {
    setJson(LEGACY_KEY, [{ id: 'legacy-1', name: '旧版2024', ruleset: '5e-2024', targetLevel: 5 }])
    setJson(V8_KEY, [{ schemaVersion: 8, id: 'new-2024', ruleset: '5e-2024', name: '新版2024' }])
    const records = DraftStorageService.loadLegacy()
    expect(records).toHaveLength(1)
    expect(records[0]?.id).toBe('legacy-1')
    expect(records[0]?.raw).toMatchObject({ ruleset: '5e-2024', targetLevel: 5 })
    expect(DraftStorageService.loadAll().map((draft) => draft.id)).toEqual(['new-2024'])
    expect(localStorage.getItem(LEGACY_KEY)).toContain('legacy-1')
  })
})
