import { describe, expect, it } from 'vitest'

import { ritualSpellNames2014, spells2014 } from '@/rules/data/spells-2014'
import { formatSpellLabel } from '@/utils/format-spell-label'

function getSpell(englishName: string) {
  const spell = spells2014.find((item) => item.englishName === englishName)
  expect(spell, `缺少法术：${englishName}`).toBeDefined()
  return spell!
}

describe('2014 法术仪式元数据', () => {
  it('为代表性仪式法术和普通法术登记正确标记', () => {
    expect(getSpell('Find Familiar').ritual).toBe(true)
    expect(getSpell('Detect Magic').ritual).toBe(true)
    expect(getSpell('Magic Missile').ritual).toBe(false)
  })

  it('所有法术都有布尔型仪式字段，仪式清单无重复且全部指向现有法术', () => {
    expect(spells2014.every((spell) => typeof spell.ritual === 'boolean')).toBe(true)
    expect(new Set(ritualSpellNames2014).size).toBe(ritualSpellNames2014.length)
    expect(ritualSpellNames2014.every((name) => spells2014.some((spell) => spell.englishName === name))).toBe(true)
    expect(spells2014.filter((spell) => spell.ritual).map((spell) => spell.englishName).sort())
      .toEqual([...ritualSpellNames2014].sort())
  })
})

describe('法术列表标签', () => {
  it('只为仪式法术追加仪式标签', () => {
    expect(formatSpellLabel(getSpell('Find Familiar'))).toBe('1环 · Find Familiar · 仪式')
    expect(formatSpellLabel(getSpell('Magic Missile'))).toBe('1环 · Magic Missile')
  })
})
