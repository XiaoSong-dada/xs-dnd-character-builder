import { isDev } from '@/config/setting'
import { baseUrl } from '@/config/site'

/** Service Worker 产物名与作用域必须与 `vite.config.ts` 的 VitePWA 配置保持一致。 */
const SERVICE_WORKER_URL = `${baseUrl}sw.js`
const SERVICE_WORKER_SCOPE = baseUrl

/** 注册结果；UI 只需要区分「不可用/失败」与「已接管」，不需要区分具体错误。 */
export type ServiceWorkerOutcome = 'unavailable' | 'registered' | 'update-available' | 'failed'

/**
 * 浏览器运行环境；显式注入以便在测试里替换（同 `src/services/umami.ts` 的做法）。
 */
export interface ServiceWorkerRuntime {
  readonly container: ServiceWorkerContainer
  readonly reload: () => void
}

/**
 * 等待新外壳进入 waiting 的上限。
 * 超时说明远端构建变了但 sw.js 字节没变（例如只改了构建标识），此时整页刷新即可。
 */
const WAITING_TIMEOUT_MS = 5000

function browserRuntime(): ServiceWorkerRuntime | undefined {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return undefined
  // Service Worker 只在安全上下文（HTTPS 或 localhost）可用。
  // 纯 HTTP 部署下直接放弃，车卡、导出与本地草稿都不受影响。
  if (!window.isSecureContext) return undefined
  const container = navigator.serviceWorker
  if (!container) return undefined
  return { container, reload: () => window.location.reload() }
}

/** 当前注册对象；`applyServiceWorkerUpdate` 需要它来主动索要新版本。 */
let registration: ServiceWorkerRegistration | undefined
/** 等待用户确认的新版本；由 `applyServiceWorkerUpdate` 消费。 */
let waitingWorker: ServiceWorker | undefined
/** 新版本就绪时通知 store；在注册时登记，供 `settleWaiting` 统一触发。 */
let notifyUpdateAvailable: (() => void) | undefined
/** 是否已发出激活指令、正在等待接管；用来过滤首次安装时的 controllerchange。 */
let pendingReload = false
/** `applyServiceWorkerUpdate` 等待新版本就绪时的唤醒句柄。 */
let wakeForWaiting: (() => void) | undefined

/** 记录新版本并把等待中的调用方唤醒；所有「发现可更新」的路径都收敛到这里。 */
function settleWaiting(worker: ServiceWorker): void {
  waitingWorker = worker
  const wake = wakeForWaiting
  wakeForWaiting = undefined
  wake?.()
  notifyUpdateAvailable?.()
}

function waitForWaiting(timeoutMs: number): Promise<boolean> {
  if (waitingWorker) return Promise.resolve(true)
  return new Promise((resolvePromise) => {
    const timer = setTimeout(() => {
      wakeForWaiting = undefined
      resolvePromise(false)
    }, timeoutMs)
    wakeForWaiting = () => {
      clearTimeout(timer)
      resolvePromise(true)
    }
  })
}

export function isServiceWorkerSupported(runtime: ServiceWorkerRuntime | undefined = browserRuntime()): boolean {
  return Boolean(runtime)
}

/** 是否已有等待激活的新版本（git 标识对账之外的兜底信号）。 */
export function hasWaitingUpdate(): boolean {
  return Boolean(waitingWorker)
}

/**
 * 注册 Service Worker。只在浏览器端调用（`App.vue` 在 `onMounted` 中触发）。
 *
 * - 首次安装：没有旧 SW 接管，新 SW 立即激活，加上 `clientsClaim` 当场接管页面，本次访问即可离线；
 * - 版本更新：新 SW 停在 waiting，交给 `onUpdateAvailable` 决定何时提示，不会打断正在填写的内容。
 */
export async function registerServiceWorker(
  onUpdateAvailable: () => void,
  runtime: ServiceWorkerRuntime | undefined = browserRuntime(),
): Promise<ServiceWorkerOutcome> {
  if (!runtime) return 'unavailable'
  // 开发服务不生成 sw.js，注册只会往控制台写 404 噪声。
  if (isDev) return 'unavailable'

  notifyUpdateAvailable = onUpdateAvailable

  // 必须在 register 之前挂监听，否则可能在 await 期间漏掉接管事件。
  runtime.container.addEventListener('controllerchange', () => {
    if (!pendingReload) return
    pendingReload = false
    runtime.reload()
  })

  try {
    registration = await runtime.container.register(SERVICE_WORKER_URL, { scope: SERVICE_WORKER_SCOPE })

    // 上一轮已经下载好、但用户当时没有刷新的版本，此刻仍在等待。
    if (registration.waiting && runtime.container.controller) {
      settleWaiting(registration.waiting)
      return 'update-available'
    }

    registration.addEventListener('updatefound', () => {
      const installing = registration?.installing
      if (!installing) return
      installing.addEventListener('statechange', () => {
        // 已有 SW 在控制页面时才算「版本更新」；否则是首次安装，不该提示刷新。
        if (installing.state !== 'installed' || !runtime.container.controller) return
        settleWaiting(installing)
      })
    })

    return 'registered'
  } catch {
    // 注册失败不影响任何车卡与导出功能，静默降级。
    return 'failed'
  }
}

/**
 * 用户确认更新后切换到新版本。
 *
 * 两条路径：
 * - 已有等待中的新外壳：直接发 `SKIP_WAITING`，激活后触发 `controllerchange` 自动刷新；
 * - 还没有等待中的新外壳（git 标识对账先发现了新构建，但浏览器尚未查过 sw.js）：
 *   先请浏览器去 `registration.update()`，等新外壳装好再走第一条路径；
 *   若超时仍没有新外壳，说明外壳字节没变，整页刷新即可拿到新内容。
 *
 * 返回是否真的执行了切换动作（没有可用运行环境时为 false）。
 */
export async function applyServiceWorkerUpdate(
  runtime: ServiceWorkerRuntime | undefined = browserRuntime(),
): Promise<boolean> {
  if (!runtime) return false

  if (!waitingWorker) {
    const pending = waitForWaiting(WAITING_TIMEOUT_MS)
    try {
      await registration?.update()
    } catch {
      // 查询失败时交给下面的超时兜底，不向 UI 抛错。
    }
    if (!(await pending)) {
      runtime.reload()
      return true
    }
  }

  pendingReload = true
  waitingWorker?.postMessage({ type: 'SKIP_WAITING' })
  return true
}
