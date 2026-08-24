import type { SessionState } from '@/types/session-state'

const STORAGE_KEY = 'dnd-session-assistant:states:v1'

function isSessionState(value: unknown): value is SessionState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<SessionState>
  return typeof state.draftId === 'string'
    && typeof state.currentHp === 'number'
    && typeof state.usedSpellSlots === 'object'
    && typeof state.exhaustionLevel === 'number'
    && Array.isArray(state.debuffs)
}

function readStates(): readonly SessionState[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isSessionState) : []
  } catch {
    return []
  }
}

function writeStates(states: readonly SessionState[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states))
}

/** 跑团助手局内状态存储：按草稿 id 独立保存，与车卡草稿（drafts）分开。 */
export const SessionStateStorageService = {
  loadAll(): readonly SessionState[] {
    return readStates()
  },
  load(draftId: string): SessionState | undefined {
    return readStates().find((state) => state.draftId === draftId)
  },
  save(state: SessionState): void {
    const states = readStates().filter((item) => item.draftId !== state.draftId)
    writeStates([...states, state])
  },
  remove(draftId: string): void {
    writeStates(readStates().filter((item) => item.draftId !== draftId))
  },
}
