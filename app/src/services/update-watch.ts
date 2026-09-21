/**
 * 更新检测的触发时机收束点。
 *
 * 启动时那一次对账只覆盖「打开页面」这一刻。页面一直开着、期间发布了新版本，
 * 或者打开时正断网、之后才恢复，都拿不到提示。这里补两个补充时机：
 *
 * - 恢复联网：断网填卡、网络回来的那一刻，是最可能拿到新版本的时机；
 * - 页面重新可见：覆盖「挂在后台很久再切回来」。
 *
 * 本模块只把浏览器事件翻成一次触发信号，**是否真的去请求由调用方决定**。
 * 节流需要知道上一次对账有没有拿到结论，那是 store 的知识，不是 DOM 的；
 * 这与 `service-worker.ts` 只负责接线、策略留给 store 的分工一致。
 */

/** 浏览器环境；显式注入以便在测试里替换（同 `src/services/service-worker.ts` 的做法）。 */
export interface UpdateWatchRuntime {
  /** 订阅「恢复联网」，返回解绑函数。 */
  readonly subscribeOnline: (listener: () => void) => () => void
  /** 订阅「可见性变化」，返回解绑函数。 */
  readonly subscribeVisibility: (listener: () => void) => () => void
  /** 当前页面是否可见；`visibilitychange` 在隐藏与显示时都会触发，用它区分。 */
  readonly isVisible: () => boolean
}

function subscribeTo(target: EventTarget, type: string): (listener: () => void) => () => void {
  return (listener) => {
    target.addEventListener(type, listener)
    return () => target.removeEventListener(type, listener)
  }
}

function browserRuntime(): UpdateWatchRuntime | undefined {
  if (typeof window === 'undefined' || typeof document === 'undefined') return undefined
  return {
    subscribeOnline: subscribeTo(window, 'online'),
    subscribeVisibility: subscribeTo(document, 'visibilitychange'),
    isVisible: () => document.visibilityState === 'visible',
  }
}

/**
 * 登记两个触发时机，返回解绑函数。
 *
 * `onTrigger` 可能被连续调用（例如同时收到 `online` 与可见性变化），
 * 去重与节流是调用方的责任，这里不做任何合并。
 */
export function watchUpdateTriggers(
  onTrigger: () => void,
  runtime: UpdateWatchRuntime | undefined = browserRuntime(),
): () => void {
  if (!runtime) return () => {}

  const unsubscribeOnline = runtime.subscribeOnline(() => onTrigger())
  const unsubscribeVisibility = runtime.subscribeVisibility(() => {
    if (runtime.isVisible()) onTrigger()
  })

  return () => {
    unsubscribeOnline()
    unsubscribeVisibility()
  }
}
