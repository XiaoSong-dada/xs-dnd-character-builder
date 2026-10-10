import { describe, expect, it } from 'vitest'
import { previewLineageTransformation } from '@/rules/lineage-transformation'
import { getSpeciesLegacyBenefits, getSpeciesLegacyCandidates } from '@/rules/species-legacy'
import { deriveCharacter, collectRaceSkillIds, getRaceAbilityBonuses } from '@/rules/derive'
import { getFixedSpeciesLanguages, getRequiredLanguageCount } from '@/rules/languages'
import { getSpeciesProficiencyBlockers, getEffectiveSpeciesFeatures } from '@/rules/origins'
import { listActiveFeats } from '@/rules/feats'
import { getAlwaysPreparedSpellIds } from '@/rules/spellcasting'
import { rulesRepository } from '@/rules/repository'
import { parseCharacterDraft } from '@/services/draft-storage'
import { validateDraft } from '@/rules/validate'
import { draft2024, selection } from '../fixtures/draft-2024'

const at = '2026-10-08T00:00:00.000Z'
const original = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5, raceId: 'race-2014-owlin', speciesSizeChoice: 'small', enabledSourceIds: ['scc-2021-index', 'vrgtr-2021-index', 'eepc-2015-index', 'xgte-2017-index', 'tcoe-2020-index'], languages: ['精灵语'], raceAbilityChoices: ['con', 'dex'], inventory: [], selections: [] })
describe('S07冒险中血统转化', () => {
  it('预览不修改原卡；合法技能和飞行保留，其条件与数值来自元数据', () => {
    const before = JSON.stringify(original)
    const candidates = getSpeciesLegacyCandidates(original, rulesRepository)
    expect(candidates.map((c) => c.key)).toEqual(['skill:race-2014-owlin:skill-stealth', 'movement:race-2014-owlin:fly'])
    const preview = previewLineageTransformation(original, 'race-2014-dhampir', candidates.map((c) => c.key), at)
    expect(JSON.stringify(original)).toBe(before)
    expect(collectRaceSkillIds(preview.draft)).toEqual(['skill-stealth'])
    expect(getSpeciesLegacyBenefits(preview.draft, rulesRepository).find((c) => c.movement)?.movement).toMatchObject({ speed: 30, kind: 'fly' })
    expect(getSpeciesProficiencyBlockers(preview.draft, rulesRepository).filter((b) => b.id.startsWith('race-skill'))).toEqual([])
    expect(getEffectiveSpeciesFeatures(preview.draft, rulesRepository).find((f) => f.id.endsWith('retained-legacy'))?.summary).toContain('飞行')
    expect(getRaceAbilityBonuses(preview.draft)).toEqual({})
    expect(preview.before.hitPoints.value).toBeGreaterThan(preview.after.hitPoints.value)
  })
  it('无遗产/部分保留两条路径、语言不额外赠送、可重新填写血统属性', () => {
    const empty = previewLineageTransformation(original, 'race-2014-reborn', [], at).draft
    expect(getSpeciesProficiencyBlockers(empty, rulesRepository).some((b) => b.id.startsWith('race-skill'))).toBe(true)
    expect(collectRaceSkillIds({ ...empty, raceSkillChoices: ['skill-insight', 'skill-perception'] })).toEqual(['skill-insight', 'skill-perception'])
    expect(getFixedSpeciesLanguages(empty, rulesRepository)).toEqual(['通用语', '精灵语'])
    expect(getRequiredLanguageCount(empty, rulesRepository)).toBe(0)
    expect(getRaceAbilityBonuses({ ...empty, raceAbilityChoices: ['dex', 'wis'] })).toEqual({ dex: 2, wis: 1 })
    const partial = previewLineageTransformation(original, 'race-2014-hexblood', ['movement:race-2014-owlin:fly'], at).draft
    expect(collectRaceSkillIds({ ...partial, raceSkillChoices: ['skill-insight', 'skill-perception'] })).toEqual([])
  })
  it('关闭与恢复原来源，失效记录保留但收益不生效', () => {
    const next = previewLineageTransformation(original, 'race-2014-dhampir', ['skill:race-2014-owlin:skill-stealth'], at).draft
    const disabled = { ...next, enabledSourceIds: ['vrgtr-2021-index'] }
    expect(collectRaceSkillIds(disabled)).toEqual([])
    expect(validateDraft(disabled).some((i) => i.id === 'lineage-legacy-inactive')).toBe(true)
    expect(collectRaceSkillIds({ ...disabled, enabledSourceIds: original.enabledSourceIds })).toEqual(['skill-stealth'])
    expect(collectRaceSkillIds({ ...next, enabledSourceIds: [] })).toEqual([])
    expect(next.lineageHistory?.[0]?.retainedKeys).toHaveLength(1)
  })
  it('未知、重复遗产与无来源转化拒绝；不接受伪造移动速度', () => {
    expect(() => previewLineageTransformation(original, 'race-2014-reborn', ['movement:any:fly'], at)).toThrow('先祖遗产')
    const key = 'skill:race-2014-owlin:skill-stealth'
    expect(() => previewLineageTransformation(original, 'race-2014-reborn', [key, key], at)).toThrow('先祖遗产')
    expect(() => previewLineageTransformation({ ...original, enabledSourceIds: [] }, 'race-2014-reborn', [], at)).toThrow('来源')
  })
  it('旧属性、法术、专长及专长子选择不保留；手动种族前置专长提示失效', () => {
    const old = { ...original, raceId: 'race-2014-custom-lineage', raceAbilityChoices: ['con' as const], selections: [selection('race-2014-custom-lineage-origin-feat', ['feat-tough'])] }
    const next = previewLineageTransformation(old, 'race-2014-reborn', [], at).draft
    expect(listActiveFeats(next, rulesRepository)).toEqual([])
    expect(next.selections[0]?.invalidatedReason).toContain('仅保留追溯')
    const water = { ...original, raceId: 'race-2014-genasi', subraceId: 'race-2014-genasi-water' }
    expect(getAlwaysPreparedSpellIds(water)).toContain('spell-2014-create-or-destroy-water')
    expect(getAlwaysPreparedSpellIds(previewLineageTransformation(water, 'race-2014-reborn', [], at).draft)).toEqual([])
    const elfFeat = { ...original, manualEdits: { ...original.manualEdits, addedFeats: [{ instanceId: 'elf-feat', featId: 'feat-elven-accuracy', addedAt: at }] } }
    const transformed = previewLineageTransformation(elfFeat, 'race-2014-reborn', [], at).draft
    expect(listActiveFeats(transformed, rulesRepository)).toEqual([])
    expect(validateDraft(transformed).some((i) => i.id.includes('lineage-feat-inactive'))).toBe(true)
  })
  it('重复转化保留可证明遗产，JSON规范化后派生和原始追溯保持一致', () => {
    const first = previewLineageTransformation(original, 'race-2014-dhampir', ['movement:race-2014-owlin:fly'], at).draft
    const second = previewLineageTransformation(first, 'race-2014-reborn', getSpeciesLegacyCandidates(first, rulesRepository).map((c) => c.key), at).draft
    expect(second.lineageHistory).toHaveLength(2)
    expect(getSpeciesLegacyBenefits(second, rulesRepository).map((c) => c.movement?.kind)).toEqual(['fly', 'climb'])
    const restored = parseCharacterDraft(JSON.parse(JSON.stringify(second)))
    expect(restored?.lineageHistory).toEqual(second.lineageHistory)
    if (!restored) throw new Error('未恢复草稿')
    expect(deriveCharacter(restored)).toEqual(deriveCharacter(second))
    expect(getFixedSpeciesLanguages(restored, rulesRepository)).toEqual(['通用语', '精灵语'])
  })
})
