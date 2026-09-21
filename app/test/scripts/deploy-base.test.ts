import { describe, expect, it } from 'vitest'

import {
  normalizeDeployBase,
  resolveDeployPath,
  resolveDeployUrl,
  templatesDenylistPattern,
} from '../../scripts/deploy-base'

describe('部署基路径归一化', () => {
  it('未配置或显式根路径时保持根部署', () => {
    expect(normalizeDeployBase(undefined)).toBe('/')
    expect(normalizeDeployBase('')).toBe('/')
    expect(normalizeDeployBase('   ')).toBe('/')
    expect(normalizeDeployBase('/')).toBe('/')
  })

  it('补齐首尾斜杠，兼容两种写法', () => {
    expect(normalizeDeployBase('xs-dnd-character-builder')).toBe('/xs-dnd-character-builder/')
    expect(normalizeDeployBase('/xs-dnd-character-builder')).toBe('/xs-dnd-character-builder/')
    expect(normalizeDeployBase('xs-dnd-character-builder/')).toBe('/xs-dnd-character-builder/')
    expect(normalizeDeployBase('/xs-dnd-character-builder/')).toBe('/xs-dnd-character-builder/')
  })

  it('支持多级前缀并忽略多余斜杠与空白', () => {
    expect(normalizeDeployBase('  /apps/dnd/  ')).toBe('/apps/dnd/')
    expect(normalizeDeployBase('//apps//dnd//')).toBe('/apps/dnd/')
  })
})

describe('公开路径拼接', () => {
  it('根部署保持历史行为', () => {
    expect(resolveDeployPath('/', '/')).toBe('/')
    expect(resolveDeployPath('/', '/character-builder')).toBe('/character-builder')
    expect(resolveDeployPath('/', '/dice/')).toBe('/dice')
  })

  it('子路径部署带上前缀', () => {
    const base = '/xs-dnd-character-builder/'
    expect(resolveDeployPath(base, '/')).toBe('/xs-dnd-character-builder/')
    expect(resolveDeployPath(base, '/character-builder')).toBe('/xs-dnd-character-builder/character-builder')
    expect(resolveDeployPath(base, 'character-builder/')).toBe('/xs-dnd-character-builder/character-builder')
  })
})

describe('公开绝对 URL', () => {
  it('根路径不追加多余斜杠', () => {
    expect(resolveDeployUrl('https://dnd.example.com', '/', '/')).toBe('https://dnd.example.com')
    expect(resolveDeployUrl('https://dnd.example.com', '/', '/dice')).toBe('https://dnd.example.com/dice')
  })

  it('站点根 URL 不含部署前缀，前缀由基路径补上', () => {
    const siteUrl = 'https://example.com'
    const base = '/xs-dnd-character-builder/'
    expect(resolveDeployUrl(siteUrl, base, '/character-builder'))
      .toBe('https://example.com/xs-dnd-character-builder/character-builder')
  })
})

describe('离线导航排除清单', () => {
  it('根部署沿用 templates/ 前缀', () => {
    const pattern = templatesDenylistPattern('/')
    expect(pattern.test('/templates/character-sheet-zh.pdf')).toBe(true)
    expect(pattern.test('/character-builder')).toBe(false)
  })

  it('子路径部署下仍能命中带前缀的模板地址', () => {
    const pattern = templatesDenylistPattern('/xs-dnd-character-builder/')
    expect(pattern.test('/xs-dnd-character-builder/templates/character-sheet-zh.pdf')).toBe(true)
    expect(pattern.test('/templates/character-sheet-zh.pdf')).toBe(false)
  })
})
