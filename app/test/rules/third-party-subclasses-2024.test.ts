import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { subclasses2024 } from '@/rules/data/subclasses-2024'
import { cthulhuTorchlightSubclasses2024 } from '@/rules/data/third-party-subclasses-cthulhu-torchlight-2024'
import { valdasSpireSubclasses2024 } from '@/rules/data/third-party-subclasses-valdas-spire-2024'
import { floralDragonsSubclasses2024 } from '@/rules/data/third-party-subclasses-floral-dragons-2024'
import { steinhardtSubclasses2024 } from '@/rules/data/third-party-subclasses-steinhardt-2024'
import { crookedMoonSubclasses2024 } from '@/rules/data/third-party-subclasses-crooked-moon-2024'
import { buildTimeline } from '@/rules/timeline'
import type { SubclassRule } from '@/types/rules'

/**
 * G3-I2：第三方 2024 写法子职。
 *
 * 登记口径见各模块头注释：2024 口径下全部子职统一在 **3 级**选择；
 * 只登记选择与展示所需元数据 + 原创中文摘要（`selectable`），效果不进入自动计算；
 * 来源为第三方合作内容，默认关闭，需显式启用后才进入时间线候选。
 *
 * 新增书目时只需在 `books` 表里加一行。
 */
interface BookCase {
  readonly label: string
  readonly idPrefix: string
  readonly sourceId: string
  readonly subclasses: readonly SubclassRule[]
  readonly subclassCount: number
  readonly featureCount: number
  readonly sampleEnglishNames: readonly string[]
  readonly sampleClassId: string
  readonly sampleSubclassId: string
}

const books: readonly BookCase[] = [
  {
    label: '火炬光下的克苏鲁',
    idPrefix: 'subclass-2024-tp-cbt-',
    sourceId: 'source-2024-tp-cthulhu-torchlight',
    subclasses: cthulhuTorchlightSubclasses2024,
    subclassCount: 12,
    featureCount: 66,
    sampleEnglishNames: ['Apocalypse Domain', 'Shadow Stalker', 'Trail Warden'],
    sampleClassId: 'class-2024-cleric',
    sampleSubclassId: 'subclass-2024-tp-cbt-cleric-apocalypse',
  },
  {
    label: '瓦尔达的秘密尖塔',
    idPrefix: 'subclass-2024-tp-vss-',
    sourceId: 'source-2024-tp-valdas-spire',
    subclasses: valdasSpireSubclasses2024,
    subclassCount: 12,
    featureCount: 61,
    sampleEnglishNames: ['College of Masks', 'Oath of Revelry', 'Circle of the City', 'Dragon Domain', 'Future You Patron'],
    sampleClassId: 'class-2024-cleric',
    sampleSubclassId: 'subclass-2024-tp-vss-cleric-dragon',
  },
  {
    label: '花卉龙博考',
    idPrefix: 'subclass-2024-tp-fgd-',
    sourceId: 'source-2024-tp-floral-dragons',
    subclasses: floralDragonsSubclasses2024,
    subclassCount: 3,
    featureCount: 16,
    sampleEnglishNames: ['Circle of Flowers', 'Field Researcher', 'Fungus'],
    sampleClassId: 'class-2024-druid',
    sampleSubclassId: 'subclass-2024-tp-fgd-druid-blossom',
  },
  {
    label: '斯坦哈德的诡怖猎杀指南',
    idPrefix: 'subclass-2024-tp-sh-',
    sourceId: 'source-2024-tp-steinhardt',
    subclasses: steinhardtSubclasses2024,
    subclassCount: 7,
    featureCount: 39,
    sampleEnglishNames: ['Oath of the Eldritch Hunt', 'Osteomancer', 'Blood Hound', 'Blade of Radiance'],
    sampleClassId: 'class-2024-wizard',
    sampleSubclassId: 'subclass-2024-tp-sh-wizard-bone',
  },
  {
    label: '歪曲之月',
    idPrefix: 'subclass-2024-tp-cm-',
    sourceId: 'source-2024-tp-crooked-moon',
    subclasses: crookedMoonSubclasses2024,
    subclassCount: 15,
    featureCount: 82,
    sampleEnglishNames: ['College of Whistles', 'Oath of Castigation', 'Circle of the Old Ways', 'Circle of Wicker'],
    sampleClassId: 'class-2024-cleric',
    sampleSubclassId: 'subclass-2024-tp-cm-cleric-harvest',
  },
]

const supportedClassIds = new Set(rulesRepository2024.classes.map((item) => item.id))
const featureKinds = new Set(['passive', 'choice', 'resource', 'action', 'bonus-action', 'reaction'])

describe('G3-I2 第三方 2024 子职', () => {
  it.each(books)('$label 子职齐备，3 级选择、职业挂载、来源与可用性正确', (book) => {
    expect(book.subclasses).toHaveLength(book.subclassCount)
    for (const subclass of book.subclasses) {
      expect(subclass.id, subclass.id).toMatch(new RegExp(`^${book.idPrefix}[a-z]+-[a-z-]+$`))
      expect(subclass.ruleset, subclass.id).toBe('5e-2024')
      expect(subclass.selectionLevel, subclass.id).toBe(3)
      expect(subclass.sourceIds, subclass.id).toEqual([book.sourceId])
      expect(subclass.availability, subclass.id).toBe('player')
      expect(subclass.status, subclass.id).toBe('selectable')
      expect(supportedClassIds.has(subclass.classId), `${subclass.id} → ${subclass.classId}`).toBe(true)
      expect(rulesRepository2024.getSubclass(subclass.id)?.id, subclass.id).toBe(subclass.id)
      expect(subclass.name.length, subclass.id).toBeGreaterThan(1)
      expect(subclass.englishName.length, subclass.id).toBeGreaterThan(2)
      expect(subclass.summary.length, subclass.id).toBeGreaterThan(20)
    }
    expect(book.subclasses.map((item) => item.englishName)).toEqual(expect.arrayContaining([...book.sampleEnglishNames]))
  })

  it.each(books)('$label 的等级特性齐备、按等级升序且字段完整', (book) => {
    const features = book.subclasses.flatMap((subclass) => subclass.features)
    expect(features).toHaveLength(book.featureCount)
    expect(new Set(features.map((feature) => feature.id)).size).toBe(features.length)
    for (const subclass of book.subclasses) {
      expect(subclass.features.length, subclass.id).toBeGreaterThanOrEqual(4)
      const levels = subclass.features.map((feature) => feature.level)
      expect(levels, subclass.id).toEqual([...levels].sort((a, b) => a - b))
      expect(Math.min(...levels), subclass.id).toBe(3)
      for (const feature of subclass.features) {
        expect(feature.subclassId, feature.id).toBe(subclass.id)
        expect(feature.sourceIds, feature.id).toEqual([book.sourceId])
        expect(feature.status, feature.id).toBe('selectable')
        expect(featureKinds.has(feature.kind), `${feature.id} → ${feature.kind}`).toBe(true)
        expect(feature.summary.length, feature.id).toBeGreaterThan(15)
        expect(feature.description.length, feature.id).toBeGreaterThan(50)
      }
    }
  })

  it.each(books)('$label 的子职不引入需要额外选项的数据（只登记摘要，不建 RuleOption）', (book) => {
    for (const subclass of book.subclasses) {
      for (const feature of subclass.features) {
        expect(feature.requiresChoice, feature.id).toBeUndefined()
        expect(feature.optionIds, feature.id).toBeUndefined()
      }
      expect(rulesRepository2024.getOption(subclass.id)?.id, subclass.id).toBe(subclass.id)
    }
  })

  it.each(books)('$label 的来源未开启时不进入候选，显式开启后进入对应职业的子职检查点', (book) => {
    // `buildTimeline` 默认按 2014 解析，2024 条目必须显式传 `ruleset`。
    const closed = buildTimeline(book.sampleClassId, 20, { ruleset: '5e-2024', enabledSourceIds: [] })
      .find((item) => item.kind === 'subclass')
    expect(closed?.optionIds ?? []).not.toContain(book.sampleSubclassId)

    const opened = buildTimeline(book.sampleClassId, 20, { ruleset: '5e-2024', enabledSourceIds: [book.sourceId] })
      .find((item) => item.kind === 'subclass')
    expect(opened?.optionIds ?? []).toContain(book.sampleSubclassId)
  })

  it('全部第三方 2024 子职都已并入 subclasses2024，且不污染核心 48 条', () => {
    const thirdParty = books.flatMap((book) => book.subclasses)
    expect(new Set(subclasses2024.map((item) => item.id)).size).toBe(subclasses2024.length)
    for (const subclass of thirdParty) {
      expect(subclasses2024.filter((item) => item.id === subclass.id), subclass.id).toHaveLength(1)
    }
    expect(subclasses2024.filter((item) => item.id.includes('-tp-'))).toHaveLength(thirdParty.length)
    const core = subclasses2024.filter((item) => item.sourceIds.includes('source-2024-phb'))
    expect(core).toHaveLength(48)
    expect(core.every((item) => item.status === 'implemented')).toBe(true)
  })

  it.each(books)('$label 的子职选项描述带书名，便于在候选卡片上区分来源', (book) => {
    const option = rulesRepository2024.getOption(book.sampleSubclassId)
    expect(option, book.sampleSubclassId).toBeDefined()
    // 官方核心与 UA 子职不带书名；第三方子职一律带《书名》(第三方)
    expect(option?.description, book.sampleSubclassId).toContain('(第三方)')
  })

  it('官方与 UA 子职的选项描述保持原写法（不误加书名）', () => {
    const core = rulesRepository2024.getOption('subclass-2024-fighter-champion')
    expect(core?.description).not.toContain('(第三方)')
    expect(core?.description).toContain('Champion ·')
  })
})
