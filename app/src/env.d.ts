/// <reference types="vite/client" />

declare const __APP_VERSION__: string

/**
 * 构建标识：干净构建为 `<commit>`，工作区有未提交改动时为 `<commit>-dirty-<内容摘要>`。
 * 由 `scripts/app-build-id.ts` 在构建期注入，用于 PWA 更新检测对账。
 * 与 `__APP_VERSION__`（package.json 的对外版本号）用途不同，不要混用。
 */
declare const __APP_BUILD_ID__: string

interface ImportMetaEnv {
  /** 站点作者名，如 小宋哒哒 */
  readonly VITE_AUTHOR_NAME?: string
  /** 站点作者 GitHub 主页或仓库链接 */
  readonly VITE_GITHUB_URL?: string
  /** 可选署名标语 */
  readonly VITE_AUTHOR_TAGLINE?: string
  /** Umami 追踪脚本地址 */
  readonly VITE_UMAMI_SCRIPT_URL?: string
  /** Umami 网站标识 */
  readonly VITE_UMAMI_WEBSITE_ID?: string
  /** 允许追踪的域名，多个域名使用英文逗号分隔 */
  readonly VITE_UMAMI_DOMAINS?: string
  /** 微信支付收款码公开访问地址（图片不进入仓库） */
  readonly VITE_TIP_WECHAT_QR_URL?: string
  /** 支付宝收款码公开访问地址（图片不进入仓库） */
  readonly VITE_TIP_ALIPAY_QR_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent
  export default component
}
