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
