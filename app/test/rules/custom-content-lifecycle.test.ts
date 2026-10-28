import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { draft2024 } from '../fixtures/draft-2024'
import { collectCustomContentReferences } from '@/rules/custom-content-references'
import { resetCustomContent } from '@/rules/repositories'
import { validateDraft } from '@/rules/validate'
import { useCustomContentStore } from '@/stores/custom-content'
import type { CharacterDraft } from '@/types/character'
import type { CustomContentState } from '@/types/custom-content'

function setupStore() {
  localStorage.clear()
  resetCustomContent()
  const pinia = createPinia()
  setActivePinia(pinia)
  return useCustomContentStore()
}

function customDraft(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    ...draft2024({
      ruleset: '5e-2014',
      classId: 'class-2014-wizard',
      enabledSourceIds: ['source-custom-test'],
      targetLevel: 3,
      ...overrides,
    }),
    multiclass: undefined,
  }
}

function seedRace(store: ReturnType<typeof useCustomContentStore>) {
  const expansion = store.saveExpansion({
    ruleset: '5e-2014',
    title: '生命周期测试书',
    shortTitle: '生命',
    defaultEnabled: true,
  })
  const race = store.createEntry({
    kind: 'race',
    expansionId: expansion.id,
    ruleset: '5e-2014',
    name: '工坊精灵',
    englishName: 'Workshop Elf',
    summary: '自制种族',
    description: '说明',
    speed: 30,
  })
  return { expansion, race }
}

describe('内容工坊：生命周期与缺失降级', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCustomContent()
  })

  afterEach(() => {
    resetCustomContent()
    localStorage.clear()
  })

  it('归档 → 恢复 → 删除 的状态流转正确', () => {
    const store = setupStore()
    const { race } = seedRace(store)

    expect(store.findEntry('5e-2014', race.id)?.archived).toBeUndefined()
    store.archiveEntry('5e-2014', race.id)
    expect(store.findEntry('5e-2014', race.id)?.archived).toBe(true)
    store.restoreEntry('5e-2014', race.id)
    expect(store.findEntry('5e-2014', race.id)?.archived).toBeUndefined()
    store.deleteEntry('5e-2014', race.id)
    expect(store.findEntry('5e-2014', race.id)).toBeUndefined()
  })

  it('mergeState 追加新条目并覆盖同 ID 内容', () => {
    const store = setupStore()
    const { expansion, race } = seedRace(store)
    const local = store.state['5e-2014']
    const imported: CustomContentState = {
      ...store.state,
      '5e-2014': {
        ...local,
        races: [
          { ...race, name: '导入版本名字' },
          {
            ...race,
            id: 'custom-race-imported',
            name: '导入新增种族',
          },
        ],
      },
    }

    const result = store.mergeState(imported)
    // 导入包里带着本机已有的扩展与一个同名 ID 种族 → 两项覆盖；新增的种族计为新增。
    expect(result).toEqual({ added: 1, replaced: 2 })
    const names = store.entriesOf('5e-2014').map((entry) => entry.name)
    expect(names).toContain('导入版本名字')
    expect(names).toContain('导入新增种族')
    expect(store.expansionOf('5e-2014', expansion.id)?.title).toBe('生命周期测试书')
  })

  it('已归档的内容在校验里给出提示级问题，删除后给出缺失提示', () => {
    const store = setupStore()
    const { race } = seedRace(store)
    const draft = customDraft({ raceId: race.id })

    expect(validateDraft(draft).some((issue) => issue.id.startsWith('custom-content-'))).toBe(false)

    store.archiveEntry('5e-2014', race.id)
    const archived = validateDraft(draft)
    const archivedIssue = archived.find((issue) => issue.id === `custom-content-archived-${race.id}`)
    expect(archivedIssue?.severity).toBe('warning')
    expect(archivedIssue?.message).toContain('已归档')
    expect(archivedIssue?.resolution).toContain('内容工坊')

    store.deleteEntry('5e-2014', race.id)
    const missing = validateDraft(draft)
    const missingIssue = missing.find((issue) => issue.id === `custom-content-missing-${race.id}`)
    expect(missingIssue?.severity).toBe('warning')
    expect(missingIssue?.message).toContain('不存在')
  })

  it('引用扫描覆盖种族、法术、人工专长与人工法术', () => {
    const store = setupStore()
    const { race } = seedRace(store)
    const draft = customDraft({
      raceId: race.id,
      spellSelections: {
        cantripIds: ['custom-spell-1'],
        knownSpellIds: ['custom-spell-2'],
        preparedSpellIds: [],
        spellbookSpellIds: [],
        transcribedSpellIds: [],
      },
      manualEdits: {
        abilityAdjustments: {},
        proficiencyBonusAdjustment: 0,
        derivedAdjustments: {},
        savingThrowAdjustments: {},
        skillAdjustments: {},
        spellSlotAdjustments: {},
        addedSpells: [{ spellId: 'custom-spell-3', destination: 'granted', prepared: false }],
        addedFeats: [{ instanceId: 'manual-1', featId: 'custom-feat-1', addedAt: '2026-10-19T00:00:00.000Z' }],
      },
    })

    const references = collectCustomContentReferences([draft])
    expect(references.get(race.id)?.map((owner) => owner.draftName)).toHaveLength(1)
    expect(references.has('custom-spell-1')).toBe(true)
    expect(references.has('custom-spell-2')).toBe(true)
    expect(references.has('custom-spell-3')).toBe(true)
    expect(references.has('custom-feat-1')).toBe(true)
    // 内置 ID 不进入自定义引用表
    expect(references.has('class-2014-wizard')).toBe(false)
  })
})
