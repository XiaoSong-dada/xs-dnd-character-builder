import { describe, expect, it } from 'vitest'

import { spells2014 } from '@/rules/data/spells-2014'

describe('2014 法术效果摘要登记', () => {
  it('全部法术（含 XGtE/TCoE 扩展书）description 非空且不含占位文本', () => {
    expect(spells2014.length).toBeGreaterThan(400)
    for (const spell of spells2014) {
      expect(spell.description.trim(), `${spell.id} 应有原创效果摘要`).not.toBe('')
      expect(spell.description, `${spell.id} 不应是占位文本`).not.toContain('元数据条目')
      expect(spell.description, `${spell.id} 不应是占位文本`).not.toContain('效果以规则来源为准')
    }
  })

  it('summary 保持环级元数据语义，与 description 职责分离', () => {
    for (const spell of spells2014) {
      expect(spell.summary, `${spell.id} summary 应含环级/戏法说明`).toMatch(/环法术|戏法/)
    }
  })

  it('摘要包含核心决策信息（抽查基础书与扩展书法术）', () => {
    const byId = new Map(spells2014.map((spell) => [spell.id, spell]))
    expect(byId.get('spell-2014-fire-bolt')?.description).toContain('1d10')
    expect(byId.get('spell-2014-magic-missile')?.description).toContain('1d4')
    expect(byId.get('spell-2014-guidance')?.description).toContain('1d4')
    expect(byId.get('spell-2014-wish')?.description).toContain('愿望')
    expect(byId.get('spell-2014-fireball')?.description).toContain('8d6')
    // 扩展书法术抽查
    expect(byId.get('spell-2014-booming-blade')?.description).toContain('雷鸣')
    expect(byId.get('spell-2014-shadow-blade')?.description).toContain('2d8')
    expect(byId.get('spell-2014-toll-the-dead')?.description).toContain('1d12')
  })

  it('法术 id 全局唯一（摘要键与条目一一对应）', () => {
    const ids = spells2014.map((spell) => spell.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
