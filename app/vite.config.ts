import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

import vue from '@vitejs/plugin-vue'
import { loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

import type { ViteSSGContext } from 'vite-ssg'

import { appBuildIdPlugin, resolveAppBuildId } from './scripts/app-build-id'
import { normalizeDeployBase, resolveDeployUrl, templatesDenylistPattern } from './scripts/deploy-base'

// 本期预渲染清单（docs/seo-requirements.md §P1-1）：
// 根路径（重定向后渲染车卡页）+ 辅助车卡 + 赛博骰娘 + 404（命中 catch-all 路由）
const INCLUDED_ROUTES = ['/', '/character-builder', '/assistant', '/dice', '/about', '/404']
const DEFAULT_TITLE = 'D&D车卡辅助'
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version?: unknown }
if (typeof packageJson.version !== 'string' || !packageJson.version.trim()) {
  throw new Error('app/package.json 必须提供非空 version')
}
const APP_VERSION = packageJson.version.trim()

/**
 * PWA 更新检测的对账标识（见 docs/需求文档/PWA离线与可安装-更新计划.md）。
 * 优先取宿主机经 build arg 注入的 APP_BUILD_ID，本地构建则直接读 git；
 * 两者都拿不到时降级为 `v<版本号>-nogit`，此时同一提交的不同构建无法区分，必须显式告警。
 */
const APP_BUILD_ID = resolveAppBuildId(process.cwd(), APP_VERSION)
if (APP_BUILD_ID.source === 'fallback') {
  console.warn(
    `[app-build-id] 未能读取 git 信息，构建标识降级为「${APP_BUILD_ID.id}」。` +
      'PWA 更新检测将无法区分同一提交的不同构建：请在容器构建时注入 APP_BUILD_ID，或改用 deploy.sh。',
  )
} else {
  console.log(`[app-build-id] ${APP_BUILD_ID.source === 'injected' ? '宿主机注入' : '本地 git'} → ${APP_BUILD_ID.id}`)
}

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
function injectRouteSeo(
  route: string,
  renderedHtml: string,
  appCtx: ViteSSGContext,
  siteUrl: string | undefined,
  base: string,
): string {
  const meta = appCtx.router.currentRoute.value.meta
  const title = typeof meta.title === 'string' ? meta.title : DEFAULT_TITLE
  const description = typeof meta.description === 'string' ? meta.description : undefined
  const canonical = siteUrl ? resolveDeployUrl(siteUrl, base, route) : undefined

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
  /**
   * 部署基路径：子路径部署时设为 `/xs-dnd-character-builder/` 这类前缀（见 scripts/deploy-base.ts）。
   * 产物内所有资源引用、路由 href、SW 注册、模板与 version.json 都由它推导，
   * 反向代理只需把该前缀原样映射到 dist 目录，不需要改写 HTML。
   */
  const base = normalizeDeployBase(env.VITE_BASE_URL)

  return {
    base,
    define: {
      __APP_VERSION__: JSON.stringify(APP_VERSION),
      __APP_BUILD_ID__: JSON.stringify(APP_BUILD_ID.id),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      vue(),
      // 输出 dist/version.json：运行时以 no-store 拉取它，与本进程注入的 __APP_BUILD_ID__ 比对。
      appBuildIdPlugin(APP_BUILD_ID),
      /**
       * PWA 离线外壳（见 docs/需求文档/PWA离线与可安装-更新计划.md）。关键取舍：
       *
       * - 只预缓存应用外壳（JS/CSS/HTML/图标）。导出用的 PDF 模板与中文字体合计约 2.5 MB，
       *   改为运行时按需缓存，再由「关于本站 → 离线使用」的一键下载主动触发，以控制安装体积。
       *   两边通过 `/templates/` 前缀耦合：调整 templates/ 目录时必须同步
       *   `src/services/offline-assets.ts` 清单与下面的运行时缓存正则。
       * - `injectRegister: null`：不注入注册脚本，注册交给 `src/services/service-worker.ts`
       *   在客户端显式执行，避免 vite-ssg 预渲染期触碰 Service Worker API。
       * - `skipWaiting: false`：新版本停在 waiting，由应用内非阻断提示确认后再刷新，
       *   避免玩家填表到一半被强制刷新。首次安装没有旧 SW 接管，仍然当场生效。
       */
      VitePWA({
        registerType: 'prompt',
        injectRegister: null,
        strategies: 'generateSW',
        filename: 'sw.js',
        manifestFilename: 'manifest.webmanifest',
        manifest: {
          // 清单里的每一条路径都必须带部署前缀：`scope`/`start_url` 决定安装后的作用域，
          // 写成根路径会让子路径部署的 PWA 与站点根抢作用域。
          id: base,
          name: '小宋DND快速车卡',
          short_name: 'DND车卡',
          description: '面向新玩家的 D&D 5e 快速车卡工具：分步创建角色、自动计算与规则校验，支持离线使用。',
          lang: 'zh-CN',
          start_url: base,
          scope: base,
          display: 'standalone',
          theme_color: '#8f2d2d',
          background_color: '#f6f0e4',
          categories: ['games', 'utilities'],
          icons: [
            { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: `${base}icons/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          shortcuts: [
            { name: '辅助车卡', short_name: '车卡', url: `${base}character-builder` },
            { name: '赛博骰娘', short_name: '骰娘', url: `${base}dice` },
          ],
        },
        workbox: {
          // html 必须保留：预渲染产物是离线导航的落点，缺省会报 non-precached-url index.html。
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
          // og-image.png 约 2.3 MB，仅用于社交分享、客户端永不请求，排除出预缓存。
          globIgnores: ['**/og-image.png'],
          // 离线导航回退到预渲染产出的 index.html（相对 SW 作用域，即部署前缀）；
          // templates 目录必须排除，否则直接打开 PDF 链接会被顶成 HTML。
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [templatesDenylistPattern(base)],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: false,
          // 骰娘页的 3D 引擎（three + cannon-es）打成一个约 2.6 MB 的懒加载 chunk，
          // 超出 workbox 默认 2 MiB 上限会被静默跳过。它是核心交互功能而非仅导出用的资源，
          // 所以放宽上限让它进入预缓存（gzip 后约 0.6 MB），保证装完离线也能掷骰。
          // 注意：Rollup 用 chunk 内某个模块名命名，这个块叫 CharacterMediaEditor，与实际内容无关。
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /\/templates\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'dnd-character-sheet-templates-v1',
                expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
                // status 0 用于 file:// 预览；正常部署命中 200。
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    server: {
      // DMG 2014 候选清单保存在工作区 docs，作为规则索引的可审计数据源打包为 raw 文本。
      fs: { allow: ['..'] },
    },
    ssgOptions: {
      dirStyle: 'nested',
      includedRoutes: () => INCLUDED_ROUTES,
      onPageRendered: (route, renderedHtml, appCtx) => injectRouteSeo(route, renderedHtml, appCtx, siteUrl, base),
    },
    test: {
      environment: 'happy-dom',
      include: ['test/**/*.test.ts'],
      // 2024 法术目录（391 条）进入模块图后，满核并行会让 PDF 字体／导出测试超时；限制 worker 保证全量稳定。
      maxWorkers: 4,
    },
  }
})
