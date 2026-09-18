import { describe, expect, it } from 'vitest'

import { sources2014 } from '@/rules/data/sources-2014'
import { spells2014 } from '@/rules/data/spells-2014'
import { rulesRepository } from '@/rules/repository'
import { getDefaultEnabledSourceIds } from '@/rules/source-books'

/** S01 官方扩展补录：6 个来源与 20 条法术（《5e 不全书》v2025.11.8）。 */
const NEW_SOURCE_IDS = [
  'ai-2019-index',
  'bmt-2023-index',
  'idrotf-2020-index',
  'llok-2018-index',
  'aag-2022-index',
  'sato-2023-index',
] as const

const c = (name: string) => `class-2014-${name}`

const NEW_SPELLS: readonly {
  readonly englishName: string
  readonly level: number
  readonly classIds: readonly string[]
  readonly sourceId: string
}[] = [
  { englishName: 'Encode Thoughts', level: 0, classIds: [], sourceId: 'ggr-2018-index' },
  { englishName: 'Distort Value', level: 1, classIds: [c('bard'), c('sorcerer'), c('wizard'), c('warlock')], sourceId: 'ai-2019-index' },
  { englishName: "Jim's Magic Missile", level: 1, classIds: [c('wizard')], sourceId: 'ai-2019-index' },
  { englishName: 'Frost Finger', level: 1, classIds: [c('wizard')], sourceId: 'idrotf-2020-index' },
  { englishName: 'Gift of Gab', level: 2, classIds: [c('bard'), c('wizard')], sourceId: 'ai-2019-index' },
  { englishName: "Jim's Glowing Coin", level: 2, classIds: [c('wizard')], sourceId: 'ai-2019-index' },
  { englishName: 'Spray of Cards', level: 2, classIds: [c('bard'), c('sorcerer'), c('wizard'), c('warlock')], sourceId: 'bmt-2023-index' },
  { englishName: 'Flock of Familiars', level: 2, classIds: [c('wizard'), c('warlock')], sourceId: 'llok-2018-index' },
  { englishName: 'Air Bubble', level: 2, classIds: [c('druid'), c('ranger'), c('sorcerer'), c('wizard'), c('artificer')], sourceId: 'aag-2022-index' },
  { englishName: 'Warp Sense', level: 2, classIds: [c('sorcerer'), c('wizard'), c('warlock')], sourceId: 'sato-2023-index' },
  { englishName: 'Fast Friends', level: 3, classIds: [c('bard'), c('cleric'), c('wizard')], sourceId: 'ai-2019-index' },
  { englishName: 'Incite Greed', level: 3, classIds: [c('cleric'), c('sorcerer'), c('wizard'), c('warlock')], sourceId: 'ai-2019-index' },
  { englishName: 'Motivational Speech', level: 3, classIds: [c('bard'), c('cleric')], sourceId: 'ai-2019-index' },
  { englishName: 'Antagonize', level: 3, classIds: [c('bard'), c('sorcerer'), c('wizard'), c('warlock')], sourceId: 'bmt-2023-index' },
  { englishName: "Galder's Tower", level: 3, classIds: [c('wizard')], sourceId: 'llok-2018-index' },
  { englishName: 'Spirit of Death', level: 4, classIds: [c('sorcerer'), c('wizard'), c('warlock')], sourceId: 'bmt-2023-index' },
  { englishName: "Galder's Speedy Courier", level: 4, classIds: [c('wizard'), c('warlock')], sourceId: 'llok-2018-index' },
  { englishName: 'Gate Seal', level: 4, classIds: [c('sorcerer'), c('wizard'), c('warlock')], sourceId: 'sato-2023-index' },
  { englishName: 'Create Spelljamming Helm', level: 5, classIds: [c('wizard'), c('artificer')], sourceId: 'aag-2022-index' },
  { englishName: 'Create Magen', level: 7, classIds: [c('wizard')], sourceId: 'idrotf-2020-index' },
]

describe('2014 官方扩展补录（S01）', () => {
  it('6 个新来源已登记、可切换且默认启用', () => {
    for (const id of NEW_SOURCE_IDS) {
      const source = sources2014.find((item) => item.id === id)
      expect(source, id).toBeTruthy()
      expect(source?.category).toBe('supplement')
      expect(source?.selectable).toBe(true)
    }
    const enabled = getDefaultEnabledSourceIds('5e-2014')
    for (const id of NEW_SOURCE_IDS) expect(enabled, id).toContain(id)
  })

  it('补录后目录为 509 条，20 条新法术的环级、职业与来源正确', () => {
    expect(spells2014).toHaveLength(509)
    for (const entry of NEW_SPELLS) {
      const spell = spells2014.find((item) => item.englishName === entry.englishName)
      expect(spell, entry.englishName).toBeTruthy()
      expect(spell?.level, entry.englishName).toBe(entry.level)
      expect(spell?.classIds, entry.englishName).toEqual(entry.classIds)
      expect(spell?.sourceIds, entry.englishName).toEqual([entry.sourceId])
      expect(spell?.description.length ?? 0, entry.englishName).toBeGreaterThan(0)
    }
  })

  it('结构化字段按 CHM 登记（抽查）', () => {
    const byEn = (englishName: string) => spells2014.find((item) => item.englishName === englishName)
    expect(byEn('Create Magen')?.castingTime).toBe('1 小时')
    expect(byEn('Gift of Gab')?.castingTime).toBe('1 反应（说话时）')
    expect(byEn('Warp Sense')?.concentration).toBe(true)
    expect(byEn('Distort Value')?.school).toBe('幻术')
    expect(byEn('Air Bubble')?.range).toBe('60 尺')
    expect(byEn('Gate Seal')?.duration).toBe('24 小时')
  })

  it('思想编码无职业归属，只能通过手动添加获得', () => {
    const spell = spells2014.find((item) => item.englishName === 'Encode Thoughts')
    expect(spell?.classIds).toEqual([])
    expect(rulesRepository.getSpell(spell?.id ?? '')).toBeTruthy()
    const classPools = rulesRepository.classes.flatMap((item) => item.spellcasting?.classSpellIds ?? [])
    expect(classPools).not.toContain(spell?.id)
  })
})
