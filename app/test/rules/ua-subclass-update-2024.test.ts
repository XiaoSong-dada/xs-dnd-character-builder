import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { rulesRepository as rulesRepository2014 } from '@/rules/repository'
import { uaSubclassUpdate2024, uaSubclassUpdateFeatures2024, uaSubclassUpdateOptions2024 } from '@/rules/data/ua-subclass-update-2024'
import { getSubclassAdaptation2024, subclassAdaptations2024 } from '@/rules/data/subclass-adaptations-2024'
import { isSourceEnabled } from '@/rules/source-books'
import { buildTimeline } from '@/rules/timeline'

const SOURCE = 'source-2024-ua-subclass-update'
const SUBCLASS_IDS = [
  'subclass-2024-ua-barbarian-storm-herald',
  'subclass-2024-ua-barbarian-spiritual-guardian',
  'subclass-2024-ua-fighter-cavalier',
  'subclass-2024-ua-monk-intoxication',
  'subclass-2024-ua-paladin-oathbreaker',
] as const

describe('子职业更新 5 项（UA，E04）', () => {
  it('5 个子职登记完整、来源独立且默认关闭', () => {
    expect(uaSubclassUpdate2024.map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    for (const id of SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass, id).toBeDefined()
      expect(subclass?.ruleset).toBe('5e-2024')
      expect(subclass?.status).toBe('selectable')
      expect(subclass?.selectionLevel).toBe(3)
      expect(subclass?.sourceIds).toEqual([SOURCE])
      expect(subclass?.features.length).toBeGreaterThan(0)
    }
    expect(isSourceEnabled([SOURCE], [], rulesRepository2024)).toBe(false)
    expect(isSourceEnabled([SOURCE], [SOURCE], rulesRepository2024)).toBe(true)
  })

  it('破誓者保持 DM 选项语义，不进入普通玩家子职候选', () => {
    expect(rulesRepository2024.getSubclass('subclass-2024-ua-paladin-oathbreaker')?.availability).toBe('dm-only')
    const timeline = buildTimeline('class-2024-paladin', 3, { ruleset: '5e-2024', enabledSourceIds: [SOURCE, 'source-2024-phb'] })
    const options = timeline.find((checkpoint) => checkpoint.kind === 'subclass')?.optionIds ?? []
    expect(options).not.toContain('subclass-2024-ua-paladin-oathbreaker')
    expect(options).toContain('subclass-2024-paladin-oath-of-devotion')
  })

  it('特性、选项与始终准备法术全部可解析', () => {
    for (const feature of uaSubclassUpdateFeatures2024) {
      expect(feature.sourceIds).toEqual([SOURCE])
      for (const optionId of feature.optionIds ?? []) {
        expect(rulesRepository2024.getOption(optionId), `${feature.id}:${optionId}`).toBeDefined()
      }
    }
    for (const option of uaSubclassUpdateOptions2024) {
      expect(rulesRepository2024.getOption(option.id), option.id).toBeDefined()
    }
    const oathbreaker = rulesRepository2024.getSubclass('subclass-2024-ua-paladin-oathbreaker')
    for (const spellIds of Object.values(oathbreaker?.alwaysPreparedSpellIdsByLevel ?? {})) {
      for (const spellId of spellIds) {
        expect(rulesRepository2024.getSpell(spellId), spellId).toBeDefined()
      }
    }
  })

  it('时间线在启用来源后为玩家子职生成检查点', () => {
    const timeline = buildTimeline('class-2024-fighter', 3, { ruleset: '5e-2024', enabledSourceIds: [SOURCE, 'source-2024-phb'] })
    expect(timeline.find((checkpoint) => checkpoint.kind === 'subclass')?.optionIds).toContain('subclass-2024-ua-fighter-cavalier')
    const withSubclass = buildTimeline('class-2024-fighter', 7, { ruleset: '5e-2024', enabledSourceIds: [SOURCE, 'source-2024-phb'], subclassId: 'subclass-2024-ua-fighter-cavalier' })
    for (const checkpoint of withSubclass) {
      for (const optionId of checkpoint.optionIds) {
        const resolved = rulesRepository2024.getOption(optionId) ?? rulesRepository2024.getFeat(optionId)
        expect(resolved, `${checkpoint.id}:${optionId}`).toBeDefined()
      }
    }
  })

  it('适配登记表一一映射且与 2014 条目隔离', () => {
    expect(subclassAdaptations2024).toHaveLength(5)
    for (const entry of subclassAdaptations2024) {
      expect(rulesRepository2014.getSubclass(entry.from2014Id), entry.from2014Id).toBeDefined()
      expect(rulesRepository2024.getSubclass(entry.to2024Id), entry.to2024Id).toBeDefined()
      expect(entry.sourceId).toBe(SOURCE)
      expect(entry.from2014Id.startsWith('subclass-2014-')).toBe(true)
      expect(entry.to2024Id.startsWith('subclass-2024-ua-')).toBe(true)
    }
    expect(new Set(subclassAdaptations2024.map((entry) => entry.to2024Id)).size).toBe(5)
    expect(getSubclassAdaptation2024('subclass-2014-fighter-cavalier')?.to2024Id).toBe('subclass-2024-ua-fighter-cavalier')
    expect(getSubclassAdaptation2024('subclass-2014-fighter-champion')).toBeUndefined()
    // 2014 仓库不含 2024 条目，反之亦然。
    expect(rulesRepository2014.getSubclass('subclass-2024-ua-fighter-cavalier')).toBeUndefined()
    expect(rulesRepository2024.getSubclass('subclass-2014-fighter-cavalier')).toBeUndefined()
  })
})
