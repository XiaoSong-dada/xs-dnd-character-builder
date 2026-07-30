import type { EquipmentGrant, EquipmentRule } from '@/types/rules'

const sourceIds = ['basic-rules-2014'] as const
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

type EquipmentSeed = Omit<EquipmentRule, 'classIds' | 'sourceIds'>

function item(seed: EquipmentSeed): EquipmentRule {
  return { ...seed, classIds: allClassIds, sourceIds }
}

function gear(id: string, name: string, description = '随身物品。'): EquipmentRule {
  return item({ id, name, description, category: 'gear', equippable: false })
}

function tool(id: string, name: string, description = '工具或施法用品。', equippable = false): EquipmentRule {
  return item({ id, name, description, category: 'tool', equippable })
}

function weapon(
  id: string,
  name: string,
  weaponKind: NonNullable<EquipmentRule['weaponKind']>,
  description = '2014版起始武器。',
): EquipmentRule {
  return item({ id, name, description, category: 'weapon', equippable: true, weaponKind })
}

function pack(id: string, name: string, contents: readonly EquipmentGrant[]): EquipmentRule {
  return item({
    id,
    name,
    description: '领取时自动展开为套组内的具体物品。',
    category: 'gear',
    equippable: false,
    contents,
  })
}

const g = (itemId: string, quantity = 1): EquipmentGrant => ({ itemId, quantity })

export const equipment2014: readonly EquipmentRule[] = [
  item({ id: 'padded-armor', name: '衬甲', description: '轻甲，AC 11 + 敏捷调整值。', armorBase: 11, addsDexterityToArmor: true, category: 'armor', equippable: true }),
  item({ id: 'leather-armor', name: '皮甲', description: '轻甲，AC 11 + 敏捷调整值。', armorBase: 11, addsDexterityToArmor: true, category: 'armor', equippable: true }),
  item({ id: 'studded-leather', name: '镶钉皮甲', description: '轻甲，AC 12 + 敏捷调整值。', armorBase: 12, addsDexterityToArmor: true, category: 'armor', equippable: true }),
  item({ id: 'hide-armor', name: '兽皮甲', description: '中甲，AC 12 + 敏捷调整值（最多+2）。', armorBase: 12, addsDexterityToArmor: true, armorDexterityCap: 2, category: 'armor', equippable: true }),
  item({ id: 'chain-shirt', name: '链甲衫', description: '中甲，AC 13 + 敏捷调整值（最多+2）。', armorBase: 13, addsDexterityToArmor: true, armorDexterityCap: 2, category: 'armor', equippable: true }),
  item({ id: 'scale-mail', name: '鳞甲', description: '中甲，AC 14 + 敏捷调整值（最多+2）。', armorBase: 14, addsDexterityToArmor: true, armorDexterityCap: 2, category: 'armor', equippable: true }),
  item({ id: 'breastplate', name: '胸甲', description: '中甲，AC 14 + 敏捷调整值（最多+2）。', armorBase: 14, addsDexterityToArmor: true, armorDexterityCap: 2, category: 'armor', equippable: true }),
  item({ id: 'half-plate', name: '半身板甲', description: '中甲，AC 15 + 敏捷调整值（最多+2）。', armorBase: 15, addsDexterityToArmor: true, armorDexterityCap: 2, category: 'armor', equippable: true }),
  item({ id: 'ring-mail', name: '环甲', description: '重甲，基础AC 14。', armorBase: 14, category: 'armor', equippable: true }),
  item({ id: 'chain-mail', name: '链甲', description: '重甲，基础AC 16。', armorBase: 16, category: 'armor', equippable: true }),
  item({ id: 'splint-armor', name: '板条甲', description: '重甲，基础AC 17。', armorBase: 17, category: 'armor', equippable: true }),
  item({ id: 'plate-armor', name: '板甲', description: '重甲，基础AC 18。', armorBase: 18, category: 'armor', equippable: true }),
  item({ id: 'shield', name: '盾牌', description: '装备时AC +2。', armorClassBonus: 2, category: 'shield', equippable: true }),

  weapon('club', '木棒', 'simple-melee'),
  weapon('dagger', '匕首', 'simple-melee'),
  weapon('greatclub', '巨棒', 'simple-melee'),
  weapon('handaxe', '手斧', 'simple-melee'),
  weapon('javelin', '标枪', 'simple-melee'),
  weapon('light-hammer', '轻锤', 'simple-melee'),
  weapon('mace', '硬头锤', 'simple-melee'),
  weapon('quarterstaff', '长棍', 'simple-melee'),
  weapon('sickle', '镰刀', 'simple-melee'),
  weapon('spear', '矛', 'simple-melee'),
  weapon('light-crossbow', '轻弩', 'simple-ranged'),
  weapon('dart', '飞镖', 'simple-ranged'),
  weapon('shortbow', '短弓', 'simple-ranged'),
  weapon('sling', '投石索', 'simple-ranged'),
  weapon('battleaxe', '战斧', 'martial-melee'),
  weapon('flail', '连枷', 'martial-melee'),
  weapon('glaive', '长柄刀', 'martial-melee'),
  weapon('greataxe', '巨斧', 'martial-melee'),
  weapon('greatsword', '巨剑', 'martial-melee'),
  weapon('halberd', '戟', 'martial-melee'),
  weapon('lance', '骑枪', 'martial-melee'),
  weapon('longsword', '长剑', 'martial-melee'),
  weapon('maul', '巨锤', 'martial-melee'),
  weapon('morningstar', '晨星', 'martial-melee'),
  weapon('pike', '长矛', 'martial-melee'),
  weapon('rapier', '刺剑', 'martial-melee'),
  weapon('scimitar', '弯刀', 'martial-melee'),
  weapon('shortsword', '短剑', 'martial-melee'),
  weapon('trident', '三叉戟', 'martial-melee'),
  weapon('war-pick', '战镐', 'martial-melee'),
  weapon('warhammer', '战锤', 'martial-melee'),
  weapon('whip', '鞭', 'martial-melee'),
  weapon('blowgun', '吹箭筒', 'martial-ranged'),
  weapon('hand-crossbow', '手弩', 'martial-ranged'),
  weapon('heavy-crossbow', '重弩', 'martial-ranged'),
  weapon('longbow', '长弓', 'martial-ranged'),
  weapon('net', '网', 'martial-ranged'),

  gear('arrows', '箭'),
  gear('bolts', '弩矢'),
  gear('quiver', '箭袋'),
  gear('backpack', '背包'),
  gear('bedroll', '铺盖'),
  gear('mess-kit', '餐具组'),
  gear('tinderbox', '火绒盒'),
  gear('torch', '火把'),
  gear('rations', '口粮'),
  gear('waterskin', '水袋'),
  gear('hempen-rope-50', '50尺麻绳'),
  gear('silk-rope-50', '50尺丝绳'),
  gear('ball-bearings-bag', '一袋滚珠'),
  gear('string-10', '10尺细绳'),
  gear('bell', '铃铛'),
  gear('candle', '蜡烛'),
  gear('crowbar', '撬棍'),
  gear('hammer', '锤子'),
  gear('piton', '岩钉'),
  gear('hooded-lantern', '附盖提灯'),
  gear('oil-flask', '油瓶'),
  gear('chest', '箱子'),
  gear('map-case', '地图或卷轴匣'),
  gear('ink-bottle', '墨水瓶'),
  gear('ink-pen', '墨水笔'),
  gear('lamp', '油灯'),
  gear('paper-sheet', '纸张'),
  gear('parchment-sheet', '羊皮纸'),
  gear('perfume-vial', '香水瓶'),
  gear('sealing-wax', '封蜡'),
  gear('soap', '肥皂'),
  gear('alms-box', '布施盒'),
  gear('incense-block', '熏香块'),
  gear('censer', '香炉'),
  gear('blanket', '毯子'),
  gear('lore-book', '知识书籍'),
  gear('sand-pouch', '小袋细沙'),
  gear('small-knife', '小刀'),
  gear('common-clothes', '普通服装'),
  gear('travelers-clothes', '旅行服装'),
  gear('fine-clothes', '华服'),
  gear('costume', '戏服'),
  gear('vestments', '法衣'),
  gear('prayer-book', '祷告书或转经轮'),
  gear('incense-stick', '香'),
  gear('favor-token', '仰慕者的信物'),
  gear('shovel', '铲子'),
  gear('iron-pot', '铁锅'),
  gear('introduction-letter', '行会介绍信'),
  gear('scroll-case-notes', '装有研究笔记的卷轴匣'),
  gear('signet-ring', '图章戒指'),
  gear('pedigree-scroll', '谱系卷轴'),
  gear('hunting-trap', '捕猎陷阱'),
  gear('hunting-trophy', '狩猎战利品'),
  gear('colleague-letter', '已故同僚的来信'),
  gear('belaying-pin', '系索栓'),
  gear('lucky-charm', '幸运符'),
  gear('rank-insignia', '军衔徽记'),
  gear('enemy-trophy', '战败敌人的纪念品'),
  gear('city-map', '出生城市地图'),
  gear('pet-mouse', '宠物小鼠'),
  gear('parent-token', '父母的纪念物'),
  gear('colored-liquid-bottles', '十个装有彩色液体的塞口瓶'),
  gear('dark-hooded-clothes', '带兜帽的深色普通服装'),
  gear('mule', '骡子'),
  gear('cart', '货车'),
  gear('spellbook', '法术书', '法师记录法术的必备书册。'),

  tool('holy-symbol', '圣徽', '神圣施法法器。', true),
  tool('druidic-focus', '德鲁伊法器', '德鲁伊施法法器。', true),
  tool('arcane-focus', '奥术法器', '奥术施法法器。', true),
  tool('component-pouch', '材料包', '装有常用法术材料。', true),
  tool('thieves-tools', '盗贼工具'),
  tool('disguise-kit', '易容工具'),
  tool('herbalism-kit', '草药工具'),
  tool('gaming-set', '一套赌具'),
  tool('artisan-tools', '一套工匠工具'),
  tool('musical-instrument', '一件乐器'),
  tool('lute', '鲁特琴'),
  tool('con-tools', '一种行骗工具'),

  pack('burglar-pack', '窃贼套组', [
    g('backpack'), g('ball-bearings-bag'), g('string-10'), g('bell'), g('candle', 5), g('crowbar'),
    g('hammer'), g('piton', 10), g('hooded-lantern'), g('oil-flask', 2), g('rations', 5),
    g('tinderbox'), g('waterskin'), g('hempen-rope-50'),
  ]),
  pack('diplomat-pack', '外交官套组', [
    g('chest'), g('map-case', 2), g('fine-clothes'), g('ink-bottle'), g('ink-pen'), g('lamp'),
    g('oil-flask', 2), g('paper-sheet', 5), g('perfume-vial'), g('sealing-wax'), g('soap'),
  ]),
  pack('dungeoneer-pack', '地城探险套组', [
    g('backpack'), g('crowbar'), g('hammer'), g('piton', 10), g('torch', 10), g('tinderbox'),
    g('rations', 10), g('waterskin'), g('hempen-rope-50'),
  ]),
  pack('entertainer-pack', '艺人套组', [
    g('backpack'), g('bedroll'), g('costume', 2), g('candle', 5), g('rations', 5), g('waterskin'), g('disguise-kit'),
  ]),
  pack('explorer-pack', '探索套组', [
    g('backpack'), g('bedroll'), g('mess-kit'), g('tinderbox'), g('torch', 10), g('rations', 10),
    g('waterskin'), g('hempen-rope-50'),
  ]),
  pack('priest-pack', '祭司套组', [
    g('backpack'), g('blanket'), g('candle', 10), g('tinderbox'), g('alms-box'), g('incense-block', 2),
    g('censer'), g('vestments'), g('rations', 2), g('waterskin'),
  ]),
  pack('scholar-pack', '学者套组', [
    g('backpack'), g('lore-book'), g('ink-bottle'), g('ink-pen'), g('parchment-sheet', 10),
    g('sand-pouch'), g('small-knife'),
  ]),
]
