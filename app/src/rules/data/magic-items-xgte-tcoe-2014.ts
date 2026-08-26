import type { EquipmentRule } from '@/types/rules'
import { equipmentAttunementCondition, equipmentEnglishName, inferMagicItemCategory } from '@/rules/data/equipment-metadata'

/**
 * 扩展魔法物品（2014）— XGtE 常见魔法物品全量 + TCoE 刺青全量。
 * 效果摘要均为原创中文转述（不复制原书正文）；稀有度按各书标注登记。
 */

const xgteSourceIds = ['xgte-2017-index'] as const
const tcoeSourceIds = ['tcoe-2020-index'] as const
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
  'class-2014-artificer',
] as const

type MagicSeed = Omit<EquipmentRule, 'classIds' | 'sourceIds' | 'englishName' | 'ruleset' | 'status' | 'attunement' | 'magicItemCategory'> &
  Partial<Pick<EquipmentRule, 'englishName' | 'status' | 'attunement' | 'magicItemCategory'>>

function xg(seed: MagicSeed): EquipmentRule {
  const { attunement: seedAttunement = 'none', attunementCondition, ...item } = seed
  const condition = attunementCondition ?? equipmentAttunementCondition(seed.id)
  return {
    englishName: equipmentEnglishName(seed.id),
    ruleset: '5e-2014',
    status: 'selectable',
    attunement: condition ? 'conditional' : seedAttunement,
    ...(condition ? { attunementCondition: condition } : {}),
    magicItemCategory: inferMagicItemCategory(seed.id, seed.category),
    ...item,
    classIds: allClassIds,
    sourceIds: xgteSourceIds,
  }
}

function tc(seed: MagicSeed): EquipmentRule {
  const { attunement: seedAttunement = 'none', attunementCondition, ...item } = seed
  const condition = attunementCondition ?? equipmentAttunementCondition(seed.id)
  return {
    englishName: equipmentEnglishName(seed.id),
    ruleset: '5e-2014',
    status: 'selectable',
    attunement: condition ? 'conditional' : seedAttunement,
    ...(condition ? { attunementCondition: condition } : {}),
    magicItemCategory: inferMagicItemCategory(seed.id, seed.category),
    ...item,
    classIds: allClassIds,
    sourceIds: tcoeSourceIds,
  }
}

function tcAttuned(id: string, name: string, description: string, rarity: NonNullable<EquipmentRule['rarity']>, extra: Partial<MagicSeed> = {}): EquipmentRule {
  return tc({ id, name, description, category: 'magic', equippable: true, rarity, attunement: 'required', ...extra })
}

function tcFocus(id: string, name: string, description: string): readonly EquipmentRule[] {
  return ([['uncommon', 1], ['rare', 2], ['very-rare', 3]] as const).map(([rarity, bonus]) =>
    tcAttuned(`${id}-${bonus}`, `${name} +${bonus}`, `${description}法术攻击与法术豁免 DC 获得 +${bonus}。`, rarity, { magicBonus: bonus }),
  )
}

/** 常见（common）随身物品：不可装备。 */
function xgCommon(id: string, name: string, description: string, category: EquipmentRule['category'] = 'magic', equippable = false): EquipmentRule {
  return xg({ id, name, description, category, equippable, rarity: 'common' })
}

export const magicItemsXgteTcoe2014: readonly EquipmentRule[] = [
  // ── XGtE 常见魔法物品（Common Magic Items）─────────────────────
  xgCommon('armor-of-gleaming', '光亮护甲', '魔法护甲：永不脏污，可随意擦拭至光亮如新。可附着于任意护甲。', 'armor', true),
  xgCommon('bead-of-nourishment', '滋养珠', '吞下这颗珠即可满足一整天所需的食物，无需进食。'),
  xgCommon('bead-of-refreshment', '提神珠', '吞下这颗珠即可满足一整天所需的水分，无需饮水。'),
  xgCommon('boots-of-false-tracks', '假足迹靴', '行走时可选择留下假足迹：可改变足迹方向或伪装成其他生物。', 'magic', true),
  xgCommon('candle-of-the-deep', '深海蜡烛', '可在水下正常燃烧的蜡烛，照亮 1.5 米，不受水流影响。'),
  xgCommon('cast-off-armor', '脱卸护甲', '魔法护甲：一个动作即可整体卸下。可附着于任意护甲。', 'armor', true),
  xgCommon('charlatans-die', '骗子骰', '掷骰时可控制朝上的点数（每日次数有限），赌局利器。'),
  xgCommon('cloak-of-billowing', '飘动斗篷', '一个动作即可让斗篷在无风时优雅飘动。', 'magic', true),
  xgCommon('cloak-of-many-fashions', '百变斗篷', '一个动作即可变换斗篷的样式、颜色与质地。', 'magic', true),
  xgCommon('clothes-of-mending', '缝补衣物', '穿戴的衣物每日会自行修补破损与撕裂。', 'magic', true),
  xgCommon('dark-shard-amulet', '暗碎片护符', '术契施法者的法器：可替代材料包使用（无需同调）。', 'magic', true),
  xgCommon('dread-helm', '恐惧头盔', '凝视一个生物可让其短暂畏缩（每日次数有限，感知豁免）。', 'magic', true),
  xgCommon('ear-horn-of-hearing', '助听号角', '听力受损者佩戴后可正常听闻。', 'magic', true),
  xgCommon('enduring-spellbook', '耐用法术书', '法术书：不惧水火，可正常使用。'),
  xgCommon('ersatz-eye', '义眼', '替换失去的眼睛：佩戴后恢复该眼的正常视觉。', 'magic', true),
  xgCommon('hat-of-vermin', '虫鼠帽', '一个动作可从帽中取出一只无害的小虫或小鼠，可自行处理。', 'magic', true),
  xgCommon('hat-of-wizardry', '巫师帽', '一个动作可随机施放一个戏法（效果有限，娱乐性为主）。', 'magic', true),
  xgCommon('hewards-handy-spice-pouch', '休瓦德便携香料袋', '每日可从袋中取出不限量的调味料与香料。'),
  xgCommon('horn-of-silent-alarm', '无声警报号角', '吹响时只有你指定的同伴能听到警报声，他人无感。'),
  xgCommon('instrument-of-illusions', '幻象乐器', '奏乐时可施放幻象类戏法（每日次数有限）。', 'magic', true),
  xgCommon('instrument-of-scribes', '抄写乐器', '奏乐时可让乐声在纸上"书写"出指定的文字。', 'magic', true),
  xgCommon('lock-of-trickery', '巧技锁', '一把魔法锁：可用动作开锁或上锁，他人开锁检定劣势。'),
  xgCommon('moon-touched-sword', '月光剑', '武器：在黑暗中如月光般柔和发光，照亮 4.5 米（微光）。', 'weapon', true),
  xgCommon('mystery-key', '神秘钥匙', '这把钥匙只能打开一把锁（未知是哪一把），对普通锁无效。'),
  xgCommon('orb-of-direction', '方向球', '每日可指示北方一次。'),
  xgCommon('orb-of-time', '时间球', '每日可显示当前时刻（约 1 分钟）。'),
  xgCommon('perfume-of-bewitching', '魅惑香水', '喷洒后 1 小时内，与生物互动时魅力相关检定优势。'),
  xgCommon('pipe-of-smoke-monsters', '烟雾怪物烟斗', '吸烟时可吹出随机的烟雾小生物（形状，无实质）。'),
  xgCommon('pole-of-anging', '钓鱼竿', '可伸缩的钓鱼竿（最长 3 米）。'),
  xgCommon('pole-of-collapsing', '折叠杆', '一个动作在 1.5 米与 3 米之间伸缩。'),
  xgCommon('potion-of-comprehension', '通晓药水', '饮用后 1 小时内可读懂并理解听到的所有语言（阅读通晓）。', 'potion'),
  xgCommon('pot-of-awakening', '觉醒花盆', '种入种子后 24 小时长出可移动的活体植物。'),
  { ...xgCommon('prosthetic-limb', '义肢', '替换失去的肢体（手臂或腿），可正常使用。', 'magic', true), sourceIds: ['xgte-2017-index', 'tcoe-2020-index'] },
  xgCommon('rope-of-mending', '缝补绳', '被剪断的绳段可用动作接回，恢复如初。'),
  xgCommon('ruby-of-the-war-mage', '战斗法师红宝石', '可附着于武器：使其成为施法法器（施法时无需空手）。'),
  xgCommon('shield-of-expression', '表情盾', '盾面可显示简单的表情或符号（动作切换）。', 'shield', true),
  xgCommon('smoldering-armor', '闷燃护甲', '护甲持续冒出无害烟雾，不会引燃自身。可附着于任意护甲。', 'armor', true),
  xgCommon('staff-of-adornment', '装饰法杖', '一个动作可改变法杖的外观装饰。', 'magic', true),
  xgCommon('staff-of-birdcalls', '鸟鸣法杖', '一个动作可发出所选鸟类的鸣叫声。', 'magic', true),
  xgCommon('staff-of-flowers', '鲜花法杖', '一个动作可在法杖顶端绽放一朵鲜花。', 'magic', true),
  xgCommon('talking-doll', '会说话的玩偶', '玩偶会复述附近 3 米内刚说过的一句短语。'),
  xgCommon('tankard-of-sobriety', '清醒酒杯', '倒入杯中的液体都会变为清淡的清水。'),
  xgCommon('wand-of-conducting', '指挥魔杖', '可指挥小型表演（手势与节奏），娱乐用途。', 'magic', true),
  xgCommon('wand-of-pyrotechnics', '烟火魔杖', '可让 9 米内的火焰爆出绚丽烟火（动作）。', 'magic', true),
  xgCommon('wand-of-scowls', '皱眉魔杖', '指向一个生物，其表情变为皱眉（动作，娱乐性）。', 'magic', true),
  xgCommon('wand-of-smiles', '微笑魔杖', '指向一个生物，其表情变为微笑（动作，娱乐性）。', 'magic', true),
  xgCommon('wraps-of-unarmed-power', '徒手力量绑带', '缠绕拳头的绑带：徒手攻击的伤害检定 +1。', 'magic', true),

  // ── TCoE 刺青（Tattoos）────────────────────────────────────────
  tc({ id: 'illuminators-tattoo', name: '照明刺青', description: '身体刺青：可用动作让刺青发光（如提灯照亮），可关闭。', category: 'magic', equippable: false, rarity: 'common' }),
  tc({ id: 'masquerade-tattoo', name: '假面刺青', description: '身体刺青：可改变刺青图案，并可与佩戴的衣物一同伪装外观。', category: 'magic', equippable: false, rarity: 'common' }),
  tc({ id: 'barrier-tattoo', name: '屏障刺青（AC 12）', description: '身体刺青：你裸露皮肤时 AC 变为 12 + 敏捷调整值（不与其他护甲叠加）。', category: 'magic', equippable: false, rarity: 'common' }),
  tc({ id: 'barrier-tattoo-uncommon', name: '屏障刺青（AC 14）', description: '身体刺青：你裸露皮肤时 AC 变为 14 + 敏捷调整值（最多 +2，不与其他护甲叠加）。', category: 'magic', equippable: false, rarity: 'uncommon' }),
  tc({ id: 'barrier-tattoo-rare', name: '屏障刺青（AC 15）', description: '身体刺青：你裸露皮肤时 AC 变为 15 + 敏捷调整值（最多 +2，不与其他护甲叠加）。', category: 'magic', equippable: false, rarity: 'rare' }),
  tc({ id: 'coiling-grasp-tattoo', name: '缠绕掌握刺青', description: '身体刺青：可用附赠动作发动刺青触手攻击（3 米触及，命中造成 1d6 力场伤害并束缚）。', category: 'magic', equippable: false, rarity: 'uncommon' }),
  tc({ id: 'eldritch-claw-tattoo', name: '怪异魔爪刺青', description: '身体刺青：徒手攻击视为魔法武器，伤害检定 +1（每日限时强化）。', category: 'magic', equippable: false, rarity: 'uncommon' }),
  tc({ id: 'spellwrought-tattoo-1st', name: '法术刺青（1 环）', description: '身体刺青：内含一个 1 环法术，可施放一次，施放后刺青消散。', category: 'magic', equippable: false, rarity: 'common' }),
  tc({ id: 'spellwrought-tattoo-2nd-3rd', name: '法术刺青（2–3 环）', description: '身体刺青：内含一个 2–3 环法术，可施放一次，施放后刺青消散。', category: 'magic', equippable: false, rarity: 'uncommon' }),
  tc({ id: 'spellwrought-tattoo-4th-5th', name: '法术刺青（4–5 环）', description: '身体刺青：内含一个 4–5 环法术，可施放一次，施放后刺青消散。', category: 'magic', equippable: false, rarity: 'rare' }),
  tc({ id: 'ghost-step-tattoo', name: '鬼步刺青', description: '身体刺青：每日数次，可虚体化移动（穿过生物与物体）。', category: 'magic', equippable: false, rarity: 'rare' }),
  tc({ id: 'shadowfell-brand-tattoo', name: '影界烙印刺青', description: '身体刺青：获得死灵伤害抗性，并可以反应减半一次所受伤害。', category: 'magic', equippable: false, rarity: 'rare', attunement: 'required' }),
  tc({ id: 'lifewell-tattoo', name: '生命之井刺青', description: '身体刺青：获得死灵伤害抗性；每日一次，生命值降至 0 时改为 1。', category: 'magic', equippable: false, rarity: 'very-rare', attunement: 'required' }),
  tc({ id: 'absorbing-tattoo', name: '吸收刺青', description: '身体刺青：每日一次，以反应吸收一次指定类型伤害，转化为自身生命值。', category: 'magic', equippable: false, rarity: 'legendary' }),
  tc({ id: 'blood-fury-tattoo', name: '血怒刺青', description: '身体刺青：近战武器攻击可造成额外伤害并反伤攻击者（每日次数有限）。', category: 'magic', equippable: false, rarity: 'legendary' }),

  // 职业法器与常规玩家物品。加值只在可靠表达时进入派生，其余效果保留原创摘要。
  ...tcFocus('all-purpose-tool', '全能工具', '工匠同调的变形工具；可化为任意工匠工具并暂时获得一项职业戏法。'),
  ...tcFocus('amulet-of-the-devout', '虔诚护符', '牧师或圣武士的圣徽；可额外使用一次引导神力。'),
  ...tcFocus('arcane-grimoire', '奥术魔典', '法师可将其作为法术书与施法焦点，并强化奥术回复。'),
  ...tcFocus('bloodwell-vial', '血脉小瓶', '术士施法焦点；花费生命骰时可恢复术法点。'),
  ...tcFocus('moon-sickle', '月镰', '德鲁伊或游侠的武器与施法焦点，同时强化治疗法术。'),
  ...tcFocus('rhythm-makers-drum', '节奏创造者之鼓', '吟游诗人乐器；可恢复一次吟游激励。'),
  tcAttuned('astral-shard', '星界碎片', '术士使用超魔时可短距离传送自己或目标。', 'rare'),
  tcAttuned('far-realm-shard', '远域碎片', '术士使用超魔时可促使附近生物承受精神伤害与恐惧。', 'rare'),
  tcAttuned('feywild-shard', '妖精荒野碎片', '术士使用超魔时可引发较轻微的狂野魔法现象。', 'uncommon'),
  tcAttuned('outer-essence-shard-lawful', '外层精华碎片（守序）', '超魔触发时可减免伤害或消除不利状态。', 'rare'),
  tcAttuned('outer-essence-shard-chaotic', '外层精华碎片（混乱）', '超魔触发时产生随机能量效果。', 'rare'),
  tcAttuned('outer-essence-shard-good', '外层精华碎片（善良）', '超魔触发时为自己或盟友恢复生命。', 'rare'),
  tcAttuned('outer-essence-shard-evil', '外层精华碎片（邪恶）', '超魔触发时令目标承受死灵伤害。', 'rare'),
  tcAttuned('bell-branch', '铃铛树枝', '德鲁伊或术士法器；可消耗充能消除恐惧。', 'rare'),
  tcAttuned('cauldron-of-rebirth', '再生釜', '德鲁伊法器；可制作恢复药剂并在特定条件下复生尸体。', 'very-rare'),
  tcAttuned('guardian-emblem', '守护徽记', '将徽记附着于盾牌或护甲，可以反应将暴击改为普通命中。', 'uncommon'),
  tcAttuned('natures-mantle', '自然斗篷', '德鲁伊或游侠斗篷与施法焦点；可在轻度遮蔽时躲藏。', 'uncommon'),
  tcAttuned('devotees-censer', '虔信者香炉', '牧师或圣武士使用的链枷与圣徽；可释放治疗香雾。', 'rare', { category: 'weapon', equippable: true }),
  tcAttuned('revelers-concertina', '狂欢者六角手风琴', '吟游诗人乐器；提高法术豁免 DC，并可施放一次舞动法术。', 'rare'),
  tcAttuned('lyre-of-building', '建造者里拉琴', '吟游诗人乐器；可强化构造物、保护建筑并施展建造相关魔法。', 'rare'),
  tcAttuned('alchemical-compendium', '炼金纲要', '魔法法术书，提供变化物质与强酸相关的充能法术。', 'rare'),
  tcAttuned('astromancy-archive', '星相术档案', '魔法法术书，提供占卜与星相类充能法术。', 'rare'),
  tcAttuned('atlas-of-endless-horizons', '无尽地平线图册', '魔法法术书，聚焦于传送、位面与空间移动。', 'rare'),
  tcAttuned('duplicitous-manuscript', '欺诈手稿', '魔法法术书，聚焦于幻术与心灵误导。', 'rare'),
  tcAttuned('fulminating-treatise', '震爆论文', '魔法法术书，聚焦于火焰、闪电与爆炸类法术。', 'rare'),
  tcAttuned('heart-weavers-primer', '编心者入门', '魔法法术书，聚焦于魅惑、情绪与交流。', 'rare'),
  tcAttuned('libram-of-souls-and-flesh', '灵魂与血肉大全', '魔法法术书，聚焦于死灵、不死与生命能量。', 'rare'),
  tcAttuned('planecallers-codex', '位面召唤师密典', '魔法法术书，聚焦于召唤与异界生物。', 'rare'),
  tcAttuned('protective-verses', '防护韵文', '魔法法术书，聚焦于防护、结界与减伤。', 'rare'),
  tc({ id: 'baba-yagas-mortar-and-pestle', name: '芭芭雅嘎的研钵与研棒', description: '神器工具：可研磨魔法材料、召唤研钵移动，并在满足材料条件时远行。', category: 'magic', equippable: true, rarity: 'artifact', attunement: 'required' }),
  tc({ id: 'lubas-tarokka-of-souls', name: '露芭的灵魂塔罗卡', description: '神器牌组：可操纵命运、囚禁灵魂，并伴随需要 DM 裁定的风险。', category: 'magic', equippable: false, rarity: 'artifact', attunement: 'required' }),
  tc({ id: 'mighty-servant-of-leuk-o', name: '鲁科的强大仆从', description: '神器级构装载具：需要两名同调操作者共同控制，战斗统计以来源摘要处理。', category: 'magic', equippable: false, rarity: 'artifact', attunement: 'required' }),
  tc({ id: 'crook-of-rao', name: '拉奥牧钩', description: '神器：具有强大的驱逐异界生物与封锁能力，具体使用由 DM 控制。', category: 'magic', equippable: true, rarity: 'artifact', attunement: 'required' }),
  tc({ id: 'demonomicon-of-iggwilv', name: '伊格威尔伏魔记', description: '神器魔典：记录恶魔真名与束缚法门，并能封印邪魔。', category: 'magic', equippable: true, rarity: 'artifact', attunement: 'required' }),
  tc({ id: 'teeth-of-dahlver-nar', name: '达尔弗·纳尔之牙', description: '神器遗物：每颗牙齿都能埋植出不同的故事化效果，结果由表格与 DM 决定。', category: 'magic', equippable: false, rarity: 'artifact', attunement: 'required' }),
]
