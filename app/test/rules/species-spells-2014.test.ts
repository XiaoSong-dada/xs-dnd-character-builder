import { afterEach, describe, expect, it, vi } from 'vitest'
import { rulesRepository } from '@/rules/repository'
import { getAlwaysPreparedSpellIds, getSpeciesSpellAbility, getSpellFreeCastings } from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import { applyRestRecovery, listSessionResources } from '@/rules/session-resources'
import { createInitialSessionState } from '@/rules/session-state'
import { CharacterJsonService } from '@/services/character-json'
import type { RaceRule } from '@/types/rules'
import { draft2024, selection } from '../fixtures/draft-2024'

const race: RaceRule = {
  id: 'test-2014-species-spells', ruleset: '5e-2014', name: '测试种族', englishName: 'Test',
  summary: '', description: '', fixedAbilityBonuses: {}, subraceIds: [], recommendedClassIds: [],
  status: 'implemented', sourceIds: ['erftlw-2019-index'], spellcastingAbilityChoices: ['int', 'wis', 'cha'],
  spellGrants: [
    { spellId: 'spell-2014-druidcraft', minimumLevel: 1, alwaysPrepared: true },
    { spellId: 'spell-2014-faerie-fire', minimumLevel: 3, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
    { spellId: 'spell-2014-enlarge-reduce', minimumLevel: 5, alwaysPrepared: true, freeCastingsFrom: 'proficiency-bonus', recovery: 'long-rest' },
  ],
}
const draftFor = (targetLevel = 5) => draft2024({
  ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel, raceId: race.id,
  enabledSourceIds: ['erftlw-2019-index'],
  selections: [selection(`${race.id}-spellcasting-ability`, ['spell-ability-wis'])],
})

describe('2014 种族法术接入契约', () => {
  afterEach(() => vi.restoreAllMocks())
  function installRace() {
    const getRace = rulesRepository.getRace.bind(rulesRepository)
    vi.spyOn(rulesRepository, 'getRace').mockImplementation((id) => id === race.id ? race : getRace(id))
  }

  it('2014 独立注册施法属性选项并生成可解析的必选任务', () => {
    installRace()
    const draft = draftFor()
    const checkpoint = buildTimeline(draft.classId ?? '', 5, {
      ruleset: draft.ruleset, raceId: race.id, enabledSourceIds: draft.enabledSourceIds,
    }).find((item) => item.id === `${race.id}-spellcasting-ability`)
    expect(checkpoint).toMatchObject({ required: true, minSelections: 1, maxSelections: 1 })
    expect(checkpoint?.optionIds.map((id) => rulesRepository.getOption(id)?.name)).toEqual(['智力', '感知', '魅力'])
    expect(getSpeciesSpellAbility(race, draft.selections)).toBe('wis')
    expect(buildTimeline(draft.classId ?? '', 5, { ruleset: draft.ruleset, raceId: race.id, enabledSourceIds: [] })
      .some((item) => item.id === `${race.id}-spellcasting-ability`)).toBe(false)
  })

  it('不接受未声明属性、多选或已失效的施法属性', () => {
    expect(getSpeciesSpellAbility(race, [selection(`${race.id}-spellcasting-ability`, ['spell-ability-str'])])).toBeUndefined()
    expect(getSpeciesSpellAbility(race, [selection(`${race.id}-spellcasting-ability`, ['spell-ability-wis', 'spell-ability-cha'])])).toBeUndefined()
    expect(getSpeciesSpellAbility(race, [{ ...draftFor().selections[0], checkpointId: `${race.id}-spellcasting-ability`, optionIds: ['spell-ability-wis'], confirmedAt: '', invalidatedAt: 'disabled' }])).toBeUndefined()
    expect(getSpeciesSpellAbility({ ...race, spellcastingAbilityChoices: ['cha'] }, draftFor().selections)).toBeUndefined()
  })

  it('非施法职业仍按1/3/5级获得种族法术，保留职业选择为空', () => {
    installRace()
    expect(getAlwaysPreparedSpellIds(draftFor(1))).toEqual(['spell-2014-druidcraft'])
    expect(getAlwaysPreparedSpellIds(draftFor(3))).toEqual(['spell-2014-druidcraft', 'spell-2014-faerie-fire'])
    const draft = draftFor()
    expect(getAlwaysPreparedSpellIds(draft)).toHaveLength(3)
    expect(draft.spellSelections.preparedSpellIds).toEqual([])
    expect(getSpellFreeCastings(draft)).toEqual([
      expect.objectContaining({ spellId: 'spell-2014-faerie-fire', sourceId: race.id, count: 1, ability: 'wis' }),
      expect.objectContaining({ spellId: 'spell-2014-enlarge-reduce', sourceId: race.id, count: 3, ability: 'wis' }),
    ])
  })

  it('来源关闭停用法术与资源，重新启用和JSON往返恢复原选择', () => {
    installRace()
    const original = draftFor()
    const disabled = { ...original, enabledSourceIds: [] }
    expect(getAlwaysPreparedSpellIds(disabled)).toEqual([])
    expect(getSpellFreeCastings(disabled)).toEqual([])
    expect(listSessionResources(disabled)).toEqual([])
    const restored = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(original))
    expect(restored.selections).toEqual(original.selections)
    expect(getSpellFreeCastings(restored)).toEqual(getSpellFreeCastings(original))
  })

  it('免费次数进入既有资源管道，短休不恢复、长休恢复', () => {
    installRace()
    const resources = listSessionResources(draftFor())
    expect(resources).toHaveLength(2)
    const id = `${race.id}:spell-2014-faerie-fire`
    expect(resources).toContainEqual(expect.objectContaining({ id, max: 1, recovery: 'long-rest' }))
    const spent = { ...createInitialSessionState('species-test', 20), resourceUsage: { [id]: 1 } }
    expect(applyRestRecovery(spent, resources, 'short-rest').resourceUsage?.[id]).toBe(1)
    expect(applyRestRecovery(spent, resources, 'long-rest').resourceUsage?.[id]).toBe(0)
  })
})
