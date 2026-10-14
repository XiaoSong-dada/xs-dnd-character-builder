import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildCharacterExportModel, formatExportCantripScaling, formatExportResources } from '@/features/character-export/build-export-data'
import { deriveCharacter } from '@/rules/derive'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { fillPdfTemplate } from '@/services/export-pdf'
import { buildXlsxFieldValues } from '@/services/export-xlsx'
import { draft2024, emptySpellSelections } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft, ClassLevelEntry, ClassSpellSelections } from '@/types/character'

/**
 * MC-F01：多职业导出字段映射。
 *
 * - 单职业导出逐字段不变（既有 `export-pdf`／`export-xlsx` 测试即回归）；
 * - 多职业按需求 §3.1 的统一格式输出职业行，并承载生命骰、法术位（含契约池）、法术归属与戏法成长。
 */

const PDF_TEMPLATE_PATH = resolve(__dirname, '../../public/templates/character-sheet-zh-plus.pdf')
const FONT_PATH = resolve(__dirname, '../../public/templates/fonts/noto-sans-sc-subset.ttf')

const ABILITIES: AbilityScores = { str: 13, dex: 14, con: 13, int: 15, wis: 13, cha: 16 }

const RANGER_SORCERER: readonly ClassLevelEntry[] = [
  { classId: 'class-2014-ranger', level: 4 },
  { classId: 'class-2014-sorcerer', level: 3 },
]

function mc(
  classes: readonly ClassLevelEntry[],
  spellSelections?: Partial<CharacterDraft['spellSelections']>,
  overrides: Partial<CharacterDraft> = {},
): CharacterDraft {
  const order = classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  return draft2024({
    ruleset: '5e-2014',
    baseAbilities: ABILITIES,
    classId: classes[0]?.classId,
    targetLevel: order.length,
    multiclass: { enabled: true, primaryClassId: classes[0]?.classId ?? '', classes, levelOrder: order },
    manualEdits: EMPTY_MANUAL_EDITS,
    ...(spellSelections ? { spellSelections: { ...emptySpellSelections(), ...spellSelections } } : {}),
    ...overrides,
  })
}

function modelOf(draft: CharacterDraft) {
  return buildCharacterExportModel(draft, deriveCharacter(draft))
}

const BUCKETS: readonly ClassSpellSelections[] = [
  { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: ['spell-2014-cure-wounds', 'spell-2014-alarm', 'spell-2014-animal-friendship'], preparedSpellIds: [], spellbookSpellIds: [] },
  { classId: 'class-2014-sorcerer', cantripIds: ['spell-2014-fire-bolt', 'spell-2014-acid-splash', 'spell-2014-chill-touch', 'spell-2014-blade-ward'], knownSpellIds: ['spell-2014-blur', 'spell-2014-burning-hands', 'spell-2014-charm-person', 'spell-2014-color-spray'], preparedSpellIds: [], spellbookSpellIds: [] },
]

describe('MC-F01 职业行与生命骰', () => {
  it('多职业用统一标签，逐职业行带各自等级与起始标记', () => {
    const model = modelOf(mc(RANGER_SORCERER, { classSpellSelections: BUCKETS }))
    expect(model.identity.classLevel).toBe('游侠4 / 术士3（7 级角色）')
    expect(model.identity.level).toBe(7)
    expect(model.identity.classRows).toEqual([
      { classId: 'class-2014-ranger', className: '游侠', level: 4, primary: true },
      { classId: 'class-2014-sorcerer', className: '术士', level: 3, primary: false },
    ])
  })

  it('单职业保持既有 `职业（N级）` 文案与单行职业行', () => {
    const solo = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5, baseAbilities: ABILITIES })
    const model = modelOf(solo)
    expect(model.identity.classLevel).toBe('战士（5级）')
    expect(model.identity.classRows).toEqual([{ classId: 'class-2014-fighter', className: '战士', level: 5, primary: true }])
  })

  it('生命骰按各职业骰面汇集（骰面升序）', () => {
    const multi = modelOf(mc(RANGER_SORCERER, { classSpellSelections: BUCKETS }))
    // 游侠 d10×4 + 术士 d6×3，按骰面升序输出
    expect(multi.combat.hitDice).toBe('3d6 + 4d10')
    expect(multi.combat.hitDiceTotal).toBe('7（3d6 + 4d10）')

    const solo = modelOf(draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5, baseAbilities: ABILITIES }))
    expect(solo.combat.hitDice).toBe('d10')
    expect(solo.combat.hitDiceTotal).toBe('5d10')
  })
})

describe('MC-F01 法术位与法术归属', () => {
  it('法术位走兼职通用池，并列出各施法职业行', () => {
    const model = modelOf(mc(RANGER_SORCERER, { classSpellSelections: BUCKETS }))
    expect(model.spellcasting?.slots.map((slot) => `${slot.level}:${slot.count}`)).toEqual(['1:4', '2:3', '3:2'])
    expect(model.spellcasting?.className).toBe('游侠4 / 术士3')
    expect(model.spellcasting?.classes).toEqual(['游侠4', '术士3'])
    expect(model.spellcasting?.pactNote).toBeUndefined()
  })

  it('契约双池并存时通用池与契约说明同时输出', () => {
    const draft = mc([
      { classId: 'class-2014-warlock', level: 3 },
      { classId: 'class-2014-wizard', level: 5 },
    ])
    const model = modelOf(draft)
    const slots = model.spellcasting?.slots ?? []
    // 通用池 4/3/2 + 契约 2 个 2 环
    expect(slots.filter((slot) => !slot.pact).map((slot) => `${slot.level}:${slot.count}`)).toEqual(['1:4', '2:3', '3:2'])
    expect(slots.filter((slot) => slot.pact)).toEqual([{ level: 2, count: 2, pact: true }])
    expect(model.spellcasting?.pactNote).toContain('契约魔法：2 个 2 环法术位')
    expect(model.spellcasting?.pactNote).toContain('短休恢复')
    // 本项目数据里魔契师的职业名为「邪术师」
    expect(model.spellcasting?.classes).toEqual(['邪术师3', '法师5'])
  })

  it('法术带归属职业（单职业不带）', () => {
    const model = modelOf(mc(RANGER_SORCERER, { classSpellSelections: BUCKETS }))
    const spells = model.spellcasting?.spells ?? []
    expect(spells.find((spell) => spell.id === 'spell-2014-cure-wounds')?.className).toBe('游侠')
    expect(spells.find((spell) => spell.id === 'spell-2014-blur')?.className).toBe('术士')

    const solo = modelOf(draft2024({ ruleset: '5e-2014', classId: 'class-2014-sorcerer', targetLevel: 3, baseAbilities: ABILITIES }))
    expect(solo.spellcasting?.spells.every((spell) => spell.className === undefined)).toBe(true)
  })
})

describe('MC-F01 戏法成长（D11／D12）', () => {
  it('按角色总等级给出成长值，并标注归属职业', () => {
    const model = modelOf(mc(RANGER_SORCERER, { classSpellSelections: BUCKETS }))
    const fireBolt = model.cantrips.find((cantrip) => cantrip.id === 'spell-2014-fire-bolt')
    // 总等级 7 → 火焰箭 2d10（不是术士等级 3 的 1d10）
    expect(fireBolt).toEqual({ id: 'spell-2014-fire-bolt', name: '火焰箭', scaling: '2d10', className: '术士' })
    expect(formatExportCantripScaling(model.cantrips, model.identity.level)).toContain('火焰箭 2d10（术士）')
    expect(formatExportCantripScaling(model.cantrips, model.identity.level)).toContain('戏法成长（角色总等级 7 级）')
  })

  it('未登记成长规则的戏法不入列，也不写「无成长」（D12）', () => {
    const model = modelOf(mc(RANGER_SORCERER, { classSpellSelections: BUCKETS }))
    // 剑刃防护是防护系戏法，不随等级成长 → 没有成长行
    expect(model.cantrips.some((cantrip) => cantrip.id === 'spell-2014-blade-ward')).toBe(false)
    expect(model.cantrips.every((cantrip) => cantrip.scaling !== '无成长')).toBe(true)
    expect(model.cantrips.length).toBeGreaterThan(0)
  })

  it('空列表返回空串（不写入空区块）', () => {
    expect(formatExportCantripScaling([], 7)).toBe('')
  })
})

describe('MC-F01 资源合并与 XLSX 字段', () => {
  it('合并资源在导出文本里说明来源', () => {
    const draft = mc([
      { classId: 'class-2024-cleric', level: 5 },
      { classId: 'class-2024-paladin', level: 10 },
    ], undefined, { ruleset: '5e-2024' })
    const model = modelOf(draft)
    const channelDivinity = model.resources.find((resource) => resource.name === '引导神力')
    expect(channelDivinity?.sharedSources).toEqual(['牧师', '圣武士'])
    expect(formatExportResources(model.resources)).toContain('引导神力 2次（短休回1）（牧师、圣武士共用）')
  })

  it('XLSX 职业格与人物资料页写统一标签，生命骰与法术位按多职业输出', () => {
    const model = modelOf(mc(RANGER_SORCERER, { classSpellSelections: BUCKETS }))
    const { values, diagnostics } = buildXlsxFieldValues(model)
    expect(diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    expect(values.class_name).toBe('游侠4 / 术士3（7 级角色）')
    expect(values.profile_class_level).toBe('游侠4 / 术士3（7 级角色）')
    expect(values.hit_dice).toBe('3d6 + 4d10')
    expect(values.spell_slot_1_total).toBe(4)
    expect(values.spell_slot_2_total).toBe(3)
    expect(values.spell_slot_3_total).toBe(2)
    expect(values.spellcasting_class).toBe('游侠4 / 术士3')
    expect(String(values.features_traits) + String(values.additional_features)).toContain('戏法成长（角色总等级 7 级）')
  })

  it('XLSX 单职业字段与改造前一致，且没有多职业专属文案', () => {
    const solo = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5, baseAbilities: ABILITIES })
    const { values } = buildXlsxFieldValues(modelOf(solo))
    expect(values.class_name).toBe('战士')
    expect(values.profile_class_level).toBe('战士 5')
    expect(values.hit_dice).toBe('d10')
  })

  it('单职业魔契师的法术位仍写在契约环位上（回退行为不变）', () => {
    const solo = draft2024({ ruleset: '5e-2014', classId: 'class-2014-warlock', targetLevel: 3, baseAbilities: ABILITIES })
    const model = modelOf(solo)
    expect(model.spellcasting?.slots).toEqual([{ level: 2, count: 2, pact: true }])
    const { values } = buildXlsxFieldValues(model)
    expect(values.spell_slot_2_total).toBe(2)
  })
})

describe('MC-F01 PDF 落盘', () => {
  it('多职业导出写入真实模板并保留三页与扁平化结构', async () => {
    const model = modelOf(mc(RANGER_SORCERER, { classSpellSelections: BUCKETS }))
    const { PDFDocument } = await import('pdf-lib')
    const result = await fillPdfTemplate(
      new Uint8Array(readFileSync(PDF_TEMPLATE_PATH)),
      new Uint8Array(readFileSync(FONT_PATH)),
      model,
    )
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
    const document = await PDFDocument.load(result.bytes)
    expect(document.getPageCount()).toBe(3)
    expect(document.getForm().getFields()).toHaveLength(0)
  }, 30_000)
})
