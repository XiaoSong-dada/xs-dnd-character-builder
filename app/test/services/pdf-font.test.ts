import { describe, expect, it } from 'vitest'

import { pdfExportCharacterCorpus, pdfFontBytes } from '../fixtures/pdf-font'

describe('PDF 动态字体规范', () => {
  it('锁定 Noto Sans SC Regular 字体身份和字重', async () => {
    const fontkitModule = await import('@pdf-lib/fontkit')
    const font = fontkitModule.default.create(pdfFontBytes()) as ReturnType<typeof fontkitModule.default.create> & { 'OS/2': { readonly usWeightClass: number } }
    expect(font.familyName).toBe('Noto Sans SC')
    expect(font.fullName).toBe('Noto Sans SC Regular')
    expect(font.postscriptName).toBe('NotoSansSC-Regular')
    expect(font.subfamilyName).toBe('Regular')
    expect(font['OS/2'].usWeightClass).toBe(400)
  })

  it('覆盖当前规则、导出文案、黄金样例和常用身份资料字符', async () => {
    const fontkitModule = await import('@pdf-lib/fontkit')
    const font = fontkitModule.default.create(pdfFontBytes())
    const missing = pdfExportCharacterCorpus().filter((character) => !font.hasGlyphForCodePoint(character.codePointAt(0) ?? 0))
    expect(missing).toEqual([])
  })
})
