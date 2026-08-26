import type { EquipmentRule } from '@/types/rules'

/**
 * 物品完整目录延迟加载器（批次 6）。
 *
 * 主界面只静态装配最小运行时索引（rules/data/generated/magic-items-catalog-index-2014.ts，
 * 不含 description）；完整目录分块（含 description）在第一次点击“添加物品”时才动态加载。
 *
 * - 同一次页面会话内使用模块级 Promise 缓存，不重复加载或解析。
 * - 加载失败会清空缓存，调用方可以重试。
 * - 分块文件名带内容哈希，配合 Nginx 对 /assets/ 的 immutable 缓存，刷新后命中浏览器 HTTP 缓存。
 *
 * 本模块位于 src/rules：只做本地模块的按需获取，不依赖 Vue、Pinia、DOM、存储或网络。
 */
let catalogPromise: Promise<readonly EquipmentRule[]> | undefined

export function loadItemCatalog(): Promise<readonly EquipmentRule[]> {
  catalogPromise ??= import('@/rules/data/generated/magic-items-catalog-2014')
    .then((module) => module.magicItemsCatalog2014)
    .catch((error) => {
      catalogPromise = undefined
      throw error
    })
  return catalogPromise
}

/** 测试辅助：清空内存缓存，使下一次调用重新动态加载。 */
export function resetItemCatalogCache(): void {
  catalogPromise = undefined
}
