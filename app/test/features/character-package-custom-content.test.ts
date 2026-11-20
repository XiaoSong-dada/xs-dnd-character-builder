import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { strFromU8, unzipSync } from 'fflate'
import { decodePDFRawStream, PDFDict, PDFDocument, PDFName, PDFRawStream } from 'pdf-lib'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { useCharacterPackageImport } from '@/features/custom-content/hooks/useCharacterPackageImport'
import { collectCharacterContent } from '@/rules/custom-content-package'
import { deriveCharacter } from '@/rules/derive'
import { resetCustomContent } from '@/rules/repositories'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import { CustomContentStorageService } from '@/services/custom-content-storage'
import { fillPdfTemplate } from '@/services/export-pdf'
import { fillCharacterSheetTemplate, verifyXlsxOutput } from '@/services/export-xlsx'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import { useCustomContentStore } from '@/stores/custom-content'
import type { RulesetId } from '@/types/character'
import { draft2024 } from '../fixtures/draft-2024'

function template(name: string): Uint8Array {
  return new Uint8Array(readFileSync(resolve(__dirname, '../../public/templates', name)))
}

function scenario(ruleset: RulesetId) {
  const store = useCustomContentStore()
  const expansion = store.saveExpansion({ ruleset, title: '测试扩展', shortTitle: '测试', defaultEnabled: true })
  const race = store.createEntry({
    kind: 'race', expansionId: expansion.id, ruleset, name: '工坊旅者', englishName: '',
    summary: '移动较快', description: '用于检查缺失的速度数据。', speed: 40,
  })
  const draft = draft2024({
    ruleset, name: '灰尾', classId: ruleset === '5e-2024' ? 'class-2024-fighter' : 'class-2014-fighter',
    raceId: race.id, enabledSourceIds: [expansion.id], currentStep: 'sheet',
  })
  return { store, expansion, race, draft }
}

function clearReceiver(): void {
  localStorage.clear()
  resetCustomContent()
  setActivePinia(createPinia())
}

function packageFile(bytes: Uint8Array): Blob {
  return new Blob([new Uint8Array(bytes)], { type: 'application/zip' })
}

beforeEach(clearReceiver)
afterEach(() => {
  vi.restoreAllMocks()
  clearReceiver()
})

describe('缺失自定义内容时导出角色卡', () => {
  it.each(['5e-2014', '5e-2024'] as const)('在 %s 标记缺失物种，补装后恢复同一角色的速度', async (ruleset) => {
    const { store, draft, expansion } = scenario(ruleset)
    const original = store.exportToJson(ruleset)
    clearReceiver()
    const imported = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(draft))
    expect(imported.enabledSourceIds).toContain(expansion.id)

    const model = buildCharacterExportModel(imported, deriveCharacter(imported))
    expect(model.identity.raceName).toBe('自定义物种缺失')
    expect(model.combat.speed).toBe(30)
    expect(model.diagnostics).toContainEqual(expect.objectContaining({ code: 'missing-custom-content', severity: 'warning', message: expect.stringContaining('速度') }))

    const xlsxId = ruleset === '5e-2024' ? '2024' : '2014'
    const xlsxTemplate = template(xlsxId === '2024' ? 'character-sheet-2024-r2.xlsx' : 'character-sheet-2014.xlsx')
    const xlsx = fillCharacterSheetTemplate(xlsxTemplate, model, xlsxId)
    expect(xlsx.diagnostics.filter(({ severity }) => severity === 'error')).toEqual([])
    verifyXlsxOutput(xlsx.bytes)
    const archive = unzipSync(xlsx.bytes)
    const workbook = strFromU8(archive['xl/workbook.xml'])
    expect(workbook).toContain('name="导出说明"')
    expect(workbook).toContain(`activeTab="${[...workbook.matchAll(/<sheet\b/g)].length - 1}"`)
    const notes = strFromU8(archive['xl/worksheets/character-export-notes.xml'])
    expect(notes).toContain('部分数值待核对')
    expect(notes).toContain(imported.raceId)
    expect(Object.entries(archive).some(([path, bytes]) => path.startsWith('xl/worksheets/sheet') && /<f\b/.test(strFromU8(bytes)))).toBe(true)

    const font = template('fonts/noto-sans-sc-subset.ttf')
    const pdf = await fillPdfTemplate(template('character-sheet-zh-plus.pdf'), font, model)
    expect(pdf.diagnostics.filter(({ severity }) => severity === 'error')).toEqual([])
    const document = await PDFDocument.load(pdf.bytes)
    expect(document.getPageCount()).toBe(4)
    expect(document.getForm().getFields()).toHaveLength(0)
    const embeddedFonts = document.context.enumerateIndirectObjects().flatMap(([, object]) => {
      if (!(object instanceof PDFDict) || !object.get(PDFName.of('FontName'))?.toString().includes('NotoSansSC-Regular')) return []
      const stream = object.lookupMaybe(PDFName.of('FontFile2'), PDFRawStream)
      return stream ? [decodePDFRawStream(stream).decode()] : []
    })
    expect(embeddedFonts).toHaveLength(1)
    expect(Buffer.compare(Buffer.from(embeddedFonts[0]), Buffer.from(font))).toBe(0)

    const receiver = useCustomContentStore()
    receiver.mergeState(receiver.parseImport(original).state)
    const restored = buildCharacterExportModel(imported, deriveCharacter(imported))
    expect(restored.identity.raceName).toBe('工坊旅者')
    expect(restored.combat.speed).toBe(40)
    expect(restored.diagnostics.some(({ code }) => code === 'missing-custom-content')).toBe(false)
    const restoredXlsx = fillCharacterSheetTemplate(xlsxTemplate, restored, xlsxId)
    expect(unzipSync(restoredXlsx.bytes)['xl/worksheets/character-export-notes.xml']).toBeUndefined()
  }, 30_000)

  it('仍阻断无法识别的内置职业或物种', () => {
    const draft = draft2024({ classId: 'class-2024-missing', raceId: 'species-2024-missing' })
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    expect(model.diagnostics.filter(({ severity }) => severity === 'error').map(({ field }) => field))
      .toEqual(['identity.class', 'identity.race'])
  })

  it('缺失职业、兼职子职、专长和法术都可导出，停用法术不触发导出警告', () => {
    const draft = draft2024({
      classId: 'custom-class-missing',
      targetLevel: 5,
      multiclass: {
        enabled: true,
        primaryClassId: 'custom-class-missing',
        classes: [
          { classId: 'custom-class-missing', level: 2 },
          { classId: 'class-2024-fighter', subclassId: 'custom-subclass-missing', level: 3 },
        ],
        levelOrder: ['custom-class-missing', 'custom-class-missing', 'class-2024-fighter', 'class-2024-fighter', 'class-2024-fighter'],
      },
      selections: [{ checkpointId: 'test', optionIds: ['custom-feat-missing'], confirmedAt: '' }],
      spellSelections: { ...draft2024().spellSelections, knownSpellIds: ['custom-spell-missing'] },
      inactiveSpellSelections: [{
        id: 'inactive', spellId: 'custom-spell-inactive', originalBucket: 'knownSpellIds',
        reason: 'class-changed', invalidatedAt: '',
      }],
    })
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    expect(model.diagnostics.filter(({ severity }) => severity === 'error')).toEqual([])
    expect(model.diagnostics.filter(({ code }) => code === 'missing-custom-content').map(({ field }) => field))
      .toEqual(['custom-class-missing', 'custom-subclass-missing', 'custom-feat-missing', 'custom-spell-missing'])
    expect(model.identity.classLevel).toContain('自定义职业缺失')
    expect(model.identity.classRows[1]?.subclassName).toBe('自定义子职缺失')
  })
})

describe('完整角色包中的自定义内容', () => {
  it('仅打包引用的条目与传递依赖，跨本机内容库导入后可完整导出', async () => {
    const { store, expansion, race, draft } = scenario('5e-2024')
    const base = { expansionId: expansion.id, ruleset: draft.ruleset, englishName: '', summary: '概括', description: '描述' }
    const spell = store.createEntry({ ...base, kind: 'spell', name: '测试法术', level: 1, classIds: ['class-2024-wizard'] })
    const feat = store.createEntry({ ...base, kind: 'feat', name: '测试专长', category: 'general', grantedSpellIds: [spell.id] })
    store.createEntry({ ...base, kind: 'race', name: '未使用物种' })
    const character = { ...draft, selections: [{ checkpointId: 'test', optionIds: [feat.id], confirmedAt: draft.createdAt }] }
    const selection = collectCharacterContent(character, store.bundleOf(draft.ruleset))
    expect(selection).toMatchObject({ count: 3, missing: [], bundle: { races: [{ id: race.id }], feats: [{ id: feat.id }], spells: [{ id: spell.id }] } })
    const payload = CustomContentStorageService.exportJson({ ...store.state, [draft.ruleset]: selection.bundle }, draft.ruleset)
    const file = packageFile(await CharacterPackageService.build(character, payload))
    clearReceiver()

    const received = vi.fn()
    const flow = useCharacterPackageImport(received, vi.fn())
    await flow.open(file)
    expect(flow.dialog.value.items.map(({ status }) => status)).toEqual(['new', 'new', 'new', 'new'])
    expect(useCharacterDraftsStore().drafts).toHaveLength(0)
    await flow.confirm(true)
    expect(received).toHaveBeenCalledTimes(1)
    const imported = useCharacterDraftsStore().activeDraft!
    expect(imported.raceId).toBe(race.id)
    expect(imported.enabledSourceIds).toContain(expansion.id)
    expect(buildCharacterExportModel(imported, deriveCharacter(imported)).identity.raceName).toBe('工坊旅者')
    expect(useCustomContentStore().bundleOf(draft.ruleset).races).toHaveLength(1)
  })

  it('冲突默认保留本机，选择包内版本后可重试且角色只导入一次', async () => {
    const { store, draft, race } = scenario('5e-2024')
    const payload = store.exportToJson(draft.ruleset)
    const file = packageFile(await CharacterPackageService.build(draft, payload))
    const local = store.bundleOf(draft.ruleset)
    store.replaceState({ ...store.state, [draft.ruleset]: { ...local, races: local.races.map((item) => ({ ...item, name: '本机版本' })) } })

    const received = vi.fn()
    const flow = useCharacterPackageImport(received, vi.fn())
    await flow.open(file)
    expect(flow.dialog.value.items.find(({ id }) => id === race.id)?.status).toBe('conflict')
    expect(flow.dialog.value.usePackaged.size).toBe(0)
    await flow.confirm(true)
    expect(store.findEntry(draft.ruleset, race.id)?.name).toBe('本机版本')

    await flow.open(file)
    flow.choose(race.id, true)
    vi.spyOn(store, 'applyCharacterContent').mockImplementationOnce(() => { throw new Error('存储已满') })
    await flow.confirm(true)
    expect(flow.dialog.value).toMatchObject({ alreadyImported: true, error: '存储已满' })
    await flow.confirm(true)
    expect(useCharacterDraftsStore().drafts).toHaveLength(2)
    expect(store.findEntry(draft.ruleset, race.id)?.name).toBe('工坊旅者')
  })

  it('可跳过损坏的自定义内容，只导入角色', async () => {
    const { draft } = scenario('5e-2024')
    const file = packageFile(await CharacterPackageService.build(draft, 'invalid json'))
    clearReceiver()
    const received = vi.fn()
    const flow = useCharacterPackageImport(received, vi.fn())
    await flow.open(file)
    expect(flow.dialog.value).toMatchObject({ open: true, canInstall: false, missing: [draft.raceId] })
    await flow.confirm(false)
    expect(received).toHaveBeenCalledOnce()
    expect(useCustomContentStore().bundleOf(draft.ruleset).races).toHaveLength(0)
  })
})
