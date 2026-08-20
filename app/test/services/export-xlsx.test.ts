import { describe, expect, it } from 'vitest'

import { buildExportWorkbook } from '@/services/export-xlsx'

const fixtureData = {
  title: '测试角色',
  subtitle: '4 级 · 战士 · 半兽人',
  sections: [
    { title: '属性', rows: [['力量', 16, '调整值 +3'], ['敏捷', 14, '调整值 +2']] },
    { title: '技能', rows: [['体操', '+5', '熟练']] },
  ],
}

describe('export-xlsx 服务', () => {
  it('生成角色卡工作表，标题/副标题/区块与行数据可读回', async () => {
    const workbook = await buildExportWorkbook(fixtureData)
    expect(workbook.worksheets).toHaveLength(1)

    const sheet = workbook.getWorksheet('角色卡')
    expect(sheet).toBeDefined()
    expect(sheet!.getCell('A1').value).toBe('测试角色')
    expect(sheet!.getCell('A2').value).toBe('4 级 · 战士 · 半兽人')

    // 第 4 行起为区块：区块标题行 + 数据行。
    expect(sheet!.getCell('A4').value).toBe('属性')
    expect(sheet!.getCell('A5').value).toBe('力量')
    expect(sheet!.getCell('B5').value).toBe(16)
    expect(sheet!.getCell('C5').value).toBe('调整值 +3')
    expect(sheet!.getCell('A6').value).toBe('敏捷')
    // 区块间留空一行；第 7 行为空，技能区块从第 8 行开始。
    expect(sheet!.getCell('A7').value).toBeNull()
    expect(sheet!.getCell('A8').value).toBe('技能')
    expect(sheet!.getCell('A9').value).toBe('体操')
    expect(sheet!.getCell('B9').value).toBe('+5')
  })

  it('中文工作表名与标题、冻结前两行', async () => {
    const workbook = await buildExportWorkbook(fixtureData)
    const sheet = workbook.getWorksheet('角色卡')
    expect(sheet?.name).toBe('角色卡')
    expect(sheet?.views[0]).toMatchObject({ state: 'frozen', ySplit: 2 })
  })

  it('空区块不写入任何行', async () => {
    const workbook = await buildExportWorkbook({ title: '空角色', subtitle: '', sections: [{ title: '空区块', rows: [] }] })
    const sheet = workbook.getWorksheet('角色卡')!
    expect(sheet.getCell('A4').value).toBe('空区块')
    // exceljs 未写入的单元格读回为 null。
    expect(sheet.getCell('A5').value).toBeNull()
  })

  it('生成的工作簿可序列化为 xlsx 文件（zip 头）', async () => {
    const workbook = await buildExportWorkbook(fixtureData)
    const buffer = await workbook.xlsx.writeBuffer()
    expect(buffer.byteLength).toBeGreaterThan(1000)
    // xlsx 为 zip 格式：PK 文件头。
    const header = new Uint8Array(buffer.slice(0, 4))
    expect(String.fromCharCode(...header)).toBe('PK\x03\x04')
  })
})
