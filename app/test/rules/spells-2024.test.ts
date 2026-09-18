import { describe, expect, it } from 'vitest'

import { spells2024 } from '@/rules/data/spells-2024'
import { rulesRepository2024 } from '@/rules/repositories'

const EXPECTED_COUNTS = [34, 64, 63, 52, 41, 48, 34, 21, 18, 16]

describe('2024 法术目录', () => {
  it('391 条分环数量、稳定 ID 与规则版本', () => {
    expect(spells2024).toHaveLength(391)
    EXPECTED_COUNTS.forEach((count, level) => {
      expect(spells2024.filter((spell) => spell.level === level)).toHaveLength(count)
    })
    expect(new Set(spells2024.map((spell) => spell.id)).size).toBe(391)
    expect(spells2024.every((spell) => spell.id.startsWith('spell-2024-'))).toBe(true)
    expect(spells2024.every((spell) => spell.ruleset === '5e-2024')).toBe(true)
    expect(spells2024.every((spell) => spell.name.length > 0 && spell.englishName.length > 0)).toBe(true)
    expect(spells2024.every((spell) => spell.summary.length > 0 && spell.description.length > 0)).toBe(true)
    expect(spells2024.every((spell) => spell.classIds.length > 0)).toBe(true)
    expect(spells2024.every((spell) => spell.classIds.every((id) => id.startsWith('class-2024-')))).toBe(true)
    expect(spells2024.every((spell) => spell.sourceIds.includes('source-2024-phb'))).toBe(true)
    // 仓库另含破解奥秘（UA）新法术（人工生命仆从），不计入核心 391 条。
    expect(rulesRepository2024.spells).toHaveLength(392)
  })

  it('施法参数、学派、仪式与专注按 B01 矩阵登记', () => {
    const alarm = rulesRepository2024.getSpell('spell-2024-alarm')
    expect(alarm?.name).toBe('警报术')
    expect(alarm?.ritual).toBe(true)
    expect(alarm?.castingTime).toBe('1 分钟')
    expect(alarm?.school).toBe('防护')
    expect(alarm?.range).toBe('30 尺')
    expect(alarm?.classIds).toContain('class-2024-wizard')

    const fireball = rulesRepository2024.getSpell('spell-2024-fireball')
    expect(fireball?.level).toBe(3)
    expect(fireball?.school).toBe('塑能')
    expect(fireball?.castingTime).toBe('动作')
    expect(fireball?.components).toContain('V、S')

    const holdPerson = spells2024.find((spell) => spell.englishName === 'Hold Person')
    expect(holdPerson?.concentration).toBe(true)

    const detectMagic = rulesRepository2024.getSpell('spell-2024-detect-magic')
    expect(detectMagic?.ritual).toBe(true)
    expect(detectMagic?.concentration).toBe(true)
  })

  it('展开详情使用中文属性与生命值（B09-10）', () => {
    const forbidden = /(?<![A-Za-z])(STR|DEX|CON|INT|WIS|CHA|HP|HD)(?![A-Za-z])/
    const offenders = spells2024.filter((spell) => forbidden.test(spell.description))
    expect(offenders.map((spell) => spell.id)).toEqual([])
    // 抽查：豁免、技能括号、并列列表三类写法均已是中文
    expect(spells2024.find((spell) => spell.englishName === 'Burning Hands')?.description).toContain('敏捷豁免失败3d6火焰')
    expect(spells2024.find((spell) => spell.englishName === 'Minor Illusion')?.description).toContain('智力（调查）')
    expect(spells2024.find((spell) => spell.englishName === 'Gaseous Form')?.description).toContain('力量/敏捷/体质')
  })

  it('两版同名法术互不命中，依赖数据条目为 selectable', () => {
    expect(rulesRepository2024.getSpell('spell-2014-fireball')).toBeUndefined()
    expect(rulesRepository2024.getSpell('spell-2024-wish')?.status).toBe('selectable')
    expect(rulesRepository2024.getSpell('spell-2024-fireball')?.status).toBe('implemented')
  })
})
