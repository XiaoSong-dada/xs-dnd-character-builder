import { describe, expect, it } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import {
  addAdventureItem,
  buildStartingEquipmentState,
  decreaseAdventureItem,
  increaseAdventureItem,
  isStartingEquipmentComplete,
  removeAdventureItem,
  updateEquippedQuantity,
} from '@/rules/starting-equipment'
import type { CharacterDraft, InventoryEntry } from '@/types/character'

function wizardDraft(patch: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    schemaVersion: 4,
    id: 'wizard-equipment',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 1,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-wizard',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-sage',
    backgroundSkillIds: ['skill-arcana', 'skill-history'],
    backgroundToolIds: [],
    languages: ['精灵语', '矮人语'],
    proficiencyReplacements: [],
    baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    selections: [],
    startingEquipmentSelections: [
      { groupId: 'wizard-weapon', optionId: 'quarterstaff', pickedItemIds: [] },
      { groupId: 'wizard-focus', optionId: 'arcane-focus', pickedItemIds: [] },
      { groupId: 'wizard-pack', optionId: 'scholar-pack', pickedItemIds: [] },
    ],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    equipmentNeedsReview: false,
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
    name: '伊莱恩',
    alignment: '',
    notes: '',
    currentStep: 'equipment',
    ...patch,
  }
}

describe('2014 starting equipment', () => {
  it('covers all twelve classes and thirty-five base backgrounds with resolvable item references', () => {
    expect(rulesRepository.classStartingEquipment).toHaveLength(13)
    const baseBackgrounds = rulesRepository.backgrounds.filter((background) => !background.parentBackgroundId)
    expect(baseBackgrounds).toHaveLength(35)

    const grants = [
      ...rulesRepository.classStartingEquipment.flatMap((profile) => [
        ...profile.fixedGrants,
        ...profile.groups.flatMap((group) => group.options.flatMap((option) => option.grants)),
      ]),
      ...rulesRepository.backgroundStartingEquipment.flatMap((profile) => profile.grants),
    ]
    expect(grants.every((grant) => Boolean(rulesRepository.getEquipment(grant.itemId)))).toBe(true)
    expect(rulesRepository.equipment.flatMap((item) => item.contents ?? [])
      .every((grant) => Boolean(rulesRepository.getEquipment(grant.itemId)))).toBe(true)
  })

  it('builds the complete wizard package, expands the scholar pack and merges sage equipment', () => {
    const draft = wizardDraft()
    const state = buildStartingEquipmentState(draft)
    const byId = new Map(state.inventory.map((entry) => [entry.itemId, entry]))

    expect(isStartingEquipmentComplete(draft)).toBe(true)
    expect(byId.get('spellbook')?.quantity).toBe(1)
    expect(byId.get('quarterstaff')?.equippedQuantity).toBe(1)
    expect(byId.get('arcane-focus')?.quantity).toBe(1)
    expect(byId.get('parchment-sheet')?.quantity).toBe(10)
    expect(byId.get('colleague-letter')?.sourceKind).toBe('background')
    expect(state.currency.gp).toBe(10)
  })

  it('validates constrained picks and preserves duplicate weapon quantities', () => {
    const fighter = rulesRepository.getClassStartingEquipment('class-2014-fighter')
    expect(fighter).toBeDefined()
    const draft = wizardDraft({
      classId: 'class-2014-fighter',
      startingEquipmentSelections: [
        { groupId: 'fighter-armor', optionId: 'chain-mail', pickedItemIds: [] },
        { groupId: 'fighter-primary', optionId: 'two-weapons', pickedItemIds: ['longsword', 'longsword'] },
        { groupId: 'fighter-ranged', optionId: 'handaxes', pickedItemIds: [] },
        { groupId: 'fighter-pack', optionId: 'explorer-pack', pickedItemIds: [] },
      ],
    })
    const state = buildStartingEquipmentState(draft)

    expect(isStartingEquipmentComplete(draft)).toBe(true)
    expect(state.inventory.find((entry) => entry.itemId === 'longsword')?.quantity).toBe(2)
    expect(isStartingEquipmentComplete({
      ...draft,
      startingEquipmentSelections: draft.startingEquipmentSelections.map((selection) =>
        selection.groupId === 'fighter-primary'
          ? { ...selection, pickedItemIds: ['dagger', 'dagger'] }
          : selection),
    })).toBe(false)
  })

  it('uses explicit variant replacements and keeps equipped quantity within ownership', () => {
    const gladiator = wizardDraft({
      backgroundId: 'background-2014-entertainer',
      backgroundVariantId: 'background-2014-entertainer-gladiator',
    })
    const state = buildStartingEquipmentState(gladiator)
    expect(state.inventory.some((entry) => entry.itemId === 'trident')).toBe(true)
    expect(state.inventory.some((entry) => entry.itemId === 'musical-instrument' && entry.sourceKind === 'background')).toBe(false)

    const quarterstaff = state.inventory.find((entry) => entry.itemId === 'quarterstaff')
    expect(quarterstaff).toBeDefined()
    const updated = updateEquippedQuantity(state.inventory, quarterstaff!.id, 99)
    expect(updated.find((entry) => entry.id === quarterstaff!.id)?.equippedQuantity).toBe(quarterstaff!.quantity)
  })

  it('preserves adventure entries when rebuilding starting equipment', () => {
    const draft = wizardDraft({
      inventory: [
        {
          id: 'adventure:wizard-equipment:longsword:1',
          itemId: 'longsword',
          quantity: 2,
          sourceKind: 'adventure',
          sourceId: 'adventure',
          equippedQuantity: 1,
        },
      ],
    })
    const state = buildStartingEquipmentState(draft)
    const adventure = state.inventory.find((entry) => entry.sourceKind === 'adventure')
    expect(adventure?.itemId).toBe('longsword')
    expect(adventure?.quantity).toBe(2)
    expect(adventure?.equippedQuantity).toBe(1)
  })

  it('addAdventureItem creates entries, merges into adventure first and clamps equipped quantity', () => {
    const draft = wizardDraft()
    const created = addAdventureItem(draft.inventory, draft.id, { itemId: 'torch', quantity: 2, equip: false })
    expect(created).toHaveLength(1)
    expect(created[0]).toMatchObject({ itemId: 'torch', quantity: 2, sourceKind: 'adventure', equippedQuantity: 0 })
    expect(created[0]?.id.startsWith('adventure:wizard-equipment:torch:')).toBe(true)

    // 合并到已有 adventure 条目（即使存在同 itemId 的其它来源条目也优先 adventure）。
    const withClass = [
      { id: 'class:wizard:torch', itemId: 'torch', quantity: 1, sourceKind: 'class', sourceId: 'class-2014-wizard', equippedQuantity: 0 },
      { id: 'adventure:wizard:torch:1', itemId: 'torch', quantity: 1, sourceKind: 'adventure', sourceId: 'adventure', equippedQuantity: 0 },
    ]
    const merged = addAdventureItem(withClass, 'wizard', { itemId: 'torch', quantity: 3, equip: true })
    expect(merged).toHaveLength(2)
    const adventureEntry = merged.find((entry) => entry.sourceKind === 'adventure')
    expect(adventureEntry?.quantity).toBe(4)
    expect(adventureEntry?.equippedQuantity).toBe(3)
    expect(merged.find((entry) => entry.sourceKind === 'class')?.quantity).toBe(1)

  // 只有职业/背景来源条目（无 adventure）时，不合并进该条目，新建独立 adventure 条目。
  const classOnly = [
    { id: 'class:wizard:torch', itemId: 'torch', quantity: 2, sourceKind: 'class', sourceId: 'class-2014-wizard', equippedQuantity: 1 },
  ]
  const freshAdventure = addAdventureItem(classOnly, 'wizard', { itemId: 'torch', quantity: 1, equip: false })
  expect(freshAdventure).toHaveLength(2)
  expect(freshAdventure.find((entry) => entry.sourceKind === 'class')?.quantity).toBe(2)
  expect(freshAdventure.find((entry) => entry.sourceKind === 'adventure')?.quantity).toBe(1)

    // 非装备合并不改变已装备数量。
    const mergedBag = addAdventureItem(withClass, 'wizard', { itemId: 'torch', quantity: 2, equip: false })
    expect(mergedBag.find((entry) => entry.sourceKind === 'adventure')?.quantity).toBe(3)
    expect(mergedBag.find((entry) => entry.sourceKind === 'adventure')?.equippedQuantity).toBe(0)

    // 装备数量不超过持有数量。
    const clamped = addAdventureItem([{ id: 'adventure:wizard:torch:1', itemId: 'torch', quantity: 1, sourceKind: 'adventure', sourceId: 'adventure', equippedQuantity: 1 }], 'wizard', { itemId: 'torch', quantity: 0, equip: true })
    expect(clamped).toHaveLength(1)
    expect(clamped[0]?.equippedQuantity).toBe(1)

    // quantity < 1 直接返回原数组。
    expect(addAdventureItem(draft.inventory, draft.id, { itemId: 'torch', quantity: 0, equip: false })).toBe(draft.inventory)
  })
})

describe('adventure item remove / decrease / increase', () => {
  function sampleInventory(): InventoryEntry[] {
    return [
      { id: 'adventure:1:torch:1', itemId: 'torch', quantity: 5, sourceKind: 'adventure', sourceId: 'adventure', equippedQuantity: 3 },
      { id: 'adventure:1:rope:1', itemId: 'rope', quantity: 1, sourceKind: 'adventure', sourceId: 'adventure', equippedQuantity: 0 },
      { id: 'class:wizard:quarterstaff', itemId: 'quarterstaff', quantity: 1, sourceKind: 'class', sourceId: 'class-2014-wizard', equippedQuantity: 1 },
    ]
  }

  it('删除冒险条目：按 id 移除，其余保留', () => {
    const next = removeAdventureItem(sampleInventory(), 'adventure:1:torch:1')
    expect(next).toHaveLength(2)
    expect(next.some((entry) => entry.id === 'adventure:1:torch:1')).toBe(false)
    expect(next.find((entry) => entry.id === 'adventure:1:rope:1')?.quantity).toBe(1)
    expect(next.find((entry) => entry.id === 'class:wizard:quarterstaff')?.quantity).toBe(1)
  })

  it('删除非 adventure 条目：原数组返回', () => {
    const inventory = sampleInventory()
    expect(removeAdventureItem(inventory, 'class:wizard:quarterstaff')).toBe(inventory)
    expect(removeAdventureItem(inventory, 'not-exist')).toBe(inventory)
  })

  it('减少指定数量：quantity 减 count，equippedQuantity 收缩到新数量', () => {
    const next = decreaseAdventureItem(sampleInventory(), 'adventure:1:torch:1', 3)
    const torch = next.find((entry) => entry.id === 'adventure:1:torch:1')
    expect(torch?.quantity).toBe(2)
    // 原装备 3 件收缩为 min(3, 2) = 2。
    expect(torch?.equippedQuantity).toBe(2)
    expect(next.find((entry) => entry.id === 'adventure:1:rope:1')?.quantity).toBe(1)
  })

  it('扣减至 0 或以下：整条移除', () => {
    const exact = decreaseAdventureItem(sampleInventory(), 'adventure:1:torch:1', 5)
    expect(exact.some((entry) => entry.id === 'adventure:1:torch:1')).toBe(false)

    const over = decreaseAdventureItem(sampleInventory(), 'adventure:1:torch:1', 99)
    expect(over.some((entry) => entry.id === 'adventure:1:torch:1')).toBe(false)
  })

  it('增加指定数量：quantity 加 count，equippedQuantity 不变', () => {
    const next = increaseAdventureItem(sampleInventory(), 'adventure:1:torch:1', 3)
    const torch = next.find((entry) => entry.id === 'adventure:1:torch:1')
    expect(torch?.quantity).toBe(8)
    expect(torch?.equippedQuantity).toBe(3)
  })

  it('增减非 adventure 条目：原数组返回；count < 1 也原样返回', () => {
    const inventory = sampleInventory()
    expect(decreaseAdventureItem(inventory, 'class:wizard:quarterstaff', 1)).toBe(inventory)
    expect(increaseAdventureItem(inventory, 'class:wizard:quarterstaff', 1)).toBe(inventory)
    expect(decreaseAdventureItem(inventory, 'adventure:1:torch:1', 0)).toBe(inventory)
    expect(increaseAdventureItem(inventory, 'adventure:1:torch:1', 0)).toBe(inventory)
  })

  it('不变量：所有操作后 equippedQuantity ≤ quantity 恒成立', () => {
    const base = sampleInventory()
    const operations: InventoryEntry[][] = [
      removeAdventureItem(base, 'adventure:1:torch:1'),
      decreaseAdventureItem(base, 'adventure:1:torch:1', 3),
      decreaseAdventureItem(base, 'adventure:1:torch:1', 5),
      increaseAdventureItem(base, 'adventure:1:torch:1', 3),
      decreaseAdventureItem(base, 'adventure:1:torch:1', 99),
    ]
    for (const inventory of operations) {
      expect(inventory.every((entry) => entry.equippedQuantity <= entry.quantity)).toBe(true)
    }
  })
})
