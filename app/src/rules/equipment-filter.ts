import type { EquipmentRule } from '@/types/rules'

export const EQUIPMENT_FILTER_CATEGORIES = [
  'armor',
  'shield',
  'weapon',
  'potion',
  'ring',
  'rod',
  'scroll',
  'staff',
  'wand',
  'wondrous',
  'tool',
  'gear',
] as const

export const EQUIPMENT_FILTER_RARITIES = [
  'common',
  'uncommon',
  'rare',
  'very-rare',
  'legendary',
  'artifact',
  'varies',
] as const

export const EQUIPMENT_FILTER_ATTUNEMENTS = ['none', 'required', 'conditional'] as const

export type EquipmentFilterCategory = (typeof EQUIPMENT_FILTER_CATEGORIES)[number]
export type EquipmentFilterRarity = (typeof EQUIPMENT_FILTER_RARITIES)[number]
export type EquipmentFilterAttunement = (typeof EQUIPMENT_FILTER_ATTUNEMENTS)[number]

export interface EquipmentCatalogFilters {
  readonly query: string
  readonly categories: readonly EquipmentFilterCategory[]
  readonly rarities: readonly EquipmentFilterRarity[]
  readonly attunements: readonly EquipmentFilterAttunement[]
  readonly sourceIds: readonly string[]
}

function catalogCategory(item: EquipmentRule): EquipmentFilterCategory {
  if (item.magicItemCategory) return item.magicItemCategory
  return item.category === 'magic' ? 'wondrous' : item.category
}

export function filterEquipmentCatalog(
  items: readonly EquipmentRule[],
  filters: EquipmentCatalogFilters,
): readonly EquipmentRule[] {
  if (!filters.categories.length || !filters.rarities.length || !filters.attunements.length || !filters.sourceIds.length) return []

  const keyword = filters.query.trim().toLocaleLowerCase()
  const categories = new Set(filters.categories)
  const rarities = new Set(filters.rarities)
  const attunements = new Set(filters.attunements)
  const sourceIds = new Set(filters.sourceIds)
  const rarityRestricted = filters.rarities.length !== EQUIPMENT_FILTER_RARITIES.length

  return items.filter((item) => {
    if (!categories.has(catalogCategory(item))) return false
    if (item.rarity ? !rarities.has(item.rarity) : rarityRestricted) return false
    if (!attunements.has(item.attunement)) return false
    if (!item.sourceIds.some((sourceId) => sourceIds.has(sourceId))) return false
    if (!keyword) return true
    return item.name.toLocaleLowerCase().includes(keyword)
      || item.englishName.toLocaleLowerCase().includes(keyword)
      || item.id.toLocaleLowerCase().includes(keyword)
  })
}
