import { describe, expect, it } from 'vitest'

import { getRulesRepository } from '@/rules/repositories'
import { getAlwaysPreparedSpellIds, getCheckpointCandidates, getSpellFreeCastings } from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import { validateDraft } from '@/rules/validate'
import type { CharacterDraft } from '@/types/character'
import { draft2024, selection } from '../fixtures/draft-2024'

function timeline(draft: CharacterDraft) {
  return buildTimeline(draft.classId ?? '', draft.targetLevel, {
    ruleset: draft.ruleset,
    raceId: draft.raceId,
    backgroundId: draft.backgroundId,
    enabledSourceIds: draft.enabledSourceIds,
    selections: draft.selections,
  })
}

describe('固定背景魔法学徒子任务', () => {
  it.each([
    ['background-2024-acolyte', 'class-2024-cleric'],
    ['background-2024-guide', 'class-2024-druid'],
    ['background-2024-sage', 'class-2024-wizard'],
  ] as const)('%s 固定法术表并生成戏法、一环与施法属性任务', (backgroundId, expectedClassId) => {
    const draft = draft2024({ classId: 'class-2024-fighter', backgroundId })
    const checkpoints = timeline(draft)
    const repository = getRulesRepository(draft.ruleset)
    const parentId = `${backgroundId}-origin-feat`
    expect(checkpoints.some((item) => item.id === `feat-child:${parentId}:feat-2024-magic-initiate:list`)).toBe(false)
    const children = checkpoints.filter((item) => item.id.startsWith(`feat-child:${parentId}:feat-2024-magic-initiate:`))
    expect(children.map((item) => item.id.split(':').at(-1))).toEqual(['ability', 'cantrips', 'spell'])
    for (const checkpoint of children.filter((item) => item.candidateKind === 'spell-pool')) {
      const candidates = getCheckpointCandidates(draft, checkpoint)
      expect(candidates.length).toBeGreaterThan(0)
      expect(candidates.every((id) => id.startsWith('spell-2024-'))).toBe(true)
      expect(candidates.every((id) => repository.getSpell(id)?.classIds.includes(expectedClassId))).toBe(true)
    }
  })

  it('2014 星界浪客固定牧师法术表并生成可完成的法术任务', () => {
    const draft = draft2024({
      ruleset: '5e-2014',
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-astral-drifter',
    })
    const checkpoints = timeline(draft)
    const prefix = 'feat-child:background-2014-astral-drifter-origin-feat:feat-magic-initiate:'
    expect(checkpoints.filter((item) => item.id.startsWith(prefix)).map((item) => item.id.slice(prefix.length)))
      .toEqual(['cantrips', 'spell'])
    for (const checkpoint of checkpoints.filter((item) => item.id.startsWith(prefix))) {
      expect(getCheckpointCandidates(draft, checkpoint).length).toBeGreaterThan(0)
    }
  })

  it('2014 受宠者选择魔法学徒后可自行选择六种施法职业法术表', () => {
    const parent = 'background-2014-rewarded-origin-feat'
    const draft = draft2024({
      ruleset: '5e-2014',
      classId: 'class-2014-fighter',
      backgroundId: 'background-2014-rewarded',
      selections: [selection(parent, ['feat-magic-initiate'])],
    })
    const list = timeline(draft).find((item) => item.id === `feat-child:${parent}:feat-magic-initiate:list`)
    expect(list?.optionIds).toEqual([
      'spell-list-bard', 'spell-list-cleric', 'spell-list-druid',
      'spell-list-sorcerer', 'spell-list-warlock', 'spell-list-wizard',
    ])
  })

  it('背景固定实例与人类额外实例使用不同父检查点，子选择互不串写', () => {
    const draft = draft2024({
      classId: 'class-2024-fighter',
      raceId: 'species-2024-human',
      backgroundId: 'background-2024-sage',
      selections: [selection('species-2024-human-origin-feat', ['feat-2024-magic-initiate'])],
    })
    const ids = timeline(draft).map((item) => item.id)
    expect(ids).toContain('feat-child:background-2024-sage-origin-feat:feat-2024-magic-initiate:cantrips')
    expect(ids).toContain('feat-child:species-2024-human-origin-feat:feat-2024-magic-initiate:list')
    expect(ids).toContain('feat-child:species-2024-human-origin-feat:feat-2024-magic-initiate:cantrips')
  })

  it('仪式专家选中魔法学徒后沿用背景预设的法师表', () => {
    const parent = 'background-2024-tp-vtm-ritualist-origin-feat'
    const draft = draft2024({
      classId: 'class-2024-fighter',
      backgroundId: 'background-2024-tp-vtm-ritualist',
      enabledSourceIds: ['source-2024-tp-vtm'],
      selections: [selection(parent, ['feat-2024-magic-initiate'])],
    })
    const checkpoints = timeline(draft)
    expect(checkpoints.some((item) => item.id === `feat-child:${parent}:feat-2024-magic-initiate:list`)).toBe(false)
    const cantrips = checkpoints.find((item) => item.id === `feat-child:${parent}:feat-2024-magic-initiate:cantrips`)
    expect(cantrips && getCheckpointCandidates(draft, cantrips)).toContain('spell-2024-fire-bolt')
  })

  it('固定背景实例完成后通过子任务校验，并派生始终准备与免费施放', () => {
    const parent = 'background-2024-sage-origin-feat'
    const child = (choiceId: string) => `feat-child:${parent}:feat-2024-magic-initiate:${choiceId}`
    const draft = draft2024({
      classId: 'class-2024-fighter',
      backgroundId: 'background-2024-sage',
      selections: [
        selection(child('ability'), ['feat-bonus-int-1']),
        selection(child('cantrips'), ['spell-2024-fire-bolt', 'spell-2024-ray-of-frost']),
        selection(child('spell'), ['spell-2024-shield']),
      ],
    })

    expect(validateDraft(draft).some((issue) => issue.id.includes(`feat-child:${parent}`))).toBe(false)
    expect(getAlwaysPreparedSpellIds(draft)).toContain('spell-2024-shield')
    expect(getSpellFreeCastings(draft).find((item) => item.spellId === 'spell-2024-shield'))
      .toMatchObject({ count: 1, recovery: 'long-rest', ability: 'int' })
  })
})
