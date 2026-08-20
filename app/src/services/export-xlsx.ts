import type { Workbook } from 'exceljs'

import { baseUrl } from '@/config/site'
import { formatSigned, type CharacterExportModel, type ExportDiagnostic } from '@/features/character-export/build-export-data'

export const CHARACTER_SHEET_TEMPLATE_URL = `${baseUrl}templates/character-sheet-zh.xlsx`
export const CHARACTER_SHEET_TEMPLATE_VERSION = 4

export type TemplateFieldKind = 'input' | 'formula-cache' | 'optional'
export type TemplateFieldRequirement = 'required' | 'conditional' | 'optional'

export interface TemplateFieldTarget {
  readonly sheet: string
  readonly address: string
  readonly kind: TemplateFieldKind
  readonly requirement: TemplateFieldRequirement
}

export interface TemplateFillResult {
  readonly diagnostics: readonly ExportDiagnostic[]
  readonly writtenKeys: readonly string[]
}

const SKILL_FIELDS: Readonly<Record<string, string>> = {
  'skill-acrobatics': 'skill_acrobatics', 'skill-animal-handling': 'skill_animal_handling', 'skill-arcana': 'skill_arcana',
  'skill-athletics': 'skill_athletics', 'skill-deception': 'skill_deception', 'skill-history': 'skill_history',
  'skill-insight': 'skill_insight', 'skill-intimidation': 'skill_intimidation', 'skill-investigation': 'skill_investigation',
  'skill-medicine': 'skill_medicine', 'skill-nature': 'skill_nature', 'skill-perception': 'skill_perception',
  'skill-performance': 'skill_performance', 'skill-persuasion': 'skill_persuasion', 'skill-religion': 'skill_religion',
  'skill-sleight-of-hand': 'skill_sleight_of_hand', 'skill-stealth': 'skill_stealth', 'skill-survival': 'skill_survival',
}

const REQUIRED_TEMPLATE_KEYS = [
  'character_name', 'class_name', 'race', 'background', 'level', 'alignment', 'experience',
  'armor_class', 'speed', 'hp_max', 'hp_current', 'hp_temp', 'hit_dice', 'other_proficiencies_languages',
  'features_traits', 'equipment', 'str_score', 'dex_score', 'con_score', 'int_score', 'wis_score', 'cha_score',
  'str_mod', 'dex_mod', 'con_mod', 'int_mod', 'wis_mod', 'cha_mod', 'proficiency_bonus', 'initiative', 'passive_perception',
  'cp', 'sp', 'ep', 'gp', 'pp',
] as const

function compactFeature(feature: CharacterExportModel['features'][number]): string {
  const summary = feature.summary.replace(/\s+/g, ' ').trim()
  return summary ? `${feature.name}：${summary}` : feature.name
}

function splitFeatureText(model: CharacterExportModel): { primary: string; additional: string; truncated: boolean } {
  const entries = model.features.map(compactFeature)
  const primary: string[] = []
  const additional: string[] = []
  let primaryLength = 0
  let additionalLength = 0
  let truncated = false
  for (const entry of entries) {
    if (primaryLength + entry.length + 1 <= 220) {
      primary.push(entry)
      primaryLength += entry.length + 1
    } else if (additionalLength + entry.length + 1 <= 700) {
      additional.push(entry)
      additionalLength += entry.length + 1
    } else {
      truncated = true
    }
  }
  return { primary: primary.join('\n'), additional: additional.join('\n'), truncated }
}

export function buildXlsxFieldValues(model: CharacterExportModel): { values: Record<string, string | number>; diagnostics: ExportDiagnostic[] } {
  const featureText = splitFeatureText(model)
  const diagnostics: ExportDiagnostic[] = [...model.diagnostics]
  if (featureText.truncated) diagnostics.push({ code: 'content-truncated', severity: 'warning', field: 'features', message: '部分特性因模板容量被省略。' })
  if (model.attacks.length > 4) diagnostics.push({ code: 'content-truncated', severity: 'warning', field: 'attacks', message: '模板最多显示四个攻击，额外攻击已省略。' })

  const values: Record<string, string | number> = {
    character_name: model.identity.characterName,
    class_name: model.identity.className,
    race: model.identity.raceName,
    background: model.identity.backgroundName,
    level: model.identity.level,
    player_name: model.identity.playerName,
    alignment: model.identity.alignment,
    experience: model.identity.experience,
    armor_class: model.combat.armorClass,
    speed: model.combat.speed,
    hp_max: model.combat.hitPointMaximum,
    hp_current: model.combat.hitPointCurrent,
    hp_temp: model.combat.hitPointTemporary,
    hit_dice: model.combat.hitDice,
    inspiration: '', death_successes: '', death_failures: '',
    other_proficiencies_languages: model.proficiencies.text,
    features_traits: featureText.primary,
    additional_features: featureText.additional,
    equipment: model.inventory.map((entry) => `${entry.name}×${entry.quantity}${entry.equippedQuantity ? '（已装备）' : ''}`).join('、'),
    backstory: model.profile.backstory,
    spellcasting_class: model.spellcasting?.className ?? '',
    spellcasting_ability: model.spellcasting?.abilityLabel ?? '',
    proficiency_bonus: model.combat.proficiencyBonus,
    initiative: model.combat.initiative,
    passive_perception: model.combat.passivePerception,
    spell_save_dc: model.spellcasting?.saveDc ?? '',
    spell_attack_bonus: model.spellcasting?.attackBonus ?? '',
    cp: model.currency.cp, sp: model.currency.sp, ep: model.currency.ep, gp: model.currency.gp, pp: model.currency.pp,
    profile_character_name: model.identity.characterName,
    profile_class_level: `${model.identity.className} ${model.identity.level}`.trim(),
    profile_race: model.identity.raceName,
    profile_background: model.identity.backgroundName,
    spell_character_name: model.identity.characterName,
  }

  for (const ability of Object.values(model.abilities)) {
    values[`${ability.key}_score`] = ability.score
    values[`${ability.key}_mod`] = ability.modifier
    values[`save_${ability.key}_prof`] = ability.savingThrowProficient ? '●' : ''
    values[`save_${ability.key}_value`] = ability.savingThrow
  }
  for (const skill of model.skills) {
    const field = SKILL_FIELDS[skill.id]
    if (!field) continue
    values[`${field}_prof`] = skill.proficiency === 'expertise' ? '◆' : skill.proficiency === 'proficient' ? '●' : ''
    values[`${field}_value`] = skill.value
  }
  model.attacks.slice(0, 4).forEach((attack, index) => {
    const position = index + 1
    values[`attack_${position}_name`] = attack.name
    values[`attack_${position}_bonus`] = formatSigned(attack.attackBonus)
    values[`attack_${position}_damage`] = `${attack.damage}${attack.note ? `；${attack.note}` : ''}`
  })
  for (let level = 1; level <= 9; level += 1) values[`spell_slot_${level}_total`] = model.spellcasting?.slots.find((slot) => slot.level === level)?.count ?? 0
  const spellCapacities = [8, 10, 10, 10, 10, 10, 10, 10, 10, 10]
  for (let level = 0; level <= 9; level += 1) {
    const spells = model.spellcasting?.spells.filter((spell) => spell.level === level) ?? []
    if (spells.length > spellCapacities[level]) diagnostics.push({ code: 'content-truncated', severity: 'warning', field: `spells.${level}`, message: `${level} 环法术超过模板容量，额外法术已省略。` })
    spells.slice(0, spellCapacities[level]).forEach((spell, index) => {
      values[`spell_${level}_${index + 1}_prepared`] = spell.prepared ? '●' : ''
      values[`spell_${level}_${index + 1}_name`] = spell.name
    })
  }
  return { values, diagnostics }
}

export async function loadCharacterSheetTemplate(): Promise<Workbook> {
  const response = await fetch(CHARACTER_SHEET_TEMPLATE_URL)
  if (!response.ok) throw new Error(`角色卡模板加载失败（${response.status}）`)
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await response.arrayBuffer())
  return workbook
}

export function readTemplateVersion(workbook: Workbook): number | undefined {
  const value = workbook.getWorksheet('字段映射')?.getCell('I1').value
  return typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : undefined
}

export function readFieldMapping(workbook: Workbook): Map<string, TemplateFieldTarget> {
  const mappingSheet = workbook.getWorksheet('字段映射')
  if (!mappingSheet) return new Map()
  const mapping = new Map<string, TemplateFieldTarget>()
  const targets = new Set<string>()
  mappingSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const [key, sheetName, address, kindValue, requirementValue] = [1, 2, 3, 5, 6].map((column) => row.getCell(column).value)
    if (typeof key !== 'string' || typeof sheetName !== 'string' || typeof address !== 'string' || !key || !sheetName || !address) return
    if (mapping.has(key)) throw new Error(`角色卡模板字段重复：${key}`)
    const targetId = `${sheetName}!${address}`
    if (targets.has(targetId)) throw new Error(`角色卡模板目标重复：${targetId}`)
    const kind: TemplateFieldKind = kindValue === 'formula-cache' || kindValue === 'optional' ? kindValue : 'input'
    const requirement: TemplateFieldRequirement = requirementValue === 'required' || requirementValue === 'conditional' ? requirementValue : 'optional'
    mapping.set(key, { sheet: sheetName, address, kind, requirement })
    targets.add(targetId)
  })
  return mapping
}

export function fillTemplate(workbook: Workbook, model: CharacterExportModel): TemplateFillResult {
  if (readTemplateVersion(workbook) !== CHARACTER_SHEET_TEMPLATE_VERSION) throw new Error('角色卡模板版本不兼容，请刷新页面后重试。')
  const mapping = readFieldMapping(workbook)
  const { values, diagnostics } = buildXlsxFieldValues(model)
  const writtenKeys: string[] = []
  for (const key of REQUIRED_TEMPLATE_KEYS) {
    if (!mapping.has(key)) diagnostics.push({ code: 'missing-template-field', severity: 'error', field: key, message: `模板缺少核心字段映射：${key}` })
  }
  for (const [key, target] of mapping) {
    const value = values[key]
    if (value === undefined) {
      if (target.requirement === 'required') diagnostics.push({ code: 'missing-template-field', severity: 'error', field: key, message: `缺少必填导出值：${key}` })
      continue
    }
    const sheet = workbook.getWorksheet(target.sheet)
    if (!sheet) {
      diagnostics.push({ code: 'invalid-template-target', severity: 'error', field: key, message: `模板工作表不存在：${target.sheet}` })
      continue
    }
    if (!/^[A-Z]{1,3}[1-9]\d*$/.test(target.address)) {
      diagnostics.push({ code: 'invalid-template-target', severity: 'error', field: key, message: `模板单元格地址无效：${target.sheet}!${target.address}` })
      continue
    }
    const cell = sheet.getCell(target.address)
    if (target.kind === 'formula-cache') {
      if (!cell.formula) {
        diagnostics.push({ code: 'invalid-template-target', severity: 'error', field: key, message: `公式缓存目标不是公式单元格：${target.sheet}!${target.address}` })
        continue
      }
      cell.value = { formula: cell.formula, result: value }
    } else {
      if (cell.formula) {
        diagnostics.push({ code: 'invalid-template-target', severity: 'error', field: key, message: `输入字段错误指向公式单元格：${target.sheet}!${target.address}` })
        continue
      }
      cell.value = value
    }
    writtenKeys.push(key)
  }
  for (const [key, value] of Object.entries(values)) {
    if (value !== '' && value !== undefined && !mapping.has(key)) diagnostics.push({ code: 'missing-template-field', severity: 'error', field: key, message: `模板缺少字段映射：${key}` })
  }
  workbook.calcProperties.fullCalcOnLoad = true
  return { diagnostics, writtenKeys }
}

export async function verifyFullCalculationOnLoad(buffer: ArrayBuffer | Uint8Array): Promise<void> {
  const { strFromU8, unzipSync } = await import('fflate')
  let workbookXml: Uint8Array | undefined
  try {
    const archive = unzipSync(buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer))
    workbookXml = archive['xl/workbook.xml']
  } catch {
    throw new Error('导出后的角色卡未启用打开时完整重算。')
  }
  if (!workbookXml) throw new Error('导出后的角色卡未启用打开时完整重算。')
  const xml = strFromU8(workbookXml)
  if (!/<calcPr\b[^>]*\bfullCalcOnLoad\s*=\s*["'](?:1|true)["'][^>]*>/i.test(xml)) {
    throw new Error('导出后的角色卡未启用打开时完整重算。')
  }
}

function readXmlAttribute(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))
  return match?.[2]
}

function decodeXmlText(value: string): string {
  return value.replace(/&(?:#(\d+)|#x([\da-f]+)|amp|quot|apos|lt|gt);/gi, (entity, decimal: string | undefined, hexadecimal: string | undefined) => {
    if (decimal) return String.fromCodePoint(Number(decimal))
    if (hexadecimal) return String.fromCodePoint(Number.parseInt(hexadecimal, 16))
    return ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' } as const)[entity.toLowerCase() as '&amp;' | '&quot;' | '&apos;' | '&lt;' | '&gt;']
  })
}

export async function verifyFormulaCaches(buffer: ArrayBuffer | Uint8Array, mapping: ReadonlyMap<string, TemplateFieldTarget>): Promise<void> {
  const { strFromU8, unzipSync } = await import('fflate')
  const binary = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let archive: ReturnType<typeof unzipSync>
  try {
    archive = unzipSync(binary)
  } catch {
    throw new Error('导出后的角色卡工作表结构不完整。')
  }
  const workbookXmlBytes = archive['xl/workbook.xml']
  const relationshipsXmlBytes = archive['xl/_rels/workbook.xml.rels']
  if (!workbookXmlBytes || !relationshipsXmlBytes) throw new Error('导出后的角色卡工作表结构不完整。')

  const relationshipTargets = new Map<string, string>()
  for (const tag of strFromU8(relationshipsXmlBytes).match(/<Relationship\b[^>]*>/gi) ?? []) {
    const id = readXmlAttribute(tag, 'Id')
    const target = readXmlAttribute(tag, 'Target')
    if (id && target) relationshipTargets.set(id, target)
  }
  const sheetPaths = new Map<string, string>()
  for (const tag of strFromU8(workbookXmlBytes).match(/<sheet\b[^>]*>/gi) ?? []) {
    const name = readXmlAttribute(tag, 'name')
    const relationshipId = readXmlAttribute(tag, 'r:id')
    const target = relationshipId ? relationshipTargets.get(relationshipId) : undefined
    if (!name || !target) continue
    const normalizedTarget = target.replace(/\\/g, '/').replace(/^\/+/, '')
    sheetPaths.set(decodeXmlText(name), normalizedTarget.startsWith('xl/') ? normalizedTarget : `xl/${normalizedTarget}`)
  }

  for (const [key, target] of mapping) {
    if (target.kind !== 'formula-cache') continue
    const sheetPath = sheetPaths.get(target.sheet)
    const sheetXmlBytes = sheetPath ? archive[sheetPath] : undefined
    if (!sheetXmlBytes) throw new Error(`导出后的公式缓存校验失败：${key}`)
    const address = target.address.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const cell = strFromU8(sheetXmlBytes).match(new RegExp(`<c\\b(?=[^>]*\\br=["']${address}["'])[^>]*>[\\s\\S]*?<\\/c>`, 'i'))?.[0]
    const hasFormula = Boolean(cell && /<f(?:\s[^>]*)?>[\s\S]*?<\/f>|<f(?:\s[^>]*)?\/>/i.test(cell))
    const hasCachedValue = Boolean(cell && /<v(?:\s[^>]*)?>[\s\S]*?<\/v>|<v(?:\s[^>]*)?\/>/i.test(cell))
    if (!hasFormula || !hasCachedValue) throw new Error(`导出后的公式缓存校验失败：${key}`)
  }
}

export async function downloadXlsx(workbook: Workbook, filename: string): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer()
  await verifyFullCalculationOnLoad(buffer)
  const ExcelJS = await import('exceljs')
  const verified = new ExcelJS.Workbook()
  await verified.xlsx.load(buffer)
  if (verified.worksheets.length !== 6) throw new Error('导出后的角色卡工作表结构不完整。')
  await verifyFormulaCaches(buffer, readFieldMapping(verified))
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
