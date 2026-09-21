import { describe, expect, it } from 'vitest'

import { rulesRepository2014 } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { getDefaultEnabledSourceIds, isSourceEnabled } from '@/rules/source-books'
import {
  EQUIPMENT_FILTER_ATTUNEMENTS,
  EQUIPMENT_FILTER_CATEGORIES,
  EQUIPMENT_FILTER_RARITIES,
  filterEquipmentCatalog,
} from '@/rules/equipment-filter'
import { getFeatPool } from '@/rules/feats'
import { buildTimeline } from '@/rules/timeline'

/**
 * G3 收尾守卫：第三方内容的**来源门槛**必须逐类生效。
 *
 * 起因：G3-I1 曾把瓦尔达 5 个物种的来源写成 2014 注册表的 ID，导致在 2024 规则下该来源无法开启、
 * 条目永久不可达。`source-reference-integrity` 负责「来源必须已注册」，本用例补上「默认关闭的来源
 * 必须真的挡住候选、开启后才放行」这一层，覆盖 G3 新增的四个大类（种族／子职／专长／物品）。
 */
const defaultIds2014 = getDefaultEnabledSourceIds('5e-2014')
const defaultIds2024 = getDefaultEnabledSourceIds('5e-2024')

const allCatalogFilters = {
  query: '',
  categories: [...EQUIPMENT_FILTER_CATEGORIES],
  rarities: [...EQUIPMENT_FILTER_RARITIES],
  attunements: [...EQUIPMENT_FILTER_ATTUNEMENTS],
} as const

describe('G3 第三方内容的来源门槛', () => {
  it('第三方来源默认全部关闭，且开启/关闭状态可判定', () => {
    for (const repo of [rulesRepository2014, rulesRepository2024]) {
      const thirdParty = repo.sources.filter((source) => source.contentKind === 'third-party')
      // 2014 有 14 个、2024 有 8 个第三方来源（下界断言，随批次增长）
      expect(thirdParty.length).toBeGreaterThanOrEqual(8)
      for (const source of thirdParty) {
        expect(source.defaultEnabled, source.id).toBe(false)
        expect(isSourceEnabled([source.id], [], repo), source.id).toBe(false)
        expect(isSourceEnabled([source.id], [source.id], repo), source.id).toBe(true)
      }
    }
  })

  it('物品：2014 第三方法物品默认不进入目录，开启来源后进入', () => {
    const items = rulesRepository2014.equipment.filter((item) => item.sourceIds.some((id) => id.startsWith('tp-')))
    expect(items.length).toBeGreaterThanOrEqual(500)
    const closed = filterEquipmentCatalog(items, { ...allCatalogFilters, sourceIds: defaultIds2014 })
    expect(closed).toHaveLength(0)
    const opened = filterEquipmentCatalog(items, { ...allCatalogFilters, sourceIds: [...defaultIds2014, 'tp-griffin-saddlebag2-index'] })
    expect(opened.length).toBeGreaterThan(0)
    expect(opened.every((item) => item.sourceIds.includes('tp-griffin-saddlebag2-index'))).toBe(true)
  })

  it('物品：2024 第三方法物品同样是关闭即不可见', () => {
    const items = rulesRepository2024.equipment.filter((item) => item.sourceIds.some((id) => id.startsWith('source-2024-tp-')))
    expect(items.length).toBeGreaterThanOrEqual(45)
    const closed = filterEquipmentCatalog(items, { ...allCatalogFilters, sourceIds: defaultIds2024 })
    expect(closed).toHaveLength(0)
    const opened = filterEquipmentCatalog(items, { ...allCatalogFilters, sourceIds: [...defaultIds2024, 'source-2024-tp-steinhardt'] })
    expect(opened.length).toBeGreaterThan(0)
    expect(opened.every((item) => item.sourceIds.includes('source-2024-tp-steinhardt'))).toBe(true)
  })

  it('专长：第三方专长在来源关闭时不在候选池，开启后进入（2024 通用专长池）', () => {
    const thirdPartyFeats = rulesRepository2024.feats.filter((feat) => feat.sourceIds.some((id) => id.startsWith('source-2024-tp-')))
    expect(thirdPartyFeats.length).toBeGreaterThanOrEqual(45)
    const closed = getFeatPool(rulesRepository2024, ['general'], { level: 19, enabledSourceIds: defaultIds2024 })
    expect(closed.some((feat) => feat.sourceIds.some((id) => id.startsWith('source-2024-tp-')))).toBe(false)
    const opened = getFeatPool(rulesRepository2024, ['general'], {
      level: 19,
      enabledSourceIds: [...defaultIds2024, 'source-2024-tp-valdas-spire'],
    })
    expect(opened.some((feat) => feat.id.startsWith('feat-2024-tp-vss-'))).toBe(true)
    // 血族专长同理：关闭时不可见，开启避世潜藏后出现
    const closedBloodline = getFeatPool(rulesRepository2024, ['bloodline'], { level: 19, enabledSourceIds: defaultIds2024 })
    expect(closedBloodline).toHaveLength(0)
    const openedBloodline = getFeatPool(rulesRepository2024, ['bloodline'], {
      level: 19,
      enabledSourceIds: [...defaultIds2024, 'source-2024-tp-vtm'],
    })
    expect(openedBloodline.length).toBeGreaterThanOrEqual(19)
  })

  it('子职与种族：时间线候选同样按来源开关收敛', () => {
    const closedTimeline = buildTimeline('class-2014-bard', 20, { ruleset: '5e-2014', enabledSourceIds: defaultIds2014 })
    const subclassCheckpoint = closedTimeline.find((item) => item.kind === 'subclass')
    expect(subclassCheckpoint?.optionIds.some((id) => id.includes('-tp-'))).toBe(false)

    const openedTimeline = buildTimeline('class-2014-bard', 20, {
      ruleset: '5e-2014',
      enabledSourceIds: [...defaultIds2014, 'tp-obojima-index'],
    })
    expect(openedTimeline.find((item) => item.kind === 'subclass')?.optionIds).toContain('subclass-2014-tp-obojima-bard-mask')
  })
})
