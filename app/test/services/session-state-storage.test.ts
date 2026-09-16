import { beforeEach, describe, expect, it } from 'vitest'

import { createInitialSessionState } from '@/rules/session-state'
import { SessionStateStorageService } from '@/services/session-state-storage'

describe('跑团局内状态存储（B10-04）', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('按草稿 id 隔离保存并在刷新后恢复', () => {
    SessionStateStorageService.save({
      ...createInitialSessionState('draft-a', 30),
      resourceUsage: { rage: 1 },
    })
    SessionStateStorageService.save(createInitialSessionState('draft-b', 40))

    expect(SessionStateStorageService.load('draft-a')).toMatchObject({ currentHp: 30, resourceUsage: { rage: 1 } })
    expect(SessionStateStorageService.load('draft-b')?.currentHp).toBe(40)
    expect(SessionStateStorageService.loadAll()).toHaveLength(2)
  })

  it('重复保存覆盖同一草稿，remove 只移除目标草稿', () => {
    SessionStateStorageService.save(createInitialSessionState('draft-a', 30))
    SessionStateStorageService.save(createInitialSessionState('draft-a', 25))
    expect(SessionStateStorageService.load('draft-a')?.currentHp).toBe(25)

    SessionStateStorageService.save(createInitialSessionState('draft-b', 40))
    SessionStateStorageService.remove('draft-a')
    expect(SessionStateStorageService.load('draft-a')).toBeUndefined()
    expect(SessionStateStorageService.load('draft-b')?.currentHp).toBe(40)
  })
})
