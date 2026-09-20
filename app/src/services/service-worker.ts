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

function browserRuntime(): ServiceWorkerRuntime | undefined {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return undefined
  // Service Worker 只在安全上下文（HTTPS 或 localhost）可用。
  // 纯 HTTP 部署下直接放弃，车卡、导出与本地草稿都不受影响。
  if (!window.isSecureContext) return undefined
  const container = navigator.serviceWorker
  if (!container) return undefined
  return { container, reload: () => window.location.reload() }
}

/** 等待用户确认的新版本；由 `applyServiceWorkerUpdate` 消费。 */
let waitingWorker: ServiceWorker | undefined
/** 是否已发出激活指令、正在等待接管；用来过滤首次安装时的 controllerchange。 */
let pendingReload = false

export function isServiceWorkerSupported(runtime: ServiceWorkerRuntime | undefined = browserRuntime()): boolean {
  return Boolean(runtime)
}

/**
 * 注册 Service Worker。只在浏览器端调用（`main.ts` 在 `typeof window` 守卫下触发）。
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

  // 必须在 register 之前挂监听，否则可能在 await 期间漏掉接管事件。
  runtime.container.addEventListener('controllerchange', () => {
    if (!pendingReload) return
    pendingReload = false
    runtime.reload()
  })

  try {
    const registration = await runtime.container.register(SERVICE_WORKER_URL, { scope: SERVICE_WORKER_SCOPE })

    // 上一轮已经下载好、但用户当时没有刷新的版本，此刻仍在等待。
    if (registration.waiting && runtime.container.controller) {
      waitingWorker = registration.waiting
      onUpdateAvailable()
      return 'update-available'
    }

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing
      if (!installing) return
      installing.addEventListener('statechange', () => {
        // 已有 SW 在控制页面时才算「版本更新」；否则是首次安装，不该提示刷新。
        if (installing.state !== 'installed' || !runtime.container.controller) return
        waitingWorker = installing
        onUpdateAvailable()
      })
    })

    return 'registered'
  } catch {
    // 注册失败不影响任何车卡与导出功能，静默降级。
    return 'failed'
  }
}

/**
 * 用户确认更新后激活等待中的版本。
 * 生成的 sw.js 内含 `SKIP_WAITING` 消息监听，激活后会触发 `controllerchange` 自动刷新。
 * 返回是否真的发出了激活指令（没有待更新版本时为 false）。
 */
export function applyServiceWorkerUpdate(
  runtime: ServiceWorkerRuntime | undefined = browserRuntime(),
): boolean {
  if (!runtime || !waitingWorker) return false
  pendingReload = true
  waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  return true
}
