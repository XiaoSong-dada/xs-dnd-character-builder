import { beforeEach, describe, expect, it } from 'vitest'

import { DraftStorageService } from '@/services/draft-storage'

describe('DraftStorageService', () => {
  beforeEach(() => localStorage.clear())

  it('isolates old 2024 drafts as read-only export records', () => {
    localStorage.setItem('dnd-character-builder:drafts:v1', JSON.stringify([
      { schemaVersion: 1, id: 'old', ruleset: '5e-2024', name: '旧角色', targetLevel: 8 },
    ]))

    expect(DraftStorageService.loadAll()).toEqual([])
    expect(DraftStorageService.loadLegacy()).toMatchObject([
      { id: 'old', name: '旧角色', ruleset: '5e-2024', targetLevel: 8 },
    ])
  })

  it('migrates stored 2014 v2 drafts and marks equipment for review', () => {
    localStorage.setItem('dnd-character-builder:drafts:v2', JSON.stringify([
      {
        schemaVersion: 2,
        id: 'old-fighter',
        ruleset: '5e-2014',
        inventoryItemIds: ['chain-mail', 'longsword'],
        equippedItemIds: ['chain-mail'],
      },
    ]))

    const [draft] = DraftStorageService.loadAll()
    expect(draft).toMatchObject({
      id: 'old-fighter',
      schemaVersion: 3,
      equipmentNeedsReview: true,
      adventureGold: 0,
    })
    expect(draft?.inventory).toHaveLength(2)
    expect(draft?.inventory.find((entry) => entry.itemId === 'chain-mail')?.equippedQuantity).toBe(1)
  })
})
