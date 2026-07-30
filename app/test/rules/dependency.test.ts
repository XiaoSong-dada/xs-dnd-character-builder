import { describe, expect, it } from 'vitest'

import { getDependencyImpact } from '@/rules/dependency'
import type { CharacterDraft } from '@/types/character'

const draft = {
  classId: 'class-2014-fighter',
  subraceId: 'race-2014-human-variant',
  selections: [
    { checkpointId: 'fighter-2014-asi-8', optionIds: ['asi-str-2'], confirmedAt: '' },
    { checkpointId: 'race-2014-human-variant-feat-1', optionIds: ['feat-alert'], confirmedAt: '' },
  ],
} as CharacterDraft

describe('getDependencyImpact', () => {
  it('keeps but invalidates choices above a lowered target level', () => {
    expect(getDependencyImpact(draft, { kind: 'target-level', value: 4 }).invalidated)
      .toEqual(['fighter-2014-asi-8'])
  })

  it('invalidates the variant-human checkpoint when origin changes', () => {
    expect(getDependencyImpact(draft, { kind: 'subrace', value: undefined }).invalidated)
      .toEqual(['race-2014-human-variant-feat-1'])
  })
})
