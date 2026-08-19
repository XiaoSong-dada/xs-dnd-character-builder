import { siteConfig } from '@/config/site'
import type { RouteMeta } from 'vue-router'

export const DEFAULT_TITLE = 'D&D车卡辅助'
const DESCRIPTION_SELECTOR = 'meta[name="description"]'
const CANONICAL_SELECTOR = 'link[rel="canonical"]'

export interface SeoRouteContext {
  readonly meta: RouteMeta
  readonly path: string
}

export function resolveCanonicalUrl(path: string): string | undefined {
  if (!siteConfig.siteUrl) return undefined
  const normalizedPath = path.length > 1 ? path.replace(/\/+$/, '') : ''
  return `${siteConfig.siteUrl}${normalizedPath}`
}

function setOrRemoveMetaDescription(description: string | undefined) {
  const existing = document.head.querySelector<HTMLMetaElement>(DESCRIPTION_SELECTOR)
  if (!description) {
    existing?.remove()
    return
  }
  if (existing) {
    existing.content = description
    return
  }
  const tag = document.createElement('meta')
  tag.name = 'description'
  tag.content = description
  document.head.append(tag)
}

function setOrRemoveCanonical(href: string | undefined) {
  const existing = document.head.querySelector<HTMLLinkElement>(CANONICAL_SELECTOR)
  if (!href) {
    existing?.remove()
    return
  }
  if (existing) {
    existing.href = href
    return
  }
  const tag = document.createElement('link')
  tag.rel = 'canonical'
  tag.href = href
  document.head.append(tag)
}

export function applySeoMeta(route: SeoRouteContext): void {
  // vite-ssg 预渲染构建期无 document，路由守卫仍会执行，此时直接跳过
  if (typeof document === 'undefined') return
  document.title = route.meta.title ?? DEFAULT_TITLE
  setOrRemoveMetaDescription(route.meta.description)
  setOrRemoveCanonical(resolveCanonicalUrl(route.path))
}
