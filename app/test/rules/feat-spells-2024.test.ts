import { describe, expect, it } from 'vitest'

import { getAlwaysPreparedSpellIds, getCheckpointCandidates, getSpellFreeCastings } from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import { validateDraft } from '@/rules/validate'
import type { CharacterDraft } from '@/types/character'
import { draft2024, selection } from '../fixtures/draft-2024'

const PARENT = 'class-2024-fighter-feat-4'
const child = (featId: string, choiceId: string) => `feat-child:${PARENT}:${featId}:${choiceId}`

function draftWith(selections: CharacterDraft['selections'], targetLevel = 4): CharacterDraft {
  return draft2024({ targetLevel, selections })
}

function checkpointOf(draft: CharacterDraft, featId: string, choiceId: string) {
  const timeline = buildTimeline(draft.classId ?? '', draft.targetLevel, {
    ruleset: draft.ruleset,
    raceId: draft.raceId,
    selections: draft.selections,
  })
  const found = timeline.find((checkpoint) => checkpoint.id === child(featId, choiceId))
  if (!found) throw new Error(`missing checkpoint: ${child(featId, choiceId)}`)
  return found
}

describe('魔法学徒（Magic Initiate）条件子选择', () => {
  const base = [selection(PARENT, ['feat-2024-magic-initiate'])]

  it('未选法术表时法术候选为空', () => {
    const draft = draftWith(base)
    expect(getCheckpointCandidates(draft, checkpointOf(draft, 'feat-2024-magic-initiate', 'cantrips'))).toEqual([])
    expect(getCheckpointCandidates(draft, checkpointOf(draft, 'feat-2024-magic-initiate', 'spell'))).toEqual([])
  })

  it('按所选法术表生成戏法与一环候选，并保留来源', () => {
    const wizard = draftWith([...base, selection(child('feat-2024-magic-initiate', 'list'), ['spell-list-wizard'])])
    const wizardCantrips = getCheckpointCandidates(wizard, checkpointOf(wizard, 'feat-2024-magic-initiate', 'cantrips'))
    expect(wizardCantrips).toContain('spell-2024-fire-bolt')
    expect(wizardCantrips).toContain('spell-2024-mage-hand')

    const cleric = draftWith([...base, selection(child('feat-2024-magic-initiate', 'list'), ['spell-list-cleric'])])
    const clericCantrips = getCheckpointCandidates(cleric, checkpointOf(cleric, 'feat-2024-magic-initiate', 'cantrips'))
    expect(clericCantrips).toContain('spell-2024-sacred-flame')
    expect(clericCantrips).not.toContain('spell-2024-fire-bolt')
  })

  it('完整选择通过校验；法术表外的法术被拒绝', () => {
    const valid = draftWith([
      ...base,
      selection(child('feat-2024-magic-initiate', 'ability'), ['feat-bonus-int-1']),
      selection(child('feat-2024-magic-initiate', 'list'), ['spell-list-wizard']),
      selection(child('feat-2024-magic-initiate', 'cantrips'), ['spell-2024-fire-bolt', 'spell-2024-ray-of-frost']),
      selection(child('feat-2024-magic-initiate', 'spell'), ['spell-2024-shield']),
    ])
    expect(validateDraft(valid).some((issue) => issue.id.includes('feat-child:class-2024-fighter-feat-4:feat-2024-magic-initiate'))).toBe(false)

    const wrongList = draftWith([
      ...base,
      selection(child('feat-2024-magic-initiate', 'ability'), ['feat-bonus-int-1']),
      selection(child('feat-2024-magic-initiate', 'list'), ['spell-list-wizard']),
      selection(child('feat-2024-magic-initiate', 'cantrips'), ['spell-2024-fire-bolt', 'spell-2024-ray-of-frost']),
      selection(child('feat-2024-magic-initiate', 'spell'), ['spell-2024-cure-wounds']),
    ])
    expect(validateDraft(wrongList).some((issue) => issue.id.includes('checkpoint-candidate') && issue.id.includes('spell-2024-cure-wounds'))).toBe(true)
  })

  it('一环法术始终准备、长休免费 1 次，施法属性跟随专长属性选择', () => {
    const draft = draftWith([
      ...base,
      selection(child('feat-2024-magic-initiate', 'ability'), ['feat-bonus-int-1']),
      selection(child('feat-2024-magic-initiate', 'list'), ['spell-list-wizard']),
      selection(child('feat-2024-magic-initiate', 'cantrips'), ['spell-2024-fire-bolt', 'spell-2024-ray-of-frost']),
      selection(child('feat-2024-magic-initiate', 'spell'), ['spell-2024-shield']),
    ])
    expect(getAlwaysPreparedSpellIds(draft)).toContain('spell-2024-shield')
    const free = getSpellFreeCastings(draft).find((grant) => grant.spellId === 'spell-2024-shield')
    expect(free).toMatchObject({ count: 1, recovery: 'long-rest', ability: 'int' })
  })
})

describe('妖精触碰与影界触碰', () => {
  it('妖精触碰：学派候选 + 迷踪步固定授予', () => {
    const draft = draftWith([
      selection(PARENT, ['feat-2024-fey-touched']),
      selection(child('feat-2024-fey-touched', 'ability'), ['feat-bonus-wis-1']),
      selection(child('feat-2024-fey-touched', 'spell'), ['spell-2024-charm-person']),
    ])
    const pool = getCheckpointCandidates(draft, checkpointOf(draft, 'feat-2024-fey-touched', 'spell'))
    expect(pool).toContain('spell-2024-charm-person')
    expect(pool).not.toContain('spell-2024-shield')
    expect(getAlwaysPreparedSpellIds(draft)).toEqual(expect.arrayContaining(['spell-2024-misty-step', 'spell-2024-charm-person']))
    const mistyStep = getSpellFreeCastings(draft).find((grant) => grant.spellId === 'spell-2024-misty-step')
    expect(mistyStep).toMatchObject({ count: 1, recovery: 'long-rest', ability: 'wis' })
  })

  it('影界触碰：幻术／死灵候选 + 隐形术固定授予', () => {
    const draft = draftWith([
      selection(PARENT, ['feat-2024-shadow-touched']),
      selection(child('feat-2024-shadow-touched', 'ability'), ['feat-bonus-cha-1']),
      selection(child('feat-2024-shadow-touched', 'spell'), ['spell-2024-false-life']),
    ])
    const pool = getCheckpointCandidates(draft, checkpointOf(draft, 'feat-2024-shadow-touched', 'spell'))
    expect(pool).toContain('spell-2024-color-spray')
    expect(pool).toContain('spell-2024-false-life')
    expect(pool).not.toContain('spell-2024-shield')
    expect(pool).not.toContain('spell-2024-invisibility')
    expect(getAlwaysPreparedSpellIds(draft)).toContain('spell-2024-invisibility')
    expect(getSpellFreeCastings(draft).map((grant) => grant.spellId)).toContain('spell-2024-invisibility')
  })

  it('心灵感应固定授予侦测思想', () => {
    const draft = draftWith([
      selection(PARENT, ['feat-2024-telepathic']),
      selection(child('feat-2024-telepathic', 'ability'), ['feat-bonus-int-1']),
    ])
    expect(getAlwaysPreparedSpellIds(draft)).toContain('spell-2024-detect-thoughts')
    const free = getSpellFreeCastings(draft).find((grant) => grant.spellId === 'spell-2024-detect-thoughts')
    expect(free).toMatchObject({ count: 1, recovery: 'long-rest', ability: 'int' })
  })
})

describe('仪式施法者（数量随熟练加值）', () => {
  it('候选只含一环仪式法术', () => {
    const draft = draftWith([selection(PARENT, ['feat-2024-ritual-caster'])])
    const pool = getCheckpointCandidates(draft, checkpointOf(draft, 'feat-2024-ritual-caster', 'rituals'))
    expect(pool).toContain('spell-2024-alarm')
    expect(pool).toContain('spell-2024-detect-magic')
    expect(pool).not.toContain('spell-2024-fireball')
    expect(pool).not.toContain('spell-2024-shield')
  })

  it('4 级需要 2 道、9 级需要 4 道', () => {
    const levelFour = draftWith([
      selection(PARENT, ['feat-2024-ritual-caster']),
      selection(child('feat-2024-ritual-caster', 'rituals'), ['spell-2024-alarm', 'spell-2024-detect-magic']),
    ])
    expect(validateDraft(levelFour).some((issue) => issue.id === 'checkpoint-feat-child:class-2024-fighter-feat-4:feat-2024-ritual-caster:rituals')).toBe(false)

    const levelNine = draftWith([
      selection(PARENT, ['feat-2024-ritual-caster']),
      selection(child('feat-2024-ritual-caster', 'rituals'), ['spell-2024-alarm', 'spell-2024-detect-magic']),
    ], 9)
    expect(validateDraft(levelNine).some((issue) => issue.id === 'checkpoint-feat-child:class-2024-fighter-feat-4:feat-2024-ritual-caster:rituals')).toBe(true)
  })

  it('所选仪式始终准备', () => {
    const draft = draftWith([
      selection(PARENT, ['feat-2024-ritual-caster']),
      selection(child('feat-2024-ritual-caster', 'rituals'), ['spell-2024-alarm', 'spell-2024-detect-magic']),
    ])
    expect(getAlwaysPreparedSpellIds(draft)).toEqual(expect.arrayContaining(['spell-2024-alarm', 'spell-2024-detect-magic']))
  })
})
