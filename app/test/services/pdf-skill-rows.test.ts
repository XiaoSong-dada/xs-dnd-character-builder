import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PDFDocument, PDFForm, type PDFCheckBox, type PDFTextField } from 'pdf-lib'
import { describe, expect, it, vi } from 'vitest'

import { buildCharacterExportModel, formatSigned, type CharacterExportModel } from '@/features/character-export/build-export-data'
import { deriveCharacter } from '@/rules/derive'
import { fillPdfTemplate } from '@/services/export-pdf'
import type { CharacterDraft } from '@/types/character'
import { fighterDraft } from '../fixtures/export-character'
import { inspectGeneratedPdfFont } from '../fixtures/pdf-font'

// Independently transcribed from the visible Chinese labels and measured widget coordinates.
// Never derive this oracle from the exporter's internal English field mapping.
const ROWS = [
  ['athletics', '运动', 461.664, 0], ['sleight-of-hand', '巧手', 448.128, 3],
  ['stealth', '隐匿', 434.592, 3], ['acrobatics', '体操', 421.128, 3],
  ['investigation', '调查', 407.592, 8], ['history', '历史', 394.056, 8],
  ['arcana', '奥秘', 380.592, 8], ['nature', '自然', 367.128, 4],
  ['religion', '宗教', 353.52, 4], ['animal-handling', '驯兽', 340.128, 3],
  ['insight', '洞悉', 326.52, 3], ['medicine', '医药', 313.056, 3],
  ['perception', '观察', 299.592, 7], ['survival', '求生', 286.056, 3],
  ['deception', '欺瞒', 272.592, 0], ['intimidation', '威吓', 259.128, 0],
  ['performance', '表演', 245.52, 0], ['persuasion', '游说', 232.056, 4],
] as const
const PROFICIENT = new Set(['investigation', 'history', 'arcana', 'perception', 'persuasion'])
const template = readFileSync(resolve(__dirname, '../../public/templates/character-sheet-zh-plus.pdf'))
const font = readFileSync(resolve(__dirname, '../../public/templates/fonts/noto-sans-sc-subset.ttf'))

const anonymousWizard: CharacterDraft = {
  ...fighterDraft, id: 'pdf-row-regression', name: '测试法师', notes: '', schemaVersion: 7,
  targetLevel: 10, abilityMethod: 'custom', classId: 'class-2014-wizard',
  subclassId: 'subclass-2014-wizard-chronurgy', enabledSourceIds: ['egtw-2020-index'],
  raceId: 'race-2014-elf', subraceId: 'race-2014-elf-high', backgroundId: 'background-2014-noble',
  backgroundSkillIds: ['skill-history', 'skill-persuasion'], inventory: [], languages: [],
  baseAbilities: { str: 10, dex: 14, con: 14, int: 15, wis: 16, cha: 11 },
  selections: [
    { checkpointId: 'wizard-2014-skills-1', optionIds: ['skill-arcana', 'skill-investigation'], confirmedAt: '' },
    { checkpointId: 'wizard-2014-asi-4', optionIds: ['asi-int-2'], confirmedAt: '' },
    { checkpointId: 'wizard-2014-asi-8', optionIds: ['feat-war-caster'], confirmedAt: '' },
  ],
}

function exportModel(draft = anonymousWizard) {
  return buildCharacterExportModel(draft, deriveCharacter(draft))
}

function fieldsAtRow(form: PDFForm, y: number, valueX: number) {
  const page = form.doc.getPages()[0]!
  const annotations = new Set((page.node.Annots()?.asArray() ?? []).map((ref) => form.doc.context.lookup(ref)))
  const fields = form.getFields().filter((field) => field.acroField.getWidgets().some((widget) => {
    const r = widget.getRectangle()
    return annotations.has(widget.dict) && Math.abs(r.y - y) < 1.1 && r.x >= 100 && r.x < 128
  }))
  const values = fields.filter((field) => field.acroField.FT().asString() === '/Tx')
  const checks = fields.filter((field) => field.acroField.FT().asString() === '/Btn')
  expect(values).toHaveLength(1)
  expect(checks).toHaveLength(1)
  expect(values[0]!.acroField.getWidgets()[0]!.getRectangle().x).toBeCloseTo(valueX, 2)
  return { value: values[0] as PDFTextField, check: checks[0] as PDFCheckBox }
}

async function inspectBeforeFlatten(model: CharacterExportModel, inspect: (form: PDFForm) => void) {
  const original = PDFForm.prototype.flatten
  const spy = vi.spyOn(PDFForm.prototype, 'flatten').mockImplementation(function (this: PDFForm, options) {
    inspect(this)
    original.call(this, options)
  })
  try {
    const result = await fillPdfTemplate(template, font, model)
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([])
    expect(spy).toHaveBeenCalledOnce()
    const output = await PDFDocument.load(result.bytes)
    expect(output.getPageCount()).toBe(3)
    expect(output.getForm().getFields()).toHaveLength(0)
    // The template also contains non-form annotations; only Widgets must disappear.
    expect(await inspectGeneratedPdfFont(result.bytes)).toEqual({ embeddedRegularFontCount: 1, hasNeedAppearances: false, widgetCount: 0 })
  } finally { spy.mockRestore() }
}

describe('PDF Chinese skill rows', () => {
  it('matches all visible rows and six saves for an anonymous level-ten wizard', async () => {
    const model = exportModel()
    await inspectBeforeFlatten(model, (form) => {
      const used = new Set<string>()
      for (const [id, label, y, expected] of ROWS) {
        expect(model.skills.find((s) => s.id === `skill-${id}`)?.value, label).toBe(expected)
        const row = fieldsAtRow(form, y, 112.003)
        used.add(row.value.getName())
        expect(row.value.getText(), label).toBe(formatSigned(expected))
        expect(row.check.isChecked(), label).toBe(PROFICIENT.has(id))
      }
      expect(used.size).toBe(18)
      const saves = [[576.817, 0, false], [563.312, 3, false], [549.825, 2, false],
        [536.289, 8, true], [522.753, 7, true], [509.361, 0, false]] as const
      for (const [y, value, proficient] of saves) {
        const row = fieldsAtRow(form, y, 112.723)
        expect(row.value.getText()).toBe(formatSigned(value))
        expect(row.check.isChecked()).toBe(proficient)
      }
    })
  })

  it.each(ROWS.map((row, index) => [row[1], index] as const))('isolates proficiency for %s with distinct signed values', async (_label, selected) => {
    const model = exportModel()
    const skills = ROWS.map(([id, name], index) => ({
      id: `skill-${id}`, name, value: index - 8,
      proficiency: index === selected ? 'proficient' as const : 'none' as const,
    }))
    await inspectBeforeFlatten({ ...model, skills }, (form) => {
      ROWS.forEach(([, label, y], index) => {
        const row = fieldsAtRow(form, y, 112.003)
        expect(row.value.getText(), label).toBe(formatSigned(index - 8))
        expect(row.check.isChecked(), label).toBe(index === selected)
      })
    })
  })

  it('retains derived double proficiency for expertise in the correct row', async () => {
    const model = exportModel({ ...anonymousWizard, classId: 'class-2014-rogue', subclassId: undefined,
      selections: [
        { checkpointId: 'rogue-2014-skills-1', optionIds: ['skill-stealth', 'skill-acrobatics', 'skill-investigation', 'skill-deception'], confirmedAt: '' },
        { checkpointId: 'rogue-2014-expertise-1', optionIds: ['skill-stealth', 'skill-investigation'], confirmedAt: '' },
      ],
    })
    expect(model.skills.find((s) => s.id === 'skill-stealth')).toMatchObject({ value: 11, proficiency: 'expertise' })
    await inspectBeforeFlatten(model, (form) => {
      const row = fieldsAtRow(form, 434.592, 112.003)
      expect(row.value.getText()).toBe('+11')
      expect(row.check.isChecked()).toBe(true)
    })
  })

  it('preserves manual skill and saving throw adjustments in their visible rows', async () => {
    const model = exportModel({ ...anonymousWizard, manualEdits: {
      abilityAdjustments: {}, proficiencyBonusAdjustment: 0, derivedAdjustments: {},
      savingThrowAdjustments: { str: -2 }, skillAdjustments: { 'skill-arcana': -11 },
      spellSlotAdjustments: {}, addedSpells: [],
    } })
    expect(model.skills.find((s) => s.id === 'skill-arcana')?.value).toBe(-3)
    await inspectBeforeFlatten(model, (form) => {
      expect(fieldsAtRow(form, 380.592, 112.003).value.getText()).toBe('-3')
      expect(fieldsAtRow(form, 380.592, 112.003).check.isChecked()).toBe(true)
      expect(fieldsAtRow(form, 576.817, 112.723).value.getText()).toBe('-2')
    })
  })
})
