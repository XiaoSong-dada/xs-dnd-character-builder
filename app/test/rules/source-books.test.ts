import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import {
  getDefaultEnabledSourceIds,
  getSelectableSources,
  isSourceEnabled,
  normalizeEnabledSourceIds,
} from '@/rules/source-books'

describe('source-books 规则集化来源解析（E01）', () => {
  it('2014 默认启用不含第三方来源，白名单过滤保持既有行为', () => {
    const defaults = getDefaultEnabledSourceIds()
    const selectable = getSelectableSources()
    expect(defaults.length).toBeGreaterThan(0)
    expect(selectable.length).toBeGreaterThan(defaults.length)
    const thirdParty = selectable.filter((source) => source.contentKind === 'third-party')
    expect(thirdParty).toHaveLength(11)
    expect(thirdParty.every((source) => source.defaultEnabled === false)).toBe(true)
    for (const source of thirdParty) expect(defaults, source.id).not.toContain(source.id)
    expect(normalizeEnabledSourceIds(['xgte-2017-index', 'unknown-source'])).toEqual(['xgte-2017-index'])
  })

  it('2014 第三方来源可显式开启，且仅在开启后生效', () => {
    expect(normalizeEnabledSourceIds(['tp-ebon-tides-index'])).toEqual(['tp-ebon-tides-index'])
    expect(isSourceEnabled(['tp-ebon-tides-index'], [])).toBe(false)
    expect(isSourceEnabled(['tp-ebon-tides-index'], ['tp-ebon-tides-index'])).toBe(true)
    expect(isSourceEnabled(['tp-ebon-tides-index'], undefined)).toBe(true)
  })

  it('2024 可切换来源包含 UA 游玩测试与旧扩展，且默认全关', () => {
    const selectable = getSelectableSources('5e-2024')
    expect(selectable).toHaveLength(17)
    expect(selectable.filter((source) => source.contentKind === 'playtest')).toHaveLength(7)
    expect(selectable.filter((source) => source.contentKind === 'legacy')).toHaveLength(10)
    expect(selectable.every((source) => source.selectable && source.ruleset === '5e-2024' && source.category === 'supplement')).toBe(true)
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
