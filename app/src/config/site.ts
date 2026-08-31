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
  /** 当前应用版本，由 app/package.json 在构建期注入。 */
  readonly version: string
  /** 站点公开根 URL（SEO canonical、og:url、sitemap 使用；无尾斜杠，未配置则不输出 canonical） */
  readonly siteUrl?: string
  /** 站点分享/OG 图片绝对 URL（可选，建议 1200×630） */
  readonly siteImage?: string
  /** “请杯咖啡”收款码；图片由本地部署环境提供，不进入仓库 */
  readonly tipQrCodes: TipQrCodeConfig
  /** Umami 访问统计配置 */
  readonly umami: UmamiConfig
}

export interface TipQrCodeConfig {
  /** 微信支付收款码公开访问地址 */
  readonly wechatUrl?: string
  /** 支付宝收款码公开访问地址 */
  readonly alipayUrl?: string
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
  version: __APP_VERSION__,
  siteUrl: normalizeSiteUrl(import.meta.env.VITE_SITE_URL),
  siteImage: defined(import.meta.env.VITE_SITE_IMAGE),
  tipQrCodes: {
    wechatUrl: defined(import.meta.env.VITE_TIP_WECHAT_QR_URL),
    alipayUrl: defined(import.meta.env.VITE_TIP_ALIPAY_QR_URL),
  },
  umami: {
    scriptUrl: defined(import.meta.env.VITE_UMAMI_SCRIPT_URL),
    websiteId: defined(import.meta.env.VITE_UMAMI_WEBSITE_ID),
    domains: parseDomains(import.meta.env.VITE_UMAMI_DOMAINS),
  },
}

/** 部署基路径（vite BASE_URL，静态资源/模板资产前缀）。 */
export const baseUrl: string = import.meta.env.BASE_URL
