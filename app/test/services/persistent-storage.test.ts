import { describe, expect, it, vi } from 'vitest'

import { isStoragePersisted, requestPersistentStorage } from '@/services/persistent-storage'

function runtime(overrides: Partial<StorageManager>) {
  return { storage: overrides as StorageManager }
}

describe('持久化存储提权', () => {
  it('已经授予时不再重复申请', async () => {
    const persist = vi.fn().mockResolvedValue(true)

    await expect(requestPersistentStorage(runtime({
      persisted: vi.fn().mockResolvedValue(true),
      persist,
    }))).resolves.toBe('granted')
    expect(persist).not.toHaveBeenCalled()
  })

  it('申请通过时返回已授予', async () => {
    await expect(requestPersistentStorage(runtime({
      persisted: vi.fn().mockResolvedValue(false),
      persist: vi.fn().mockResolvedValue(true),
    }))).resolves.toBe('granted')
  })

  it('浏览器拒绝时返回拒绝，不视为错误', async () => {
    await expect(requestPersistentStorage(runtime({
      persisted: vi.fn().mockResolvedValue(false),
      persist: vi.fn().mockResolvedValue(false),
    }))).resolves.toBe('denied')
  })

  it('调用抛错时返回失败', async () => {
    await expect(requestPersistentStorage(runtime({
      persisted: vi.fn().mockResolvedValue(false),
      persist: vi.fn().mockRejectedValue(new Error('quota')),
    }))).resolves.toBe('failed')
  })

  it('缺少 storage 或 persist 能力时返回不支持', async () => {
    await expect(requestPersistentStorage(undefined)).resolves.toBe('unsupported')
    await expect(requestPersistentStorage(runtime({}))).resolves.toBe('unsupported')
  })

  it('读取持久化状态在异常环境下返回 false', async () => {
    await expect(isStoragePersisted(runtime({
      persisted: vi.fn().mockResolvedValue(true),
    }))).resolves.toBe(true)
    await expect(isStoragePersisted(runtime({
      persisted: vi.fn().mockRejectedValue(new Error('denied')),
    }))).resolves.toBe(false)
    await expect(isStoragePersisted(undefined)).resolves.toBe(false)
  })
})
