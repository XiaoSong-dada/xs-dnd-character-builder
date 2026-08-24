import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

import type { ViteSSGContext } from 'vite-ssg'

// 本期预渲染清单（docs/seo-requirements.md §P1-1）：
// 根路径（重定向后渲染车卡页）+ 辅助车卡 + 赛博骰娘 + 404（命中 catch-all 路由）
const INCLUDED_ROUTES = ['/', '/character-builder', '/assistant', '/dice', '/404']
const DEFAULT_TITLE = 'D&D车卡辅助'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function replaceTag(html: string, pattern: RegExp, replacement: string): string {
  return html.replace(pattern, replacement)
}

/**
 * 预渲染每页 HTML 后，把模板中的站点级 title/description/canonical 替换为
 * 当前路由 meta 对应的值（客户端导航时的 head 更新由 src/router/seo.ts 负责）。
 */
function injectRouteSeo(route: string, renderedHtml: string, appCtx: ViteSSGContext, siteUrl: string | undefined): string {
  const meta = appCtx.router.currentRoute.value.meta
  const title = typeof meta.title === 'string' ? meta.title : DEFAULT_TITLE
  const description = typeof meta.description === 'string' ? meta.description : undefined
  const canonical = siteUrl ? `${siteUrl}${route === '/' ? '' : route}` : undefined

  let html = replaceTag(
    renderedHtml,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(title)}</title>`,
  )

  // vite-ssg 解析模板后 html 标签被重写，恢复站点语言
  html = replaceTag(html, /<html[^>]*>/, '<html lang="zh-CN">')

  const descriptionPattern = /<meta\s+name="description"[^>]*>/i
  html = description
    ? replaceTag(html, descriptionPattern, `<meta name="description" content="${escapeHtml(description)}" />`)
    : replaceTag(html, descriptionPattern, '')

  const canonicalPattern = /<link\s+rel="canonical"[^>]*>/i
  html = canonical
    ? replaceTag(html, canonicalPattern, `<link rel="canonical" href="${escapeHtml(canonical)}" />`)
    : replaceTag(html, canonicalPattern, '')

  // og:url 指向当前页面（模板中的 %VITE_SITE_URL% 仅为站点根）
  const ogUrlPattern = /<meta\s+property="og:url"[^>]*>/i
  html = canonical
    ? replaceTag(html, ogUrlPattern, `<meta property="og:url" content="${escapeHtml(canonical)}" />`)
    : replaceTag(html, ogUrlPattern, '')

  return html
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = env.VITE_SITE_URL?.trim().replace(/\/+$/, '') || undefined

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [vue()],
    ssgOptions: {
      dirStyle: 'nested',
      includedRoutes: () => INCLUDED_ROUTES,
      onPageRendered: (route, renderedHtml, appCtx) => injectRouteSeo(route, renderedHtml, appCtx, siteUrl),
    },
    test: {
      environment: 'happy-dom',
      include: ['test/**/*.test.ts'],
    },
  }
})
