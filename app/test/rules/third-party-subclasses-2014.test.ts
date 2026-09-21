import { describe, expect, it } from 'vitest'

import { rulesRepository2014 } from '@/rules/repository'
import { subclasses2014 } from '@/rules/data/subclasses-2014'
import { obojimaSubclasses2014 } from '@/rules/data/third-party-subclasses-obojima-2014'
import { ebonTidesSubclasses2014 } from '@/rules/data/third-party-subclasses-ebon-tides-2014'
import { grimHollowSubclasses2014 } from '@/rules/data/third-party-subclasses-grim-hollow-2014'
import { taldoreiSubclasses2014 } from '@/rules/data/third-party-subclasses-taldorei-2014'
import { griffinSaddlebag2Subclasses2014 } from '@/rules/data/third-party-subclasses-griffin-saddlebag2-2014'
import { humblewoodSubclasses2014 } from '@/rules/data/third-party-subclasses-humblewood-2014'
import { buildTimeline } from '@/rules/timeline'
import type { SubclassRule } from '@/types/rules'

/**
 * G3-I2：第三方 2014 写法子职。
 *
 * 登记口径见各模块头注释：只登记选择与展示所需元数据 + 原创中文摘要（`selectable`），
 * 效果不进入自动计算；来源为第三方合作内容，默认关闭，需显式启用后才进入时间线候选。
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
    label: '胧忆岛',
    idPrefix: 'subclass-2014-tp-obojima-',
    sourceId: 'tp-obojima-index',
    subclasses: obojimaSubclasses2014,
    subclassCount: 11,
    featureCount: 58,
    sampleEnglishNames: ['College of Masks', 'Oath of the River', 'Circle of the Petal', 'Spirit-Fused', 'The Lantern'],
    sampleClassId: 'class-2014-bard',
    sampleSubclassId: 'subclass-2014-tp-obojima-bard-mask',
  },
  {
    label: '黯潮之书',
    idPrefix: 'subclass-2014-tp-ebt-',
    sourceId: 'tp-ebon-tides-index',
    subclasses: ebonTidesSubclasses2014,
    subclassCount: 10,
    featureCount: 53,
    sampleEnglishNames: ['Keeper Domain', 'Shadow', 'Mother of Sorrows'],
    sampleClassId: 'class-2014-cleric',
    sampleSubclassId: 'subclass-2014-tp-ebt-cleric-secrecy',
  },
  {
    label: '鬼魅幽谷（玩家包）',
    idPrefix: 'subclass-2014-tp-gh-',
    sourceId: 'tp-grim-hollow-index',
    subclasses: grimHollowSubclasses2014,
    subclassCount: 6,
    featureCount: 31,
    sampleEnglishNames: ['College of Requiems', 'Oath of Zeal', 'Blade Breaker', 'Misfortune Bringer', 'Inquisition Domain'],
    sampleClassId: 'class-2014-cleric',
    sampleSubclassId: 'subclass-2014-tp-gh-cleric-inquisition',
  },
  {
    label: '塔尔多雷',
    idPrefix: 'subclass-2014-tp-tal-',
    sourceId: 'tp-taldorei-index',
    subclasses: taldoreiSubclasses2014,
    subclassCount: 9,
    featureCount: 52,
    sampleEnglishNames: ['College of Tragedy', 'Oath of Open Sea', 'Way of the Cobalt Soul', 'Runechild', 'Blood Magic'],
    sampleClassId: 'class-2014-sorcerer',
    sampleSubclassId: 'subclass-2014-tp-tal-sorcerer-runechild',
  },
  {
    label: '狮鹫的鞍中珍宝Ⅱ',
    idPrefix: 'subclass-2014-tp-gsb2-',
    sourceId: 'tp-griffin-saddlebag2-index',
    subclasses: griffinSaddlebag2Subclasses2014,
    subclassCount: 12,
    featureCount: 66,
    sampleEnglishNames: ['College of Mercantile', 'Oath of the Spelldrinker', 'Circle of Dragons', 'Steel Hawk', 'Festus Domain', 'The Many'],
    sampleClassId: 'class-2014-cleric',
    sampleSubclassId: 'subclass-2014-tp-gsb2-cleric-festus',
  },
  {
    label: '谦卑林',
    idPrefix: 'subclass-2014-tp-hw-',
    sourceId: 'tp-humblewood-index',
    subclasses: humblewoodSubclasses2014.filter((item) => item.id.includes('-tp-hw-')),
    subclassCount: 4,
    featureCount: 25,
    sampleEnglishNames: ['Community Domain', 'Night Domain', 'College of the Road', 'Scofflaw'],
    sampleClassId: 'class-2014-cleric',
    sampleSubclassId: 'subclass-2014-tp-hw-cleric-community',
  },
  {
    label: '谦卑林故事集',
    idPrefix: 'subclass-2014-tp-hwt-',
    sourceId: 'tp-humblewood-tales-index',
    subclasses: humblewoodSubclasses2014.filter((item) => item.id.includes('-tp-hwt-')),
    subclassCount: 3,
    featureCount: 16,
    sampleEnglishNames: ['Circle of the Warden', 'Leyline Magic', 'The Predator'],
    sampleClassId: 'class-2014-druid',
    sampleSubclassId: 'subclass-2014-tp-hwt-druid-watch',
  },
]

const supportedClassIds = new Set(rulesRepository2014.classes.map((item) => item.id))
const featureKinds = new Set(['passive', 'choice', 'resource', 'action', 'bonus-action', 'reaction'])

describe('G3-I2 第三方 2014 子职', () => {
  it.each(books)('$label 子职齐备，ID、职业挂载、来源与可用性正确', (book) => {
    expect(book.subclasses).toHaveLength(book.subclassCount)
    for (const subclass of book.subclasses) {
      expect(subclass.id, subclass.id).toMatch(new RegExp(`^${book.idPrefix}[a-z]+-[a-z-]+$`))
      expect(subclass.ruleset, subclass.id).toBe('5e-2014')
      expect(subclass.sourceIds, subclass.id).toEqual([book.sourceId])
      expect(subclass.availability, subclass.id).toBe('player')
      expect(subclass.status, subclass.id).toBe('selectable')
      expect(supportedClassIds.has(subclass.classId), `${subclass.id} → ${subclass.classId}`).toBe(true)
      expect(rulesRepository2014.getSubclass(subclass.id)?.id, subclass.id).toBe(subclass.id)
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
      expect(Math.min(...levels), subclass.id).toBe(subclass.selectionLevel)
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
      // 子职选项投影仍需存在（供时间线候选与来源过滤解析）
      expect(rulesRepository2014.getOption(subclass.id)?.id, subclass.id).toBe(subclass.id)
    }
    expect(rulesRepository2014.options.filter((option) => option.id.startsWith(book.idPrefix))).toHaveLength(book.subclassCount)
  })

  it.each(books)('$label 的来源未开启时不进入候选，显式开启后进入对应职业的子职检查点', (book) => {
    // 注意：`enabledSourceIds: undefined` 表示「不做来源过滤」（旧草稿兼容语义），
    // 默认关闭要显式传空列表表达。
    const closed = buildTimeline(book.sampleClassId, 20, { ruleset: '5e-2014', enabledSourceIds: [] })
      .find((item) => item.kind === 'subclass')
    expect(closed?.optionIds ?? []).not.toContain(book.sampleSubclassId)

    const opened = buildTimeline(book.sampleClassId, 20, { ruleset: '5e-2014', enabledSourceIds: [book.sourceId] })
      .find((item) => item.kind === 'subclass')
    expect(opened?.optionIds ?? []).toContain(book.sampleSubclassId)
  })

  it('全部第三方 2014 子职都已并入 subclasses2014，且 ID 唯一', () => {
    const thirdParty = books.flatMap((book) => book.subclasses)
    expect(new Set(subclasses2014.map((item) => item.id)).size).toBe(subclasses2014.length)
    for (const subclass of thirdParty) {
      expect(subclasses2014.filter((item) => item.id === subclass.id), subclass.id).toHaveLength(1)
    }
    expect(subclasses2014.filter((item) => item.id.includes('-tp-'))).toHaveLength(thirdParty.length)
  })
})
