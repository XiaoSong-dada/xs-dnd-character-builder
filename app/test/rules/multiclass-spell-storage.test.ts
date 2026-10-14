import 'fake-indexeddb/auto'

import { Blob as NodeBlob } from 'node:buffer'
import { beforeEach, describe, expect, it } from 'vitest'

import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import { parseCharacterDraft } from '@/services/draft-storage'
import { reconcileSpellSelections } from '@/rules/spell-selection-reconciliation'
import { getSpellcastingScope } from '@/rules/spellcasting'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft, ClassLevelEntry, ClassSpellSelections } from '@/types/character'

/**
 * MC-D04：多职业法术选择的存储与迁移。
 *
 * - 单职业草稿仍读写顶层字段，JSON 往返逐字段不变；
 * - 多职业草稿以 `spellSelections.classSpellSelections` 为事实源；
 * - 停用记录的 `sourceKey` 指向**丢失该法术的职业**。
 */

const ABILITIES: AbilityScores = { str: 13, dex: 14, con: 13, int: 13, wis: 13, cha: 16 }

const RANGER_SORCERER: readonly ClassLevelEntry[] = [
  { classId: 'class-2014-ranger', level: 4 },
  { classId: 'class-2014-sorcerer', level: 3 },
]

function mc(classes: readonly ClassLevelEntry[], spellSelections?: CharacterDraft['spellSelections']): CharacterDraft {
  const order = classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  return draft2024({
    ruleset: '5e-2014',
    baseAbilities: ABILITIES,
    classId: classes[0]?.classId,
    targetLevel: order.length,
    multiclass: { enabled: true, primaryClassId: classes[0]?.classId ?? '', classes, levelOrder: order },
    manualEdits: EMPTY_MANUAL_EDITS,
    ...(spellSelections ? { spellSelections } : {}),
  })
}

function emptySelections(): CharacterDraft['spellSelections'] {
  return { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] }
}

beforeEach(() => {
  parseCharacterDraft(undefined)
})

describe('MC-D04 法术选择的分桶存储', () => {
  it('多职业草稿的 JSON 往返回收 multiclass 与 classSpellSelections', () => {
    const buckets: ClassSpellSelections[] = [
      { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: ['spell-2014-cure-wounds'], preparedSpellIds: [], spellbookSpellIds: [] },
      { classId: 'class-2014-sorcerer', cantripIds: ['spell-2014-acid-splash'], knownSpellIds: ['spell-2014-blur'], preparedSpellIds: [], spellbookSpellIds: [] },
    ]
    const draft = mc(RANGER_SORCERER, { ...emptySelections(), classSpellSelections: buckets })
    const restored = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(draft))
    expect(restored.multiclass?.classes).toEqual(RANGER_SORCERER)
    expect(restored.multiclass?.levelOrder).toEqual(draft.multiclass?.levelOrder)
    expect(restored.spellSelections.classSpellSelections).toEqual(buckets)
    expect(restored.targetLevel).toBe(7)
    // 分桶读回后仍各归各职业
    expect(getSpellcastingScope(restored, 'class-2014-ranger')?.selections.knownSpellIds).toEqual(['spell-2014-cure-wounds'])
    expect(getSpellcastingScope(restored, 'class-2014-sorcerer')?.selections.cantripIds).toEqual(['spell-2014-acid-splash'])
  })

  it('单职业草稿的 JSON 往返不带 classSpellSelections（既有行为不变）', () => {
    const solo = draft2024({ ruleset: '5e-2014', classId: 'class-2014-sorcerer', targetLevel: 3, baseAbilities: ABILITIES })
    const restored = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(solo))
    expect(restored.spellSelections.classSpellSelections).toBeUndefined()
    expect(restored.multiclass).toBeUndefined()
    // 五个既有数组逐字段不变（迁移会补出规范化的空数组字段，属既有行为）
    for (const key of ['cantripIds', 'knownSpellIds', 'preparedSpellIds', 'spellbookSpellIds', 'transcribedSpellIds'] as const) {
      expect(restored.spellSelections[key]).toEqual(solo.spellSelections[key])
    }
  })
})

describe('MC-D04 停用记录的归属职业', () => {
  it('移除职业时把该职业的法术归档，并把 sourceKey 写成它自己', () => {
    const buckets: ClassSpellSelections[] = [
      { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: ['spell-2014-cure-wounds', 'spell-2014-alarm'], preparedSpellIds: [], spellbookSpellIds: [] },
      { classId: 'class-2014-sorcerer', cantripIds: ['spell-2014-acid-splash'], knownSpellIds: ['spell-2014-blur'], preparedSpellIds: [], spellbookSpellIds: [] },
    ]
    const draft = mc(RANGER_SORCERER, { ...emptySelections(), classSpellSelections: buckets })
    // 移除术士：只保留游侠 4 级
    const nextClasses: readonly ClassLevelEntry[] = [{ classId: 'class-2014-ranger', level: 4 }]
    const result = reconcileSpellSelections(draft, {
      nextClassId: 'class-2014-ranger',
      nextSubclassId: undefined,
      nextTargetLevel: 4,
      nextMulticlass: { enabled: true, primaryClassId: 'class-2014-ranger', classes: nextClasses, levelOrder: Array(4).fill('class-2014-ranger') as string[] },
      removedClassIds: ['class-2014-sorcerer'],
      reason: 'source-removed',
      invalidatedAt: '2026-10-11T00:00:00.000Z',
    })
    const sorcererEntries = result.archived.filter((entry) => entry.sourceKey === 'class-2014-sorcerer')
    expect(sorcererEntries.map((entry) => entry.spellId).sort()).toEqual(['spell-2014-acid-splash', 'spell-2014-blur'])
    expect(sorcererEntries.map((entry) => entry.originalBucket).sort()).toEqual(['cantripIds', 'knownSpellIds'])
    // 被移除职业的分桶被清空，保留职业的不受影响
    const nextSorcerer = result.spellSelections.classSpellSelections?.find((bucket) => bucket.classId === 'class-2014-sorcerer')
    const nextRanger = result.spellSelections.classSpellSelections?.find((bucket) => bucket.classId === 'class-2014-ranger')
    expect(nextSorcerer?.knownSpellIds).toEqual([])
    expect(nextSorcerer?.cantripIds).toEqual([])
    expect(nextRanger?.knownSpellIds).toEqual(['spell-2014-cure-wounds', 'spell-2014-alarm'])
  })

  it('降级但职业仍保留时，超出新环级上限的法术带上该职业的 sourceKey', () => {
    // 术士 3 级有 2 环法术；降到 1 级后最高只剩 1 环
    const buckets: ClassSpellSelections[] = [
      { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
      { classId: 'class-2014-sorcerer', cantripIds: [], knownSpellIds: ['spell-2014-blur', 'spell-2014-burning-hands'], preparedSpellIds: [], spellbookSpellIds: [] },
    ]
    const draft = mc(RANGER_SORCERER, { ...emptySelections(), classSpellSelections: buckets })
    const nextClasses: readonly ClassLevelEntry[] = [
      { classId: 'class-2014-ranger', level: 4 },
      { classId: 'class-2014-sorcerer', level: 1 },
    ]
    const result = reconcileSpellSelections(draft, {
      nextClassId: 'class-2014-ranger',
      nextSubclassId: undefined,
      nextTargetLevel: 5,
      nextMulticlass: { enabled: true, primaryClassId: 'class-2014-ranger', classes: nextClasses, levelOrder: [] as string[] },
      reason: 'level-reduced',
      invalidatedAt: '2026-10-11T00:00:00.000Z',
    })
    const blur = result.archived.find((entry) => entry.spellId === 'spell-2014-blur')
    expect(blur?.sourceKey).toBe('class-2014-sorcerer')
    // 1 环法术在术士 1 级仍然合法，不被归档
    expect(result.archived.some((entry) => entry.spellId === 'spell-2014-burning-hands')).toBe(false)
  })

  it('不提供 nextMulticlass 时保持单职业口径（sourceKey 为起始职业）', () => {
    const solo = draft2024({
      ruleset: '5e-2014',
      classId: 'class-2014-sorcerer',
      targetLevel: 3,
      baseAbilities: ABILITIES,
      spellSelections: { ...emptySelections(), knownSpellIds: ['spell-2014-blur'] },
    })
    const result = reconcileSpellSelections(solo, {
      nextClassId: 'class-2014-sorcerer',
      nextSubclassId: undefined,
      nextTargetLevel: 1,
      reason: 'level-reduced',
      invalidatedAt: '2026-10-11T00:00:00.000Z',
    })
    expect(result.archived[0]?.sourceKey).toBe('class-2014-sorcerer')
    expect(result.spellSelections.classSpellSelections).toBeUndefined()
  })
})

describe('MC-F01 完整角色包往返', () => {
  it('ZIP 往返保留 multiclass 与各职业法术分桶', async () => {
    Object.defineProperty(globalThis, 'Blob', { value: NodeBlob, configurable: true })
    const buckets: ClassSpellSelections[] = [
      { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: ['spell-2014-cure-wounds'], preparedSpellIds: [], spellbookSpellIds: [] },
      { classId: 'class-2014-sorcerer', cantripIds: ['spell-2014-fire-bolt'], knownSpellIds: ['spell-2014-blur'], preparedSpellIds: [], spellbookSpellIds: [] },
    ]
    const draft = mc(RANGER_SORCERER, { ...emptySelections(), classSpellSelections: buckets })
    const bytes = await CharacterPackageService.build(draft)
    const restored = await CharacterPackageService.import(new NodeBlob([bytes as BlobPart], { type: 'application/zip' }) as Blob)
    expect(restored.multiclass?.classes).toEqual(RANGER_SORCERER)
    expect(restored.targetLevel).toBe(7)
    expect(restored.spellSelections.classSpellSelections).toEqual(buckets)
  })
})
