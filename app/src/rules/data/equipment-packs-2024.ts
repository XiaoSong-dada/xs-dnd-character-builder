import { equipment2024 } from '@/rules/data/equipment-2024'
import type { EquipmentGrant, EquipmentRule } from '@/types/rules'

const g = (itemId: string, quantity = 1): EquipmentGrant => ({ itemId, quantity })
const contents: Readonly<Record<string, readonly EquipmentGrant[]>> = {
  'equipment-2024-burglar-s-pack': [g('equipment-2024-backpack'), g('equipment-2024-ball-bearings'), g('equipment-2024-bell'), g('equipment-2024-candle', 10), g('equipment-2024-crowbar'), g('equipment-2024-lantern-hooded'), g('equipment-2024-oil', 7), g('equipment-2024-rations', 5), g('equipment-2024-rope'), g('equipment-2024-tinderbox'), g('equipment-2024-waterskin')],
  'equipment-2024-diplomat-s-pack': [g('equipment-2024-chest'), g('equipment-2024-clothes-fine'), g('equipment-2024-ink'), g('equipment-2024-ink-pen', 5), g('equipment-2024-lamp'), g('equipment-2024-case-map-or-scroll', 2), g('equipment-2024-oil', 4), g('equipment-2024-paper', 5), g('equipment-2024-parchment', 5), g('equipment-2024-perfume'), g('equipment-2024-tinderbox')],
  'equipment-2024-dungeoneer-s-pack': [g('equipment-2024-backpack'), g('equipment-2024-caltrops'), g('equipment-2024-crowbar'), g('equipment-2024-oil', 2), g('equipment-2024-rations', 10), g('equipment-2024-rope'), g('equipment-2024-tinderbox'), g('equipment-2024-torch', 10), g('equipment-2024-waterskin')],
  'equipment-2024-entertainer-s-pack': [g('equipment-2024-backpack'), g('equipment-2024-bedroll'), g('equipment-2024-bell'), g('equipment-2024-costume', 3), g('equipment-2024-mirror'), g('equipment-2024-oil', 8), g('equipment-2024-rations', 9), g('equipment-2024-tinderbox'), g('equipment-2024-waterskin')],
  'equipment-2024-explorer-s-pack': [g('equipment-2024-backpack'), g('equipment-2024-bedroll'), g('equipment-2024-oil', 2), g('equipment-2024-rations', 10), g('equipment-2024-rope'), g('equipment-2024-tinderbox'), g('equipment-2024-torch', 10), g('equipment-2024-waterskin')],
  'equipment-2024-priest-s-pack': [g('equipment-2024-backpack'), g('equipment-2024-blanket'), g('equipment-2024-holy-water'), g('equipment-2024-lamp'), g('equipment-2024-rations', 7), g('equipment-2024-robe'), g('equipment-2024-tinderbox')],
  'equipment-2024-scholar-s-pack': [g('equipment-2024-backpack'), g('equipment-2024-book'), g('equipment-2024-ink'), g('equipment-2024-ink-pen'), g('equipment-2024-lamp'), g('equipment-2024-oil', 10), g('equipment-2024-parchment', 10), g('equipment-2024-tinderbox')],
}

export const equipmentWithPacks2024: readonly EquipmentRule[] = equipment2024.map((item) =>
  contents[item.id] ? { ...item, contents: contents[item.id] } : item)
