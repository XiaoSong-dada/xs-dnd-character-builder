import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DAY_MS,
  DEFAULT_UPDATE_CHECK_INTERVAL_DAYS,
  MAX_UPDATE_CHECK_INTERVAL_DAYS,
  MIN_UPDATE_CHECK_INTERVAL_DAYS,
  UPDATE_CHECK_PREFERENCE_STORAGE_KEY,
  UPDATE_CHECK_STATE_STORAGE_KEY,
  UpdateCheckPreferenceService,
  isAutoCheckDue,
  isValidUpdateCheckIntervalDays,
  parseUpdateCheckIntervalDays,
} from '@/services/update-check-preference'

describe('自动检查周期设置', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('从未设置时用默认周期，且没有上次检查记录', () => {
    expect(DEFAULT_UPDATE_CHECK_INTERVAL_DAYS).toBe(7)
    expect(UpdateCheckPreferenceService.loadIntervalDays()).toBe(DEFAULT_UPDATE_CHECK_INTERVAL_DAYS)
    expect(UpdateCheckPreferenceService.loadCheckedAt()).toBe(0)
  })

  it('保存后可读回，两份记录各写各的键、互不覆盖', () => {
    expect(UpdateCheckPreferenceService.saveIntervalDays(3)).toBe(true)
    expect(localStorage.getItem(UPDATE_CHECK_PREFERENCE_STORAGE_KEY)).toContain('3')
    expect(UpdateCheckPreferenceService.loadIntervalDays()).toBe(3)

    expect(UpdateCheckPreferenceService.saveCheckedAt(1_700_000_000_000)).toBe(true)
    expect(UpdateCheckPreferenceService.loadCheckedAt()).toBe(1_700_000_000_000)

    // 写上次检查时间不该动周期设置，反之亦然。
    expect(UpdateCheckPreferenceService.loadIntervalDays()).toBe(3)
  })

  it('丢弃越界、损坏与类型不符的数据，回落到默认值', () => {
    localStorage.setItem(UPDATE_CHECK_PREFERENCE_STORAGE_KEY, '{not-json')
    expect(UpdateCheckPreferenceService.loadIntervalDays()).toBe(DEFAULT_UPDATE_CHECK_INTERVAL_DAYS)

    localStorage.setItem(UPDATE_CHECK_PREFERENCE_STORAGE_KEY, JSON.stringify({ intervalDays: 0 }))
    expect(UpdateCheckPreferenceService.loadIntervalDays()).toBe(DEFAULT_UPDATE_CHECK_INTERVAL_DAYS)

    localStorage.setItem(UPDATE_CHECK_PREFERENCE_STORAGE_KEY, JSON.stringify({ intervalDays: 999 }))
    expect(UpdateCheckPreferenceService.loadIntervalDays()).toBe(DEFAULT_UPDATE_CHECK_INTERVAL_DAYS)

    localStorage.setItem(UPDATE_CHECK_PREFERENCE_STORAGE_KEY, JSON.stringify({ intervalDays: '7' }))
    expect(UpdateCheckPreferenceService.loadIntervalDays()).toBe(DEFAULT_UPDATE_CHECK_INTERVAL_DAYS)

    localStorage.setItem(UPDATE_CHECK_STATE_STORAGE_KEY, JSON.stringify({ checkedAt: -1 }))
    expect(UpdateCheckPreferenceService.loadCheckedAt()).toBe(0)
  })

  it('拒绝保存非法周期，不把坏值写进本机', () => {
    expect(UpdateCheckPreferenceService.saveIntervalDays(0)).toBe(false)
    expect(UpdateCheckPreferenceService.saveIntervalDays(2.5)).toBe(false)
    expect(UpdateCheckPreferenceService.saveIntervalDays(MAX_UPDATE_CHECK_INTERVAL_DAYS + 1)).toBe(false)
    expect(localStorage.getItem(UPDATE_CHECK_PREFERENCE_STORAGE_KEY)).toBeNull()
  })

  it('无 localStorage 时按缺省处理且写入返回 false', () => {
    const originalWindow = globalThis.window
    vi.stubGlobal('window', undefined)
    try {
      expect(UpdateCheckPreferenceService.loadIntervalDays()).toBe(DEFAULT_UPDATE_CHECK_INTERVAL_DAYS)
      expect(UpdateCheckPreferenceService.loadCheckedAt()).toBe(0)
      expect(UpdateCheckPreferenceService.saveIntervalDays(3)).toBe(false)
      expect(UpdateCheckPreferenceService.saveCheckedAt(1)).toBe(false)
    } finally {
      vi.stubGlobal('window', originalWindow)
    }
  })
})

describe('周期取值校验', () => {
  it('只接受范围内的整数天数', () => {
    expect(isValidUpdateCheckIntervalDays(MIN_UPDATE_CHECK_INTERVAL_DAYS)).toBe(true)
    expect(isValidUpdateCheckIntervalDays(MAX_UPDATE_CHECK_INTERVAL_DAYS)).toBe(true)
    expect(isValidUpdateCheckIntervalDays(7)).toBe(true)
    expect(isValidUpdateCheckIntervalDays(0)).toBe(false)
    expect(isValidUpdateCheckIntervalDays(-1)).toBe(false)
    expect(isValidUpdateCheckIntervalDays(366)).toBe(false)
    expect(isValidUpdateCheckIntervalDays(1.5)).toBe(false)
    expect(isValidUpdateCheckIntervalDays(Number.NaN)).toBe(false)
    expect(isValidUpdateCheckIntervalDays('7')).toBe(false)
  })

  it('解析玩家输入：允许前后空白，拒绝小数、越界与非数字', () => {
    expect(parseUpdateCheckIntervalDays('7')).toBe(7)
    expect(parseUpdateCheckIntervalDays('  30 ')).toBe(30)
    expect(parseUpdateCheckIntervalDays('')).toBeUndefined()
    expect(parseUpdateCheckIntervalDays('abc')).toBeUndefined()
    expect(parseUpdateCheckIntervalDays('7.5')).toBeUndefined()
    expect(parseUpdateCheckIntervalDays('-3')).toBeUndefined()
    expect(parseUpdateCheckIntervalDays('0')).toBeUndefined()
    expect(parseUpdateCheckIntervalDays(String(MAX_UPDATE_CHECK_INTERVAL_DAYS + 1))).toBeUndefined()
  })
})

describe('自动检查到期判断', () => {
  const NOW = 1_800_000_000_000

  it('从未检查过时视为到期', () => {
    expect(isAutoCheckDue(0, 7, NOW)).toBe(true)
  })

  it('刚好满一个周期即到期，差一毫秒不到期', () => {
    expect(isAutoCheckDue(NOW - 7 * DAY_MS, 7, NOW)).toBe(true)
    expect(isAutoCheckDue(NOW - 7 * DAY_MS + 1, 7, NOW)).toBe(false)
  })

  it('周期与已过时间直接比较，缩短周期会立刻变成到期', () => {
    const checkedAt = NOW - 3 * DAY_MS
    expect(isAutoCheckDue(checkedAt, 7, NOW)).toBe(false)
    expect(isAutoCheckDue(checkedAt, 3, NOW)).toBe(true)
  })

  it('记录时间晚于当前时间时视为到期，避免时钟回拨把检查永久锁死', () => {
    expect(isAutoCheckDue(NOW + 1, 7, NOW)).toBe(true)
  })
})
