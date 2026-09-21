import { describe, expect, it } from 'vitest'

import { listActiveFeats, listFeatGrants } from '@/rules/feats'
import { getRulesRepository } from '@/rules/repositories'
import { settingFeats2014 } from '@/rules/data/feats-settings-2014'
import type { CharacterDraft } from '@/types/character'
import { draft2024 } from '../fixtures/draft-2024'

/**
 * H4（决策 Q3-A）：2014 官方设定书「背景授予专长」补录与自动授予。
 *
 * 覆盖：
 * - 6 条设定专长条目齐备且来源正确（CHM：`1928`／`606`／`3111`／`6971`）；
 * - 14 条背景接线可解析（12 固定授予 + 2 三选一），0 悬空引用；
 * - 星界浪客按原书授予「魔法学徒」而非独立专长；
 * - 2014 与 2024 仓库互不串数据。
 */
const repository = getRulesRepository('5e-2014')

const SETTING_FEAT_IDS = [
  'feat-2014-dsotdq-squire-of-solamnia',
  'feat-2014-dsotdq-initiate-of-high-sorcery',
  'feat-2014-sato-scion-of-the-outer-planes',
  'feat-2014-scc-strixhaven-initiate',
  'feat-2014-bigby-strike-of-the-giants',
  'feat-2014-bigby-rune-shaper',
] as const

/** 12 条固定授予背景（星界浪客按原书授予已有的「魔法学徒」）。 */
const FIXED_GRANT_BACKGROUNDS: Readonly<Record<string, string>> = {
  'background-2014-knight-of-solamnia': 'feat-2014-dsotdq-squire-of-solamnia',
  'background-2014-mage-of-high-sorcery': 'feat-2014-dsotdq-initiate-of-high-sorcery',
  'background-2014-planar-philosopher': 'feat-2014-sato-scion-of-the-outer-planes',
  'background-2014-gate-warden': 'feat-2014-sato-scion-of-the-outer-planes',
  'background-2014-astral-drifter': 'feat-magic-initiate',
  'background-2014-prismari-student': 'feat-2014-scc-strixhaven-initiate',
  'background-2014-lorehold-student': 'feat-2014-scc-strixhaven-initiate',
  'background-2014-quandrix-student': 'feat-2014-scc-strixhaven-initiate',
  'background-2014-silverquill-student': 'feat-2014-scc-strixhaven-initiate',
  'background-2014-witherbloom-student': 'feat-2014-scc-strixhaven-initiate',
  'background-2014-giant-foundling': 'feat-2014-bigby-strike-of-the-giants',
  'background-2014-rune-carver': 'feat-2014-bigby-rune-shaper',
}

/** 2 条三选一背景及其候选（复用二选一机制）。 */
const CHOICE_GRANT_BACKGROUNDS: Readonly<Record<string, readonly string[]>> = {
  'background-2014-rewarded': ['feat-lucky', 'feat-magic-initiate', 'feat-skilled'],
  'background-2014-ruined': ['feat-alert', 'feat-skilled', 'feat-tough'],
}

function legacyDraft(backgroundId: string, selections: CharacterDraft['selections'] = []): CharacterDraft {
  return draft2024({
    ruleset: '5e-2014',
    classId: 'class-2014-fighter',
    backgroundId,
    selections,
    enabledSourceIds: repository.sources.map((source) => source.id),
  })
}

describe('H4 2014 设定专长条目', () => {
  it('6 条设定专长齐备，中英文名、来源与状态正确', () => {
    expect(settingFeats2014).toHaveLength(6)
    // 5 条含子选择（月亮／位面／学院／打击类型／符文），按项目边界在 detail 注明「按原书处理」。
    const subChoiceFeatIds = SETTING_FEAT_IDS.filter((id) => id !== 'feat-2014-dsotdq-squire-of-solamnia')
    const expectedSources: Readonly<Record<string, string>> = {
      'feat-2014-dsotdq-squire-of-solamnia': 'dsotdq-2022-index',
      'feat-2014-dsotdq-initiate-of-high-sorcery': 'dsotdq-2022-index',
      'feat-2014-sato-scion-of-the-outer-planes': 'sato-2023-index',
      'feat-2014-scc-strixhaven-initiate': 'scc-2021-index',
      'feat-2014-bigby-strike-of-the-giants': 'bigby-2023-index',
      'feat-2014-bigby-rune-shaper': 'bigby-2023-index',
    }
    for (const feat of settingFeats2014) {
      expect(repository.getFeat(feat.id), feat.id).toBeDefined()
      expect(feat.ruleset).toBe('5e-2014')
      expect(feat.name.length).toBeGreaterThan(0)
      expect(feat.englishName.length).toBeGreaterThan(0)
      expect(feat.detail.length).toBeGreaterThan(feat.description.length)
      expect(feat.sourceIds).toEqual([expectedSources[feat.id]])
      if (subChoiceFeatIds.includes(feat.id)) expect(feat.detail, feat.id).toContain('按原书处理')
      // 2014 条目不写 2024 专长类别。
      expect(feat.category).toBeUndefined()
    }
    expect(settingFeats2014.map((feat) => feat.id).sort()).toEqual([...SETTING_FEAT_IDS].sort())
  })

  it('中文名与参考资料一致（索兰尼亚扈从／巨人打击／符文塑形者等）', () => {
    const names = Object.fromEntries(settingFeats2014.map((feat) => [feat.id, feat.name]))
    expect(names['feat-2014-dsotdq-squire-of-solamnia']).toBe('索兰尼亚扈从')
    expect(names['feat-2014-dsotdq-initiate-of-high-sorcery']).toBe('高等术法入门')
    expect(names['feat-2014-sato-scion-of-the-outer-planes']).toBe('外层位面后裔')
    expect(names['feat-2014-scc-strixhaven-initiate']).toBe('斯翠海文学徒')
    expect(names['feat-2014-bigby-strike-of-the-giants']).toBe('巨人打击')
    expect(names['feat-2014-bigby-rune-shaper']).toBe('符文塑形者')
  })

  it('规则集隔离：2014 设定专长不出现在 2024 仓库', () => {
    const modern = getRulesRepository('5e-2024')
    for (const featId of SETTING_FEAT_IDS) {
      expect(modern.getFeat(featId), featId).toBeUndefined()
    }
  })
})

describe('H4 2014 背景授予接线', () => {
  it('12 条固定授予背景的 originFeatId 全部可解析', () => {
    for (const [backgroundId, featId] of Object.entries(FIXED_GRANT_BACKGROUNDS)) {
      const background = repository.getBackground(backgroundId)
      expect(background, backgroundId).toBeDefined()
      expect(background?.originFeatId, backgroundId).toBe(featId)
      expect(repository.getFeat(featId), `${backgroundId} → ${featId}`).toBeDefined()
    }
  })

  it('2 条三选一背景声明 3 个候选且全部可解析', () => {
    for (const [backgroundId, optionIds] of Object.entries(CHOICE_GRANT_BACKGROUNDS)) {
      const background = repository.getBackground(backgroundId)
      expect(background?.originFeatOptions, backgroundId).toEqual(optionIds)
      for (const optionId of background?.originFeatOptions ?? []) {
        expect(repository.getFeat(optionId), `${backgroundId} → ${optionId}`).toBeDefined()
      }
    }
  })

  it('固定授予背景无需选择即授予专长，并可在角色卡列出', () => {
    const draft = legacyDraft('background-2014-giant-foundling')
    const grants = listFeatGrants(draft, repository).filter((grant) => grant.sourceKind === 'background')
    expect(grants.map((grant) => grant.featId)).toEqual(['feat-2014-bigby-strike-of-the-giants'])
    expect(listActiveFeats(draft, repository).map((feat) => feat.name)).toContain('巨人打击')
  })

  it('三选一背景未选时不授予，选定后按所选授予', () => {
    const checkpointId = 'background-2014-rewarded-origin-feat'
    const unchosen = legacyDraft('background-2014-rewarded')
    expect(listFeatGrants(unchosen, repository).filter((grant) => grant.sourceKind === 'background')).toEqual([])

    const chosen = legacyDraft('background-2014-rewarded', [
      { checkpointId, optionIds: ['feat-skilled'], confirmedAt: '' },
    ])
    const grants = listFeatGrants(chosen, repository).filter((grant) => grant.sourceKind === 'background')
    expect(grants.map((grant) => grant.featId)).toEqual(['feat-skilled'])
    expect(grants[0]?.checkpointId).toBe(checkpointId)
  })

  it('星界浪客按原书授予《玩家手册》的「魔法学徒」（神性之遇非独立专长）', () => {
    const draft = legacyDraft('background-2014-astral-drifter')
    const granted = listFeatGrants(draft, repository).filter((grant) => grant.sourceKind === 'background')
    expect(granted.map((grant) => grant.featId)).toEqual(['feat-magic-initiate'])
    expect(repository.getFeat('feat-magic-initiate')?.name).toBe('魔法学徒')
    expect(repository.feats.some((feat) => feat.name === '神性之遇')).toBe(false)
  })
})
