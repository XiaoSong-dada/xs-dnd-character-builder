import type { EquipmentRule } from '@/types/rules'
import { equipmentEnglishName, inferMagicItemCategory } from '@/rules/data/equipment-metadata'

/**
 * 2024 规则魔法物品（2024《地下城主指南》XDMG）— 第一批：2024 新增的确认条目。
 * 效果摘要均为原创中文转述；稀有度/同调按 2024 规则登记。
 * 说明：2024 全量清单需以官方文本核对（当前批次为已确认的 2024 新增条目），
 * 与 2014 重叠的物品以 2024 规则为准（数值差异在校准时更新现有条目描述）。
 */

const sourceIds = ['dmg-2024-index'] as const
const allClassIds = [
  'class-2014-barbarian',
  'class-2014-bard',
  'class-2014-cleric',
  'class-2014-druid',
  'class-2014-fighter',
  'class-2014-monk',
  'class-2014-paladin',
  'class-2014-ranger',
  'class-2014-rogue',
  'class-2014-sorcerer',
  'class-2014-warlock',
  'class-2014-wizard',
] as const

type MagicSeed = Omit<EquipmentRule, 'classIds' | 'sourceIds' | 'englishName' | 'ruleset' | 'status' | 'attunement' | 'magicItemCategory'> &
  Partial<Pick<EquipmentRule, 'englishName' | 'status' | 'attunement' | 'magicItemCategory'>>

function m24(seed: MagicSeed): EquipmentRule {
  const { attunement = 'none', ...item } = seed
  return {
    englishName: equipmentEnglishName(seed.id),
    ruleset: '5e-2024',
    status: 'index-only',
    attunement,
    magicItemCategory: inferMagicItemCategory(seed.id, seed.category),
    ...item,
    classIds: allClassIds,
    sourceIds,
  }
}

export const magicItems2024: readonly EquipmentRule[] = [
  // ── 2024 新增：附魔系列（Enspelled）─────────────────────────────
  m24({
    id: 'enspelled-staff',
    name: '附魔法杖',
    description: '2024 规则新物品：内含一个指定法术的法杖，持握并专注时可施放其中法术（每日次数有限）。稀有度随所含法术环级提升（戏法常见至 5 环传说）。',
    category: 'magic',
    equippable: true,
    rarity: 'varies',
    attunement: 'required',
  }),
  m24({
    id: 'enspelled-weapon',
    name: '附魔武器',
    description: '2024 规则新物品：内含一个指定法术的魔法武器，持握并专注时可施放其中法术（每日次数有限）。稀有度随所含法术环级提升（戏法常见至 5 环传说）。',
    category: 'weapon',
    equippable: true,
    rarity: 'varies',
    attunement: 'required',
  }),
  m24({
    id: 'enspelled-amulet',
    name: '附魔护符',
    description: '2024 规则新物品：内含一个指定法术的护符，佩戴并专注时可施放其中法术（每日次数有限）。稀有度随所含法术环级提升（戏法常见至 5 环传说）。',
    category: 'magic',
    equippable: true,
    rarity: 'varies',
    attunement: 'required',
  }),

  // ── 2024 新增：徒手力量绑带（Wraps of Unarmed Power）────────────
  m24({
    id: 'wraps-of-unarmed-power-+1',
    name: '徒手力量绑带 +1',
    description: '2024 规则新物品：缠绕拳头的绑带，徒手攻击检定与伤害 +1，且徒手攻击可造成力场伤害。',
    category: 'magic',
    equippable: true,
    rarity: 'uncommon',
    magicBonus: 1,
  }),
  m24({
    id: 'wraps-of-unarmed-power-+2',
    name: '徒手力量绑带 +2',
    description: '2024 规则新物品：缠绕拳头的绑带，徒手攻击检定与伤害 +2，且徒手攻击可造成力场伤害。',
    category: 'magic',
    equippable: true,
    rarity: 'rare',
    magicBonus: 2,
  }),
  m24({
    id: 'wraps-of-unarmed-power-+3',
    name: '徒手力量绑带 +3',
    description: '2024 规则新物品：缠绕拳头的绑带，徒手攻击检定与伤害 +3，且徒手攻击可造成力场伤害。',
    category: 'magic',
    equippable: true,
    rarity: 'very-rare',
    magicBonus: 3,
  }),
]
