import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { uaFrSubclassOptions2024, uaFrSubclassFeatures2024, uaFrSubclasses2024 } from '@/rules/data/ua-fr-subclasses-2024'
import { deriveCharacter } from '@/rules/derive'
import { isSourceEnabled } from '@/rules/source-books'
import { buildTimeline } from '@/rules/timeline'
import { draft2024, selection } from '../fixtures/draft-2024'

const FR_SOURCE = 'source-2024-ua-fr-subclasses'
const SUBCLASS_IDS = [
  'subclass-2024-ua-bard-moon',
  'subclass-2024-ua-cleric-knowledge',
  'subclass-2024-ua-fighter-purple-dragon-knight',
  'subclass-2024-ua-paladin-noble-genies',
  'subclass-2024-ua-ranger-winter-walker',
  'subclass-2024-ua-rogue-scion-of-the-three',
  'subclass-2024-ua-sorcerer-spellfire',
  'subclass-2024-ua-wizard-bladesinger',
] as const

describe('被遗忘的国度子职（UA，E03）', () => {
  it('8 个子职登记完整、来源独立且默认关闭', () => {
    expect(uaFrSubclasses2024.map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    for (const id of SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass, id).toBeDefined()
      expect(subclass?.ruleset).toBe('5e-2024')
      expect(subclass?.status).toBe('selectable')
      expect(subclass?.availability).toBe('player')
      expect(subclass?.selectionLevel).toBe(3)
      expect(subclass?.sourceIds).toEqual([FR_SOURCE])
      expect(subclass?.features.length).toBeGreaterThan(0)
    }
    expect(isSourceEnabled([FR_SOURCE], [], rulesRepository2024)).toBe(false)
    expect(isSourceEnabled([FR_SOURCE], [FR_SOURCE], rulesRepository2024)).toBe(true)
  })

  it('特性选项与始终准备法术全部可解析', () => {
    for (const feature of uaFrSubclassFeatures2024) {
      expect(feature.sourceIds).toEqual([FR_SOURCE])
      for (const optionId of feature.optionIds ?? []) {
        const option = rulesRepository2024.getOption(optionId)
        expect(option ?? rulesRepository2024.getFeat(optionId), `${feature.id}:${optionId}`).toBeDefined()
      }
      for (const grant of feature.grantedSpells ?? []) {
        expect(rulesRepository2024.getSpell(grant.spellId), `${feature.id}:${grant.spellId}`).toBeDefined()
      }
    }
    for (const option of uaFrSubclassOptions2024) {
      expect(option.sourceIds).toEqual([FR_SOURCE])
      expect(rulesRepository2024.getOption(option.id), option.id).toBeDefined()
    }
    for (const id of SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      for (const spellIds of Object.values(subclass?.alwaysPreparedSpellIdsByLevel ?? {})) {
        for (const spellId of spellIds) {
          expect(rulesRepository2024.getSpell(spellId), `${id}:${spellId}`).toBeDefined()
        }
      }
    }
  })

  it('关键机制：知识专精、骑士使节语言与剑咏者技能选择结构化登记', () => {
    const expertise = uaFrSubclassFeatures2024.find((feature) => feature.id === 'ua-fr-2024-knowledge-skills')
    expect(expertise?.requiresChoice).toBe(true)
    expect(expertise?.minSelections).toBe(2)
    expect(expertise?.grantsExpertiseInChosenSkills).toBe(true)
    expect(expertise?.optionIds).toEqual(['skill-arcana', 'skill-history', 'skill-nature', 'skill-religion'])

    const envoy = uaFrSubclassFeatures2024.find((feature) => feature.id === 'ua-fr-2024-pdk-envoy')
    expect(envoy?.languageChoices).toBe(1)

    const bladesinger = uaFrSubclassFeatures2024.find((feature) => feature.id === 'ua-fr-2024-bladesinger-training')
    expect(bladesinger?.optionIds).toEqual(['skill-acrobatics', 'skill-athletics', 'skill-performance', 'skill-persuasion'])

    // 知识专精：所选两项在派生中获得专精加值。
    const draft = draft2024({
      classId: 'class-2024-cleric',
      subclassId: 'subclass-2024-ua-cleric-knowledge',
      targetLevel: 3,
      enabledSourceIds: [FR_SOURCE],
      selections: [
        selection('class-2024-cleric-skills-1', ['skill-history', 'skill-religion']),
        selection('class-2024-cleric-divine-order-1', ['cleric-2024-divine-order-protector']),
        selection('subclass-feature-ua-fr-2024-knowledge-tool', ['ua-fr-2024-tool-calligrapher']),
        selection('subclass-feature-ua-fr-2024-knowledge-skills', ['skill-arcana', 'skill-nature']),
      ],
    })
    const derived = deriveCharacter(draft)
    const arcana = derived.skills['skill-arcana']
    expect(arcana?.sources.some((source) => source.id === 'skill-arcana-expertise')).toBe(true)
    const history = derived.skills['skill-history']
    expect(history?.sources.some((source) => source.id === 'skill-history-expertise')).toBe(false)
  })

  it('时间线在启用来源后提供子职与特性检查点，未启用时不出现', () => {
    const withSource = buildTimeline('class-2024-cleric', 3, { ruleset: '5e-2024', enabledSourceIds: [FR_SOURCE] })
    const subclassCheckpoint = withSource.find((checkpoint) => checkpoint.kind === 'subclass')
    expect(subclassCheckpoint?.optionIds).toContain('subclass-2024-ua-cleric-knowledge')

    const without = buildTimeline('class-2024-cleric', 3, { ruleset: '5e-2024', enabledSourceIds: [] })
    expect(without.find((checkpoint) => checkpoint.kind === 'subclass')?.optionIds).not.toContain('subclass-2024-ua-cleric-knowledge')

    const featureTimeline = buildTimeline('class-2024-cleric', 3, {
      ruleset: '5e-2024', enabledSourceIds: [FR_SOURCE], subclassId: 'subclass-2024-ua-cleric-knowledge',
    })
    const knowledgeChecks = featureTimeline.filter((checkpoint) => checkpoint.id.startsWith('subclass-feature-ua-fr-2024-knowledge'))
    expect(knowledgeChecks.map((checkpoint) => checkpoint.id)).toEqual([
      'subclass-feature-ua-fr-2024-knowledge-tool',
      'subclass-feature-ua-fr-2024-knowledge-skills',
    ])
    for (const checkpoint of featureTimeline) {
      for (const optionId of checkpoint.optionIds) {
        const resolved = rulesRepository2024.getOption(optionId) ?? rulesRepository2024.getFeat(optionId)
        expect(resolved, `${checkpoint.id}:${optionId}`).toBeDefined()
      }
    }
  })

  it('2014 同名子职不受影响（隔离）', () => {
    expect(rulesRepository2024.getSubclass('subclass-2014-cleric-knowledge')).toBeUndefined()
    const legacy = uaFrSubclasses2024.map((subclass) => subclass.id)
    expect(legacy.every((id) => id.startsWith('subclass-2024-ua-'))).toBe(true)
    expect(uaFrSubclasses2024.find((subclass) => subclass.id === 'subclass-2024-ua-wizard-bladesinger')?.englishName).toBe('Bladesinger')
  })
})
