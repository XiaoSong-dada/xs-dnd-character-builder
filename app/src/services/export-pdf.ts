import type { PDFFont, PDFPage, RGB } from 'pdf-lib'

import { baseUrl } from '@/config/site'
import { formatSigned, type CharacterExportModel, type ExportDiagnostic } from '@/features/character-export/build-export-data'
import type { AbilityKey } from '@/types/character'

export const CHARACTER_SHEET_PDF_TEMPLATE_URL = `${baseUrl}templates/character-sheet-zh.pdf`
export const PDF_FONT_URL = `${baseUrl}templates/fonts/noto-sans-sc-subset.ttf`
export const CHARACTER_SHEET_PDF_MAPPING_VERSION = 4

const DARK_TEXT = { type: 'RGB', red: 0.12549, green: 0.141176, blue: 0.164706 } as RGB
const WHITE_TEXT = { type: 'RGB', red: 1, green: 1, blue: 1 } as RGB

export interface PdfRegion {
  readonly page: 0 | 1 | 2
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly align: 'left' | 'center'
  readonly maxSize: number
  readonly minSize: number
  readonly lineHeight: number
  readonly maxLines: number
  readonly color: 'dark' | 'light'
  readonly overflow: 'shrink-then-truncate' | 'wrap-then-truncate'
}

function region(page: 0 | 1 | 2, x: number, y: number, width: number, height: number, options: Partial<Omit<PdfRegion, 'page' | 'x' | 'y' | 'width' | 'height'>> = {}): PdfRegion {
  const lineHeight = options.lineHeight ?? 9.6
  return { page, x, y, width, height, align: options.align ?? 'left', maxSize: options.maxSize ?? 8, minSize: options.minSize ?? 6, lineHeight, maxLines: options.maxLines ?? Math.max(1, Math.floor(height / lineHeight)), color: options.color ?? 'dark', overflow: options.overflow ?? 'wrap-then-truncate' }
}

/** v4 模板的唯一坐标来源；坐标采用 PDF 左下角原点、单位 pt。 */
export const PDF_REGION_MAP_V4 = {
  identity: {
    characterName: region(0, 34, 772, 170, 16, { align: 'center', maxSize: 11, minSize: 7, overflow: 'shrink-then-truncate' }),
    classLevel: region(0, 220, 772, 116, 16, { align: 'center', maxSize: 10, minSize: 7, overflow: 'shrink-then-truncate' }),
    race: region(0, 349, 772, 113, 16, { align: 'center', maxSize: 10, minSize: 7, overflow: 'shrink-then-truncate' }),
    background: region(0, 468, 772, 104, 16, { align: 'center', maxSize: 10, minSize: 7, overflow: 'shrink-then-truncate' }),
    playerName: region(0, 34, 738, 114, 15, { align: 'center', maxSize: 9, minSize: 7, overflow: 'shrink-then-truncate' }),
    alignment: region(0, 164, 738, 120, 15, { align: 'center', maxSize: 9, minSize: 7, overflow: 'shrink-then-truncate' }),
    experience: region(0, 300, 738, 98, 15, { align: 'center', maxSize: 9, minSize: 7, overflow: 'shrink-then-truncate' }),
  },
  combat: {
    proficiencyBonus: region(0, 518, 738, 58, 15, { align: 'center', maxSize: 9, overflow: 'shrink-then-truncate' }),
    armorClass: region(0, 193, 695, 54, 22, { align: 'center', maxSize: 14, minSize: 10, overflow: 'shrink-then-truncate' }),
    initiative: region(0, 265, 695, 54, 22, { align: 'center', maxSize: 14, minSize: 10, overflow: 'shrink-then-truncate' }),
    speed: region(0, 341, 695, 55, 22, { align: 'center', maxSize: 14, minSize: 9, overflow: 'shrink-then-truncate' }),
    hitPoints: region(0, 244, 644, 96, 20, { align: 'center', maxSize: 12, minSize: 9, overflow: 'shrink-then-truncate' }),
    hitDice: region(0, 192, 594, 57, 18, { align: 'center', maxSize: 11, minSize: 8, overflow: 'shrink-then-truncate' }),
    passivePerception: region(0, 58, 386, 86, 18, { align: 'center', maxSize: 10, minSize: 8, overflow: 'shrink-then-truncate' }),
  },
  pageOne: {
    proficiencies: region(0, 34, 306, 132, 128, { maxLines: 14, lineHeight: 9 }),
    attacks: region(0, 192, 370, 203, 44, { maxLines: 4, lineHeight: 10 }),
    features: region(0, 417, 437, 150, 193, { maxLines: 21, lineHeight: 9 }),
    equipment: region(0, 417, 132, 150, 77, { maxLines: 8, lineHeight: 9 }),
  },
  pageTwo: {
    characterName: region(1, 34, 770, 160, 18, { align: 'center', maxSize: 11, minSize: 7, overflow: 'shrink-then-truncate' }),
    backstory: region(1, 34, 460, 168, 390, { maxLines: 42, lineHeight: 9 }),
    additionalFeatures: region(1, 224, 480, 344, 170, { maxLines: 18, lineHeight: 9 }),
  },
  pageThree: {
    spellcastingClass: region(2, 34, 770, 130, 18, { align: 'center', maxSize: 9, minSize: 7, overflow: 'shrink-then-truncate' }),
    spellcastingAbility: region(2, 171, 770, 107, 18, { align: 'center', maxSize: 9, minSize: 7, overflow: 'shrink-then-truncate' }),
    spellSaveDc: region(2, 286, 770, 96, 18, { align: 'center', maxSize: 10, minSize: 8, overflow: 'shrink-then-truncate' }),
    spellAttackBonus: region(2, 389, 770, 95, 18, { align: 'center', maxSize: 10, minSize: 8, overflow: 'shrink-then-truncate' }),
  },
} as const

const ABILITY_Y: Readonly<Record<AbilityKey, number>> = { str: 696, dex: 645.5, con: 595, int: 544.5, wis: 494, cha: 443.5 }
const SKILL_Y: Readonly<Record<string, number>> = {
  'skill-acrobatics': 553, 'skill-animal-handling': 544.9, 'skill-arcana': 536.8, 'skill-athletics': 528.7, 'skill-deception': 520.6, 'skill-history': 512.5,
  'skill-insight': 504.4, 'skill-intimidation': 496.3, 'skill-investigation': 488.2, 'skill-medicine': 480.1, 'skill-nature': 472, 'skill-perception': 463.9,
  'skill-performance': 455.8, 'skill-persuasion': 447.7, 'skill-religion': 439.6, 'skill-sleight-of-hand': 431.5, 'skill-stealth': 423.4, 'skill-survival': 415.3,
}
const COIN_REGIONS = {
  cp: region(0, 426, 158, 25, 12, { align: 'center', maxSize: 7, overflow: 'shrink-then-truncate' }), sp: region(0, 456, 158, 25, 12, { align: 'center', maxSize: 7, overflow: 'shrink-then-truncate' }),
  ep: region(0, 486, 158, 25, 12, { align: 'center', maxSize: 7, overflow: 'shrink-then-truncate' }), gp: region(0, 516, 158, 25, 12, { align: 'center', maxSize: 7, overflow: 'shrink-then-truncate' }),
  pp: region(0, 546, 158, 25, 12, { align: 'center', maxSize: 7, overflow: 'shrink-then-truncate' }),
} as const
const SPELL_COLUMNS: Readonly<Record<number, { x: number; y: number; lineHeight: number; capacity: number; slotX?: number; slotY?: number }>> = {
  0: { x: 45, y: 690, lineHeight: 12, capacity: 8 }, 1: { x: 45, y: 563, lineHeight: 13, capacity: 10, slotX: 55, slotY: 580 },
  2: { x: 45, y: 352, lineHeight: 13, capacity: 10, slotX: 55, slotY: 365 }, 3: { x: 235, y: 690, lineHeight: 13, capacity: 10, slotX: 245, slotY: 716 },
  4: { x: 235, y: 480, lineHeight: 13, capacity: 10, slotX: 245, slotY: 505 }, 5: { x: 235, y: 269, lineHeight: 13, capacity: 10, slotX: 245, slotY: 345 },
  6: { x: 425, y: 690, lineHeight: 13, capacity: 10, slotX: 435, slotY: 716 }, 7: { x: 425, y: 480, lineHeight: 13, capacity: 10, slotX: 435, slotY: 558 },
  8: { x: 425, y: 269, lineHeight: 13, capacity: 8, slotX: 435, slotY: 408 }, 9: { x: 425, y: 126, lineHeight: 13, capacity: 5, slotX: 435, slotY: 274 },
}

export interface PdfBuildResult { readonly bytes: Uint8Array; readonly diagnostics: readonly ExportDiagnostic[] }

function tokenize(text: string): string[] {
  const normalized = text.replace(/\r\n?/g, '\n')
  const Segmenter = (Intl as unknown as { Segmenter?: new (locale: string, options: { granularity: 'word' }) => { segment(value: string): Iterable<{ segment: string }> } }).Segmenter
  if (Segmenter) return [...new Segmenter('zh-CN', { granularity: 'word' }).segment(normalized)].map((item) => item.segment)
  return normalized.split(/(?<=[，。；：！？、\s])|(?=[，。；：！？、\n])/u).filter(Boolean)
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  let current = ''
  for (const token of tokenize(text)) {
    if (token === '\n') { lines.push(current); current = ''; continue }
    const candidate = current + token
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) { lines.push(current.trimEnd()); current = token.trimStart() } else current = candidate
    if (font.widthOfTextAtSize(current, size) > maxWidth) {
      const glyphs = Array.from(current); current = ''
      for (const glyph of glyphs) { const next = current + glyph; if (current && font.widthOfTextAtSize(next, size) > maxWidth) { lines.push(current); current = glyph } else current = next }
    }
  }
  if (current) lines.push(current.trimEnd())
  return lines
}

function truncateToWidth(text: string, font: PDFFont, size: number, width: number): string {
  let result = text
  while (result && font.widthOfTextAtSize(`${result}…`, size) > width) result = result.slice(0, -1)
  return `${result}…`
}

function drawRegion(page: PDFPage, font: PDFFont, textValue: string | number, target: PdfRegion, field: string, diagnostics: ExportDiagnostic[]): void {
  const text = String(textValue).trim()
  if (!text) return
  const color = target.color === 'light' ? WHITE_TEXT : DARK_TEXT
  if (target.overflow === 'shrink-then-truncate') {
    let size = target.maxSize
    while (size > target.minSize && font.widthOfTextAtSize(text, size) > target.width) size -= 0.5
    const clipped = font.widthOfTextAtSize(text, size) > target.width
    const finalText = clipped ? truncateToWidth(text, font, size, target.width) : text
    if (clipped) diagnostics.push({ code: 'content-truncated', severity: 'warning', field, message: `${field} 超出 PDF 模板容量，已省略尾部内容。` })
    const x = target.align === 'center' ? target.x + (target.width - font.widthOfTextAtSize(finalText, size)) / 2 : target.x
    page.drawText(finalText, { x, y: target.y, size, font, color })
    return
  }
  let size = target.maxSize
  let lines = wrapText(text, font, size, target.width)
  while (size > target.minSize && lines.length > target.maxLines) { size -= 0.5; lines = wrapText(text, font, size, target.width) }
  const clipped = lines.length > target.maxLines
  const visible = lines.slice(0, target.maxLines)
  if (clipped && visible.length) visible[visible.length - 1] = truncateToWidth(visible[visible.length - 1], font, size, target.width)
  if (clipped) diagnostics.push({ code: 'content-truncated', severity: 'warning', field, message: `${field} 超出 PDF 模板容量，已省略部分内容。` })
  visible.forEach((line, index) => page.drawText(line, { x: target.x, y: target.y - index * target.lineHeight, size, font, color }))
}

function featureText(features: CharacterExportModel['features']): string {
  return features.map((feature) => `${feature.name}${feature.summary ? `：${feature.summary.replace(/\s+/g, ' ').trim()}` : ''}`).join('\n')
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
  if (document.getPageCount() < 3) throw new Error('角色卡 PDF 模板页数不完整。')
  document.registerFontkit(fontkitModule.default)
  const font = await document.embedFont(fontBytes)
  const pages = document.getPages()
  const diagnostics: ExportDiagnostic[] = [...model.diagnostics]
  const draw = (text: string | number, target: PdfRegion, field: string) => drawRegion(pages[target.page], font, text, target, field, diagnostics)

  draw(model.identity.characterName, PDF_REGION_MAP_V4.identity.characterName, 'identity.characterName')
  draw(model.identity.classLevel, PDF_REGION_MAP_V4.identity.classLevel, 'identity.classLevel')
  draw(model.identity.raceName, PDF_REGION_MAP_V4.identity.race, 'identity.race')
  draw(model.identity.backgroundName, PDF_REGION_MAP_V4.identity.background, 'identity.background')
  draw(model.identity.playerName, PDF_REGION_MAP_V4.identity.playerName, 'identity.playerName')
  draw(model.identity.alignment, PDF_REGION_MAP_V4.identity.alignment, 'identity.alignment')
  draw(model.identity.experience, PDF_REGION_MAP_V4.identity.experience, 'identity.experience')
  draw(formatSigned(model.combat.proficiencyBonus), PDF_REGION_MAP_V4.combat.proficiencyBonus, 'combat.proficiencyBonus')
  draw(model.combat.armorClass, PDF_REGION_MAP_V4.combat.armorClass, 'combat.armorClass')
  draw(formatSigned(model.combat.initiative), PDF_REGION_MAP_V4.combat.initiative, 'combat.initiative')
  draw(`${model.combat.speed}尺`, PDF_REGION_MAP_V4.combat.speed, 'combat.speed')
  draw(model.combat.hitPointCurrent, PDF_REGION_MAP_V4.combat.hitPoints, 'combat.hitPoints')
  draw(model.combat.hitDice, PDF_REGION_MAP_V4.combat.hitDice, 'combat.hitDice')
  draw(model.combat.passivePerception, PDF_REGION_MAP_V4.combat.passivePerception, 'combat.passivePerception')
  for (const ability of Object.values(model.abilities)) {
    const y = ABILITY_Y[ability.key]
    drawRegion(pages[0], font, ability.score, region(0, 39, y - 5, 28, 14, { align: 'center', maxSize: 10, minSize: 8, overflow: 'shrink-then-truncate' }), `abilities.${ability.key}.score`, diagnostics)
    drawRegion(pages[0], font, formatSigned(ability.modifier), region(0, 84, y - 5, 32, 14, { align: 'center', maxSize: 10, minSize: 8, overflow: 'shrink-then-truncate' }), `abilities.${ability.key}.modifier`, diagnostics)
    drawRegion(pages[0], font, `${ability.savingThrowProficient ? '● ' : ''}${formatSigned(ability.savingThrow)}`, region(0, 124, y - 5, 38, 14, { align: 'center', maxSize: 9, minSize: 7, overflow: 'shrink-then-truncate' }), `abilities.${ability.key}.save`, diagnostics)
  }
  for (const skill of model.skills) {
    const y = SKILL_Y[skill.id]
    if (y === undefined) continue
    const marker = skill.proficiency === 'expertise' ? '◆ ' : skill.proficiency === 'proficient' ? '● ' : ''
    drawRegion(pages[0], font, `${marker}${formatSigned(skill.value)}`, region(0, 236, y - 3, 44, 10, { align: 'center', maxSize: 7, overflow: 'shrink-then-truncate' }), `skills.${skill.id}`, diagnostics)
  }
  draw(model.proficiencies.text, PDF_REGION_MAP_V4.pageOne.proficiencies, 'proficiencies')
  draw(model.attacks.slice(0, 4).map((attack) => `${attack.name} ${formatSigned(attack.attackBonus)} ${attack.damage}${attack.note ? `（${attack.note}）` : ''}`).join('\n'), PDF_REGION_MAP_V4.pageOne.attacks, 'attacks')
  if (model.attacks.length > 4) diagnostics.push({ code: 'content-truncated', severity: 'warning', field: 'attacks', message: 'PDF 模板最多显示四个攻击，额外攻击已省略。' })
  const featureLines = wrapText(featureText(model.features), font, PDF_REGION_MAP_V4.pageOne.features.maxSize, PDF_REGION_MAP_V4.pageOne.features.width)
  draw(featureLines.slice(0, PDF_REGION_MAP_V4.pageOne.features.maxLines).join('\n'), PDF_REGION_MAP_V4.pageOne.features, 'features.primary')
  draw(model.inventory.map((item) => `${item.name}×${item.quantity}${item.equippedQuantity ? '（已装备）' : ''}`).join('、'), PDF_REGION_MAP_V4.pageOne.equipment, 'inventory')
  for (const [key, target] of Object.entries(COIN_REGIONS)) draw(model.currency[key as keyof typeof model.currency], target, `currency.${key}`)
  draw(model.identity.characterName, PDF_REGION_MAP_V4.pageTwo.characterName, 'profile.characterName')
  draw(model.profile.backstory, PDF_REGION_MAP_V4.pageTwo.backstory, 'profile.backstory')
  draw(featureLines.slice(PDF_REGION_MAP_V4.pageOne.features.maxLines).join('\n'), PDF_REGION_MAP_V4.pageTwo.additionalFeatures, 'features.additional')
  if (model.spellcasting) {
    draw(model.spellcasting.className, PDF_REGION_MAP_V4.pageThree.spellcastingClass, 'spells.class')
    draw(model.spellcasting.abilityLabel, PDF_REGION_MAP_V4.pageThree.spellcastingAbility, 'spells.ability')
    draw(model.spellcasting.saveDc, PDF_REGION_MAP_V4.pageThree.spellSaveDc, 'spells.saveDc')
    draw(formatSigned(model.spellcasting.attackBonus), PDF_REGION_MAP_V4.pageThree.spellAttackBonus, 'spells.attackBonus')
    for (let level = 0; level <= 9; level += 1) {
      const column = SPELL_COLUMNS[level]
      const spells = model.spellcasting.spells.filter((spell) => spell.level === level)
      spells.slice(0, column.capacity).forEach((spell, index) => drawRegion(pages[2], font, `${spell.prepared ? '●' : '○'} ${spell.name}`, region(2, column.x, column.y - index * column.lineHeight, 135, 11, { maxSize: 7.5, overflow: 'shrink-then-truncate' }), `spells.${level}.${index}`, diagnostics))
      if (spells.length > column.capacity) diagnostics.push({ code: 'content-truncated', severity: 'warning', field: `spells.${level}`, message: `${level} 环法术超过 PDF 模板容量，额外法术已省略。` })
      if (level > 0 && column.slotX !== undefined && column.slotY !== undefined) {
        const slot = model.spellcasting.slots.find((item) => item.level === level)
        if (slot) drawRegion(pages[2], font, slot.count, region(2, column.slotX, column.slotY, 24, 10, { align: 'center', maxSize: 7, overflow: 'shrink-then-truncate' }), `spellSlots.${level}`, diagnostics)
      }
    }
  }
  return { bytes: await document.save(), diagnostics }
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
