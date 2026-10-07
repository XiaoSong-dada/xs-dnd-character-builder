import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { fillPdfTemplate } from '@/services/export-pdf'
import { buildXlsxFieldValues, fillTemplate, readFieldMapping } from '@/services/export-xlsx'
import { draft2024, selection } from '../fixtures/draft-2024'

const modelFor = (slug: string) => {
  const raceId = `race-2014-motm-${slug}-genasi`
  const draft = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5, raceId,
    enabledSourceIds: ['motm-2022-index'], raceAbilityChoices: ['str', 'dex'], speciesSizeChoice: 'small',
    selections: [selection(`${raceId}-spellcasting-ability`, ['spell-ability-wis'])],
  })
  return buildCharacterExportModel(draft, deriveCharacter(draft))
}

describe('元素裔真实导出模板', () => {
  it.each(['air', 'earth', 'fire', 'water'])('%s 的种族数值、各环法术和免材料说明写入XLSX并保持序列化', async (slug) => {
    const model = modelFor(slug)
    const { values } = buildXlsxFieldValues(model)
    expect(values).toMatchObject({ spellcasting_ability: '感知', spell_save_dc: 12, spell_attack_bonus: 4 })
    expect(`${values.features_traits}\n${values.additional_features}`).toContain('无需材料成分（种族施放）')
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(readFileSync(resolve(__dirname, '../../public/templates/character-sheet-zh.xlsx')))
    expect(fillTemplate(workbook, model).diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    const reloaded = new ExcelJS.Workbook()
    await reloaded.xlsx.load(await workbook.xlsx.writeBuffer())
    const mapping = readFieldMapping(reloaded)
    for (const [key, value] of Object.entries(values).filter(([key]) => /^spell_\d+_\d+_name$/.test(key))) {
      const target = mapping.get(key)
      expect(target).toBeDefined()
      expect(reloaded.getWorksheet(target?.sheet ?? '')?.getCell(target?.address ?? 'A1').value).toBe(value)
    }
    for (const spell of model.spellcasting?.spells ?? []) expect(Object.values(values)).toContain(spell.name)
  }, 30_000)

  it('四种元素裔完整模型可填充真实PDF模板，含土裔两种独立资源和水裔三环法术', async () => {
    const template = new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/character-sheet-zh-plus.pdf')))
    const font = new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/fonts/noto-sans-sc-subset.ttf')))
    const { PDFDocument } = await import('pdf-lib')
    for (const slug of ['air', 'earth', 'fire', 'water']) {
      const model = modelFor(slug)
      const pdf = await fillPdfTemplate(template, font, model)
      expect(pdf.diagnostics.filter((item) => item.severity === 'error' || item.field.startsWith('spells.'))).toEqual([])
      const document = await PDFDocument.load(pdf.bytes)
      expect(document.getPageCount()).toBe(3)
      expect(document.getForm().getFields()).toHaveLength(0)
      if (slug === 'earth') expect(model.resources).toHaveLength(2)
      if (slug === 'water') expect(model.spellcasting?.spells.map((spell) => spell.level)).toEqual([0, 1, 3])
    }
  }, 30_000)
})
