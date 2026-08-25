import { ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS } from '@/rules/data/feats-2014'
import { HALF_CASTER_SPELL_SLOTS, halfCasterMaximumSpellLevels } from '@/rules/data/spell-slots-2014'
import { spells2014 } from '@/rules/data/spells-2014'
import type { ClassRule, RuleOption } from '@/types/rules'

const sources = ['erftlw-2019-index', 'tcoe-2020-index'] as const

const ARTIFICER_SPELL_NAMES = new Set([
  'Acid Splash', 'Booming Blade', 'Create Bonfire', 'Dancing Lights', 'Fire Bolt', 'Frostbite',
  'Green-Flame Blade', 'Guidance', 'Light', 'Lightning Lure', 'Mage Hand', 'Magic Stone', 'Mending',
  'Message', 'Poison Spray', 'Prestidigitation', 'Ray of Frost', 'Resistance', 'Shocking Grasp',
  'Spare the Dying', 'Sword Burst', 'Thorn Whip', 'Thunderclap',
  'Absorb Elements', 'Alarm', 'Catapult', 'Cure Wounds', 'Detect Magic', 'Disguise Self',
  'Expeditious Retreat', 'Faerie Fire', 'False Life', 'Feather Fall', 'Grease', 'Identify', 'Jump',
  'Longstrider', 'Purify Food and Drink', 'Sanctuary', 'Snare', "Tasha's Caustic Brew",
  'Aid', 'Alter Self', 'Arcane Lock', 'Blur', 'Continual Flame', 'Darkvision', 'Enhance Ability',
  'Enlarge/Reduce', 'Heat Metal', 'Invisibility', 'Lesser Restoration', 'Levitate', 'Magic Mouth',
  'Magic Weapon', 'Protection from Poison', 'Pyrotechnics', 'Rope Trick', 'See Invisibility',
  'Skywrite', 'Spider Climb', 'Web',
  'Blink', 'Catnap', 'Create Food and Water', 'Dispel Magic', 'Elemental Weapon', 'Flame Arrows',
  'Fly', 'Glyph of Warding', 'Haste', 'Intellect Fortress', 'Protection from Energy', 'Revivify',
  'Tiny Servant', 'Water Breathing', 'Water Walk',
  'Arcane Eye', 'Elemental Bane', 'Fabricate', 'Freedom of Movement', "Leomund's Secret Chest",
  "Mordenkainen's Faithful Hound", "Otiluke's Resilient Sphere", 'Stone Shape', 'Stoneskin',
  'Summon Construct', 'Animate Objects', "Bigby's Hand", 'Creation', 'Greater Restoration',
  'Skill Empowerment', 'Transmute Rock', 'Wall of Stone',
])

const artificerSpellIds = spells2014
  .filter((spell) => ARTIFICER_SPELL_NAMES.has(spell.englishName))
  .map((spell) => spell.id)

export interface ArtificerInfusionRule extends RuleOption {
  readonly minimumLevel: number
  readonly eligibleCategories: readonly ('armor' | 'shield' | 'weapon' | 'tool' | 'gear' | 'magic')[]
  readonly magicBonus?: number
  readonly replicateItemId?: string
}

const infusion = (
  slug: string,
  name: string,
  description: string,
  minimumLevel: number,
  eligibleCategories: ArtificerInfusionRule['eligibleCategories'],
  extra: Pick<ArtificerInfusionRule, 'magicBonus' | 'replicateItemId'> = {},
): ArtificerInfusionRule => ({
  id: `infusion-2014-${slug}`,
  name,
  description,
  minimumLevel,
  eligibleCategories,
  status: 'selectable',
  sourceIds: sources,
  ...extra,
})

export const artificerInfusions2014: readonly ArtificerInfusionRule[] = [
  infusion('arcane-propulsion-armor', '奥术推进护甲', '14 级：护甲变为施法焦点，提供驱动力与可投掷的拳甲。', 14, ['armor']),
  infusion('armor-of-magical-strength', '魔力强化护甲', '护甲储存充能，可用于强化力量检定或抵抗倒地。', 2, ['armor']),
  infusion('boots-of-the-winding-path', '迂回之靴', '6 级：可用附赠动作回到本回合经过的空间。', 6, ['gear', 'magic']),
  infusion('enhanced-arcane-focus', '强化奥术法器', '施法攻击获得 +1，10 级提升为 +2。', 2, ['gear', 'tool', 'magic'], { magicBonus: 1 }),
  infusion('enhanced-defense', '强化防御', '护甲或盾牌 AC 获得 +1，10 级提升为 +2。', 2, ['armor', 'shield'], { magicBonus: 1 }),
  infusion('enhanced-weapon', '强化武器', '武器攻击与伤害获得 +1，10 级提升为 +2。', 2, ['weapon'], { magicBonus: 1 }),
  infusion('helm-of-awareness', '警觉头盔', '10 级：先攻检定具有优势，且不会陷入突袭。', 10, ['gear', 'magic']),
  infusion('homunculus-servant', '人造人仆从', '创造一只受命令行动的小型构装仆从；以结构化资源与摘要表示。', 2, ['gear', 'magic']),
  infusion('mind-sharpener', '锐意护甲', '护甲储存充能，可在专注豁免失败时改为成功。', 2, ['armor']),
  infusion('radiant-weapon', '光辉武器', '6 级：武器 +1，可发光并以反应令攻击者暂时盲目。', 6, ['weapon'], { magicBonus: 1 }),
  infusion('repeating-shot', '连射武器', '弹药武器 +1，无需装弹且会自动产生弹药。', 2, ['weapon'], { magicBonus: 1 }),
  infusion('repulsion-shield', '排斥盾牌', '6 级：盾牌 AC 额外 +1，可以反应推开近战攻击者。', 6, ['shield'], { magicBonus: 1 }),
  infusion('resistant-armor', '抗性护甲', '6 级：从一种元素或特殊伤害类型中选择，穿戴者获得对应抗性。', 6, ['armor']),
  infusion('returning-weapon', '回旋武器', '可投掷武器 +1，进行远程攻击后立即回到手中。', 2, ['weapon'], { magicBonus: 1 }),
  infusion('spell-refueling-ring', '法术回能指环', '6 级：每日可恢复一个 3 环或更低的法术位。', 6, ['gear', 'magic']),
  ...[
    ['alchemy-jug', '炼金壶', 2], ['bag-of-holding', '次元袋', 2], ['cap-of-water-breathing', '水下呼吸帽', 2],
    ['goggles-of-night', '夜视护目镜', 2], ['rope-of-climbing', '攀爬绳', 2], ['sending-stones', '传讯石', 2],
    ['boots-of-elvenkind', '精灵靴', 6], ['cloak-of-elvenkind', '精灵斗篷', 6], ['eyes-of-charming', '魅惑之眼', 6],
    ['gloves-of-thievery', '窃贼手套', 6], ['lantern-of-revealing', '显形提灯', 6], ['ring-of-water-walking', '水上行走指环', 6],
    ['boots-of-striding-and-springing', '大步奔跃靴', 10], ['bracers-of-archery', '射术护腕', 10], ['cloak-of-protection', '防护斗篷', 10],
    ['gauntlets-of-ogre-power', '食人魔力量护手', 10], ['winged-boots', '飞翼靴', 10],
    ['amulet-of-health', '健康护符', 14], ['belt-of-hill-giant-strength', '丘陵巨人力量腰带', 14],
    ['boots-of-speed', '速度之靴', 14], ['ring-of-protection', '防护指环', 14],
  ].map(([slug, name, level]) => infusion(`replicate-${slug}`, `复制魔法物品：${name}`, `复制“${name}”的配方；每个配方使用独立稳定 ID。`, Number(level), ['gear', 'magic'], { replicateItemId: String(slug) })),
]

const infusionIdsAt = (level: number): readonly string[] => artificerInfusions2014
  .filter((item) => item.minimumLevel <= level)
  .map((item) => item.id)

const asi = (level: number) => ({
  id: `artificer-2014-asi-${level}`, level, step: 'timeline' as const, kind: 'ability-improvement' as const,
  title: '属性提升或专长', description: '属性提升与专长互斥。', required: true,
  minSelections: 1, maxSelections: 1, optionIds: ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS,
})

const infusionCheckpoint = (level: number, count: number) => ({
  id: `artificer-2014-infusions-${level}`, level, step: 'timeline' as const, kind: 'infusion' as const,
  title: level === 2 ? '选择已知灌注' : '新增已知灌注',
  description: '选择尚未掌握且符合工匠等级前置的灌注。', required: true,
  minSelections: count, maxSelections: count, optionIds: infusionIdsAt(level), uniqueGroup: 'artificer-infusions-known',
})

const ARTIFICER_SLOTS = HALF_CASTER_SPELL_SLOTS.map((slots, index) => index === 0 ? [2] as const : slots)
const ARTIFICER_MAX_LEVELS = halfCasterMaximumSpellLevels.map((level, index) => index === 0 ? 1 : level)

export const artificerClass2014: ClassRule = {
  id: 'class-2014-artificer', ruleset: '5e-2014', name: '工匠', englishName: 'Artificer',
  summary: '以智力施法、魔法工具与灌注物品支援队伍的 d8 职业。',
  hitDie: 8, primaryAbilities: ['int'], playStyleTags: ['spellcaster', 'support', 'utility', 'durable'],
  savingThrowAbilities: ['con', 'int'], status: 'implemented', sourceIds: sources,
  checkpoints: [
    { id: 'artificer-2014-skills-1', level: 1, step: 'timeline', kind: 'skills', title: '选择 2 项工匠技能', description: '从工匠职业技能中选择。', required: true, minSelections: 2, maxSelections: 2, optionIds: ['skill-arcana', 'skill-history', 'skill-investigation', 'skill-medicine', 'skill-nature', 'skill-perception', 'skill-sleight-of-hand'] },
    { id: 'artificer-2014-tool-1', level: 1, step: 'timeline', kind: 'class-choice', title: '选择一套工匠工具', description: '除盗贼工具与修补工具外，再选择一类工匠工具熟练。', required: true, minSelections: 1, maxSelections: 1, optionIds: ['tool-alchemists-supplies', 'tool-brewers-supplies', 'tool-calligraphers-supplies', 'tool-carpenters-tools', 'tool-masons-tools', 'tool-smiths-tools', 'tool-woodcarvers-tools'] },
    infusionCheckpoint(2, 4),
    { id: 'artificer-2014-subclass-3', level: 3, step: 'timeline', kind: 'subclass', title: '选择工匠专职', description: '在炼金术士、装甲师、炮术师与战斗铁匠中选择。', required: true, minSelections: 1, maxSelections: 1, optionIds: [] },
    asi(4), infusionCheckpoint(6, 2), asi(8), infusionCheckpoint(10, 2), asi(12), infusionCheckpoint(14, 2), asi(16), infusionCheckpoint(18, 2), asi(19),
  ],
  spellcasting: {
    ruleset: '5e-2014', mode: 'prepared', ability: 'int', startsAtLevel: 1,
    preparedFormula: 'ability-plus-half-level-ceil', cantripsKnownByLevel: [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4],
    maxSpellLevelByClassLevel: ARTIFICER_MAX_LEVELS, slotsByClassLevel: ARTIFICER_SLOTS, classSpellIds: artificerSpellIds,
  },
}

export function getArtificerInfusedItemLimit(level: number): number {
  if (level >= 18) return 6
  if (level >= 14) return 5
  if (level >= 10) return 4
  if (level >= 6) return 3
  return level >= 2 ? 2 : 0
}
