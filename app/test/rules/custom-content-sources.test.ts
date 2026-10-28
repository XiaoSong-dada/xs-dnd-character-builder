import { afterEach, describe, expect, it } from 'vitest'

import { emptyBundle } from '@/rules/custom-content'
import { getCustomContentRevision, getCustomSources, registerCustomContent, resetCustomContent } from '@/rules/repositories'
import { getDefaultEnabledSourceIds, getSelectableSources, normalizeEnabledSourceIds } from '@/rules/source-books'
import type { CustomExpansion } from '@/types/custom-content'

const NOW = '2026-10-19T00:00:00.000Z'

function expansion(overrides: Partial<CustomExpansion> = {}): CustomExpansion {
  return {
    id: 'source-custom-workshop',
    ruleset: '5e-2024',
    title: '我的 2024 自制书',
    shortTitle: '自制2024',
    defaultEnabled: true,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  }
}

describe('内容工坊：来源白名单与默认启用', () => {
  afterEach(() => {
    resetCustomContent()
  })

  it('自定义扩展出现在可切换来源中', () => {
    registerCustomContent('5e-2024', { ...emptyBundle(), expansions: [expansion()] })
    expect(getSelectableSources('5e-2024').map((source) => source.id)).toContain('source-custom-workshop')
    expect(getCustomSources('5e-2024')).toHaveLength(1)
  })

  it('默认启用的自定义扩展进入新草稿默认来源（2024 原本默认为空）', () => {
    registerCustomContent('5e-2024', { ...emptyBundle(), expansions: [expansion()] })
    expect(getDefaultEnabledSourceIds('5e-2024')).toEqual(['source-custom-workshop'])
  })

  it('关闭默认启用后不再进入新草稿，但仍可手动勾选', () => {
    registerCustomContent('5e-2024', { ...emptyBundle(), expansions: [expansion({ id: 'source-custom-off', defaultEnabled: false })] })
    expect(getDefaultEnabledSourceIds('5e-2024')).not.toContain('source-custom-off')
    expect(getSelectableSources('5e-2024').map((source) => source.id)).toContain('source-custom-off')
  })

  it('草稿来源归一化不得丢弃自定义来源 ID', () => {
    registerCustomContent('5e-2024', { ...emptyBundle(), expansions: [expansion()] })
    const normalized = normalizeEnabledSourceIds(
      ['source-custom-workshop', 'source-2024-ua-eberron', 'source-does-not-exist'],
      '5e-2024',
    )
    expect(normalized).toContain('source-custom-workshop')
    expect(normalized).toContain('source-2024-ua-eberron')
    expect(normalized).not.toContain('source-does-not-exist')
  })

  it('2014 默认来源仍保持内置全选，并追加自定义扩展', () => {
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion({ id: 'source-custom-2014', ruleset: '5e-2014', title: '自制 2014', shortTitle: '自制14' })],
    })
    const defaults = getDefaultEnabledSourceIds('5e-2014')
    expect(defaults.length).toBeGreaterThan(0)
    expect(defaults).toContain('source-custom-2014')
  })

  it('注册与清空都会推进内容版本号', () => {
    const before = getCustomContentRevision()
    registerCustomContent('5e-2024', { ...emptyBundle(), expansions: [expansion()] })
    const afterRegister = getCustomContentRevision()
    expect(afterRegister).toBeGreaterThan(before)
    resetCustomContent()
    expect(getCustomContentRevision()).toBeGreaterThan(afterRegister)
  })
})
