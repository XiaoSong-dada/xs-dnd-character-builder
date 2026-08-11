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
  damageDice: string,
  damageType: string,
  traits = '',
): EquipmentRule {
  const description = traits ? `${damageDice} ${damageType}伤害；${traits}。` : `${damageDice} ${damageType}伤害。`
  return item({ id, name, description, category: 'weapon', equippable: true, weaponKind, damageDice, damageType })
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
  item({ id: 'padded-armor', name: '衬甲', description: '轻甲，AC 11 + 敏捷调整值（不限）；无力量需求。', armorBase: 11, addsDexterityToArmor: true, category: 'armor', equippable: true }),
  item({ id: 'leather-armor', name: '皮甲', description: '轻甲，AC 11 + 敏捷调整值（不限）；无力量需求。', armorBase: 11, addsDexterityToArmor: true, category: 'armor', equippable: true }),
  item({ id: 'studded-leather', name: '镶钉皮甲', description: '轻甲，AC 12 + 敏捷调整值（不限）；无力量需求。', armorBase: 12, addsDexterityToArmor: true, category: 'armor', equippable: true }),
  item({ id: 'hide-armor', name: '兽皮甲', description: '中甲，AC 12 + 敏捷调整值（最多 +2）；无力量需求。', armorBase: 12, addsDexterityToArmor: true, armorDexterityCap: 2, category: 'armor', equippable: true }),
  item({ id: 'chain-shirt', name: '链甲衫', description: '中甲，AC 13 + 敏捷调整值（最多 +2）；无力量需求。', armorBase: 13, addsDexterityToArmor: true, armorDexterityCap: 2, category: 'armor', equippable: true }),
  item({ id: 'scale-mail', name: '鳞甲', description: '中甲，AC 14 + 敏捷调整值（最多 +2）；力量需求 14。', armorBase: 14, addsDexterityToArmor: true, armorDexterityCap: 2, category: 'armor', equippable: true }),
  item({ id: 'breastplate', name: '胸甲', description: '中甲，AC 14 + 敏捷调整值（最多 +2）；无力量需求。', armorBase: 14, addsDexterityToArmor: true, armorDexterityCap: 2, category: 'armor', equippable: true }),
  item({ id: 'half-plate', name: '半身板甲', description: '中甲，AC 15 + 敏捷调整值（最多 +2）；力量需求 15。', armorBase: 15, addsDexterityToArmor: true, armorDexterityCap: 2, category: 'armor', equippable: true }),
  item({ id: 'ring-mail', name: '环甲', description: '重甲，基础 AC 14；力量需求 13；隐蔽劣势。', armorBase: 14, category: 'armor', equippable: true }),
  item({ id: 'chain-mail', name: '链甲', description: '重甲，基础 AC 16；力量需求 13；隐蔽劣势。', armorBase: 16, category: 'armor', equippable: true }),
  item({ id: 'splint-armor', name: '板条甲', description: '重甲，基础 AC 17；力量需求 15；隐蔽劣势。', armorBase: 17, category: 'armor', equippable: true }),
  item({ id: 'plate-armor', name: '板甲', description: '重甲，基础 AC 18；力量需求 15；隐蔽劣势。', armorBase: 18, category: 'armor', equippable: true }),
  item({ id: 'shield', name: '盾牌', description: '装备时 AC +2；需一只手持握。', armorClassBonus: 2, category: 'shield', equippable: true }),

  weapon('club', '木棒', 'simple-melee', '1d4', '钝击', '轻'),
  weapon('dagger', '匕首', 'simple-melee', '1d4', '穿刺', '灵巧、轻、投掷 6/18 米'),
  weapon('greatclub', '巨棒', 'simple-melee', '1d8', '钝击', '双手'),
  weapon('handaxe', '手斧', 'simple-melee', '1d6', '挥砍', '轻、投掷 6/18 米'),
  weapon('javelin', '标枪', 'simple-melee', '1d6', '穿刺', '投掷 9/36 米'),
  weapon('light-hammer', '轻锤', 'simple-melee', '1d4', '钝击', '轻、投掷 6/18 米'),
  weapon('mace', '硬头锤', 'simple-melee', '1d6', '钝击'),
  weapon('quarterstaff', '长棍', 'simple-melee', '1d6', '钝击', '多用 1d8（双手）'),
  weapon('sickle', '镰刀', 'simple-melee', '1d4', '挥砍', '轻'),
  weapon('spear', '矛', 'simple-melee', '1d6', '穿刺', '投掷 6/18 米、多用 1d8（双手）'),
  weapon('light-crossbow', '轻弩', 'simple-ranged', '1d8', '穿刺', '弹药 24/96 米、装填、双手'),
  weapon('dart', '飞镖', 'simple-ranged', '1d4', '穿刺', '灵巧、投掷 6/18 米'),
  weapon('shortbow', '短弓', 'simple-ranged', '1d6', '穿刺', '弹药 24/96 米、双手'),
  weapon('sling', '投石索', 'simple-ranged', '1d4', '钝击', '弹药 9/36 米'),
  weapon('battleaxe', '战斧', 'martial-melee', '1d8', '挥砍', '多用 1d10（双手）'),
  weapon('flail', '连枷', 'martial-melee', '1d8', '钝击'),
  weapon('glaive', '长柄刀', 'martial-melee', '1d10', '挥砍', '重、触及 3 米、双手'),
  weapon('greataxe', '巨斧', 'martial-melee', '1d12', '挥砍', '重、双手'),
  weapon('greatsword', '巨剑', 'martial-melee', '2d6', '挥砍', '重、双手'),
  weapon('halberd', '戟', 'martial-melee', '1d10', '挥砍', '重、触及 3 米、双手'),
  weapon('lance', '骑枪', 'martial-melee', '1d12', '穿刺', '触及 3 米；骑乘时对 1.5 米内目标攻击劣势'),
  weapon('longsword', '长剑', 'martial-melee', '1d8', '挥砍', '多用 1d10（双手）'),
  weapon('maul', '巨锤', 'martial-melee', '2d6', '钝击', '重、双手'),
  weapon('morningstar', '晨星', 'martial-melee', '1d8', '穿刺'),
  weapon('pike', '长矛', 'martial-melee', '1d10', '穿刺', '重、触及 3 米、双手'),
  weapon('rapier', '刺剑', 'martial-melee', '1d8', '穿刺', '灵巧'),
  weapon('scimitar', '弯刀', 'martial-melee', '1d6', '挥砍', '灵巧、轻'),
  weapon('shortsword', '短剑', 'martial-melee', '1d6', '穿刺', '灵巧、轻'),
  weapon('trident', '三叉戟', 'martial-melee', '1d6', '穿刺', '投掷 6/18 米、多用 1d8（双手）'),
  weapon('war-pick', '战镐', 'martial-melee', '1d8', '穿刺'),
  weapon('warhammer', '战锤', 'martial-melee', '1d8', '钝击', '多用 1d10（双手）'),
  weapon('whip', '鞭', 'martial-melee', '1d4', '挥砍', '灵巧、触及 3 米'),
  weapon('blowgun', '吹箭筒', 'martial-ranged', '1', '穿刺', '弹药 7.5/30 米、装填'),
  weapon('hand-crossbow', '手弩', 'martial-ranged', '1d6', '穿刺', '弹药 9/36 米、轻、装填'),
  weapon('heavy-crossbow', '重弩', 'martial-ranged', '1d10', '穿刺', '弹药 30/120 米、重、装填、双手'),
  weapon('longbow', '长弓', 'martial-ranged', '1d8', '穿刺', '弹药 45/180 米、重、双手'),
  weapon('net', '网', 'martial-ranged', '', '', '投掷 1.5/4.5 米；命中使目标束缚（无伤害）'),

  gear('arrows', '箭', '弓用弹药，一袋 20 支。'),
  gear('bolts', '弩矢', '弩用弹药，一盒 20 支。'),
  gear('quiver', '箭袋', '可装 20 支箭的箭袋。'),
  gear('backpack', '背包', '可背负约 15 千克物品。'),
  gear('bedroll', '铺盖', '野外睡眠用铺盖。'),
  gear('mess-kit', '餐具组', '便携餐具与炊具。'),
  gear('tinderbox', '火绒盒', '打火用具，可点燃火把等。'),
  gear('torch', '火把', '燃烧 1 小时，照亮 6 米（明亮）并向外 6 米（微光）。'),
  gear('rations', '口粮', '供一人一天所需的干粮。'),
  gear('waterskin', '水袋', '可盛约 2 升水的皮袋。'),
  gear('hempen-rope-50', '50尺麻绳', '15 米麻绳，可承重拉拽。'),
  gear('silk-rope-50', '50尺丝绳', '15 米丝绳，比麻绳更轻更结实。'),
  gear('ball-bearings-bag', '一袋滚珠', '撒出覆盖 3 米方块，经过者敏捷豁免失败倒地。'),
  gear('string-10', '10尺细绳', '3 米细绳。'),
  gear('bell', '铃铛', '发声用铃铛。'),
  gear('candle', '蜡烛', '燃烧 1 小时，照亮 1.5 米。'),
  gear('crowbar', '撬棍', '杠杆撬动物体时力量检定优势。'),
  gear('hammer', '锤子', '普通锤子。'),
  gear('piton', '岩钉', '攀岩与固定绳索用岩钉。'),
  gear('hooded-lantern', '附盖提灯', '点燃后照亮 9 米（明亮）并向外 9 米（微光），可盖住遮光。'),
  gear('oil-flask', '油瓶', '约 0.5 升灯油，可泼洒并点燃。'),
  gear('chest', '箱子', '可上锁的储物箱。'),
  gear('map-case', '地图或卷轴匣', '存放地图与卷轴的匣子。'),
  gear('ink-bottle', '墨水瓶', '一瓶墨水。'),
  gear('ink-pen', '墨水笔', '书写用笔。'),
  gear('lamp', '油灯', '照亮 9 米（明亮）并向外 9 米（微光），燃烧 6 小时。'),
  gear('paper-sheet', '纸张', '一张纸。'),
  gear('parchment-sheet', '羊皮纸', '一张羊皮纸。'),
  gear('perfume-vial', '香水瓶', '一小瓶香水。'),
  gear('sealing-wax', '封蜡', '密封信封用的蜡。'),
  gear('soap', '肥皂', '清洁用肥皂。'),
  gear('alms-box', '布施盒', '收集施舍的盒子。'),
  gear('incense-block', '熏香块', '熏香块。'),
  gear('censer', '香炉', '焚香用香炉。'),
  gear('blanket', '毯子', '保暖毯子。'),
  gear('lore-book', '知识书籍', '一本知识书籍。'),
  gear('sand-pouch', '小袋细沙', '一小袋细沙，可撒在纸上吸墨。'),
  gear('small-knife', '小刀', '一把小刀。'),
  gear('common-clothes', '普通服装', '一套普通服装。'),
  gear('travelers-clothes', '旅行服装', '一套耐磨的旅行服装。'),
  gear('fine-clothes', '华服', '一套华贵服装。'),
  gear('costume', '戏服', '一套戏服。'),
  gear('vestments', '法衣', '仪式用宗教法衣。'),
  gear('prayer-book', '祷告书或转经轮', '祷告用书或转经轮。'),
  gear('incense-stick', '香', '一支香。'),
  gear('favor-token', '仰慕者的信物', '一位仰慕者赠送的信物。'),
  gear('shovel', '铲子', '挖掘用铲子。'),
  gear('iron-pot', '铁锅', '烹饪用铁锅。'),
  gear('introduction-letter', '行会介绍信', '证明行会成员身份的介绍信。'),
  gear('scroll-case-notes', '装有研究笔记的卷轴匣', '装有研究笔记的卷轴匣。'),
  gear('signet-ring', '图章戒指', '刻有家族徽记的图章戒指。'),
  gear('pedigree-scroll', '谱系卷轴', '家族谱系卷轴。'),
  gear('hunting-trap', '捕猎陷阱', '可设置捕捉小型动物的陷阱。'),
  gear('hunting-trophy', '狩猎战利品', '一件狩猎战利品。'),
  gear('colleague-letter', '已故同僚的来信', '已故同僚寄来的信。'),
  gear('belaying-pin', '系索栓', '船用系索栓，也可作临时武器。'),
  gear('lucky-charm', '幸运符', '一件随身幸运符。'),
  gear('rank-insignia', '军衔徽记', '标明军衔的徽记。'),
  gear('enemy-trophy', '战败敌人的纪念品', '一件战败敌人的纪念品。'),
  gear('city-map', '出生城市地图', '出生城市的地图。'),
  gear('pet-mouse', '宠物小鼠', '一只宠物小鼠。'),
  gear('parent-token', '父母的纪念物', '父母留下的纪念物。'),
  gear('colored-liquid-bottles', '十个装有彩色液体的塞口瓶', '十个装有彩色液体的塞口瓶。'),
  gear('dark-hooded-clothes', '带兜帽的深色普通服装', '一套带兜帽的深色普通服装。'),
  gear('mule', '骡子', '驮运货物的骡子。'),
  gear('cart', '货车', '由骡子拉动的货车。'),
  gear('spellbook', '法术书', '法师记录法术的必备书册。'),

  tool('holy-symbol', '圣徽', '神圣施法法器；手持或佩戴用于施法。', true),
  tool('druidic-focus', '德鲁伊法器', '德鲁伊施法法器（槲寄生枝等）。', true),
  tool('arcane-focus', '奥术法器', '奥术施法法器（水晶、法杖等）。', true),
  tool('component-pouch', '材料包', '装有常用法术材料的小袋。', true),
  tool('thieves-tools', '盗贼工具', '开锁与解除陷阱的专用工具。'),
  tool('disguise-kit', '易容工具', '改变外观的道具与化妆品。'),
  tool('herbalism-kit', '草药工具', '采集与制作药剂的工具。'),
  tool('gaming-set', '一套赌具', '一套赌具（骰子、纸牌等）。'),
  tool('artisan-tools', '一套工匠工具', '一套工匠专业工具。'),
  tool('musical-instrument', '一件乐器', '一件可演奏的乐器。'),
  tool('lute', '鲁特琴', '一种弦乐器。'),
  tool('con-tools', '一种行骗工具', '行骗用的特殊工具。'),

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
