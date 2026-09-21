import { appBuildId, isDev } from '@/config/setting'
import { baseUrl } from '@/config/site'

/** 与构建脚本 `scripts/app-build-id.ts` 的 `APP_BUILD_ID_FILE` 对应。 */
const APP_BUILD_ID_URL = `${baseUrl}version.json`

/**
 * 更新检测结果。
 * - `up-to-date`：远端部署与本机是同一个构建；
 * - `update-available`：远端是另一个构建；
 * - `unavailable`：拿不到结论（离线、未部署版本清单、响应格式不符）。
 *   这不是错误：离线本来就是 PWA 的正常工作状态，因此不向调用方抛异常。
 */
export type AppUpdateCheckOutcome = 'up-to-date' | 'update-available' | 'unavailable'

/** 浏览器运行环境；显式注入以便在测试里替换（同 `src/services/service-worker.ts` 的做法）。 */
export interface BuildIdRuntime {
  readonly fetch: typeof fetch
  readonly url: string
}

function browserRuntime(): BuildIdRuntime | undefined {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return undefined
  return { fetch: window.fetch.bind(window), url: APP_BUILD_ID_URL }
}

/** 校验远端清单格式，只认非空的字符串 id。 */
export function readRemoteBuildId(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined
  const id = (payload as { id?: unknown }).id
  return typeof id === 'string' && id.trim() ? id.trim() : undefined
}

/**
 * 拉取远端构建标识并与本机比对。
 *
 * 使用 `cache: 'no-store'`：这份清单是更新检测的唯一依据，
 * 一旦命中浏览器启发式缓存就会长期给出错误的「已是最新」。
 * nginx 侧另有 `Cache-Control: no-cache`（见 `app/nginx.conf`），两边都需要。
 */
export async function checkRemoteBuildId(
  runtime: BuildIdRuntime | undefined = browserRuntime(),
): Promise<AppUpdateCheckOutcome> {
  if (!runtime) return 'unavailable'
  // 开发服务不产出 version.json，拉取只会往控制台写 404 噪声。
  if (isDev) return 'unavailable'

  try {
    const response = await runtime.fetch(runtime.url, { cache: 'no-store' })
    if (!response.ok) return 'unavailable'

    const remote = readRemoteBuildId(await response.json())
    if (!remote) return 'unavailable'

    return remote === appBuildId ? 'up-to-date' : 'update-available'
  } catch {
    // 离线、DNS 失败、JSON 解析失败都归为「拿不到结论」，不影响任何本地功能。
    return 'unavailable'
  }
}
