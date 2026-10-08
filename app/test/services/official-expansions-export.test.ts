import 'fake-indexeddb/auto'
import { Blob as NodeBlob } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { previewLineageTransformation } from '@/rules/lineage-transformation'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import { DraftStorageService } from '@/services/draft-storage'
import { fillPdfTemplate } from '@/services/export-pdf'
import { buildXlsxFieldValues, fillTemplate, readFieldMapping } from '@/services/export-xlsx'
import { officialDraft, officialIds } from '../fixtures/official-expansions-2014'

describe('O01官方扩展实际导出与存储', () => {
  beforeAll(() => Object.defineProperty(globalThis, 'Blob', { value: NodeBlob, configurable: true }))
  it.each(officialIds)('%s：实际PDF、XLSX、JSON、ZIP与本地保存往返', async (id) => {
    const draft = officialDraft(id)
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    const json = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(draft))
    expect(json.selections).toEqual(draft.selections)
    expect(json.raceToolChoices).toEqual(draft.raceToolChoices)
    DraftStorageService.saveAll([json])
    expect(DraftStorageService.loadAll()[0]?.selections).toEqual(draft.selections)
    const bytes = await CharacterPackageService.build(draft)
    const restored = await CharacterPackageService.import(new Blob([bytes as BlobPart], { type: 'application/zip' }))
    expect(restored.selections).toEqual(draft.selections)
    expect(buildCharacterExportModel(restored, deriveCharacter(restored)).features).toEqual(model.features)
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(readFileSync(resolve(__dirname, '../../public/templates/character-sheet-zh.xlsx')))
    expect(fillTemplate(workbook, model).diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    const actual = new ExcelJS.Workbook()
    await actual.xlsx.load(await workbook.xlsx.writeBuffer())
    const mapping = readFieldMapping(actual)
    for (const [key, value] of Object.entries(buildXlsxFieldValues(model).values)) {
      const target = mapping.get(key)
      if (!target) continue
      const cell = actual.getWorksheet(target.sheet)?.getCell(target.address)
      expect(cell?.formula ? cell.result ?? '' : cell?.value ?? '', key).toEqual(value)
    }
    const template = new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/character-sheet-zh-plus.pdf')))
    const font = new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/fonts/noto-sans-sc-subset.ttf')))
    const pdf = await fillPdfTemplate(template, font, model)
    expect(pdf.diagnostics.filter((item) => item.severity === 'error' || item.field.startsWith('spells.'))).toEqual([])
    const { PDFDocument } = await import('pdf-lib')
    expect((await PDFDocument.load(pdf.bytes)).getPageCount()).toBe(3)
  }, 30_000)
  it('血统转化完整追溯和条件经JSON、ZIP、本地存储及导出保留', async () => {
    const original = officialDraft('race-2014-owlin')
    const draft = previewLineageTransformation(original, 'race-2014-reborn', ['movement:race-2014-owlin:fly'], '2026-10-08T00:00:00Z').draft
    const json = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(draft))
    const zip = await CharacterPackageService.build(json)
    const restored = await CharacterPackageService.import(new Blob([zip as BlobPart]))
    DraftStorageService.saveAll([restored])
    const saved = DraftStorageService.loadAll()[0]
    expect(saved?.lineageHistory).toEqual(draft.lineageHistory)
    if (!saved) throw new Error('missing restored draft')
    const model = buildCharacterExportModel(saved, deriveCharacter(saved))
    expect(model.proficiencies.languages).toContain('通用语')
    expect(model.features.find((f) => f.name === '保留先祖遗产')?.summary).toContain('飞行')
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(readFileSync(resolve(__dirname, '../../public/templates/character-sheet-zh.xlsx')))
    expect(fillTemplate(workbook, model).diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    expect(JSON.stringify(buildXlsxFieldValues(model).values)).toContain('飞行')
    const template = new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/character-sheet-zh-plus.pdf')))
    const font = new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/fonts/noto-sans-sc-subset.ttf')))
    expect((await fillPdfTemplate(template, font, model)).diagnostics.filter((item) => item.severity === 'error')).toEqual([])
  })
})
