import 'fake-indexeddb/auto'
import { Blob as NodeBlob } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import { DraftStorageService } from '@/services/draft-storage'
import { fillPdfTemplate } from '@/services/export-pdf'
import { fillCharacterSheetTemplate } from '@/services/export-xlsx'
import { officialSpeciesDraft, officialSpeciesIds } from '../fixtures/official-species-2024'

describe('N01 全部19项实际导出与保存', () => {
  beforeAll(() => Object.defineProperty(globalThis, 'Blob', { value: NodeBlob, configurable: true }))
  it.each(officialSpeciesIds)('%s PDF/XLSX/JSON/ZIP/本地保存', async (id) => {
    const draft = officialSpeciesDraft(id)
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    const json = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(draft))
    expect(json.selections).toEqual(draft.selections)
    const zip = await CharacterPackageService.build(json)
    const restored = await CharacterPackageService.import(new Blob([zip as BlobPart]))
    DraftStorageService.saveAll([restored])
    const saved = DraftStorageService.loadAll()[0]
    expect(saved?.selections).toEqual(draft.selections)
    expect(saved?.raceToolChoices).toEqual(draft.raceToolChoices)
    if (!saved) throw new Error('Missing saved draft')
    expect(buildCharacterExportModel(saved, deriveCharacter(saved)).features).toEqual(model.features)
    expect(fillCharacterSheetTemplate(new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/character-sheet-2024.xlsx'))), model, '2024').diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    const template = new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/character-sheet-zh-plus.pdf')))
    const font = new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates/fonts/noto-sans-sc-subset.ttf')))
    const pdf = await fillPdfTemplate(template, font, model)
    expect(pdf.diagnostics.filter((item) => item.severity === 'error' || item.field.startsWith('spells.'))).toEqual([])
    const { PDFDocument } = await import('pdf-lib')
    expect((await PDFDocument.load(pdf.bytes)).getPageCount()).toBe(3)
  }, 30_000)
})
