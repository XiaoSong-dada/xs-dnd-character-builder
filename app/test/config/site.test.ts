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
    vi.stubEnv('VITE_APP_VERSION', '0.1.0')

    const config = await loadConfig()
    expect(config).toEqual({
      authorName: '小宋哒哒',
      githubUrl: 'https://github.com/XiaoSong-dada',
      tagline: undefined,
      version: '0.1.0',
    })
  })

  it('空串与空白归一化为 undefined', async () => {
    vi.stubEnv('VITE_AUTHOR_NAME', '')
    vi.stubEnv('VITE_GITHUB_URL', '   ')
    vi.stubEnv('VITE_APP_VERSION', '')

    const config = await loadConfig()
    expect(config.authorName).toBeUndefined()
    expect(config.githubUrl).toBeUndefined()
    expect(config.version).toBeUndefined()
  })
})
