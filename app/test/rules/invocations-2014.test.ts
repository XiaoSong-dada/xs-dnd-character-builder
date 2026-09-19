import { describe, expect, it } from 'vitest'

import { INVOCATION_2024_OPTION_IDS } from '@/rules/data/invocations-2024'
import {
  INVOCATION_2014_CHECKPOINTS,
  INVOCATION_2014_LEGACY_OPTION_IDS,
  INVOCATION_2014_OPTION_IDS,
  invocationIdsAt,
  invocations2014,
} from '@/rules/data/invocations-2014'
import { rulesRepository } from '@/rules/repository'
import { buildTimeline } from '@/rules/timeline'
import { validateDraft } from '@/rules/validate'
import type { CharacterDraft } from '@/types/character'

import { draft2024, selection } from '../fixtures/draft-2024'

/** 2014 扩展来源默认开启（PHB 属 core，始终启用）。 */
const ALL_SOURCES = ['phb-2014-index', 'xgte-2017-index', 'tcoe-2020-index'] as const
const ELDRITCH_BLAST = 'spell-2014-eldritch-blast'

function warlockDraft(level: number, overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return draft2024({
    ruleset: '5e-2014',
    classId: 'class-2014-warlock',
    targetLevel: level,
    enabledSourceIds: [...ALL_SOURCES],
    ...overrides,
  })
}

const issueIds = (draft: CharacterDraft) => validateDraft(draft).map((issue) => issue.id)

/** 仅取阻塞级问题：`index-only` 选项本身会产生一条 warning 级「只有规则索引」提示，不算先决失败。 */
const errorIds = (draft: CharacterDraft) =>
  validateDraft(draft).filter((issue) => issue.severity === 'error').map((issue) => issue.id)

const timelineAt = (level: number, sources: readonly string[] = ALL_SOURCES) =>
  buildTimeline('class-2014-warlock', level, { enabledSourceIds: sources })

const candidatesAt = (level: number) =>
  timelineAt(level).find((checkpoint) => checkpoint.id === `warlock-2014-invocations-${level}`)?.optionIds ?? []

describe('2014 邪术师魔能祈唤数据', () => {
  it('54 条：ID 与名称唯一、英文名齐备、来源分布为 PHB 32 / XGtE 14 / TCoE 8', () => {
    expect(invocations2014).toHaveLength(54)
    expect(INVOCATION_2014_OPTION_IDS).toHaveLength(54)
    expect(new Set(invocations2014.map((option) => option.id)).size).toBe(54)
    expect(new Set(invocations2014.map((option) => option.name)).size).toBe(54)
    expect(invocations2014.every((option) => (option.englishName?.length ?? 0) > 0)).toBe(true)

    const countBySource = (sourceId: string) =>
      invocations2014.filter((option) => option.sourceIds.includes(sourceId)).length
    expect(countBySource('phb-2014-index')).toBe(32)
    expect(countBySource('xgte-2017-index')).toBe(14)
    expect(countBySource('tcoe-2020-index')).toBe(8)

    const allowedSources = new Set(ALL_SOURCES)
    for (const option of invocations2014) {
      expect(option.sourceIds.length, option.id).toBe(1)
      expect(allowedSources.has(option.sourceIds[0] ?? ''), option.id).toBe(true)
      expect(option.status, option.id).toBe('implemented')
    }
  })

  it('保留首版 3 条索引 ID，且与 2024 侧 ID 完全隔离', () => {
    expect(INVOCATION_2014_LEGACY_OPTION_IDS).toEqual([
      'invocation-agonizing-blast',
      'invocation-devils-sight',
      'invocation-mask-of-many-faces',
    ])
    for (const id of INVOCATION_2014_LEGACY_OPTION_IDS) {
      expect(INVOCATION_2014_OPTION_IDS, id).toContain(id)
      expect(rulesRepository.getOption(id), id).toBeDefined()
    }

    const ids2014 = new Set(INVOCATION_2014_OPTION_IDS)
    expect(INVOCATION_2024_OPTION_IDS.filter((id) => ids2014.has(id))).toEqual([])
  })

  it('译名按《5e 不全书》2014 章节定稿（含 2 条改名与 4 项魔契恩泽）', () => {
    const nameOf = (id: string) => rulesRepository.getOption(id)?.name
    expect(nameOf('invocation-agonizing-blast')).toBe('苦痛魔爆')
    expect(nameOf('invocation-mask-of-many-faces')).toBe('千面之脸')
    expect(nameOf('invocation-2014-misty-visions')).toBe('迷雾幻影')
    expect(nameOf('invocation-2014-whispers-of-the-grave')).toBe('坟墓低语')

    expect(nameOf('pact-chain')).toBe('链之魔契')
    expect(nameOf('pact-blade')).toBe('刃之魔契')
    expect(nameOf('pact-tome')).toBe('书之魔契')
    expect(nameOf('pact-talisman')).toBe('符之魔契')
  })

  it('先决分布：等级 30 条、魔契 15 条、法术 5 条、无先决 12 条', () => {
    const hasLevel = (option: (typeof invocations2014)[number]) => option.minimumLevel !== undefined
    const hasPact = (option: (typeof invocations2014)[number]) => (option.requiredOptionIds?.length ?? 0) > 0
    const hasSpell = (option: (typeof invocations2014)[number]) => (option.requiredSpellIds?.length ?? 0) > 0

    expect(invocations2014.filter(hasLevel)).toHaveLength(30)
    expect(invocations2014.filter(hasPact)).toHaveLength(15)
    expect(invocations2014.filter(hasSpell)).toHaveLength(5)
    expect(invocations2014.filter((option) => !hasLevel(option) && !hasPact(option) && !hasSpell(option))).toHaveLength(12)
  })

  it('法术先决统一指向戏法魔能爆，且该法术存在于 2014 法术库', () => {
    for (const option of invocations2014.filter((item) => (item.requiredSpellIds?.length ?? 0) > 0)) {
      expect(option.requiredSpellIds, option.id).toEqual([ELDRITCH_BLAST])
    }
    expect(rulesRepository.getSpell(ELDRITCH_BLAST)).toBeDefined()
  })

  it('魔契先决只引用 4 项魔契恩泽；符之魔契系 3 条均依赖 tcoe 来源', () => {
    const pactIds = new Set(['pact-chain', 'pact-blade', 'pact-tome', 'pact-talisman'])
    for (const option of invocations2014) {
      for (const requiredId of option.requiredOptionIds ?? []) {
        expect(pactIds.has(requiredId), `${option.id} -> ${requiredId}`).toBe(true)
      }
    }
    const talismanDependants = invocations2014
      .filter((option) => option.requiredOptionIds?.includes('pact-talisman'))
      .map((option) => option.id)
    expect(talismanDependants.sort()).toEqual([
      'invocation-2014-bond-of-the-talisman',
      'invocation-2014-protection-of-the-talisman',
      'invocation-2014-rebuke-of-the-talisman',
    ])
    for (const id of talismanDependants) {
      expect(rulesRepository.getOption(id)?.sourceIds).toEqual(['tcoe-2020-index'])
    }
  })

  it('授予法术 3 条，指向的法术均存在', () => {
    const granted = invocations2014.filter((option) => (option.grantedSpells?.length ?? 0) > 0)
    expect(granted.map((option) => option.id).sort()).toEqual([
      'invocation-2014-gift-of-the-depths',
      'invocation-2014-tricksters-escape',
      'invocation-2014-undying-servitude',
    ])
    for (const option of granted) {
      for (const grant of option.grantedSpells ?? []) {
        expect(rulesRepository.getSpell(grant.spellId), grant.spellId).toBeDefined()
        expect(grant.freeCastings, option.id).toBe(1)
        expect(grant.recovery, option.id).toBe('long-rest')
      }
    }
  })
})

describe('2014 魔能祈唤分级检查点', () => {
  it('2 级 2 项，5／7／9／12／15／18 级各 +1，至 20 级累计 8 项', () => {
    expect(INVOCATION_2014_CHECKPOINTS).toEqual([
      { level: 2, count: 2 },
      { level: 5, count: 1 },
      { level: 7, count: 1 },
      { level: 9, count: 1 },
      { level: 12, count: 1 },
      { level: 15, count: 1 },
      { level: 18, count: 1 },
    ])

    const checkpoints = timelineAt(20).filter((checkpoint) => checkpoint.id.startsWith('warlock-2014-invocations-'))
    expect(checkpoints.map((checkpoint) => [checkpoint.id, checkpoint.level, checkpoint.minSelections, checkpoint.maxSelections])).toEqual([
      ['warlock-2014-invocations-2', 2, 2, 2],
      ['warlock-2014-invocations-5', 5, 1, 1],
      ['warlock-2014-invocations-7', 7, 1, 1],
      ['warlock-2014-invocations-9', 9, 1, 1],
      ['warlock-2014-invocations-12', 12, 1, 1],
      ['warlock-2014-invocations-15', 15, 1, 1],
      ['warlock-2014-invocations-18', 18, 1, 1],
    ])
    expect(checkpoints.reduce((total, checkpoint) => total + checkpoint.maxSelections, 0)).toBe(8)
    expect(checkpoints.every((checkpoint) => checkpoint.uniqueGroup === 'warlock-2014-invocations-known')).toBe(true)
    expect(checkpoints.every((checkpoint) => checkpoint.optionPresentation === 'expandable')).toBe(true)
  })

  it('候选按等级先决累计放宽：24 / 35 / 42 / 47 / 49 / 54', () => {
    expect([2, 5, 7, 9, 12, 15, 18].map((level) => candidatesAt(level).length)).toEqual([24, 35, 42, 47, 49, 54, 54])
    expect(candidatesAt(18)).toEqual(INVOCATION_2014_OPTION_IDS)
    expect(invocationIdsAt(2)).toHaveLength(24)
  })

  it('未标记的检查点保持默认紧凑卡（其它职业不受影响）', () => {
    const wizardTimeline = buildTimeline('class-2014-wizard', 20, { enabledSourceIds: [...ALL_SOURCES] })
    expect(wizardTimeline.every((checkpoint) => checkpoint.optionPresentation === undefined)).toBe(true)
  })

  it('跨等级重复选择同一祈唤被拦截', () => {
    const duplicated = warlockDraft(5, {
      selections: [
        selection('warlock-2014-invocations-2', ['invocation-2014-armor-of-shadows', 'invocation-devils-sight']),
        selection('warlock-2014-invocations-5', ['invocation-2014-armor-of-shadows']),
      ],
    })
    expect(issueIds(duplicated)).toContain('duplicate-option-group-warlock-2014-invocations-known')
  })
})

describe('2014 魔能祈唤先决校验', () => {
  it('等级先决：低等级选择高等级祈唤会给出原因', () => {
    const draft = warlockDraft(3, {
      selections: [selection('warlock-2014-invocations-2', ['invocation-2014-ascendant-step'])],
    })
    expect(issueIds(draft)).toContain('option-level-warlock-2014-invocations-2-invocation-2014-ascendant-step')
  })

  it('魔契先决：未选刃之魔契时不能取饥渴魔刃，选中后不再报错', () => {
    const withoutPact = warlockDraft(5, {
      selections: [selection('warlock-2014-invocations-5', ['invocation-2014-thirsting-blade'])],
    })
    expect(issueIds(withoutPact)).toContain('option-prerequisite-warlock-2014-invocations-5-invocation-2014-thirsting-blade')

    const withPact = warlockDraft(5, {
      selections: [
        selection('warlock-2014-pact-3', ['pact-blade']),
        selection('warlock-2014-invocations-5', ['invocation-2014-thirsting-blade']),
      ],
    })
    expect(issueIds(withPact)).not.toContain('option-prerequisite-warlock-2014-invocations-5-invocation-2014-thirsting-blade')
  })

  it('法术先决：未习得魔能爆时不能取苦痛魔爆，习得后不再报错', () => {
    const withoutCantrip = warlockDraft(2, {
      selections: [selection('warlock-2014-invocations-2', ['invocation-agonizing-blast'])],
    })
    expect(issueIds(withoutCantrip)).toContain('option-spell-prerequisite-warlock-2014-invocations-2-invocation-agonizing-blast')

    const withCantrip = warlockDraft(2, {
      spellSelections: { ...warlockDraft(2).spellSelections, cantripIds: [ELDRITCH_BLAST] },
      selections: [selection('warlock-2014-invocations-2', ['invocation-agonizing-blast', 'invocation-devils-sight'])],
    })
    expect(issueIds(withCantrip)).not.toContain('option-spell-prerequisite-warlock-2014-invocations-2-invocation-agonizing-blast')
  })

  it('择一条件的 2 条祈唤只做等级校验，不因缺诅咒法术报错', () => {
    const draft = warlockDraft(5, {
      selections: [selection('warlock-2014-invocations-5', ['invocation-2014-maddening-hex'])],
    })
    const ids = errorIds(draft)
    expect(ids.some((id) => id.includes('invocation-2014-maddening-hex'))).toBe(false)

    const tooEarly = warlockDraft(2, {
      selections: [selection('warlock-2014-invocations-2', ['invocation-2014-maddening-hex'])],
    })
    expect(issueIds(tooEarly)).toContain('option-level-warlock-2014-invocations-2-invocation-2014-maddening-hex')
  })
})

describe('2014 魔契恩泽候选按来源开关', () => {
  const pactOptions = (sources: readonly string[]) =>
    timelineAt(3, sources).find((checkpoint) => checkpoint.id === 'warlock-2014-pact-3')?.optionIds ?? []

  it('全来源开启时 4 项齐备（含符之魔契）', () => {
    expect(pactOptions(ALL_SOURCES)).toEqual(['pact-chain', 'pact-blade', 'pact-tome', 'pact-talisman'])
  })

  it('关闭 TCoE 时符之魔契出候选，其余 3 项保留', () => {
    expect(pactOptions(['phb-2014-index'])).toEqual(['pact-chain', 'pact-blade', 'pact-tome'])
  })

  it('关闭 XGtE／TCoE 时祈唤候选只剩 PHB 的 32 条', () => {
    const phbOnly = timelineAt(20, ['phb-2014-index']).find((checkpoint) => checkpoint.id === 'warlock-2014-invocations-18')?.optionIds ?? []
    expect(phbOnly).toHaveLength(32)
    expect(phbOnly.every((id) => rulesRepository.getOption(id)?.sourceIds.includes('phb-2014-index'))).toBe(true)
  })
})
