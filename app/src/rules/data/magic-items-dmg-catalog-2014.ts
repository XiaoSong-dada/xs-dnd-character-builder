import type { EquipmentRule } from '@/types/rules'
import attunementTable from '@/rules/data/dmg-attunement-table.json'

/**
 * DMG 2014 魔法物品同调审计表：由 5e 不全书 2014 DMG 分类页的物品标题行核对；
 * 只保存“是否及由谁同调”的元数据，不保存或复制规则正文。
 * 本表与 scripts/build-item-catalog.mjs 共享同一 JSON 数据源；更新方式见 scripts/audit-dmg-attunement.mjs。
 */
export const dmgAttunementByEnglishName: Readonly<Record<string, string | true>> =
  attunementTable as Readonly<Record<string, string | true>>

function normalizeName(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ')
}

/**
 * DMG 2014 候选目录合并：手工核验条目按稳定 ID/中英文名优先，目录条目补充缺口。
 * 目录数据来自构建期生成产物（rules/data/generated/magic-items-catalog-index-2014.ts），
 * 运行时不再解析 Markdown；聚合型号保留为 index-only，具体型号优先由既有手工条目覆盖。
 */
export function mergeDmgCatalog(
  curated: readonly EquipmentRule[],
  catalog: readonly EquipmentRule[],
): readonly EquipmentRule[] {
  const ids = new Set(curated.map((item) => item.id))
  const names = new Set(curated.map((item) => normalizeName(item.name)))
  const englishNames = new Set(curated.map((item) => normalizeName(item.englishName)))
  return [
    ...curated,
    ...catalog.filter((item) => !ids.has(item.id)
      && !names.has(normalizeName(item.name))
      && !englishNames.has(normalizeName(item.englishName))),
  ]
}
