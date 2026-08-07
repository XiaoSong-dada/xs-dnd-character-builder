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
}

function defined(value: string | undefined): string | undefined {
  return value && value.trim() ? value : undefined
}

export const siteConfig: SiteConfig = {
  authorName: defined(import.meta.env.VITE_AUTHOR_NAME),
  githubUrl: defined(import.meta.env.VITE_GITHUB_URL),
  tagline: defined(import.meta.env.VITE_AUTHOR_TAGLINE),
  version: defined(import.meta.env.VITE_APP_VERSION),
}
