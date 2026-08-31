import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { UPDATE_NOTICE_STORAGE_KEY } from '@/services/update-notice-storage'
import { useUpdateNoticeStore } from '@/stores/update-notice'

describe('useUpdateNoticeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('首次访问弹出，关闭后写入当前版本', () => {
    const store = useUpdateNoticeStore()
    store.initialize()
    expect(store.isOpen).toBe(true)
    expect(store.notice?.version).toBe('1.1.3')

    store.dismiss()
    expect(store.isOpen).toBe(false)
    expect(JSON.parse(localStorage.getItem(UPDATE_NOTICE_STORAGE_KEY) ?? '{}')).toEqual({ lastSeenVersion: '1.1.3' })
  })

  it('相同版本不弹，不同版本弹出，初始化保持幂等', () => {
    localStorage.setItem(UPDATE_NOTICE_STORAGE_KEY, JSON.stringify({ lastSeenVersion: '1.1.3' }))
    const store = useUpdateNoticeStore()
    store.initialize()
    expect(store.isOpen).toBe(false)

    localStorage.setItem(UPDATE_NOTICE_STORAGE_KEY, JSON.stringify({ lastSeenVersion: '9.9.9' }))
    store.initialize()
    expect(store.isOpen).toBe(false)
  })

  it('关于页可忽略已读状态手动回看', () => {
    localStorage.setItem(UPDATE_NOTICE_STORAGE_KEY, JSON.stringify({ lastSeenVersion: '1.1.3' }))
    const store = useUpdateNoticeStore()
    store.initialize()
    store.openManual()
    expect(store.isOpen).toBe(true)
  })
})
