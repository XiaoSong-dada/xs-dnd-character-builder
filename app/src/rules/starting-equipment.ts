import { rulesRepository } from '@/rules/repository'
import type {
  CharacterDraft,
  CurrencyWallet,
  InventoryEntry,
  InventorySourceKind,
  StartingEquipmentSelection,
} from '@/types/character'
import type { EquipmentGrant, EquipmentPickRule, StartingEquipmentOption } from '@/types/rules'

export const EMPTY_CURRENCY: CurrencyWallet = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }

export function getAllowedPickItems(pick: EquipmentPickRule) {
  return rulesRepository.equipment.filter((item) => {
    if (pick.allowedItemIds?.includes(item.id)) return true
    return Boolean(item.weaponKind && pick.allowedWeaponKinds?.includes(item.weaponKind))
  })
}

export function isStartingEquipmentComplete(draft: Pick<CharacterDraft, 'classId' | 'startingEquipmentSelections'>): boolean {
  const profile = draft.classId ? rulesRepository.getClassStartingEquipment(draft.classId) : undefined
  if (!profile) return false
  return profile.groups.every((group) => {
    const selection = draft.startingEquipmentSelections.find((item) => item.groupId === group.id)
    const selectedOption = group.options.find((item) => item.id === selection?.optionId)
    if (!selection || !selectedOption) return false
    if (!selectedOption.pick) return selection.pickedItemIds.length === 0
    if (selection.pickedItemIds.length !== selectedOption.pick.count) return false
    const allowedIds = new Set(getAllowedPickItems(selectedOption.pick).map((item) => item.id))
    return selection.pickedItemIds.every((itemId) => allowedIds.has(itemId))
  })
}

function expandGrant(grant: EquipmentGrant): readonly EquipmentGrant[] {
  const item = rulesRepository.getEquipment(grant.itemId)
  if (!item?.contents) return [grant]
  return item.contents.flatMap((content) => expandGrant({
    itemId: content.itemId,
    quantity: content.quantity * grant.quantity,
  }))
}

function optionGrants(option: StartingEquipmentOption, selection: StartingEquipmentSelection): readonly EquipmentGrant[] {
  return [
    ...option.grants.flatMap(expandGrant),
    ...selection.pickedItemIds.map((itemId) => ({ itemId, quantity: 1 })),
  ]
}

function buildEntries(
  sourceKind: Exclude<InventorySourceKind, 'legacy'>,
  sourceId: string,
  grants: readonly EquipmentGrant[],
  previous: readonly InventoryEntry[],
): InventoryEntry[] {
  const quantities = new Map<string, number>()
  for (const grant of grants.flatMap(expandGrant)) {
    quantities.set(grant.itemId, (quantities.get(grant.itemId) ?? 0) + grant.quantity)
  }
  return [...quantities].map(([itemId, quantity]) => {
    const oldEntry = previous.find((entry) => entry.sourceKind === sourceKind && entry.sourceId === sourceId && entry.itemId === itemId)
    return {
      id: `${sourceKind}:${sourceId}:${itemId}`,
      itemId,
      quantity,
      sourceKind,
      sourceId,
      equippedQuantity: Math.min(quantity, oldEntry?.equippedQuantity ?? 0),
    }
  })
}

function applyRecommendedEquipment(entries: readonly InventoryEntry[]): readonly InventoryEntry[] {
  const equippedIds = new Set(entries.filter((entry) => entry.equippedQuantity > 0).map((entry) => entry.itemId))
  const hasArmor = [...equippedIds].some((id) => rulesRepository.getEquipment(id)?.category === 'armor')
  const hasShield = [...equippedIds].some((id) => rulesRepository.getEquipment(id)?.category === 'shield')
  const hasWeapon = [...equippedIds].some((id) => rulesRepository.getEquipment(id)?.category === 'weapon')
  let equippedArmor = hasArmor
  let equippedShield = hasShield
  let equippedWeapon = hasWeapon

  return entries.map((entry) => {
    const item = rulesRepository.getEquipment(entry.itemId)
    if (!item?.equippable || entry.equippedQuantity > 0) return entry
    if (item.category === 'armor' && !equippedArmor) {
      equippedArmor = true
      return { ...entry, equippedQuantity: 1 }
    }
    if (item.category === 'shield' && !equippedShield) {
      equippedShield = true
      return { ...entry, equippedQuantity: 1 }
    }
    if (item.category === 'weapon' && !equippedWeapon) {
      equippedWeapon = true
      return { ...entry, equippedQuantity: 1 }
    }
    return entry
  })
}

export function buildStartingEquipmentState(
  draft: Pick<CharacterDraft, 'classId' | 'backgroundId' | 'backgroundVariantId' | 'startingEquipmentSelections' | 'inventory'>,
  autoEquip = true,
): { inventory: readonly InventoryEntry[]; currency: CurrencyWallet } {
  const classProfile = draft.classId ? rulesRepository.getClassStartingEquipment(draft.classId) : undefined
  const classGrants: EquipmentGrant[] = [...(classProfile?.fixedGrants ?? [])]

  for (const group of classProfile?.groups ?? []) {
    const selection = draft.startingEquipmentSelections.find((item) => item.groupId === group.id)
    const selectedOption = group.options.find((item) => item.id === selection?.optionId)
    if (selection && selectedOption) classGrants.push(...optionGrants(selectedOption, selection))
  }

  const backgroundSourceId = draft.backgroundVariantId ?? draft.backgroundId
  const backgroundProfile = backgroundSourceId
    ? rulesRepository.getBackgroundStartingEquipment(backgroundSourceId)
    : undefined
  const generated = [
    ...(draft.classId ? buildEntries('class', draft.classId, classGrants, draft.inventory) : []),
    ...(backgroundSourceId && backgroundProfile
      ? buildEntries('background', backgroundSourceId, backgroundProfile.grants, draft.inventory)
      : []),
    ...draft.inventory.filter((entry) => entry.sourceKind === 'legacy'),
    // 冒险获得物品由角色卡添加，重新编辑换职业/背景时保留（不静默删除）。
    ...draft.inventory.filter((entry) => entry.sourceKind === 'adventure'),
  ]

  return {
    inventory: autoEquip ? applyRecommendedEquipment(generated) : generated,
    currency: { ...EMPTY_CURRENCY, gp: backgroundProfile?.gp ?? 0 },
  }
}

export function updateEquippedQuantity(
  inventory: readonly InventoryEntry[],
  entryId: string,
  equippedQuantity: number,
): readonly InventoryEntry[] {
  return inventory.map((entry) => entry.id === entryId
    ? { ...entry, equippedQuantity: Math.max(0, Math.min(entry.quantity, equippedQuantity)) }
    : entry)
}

/** 添加冒险物品的入参。 */
export interface AdventureItemInput {
  readonly itemId: string
  /** 添加数量（≥1）。 */
  readonly quantity: number
  /** 是否直接装备（非可装备物品由调用方保证 equip=false）。 */
  readonly equip: boolean
}

/**
 * 向物品栏添加冒险获得物品：同 itemId 的 adventure 条目已存在时合并数量，
 * 否则新建 adventure 条目（不合并进职业/背景起始装备条目，避免污染其数量）；
 * 恒满足 equippedQuantity ≤ quantity。
 */
export function addAdventureItem(
  inventory: readonly InventoryEntry[],
  draftId: string,
  input: AdventureItemInput,
): readonly InventoryEntry[] {
  const { itemId, quantity, equip } = input
  if (quantity < 1) return inventory
  const existing = inventory.find((entry) => entry.itemId === itemId && entry.sourceKind === 'adventure')
  if (!existing) {
    return [
      ...inventory,
      {
        id: `adventure:${draftId}:${itemId}:${Date.now()}`,
        itemId,
        quantity,
        sourceKind: 'adventure',
        sourceId: 'adventure',
        equippedQuantity: equip ? quantity : 0,
      },
    ]
  }
  return inventory.map((entry) => {
    if (entry.id !== existing.id) return entry
    const nextQuantity = entry.quantity + quantity
    const nextEquipped = equip ? Math.min(nextQuantity, entry.equippedQuantity + quantity) : entry.equippedQuantity
    return { ...entry, quantity: nextQuantity, equippedQuantity: nextEquipped }
  })
}

/**
 * 移除指定的冒险获得物品条目（按 entry.id 精确匹配）；非 adventure 条目不可删除，原样返回。
 */
export function removeAdventureItem(
  inventory: readonly InventoryEntry[],
  entryId: string,
): readonly InventoryEntry[] {
  const target = inventory.find((entry) => entry.id === entryId)
  if (!target || target.sourceKind !== 'adventure') return inventory
  return inventory.filter((entry) => entry.id !== entryId)
}

/**
 * 将冒险获得物品数量减少 count（≥ 1）；装备数量同步收缩，恒满足 equippedQuantity ≤ quantity；
 * 数量减至 0 或以下时移除整条；非 adventure 条目原样返回。
 */
export function decreaseAdventureItem(
  inventory: readonly InventoryEntry[],
  entryId: string,
  count: number,
): readonly InventoryEntry[] {
  if (count < 1) return inventory
  const target = inventory.find((entry) => entry.id === entryId)
  if (!target || target.sourceKind !== 'adventure') return inventory
  const nextQuantity = target.quantity - count
  if (nextQuantity <= 0) return inventory.filter((entry) => entry.id !== entryId)
  return inventory.map((entry) =>
    entry.id === entryId
      ? { ...entry, quantity: nextQuantity, equippedQuantity: Math.min(entry.equippedQuantity, nextQuantity) }
      : entry,
  )
}

/**
 * 向冒险获得物品条目追加 count（≥ 1），等价于添加弹窗的同条目合并逻辑；
 * 仅增加物品栏数量，不改变装备数量（如需装备可另行装备/卸下）；非 adventure 条目原样返回。
 */
export function increaseAdventureItem(
  inventory: readonly InventoryEntry[],
  entryId: string,
  count: number,
): readonly InventoryEntry[] {
  if (count < 1) return inventory
  const target = inventory.find((entry) => entry.id === entryId)
  if (!target || target.sourceKind !== 'adventure') return inventory
  return inventory.map((entry) =>
    entry.id === entryId ? { ...entry, quantity: entry.quantity + count } : entry,
  )
}
