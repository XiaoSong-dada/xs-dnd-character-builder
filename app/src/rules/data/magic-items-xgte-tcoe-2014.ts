import type { EquipmentRule } from '@/types/rules'

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
] as const

type MagicSeed = Omit<EquipmentRule, 'classIds' | 'sourceIds'>

function xg(seed: MagicSeed): EquipmentRule {
  return { ...seed, classIds: allClassIds, sourceIds: xgteSourceIds }
}

function tc(seed: MagicSeed): EquipmentRule {
  return { ...seed, classIds: allClassIds, sourceIds: tcoeSourceIds }
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
  xgCommon('prosthetic-limb', '义肢', '替换失去的肢体（手臂或腿），可正常使用。', 'magic', true),
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
  tc({ id: 'unbreakable-tattoo', name: '不破刺青', description: '身体刺青：每日一次，受到伤害时可掷 1d12 减免该数值。', category: 'magic', equippable: false, rarity: 'uncommon' }),
  tc({ id: 'spellwrought-tattoo-1st', name: '法术刺青（1 环）', description: '身体刺青：内含一个 1 环法术，可施放一次，施放后刺青消散。', category: 'magic', equippable: false, rarity: 'common' }),
  tc({ id: 'spellwrought-tattoo-2nd-3rd', name: '法术刺青（2–3 环）', description: '身体刺青：内含一个 2–3 环法术，可施放一次，施放后刺青消散。', category: 'magic', equippable: false, rarity: 'uncommon' }),
  tc({ id: 'spellwrought-tattoo-4th-5th', name: '法术刺青（4–5 环）', description: '身体刺青：内含一个 4–5 环法术，可施放一次，施放后刺青消散。', category: 'magic', equippable: false, rarity: 'rare' }),
  tc({ id: 'ghost-step-tattoo', name: '鬼步刺青', description: '身体刺青：每日数次，可虚体化移动（穿过生物与物体）。', category: 'magic', equippable: false, rarity: 'rare' }),
  tc({ id: 'phantom-steed-tattoo', name: '幻马刺青', description: '身体刺青：可召唤一匹幻马坐骑（持续 1 小时，每日一次）。', category: 'magic', equippable: false, rarity: 'rare' }),
  tc({ id: 'shadowfell-brand-tattoo', name: '影界烙印刺青', description: '身体刺青：每日数次，可在阴影间传送（60 米内可见阴影）。', category: 'magic', equippable: false, rarity: 'rare' }),
  tc({ id: 'lifewell-tattoo', name: '生命之井刺青', description: '身体刺青：死亡时自动恢复 4d6 生命值（每日一次），避免倒地。', category: 'magic', equippable: false, rarity: 'very-rare' }),
  tc({ id: 'absorbing-tattoo', name: '吸收刺青', description: '身体刺青：每日一次，以反应吸收一次指定类型伤害，转化为自身生命值。', category: 'magic', equippable: false, rarity: 'legendary' }),
  tc({ id: 'blood-fury-tattoo', name: '血怒刺青', description: '身体刺青：近战武器攻击可造成额外伤害并反伤攻击者（每日次数有限）。', category: 'magic', equippable: false, rarity: 'legendary' }),
]
