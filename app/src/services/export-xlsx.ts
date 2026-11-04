import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'

import { formatExportCantripScaling, formatExportResources, formatSigned, type CharacterExportModel, type ExportDiagnostic } from '@/features/character-export/build-export-data'
import {
  CHARACTER_SHEET_OFFLINE_MESSAGE,
  CHARACTER_SHEET_XLSX_TEMPLATE_URLS,
  type CharacterSheetXlsxTemplateId,
} from '@/services/character-sheet-templates'

export const CHARACTER_SHEET_TEMPLATE_VERSION = 4

export type TemplateFieldKind = 'input' | 'formula-cache' | 'value'
export type TemplateFieldRequirement = 'required' | 'conditional' | 'optional'

export interface TemplateFieldTarget {
  readonly sheet: string
  readonly address: string
  readonly kind: TemplateFieldKind
  readonly requirement: TemplateFieldRequirement
}

export interface XlsxTemplateMapping {
  readonly version: number
  readonly targets: ReadonlyMap<string, TemplateFieldTarget>
}

export interface XlsxFillResult {
  readonly bytes: Uint8Array
  readonly diagnostics: readonly ExportDiagnostic[]
}

const XML_ENTITIES: Readonly<Record<string, string>> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
}

function decodeXmlText(value: string): string {
  return value.replace(/&(?:#(\d+)|#x([\da-f]+)|amp|lt|gt|quot|apos);/gi, (entity, decimal: string | undefined, hexadecimal: string | undefined) => {
    if (decimal) return String.fromCodePoint(Number(decimal))
    if (hexadecimal) return String.fromCodePoint(Number.parseInt(hexadecimal, 16))
    return XML_ENTITIES[entity.toLowerCase()] ?? entity
  })
}

function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function textContent(xml: string): string {
  return decodeXmlText([...xml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((match) => match[1]).join(''))
}

function workbookSheets(archive: Record<string, Uint8Array>): ReadonlyMap<string, string> {
  const workbook = archive['xl/workbook.xml']
  const relationships = archive['xl/_rels/workbook.xml.rels']
  if (!workbook || !relationships) throw new Error('角色卡模板结构不完整。')

  const relationshipMap = new Map<string, string>()
  for (const match of strFromU8(relationships).matchAll(/<Relationship\b[^>]*>/g)) {
    const id = match[0].match(/\bId="([^"]+)"/)?.[1]
    const target = match[0].match(/\bTarget="([^"]+)"/)?.[1]
    if (id && target) relationshipMap.set(id, target)
  }

  const sheets = new Map<string, string>()
  for (const match of strFromU8(workbook).matchAll(/<sheet\b[^>]*>/g)) {
    const name = match[0].match(/\bname="([^"]*)"/)?.[1]
    const relationshipId = match[0].match(/\br:id="([^"]+)"/)?.[1]
    const target = relationshipId ? relationshipMap.get(relationshipId) : undefined
    if (!name || !target) continue
    const normalized = target.replace(/^\//, '')
    sheets.set(decodeXmlText(name), normalized.startsWith('xl/') ? normalized : `xl/${normalized}`)
  }
  return sheets
}

function sharedStrings(archive: Record<string, Uint8Array>): readonly string[] {
  const bytes = archive['xl/sharedStrings.xml']
  if (!bytes) return []
  return [...strFromU8(bytes).matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((match) => textContent(match[1]))
}

function cellValue(cellTag: string, strings: readonly string[]): string | boolean | number | undefined {
  if (/<f\b/.test(cellTag)) {
    const cached = cellTag.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1]
    return cached === undefined ? undefined : decodeXmlText(cached)
  }
  const type = cellTag.match(/\bt="([^"]*)"/)?.[1]
  if (type === 'inlineStr') {
    const inner = cellTag.match(/<is\b[^>]*>([\s\S]*?)<\/is>/)?.[1]
    return inner === undefined ? '' : textContent(inner)
  }
  const raw = cellTag.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1]
  if (raw === undefined) return undefined
  if (type === 's') return strings[Number(raw)] ?? ''
  if (type === 'b') return raw === '1'
  if (type === 'str' || type === 'e') return decodeXmlText(raw)
  const number = Number(raw)
  return Number.isFinite(number) ? number : decodeXmlText(raw)
}

interface MappingRow {
  readonly row: number
  readonly cells: ReadonlyMap<string, string | boolean | number | undefined>
}

function parseSheetRows(xml: string, strings: readonly string[]): readonly MappingRow[] {
  const rows: MappingRow[] = []
  for (const rowMatch of xml.matchAll(/<row\b[^>]*\br="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = new Map<string, string | boolean | number | undefined>()
    for (const cellMatch of rowMatch[2].matchAll(/<c\b[^>]*\br="([A-Z]+)\d+"[^>]*?(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      cells.set(cellMatch[1], cellValue(cellMatch[0], strings))
    }
    rows.push({ row: Number(rowMatch[1]), cells })
  }
  return rows
}

function readMappingFromArchive(archive: Record<string, Uint8Array>): XlsxTemplateMapping {
  const sheets = workbookSheets(archive)
  const mappingPath = sheets.get('字段映射')
  if (!mappingPath) throw new Error('角色卡模板缺少「字段映射」工作表。')
  const mappingXml = archive[mappingPath]
  if (!mappingXml) throw new Error('角色卡模板的「字段映射」工作表不可读取。')
  const mappingText = strFromU8(mappingXml)
  // 运行时模板的映射表使用 inlineStr；只有用户用 Excel 另存后才可能出现共享字符串。
  const strings = mappingText.includes('t="s"') ? sharedStrings(archive) : []
  const rows = parseSheetRows(mappingText, strings)
  const header = rows.find((row) => row.row === 1)
  if (header?.cells.get('I') !== CHARACTER_SHEET_TEMPLATE_VERSION) throw new Error('角色卡模板版本不兼容，请刷新页面后重试。')

  const targets = new Map<string, TemplateFieldTarget>()
  const targetIds = new Set<string>()
  for (const row of rows) {
    if (row.row === 1) continue
    const key = row.cells.get('A')
    const sheet = row.cells.get('B')
    const address = row.cells.get('C')
    if (typeof key !== 'string' || typeof sheet !== 'string' || typeof address !== 'string' || !key || !sheet || !address) continue
    if (targets.has(key)) throw new Error(`角色卡模板字段重复：${key}`)
    const targetId = `${sheet}!${address}`
    if (targetIds.has(targetId)) throw new Error(`角色卡模板目标重复：${targetId}`)
    const kindValue = row.cells.get('E')
    const requirementValue = row.cells.get('F')
    const kind: TemplateFieldKind = kindValue === 'formula-cache' || kindValue === 'value' ? kindValue : 'input'
    const requirement: TemplateFieldRequirement = requirementValue === 'required' || requirementValue === 'conditional' ? requirementValue : 'optional'
    targets.set(key, { sheet, address, kind, requirement })
    targetIds.add(targetId)
  }
  if (!targets.size) throw new Error('角色卡模板「字段映射」工作表为空。')
  return { version: CHARACTER_SHEET_TEMPLATE_VERSION, targets }
}

export function readXlsxTemplateMapping(templateBytes: Uint8Array): XlsxTemplateMapping {
  return readMappingFromArchive(unzipSync(templateBytes))
}

function cellXmlForValue(address: string, styleAttribute: string, value: string | number | boolean): string {
  if (typeof value === 'boolean') return `<c r="${address}"${styleAttribute} t="b"><v>${value ? 1 : 0}</v></c>`
  if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${address}"${styleAttribute}><v>${value}</v></c>`
  return `<c r="${address}"${styleAttribute} t="inlineStr"><is><t xml:space="preserve">${escapeXmlText(String(value))}</t></is></c>`
}

function patchCell(sheetXml: string, address: string, value: string | number | boolean, kind: TemplateFieldKind): string {
  const escapedAddress = address.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`<c\\b(?=[^>]*\\br="${escapedAddress}")([^>]*?)(?:/>|>([\\s\\S]*?)<\\/c>)`)
  const match = pattern.exec(sheetXml)
  if (!match) throw new Error(`模板缺少目标单元格：${address}`)
  const attributes = match[1]
  const inner = match[2] ?? ''
  const hasFormula = /<f\b/.test(inner)
  if (kind === 'input' && hasFormula) throw new Error(`输入字段错误指向公式单元格：${address}`)
  if (kind === 'formula-cache' && !hasFormula) throw new Error(`公式缓存目标不是公式单元格：${address}`)
  const style = attributes.match(/\bs="(\d+)"/)?.[1]
  const styleAttribute = style ? ` s="${style}"` : ''
  let replacement: string
  if (kind === 'formula-cache') {
    const formula = inner.match(/<f\b[^>]*>[\s\S]*?<\/f>|<f\b[^>]*\/>/)?.[0]
    if (!formula) throw new Error(`公式缓存目标不是公式单元格：${address}`)
    const stringResult = typeof value === 'string'
    replacement = `<c r="${address}"${styleAttribute}${stringResult ? ' t="str"' : ''}>${formula}<v>${escapeXmlText(String(value))}</v></c>`
  } else {
    replacement = cellXmlForValue(address, styleAttribute, value)
  }
  return sheetXml.slice(0, match.index) + replacement + sheetXml.slice(match.index + match[0].length)
}

function setFullCalcOnLoad(workbookXml: string): string {
  const calcPr = /<calcPr\b([^>]*)\/>/.exec(workbookXml)
  if (calcPr) {
    let attributes = calcPr[1]
    attributes = attributes.replace(/\s*\bfullCalcOnLoad="[^"]*"/g, '').replace(/\s*\bcalcMode="[^"]*"/g, '')
    return workbookXml.replace(calcPr[0], `<calcPr${attributes} fullCalcOnLoad="1" calcMode="auto"/>`)
  }
  return workbookXml.replace('</workbook>', '<calcPr fullCalcOnLoad="1" calcMode="auto"/></workbook>')
}

const SKILL_ABILITY: Readonly<Record<string, 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'>> = {
  'skill-athletics': 'str',
  'skill-acrobatics': 'dex',
  'skill-sleight-of-hand': 'dex',
  'skill-stealth': 'dex',
  'skill-investigation': 'int',
  'skill-arcana': 'int',
  'skill-history': 'int',
  'skill-nature': 'int',
  'skill-religion': 'int',
  'skill-perception': 'wis',
  'skill-insight': 'wis',
  'skill-animal-handling': 'wis',
  'skill-medicine': 'wis',
  'skill-survival': 'wis',
  'skill-persuasion': 'cha',
  'skill-deception': 'cha',
  'skill-intimidation': 'cha',
  'skill-performance': 'cha',
}

/** 自动卡写入值：模板公式负责最后一步派生，这里只写输入与误差修正。 */
export function buildAutoCardValues(model: CharacterExportModel, templateId: CharacterSheetXlsxTemplateId): Record<string, string | number | boolean> {
  const values: Record<string, string | number | boolean> = {
    character_name: model.identity.characterName,
    player_name: model.identity.playerName,
    class_name: model.identity.classRows.length > 1 ? model.identity.classLevel : model.identity.className,
    race: model.identity.raceName,
    background: model.identity.backgroundName,
    alignment: model.identity.alignment,
    experience: model.identity.experience,
    level: model.identity.level,
    backstory: model.profile.backstory,
    other_proficiencies_languages: model.proficiencies.text,
    ac_misc: model.combat.armorClass - 10 - model.abilities.dex.modifier,
    initiative: model.combat.initiative,
    initiative_misc: model.combat.initiative - model.abilities.dex.modifier,
    hp_max: model.combat.hitPointMaximum,
    hp_current: model.combat.hitPointCurrent,
    hp_temp: model.combat.hitPointTemporary,
    speed: templateId === '2014' ? `${model.combat.speed}尺` : model.combat.speed,
    hit_dice_total: Number(model.combat.hitDiceTotal.match(/^\d+/)?.[0] ?? model.identity.level),
    hit_dice_die: model.combat.hitDice.match(/d\d+/)?.[0] ?? '',
    cp: model.currency.cp,
    sp: model.currency.sp,
    ep: model.currency.ep,
    gp: model.currency.gp,
    pp: model.currency.pp,
  }

  for (const ability of Object.values(model.abilities)) {
    values[`${ability.key}_score`] = ability.score
    values[`save_${ability.key}_prof`] = templateId === '2024'
      ? (ability.savingThrowProficient ? 'O' : 'X')
      : ability.savingThrowProficient
    values[`save_${ability.key}_misc`] = ability.savingThrow - ability.modifier - (ability.savingThrowProficient ? model.combat.proficiencyBonus : 0)
  }

  for (const skill of model.skills) {
    const field = skill.id.replace(/^skill-/, '').replace(/-/g, '_')
    const base = model.abilities[SKILL_ABILITY[skill.id] ?? 'str'].modifier
    const templateProficiencyExtra = templateId === '2014'
      ? (skill.proficiency === 'none' ? 0 : model.combat.proficiencyBonus)
      : skill.proficiency === 'proficient' ? model.combat.proficiencyBonus : skill.proficiency === 'expertise' ? model.combat.proficiencyBonus * 2 : 0
    values[`skill_${field}_prof`] = templateId === '2024'
      ? (skill.proficiency === 'expertise' ? '❂' : skill.proficiency === 'proficient' ? 'O' : 'X')
      : skill.proficiency !== 'none'
    values[`skill_${field}_misc`] = skill.value - base - templateProficiencyExtra
  }

  const featureCapacity = templateId === '2024' ? 5 : 10
  const featureEntries = [
    ...model.features.map((feature) => ({ name: feature.name, description: feature.summary.replace(/\s+/g, ' ').trim() })),
    ...(model.resources.length ? [{ name: '资源', description: model.resources.map((resource) => `${resource.name} ${resource.max}${resource.unit}`).join('；') }] : []),
    ...(model.cantrips.length ? [{ name: '戏法成长', description: model.cantrips.map((cantrip) => `${cantrip.name}：${cantrip.scaling}`).join('；') }] : []),
  ]
  featureEntries.slice(0, featureCapacity).forEach((entry, index) => {
    values[`feature_${index + 1}_name`] = entry.name
    values[`feature_${index + 1}_desc`] = entry.description
  })

  const itemCapacity = templateId === '2024' ? 10 : 9
  model.inventory.slice(0, itemCapacity).forEach((item, index) => {
    values[`item_${index + 1}`] = `${item.name} × ${item.quantity}${item.equippedQuantity ? '（已装备）' : ''}`
  })

  const attackCapacity = templateId === '2024' ? 3 : 4
  model.attacks.slice(0, attackCapacity).forEach((attack, index) => {
    values[`attack_${index + 1}_name`] = attack.name
    values[`attack_${index + 1}_bonus`] = formatSigned(attack.attackBonus)
    values[`attack_${index + 1}_damage`] = attack.damage
    values[`attack_${index + 1}_type`] = attack.damage.match(/[\u4e00-\u9fff]+$/u)?.[0] ?? ''
  })

  if (templateId === '2014') {
    for (let level = 1; level <= 9; level += 1) {
      const slots = model.spellcasting?.slots.filter((slot) => slot.level === level) ?? []
      values[`spell_slot_${level}`] = (slots.find((slot) => !slot.pact) ?? slots[0])?.count ?? 0
    }
    model.spellcasting?.spells.slice(0, 30).forEach((spell, index) => {
      values[`spell_${index + 1}`] = spell.name
    })
  }
  return values
}


// ---------------------------------------------------------------------------
// 旧版 6 表模板的字段值构造器（仅测试/迁移参考使用）。
// 运行时自动卡已改为读取模板自带「字段映射」并由 buildAutoCardValues 写入。
// ---------------------------------------------------------------------------

const LEGACY_SKILL_FIELDS: Readonly<Record<string, string>> = {
  'skill-acrobatics': 'skill_acrobatics', 'skill-animal-handling': 'skill_animal_handling', 'skill-arcana': 'skill_arcana',
  'skill-athletics': 'skill_athletics', 'skill-deception': 'skill_deception', 'skill-history': 'skill_history',
  'skill-insight': 'skill_insight', 'skill-intimidation': 'skill_intimidation', 'skill-investigation': 'skill_investigation',
  'skill-medicine': 'skill_medicine', 'skill-nature': 'skill_nature', 'skill-perception': 'skill_perception',
  'skill-performance': 'skill_performance', 'skill-persuasion': 'skill_persuasion', 'skill-religion': 'skill_religion',
  'skill-sleight-of-hand': 'skill_sleight_of_hand', 'skill-stealth': 'skill_stealth', 'skill-survival': 'skill_survival',
}

function legacyCompactFeature(feature: CharacterExportModel['features'][number]): string {
  const summary = feature.summary.replace(/\s+/g, ' ').trim()
  return summary ? `${feature.name}：${summary}` : feature.name
}

function legacySplitFeatureText(model: CharacterExportModel): { primary: string; additional: string; truncated: boolean } {
  const entries = [
    ...model.features.map(legacyCompactFeature),
    ...(model.resources.length ? [formatExportResources(model.resources)] : []),
    ...(model.cantrips.length ? [formatExportCantripScaling(model.cantrips, model.identity.level)] : []),
  ]
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

/** 旧版 6 表模板的 56+ 字段值；新自动卡不再使用，保留给导出数据回归测试。 */
export function buildXlsxFieldValues(model: CharacterExportModel): { values: Record<string, string | number>; diagnostics: ExportDiagnostic[] } {
  const featureText = legacySplitFeatureText(model)
  const diagnostics: ExportDiagnostic[] = [...model.diagnostics]
  if (featureText.truncated) diagnostics.push({ code: 'content-truncated', severity: 'warning', field: 'features', message: '部分特性因模板容量被省略。' })
  if (model.attacks.length > 4) diagnostics.push({ code: 'content-truncated', severity: 'warning', field: 'attacks', message: '模板最多显示四个攻击，额外攻击已省略。' })

  const values: Record<string, string | number> = {
    character_name: model.identity.characterName,
    class_name: model.identity.classRows.length > 1 ? model.identity.classLevel : model.identity.className,
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
    spellcasting_class: model.spellcasting ? [model.spellcasting.className, model.spellcasting.pactNote].filter(Boolean).join('；') : '',
    spellcasting_ability: model.spellcasting?.abilityLabel ?? '',
    proficiency_bonus: model.combat.proficiencyBonus,
    initiative: model.combat.initiative,
    passive_perception: model.combat.passivePerception,
    spell_save_dc: model.spellcasting?.saveDc ?? '',
    spell_attack_bonus: model.spellcasting?.attackBonus ?? '',
    cp: model.currency.cp, sp: model.currency.sp, ep: model.currency.ep, gp: model.currency.gp, pp: model.currency.pp,
    profile_character_name: model.identity.characterName,
    profile_class_level: model.identity.classRows.length > 1 ? model.identity.classLevel : `${model.identity.className} ${model.identity.level}`.trim(),
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
    const field = LEGACY_SKILL_FIELDS[skill.id]
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
  for (let level = 1; level <= 9; level += 1) {
    const slots = model.spellcasting?.slots.filter((slot) => slot.level === level) ?? []
    const general = slots.find((slot) => !slot.pact)
    values[`spell_slot_${level}_total`] = (general ?? slots[0])?.count ?? 0
  }
  const spellCapacities = [8, 10, 10, 10, 10, 10, 10, 10, 10, 10]
  for (let level = 0; level <= 9; level += 1) {
    const spells = model.spellcasting?.spells.filter((spell) => spell.level === level) ?? []
    if (spells.length > spellCapacities[level]) diagnostics.push({ code: 'content-truncated', severity: 'warning', field: `spells.${level}`, message: `${level} 环法术超过模板容量，额外法术已省略。` })
    spells.slice(0, spellCapacities[level]).forEach((spell, index) => {
      values[`spell_${level}_${index + 1}_prepared`] = spell.prepared ? '●' : ''
      values[`spell_${level}_${index + 1}_name`] = spell.className ? `${spell.name}（${spell.className}）` : spell.name
    })
  }
  return { values, diagnostics }
}

export async function loadCharacterSheetTemplate(templateId: CharacterSheetXlsxTemplateId): Promise<Uint8Array> {
  const response = await fetch(CHARACTER_SHEET_XLSX_TEMPLATE_URLS[templateId]).catch(() => undefined)
  if (!response) throw new Error(CHARACTER_SHEET_OFFLINE_MESSAGE)
  if (!response.ok) throw new Error(`角色卡模板加载失败（${response.status}）`)
  return new Uint8Array(await response.arrayBuffer())
}

export function fillCharacterSheetTemplate(templateBytes: Uint8Array, model: CharacterExportModel, templateId: CharacterSheetXlsxTemplateId): XlsxFillResult {
  const archive = unzipSync(templateBytes)
  const sheets = workbookSheets(archive)
  const mapping = readMappingFromArchive(archive)
  const values = buildAutoCardValues(model, templateId)
  const diagnostics: ExportDiagnostic[] = [...model.diagnostics]
  const sheetXml = new Map<string, string>()

  for (const [key, target] of mapping.targets) {
    const value = values[key]
    if (value === undefined) {
      if (target.requirement === 'required') diagnostics.push({ code: 'missing-template-field', severity: 'error', field: key, message: `缺少必填导出值：${key}` })
      continue
    }
    const sheetPath = sheets.get(target.sheet)
    if (!sheetPath || !archive[sheetPath]) {
      diagnostics.push({ code: 'invalid-template-target', severity: 'error', field: key, message: `模板工作表不存在：${target.sheet}` })
      continue
    }
    if (!/^[A-Z]{1,3}[1-9]\d*$/.test(target.address)) {
      diagnostics.push({ code: 'invalid-template-target', severity: 'error', field: key, message: `模板单元格地址无效：${target.sheet}!${target.address}` })
      continue
    }
    try {
      const current = sheetXml.get(sheetPath) ?? strFromU8(archive[sheetPath])
      sheetXml.set(sheetPath, patchCell(current, target.address, value, target.kind))
    } catch (error) {
      diagnostics.push({ code: 'invalid-template-target', severity: 'error', field: key, message: error instanceof Error ? error.message : String(error) })
    }
  }

  if (templateId === '2024' && model.spellcasting?.spells.length) {
    diagnostics.push({ code: 'unsupported-template-field', severity: 'warning', field: 'spells', message: '2024 自动卡暂不写入法术列表；请在该卡「施法」页自行选择法术。' })
  }
  if (templateId === '2024' && model.spellcasting) {
    diagnostics.push({ code: 'unsupported-template-field', severity: 'warning', field: 'spell_slots', message: '2024 自动卡暂不写入法术位总数；该卡会按职业与等级自动计算。' })
  }
  if (model.attacks.length > (templateId === '2024' ? 3 : 4)) diagnostics.push({ code: 'content-truncated', severity: 'warning', field: 'attacks', message: '自动卡攻击栏不足，额外攻击已省略。' })
  if (model.inventory.length > (templateId === '2024' ? 10 : 9)) diagnostics.push({ code: 'content-truncated', severity: 'warning', field: 'inventory', message: '自动卡物品栏不足，额外物品已省略。' })
  if (model.features.length > (templateId === '2024' ? 5 : 10)) diagnostics.push({ code: 'content-truncated', severity: 'warning', field: 'features', message: '自动卡特性栏不足，额外特性已省略。' })

  if (diagnostics.some((item) => item.severity === 'error')) return { bytes: templateBytes, diagnostics }

  for (const [path, xml] of sheetXml) archive[path] = strToU8(xml)
  archive['xl/workbook.xml'] = strToU8(setFullCalcOnLoad(strFromU8(archive['xl/workbook.xml'])))
  return { bytes: zipSync(archive, { level: 6 }), diagnostics }
}

export function verifyXlsxOutput(bytes: Uint8Array): void {
  let archive: Record<string, Uint8Array>
  try {
    archive = unzipSync(bytes)
  } catch {
    throw new Error('导出后的角色卡不是有效的 XLSX 文件。')
  }
  if (!archive['xl/workbook.xml']) throw new Error('导出后的角色卡工作表结构不完整。')
  const workbookXml = strFromU8(archive['xl/workbook.xml'])
  if (!/<calcPr\b[^>]*\bfullCalcOnLoad="1"/.test(workbookXml)) throw new Error('导出后的角色卡未启用打开时完整重算。')
  const sheets = workbookSheets(archive)
  if (!sheets.has('字段映射')) throw new Error('导出后的角色卡缺少字段映射表。')
  if (archive['xl/vbaProject.bin']) throw new Error('2024 自动卡仍包含宏，无法作为 xlsx 导出。')
}

export function downloadXlsx(bytes: Uint8Array, filename: string): void {
  verifyXlsxOutput(bytes)
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
