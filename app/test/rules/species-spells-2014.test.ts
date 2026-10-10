import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { rulesRepository } from '@/rules/repository'
import { getAlwaysPreparedSpellIds, getEffectiveSelectedSpellIds, getSpeciesSpellAbility, getSpeciesSpellcastingProfiles, getSpellFreeCastings } from '@/rules/spellcasting'
import { deriveCharacter } from '@/rules/derive'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { fillPdfTemplate } from '@/services/export-pdf'
import { buildXlsxFieldValues, fillTemplate } from '@/services/export-xlsx'
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

  it('非施法职业的共享列表与导出保留按等级授予的法术及种族数值', () => {
    installRace()
    for (const [level, count] of [[1, 1], [3, 2], [5, 3]]) {
      const draft = draftFor(level)
      expect(getEffectiveSelectedSpellIds(draft)).toHaveLength(count)
      const model = buildCharacterExportModel(draft, deriveCharacter(draft))
      expect(model.spellcasting?.spells).toHaveLength(count)
      expect(model.spellcasting).toMatchObject({ className: race.name, abilityLabel: '感知', attackBonus: level === 5 ? 4 : 3, saveDc: level === 5 ? 12 : 11, slots: [] })
      expect(model.features).toContainEqual(expect.objectContaining({ id: `${race.id}-spellcasting-wis`, summary: expect.stringContaining('感知；法术攻击') }))
      expect(draft.spellSelections.preparedSpellIds).toEqual([])
    }
  })

  it('种族施法使用自身属性及最终熟练，不继承职业施法人工修正', () => {
    installRace()
    const draft = { ...draftFor(), classId: 'class-2014-wizard', baseAbilities: { str: 10, dex: 10, con: 10, int: 18, wis: 12, cha: 8 }, manualEdits: {
      ...EMPTY_MANUAL_EDITS, abilityAdjustments: { wis: 2 }, proficiencyBonusAdjustment: 1,
      derivedAdjustments: { spellAttackBonus: 7, spellSaveDc: 9 },
    } }
    const derived = deriveCharacter(draft)
    expect(getSpeciesSpellcastingProfiles(draft, derived)).toEqual([
      expect.objectContaining({ ability: 'wis', attackBonus: 6, saveDc: 14, spellIds: race.spellGrants?.map((grant) => grant.spellId) }),
    ])
    const model = buildCharacterExportModel(draft, derived)
    expect(model.spellcasting).toMatchObject({ abilityLabel: '智力', attackBonus: derived.spellAttackBonus?.value, saveDc: derived.spellSaveDc?.value })
    expect(model.features).toContainEqual(expect.objectContaining({ id: `${race.id}-spellcasting-wis`, summary: expect.stringContaining('法术攻击 +6；法术豁免 DC 14') }))
  })

  it('固定属性分组独立，无效选择不猜属性，来源关闭不保留派生或导出', () => {
    installRace()
    const missing = { ...draftFor(), selections: [] }
    expect(getSpeciesSpellcastingProfiles(missing)).toEqual([])
    expect(getEffectiveSelectedSpellIds(missing)).toEqual([])
    expect(buildCharacterExportModel(missing, deriveCharacter(missing)).spellcasting).toBeUndefined()
    const fixedRace = { ...race, spellGrants: race.spellGrants?.map((grant, index) => ({ ...grant, ability: index === 0 ? 'int' as const : 'cha' as const })) }
    vi.mocked(rulesRepository.getRace).mockImplementation((id) => id === race.id ? fixedRace : undefined)
    expect(getSpeciesSpellcastingProfiles(missing).map((profile) => profile.ability)).toEqual(['int', 'cha'])
    expect(buildCharacterExportModel(missing, deriveCharacter(missing)).spellcasting?.abilityLabel).toBe('多来源，见特性')
    const disabled = { ...draftFor(), enabledSourceIds: [] }
    expect(getSpeciesSpellcastingProfiles(disabled)).toEqual([])
    expect(getEffectiveSelectedSpellIds(disabled)).toEqual([])
    expect(buildCharacterExportModel(disabled, deriveCharacter(disabled)).spellcasting).toBeUndefined()
  })

  it('授予、原始戏法与人工重复法术按ID去重，JSON往返保留种族数值', () => {
    installRace()
    const draft = { ...draftFor(), spellSelections: { ...draftFor().spellSelections, cantripIds: ['spell-2014-druidcraft'] }, manualEdits: {
      ...EMPTY_MANUAL_EDITS, addedSpells: [{ spellId: 'spell-2014-faerie-fire', destination: 'granted' as const, prepared: true }],
    } }
    expect(getEffectiveSelectedSpellIds(draft)).toHaveLength(3)
    const restored = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(draft))
    expect(getSpeciesSpellcastingProfiles(restored)).toEqual(getSpeciesSpellcastingProfiles(draft))
    expect(buildCharacterExportModel(restored, deriveCharacter(restored)).spellcasting).toEqual(buildCharacterExportModel(draft, deriveCharacter(draft)).spellcasting)
  })

  it('无职业施法的种族法术与数值可写入真实PDF和XLSX模板', async () => {
    installRace()
    const draft = draftFor()
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    const values = buildXlsxFieldValues(model).values
    expect(values).toMatchObject({ spellcasting_ability: '感知', spell_save_dc: 12, spell_attack_bonus: 4 })
    for (const grant of race.spellGrants ?? []) expect(Object.values(values)).toContain(rulesRepository.getSpell(grant.spellId)?.name)
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(readFileSync(resolve(__dirname, '../../public/templates/character-sheet-zh.xlsx')))
    const xlsx = fillTemplate(workbook, model)
    expect(xlsx.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    const reloaded = new ExcelJS.Workbook()
    await reloaded.xlsx.load(await workbook.xlsx.writeBuffer())
    expect(reloaded.worksheets).toHaveLength(6)
    const pdf = await fillPdfTemplate(
      new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/character-sheet-zh-plus.pdf'))),
      new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/fonts/noto-sans-sc-subset.ttf'))), model,
    )
    expect(pdf.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    expect(pdf.diagnostics.filter((item) => item.field.startsWith('spells.'))).toEqual([])
    const { PDFDocument } = await import('pdf-lib')
    const output = await PDFDocument.load(pdf.bytes)
    expect(output.getPageCount()).toBe(3)
    expect(output.getForm().getFields()).toHaveLength(0)
  }, 30_000)
})
