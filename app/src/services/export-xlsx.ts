import type { Workbook } from 'exceljs'

/**
 * XLSX 自动卡导出服务。
 * 只负责「纯数据 → xlsx 文件」的文件边界；数据组装见
 * `src/features/character-export/build-export-data.ts`（本服务不依赖 rules）。
 * exceljs 使用动态 import：只在点击导出时按需加载，不进入 SSG 预渲染执行路径。
 */

export interface XlsxExportSection {
  readonly title: string
  readonly rows: ReadonlyArray<readonly (string | number)[]>
}

export interface XlsxExportData {
  readonly title: string
  readonly subtitle: string
  readonly sections: readonly XlsxExportSection[]
}

const SHEET_NAME = '角色卡'
const COLUMN_WIDTHS: readonly number[] = [24, 44, 56]
const THEME_PRIMARY = 'FF8F2D2D'
const THEME_TEXT_MUTED = 'FF6D675C'

export async function buildExportWorkbook(data: XlsxExportData): Promise<Workbook> {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'D&D 5e 快速车卡'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(SHEET_NAME)
  sheet.columns = COLUMN_WIDTHS.map((width) => ({ width }))
  sheet.views = [{ state: 'frozen', ySplit: 2 }]

  sheet.mergeCells(1, 1, 1, 3)
  const titleCell = sheet.getCell(1, 1)
  titleCell.value = data.title
  titleCell.font = { bold: true, size: 16 }

  sheet.mergeCells(2, 1, 2, 3)
  const subtitleCell = sheet.getCell(2, 1)
  subtitleCell.value = data.subtitle
  subtitleCell.font = { size: 11, color: { argb: THEME_TEXT_MUTED } }

  let rowNumber = 4
  for (const section of data.sections) {
    const titleRow = sheet.getRow(rowNumber)
    titleRow.height = 18
    sheet.mergeCells(rowNumber, 1, rowNumber, 3)
    const titleCell = titleRow.getCell(1)
    titleCell.value = section.title
    titleCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME_PRIMARY } }
    rowNumber += 1

    for (const row of section.rows) {
      const sheetRow = sheet.getRow(rowNumber)
      sheetRow.height = 16
      sheetRow.getCell(1).value = row[0] ?? ''
      sheetRow.getCell(2).value = row[1] ?? ''
      sheetRow.getCell(3).value = row[2] ?? ''
      rowNumber += 1
    }
    rowNumber += 1
  }

  return workbook
}

export async function downloadXlsx(data: XlsxExportData, filename: string): Promise<void> {
  const workbook = await buildExportWorkbook(data)
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
