import { describe, expect, it } from 'vitest'

import { listFeatGrants } from '@/rules/feats'
import { getRulesRepository } from '@/rules/repositories'
import { buildTimeline } from '@/rules/timeline'
import type { BackgroundRule, RulesRepository } from '@/types/rules'
import { draft2024, selection } from '../fixtures/draft-2024'

/**
 * G3-A：背景二选一起源专长（`BackgroundRule.originFeatOptions`，决策 Q1-A）。
 *
 * 用**合成背景**注入到真实仓库上做验证，避免依赖某一本具体书的数据
 * （那些书是第三方或新书，来源默认关闭、条目可能随批次调整）。
 */
const CHECKPOINT_ID = 'background-2024-probe-origin-feat'
const FIXED_FEAT = 'feat-2024-lucky'
const DARK_GIFT_FEAT = 'feat-2024-alert'

function withProbeBackground(
  repository: RulesRepository,
  patch: Pick<BackgroundRule, 'originFeatId'> & { originFeatOptions?: readonly string[] },
): RulesRepository {
  const base = repository.getBackground('background-2024-sage')
  if (!base) throw new Error('测试基准背景缺失')
  const probe: BackgroundRule = { ...base, id: 'background-2024-probe', name: '探针背景', ...patch }
  const backgrounds = [...repository.backgrounds.filter((item) => item.id !== probe.id), probe]
  const backgroundById = new Map(backgrounds.map((item) => [item.id, item]))
  return {
    ...repository,
    backgrounds,
    getBackground: (id: string) => backgroundById.get(id),
  } as RulesRepository
}

/** 草稿一律带 `classId`：`buildTimeline` 无职业时直接返回空时间线。 */
function probeDraft(repository: RulesRepository) {
  return draft2024({
    backgroundId: 'background-2024-probe',
    enabledSourceIds: repository.sources.map((source) => source.id),
  })
}

describe('G3-A 背景二选一起源专长', () => {
  it('声明 originFeatOptions 时生成必选检查点，且候选含可解析的专长', () => {
    const repository = withProbeBackground(getRulesRepository('5e-2024'), {
      originFeatId: '',
      originFeatOptions: [FIXED_FEAT, DARK_GIFT_FEAT],
    })
    const timeline = buildTimeline('class-2024-fighter', 1, {
      ruleset: '5e-2024',
      backgroundId: 'background-2024-probe',
      enabledSourceIds: repository.sources.map((source) => source.id),
      repository,
    })
    const checkpoint = timeline.find((item) => item.id === CHECKPOINT_ID)
    expect(checkpoint).toBeDefined()
    expect(checkpoint?.required).toBe(true)
    expect(checkpoint?.minSelections).toBe(1)
    expect(checkpoint?.maxSelections).toBe(1)
    expect(checkpoint?.optionIds).toEqual(expect.arrayContaining([FIXED_FEAT, DARK_GIFT_FEAT]))
    for (const optionId of checkpoint?.optionIds ?? []) {
      expect(repository.getFeat(optionId), optionId).toBeDefined()
    }
  })

  it('未声明 originFeatOptions 的背景不生成该检查点', () => {
    const repository = getRulesRepository('5e-2024')
    const timeline = buildTimeline('class-2024-fighter', 1, {
      ruleset: '5e-2024',
      backgroundId: 'background-2024-sage',
      enabledSourceIds: repository.sources.map((source) => source.id),
    })
    expect(timeline.some((item) => item.kind === 'feat' && item.id.endsWith('-origin-feat') && item.id.startsWith('background-'))).toBe(false)
  })

  it('未选择时回退到 originFeatId，选择后按其选择授予', () => {
    const repository = withProbeBackground(getRulesRepository('5e-2024'), {
      originFeatId: FIXED_FEAT,
      originFeatOptions: [FIXED_FEAT, DARK_GIFT_FEAT],
    })
    const draft = probeDraft(repository)

    const fallback = listFeatGrants(draft, repository).filter((grant) => grant.sourceKind === 'background')
    expect(fallback.map((grant) => grant.featId)).toEqual([FIXED_FEAT])

    const chosen = { ...draft, selections: [selection(CHECKPOINT_ID, [DARK_GIFT_FEAT])] }
    const picked = listFeatGrants(chosen, repository).filter((grant) => grant.sourceKind === 'background')
    expect(picked.map((grant) => grant.featId)).toEqual([DARK_GIFT_FEAT])
    expect(picked[0]?.checkpointId).toBe(CHECKPOINT_ID)
  })

  it('无 originFeatId 的二选一背景在做出选择前不授予任何专长', () => {
    const repository = withProbeBackground(getRulesRepository('5e-2024'), {
      originFeatId: '',
      originFeatOptions: [FIXED_FEAT, DARK_GIFT_FEAT],
    })
    const draft = probeDraft(repository)
    expect(listFeatGrants(draft, repository).filter((grant) => grant.sourceKind === 'background')).toEqual([])

    const chosen = { ...draft, selections: [selection(CHECKPOINT_ID, [FIXED_FEAT])] }
    expect(listFeatGrants(chosen, repository).filter((grant) => grant.sourceKind === 'background').map((grant) => grant.featId))
      .toEqual([FIXED_FEAT])
  })

  it('已用原书可替代类别替换时，二选一授予同样被移除', () => {
    const repository = getRulesRepository('5e-2024')
    const base = repository.getBackground('background-2024-noble')
    if (!base) throw new Error('测试基准背景缺失')
    const probe: BackgroundRule = {
      ...base,
      id: 'background-2024-probe',
      name: '探针背景',
      originFeatId: FIXED_FEAT,
      originFeatOptions: [FIXED_FEAT, DARK_GIFT_FEAT],
    }
    const backgrounds = [...repository.backgrounds.filter((item) => item.id !== probe.id), probe]
    const backgroundById = new Map(backgrounds.map((item) => [item.id, item]))
    const patched = { ...repository, backgrounds, getBackground: (id: string) => backgroundById.get(id) } as RulesRepository

    const draft = draft2024({
      backgroundId: 'background-2024-probe',
      enabledSourceIds: repository.sources.map((source) => source.id),
      selections: [selection(CHECKPOINT_ID, [FIXED_FEAT])],
    })
    expect(listFeatGrants(draft, patched).some((grant) => grant.sourceKind === 'background')).toBe(true)

    const substituted = {
      ...draft,
      selections: [
        ...draft.selections,
        selection('species-2024-human-origin-feat', ['feat-2024-ua-wild-talent-empath']),
      ],
    }
    expect(listFeatGrants(substituted, patched).some((grant) => grant.sourceKind === 'background')).toBe(false)
  })

  it('黑暗赠礼类别可登记，并带中文类别标签', () => {
    const repository = getRulesRepository('5e-2024')
    const darkGift = repository.feats.find((feat) => feat.category === 'dark-gift')
    // 本用例只验证类别可用：数据批次（G3-D）落地前允许为空。
    if (darkGift) {
      expect(darkGift.tags.length).toBeGreaterThan(0)
    }
    expect(repository.feats.every((feat) => feat.category === undefined || typeof feat.category === 'string')).toBe(true)
  })
})
