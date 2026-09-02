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
const featSourceIds = ['basic-rules-2014', 'phb-2014-index'] as const

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
  detail: string,
  tags: readonly string[],
  prerequisite?: FeatRule['prerequisite'],
  choices?: FeatRule['choices'],
): FeatRule => ({
  id,
  ruleset: '5e-2014',
  name,
  englishName,
  description,
  detail,
  tags,
  prerequisite,
  choices,
  status: 'implemented',
  sourceIds: featSourceIds,
})

const coreFeats2014: readonly FeatRule[] = [
  feat('feat-alert', '警觉', 'Alert', '强化先攻与对突袭的应对能力。', '你的先攻检定获得 +5 加值；处于警觉状态时，只要未昏迷，突袭回合中也能正常行动，不会被突袭打出劣势。', ['战斗', '先攻']),
  feat('feat-athlete', '运动员', 'Athlete', '提高力量或敏捷，并改善攀爬、起身与跳跃。', '力量或敏捷 +1（上限 20）。攀爬不额外消耗移动力，且攀爬时攻击者对你无优势；倒地后以 5 尺移动起身而非一半移动；助跑跳远与跳高距离各 +1 尺（规则单位按项目实现换算）。', ['属性', '移动']),
  feat('feat-actor', '演员', 'Actor', '提高魅力，并强化模仿与伪装表现。', '魅力 +1（上限 20）。进行欺骗或表演检定模仿他人声音时获得优势；可伪造声音并模仿他人说话，识破需与你的表演/欺骗对抗；施放只含语言成分的法术时，可用拟声掩盖你的说话内容。', ['属性', '社交'], { abilityMinimum: { anyOf: ['cha'], score: 13 } }),
  feat('feat-charger', '冲锋手', 'Charger', '冲刺后可发动更具威胁的近战攻势。', '执行疾走动作时，可用附赠动作发动一次近战武器攻击或推撞生物；若此前直线移动至少 10 尺，近战攻击命中额外造成 5 点伤害，推撞成功可将目标推离至多 10 尺（运动对抗，可改选推倒）。', ['战斗', '移动']),
  feat('feat-crossbow-expert', '强弩专家', 'Crossbow Expert', '改善弩类武器的装填、近战射击与连贯攻击。', '装填属性对弩不再限制攻击次数；对 5 尺内生物进行远程攻击不再有劣势；以单手武器攻击后，可用附赠动作持手弩进行一次攻击。', ['战斗', '远程']),
  feat('feat-defensive-duelist', '防御式决斗', 'Defensive Duelist', '使用灵巧武器时可临时提高防御。', '前置：敏捷 13。手持灵巧武器被近战攻击命中时，可用反应使本次攻击的护甲等级 + 熟练加值，可能使攻击转为未命中。', ['战斗', '防御'], { abilityMinimum: { anyOf: ['dex'], score: 13 } }),
  feat('feat-dual-wielder', '双持客', 'Dual Wielder', '强化双武器战斗时的攻防与拔取武器。', '双持两把单手近战武器时，护甲等级 +1；可同时拔取两把武器；双武器战斗的副手武器不再限轻型（仍要求单手武器）。', ['战斗', '双持']),
  feat('feat-dungeon-delver', '地城探索者', 'Dungeon Delver', '强化发现与抵抗陷阱、暗门和地城危险的能力。', '搜索隐藏的暗门与陷阱的感知（察觉）与智力（调查）检定获得优势；对陷阱的豁免检定获得优势；陷阱造成的伤害获得抗性；以快速步调旅行时，被动察觉不承受 -5 减值。', ['探索', '防御']),
  feat('feat-durable', '耐性', 'Durable', '提高体质，并改善使用生命骰恢复的稳定性。', '体质 +1（上限 20）。短休时掷生命骰恢复生命，最低恢复量 = 2 × 你的体质调整值（低于该值按该值计）。', ['属性', '生存']),
  feat('feat-elemental-adept', '元素导师', 'Elemental Adept', '专精一种元素伤害，使相关法术更稳定。', '前置：能施放至少一个法术。选择强酸、冷冻、火焰、闪电或雷鸣之一：该元素的伤害忽略抗性（免疫仍有效）；施放该元素法术时，伤害骰掷出 1 视为 2。', ['施法', '伤害'], { requiredCapability: 'spellcasting' }),
  feat('feat-grappler', '擒抱者', 'Grappler', '强化擒抱目标时的控制与攻击能力。', '前置：力量 13。擒抱目标时，对其攻击检定获得优势；可用动作尝试压住目标（双方对抗检定），成功后目标被束缚直至挣脱；对被你擒抱的生物的攻击不受其 5 尺外攻击劣势影响。', ['战斗', '控制'], { abilityMinimum: { anyOf: ['str'], score: 13 } }),
  feat('feat-great-weapon-master', '巨武器大师', 'Great Weapon Master', '强化重型武器的高风险攻击与连续压制。', '近战重武器攻击前可选择 -5 命中 +10 伤害；用近战武器造成重击或击杀生物时，可用附赠动作再进行一次近战武器攻击。', ['战斗', '重型武器']),
  feat('feat-healer', '医疗师', 'Healer', '强化医药包的战地救治与恢复用途。', '使用医药包稳定濒死生物时，该生物恢复 1 点生命；也可用医药包治疗生物：每只生物每长休一次，恢复 1d6+4+目标生命骰数量的生命值。', ['支援', '治疗']),
  feat('feat-heavily-armored', '重甲运用', 'Heavily Armored', '提高力量并获得重甲熟练。', '力量 +1（上限 20）。获得重甲熟练。前置：中甲熟练。', ['属性', '护甲'], { requiredCapability: 'armor-medium' }),
  feat('feat-heavy-armor-master', '重甲大师', 'Heavy Armor Master', '提高力量，并在穿着重甲时减轻部分武器伤害。', '力量 +1（上限 20）。穿着重甲时，来自非魔法的钝击、穿刺、挥砍伤害各减少 3 点。前置：重甲熟练。', ['属性', '防御'], { requiredCapability: 'armor-heavy' }),
  feat('feat-inspiring-leader', '领袖之证', 'Inspiring Leader', '通过鼓舞演说为队伍提供临时生命值。', '前置：魅力 13。花费 10 分钟演说，选择 30 尺内至多 6 个生物（含自身）获得临时生命值 = 你的等级 + 魅力调整值；每长休可使用一次。', ['支援', '社交'], { abilityMinimum: { anyOf: ['cha'], score: 13 } }),
  feat('feat-keen-mind', '敏锐心灵', 'Keen Mind', '提高智力，并强化方向、时间与记忆能力。', '智力 +1（上限 20）。总能记得自己去过的方向和走过的距离；能精确感知一天内的时间；可准确回忆过去一个月内见过或听过的事情。', ['属性', '探索']),
  feat('feat-lightly-armored', '轻甲运用', 'Lightly Armored', '提高力量或敏捷，并获得轻甲熟练。', '力量或敏捷 +1（上限 20）。获得轻甲熟练。', ['属性', '护甲']),
  feat('feat-linguist', '语言学家', 'Linguist', '提高智力，学习更多语言并能制作密码。', '智力 +1（上限 20）。学会三门语言；可创建书面密码，他人破译需进行智力检定对抗你的智力检定。', ['属性', '语言'], { abilityMinimum: { anyOf: ['int'], score: 13 } }),
  feat('feat-lucky', '幸运', 'Lucky', '获得可在关键检定中改变结果的幸运资源。', '获得 3 个幸运点，长休后恢复。进行攻击、属性检定、豁免或技能检定前，可消耗 1 点令自己另掷一次并选用较优结果；也可在敌人攻击检定掷出后消耗 1 点，令其重掷并取较差结果。', ['泛用', '检定']),
  feat('feat-mage-slayer', '巫师杀手', 'Mage Slayer', '强化贴身压制施法者和抵抗法术的能力。', '5 尺内生物施法时，可用反应进行一次近战攻击（在法术生效前）；对被你近战攻击命中的生物施放的豁免法术，其豁免检定具有劣势；施法者对你施放的专注法术被中断时，你对其的豁免获得优势。', ['战斗', '反制']),
  feat('feat-magic-initiate', '魔法学徒', 'Magic Initiate', '从一个施法职业学习少量基础魔法。', '选择一个施法职业：习得其 2 个戏法，以及 1 个 1 环法术（每长休可用该 1 环法术一次）；施法属性为该职业的施法属性。', ['施法', '泛用']),
  feat('feat-martial-adept', '战技专家', 'Martial Adept', '学习战斗大师战技并获得一枚优势骰。', '习得两项战斗大师战技；获得一枚 d6 优势骰（随战技使用，短休或长休后恢复）。若已拥有优势骰，则其骰面提升一级。', ['战斗', '战技']),
  feat('feat-medium-armor-master', '中甲大师', 'Medium Armor Master', '改善穿着中甲时的机动、隐匿与防御上限。', '穿着中甲时，敏捷调整值对护甲等级的加值上限提升至 3；中甲不再对隐匿检定施加劣势。前置：中甲熟练。', ['战斗', '护甲'], { requiredCapability: 'armor-medium' }),
  feat('feat-mobile', '灵活移动', 'Mobile', '提高速度并降低高速近战后的脱离风险。', '移动速度 +10 尺；困难地形不额外消耗移动力（冲刺时）；近战攻击后，目标无法对该回合内你对它发起的借机攻击做出反应（若你攻击了多个目标则分别判定）。', ['移动', '战斗']),
  feat('feat-moderately-armored', '中甲运用', 'Moderately Armored', '提高力量或敏捷，并获得中甲与盾牌熟练。', '力量或敏捷 +1（上限 20）。获得中甲与盾牌熟练。前置：轻甲熟练。', ['属性', '护甲'], { requiredCapability: 'armor-light' }),
  feat('feat-mounted-combatant', '骑乘战斗', 'Mounted Combatant', '强化骑乘时的攻击、保护坐骑和闪避范围伤害。', '骑乘时，对体型小于坐骑且未被骑乘的生物发起的近战攻击获得优势；可迫使攻击坐骑的攻击改以你为目标；坐骑进行敏捷豁免成功时不受伤害、失败时只受一半伤害。', ['战斗', '骑乘']),
  feat('feat-observant', '观察力', 'Observant', '提高智力或感知，并强化被动察觉与调查。', '智力或感知 +1（上限 20）。被动察觉与被动调查各 +5；能读懂他人嘴唇动作（需能看见对方且对方说你能理解的语言）。', ['属性', '探索'], { abilityMinimum: { anyOf: ['int', 'wis'], score: 13 } }),
  feat('feat-polearm-master', '长柄武器大师', 'Polearm Master', '强化长柄武器的附加攻击与控制范围。', '使用长柄或长杆武器攻击后，可用附赠动作以武器另一端进行一次攻击（1d4 钝击伤害）；生物进入你的触及范围时，可对其发起借机攻击。', ['战斗', '长柄武器']),
  feat('feat-resilient', '强健身心', 'Resilient', '提高一项属性，并获得对应豁免熟练。', '选择一项属性 +1（上限 20），并获得该属性的豁免熟练。', ['属性', '防御'], undefined, [
    {
      id: 'resilient-ability',
      title: '选择属性加值',
      description: '选择一项由专长提高 1 点的属性，并获得该属性的豁免熟练。',
      minSelections: 1,
      maxSelections: 1,
      optionIds: ABILITY_KEYS.map((ability) => `feat-bonus-${ability}-1`),
      abilityBonus: 1,
      grantSavingThrowProficiency: true,
    },
  ]),
  feat('feat-ritual-caster', '仪式施法者', 'Ritual Caster', '学习并记录可通过仪式施放的法术。', '前置：智力或感知 13。获得一本仪式书，记录两个 1 环带仪式标签的法术；可抄录其他仪式法术（花费时间与金币）；可仪式施放书中法术，无需准备。', ['施法', '仪式'], { abilityMinimum: { anyOf: ['int', 'wis'], score: 13 } }),
  feat('feat-savage-attacker', '凶蛮打手', 'Savage Attacker', '让近战武器伤害骰的结果更可靠。', '近战武器攻击命中时，可重掷一次伤害骰并选用较优结果；每回合一次。', ['战斗', '伤害']),
  feat('feat-sentinel', '哨兵', 'Sentinel', '强化借机攻击并限制敌人脱离前线。', '借机攻击命中时，目标移动速度降为 0；即使目标进行撤离动作，仍可对其发起借机攻击；5 尺内敌人攻击你的盟友（该盟友没有此专长）时，可用反应进行一次近战攻击。', ['战斗', '控制']),
  feat('feat-sharpshooter', '神射手', 'Sharpshooter', '强化远程武器的射程、掩护处理与高风险攻击。', '远程武器攻击不再因长射程而劣势；对处于部分掩护的敌人攻击不再有劣势；远程武器攻击前可选择 -5 命中 +10 伤害。', ['战斗', '远程']),
  feat('feat-shield-master', '盾牌大师', 'Shield Master', '将盾牌用于推撞、防护和敏捷豁免。', '持盾时，攻击动作后可用附赠动作推撞 5 尺内生物（力量对抗，失败者倒地）；被要求进行只影响你的敏捷豁免时，可用反应完全闪避（成功无伤、失败减半）。', ['战斗', '盾牌']),
  feat('feat-skilled', '熟习', 'Skilled', '获得额外技能或工具熟练。', '获得三项任意技能或工具熟练（可混合选择）。', ['技能', '泛用']),
  feat('feat-skulker', '隐伏者', 'Skulker', '强化隐蔽、昏暗环境与远程偷袭后的隐藏能力。', '前置：敏捷 13。对处于昏暗环境的生物进行远程攻击时，不因隐蔽劣势受影响；远程攻击未命中时不会暴露你的位置；被轻度遮蔽时可尝试躲藏。', ['探索', '潜行'], { abilityMinimum: { anyOf: ['dex'], score: 13 } }),
  feat('feat-spell-sniper', '法术射手', 'Spell Sniper', '强化需要攻击检定的法术射程与掩护处理。', '前置：能施放至少一个法术。需要攻击检定的法术射程翻倍；对处于部分掩护的敌人施放攻击法术不再有劣势；习得一个需要攻击检定的戏法。', ['施法', '远程'], { requiredCapability: 'spellcasting' }),
  feat('feat-tavern-brawler', '斗殴高手', 'Tavern Brawler', '强化徒手、临时武器和贴身擒抱。', '力量或体质 +1（上限 20）。徒手打击伤害骰变为 1d4 + 力量调整值；获得临时武器熟练；徒手或临时武器攻击命中后，可用附赠动作尝试擒抱目标。', ['战斗', '徒手']),
  feat('feat-tough', '健壮', 'Tough', '随等级提高生命值上限。', '生命值上限每等级 +2（含当前等级）。', ['生存', '生命']),
  feat('feat-war-caster', '战地施法者', 'War Caster', '强化战斗施法、专注与借机法术。', '前置：能施放至少一个法术。因受伤进行体质豁免以维持专注时获得优势；即使单手或双手持握武器或盾牌，仍可满足法术的姿势成分；敌人离开你的触及范围时，可用反应对其施放一个施法时间为 1 动作的法术（替代借机攻击）。', ['施法', '专注'], { requiredCapability: 'spellcasting' }),
  feat('feat-weapon-master', '武器大师', 'Weapon Master', '提高力量或敏捷，并获得更多武器熟练。', '力量或敏捷 +1（上限 20）。获得四种自选武器熟练。', ['属性', '武器']),
]

const abilityChoice = (id: string, abilities: readonly AbilityKey[]) => ({
  id: `${id}-ability`, title: '选择属性加值', description: '选择一项由专长提高 1 点的属性。',
  minSelections: 1, maxSelections: 1, optionIds: abilities.map((ability) => `feat-bonus-${ability}-1`), abilityBonus: 1,
})

const supplementFeat = (
  id: string,
  name: string,
  englishName: string,
  sourceId: 'xgte-2017-index' | 'tcoe-2020-index',
  detail: string,
  tags: readonly string[],
  extra: Pick<FeatRule, 'prerequisite' | 'choices' | 'repeatable'> = {},
): FeatRule => ({ id, ruleset: '5e-2014', name, englishName, description: detail.split('。')[0] ?? detail, detail, tags, status: 'selectable', sourceIds: [sourceId], ...extra })

const xgteFeats2014: readonly FeatRule[] = [
  supplementFeat('feat-bountiful-luck', '慷慨吉运', 'Bountiful Luck', 'xgte-2017-index', '前置：半身人。附近盟友检定掷出 1 时，可用反应让其重掷。', ['种族', '支援'], { prerequisite: { requiredRaceIds: ['race-2014-halfling'] } }),
  supplementFeat('feat-dragon-fear', '龙之威怖', 'Dragon Fear', 'xgte-2017-index', '前置：龙裔。力量、体质或魅力 +1；可用吐息次数发出恐惧咆哮。', ['种族', '属性'], { prerequisite: { requiredRaceIds: ['race-2014-dragonborn'] }, choices: [abilityChoice('dragon-fear', ['str', 'con', 'cha'])] }),
  supplementFeat('feat-dragon-hide', '龙之鳞爪', 'Dragon Hide', 'xgte-2017-index', '前置：龙裔。力量、体质或魅力 +1；未着护甲时护甲等级为 13 + 敏捷调整值（持盾仍可享受）；获得可伸缩利爪（徒手打击 1d4 挥砍伤害）。', ['种族', '防御'], { prerequisite: { requiredRaceIds: ['race-2014-dragonborn'] }, choices: [abilityChoice('dragon-hide', ['str', 'con', 'cha'])] }),
  supplementFeat('feat-drow-high-magic', '高等卓尔魔法', 'Drow High Magic', 'xgte-2017-index', '前置：卓尔精灵。获得侦测魔法与有限次数的解除魔法、漂浮术。', ['种族', '施法'], { prerequisite: { requiredSubraceIds: ['race-2014-elf-drow'] } }),
  supplementFeat('feat-dwarven-fortitude', '矮人坚毅', 'Dwarven Fortitude', 'xgte-2017-index', '前置：矮人。体质 +1；执行闪避时可花费生命骰恢复生命。', ['种族', '属性'], { prerequisite: { requiredRaceIds: ['race-2014-dwarf'] }, choices: [abilityChoice('dwarven-fortitude', ['con'])] }),
  supplementFeat('feat-elven-accuracy', '精灵之准', 'Elven Accuracy', 'xgte-2017-index', '前置：精灵或半精灵。敏捷、智力、感知或魅力 +1；使用这些属性获得优势时可重掷一颗。', ['种族', '属性'], { prerequisite: { requiredRaceIds: ['race-2014-elf', 'race-2014-half-elf'] }, choices: [abilityChoice('elven-accuracy', ['dex', 'int', 'wis', 'cha'])] }),
  supplementFeat('feat-fade-away', '匿影无踪', 'Fade Away', 'xgte-2017-index', '前置：侏儒。敏捷或智力 +1；受到伤害后可用反应短暂隐形。', ['种族', '属性'], { prerequisite: { requiredRaceIds: ['race-2014-gnome'] }, choices: [abilityChoice('fade-away', ['dex', 'int'])] }),
  supplementFeat('feat-fey-teleportation', '妖精传送', 'Fey Teleportation', 'xgte-2017-index', '前置：高等精灵。智力或魅力 +1；习得迷踪步并可每短休使用一次。', ['种族', '施法'], { prerequisite: { requiredSubraceIds: ['race-2014-elf-high'] }, choices: [abilityChoice('fey-teleportation', ['int', 'cha'])] }),
  supplementFeat('feat-flames-of-phlegethos', '弗莱格索斯之焰', 'Flames of Phlegethos', 'xgte-2017-index', '前置：提夫林。智力或魅力 +1；火焰法术的伤害骰更稳定，并可以烈焰包围自身。', ['种族', '施法'], { prerequisite: { requiredRaceIds: ['race-2014-tiefling'] }, choices: [abilityChoice('flames-of-phlegethos', ['int', 'cha'])] }),
  supplementFeat('feat-infernal-constitution', '炼狱体质', 'Infernal Constitution', 'xgte-2017-index', '前置：提夫林。体质 +1；获得冷冻与毒素抗性，对中毒豁免有优势。', ['种族', '防御'], { prerequisite: { requiredRaceIds: ['race-2014-tiefling'] }, choices: [abilityChoice('infernal-constitution', ['con'])] }),
  supplementFeat('feat-orcish-fury', '兽人狂怒', 'Orcish Fury', 'xgte-2017-index', '前置：半兽人。力量或体质 +1；可强化武器伤害，也可在不屈倒下后立即反击。', ['种族', '战斗'], { prerequisite: { requiredRaceIds: ['race-2014-half-orc'] }, choices: [abilityChoice('orcish-fury', ['str', 'con'])] }),
  supplementFeat('feat-prodigy', '天赋异禀', 'Prodigy', 'xgte-2017-index', '前置：人类、半精灵或半兽人。获得技能、工具、语言并为一项已熟练技能获得专精。', ['种族', '技能'], { prerequisite: { requiredRaceIds: ['race-2014-human', 'race-2014-half-elf', 'race-2014-half-orc'] }, choices: [{ id: 'prodigy-skill', title: '选择技能', description: '获得一项技能熟练。', minSelections: 1, maxSelections: 1, optionIds: [], candidateKind: 'all-skills' }, { id: 'prodigy-expertise', title: '选择专精', description: '从已熟练技能中选择。', minSelections: 1, maxSelections: 1, optionIds: [], candidateKind: 'proficient-skills', uniqueGroup: 'expertise' }] }),
  supplementFeat('feat-second-chance', '花开二度', 'Second Chance', 'xgte-2017-index', '前置：半身人。敏捷、体质或魅力 +1；被命中时可用反应迫使攻击者重掷。', ['种族', '防御'], { prerequisite: { requiredRaceIds: ['race-2014-halfling'] }, choices: [abilityChoice('second-chance', ['dex', 'con', 'cha'])] }),
  supplementFeat('feat-squat-nimbleness', '低身机敏', 'Squat Nimbleness', 'xgte-2017-index', '前置：矮人或小型种族。力量或敏捷 +1；速度提升并获得运动或特技熟练，脱离擒抱的力量（运动）与敏捷（特技）检定获得优势。', ['种族', '移动'], { choices: [abilityChoice('squat-nimbleness', ['str', 'dex'])] }),
  supplementFeat('feat-wood-elf-magic', '木精灵魔法', 'Wood Elf Magic', 'xgte-2017-index', '前置：木精灵。习得一项德鲁伊戏法，并可有限施放大步奔行与行动无踪。', ['种族', '施法'], { prerequisite: { requiredSubraceIds: ['race-2014-elf-wood'] } }),
]

const tcoeFeats2014: readonly FeatRule[] = [
  supplementFeat('feat-artificer-initiate', '奇械学徒', 'Artificer Initiate', 'tcoe-2020-index', '习得一项奇械师戏法、一项 1 环奇械师法术与一套工匠工具熟练。', ['施法', '工具']),
  supplementFeat('feat-chef', '大厨', 'Chef', 'tcoe-2020-index', '体质或感知 +1；获得厨具熟练，可在休息时准备恢复食物。', ['属性', '支援'], { choices: [abilityChoice('chef', ['con', 'wis'])] }),
  supplementFeat('feat-crusher', '粉碎者', 'Crusher', 'tcoe-2020-index', '力量或体质 +1；钝击命中可移动目标，暴击后盟友攻击获得优势。', ['属性', '战斗'], { choices: [abilityChoice('crusher', ['str', 'con'])] }),
  supplementFeat('feat-eldritch-adept', '魔能导师', 'Eldritch Adept', 'tcoe-2020-index', '前置：施法或契约魔法。习得一项没有不满足前置的魔能祈唤。', ['施法', '选项'], { prerequisite: { requiredCapability: 'spellcasting' } }),
  supplementFeat('feat-fey-touched', '妖精触碰', 'Fey Touched', 'tcoe-2020-index', '智力、感知或魅力 +1；习得迷踪步和一项 1 环占卜或惑控法术。', ['属性', '施法'], { choices: [abilityChoice('fey-touched', ['int', 'wis', 'cha'])] }),
  supplementFeat('feat-fighting-initiate', '战斗学徒', 'Fighting Initiate', 'tcoe-2020-index', '前置：一项军用武器熟练。习得一种当前尚未掌握的战斗风格。', ['战斗', '选项']),
  supplementFeat('feat-gunner', '枪手', 'Gunner', 'tcoe-2020-index', '敏捷 +1；获得火器熟练，忽略装弹，近距离远程攻击不再劣势。', ['属性', '远程'], { choices: [abilityChoice('gunner', ['dex'])] }),
  supplementFeat('feat-metamagic-adept', '超魔法导师', 'Metamagic Adept', 'tcoe-2020-index', '前置：能施法。习得两项超魔并获得 2 点术法点。', ['施法', '超魔'], { prerequisite: { requiredCapability: 'spellcasting' } }),
  supplementFeat('feat-piercer', '穿刺者', 'Piercer', 'tcoe-2020-index', '力量或敏捷 +1；穿刺伤害骰可重掷，暴击额外增加伤害骰。', ['属性', '战斗'], { choices: [abilityChoice('piercer', ['str', 'dex'])] }),
  supplementFeat('feat-poisoner', '毒师', 'Poisoner', 'tcoe-2020-index', '获得毒师工具熟练，可快速涂毒并制作特殊毒剂。', ['工具', '伤害']),
  supplementFeat('feat-shadow-touched', '影界触碰', 'Shadow Touched', 'tcoe-2020-index', '智力、感知或魅力 +1；习得隐形术和一项 1 环死灵或幻术。', ['属性', '施法'], { choices: [abilityChoice('shadow-touched', ['int', 'wis', 'cha'])] }),
  supplementFeat('feat-skill-expert', '技艺专家', 'Skill Expert', 'tcoe-2020-index', '任意属性 +1；获得一项技能熟练，并为一项已熟练技能获得专精。', ['属性', '技能'], { choices: [abilityChoice('skill-expert', ABILITY_KEYS), { id: 'skill-expert-skill', title: '选择技能', description: '获得一项技能熟练。', minSelections: 1, maxSelections: 1, optionIds: [], candidateKind: 'all-skills' }, { id: 'skill-expert-expertise', title: '选择专精', description: '从已熟练技能中选择。', minSelections: 1, maxSelections: 1, optionIds: [], candidateKind: 'proficient-skills', uniqueGroup: 'expertise' }] }),
  supplementFeat('feat-slasher', '劈砍者', 'Slasher', 'tcoe-2020-index', '力量或敏捷 +1；挥砍命中可降低速度，暴击后目标攻击检定劣势。', ['属性', '战斗'], { choices: [abilityChoice('slasher', ['str', 'dex'])] }),
  supplementFeat('feat-telekinetic', '念动力', 'Telekinetic', 'tcoe-2020-index', '智力、感知或魅力 +1；习得或强化法师之手，并可用附赠动作推拉生物。', ['属性', '控制'], { choices: [abilityChoice('telekinetic', ['int', 'wis', 'cha'])] }),
  supplementFeat('feat-telepathic', '心电感应', 'Telepathic', 'tcoe-2020-index', '智力、感知或魅力 +1；获得心灵传讯并可有限施放侦测思想。', ['属性', '社交'], { choices: [abilityChoice('telepathic', ['int', 'wis', 'cha'])] }),
]

export const featChoiceOptions2014: readonly RuleOption[] = ABILITY_KEYS.map((ability) => ({
  id: `feat-bonus-${ability}-1`, name: `${ABILITY_LABELS[ability]} +1`, description: `由父专长将${ABILITY_LABELS[ability]}提高 1，上限 20。`, status: 'implemented', sourceIds: ['xgte-2017-index', 'tcoe-2020-index'],
}))

export const feats2014: readonly FeatRule[] = [...coreFeats2014, ...xgteFeats2014, ...tcoeFeats2014]

export const FEAT_OPTION_IDS = feats2014.map((item) => item.id)
export const ABILITY_IMPROVEMENT_AND_FEAT_OPTION_IDS = [
  ...ABILITY_IMPROVEMENT_OPTION_IDS,
  ...FEAT_OPTION_IDS,
] as const
