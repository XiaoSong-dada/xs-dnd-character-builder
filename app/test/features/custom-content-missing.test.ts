import { describe, expect, it } from 'vitest'

import { draft2024 } from '../fixtures/draft-2024'
import { describeMissingCustomContent } from '@/features/custom-content/missing-content'
import { registerCustomContent, resetCustomContent, getRulesRepository } from '@/rules/repositories'
import { emptyBundle } from '@/rules/custom-content'
import { useCustomContentStore } from '@/stores/custom-content'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach } from 'vitest'
import type { CharacterDraft } from '@/types/character'

function customDraft(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    ...draft2024({
      ruleset: '5e-2014',
      classId: 'class-2014-wizard',
      enabledSourceIds: ['source-custom-test'],
      ...overrides,
    }),
    multiclass: undefined,
  }
}

describe('导入角色时缺少自定义内容的提示', () => {
  afterEach(() => {
    resetCustomContent()
    localStorage.clear()
  })

  it('内置 ID 不产生提示', () => {
    const draft = customDraft()
    const report = describeMissingCustomContent(draft, () => true)
    expect(report).toMatchObject({ count: 0, ids: [], message: '' })
  })

  it('引用了本机没有的自定义 ID 时给出数量与处理指引', () => {
    const draft = customDraft({
      raceId: 'custom-race-missing',
      spellSelections: {
        cantripIds: ['custom-spell-missing'],
        knownSpellIds: [],
        preparedSpellIds: [],
        spellbookSpellIds: [],
        transcribedSpellIds: [],
      },
    })

    const report = describeMissingCustomContent(draft, () => false)
    expect(report.count).toBe(2)
    expect(report.ids).toEqual(expect.arrayContaining(['custom-race-missing', 'custom-spell-missing']))
    expect(report.message).toContain('2 项本机不存在的自定义内容')
    expect(report.message).toContain('内容工坊')
  })

  it('已归档但可解析的条目不算缺失', () => {
    const store = (() => {
      localStorage.clear()
      resetCustomContent()
      setActivePinia(createPinia())
      return useCustomContentStore()
    })()
    const expansion = store.saveExpansion({
      ruleset: '5e-2014',
      title: '提示测试书',
      shortTitle: '提示',
      defaultEnabled: true,
    })
    const race = store.createEntry({
      kind: 'race',
      expansionId: expansion.id,
      ruleset: '5e-2014',
      name: '工坊精灵',
      englishName: '',
      summary: '概括',
      description: '说明',
      speed: 30,
    })
    store.archiveEntry('5e-2014', race.id)

    const draft = customDraft({ raceId: race.id })
    const report = describeMissingCustomContent(draft, (id) => Boolean(store.findEntry('5e-2014', id)))
    expect(report.count).toBe(0)
  })

  it('未注册内容库时全部自定义引用都算缺失', () => {
    registerCustomContent('5e-2014', emptyBundle())
    const draft = customDraft({ raceId: 'custom-race-1' })
    const report = describeMissingCustomContent(draft, (id) => Boolean(getRulesRepository('5e-2014').getRace(id)))
    expect(report.count).toBe(1)
  })
})
