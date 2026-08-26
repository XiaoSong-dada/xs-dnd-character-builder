import egtwSource from '../../../../docs/equipment/5e-2014/expansions/egtw-2020.md?raw'
import erftlwSource from '../../../../docs/equipment/5e-2014/expansions/erftlw-2019.md?raw'

import type { EquipmentRule } from '@/types/rules'

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ')
}

function stableId(englishName: string): string {
  return normalize(englishName).replace(/[^a-z0-9+]+/g, '-').replace(/^-|-$/g, '')
}

function rarity(metadata: string): NonNullable<EquipmentRule['rarity']> {
  if (metadata.includes('普通或非普通') || metadata.includes('多种')) return 'varies'
  if (metadata.includes('极珍稀') || metadata.includes('非常稀有')) return 'very-rare'
  if (metadata.includes('非普通')) return 'uncommon'
  if (metadata.includes('珍稀') || metadata.includes('稀有')) return 'rare'
  if (metadata.includes('传说')) return 'legendary'
  if (metadata.includes('神器')) return 'artifact'
  return 'common'
}

function magicCategory(metadata: string): NonNullable<EquipmentRule['magicItemCategory']> {
  if (metadata.includes('护甲')) return 'armor'
  if (metadata.includes('药水')) return 'potion'
  if (metadata.includes('戒指')) return 'ring'
  if (metadata.includes('权杖')) return 'rod'
  if (metadata.includes('卷轴')) return 'scroll'
  if (metadata.includes('法杖')) return 'staff'
  if (metadata.includes('魔杖')) return 'wand'
  if (metadata.includes('武器')) return 'weapon'
  return 'wondrous'
}

function parse(source: string, sourceTitle: string): EquipmentRule[] {
  const result: EquipmentRule[] = []
  for (const line of source.split(/\r?\n/)) {
    if (!line.startsWith('|') || /^\|\s*-/.test(line) || line.includes('| 中文名 |')) continue
    const [name, englishName, metadata, sourceId] = line.split('|').slice(1, -1).map((cell) => cell.trim())
    if (!name || !englishName || !metadata || !sourceId) continue
    const itemCategory = magicCategory(metadata)
    const attunementMetadata = metadata.match(/（需([^）]*同调)）/)?.[1]
    const condition = attunementMetadata && attunementMetadata !== '同调' ? attunementMetadata : undefined
    result.push({
      id: stableId(englishName),
      name,
      englishName,
      ruleset: '5e-2014',
      status: 'index-only',
      description: `来自《${sourceTitle}》的${metadata.split('，')[0] || '魔法物品'}索引；复杂效果与使用条件由桌面依据来源书裁定。`,
      classIds: [],
      equippable: false,
      category: itemCategory === 'armor' ? 'armor' : itemCategory === 'weapon' ? 'weapon' : itemCategory === 'potion' ? 'potion' : 'magic',
      rarity: rarity(metadata),
      magicItemCategory: itemCategory,
      attunement: condition ? 'conditional' : attunementMetadata ? 'required' : 'none',
      ...(condition ? { attunementCondition: condition } : {}),
      sourceIds: [sourceId],
    })
  }
  return result
}

export const magicItemsOfficialExpansions2014: readonly EquipmentRule[] = [
  ...parse(erftlwSource, '艾伯伦：战乱后的最后战争'),
  ...parse(egtwSource, '荒洲探险家指南'),
]

/** 重印条目保留原实体并合并来源；新增条目以 index-only 进入候选池。 */
export function mergeOfficialExpansionItems(
  base: readonly EquipmentRule[],
  expansions: readonly EquipmentRule[] = magicItemsOfficialExpansions2014,
): readonly EquipmentRule[] {
  const remaining = [...expansions]
  const merged = base.map((item) => {
    const index = remaining.findIndex((candidate) => candidate.id === item.id
      || normalize(candidate.name) === normalize(item.name)
      || normalize(candidate.englishName) === normalize(item.englishName))
    if (index < 0) return item
    const [candidate] = remaining.splice(index, 1)
    return { ...item, sourceIds: [...new Set([...item.sourceIds, ...candidate.sourceIds])] }
  })
  return [...merged, ...remaining]
}
