import type { PDFCheckBox, PDFField, PDFFont, PDFForm, PDFTextField } from 'pdf-lib'

import { baseUrl } from '@/config/site'

import { formatSigned, type CharacterExportModel, type ExportDiagnostic } from '@/features/character-export/build-export-data'
import type { AbilityKey } from '@/types/character'

export const CHARACTER_SHEET_PDF_TEMPLATE_URL = `${baseUrl}templates/character-sheet-zh-plus.pdf`
export const PDF_FONT_URL = `${baseUrl}templates/fonts/noto-sans-sc-subset.ttf`
export const CHARACTER_SHEET_PDF_MAPPING_VERSION = 6

const TEXT_PADDING = 4
const DEFAULT_LINE_HEIGHT_RATIO = 1.2
const CLOSING_PUNCTUATION = new Set(Array.from('，。！？；：、）》】}〉”’…'))
const OPENING_PUNCTUATION = new Set(Array.from('（《【{〈“‘'))

const ABILITY_FIELD_NAMES: Readonly<Record<AbilityKey, { readonly score: readonly string[]; readonly modifier: readonly string[]; readonly save: readonly string[]; readonly saveCheck: readonly string[] }>> = {
  str: { score: ['STR'], modifier: ['STRmod'], save: ['ST Strength'], saveCheck: ['Check Box 11'] },
  dex: { score: ['DEX'], modifier: ['DEXmod '], save: ['ST Dexterity'], saveCheck: ['Check Box 18'] },
  con: { score: ['CON'], modifier: ['CONmod'], save: ['ST Constitution'], saveCheck: ['Check Box 19'] },
  int: { score: ['INT'], modifier: ['INTmod'], save: ['ST Intelligence'], saveCheck: ['Check Box 20'] },
  wis: { score: ['WIS'], modifier: ['WISmod'], save: ['ST Wisdom'], saveCheck: ['Check Box 21'] },
  cha: { score: ['CHA'], modifier: ['CHamod'], save: ['ST Charisma'], saveCheck: ['Check Box 22'] },
}

const SKILL_FIELDS: Readonly<Record<string, { readonly value: readonly string[]; readonly check: readonly string[] }>> = {
  'skill-acrobatics': { value: ['Acrobatics'], check: ['Check Box 23'] },
  'skill-animal-handling': { value: ['Animal'], check: ['Check Box 24'] },
  'skill-arcana': { value: ['Arcana'], check: ['Check Box 25'] },
  'skill-athletics': { value: ['Athletics'], check: ['Check Box 26'] },
  'skill-deception': { value: ['Deception '], check: ['Check Box 27'] },
  'skill-history': { value: ['History '], check: ['Check Box 28'] },
  'skill-insight': { value: ['Insight'], check: ['Check Box 29'] },
  'skill-intimidation': { value: ['Intimidation'], check: ['Check Box 30'] },
  'skill-investigation': { value: ['Investigation '], check: ['Check Box 31'] },
  'skill-medicine': { value: ['Medicine'], check: ['Check Box 32'] },
  'skill-nature': { value: ['Nature'], check: ['Check Box 33'] },
  'skill-perception': { value: ['Perception '], check: ['Check Box 34'] },
  'skill-performance': { value: ['Performance'], check: ['Check Box 35'] },
  'skill-persuasion': { value: ['Persuasion'], check: ['Check Box 36'] },
  'skill-religion': { value: ['Religion'], check: ['Check Box 37'] },
  'skill-sleight-of-hand': { value: ['SleightofHand'], check: ['Check Box 38'] },
  'skill-stealth': { value: ['Stealth '], check: ['Check Box 39'] },
  'skill-survival': { value: ['Survival'], check: ['Check Box 40'] },
}

const ATTACK_FIELDS = [
  { name: ['Wpn Name'], bonus: ['Wpn1 AtkBonus'], damage: ['Wpn1 Damage'] },
  { name: ['Wpn Name 2'], bonus: ['Wpn2 AtkBonus '], damage: ['Wpn2 Damage '] },
  { name: ['Wpn Name 3'], bonus: ['Wpn3 AtkBonus  '], damage: ['Wpn3 Damage '] },
] as const

export interface PdfBuildResult { readonly bytes: Uint8Array; readonly diagnostics: readonly ExportDiagnostic[] }

type FormField = PDFField

function pdfFieldType(field: PDFField): string {
  return field.acroField.FT().asString().replace(/^\//, '')
}

function isTextField(field: PDFField): field is PDFTextField {
  return pdfFieldType(field) === 'Tx'
}

function isCheckBox(field: PDFField): field is PDFCheckBox {
  return pdfFieldType(field) === 'Btn'
    && 'check' in field
    && typeof field.check === 'function'
    && 'uncheck' in field
    && typeof field.uncheck === 'function'
}

function normalizeFieldName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US')
}

function fieldIndex(form: PDFForm): ReadonlyMap<string, FormField> {
  const result = new Map<string, FormField>()
  for (const field of form.getFields() as FormField[]) {
    const key = normalizeFieldName(field.getName())
    if (!result.has(key)) result.set(key, field)
  }
  return result
}

function findField(index: ReadonlyMap<string, FormField>, candidates: readonly string[]): FormField | undefined {
  for (const candidate of candidates) {
    const field = index.get(normalizeFieldName(candidate))
    if (field) return field
  }
  return undefined
}

function diagnostic(diagnostics: ExportDiagnostic[], severity: 'warning' | 'error', code: 'missing-template-field' | 'invalid-template-target' | 'content-truncated', field: string, message: string): void {
  diagnostics.push({ code, severity, field, message })
}

function textField(index: ReadonlyMap<string, FormField>, candidates: readonly string[], logicalField: string, diagnostics: ExportDiagnostic[], required = true): PDFTextField | undefined {
  const field = findField(index, candidates)
  if (!field) {
    if (required) diagnostic(diagnostics, 'error', 'missing-template-field', logicalField, `PDF 模板缺少必需字段：${logicalField}。`)
    return undefined
  }
  if (!isTextField(field)) {
    diagnostic(diagnostics, 'error', 'invalid-template-target', logicalField, `PDF 模板字段 ${field.getName()} 不是文本字段。`)
    return undefined
  }
  const textField = field
  if (textField.getMaxLength() !== undefined) textField.removeMaxLength()
  return textField
}

function setText(index: ReadonlyMap<string, FormField>, candidates: readonly string[], value: string | number, logicalField: string, diagnostics: ExportDiagnostic[], required = true, fontSize?: number): PDFTextField | undefined {
  const field = textField(index, candidates, logicalField, diagnostics, required)
  if (!field) return undefined
  if (fontSize !== undefined) setFieldFontSize(field, fontSize)
  field.setText(String(value))
  return field
}

function setCheck(index: ReadonlyMap<string, FormField>, candidates: readonly string[], checked: boolean, logicalField: string, diagnostics: ExportDiagnostic[], required = true): PDFCheckBox | undefined {
  const field = findField(index, candidates)
  if (!field) {
    if (required) diagnostic(diagnostics, 'error', 'missing-template-field', logicalField, `PDF 模板缺少必需复选框：${logicalField}。`)
    return undefined
  }
  if (!isCheckBox(field)) {
    diagnostic(diagnostics, 'error', 'invalid-template-target', logicalField, `PDF 模板字段 ${field.getName()} 不是复选框。`)
    return undefined
  }
  const checkBox = field
  if (checked) checkBox.check()
  else checkBox.uncheck()
  return checkBox
}

function fieldRectangle(field: PDFTextField): { readonly width: number; readonly height: number } | undefined {
  return field.acroField.getWidgets()[0]?.getRectangle()
}

function setFieldFontSize(field: PDFTextField, fontSize: number): void {
  if (!field.acroField.getDefaultAppearance()) field.acroField.setDefaultAppearance(`/Helvetica ${fontSize} Tf 0 g`)
  else field.setFontSize(fontSize)
}

function textWidth(font: PDFFont, value: string, fontSize: number): number {
  return font.widthOfTextAtSize(value, fontSize)
}

function pushWrappedLine(lines: string[], value: string, carry: { value: string }): void {
  let line = value
  let next = carry.value
  const lineCharacters = Array.from(line)
  const finalCharacter = lineCharacters[lineCharacters.length - 1]
  if (finalCharacter && OPENING_PUNCTUATION.has(finalCharacter)) {
    line = Array.from(line).slice(0, -1).join('')
    next = `${finalCharacter}${next}`
  }
  lines.push(line)
  carry.value = next
}

/** 按嵌入字体的实际宽度为中英文混排文本插入换行。 */
export function wrapPdfText(value: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const lines: string[] = []
  for (const paragraph of value.replace(/\r\n?/g, '\n').split('\n')) {
    if (!paragraph) {
      lines.push('')
      continue
    }
    let current = ''
    for (const character of Array.from(paragraph)) {
      if (!current || textWidth(font, `${current}${character}`, fontSize) <= maxWidth) {
        current += character
        continue
      }
      const carry = { value: character }
      if (CLOSING_PUNCTUATION.has(character) && Array.from(current).length > 1) {
        const glyphs = Array.from(current)
        carry.value = `${glyphs.pop() ?? ''}${character}`
        current = glyphs.join('')
      }
      pushWrappedLine(lines, current, carry)
      current = carry.value
    }
    if (current) lines.push(current)
  }
  return lines
}

function ellipsizeLine(value: string, font: PDFFont, fontSize: number, maxWidth: number): string {
  let result = value
  while (result && textWidth(font, `${result}…`, fontSize) > maxWidth) result = Array.from(result).slice(0, -1).join('')
  return `${result}…`
}

function fieldLineCapacity(field: PDFTextField, fontSize: number): number {
  const rectangle = fieldRectangle(field)
  return rectangle ? Math.max(1, Math.floor((rectangle.height - TEXT_PADDING) / (fontSize * DEFAULT_LINE_HEIGHT_RATIO))) : 1
}

function fieldTextWidth(field: PDFTextField): number {
  return Math.max(1, (fieldRectangle(field)?.width ?? 1) - TEXT_PADDING)
}

function truncateLines(lines: readonly string[], capacity: number, font: PDFFont, fontSize: number, maxWidth: number): readonly string[] {
  if (lines.length <= capacity) return lines
  const visible = lines.slice(0, capacity)
  visible[visible.length - 1] = ellipsizeLine(visible[visible.length - 1] ?? '', font, fontSize, maxWidth)
  return visible
}

function setWrappedText(field: PDFTextField, value: string, font: PDFFont, fontSize: number, logicalField: string, diagnostics: ExportDiagnostic[]): void {
  field.enableMultiline()
  setFieldFontSize(field, fontSize)
  const width = fieldTextWidth(field)
  const lines = wrapPdfText(value, font, fontSize, width)
  const capacity = fieldLineCapacity(field, fontSize)
  const visible = truncateLines(lines, capacity, font, fontSize, width)
  if (visible.length < lines.length) {
    diagnostic(diagnostics, 'warning', 'content-truncated', logicalField, `${logicalField} 超出 PDF 模板容量，已省略 ${lines.length - visible.length} 行。`)
  }
  field.setText(visible.join('\n'))
}

function setWrappedField(index: ReadonlyMap<string, FormField>, candidates: readonly string[], value: string, font: PDFFont, fontSize: number, logicalField: string, diagnostics: ExportDiagnostic[], required = true): PDFTextField | undefined {
  const field = textField(index, candidates, logicalField, diagnostics, required)
  if (field) setWrappedText(field, value, font, fontSize, logicalField, diagnostics)
  return field
}

function setSingleLineText(field: PDFTextField, value: string, font: PDFFont, fontSize: number, logicalField: string, diagnostics: ExportDiagnostic[]): void {
  field.disableMultiline()
  setFieldFontSize(field, fontSize)
  const width = fieldTextWidth(field)
  const clipped = textWidth(font, value, fontSize) > width
  field.setText(clipped ? ellipsizeLine(value, font, fontSize, width) : value)
  if (clipped) diagnostic(diagnostics, 'warning', 'content-truncated', logicalField, `${logicalField} 超出 PDF 字段宽度，已省略尾部内容。`)
}

interface TreasureLine {
  readonly text: string
  readonly itemIndexes: ReadonlySet<number>
}

export interface PdfTreasureLayout {
  readonly text: string
  readonly omittedCount: number
}

function markTreasureOverflow(line: TreasureLine, omittedItemIndexes: Set<number>, font: PDFFont, fontSize: number, maxWidth: number): string {
  let value = line.text
  const lineItemIndexes = [...line.itemIndexes]
  while (value.includes('  ') && textWidth(font, `${value}…`, fontSize) > maxWidth) {
    value = value.slice(0, value.lastIndexOf('  '))
    const omittedIndex = lineItemIndexes.pop()
    if (omittedIndex !== undefined) omittedItemIndexes.add(omittedIndex)
  }
  if (textWidth(font, `${value}…`, fontSize) <= maxWidth) return `${value}…`
  lineItemIndexes.forEach((itemIndex) => omittedItemIndexes.add(itemIndex))
  return ellipsizeLine(value, font, fontSize, maxWidth)
}

/** 以完整物品条目为单位横向排列，条目之间固定使用两个 ASCII 空格。 */
export function layoutPdfTreasureItems(items: readonly string[], font: PDFFont, fontSize: number, maxWidth: number, maxLines: number): PdfTreasureLayout {
  const lines: TreasureLine[] = []
  let currentText = ''
  let currentIndexes = new Set<number>()

  const flush = (): void => {
    if (!currentText) return
    lines.push({ text: currentText, itemIndexes: new Set(currentIndexes) })
    currentText = ''
    currentIndexes = new Set<number>()
  }

  items.forEach((item, itemIndex) => {
    const candidate = currentText ? `${currentText}  ${item}` : item
    if (textWidth(font, candidate, fontSize) <= maxWidth) {
      currentText = candidate
      currentIndexes.add(itemIndex)
      return
    }

    if (textWidth(font, item, fontSize) <= maxWidth) {
      flush()
      currentText = item
      currentIndexes.add(itemIndex)
      return
    }

    flush()
    const wrapped = wrapPdfText(item, font, fontSize, maxWidth)
    wrapped.forEach((line, lineIndex) => {
      if (lineIndex < wrapped.length - 1) lines.push({ text: line, itemIndexes: new Set([itemIndex]) })
      else {
        currentText = line
        currentIndexes.add(itemIndex)
      }
    })
  })
  flush()

  if (lines.length <= maxLines) return { text: lines.map((line) => line.text).join('\n'), omittedCount: 0 }
  const hiddenItemIndexes = new Set(lines.slice(maxLines).flatMap((line) => [...line.itemIndexes]))
  const visible = lines.slice(0, maxLines).map((line) => line.text)
  const finalVisibleLine = lines[maxLines - 1]
  if (finalVisibleLine) visible[visible.length - 1] = markTreasureOverflow(finalVisibleLine, hiddenItemIndexes, font, fontSize, maxWidth)
  return { text: visible.join('\n'), omittedCount: hiddenItemIndexes.size }
}

function setTreasureField(field: PDFTextField, items: readonly string[], font: PDFFont, fontSize: number, diagnostics: ExportDiagnostic[]): void {
  field.enableMultiline()
  setFieldFontSize(field, fontSize)
  const layout = layoutPdfTreasureItems(items, font, fontSize, fieldTextWidth(field), fieldLineCapacity(field, fontSize))
  field.setText(layout.text)
  if (layout.omittedCount) {
    diagnostic(diagnostics, 'warning', 'content-truncated', 'inventory', `宝物超出 PDF 模板容量，已省略 ${layout.omittedCount} 项物品。`)
  }
}

function featureEntryText(feature: CharacterExportModel['features'][number]): string {
  return `${feature.name}${feature.summary ? `：${feature.summary.replace(/\s+/g, ' ').trim()}` : ''}`
}

interface FeatureFieldLayout {
  readonly primaryText: string
  readonly additionalText: string
  readonly omittedCount: number
}

function fitWholeEntries(entries: readonly (readonly string[])[], capacity: number): { readonly lines: string[]; readonly count: number } {
  const lines: string[] = []
  let count = 0
  for (const entry of entries) {
    if (entry.length > capacity - lines.length) break
    lines.push(...entry)
    count += 1
  }
  return { lines, count }
}

function layoutFeatures(features: CharacterExportModel['features'], primaryField: PDFTextField, additionalField: PDFTextField, font: PDFFont, fontSize: number): FeatureFieldLayout {
  const primaryWidth = fieldTextWidth(primaryField)
  const additionalWidth = fieldTextWidth(additionalField)
  const primaryEntries = features.map((feature) => wrapPdfText(featureEntryText(feature), font, fontSize, primaryWidth))
  const primary = fitWholeEntries(primaryEntries, fieldLineCapacity(primaryField, fontSize))
  const remainingFeatures = features.slice(primary.count)
  if (!remainingFeatures.length) return { primaryText: primary.lines.join('\n'), additionalText: '', omittedCount: 0 }

  const additionalEntries = remainingFeatures.map((feature) => wrapPdfText(featureEntryText(feature), font, fontSize, additionalWidth))
  const additionalCapacity = fieldLineCapacity(additionalField, fontSize)
  const fullAdditional = fitWholeEntries(additionalEntries, additionalCapacity)
  if (fullAdditional.count === additionalEntries.length) {
    return { primaryText: primary.lines.join('\n'), additionalText: fullAdditional.lines.join('\n'), omittedCount: 0 }
  }

  const contentCapacity = Math.max(1, additionalCapacity - 1)
  const partialAdditional = fitWholeEntries(additionalEntries, contentCapacity)
  const visibleLines = [...partialAdditional.lines]
  let omittedCount = additionalEntries.length - partialAdditional.count
  if (!partialAdditional.count && additionalEntries[0]) {
    const truncated = truncateLines(additionalEntries[0], contentCapacity, font, fontSize, additionalWidth)
    visibleLines.push(...truncated)
    omittedCount = additionalEntries.length
  }
  visibleLines.push(ellipsizeLine(`另有${omittedCount}项省略`, font, fontSize, additionalWidth))
  return { primaryText: primary.lines.join('\n'), additionalText: visibleLines.join('\n'), omittedCount }
}

function attackText(model: CharacterExportModel, start: number): string {
  return model.attacks.slice(start).map((attack) => `${attack.name} ${formatSigned(attack.attackBonus)} ${attack.damage}${attack.note ? `（${attack.note}）` : ''}`).join('\n')
}

function textFieldsMatching(index: ReadonlyMap<string, FormField>, predicate: (normalizedName: string) => boolean): PDFTextField[] {
  return [...index.entries()]
    .filter((entry): entry is [string, PDFTextField] => isTextField(entry[1]) && predicate(entry[0]))
    .map(([, field]) => field)
}

interface PositionedTextField {
  readonly field: PDFTextField
  readonly page: string | undefined
  readonly x: number
  readonly y: number
}

function positionOf(field: PDFTextField): PositionedTextField | undefined {
  const widget = field.acroField.getWidgets()[0]
  if (!widget) return undefined
  const rect = widget.getRectangle()
  return { field, page: widget.P()?.toString(), x: rect.x, y: rect.y }
}

interface PositionedSlotAnchor extends PositionedTextField {
  readonly suffix: number
  readonly level: number
}

interface SpellTemplateMap {
  readonly fieldsByLevel: ReadonlyMap<number, readonly PDFTextField[]>
  readonly slotFieldsByLevel: ReadonlyMap<number, PDFTextField>
  readonly slotSuffixes: readonly number[]
  readonly unassignedFieldNames: readonly string[]
}

function numberedSlotFields(index: ReadonlyMap<string, FormField>): readonly (PositionedTextField & { readonly suffix: number })[] {
  return [...index.entries()].flatMap(([name, field]) => {
    if (!isTextField(field)) return []
    const match = name.match(/^slotstotal\s*(\d+)$/)
    const position = match ? positionOf(field) : undefined
    return match && position ? [{ ...position, suffix: Number(match[1]) }] : []
  }).sort((left, right) => left.suffix - right.suffix)
}

function contiguousSpellSlotAnchors(index: ReadonlyMap<string, FormField>): readonly PositionedSlotAnchor[] {
  const slots = numberedSlotFields(index)
  for (let start = 0; start <= slots.length - 9; start += 1) {
    const run = slots.slice(start, start + 9)
    const firstPage = run[0]?.page
    if (run.every((item, offset) => item.suffix === run[0].suffix + offset && item.page === firstPage)) {
      return run.map((item, offset) => ({ ...item, level: offset + 1 }))
    }
  }
  return []
}

/**
 * 目标模板沿用官方表单的无语义 Spells 编号，编号本身不代表环级。
 * 以连续九个 SlotsTotal 字段作为 1～9 环版面锚点；同列中位于锚点下方的法术行归入该环，
 * 第一列中位于一环锚点上方的法术行属于戏法。
 */
function buildSpellTemplateMap(index: ReadonlyMap<string, FormField>): SpellTemplateMap {
  const candidates = textFieldsMatching(index, (name) => /^spells?\s*\d+/i.test(name) || name.includes('cantrip'))
    .map(positionOf)
    .filter((item): item is PositionedTextField => Boolean(item))
  const anchors = contiguousSpellSlotAnchors(index)
  const positionedByLevel = new Map<number, PositionedTextField[]>()
  const unassigned: string[] = []

  for (const candidate of candidates) {
    const normalizedName = normalizeFieldName(candidate.field.getName())
    let level: number | undefined
    if (normalizedName.includes('cantrip')) {
      level = 0
    } else {
      const samePageAnchors = anchors.filter((anchor) => anchor.page === candidate.page)
      const nearestColumnAnchor = [...samePageAnchors]
        .sort((left, right) => Math.abs(left.x - candidate.x) - Math.abs(right.x - candidate.x))[0]
      const columnAnchors = nearestColumnAnchor
        ? samePageAnchors.filter((anchor) => Math.abs(anchor.x - nearestColumnAnchor.x) < 60)
        : []
      const nearestAnchorAbove = columnAnchors
        .filter((anchor) => anchor.y >= candidate.y - 4)
        .sort((left, right) => (left.y - candidate.y) - (right.y - candidate.y))[0]
      level = nearestAnchorAbove?.level
      const levelOneAnchor = columnAnchors.find((anchor) => anchor.level === 1)
      if (level === undefined && levelOneAnchor && candidate.y > levelOneAnchor.y) level = 0
    }
    if (level === undefined) {
      unassigned.push(candidate.field.getName())
      continue
    }
    const fields = positionedByLevel.get(level) ?? []
    fields.push(candidate)
    positionedByLevel.set(level, fields)
  }

  const fieldsByLevel = new Map([...positionedByLevel.entries()].map(([level, fields]) => [
    level,
    fields.sort((left, right) => right.y - left.y || left.x - right.x).map((item) => item.field),
  ]))
  return {
    fieldsByLevel,
    slotFieldsByLevel: new Map(anchors.map((anchor) => [anchor.level, anchor.field])),
    slotSuffixes: anchors.map((anchor) => anchor.suffix),
    unassignedFieldNames: unassigned,
  }
}

export interface PdfSpellTemplateInspection {
  readonly slotSuffixes: readonly number[]
  readonly capacities: Readonly<Record<number, number>>
  readonly unassignedFieldNames: readonly string[]
}

export function inspectPdfSpellTemplate(form: PDFForm): PdfSpellTemplateInspection {
  const mapping = buildSpellTemplateMap(fieldIndex(form))
  return {
    slotSuffixes: mapping.slotSuffixes,
    capacities: Object.fromEntries(Array.from({ length: 10 }, (_, level) => [level, mapping.fieldsByLevel.get(level)?.length ?? 0])),
    unassignedFieldNames: mapping.unassignedFieldNames,
  }
}

function checkboxNearTextField(form: PDFForm, textField: PDFTextField): PDFCheckBox | undefined {
  const textWidget = textField.acroField.getWidgets()[0]
  if (!textWidget) return undefined
  const textRect = textWidget.getRectangle()
  const textPage = textWidget.P()?.toString()
  let best: { readonly field: PDFCheckBox; readonly distance: number } | undefined
  for (const field of form.getFields()) {
    if (!isCheckBox(field)) continue
    const checkBox = field
    const widget = checkBox.acroField.getWidgets()[0]
    if (!widget || widget.P()?.toString() !== textPage) continue
    const rect = widget.getRectangle()
    const verticalDistance = Math.abs((rect.y + rect.height / 2) - (textRect.y + textRect.height / 2))
    const horizontalGap = textRect.x - (rect.x + rect.width)
    if (verticalDistance > Math.max(5, textRect.height / 2) || horizontalGap < -2 || horizontalGap > 28) continue
    const distance = verticalDistance * 4 + horizontalGap
    if (!best || distance < best.distance) best = { field: checkBox, distance }
  }
  return best?.field
}

function fillSpellPage(form: PDFForm, index: ReadonlyMap<string, FormField>, font: PDFFont, model: NonNullable<CharacterExportModel['spellcasting']>, diagnostics: ExportDiagnostic[]): void {
  setText(index, ['Spellcasting Class 2', 'Spellcasting Class', 'SpellcastingClass'], model.className, 'spells.class', diagnostics, true, 8)
  setText(index, ['SpellcastingAbility 2', 'Spellcasting Ability 2', 'SpellcastingAbility'], model.abilityLabel, 'spells.ability', diagnostics, true, 8)
  setText(index, ['SpellSaveDC 2', 'Spell Save DC 2', 'SpellSaveDC'], model.saveDc, 'spells.saveDc', diagnostics, true, 10)
  setText(index, ['SpellAtkBonus 2', 'Spell Attack Bonus 2', 'SpellAtkBonus'], formatSigned(model.attackBonus), 'spells.attackBonus', diagnostics, true, 10)
  const template = buildSpellTemplateMap(index)
  if (template.slotSuffixes.length !== 9) {
    const discovered = numberedSlotFields(index).map((item) => item.suffix).join('、') || '无'
    diagnostic(diagnostics, 'error', 'missing-template-field', 'spells.template', `PDF 模板未识别到连续九个法术位区块。实际 SlotsTotal 编号：${discovered}。`)
    return
  }
  if (template.unassignedFieldNames.length) {
    diagnostic(diagnostics, 'error', 'invalid-template-target', 'spells.template', `PDF 模板存在无法归类的法术字段：${template.unassignedFieldNames.join('、')}。`)
    return
  }

  for (let level = 0; level <= 9; level += 1) {
    const fields = template.fieldsByLevel.get(level) ?? []
    const spells = model.spells.filter((spell) => spell.level === level)
    if (!fields.length && spells.length) {
      diagnostic(diagnostics, 'error', 'missing-template-field', `spells.${level}`, `PDF 模板未识别到 ${level} 环法术字段。`)
      continue
    }
    spells.slice(0, fields.length).forEach((spell, spellIndex) => {
      const field = fields[spellIndex]
      setSingleLineText(field, spell.name, font, 7, `spells.${level}.${spellIndex}`, diagnostics)
      const prepared = checkboxNearTextField(form, field)
      if (prepared) {
        if (spell.prepared) prepared.check()
        else prepared.uncheck()
      }
    })
    if (spells.length > fields.length) diagnostic(diagnostics, 'warning', 'content-truncated', `spells.${level}`, `${level} 环法术超过 PDF 模板容量，额外法术已省略。`)
    if (level > 0) {
      const slot = model.slots.find((item) => item.level === level)
      const slotField = template.slotFieldsByLevel.get(level)
      if (slot && slotField) {
        setFieldFontSize(slotField, 8)
        slotField.setText(String(slot.count))
      }
    }
  }
}

export async function buildCharacterSheetPdf(model: CharacterExportModel): Promise<PdfBuildResult> {
  const [templateResponse, fontResponse] = await Promise.all([fetch(CHARACTER_SHEET_PDF_TEMPLATE_URL), fetch(PDF_FONT_URL)])
  if (!templateResponse.ok) throw new Error(`角色卡 PDF 模板加载失败（${templateResponse.status}）`)
  if (!fontResponse.ok) throw new Error(`中文字体加载失败（${fontResponse.status}）`)
  return fillPdfTemplate(new Uint8Array(await templateResponse.arrayBuffer()), new Uint8Array(await fontResponse.arrayBuffer()), model)
}

export async function fillPdfTemplate(templateBytes: Uint8Array, fontBytes: Uint8Array, model: CharacterExportModel): Promise<PdfBuildResult> {
  const { PDFDocument } = await import('pdf-lib')
  const fontkitModule = await import('@pdf-lib/fontkit')
  const document = await PDFDocument.load(templateBytes)
  if (document.getPageCount() !== 3) throw new Error('角色卡 PDF 模板页数不完整。')
  document.registerFontkit(fontkitModule.default)
  const font = await document.embedFont(fontBytes)
  const form = document.getForm()
  if (form.hasXFA()) form.deleteXFA()
  const index = fieldIndex(form)
  const diagnostics: ExportDiagnostic[] = [...model.diagnostics]

  setText(index, ['CharacterName'], model.identity.characterName, 'identity.characterName', diagnostics, true, 10)
  setText(index, ['ClassLevel'], model.identity.classLevel, 'identity.classLevel', diagnostics, true, 7)
  setText(index, ['Race ', 'Race'], model.identity.raceName, 'identity.race', diagnostics, true, 7)
  setText(index, ['Background'], model.identity.backgroundName, 'identity.background', diagnostics, true, 7)
  setText(index, ['Alignment'], model.identity.alignment, 'identity.alignment', diagnostics, true, 7)
  setText(index, ['XP'], model.identity.experience, 'identity.experience', diagnostics, true, 7)
  setText(index, ['ProfBonus'], formatSigned(model.combat.proficiencyBonus), 'combat.proficiencyBonus', diagnostics, true, 10)
  setText(index, ['AC'], model.combat.armorClass, 'combat.armorClass', diagnostics, true, 13)
  setText(index, ['Initiative'], formatSigned(model.combat.initiative), 'combat.initiative', diagnostics, true, 13)
  setText(index, ['Speed'], `${model.combat.speed}尺`, 'combat.speed', diagnostics, true, 12)
  setText(index, ['HPMax'], model.combat.hitPointMaximum, 'combat.hitPointMaximum', diagnostics, true, 8)
  setText(index, ['HPCurrent'], model.combat.hitPointCurrent, 'combat.hitPointCurrent', diagnostics, true, 13)
  setText(index, ['HPTemp'], model.combat.hitPointTemporary, 'combat.hitPointTemporary', diagnostics, true, 13)
  setText(index, ['HDTotal'], `${model.identity.level}${model.combat.hitDice}`, 'combat.hitDiceTotal', diagnostics, true, 7)
  setText(index, ['HD'], model.combat.hitDice, 'combat.hitDice', diagnostics, true, 10)
  setText(index, ['Passive'], model.combat.passivePerception, 'combat.passivePerception', diagnostics, true, 8)

  for (const ability of Object.values(model.abilities)) {
    const fields = ABILITY_FIELD_NAMES[ability.key]
    setText(index, fields.score, ability.score, `abilities.${ability.key}.score`, diagnostics, true, 13)
    setText(index, fields.modifier, formatSigned(ability.modifier), `abilities.${ability.key}.modifier`, diagnostics, true, 10)
    setText(index, fields.save, formatSigned(ability.savingThrow), `abilities.${ability.key}.save`, diagnostics, true, 7)
    setCheck(index, fields.saveCheck, ability.savingThrowProficient, `abilities.${ability.key}.saveProficiency`, diagnostics)
  }

  for (const skill of model.skills) {
    const fields = SKILL_FIELDS[skill.id]
    if (!fields) continue
    setText(index, fields.value, formatSigned(skill.value), `skills.${skill.id}.value`, diagnostics, true, 7)
    setCheck(index, fields.check, skill.proficiency !== 'none', `skills.${skill.id}.proficiency`, diagnostics)
  }

  ATTACK_FIELDS.forEach((fields, attackIndex) => {
    const attack = model.attacks[attackIndex]
    if (!attack) return
    const nameField = textField(index, fields.name, `attacks.${attackIndex}.name`, diagnostics)
    if (nameField) setSingleLineText(nameField, attack.name, font, 8, `attacks.${attackIndex}.name`, diagnostics)
    const bonusField = textField(index, fields.bonus, `attacks.${attackIndex}.bonus`, diagnostics)
    if (bonusField) setSingleLineText(bonusField, formatSigned(attack.attackBonus), font, 8, `attacks.${attackIndex}.bonus`, diagnostics)
    const damageField = textField(index, fields.damage, `attacks.${attackIndex}.damage`, diagnostics)
    if (damageField) setSingleLineText(damageField, attack.damage, font, 7, `attacks.${attackIndex}.damage`, diagnostics)
  })
  const attackNotes = model.attacks.slice(0, 3).filter((attack) => attack.note).map((attack) => `${attack.name}：${attack.note}`)
  const additionalAttackRows = attackText(model, 3)
  const additionalAttacks = [...attackNotes, additionalAttackRows].filter(Boolean).join('\n')
  const additionalAttackField = setWrappedField(index, ['AttacksSpellcasting'], additionalAttacks, font, 8, 'attacks.additional', diagnostics, false)
  if (additionalAttacks && !additionalAttackField) diagnostic(diagnostics, 'warning', 'missing-template-field', 'attacks.additional', 'PDF 模板缺少额外攻击文本区，第四项及更多攻击未写入。')

  setText(index, ['CP'], model.currency.cp, 'currency.cp', diagnostics, true, 7)
  setText(index, ['SP'], model.currency.sp, 'currency.sp', diagnostics, true, 7)
  setText(index, ['EP'], model.currency.ep, 'currency.ep', diagnostics, true, 7)
  setText(index, ['GP'], model.currency.gp, 'currency.gp', diagnostics, true, 7)
  setText(index, ['PP'], model.currency.pp, 'currency.pp', diagnostics, true, 7)
  setWrappedField(index, ['ProficienciesLang'], model.proficiencies.text, font, 8, 'proficiencies', diagnostics)
  setWrappedField(index, ['Equipment'], '物品详见第2页宝物', font, 8, 'inventory.index', diagnostics)
  const treasureItems = model.inventory.map((item) => `${item.name} × ${item.quantity}${item.equippedQuantity ? `（已装备 × ${item.equippedQuantity}）` : ''}`)
  const treasureField = textField(index, ['Treasure'], 'inventory', diagnostics)
  if (treasureField) setTreasureField(treasureField, treasureItems, font, 8, diagnostics)

  const primaryFeatureField = textField(index, ['Features and Traits'], 'features.primary', diagnostics)
  const additionalFeatureField = textField(index, ['Feat+Traits'], 'features.additional', diagnostics)
  if (primaryFeatureField && additionalFeatureField) {
    primaryFeatureField.enableMultiline()
    setFieldFontSize(primaryFeatureField, 8)
    additionalFeatureField.enableMultiline()
    setFieldFontSize(additionalFeatureField, 8)
    const featureLayout = layoutFeatures(model.features, primaryFeatureField, additionalFeatureField, font, 8)
    primaryFeatureField.setText(featureLayout.primaryText)
    additionalFeatureField.setText(featureLayout.additionalText)
    if (featureLayout.omittedCount) {
      diagnostic(diagnostics, 'warning', 'content-truncated', 'features.additional', `特性与专长超出两页容量，已省略 ${featureLayout.omittedCount} 项。`)
    }
  }

  setText(index, ['CharacterName 2', 'Character Name 2', 'CharacterName2'], model.identity.characterName, 'profile.characterName', diagnostics, false, 10)
  setWrappedField(index, ['Backstory'], model.profile.backstory, font, 8, 'profile.backstory', diagnostics)

  if (model.spellcasting) fillSpellPage(form, index, font, model.spellcasting, diagnostics)

  if (diagnostics.some((item) => item.severity === 'error')) return { bytes: templateBytes, diagnostics }
  form.updateFieldAppearances(font)
  form.flatten({ updateFieldAppearances: false })
  const reordered = await PDFDocument.create()
  const pages = await reordered.copyPages(document, [0, 2, 1])
  pages.forEach((page) => reordered.addPage(page))
  return { bytes: await reordered.save({ updateFieldAppearances: false }), diagnostics }
}

export async function downloadPdf(bytes: Uint8Array, filename: string): Promise<void> {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
