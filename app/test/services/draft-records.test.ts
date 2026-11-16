import { describe, expect, it } from 'vitest'

import { loadDraftSummaries, PREVIOUS_DRAFT_KEYS, STORAGE_KEY } from '@/services/draft-records'

describe('首页草稿摘要', () => {
  it('优先显示当前存档并兼容旧草稿，读取时保持原始数据', () => {
    localStorage.clear()
    const current = JSON.stringify([
      { id: 'same', schemaVersion: 10, name: '新版', ruleset: '5e-2024', targetLevel: 3, currentStep: 'sources' },
      { id: 'future', schemaVersion: 99, ruleset: '5e-2014' },
    ])
    const old = JSON.stringify([
      { id: 'same', schemaVersion: 2, name: '旧副本' },
      { id: 'old', schemaVersion: 2, name: '旧草稿' },
    ])
    const oldKey = PREVIOUS_DRAFT_KEYS[PREVIOUS_DRAFT_KEYS.length - 1]
    localStorage.setItem(STORAGE_KEY, current)
    localStorage.setItem(oldKey, old)
    try {
      expect(loadDraftSummaries()).toMatchObject([
        { id: 'same', name: '新版', ruleset: '5e-2024', targetLevel: 3, currentStep: 'sources' },
        { id: 'old', name: '旧草稿', ruleset: '5e-2014', currentStep: 'setup' },
      ])
      expect(localStorage.getItem(STORAGE_KEY)).toBe(current)
      expect(localStorage.getItem(oldKey)).toBe(old)
    } finally {
      localStorage.clear()
    }
  })
})
