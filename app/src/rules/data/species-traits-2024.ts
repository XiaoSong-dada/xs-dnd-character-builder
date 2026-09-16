import type { RaceFeature } from '@/types/rules'

/**
 * 2024 物种特性注册表（展示与按等级过滤用）。
 *
 * 依据 B01「起源」矩阵 OC-001—010 与 docs/species/5e-2024 逐条目资料；
 * 摘要与描述为原创中文转述。特性为常驻或按等级自动获得，不建立时间线检查点；
 * 资源与情境效果由跑团批次处理。
 */

const sourceIds = ['source-2024-phb'] as const

const trait = (
  raceId: string,
  slug: string,
  name: string,
  englishName: string,
  level: number,
  kind: RaceFeature['kind'],
  summary: string,
  description: string,
  status: RaceFeature['status'] = 'implemented',
): RaceFeature => ({
  id: `${raceId}-${slug}`,
  raceId,
  name,
  englishName,
  level,
  summary,
  description,
  kind,
  status,
  sourceIds,
})

export const speciesTraits2024: readonly RaceFeature[] = [
  trait('species-2024-aasimar', 'celestial-resistance', '天界抗性', 'Celestial Resistance', 1, 'passive', '暗蚀与光耀伤害抗性', '获得暗蚀与光耀伤害抗性。'),
  trait('species-2024-aasimar', 'darkvision', '黑暗视觉', 'Darkvision', 1, 'passive', '60 尺黑暗视觉', '获得 60 尺黑暗视觉。'),
  trait('species-2024-aasimar', 'healing-hands', '治愈之手', 'Healing Hands', 1, 'action', '动作触碰回复 PB 枚 d4；长休 1 次', '以魔法动作触碰一个生物，回复熟练加值枚 d4 的生命值；长休后恢复使用次数。', 'selectable'),
  trait('species-2024-aasimar', 'light-bearer', '光明使者', 'Light Bearer', 1, 'passive', '光亮术戏法，魅力施法', '掌握光亮术戏法，施法属性为魅力。'),
  trait('species-2024-aasimar', 'celestial-revelation', '天界显化', 'Celestial Revelation', 3, 'bonus-action', '3 级起长休 1 次，1 分钟：灼热光辉／天界之翼／死灵帷幕三选一', '附赠动作显化 1 分钟（长休 1 次）：灼热光辉在回合末令 10 尺内生物受光耀伤害，天界之翼获得等于速度的飞行，死灵帷幕令 10 尺内非盟友恐慌；选择在显化时决定。', 'selectable'),
  trait('species-2024-dragonborn', 'draconic-ancestry', '龙族祖先', 'Draconic Ancestry', 1, 'passive', '从 10 种祖先中选择，决定抗性与吐息伤害类型', '从黑／蓝／黄铜／青铜／赤铜／金／绿／红／银／白中选择祖先，决定伤害抗性与吐息伤害类型。', 'selectable'),
  trait('species-2024-dragonborn', 'breath-weapon', '吐息武器', 'Breath Weapon', 1, 'action', '15 尺锥或 30 尺线；DEX 豁免；伤害随等级成长；次数 = PB', '以攻击动作中的一次攻击替换，喷出 15 尺锥或 30 尺线，敏捷豁免；伤害在 1／5／11／17 级为 1d10／2d10／3d10／4d10；次数等于熟练加值，长休全部恢复。', 'selectable'),
  trait('species-2024-dragonborn', 'damage-resistance', '伤害抗性', 'Damage Resistance', 1, 'passive', '祖先对应伤害抗性', '获得祖先对应的伤害类型抗性。'),
  trait('species-2024-dragonborn', 'darkvision', '黑暗视觉', 'Darkvision', 1, 'passive', '60 尺黑暗视觉', '获得 60 尺黑暗视觉。'),
  trait('species-2024-dragonborn', 'draconic-flight', '龙族飞翼', 'Draconic Flight', 5, 'bonus-action', '5 级附赠动作飞行 10 分钟；长休 1 次', '附赠动作获得等于速度的飞行速度 10 分钟；长休后恢复。', 'selectable'),
  trait('species-2024-dwarf', 'darkvision', '黑暗视觉', 'Darkvision', 1, 'passive', '120 尺黑暗视觉', '获得 120 尺黑暗视觉。'),
  trait('species-2024-dwarf', 'dwarven-resilience', '矮人韧性', 'Dwarven Resilience', 1, 'passive', '毒素伤害抗性；防止或结束中毒的豁免优势', '获得毒素伤害抗性；为防止或结束中毒状态而进行的豁免具有优势。'),
  trait('species-2024-dwarf', 'dwarven-toughness', '矮人坚韧', 'Dwarven Toughness', 1, 'passive', '每级最大生命值 +1', '最大生命值每等级增加 1。'),
  trait('species-2024-dwarf', 'stonecunning', '石工感知', 'Stonecunning', 1, 'bonus-action', '附赠动作 10 分钟震颤感知；PB 次长休恢复', '附赠动作获得 60 尺震颤感知 10 分钟，但须接触石面；次数等于熟练加值，长休全部恢复。', 'selectable'),
  trait('species-2024-elf', 'darkvision', '黑暗视觉', 'Darkvision', 1, 'passive', '60 尺黑暗视觉（卓尔血统 120 尺）', '获得 60 尺黑暗视觉；卓尔血统提升至 120 尺。'),
  trait('species-2024-elf', 'elven-lineage', '精灵血统', 'Elven Lineage', 1, 'passive', '选择卓尔、高等精灵或木精灵血统', '从卓尔、高等精灵、木精灵中选择血统，决定血统法术与感官调整。'),
  trait('species-2024-elf', 'fey-ancestry', '妖精血统', 'Fey Ancestry', 1, 'passive', '魅惑豁免优势', '为防止或结束魅惑状态而进行的豁免具有优势。'),
  trait('species-2024-elf', 'keen-senses', '敏锐感官', 'Keen Senses', 1, 'passive', '洞悉、察觉、求生三选一熟练', '从洞悉、察觉、求生中选择一项技能熟练。'),
  trait('species-2024-elf', 'trance', '冥想', 'Trance', 1, 'passive', '4 小时冥想完成长休', '以 4 小时冥想代替睡眠完成长休，保持意识。'),
  trait('species-2024-elf-drow-lineage', 'drow-lineage-spells', '卓尔魔法', 'Drow Lineage Spells', 1, 'passive', '舞光术 1 级；妖火 3 级；黑暗 5 级', '1 级获得舞光术；3 级与 5 级分别获得妖火与黑暗，始终准备，各可长休免费施放 1 次，施法属性为创建时选择。'),
  trait('species-2024-elf-high-elf-lineage', 'high-elf-lineage-spells', '高等魔法', 'High Elf Lineage Spells', 1, 'passive', '魔法伎俩 1 级；侦测魔法 3 级；迷踪步 5 级', '1 级获得魔法伎俩（长休可替换为法师戏法）；3 级与 5 级分别获得侦测魔法与迷踪步，始终准备，各可长休免费施放 1 次。'),
  trait('species-2024-elf-wood-elf-lineage', 'wood-elf-lineage-spells', '木精灵魔法', 'Wood Elf Lineage Spells', 1, 'passive', '德鲁伊伎俩 1 级；大步奔行 3 级；行动无踪 5 级', '1 级获得德鲁伊伎俩；3 级与 5 级分别获得大步奔行与行动无踪，始终准备，各可长休免费施放 1 次。'),
  trait('species-2024-gnome', 'darkvision', '黑暗视觉', 'Darkvision', 1, 'passive', '60 尺黑暗视觉', '获得 60 尺黑暗视觉。'),
  trait('species-2024-gnome', 'gnomish-cunning', '侏儒机敏', 'Gnomish Cunning', 1, 'passive', '智力、感知、魅力豁免优势', '对智力、感知与魅力豁免具有优势。'),
  trait('species-2024-gnome', 'gnomish-lineage', '侏儒血统', 'Gnomish Lineage', 1, 'passive', '选择森林侏儒或岩石侏儒血统', '从森林侏儒、岩石侏儒中选择血统，决定血统法术与制品能力。'),
  trait('species-2024-gnome-forest-lineage', 'forest-lineage-spells', '森林魔法', 'Forest Gnome Lineage Spells', 1, 'passive', '次级幻象与动物交谈始终准备', '次级幻象始终准备；动物交谈始终准备，可长休免费施放熟练加值次，也可用法术位施放。', 'selectable'),
  trait('species-2024-gnome-rock-lineage', 'rock-lineage-spells', '岩石魔法', 'Rock Gnome Lineage Spells', 1, 'passive', '修复术与魔法伎俩；可制作小装置', '修复术与魔法伎俩始终准备；可 10 分钟制作小装置（AC 5、HP 1），最多 3 件，8 小时后解体。', 'selectable'),
  trait('species-2024-goliath', 'giant-ancestry', '巨人祖先', 'Giant Ancestry', 1, 'passive', '六选一：云、火、霜、丘、石、风；次数 = PB', '从云（附赠传送 30 尺）、火（命中加 1d10 火）、霜（加 1d6 冷并减速）、丘（命中击倒）、石（反应减伤 1d12+CON）、风（反应返还 1d8 雷）中选择；次数等于熟练加值，长休恢复。', 'selectable'),
  trait('species-2024-goliath', 'large-form', '巨型形态', 'Large Form', 5, 'bonus-action', '5 级附赠动作变大型 10 分钟；长休 1 次', '附赠动作变为大型 10 分钟（空间足够时），力量检定优势且速度 +10 尺；长休后恢复。', 'selectable'),
  trait('species-2024-goliath', 'powerful-build', '强力体格', 'Powerful Build', 1, 'passive', '结束擒抱的属性检定优势', '结束擒抱的属性检定具有优势。'),
  trait('species-2024-halfling', 'brave', '勇敢', 'Brave', 1, 'passive', '防止或结束恐慌的豁免优势', '为防止或结束恐慌状态而进行的豁免具有优势。'),
  trait('species-2024-halfling', 'halfling-nimbleness', '半身人灵巧', 'Halfling Nimbleness', 1, 'passive', '可穿过更大生物的空间', '可穿过体型大于你的生物所占据的空间，但不能在其中停留。'),
  trait('species-2024-halfling', 'lucky', '幸运', 'Lucky', 1, 'passive', 'D20 检定掷出 1 可重掷并采用新值', '当你在 D20 检定中掷出 1 时，可重掷并采用新结果。'),
  trait('species-2024-halfling', 'naturally-stealthy', '天生潜行', 'Naturally Stealthy', 1, 'passive', '被更大生物遮挡即可躲藏', '当仅被体型大于你的生物遮挡时，即可尝试躲藏。'),
  trait('species-2024-human', 'resourceful', '资源丰富', 'Resourceful', 1, 'passive', '长休获得英雄激励', '完成长休时获得英雄激励；已持有时按持有规则处理。'),
  trait('species-2024-human', 'skillful', '技能多样', 'Skillful', 1, 'passive', '任选 1 项技能熟练', '获得一项自选技能熟练。'),
  trait('species-2024-human', 'versatile', '多才多艺', 'Versatile', 1, 'passive', '额外获得 1 项起源专长', '额外获得一项自选起源专长。'),
  trait('species-2024-orc', 'adrenaline-rush', '肾上腺素冲击', 'Adrenaline Rush', 1, 'bonus-action', '附赠疾走并获得 PB 临时 HP；PB 次短休或长休恢复', '附赠动作疾走，并获得等于熟练加值的临时生命值；次数等于熟练加值，短休或长休恢复。', 'selectable'),
  trait('species-2024-orc', 'darkvision', '黑暗视觉', 'Darkvision', 1, 'passive', '120 尺黑暗视觉', '获得 120 尺黑暗视觉。'),
  trait('species-2024-orc', 'relentless-endurance', '不屈坚韧', 'Relentless Endurance', 1, 'passive', '降至 0 HP 可改为 1 HP；长休 1 次', '当生命值降至 0 但没有立即死亡时，可改为 1 点；长休后恢复。', 'selectable'),
  trait('species-2024-tiefling', 'darkvision', '黑暗视觉', 'Darkvision', 1, 'passive', '60 尺黑暗视觉', '获得 60 尺黑暗视觉。'),
  trait('species-2024-tiefling', 'fiendish-legacy', '邪魔传承', 'Fiendish Legacy', 1, 'passive', '选择深渊、冥界或炼狱传承', '从深渊、冥界、炼狱中选择传承，决定伤害抗性与传承法术。'),
  trait('species-2024-tiefling', 'otherworldly-presence', '异界风貌', 'Otherworldly Presence', 1, 'passive', '奇术戏法，施法属性为创建时选择', '掌握奇术戏法；施法属性为创建时选择的智力、感知或魅力。'),
  trait('species-2024-tiefling-abyssal-legacy', 'abyssal-legacy-spells', '深渊传承法术', 'Abyssal Legacy Spells', 3, 'passive', '致病射线 3 级；人类定身 5 级', '3 级获得致病射线，5 级获得人类定身，始终准备，各可长休免费施放 1 次；同时获得毒素伤害抗性。'),
  trait('species-2024-tiefling-chthonic-legacy', 'chthonic-legacy-spells', '冥界传承法术', 'Chthonic Legacy Spells', 3, 'passive', '虚假生命 3 级；衰弱射线 5 级', '3 级获得虚假生命，5 级获得衰弱射线，始终准备，各可长休免费施放 1 次；同时获得暗蚀伤害抗性。'),
  trait('species-2024-tiefling-infernal-legacy', 'infernal-legacy-spells', '炼狱传承法术', 'Infernal Legacy Spells', 3, 'passive', '炼狱叱喝 3 级；黑暗 5 级', '3 级获得炼狱叱喝，5 级获得黑暗，始终准备，各可长休免费施放 1 次；同时获得火焰伤害抗性。'),
]

export function getSpeciesTraits2024(raceId: string): readonly RaceFeature[] {
  return speciesTraits2024.filter((feature) => feature.raceId === raceId)
}
