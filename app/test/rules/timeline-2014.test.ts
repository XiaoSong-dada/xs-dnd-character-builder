import { describe, expect, it } from 'vitest'

import { buildTimeline } from '@/rules/timeline'
import { ABILITY_IMPROVEMENT_OPTION_IDS, FEAT_OPTION_IDS } from '@/rules/data/feats-2014'
import { METAMAGIC_OPTION_IDS } from '@/rules/data/metamagic-2014'

describe('2014 timelines', () => {
  it('builds the level 10 fighter choices without weapon mastery or subclass feature checkpoints', () => {
    // 未选子职时：职业时间线不含战技检查点，也不生成子职特性检查点。
    const timeline = buildTimeline('class-2014-fighter', 10)
    expect(timeline.map((item) => item.id)).toEqual([
      'fighter-2014-skills-1',
      'fighter-2014-style-1',
      'fighter-2014-subclass-3',
      'fighter-2014-asi-4',
      'fighter-2014-asi-6',
      'fighter-2014-asi-8',
    ])
    expect(timeline.some((item) => item.id.includes('mastery'))).toBe(false)
    expect(timeline.some((item) => item.kind === 'maneuvers')).toBe(false)
    expect(timeline.some((item) => item.id.startsWith('subclass-feature-'))).toBe(false)
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

  it('creates battle master maneuver checkpoints as multi-select subclass features (3/2/2/2 per PHB 2014)', () => {
    const timeline = buildTimeline('class-2014-fighter', 15, { subclassId: 'subclass-2014-fighter-battle-master' })
    const maneuverCheckpoints = timeline.filter((item) => item.kind === 'subclass-feature' && item.optionIds.length > 0 && item.optionIds.every((optionId) => optionId.startsWith('maneuver-')))
    expect(maneuverCheckpoints.map((item) => [item.level, item.minSelections, item.maxSelections])).toEqual([
      [3, 3, 3],
      [7, 2, 2],
      [10, 2, 2],
      [15, 2, 2],
    ])
    expect(maneuverCheckpoints[0]?.id).toBe('subclass-feature-fighter-battle-master-combat-superiority')
    expect(maneuverCheckpoints[1]?.id).toBe('subclass-feature-fighter-battle-master-extra-maneuvers-7')
    expect(maneuverCheckpoints[2]?.id).toBe('subclass-feature-fighter-battle-master-extra-maneuvers-10')
    expect(maneuverCheckpoints[3]?.id).toBe('subclass-feature-fighter-battle-master-extra-maneuvers-15')
    expect(maneuverCheckpoints[0]?.optionIds.length).toBe(11)
  })

  it('does not create battle master maneuver checkpoints for other fighter subclasses', () => {
    const champion = buildTimeline('class-2014-fighter', 20, { subclassId: 'subclass-2014-fighter-champion' })
    expect(champion.some((item) => item.id.startsWith('subclass-feature-fighter-battle-master-'))).toBe(false)
    expect(champion.some((item) => item.optionIds.some((optionId) => optionId.startsWith('maneuver-')))).toBe(false)

    const eldritchKnight = buildTimeline('class-2014-fighter', 20, { subclassId: 'subclass-2014-fighter-eldritch-knight' })
    expect(eldritchKnight.some((item) => item.id.startsWith('subclass-feature-fighter-battle-master-'))).toBe(false)
  })

  it('filters subclass feature checkpoints beyond the target level', () => {
    const timeline = buildTimeline('class-2014-barbarian', 2, { subclassId: 'subclass-2014-barbarian-totem-warrior' })
    expect(timeline.some((item) => item.id.startsWith('subclass-feature-'))).toBe(false)
  })

  it('includes sorcerer metamagic checkpoints at 3/10/17 with multi-select specs', () => {
    const timeline = buildTimeline('class-2014-sorcerer', 17)
    const metamagic = timeline.filter((item) => item.id.startsWith('sorcerer-2014-metamagic-'))
    expect(metamagic.map((item) => [item.id, item.level, item.minSelections, item.maxSelections])).toEqual([
      ['sorcerer-2014-metamagic-3', 3, 2, 2],
      ['sorcerer-2014-metamagic-10', 10, 1, 1],
      ['sorcerer-2014-metamagic-17', 17, 1, 1],
    ])
    expect(metamagic[0]?.optionIds).toEqual(METAMAGIC_OPTION_IDS)
    expect(buildTimeline('class-2014-sorcerer', 2).some((item) => item.id.startsWith('sorcerer-2014-metamagic-'))).toBe(false)
  })

  it('includes bard expertise enhancement and magical secrets checkpoints at 10/14/18', () => {
    const timeline = buildTimeline('class-2014-bard', 18)
    const ids = timeline.map((item) => item.id)
    expect(ids).toContain('bard-2014-expertise-10')
    for (const id of ['bard-2014-magical-secrets-10', 'bard-2014-magical-secrets-14', 'bard-2014-magical-secrets-18']) {
      const checkpoint = timeline.find((item) => item.id === id)
      expect(checkpoint?.candidateKind).toBe('all-spells')
      expect(checkpoint?.minSelections).toBe(2)
      expect(checkpoint?.maxSelections).toBe(2)
    }
    const expertise = timeline.find((item) => item.id === 'bard-2014-expertise-10')
    expect(expertise?.kind).toBe('expertise')
    expect(expertise?.minSelections).toBe(2)
  })

  it('includes wizard spell mastery and signature spell checkpoints with spellbook candidate kinds', () => {
    const timeline = buildTimeline('class-2014-wizard', 20)
    expect(timeline.find((item) => item.id === 'wizard-2014-spell-mastery-1')?.candidateKind).toBe('spellbook-level-1')
    expect(timeline.find((item) => item.id === 'wizard-2014-spell-mastery-2')?.candidateKind).toBe('spellbook-level-2')
    const signature = timeline.find((item) => item.id === 'wizard-2014-signature-spells-20')
    expect(signature?.candidateKind).toBe('spellbook-level-3')
    expect(signature?.minSelections).toBe(2)
    expect(buildTimeline('class-2014-wizard', 17).some((item) => item.id.startsWith('wizard-2014-spell-mastery-'))).toBe(false)
  })
})
