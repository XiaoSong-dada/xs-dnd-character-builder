import type { EquipmentRule } from '@/types/rules'

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ')
}

/**
 * 官方 2014 扩展魔法物品目录合并（ERftLW、EGtW）。
 * 目录数据来自构建期生成产物（rules/data/generated/magic-items-catalog-index-2014.ts），
 * 运行时不再解析 Markdown；重印条目保留原实体并合并来源，新增条目以 index-only 进入候选池。
 */
export function mergeOfficialExpansionItems(
  base: readonly EquipmentRule[],
  expansions: readonly EquipmentRule[],
): readonly EquipmentRule[] {
  const remaining = [...expansions]
  const merged = base.map((item) => {
    const index = remaining.findIndex((candidate) => candidate.id === item.id
      || normalize(candidate.name) === normalize(item.name)
      || normalize(candidate.englishName) === normalize(item.englishName))
    if (index < 0) return item
    const [candidate] = remaining.splice(index, 1)
    return { ...item, sourceIds: [...new Set([...item.sourceIds, ...candidate.sourceIds])] }
  })
  return [...merged, ...remaining]
}
