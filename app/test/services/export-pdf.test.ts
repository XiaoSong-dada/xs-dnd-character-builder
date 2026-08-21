import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { CHARACTER_SHEET_PDF_MAPPING_VERSION, fillPdfTemplate, inspectPdfSpellTemplate, layoutPdfTreasureItems, wrapPdfText } from '@/services/export-pdf'
import { fighterExportModel, levelSixWizardExportModel, wizardExportModel } from '../fixtures/export-character'
import { inspectGeneratedPdfFont } from '../fixtures/pdf-font'

const TEMPLATE_PATH = resolve(__dirname, '../../public/templates/character-sheet-zh-plus.pdf')
const BASELINE_TEMPLATE_PATH = resolve(__dirname, '../../../docs/export-templates/DND_5E_2014_国内5E术语版角色卡_最终版.pdf')
const FONT_PATH = resolve(__dirname, '../../public/templates/fonts/noto-sans-sc-subset.ttf')
const template = () => new Uint8Array(readFileSync(TEMPLATE_PATH))
const baselineTemplate = () => new Uint8Array(readFileSync(BASELINE_TEMPLATE_PATH))
const font = () => new Uint8Array(readFileSync(FONT_PATH))

async function templateStructure(bytes: Uint8Array) {
  const { PDFDocument } = await import('pdf-lib')
  const document = await PDFDocument.load(bytes)
  const widgetPages = new Map<object, number>()
  document.getPages().forEach((page, pageIndex) => {
    for (const annotationRef of page.node.Annots()?.asArray() ?? []) {
      const annotation = document.context.lookup(annotationRef)
      if (annotation) widgetPages.set(annotation, pageIndex)
    }
  })
  const fields = document.getForm().getFields().map((field) => ({
    name: field.getName(),
    type: field.acroField.FT().asString(),
    flags: field.acroField.getFlags(),
    kidCount: field.acroField.Kids()?.size() ?? 0,
    widgets: field.acroField.getWidgets().map((widget) => ({
      page: widgetPages.get(widget.dict) ?? -1,
      rectangle: widget.getRectangle(),
      flags: widget.getFlags(),
      onValue: widget.getOnValue()?.asString(),
    })),
  }))
  const pages = document.getPages().map((page) => ({
    mediaBox: page.getMediaBox(),
    cropBox: page.getCropBox(),
    rotation: page.getRotation().angle,
  }))
  return { pages, fields, hasXfa: document.getForm().hasXFA() }
}

const REQUIRED_FIRST_PAGE_FIELDS = [
  'CharacterName', 'ClassLevel', 'Background', 'Race ', 'Alignment', 'XP',
  'STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA', 'ProfBonus', 'AC', 'Initiative', 'Speed',
  'HPMax', 'HPCurrent', 'HPTemp', 'HDTotal', 'HD', 'Passive', 'Equipment',
  'ProficienciesLang', 'Features and Traits',
] as const
const REQUIRED_PROFILE_FIELDS = ['CharacterName 2', 'Backstory', 'Feat+Traits', 'Treasure'] as const

describe('export-pdf v6 国内 5E 术语版表单适配器', () => {
  it('运行时瘦身模板完整保留源模板页面、字段和 Widget 结构', async () => {
    expect(await templateStructure(template())).toEqual(await templateStructure(baselineTemplate()))
    expect(template().byteLength).toBeLessThanOrEqual(5 * 1024 * 1024)
  })

  it('目标模板为三页 AcroForm 且包含基础页和人物资料页必需字段', async () => {
    expect(CHARACTER_SHEET_PDF_MAPPING_VERSION).toBe(6)
    const { PDFDocument } = await import('pdf-lib')
    const document = await PDFDocument.load(template())
    expect(document.getPageCount()).toBe(3)
    const form = document.getForm()
    const names = new Set(form.getFields().map((field) => field.getName()))
    for (const name of REQUIRED_FIRST_PAGE_FIELDS) expect(names.has(name)).toBe(true)
    for (const name of REQUIRED_PROFILE_FIELDS) expect(names.has(name)).toBe(true)
    const spellTemplate = inspectPdfSpellTemplate(form)
    expect(spellTemplate.slotSuffixes).toEqual([19, 20, 21, 22, 23, 24, 25, 26, 27])
    expect(spellTemplate.capacities[0]).toBeGreaterThan(0)
    for (let level = 1; level <= 9; level += 1) expect(spellTemplate.capacities[level]).toBeGreaterThan(0)
    expect(spellTemplate.unassignedFieldNames).toEqual([])
  })

  it('按真实字体宽度为中文、英文和显式换行排版，并避免句末标点出现在行首', async () => {
    const { PDFDocument } = await import('pdf-lib')
    const fontkitModule = await import('@pdf-lib/fontkit')
    const document = await PDFDocument.create()
    document.registerFontkit(fontkitModule.default)
    const embeddedFont = await document.embedFont(font())
    const lines = wrapPdfText('中文排版，mixed English text。\n第二段内容', embeddedFont, 8, 42)
    expect(lines.length).toBeGreaterThan(2)
    expect(lines).toContain('第二段内容')
    expect(lines.every((line) => embeddedFont.widthOfTextAtSize(line, 8) <= 42)).toBe(true)
    expect(lines.every((line) => !/^[，。！？；：、）》】}〉”’…]/u.test(line))).toBe(true)
  })

  it('宝物按完整条目横向排列、按边界换行，并在容量耗尽后报告省略数量', async () => {
    const { PDFDocument } = await import('pdf-lib')
    const fontkitModule = await import('@pdf-lib/fontkit')
    const document = await PDFDocument.create()
    document.registerFontkit(fontkitModule.default)
    const embeddedFont = await document.embedFont(font())
    const fontSize = 8
    const firstTwo = '法术书 × 1  长棍 × 1（已装备 × 1）'
    const boundaryWidth = embeddedFont.widthOfTextAtSize(firstTwo, fontSize)
    const flowed = layoutPdfTreasureItems(['法术书 × 1', '长棍 × 1（已装备 × 1）', '背包 × 1'], embeddedFont, fontSize, boundaryWidth, 3)
    expect(flowed.text.split('\n')).toEqual([firstTwo, '背包 × 1'])
    expect(flowed.text).not.toMatch(/[；、]/u)
    expect(flowed.omittedCount).toBe(0)

    const longItem = layoutPdfTreasureItems(['特别特别长的单件物品名称 × 1'], embeddedFont, fontSize, 45, 5)
    expect(longItem.text.split('\n').length).toBeGreaterThan(1)
    expect(longItem.text.split('\n').every((line) => embeddedFont.widthOfTextAtSize(line, fontSize) <= 45)).toBe(true)

    const singleItemWidth = Math.max(
      embeddedFont.widthOfTextAtSize('背包 × 1', fontSize),
      embeddedFont.widthOfTextAtSize('法术书 × 1', fontSize),
      embeddedFont.widthOfTextAtSize('墨水笔 × 1', fontSize),
    )
    const exact = layoutPdfTreasureItems(['背包 × 1', '法术书 × 1'], embeddedFont, fontSize, singleItemWidth, 2)
    expect(exact.omittedCount).toBe(0)
    const overflowWidth = singleItemWidth + embeddedFont.widthOfTextAtSize('…', fontSize)
    const truncated = layoutPdfTreasureItems(['背包 × 1', '法术书 × 1', '墨水笔 × 1'], embeddedFont, fontSize, overflowWidth, 1)
    expect(truncated.text).toMatch(/…$/u)
    expect(truncated.omittedCount).toBe(2)
  })

  it('战士样例填充后保留三页并扁平化表单', async () => {
    const result = await fillPdfTemplate(template(), font(), fighterExportModel())
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    expect(String.fromCharCode(...result.bytes.slice(0, 5))).toBe('%PDF-')
    const { PDFDocument } = await import('pdf-lib')
    const output = await PDFDocument.load(result.bytes)
    expect(output.getPageCount()).toBe(3)
    expect(output.getForm().getFields()).toHaveLength(0)
    expect(result.bytes.byteLength).toBeLessThanOrEqual(5 * 1024 * 1024)
    expect(await inspectGeneratedPdfFont(result.bytes)).toEqual({ embeddedRegularFontCount: 1, hasNeedAppearances: false, widgetCount: 0 })
  }, 30_000)

  it('不依赖 pdf-lib 运行时类名判断字段类型', async () => {
    const { PDFTextField, PDFCheckBox } = await import('pdf-lib')
    const originalTextFieldName = PDFTextField.name
    const originalCheckBoxName = PDFCheckBox.name
    try {
      Object.defineProperty(PDFTextField, 'name', { configurable: true, value: 't' })
      Object.defineProperty(PDFCheckBox, 'name', { configurable: true, value: 'e' })
      const result = await fillPdfTemplate(template(), font(), fighterExportModel())
      expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    } finally {
      Object.defineProperty(PDFTextField, 'name', { configurable: true, value: originalTextFieldName })
      Object.defineProperty(PDFCheckBox, 'name', { configurable: true, value: originalCheckBoxName })
    }
  }, 30_000)

  it('法师样例填充施法页且不产生阻断诊断', async () => {
    const result = await fillPdfTemplate(template(), font(), wizardExportModel())
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    const { PDFDocument } = await import('pdf-lib')
    const output = await PDFDocument.load(result.bytes)
    expect(output.getPageCount()).toBe(3)
    expect(output.getForm().getFields()).toHaveLength(0)
    expect(result.bytes.byteLength).toBeLessThanOrEqual(5 * 1024 * 1024)
    expect(await inspectGeneratedPdfFont(result.bytes)).toEqual({ embeddedRegularFontCount: 1, hasNeedAppearances: false, widgetCount: 0 })
  }, 30_000)

  it('六级法师的四个戏法和一至三环法术可以写入真实模板', async () => {
    const model = levelSixWizardExportModel()
    expect(model.spellcasting?.spells.filter((spell) => spell.level === 0)).toHaveLength(4)
    const result = await fillPdfTemplate(template(), font(), model)
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    expect(result.diagnostics).not.toContainEqual(expect.objectContaining({ field: 'spells.0' }))
  }, 30_000)

  it('长文本和超量攻击返回容量警告但仍生成文件', async () => {
    const model = fighterExportModel()
    const crowded = {
      ...model,
      attacks: Array.from({ length: 8 }, (_, index) => ({ itemId: `weapon-${index}`, name: `武器${index}`, attackBonus: 5, damage: '1d8+3 挥砍', note: '这是一段较长的攻击说明' })),
      profile: { backstory: '很长的背景故事。'.repeat(500) },
      features: Array.from({ length: 100 }, (_, index) => ({ id: `feature-${index}`, category: 'class' as const, name: `特性${index}`, summary: '这是一段较长的特性摘要。'.repeat(8), priority: 30 })),
    }
    const result = await fillPdfTemplate(template(), font(), crowded)
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'content-truncated', field: 'profile.backstory' }))
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      code: 'content-truncated',
      field: 'features.additional',
      message: expect.stringMatching(/已省略 \d+ 项/u),
    }))
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
  }, 30_000)
})
