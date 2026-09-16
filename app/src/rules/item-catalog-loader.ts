import { equipment2024 } from '@/rules/data/equipment-2024'
import { magicItems2024 } from '@/rules/data/magic-items-2024'
import type { RulesetId } from '@/types/character'
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

/**
 * 按草稿版本取物品目录（B09-06 最小版本分派）：
 * 2014 走完整目录分块动态加载；2024 用普通装备与 DMG 2024 魔法物品的静态装配。
 * 完整的购买、增删改与来源关闭语义仍归 B07-05。
 */
export function loadItemCatalog(ruleset: RulesetId = '5e-2014'): Promise<readonly EquipmentRule[]> {
  if (ruleset === '5e-2024') return Promise.resolve([...equipment2024, ...magicItems2024])
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
