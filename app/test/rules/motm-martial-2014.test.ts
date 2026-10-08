import { describe, expect, it } from 'vitest'
import { collectRaceSkillIds, deriveCharacter } from '@/rules/derive'
import { getEffectiveSpeciesFeatures, getSpeciesProficiencyBlockers } from '@/rules/origins'
import { rulesRepository } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { applyResourceChange, applyRestRecovery, listSessionResources } from '@/rules/session-resources'
import { createInitialSessionState } from '@/rules/session-state'
import { draft2024 } from '../fixtures/draft-2024'

const slugs = ['centaur', 'minotaur', 'bugbear', 'tabaxi', 'sea-elf', 'orc', 'goblin', 'hobgoblin', 'goliath', 'kenku']
const draftFor = (slug: string, targetLevel = 1) => draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', raceId: `race-2014-motm-${slug}`, targetLevel, enabledSourceIds: ['motm-2022-index'], raceAbilityChoices: ['str', 'con'], speciesSizeChoice: 'small', raceSkillChoices: [] })

describe('MotM B1/B2 武职种族', () => {
  it.each(slugs)('%s 独立主项，来源关闭后无固定或自选熟练、特性或资源', (slug) => {
    const draft = draftFor(slug)
    expect(rulesRepository.getRace(draft.raceId ?? '')?.parentRaceId).toBeUndefined()
    expect(rulesRepository2024.getRace(draft.raceId ?? '')).toBeUndefined()
    expect(getEffectiveSpeciesFeatures(draft, rulesRepository).length).toBeGreaterThan(0)
    const disabled = { ...draft, enabledSourceIds: [], raceSkillChoices: ['skill-survival'] }
    expect(collectRaceSkillIds(disabled)).toEqual([])
    expect(getEffectiveSpeciesFeatures(disabled, rulesRepository)).toEqual([])
    expect(listSessionResources(disabled)).toEqual([])
  })
  it('人马与天狗技能候选、重复及数量校验，合法熟练才派生', () => {
    const centaur = { ...draftFor('centaur'), raceSkillChoices: ['skill-survival'] }
    expect(getSpeciesProficiencyBlockers(centaur, rulesRepository)).toEqual([])
    expect(collectRaceSkillIds(centaur)).toEqual(['skill-survival'])
    expect(deriveCharacter(centaur).speed.value).toBe(40)
    for (const raceSkillChoices of [[], ['skill-arcana'], ['skill-survival', 'skill-survival']]) {
      const invalid = { ...centaur, raceSkillChoices }
      expect(getSpeciesProficiencyBlockers(invalid, rulesRepository).length).toBeGreaterThan(0)
      expect(collectRaceSkillIds(invalid)).toEqual([])
    }
    const kenku = { ...draftFor('kenku'), raceSkillChoices: ['skill-arcana', 'skill-survival'] }
    expect(getSpeciesProficiencyBlockers(kenku, rulesRepository)).toEqual([])
    expect(collectRaceSkillIds(kenku)).toHaveLength(2)
    expect(rulesRepository.getRace(kenku.raceId ?? '')?.darkvision).toBeUndefined()
  })
  it('B2熟练次数与单次资源覆盖1到20级，临时效果不改派生生命或速度', () => {
    for (let level = 1; level <= 20; level++) {
      const pb = 2 + Math.floor((level - 1) / 4)
      for (const slug of ['orc', 'goblin', 'hobgoblin', 'goliath', 'kenku']) {
        const draft = draftFor(slug, level)
        const resources = listSessionResources(draft)
        expect(resources.length).toBeGreaterThan(0)
        for (const resource of resources) expect(resource.max).toBe(resource.id.endsWith('relentless-endurance') ? 1 : pb)
        expect(deriveCharacter(draft).speed.value).toBe(30)
      }
    }
    expect(getEffectiveSpeciesFeatures(draftFor('hobgoblin', 2), rulesRepository).some((f) => f.id.endsWith('gift-improvement'))).toBe(false)
    expect(getEffectiveSpeciesFeatures(draftFor('hobgoblin', 3), rulesRepository).some((f) => f.id.endsWith('gift-improvement'))).toBe(true)
  })
  it('猫之迅捷不由短休或长休恢复；手动恢复保留其他资源', () => {
    const draft = draftFor('tabaxi')
    const resource = listSessionResources(draft)[0]
    expect(resource).toMatchObject({ max: 1, recovery: 'special' })
    if (!resource) throw new Error('缺少特殊恢复资源')
    const spent = applyResourceChange(createInitialSessionState('tabaxi', 30), resource.id, 1, 1).state
    for (const timing of ['short-rest', 'long-rest'] as const) expect(applyRestRecovery(spent, [resource], timing).resourceUsage?.[resource.id]).toBe(1)
    expect(applyResourceChange(spent, resource.id, -1, 1).state.resourceUsage?.[resource.id]).toBe(0)
  })
})
