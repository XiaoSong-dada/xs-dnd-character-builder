import { describe, expect, it } from 'vitest'

import { buildTimeline } from '@/rules/timeline'
import { ABILITY_IMPROVEMENT_OPTION_IDS, FEAT_OPTION_IDS } from '@/rules/data/feats-2014'

describe('2014 timelines', () => {
  it('builds the level 10 fighter choices without weapon mastery', () => {
    const timeline = buildTimeline('class-2014-fighter', 10)
    expect(timeline.map((item) => item.id)).toEqual([
      'fighter-2014-skills-1',
      'fighter-2014-style-1',
      'fighter-2014-subclass-3',
      'fighter-2014-maneuvers-3',
      'fighter-2014-asi-4',
      'fighter-2014-asi-6',
      'fighter-2014-maneuvers-7',
      'fighter-2014-asi-8',
      'fighter-2014-maneuvers-10',
    ])
    expect(timeline.some((item) => item.id.includes('mastery'))).toBe(false)
    const firstImprovement = timeline.find((item) => item.id === 'fighter-2014-asi-4')
    expect(firstImprovement?.optionIds).toEqual([...ABILITY_IMPROVEMENT_OPTION_IDS, ...FEAT_OPTION_IDS])
  })

  it('adds the optional-rule feat checkpoint only for variant human', () => {
    expect(buildTimeline('class-2014-fighter', 1, { subraceId: 'race-2014-human-variant' })[0]?.id)
      .toBe('race-2014-human-variant-feat-1')
    expect(buildTimeline('class-2014-fighter', 1, { subraceId: 'race-2014-human-variant' })[0]?.optionIds)
      .toEqual(FEAT_OPTION_IDS)
    expect(buildTimeline('class-2014-fighter', 1, { subraceId: 'race-2014-elf-high' }).some((item) => item.id.startsWith('race-')))
      .toBe(false)
  })

  it('appends subclass feature checkpoints for the selected subclass', () => {
    const timeline = buildTimeline('class-2014-barbarian', 3, { subclassId: 'subclass-2014-barbarian-totem-warrior' })
    const featureCheckpoint = timeline.find((item) => item.id === 'subclass-feature-barbarian-totem-warrior-totem-spirit')
    expect(featureCheckpoint?.kind).toBe('subclass-feature')
    expect(featureCheckpoint?.optionIds).toEqual(['totem-bear', 'totem-eagle', 'totem-wolf'])
    expect(featureCheckpoint?.minSelections).toBe(1)
    expect(featureCheckpoint?.maxSelections).toBe(1)
  })

  it('does not create a feature checkpoint for battle master maneuvers (handled by the class timeline)', () => {
    const timeline = buildTimeline('class-2014-fighter', 3, { subclassId: 'subclass-2014-fighter-battle-master' })
    expect(timeline.some((item) => item.id.startsWith('subclass-feature-fighter-battle-master'))).toBe(false)
  })

  it('filters subclass feature checkpoints beyond the target level', () => {
    const timeline = buildTimeline('class-2014-barbarian', 2, { subclassId: 'subclass-2014-barbarian-totem-warrior' })
    expect(timeline.some((item) => item.id.startsWith('subclass-feature-'))).toBe(false)
  })
})
