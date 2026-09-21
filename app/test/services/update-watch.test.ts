import { describe, expect, it, vi } from 'vitest'

import { watchUpdateTriggers, type UpdateWatchRuntime } from '@/services/update-watch'

interface FakeBrowser {
  readonly runtime: UpdateWatchRuntime
  readonly goOnline: () => void
  readonly setVisible: (visible: boolean) => void
  readonly listenerCount: () => number
}

function createFakeBrowser(visible = true): FakeBrowser {
  const online = new Set<() => void>()
  const visibility = new Set<() => void>()
  let isVisible = visible

  return {
    runtime: {
      subscribeOnline: (listener) => {
        online.add(listener)
        return () => online.delete(listener)
      },
      subscribeVisibility: (listener) => {
        visibility.add(listener)
        return () => visibility.delete(listener)
      },
      isVisible: () => isVisible,
    },
    goOnline: () => {
      online.forEach((listener) => listener())
    },
    setVisible: (next) => {
      isVisible = next
      visibility.forEach((listener) => listener())
    },
    listenerCount: () => online.size + visibility.size,
  }
}

describe('更新检测触发时机', () => {
  it('恢复联网时触发一次对账', () => {
    const browser = createFakeBrowser()
    const onTrigger = vi.fn()
    watchUpdateTriggers(onTrigger, browser.runtime)

    browser.goOnline()

    expect(onTrigger).toHaveBeenCalledTimes(1)
  })

  it('页面重新回到前台时触发对账', () => {
    const browser = createFakeBrowser(false)
    const onTrigger = vi.fn()
    watchUpdateTriggers(onTrigger, browser.runtime)

    browser.setVisible(true)

    expect(onTrigger).toHaveBeenCalledTimes(1)
  })

  it('页面转入后台时不触发，避免在不可见时白拉一次网络', () => {
    const browser = createFakeBrowser(true)
    const onTrigger = vi.fn()
    watchUpdateTriggers(onTrigger, browser.runtime)

    browser.setVisible(false)

    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('联网与回到前台连续到达时逐次上报，去重交给调用方', () => {
    const browser = createFakeBrowser()
    const onTrigger = vi.fn()
    watchUpdateTriggers(onTrigger, browser.runtime)

    browser.goOnline()
    browser.setVisible(true)

    expect(onTrigger).toHaveBeenCalledTimes(2)
  })

  it('解绑后两类事件都不再触发', () => {
    const browser = createFakeBrowser()
    const onTrigger = vi.fn()
    const unwatch = watchUpdateTriggers(onTrigger, browser.runtime)
    expect(browser.listenerCount()).toBe(2)

    unwatch()
    browser.goOnline()
    browser.setVisible(true)

    expect(browser.listenerCount()).toBe(0)
    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('没有浏览器环境时返回可调用的空解绑函数，不抛错', () => {
    const onTrigger = vi.fn()
    const unwatch = watchUpdateTriggers(onTrigger, undefined)

    expect(() => unwatch()).not.toThrow()
    expect(onTrigger).not.toHaveBeenCalled()
  })
})
