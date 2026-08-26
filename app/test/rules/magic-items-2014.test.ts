import { describe, expect, it } from 'vitest'

import { magicItems2014 } from '@/rules/data/magic-items-2014'
import {
  magicItemsDmgCatalogIndex2014,
  magicItemsExpansionCatalogIndex2014,
} from '@/rules/data/generated/magic-items-catalog-index-2014'
import { magicItemsCatalog2014 } from '@/rules/data/generated/magic-items-catalog-2014'
import { magicItemsXgteTcoe2014 } from '@/rules/data/magic-items-xgte-tcoe-2014'
import { rulesRepository } from '@/rules/repository'
import type { EquipmentRule } from '@/types/rules'

describe('magic-items-2014 数据完整性', () => {
  it('DMG A–Z/神器 247 条候选均已进入明确运行时状态', () => {
    expect(magicItemsDmgCatalogIndex2014).toHaveLength(247)
    for (const candidate of magicItemsDmgCatalogIndex2014) {
      const runtime = rulesRepository.equipment.find((item) => item.id === candidate.id
        || item.name === candidate.name
        || item.englishName.toLocaleLowerCase() === candidate.englishName.toLocaleLowerCase())
      expect(runtime, candidate.englishName).toBeDefined()
      expect(runtime?.status, candidate.englishName).not.toBe('stub')
    }
  })

  it('全部魔法物品已合并进 rulesRepository.equipment', () => {
    for (const item of [...magicItems2014, ...magicItemsXgteTcoe2014]) {
      expect(rulesRepository.getEquipment(item.id)).toBeDefined()
    }
  })

  it('条目 id 全局唯一（含普通装备）', () => {
    const ids = rulesRepository.equipment.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('治疗药水按等级收录且回复量各不相同', () => {
    const healing = [
      { id: 'potion-of-healing', expectText: '2d4+2' },
      { id: 'potion-of-greater-healing', expectText: '4d4+4' },
      { id: 'potion-of-superior-healing', expectText: '8d4+8' },
      { id: 'potion-of-supreme-healing', expectText: '10d4+20' },
    ]
    const descriptions = new Set<string>()
    for (const { id, expectText } of healing) {
      const item = rulesRepository.getEquipment(id)
      expect(item, id).toBeDefined()
      expect(item?.description, id).toContain(expectText)
      expect(item?.rarity).toMatch(/^(common|uncommon|rare|very-rare)$/)
      descriptions.add(item?.description ?? '')
    }
    expect(descriptions.size).toBe(4)
  })

  it('XGtE 常见魔法物品全量收录且 TCoE 刺青不可装备', () => {
    const xgte = magicItemsXgteTcoe2014.filter((item) => item.sourceIds.includes('xgte-2017-index'))
    const tattoos = magicItemsXgteTcoe2014.filter((item) => item.id.includes('tattoo'))
    expect(xgte.length).toBeGreaterThanOrEqual(47)
    expect(tattoos).toHaveLength(15)
    for (const tattoo of tattoos) {
      expect(tattoo.equippable).toBe(false)
      expect(tattoo.category).toBe('magic')
    }
  })

  it('点名物品均已登记：治疗药水系列与 +1 武器/盾牌/护甲', () => {
    for (const id of [
      'potion-of-healing',
      'potion-of-greater-healing',
      'potion-of-climbing',
      'armor-+1',
      'shield-+1',
      'weapon-+1',
      'ammunition-+1',
    ]) {
      expect(rulesRepository.getEquipment(id), id).toBeDefined()
    }
  })

  it('药水分类不可装备；+1 系列带魔法加值', () => {
    const potions = rulesRepository.equipment.filter((item) => item.category === 'potion')
    expect(potions.length).toBeGreaterThan(10)
    for (const potion of potions) {
      expect(potion.equippable).toBe(false)
      expect(potion.rarity).toMatch(/^(common|uncommon|rare|very-rare)$/)
    }
    for (const id of ['armor-+1', 'shield-+1', 'weapon-+1', 'ammunition-+1']) {
      expect(rulesRepository.getEquipment(id)?.magicBonus).toBe(1)
    }
    expect(rulesRepository.getEquipment('shield-+1')?.armorClassBonus).toBe(3)
  })

  it('稀有度字段仅魔法物品使用；普通装备不携带 rarity', () => {
    for (const item of rulesRepository.equipment.filter((entry) => entry.rarity !== undefined)) {
      expect(item.magicItemCategory, item.id).toBeDefined()
    }
    for (const item of rulesRepository.equipment.filter((entry) => entry.magicItemCategory === undefined)) {
      expect(item.rarity, item.id).toBeUndefined()
    }
  })

  it('ERftLW 与 EGtW 官方扩展元数据已进入索引并按来源可筛选', () => {
    expect(magicItemsExpansionCatalogIndex2014).toHaveLength(71)
    expect(rulesRepository.equipment.filter((item) => item.sourceIds.includes('erftlw-2019-index'))).toHaveLength(23)
    expect(rulesRepository.equipment.filter((item) => item.sourceIds.includes('egtw-2020-index'))).toHaveLength(48)
    for (const candidate of magicItemsExpansionCatalogIndex2014) {
      expect(rulesRepository.equipment.some((item) => item.id === candidate.id
        || item.name === candidate.name
        || item.englishName.toLocaleLowerCase() === candidate.englishName.toLocaleLowerCase()), candidate.englishName).toBe(true)
    }
  })

  it('2024 批次与 2014 可编辑仓库严格隔离', async () => {
    const { magicItems2024 } = await import('@/rules/data/magic-items-2024')
    expect(magicItems2024.length).toBeGreaterThanOrEqual(6)
    for (const item of magicItems2024) {
      expect(item.ruleset).toBe('5e-2024')
      expect(rulesRepository.getEquipment(item.id)).toBeUndefined()
    }
    for (const id of ['enspelled-staff', 'enspelled-weapon', 'enspelled-amulet', 'wraps-of-unarmed-power-+1']) {
      expect(rulesRepository.getEquipment(id), id).toBeUndefined()
    }
  })

  it('诅咒物品在描述中明确标注', () => {
    const cursed = rulesRepository.equipment.filter((item) => item.description.includes('【诅咒物品】'))
    const ids = cursed.map((item) => item.id)
    expect(ids).toEqual(expect.arrayContaining(['potion-of-poison', 'dust-of-sneezing-and-choking']))
  })

  it('每个条目都有原创描述且字段合法', () => {
    const legalSourceIds = new Set(rulesRepository.sources.map((source) => source.id))
    for (const item of rulesRepository.equipment as readonly EquipmentRule[]) {
      expect(item.name.length).toBeGreaterThan(0)
      expect(item.englishName.length).toBeGreaterThan(0)
      expect(item.ruleset).toBe('5e-2014')
      expect(['implemented', 'selectable', 'index-only', 'dm-only', 'unavailable']).toContain(item.status)
      // 最小运行时索引允许目录条目省略 description（完整描述在懒加载分块中提供）。
      if (item.description.length === 0) {
        expect(magicItemsCatalog2014.some((candidate) => candidate.id === item.id && candidate.description.length > 0), item.id).toBe(true)
      } else {
        expect(item.description.length).toBeGreaterThan(0)
      }
      expect(['armor', 'shield', 'weapon', 'tool', 'gear', 'potion', 'magic']).toContain(item.category)
      expect(['none', 'required', 'conditional']).toContain(item.attunement)
      expect(item.sourceIds.length).toBeGreaterThan(0)
      for (const sourceId of item.sourceIds) expect(legalSourceIds.has(sourceId), `${item.id}:${sourceId}`).toBe(true)
      if (item.rarity) {
        expect(item.magicItemCategory).toMatch(/^(armor|potion|ring|rod|scroll|staff|wand|weapon|wondrous)$/)
      }
      if (item.attunement === 'conditional') expect(item.attunementCondition?.length).toBeGreaterThan(0)
    }
  })

  it('稳定 ID、中文名和英文名在非重印实体间唯一', () => {
    for (const key of ['id', 'name', 'englishName'] as const) {
      const values = rulesRepository.equipment.map((item) => item[key].toLocaleLowerCase())
      expect(new Set(values).size, key).toBe(values.length)
    }
  })

  it('重印条目合并来源而不创建重复实体', () => {
    const prostheticLimbs = rulesRepository.equipment.filter((item) => item.id === 'prosthetic-limb')
    expect(prostheticLimbs).toHaveLength(1)
    expect(prostheticLimbs[0]?.sourceIds).toEqual(expect.arrayContaining(['xgte-2017-index', 'tcoe-2020-index', 'egtw-2020-index']))
  })
})
