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
})
