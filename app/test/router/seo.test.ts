import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

async function loadSeo() {
  const mod = await import('@/router/seo')
  return mod
}

function routeContext(meta: Record<string, unknown>, path: string) {
  return { meta, path }
}

describe('resolveCanonicalUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('按路径拼接站点根 URL，根路径不带尾斜杠', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://dnd.example.com')
    const { resolveCanonicalUrl } = await loadSeo()
    expect(resolveCanonicalUrl('/character-builder')).toBe('https://dnd.example.com/character-builder')
    expect(resolveCanonicalUrl('/')).toBe('https://dnd.example.com')
  })

  it('去除路径尾斜杠', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://dnd.example.com')
    const { resolveCanonicalUrl } = await loadSeo()
    expect(resolveCanonicalUrl('/dice/')).toBe('https://dnd.example.com/dice')
  })

  it('未配置站点 URL 时返回 undefined', async () => {
    vi.stubEnv('VITE_SITE_URL', '')
    const { resolveCanonicalUrl } = await loadSeo()
    expect(resolveCanonicalUrl('/character-builder')).toBeUndefined()
  })
})

describe('applySeoMeta', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    document.head.innerHTML = ''
  })

  it('设置标题、description 与 canonical', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://dnd.example.com')
    const { applySeoMeta } = await loadSeo()
    applySeoMeta(routeContext({ title: '辅助车卡 | 测试站', description: '页面描述。' }, '/character-builder'))

    expect(document.title).toBe('辅助车卡 | 测试站')
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('页面描述。')
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'))
      .toBe('https://dnd.example.com/character-builder')
  })

  it('无 description 时移除已有标签，未配置站点 URL 时移除 canonical', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://dnd.example.com')
    const { applySeoMeta } = await loadSeo()
    applySeoMeta(routeContext({ title: '有描述页' }, '/dice'))
    applySeoMeta(routeContext({ title: '无描述页' }, '/profile'))

    expect(document.head.querySelector('meta[name="description"]')).toBeNull()
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'))
      .toBe('https://dnd.example.com/profile')

    vi.unstubAllEnvs()
    vi.resetModules()
    vi.stubEnv('VITE_SITE_URL', '')
    const seoReloaded = await loadSeo()
    seoReloaded.applySeoMeta(routeContext({ title: '无站点配置页' }, '/profile'))
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
  })

  it('缺少 title 时使用默认标题', async () => {
    const { applySeoMeta, DEFAULT_TITLE } = await loadSeo()
    applySeoMeta(routeContext({}, '/profile'))
    expect(document.title).toBe(DEFAULT_TITLE)
  })

  it('重复调用时覆盖已有标签而非重复添加', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://dnd.example.com')
    const { applySeoMeta } = await loadSeo()
    applySeoMeta(routeContext({ title: '页面 A', description: '描述 A。' }, '/character-builder'))
    applySeoMeta(routeContext({ title: '页面 B', description: '描述 B。' }, '/dice'))

    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('描述 B。')
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'))
      .toBe('https://dnd.example.com/dice')
  })
})
