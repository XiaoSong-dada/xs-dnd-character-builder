import type { EquipmentRule } from '@/types/rules'

const sourceIds = ['basic-rules-2014'] as const

export const equipment2014: readonly EquipmentRule[] = [
  { id: 'chain-mail', name: '链甲', description: '重甲，基础 AC 16。', classIds: ['class-2014-fighter', 'class-2014-paladin'], armorBase: 16, category: 'armor', sourceIds },
  { id: 'leather-armor', name: '皮甲', description: '轻甲，AC 11 + 敏捷调整值。', classIds: ['class-2014-rogue'], armorBase: 11, addsDexterityToArmor: true, category: 'armor', sourceIds },
  { id: 'scale-mail', name: '鳞甲', description: '中甲，AC 14 + 敏捷调整值（最多+2）。', classIds: ['class-2014-ranger'], armorBase: 14, addsDexterityToArmor: true, armorDexterityCap: 2, category: 'armor', sourceIds },
  { id: 'shield', name: '盾牌', description: '装备时 AC +2。', classIds: ['class-2014-fighter', 'class-2014-barbarian', 'class-2014-paladin', 'class-2014-ranger'], armorClassBonus: 2, category: 'shield', sourceIds },
  { id: 'longsword', name: '长剑', description: '常用军用近战武器。', classIds: ['class-2014-fighter', 'class-2014-paladin'], category: 'weapon', sourceIds },
  { id: 'greataxe', name: '巨斧', description: '野蛮人常用双手近战武器。', classIds: ['class-2014-barbarian'], category: 'weapon', sourceIds },
  { id: 'handaxe', name: '手斧', description: '可用于近战或投掷。', classIds: ['class-2014-barbarian'], category: 'weapon', sourceIds },
  { id: 'javelin', name: '标枪', description: '野蛮人初始投掷武器。', classIds: ['class-2014-barbarian'], category: 'weapon', sourceIds },
  { id: 'shortsword', name: '短剑', description: '轻便近战武器。', classIds: ['class-2014-monk', 'class-2014-ranger'], category: 'weapon', sourceIds },
  { id: 'dart', name: '飞镖', description: '武僧初始远程武器。', classIds: ['class-2014-monk'], category: 'weapon', sourceIds },
  { id: 'rapier', name: '刺剑', description: '游荡者常用灵巧武器。', classIds: ['class-2014-rogue'], category: 'weapon', sourceIds },
  { id: 'shortbow', name: '短弓', description: '游荡者可选远程武器。', classIds: ['class-2014-rogue'], category: 'weapon', sourceIds },
  { id: 'longbow', name: '长弓', description: '游侠初始远程武器。', classIds: ['class-2014-ranger'], category: 'weapon', sourceIds },
  { id: 'holy-symbol', name: '圣徽', description: '圣武士施法法器。', classIds: ['class-2014-paladin'], category: 'tool', sourceIds },
  { id: 'thieves-tools', name: '盗贼工具', description: '游荡者的职业工具。', classIds: ['class-2014-rogue'], category: 'tool', sourceIds },
]
