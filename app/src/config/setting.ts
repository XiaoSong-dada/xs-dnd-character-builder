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
