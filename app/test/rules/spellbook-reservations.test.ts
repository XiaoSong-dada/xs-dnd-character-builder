import { describe, expect, it } from 'vitest'

import {
  applySpellbookReservationSelection,
  getCheckpointCandidates,
} from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import type { CharacterDraft } from '@/types/character'
import { draft2024, emptySpellSelections } from '../fixtures/draft-2024'

function wizardDraft(ruleset: CharacterDraft['ruleset'], level: 18 | 20, overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return draft2024({
    id: `wizard-${ruleset}-${level}`,
    ruleset,
    classId: ruleset === '5e-2024' ? 'class-2024-wizard' : 'class-2014-wizard',
    targetLevel: level,
    name: '',
    currentStep: 'timeline',
    spellSelections: emptySpellSelections(),
    ...overrides,
  })
}

function checkpoint(draft: CharacterDraft, id: string) {
  const result = buildTimeline(draft.classId!, draft.targetLevel, {
    ruleset: draft.ruleset,
    enabledSourceIds: draft.enabledSourceIds,
    selections: draft.selections,
  }).find((item) => item.id === id)
  if (!result) throw new Error(`缺少检查点：${id}`)
  return result
}

describe.each([
  ['5e-2014', 'wizard-2014-spell-mastery-1', 'wizard-2014-signature-spells-20'],
  ['5e-2024', 'class-2024-wizard-spell-mastery-1', 'class-2024-wizard-signature-spells-20'],
] as const)('%s 高等级法师法术书预留', (ruleset, masteryId, signatureId) => {
  it('首次 18／20 级创建可从职业表先选精通与招牌法术', () => {
    const level18 = wizardDraft(ruleset, 18)
    const masteryCandidates = getCheckpointCandidates(level18, checkpoint(level18, masteryId))
    expect(masteryCandidates.length).toBeGreaterThan(0)
    expect(masteryCandidates.every((id) => id.startsWith(ruleset === '5e-2024' ? 'spell-2024-' : 'spell-2014-'))).toBe(true)

    const level20 = wizardDraft(ruleset, 20)
    expect(getCheckpointCandidates(level20, checkpoint(level20, signatureId)).length).toBeGreaterThanOrEqual(2)
  })

  it('已有角色即使清空法术书也不扩大候选池', () => {
    const existing = wizardDraft(ruleset, 18, { name: '已有法师' })
    expect(getCheckpointCandidates(existing, checkpoint(existing, masteryId))).toEqual([])
  })

  it('保存时写入法术书且只计一份，首次构筑更换后释放旧预留', () => {
    const draft = wizardDraft(ruleset, 18)
    const candidates = getCheckpointCandidates(draft, checkpoint(draft, masteryId))
    const first = applySpellbookReservationSelection(draft, masteryId, [candidates[0]!], '2026-09-29T00:00:00.000Z')
    expect(first.spellSelections.spellbookSpellIds).toEqual([candidates[0]])
    expect(first.spellSelections.spellbookReservedSpellIds).toEqual([candidates[0]])

    const afterFirst = { ...draft, ...first }
    const second = applySpellbookReservationSelection(afterFirst, masteryId, [candidates[1]!], '2026-09-29T00:01:00.000Z')
    expect(second.spellSelections.spellbookSpellIds).toEqual([candidates[1]])
    expect(second.spellSelections.spellbookReservedSpellIds).toEqual([candidates[1]])
  })

  it('释放旧预留时保留仍有抄录来源的法术', () => {
    const draft = wizardDraft(ruleset, 18)
    const candidates = getCheckpointCandidates(draft, checkpoint(draft, masteryId))
    const first = applySpellbookReservationSelection(draft, masteryId, [candidates[0]!])
    const withTranscription: CharacterDraft = {
      ...draft,
      ...first,
      spellSelections: { ...first.spellSelections, transcribedSpellIds: [candidates[0]!] },
    }
    const second = applySpellbookReservationSelection(withTranscription, masteryId, [candidates[1]!])
    expect(second.spellSelections.spellbookSpellIds).toEqual(expect.arrayContaining([candidates[0], candidates[1]]))
    expect(second.spellSelections.spellbookReservedSpellIds).toEqual([candidates[1]])
  })

  it('已有角色更换选择只解除旧锁定，不误删既有法术书记录', () => {
    const initial = wizardDraft(ruleset, 18)
    const candidates = getCheckpointCandidates(initial, checkpoint(initial, masteryId))
    const existing = wizardDraft(ruleset, 18, {
      name: '已有法师',
      selections: [{ checkpointId: masteryId, optionIds: [candidates[0]!], confirmedAt: '' }],
      spellSelections: {
        ...emptySpellSelections(),
        spellbookSpellIds: [candidates[0]!, candidates[1]!],
        spellbookReservedSpellIds: [candidates[0]!],
      },
    })
    const changed = applySpellbookReservationSelection(existing, masteryId, [candidates[1]!])
    expect(changed.spellSelections.spellbookSpellIds).toEqual([candidates[0], candidates[1]])
    expect(changed.spellSelections.spellbookReservedSpellIds).toEqual([candidates[1]])
  })
})
