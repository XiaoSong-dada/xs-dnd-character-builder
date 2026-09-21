/**
 * 运行配置：与 `src/config/site.ts` 同为项目内唯一读取 `import.meta.env` 的模块
 * （AGENTS.md：src/config 是环境变量唯一读取入口，其他业务模块不得直接读取 import.meta.env）。
 */

/**
 * 是否处于 `vite dev` 开发服务。
 * 开发期不生成 Service Worker（`vite-plugin-pwa` 的开发支持默认关闭），
 * 注册前需要据此提前退出，避免开发控制台出现 404 噪声。
 */
export const isDev: boolean = import.meta.env.DEV

/**
 * 本次构建的标识：工作区干净时为 `<commit 短 hash>`，有未提交改动时为
 * `<commit 短 hash>-dirty-<未提交内容摘要>`。
 *
 * 由 `scripts/app-build-id.ts` 在构建期算出并注入，是 PWA 更新检测的对账依据。
 * 注意与 `siteConfig.version`（package.json 的对外版本号，供更新公告比对）不是一回事：
 * 前者是给机器对账的构建指纹，后者是给人看的版本号。
 */
export const appBuildId: string = __APP_BUILD_ID__

/**
 * 构建标识中区分「含未提交改动」的分隔符。
 * 必须与 `scripts/app-build-id.ts` 的 `DIRTY_MARKER` 保持一致：
 * 运行时代码不能反向导入构建脚本（那份代码依赖 node 内置模块），只能各自声明。
 */
export const APP_BUILD_ID_DIRTY_MARKER = '-dirty-'

/** 构建时工作区是否含未提交改动；据此在界面上说明这个构建不是提交产物。 */
export const appBuildIdDirty: boolean = appBuildId.includes(APP_BUILD_ID_DIRTY_MARKER)
