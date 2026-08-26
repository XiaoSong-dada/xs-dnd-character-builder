import { describe, expect, it } from 'vitest'

import {
  EQUIPMENT_FILTER_ATTUNEMENTS,
  EQUIPMENT_FILTER_CATEGORIES,
  EQUIPMENT_FILTER_RARITIES,
  filterEquipmentCatalog,
  type EquipmentCatalogFilters,
} from '@/rules/equipment-filter'
import type { EquipmentRule } from '@/types/rules'

function item(overrides: Partial<EquipmentRule> & Pick<EquipmentRule, 'id' | 'name' | 'englishName'>): EquipmentRule {
  return {
    ruleset: '5e-2014',
    status: 'selectable',
    description: '测试用原创摘要。',
    classIds: [],
    equippable: false,
    category: 'gear',
    attunement: 'none',
    sourceIds: ['phb-2014-index'],
    ...overrides,
  }
}

const catalog: readonly EquipmentRule[] = [
  item({ id: 'rope-hempen', name: '麻绳', englishName: 'Rope, Hempen' }),
  item({
    id: 'ring-of-testing',
    name: '试验之戒',
    englishName: 'Ring of Testing',
    category: 'magic',
    magicItemCategory: 'ring',
    rarity: 'rare',
    attunement: 'required',
    sourceIds: ['dmg-2014-index', 'xgte-2017-index'],
  }),
  item({
    id: 'conditional-wand',
    name: '条件魔杖',
    englishName: 'Conditional Wand',
    category: 'magic',
    magicItemCategory: 'wand',
    rarity: 'uncommon',
    attunement: 'conditional',
    attunementCondition: '仅限施法者',
    sourceIds: ['xgte-2017-index'],
  }),
]

function allFilters(overrides: Partial<EquipmentCatalogFilters> = {}): EquipmentCatalogFilters {
  return {
    query: '',
    categories: EQUIPMENT_FILTER_CATEGORIES,
    rarities: EQUIPMENT_FILTER_RARITIES,
    attunements: EQUIPMENT_FILTER_ATTUNEMENTS,
    sourceIds: ['phb-2014-index', 'dmg-2014-index', 'xgte-2017-index'],
    ...overrides,
  }
}

describe('filterEquipmentCatalog', () => {
  it.each([
    ['中文名', '试验之戒'],
    ['英文名（忽略大小写）', 'rInG oF tEsTiNg'],
    ['稳定 ID', 'ring-of-testing'],
  ])('支持%s搜索', (_label, query) => {
    expect(filterEquipmentCatalog(catalog, allFilters({ query })).map((entry) => entry.id))
      .toEqual(['ring-of-testing'])
  })

  it('组内取或、组间取且，并按任一重印来源命中', () => {
    const result = filterEquipmentCatalog(catalog, allFilters({
      categories: ['ring', 'wand'],
      rarities: ['rare', 'uncommon'],
      attunements: ['required'],
      sourceIds: ['xgte-2017-index'],
    }))
    expect(result.map((entry) => entry.id)).toEqual(['ring-of-testing'])
  })

  it.each(['categories', 'rarities', 'attunements', 'sourceIds'] as const)('筛选组 %s 为空时返回空结果', (key) => {
    expect(filterEquipmentCatalog(catalog, allFilters({ [key]: [] }))).toEqual([])
  })

  it('稀有度全选保留普通装备；限制稀有度后只保留匹配魔法物品', () => {
    expect(filterEquipmentCatalog(catalog, allFilters()).map((entry) => entry.id)).toContain('rope-hempen')
    expect(filterEquipmentCatalog(catalog, allFilters({ rarities: ['rare'] })).map((entry) => entry.id))
      .toEqual(['ring-of-testing'])
  })
})
