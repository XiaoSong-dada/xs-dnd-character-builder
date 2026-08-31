import { normalizeVersion } from '@/utils/version'

const STORAGE_KEY = 'dnd-character-builder:update-notice:v1'

interface PersistedUpdateNotice {
  readonly lastSeenVersion: string
}

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export const UpdateNoticeStorageService = {
  loadLastSeenVersion(): string | undefined {
    if (!hasLocalStorage()) return undefined
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return undefined
      const parsed = JSON.parse(raw) as Partial<PersistedUpdateNotice>
      return typeof parsed.lastSeenVersion === 'string'
        ? normalizeVersion(parsed.lastSeenVersion)
        : undefined
    } catch {
      return undefined
    }
  },

  saveLastSeenVersion(version: string): boolean {
    const normalized = normalizeVersion(version)
    if (!hasLocalStorage() || !normalized) return false
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastSeenVersion: normalized }))
      return true
    } catch {
      return false
    }
  },
}

export const UPDATE_NOTICE_STORAGE_KEY = STORAGE_KEY
