import type { ChoiceCheckpoint, ClassFeature, ClassRule, RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'

/**
 * 破解奥秘：艾伯伦（UA）奇械师 2024。
 * 数据独立于 `artificer-2014.ts`；来源 `source-2024-ua-eberron`，默认关闭、需玩家显式启用。
 * 本文件所有效果为原创中文转述；未核验的召唤物与情境效果保持提示级。
 */

const sourceIds = ['source-2024-ua-eberron'] as const

/** 奇械师法术列表（按 CHM 职业法表逐条核对；重名法术复用既有 spell-2024-*）。 */
const ARTIFICER_2024_CLASS_SPELL_IDS: readonly string[] = [
  // 戏法 0 环
  'spell-2024-acid-splash', 'spell-2024-dancing-lights', 'spell-2024-elementalism', 'spell-2024-fire-bolt',
  'spell-2024-guidance', 'spell-2024-light', 'spell-2024-mage-hand', 'spell-2024-mending', 'spell-2024-message',
  'spell-2024-poison-spray', 'spell-2024-prestidigitation', 'spell-2024-ray-of-frost', 'spell-2024-resistance',
  'spell-2024-shocking-grasp', 'spell-2024-spare-the-dying', 'spell-2024-thorn-whip', 'spell-2024-thunderclap',
  'spell-2024-true-strike',
  // 一环
  'spell-2024-alarm', 'spell-2024-cure-wounds', 'spell-2024-detect-magic', 'spell-2024-disguise-self',
  'spell-2024-expeditious-retreat', 'spell-2024-faerie-fire', 'spell-2024-false-life', 'spell-2024-feather-fall',
  'spell-2024-grease', 'spell-2024-identify', 'spell-2024-jump', 'spell-2024-longstrider',
  'spell-2024-purify-food-and-drink', 'spell-2024-sanctuary',
  // 二环
  'spell-2024-aid', 'spell-2024-alter-self', 'spell-2024-arcane-lock', 'spell-2024-arcane-vigor', 'spell-2024-blur',
  'spell-2024-continual-flame', 'spell-2024-darkvision', 'spell-2024-dragon-s-breath', 'spell-2024-enhance-ability',
  'spell-2024-enlarge-reduce', 'spell-2024-heat-metal', 'spell-2024-ua-homunculus-servant', 'spell-2024-invisibility',
  'spell-2024-lesser-restoration', 'spell-2024-levitate', 'spell-2024-magic-mouth', 'spell-2024-magic-weapon',
  'spell-2024-protection-from-poison', 'spell-2024-rope-trick', 'spell-2024-see-invisibility',
  'spell-2024-spider-climb', 'spell-2024-web',
  // 三环
  'spell-2024-blink', 'spell-2024-create-food-and-water', 'spell-2024-dispel-magic', 'spell-2024-elemental-weapon',
  'spell-2024-fly', 'spell-2024-glyph-of-warding', 'spell-2024-haste', 'spell-2024-protection-from-energy',
  'spell-2024-revivify', 'spell-2024-water-breathing', 'spell-2024-water-walk',
  // 四环
  'spell-2024-arcane-eye', 'spell-2024-fabricate', 'spell-2024-freedom-of-movement',
  'spell-2024-leomund-s-secret-chest', 'spell-2024-mordenkainen-s-faithful-hound',
  'spell-2024-mordenkainen-s-private-sanctum', 'spell-2024-otiluke-s-resilient-sphere', 'spell-2024-stone-shape',
  'spell-2024-stoneskin', 'spell-2024-summon-construct',
  // 五环
  'spell-2024-animate-objects', 'spell-2024-bigby-s-hand', 'spell-2024-circle-of-power', 'spell-2024-creation',
  'spell-2024-greater-restoration', 'spell-2024-wall-of-stone',
]

/** 长休结束时同时存在的仿制魔法物品上限（2／3／4／5／6）。 */
const REPLICATED_ITEM_MAX = [0, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6] as const
const CANTRIPS_2024: readonly number[] = [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4]
const PREPARED_2024: readonly number[] = [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15]
const SLOTS_2024: readonly (readonly number[])[] = [
  [2], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2],
  [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 2],
  [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2],
]
const MAX_SPELL_LEVEL_2024: readonly number[] = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5]

const ARTIFICER_SKILL_OPTION_IDS = [
  'skill-arcana', 'skill-history', 'skill-investigation', 'skill-medicine', 'skill-nature', 'skill-perception', 'skill-sleight-of-hand',
] as const

/** 17 种工匠工具。 */
const ARTISAN_TOOL_OPTIONS: readonly { readonly slug: string; readonly name: string }[] = [
  { slug: 'alchemist', name: '炼金工具' },
  { slug: 'brewer', name: '酿酒工具' },
  { slug: 'calligrapher', name: '书法工具' },
  { slug: 'carpenter', name: '木匠工具' },
  { slug: 'cartographer', name: '制图工具' },
  { slug: 'cobbler', name: '鞋匠工具' },
  { slug: 'cook', name: '厨师工具' },
  { slug: 'glassblower', name: '玻璃匠工具' },
  { slug: 'jeweler', name: '珠宝匠工具' },
  { slug: 'leatherworker', name: '皮匠工具' },
  { slug: 'mason', name: '石匠工具' },
  { slug: 'painter', name: '画家工具' },
  { slug: 'potter', name: '陶匠工具' },
  { slug: 'smith', name: '铁匠工具' },
  { slug: 'tinker', name: '修补工具' },
  { slug: 'weaver', name: '织布工具' },
  { slug: 'woodcarver', name: '木雕工具' },
]

export const ARTIFICER_2024_TOOL_OPTION_IDS: readonly string[] = ARTISAN_TOOL_OPTIONS.map((item) => `artificer-2024-tool-${item.slug}`)

/** 仿制魔法物品方案：按方案档位登记可创造的魔法物品。 */
export interface ArtificerReplicatePlan2024 extends Omit<RuleOption, 'minimumLevel'> {
  readonly minimumLevel: number
  readonly planTier: 2 | 6 | 10 | 14
  readonly replicateItemId: string
}

function plan(tier: 2 | 6 | 10 | 14, slug: string, name: string, englishName: string, replicateItemId: string, note = ''): ArtificerReplicatePlan2024 {
  return {
    id: `artificer-2024-plan-${slug}`,
    name,
    englishName,
    description: `仿制魔法物品方案（奇械师 ${tier}+ 级）：长休结束时可用修补工具创造“${name}”${note ? `；${note}` : ''}。具体效果以《城主指南（2024）》或本物品库条目为准。`,
    status: 'selectable',
    sourceIds,
    minimumLevel: tier,
    planTier: tier,
    replicateItemId,
  }
}

export const artificerReplicatePlans2024: readonly ArtificerReplicatePlan2024[] = [
  // 2+ 档
  plan(2, 'alchemy-jug', '炼金壶', 'Alchemy Jug', 'equipment-2024-alchemy-jug'),
  plan(2, 'bag-of-holding', '次元袋', 'Bag of Holding', 'equipment-2024-bag-of-holding'),
  plan(2, 'cap-of-water-breathing', '水下呼吸帽', 'Cap of Water Breathing', 'equipment-2024-cap-of-water-breathing'),
  plan(2, 'goggles-of-night', '夜视镜', 'Goggles of Night', 'equipment-2024-goggles-of-night'),
  plan(2, 'manifold-tool', '百变工具', 'Manifold Tool', 'equipment-2024-ua-manifold-tool'),
  plan(2, 'repeating-shot', '连射武器', 'Repeating Shot', 'equipment-2024-ua-repeating-shot'),
  plan(2, 'returning-weapon', '回力武器', 'Returning Weapon', 'equipment-2024-ua-returning-weapon'),
  plan(2, 'rope-of-climbing', '攀爬绳', 'Rope of Climbing', 'equipment-2024-rope-of-climbing'),
  plan(2, 'sending-stones', '短讯石', 'Sending Stones', 'equipment-2024-sending-stones'),
  plan(2, 'shield-1', '盾牌 +1', 'Shield +1', 'equipment-2024-shield-1-2-3'),
  plan(2, 'wand-of-magic-detection', '侦测魔法魔杖', 'Wand of Magic Detection', 'equipment-2024-wand-of-magic-detection'),
  plan(2, 'wand-of-secrets', '探秘魔杖', 'Wand of Secrets', 'equipment-2024-wand-of-secrets'),
  plan(2, 'wand-of-the-war-mage-1', '战法师魔杖 +1', 'Wand of the War Mage +1', 'equipment-2024-wand-of-the-war-mage-1-2-3'),
  plan(2, 'weapon-1', '武器 +1', 'Weapon +1', 'equipment-2024-weapon-1-2-3'),
  // 6+ 档
  plan(6, 'armor-1', '护甲 +1', 'Armor +1', 'equipment-2024-armor-1-2-3'),
  plan(6, 'boots-of-elvenkind', '精灵靴', 'Boots of Elvenkind', 'equipment-2024-boots-of-elvenkind'),
  plan(6, 'boots-of-the-winding-path', '折返之靴', 'Boots of the Winding Path', 'equipment-2024-ua-boots-of-the-winding-path'),
  plan(6, 'cloak-of-elvenkind', '精灵斗篷', 'Cloak of Elvenkind', 'equipment-2024-cloak-of-elvenkind'),
  plan(6, 'cloak-of-the-manta-ray', '蝠鲼斗篷', 'Cloak of the Manta Ray', 'equipment-2024-cloak-of-the-manta-ray'),
  plan(6, 'eyes-of-charming', '魅惑镜片', 'Eyes of Charming', 'equipment-2024-eyes-of-charming'),
  plan(6, 'gloves-of-thievery', '窃贼手套', 'Gloves of Thievery', 'equipment-2024-gloves-of-thievery'),
  plan(6, 'lantern-of-revealing', '显像提灯', 'Lantern of Revealing', 'equipment-2024-lantern-of-revealing'),
  plan(6, 'mind-sharpener', '思维砥石', 'Mind Sharpener', 'equipment-2024-ua-mind-sharpener'),
  plan(6, 'necklace-of-adaptation', '适应项链', 'Necklace of Adaptation', 'equipment-2024-necklace-of-adaptation'),
  plan(6, 'pipes-of-haunting', '颤栗乐笙', 'Pipes of Haunting', 'equipment-2024-pipes-of-haunting'),
  plan(6, 'radiant-weapon', '光耀武器', 'Radiant Weapon', 'equipment-2024-ua-radiant-weapon'),
  plan(6, 'repulsion-shield', '斥力之盾', 'Repulsion Shield', 'equipment-2024-ua-repulsion-shield'),
  plan(6, 'ring-of-swimming', '善泳戒指', 'Ring of Swimming', 'equipment-2024-ring-of-swimming'),
  plan(6, 'ring-of-water-walking', '水上行走戒指', 'Ring of Water Walking', 'equipment-2024-ring-of-water-walking'),
  plan(6, 'sentinel-shield', '警戒之盾', 'Sentinel Shield', 'equipment-2024-sentinel-shield'),
  plan(6, 'spell-refueling-ring', '法力恢复戒指', 'Spell-Refueling Ring', 'equipment-2024-ua-spell-refueling-ring'),
  plan(6, 'wand-of-magic-missiles', '魔法飞弹魔杖', 'Wand of Magic Missiles', 'equipment-2024-wand-of-magic-missiles'),
  plan(6, 'wand-of-web', '蛛网魔杖', 'Wand of Web', 'equipment-2024-wand-of-web'),
  plan(6, 'weapon-of-warning', '警戒武器', 'Weapon of Warning', 'equipment-2024-weapon-of-warning'),
  // 10+ 档
  plan(10, 'armor-of-resistance', '抗性护甲', 'Armor of Resistance', 'equipment-2024-armor-of-resistance'),
  plan(10, 'dagger-of-venom', '淬毒匕首', 'Dagger of Venom', 'equipment-2024-dagger-of-venom'),
  plan(10, 'elven-chain', '精灵链甲', 'Elven Chain', 'equipment-2024-elven-chain'),
  plan(10, 'ring-of-feather-fall', '羽落戒指', 'Ring of Feather Fall', 'equipment-2024-ring-of-feather-falling'),
  plan(10, 'ring-of-jumping', '跳跃戒指', 'Ring of Jumping', 'equipment-2024-ring-of-jumping'),
  plan(10, 'ring-of-mind-shielding', '心灵护盾戒指', 'Ring of Mind Shielding', 'equipment-2024-ring-of-mind-shielding'),
  plan(10, 'shield-2', '盾牌 +2', 'Shield +2', 'equipment-2024-shield-1-2-3'),
  plan(10, 'wand-of-the-war-mage-2', '战法师魔杖 +2', 'Wand of the War Mage +2', 'equipment-2024-wand-of-the-war-mage-1-2-3'),
  plan(10, 'weapon-2', '武器 +2', 'Weapon +2', 'equipment-2024-weapon-1-2-3'),
  plan(10, 'wraps-of-unarmed-power-2', '神威绑带 +2', 'Wraps of Unarmed Power +2', 'equipment-2024-wraps-of-unarmed-power'),
  // 14+ 档
  plan(14, 'armor-2', '护甲 +2', 'Armor +2', 'equipment-2024-armor-1-2-3'),
  plan(14, 'arrow-catching-shield', '吸矢盾', 'Arrow-Catching Shield', 'equipment-2024-arrow-catching-shield'),
  plan(14, 'flame-tongue', '焰舌', 'Flame Tongue', 'equipment-2024-flame-tongue'),
  plan(14, 'ring-of-free-action', '自由行动戒指', 'Ring of Free Action', 'equipment-2024-ring-of-free-action'),
  plan(14, 'ring-of-protection', '防御戒指', 'Ring of Protection', 'equipment-2024-ring-of-protection'),
  plan(14, 'ring-of-the-ram', '公羊戒指', 'Ring of the Ram', 'equipment-2024-ring-of-the-ram'),
]

const planIdsAt = (tier: 2 | 6 | 10 | 14): readonly string[] => artificerReplicatePlans2024.filter((item) => item.planTier === tier).map((item) => item.id)

/** 实验性灵药 d6 表（炼金师）。 */
const ELIXIR_OPTIONS: readonly RuleOption[] = [
  { id: 'artificer-2024-elixir-healing', name: '治疗', englishName: 'Healing', description: '饮用者恢复 2d8＋你的智力调整值生命值。', status: 'selectable', sourceIds },
  { id: 'artificer-2024-elixir-swiftness', name: '疾速', englishName: 'Swiftness', description: '饮用者速度增加 10 尺，持续 1 小时。', status: 'selectable', sourceIds },
  { id: 'artificer-2024-elixir-resilience', name: '韧性', englishName: 'Resilience', description: '饮用者 AC 获得 +1 加值，持续 10 分钟。', status: 'selectable', sourceIds },
  { id: 'artificer-2024-elixir-boldness', name: '气魄', englishName: 'Boldness', description: '饮用者接下来 1 分钟内，每次攻击检定与豁免检定可加入 1d4。', status: 'selectable', sourceIds },
  { id: 'artificer-2024-elixir-flight', name: '飞行', englishName: 'Flight', description: '饮用者获得 10 尺飞行速度，持续 10 分钟。', status: 'selectable', sourceIds },
  { id: 'artificer-2024-elixir-choice', name: '任选灵药', englishName: 'Choice', description: '从实验性灵药表其他行中选择一种效果。', status: 'selectable', sourceIds },
]

/** 装甲师装甲型号。 */
const ARMOR_MODEL_OPTIONS: readonly RuleOption[] = [
  { id: 'artificer-2024-armor-model-dreadnaught', name: '无畏战甲', englishName: 'Dreadnaught', description: '装甲链枷（简易近战 1d10 钝击、触及）；附赠动作伟岸身姿增大体型与触及；命中时可推离或拉近目标 10 尺。', status: 'selectable', sourceIds },
  { id: 'artificer-2024-armor-model-guardian', name: '卫护拳甲', englishName: 'Guardian', description: '雷霆战拳（简易近战 1d8 雷鸣；命中后目标对除你外攻击劣势）；浴血时可附赠动作获得等于奇械师等级的临时生命值。', status: 'selectable', sourceIds },
  { id: 'artificer-2024-armor-model-infiltrator', name: '渗透圣甲', englishName: 'Infiltrator', description: '闪电发射器（简易远程 1d6 闪电、投掷 90/300 尺）；每回合一次追加 1d6 闪电；速度 +5 尺；隐匿检定优势（可与劣势抵消）。', status: 'selectable', sourceIds },
]

/** 魔炮师炮台激活选项。 */
const CANNON_OPTIONS: readonly RuleOption[] = [
  { id: 'artificer-2024-cannon-flamethrower', name: '投火机', englishName: 'Flamethrower', description: '15 尺锥状火焰；区域内生物敏捷豁免失败受 2d8 火焰伤害，成功减半。', status: 'selectable', sourceIds },
  { id: 'artificer-2024-cannon-force-ballista', name: '力场弩炮', englishName: 'Force Ballista', description: '120 尺远程法术攻击，命中 2d8 力场并推离目标 5 尺。', status: 'selectable', sourceIds },
  { id: 'artificer-2024-cannon-protector', name: '防御者', englishName: 'Protector', description: '炮台与其 10 尺内你选择的生物获得 1d8＋智力调整值临时生命值。', status: 'selectable', sourceIds },
]

export const artificerOptions2024: readonly RuleOption[] = [
  ...ARTISAN_TOOL_OPTIONS.map((item): RuleOption => ({
    id: `artificer-2024-tool-${item.slug}`,
    name: item.name,
    description: `选择${item.name}熟练（奇械师 1 级工具熟练）。`,
    status: 'selectable',
    sourceIds,
  })),
  ...ELIXIR_OPTIONS,
  ...ARMOR_MODEL_OPTIONS,
  ...CANNON_OPTIONS,
  ...artificerReplicatePlans2024,
]

const artificerFeaturesList: readonly ClassFeature[] = [
  {
    id: 'artificer-2024-tinkers-magic', classId: 'class-2024-ua-artificer', name: '工艺魔法', englishName: "Tinker's Magic", level: 1,
    summary: '习得修复术；魔法动作创造一件简易物品，次数＝智力调整值（至少 1 次），长休恢复。',
    description: '你习得戏法修复术。持握修补工具时，你可以用一个魔法动作在你 5 尺内制造一件简易物品（从滚珠、绳索、火把等清单中选择）；该物品在你完成长休时消失。使用次数等于你的智力调整值（至少 1 次），长休后恢复全部次数。',
    kind: 'passive', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest', note: '创造的小物品在长休时消失' },
  },
  {
    id: 'artificer-2024-spellcasting', classId: 'class-2024-ua-artificer', name: '施法', englishName: 'Spellcasting', level: 1,
    summary: '以工匠工具／盗贼工具／修补工具为法器，智力准备施法；半施法者法术位（向上取整）。',
    description: '你通过工具引导魔法。你可用盗贼工具、修补工具或你熟练的工匠工具作为施法法器，施展奇械师法术时必须持握其中一件（法术因此具有材料成分）。你以智力作为施法属性，按等级表准备 1 环及以上法术；每完成长休可替换任意数量的准备法术，并可替换一个通过本特性习得的戏法。10 级与 14 级各再习得一个奇械师戏法。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-replicate-magic-item', classId: 'class-2024-ua-artificer', name: '仿制魔法物品', englishName: 'Replicate Magic Item', level: 2,
    summary: '掌握若干魔法物品方案；长休结束时创造魔法物品，数量与同时存在上限随等级提升。',
    description: '你知晓用于制造魔法物品的奥术方案。2 级时从 2+ 档选择四个方案，6／10／14／18 级各再选一个（可从更高档位选择）。每当你提升奇械师等级时，可替换一个已知方案。长休结束时，你用修补工具创造物品：每件基于一个已知方案，同时存在的数量按等级为 2／3／4／5／6；超过上限时最旧的物品消失。创造出的魔杖或武器可作为你的施法法器。创造物品需要同调时可在创造时立即同调。以此创造的物品在你死亡 1d4 天后消失。',
    kind: 'choice', requiresChoice: true,
    checkpointIds: ['artificer-2024-plans-2', 'artificer-2024-plans-6', 'artificer-2024-plans-10', 'artificer-2024-plans-14', 'artificer-2024-plans-18'],
    status: 'selectable', sourceIds,
    resource: { maxByLevel: REPLICATED_ITEM_MAX, recovery: 'long-rest', unit: '件', note: '长休结束时创造／替换；每件基于不同已知方案' },
  },
  {
    id: 'artificer-2024-subclass', classId: 'class-2024-ua-artificer', name: '奇械师子职', englishName: 'Artificer Subclass', level: 3,
    summary: '选择炼金师、装甲师、魔炮师、战地匠师或制图师。',
    description: '你选择一项奇械师子职，并在达到对应等级时获得其特性。装甲师可自定义装甲型号，子职在 3／5／9／15 级提供主要特性。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-ua-artificer-subclass-3'], status: 'selectable', sourceIds,
  },
  ...[4, 8, 12, 16].map((level): ClassFeature => ({
    id: `artificer-2024-feat-${level}`, classId: 'class-2024-ua-artificer', name: '属性值提升', englishName: 'Ability Score Improvement', level,
    summary: '选择属性值提升专长或其他满足前置的专长。',
    description: '你获得属性值提升专长，或另一个你满足条件的专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: [`artificer-2024-feat-${level}`], status: 'selectable', sourceIds,
  })),
  {
    id: 'artificer-2024-magic-item-tinker', classId: 'class-2024-ua-artificer', name: '魔法物品工艺师', englishName: 'Magic Item Tinker', level: 6,
    summary: '充能／汲取／转变你仿制的魔法物品；方案可从 6+ 档选择。',
    description: '你的仿制魔法物品特性获得提升：附赠动作触碰 5 尺内一件你仿制的魔法物品，花费一个 1+ 环法术位使其获得等于环阶的充能；附赠动作使其消失并转化为法术位（普通物品为一环、非普通或珍稀为二环，每次长休 1 次）；魔法动作将其转变为另一件你知道方案的魔法物品（每次长休 1 次）。习得方案时可从 6+ 档选择。',
    kind: 'action', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], recovery: 'long-rest', note: '汲取与转变各每次长休 1 次；充能消耗法术位' },
  },
  {
    id: 'artificer-2024-flash-of-genius', classId: 'class-2024-ua-artificer', name: '灵光一闪', englishName: 'Flash of Genius', level: 7,
    summary: '反应：你或 30 尺内可见生物属性检定／豁免失败时加入智力调整值；次数＝智力调整值（至少 1）。',
    description: '当你或你 30 尺内能看见的一个生物在一次属性检定或豁免检定中失败时，你可以执行一个反应，在结果中加入等于你智力调整值的加值，这可能使失败变为成功。使用次数等于你的智力调整值（至少 1 次），长休后恢复。',
    kind: 'reaction', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'artificer-2024-magic-item-adept', classId: 'class-2024-ua-artificer', name: '魔法物品熟稔', englishName: 'Magic Item Adept', level: 10,
    summary: '同调上限提升至 4；方案可从 10+ 档选择。',
    description: '你可以同时与至多四件魔法物品同调。习得方案时可从 10+ 档选择。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-spell-storing-item', classId: 'class-2024-ua-artificer', name: '储法物品', englishName: 'Spell-Storing Item', level: 11,
    summary: '长休时把一道 1—3 环、施法时间为动作的奇械师法术存入物品；使用次数＝智力调整值×2（至少 2）。',
    description: '每完成长休时，你可以触碰一件简易或军用武器，或一件你能作为施法法器的物品，并选择一道一环、二环或三环、施法时间为动作的奇械师法术储存其中（无需准备该法术）。持握者可用一个动作引发该法术效果，使用你的施法属性。法术留存在物品中直到使用次数用尽（等于你智力调整值×2，至少 2 次）或你再次使用本特性。',
    kind: 'action', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 2, multiplier: 2 }, recovery: 'long-rest', note: '重新储存时旧法术与剩余次数失效' },
  },
  {
    id: 'artificer-2024-magic-item-savant', classId: 'class-2024-ua-artificer', name: '魔法物品专家', englishName: 'Magic Item Savant', level: 14,
    summary: '同调上限提升至 5；方案可从 14+ 档选择。',
    description: '你可以同时与至多五件魔法物品同调。习得方案时可从 14+ 档选择。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-magic-item-master', classId: 'class-2024-ua-artificer', name: '魔法物品大师', englishName: 'Magic Item Master', level: 18,
    summary: '同调上限提升至 6。',
    description: '你可以同时与至多六件魔法物品同调。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-epic-boon', classId: 'class-2024-ua-artificer', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长或其他满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一个你满足条件的专长。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['artificer-2024-feat-19'], status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-soul-of-artifice', classId: 'class-2024-ua-artificer', name: '奇械之魂', englishName: 'Soul of Artifice', level: 20,
    summary: '幸免于难：生命值降至 0 时解离仿制物品并把生命值改为 20×数量；灵光一闪持续失败不消耗次数。',
    description: '你与魔法物品建立神秘联系：当你的生命值降至 0 且未被立即杀死时，你可以解离任意件由仿制魔法物品特性创造的、稀有度为非普通或珍稀的物品，并将生命值改为 20×解离数量而非 0。此外，当你与至少一件魔法物品同调时，若你的灵光一闪应用到属性检定或豁免后仍然失败，则本次使用不消耗次数。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
]

export const artificerFeatures2024: readonly ClassFeature[] = [...artificerFeaturesList].sort((left, right) => left.level - right.level)

/** 长休时同时存在的仿制魔法物品上限（2／3／4／5／6）。 */
export function getArtificerReplicatedItemLimit2024(level: number): number {
  if (level >= 18) return 6
  if (level >= 14) return 5
  if (level >= 10) return 4
  if (level >= 6) return 3
  return level >= 2 ? 2 : 0
}

export const artificerRule2024: ClassRule = {
  id: 'class-2024-ua-artificer',
  ruleset: '5e-2024',
  name: '奇械师',
  englishName: 'Artificer',
  summary: '破解奥秘（UA）重制版：以工具引导奥法，仿制魔法物品并与同伴分享。',
  introduction: '以工具为施法法器的智力职业：把奥法能量注入发明与魔法物品，仿制方案让全队共享装备收益；子职覆盖药剂、装甲、炮台、构装护卫与传送制图，适合喜欢“发明家”与支援玩法的玩家。',
  hitDie: 8,
  primaryAbilities: ['int'],
  playStyleTags: ['spellcaster', 'support', 'utility', 'durable'],
  savingThrowAbilities: ['con', 'int'],
  status: 'selectable',
  sourceIds,
  armorTraining: ['light', 'medium', 'shield'],
  weaponTraining: { categories: ['simple'] },
  spellcasting: {
    ruleset: '5e-2024',
    mode: 'prepared',
    ability: 'int',
    startsAtLevel: 1,
    preparedCountByLevel: PREPARED_2024,
    cantripsKnownByLevel: CANTRIPS_2024,
    maxSpellLevelByClassLevel: MAX_SPELL_LEVEL_2024,
    slotsByClassLevel: SLOTS_2024,
    classSpellIds: ARTIFICER_2024_CLASS_SPELL_IDS,
  },
  features: artificerFeatures2024,
  checkpoints: [
    {
      id: 'artificer-2024-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择 2 项奇械师技能', description: '从奥秘、历史、调查、医药、自然、察觉、巧手中选择 2 项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: [...ARTIFICER_SKILL_OPTION_IDS],
    },
    {
      id: 'artificer-2024-tools-1', level: 1, step: 'timeline', kind: 'class-choice',
      title: '选择一种工匠工具', description: '除盗贼工具与修补工具外，再选择一种工匠工具熟练。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [...ARTIFICER_2024_TOOL_OPTION_IDS],
    },
    {
      id: 'artificer-2024-plans-2', level: 2, step: 'timeline', kind: 'infusion',
      title: '选择 4 个仿制方案（2+ 档）', description: '从奇械师等级 2+ 的魔法物品方案中选择 4 个；升级时可替换一个已知方案。',
      required: true, minSelections: 4, maxSelections: 4, optionIds: planIdsAt(2), uniqueGroup: 'artificer-2024-plans',
    },
    {
      id: 'artificer-2024-plans-6', level: 6, step: 'timeline', kind: 'infusion',
      title: '选择 1 个仿制方案（6+ 档）', description: '从奇械师等级 6+ 的方案中选择 1 个。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: planIdsAt(6), uniqueGroup: 'artificer-2024-plans',
    },
    {
      id: 'artificer-2024-plans-10', level: 10, step: 'timeline', kind: 'infusion',
      title: '选择 1 个仿制方案（10+ 档）', description: '从奇械师等级 10+ 的方案中选择 1 个。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: planIdsAt(10), uniqueGroup: 'artificer-2024-plans',
    },
    {
      id: 'artificer-2024-plans-14', level: 14, step: 'timeline', kind: 'infusion',
      title: '选择 1 个仿制方案（14+ 档）', description: '从奇械师等级 14+ 的方案中选择 1 个。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: planIdsAt(14), uniqueGroup: 'artificer-2024-plans',
    },
    {
      id: 'artificer-2024-plans-18', level: 18, step: 'timeline', kind: 'infusion',
      title: '选择 1 个额外仿制方案', description: '从已解锁的方案中选择 1 个（14+ 档）。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: planIdsAt(14), uniqueGroup: 'artificer-2024-plans',
    },
    ...[4, 8, 12, 16].map((level): ChoiceCheckpoint => ({
      id: `artificer-2024-feat-${level}`, level, step: 'timeline' as const, kind: 'ability-improvement' as const,
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    {
      id: 'artificer-2024-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '传奇恩惠', description: '19 级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
  ],
}

// ============================ 子职：炼金师 ============================

export const artificerSubclassFeatures2024: readonly SubclassFeature[] = [
  {
    id: 'artificer-2024-alchemist-tool', subclassId: 'subclass-2024-ua-artificer-alchemist', name: '工具熟练', englishName: 'Tool Proficiency', level: 3,
    summary: '获得炼金工具熟练；已有则改为另一种工匠工具；酿造药水耗时减半。',
    description: '你获得炼金工具熟练。若你已有该熟练，则改为获得另一种你选择的工匠工具熟练。使用《城主指南》制造规则酿造药水时，所需时间减半。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-alchemist-spells', subclassId: 'subclass-2024-ua-artificer-alchemist', name: '炼金师法术', englishName: 'Alchemist Spells', level: 3,
    summary: '3／5／9／13／17 级各获得两道始终准备的炼金师法术。',
    description: '达到对应奇械师等级时，你始终准备炼金师法术表中的法术；这些法术不计入你的准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-alchemist-elixir', subclassId: 'subclass-2024-ua-artificer-alchemist', name: '实验性灵药', englishName: 'Experimental Elixir', level: 3,
    summary: '长休制造 2 瓶灵药（5／9／15 级提升至 3／4／5 瓶）；可消耗法术位额外制造并自选效果。',
    description: '每完成长休时，持握炼金工具可制造两瓶灵药（5 级三瓶、9 级四瓶、15 级五瓶），按 d6 表决定效果；饮用为附赠动作，也可喂给 5 尺内生物。持握炼金工具时可用魔法动作消耗一个法术位额外制造一瓶并自选效果。长休时未使用的灵药消失。灵药效果：治疗（2d8＋智力调整值）、疾速（+10 尺 1 小时）、韧性（AC+1，10 分钟）、气魄（1 分钟内攻检与豁免+1d4）、飞行（10 尺 10 分钟）、任选（从表中选择）。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5], recovery: 'long-rest', unit: '瓶', note: '长休制造时掷 d6 决定效果；额外制造消耗法术位并自选效果' },
  },
  {
    id: 'artificer-2024-alchemist-savant', subclassId: 'subclass-2024-ua-artificer-alchemist', name: '炼金术掌握', englishName: 'Alchemical Savant', level: 5,
    summary: '以炼金工具为法器施法时，治疗或强酸／火焰／暗蚀／毒素伤害的一次掷骰加入智力调整值（至少 +1）。',
    description: '每当你用炼金工具作为施法法器施展法术时，若其中一次掷骰用于恢复生命值或造成强酸、火焰、暗蚀、毒素伤害，则在该次掷骰中加入等于你智力调整值的加值（至少 +1）。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-alchemist-restorative-reagents', subclassId: 'subclass-2024-ua-artificer-alchemist', name: '复原药剂', englishName: 'Restorative Reagents', level: 9,
    summary: '饮用你的灵药获得智力调整值＋奇械师等级的临时生命值；免费施展次级复原术次数＝智力调整值（至少 1）。',
    description: '生物饮用你以实验性灵药制造的灵药时，获得等于你智力调整值＋奇械师等级的临时生命值。此外，你可以用炼金工具作为法器施展次级复原术而不消耗法术位，次数等于你的智力调整值（至少 1 次），长休后恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest', note: '仅用于免费施展次级复原术' },
  },
  {
    id: 'artificer-2024-alchemist-chemical-mastery', subclassId: 'subclass-2024-ua-artificer-alchemist', name: '炼金专家', englishName: 'Chemical Mastery', level: 15,
    summary: '强酸／毒素抗性；每回合一次对受伤目标追加 2d8 力场；免费施展塔莎冒泡大锅（每次长休 1 次）。',
    description: '你获得强酸与毒素伤害抗性。你施展奇械师法术对目标造成强酸、火焰、暗蚀或毒素伤害时，可对该目标追加 2d8 力场伤害（每回合限一次）。你可以用炼金工具作为法器免费施展塔莎冒泡大锅（无需准备与成分），每次长休 1 次。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============================ 子职：装甲师 ============================
  {
    id: 'artificer-2024-armorer-tools', subclassId: 'subclass-2024-ua-artificer-armorer', name: '本职工具', englishName: 'Tools of the Trade', level: 3,
    summary: '获得重甲受训与铁匠工具熟练；锻造护甲耗时减半。',
    description: '你获得重甲受训与铁匠工具熟练。若你已有铁匠工具熟练，则改为获得另一种工匠工具熟练。使用《城主指南》制造规则锻造护甲时，所需时间减半。',
    kind: 'passive', status: 'selectable', sourceIds, armorTraining: ['heavy'],
  },
  {
    id: 'artificer-2024-armorer-spells', subclassId: 'subclass-2024-ua-artificer-armorer', name: '装甲师法术', englishName: 'Armorer Spells', level: 3,
    summary: '3／5／9／13／17 级各获得两道始终准备的装甲师法术。',
    description: '达到对应奇械师等级时，你始终准备装甲师法术表中的法术；这些法术不计入你的准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-armorer-arcane-armor', subclassId: 'subclass-2024-ua-artificer-armorer', name: '奥能装甲', englishName: 'Arcane Armor', level: 3,
    summary: '把所穿护甲转为奥能装甲：无视力量需求、快速穿脱、第二肌肤、可作施法法器。',
    description: '持握铁匠工具时用一个魔法动作，你可以把穿着中的一套护甲转变为奥能装甲，直到你穿另一套护甲或死亡。奥能装甲无视护甲的力量需求；你可以用操作动作穿戴与卸除；护甲附着于你且无法违背你的意志移除；可作奇械师法术的施法法器；附赠动作可戴上或撤下头盔。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-armorer-model', subclassId: 'subclass-2024-ua-artificer-armorer', name: '装甲型号', englishName: 'Armor Model', level: 3,
    summary: '选择无畏战甲、卫护拳甲或渗透圣甲；短休或长休可更换型号。',
    description: '定制奥能装甲时选择一种型号，获得对应武器与增益；使用型号武器攻击与伤害时可改用智力调整值。持握铁匠工具完成短休或长休后可以更换型号。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['artificer-2024-armor-model-dreadnaught', 'artificer-2024-armor-model-guardian', 'artificer-2024-armor-model-infiltrator'],
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-armorer-extra-attack', subclassId: 'subclass-2024-ua-artificer-armorer', name: '额外攻击', englishName: 'Extra Attack', level: 5,
    summary: '攻击动作可发动两次攻击。',
    description: '你在自己回合内执行攻击动作时，可以发动两次攻击而非一次。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-armorer-replication', subclassId: 'subclass-2024-ua-artificer-armorer', name: '装甲仿制', englishName: 'Armor Replication', level: 9,
    summary: '额外获得一个护甲类别方案；可额外创造一件护甲物品。',
    description: '你为仿制魔法物品特性额外知晓一个方案，且必须是护甲类别；替换该方案时也必须换为护甲方案。此外，你可以额外创造一件仿制物品，且这件物品必须是护甲类别。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-armorer-perfected-armor', subclassId: 'subclass-2024-ua-artificer-armorer', name: '完美装甲', englishName: 'Perfected Armor', level: 15,
    summary: '按型号强化：无畏战甲链枷 2d6 与飞行；卫护拳甲 1d10 与牵引反应；渗透圣甲 2d6 与发光劣势。',
    description: '按你的装甲型号强化：无畏战甲——装甲链枷伤害提升至 2d6，伟岸身姿触及 +10 尺、体型可至大型或巨型并获得飞行速度；卫护拳甲——雷霆战拳伤害提升至 1d10，30 尺内生物结束回合时可用反应迫使其力量豁免并牵引至多 25 尺，拉至 5 尺内还可发动一次近战武器攻击（次数＝智力调整值，至少 1 次，长休恢复）；渗透圣甲——闪电发射器伤害提升至 2d6，被命中的生物发光并使对你的攻击检定劣势。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============================ 子职：魔炮师 ============================
  {
    id: 'artificer-2024-artillerist-tools', subclassId: 'subclass-2024-ua-artificer-artillerist', name: '工具熟练', englishName: 'Tool Proficiency', level: 3,
    summary: '获得木雕工具熟练；制造魔杖耗时减半。',
    description: '你获得木雕工具熟练。若你已有该熟练，则改为获得另一种工匠工具熟练。使用《城主指南》制造规则制造魔杖时，所需时间减半。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-artillerist-spells', subclassId: 'subclass-2024-ua-artificer-artillerist', name: '魔炮师法术', englishName: 'Artillerist Spells', level: 3,
    summary: '3／5／9／13／17 级各获得两道始终准备的魔炮师法术。',
    description: '达到对应奇械师等级时，你始终准备魔炮师法术表中的法术；这些法术不计入你的准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-artillerist-cannon', subclassId: 'subclass-2024-ua-artificer-artillerist', name: '魔能炮台', englishName: 'Eldritch Cannon', level: 3,
    summary: '魔法动作创造一台小型／微型炮台；附赠动作指挥其使用投火机、力场弩炮或防御者。',
    description: '你用木雕工具或铁匠工具，以魔法动作在 5 尺内创造一台小型或微型魔能炮台（AC 18，HP＝5×奇械师等级，免疫毒素与心灵，持续 1 小时或被降至 0）。你可在 60 尺内以附赠动作指挥炮台移动至多 15 尺并执行一种攻击：投火机（15 尺锥形，敏捷豁免失败 2d8 火焰）、力场弩炮（120 尺远程法术攻击，2d8 力场并推离 5 尺）或防御者（炮台与 10 尺内选定生物获得 1d8＋智力调整值临时生命值）。同一时间只能有一台炮台；每次长休后免费创造一台，也可消耗法术位再创造。炮台数据未接入自动战斗结算。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2], recovery: 'long-rest', unit: '台', note: '长休后免费创造；也可消耗法术位创造' },
  },
  {
    id: 'artificer-2024-artillerist-arcane-firearm', subclassId: 'subclass-2024-ua-artificer-artillerist', name: '奥法枪械', englishName: 'Arcane Firearm', level: 5,
    summary: '长休时把权杖／法杖／魔杖刻成奥法枪械；以其施法时某次伤害掷骰 +1d8。',
    description: '每完成一次长休，你可以用木雕工具在一根权杖、法杖或魔杖上雕刻符文，使其成为你的奥法枪械。你可以把它作为施法法器；当你用它施展奇械师法术时，投 1d8 并在该法术的一次伤害掷骰中加入结果。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-artillerist-explosive-cannon', subclassId: 'subclass-2024-ua-artificer-artillerist', name: '高爆炮台', englishName: 'Explosive Cannon', level: 9,
    summary: '炮台伤害 +1d8；炮台被摧毁时可用反应引爆，20 尺内敏捷豁免失败 3d10 力场。',
    description: '你的炮台伤害掷骰增加 1d8。当炮台生命值降至 0 且你在其 60 尺内时，你可以用反应命令引爆：20 尺内每个生物敏捷豁免，失败受 3d10 力场伤害，成功减半。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-artillerist-fortified-position', subclassId: 'subclass-2024-ua-artificer-artillerist', name: '要塞阵地', englishName: 'Fortified Position', level: 15,
    summary: '可同时拥有两台炮台并用同一附赠动作激活；你与盟友在炮台 10 尺内获得半身掩护。',
    description: '你可以同时拥有两台炮台（不能用同一法术位创造），并可以用同一个附赠动作激活它们。你与盟友在任一炮台 10 尺内时具有半身掩护。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============================ 子职：战地匠师 ============================
  {
    id: 'artificer-2024-battle-smith-tools', subclassId: 'subclass-2024-ua-artificer-battle-smith', name: '工具熟练', englishName: 'Tool Proficiency', level: 3,
    summary: '获得铁匠工具熟练；制造武器耗时减半。',
    description: '你获得铁匠工具熟练。若你已有该熟练，则改为获得另一种工匠工具熟练。使用《城主指南》制造规则制造普通或魔法武器时，所需时间减半。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-battle-smith-spells', subclassId: 'subclass-2024-ua-artificer-battle-smith', name: '战地匠师法术', englishName: 'Battle Smith Spells', level: 3,
    summary: '3／5／9／13／17 级各获得两道始终准备的战地匠师法术。',
    description: '达到对应奇械师等级时，你始终备战地匠师法术表中的法术；这些法术不计入你的准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-battle-smith-ready', subclassId: 'subclass-2024-ua-artificer-battle-smith', name: '战斗准备', englishName: 'Battle Ready', level: 3,
    summary: '魔法武器攻击可用智力；获得军用武器熟练。',
    description: '你使用魔法武器攻击时，攻击与伤害检定可改用智力调整值。你获得军用武器熟练。',
    kind: 'passive', status: 'selectable', sourceIds, weaponTraining: { categories: ['martial'] },
  },
  {
    id: 'artificer-2024-battle-smith-defender', subclassId: 'subclass-2024-ua-artificer-battle-smith', name: '钢铁守卫', englishName: 'Steel Defender', level: 3,
    summary: '以工匠技艺创造钢铁守卫同伴；战斗中听令行动，可在 1 小时内复活或长休替换。',
    description: '你创造出一个钢铁守卫（中型构装，AC 15，HP＝5＋5×奇械师等级，速度 40 尺，力场动能撕扯与修理，偏转攻击）。守卫在你的回合行动，需你用附赠动作命令它执行动作，否则执行回避。若守卫在最近 1 小时内死亡，你可以用魔法动作触碰它并消耗一个法术位，使其在 1 分钟后满生命值复活。每完成长休可创造新的守卫（旧的消失）。守卫数据未接入自动战斗结算。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long-rest', unit: '台', note: '长休替换；复活消耗法术位' },
  },
  {
    id: 'artificer-2024-battle-smith-extra-attack', subclassId: 'subclass-2024-ua-artificer-battle-smith', name: '额外攻击', englishName: 'Extra Attack', level: 5,
    summary: '攻击动作可发动两次攻击。',
    description: '你在自己回合内执行攻击动作时，可以发动两次攻击而非一次。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-battle-smith-arcane-jolt', subclassId: 'subclass-2024-ua-artificer-battle-smith', name: '奥能震荡', englishName: 'Arcane Jolt', level: 9,
    summary: '魔法武器或守卫命中时：追加 2d6 力场，或为 30 尺内生物恢复 2d6；次数＝智力调整值（至少 1），每回合限一次，长休恢复。',
    description: '当你用魔法武器命中，或你的钢铁守卫命中时，你可以引导奥术能量：对目标追加 2d6 力场伤害，或为 30 尺内可见生物或物体恢复 2d6 生命值。使用次数等于你的智力调整值（至少 1 次），每回合至多一次，长休恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'artificer-2024-battle-smith-improved-defender', subclassId: 'subclass-2024-ua-artificer-battle-smith', name: '改良守卫', englishName: 'Improved Defender', level: 15,
    summary: '奥能震荡提升至 4d6；守卫 AC +2；守卫偏转攻击时攻击者受 1d4＋智力调整值力场伤害。',
    description: '你的奥能震荡伤害与治疗提升至 4d6。你的钢铁守卫 AC +2。每当守卫使用偏转攻击时，攻击者受到 1d4＋你的智力调整值力场伤害。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============================ 子职：制图师 ============================
  {
    id: 'artificer-2024-cartographer-tools', subclassId: 'subclass-2024-ua-artificer-cartographer', name: '工具熟练', englishName: 'Tool Proficiencies', level: 3,
    summary: '获得书法工具与制图工具熟练；抄录法术卷轴耗时减半。',
    description: '你获得书法工具与制图工具熟练；若你已有其中之一，可改为获得另一种工匠工具熟练。撰写法术卷轴时，所需时间减半。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-cartographer-spells', subclassId: 'subclass-2024-ua-artificer-cartographer', name: '制图师法术', englishName: 'Cartographer Spells', level: 3,
    summary: '3／5／9／13／17 级获得始终准备的制图师法术（3 级三道）。',
    description: '达到对应奇械师等级时，你始终准备制图师法术表中的法术；这些法术不计入你的准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-cartographer-atlas', subclassId: 'subclass-2024-ua-artificer-cartographer', name: '冒险者的地图匣', englishName: "Adventurer's Atlas", level: 3,
    summary: '长休时制作为 1＋智力调整值名生物提供的地图；持有者先攻 +1d4 且知晓彼此位置。',
    description: '每当你持握制图工具完成长休时，你可以触碰至少两名、至多 1＋智力调整值名生物（可包括自己），制作一套魔法地图。持有者获得：先攻检定 +1d4；知晓其他地图持有者在同一位面的位置；施展需要“可见目标”的法术或效应时，可无视视觉要求选择另一名地图持有者（仍受距离限制）。地图持续到你死亡或再次使用本特性。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest', unit: '份', note: '覆盖 1＋智力调整值名持有者' },
  },
  {
    id: 'artificer-2024-cartographer-gadgets', subclassId: 'subclass-2024-ua-artificer-cartographer', name: '探查部件', englishName: 'Scouting Gadgets', level: 3,
    summary: '可消耗一半移动力传送 10 尺；免费施展妖火次数＝智力调整值（至少 1），长休恢复。',
    description: '强冲：在你的回合中，你可以消耗一半移动力传送到 10 尺内可见的未占据空间（速度为零时不可用）。雷达：你可以无需法术位施展妖火，次数等于你的智力调整值（至少 1 次），长休后恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest', note: '免费施展妖火' },
  },
  {
    id: 'artificer-2024-cartographer-portal-jump', subclassId: 'subclass-2024-ua-artificer-cartographer', name: '传送门跃', englishName: 'Portal Jump', level: 5,
    summary: '附赠动作传送至多 60 尺；次数＝智力调整值（至少 1），长休恢复；可消耗持有者的地图免除次数。',
    description: '以一个附赠动作，你可以传送至多 60 尺至一处可见的未占据空间。使用次数等于你的智力调整值（至少 1 次），长休后恢复。若目的地在你地图持有者周围 5 尺内，你可以不消耗次数传送，但该生物的地图会被摧毁。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'artificer-2024-cartographer-ingenious-movement', subclassId: 'subclass-2024-ua-artificer-cartographer', name: '灵机一动', englishName: 'Ingenious Movement', level: 9,
    summary: '使用灵光一闪时，你或 30 尺内一名自愿生物可传送至多 30 尺。',
    description: '当你使用灵光一闪时，作为该反应的一部分，你或你选择的 30 尺内一名自愿生物可以传送至多 30 尺至一处可见的未占据空间。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'artificer-2024-cartographer-superior-atlas', subclassId: 'subclass-2024-ua-artificer-cartographer', name: '万能地图匣', englishName: 'Superior Atlas', level: 15,
    summary: '地图持有者濒死时可传送并稳定；免费施展寻路术（长休 1 次）；地图存在时专注不被伤害打断。',
    description: '安全归处：地图持有者生命值降至 0 但未被立即杀死时，可摧毁地图并传送到你或另一持有者 5 尺内，并稳定伤势。径路悉晓：若你也是地图持有者，可无需法术位、准备与成分施展寻路术，每次长休 1 次。坚定意志：只要至少一张你制作的地图存在，你对奇械师法术的专注不会因受到伤害而中断。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
]

const subclassFeatureFilter = (subclassId: string): readonly SubclassFeature[] =>
  artificerSubclassFeatures2024.filter((feature) => feature.subclassId === subclassId)

export const artificerSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-ua-artificer-alchemist',
    classId: 'class-2024-ua-artificer',
    ruleset: '5e-2024',
    name: '炼金师',
    englishName: 'Alchemist',
    selectionLevel: 3,
    summary: '药剂与治疗专家：实验性灵药、炼金术掌握与复原药剂，高等级获得强酸／毒素抗性与额外力场伤害。',
    status: 'selectable',
    availability: 'player',
    sourceIds,
    features: subclassFeatureFilter('subclass-2024-ua-artificer-alchemist'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-healing-word', 'spell-2024-ray-of-sickness'],
      5: ['spell-2024-flaming-sphere', 'spell-2024-melf-s-acid-arrow'],
      9: ['spell-2024-gaseous-form', 'spell-2024-mass-healing-word'],
      13: ['spell-2024-death-ward', 'spell-2024-vitriolic-sphere'],
      17: ['spell-2024-cloudkill', 'spell-2024-raise-dead'],
    },
  },
  {
    id: 'subclass-2024-ua-artificer-armorer',
    classId: 'class-2024-ua-artificer',
    ruleset: '5e-2024',
    name: '装甲师',
    englishName: 'Armorer',
    selectionLevel: 3,
    summary: '把护甲变为第二层皮肤：无畏战甲、卫护拳甲或渗透圣甲三种型号，5 级额外攻击，高等级强化装甲。',
    status: 'selectable',
    availability: 'player',
    sourceIds,
    features: subclassFeatureFilter('subclass-2024-ua-artificer-armorer'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-magic-missile', 'spell-2024-thunderwave'],
      5: ['spell-2024-mirror-image', 'spell-2024-shatter'],
      9: ['spell-2024-hypnotic-pattern', 'spell-2024-lightning-bolt'],
      13: ['spell-2024-fire-shield', 'spell-2024-greater-invisibility'],
      17: ['spell-2024-passwall', 'spell-2024-wall-of-force'],
    },
  },
  {
    id: 'subclass-2024-ua-artificer-artillerist',
    classId: 'class-2024-ua-artificer',
    ruleset: '5e-2024',
    name: '魔炮师',
    englishName: 'Artillerist',
    selectionLevel: 3,
    summary: '以魔能炮台提供爆发与临时生命：投火机、力场弩炮、防御者，高等级双炮台与半身掩护。',
    status: 'selectable',
    availability: 'player',
    sourceIds,
    features: subclassFeatureFilter('subclass-2024-ua-artificer-artillerist'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-shield', 'spell-2024-thunderwave'],
      5: ['spell-2024-scorching-ray', 'spell-2024-shatter'],
      9: ['spell-2024-fireball', 'spell-2024-wind-wall'],
      13: ['spell-2024-ice-storm', 'spell-2024-wall-of-fire'],
      17: ['spell-2024-cone-of-cold', 'spell-2024-wall-of-force'],
    },
  },
  {
    id: 'subclass-2024-ua-artificer-battle-smith',
    classId: 'class-2024-ua-artificer',
    ruleset: '5e-2024',
    name: '战地匠师',
    englishName: 'Battle Smith',
    selectionLevel: 3,
    summary: '以智力持械作战并带领钢铁守卫：战斗准备、额外攻击、奥能震荡，高等级改良守卫。',
    status: 'selectable',
    availability: 'player',
    sourceIds,
    features: subclassFeatureFilter('subclass-2024-ua-artificer-battle-smith'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-heroism', 'spell-2024-shield'],
      5: ['spell-2024-shining-smite', 'spell-2024-warding-bond'],
      9: ['spell-2024-aura-of-vitality', 'spell-2024-conjure-barrage'],
      13: ['spell-2024-aura-of-purity', 'spell-2024-fire-shield'],
      17: ['spell-2024-banishing-smite', 'spell-2024-mass-cure-wounds'],
    },
  },
  {
    id: 'subclass-2024-ua-artificer-cartographer',
    classId: 'class-2024-ua-artificer',
    ruleset: '5e-2024',
    name: '制图师',
    englishName: 'Cartographer',
    selectionLevel: 3,
    summary: '以魔法地图与侦察部件支援队伍：先攻加值、位置共享、传送与高等级安全归处。',
    status: 'selectable',
    availability: 'player',
    sourceIds,
    features: subclassFeatureFilter('subclass-2024-ua-artificer-cartographer'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-faerie-fire', 'spell-2024-guiding-bolt', 'spell-2024-healing-word'],
      5: ['spell-2024-locate-object', 'spell-2024-mind-spike'],
      9: ['spell-2024-clairvoyance', 'spell-2024-haste'],
      13: ['spell-2024-freedom-of-movement', 'spell-2024-locate-creature'],
      17: ['spell-2024-scrying', 'spell-2024-teleportation-circle'],
    },
  },
]
