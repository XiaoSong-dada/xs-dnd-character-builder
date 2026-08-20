/**
 * 站点信息配置：项目内唯一读取 import.meta.env 的模块
 * （AGENTS.md：src/config 是环境变量唯一读取入口，其他业务模块不得直接读取 import.meta.env）。
 */

export interface SiteConfig {
  /** 作者名（如 "小宋哒哒"） */
  readonly authorName?: string
  /** GitHub 主页或仓库链接 */
  readonly githubUrl?: string
  /** 可选署名标语 */
  readonly tagline?: string
  /** 可选版本号（未配置则不显示） */
  readonly version?: string
  /** 站点公开根 URL（SEO canonical、og:url、sitemap 使用；无尾斜杠，未配置则不输出 canonical） */
  readonly siteUrl?: string
  /** 站点分享/OG 图片绝对 URL（可选，建议 1200×630） */
  readonly siteImage?: string
  /** Umami 访问统计配置 */
  readonly umami: UmamiConfig
}

export interface UmamiConfig {
  /** Umami 追踪脚本地址 */
  readonly scriptUrl?: string
  /** Umami 网站标识 */
  readonly websiteId?: string
  /** 允许记录访问的域名列表 */
  readonly domains: readonly string[]
}

function defined(value: string | undefined): string | undefined {
  const normalized = value?.trim()
  return normalized || undefined
}

function normalizeSiteUrl(value: string | undefined): string | undefined {
  const normalized = defined(value)
  if (!normalized) return undefined
  return normalized.replace(/\/+$/, '')
}

function parseDomains(value: string | undefined): readonly string[] {
  const normalized = defined(value)
  if (!normalized) return []

  return normalized
    .split(',')
    .map((domain) => domain.trim())
    .filter(Boolean)
}

export const siteConfig: SiteConfig = {
  authorName: defined(import.meta.env.VITE_AUTHOR_NAME),
  githubUrl: defined(import.meta.env.VITE_GITHUB_URL),
  tagline: defined(import.meta.env.VITE_AUTHOR_TAGLINE),
  version: defined(import.meta.env.VITE_APP_VERSION),
  siteUrl: normalizeSiteUrl(import.meta.env.VITE_SITE_URL),
  siteImage: defined(import.meta.env.VITE_SITE_IMAGE),
  umami: {
    scriptUrl: defined(import.meta.env.VITE_UMAMI_SCRIPT_URL),
    websiteId: defined(import.meta.env.VITE_UMAMI_WEBSITE_ID),
    domains: parseDomains(import.meta.env.VITE_UMAMI_DOMAINS),
  },
}

/** 部署基路径（vite BASE_URL，静态资源/模板资产前缀）。 */
export const baseUrl: string = import.meta.env.BASE_URL
