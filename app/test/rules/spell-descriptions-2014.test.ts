import { describe, expect, it } from 'vitest'

import { spells2014 } from '@/rules/data/spells-2014'

describe('2014 法术效果摘要登记', () => {
  it('basic-rules-2014 全部法术 description 非空且不含占位文本', () => {
    const basic = spells2014.filter((spell) => spell.sourceIds.includes('basic-rules-2014'))
    expect(basic.length).toBeGreaterThan(300)
    for (const spell of basic) {
      expect(spell.description.trim(), `${spell.id} 应有原创效果摘要`).not.toBe('')
      expect(spell.description, `${spell.id} 不应是占位文本`).not.toContain('元数据条目')
      expect(spell.description, `${spell.id} 不应是占位文本`).not.toContain('效果以规则来源为准')
    }
  })

  it('扩展书法术允许空摘要（未登记批次），字段类型正确', () => {
    const extended = spells2014.filter((spell) => !spell.sourceIds.includes('basic-rules-2014'))
    expect(extended.length).toBeGreaterThan(0)
    for (const spell of extended) {
      expect(typeof spell.description, `${spell.id} description 应为字符串`).toBe('string')
    }
  })

  it('summary 保持环级元数据语义，与 description 职责分离', () => {
    for (const spell of spells2014) {
      expect(spell.summary, `${spell.id} summary 应含环级/戏法说明`).toMatch(/环法术|戏法/)
    }
  })

  it('摘要包含核心决策信息（抽查常见法术）', () => {
    const byId = new Map(spells2014.map((spell) => [spell.id, spell]))
    expect(byId.get('spell-2014-fire-bolt')?.description).toContain('1d10')
    expect(byId.get('spell-2014-fire-bolt')?.description).toContain('火焰')
    expect(byId.get('spell-2014-magic-missile')?.description).toContain('1d4')
    expect(byId.get('spell-2014-guidance')?.description).toContain('1d4')
    expect(byId.get('spell-2014-wish')?.description).toContain('愿望')
    expect(byId.get('spell-2014-fireball')?.description).toContain('8d6')
  })

  it('法术 id 全局唯一（摘要键与条目一一对应）', () => {
    const ids = spells2014.map((spell) => spell.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
