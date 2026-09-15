import { describe, expect, it } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { magicItems2024 } from '@/rules/data/magic-items-2024'
import { validateDraft } from '@/rules/validate'
import type { InventoryEntry } from '@/types/character'
import { draft2024 } from '../fixtures/draft-2024'

const BONUS_RANGE_IDS = [
  'equipment-2024-armor-1-2-3',
  'equipment-2024-shield-1-2-3',
  'equipment-2024-weapon-1-2-3',
  'equipment-2024-ammunition-1-2-3',
  'equipment-2024-rod-of-the-pact-keeper-1-2-3',
  'equipment-2024-wand-of-the-war-mage-1-2-3',
] as const

function magicDraft(inventory: readonly InventoryEntry[]) {
  return draft2024({ inventory })
}

const legacyMagicItem = (sourceKind: InventoryEntry['sourceKind']): InventoryEntry => ({
  id: 'test-magic-item',
  itemId: 'equipment-2024-bag-of-holding',
  quantity: 1,
  sourceKind,
  sourceId: 'test',
  equippedQuantity: 0,
})

describe('2024 DMG 魔法物品（B07-04）', () => {
  it('348 条目标物品、ID 唯一、来源与规则集正确', () => {
    expect(magicItems2024).toHaveLength(348)
    expect(new Set(magicItems2024.map((item) => item.id)).size).toBe(348)
    expect(magicItems2024.every((item) => item.ruleset === '5e-2024')).toBe(true)
    expect(magicItems2024.every((item) => item.sourceIds.includes('source-2024-dmg'))).toBe(true)
    const source = rulesRepository2024.sources.find((item) => item.id === 'source-2024-dmg')
    expect(source?.category).toBe('core')
    expect(source?.selectable).toBe(false)
  })

  it('目标支持状态为 209 selectable 与 139 index-only', () => {
    expect(magicItems2024.filter((item) => item.status === 'selectable')).toHaveLength(209)
    expect(magicItems2024.filter((item) => item.status === 'index-only')).toHaveLength(139)
  })

  it('每条都有非空原创摘要、类别、稀有度与动作登记', () => {
    for (const item of magicItems2024) {
      expect(item.description.length, item.id).toBeGreaterThan(0)
      expect(item.rarity, item.id).toBeDefined()
      expect(item.attunement, item.id).toBeDefined()
      expect(item.itemAction, item.id).toBeDefined()
      if (item.category === 'weapon') {
        expect(item.magicItemCategory).toBe('weapon')
        expect(item.equippable).toBe(true)
      } else if (item.category === 'shield') {
        expect(item.magicItemCategory).toBeUndefined()
        expect(item.equippable).toBe(true)
      } else if (item.category === 'armor') {
        expect(item.magicItemCategory).toBe('armor')
        expect(item.equippable).toBe(true)
      }
    }
  })

  it('同调登记覆盖无需同调／需同调／条件同调／仅限施法者', () => {
    const counts = { none: 0, required: 0, conditional: 0 }
    for (const item of magicItems2024) counts[item.attunement] += 1
    expect(counts).toEqual({ none: 178, required: 136, conditional: 34 })
    const casterOnly = magicItems2024.filter((item) => item.attunement === 'conditional' && item.attunementCondition === '仅限施法者')
    expect(casterOnly).toHaveLength(9)
    expect(casterOnly.map((item) => item.id)).toContain('equipment-2024-wand-of-the-war-mage-1-2-3')
  })

  it('充能、一次性消耗与恢复时机登记', () => {
    const potion = magicItems2024.find((item) => item.id === 'equipment-2024-potions-of-healing')
    expect(potion?.magicItemUsage?.consumable).toBe(true)
    const scroll = magicItems2024.find((item) => item.id === 'equipment-2024-spell-scroll-varies')
    expect(scroll?.magicItemUsage?.consumable).toBe(true)
    const wand = magicItems2024.find((item) => item.id === 'equipment-2024-wand-of-fireballs')
    expect(wand?.magicItemUsage?.charged).toBe(true)
    expect(magicItems2024.filter((item) => item.magicItemUsage?.recovery.includes('dawn')).length).toBeGreaterThan(0)
    expect(magicItems2024.filter((item) => item.magicItemUsage?.recovery.includes('long-rest')).length).toBeGreaterThan(0)
    const dawnItem = magicItems2024.find((item) => item.id === 'equipment-2024-alchemy-jug')
    expect(dawnItem?.magicItemUsage?.recovery).toEqual(['dawn'])
  })

  it('+1/+2/+3 聚合条目登记为可选项并说明型号范围', () => {
    for (const id of BONUS_RANGE_IDS) {
      const item = magicItems2024.find((candidate) => candidate.id === id)
      expect(item, id).toBeDefined()
      expect(item?.name).toContain('+1/+2/+3')
      expect(item?.description).toContain('魔法加值 +1／+2／+3')
    }
  })

  it('2024 仓库解析全部条目，2014 仓库不命中', () => {
    for (const item of magicItems2024) {
      expect(rulesRepository2024.getEquipment(item.id)?.ruleset, item.id).toBe('5e-2024')
      expect(rulesRepository.getEquipment(item.id), item.id).toBeUndefined()
    }
    expect(rulesRepository2024.equipment.filter((item) => item.sourceIds.includes('source-2024-dmg'))).toHaveLength(348)
    expect(rulesRepository.equipment.every((item) => item.ruleset === '5e-2014')).toBe(true)
  })

  it('2024 草稿物品栏可校验魔法物品，2014 草稿拒绝同名条目', () => {
    const modern = magicDraft([legacyMagicItem('legacy')])
    expect(validateDraft(modern).map((issue) => issue.id)).not.toContain('inventory-invalid')

    const legacy = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', inventory: [legacyMagicItem('legacy')] })
    expect(validateDraft(legacy).map((issue) => issue.id)).toContain('inventory-invalid')
  })

  it('未接入的 2024 魔法物品不会出现在 2014 目录加载器中', async () => {
    const { loadItemCatalog, resetItemCatalogCache } = await import('@/rules/item-catalog-loader')
    resetItemCatalogCache()
    const catalog = await loadItemCatalog()
    expect(catalog.every((item) => item.ruleset === '5e-2014')).toBe(true)
  })
})
