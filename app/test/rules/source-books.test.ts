import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import {
  getDefaultEnabledSourceIds,
  getSelectableSources,
  isSourceEnabled,
  normalizeEnabledSourceIds,
} from '@/rules/source-books'

describe('source-books 规则集化来源解析（E01）', () => {
  it('2014 默认全选与白名单过滤保持既有行为', () => {
    const defaults = getDefaultEnabledSourceIds()
    expect(defaults.length).toBeGreaterThan(0)
    expect(getSelectableSources()).toHaveLength(defaults.length)
    expect(normalizeEnabledSourceIds(['xgte-2017-index', 'unknown-source'])).toEqual(['xgte-2017-index'])
  })

  it('2024 可切换来源均为游玩测试且默认全关', () => {
    const selectable = getSelectableSources('5e-2024')
    expect(selectable).toHaveLength(7)
    expect(selectable.every((source) => source.selectable && source.contentKind === 'playtest')).toBe(true)
    expect(selectable.every((source) => source.ruleset === '5e-2024' && source.category === 'supplement')).toBe(true)
    expect(getDefaultEnabledSourceIds('5e-2024')).toEqual([])
  })

  it('normalizeEnabledSourceIds 按规则集过滤且去重', () => {
    expect(normalizeEnabledSourceIds(
      ['source-2024-ua-eberron', 'xgte-2017-index', 'source-2024-ua-eberron', 'unknown'],
      '5e-2024',
    )).toEqual(['source-2024-ua-eberron'])
    expect(normalizeEnabledSourceIds(['source-2024-ua-eberron'], '5e-2014')).toEqual([])
    expect(normalizeEnabledSourceIds(undefined, '5e-2024')).toEqual([])
  })

  it('isSourceEnabled 传入 2024 仓库时核心始终启用、UA 来源按开关判定', () => {
    expect(isSourceEnabled(['source-2024-phb'], [], rulesRepository2024)).toBe(true)
    expect(isSourceEnabled(['source-2024-ua-eberron'], [], rulesRepository2024)).toBe(false)
    expect(isSourceEnabled(['source-2024-ua-eberron'], ['source-2024-ua-eberron'], rulesRepository2024)).toBe(true)
  })
})
