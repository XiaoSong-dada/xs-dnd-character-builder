import { describe, expect, it } from 'vitest'
import { collectRaceSkillIds } from '@/rules/derive'
import { getEffectiveSpeciesFeatures, getSpeciesChoiceCheckpoints, getValidSpeciesChoice } from '@/rules/origins'
import { rulesRepository } from '@/rules/repository'
import { getAlwaysPreparedSpellIds, getSpeciesSpellcastingProfiles } from '@/rules/spellcasting'
import { listSessionResources } from '@/rules/session-resources'
import { buildTimeline } from '@/rules/timeline'
import { CharacterJsonService } from '@/services/character-json'
import { draft2024, selection } from '../fixtures/draft-2024'

const draftFor = (slug: string, level = 5) => draft2024({ ruleset: '5e-2014', raceId: `race-2014-motm-${slug}`, classId: 'class-2014-fighter', targetLevel: level, enabledSourceIds: ['motm-2022-index'], selections: [], raceSkillChoices: [] })
describe('MotM B4 分支与依赖选择', () => {
  it('化兽者四种化形仅有效分支授予特性与资源，1—20级数量正确', () => {
    for (let level = 1; level <= 20; level++) for (const option of ['beasthide', 'longtooth', 'swiftstride', 'wildhunt']) {
      const draft = { ...draftFor('shifter', level), selections: [selection('race-2014-motm-shifter-shifting-choice', [`race-2014-motm-shifter-${option}`])] }
      expect(getEffectiveSpeciesFeatures(draft, rulesRepository).filter((feature) => feature.id.includes('-branch-'))).toHaveLength(1)
      expect(listSessionResources(draft)[0]?.max).toBe(2 + Math.floor((level - 1) / 4))
    }
    expect(listSessionResources(draftFor('shifter'))).toEqual([])
    expect(rulesRepository.getRace('race-2014-motm-shifter')?.size).toBe('medium')
  })
  it('狗头人机智技能合法才生效；切分支保留失效原值', () => {
    const skill = selection('race-2014-motm-kobold-skill', ['skill-arcana'])
    const draft = { ...draftFor('kobold'), selections: [selection('race-2014-motm-kobold-legacy', ['race-2014-motm-kobold-craftiness']), skill] }
    expect(collectRaceSkillIds(draft)).toEqual(['skill-arcana'])
    const changed = { ...draft, selections: [selection('race-2014-motm-kobold-legacy', ['race-2014-motm-kobold-defiance']), skill] }
    expect(collectRaceSkillIds(changed)).toEqual([])
    expect(getSpeciesChoiceCheckpoints(changed, rulesRepository).map((item) => item.id)).toEqual(['race-2014-motm-kobold-legacy'])
    expect(CharacterJsonService.importDraft(CharacterJsonService.exportDraft(changed)).selections).toEqual(changed.selections)
  })
  it('狗头人龙术必须合法术士戏法与属性；非法、缺失、来源停用不授予', () => {
    const legacy = selection('race-2014-motm-kobold-legacy', ['race-2014-motm-kobold-draconic-sorcery'])
    const cantrip = selection('race-2014-motm-kobold-cantrip', ['spell-2014-fire-bolt'])
    const ability = selection('race-2014-motm-kobold-spellcasting-ability', ['spell-ability-int'])
    const draft = { ...draftFor('kobold'), selections: [legacy, cantrip, ability] }
    expect(getAlwaysPreparedSpellIds(draft)).toContain('spell-2014-fire-bolt')
    expect(getSpeciesSpellcastingProfiles(draft)[0]?.ability).toBe('int')
    for (const selections of [[legacy, cantrip], [legacy, ability], [legacy, ability, selection(cantrip.checkpointId, ['spell-2014-guidance'])]]) expect(getAlwaysPreparedSpellIds({ ...draft, selections })).not.toContain('spell-2014-fire-bolt')
    const disabled = { ...draft, enabledSourceIds: [] }
    expect(getAlwaysPreparedSpellIds(disabled)).not.toContain('spell-2014-fire-bolt')
    expect(getSpeciesChoiceCheckpoints(disabled, rulesRepository)).toEqual([])
    expect(buildTimeline(draft.classId ?? '', draft.targetLevel, { ...draft }).filter((cp) => cp.id.startsWith('race-2014-motm-kobold-'))).toHaveLength(3)
  })
  it('阿斯莫天启仅3级必选生效，光亮术始终固定魅力，治疗单次长休', () => {
    for (const level of [1, 2, 3, 20]) {
      const original = draftFor('aasimar', level)
      const cp = 'race-2014-motm-aasimar-revelation'
      const draft = { ...original, selections: [selection(cp, ['race-2014-motm-aasimar-radiant-soul'])] }
      expect(Boolean(getValidSpeciesChoice(draft, rulesRepository, cp))).toBe(level >= 3)
      expect(listSessionResources(draft).filter((r) => r.id.endsWith('celestial-revelation'))).toHaveLength(level >= 3 ? 1 : 0)
      expect(getSpeciesSpellcastingProfiles(draft)[0]?.ability).toBe('cha')
      expect(listSessionResources(draft).find((r) => r.id.endsWith('healing-hands'))?.max).toBe(1)
    }
  })
  it('雅灵选季节和能力属性，不伪造法术；非法、多选、重复记录不生效', () => {
    const cp = 'race-2014-motm-eladrin-season'
    const choice = selection(cp, ['race-2014-motm-eladrin-autumn'])
    const draft = { ...draftFor('eladrin'), selections: [choice, selection('race-2014-motm-eladrin-fey-step-ability', ['spell-ability-wis'])] }
    expect(getSpeciesSpellcastingProfiles(draft)).toEqual([])
    expect(getEffectiveSpeciesFeatures(draft, rulesRepository).some((f) => f.id.endsWith('branch-autumn'))).toBe(true)
    const missingAbility = { ...draft, selections: [choice] }
    expect(listSessionResources(missingAbility)).toEqual([])
    expect(getEffectiveSpeciesFeatures(missingAbility, rulesRepository).some((f) => f.id.endsWith('branch-autumn'))).toBe(false)
    for (const selections of [[choice, choice], [selection(cp, ['bad'])], [selection(cp, ['race-2014-motm-eladrin-autumn', 'race-2014-motm-eladrin-winter'])]]) expect(getValidSpeciesChoice({ ...draft, selections }, rulesRepository, cp)).toBeUndefined()
  })
})
