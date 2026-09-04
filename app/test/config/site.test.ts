import { afterEach, describe, expect, it, vi } from 'vitest'

describe('siteConfig 环境变量归一化', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  async function loadConfig() {
    const mod = await import('@/config/site')
    return mod.siteConfig
  }

  it('读取配置值并归一化', async () => {
    vi.stubEnv('VITE_AUTHOR_NAME', '小宋哒哒')
    vi.stubEnv('VITE_GITHUB_URL', 'https://github.com/XiaoSong-dada')
    vi.stubEnv('VITE_SITE_URL', ' https://dnd.example.com/ ')
    vi.stubEnv('VITE_SITE_IMAGE', 'https://dnd.example.com/og.png')
    vi.stubEnv('VITE_TIP_WECHAT_QR_URL', ' /local-assets/tips/wechat.jpg ')
    vi.stubEnv('VITE_TIP_ALIPAY_QR_URL', '/local-assets/tips/alipay.jpg')
    vi.stubEnv('VITE_UMAMI_SCRIPT_URL', ' https://umami.example.com/script.js ')
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', ' website-id ')
    vi.stubEnv('VITE_UMAMI_DOMAINS', 'example.com, www.example.com ')

    const config = await loadConfig()
    expect(config).toEqual({
      authorName: '小宋哒哒',
      githubUrl: 'https://github.com/XiaoSong-dada',
      tagline: undefined,
      version: __APP_VERSION__,
      siteUrl: 'https://dnd.example.com',
      siteImage: 'https://dnd.example.com/og.png',
      tipQrCodes: {
        wechatUrl: '/local-assets/tips/wechat.jpg',
        alipayUrl: '/local-assets/tips/alipay.jpg',
      },
      umami: {
        scriptUrl: 'https://umami.example.com/script.js',
        websiteId: 'website-id',
        domains: ['example.com', 'www.example.com'],
      },
    })
  })

  it('空串与空白归一化为 undefined', async () => {
    vi.stubEnv('VITE_AUTHOR_NAME', '')
    vi.stubEnv('VITE_GITHUB_URL', '   ')
    vi.stubEnv('VITE_SITE_URL', '   ')
    vi.stubEnv('VITE_SITE_IMAGE', '')
    vi.stubEnv('VITE_TIP_WECHAT_QR_URL', ' ')
    vi.stubEnv('VITE_TIP_ALIPAY_QR_URL', '')
    vi.stubEnv('VITE_UMAMI_SCRIPT_URL', ' ')
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', '')
    vi.stubEnv('VITE_UMAMI_DOMAINS', ' , ')

    const config = await loadConfig()
    expect(config.authorName).toBeUndefined()
    expect(config.githubUrl).toBeUndefined()
    expect(config.version).toBe(__APP_VERSION__)
    expect(config.siteUrl).toBeUndefined()
    expect(config.siteImage).toBeUndefined()
    expect(config.tipQrCodes).toEqual({ wechatUrl: undefined, alipayUrl: undefined })
    expect(config.umami).toEqual({
      scriptUrl: undefined,
      websiteId: undefined,
      domains: [],
    })
  })
})
