import type { AbilityKey } from '@/types/character'
import type { FeatRule, RuleOption } from '@/types/rules'

export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const

export const ABILITY_LABELS: Readonly<Record<AbilityKey, string>> = {
  str: '力量',
  dex: '敏捷',
  con: '体质',
  int: '智力',
  wis: '感知',
  cha: '魅力',
}

const basicSourceIds = ['basic-rules-2014'] as const
const featSourceIds = ['phb-2014-index'] as const

const singleAbilityOptions: readonly RuleOption[] = ABILITY_KEYS.map((ability) => ({
  id: `asi-${ability}-2`,
  name: `${ABILITY_LABELS[ability]} +2`,
  description: `将${ABILITY_LABELS[ability]}提高2点，最终值不得超过20。`,
  status: 'implemented',
  sourceIds: basicSourceIds,
}))

const splitAbilityOptions: readonly RuleOption[] = ABILITY_KEYS.flatMap((left, leftIndex) =>
  ABILITY_KEYS.slice(leftIndex + 1).map((right) => ({
    id: `asi-${left}-${right}`,
    name: `${ABILITY_LABELS[left]} +1、${ABILITY_LABELS[right]} +1`,
    description: `将${ABILITY_LABELS[left]}和${ABILITY_LABELS[right]}分别提高1点，最终值不得超过20。`,
    status: 'implemented' as const,
    sourceIds: basicSourceIds,
  })),
)

export const abilityImprovementOptions2014: readonly RuleOption[] = [
  ...singleAbilityOptions,
  ...splitAbilityOptions,
]

export const ABILITY_IMPROVEMENT_OPTION_IDS = abilityImprovementOptions2014.map((option) => option.id)

const feat = (
  id: string,
  name: string,
  englishName: string,
  description: string,
  tags: readonly string[],
  prerequisite?: FeatRule['prerequisite'],
): FeatRule => ({
  id,
  ruleset: '5e-2014',
  name,
  englishName,
  description,
  tags,
  prerequisite,
  status: 'index-only',
  sourceIds: featSourceIds,
})

export const feats2014: readonly FeatRule[] = [
  feat('feat-alert', '警觉', 'Alert', '强化先攻与对突袭的应对能力。', ['战斗', '先攻']),
  feat('feat-athlete', '运动健将', 'Athlete', '提高力量或敏捷，并改善攀爬、起身与跳跃。', ['属性', '移动']),
  feat('feat-actor', '演员', 'Actor', '提高魅力，并强化模仿与伪装表现。', ['属性', '社交'], { abilityMinimum: { anyOf: ['cha'], score: 13 } }),
  feat('feat-charger', '冲锋者', 'Charger', '冲刺后可发动更具威胁的近战攻势。', ['战斗', '移动']),
  feat('feat-crossbow-expert', '弩专家', 'Crossbow Expert', '改善弩类武器的装填、近战射击与连贯攻击。', ['战斗', '远程']),
  feat('feat-defensive-duelist', '防御式决斗', 'Defensive Duelist', '使用灵巧武器时可临时提高防御。', ['战斗', '防御'], { abilityMinimum: { anyOf: ['dex'], score: 13 } }),
  feat('feat-dual-wielder', '双持客', 'Dual Wielder', '强化双武器战斗时的攻防与拔取武器。', ['战斗', '双持']),
  feat('feat-dungeon-delver', '地城探索者', 'Dungeon Delver', '强化发现与抵抗陷阱、暗门和地城危险的能力。', ['探索', '防御']),
  feat('feat-durable', '耐久', 'Durable', '提高体质，并改善使用生命骰恢复的稳定性。', ['属性', '生存']),
  feat('feat-elemental-adept', '元素精通', 'Elemental Adept', '专精一种元素伤害，使相关法术更稳定。', ['施法', '伤害'], { requiredCapability: 'spellcasting' }),
  feat('feat-grappler', '擒抱者', 'Grappler', '强化擒抱目标时的控制与攻击能力。', ['战斗', '控制'], { abilityMinimum: { anyOf: ['str'], score: 13 } }),
  feat('feat-great-weapon-master', '巨武器大师', 'Great Weapon Master', '强化重型武器的高风险攻击与连续压制。', ['战斗', '重型武器']),
  feat('feat-healer', '医者', 'Healer', '强化医药包的战地救治与恢复用途。', ['支援', '治疗']),
  feat('feat-heavily-armored', '重甲训练', 'Heavily Armored', '提高力量并获得重甲熟练。', ['属性', '护甲'], { requiredCapability: 'armor-medium' }),
  feat('feat-heavy-armor-master', '重甲大师', 'Heavy Armor Master', '提高力量，并在穿着重甲时减轻部分武器伤害。', ['属性', '防御'], { requiredCapability: 'armor-heavy' }),
  feat('feat-inspiring-leader', '激励领袖', 'Inspiring Leader', '通过鼓舞演说为队伍提供临时生命值。', ['支援', '社交'], { abilityMinimum: { anyOf: ['cha'], score: 13 } }),
  feat('feat-keen-mind', '敏锐心灵', 'Keen Mind', '提高智力，并强化方向、时间与记忆能力。', ['属性', '探索']),
  feat('feat-lightly-armored', '轻甲训练', 'Lightly Armored', '提高力量或敏捷，并获得轻甲熟练。', ['属性', '护甲']),
  feat('feat-linguist', '语言学家', 'Linguist', '提高智力，学习更多语言并能制作密码。', ['属性', '语言'], { abilityMinimum: { anyOf: ['int'], score: 13 } }),
  feat('feat-lucky', '幸运', 'Lucky', '获得可在关键检定中改变结果的幸运资源。', ['泛用', '检定']),
  feat('feat-mage-slayer', '法师杀手', 'Mage Slayer', '强化贴身压制施法者和抵抗法术的能力。', ['战斗', '反制']),
  feat('feat-magic-initiate', '魔法学徒', 'Magic Initiate', '从一个施法职业学习少量基础魔法。', ['施法', '泛用']),
  feat('feat-martial-adept', '武术学徒', 'Martial Adept', '学习战斗大师战技并获得一枚优势骰。', ['战斗', '战技']),
  feat('feat-medium-armor-master', '中甲大师', 'Medium Armor Master', '改善穿着中甲时的机动、隐匿与防御上限。', ['战斗', '护甲'], { requiredCapability: 'armor-medium' }),
  feat('feat-mobile', '机动', 'Mobile', '提高速度并降低高速近战后的脱离风险。', ['移动', '战斗']),
  feat('feat-moderately-armored', '中甲训练', 'Moderately Armored', '提高力量或敏捷，并获得中甲与盾牌熟练。', ['属性', '护甲'], { requiredCapability: 'armor-light' }),
  feat('feat-mounted-combatant', '骑乘战斗者', 'Mounted Combatant', '强化骑乘时的攻击、保护坐骑和闪避范围伤害。', ['战斗', '骑乘']),
  feat('feat-observant', '观察入微', 'Observant', '提高智力或感知，并强化被动察觉与调查。', ['属性', '探索'], { abilityMinimum: { anyOf: ['int', 'wis'], score: 13 } }),
  feat('feat-polearm-master', '长柄武器大师', 'Polearm Master', '强化长柄武器的附加攻击与控制范围。', ['战斗', '长柄武器']),
  feat('feat-resilient', '坚韧', 'Resilient', '提高一项属性，并获得对应豁免熟练。', ['属性', '防御']),
  feat('feat-ritual-caster', '仪式施法者', 'Ritual Caster', '学习并记录可通过仪式施放的法术。', ['施法', '仪式'], { abilityMinimum: { anyOf: ['int', 'wis'], score: 13 } }),
  feat('feat-savage-attacker', '野蛮攻击者', 'Savage Attacker', '让近战武器伤害骰的结果更可靠。', ['战斗', '伤害']),
  feat('feat-sentinel', '哨兵', 'Sentinel', '强化借机攻击并限制敌人脱离前线。', ['战斗', '控制']),
  feat('feat-sharpshooter', '神射手', 'Sharpshooter', '强化远程武器的射程、掩护处理与高风险攻击。', ['战斗', '远程']),
  feat('feat-shield-master', '盾牌大师', 'Shield Master', '将盾牌用于推撞、防护和敏捷豁免。', ['战斗', '盾牌']),
  feat('feat-skilled', '熟练', 'Skilled', '获得额外技能或工具熟练。', ['技能', '泛用']),
  feat('feat-skulker', '潜行者', 'Skulker', '强化隐蔽、昏暗环境与远程偷袭后的隐藏能力。', ['探索', '潜行'], { abilityMinimum: { anyOf: ['dex'], score: 13 } }),
  feat('feat-spell-sniper', '法术狙击手', 'Spell Sniper', '强化需要攻击检定的法术射程与掩护处理。', ['施法', '远程'], { requiredCapability: 'spellcasting' }),
  feat('feat-tavern-brawler', '酒馆斗殴者', 'Tavern Brawler', '强化徒手、临时武器和贴身擒抱。', ['战斗', '徒手']),
  feat('feat-tough', '强韧', 'Tough', '随等级提高生命值上限。', ['生存', '生命']),
  feat('feat-war-caster', '战地施法者', 'War Caster', '强化战斗施法、专注与借机法术。', ['施法', '专注'], { requiredCapability: 'spellcasting' }),
  feat('feat-weapon-master', '武器大师', 'Weapon Master', '提高力量或敏捷，并获得更多武器熟练。', ['属性', '武器']),
]

export const FEAT_OPTION_IDS = feats2014.map((item) => item.id)
export const ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS = [
  ...ABILITY_IMPROVEMENT_OPTION_IDS,
  ...FEAT_OPTION_IDS,
] as const
