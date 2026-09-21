import { afterEach, describe, expect, it, vi } from 'vitest'

const LOCAL_BUILD_ID = 'abc1234'

interface LoadOptions {
  readonly isDev?: boolean
}

/** 每个用例都重新加载模块：这样可以在同一文件里分别固定 isDev 的两种取值。 */
async function loadService(options: LoadOptions = {}) {
  vi.resetModules()
  vi.doMock('@/config/setting', () => ({
    isDev: options.isDev ?? false,
    appBuildId: LOCAL_BUILD_ID,
    appBuildIdDirty: false,
    APP_BUILD_ID_DIRTY_MARKER: '-dirty-',
  }))
  vi.doMock('@/config/site', () => ({ baseUrl: '/' }))
  return import('@/services/app-build-id')
}

function responseWith(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as unknown as Response
}

function runtimeReturning(response: Response) {
  const fetchMock = vi.fn(async () => response)
  return { fetchMock, runtime: { fetch: fetchMock as unknown as typeof fetch, url: '/version.json' } }
}

afterEach(() => {
  vi.doUnmock('@/config/setting')
  vi.doUnmock('@/config/site')
  vi.restoreAllMocks()
})

describe('远端构建清单解析', () => {
  it('只接受非空字符串 id', async () => {
    const service = await loadService()

    expect(service.readRemoteBuildId({ id: 'abc1234' })).toBe('abc1234')
    expect(service.readRemoteBuildId({ id: '  abc1234  ' })).toBe('abc1234')
    expect(service.readRemoteBuildId({ id: '' })).toBeUndefined()
    expect(service.readRemoteBuildId({ id: '   ' })).toBeUndefined()
    expect(service.readRemoteBuildId({ id: 42 })).toBeUndefined()
    expect(service.readRemoteBuildId({})).toBeUndefined()
    expect(service.readRemoteBuildId(null)).toBeUndefined()
    expect(service.readRemoteBuildId('abc1234')).toBeUndefined()
  })
})

describe('更新检测对账', () => {
  it('没有可用运行环境时返回无法判断，且不抛错', async () => {
    const service = await loadService()
    await expect(service.checkRemoteBuildId(undefined)).resolves.toBe('unavailable')
  })

  it('开发服务不产出构建清单，直接跳过以免控制台出现 404 噪声', async () => {
    const service = await loadService({ isDev: true })
    const { fetchMock, runtime } = runtimeReturning(responseWith({ id: 'other99' }))

    await expect(service.checkRemoteBuildId(runtime)).resolves.toBe('unavailable')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('远端标识与本机一致时为已是最新', async () => {
    const service = await loadService()
    const { runtime } = runtimeReturning(responseWith({ id: LOCAL_BUILD_ID }))

    await expect(service.checkRemoteBuildId(runtime)).resolves.toBe('up-to-date')
  })

  it('远端标识与本机不同时判定为可更新', async () => {
    const service = await loadService()
    const { runtime } = runtimeReturning(responseWith({ id: 'fedcba9-dirty-9f8e7d6a' }))

    await expect(service.checkRemoteBuildId(runtime)).resolves.toBe('update-available')
  })

  it('拉取必须绕过缓存，否则会长期给出错误的已是最新', async () => {
    const service = await loadService()
    const { fetchMock, runtime } = runtimeReturning(responseWith({ id: LOCAL_BUILD_ID }))

    await service.checkRemoteBuildId(runtime)

    expect(fetchMock).toHaveBeenCalledWith('/version.json', { cache: 'no-store' })
  })

  it('清单不存在（非 2xx）时无法判断', async () => {
    const service = await loadService()
    const { runtime } = runtimeReturning(responseWith(undefined, false))

    await expect(service.checkRemoteBuildId(runtime)).resolves.toBe('unavailable')
  })

  it('清单格式不符时无法判断，而不是误判为可更新', async () => {
    const service = await loadService()
    const { runtime } = runtimeReturning(responseWith({ commit: 'abc1234' }))

    await expect(service.checkRemoteBuildId(runtime)).resolves.toBe('unavailable')
  })

  it('离线或 JSON 解析失败时静默归为无法判断', async () => {
    const service = await loadService()
    const offline = { fetch: vi.fn(async () => { throw new Error('offline') }) as unknown as typeof fetch, url: '/version.json' }
    const broken = {
      fetch: vi.fn(async () => ({ ok: true, json: async () => { throw new Error('bad json') } })) as unknown as typeof fetch,
      url: '/version.json',
    }

    await expect(service.checkRemoteBuildId(offline)).resolves.toBe('unavailable')
    await expect(service.checkRemoteBuildId(broken)).resolves.toBe('unavailable')
  })
})
