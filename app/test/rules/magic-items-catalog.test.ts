import { describe, expect, it } from 'vitest'

import {
  magicItemsDmgCatalogIndex2014,
  magicItemsExpansionCatalogIndex2014,
} from '@/rules/data/generated/magic-items-catalog-index-2014'
import { magicItemsCatalog2014 } from '@/rules/data/generated/magic-items-catalog-2014'

const catalog = magicItemsCatalog2014
const index = [...magicItemsDmgCatalogIndex2014, ...magicItemsExpansionCatalogIndex2014]

describe('构建期物品目录生成产物一致性', () => {
  it('完整目录与最小索引条目数一致，且索引无多出条目', () => {
    expect(catalog).toHaveLength(318)
    expect(index).toHaveLength(catalog.length)
    const indexIds = new Set(index.map((item) => item.id))
    for (const item of catalog) {
      expect(indexIds.has(item.id), item.id).toBe(true)
    }
  })

  it('索引字段与完整目录一致，仅 description 被省略', () => {
    for (const item of catalog) {
      const indexItem = index.find((candidate) => candidate.id === item.id && candidate.name === item.name)
      expect(indexItem, `${item.id}:${item.name}`).toBeDefined()
      expect(indexItem?.englishName).toBe(item.englishName)
      expect(indexItem?.ruleset).toBe(item.ruleset)
      expect(indexItem?.status).toBe(item.status)
      expect(indexItem?.category).toBe(item.category)
      expect(indexItem?.equippable).toBe(item.equippable)
      expect(indexItem?.rarity).toBe(item.rarity)
      expect(indexItem?.magicItemCategory).toBe(item.magicItemCategory)
      expect(indexItem?.attunement).toBe(item.attunement)
      expect(indexItem?.attunementCondition).toBe(item.attunementCondition)
      expect(indexItem?.sourceIds).toEqual(item.sourceIds)
      expect(indexItem?.description).toBe('')
      expect(item.description.length).toBeGreaterThan(0)
    }
  })

  it('DMG 与扩展索引按来源划分且数量与文档基线一致', () => {
    expect(magicItemsDmgCatalogIndex2014).toHaveLength(247)
    expect(magicItemsExpansionCatalogIndex2014).toHaveLength(71)
    for (const item of magicItemsDmgCatalogIndex2014) {
      expect(item.sourceIds).toEqual(['dmg-2014-index'])
    }
    const expansionIds = new Set(magicItemsExpansionCatalogIndex2014.map((item) => item.id))
    for (const item of magicItemsExpansionCatalogIndex2014) {
      expect(['erftlw-2019-index', 'egtw-2020-index']).toContain(item.sourceIds[0])
    }
    // 跨 DMG/扩展的重印条目（如 Feather Token）在完整目录中保留双份，
    // 运行时由 mergeOfficialExpansionItems 合并来源（见 magic-items-2014.test.ts 重印测试）。
    expect(expansionIds.has('feather-token')).toBe(true)
  })

  it('目录条目关键字段合法', () => {
    for (const item of catalog) {
      expect(item.name.length).toBeGreaterThan(0)
      expect(item.englishName.length).toBeGreaterThan(0)
      expect(item.ruleset).toBe('5e-2014')
      expect(['selectable', 'index-only']).toContain(item.status)
      expect(['armor', 'shield', 'weapon', 'tool', 'gear', 'potion', 'magic']).toContain(item.category)
      expect(['none', 'required', 'conditional']).toContain(item.attunement)
      expect(item.rarity).toBeDefined()
      expect(item.magicItemCategory).toBeDefined()
      if (item.attunement === 'conditional') expect(item.attunementCondition?.length).toBeGreaterThan(0)
    }
  })
})
