#!/usr/bin/env node
/**
 * 从 Issue #18 的参考自动卡生成运行时模板：
 * - 2014：DND 5E 人物卡（法术查询列表整合版 v4.4.5）.xlsx
 * - 2024：dnd5e2024 人物卡模板 v1.3.xlsm → 去掉宏/ActiveX 的 xlsx
 *
 * 两张卡都追加「字段映射」工作表（v4 契约），运行时只按该表写入输入格。
 * 用法：node scripts/build-xlsx-templates.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'

const appRoot = resolve(import.meta.dirname, '..')
const repoRoot = resolve(appRoot, '..')
const docsDir = resolve(repoRoot, 'docs/export-templates')
const outDir = resolve(appRoot, 'public/templates')

const CELL_REFS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
const XML_DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
const NS = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
const REL_NS = 'xmlns="http://schemas.openxmlformats.org/package/2006/relationships"'
const WORKSHEET_TYPE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet'
const WORKSHEET_CONTENT = 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml'

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inlineCell(ref, value) {
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`
}

function numberCell(ref, value) {
  return `<c r="${ref}"><v>${value}</v></c>`
}

function mappingSheetXml(mapping) {
  const rows = []
  const header = ['字段 Key', '工作表', '目标单元格', '说明', '字段类型', '必需级别']
  rows.push(`<row r="1">${header.map((value, index) => inlineCell(`${CELL_REFS[index]}1`, value)).join('')}${inlineCell('H1', '模板版本')}${numberCell('I1', mapping.version)}</row>`)
  mapping.entries.forEach((entry, index) => {
    const row = index + 2
    const values = [entry.key, entry.sheet, entry.address, entry.description ?? '', entry.kind, entry.requirement]
    rows.push(`<row r="${row}">${values.map((value, column) => inlineCell(`${CELL_REFS[column]}${row}`, value)).join('')}</row>`)
  })
  return `${XML_DECL}<worksheet ${NS}><dimension ref="A1:I${rows.length}"/><cols><col min="1" max="1" width="28" customWidth="1"/><col min="2" max="2" width="18" customWidth="1"/><col min="3" max="3" width="14" customWidth="1"/><col min="4" max="4" width="24" customWidth="1"/><col min="5" max="5" width="14" customWidth="1"/><col min="6" max="6" width="12" customWidth="1"/><col min="7" max="9" width="10" customWidth="1"/></cols><sheetData>${rows.join('')}</sheetData><pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>`
}

function addMappingSheet(archive, mapping) {
  const workbookPath = 'xl/workbook.xml'
  const relsPath = 'xl/_rels/workbook.xml.rels'
  const contentTypePath = '[Content_Types].xml'
  const workbook = strFromU8(archive[workbookPath])
  const rels = strFromU8(archive[relsPath])
  const contentTypes = strFromU8(archive[contentTypePath])

  if (/name="字段映射"/.test(workbook)) throw new Error('源模板已包含「字段映射」工作表，请从干净源重新生成。')

  const sheetIds = [...workbook.matchAll(/<sheet\b[^>]*\bsheetId="(\d+)"/g)].map((match) => Number(match[1]))
  const relIds = [...rels.matchAll(/<Relationship\b[^>]*\bId="rId(\d+)"/g)].map((match) => Number(match[1]))
  const sheetNumbers = [...archivePaths(archive).matchAll(/^xl\/worksheets\/sheet(\d+)\.xml$/gm)].map((match) => Number(match[1]))
  const nextSheetId = Math.max(0, ...sheetIds) + 1
  const nextRelId = `rId${Math.max(0, ...relIds) + 1}`
  const nextSheetNumber = Math.max(0, ...sheetNumbers) + 1
  const sheetPath = `xl/worksheets/sheet${nextSheetNumber}.xml`

  const sheetTag = `<sheet name="字段映射" sheetId="${nextSheetId}" r:id="${nextRelId}"/>`
  const nextWorkbook = workbook.replace('</sheets>', `${sheetTag}</sheets>`)
  const nextRels = rels.replace('</Relationships>', `<Relationship Id="${nextRelId}" Type="${WORKSHEET_TYPE}" Target="worksheets/sheet${nextSheetNumber}.xml"/></Relationships>`)
  const nextContentTypes = contentTypes.replace('</Types>', `<Override PartName="/${sheetPath}" ContentType="${WORKSHEET_CONTENT}"/></Types>`)

  archive[workbookPath] = strToU8(nextWorkbook)
  archive[relsPath] = strToU8(nextRels)
  archive[contentTypePath] = strToU8(nextContentTypes)
  archive[sheetPath] = strToU8(mappingSheetXml(mapping))
}

function archivePaths(archive) {
  return Object.keys(archive).join('\n')
}

function stripMacrosAndActiveX(archive) {
  for (const name of Object.keys(archive)) {
    if (name === 'xl/vbaProject.bin' || name.startsWith('xl/activeX/')) delete archive[name]
  }

  const contentTypePath = '[Content_Types].xml'
  let contentTypes = strFromU8(archive[contentTypePath])
  contentTypes = contentTypes
    .replace(/<Override PartName="\/xl\/vbaProject\.bin"[^>]*\/>/g, '')
    .replace(/<Override PartName="\/xl\/activeX\/[^"]+"[^>]*\/>/g, '')
    .replace('application/vnd.ms-excel.sheet.macroEnabled.main+xml', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml')
  archive[contentTypePath] = strToU8(contentTypes)

  const relsPath = 'xl/_rels/workbook.xml.rels'
  let rels = strFromU8(archive[relsPath])
  rels = rels.replace(/<Relationship\b[^>]*vbaProject[^>]*\/>/g, '')
  archive[relsPath] = strToU8(rels)

  for (const [name, bytes] of Object.entries(archive)) {
    if (!/^xl\/worksheets\/_rels\/sheet\d+\.xml\.rels$/.test(name)) continue
    let sheetRels = strFromU8(bytes)
    sheetRels = sheetRels.replace(/<Relationship\b[^>]*Type="[^"]*\/control"[^>]*\/>/g, '')
    archive[name] = strToU8(sheetRels)
  }

  for (const [name, bytes] of Object.entries(archive)) {
    if (!/^xl\/worksheets\/sheet\d+\.xml$/.test(name)) continue
    const sheetXml = strFromU8(bytes)
    const next = sheetXml.replace(/<controls>[\s\S]*?<\/controls>/g, '')
    if (next !== sheetXml) archive[name] = strToU8(next)
  }
}

function build(templateId, sourceFile, mappingFile) {
  const source = resolve(docsDir, sourceFile)
  const mapping = JSON.parse(readFileSync(resolve(appRoot, 'scripts/xlsx-mappings', mappingFile), 'utf8'))
  const archive = unzipSync(readFileSync(source))
  if (templateId === '2024') stripMacrosAndActiveX(archive)
  addMappingSheet(archive, mapping)
  const bytes = zipSync(archive, { level: 6 })
  const output = resolve(outDir, `character-sheet-${templateId}.xlsx`)
  writeFileSync(output, bytes)
  console.log(`${templateId}: ${(sourceFile)} -> ${output} (${(bytes.byteLength / 1024).toFixed(0)} KiB, ${mapping.entries.length} mappings)`)
}

build('2014', 'DND.5E.v4.4.5.xlsx', '2014.json')
build('2024', 'dnd5e2024.v1.3.xlsm', '2024.json')
