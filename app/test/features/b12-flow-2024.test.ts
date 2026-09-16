import 'fake-indexeddb/auto'

import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'

import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { deriveCharacter } from '@/rules/derive'
import { getRulesRepository } from '@/rules/repositories'
import { applyResourceChange, applyRestRecovery, getResourceUsed, listSessionResources } from '@/rules/session-resources'
import { applyShortRest, createInitialSessionState } from '@/rules/session-state'
import { getAvailableSpells, getSpellcastingConfig } from '@/rules/spellcasting'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import { SessionStateStorageService } from '@/services/session-state-storage'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import { emptySpellSelections } from '../fixtures/draft-2024'

/** B12-02 双版全流程集成：串联草稿 Store、持久化、导入导出与跑团结算。 */
describe('B12-02 双版全流程集成', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('2024：改选失效/恢复、来源、刷新、JSON/ZIP 往返与跑团资源串联', async () => {
    const store = useCharacterDraftsStore()
    const draft = store.createDraft('5e-2024')
    const masterySelection = {
      checkpointId: 'class-2024-fighter-mastery-1',
      optionIds: ['equipment-2024-longsword', 'equipment-2024-shortsword'],
      confirmedAt: '2026-09-16T00:00:00.000Z',
    }
    store.updateDraft({
      classId: 'class-2024-fighter',
      targetLevel: 5,
      raceId: 'species-2024-human',
      backgroundId: 'background-2024-soldier',
      name: '集成验收战士',
      selections: [masterySelection],
      spellSelections: { ...emptySpellSelections() },
      inventory: [{ id: 'inv-2024-longsword', itemId: 'equipment-2024-longsword', quantity: 1, equippedQuantity: 1, sourceKind: 'adventure' }],
    })

    // 改选：失效选择保留原选项，恢复后重新生效。
    store.invalidateSelections(['class-2024-fighter-mastery-1'], '改选武器精通')
    const invalidated = store.activeDraft!.selections.find((item) => item.checkpointId === 'class-2024-fighter-mastery-1')!
    expect(invalidated.invalidatedAt).toBeTruthy()
    expect(invalidated.optionIds).toEqual(masterySelection.optionIds)
    store.updateDraft({ selections: [{ ...invalidated, invalidatedAt: undefined, invalidatedReason: undefined }] })
    expect(store.activeDraft?.selections.find((item) => item.checkpointId === 'class-2024-fighter-mastery-1')?.optionIds)
      .toEqual(masterySelection.optionIds)

    // 来源关闭与恢复：2024 核心来源始终启用，角色仍可解析。
    store.updateDraft({ enabledSourceIds: [] })
    expect(getRulesRepository('5e-2024').getClass('class-2024-fighter')).toBeDefined()
    store.updateDraft({ enabledSourceIds: ['source-2024-phb'] })

    // 跑团资源：消耗 → 短休回 1 → 长休回满；越界钳制。
    const resources = listSessionResources(store.activeDraft!, deriveCharacter(store.activeDraft!).modifiers)
    const secondWind = resources.find((item) => item.id === 'fighter-2024-class-second-wind')!
    expect(secondWind).toMatchObject({ max: 3, shortRestRecovery: 1 })
    const sessionState = { ...createInitialSessionState(draft.id, 40, 5), resourceUsage: { [secondWind.id]: 3 } }
    SessionStateStorageService.save(sessionState)
    expect(getResourceUsed(applyRestRecovery(sessionState, resources, 'short-rest'), secondWind.id)).toBe(2)
    expect(getResourceUsed(applyRestRecovery(sessionState, resources, 'long-rest'), secondWind.id)).toBe(0)
    expect(applyResourceChange({ ...sessionState, resourceUsage: {} }, secondWind.id, 1, secondWind.max).clamped).toBe(false)

    // 编辑协调：降级后已用资源按新上限钳制（3 → 2），升级回来保留语义。
    store.updateDraft({ targetLevel: 1 })
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage?.[secondWind.id]).toBe(2)
    store.updateDraft({ targetLevel: 5 })

    // 刷新：草稿与局内状态按 id 恢复（等待持久化 watch 落盘）。
    await nextTick()
    setActivePinia(createPinia())
    const reloaded = useCharacterDraftsStore()
    const restored = reloaded.drafts.find((item) => item.id === draft.id)
    expect(restored).toMatchObject({ ruleset: '5e-2024', classId: 'class-2024-fighter', name: '集成验收战士' })
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage?.[secondWind.id]).toBe(2)

    // JSON 往返。
    const imported = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(restored!))
    expect(imported).toMatchObject({ ruleset: '5e-2024', classId: 'class-2024-fighter', targetLevel: 5 })
    expect(imported.inventory).toEqual(restored!.inventory)
    expect(imported.selections).toEqual(restored!.selections)

    // ZIP 往返。
    const zip = await CharacterPackageService.build(restored!)
    const unpacked = await CharacterPackageService.import(new Blob([zip as BlobPart], { type: 'application/zip' }))
    expect(unpacked).toMatchObject({ ruleset: '5e-2024', classId: 'class-2024-fighter', targetLevel: 5 })

    // 导出模型：装备攻击与资源区块可用，无阻断诊断。
    const model = buildCharacterExportModel(unpacked, deriveCharacter(unpacked))
    expect(model.attacks.map((attack) => attack.name)).toContain('长剑')
    expect(model.resources.find((item) => item.name === '回气')).toMatchObject({ max: 3 })
    expect(model.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
  })

  it('2014：来源关闭/恢复影响候选，既有数据与休息语义保持', () => {
    const store = useCharacterDraftsStore()
    const draft = store.createDraft('5e-2014')
    const TARGET_SPELL = 'spell-2014-absorb-elements'

    store.updateDraft({ classId: 'class-2014-wizard', targetLevel: 3, enabledSourceIds: ['phb-2014-index'] })
    const closed = store.activeDraft!
    expect(getAvailableSpells(closed, getSpellcastingConfig(closed)!).some((spell) => spell.id === TARGET_SPELL)).toBe(false)

    store.updateDraft({ enabledSourceIds: ['phb-2014-index', 'xgte-2017-index'] })
    const enabled = store.activeDraft!
    expect(getAvailableSpells(enabled, getSpellcastingConfig(enabled)!).some((spell) => spell.id === TARGET_SPELL)).toBe(true)

    // 再次关闭来源：已持有的扩展物品与已选法术保留，不自动删除或迁移。
    store.updateDraft({
      enabledSourceIds: ['phb-2014-index'],
      inventory: [{ id: 'inv-gleaming', itemId: 'armor-of-gleaming', quantity: 1, equippedQuantity: 0, sourceKind: 'adventure' }],
      spellSelections: { ...emptySpellSelections(), preparedSpellIds: [TARGET_SPELL] },
    })
    expect(store.activeDraft?.inventory).toHaveLength(1)
    expect(store.activeDraft?.spellSelections.preparedSpellIds).toContain(TARGET_SPELL)

    // 2014 行为不变：不产生职业资源；短休仍回一半损失。
    expect(listSessionResources(store.activeDraft!, deriveCharacter(store.activeDraft!).modifiers)).toEqual([])
    const legacyState = { ...createInitialSessionState(draft.id, 20), currentHp: 10 }
    expect(applyShortRest(legacyState, [], 20, { ruleset: '5e-2014' }).currentHp).toBe(15)
  })
})
