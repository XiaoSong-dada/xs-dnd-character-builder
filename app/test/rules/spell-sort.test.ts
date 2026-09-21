import { describe, expect, it } from 'vitest'

import { groupSpellsByLevel, sortSpellsByLevel } from '@/rules/spellcasting'
import { rulesRepository } from '@/rules/repository'
import type { SpellRule } from '@/types/rules'

const spell = (id: string): SpellRule => {
  const found = rulesRepository.getSpell(id)
  if (!found) throw new Error(`missing spell ${id}`)
  return found
}
const levelsOf = (spells: readonly SpellRule[]) => spells.map((item) => item.level)
const idsOf = (spells: readonly SpellRule[]) => spells.map((item) => item.id)

describe('sortSpellsByLevel 环级升序排序（v1.9.1 追加）', () => {
  it('乱序输入按环级升序排列，戏法最先', () => {
    const input = [
      spell('spell-2014-fireball'),
      spell('spell-2014-fire-bolt'),
      spell('spell-2014-scorching-ray'),
      spell('spell-2014-magic-missile'),
    ]
    expect(levelsOf(sortSpellsByLevel(input, '5e-2014'))).toEqual([0, 1, 2, 3])
  })

  it('同环内按规则表登记顺序排列（逆序输入被纠正）', () => {
    const levelOne = rulesRepository.spells.filter((item) => item.level === 1)
    const first = levelOne[0]!
    const last = levelOne[levelOne.length - 1]!
    expect(first.id).not.toBe(last.id)
    expect(idsOf(sortSpellsByLevel([last, first], '5e-2014'))).toEqual([first.id, last.id])
  })

  it('核心列表 + 扩表块拼接的输入按环级归位（不再成块追加）', () => {
    const core = [spell('spell-2014-fire-bolt'), spell('spell-2014-magic-missile'), spell('spell-2014-fireball')]
    const expanded = [spell('spell-2014-ray-of-frost'), spell('spell-2014-scorching-ray')]
    const levels = levelsOf(sortSpellsByLevel([...core, ...expanded], '5e-2014'))
    expect(levels).toEqual([0, 0, 1, 2, 3])
    expect(levels).toEqual([...levels].sort((left, right) => left - right))
  })

  it('不修改入参并返回新数组', () => {
    const input = [spell('spell-2014-fireball'), spell('spell-2014-fire-bolt')]
    const snapshot = idsOf(input)
    const sorted = sortSpellsByLevel(input, '5e-2014')
    expect(idsOf(input)).toEqual(snapshot)
    expect(sorted).not.toBe(input)
  })

  it('空输入返回空数组', () => {
    expect(sortSpellsByLevel([], '5e-2014')).toEqual([])
  })

  it('未登记法术排在所在环级末尾并保持输入相对顺序', () => {
    const unknown = (id: string): SpellRule => ({ id, level: 0 } as unknown as SpellRule)
    const first = unknown('spell-unknown-a')
    const second = unknown('spell-unknown-b')
    const sorted = sortSpellsByLevel([first, spell('spell-2014-fire-bolt'), second], '5e-2014')
    expect(idsOf(sorted)).toEqual(['spell-2014-fire-bolt', 'spell-unknown-a', 'spell-unknown-b'])
  })

  it('与 groupSpellsByLevel 口径一致（分组展平后与扁平排序同序）', () => {
    const input = [
      spell('spell-2014-fireball'),
      spell('spell-2014-ray-of-frost'),
      spell('spell-2014-shield'),
      spell('spell-2014-scorching-ray'),
      spell('spell-2014-magic-missile'),
    ]
    const flattened = groupSpellsByLevel(input, '5e-2014').flatMap((group) => group.spells)
    expect(idsOf(sortSpellsByLevel(input, '5e-2014'))).toEqual(idsOf(flattened))
  })
})
