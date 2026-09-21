import { baseUrl } from '@/config/site'

/**
 * 角色卡导出模板资源：PDF 角色卡、XLSX 表格与中文字体子集。
 *
 * 这些文件放在 `public/templates/` 下由部署方静态托管，不进入 JS 包，运行时通过 fetch 取用；
 * 因此它们同时也是「离线使用」必须预取的资源清单（见 `src/services/offline-assets.ts`）。
 *
 * 与 `vite.config.ts` 中 workbox 运行时缓存规则通过 `/templates/` 前缀耦合：
 * 调整目录结构时必须同步该正则，否则一键下载的资源不会被 Service Worker 缓存。
 */
export const CHARACTER_SHEET_PDF_TEMPLATE_URL = `${baseUrl}templates/character-sheet-zh-plus.pdf`
export const CHARACTER_SHEET_XLSX_TEMPLATE_URL = `${baseUrl}templates/character-sheet-zh.xlsx`
export const CHARACTER_SHEET_FONT_URL = `${baseUrl}templates/fonts/noto-sans-sc-subset.ttf`

/**
 * 离线且本地未缓存模板时的统一提示。
 * 直接透出 fetch 的 `Failed to fetch` 对玩家没有指导意义，这里给出可执行的恢复路径。
 */
export const CHARACTER_SHEET_OFFLINE_MESSAGE =
  '导出所需的模板资源还没有下载到本机，且当前无法联网。请先联网打开一次导出，或在「关于本站 → 离线使用」里一键下载离线资源。'
