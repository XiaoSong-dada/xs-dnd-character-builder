/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 站点作者名，如 小宋哒哒 */
  readonly VITE_AUTHOR_NAME?: string
  /** 站点作者 GitHub 主页或仓库链接 */
  readonly VITE_GITHUB_URL?: string
  /** 可选署名标语 */
  readonly VITE_AUTHOR_TAGLINE?: string
  /** 可选版本号（如 0.1.0），未配置则不显示 */
  readonly VITE_APP_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent
  export default component
}
