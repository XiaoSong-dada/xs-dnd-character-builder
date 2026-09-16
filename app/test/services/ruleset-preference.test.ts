import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  RULESET_PREFERENCE_STORAGE_KEY,
  RulesetPreferenceService,
  resolveInitialRuleset,
} from '@/services/ruleset-preference'

describe('本设备版本偏好（B09-01）', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('未选择时无偏好，解析结果为 2014 且不回退', () => {
    expect(RulesetPreferenceService.loadPreferredRuleset()).toBeUndefined()
    expect(resolveInitialRuleset()).toEqual({ ruleset: '5e-2014', fellBack: false })
  })

  it('保存后按记忆版本解析（2024 已开放）', () => {
    expect(RulesetPreferenceService.savePreferredRuleset('5e-2024')).toBe(true)
    expect(localStorage.getItem(RULESET_PREFERENCE_STORAGE_KEY)).toContain('5e-2024')
    expect(RulesetPreferenceService.loadPreferredRuleset()).toBe('5e-2024')
    expect(resolveInitialRuleset()).toEqual({ ruleset: '5e-2024', fellBack: false, preferred: '5e-2024' })
  })

  it('记忆版本尚未开放时回退 2014 并报告', () => {
    const resolution = resolveInitialRuleset({ preferred: '5e-2024', isOpen: () => false })
    expect(resolution).toEqual({ ruleset: '5e-2014', fellBack: true, preferred: '5e-2024' })
  })

  it('兼容损坏数据与非法版本值', () => {
    localStorage.setItem(RULESET_PREFERENCE_STORAGE_KEY, '{not-json')
    expect(RulesetPreferenceService.loadPreferredRuleset()).toBeUndefined()
    localStorage.setItem(RULESET_PREFERENCE_STORAGE_KEY, JSON.stringify({ ruleset: '5e-2099' }))
    expect(RulesetPreferenceService.loadPreferredRuleset()).toBeUndefined()
    localStorage.setItem(RULESET_PREFERENCE_STORAGE_KEY, JSON.stringify({ ruleset: 2024 }))
    expect(RulesetPreferenceService.loadPreferredRuleset()).toBeUndefined()
  })

  it('无 localStorage 时按缺省处理且写入返回 false', () => {
    const originalWindow = globalThis.window
    // happy-dom 下临时移除 window，验证 SSR／受限环境分支
    vi.stubGlobal('window', undefined)
    try {
      expect(RulesetPreferenceService.loadPreferredRuleset()).toBeUndefined()
      expect(RulesetPreferenceService.savePreferredRuleset('5e-2024')).toBe(false)
      expect(resolveInitialRuleset()).toEqual({ ruleset: '5e-2014', fellBack: false })
    } finally {
      vi.stubGlobal('window', originalWindow)
    }
  })
})
