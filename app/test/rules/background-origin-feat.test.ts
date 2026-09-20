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

describe('G3-B 费伦冒险起源专长', () => {
  const repository = getRulesRepository('5e-2024')
  const faerunFeats = repository.feats.filter((feat) => feat.id.startsWith('feat-2024-fr-ai-'))
  const faerunBackgrounds = repository.backgrounds.filter((item) => item.sourceIds.includes('source-2024-fr-ai'))

  it('8 条起源专长齐备，类别与来源正确', () => {
    expect(faerunFeats.length).toBeGreaterThanOrEqual(8)
    for (const feat of faerunFeats) {
      expect(feat.ruleset, feat.id).toBe('5e-2024')
      expect(feat.category, feat.id).toBe('origin')
      expect(feat.sourceIds, feat.id).toContain('source-2024-fr-ai')
      expect(feat.englishName.length, feat.id).toBeGreaterThan(0)
      expect(feat.detail.length, feat.id).toBeGreaterThan(30)
    }
    expect(faerunFeats.map((feat) => feat.englishName)).toEqual(expect.arrayContaining([
      'Cult of the Dragon Initiate', 'Emerald Enclave Fledgling', 'Harper Agent',
      "Lords' Alliance Agent", 'Purple Dragon Rook', 'Spellfire Spark',
      'Tyro of the Gauntlet', 'Zhentarim Ruffian',
    ]))
  })

  it('费伦冒险 18 条背景中，凡有可核验专长的均已接线且可解析', () => {
    expect(faerunBackgrounds.length).toBeGreaterThanOrEqual(18)
    const linked = faerunBackgrounds.filter((item) => item.originFeatId)
    // 死魔区住民的原书专长「医疗师」在参考数据中无独立条目，保持留空（不编造 ID）。
    expect(linked.length).toBeGreaterThanOrEqual(17)
    for (const background of linked) {
      expect(repository.getFeat(background.originFeatId ?? ''), `${background.id}:${background.originFeatId}`).toBeDefined()
    }
    const unlinked = faerunBackgrounds.filter((item) => !item.originFeatId).map((item) => item.englishName)
    expect(unlinked).toEqual(['Dead Magic Dweller'])
  })

  it('专长自带的选择子项可在时间线解析（施法属性、技能三选一）', () => {
    const withChoices = faerunFeats.filter((feat) => (feat.choices?.length ?? 0) > 0)
    expect(withChoices.length).toBeGreaterThanOrEqual(3)
    for (const feat of withChoices) {
      for (const choice of feat.choices ?? []) {
        expect(choice.minSelections, `${feat.id}:${choice.id}`).toBeGreaterThan(0)
        expect(choice.maxSelections, `${feat.id}:${choice.id}`).toBeGreaterThanOrEqual(choice.minSelections)
        for (const optionId of choice.optionIds) {
          const resolvable = repository.getOption(optionId) ?? repository.getFeat(optionId)
          expect(resolvable, `${feat.id}:${optionId}`).toBeDefined()
        }
      }
    }
  })
})

describe('G3-C 启封奥秘起源专长', () => {
  const repository = getRulesRepository('5e-2024')
  const auFeats = repository.feats.filter((feat) => feat.id.startsWith('feat-2024-au-'))
  const auBackgrounds = repository.backgrounds.filter((item) => item.sourceIds.includes('source-2024-au'))

  it('10 条起源专长齐备，类别与来源正确', () => {
    expect(auFeats.length).toBeGreaterThanOrEqual(10)
    for (const feat of auFeats) {
      expect(feat.ruleset, feat.id).toBe('5e-2024')
      expect(feat.category, feat.id).toBe('origin')
      expect(feat.sourceIds, feat.id).toContain('source-2024-au')
      expect(feat.detail.length, feat.id).toBeGreaterThan(30)
    }
    expect(auFeats.map((feat) => feat.englishName)).toEqual(expect.arrayContaining([
      'Arcane Artist', 'Arcane Eloquence', 'Arcane Infiltrator', 'Arcane Omens', 'Arcane Overload',
      'Arcane Safeguard', 'Arcane Undertaker', 'Familiar Friend', 'Portal Jumper', 'Transmuted Anatomy',
    ]))
  })

  it('10 条背景全部接线且可解析', () => {
    expect(auBackgrounds.length).toBeGreaterThanOrEqual(10)
    expect(auBackgrounds.every((item) => Boolean(item.originFeatId))).toBe(true)
    for (const background of auBackgrounds) {
      expect(repository.getFeat(background.originFeatId ?? ''), `${background.id}:${background.originFeatId}`).toBeDefined()
    }
  })

  it('戏法授予与选择子项全部可解析（含死灵学派戏法与伤害抗性）', () => {
    for (const feat of auFeats) {
      for (const grant of feat.grantedSpells ?? []) {
        // 授予法术必须存在；十条专长的「戏法」子项为 0 环，魔宠密友授予的是 1 环「寻获魔宠」。
        expect(repository.getSpell(grant.spellId), `${feat.id}:${grant.spellId}`).toBeDefined()
      }
      for (const choice of feat.choices ?? []) {
        for (const optionId of choice.optionIds) {
          const resolvable = repository.getOption(optionId) ?? repository.getFeat(optionId) ?? repository.getSpell(optionId)
          expect(resolvable, `${feat.id}:${optionId}`).toBeDefined()
        }
      }
    }
    // 除魔宠密友外，授予的戏法均为 0 环
    const cantripGrants = auFeats
      .filter((feat) => feat.id !== 'feat-2024-au-familiar-friend')
      .flatMap((feat) => (feat.grantedSpells ?? []).map((grant) => ({ featId: feat.id, spellId: grant.spellId })))
    // 十条中 6 条授予固定 0 环戏法；奥法殡葬师为自选死灵戏法、穿界者与万化本质不授予法术、
    // 魔宠密友授予的是 1 环「寻获魔宠」（不计入戏法统计）。
    expect(cantripGrants.length).toBe(6)
    for (const grant of cantripGrants) {
      expect(repository.getSpell(grant.spellId)?.level, `${grant.featId}:${grant.spellId}`).toBe(0)
    }
    // 奥法殡葬师的死灵学派戏法必须都是 0 环死灵学派
    const undertaker = auFeats.find((feat) => feat.englishName === 'Arcane Undertaker')
    const cantripChoice = undertaker?.choices?.find((choice) => choice.id === 'au-undertaker-cantrip')
    expect(cantripChoice).toBeDefined()
    expect((cantripChoice?.optionIds.length ?? 0)).toBeGreaterThanOrEqual(2)
    for (const optionId of cantripChoice?.optionIds ?? []) {
      const spell = repository.getSpell(optionId)
      expect(spell?.school, optionId).toBe('死灵')
      expect(spell?.level, optionId).toBe(0)
    }
  })
})

describe('G3-D 鸦阁黑暗赠礼专长', () => {
  const repository = getRulesRepository('5e-2024')
  const gifts = repository.feats.filter((feat) => feat.category === 'dark-gift')
  const rthwBackgrounds = repository.backgrounds.filter((item) => item.sourceIds.includes('source-2024-rthw'))

  it('9 条黑暗赠礼专长齐备，类别与代价说明完整', () => {
    expect(gifts.length).toBeGreaterThanOrEqual(9)
    for (const feat of gifts) {
      expect(feat.ruleset, feat.id).toBe('5e-2024')
      expect(feat.category, feat.id).toBe('dark-gift')
      expect(feat.sourceIds, feat.id).toContain('source-2024-rthw')
      expect(feat.tags, feat.id).toContain('黑暗赠礼')
      // 黑暗赠礼同时给增益与代价：detail 必须写明「代价」与先决
      expect(feat.detail, feat.id).toContain('代价')
      expect(feat.detail, feat.id).toContain('先决：鸦阁战役')
      // 同一角色不重复拿多项黑暗赠礼
      expect(feat.prerequisite?.excludedFeatTag, feat.id).toBe('黑暗赠礼')
    }
    expect(gifts.map((feat) => feat.englishName)).toEqual(expect.arrayContaining([
      'Aberrant Anatomy', 'Echoing Soul', 'Gathered Whispers', 'Living Shadow', 'Mist Walker',
      'Second Skin', 'Symbiotic Being', 'Touch of Death', 'Watchers',
    ]))
  })

  it('四条鸦阁背景以 originFeatOptions 表达二选一，候选全部可解析', () => {
    expect(rthwBackgrounds.length).toBeGreaterThanOrEqual(4)
    for (const background of rthwBackgrounds) {
      const options = background.originFeatOptions ?? []
      expect(options.length, background.id).toBeGreaterThanOrEqual(9)
      // 声明候选后不再走固定授予
      expect(background.originFeatId, background.id).toBeUndefined()
      for (const optionId of options) {
        expect(repository.getFeat(optionId), `${background.id}:${optionId}`).toBeDefined()
        expect(repository.getFeat(optionId)?.category, `${background.id}:${optionId}`).toBe('dark-gift')
      }
    }
  })

  it('二选一检查点可在时间线生成，且候选为该背景的黑暗赠礼池', () => {
    const draft = draft2024({
      backgroundId: 'background-2024-rthw-haunted-one',
      enabledSourceIds: repository.sources.map((source) => source.id),
    })
    const timeline = buildTimeline('class-2024-fighter', 1, {
      ruleset: '5e-2024',
      backgroundId: draft.backgroundId,
      enabledSourceIds: draft.enabledSourceIds,
      repository,
    })
    const checkpointId = `${draft.backgroundId}-origin-feat`
    const checkpoint = timeline.find((item) => item.id === checkpointId)
    expect(checkpoint).toBeDefined()
    expect(checkpoint?.required).toBe(true)
    expect(checkpoint?.optionIds.length).toBeGreaterThanOrEqual(9)

    // 未选择时不授予；选择后按所选黑暗赠礼授予
    expect(listFeatGrants(draft, repository).filter((grant) => grant.sourceKind === 'background')).toEqual([])
    const chosen = { ...draft, selections: [selection(checkpointId, ['feat-2024-rthw-mist-walker'])] }
    const granted = listFeatGrants(chosen, repository).filter((grant) => grant.sourceKind === 'background')
    expect(granted.map((grant) => grant.featId)).toEqual(['feat-2024-rthw-mist-walker'])
  })

  it('黑暗赠礼授予的法术与选择子项全部可解析', () => {
    for (const feat of gifts) {
      for (const grant of feat.grantedSpells ?? []) {
        expect(repository.getSpell(grant.spellId), `${feat.id}:${grant.spellId}`).toBeDefined()
      }
      for (const choice of feat.choices ?? []) {
        for (const optionId of choice.optionIds) {
          const resolvable = repository.getOption(optionId) ?? repository.getFeat(optionId) ?? repository.getSpell(optionId)
          expect(resolvable, `${feat.id}:${optionId}`).toBeDefined()
        }
      }
    }
  })
})

describe('G3-E 第三方起源与位面契约专长', () => {
  const repository = getRulesRepository('5e-2024')
  const g3eIds = [
    'healthy', 'nocturnal', 'protected', 'well-read', 'thin-blooded',
    'faithful', 'grizzled',
    'fey-pact', 'infernal-pact', 'fey-sentinel', 'infernal-bulwark', 'infernal-dragoon',
  ].map((slug) => `feat-2024-tp-${slug}`)
  const g3eFeats = g3eIds.flatMap((id) => repository.getFeat(id) ?? [])

  it('12 条专长齐备（避世潜藏 5 + 斯坦哈德 2 + Beyond Drops 5）', () => {
    expect(g3eFeats.length).toBe(12)
    for (const feat of g3eFeats) {
      expect(feat.ruleset, feat.id).toBe('5e-2024')
      expect(feat.detail.length, feat.id).toBeGreaterThan(30)
      expect(feat.sourceIds.length, feat.id).toBeGreaterThan(0)
    }
    expect(g3eFeats.filter((feat) => feat.sourceIds.includes('source-2024-tp-vtm')).length).toBe(5)
    expect(g3eFeats.filter((feat) => feat.sourceIds.includes('source-2024-tp-steinhardt')).length).toBe(2)
    expect(g3eFeats.filter((feat) => feat.sourceIds.includes('source-2024-tp-beyond-drops')).length).toBe(5)
    // Beyond Drops 的契约专长为起源，其衍生专长为通用（4 级前置）
    const beyond = g3eFeats.filter((feat) => feat.sourceIds.includes('source-2024-tp-beyond-drops'))
    expect(beyond.filter((feat) => feat.category === 'origin').length).toBe(2)
    expect(beyond.filter((feat) => feat.category === 'general').length).toBe(3)
  })

  it('避世潜藏 5 条背景以「固定专长 或 薄血」二选一表达，候选可解析', () => {
    const vtmBackgrounds = repository.backgrounds.filter((item) => item.sourceIds.includes('source-2024-tp-vtm'))
    expect(vtmBackgrounds.length).toBeGreaterThanOrEqual(5)
    for (const background of vtmBackgrounds) {
      expect(background.originFeatId, background.id).toBeDefined()
      expect(repository.getFeat(background.originFeatId ?? ''), background.id).toBeDefined()
      const options = background.originFeatOptions ?? []
      expect(options.length, background.id).toBe(2)
      expect(options, background.id).toContain('feat-2024-tp-thin-blooded')
      expect(options, background.id).toContain(background.originFeatId)
      for (const optionId of options) {
        expect(repository.getFeat(optionId), `${background.id}:${optionId}`).toBeDefined()
      }
    }
  })

  it('斯坦哈德两条背景接上虔信／霜鬓', () => {
    expect(repository.getBackground('background-2024-tp-inquisitor')?.originFeatId).toBe('feat-2024-tp-faithful')
    expect(repository.getBackground('background-2024-tp-beast-hunter')?.originFeatId).toBe('feat-2024-tp-grizzled')
  })

  it('契约追寻者为「妖精契约 或 地狱契约」二选一，且位面契约专长互斥', () => {
    const seeker = repository.getBackground('background-2024-tp-beyond-pact-seeker')
    expect(seeker?.originFeatOptions).toEqual(['feat-2024-tp-fey-pact', 'feat-2024-tp-infernal-pact'])
    expect(seeker?.originFeatId).toBeUndefined()
    // 原书：先决为「不具有其他位面契约专长」
    for (const id of ['feat-2024-tp-fey-pact', 'feat-2024-tp-infernal-pact']) {
      expect(repository.getFeat(id)?.detail, id).toContain('不具有其他位面契约专长')
    }
  })

  it('Beyond Drops 授予法术可解析且衍生专长带 4 级前置', () => {
    for (const id of ['feat-2024-tp-fey-sentinel', 'feat-2024-tp-infernal-bulwark', 'feat-2024-tp-infernal-dragoon']) {
      const feat = repository.getFeat(id)
      expect(feat?.detail, id).toContain('等级 4+')
      for (const grant of feat?.grantedSpells ?? []) {
        expect(repository.getSpell(grant.spellId), `${id}:${grant.spellId}`).toBeDefined()
      }
    }
  })
})

describe('G3-F 龙纹专长译名与授予链', () => {
  const repository = getRulesRepository('5e-2024')
  const dragonmarkFeats = repository.feats.filter((feat) => feat.category === 'dragonmark' || feat.id.includes('dragonmark'))

  it('龙纹专长中文名一律为「XX龙纹」，不再出现「之纹」', () => {
    expect(dragonmarkFeats.length).toBeGreaterThanOrEqual(27)
    for (const feat of dragonmarkFeats) {
      expect(feat.name, feat.id).not.toContain('之纹')
      expect(feat.name.endsWith('龙纹'), `${feat.id}:${feat.name}`).toBe(true)
    }
    // 全仓库专长名不得残留 UA 旧译名用词
    const stale = repository.feats.filter((feat) => feat.name.includes('之纹')).map((feat) => feat.id)
    expect(stale).toEqual([])
  })

  it('官方译名逐一对应（含三处与 UA 用词不同的条目）', () => {
    const expected: Readonly<Record<string, string>> = {
      'feat-2024-ua-dragonmark-markofdetection': '侦测龙纹',
      'feat-2024-ua-dragonmark-markoffinding': '探寻龙纹',
      'feat-2024-ua-dragonmark-markofhandling': '畜牧龙纹',
      'feat-2024-ua-dragonmark-markofhealing': '医疗龙纹',
      'feat-2024-ua-dragonmark-markofhospitality': '招待龙纹',
      'feat-2024-ua-dragonmark-markofmaking': '创造龙纹',
      'feat-2024-ua-dragonmark-markofpassage': '通行龙纹',
      'feat-2024-ua-dragonmark-markofscribing': '抄录龙纹',
      'feat-2024-ua-dragonmark-markofsentinel': '哨戒龙纹',
      'feat-2024-ua-dragonmark-markofshadow': '阴影龙纹',
      'feat-2024-ua-dragonmark-markofstorm': '风暴龙纹',
      'feat-2024-ua-dragonmark-markofwarding': '守御龙纹',
      'feat-2024-ua-dragonmark-abrrantdragonmark': '异种龙纹',
    }
    for (const [id, name] of Object.entries(expected)) {
      expect(repository.getFeat(id)?.name, id).toBe(name)
    }
  })

  it('高等龙纹的前置仍指向对应基础龙纹，且条目 ID 未变', () => {
    const pairs: readonly (readonly [string, string])[] = [
      ['feat-2024-ua-greater-dragonmark-greatermarkofdetection', 'feat-2024-ua-dragonmark-markofdetection'],
      ['feat-2024-ua-greater-dragonmark-greatermarkoffinding', 'feat-2024-ua-dragonmark-markoffinding'],
      ['feat-2024-ua-greater-dragonmark-greatermarkofhealing', 'feat-2024-ua-dragonmark-markofhealing'],
      ['feat-2024-ua-greater-dragonmark-greatermarkofsentinel', 'feat-2024-ua-dragonmark-markofsentinel'],
      ['feat-2024-ua-greater-dragonmark-greatermarkofwarding', 'feat-2024-ua-dragonmark-markofwarding'],
    ]
    for (const [greaterId, baseId] of pairs) {
      const greater = repository.getFeat(greaterId)
      expect(greater, greaterId).toBeDefined()
      expect(greater?.prerequisite?.requiredFeatIds, greaterId).toContain(baseId)
      expect(repository.getFeat(baseId), baseId).toBeDefined()
      // 高等版名称应为基础名加「高等」前缀
      expect(greater?.name, greaterId).toBe(`高等${repository.getFeat(baseId)?.name ?? ''}`)
    }
  })

  it('龙纹专长同时登记官方书来源，奇械锻炉背景授予链完整', () => {
    for (const feat of dragonmarkFeats) {
      expect(feat.sourceIds, feat.id).toContain('source-2024-efa')
      expect(feat.sourceIds, feat.id).toContain('source-2024-ua-eberron')
    }
    const efaBackgrounds = repository.backgrounds.filter((item) => item.sourceIds.includes('source-2024-efa'))
    expect(efaBackgrounds.length).toBeGreaterThanOrEqual(17)
    for (const background of efaBackgrounds) {
      if (!background.originFeatId) continue
      const feat = repository.getFeat(background.originFeatId)
      expect(feat, `${background.id}:${background.originFeatId}`).toBeDefined()
    }
    // 乔拉斯科家族后裔 → 医疗龙纹（原 UA 译名为「医疗之纹」）
    expect(repository.getFeat(repository.getBackground('background-2024-efa-jorasco-heir')?.originFeatId ?? '')?.name).toBe('医疗龙纹')
  })
})
