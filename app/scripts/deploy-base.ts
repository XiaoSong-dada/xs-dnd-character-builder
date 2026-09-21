/**
 * 部署基路径（子路径部署）支持。
 *
 * 应用可能被挂在域名子路径下，例如 `https://example.com/xs-dnd-character-builder/`。
 * 这种部署必须让**构建产物自己**带上前缀：Vite 的 `base` 会写进 index.html 的资源引用、
 * 路由 href、预渲染产物的静态文件名，运行时的 Service Worker 注册、模板与 version.json
 * 则统一从 `import.meta.env.BASE_URL`（= 本文件的归一化结果）推导。
 *
 * 不要在反向代理上用 `sub_filter` 改写 HTML 来伪造前缀：那只能改到 HTML 文本，
 * JS 里运行时拼出来的路径（SW 注册、懒加载 chunk、模板 URL）一个都改不到，必然漏。
 *
 * 维护约定：`VITE_BASE_URL` 为空或 `/` 时保持根路径部署，行为与历史版本完全一致。
 */

/** 把外部传入的基路径归一化成 Vite `base` 需要的形态：非根路径时始终以 `/` 开头和结尾。 */
export function normalizeDeployBase(value: string | undefined): string {
  const trimmed = value?.trim()
  if (!trimmed || trimmed === '/') return '/'

  // 折叠重复与首尾斜杠：`//apps//dnd//` 与 `/apps/dnd/` 必须得到同一个前缀，
  // 否则产物里的资源路径会带出双斜杠，而 nginx 与 Vite 对它的处理并不一致。
  const segments = trimmed
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join('/')

  return segments ? `/${segments}/` : '/'
}

/** 路由路径对应的公开路径（含部署前缀），用于 canonical / og:url。 */
export function resolveDeployPath(base: string, route: string): string {
  const prefix = base.replace(/\/+$/, '')
  const normalizedRoute = route.trim()
  if (!normalizedRoute || normalizedRoute === '/') return prefix ? `${prefix}/` : '/'
  return `${prefix}/${normalizedRoute.replace(/^\/+/, '').replace(/\/+$/, '')}`
}

/**
 * 公开绝对 URL：站点根 URL + 部署前缀 + 路由路径。
 * 站点根 URL 约定为「不含部署前缀」的站点入口（如 `https://example.com`），
 * 前缀由构建配置提供，避免同一份前缀在两处重复维护。
 */
export function resolveDeployUrl(siteUrl: string, base: string, route: string): string {
  const path = resolveDeployPath(base, route)
  return path === '/' ? siteUrl : `${siteUrl}${path}`
}

function escapeRegExpPattern(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * PWA 离线导航的排除清单：`templates/` 下的 PDF/XLSX 是真实文件，
 * 直接打开链接时不能被 Service Worker 顶成预渲染的 HTML。
 * 必须带上部署前缀，否则子路径部署下这条排除规则会失效。
 */
export function templatesDenylistPattern(base: string): RegExp {
  return new RegExp(`^${escapeRegExpPattern(base)}templates/`)
}
