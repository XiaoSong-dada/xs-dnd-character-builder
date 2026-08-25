import { describe, expect, it } from 'vitest'

import { magicItems2014 } from '@/rules/data/magic-items-2014'
import { magicItemsXgteTcoe2014 } from '@/rules/data/magic-items-xgte-tcoe-2014'
import { rulesRepository } from '@/rules/repository'
import type { EquipmentRule } from '@/types/rules'

describe('magic-items-2014 数据完整性', () => {
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
    const plain = rulesRepository.equipment.filter((item) => item.rarity !== undefined)
    const magicIds = new Set([...magicItems2014, ...magicItemsXgteTcoe2014].map((item) => item.id))
    for (const item of plain) {
      expect(magicIds.has(item.id), item.id).toBe(true)
    }
  })

  it('2024 批次与 2014 可编辑仓库严格隔离', async () => {
    const { magicItems2024 } = await import('@/rules/data/magic-items-2024')
    expect(magicItems2024.length).toBeGreaterThanOrEqual(6)
    for (const item of magicItems2024) expect(rulesRepository.getEquipment(item.id)).toBeUndefined()
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
    for (const item of rulesRepository.equipment as readonly EquipmentRule[]) {
      expect(item.name.length).toBeGreaterThan(0)
      expect(item.description.length).toBeGreaterThan(0)
      expect(['armor', 'shield', 'weapon', 'tool', 'gear', 'potion', 'magic']).toContain(item.category)
      expect(item.sourceIds.length).toBeGreaterThan(0)
    }
  })
})
