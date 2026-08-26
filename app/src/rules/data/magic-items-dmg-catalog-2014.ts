import aSource from '../../../../docs/equipment/5e-2014/magic-items/a.md?raw'
import artifactsSource from '../../../../docs/equipment/5e-2014/magic-items/artifacts.md?raw'
import bSource from '../../../../docs/equipment/5e-2014/magic-items/b.md?raw'
import cSource from '../../../../docs/equipment/5e-2014/magic-items/c.md?raw'
import dSource from '../../../../docs/equipment/5e-2014/magic-items/d.md?raw'
import efSource from '../../../../docs/equipment/5e-2014/magic-items/e-f.md?raw'
import ghSource from '../../../../docs/equipment/5e-2014/magic-items/g-h.md?raw'
import ijSource from '../../../../docs/equipment/5e-2014/magic-items/i-j.md?raw'
import klSource from '../../../../docs/equipment/5e-2014/magic-items/k-l.md?raw'
import mnSource from '../../../../docs/equipment/5e-2014/magic-items/m-n.md?raw'
import opSource from '../../../../docs/equipment/5e-2014/magic-items/o-p.md?raw'
import qrSource from '../../../../docs/equipment/5e-2014/magic-items/q-r.md?raw'
import sSource from '../../../../docs/equipment/5e-2014/magic-items/s.md?raw'
import tvSource from '../../../../docs/equipment/5e-2014/magic-items/t-v.md?raw'
import wzSource from '../../../../docs/equipment/5e-2014/magic-items/w-z.md?raw'

import type { EquipmentRule } from '@/types/rules'

const documents = [aSource, artifactsSource, bSource, cSource, dSource, efSource, ghSource, ijSource, klSource, mnSource, opSource, qrSource, sSource, tvSource, wzSource]

const rarityByLabel: Readonly<Record<string, NonNullable<EquipmentRule['rarity']>>> = {
  普通: 'common',
  常见: 'common',
  非普通: 'uncommon',
  稀有: 'rare',
  珍稀: 'rare',
  非常稀有: 'very-rare',
  极珍稀: 'very-rare',
  传说: 'legendary',
  神器: 'artifact',
}

/**
 * 由 5e 不全书 2014 DMG 分类页的物品标题行核对；这里只保存“是否及由谁同调”的元数据，
 * 不保存或复制规则正文。更新方式见 scripts/audit-dmg-attunement.mjs。
 */
export const dmgAttunementByEnglishName: Readonly<Record<string, string | true>> = {
  'amulet of health': true,
  'amulet of proof against detection and location': true,
  'amulet of the planes': true,
  'animated shield': true,
  'armor of invulnerability': true,
  'armor of resistance': true,
  'armor of vulnerability': true,
  'arrow-catching shield': true,
  'axe of the dwarvish lords': true,
  'belt of dwarvenkind': true,
  'belt of giant strength': true,
  'berserker axe': true,
  'book of exalted deeds': '善良阵营生物同调',
  'book of vile darkness': '邪恶阵营生物同调',
  'boots of levitation': true,
  'boots of speed': true,
  'boots of striding and springing': true,
  'boots of the winterlands': true,
  'bracers of archery': true,
  'bracers of defense': true,
  'brooch of shielding': true,
  'candle of invocation': true,
  'cloak of arachnida': true,
  'cloak of displacement': true,
  'cloak of elvenkind': true,
  'cloak of invisibility': true,
  'cloak of protection': true,
  'cloak of the bat': true,
  'crystal ball': true,
  'cube of force': true,
  'dancing sword': true,
  defender: true,
  'demon armor': true,
  'dragon scale mail': true,
  'dwarven thrower': '矮人同调',
  'efreeti chain': true,
  'eye of vecna': true,
  'eyes of charming': true,
  'eyes of the eagle': true,
  'flame tongue': true,
  'frost brand': true,
  'gauntlets of ogre power': true,
  'gem of seeing': true,
  'gloves of missile snaring': true,
  'gloves of swimming and climbing': true,
  'hammer of thunderbolts': true,
  'hand of vecna': true,
  'hat of disguise': true,
  'headband of intellect': true,
  'helm of brilliance': true,
  'helm of telepathy': true,
  'helm of teleportation': true,
  'holy avenger': '圣武士同调',
  'instrument of the bards': '吟游诗人同调',
  'ioun stone': true,
  'luck blade': true,
  'mace of disruption': true,
  'mace of terror': true,
  'mantle of spell resistance': true,
  'medallion of thoughts': true,
  moonblade: '精灵或半精灵、且为中立善良阵营的生物同调',
  'necklace of adaptation': true,
  'necklace of prayer beads': '牧师、德鲁伊或圣武士同调',
  'nine lives stealer': true,
  oathbow: true,
  'orb of dragonkind': true,
  'pearl of power': '施法者同调',
  'periapt of wound closure': true,
  'pipes of the sewers': true,
  'plate armor of etherealness': true,
  'ring of djinni summoning': true,
  'ring of elemental command': true,
  'ring of evasion': true,
  'ring of feather falling': true,
  'ring of free action': true,
  'ring of invisibility': true,
  'ring of jumping': true,
  'ring of mind shielding': true,
  'ring of protection': true,
  'ring of regeneration': true,
  'ring of resistance': true,
  'ring of shooting stars': '仅限夜晚的户外环境同调',
  'ring of spell storing': true,
  'ring of spell turning': true,
  'ring of telekinesis': true,
  'ring of the ram': true,
  'ring of warmth': true,
  'ring of x-ray vision': true,
  'scimitar of speed': true,
  'shield of missile attraction': true,
  'slippers of spider climbing': true,
  'spellguard shield': true,
  'staff of charming': '吟游诗人、牧师、德鲁伊、术士、魔契师或法师同调',
  'staff of fire': '德鲁伊、术士、魔契师或法师同调',
  'staff of frost': '德鲁伊、术士、魔契师或法师同调',
  'staff of healing': '吟游诗人、牧师或德鲁伊同调',
  'staff of power': '术士、魔契师或法师同调',
  'staff of striking': true,
  'staff of swarming insects': '吟游诗人、牧师、德鲁伊、术士、魔契师或法师同调',
  'staff of the adder': '牧师、德鲁伊或魔契师同调',
  'staff of the magi': '术士、魔契师或法师同调',
  'staff of the python': '牧师、德鲁伊或魔契师同调',
  'staff of the woodlands': '德鲁伊同调',
  'staff of thunder and lightning': true,
  'staff of withering': '牧师、德鲁伊或魔契师同调',
  'stone of good luck': true,
  'sun blade': true,
  'sword of answering': '阵营与剑相同的生物同调',
  'sword of kas': true,
  'sword of life stealing': true,
  'sword of sharpness': true,
  'sword of vengeance': true,
  'sword of wounding': true,
  'talisman of pure good': '善良阵营生物同调',
  'talisman of the sphere': true,
  'talisman of ultimate evil': '邪恶阵营生物同调',
  'tentacle rod': true,
  'trident of fish command': true,
  'wand of binding': '施法者同调',
  'wand of enemy detection': true,
  'wand of fear': true,
  'wand of fireballs': '施法者同调',
  'wand of lightning bolts': '施法者同调',
  'wand of orcus': true,
  'wand of paralysis': '施法者同调',
  'wand of polymorph': '施法者同调',
  'wand of the war mage': '施法者同调',
  'wand of web': '施法者同调',
  'wand of wonder': '施法者同调',
  'weapon of warning': true,
  'winged boots': true,
  'wings of flying': true,
}

function normalizeName(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ')
}

function stableId(englishName: string): string {
  return normalizeName(englishName)
    .replace(/\+1\/\+2\/\+3/g, 'plus-1-2-3')
    .replace(/[^a-z0-9+]+/g, '-')
    .replace(/^-|-$/g, '')
}

function rarityFrom(label: string | undefined, artifact: boolean): NonNullable<EquipmentRule['rarity']> {
  if (artifact) return 'artifact'
  const normalized = label?.trim() ?? ''
  if (normalized.includes('/') || normalized.includes('~') || normalized.includes('～')) return 'varies'
  return rarityByLabel[normalized] ?? 'varies'
}

function magicCategory(typeLabel: string, englishName: string): NonNullable<EquipmentRule['magicItemCategory']> {
  if (typeLabel.includes('护甲')) return 'armor'
  if (typeLabel.includes('药水') || /^(oil|philter|potion)\b/i.test(englishName)) return 'potion'
  if (typeLabel.includes('戒指')) return 'ring'
  if (typeLabel.includes('权杖')) return 'rod'
  if (typeLabel.includes('卷轴') || /^spell scroll\b/i.test(englishName)) return 'scroll'
  if (typeLabel.includes('法杖')) return 'staff'
  if (typeLabel.includes('魔杖')) return 'wand'
  if (typeLabel.includes('武器') || typeLabel.includes('弹药')) return 'weapon'
  return 'wondrous'
}

function equipmentCategory(category: NonNullable<EquipmentRule['magicItemCategory']>): EquipmentRule['category'] {
  if (category === 'armor') return 'armor'
  if (category === 'weapon') return 'weapon'
  if (category === 'potion') return 'potion'
  return 'magic'
}

function parseDocument(source: string): EquipmentRule[] {
  const artifact = source.startsWith('# 5e-2014 神器')
  const result: EquipmentRule[] = []
  let headers: string[] = []
  for (const rawLine of source.split(/\r?\n/)) {
    if (!rawLine.startsWith('|')) continue
    const cells = rawLine.split('|').slice(1, -1).map((cell) => cell.trim())
    if (cells.every((cell) => /^-+$/.test(cell))) continue
    if (cells.includes('中文名') && cells.includes('英文名')) {
      headers = cells
      continue
    }
    if (!headers.length || cells.length !== headers.length) continue
    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))
    const name = row['中文名']
    const englishName = row['英文名']
    const description = row['效果摘要（原创转述）']
    if (!name || !englishName || !description) continue
    const typeLabel = row['类型'] || (/^(oil|philter|potion)\b/i.test(englishName) ? '药水' : '奇物')
    const itemCategory = magicCategory(typeLabel, englishName)
    const rarity = rarityFrom(row['稀有度'], artifact)
    const attunementMetadata = dmgAttunementByEnglishName[normalizeName(englishName)]
    const aggregate = rarity === 'varies' || rarity === 'artifact' || /\+1\/\+2\/\+3/.test(englishName)
    result.push({
      id: stableId(englishName),
      name,
      englishName,
      ruleset: '5e-2014',
      status: aggregate ? 'index-only' : 'selectable',
      description,
      classIds: [],
      equippable: !aggregate && !['potion', 'scroll'].includes(itemCategory),
      category: equipmentCategory(itemCategory),
      rarity,
      magicItemCategory: itemCategory,
      attunement: typeof attunementMetadata === 'string' ? 'conditional' : attunementMetadata ? 'required' : 'none',
      ...(typeof attunementMetadata === 'string' ? { attunementCondition: attunementMetadata } : {}),
      sourceIds: ['dmg-2014-index'],
    })
  }
  return result
}

/** DMG 2014 A–Z/神器前置清单；聚合型号保留为 index-only，具体型号优先由既有手工条目覆盖。 */
export const magicItemsDmgCatalog2014: readonly EquipmentRule[] = documents.flatMap(parseDocument)

export function mergeDmgCatalog(
  curated: readonly EquipmentRule[],
  catalog: readonly EquipmentRule[] = magicItemsDmgCatalog2014,
): readonly EquipmentRule[] {
  const ids = new Set(curated.map((item) => item.id))
  const names = new Set(curated.map((item) => normalizeName(item.name)))
  const englishNames = new Set(curated.map((item) => normalizeName(item.englishName)))
  return [
    ...curated,
    ...catalog.filter((item) => !ids.has(item.id)
      && !names.has(normalizeName(item.name))
      && !englishNames.has(normalizeName(item.englishName))),
  ]
}
