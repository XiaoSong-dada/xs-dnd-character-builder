import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import type { Workbook } from 'exceljs'

import { CHARACTER_SHEET_TEMPLATE_VERSION, buildXlsxFieldValues, fillTemplate, readFieldMapping, readTemplateVersion, verifyFormulaCaches, verifyFullCalculationOnLoad } from '@/services/export-xlsx'
import { fighterExportModel, wizardExportModel } from '../fixtures/export-character'

const TEMPLATE_PATH = resolve(__dirname, '../../public/templates/character-sheet-zh.xlsx')

async function loadTemplate(): Promise<Workbook> {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(readFileSync(TEMPLATE_PATH))
  return workbook
}

describe('export-xlsx v4 模板契约', () => {
  it('包含版本、字段类型、必需级别和 196 个法术字段', async () => {
    const workbook = await loadTemplate()
    const mapping = readFieldMapping(workbook)
    expect(readTemplateVersion(workbook)).toBe(CHARACTER_SHEET_TEMPLATE_VERSION)
    expect(mapping.get('character_name')).toEqual({ sheet: '角色卡', address: 'A4', kind: 'input', requirement: 'required' })
    expect(mapping.get('str_mod')).toEqual({ sheet: '角色卡', address: 'E12', kind: 'formula-cache', requirement: 'required' })
    expect([...mapping.keys()].filter((key) => /^spell_\d+_\d+_(name|prepared)$/.test(key))).toHaveLength(196)
  }, 15_000)

  it('统一模型覆盖攻击、钱币、法术位与公式缓存字段', () => {
    const fighter = buildXlsxFieldValues(fighterExportModel()).values
    const wizard = buildXlsxFieldValues(wizardExportModel()).values
    expect(fighter).toMatchObject({ attack_1_name: '长剑', cp: 5, sp: 4, ep: 3, gp: 17, pp: 2 })
    expect(fighter.str_mod).toBeTypeOf('number')
    expect(fighter.skill_athletics_value).toBeTypeOf('number')
    expect(wizard.spell_slot_1_total).toBe(4)
    expect(wizard.spell_slot_2_total).toBe(2)
    expect(Object.values(wizard).filter((value) => value === '魔法飞弹')).toHaveLength(1)
  })

  it('写入输入值并保留公式及缓存结果', async () => {
    const workbook = await loadTemplate()
    const result = fillTemplate(workbook, fighterExportModel())
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    const sheet = workbook.getWorksheet('角色卡')!
    expect(sheet.getCell('A4').value).toBe('测试角色')
    expect(sheet.getCell('M54').value).toBe(17)
    expect(sheet.getCell('E12').formula).toContain('INT((A12')
    expect(sheet.getCell('E12').result).toBe(fighterExportModel().abilities.str.modifier)
    expect(workbook.calcProperties.fullCalcOnLoad).toBe(true)
  })

  it('序列化往返后六张表、公式缓存、验证和合并仍在', async () => {
    const workbook = await loadTemplate()
    fillTemplate(workbook, wizardExportModel())
    const buffer = await workbook.xlsx.writeBuffer()
    const ExcelJS = await import('exceljs')
    const reloaded = new ExcelJS.Workbook()
    await reloaded.xlsx.load(buffer)
    expect(reloaded.worksheets).toHaveLength(6)
    expect(reloaded.getWorksheet('角色卡')?.getCell('E12').formula).toContain('INT((A12')
    expect(reloaded.getWorksheet('角色卡')?.getCell('E12').result).toBeTypeOf('number')
    expect(Object.keys(reloaded.getWorksheet('角色卡')!.dataValidations.model).length).toBeGreaterThan(20)
    expect(Object.keys((reloaded.getWorksheet('角色卡') as unknown as { _merges: object })._merges).length).toBeGreaterThan(100)
  })

  it('以 OOXML 原始属性校验打开时完整重算，避免 ExcelJS 读取缺陷造成误报', async () => {
    const workbook = await loadTemplate()
    fillTemplate(workbook, fighterExportModel())
    const buffer = await workbook.xlsx.writeBuffer()
    const ExcelJS = await import('exceljs')
    const reloaded = new ExcelJS.Workbook()
    await reloaded.xlsx.load(buffer)
    expect(reloaded.calcProperties.fullCalcOnLoad).not.toBe(true)

    const archive = unzipSync(new Uint8Array(buffer))
    expect(strFromU8(archive['xl/workbook.xml'])).toMatch(/<calcPr\b[^>]*fullCalcOnLoad="1"/)
    await expect(verifyFullCalculationOnLoad(buffer)).resolves.toBeUndefined()
  })

  it('非施法角色的空公式缓存以 OOXML 节点为准，不被 ExcelJS 二次读取误报', async () => {
    const workbook = await loadTemplate()
    fillTemplate(workbook, fighterExportModel())
    const mapping = readFieldMapping(workbook)
    const buffer = await workbook.xlsx.writeBuffer()
    const ExcelJS = await import('exceljs')
    const reloaded = new ExcelJS.Workbook()
    await reloaded.xlsx.load(buffer)
    expect(reloaded.getWorksheet('法术卡')?.getCell('W4').formula).toBeTruthy()
    expect(reloaded.getWorksheet('法术卡')?.getCell('W4').result).toBeUndefined()
    expect(reloaded.getWorksheet('法术卡')?.getCell('AD4').result).toBeUndefined()
    await expect(verifyFormulaCaches(buffer, mapping)).resolves.toBeUndefined()

    const archive = unzipSync(new Uint8Array(buffer))
    const spellSheetPath = 'xl/worksheets/sheet3.xml'
    const spellSheetXml = strFromU8(archive[spellSheetPath])
    archive[spellSheetPath] = strToU8(spellSheetXml.replace(/(<c\b(?=[^>]*\br="W4")[^>]*>[\s\S]*?<\/f>)<v><\/v>(<\/c>)/, '$1$2'))
    await expect(verifyFormulaCaches(zipSync(archive), mapping)).rejects.toThrow('导出后的公式缓存校验失败：spell_save_dc')
  })

  it.each([
    ['缺少 workbook.xml', zipSync({ 'placeholder.txt': strToU8('empty') })],
    ['缺少 calcPr', zipSync({ 'xl/workbook.xml': strToU8('<workbook></workbook>') })],
    ['缺少 fullCalcOnLoad', zipSync({ 'xl/workbook.xml': strToU8('<workbook><calcPr calcId="171027"/></workbook>') })],
    ['fullCalcOnLoad 为 false', zipSync({ 'xl/workbook.xml': strToU8('<workbook><calcPr fullCalcOnLoad="false"/></workbook>') })],
  ])('%s 时阻断下载', async (_caseName, buffer) => {
    await expect(verifyFullCalculationOnLoad(buffer)).rejects.toThrow('导出后的角色卡未启用打开时完整重算。')
  })

  it('重复 Key、重复目标、错误版本和无效目标均阻断', async () => {
    const wrongVersion = await loadTemplate()
    wrongVersion.getWorksheet('字段映射')!.getCell('I1').value = 3
    expect(() => fillTemplate(wrongVersion, fighterExportModel())).toThrow(/版本不兼容/)

    const duplicateKey = await loadTemplate()
    const mappingSheet = duplicateKey.getWorksheet('字段映射')!
    const nextRow = mappingSheet.rowCount + 1
    mappingSheet.getCell(`A${nextRow}`).value = 'character_name'
    mappingSheet.getCell(`B${nextRow}`).value = '角色卡'
    mappingSheet.getCell(`C${nextRow}`).value = 'B4'
    expect(() => readFieldMapping(duplicateKey)).toThrow(/字段重复/)

    const duplicateTarget = await loadTemplate()
    duplicateTarget.getWorksheet('字段映射')!.getCell('C3').value = 'A4'
    expect(() => readFieldMapping(duplicateTarget)).toThrow(/目标重复/)

    const invalidTarget = await loadTemplate()
    invalidTarget.getWorksheet('字段映射')!.getCell('B2').value = '不存在的工作表'
    expect(fillTemplate(invalidTarget, fighterExportModel()).diagnostics).toContainEqual(expect.objectContaining({ code: 'invalid-template-target', severity: 'error' }))

    const missingCore = await loadTemplate()
    missingCore.getWorksheet('字段映射')!.getCell('A2').value = 'renamed_character_name'
    expect(fillTemplate(missingCore, fighterExportModel()).diagnostics).toContainEqual(expect.objectContaining({ code: 'missing-template-field', field: 'character_name', severity: 'error' }))
  })
})
