import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { AppUpdateCheckOutcome } from '@/services/app-build-id'

const mocks = vi.hoisted(() => ({
  checkRemoteBuildId: vi.fn(),
  registerServiceWorker: vi.fn(),
  applyServiceWorkerUpdate: vi.fn(),
  hasWaitingUpdate: vi.fn(),
  watchUpdateTriggers: vi.fn(),
}))

vi.mock('@/services/app-build-id', () => ({ checkRemoteBuildId: mocks.checkRemoteBuildId }))
vi.mock('@/services/service-worker', () => ({
  registerServiceWorker: mocks.registerServiceWorker,
  applyServiceWorkerUpdate: mocks.applyServiceWorkerUpdate,
  hasWaitingUpdate: mocks.hasWaitingUpdate,
}))
vi.mock('@/services/update-watch', () => ({ watchUpdateTriggers: mocks.watchUpdateTriggers }))

import { DAY_MS, UPDATE_CHECK_PREFERENCE_STORAGE_KEY, UpdateCheckPreferenceService } from '@/services/update-check-preference'
import { useAppUpdateStore } from '@/stores/app-update'

/** 初始化时登记进来的触发回调；模拟浏览器上报「恢复联网 / 页面重新可见」。 */
let triggerUpdateCheck: () => void

/** 让挂起的对账 promise 落地；`checkAuto` 是即发即忘的，断言前必须先冲干净微任务。 */
async function flushCheck(): Promise<void> {
  for (let i = 0; i < 5; i += 1) await Promise.resolve()
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  mocks.checkRemoteBuildId.mockReset().mockResolvedValue('up-to-date')
  mocks.registerServiceWorker.mockReset().mockResolvedValue('registered')
  mocks.applyServiceWorkerUpdate.mockReset().mockResolvedValue(true)
  mocks.hasWaitingUpdate.mockReset().mockReturnValue(false)

  triggerUpdateCheck = () => {}
  mocks.watchUpdateTriggers.mockReset().mockImplementation((onTrigger: () => void) => {
    triggerUpdateCheck = onTrigger
    return () => {}
  })
})

describe('更新状态初始化', () => {
  it('启动时同时注册离线外壳并做一次构建标识对账', async () => {
    const store = useAppUpdateStore()
    await store.initialize()

    expect(mocks.registerServiceWorker).toHaveBeenCalledTimes(1)
    expect(mocks.checkRemoteBuildId).toHaveBeenCalledTimes(1)
    expect(store.lastCheck).toBe('up-to-date')
    expect(store.updateAvailable).toBe(false)
  })

  it('对账发现远端是另一个构建时判定为可更新', async () => {
    mocks.checkRemoteBuildId.mockResolvedValue('update-available')
    const store = useAppUpdateStore()
    await store.initialize()

    expect(store.buildIdMismatch).toBe(true)
    expect(store.updateAvailable).toBe(true)
    expect(store.lastCheck).toBe('update-available')
  })

  it('重复调用只初始化一次，避免每次挂载都重新对账', async () => {
    const store = useAppUpdateStore()
    await store.initialize()
    await store.initialize()

    expect(mocks.registerServiceWorker).toHaveBeenCalledTimes(1)
    expect(mocks.checkRemoteBuildId).toHaveBeenCalledTimes(1)
  })

  it('离线导致对账拿不到结论时不影响外壳注册，也不误报可更新', async () => {
    mocks.checkRemoteBuildId.mockResolvedValue('unavailable')
    const store = useAppUpdateStore()
    await store.initialize()

    expect(mocks.registerServiceWorker).toHaveBeenCalledTimes(1)
    expect(store.lastCheck).toBe('unavailable')
    expect(store.updateAvailable).toBe(false)
  })
})

describe('两路更新信号', () => {
  it('等待中的新外壳即使对账说已是最新，也仍然算可更新', async () => {
    mocks.hasWaitingUpdate.mockReturnValue(true)
    const store = useAppUpdateStore()
    await store.initialize()

    expect(store.waitingShell).toBe(true)
    expect(store.buildIdMismatch).toBe(false)
    expect(store.updateAvailable).toBe(true)
  })

  it('外壳注册回调也可直接置为可更新', async () => {
    mocks.registerServiceWorker.mockImplementation(async (onUpdateAvailable: () => void) => {
      onUpdateAvailable()
      return 'update-available'
    })

    const store = useAppUpdateStore()
    await store.initialize()

    expect(store.waitingShell).toBe(true)
    expect(store.updateAvailable).toBe(true)
  })
})

describe('手动检查与切换', () => {
  it('并发检查共享同一个请求，后到者不会拿到无意义的结论', async () => {
    let resolveCheck: ((outcome: AppUpdateCheckOutcome) => void) | undefined
    const pending = new Promise<AppUpdateCheckOutcome>((resolve) => {
      resolveCheck = resolve
    })
    mocks.checkRemoteBuildId.mockReturnValue(pending)

    const store = useAppUpdateStore()
    const first = store.checkNow()
    const second = store.checkNow()

    expect(mocks.checkRemoteBuildId).toHaveBeenCalledTimes(1)
    expect(store.checking).toBe(true)
    expect(resolveCheck).toBeTypeOf('function')

    resolveCheck?.('update-available')
    await expect(Promise.all([first, second])).resolves.toEqual(['update-available', 'update-available'])

    expect(store.checking).toBe(false)
    expect(store.buildIdMismatch).toBe(true)

    // 请求结束后必须复位，否则后续手动检查会永远复用已完成的 promise。
    mocks.checkRemoteBuildId.mockResolvedValue('up-to-date')
    await store.checkNow()
    expect(mocks.checkRemoteBuildId).toHaveBeenCalledTimes(2)
  })

  it('没有可更新版本时点击切换不产生任何动作', async () => {
    const store = useAppUpdateStore()
    await store.initialize()
    await store.applyUpdate()

    expect(mocks.applyServiceWorkerUpdate).not.toHaveBeenCalled()
    expect(store.applying).toBe(false)
  })

  it('存在可更新版本时执行切换并复位进行中状态', async () => {
    mocks.checkRemoteBuildId.mockResolvedValue('update-available')
    const store = useAppUpdateStore()
    await store.initialize()
    await store.applyUpdate()

    expect(mocks.applyServiceWorkerUpdate).toHaveBeenCalledTimes(1)
    expect(store.applying).toBe(false)
  })
})

describe('自动检查周期', () => {
  beforeEach(() => {
    // 到期判断按 `Date.now()` 计时，用假定时器把时间推着走。
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('首次使用没有记录时启动就查一次，并把这次检查写进本机', async () => {
    const store = useAppUpdateStore()
    await store.initialize()

    expect(mocks.watchUpdateTriggers).toHaveBeenCalledTimes(1)
    expect(mocks.checkRemoteBuildId).toHaveBeenCalledTimes(1)
    expect(store.checkedAt).toBe(Date.now())
    expect(UpdateCheckPreferenceService.loadCheckedAt()).toBe(Date.now())
  })

  it('距上次检查不满一个周期时，启动与恢复联网都不再请求', async () => {
    UpdateCheckPreferenceService.saveCheckedAt(Date.now() - 3 * DAY_MS)

    const store = useAppUpdateStore()
    await store.initialize()

    expect(mocks.checkRemoteBuildId).not.toHaveBeenCalled()
    expect(store.lastCheck).toBe('idle')

    triggerUpdateCheck()
    await flushCheck()
    expect(mocks.checkRemoteBuildId).not.toHaveBeenCalled()
  })

  it('周期到了以后，恢复联网会重新对账', async () => {
    UpdateCheckPreferenceService.saveCheckedAt(Date.now() - 8 * DAY_MS)

    const store = useAppUpdateStore()
    await store.initialize()
    expect(mocks.checkRemoteBuildId).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(8 * DAY_MS)
    triggerUpdateCheck()
    await flushCheck()
    expect(mocks.checkRemoteBuildId).toHaveBeenCalledTimes(2)
  })

  it('拿不到结论的检查不记账，断网打开后恢复联网要立刻再对一次', async () => {
    mocks.checkRemoteBuildId.mockResolvedValue('unavailable')

    const store = useAppUpdateStore()
    await store.initialize()

    expect(store.lastCheck).toBe('unavailable')
    expect(store.checkedAt).toBe(0)
    expect(UpdateCheckPreferenceService.loadCheckedAt()).toBe(0)

    mocks.checkRemoteBuildId.mockResolvedValue('update-available')
    triggerUpdateCheck()
    await flushCheck()

    expect(mocks.checkRemoteBuildId).toHaveBeenCalledTimes(2)
    expect(store.updateAvailable).toBe(true)
  })

  it('手动检查不受周期限制，并且同样算作刚检查过', async () => {
    UpdateCheckPreferenceService.saveCheckedAt(Date.now() - 3 * DAY_MS)

    const store = useAppUpdateStore()
    await store.initialize()
    expect(mocks.checkRemoteBuildId).not.toHaveBeenCalled()

    await store.checkNow()

    expect(mocks.checkRemoteBuildId).toHaveBeenCalledTimes(1)
    expect(UpdateCheckPreferenceService.loadCheckedAt()).toBe(Date.now())
  })

  it('重复初始化不会重复登记监听', async () => {
    const store = useAppUpdateStore()
    await store.initialize()
    await store.initialize()

    expect(mocks.watchUpdateTriggers).toHaveBeenCalledTimes(1)
  })
})

describe('周期设置', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('默认 7 天，设置后写入本机并立即影响下次到期判断', async () => {
    UpdateCheckPreferenceService.saveCheckedAt(Date.now() - 2 * DAY_MS)

    const store = useAppUpdateStore()
    expect(store.intervalDays).toBe(7)

    await store.initialize()
    // 周期 7 天、2 天前查过：还不到期。
    expect(mocks.checkRemoteBuildId).not.toHaveBeenCalled()

    expect(store.setIntervalDays(1)).toBe(true)
    expect(store.intervalDays).toBe(1)
    expect(UpdateCheckPreferenceService.loadIntervalDays()).toBe(1)

    triggerUpdateCheck()
    await flushCheck()
    expect(mocks.checkRemoteBuildId).toHaveBeenCalledTimes(1)
  })

  it('拒绝非法周期，既不写进本机也不改变当前设置', () => {
    const store = useAppUpdateStore()

    expect(store.setIntervalDays(0)).toBe(false)
    expect(store.setIntervalDays(2.5)).toBe(false)
    expect(store.setIntervalDays(366)).toBe(false)

    expect(store.intervalDays).toBe(7)
    expect(localStorage.getItem(UPDATE_CHECK_PREFERENCE_STORAGE_KEY)).toBeNull()
  })

  it('启动时按本机记下的周期运行，而不是写死的默认值', async () => {
    UpdateCheckPreferenceService.saveIntervalDays(30)
    UpdateCheckPreferenceService.saveCheckedAt(Date.now() - 10 * DAY_MS)

    const store = useAppUpdateStore()
    await store.initialize()

    // 周期 30 天、10 天前查过：不该查；若误用默认 7 天就会查。
    expect(store.intervalDays).toBe(30)
    expect(mocks.checkRemoteBuildId).not.toHaveBeenCalled()
  })
})
