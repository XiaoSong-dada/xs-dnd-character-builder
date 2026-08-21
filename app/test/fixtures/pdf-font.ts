import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const FONT_PATH = resolve(__dirname, '../../public/templates/fonts/noto-sans-sc-subset.ttf')
const COMMON_PLAYER_INPUT = '张伟欧阳娜娜艾莉丝·晨星 John Doe 123 岁'
const EXPORT_CHARACTER_PATTERN = /[\u0020-\u007E\u00B7\u00D7\u2014\u2022\u2026\u25A1\u25C6\u25CB\u25CF\u2713\u3000-\u303F\u3400-\u9FFF\uFF01-\uFF5E]/u

function collectTypeScriptFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return collectTypeScriptFiles(path)
    return entry.isFile() && path.endsWith('.ts') ? [path] : []
  })
}

export function pdfFontBytes(): Uint8Array {
  return new Uint8Array(readFileSync(FONT_PATH))
}

export function pdfExportCharacterCorpus(): readonly string[] {
  const files = [
    ...collectTypeScriptFiles(resolve(__dirname, '../../src/rules')),
    resolve(__dirname, '../../src/services/export-pdf.ts'),
    resolve(__dirname, 'export-character.ts'),
    resolve(__dirname, 'vv-ff800d07-a8b9-4c1b-a51d-5b4cd25efe24.json'),
  ]
  const corpus = `${files.map((path) => readFileSync(path, 'utf8')).join('\n')}\n${COMMON_PLAYER_INPUT}`
  return [...new Set(Array.from(corpus).filter((character) => EXPORT_CHARACTER_PATTERN.test(character)))]
}

export async function inspectGeneratedPdfFont(bytes: Uint8Array): Promise<{
  readonly embeddedRegularFontCount: number
  readonly hasNeedAppearances: boolean
  readonly widgetCount: number
}> {
  const { PDFDict, PDFName, PDFStream, PDFDocument } = await import('pdf-lib')
  const document = await PDFDocument.load(bytes)
  const acroForm = document.context.lookupMaybe(document.catalog.get(PDFName.of('AcroForm')), PDFDict)
  const hasNeedAppearances = acroForm?.get(PDFName.of('NeedAppearances'))?.toString() === 'true'
  let embeddedRegularFontCount = 0
  for (const [, object] of document.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFDict)) continue
    const fontName = object.get(PDFName.of('FontName'))?.toString() ?? ''
    if (!fontName.includes('NotoSansSC-Regular')) continue
    const fontFile = object.get(PDFName.of('FontFile2')) ?? object.get(PDFName.of('FontFile3'))
    if (fontFile && document.context.lookup(fontFile) instanceof PDFStream) embeddedRegularFontCount += 1
  }
  let widgetCount = 0
  for (const page of document.getPages()) {
    for (const annotationRef of page.node.Annots()?.asArray() ?? []) {
      const annotation = document.context.lookupMaybe(annotationRef, PDFDict)
      if (annotation?.get(PDFName.of('Subtype'))?.toString() === '/Widget') widgetCount += 1
    }
  }
  return { embeddedRegularFontCount, hasNeedAppearances, widgetCount }
}
