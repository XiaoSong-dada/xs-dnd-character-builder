import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getCustomContentRevision, getRulesRepository, resetCustomContent } from '@/rules/repositories'
import { CustomContentStorageError } from '@/services/custom-content-storage'
import { useCustomContentStore } from '@/stores/custom-content'
import type { CustomEntryInput } from '@/stores/custom-content'
import type { CustomClassEntry, CustomSubclassEntry } from '@/types/custom-content'

function raceInput(overrides: Partial<Extract<CustomEntryInput, { kind: 'race' }>> = {}): CustomEntryInput {
  return {
    kind: 'race',
    expansionId: 'source-custom-store',
    ruleset: '5e-2014',
    name: '工坊精灵',
    englishName: 'Workshop Elf',
    summary: '自制种族',
    description: '自制种族说明',
    speed: 30,
    ...overrides,
  }
}

function classInput(overrides: Partial<Omit<CustomClassEntry, 'id' | 'createdAt' | 'updatedAt'>> = {}): CustomEntryInput {
  return {
    kind: 'class',
    expansionId: 'source-custom-store',
    ruleset: '5e-2014',
    name: '工坊职业',
    englishName: 'Workshop Class',
    summary: '自制职业',
    description: '说明',
    hitDie: 10,
    primaryAbilities: ['力量'],
    savingThrowAbilities: ['str', 'con'],
    ...overrides,
  }
}

function subclassInput(
  classId: string,
  overrides: Partial<Omit<CustomSubclassEntry, 'id' | 'createdAt' | 'updatedAt'>> = {},
): CustomEntryInput {
  return {
    kind: 'subclass',
    expansionId: 'source-custom-store',
    ruleset: '5e-2014',
    name: '工坊子职',
    englishName: 'Workshop Subclass',
    summary: '自制子职',
    description: '说明',
    classId,
    selectionLevel: 3,
    ...overrides,
  }
}

function createStoreWithExpansion() {
  const store = useCustomContentStore()
  store.saveExpansion({
    ruleset: '5e-2014',
    title: '工坊测试书',
    shortTitle: '工坊',
    defaultEnabled: true,
  })
  const expansion = store.expansionsOf('5e-2014')[0]
  if (!expansion) throw new Error('expansion missing')
  return { store, expansionId: expansion.id }
}

describe('内容工坊 store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    resetCustomContent()
  })

  afterEach(() => {
    resetCustomContent()
    localStorage.clear()
  })

  it('新建扩展与条目后立即可被规则仓库解析，并推进内容版本', () => {
    const before = getCustomContentRevision()
    const { store, expansionId } = createStoreWithExpansion()
    const entry = store.createEntry(raceInput({ expansionId }))

    expect(entry.id.startsWith('custom-race-')).toBe(true)
    expect(getRulesRepository('5e-2014').getRace(entry.id)?.name).toBe('工坊精灵')
    expect(getCustomContentRevision()).toBeGreaterThan(before)
    expect(store.revision).toBe(getCustomContentRevision())
  })

  it('内容写入 localStorage，重新创建 store 后仍能读回', () => {
    const { store, expansionId } = createStoreWithExpansion()
    const entry = store.createEntry(raceInput({ expansionId }))

    setActivePinia(createPinia())
    const reloaded = useCustomContentStore()
    expect(reloaded.entriesOf('5e-2014').map((item) => item.id)).toContain(entry.id)
    expect(getRulesRepository('5e-2014').getRace(entry.id)).toBeTruthy()
  })

  it('校验失败抛出中文原因且不写入', () => {
    const { store, expansionId } = createStoreWithExpansion()
    expect(() => store.createEntry(raceInput({ expansionId, name: '' })))
      .toThrow(CustomContentStorageError)
    expect(store.entriesOf('5e-2014')).toHaveLength(0)
  })

  it('归档后不可新选但可解析，恢复后重新可选', () => {
    const { store, expansionId } = createStoreWithExpansion()
    const entry = store.createEntry(raceInput({ expansionId }))

    store.archiveEntry('5e-2014', entry.id)
    expect(getRulesRepository('5e-2014').getRace(entry.id)?.status).toBe('unavailable')

    store.restoreEntry('5e-2014', entry.id)
    expect(getRulesRepository('5e-2014').getRace(entry.id)?.status).toBe('selectable')
  })

  it('扩展下仍有条目时拒绝删除扩展', () => {
    const { store, expansionId } = createStoreWithExpansion()
    store.createEntry(raceInput({ expansionId }))
    expect(() => store.deleteExpansion('5e-2014', expansionId)).toThrow(CustomContentStorageError)

    store.deleteEntry('5e-2014', store.entriesOf('5e-2014')[0]?.id ?? '')
    expect(() => store.deleteExpansion('5e-2014', expansionId)).not.toThrow()
  })

  it('删除条目后仓库不再解析', () => {
    const { store, expansionId } = createStoreWithExpansion()
    const entry = store.createEntry(raceInput({ expansionId }))
    store.deleteEntry('5e-2014', entry.id)
    expect(getRulesRepository('5e-2014').getRace(entry.id)).toBeUndefined()
  })

  it('导出后可重新导入（往返一致）', () => {
    const { store, expansionId } = createStoreWithExpansion()
    const entry = store.createEntry(raceInput({ expansionId }))
    const json = store.exportToJson('5e-2014')

    const imported = store.parseImport(json)
    expect(imported.state['5e-2014'].races.map((item) => item.id)).toContain(entry.id)
    expect(imported.skipped).toBe(0)

    store.clearAll()
    expect(store.entriesOf('5e-2014')).toHaveLength(0)
    store.replaceState(imported.state)
    expect(getRulesRepository('5e-2014').getRace(entry.id)?.name).toBe('工坊精灵')
  })

  it('自定义子职进入仓库，并阻止同职业子职改动选择等级', () => {
    const { store, expansionId } = createStoreWithExpansion()
    const classEntry = store.createEntry(classInput({ expansionId }))
    const first = store.createEntry(subclassInput(classEntry.id, { expansionId, selectionLevel: 3 }))

    expect(getRulesRepository('5e-2014').getSubclass(first.id)?.classId).toBe(classEntry.id)
    expect(store.subclassesOfClass('5e-2014', classEntry.id)).toHaveLength(1)
    expect(() => store.createEntry(subclassInput(classEntry.id, { expansionId, name: '另一个子职', selectionLevel: 6 })))
      .toThrow(/固定为 3 级/)
    expect(() => store.updateEntry({ ...first, selectionLevel: 5 }))
      .toThrow(/固定为 3 级/)
  })

  it('仍有子职时拒绝删除父职业，删除子职后才允许', () => {
    const { store, expansionId } = createStoreWithExpansion()
    const classEntry = store.createEntry(classInput({ expansionId }))
    const first = store.createEntry(subclassInput(classEntry.id, { expansionId }))

    expect(() => store.deleteEntry('5e-2014', classEntry.id))
      .toThrow(/还有 1 个自定义子职/)
    store.deleteEntry('5e-2014', first.id)
    expect(() => store.deleteEntry('5e-2014', classEntry.id)).not.toThrow()
  })

  it('存储写入被拒绝时回滚状态并给出中文提示', () => {
    const { store, expansionId } = createStoreWithExpansion()
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError')
    })
    try {
      expect(() => store.createEntry(raceInput({ expansionId }))).toThrow(/存储空间不足/)
      expect(store.entriesOf('5e-2014')).toHaveLength(0)
    } finally {
      spy.mockRestore()
    }
  })
})
