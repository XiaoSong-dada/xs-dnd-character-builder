import type { EquipmentRule } from '@/types/rules'

const ACRONYMS: Readonly<Record<string, string>> = {
  ac: 'AC',
  gp: 'GP',
}

/**
 * 既有装备 ID 均以英文名生成；迁移阶段由稳定 ID 产生独立英文展示字段。
 * 特殊专名可在具体数据条目中显式覆盖，避免把中文展示名当作身份键。
 */
export function equipmentEnglishName(id: string): string {
  return id
    .split('-')
    .filter(Boolean)
    .map((part) => ACRONYMS[part] ?? (part.startsWith('+') ? part : `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`))
    .join(' ')
}

export function inferMagicItemCategory(
  id: string,
  category: EquipmentRule['category'],
): NonNullable<EquipmentRule['magicItemCategory']> {
  if (category === 'potion' || id.startsWith('potion-') || id.startsWith('philter-') || id.startsWith('oil-')) return 'potion'
  if (id.startsWith('ring-')) return 'ring'
  if (id.startsWith('rod-')) return 'rod'
  if (id.startsWith('spell-scroll') || id.startsWith('scroll-')) return 'scroll'
  if (id.startsWith('staff-')) return 'staff'
  if (id.startsWith('wand-')) return 'wand'
  if (category === 'armor' || category === 'shield') return 'armor'
  if (category === 'weapon' || id.startsWith('weapon-') || id.startsWith('ammunition-')) return 'weapon'
  return 'wondrous'
}

const ATTUNEMENT_CONDITION_BY_ID: Readonly<Record<string, string>> = {
  'all-purpose-tool-+1': '奇械师同调',
  'all-purpose-tool-+2': '奇械师同调',
  'all-purpose-tool-+3': '奇械师同调',
  'amulet-of-the-devout-+1': '牧师或圣武士同调',
  'amulet-of-the-devout-+2': '牧师或圣武士同调',
  'amulet-of-the-devout-+3': '牧师或圣武士同调',
  'arcane-grimoire-+1': '法师同调',
  'arcane-grimoire-+2': '法师同调',
  'arcane-grimoire-+3': '法师同调',
  'astral-shard': '术士同调',
  'bloodwell-vial-+1': '术士同调',
  'bloodwell-vial-+2': '术士同调',
  'bloodwell-vial-+3': '术士同调',
  'dragonhide-belt-+1': '武僧同调',
  'dragonhide-belt-+2': '武僧同调',
  'dragonhide-belt-+3': '武僧同调',
  'moon-sickle-+1': '德鲁伊或游侠同调',
  'moon-sickle-+2': '德鲁伊或游侠同调',
  'moon-sickle-+3': '德鲁伊或游侠同调',
  'natures-mantle': '德鲁伊或游侠同调',
  'rhythm-makers-drum-+1': '吟游诗人同调',
  'rhythm-makers-drum-+2': '吟游诗人同调',
  'rhythm-makers-drum-+3': '吟游诗人同调',
  'rod-of-the-pact-keeper-+1': '魔契师同调',
  'rod-of-the-pact-keeper-+2': '魔契师同调',
  'rod-of-the-pact-keeper-+3': '魔契师同调',
}

export function equipmentAttunementCondition(id: string): string | undefined {
  return ATTUNEMENT_CONDITION_BY_ID[id]
}
