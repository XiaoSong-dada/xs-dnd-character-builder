import type { EquipmentRule } from '@/types/rules'
import { dmgAttunementByEnglishName } from '@/rules/data/magic-items-dmg-catalog-2014'
import { magicItemsDmgCatalogIndex2014 } from '@/rules/data/generated/magic-items-catalog-index-2014'
import { equipmentAttunementCondition, equipmentEnglishName, inferMagicItemCategory } from '@/rules/data/equipment-metadata'

/**
 * 2014 魔法物品（DMG 2014 第 7 章）— 第一批：常见（common）与非普通（uncommon）全量。
 * 效果摘要均为原创中文转述（不复制原书正文）；稀有度/同调按 DMG 标注登记。
 * 罕见（rare）及以上（含 +2/+3 变体、神器）留待后续批次。
 */

const sourceIds = ['dmg-2014-index'] as const
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

function m(seed: MagicSeed): EquipmentRule {
  const { attunement: seedAttunement = 'none', attunementCondition, ...item } = seed
  const englishName = seed.englishName
    ?? magicItemsDmgCatalogIndex2014.find((candidate) => candidate.id === seed.id || candidate.name === seed.name)?.englishName
    ?? equipmentEnglishName(seed.id)
  const explicitCondition = attunementCondition ?? equipmentAttunementCondition(seed.id)
  const catalogAttunement = dmgAttunementByEnglishName[englishName.toLocaleLowerCase()]
  const condition = explicitCondition ?? (typeof catalogAttunement === 'string' ? catalogAttunement : undefined)
  return {
    englishName,
    ruleset: '5e-2014',
    status: 'selectable',
    attunement: condition ? 'conditional' : (seedAttunement === 'required' || catalogAttunement ? 'required' : 'none'),
    ...(condition ? { attunementCondition: condition } : {}),
    magicItemCategory: inferMagicItemCategory(seed.id, seed.category),
    ...item,
    classIds: allClassIds,
    sourceIds,
  }
}

/** 药水：不可装备。 */
function potion(id: string, name: string, description: string, rarity: NonNullable<EquipmentRule['rarity']>): EquipmentRule {
  return m({ id, name, description, category: 'potion', equippable: false, rarity })
}

/** 魔法奇物（护符/靴/斗篷/戒指/手持物等）：默认可装备（穿戴/持握），手持类传 equippable=false。 */
function wonder(id: string, name: string, description: string, rarity: NonNullable<EquipmentRule['rarity']>, equippable = true, attuned = false): EquipmentRule {
  return m({ id, name, description, category: 'magic', equippable, rarity, attunement: attuned ? 'required' : 'none' })
}

export const magicItems2014: readonly EquipmentRule[] = [
  // ── 药水（Potion）──────────────────────────────────────────────
  potion('potion-of-healing', '治疗药水', '饮用后立即恢复 2d4+2 点生命值。冒险者最常用的基础魔法药水。', 'common'),
  potion('potion-of-climbing', '攀爬药水', '饮用后 1 小时内获得等同步行速度的攀爬速度，攀爬检定不再因地形而劣势。', 'common'),
  potion('potion-of-greater-healing', '高等治疗药水', '饮用后立即恢复 4d4+4 点生命值。', 'uncommon'),
  potion('potion-of-superior-healing', '强效治疗药水', '饮用后立即恢复 8d4+8 点生命值。', 'rare'),
  potion('potion-of-supreme-healing', '极效治疗药水', '饮用后立即恢复 10d4+20 点生命值。', 'very-rare'),
  potion('potion-of-animal-friendship', '动物友谊药水', '饮用后 1 小时内，对野兽施放动物友谊法术时自动成功（DC 13）。', 'uncommon'),
  potion('potion-of-growth', '生长药水', '饮用后体型增大一级，力量检定与力量豁免获得优势，持续 10 分钟。', 'uncommon'),
  potion('potion-of-water-breathing', '水下呼吸药水', '饮用后 1 小时内可在水下呼吸。', 'uncommon'),
  potion('potion-of-giant-strength-hill', '巨人力量药水（山地巨人）', '饮用后 1 小时内力量值设为 21。', 'uncommon'),
  potion('potion-of-giant-strength-frost', '巨人力量药水（霜巨人）', '饮用后 1 小时内力量值设为 23。', 'uncommon'),
  potion('potion-of-cold-resistance', '寒冷抗力药水', '饮用后 1 小时内获得寒冷伤害抗力。', 'uncommon'),
  potion('potion-of-fire-resistance', '火焰抗力药水', '饮用后 1 小时内获得火焰伤害抗力。', 'uncommon'),
  potion('potion-of-force-resistance', '力场抗力药水', '饮用后 1 小时内获得力场伤害抗力。', 'uncommon'),
  potion('potion-of-lightning-resistance', '闪电抗力药水', '饮用后 1 小时内获得闪电伤害抗力。', 'uncommon'),
  potion('potion-of-necrotic-resistance', '死灵抗力药水', '饮用后 1 小时内获得死灵伤害抗力。', 'uncommon'),
  potion('potion-of-poison-resistance', '毒素抗力药水', '饮用后 1 小时内获得毒素伤害抗力。', 'uncommon'),
  potion('potion-of-psychic-resistance', '心灵抗力药水', '饮用后 1 小时内获得心灵伤害抗力。', 'uncommon'),
  potion('potion-of-radiant-resistance', '光辉抗力药水', '饮用后 1 小时内获得光辉伤害抗力。', 'uncommon'),
  potion('potion-of-thunder-resistance', '雷鸣抗力药水', '饮用后 1 小时内获得雷鸣伤害抗力。', 'uncommon'),
  potion('potion-of-poison', '毒药水', '【诅咒物品】外观与效果疑似治疗药水；饮用者受 3d6 毒素伤害并中毒。以侦测毒素与疾病可识破。', 'uncommon'),

  // ── 魔法护甲 / 盾牌 / 武器（+1 系列与特殊材质）──────────────────
  m({ id: 'armor-+1', name: '护甲 +1', description: '魔法护甲：穿戴时 AC 额外 +1。可附着于任意护甲（按所选护甲基础计算）。', category: 'armor', equippable: true, rarity: 'uncommon', magicBonus: 1 }),
  m({ id: 'shield-+1', name: '盾牌 +1', description: '魔法盾牌：持握时 AC 加值提升为 +3。', category: 'shield', equippable: true, rarity: 'uncommon', magicBonus: 1, armorClassBonus: 3 }),
  m({ id: 'weapon-+1', name: '武器 +1', description: '魔法武器：攻击检定与伤害骰 +1。可附着于任意武器（按所选武器基础计算）。', category: 'weapon', equippable: true, rarity: 'uncommon', magicBonus: 1 }),
  m({ id: 'ammunition-+1', name: '弹药 +1', description: '魔法弹药：发射时攻击检定与伤害 +1。命中后加值消失。', category: 'gear', equippable: false, rarity: 'uncommon', magicBonus: 1 }),
  m({ id: 'adamantine-armor', name: '精金护甲', description: '以精金合金制成的护甲：穿戴者受到的重击变为普通命中。可附着于任意中甲或重甲。', category: 'armor', equippable: true, rarity: 'uncommon' }),
  m({ id: 'mithral-armor', name: '秘银甲', description: '以秘银合金制成的护甲：无力量需求、不施加隐蔽劣势、重量减半。可附着于任意中甲或重甲。', category: 'armor', equippable: true, rarity: 'uncommon' }),
  m({ id: 'mariners-armor', name: '水手护甲', description: '航海护甲：穿戴者获得等同步行速度的游泳速度，水下无需呼吸。可附着于任意护甲。', category: 'armor', equippable: true, rarity: 'uncommon' }),
  m({ id: 'sentinel-shield', name: '警戒之盾', description: '持握时先攻检定和感知（察觉）检定具有优势。', category: 'shield', equippable: true, rarity: 'uncommon', armorClassBonus: 2 }),
  m({ id: 'weapon-of-warning', name: '警戒武器', description: '持有或携带时先攻检定优势；睡眠时保持警觉，不会因休息被突袭。', category: 'weapon', equippable: true, rarity: 'uncommon' }),
  m({ id: 'javelin-of-lightning', name: '闪电标枪', description: '掷出时可化为闪电束：目标与直线上 15 米内生物各受 4d6 闪电伤害。化雷后次日黎明恢复。', category: 'weapon', equippable: true, rarity: 'uncommon', weaponKind: 'simple-melee', damageDice: '1d6', damageType: '穿刺' }),

  // ── 魔法奇物（Wondrous Items）───────────────────────────────────
  wonder('alchemy-jug', '炼金壶', '每日可按下口令倒出指定液体：水、强酸、基础药膏、油、蜂蜜、醋、烈酒等，各有限量。', 'uncommon', false),
  wonder('amulet-of-proof-against-detection-and-location', '侦测定位防护护符', '同调后免疫预言系魔法对自身的侦测与定位，也无法被探知类效果找到。', 'uncommon', true, true),
  wonder('bag-of-holding', '次元袋', '袋内空间约 2.3 立方米、载重 250 千克，外观与普通袋子无异。放入超过容量或活物可能导致袋体撕裂。', 'uncommon', false),
  wonder('bag-of-tricks', '魔术袋', '伸入袋中可取出随机动物（按袋色对应不同动物表）；动物按你指令行动，1 小时后消失。', 'uncommon', false),
  wonder('boots-of-elvenkind', '精灵靴', '行走无声：潜行（敏捷-隐匿）检定获得优势。', 'uncommon', true),
  wonder('boots-of-striding-and-springing', '跳跑之靴', '步行速度提升至 9 米，跳跃距离增至三倍；不受负重与重甲的速度限制。', 'uncommon', true),
  wonder('boots-of-the-winterlands', '冬地靴', '同调后获得寒冷伤害抗力；可在冰面与雪地正常行走，不受地面环境影响。', 'uncommon', true, true),
  wonder('bracers-of-archery', '射手护腕', '同调后使用长弓或短弓时，伤害检定 +2。', 'uncommon', true, true),
  wonder('brooch-of-shielding', '护盾胸针', '佩戴时对魔法飞弹免疫，受到力场伤害时具有抗力。', 'uncommon', true),
  wonder('broom-of-flying', '飞天扫帚', '同调后可骑乘扫帚飞行，速度 15 米（负载不超过 180 千克）；可悬停与按口令行动。', 'uncommon', true, true),
  wonder('cap-of-water-breathing', '水下呼吸帽', '戴上后可在水下呼吸。', 'uncommon', true),
  wonder('circlet-of-blasting', '爆裂头环', '可施放灼热射线（3 道射线，命中各造成 2d6 火焰伤害）。使用后次日黎明恢复。', 'uncommon', true),
  wonder('cloak-of-elvenkind', '精灵斗篷', '披上后难以被看见：潜行（敏捷-隐匿）检定优势，且观察者难以将目光锁定在你身上。', 'uncommon', true),
  wonder('cloak-of-protection', '防护斗篷', '同调后 AC 与所有豁免检定 +1。', 'uncommon', true, true),
  wonder('cloak-of-the-manta-ray', '蝠鲼斗篷', '披上后可在水下呼吸，并获得 18 米游泳速度。', 'uncommon', true),
  wonder('decanter-of-endless-water', '无尽水壶', '按口令可倒出清水（细流/喷泉/高压水柱），水不会耗尽。', 'uncommon', false),
  wonder('deck-of-illusions', '幻象牌组', '抽出卡牌可投影一个中体型生物的幻象（需专注维持，最多 6 分钟），每日次数有限。', 'uncommon', false),
  wonder('driftglobe', '漂浮之球', '可发出日光或微光照明（按口令切换），可指令其漂浮跟随。', 'uncommon', false),
  wonder('dust-of-disappearance', '消失粉尘', '洒出后，粉尘周围 3 米内的生物与物体隐形 2d4 分钟。', 'uncommon', false),
  wonder('dust-of-dryness', '干燥粉尘', '可吸收 45 立方米水体凝结成小球；掷出小球破碎时对目标造成 5d6 水压伤害。', 'uncommon', false),
  wonder('dust-of-sneezing-and-choking', '喷嚏窒息粉尘', '【诅咒物品】吸入者须通过体质豁免，否则喷嚏不止无法说话，且可能失去行动力。', 'uncommon', false),
  wonder('elemental-gem', '元素宝石', '击碎宝石可召唤一个元素（火/水/土/风，按宝石种类），为你服务 1 小时。', 'uncommon', false),
  wonder('eyes-of-charming', '魅惑之眼', '同调后凝视一个生物可对其施放魅惑人类（豁免 DC 13）。使用后次日黎明恢复。', 'uncommon', true, true),
  wonder('eyes-of-minute-seeing', '微观视觉之眼', '佩戴后近距离观察微小细节（如锁内结构）时相关检定获得优势。', 'uncommon', true),
  wonder('eyes-of-the-eagle', '鹰眼', '佩戴后感知（观察）检定获得优势。', 'uncommon', true),
  wonder('gauntlets-of-ogre-power', '食人魔力量护手', '同调后力量值设为 19。', 'uncommon', true, true),
  wonder('gloves-of-missile-snaring', '接弹手套', '可用反应接住射向你的远程武器攻击（敏捷豁免 DC 15），并可立即掷回。', 'uncommon', true),
  wonder('gloves-of-swimming-and-climbing', '游泳攀爬手套', '穿戴后获得等同步行速度的攀爬速度与游泳速度。', 'uncommon', true),
  wonder('gloves-of-thievery', '行窃手套', '巧手检定与开锁工具检定获得优势。', 'uncommon', true),
  wonder('goggles-of-night', '夜视镜', '戴上后在昏暗光线中视力如常，在黑暗中视为昏暗。', 'uncommon', true),
  wonder('hat-of-disguise', '易容帽', '可随意施放易容术改变自身外观。', 'uncommon', true),
  wonder('headband-of-intellect', '智力头带', '同调后智力值设为 19。', 'uncommon', true, true),
  wonder('helm-of-comprehending-languages', '通晓语言头盔', '戴上后可随意施放通晓语言。', 'uncommon', true),
  wonder('helm-of-telepathy', '心灵感应头盔', '同调后可探测思想（每日次数），并可向 9 米内生物发送心灵感应讯息。', 'uncommon', true, true),
  wonder('keoghtoms-ointment', '凯托姆药膏', '药膏 1 剂可治愈疾病与毒素，或恢复 2d8+2 点生命值；每日共 2 剂。', 'uncommon', false),
  wonder('lantern-of-revealing', '显形提灯', '点燃后，半径 9 米内隐形的生物与物体显形（轮廓可见）。', 'uncommon', false),
  wonder('lens-of-detection', '侦测透镜', '透过透镜观察时，可发现陷阱与隐蔽物（每日次数有限）。', 'uncommon', false),
  wonder('medallion-of-thoughts', '思绪徽章', '同调后可读取生物表层思想（豁免 DC 13，每日次数有限）。', 'uncommon', true, true),
  wonder('necklace-of-adaptation', '适应项链', '戴上后可水下呼吸，并对极端温度环境保持舒适。', 'uncommon', true),
  wonder('pearl-of-power', '法力再生珍珠', '持有时可恢复一个已消耗的法术位（1–3 环中任选）。每日一次。', 'uncommon', false),
  wonder('periapt-of-health', '健康护符', '佩戴者免疫疾病。', 'uncommon', true),
  wonder('periapt-of-wound-closure', '伤口愈合护符', '佩戴者死亡豁免成功时立即恢复 1 点生命值；短休时可用全部生命骰恢复生命。', 'uncommon', true),
  wonder('philter-of-love', '爱情灵药', '饮用者 10 分钟内对第一个见到的生物魅惑（视为亲密之人）。', 'uncommon', false),
  wonder('pipes-of-haunting', '慑魂风笛', '吹奏可使 9 米内听到的敌人恐惧（感知豁免 DC 15），持续 1 分钟。', 'uncommon', false),
  wonder('pipes-of-the-sewers', '下水道风笛', '吹奏可吸引 9 米内的老鼠与巨鼠，并通过魅力检定指挥它们。', 'uncommon', false),
  wonder('robe-of-useful-items', '实用物品袍', '袍上缝有魔法补丁，撕下可变成实用物品：铁梯、火把、麻袋、狗、镜、绳梯、水袋、木箱等。', 'uncommon', true),
  wonder('rope-of-climbing', '攀爬绳', '按口令可自行攀附墙面、打结、伸长（最长 18 米）并固定。', 'uncommon', false),
  wonder('saddle-of-the-cavalier', '骑士马鞍', '骑乘时落马豁免获得优势；装卸马鞍只需 1 动作。', 'uncommon', false),
  wonder('sending-stones', '传讯石', '成对的石头：向另一块石头的持有者发送 25 字以内的讯息（每日三次，无距离限制）。', 'uncommon', false),
  wonder('slippers-of-spider-climbing', '蛛行拖鞋', '同调后可在垂直表面与天花板上行走（双手空闲时）。', 'uncommon', true, true),
  wonder('stone-of-good-luck', '吉运之石（幸运石）', '同调后持有者的属性检定与豁免检定 +1。', 'uncommon', true, true),
  wonder('trident-of-fish-command', '鱼类号令三叉戟', '持握时可对鱼类施放动物号令（每日次数），并可与鱼类进行交流。', 'uncommon', true),
  wonder('wind-fan', '风之扇', '挥动可产生强风：吹灭火炬、掀翻小船、制造沙尘等（每日次数有限）。', 'uncommon', false),
  wonder('winged-boots', '飞翼之靴', '同调后获得 9 米飞行速度，可悬停；每日飞行总时长 4 小时。', 'uncommon', true, true),

  // ── 法杖 / 魔杖 / 法器 ─────────────────────────────────────────
  wonder('staff-of-the-python', '巨蟒法杖', '同调后可将法杖掷出，化作巨蟒（服从命令，持续 1 小时）；巨蟒死后可恢复。', 'uncommon', true, true),
  wonder('rod-of-the-pact-keeper-+1', '契约掌控者权杖 +1', '魔契师法器：法术攻击检定与法术豁免 DC +1（需魔契师同调）。', 'uncommon', true, true),
  wonder('wand-of-magic-detection', '探魔魔杖', '可施放侦测魔法（每日次数有限）。', 'uncommon', false),
  wonder('wand-of-magic-missiles', '魔法飞弹魔杖', '可施放魔法飞弹（3 发，每发 3 枚飞弹；每日次数有限）。', 'uncommon', false),
  wonder('wand-of-secrets', '秘钥魔杖', '用魔杖触碰可揭示附近 9 米内的暗门与隐藏物（每日次数有限）。', 'uncommon', false),
  wonder('wand-of-the-war-mage-+1', '战斗法师魔杖 +1', '魔杖可作为法器：法术攻击检定 +1（需施法者同调）。', 'uncommon', true, true),
  wonder('wand-of-web', '蛛网魔杖', '可施放蛛网术（每日次数有限，需施法者同调）。', 'uncommon', true, true),

  // ── 戒指（Ring）────────────────────────────────────────────────
  wonder('ring-of-jumping', '跳跃戒指', '穿戴后可随意施放跳跃术（跳跃距离三倍）。', 'uncommon', true),
  wonder('ring-of-mind-shielding', '心灵防护戒指', '同调后免疫读心与思想探测；死亡后灵魂可寄宿于戒指，由下一任佩戴者承载。', 'uncommon', true, true),
  wonder('ring-of-swimming', '游泳戒指', '穿戴后获得 12 米游泳速度。', 'uncommon', true),
  wonder('ring-of-warmth', '温暖戒指', '同调后获得寒冷伤害抗力，并耐受低至极寒的环境温度。', 'uncommon', true, true),
  wonder('ring-of-water-walking', '水上行走戒指', '穿戴后可在水面行走（可倾斜 90° 行走于液体表面）。', 'uncommon', true),

  // ── 卷轴（Spell Scroll）────────────────────────────────────────
  m({ id: 'spell-scroll-cantrip-1st', name: '法术卷轴（0–1 环）', description: '卷轴内蕴含一个 0–1 环法术：施法者按职业表通过智力/感知/魅力检定（DC 11）后成功施放，卷轴随即消散。', category: 'magic', equippable: false, rarity: 'common' }),
  m({ id: 'spell-scroll-2nd', name: '法术卷轴（2 环）', description: '卷轴内蕴含一个 2 环法术：施法者按职业表通过智力/感知/魅力检定（DC 12）后成功施放，卷轴随即消散。', category: 'magic', equippable: false, rarity: 'uncommon' }),

  // ── 吟游诗人乐器（Instrument of the Bards）─────────────────────
  wonder('instrument-of-the-bards-fochlucan-bandore', '吟游诗人乐器·福赫卢坎班多琴', '同调后奏乐可施放法术：浮空术、羽落术、动物交谈、妖火、舞光术（每日次数有限）。', 'uncommon', true, true),
  wonder('instrument-of-the-bards-mac-fuirmidh-cittern', '吟游诗人乐器·麦克弗米德西特琴', '同调后奏乐可施放法术：次级复原、动物交谈、妖火、舞光术（每日次数有限）。', 'uncommon', true, true),
  wonder('instrument-of-the-bards-doss-lute', '吟游诗人乐器·多斯鲁特琴', '同调后奏乐可施放法术：动物交谈、妖火、舞光术、好梦术（每日次数有限）。', 'uncommon', true, true),
]
