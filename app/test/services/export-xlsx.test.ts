import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { strFromU8, unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'

import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { deriveCharacter } from '@/rules/derive'
import { buildAutoCardValues, CHARACTER_SHEET_TEMPLATE_VERSION, fillCharacterSheetTemplate, readXlsxTemplateMapping } from '@/services/export-xlsx'
import { draft2024, selection } from '../fixtures/draft-2024'
import { fighterExportModel, wizardExportModel } from '../fixtures/export-character'

function template(id: '2014' | '2024'): Uint8Array {
  return new Uint8Array(readFileSync(resolve(__dirname, `../../public/templates/character-sheet-${id}.xlsx`)))
}

function decode(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function cellValue(bytes: Uint8Array, sheetPath: string, address: string): string | number | boolean | undefined {
  const xml = strFromU8(unzipSync(bytes)[sheetPath] ?? new Uint8Array())
  const escaped = address.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`<c\\b(?=[^>]*\\br="${escaped}")([^>]*?)(?:/>|>([\\s\\S]*?)<\\/c>)`).exec(xml)
  if (!match) return undefined
  const attributes = match[1]
  const inner = match[2] ?? ''
  if (/<f\b/.test(inner)) return `=${inner.match(/<f\b[^>]*>([\s\S]*?)<\/f>/)?.[1] ?? ''}`
  const inline = inner.match(/<is\b[^>]*>([\s\S]*?)<\/is>/)?.[1]
  if (inline !== undefined) return decode([...inline.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((item) => item[1]).join(''))
  const raw = inner.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1]
  if (raw === undefined) return undefined
  if (/\bt="b"/.test(attributes)) return raw === '1'
  if (/\bt="s"/.test(attributes)) return raw
  const number = Number(raw)
  return Number.isFinite(number) ? number : decode(raw)
}

function model2024() {
  const draft = draft2024({
    id: 'xlsx-2024',
    classId: 'class-2024-ranger',
    subclassId: 'subclass-2024-ranger-hunter',
    targetLevel: 5,
    raceId: 'species-2024-human',
    backgroundId: 'background-2024-soldier',
    notes: '来自测试夹具的背景故事。',
    enabledSourceIds: ['source-2024-phb'],
    selections: [
      selection('class-2024-ranger-mastery-1', ['equipment-2024-longbow', 'equipment-2024-shortsword']),
      selection('subclass-feature-ranger-2024-hunter-hunters-prey', ['hunter-2024-prey-colossus-slayer']),
    ],
  })
  return buildCharacterExportModel(draft, deriveCharacter(draft))
}

describe('export-xlsx 自动卡模板契约 v4', () => {
  it('2014 自动卡使用 v4 字段映射并指向主要输入格', () => {
    const mapping = readXlsxTemplateMapping(template('2014'))
    expect(mapping.version).toBe(CHARACTER_SHEET_TEMPLATE_VERSION)
    expect(mapping.targets.size).toBeGreaterThan(150)
    expect(mapping.targets.get('character_name')).toEqual({ sheet: '主要', address: 'E3', kind: 'input', requirement: 'required' })
    expect(mapping.targets.get('hp_max')).toEqual({ sheet: '主要', address: 'BE10', kind: 'value', requirement: 'required' })
    expect(mapping.targets.get('skill_athletics_misc')?.kind).toBe('input')
  })

  it('2024 自动卡使用 v4 字段映射并指向对应工作表和输入格', () => {
    const mapping = readXlsxTemplateMapping(template('2024'))
    expect(mapping.version).toBe(CHARACTER_SHEET_TEMPLATE_VERSION)
    expect(mapping.targets.size).toBeGreaterThan(100)
    expect(mapping.targets.get('character_name')).toEqual({ sheet: '角色', address: 'E3', kind: 'input', requirement: 'required' })
    expect(mapping.targets.get('str_score')).toEqual({ sheet: '属性计算器&自定义调整栏', address: 'F2', kind: 'input', requirement: 'required' })
    expect(mapping.targets.get('hp_max')).toEqual({ sheet: '主要情况', address: 'AC8', kind: 'value', requirement: 'required' })
  })

  it('2014 战士写入真实 2014 自动卡，输入与派生修正值均落格', () => {
    const model = fighterExportModel()
    const result = fillCharacterSheetTemplate(template('2014'), model, '2014')
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    const out = result.bytes
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'E3')).toBe('测试角色')
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'S3')).toBe('战士')
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'Y3')).toBe(4)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'I14')).toBe(17)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'A45')).toBe(true)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'G32')).toBe(0)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'G29')).toBe(0)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'Q38')).toBe('30尺')
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'BE10')).toBe(36)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'M29')).toBe(36)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'C90')).toBe('战斗风格')
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'Q53')).toBe('长剑 × 2（已装备）')
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'AG64')).toBe(17)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'AN58')).toBe(0)
    expect(strFromU8(unzipSync(out)['xl/workbook.xml'])).toMatch(/<calcPr\b[^>]*fullCalcOnLoad="1"/)
  })

  it('2024 游侠写入真实 2024 自动卡，且输出为无宏 xlsx', () => {
    const model = model2024()
    const result = fillCharacterSheetTemplate(template('2024'), model, '2024')
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    const out = result.bytes
    const archive = unzipSync(out)
    expect(archive['xl/vbaProject.bin']).toBeUndefined()
    expect(Object.keys(archive).some((name) => name.startsWith('xl/activeX/'))).toBe(false)
    expect(cellValue(out, 'xl/worksheets/sheet1.xml', 'E3')).toBe('测试角色')
    expect(cellValue(out, 'xl/worksheets/sheet1.xml', 'E6')).toBe('人类')
    expect(cellValue(out, 'xl/worksheets/sheet1.xml', 'E10')).toBe('士兵')
    expect(cellValue(out, 'xl/worksheets/sheet1.xml', 'R20')).toBe('来自测试夹具的背景故事。')
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'S3')).toBe('游侠')
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'W3')).toBe(5)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'Y11')).toBe(5)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'B23')).toBe('X')
    expect(cellValue(out, 'xl/worksheets/sheet9.xml', 'F2')).toBe(15)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'AC8')).toBe(model.combat.hitPointMaximum)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'P8')).toBe(model.combat.initiative)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'AD17')).toBe(model.combat.speed)
    expect(cellValue(out, 'xl/worksheets/sheet2.xml', 'BN25')).toBeTruthy()
    expect(strFromU8(archive['xl/workbook.xml'])).toMatch(/<calcPr\b[^>]*fullCalcOnLoad="1"/)

    const withAttack = { ...model, attacks: [{ itemId: 'test', name: '长剑', attackBonus: 5, damage: '1d8+3 挥砍', note: '' }] }
    const attackOut = fillCharacterSheetTemplate(template('2024'), withAttack, '2024').bytes
    expect(cellValue(attackOut, 'xl/worksheets/sheet2.xml', 'O25')).toBe('长剑')
    expect(cellValue(attackOut, 'xl/worksheets/sheet2.xml', 'AD25')).toBe('+5')
    expect(cellValue(attackOut, 'xl/worksheets/sheet2.xml', 'AI25')).toBe('1d8+3 挥砍')
    expect(cellValue(attackOut, 'xl/worksheets/sheet2.xml', 'AM25')).toBe('挥砍')
  })

  it('自动卡值构造器把技能专精与法术位写成模板可计算的输入', () => {
    const wizard = buildAutoCardValues(wizardExportModel(), '2014')
    expect(wizard.class_name).toBe('法师')
    expect(wizard.spell_slot_1).toBe(4)
    expect(wizard.spell_slot_2).toBe(2)
    expect(Object.values(wizard)).toContain('魔法飞弹')

    const fighter = buildAutoCardValues(fighterExportModel(), '2014')
    expect(fighter.speed).toBe('30尺')
    expect(fighter.ac_misc).toBe(0)
    expect(fighter.skill_athletics_prof).toBe(true)
    expect(fighter.skill_athletics_misc).toBe(0)
    expect(fighter.save_str_misc).toBe(0)

    const expertModel = { ...fighterExportModel(), skills: fighterExportModel().skills.map((skill) => skill.id === 'skill-athletics' ? { ...skill, proficiency: 'expertise' as const, value: skill.value + 2 } : skill) }
    const expert = buildAutoCardValues(expertModel, '2014')
    expect(expert.skill_athletics_prof).toBe(true)
    expect(expert.skill_athletics_misc).toBe(2)

    const ranger = buildAutoCardValues(model2024(), '2024')
    expect(ranger.speed).toBe(30)
    expect(ranger.hp_max).toBe(model2024().combat.hitPointMaximum)
    expect(ranger.character_name).toBe('测试角色')
    expect(ranger.class_name).toBe('游侠')
  })

  it('非法模板或版本不兼容时阻断', () => {
    expect(() => readXlsxTemplateMapping(new Uint8Array([1, 2, 3]))).toThrow()
    const archive = unzipSync(template('2014'))
    const mappingPath = 'xl/worksheets/sheet20.xml'
    const mappingXml = strFromU8(archive[mappingPath])
    archive[mappingPath] = new TextEncoder().encode(mappingXml.replace(/(<c r="I1"[^>]*><v>)4(<\/v><\/c>)/, '$13$2'))
    // 重新打包后 I1 不再是 4；用 fflate 的 zipSync 需要动态导入。
    return import('fflate').then(({ zipSync, strToU8 }) => {
      expect(() => readXlsxTemplateMapping(zipSync({ ...archive, 'xl/workbook.xml': strToU8(strFromU8(archive['xl/workbook.xml'])) }))).toThrow(/版本不兼容/)
    })
  })
})
