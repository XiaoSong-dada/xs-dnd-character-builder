import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UPDATE_NOTICE_STORAGE_KEY, UpdateNoticeStorageService } from '@/services/update-notice-storage'

describe('UpdateNoticeStorageService', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('无记录或损坏记录按未读处理', () => {
    expect(UpdateNoticeStorageService.loadLastSeenVersion()).toBeUndefined()
    localStorage.setItem(UPDATE_NOTICE_STORAGE_KEY, '{broken')
    expect(UpdateNoticeStorageService.loadLastSeenVersion()).toBeUndefined()
  })

  it('保存并归一化已读版本', () => {
    expect(UpdateNoticeStorageService.saveLastSeenVersion('v1.1.2')).toBe(true)
    expect(UpdateNoticeStorageService.loadLastSeenVersion()).toBe('1.1.2')
  })

  it('读写异常时安全降级', () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => { throw new Error('denied') })
    expect(UpdateNoticeStorageService.loadLastSeenVersion()).toBeUndefined()
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => { throw new Error('denied') })
    expect(UpdateNoticeStorageService.saveLastSeenVersion('1.1.2')).toBe(false)
  })
})
