import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { CHARACTER_SHEET_PDF_MAPPING_VERSION, PDF_REGION_MAP_V4, fillPdfTemplate, type PdfRegion } from '@/services/export-pdf'
import { fighterExportModel, wizardExportModel } from '../fixtures/export-character'

const TEMPLATE_PATH = resolve(__dirname, '../../public/templates/character-sheet-zh.pdf')
const FONT_PATH = resolve(__dirname, '../../public/templates/fonts/noto-sans-sc-subset.ttf')
const template = () => new Uint8Array(readFileSync(TEMPLATE_PATH))
const font = () => new Uint8Array(readFileSync(FONT_PATH))

function flattenRegions(value: unknown): PdfRegion[] {
  if (!value || typeof value !== 'object') return []
  if ('page' in value && 'width' in value) return [value as PdfRegion]
  return Object.values(value).flatMap(flattenRegions)
}

describe('export-pdf v4 三页适配器', () => {
  it('保留三页并在人物资料页和法术页写入内容', async () => {
    expect(CHARACTER_SHEET_PDF_MAPPING_VERSION).toBe(4)
    const result = await fillPdfTemplate(template(), font(), wizardExportModel())
    expect(String.fromCharCode(...result.bytes.slice(0, 5))).toBe('%PDF-')
    const { PDFDocument } = await import('pdf-lib')
    const output = await PDFDocument.load(result.bytes)
    expect(output.getPageCount()).toBe(3)
    expect(output.getPage(1).node.Contents()).toBeTruthy()
    expect(output.getPage(2).node.Contents()).toBeTruthy()
    expect(result.bytes.byteLength).toBeGreaterThan(template().byteLength + 1000)
  }, 20_000)

  it('所有版本化矩形均位于对应页面边界内', async () => {
    const { PDFDocument } = await import('pdf-lib')
    const document = await PDFDocument.load(template())
    for (const item of flattenRegions(PDF_REGION_MAP_V4)) {
      const { width, height } = document.getPage(item.page).getSize()
      expect(item.x).toBeGreaterThanOrEqual(0)
      expect(item.y).toBeGreaterThanOrEqual(0)
      expect(item.x + item.width).toBeLessThanOrEqual(width)
      expect(item.y).toBeLessThanOrEqual(height)
      expect(item.y - item.height).toBeGreaterThanOrEqual(0)
    }
  })

  it('长文本在两页容量都不足时返回截断诊断', async () => {
    const model = fighterExportModel()
    const crowded = { ...model, profile: { backstory: '很长的背景故事。'.repeat(3000) }, features: [...model.features, ...Array.from({ length: 150 }, (_, index) => ({ id: `feature-${index}`, category: 'class' as const, name: `特性${index}`, summary: '这是一段需要按词语和标点换行的较长摘要。', priority: 30 }))] }
    const result = await fillPdfTemplate(template(), font(), crowded)
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'content-truncated', field: 'profile.backstory' }))
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'content-truncated', field: 'features.additional' }))
  }, 20_000)
})
