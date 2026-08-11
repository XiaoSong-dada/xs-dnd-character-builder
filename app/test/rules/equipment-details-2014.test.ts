import { describe, expect, it } from 'vitest'

import { equipment2014 } from '@/rules/data/equipment-2014'

describe('2014 装备详情与武器伤害登记', () => {
  it('全部装备 description 非空且不含默认占位文本', () => {
    expect(equipment2014.length).toBeGreaterThanOrEqual(136)
    for (const entry of equipment2014) {
      expect(entry.description.trim(), `${entry.id} 应有详情描述`).not.toBe('')
      expect(entry.description, `${entry.id} 不应是默认占位`).not.toContain('随身物品。')
      expect(entry.description, `${entry.id} 不应是默认占位`).not.toContain('2014版起始武器')
    }
  })

  it('武器条目均有伤害骰与伤害类型；网为无伤害特殊武器', () => {
    const weapons = equipment2014.filter((entry) => entry.category === 'weapon')
    expect(weapons.length).toBe(37)
    for (const weapon of weapons) {
      if (weapon.id === 'net') {
        expect(weapon.description).toContain('束缚')
        continue
      }
      expect(weapon.damageDice, `${weapon.id} 应有伤害骰`).toBeTruthy()
      expect(weapon.damageType, `${weapon.id} 应有伤害类型`).toBeTruthy()
      expect(weapon.description, `${weapon.id} 描述应含伤害信息`).toContain(weapon.damageDice!)
    }
  })

  it('非武器条目不携带伤害字段', () => {
    const nonWeapons = equipment2014.filter((entry) => entry.category !== 'weapon')
    expect(nonWeapons.length).toBeGreaterThanOrEqual(99)
    for (const entry of nonWeapons) {
      expect(entry.damageDice, `${entry.id} 非武器不应有伤害骰`).toBeUndefined()
      expect(entry.damageType, `${entry.id} 非武器不应有伤害类型`).toBeUndefined()
    }
  })

  it('详情包含核心数值（抽查）', () => {
    const byId = new Map(equipment2014.map((entry) => [entry.id, entry]))
    // 武器：巨剑 2d6 挥砍、长弓 1d8 穿刺、匕首投掷
    expect(byId.get('greatsword')?.damageDice).toBe('2d6')
    expect(byId.get('greatsword')?.damageType).toBe('挥砍')
    expect(byId.get('longbow')?.damageDice).toBe('1d8')
    expect(byId.get('longbow')?.damageType).toBe('穿刺')
    expect(byId.get('dagger')?.description).toContain('投掷')
    // 护甲：板甲 AC 18 且力量需求 15、兽皮甲敏捷上限
    expect(byId.get('plate-armor')?.description).toContain('AC 18')
    expect(byId.get('plate-armor')?.description).toContain('力量需求 15')
    expect(byId.get('hide-armor')?.description).toContain('最多 +2')
    // 盾牌
    expect(byId.get('shield')?.description).toContain('AC +2')
    // 工具/用品
    expect(byId.get('thieves-tools')?.description).toContain('开锁')
    expect(byId.get('torch')?.description).toContain('照亮')
  })
})
