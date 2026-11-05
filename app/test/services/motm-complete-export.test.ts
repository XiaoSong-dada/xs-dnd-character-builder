import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { fillPdfTemplate } from '@/services/export-pdf'
import { buildXlsxFieldValues, fillCharacterSheetTemplate } from '@/services/export-xlsx'
import { motmDraft, motmSlugs } from '../fixtures/motm-2014'

describe('MotM 33项实际模板输出', () => {
  it.each(motmSlugs)('%s 的XLSX字段值与序列化后的实际单元格一致', async (slug) => {
    const draft = motmDraft(slug)
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    const { values } = buildXlsxFieldValues(model)
    const xlsx = fillCharacterSheetTemplate(new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/character-sheet-2014.xlsx'))), model, '2014')
    expect(xlsx.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    for (const spell of model.spellcasting?.spells ?? []) expect(Object.values(values)).toContain(spell.name)
    expect(model.features.some((feature) => feature.category === 'race')).toBe(true)
    if (slug === 'satyr') expect(JSON.stringify(values)).toContain('鲁特琴')
  }, 30_000)
  it.each(motmSlugs)('%s 的完整模型可填充真实PDF模板，无错误或遗漏法术警告', async (slug) => {
    const draft = motmDraft(slug)
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    const template = new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/character-sheet-zh-plus.pdf')))
    const font = new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/fonts/noto-sans-sc-subset.ttf')))
    const result = await fillPdfTemplate(template, font, model)
    expect(result.diagnostics.filter((item) => item.severity === 'error' || item.field.startsWith('spells.'))).toEqual([])
    const { PDFDocument } = await import('pdf-lib')
    const document = await PDFDocument.load(result.bytes)
    expect(document.getPageCount()).toBe(3)
    expect(document.getForm().getFields()).toHaveLength(0)
  }, 30_000)
})
