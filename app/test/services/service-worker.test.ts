import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 服务内部会按 isDev 短路（开发服务不生成 sw.js），测试里固定为生产模式。
vi.mock('@/config/setting', () => ({ isDev: false }))
vi.mock('@/config/site', () => ({ baseUrl: '/' }))

type Listener = (event: unknown) => void

class FakeTarget {
  private readonly listeners = new Map<string, Set<Listener>>()

  addEventListener(type: string, listener: Listener): void {
    const bucket = this.listeners.get(type) ?? new Set<Listener>()
    bucket.add(listener)
    this.listeners.set(type, bucket)
  }

  emit(type: string): void {
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener({ type })
  }
}

class FakeWorker extends FakeTarget {
  state: ServiceWorkerState = 'installing'
  readonly messages: unknown[] = []

  postMessage(message: unknown): void {
    this.messages.push(message)
  }

  install(): void {
    this.state = 'installed'
    this.emit('statechange')
  }
}

class FakeRegistration extends FakeTarget {
  installing: FakeWorker | null = null
  waiting: FakeWorker | null = null

  update = vi.fn(async () => undefined)
}

class FakeContainer extends FakeTarget {
  controller: unknown = null
  readonly registration = new FakeRegistration()

  register = vi.fn(async () => this.registration as unknown as ServiceWorkerRegistration)
}

interface Env {
  readonly container: FakeContainer
  readonly runtime: { container: ServiceWorkerContainer, reload: () => void }
  readonly reload: ReturnType<typeof vi.fn>
}

function createEnv(): Env {
  const container = new FakeContainer()
  const reload = vi.fn()
  return {
    container,
    reload,
    runtime: { container: container as unknown as ServiceWorkerContainer, reload },
  }
}

/** 每个用例都重新加载模块：服务内部保存 registration / waiting worker 等状态。 */
async function loadService() {
  vi.resetModules()
  return import('@/services/service-worker')
}

/** 让下一次 registration.update() 装好一个新外壳，模拟「服务器上确实有新 sw.js」。 */
function installOnUpdate(env: Env): FakeWorker {
  const worker = new FakeWorker()
  env.container.registration.update.mockImplementationOnce(async () => {
    env.container.registration.installing = worker
    env.container.registration.emit('updatefound')
    worker.install()
  })
  return worker
}

/** 上一次 applyServiceWorkerUpdate 真正发过激活指令后，浏览器接管才刷新。 */
async function reachWaitingState(service: Awaited<ReturnType<typeof loadService>>, env: Env): Promise<FakeWorker> {
  env.container.controller = new FakeWorker()
  const waiting = new FakeWorker()
  env.container.registration.waiting = waiting
  await service.registerServiceWorker(vi.fn(), env.runtime)
  return waiting
}

describe('Service Worker 注册与更新', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('没有可用运行环境时返回不可用且不抛错', async () => {
    const service = await loadService()
    const onUpdateAvailable = vi.fn()

    expect(service.isServiceWorkerSupported(undefined)).toBe(false)
    await expect(service.registerServiceWorker(onUpdateAvailable, undefined)).resolves.toBe('unavailable')
    expect(onUpdateAvailable).not.toHaveBeenCalled()
    await expect(service.applyServiceWorkerUpdate(undefined)).resolves.toBe(false)
  })

  it('注册失败时静默降级，不影响其他功能', async () => {
    const service = await loadService()
    const env = createEnv()
    env.container.register.mockRejectedValueOnce(new Error('registration failed'))

    await expect(service.registerServiceWorker(vi.fn(), env.runtime)).resolves.toBe('failed')
    expect(service.hasWaitingUpdate()).toBe(false)
  })

  it('首次安装不提示更新：没有旧 SW 在控制页面', async () => {
    const service = await loadService()
    const env = createEnv()
    const onUpdateAvailable = vi.fn()
    const worker = new FakeWorker()
    env.container.registration.installing = worker

    await expect(service.registerServiceWorker(onUpdateAvailable, env.runtime)).resolves.toBe('registered')

    env.container.registration.emit('updatefound')
    worker.install()
    expect(onUpdateAvailable).not.toHaveBeenCalled()
    expect(service.hasWaitingUpdate()).toBe(false)
    expect(env.reload).not.toHaveBeenCalled()
  })

  it('已有 SW 接管时，新版本装好即提示更新且不自动刷新', async () => {
    const service = await loadService()
    const env = createEnv()
    env.container.controller = new FakeWorker()
    const onUpdateAvailable = vi.fn()
    const worker = new FakeWorker()
    env.container.registration.installing = worker

    await service.registerServiceWorker(onUpdateAvailable, env.runtime)
    env.container.registration.emit('updatefound')
    worker.install()

    expect(onUpdateAvailable).toHaveBeenCalledTimes(1)
    expect(service.hasWaitingUpdate()).toBe(true)
    expect(env.reload).not.toHaveBeenCalled()
  })

  it('上一轮遗留的等待版本在注册时立刻提示', async () => {
    const service = await loadService()
    const env = createEnv()
    env.container.controller = new FakeWorker()
    env.container.registration.waiting = new FakeWorker()
    const onUpdateAvailable = vi.fn()

    await expect(service.registerServiceWorker(onUpdateAvailable, env.runtime)).resolves.toBe('update-available')
    expect(onUpdateAvailable).toHaveBeenCalledTimes(1)
    expect(service.hasWaitingUpdate()).toBe(true)
  })

  it('已有等待版本时，确认更新只发送激活指令，接管后才刷新一次', async () => {
    const service = await loadService()
    const env = createEnv()
    const waiting = await reachWaitingState(service, env)

    await expect(service.applyServiceWorkerUpdate(env.runtime)).resolves.toBe(true)
    expect(waiting.messages).toEqual([{ type: 'SKIP_WAITING' }])
    expect(env.reload).not.toHaveBeenCalled()

    env.container.emit('controllerchange')
    expect(env.reload).toHaveBeenCalledTimes(1)

    // 后续接管事件不应重复刷新，否则用户会被反复打断。
    env.container.emit('controllerchange')
    expect(env.reload).toHaveBeenCalledTimes(1)
  })

  it('还没有等待版本时先请浏览器去查一次，查到新外壳后走激活而不是整页刷新', async () => {
    const service = await loadService()
    const env = createEnv()
    env.container.controller = new FakeWorker()
    await service.registerServiceWorker(vi.fn(), env.runtime)
    const worker = installOnUpdate(env)

    await expect(service.applyServiceWorkerUpdate(env.runtime)).resolves.toBe(true)

    expect(env.container.registration.update).toHaveBeenCalledTimes(1)
    expect(worker.messages).toEqual([{ type: 'SKIP_WAITING' }])
    // 还没接管，不应该已经刷新
    expect(env.reload).not.toHaveBeenCalled()
  })

  it('查询超时仍没有新外壳时整页刷新兜底', async () => {
    vi.useFakeTimers()
    const service = await loadService()
    const env = createEnv()
    env.container.controller = new FakeWorker()
    await service.registerServiceWorker(vi.fn(), env.runtime)

    const applying = service.applyServiceWorkerUpdate(env.runtime)
    // 超时上限是内部实现细节，这里推进到远超它的时间即可。
    await vi.advanceTimersByTimeAsync(60_000)

    await expect(applying).resolves.toBe(true)
    expect(env.container.registration.update).toHaveBeenCalledTimes(1)
    expect(env.reload).toHaveBeenCalledTimes(1)
  })

  it('注册失败导致没有 registration 时，仍以整页刷新兜底且不抛错', async () => {
    vi.useFakeTimers()
    const service = await loadService()
    const env = createEnv()
    env.container.register.mockRejectedValueOnce(new Error('registration failed'))
    await service.registerServiceWorker(vi.fn(), env.runtime)

    const applying = service.applyServiceWorkerUpdate(env.runtime)
    await vi.advanceTimersByTimeAsync(60_000)

    await expect(applying).resolves.toBe(true)
    expect(env.reload).toHaveBeenCalledTimes(1)
  })
})
