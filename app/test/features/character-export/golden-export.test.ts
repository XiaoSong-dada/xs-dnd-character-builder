import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { deriveCharacter } from '@/rules/derive'
import { CharacterJsonService } from '@/services/character-json'
import { fillPdfTemplate } from '@/services/export-pdf'
import { buildXlsxFieldValues } from '@/services/export-xlsx'

const FIXTURE = resolve(__dirname, '../../fixtures/vv-ff800d07-a8b9-4c1b-a51d-5b4cd25efe24.json')
const PDF_TEMPLATE = resolve(__dirname, '../../../public/templates/character-sheet-zh-plus.pdf')
const PDF_FONT = resolve(__dirname, '../../../public/templates/fonts/noto-sans-sc-subset.ttf')

describe('角色卡导出黄金样例', () => {
  it('完整保留 5 个戏法、24 个法术书法术、9 个准备标记及关键内容', async () => {
    const draft = CharacterJsonService.importDraft(readFileSync(FIXTURE, 'utf8'))
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    expect(model.spellcasting?.spells.filter((spell) => spell.level === 0)).toHaveLength(5)
    expect(model.spellcasting?.spells.filter((spell) => spell.level > 0)).toHaveLength(24)
    expect(model.spellcasting?.spells.filter((spell) => spell.prepared)).toHaveLength(9)
    expect(model.attacks.map((attack) => attack.name)).toContain('长棍')
    expect(model.currency.gp).toBe(10)
    expect(model.features.map((feature) => feature.name)).toEqual(expect.arrayContaining(['警觉', '冲锋者']))

    const { values, diagnostics } = buildXlsxFieldValues(model)
    expect(diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    expect(values.attack_1_name).toBe('长棍')
    expect(values.gp).toBe(10)
    expect(Object.entries(values).filter(([key, value]) => /^spell_\d+_\d+_prepared$/.test(key) && value === '●')).toHaveLength(9)
    expect(`${values.features_traits}\n${values.additional_features}`).toContain('警觉')
    expect(`${values.features_traits}\n${values.additional_features}`).toContain('冲锋者')

    const pdf = await fillPdfTemplate(new Uint8Array(readFileSync(PDF_TEMPLATE)), new Uint8Array(readFileSync(PDF_FONT)), model)
    expect(pdf.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    const { PDFDocument } = await import('pdf-lib')
    expect((await PDFDocument.load(pdf.bytes)).getPageCount()).toBe(3)
  }, 30_000)
})
