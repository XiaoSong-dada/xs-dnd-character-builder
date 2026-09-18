import { ABILITY_KEYS, ABILITY_LABELS } from '@/rules/data/feats-2014'
import { SPELL_LIST_OPTION_IDS } from '@/rules/data/spell-lists-2024'
import type { AbilityKey } from '@/types/character'
import type {
  FeatCategory,
  FeatChoiceSpec,
  FeatRule,
  RuleOption,
  SpellPoolSpec,
} from '@/types/rules'

/**
 * 2024 专长目录（PHB）：起源 10、通用 43、战斗风格 10、传奇恩惠 12，共 75 条。
 * 效果摘要为原创中文转述；法术、武器精通、物品与情境资源由 B05／B07／B10 接入，
 * 未完成依赖的条目状态保持 `selectable`，不标记为完整实现。
 */

const sourceIds = ['source-2024-phb'] as const

const categoryTags: Readonly<Record<FeatCategory, string>> = {
  origin: '起源',
  general: '通用',
  'fighting-style': '战斗风格',
  'epic-boon': '传奇恩惠',
  dragonmark: '龙纹',
  'wild-talent': '狂野天赋',
}

/**
 * 专长自带属性提升子选项（`feat-bonus-<ability>-<1|2>`）的中文标签。
 * 与 2014 的 `featChoiceOptions2014` 同形：时间线子检查点、角色卡与导出均按此解析显示名，
 * 不得再回退到原始 ID（B09-09）。
 */
export const featChoiceOptions2024: readonly RuleOption[] = ABILITY_KEYS.flatMap((ability) => [1, 2].map((amount) => ({
  id: `feat-bonus-${ability}-${amount}`,
  name: `${ABILITY_LABELS[ability]} +${amount}`,
  description: `由父专长将${ABILITY_LABELS[ability]}提高${amount}点，最终值不得超过20。`,
  status: 'implemented' as const,
  sourceIds,
})))

const generalPrerequisite = { minimumLevel: 4 } as const
const boonPrerequisite = { minimumLevel: 19 } as const

/** 2024 属性值提升编码：单属性 +2 或两项各 +1；与 2014 的 `asi-*` 分开。 */
export const abilityImprovementOptions2024: readonly RuleOption[] = [
  ...ABILITY_KEYS.map((ability) => ({
    id: `asi-2024-${ability}-2`,
    name: `${ABILITY_LABELS[ability]} +2`,
    description: `将${ABILITY_LABELS[ability]}提高2点，最终值不得超过20。`,
    status: 'selectable' as const,
    sourceIds,
  })),
  ...ABILITY_KEYS.flatMap((left, index) =>
    ABILITY_KEYS.slice(index + 1).map((right) => ({
      id: `asi-2024-${left}-${right}`,
      name: `${ABILITY_LABELS[left]} +1、${ABILITY_LABELS[right]} +1`,
      description: `将${ABILITY_LABELS[left]}和${ABILITY_LABELS[right]}分别提高1点，最终值不得超过20。`,
      status: 'selectable' as const,
      sourceIds,
    })),
  ),
]

export const ABILITY_IMPROVEMENT_OPTION_IDS_2024 = abilityImprovementOptions2024.map((option) => option.id)

function abilityChoice(
  abilities: readonly AbilityKey[],
  extra: Partial<FeatChoiceSpec> = {},
): FeatChoiceSpec {
  const bonus = extra.abilityBonus ?? 1
  const cap = extra.abilityCap ?? 20
  return {
    id: 'ability',
    title: '属性提升',
    description: `选择一项属性提高${bonus}点，最终值不得超过${cap}。`,
    minSelections: 1,
    maxSelections: 1,
    optionIds: abilities.map((ability) => `feat-bonus-${ability}-${bonus}`),
    abilityBonus: bonus,
    abilityCap: cap,
    ...extra,
  }
}

function skillChoice(
  id: string,
  title: string,
  description: string,
  count: number,
  candidateKind: 'all-skills' | 'proficient-skills',
  extra: Partial<FeatChoiceSpec> = {},
): FeatChoiceSpec {
  return {
    id,
    title,
    description,
    minSelections: count,
    maxSelections: count,
    optionIds: [],
    candidateKind,
    ...extra,
  }
}

function spellChoice(spellPool: SpellPoolSpec, extra: Partial<FeatChoiceSpec> = {}): FeatChoiceSpec {
  return {
    id: 'spell',
    title: '选择法术',
    description: '从符合条件的法术中选择。',
    minSelections: 1,
    maxSelections: 1,
    optionIds: [],
    candidateKind: 'spell-pool',
    spellPool,
    ...extra,
  }
}

const asiChoice: FeatChoiceSpec = {
  id: 'ability-score',
  title: '属性值提升',
  description: '一项属性 +2，或两项不同属性各 +1；最终值不得超过 20。',
  minSelections: 1,
  maxSelections: 1,
  optionIds: ABILITY_IMPROVEMENT_OPTION_IDS_2024,
  abilityCap: 20,
}

const resilientChoice: FeatChoiceSpec = {
  id: 'ability',
  title: '属性与豁免熟练',
  description: '选择一项尚无豁免熟练的属性提高 1 点，并获得该属性的豁免熟练。',
  minSelections: 1,
  maxSelections: 1,
  optionIds: ABILITY_KEYS.map((ability) => `feat-bonus-${ability}-1`),
  abilityBonus: 1,
  abilityCap: 20,
  grantSavingThrowProficiency: true,
}

const allAbilities = ABILITY_KEYS
const boonAbilities = ABILITY_KEYS

function feat(
  slug: string,
  name: string,
  englishName: string,
  category: FeatCategory,
  summary: string,
  detail: string,
  extra: Partial<FeatRule> = {},
): FeatRule {
  return {
    id: `feat-2024-${slug}`,
    ruleset: '5e-2024',
    name,
    englishName,
    description: summary,
    detail,
    tags: [categoryTags[category]],
    category,
    status: 'selectable',
    sourceIds,
    ...extra,
  }
}

const originFeats: readonly FeatRule[] = [
  feat('alert', '警戒', 'Alert', 'origin',
    '强化先攻与先手配合。',
    '先攻检定加熟练加值。投先攻后可与同场且未失能的盟友交换先攻顺序；无次数池。',
    {}),
  feat('crafter', '巧匠', 'Crafter', 'origin',
    '工匠工具熟练与快速制作。',
    '快速制作表中选择 3 种不同的工匠工具熟练；购买非魔法物品享受八折；长休时可用熟练工具制作表内 1 件物品（下次长休时解体）。',
    {}),
  feat('healer', '医疗师', 'Healer', 'origin',
    '强化医疗包救治。',
    '以操作动作救治 5 尺内目标并花费 1 次医疗包，目标可花 1 个生命骰恢复生命，治疗骰值加你的熟练加值；以法术或本专长进行治疗掷骰时，可将 1 重掷并采用新值。',
    {}),
  feat('lucky', '幸运', 'Lucky', 'origin',
    '幸运点强化自身检定或干扰攻击。',
    '幸运点上限等于熟练加值，长休全部恢复；自身 D20 检定可花 1 点获得优势，针对自己的攻击可花 1 点施加劣势；不沿用旧版额外 d20 算法。',
    {}),
  feat('magic-initiate', '魔法学徒', 'Magic Initiate', 'origin',
    '从牧师、德鲁伊或法师表获得法术。',
    '选择一个法术表，从其戏法中选 2 道、一环法术中选 1 道，施法属性为智力、感知或魅力；一环法术始终准备，长休可免费施放 1 次，也可用法术位施放；升级时可替换 1 道同环同表法术；复选必须更换法术表。',
    { repeatable: true, choices: [
      abilityChoice(['int', 'wis', 'cha'], { description: '选择本专长法术的施法属性（智力、感知或魅力）。' }),
      { id: 'list', title: '选择法术表', description: '从牧师、德鲁伊或法师法术表中选一。', minSelections: 1, maxSelections: 1, optionIds: SPELL_LIST_OPTION_IDS },
      spellChoice({ level: 0, fromListChoiceId: 'list' }, { id: 'cantrips', title: '选择戏法', minSelections: 2, maxSelections: 2, description: '从所选法术表选择 2 道戏法。' }),
      spellChoice({ level: 1, fromListChoiceId: 'list' }, { id: 'spell', description: '从所选法术表选择 1 道一环法术；始终准备且长休免费 1 次。', spellGrant: { alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' } }),
    ] }),
  feat('musician', '音乐家', 'Musician', 'origin',
    '乐器熟练与英雄激励。',
    '选择 3 种乐器熟练；短休或长休结束时用熟练乐器演奏，至多熟练加值名听见的盟友获得英雄激励；不增加英雄激励的持有上限。',
    {}),
  feat('savage-attacker', '凶蛮打手', 'Savage Attacker', 'origin',
    '武器伤害骰双投取优。',
    '每回合一次，武器命中时可投两组武器伤害骰并任选一组；不重投其他来源附加的伤害骰。',
    {}),
  feat('skilled', '熟习', 'Skilled', 'origin',
    '自选三项技能或工具熟练。',
    '从技能或工具中选择合计 3 项熟练；可复选，重复熟练不会叠加熟练加值。',
    { repeatable: true, choices: [skillChoice('proficiencies', '选择熟练', '选择合计 3 项技能熟练（工具熟练由 B07 补充）。', 3, 'all-skills')] }),
  feat('tavern-brawler', '酒馆斗殴者', 'Tavern Brawler', 'origin',
    '徒手与临时武器强化。',
    '徒手打击造成 1d4 + 力量调整值伤害，徒手伤害骰可重掷 1 并采用新值；获得临时武器熟练；自己回合内以攻击动作徒手命中后可将目标推开 5 尺。',
    {}),
  feat('tough', '健壮', 'Tough', 'origin',
    '最大生命值提升。',
    '最大生命值增加 2 × 角色等级，此后每提升 1 级再增加 2。',
    { status: 'implemented', hitPointBonusPerLevel: 2 }),
]

const generalFeats: readonly FeatRule[] = [
  feat('ability-score-improvement', '属性值提升', 'Ability Score Improvement', 'general',
    '提高一项或两项属性。',
    '选择一项属性 +2，或两项不同属性各 +1；上限 20。可复选，每次独立获得节点。',
    { status: 'implemented', prerequisite: generalPrerequisite, repeatable: true, choices: [asiChoice] }),
  feat('actor', '演员', 'Actor', 'general',
    '提高魅力并强化模仿。',
    '魅力 +1（上限 20）。伪装特定人物时相关欺瞒与表演检定获得优势；模仿声音的识破洞悉检定 DC = 8 + 魅力调整值 + 熟练加值。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['cha'], score: 13 } }, choices: [abilityChoice(['cha'])] }),
  feat('athlete', '运动精英', 'Athlete', 'general',
    '提高力量或敏捷并改善移动。',
    '力量或敏捷 +1（上限 20）。攀爬速度等于速度；倒地后以 5 尺移动起身；助跑 5 尺即可进行长跳或高跳。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['str', 'dex'], score: 13 } }, choices: [abilityChoice(['str', 'dex'])] }),
  feat('charger', '冲锋手', 'Charger', 'general',
    '疾走后发动强力近战。',
    '力量或敏捷 +1（上限 20）。疾走时速度 +10 尺；自己回合内直线趋近目标 10 尺后以近战武器命中，可额外造成 1d8 伤害或推开 10 尺（至多大型）。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['str', 'dex'], score: 13 } }, choices: [abilityChoice(['str', 'dex'])] }),
  feat('chef', '大厨', 'Chef', 'general',
    '厨具熟练与休整食物。',
    '体质或感知 +1（上限 20）。若尚无厨具熟练则获得；短休时可为至多 4 + 熟练加值名食用者额外恢复 1d8；用 1 小时或长休制作熟练加值份点心，8 小时内食用者获得熟练加值点临时生命。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['con', 'wis'])] }),
  feat('crossbow-expert', '强弩专家', 'Crossbow Expert', 'general',
    '弩类武器连贯射击。',
    '敏捷 +1（上限 20）。手持、轻型与重型弩忽略装填属性且可无空手装弹；5 尺内敌人不造成远程攻击劣势；以轻型武器攻击后可附赠用另一把弩攻击。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['dex'], score: 13 } }, choices: [abilityChoice(['dex'])] }),
  feat('crusher', '粉碎者', 'Crusher', 'general',
    '钝击命中推动目标。',
    '力量或体质 +1（上限 20）。每回合一次钝击命中可将至多大型目标推移 5 尺至空位；钝击重击后对目标攻击获得优势直至自己下回合开始。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['str', 'con'])] }),
  feat('defensive-duelist', '防御式决斗', 'Defensive Duelist', 'general',
    '灵巧武器防御反应。',
    '敏捷 +1（上限 20）。手持灵巧武器被近战命中时，可用反应使 AC 加熟练加值，持续对近战攻击生效至自己下回合开始；不增加远程 AC。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['dex'], score: 13 } }, choices: [abilityChoice(['dex'])] }),
  feat('dual-wielder', '双持客', 'Dual Wielder', 'general',
    '强化双持攻防。',
    '力量或敏捷 +1（上限 20）。以轻型武器攻击后，该回合可用附赠动作以另一把非双手近战武器攻击（不加属性伤害）；一次可拔出或收起两把非双手武器。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['str', 'dex'], score: 13 } }, choices: [abilityChoice(['str', 'dex'])] }),
  feat('durable', '耐性', 'Durable', 'general',
    '提高体质并强化生命骰恢复。',
    '体质 +1（上限 20）。死亡豁免获得优势；附赠动作花费 1 个生命骰恢复其骰值生命（不额外加体质调整值）；生命骰按休息规则恢复。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['con'])] }),
  feat('elemental-adept', '元素掌控', 'Elemental Adept', 'general',
    '专精一种元素伤害。',
    '智力、感知或魅力 +1（上限 20）。选择强酸、寒冷、火焰、闪电或雷鸣之一：相关法术忽略该伤害类型抗性，伤害骰的 1 视为 2；复选必须更换伤害类型，且不忽略免疫。',
    { prerequisite: { minimumLevel: 4, requiredCapability: 'spellcasting-or-pact' }, repeatable: true, choices: [abilityChoice(['int', 'wis', 'cha'])] }),
  feat('fey-touched', '妖精触碰', 'Fey-Touched', 'general',
    '获得预言或惑控法术与迷踪步。',
    '智力、感知或魅力 +1（上限 20）。选择一道一环预言或惑控法术，另获得迷踪步；两者始终准备，各可长休免费施放 1 次，也可用法术位施放；施法属性为本专长提升的属性。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['int', 'wis', 'cha']), spellChoice({ level: 1, schools: ['预言', '惑控'] }, { description: '从一环预言或惑控法术中选择；始终准备且长休免费 1 次。', spellGrant: { alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' } })], grantedSpells: [{ spellId: 'spell-2024-misty-step', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' }] }),
  feat('grappler', '擒抱者', 'Grappler', 'general',
    '强化擒抱与对擒抱目标攻击。',
    '力量或敏捷 +1（上限 20）。攻击动作徒手命中后每回合一次可同时造成伤害并擒抱；攻击自己擒抱的生物有优势；搬运同体型或更小擒抱者不花额外移动。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['str', 'dex'], score: 13 } }, choices: [abilityChoice(['str', 'dex'])] }),
  feat('great-weapon-master', '巨武器大师', 'Great Weapon Master', 'general',
    '重型武器额外伤害与追击。',
    '力量 +1（上限 20）。自己回合内以重型武器命中可额外造成熟练加值伤害；近战武器重击或使目标降至 0 后，可附赠用同一武器再攻击；不沿用旧版命中 −5／伤害 +10。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['str'], score: 13 } }, choices: [abilityChoice(['str'])] }),
  feat('heavily-armored', '重甲运用', 'Heavily Armored', 'general',
    '获得重甲训练。',
    '力量或体质 +1（上限 20）。获得重甲训练；需已具备中甲训练。',
    { status: 'implemented', prerequisite: { minimumLevel: 4, requiredCapability: 'armor-medium' }, choices: [abilityChoice(['str', 'con'])], armorTraining: ['heavy'] }),
  feat('heavy-armor-master', '重甲大师', 'Heavy Armor Master', 'general',
    '重甲减伤。',
    '力量或体质 +1（上限 20）。身着重甲被攻击命中时，该次攻击的钝击、穿刺与挥砍伤害减少熟练加值；不限制伤害是否来自魔法。',
    { prerequisite: { minimumLevel: 4, requiredCapability: 'armor-heavy' }, choices: [abilityChoice(['str', 'con'])] }),
  feat('inspiring-leader', '领袖之证', 'Inspiring Leader', 'general',
    '休整后提供临时生命。',
    '感知或魅力 +1（上限 20）。短休或长休结束时进行 10 分钟表演，30 尺内至多 6 名见证盟友（可含自己）获得等于角色等级 + 本专长提升属性调整值的临时生命。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['wis', 'cha'], score: 13 } }, choices: [abilityChoice(['wis', 'cha'])] }),
  feat('keen-mind', '敏锐心灵', 'Keen Mind', 'general',
    '智力提升与研究强化。',
    '智力 +1（上限 20）。从奥秘、历史、调查、自然、宗教中选择 1 项：未熟练则获得熟练，已熟练则获得专精；进行研究动作可改为附赠动作。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['int'], score: 13 } }, choices: [abilityChoice(['int']), skillChoice('knowledge', '知识专精', '选择一项知识技能：未熟练则熟练，已熟练则专精。', 1, 'all-skills', { expertiseIfProficient: true })] }),
  feat('lightly-armored', '轻甲运用', 'Lightly Armored', 'general',
    '获得轻甲与盾牌训练。',
    '力量或敏捷 +1（上限 20）。获得轻甲与盾牌训练。',
    { status: 'implemented', prerequisite: generalPrerequisite, choices: [abilityChoice(['str', 'dex'])], armorTraining: ['light', 'shield'] }),
  feat('mage-slayer', '巫师杀手', 'Mage Slayer', 'general',
    '针对施法者的压制。',
    '力量或敏捷 +1（上限 20）。对专注中的生物造成伤害时，其维持专注的豁免具有劣势；自己的智力、感知或魅力豁免失败时可改为成功，短休或长休恢复 1 次。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['str', 'dex'])] }),
  feat('martial-weapon-training', '军用武器训练', 'Martial Weapon Training', 'general',
    '获得军用武器熟练。',
    '力量或敏捷 +1（上限 20）。获得军用武器熟练；不因此获得武器精通。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['str', 'dex'])] }),
  feat('medium-armor-master', '中甲大师', 'Medium Armor Master', 'general',
    '中甲敏捷上限提升。',
    '力量或敏捷 +1（上限 20）。身着中甲且敏捷不低于 16 时，AC 的敏捷加值上限由 2 提升为 3；不会自动消除隐匿劣势。',
    { prerequisite: { minimumLevel: 4, requiredCapability: 'armor-medium' }, choices: [abilityChoice(['str', 'dex'])] }),
  feat('moderately-armored', '中甲运用', 'Moderately Armored', 'general',
    '获得中甲训练。',
    '力量或敏捷 +1（上限 20）。获得中甲训练；需已具备轻甲训练；不额外授予盾牌训练。',
    { status: 'implemented', prerequisite: { minimumLevel: 4, requiredCapability: 'armor-light' }, choices: [abilityChoice(['str', 'dex'])], armorTraining: ['medium'] }),
  feat('mounted-combatant', '骑乘战斗', 'Mounted Combatant', 'general',
    '强化骑乘作战。',
    '力量、敏捷或感知 +1（上限 20）。骑乘时对坐骑 5 尺内、体型至少比坐骑小一级且未骑乘的生物攻击有优势；坐骑的敏捷半伤效应成功时不受伤害、失败时受一半；坐骑被命中时可改由自己承受。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['str', 'dex', 'wis'])] }),
  feat('observant', '观察力', 'Observant', 'general',
    '智力或感知提升与搜索强化。',
    '智力或感知 +1（上限 20）。从洞悉、调查、察觉中选择 1 项：未熟练则获得熟练，已熟练则获得专精；搜索动作可改为附赠动作。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['int', 'wis'], score: 13 } }, choices: [abilityChoice(['int', 'wis']), skillChoice('awareness', '感知专精', '选择一项感知系技能：未熟练则熟练，已熟练则专精。', 1, 'all-skills', { expertiseIfProficient: true })] }),
  feat('piercer', '穿刺者', 'Piercer', 'general',
    '穿刺伤害强化。',
    '力量或敏捷 +1（上限 20）。每回合一次穿刺命中后可重掷 1 个伤害骰并采用新值；穿刺重击额外增加 1 枚穿刺伤害骰。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['str', 'dex'])] }),
  feat('poisoner', '毒师', 'Poisoner', 'general',
    '毒药制作与涂毒。',
    '敏捷或智力 +1（上限 20）。毒伤忽略毒素抗性；获得毒药工具熟练，可用 1 小时与 50 GP 材料制作熟练加值剂毒药；附赠涂 1 剂，1 分钟或造成伤害后失效；目标的体质豁免 DC = 8 + 熟练加值 + 所提升属性调整值，失败受 2d8 毒素伤害并中毒至自己下回合结束。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['dex', 'int'])] }),
  feat('polearm-master', '长柄武器大师', 'Polearm Master', 'general',
    '长柄武器反端攻击。',
    '力量或敏捷 +1（上限 20）。以长棍、矛或带触及的重型武器执行攻击动作后，可附赠用武器反端造成 1d4 钝击；持用时敌人进入触及可发动反应近战攻击。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['str', 'dex'], score: 13 } }, choices: [abilityChoice(['str', 'dex'])] }),
  feat('resilient', '强健身心', 'Resilient', 'general',
    '属性提升并获得对应豁免熟练。',
    '选择一项尚无豁免熟练的属性提高 1 点（上限 20），并获得该属性的豁免熟练；本专长不可复选。',
    { status: 'implemented', prerequisite: generalPrerequisite, choices: [resilientChoice] }),
  feat('ritual-caster', '仪式施法者', 'Ritual Caster', 'general',
    '获得仪式法术。',
    '智力、感知或魅力 +1（上限 20）。选择熟练加值数量的一环仪式法术，始终准备，以所提升属性施法且可用法术位施放；熟练加值提升时再选择 1 道；快速仪式可长休进行 1 次。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['int', 'wis', 'cha'], score: 13 } }, choices: [abilityChoice(['int', 'wis', 'cha']), spellChoice({ level: 1, ritualOnly: true }, { id: 'rituals', title: '选择仪式法术', description: '选择熟练加值数量的一环仪式法术，全部始终准备。', minSelections: 1, maxSelections: 1, selectionCountFrom: 'proficiency-bonus', spellGrant: { alwaysPrepared: true } })] }),
  feat('sentinel', '哨兵', 'Sentinel', 'general',
    '强化借机攻击与牵制。',
    '力量或敏捷 +1（上限 20）。5 尺内生物撤离或攻击自己以外的目标时，可立即发动借机攻击；借机命中令其本回合速度变为 0；照常消耗反应。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['str', 'dex'], score: 13 } }, choices: [abilityChoice(['str', 'dex'])] }),
  feat('shadow-touched', '影界触碰', 'Shadow Touched', 'general',
    '获得幻术或死灵法术与隐形术。',
    '智力、感知或魅力 +1（上限 20）。选择一道一环幻术或死灵法术，另获得隐形术；两者始终准备，各可长休免费施放 1 次，也可用法术位施放；施法属性为本专长提升的属性。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['int', 'wis', 'cha']), spellChoice({ level: 1, schools: ['幻术', '死灵'] }, { description: '从一环幻术或死灵法术中选择；始终准备且长休免费 1 次。', spellGrant: { alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' } })], grantedSpells: [{ spellId: 'spell-2024-invisibility', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' }] }),
  feat('sharpshooter', '神射手', 'Sharpshooter', 'general',
    '远程武器精准射击。',
    '敏捷 +1（上限 20）。远程武器攻击忽略半掩护与四分之三掩护；5 尺内有敌人或处于远射程时不产生劣势；不增加旧版固定伤害。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['dex'], score: 13 } }, choices: [abilityChoice(['dex'])] }),
  feat('shield-master', '盾牌大师', 'Shield Master', 'general',
    '盾牌推撞与减伤。',
    '力量 +1（上限 20）。以近战武器 5 尺内命中且已装备盾牌时，每回合一次可迫使目标力量豁免 DC = 8 + 力量调整值 + 熟练加值，失败则被推开 5 尺或倒地；持盾时敏捷半伤效应成功可用反应免除伤害。',
    { prerequisite: { minimumLevel: 4, requiredCapability: 'shield' }, choices: [abilityChoice(['str'])] }),
  feat('skill-expert', '技艺专家', 'Skill Expert', 'general',
    '属性、技能熟练与专精。',
    '任一属性 +1（上限 20）；自选 1 项技能熟练；另选 1 项已有熟练但无专精的技能获得专精。',
    { status: 'implemented', prerequisite: generalPrerequisite, choices: [abilityChoice(allAbilities), skillChoice('proficiency', '技能熟练', '选择一项技能获得熟练。', 1, 'all-skills'), skillChoice('expertise', '技能专精', '选择一项已熟练且尚无专精的技能获得专精。', 1, 'proficient-skills')] }),
  feat('skulker', '隐伏者', 'Skulker', 'general',
    '潜行与隐蔽强化。',
    '敏捷 +1（上限 20）。获得 10 尺盲视；战斗中躲藏时敏捷（隐匿）检定有优势；隐藏中攻击失手不会暴露位置。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['dex'], score: 13 } }, choices: [abilityChoice(['dex'])] }),
  feat('slasher', '劈砍者', 'Slasher', 'general',
    '挥砍减速与压制。',
    '力量或敏捷 +1（上限 20）。每回合一次挥砍命中可令目标速度减少 10 尺至自己下回合开始；挥砍重击令目标攻击具有劣势至同一时点。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['str', 'dex'])] }),
  feat('speedy', '飙速跑者', 'Speedy', 'general',
    '速度提升与机动强化。',
    '敏捷或体质 +1（上限 20）。速度 +10 尺；自己疾走时该回合困难地形不消耗额外移动；针对自己的借机攻击具有劣势。',
    { prerequisite: { minimumLevel: 4, abilityMinimum: { anyOf: ['dex', 'con'], score: 13 } }, choices: [abilityChoice(['dex', 'con'])], speedBonus: 10 }),
  feat('spell-sniper', '法术射手', 'Spell Sniper', 'general',
    '法术攻击远程强化。',
    '智力、感知或魅力 +1（上限 20）。法术攻击忽略半掩护与四分之三掩护，且不受 5 尺内敌人造成的劣势；需要攻击检定且距离至少 10 尺的法术射程增加 60 尺。',
    { prerequisite: { minimumLevel: 4, requiredCapability: 'spellcasting-or-pact' }, choices: [abilityChoice(['int', 'wis', 'cha'])] }),
  feat('telekinetic', '念动力', 'Telekinetic', 'general',
    '法师之手强化与推离。',
    '智力、感知或魅力 +1（上限 20）。法师之手无需言语与姿势成分且可不显现；施法距离与可操控距离各增加 30 尺；附赠动作推离 30 尺内可见生物 5 尺，力量豁免 DC = 8 + 熟练加值 + 所提升属性调整值。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['int', 'wis', 'cha'])] }),
  feat('telepathic', '心灵感应', 'Telepathic', 'general',
    '心灵沟通与侦测思想。',
    '智力、感知或魅力 +1（上限 20）。可与 60 尺内可见且共享语言的生物单向传心；侦测思想始终准备，长休可免费免成分施放 1 次，也可用法术位施放；施法属性为本专长提升的属性。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['int', 'wis', 'cha'])], grantedSpells: [{ spellId: 'spell-2024-detect-thoughts', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' }] }),
  feat('war-caster', '战地施法者', 'War Caster', 'general',
    '专注与借机施法强化。',
    '智力、感知或魅力 +1（上限 20）。维持专注的体质豁免有优势；敌人离开触及触发借机攻击时，可用反应改施一道施法时间为 1 动作且只以该生物为目标的法术；持武器或盾牌时仍可满足姿势成分。',
    { prerequisite: { minimumLevel: 4, requiredCapability: 'spellcasting-or-pact' }, choices: [abilityChoice(['int', 'wis', 'cha'])] }),
  feat('weapon-master', '武器大师', 'Weapon Master', 'general',
    '获得一种武器精通。',
    '力量或敏捷 +1（上限 20）。选择一种已熟练的简易或军用武器获得其精通；长休可更换为另一种合格武器；不额外授予武器熟练。',
    { prerequisite: generalPrerequisite, choices: [abilityChoice(['str', 'dex'])] }),
]

const fightingStylePrerequisite = { requiredCapability: 'fighting-style' } as const

const fightingStyleFeats: readonly FeatRule[] = [
  feat('archery', '箭术', 'Archery', 'fighting-style', '远程攻击 +2。', '使用远程武器进行攻击检定时 +2；不作用于投掷近战武器。', { prerequisite: fightingStylePrerequisite }),
  feat('blind-fighting', '盲斗', 'Blind Fighting', 'fighting-style', '获得 10 尺盲视。', '获得 10 尺盲视；与已有盲视不叠加。', { prerequisite: fightingStylePrerequisite }),
  feat('defense', '防御', 'Defense', 'fighting-style', '穿甲时 AC +1。', '身着轻甲、中甲或重甲时 AC +1；仅持盾不触发。', { prerequisite: fightingStylePrerequisite }),
  feat('dueling', '对决', 'Dueling', 'fighting-style', '单手武器伤害 +2。', '单手持一把近战武器且未持其他武器时，该武器伤害 +2；盾牌不算其他武器。', { prerequisite: fightingStylePrerequisite }),
  feat('great-weapon-fighting', '巨武器战斗', 'Great Weapon Fighting', 'fighting-style', '双手武器伤害骰保底 3。', '双手持用双手或两用近战武器攻击时，伤害骰的 1 或 2 视为 3；不沿用旧版重掷。', { prerequisite: fightingStylePrerequisite }),
  feat('interception', '拦截', 'Interception', 'fighting-style', '反应减伤 1d10 + 熟练。', '可见攻击者命中自己 5 尺内另一生物时，可用反应减少 1d10 + 熟练加值的伤害；须持盾或简易／军用武器。', { prerequisite: fightingStylePrerequisite }),
  feat('protection', '守护', 'Protection', 'fighting-style', '反应施加劣势。', '持盾时可见攻击者攻击自己 5 尺内他人，可用反应令该次及针对该目标的其他攻击具有劣势至自己下回合开始，期间须留在其 5 尺内。', { prerequisite: fightingStylePrerequisite }),
  feat('thrown-weapon-fighting', '投掷武器战斗', 'Thrown Weapon Fighting', 'fighting-style', '投掷武器伤害 +2。', '以带投掷属性的武器进行远程攻击命中时，伤害 +2。', { prerequisite: fightingStylePrerequisite }),
  feat('two-weapon-fighting', '双武器战斗', 'Two-Weapon Fighting', 'fighting-style', '副手攻击加属性伤害。', '轻型武器产生的额外攻击可将属性调整值加入伤害；已加入时不重复。', { prerequisite: fightingStylePrerequisite }),
  feat('unarmed-fighting', '徒手战斗', 'Unarmed Fighting', 'fighting-style', '徒手伤害提升与擒抱压制。', '徒手打击造成 1d6 + 力量调整值伤害；未持武器与盾牌时为 1d8；自己回合开始时可对一个正被擒抱的生物造成 1d4 钝击伤害。', { prerequisite: fightingStylePrerequisite }),
]

const epicBoonFeats: readonly FeatRule[] = [
  feat('boon-of-combat-prowess', '英勇战斗之恩惠', 'Boon of Combat Prowess', 'epic-boon', '失手可改命中。', '任一属性 +1（上限 30）。攻击失手时可改为命中；使用后至自己下回合开始恢复。', { prerequisite: boonPrerequisite, choices: [abilityChoice(boonAbilities, { abilityCap: 30 })] }),
  feat('boon-of-dimensional-travel', '次元旅行之恩惠', 'Boon of Dimensional Travel', 'epic-boon', '动作后传送。', '任一属性 +1（上限 30）。执行攻击动作或魔法动作后可立即传送至 30 尺内可见空位。', { prerequisite: boonPrerequisite, choices: [abilityChoice(boonAbilities, { abilityCap: 30 })] }),
  feat('boon-of-energy-resistance', '能量抗性之恩惠', 'Boon of Energy Resistance', 'epic-boon', '两种伤害抗性与反伤。', '任一属性 +1（上限 30）。选择两种伤害类型获得抗性，长休可更换；受所选伤害时可用反应迫使 60 尺内可见生物敏捷豁免 DC = 8 + 体质调整值 + 熟练加值，失败受 2d12 + 体质调整值同类型伤害。', { prerequisite: boonPrerequisite, choices: [abilityChoice(boonAbilities, { abilityCap: 30 })] }),
  feat('boon-of-fate', '扭曲命运之恩惠', 'Boon of Fate', 'epic-boon', 'D20 检定增减 2d4。', '任一属性 +1（上限 30）。自己或 60 尺内他者的 D20 检定成败后可投 2d4 加或减；投先攻或短休、长休恢复 1 次。', { prerequisite: boonPrerequisite, choices: [abilityChoice(boonAbilities, { abilityCap: 30 })] }),
  feat('boon-of-fortitude', '超凡强韧之恩惠', 'Boon of Fortitude', 'epic-boon', '最大生命值 +40。', '任一属性 +1（上限 30）。最大生命值增加 40；回复生命时可额外回复体质调整值，使用后至自己下回合开始恢复。', { prerequisite: boonPrerequisite, choices: [abilityChoice(boonAbilities, { abilityCap: 30 })], hitPointBonus: 40 }),
  feat('boon-of-irresistible-offense', '无敌攻势之恩惠', 'Boon of Irresistible Offense', 'epic-boon', '忽略抗性与自然 20 增伤。', '力量或敏捷 +1（上限 30）。自己的钝击、穿刺与挥砍伤害忽略抗性；攻击自然 20 时额外造成等于本专长提升后属性值的同类型伤害。', { prerequisite: boonPrerequisite, choices: [abilityChoice(['str', 'dex'], { abilityCap: 30 })] }),
  feat('boon-of-recovery', '强力恢复之恩惠', 'Boon of Recovery', 'epic-boon', '濒死改 1 与治疗骰池。', '任一属性 +1（上限 30）。生命值降至 0 时可改为 1 并恢复最大生命值一半，长休恢复 1 次；另有 10 枚 d10 治疗骰池，附赠动作花费若干骰恢复合计值，长休全部恢复。', { prerequisite: boonPrerequisite, choices: [abilityChoice(boonAbilities, { abilityCap: 30 })] }),
  feat('boon-of-skill', '博学多才之恩惠', 'Boon of Skill', 'epic-boon', '全部技能熟练与一项专精。', '任一属性 +1（上限 30）。获得全部技能熟练；再选择一项尚无专精的技能获得专精。', { status: 'implemented', prerequisite: boonPrerequisite, grantsAllSkillProficiencies: true, choices: [abilityChoice(boonAbilities, { abilityCap: 30 }), skillChoice('expertise', '技能专精', '选择一项尚无专精的技能获得专精。', 1, 'proficient-skills')] }),
  feat('boon-of-speed', '神行无拘之恩惠', 'Boon of Speed', 'epic-boon', '速度 +30。', '任一属性 +1（上限 30）。速度增加 30 尺；可用附赠动作撤离并同时解除自身被擒抱状态。', { prerequisite: boonPrerequisite, choices: [abilityChoice(boonAbilities, { abilityCap: 30 })], speedBonus: 30 }),
  feat('boon-of-spell-recall', '法术溯回之恩惠', 'Boon of Spell Recall', 'epic-boon', '施法后可能不消耗法术位。', '智力、感知或魅力 +1（上限 30）。消耗 1—4 环法术位施法时投 d4，结果等于环级则不消耗该法术位；需要施法特性。', { prerequisite: { minimumLevel: 19, requiredCapability: 'spellcasting' }, choices: [abilityChoice(['int', 'wis', 'cha'], { abilityCap: 30 })] }),
  feat('boon-of-the-night-spirit', '暗夜精魂之恩惠', 'Boon of the Night Spirit', 'epic-boon', '微光黑暗中隐形与抗性。', '任一属性 +1（上限 30）。处于微光或黑暗中时可用附赠动作获得隐形，随后以动作、附赠动作或反应立即结束；在微光或黑暗中除心灵与光耀外获得全部伤害抗性。', { prerequisite: boonPrerequisite, choices: [abilityChoice(boonAbilities, { abilityCap: 30 })] }),
  feat('boon-of-truesight', '真实视觉之恩惠', 'Boon of Truesight', 'epic-boon', '获得 60 尺真实视觉。', '任一属性 +1（上限 30）。获得 60 尺真实视觉；不与其他感官距离叠加。', { prerequisite: boonPrerequisite, choices: [abilityChoice(boonAbilities, { abilityCap: 30 })] }),
]

export const feats2024: readonly FeatRule[] = [
  ...originFeats,
  ...generalFeats,
  ...fightingStyleFeats,
  ...epicBoonFeats,
]
