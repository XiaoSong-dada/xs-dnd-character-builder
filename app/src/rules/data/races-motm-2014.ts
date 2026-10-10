import type { ChoiceCheckpoint, RaceFeature, RaceRule, RuleOption, SpeciesSpellGrant } from '@/types/rules'

const sourceIds = ['motm-2022-index'] as const
const changelingId = 'race-2014-motm-changeling'
const harengonId = 'race-2014-motm-harengon'
const shadarKaiId = 'race-2014-motm-shadar-kai'
const fairyId = 'race-2014-motm-fairy'
const airGenasiId = 'race-2014-motm-air-genasi'
const earthGenasiId = 'race-2014-motm-earth-genasi'
const fireGenasiId = 'race-2014-motm-fire-genasi'
const waterGenasiId = 'race-2014-motm-water-genasi'
const satyrId = 'race-2014-motm-satyr'
const harengonSources = ['motm-2022-index', 'twbtw-2021-index'] as const
const abilityAlternatives = [
  { id: 'two-one', label: '一项 +2，另一项 +1', groups: [{ count: 1, value: 2 }, { count: 1, value: 1 }] },
  { id: 'three-one', label: '三项各 +1', groups: [{ count: 3, value: 1 }] },
] as const
const proficiencyUses = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6] as const

function additionalRace(slug: string, name: string, englishName: string, description: string, fields: Partial<RaceRule> = {}): RaceRule {
  return { id: `race-2014-motm-${slug}`, ruleset: '5e-2014', name: `${name}（多元宇宙）`, englishName, searchAliases: [name], summary: description, description: `${description} 属性任选+2/+1或三项+1；通用语及一门自选语言。`, fixedAbilityBonuses: {}, flexibleBonusAlternatives: abilityAlternatives, fixedLanguages: ['通用语'], languageChoices: 1, size: 'medium', speed: 30, subraceIds: [], recommendedClassIds: [], status: 'implemented', sourceIds, ...fields }
}

function additionalFeature(slug: string, key: string, name: string, englishName: string, description: string, fields: Partial<RaceFeature> = {}): RaceFeature {
  const raceId = `race-2014-motm-${slug}`
  return { id: `${raceId}-${key}`, raceId, name, englishName, level: 1, kind: 'passive', summary: description, description, status: 'implemented', sourceIds, ...fields }
}
const proficiencyResource = { maxByLevel: proficiencyUses, recovery: 'long-rest', unit: '次' } as const
const singleResource = { maxByLevel: Array.from({ length: 20 }, () => 1), recovery: 'long-rest', unit: '次' } as const

const martialRaces: readonly RaceRule[] = [
  additionalRace('centaur', '人马', 'Centaur', '中型妖精，步行40尺；自然亲和四技能选一。', { speed: 40, skillProficiencyChoices: { count: 1, optionIds: ['skill-animal-handling', 'skill-medicine', 'skill-nature', 'skill-survival'] } }),
  additionalRace('minotaur', '牛头人', 'Minotaur', '中型类人生物；角击、猛抵冲撞、角锤与迷宫追忆。'),
  additionalRace('bugbear', '熊地精', 'Bugbear', '中型类人生物，也视为类地精；黑暗视觉60尺、隐匿熟练与长肢。', { darkvision: 60, skillProficiencies: ['skill-stealth'] }),
  additionalRace('tabaxi', '斑猫人', 'Tabaxi', '类人生物，小型或中型；攀爬等于步行，猫之迅捷特殊恢复。', { size: undefined, sizeChoices: ['small', 'medium'], darkvision: 60, climbSpeed: 30, skillProficiencies: ['skill-perception', 'skill-stealth'] }),
  additionalRace('sea-elf', '海精灵', 'Sea Elf', '中型类人生物，也视为精灵；游泳等于步行、两栖与寒冷抗性。', { darkvision: 60, swimSpeed: 30, damageResistances: ['寒冷'], skillProficiencies: ['skill-perception'] }),
  additionalRace('orc', '兽人', 'Orc', '中型类人生物，黑暗视觉60尺；应激冲刺与坚韧不屈。', { darkvision: 60 }),
  additionalRace('goblin', '地精', 'Goblin', '小型类人生物，也视为类地精；黑暗视觉60尺、以小博大和迅捷逃生。', { size: 'small', darkvision: 60 }),
  additionalRace('hobgoblin', '大地精', 'Hobgoblin', '中型类人生物，也视为类地精；黑暗视觉60尺、妖精赠礼与集众之运。', { darkvision: 60 }),
  additionalRace('goliath', '歌利亚', 'Goliath', '中型类人生物，运动熟练；寒冷抗性及石之坚韧。', { skillProficiencies: ['skill-athletics'], damageResistances: ['寒冷'] }),
  additionalRace('kenku', '天狗', 'Kenku', '类人生物，小型或中型；任意两技能熟练、天狗回想与拟声。', { size: undefined, sizeChoices: ['small', 'medium'], skillProficiencyChoices: { count: 2 } }),
]
const martialFeatures: readonly RaceFeature[] = [
  additionalFeature('centaur', 'charge', '冲锋', 'Charge', '向目标直线移动至少30尺，并同轮用近战武器命中后，可立即附赠动作蹄击该目标。', { kind: 'bonus-action' }),
  additionalFeature('centaur', 'hooves', '蹄击', 'Hooves', '马蹄徒手打击命中造成1d6加力量调整值的钝击伤害。', { kind: 'action' }),
  additionalFeature('centaur', 'equine-build', '马体构造', 'Equine Build', '负重及推拉重量按体型大一级；需手脚并用的攀爬每移动1尺额外消耗4尺移动力。'),
  additionalFeature('centaur', 'natural-affinity', '自然亲和', 'Natural Affinity', '驯兽、医药、自然、求生四选一熟练。', { kind: 'choice' }),
  additionalFeature('minotaur', 'horns', '角击', 'Horns', '双角徒手命中造成1d6加力量调整值穿刺伤害。', { kind: 'action' }),
  additionalFeature('minotaur', 'goring-rush', '猛抵冲撞', 'Goring Rush', '自己回合疾走并移动至少20尺后，可立即附赠动作角击。', { kind: 'bonus-action' }),
  additionalFeature('minotaur', 'hammering-horns', '角锤', 'Hammering Horns', '自己回合攻击动作内近战命中后，附赠动作推开5尺内、体型不超过自己一级的目标至多10尺；目标力量豁免DC=8+熟练加值+力量调整值。', { kind: 'bonus-action' }),
  additionalFeature('minotaur', 'labyrinthine-recall', '迷宫追忆', 'Labyrinthine Recall', '总能辨北；为导航或追踪进行的感知（求生）检定具有优势，不授予旧版技能熟练。'),
  additionalFeature('bugbear', 'long-limbed', '长肢', 'Long-Limbed', '仅自己回合近战攻击时触及额外5尺，不增加其他回合反应触及。'),
  additionalFeature('bugbear', 'powerful-build', '身强力壮', 'Powerful Build', '负重、推拉和抬举重量按体型大一级。'),
  additionalFeature('bugbear', 'sneaky', '隐秘', 'Sneaky', '隐匿熟练；无需跻身即可穿行或停留在仅容纳小型生物的空间。'),
  additionalFeature('bugbear', 'surprise-attack', '突袭攻击', 'Surprise Attack', '攻击命中战斗开始后尚未开始过自己回合的生物时，额外2d6伤害；不要求目标受惊，不自动追加伤害。'),
  ...['bugbear', 'goblin', 'hobgoblin', 'sea-elf'].map((slug) => additionalFeature(slug, 'fey-ancestry', '妖精血统', 'Fey Ancestry', '为避免或结束自身魅惑状态所作的豁免具有优势。')),
  ...['bugbear', 'tabaxi', 'sea-elf', 'orc', 'goblin', 'hobgoblin'].map((slug) => additionalFeature(slug, 'darkvision', '黑暗视觉', 'Darkvision', '60尺黑暗视觉；黑暗中只能分辨灰度。')),
  additionalFeature('tabaxi', 'claws', '猫之利爪', "Cat's Claws", '攀爬速度等于当前步行速度；爪徒手命中造成1d6加力量挥砍。'),
  additionalFeature('tabaxi', 'talent', '猫之天性', "Cat's Talent", '察觉和隐匿熟练，同类熟练不重复。'),
  additionalFeature('tabaxi', 'feline-agility', '猫之迅捷', 'Feline Agility', '自己战斗回合移动时速度翻倍至回合结束；使用后须在自己某一回合移动0尺才可再次使用，满足后手动恢复。', { resource: { ...singleResource, recovery: 'special', note: '自己某回合移动0尺后手动恢复' } }),
  additionalFeature('sea-elf', 'child-of-sea', '海之子', 'Child of the Sea', '游泳速度等于当前步行速度，可在空气和水中呼吸，寒冷伤害抗性。'),
  additionalFeature('sea-elf', 'friend-of-sea', '海之友', 'Friend of the Sea', '可向有游泳速度的野兽传达简单想法；不因此理解回应。'),
  additionalFeature('sea-elf', 'keen-senses', '敏锐感官', 'Keen Senses', '察觉技能熟练。'),
  additionalFeature('sea-elf', 'trance', '出神', 'Trance', '免魔法睡眠，保持意识的4小时出神完成长休；结束后选两项PHB武器或工具熟练至下次长休，仅局内说明，不作为永久熟练。'),
  additionalFeature('orc', 'adrenaline-rush', '应激冲刺', 'Adrenaline Rush', '附赠动作疾走，获得等于熟练加值的临时生命；熟练次数/长休，不自动修改临时生命。', { kind: 'bonus-action', resource: proficiencyResource }),
  additionalFeature('orc', 'powerful-build', '身强力壮', 'Powerful Build', '负重、推拉和抬举重量按体型大一级。'),
  additionalFeature('orc', 'relentless-endurance', '坚韧不屈', 'Relentless Endurance', '生命降至0但未立即死亡时可改为1；每长休一次，由玩家处理生命。', { resource: singleResource }),
  additionalFeature('goblin', 'fury-small', '以小博大', 'Fury of the Small', '攻击或法术对体型大于自己的生物造成伤害时，额外熟练加值伤害；每回合最多一次，熟练次数/长休。', { resource: proficiencyResource }),
  additionalFeature('goblin', 'nimble-escape', '迅捷逃生', 'Nimble Escape', '自己每回合可附赠动作撤离或躲藏。', { kind: 'bonus-action' }),
  additionalFeature('hobgoblin', 'fey-gift', '妖精赠礼', 'Fey Gift', '附赠动作协助；熟练次数/长休。', { kind: 'bonus-action', resource: proficiencyResource }),
  additionalFeature('hobgoblin', 'gift-improvement', '妖精赠礼增强', 'Fey Gift Improvement', '每次赠礼协助选一：好客使双方获得1d6+熟练加值临时生命；通行使双方步行+10尺至自己下回合开始；恶意在受助者下回合开始前首次攻击命中时，使目标一分钟内下一次攻击劣势。', { level: 3 }),
  additionalFeature('hobgoblin', 'fortune-many', '集众之运', 'Fortune from the Many', '攻击未命中、属性检定或豁免失败后，加30尺内可见盟友数量，最多+3；熟练次数/长休。', { resource: proficiencyResource }),
  additionalFeature('goliath', 'little-giant', '小巨人', 'Little Giant', '运动熟练；负重、推拉和抬举重量按体型大一级。'),
  additionalFeature('goliath', 'mountain-born', '生于高山', 'Mountain Born', '寒冷伤害抗性；适应高海拔，包括超过20000尺的环境。'),
  additionalFeature('goliath', 'stone-endurance', '石之坚韧', "Stone's Endurance", '受到伤害时反应减伤1d12加体质调整值；熟练次数/长休，不自动结算伤害。', { kind: 'reaction', resource: proficiencyResource }),
  additionalFeature('kenku', 'expert-duplication', '复制专家', 'Expert Duplication', '抄写或仿造自己或其他人的工艺品时，制造相同复制品的属性检定具有优势。'),
  additionalFeature('kenku', 'recall', '天狗回想', 'Kenku Recall', '任意两技能熟练；进行已熟练技能的属性检定时，在掷d20前可给予自己优势，熟练次数/长休。', { resource: proficiencyResource }),
  additionalFeature('kenku', 'mimicry', '拟声', 'Mimicry', '准确模仿听过的声音；识破需感知（洞悉）检定，对抗DC=8+熟练加值+魅力调整值。'),
]

const spellAbilities = ['int', 'wis', 'cha'] as const
function racialSpell(spell: string, minimumLevel: number, extra: Partial<SpeciesSpellGrant> = {}): SpeciesSpellGrant {
  return { spellId: `spell-2014-${spell}`, minimumLevel, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest', canCastWithSpellSlots: true, ...extra }
}
const noComponents = { waivedComponents: ['verbal', 'somatic', 'material'] } as const
const magicalRaces: readonly RaceRule[] = [
  additionalRace('yuan-ti', '蛇人', 'Yuan-ti', '类人生物，小型或中型，黑暗视觉60尺；法术豁免优势、毒素抗性与巨蛇法术。', { size: undefined, sizeChoices: ['small', 'medium'], darkvision: 60, damageResistances: ['毒素'], spellcastingAbilityChoices: spellAbilities, spellGrants: [racialSpell('poison-spray', 1, { freeCastings: 0, canCastWithSpellSlots: false }), racialSpell('animal-friendship', 1, { freeCastings: 0, atWill: true, canCastWithSpellSlots: false, targetRestriction: 'snakes-only' }), racialSpell('suggestion', 3)] }),
  additionalRace('githzerai', '吉斯泽莱人', 'Githzerai', '中型类人生物，精神戒训、心灵抗性与免成分灵能。', { damageResistances: ['心灵'], spellcastingAbilityChoices: spellAbilities, spellGrants: [racialSpell('mage-hand', 1, { ...noComponents, freeCastings: 0, canCastWithSpellSlots: false, castingNote: '法师之手隐形' }), racialSpell('shield', 3, noComponents), racialSpell('detect-thoughts', 5, noComponents)] }),
  additionalRace('githyanki', '吉斯洋基人', 'Githyanki', '中型类人生物，心灵抗性、星界知识临时熟练与免成分灵能。', { damageResistances: ['心灵'], spellcastingAbilityChoices: spellAbilities, spellGrants: [racialSpell('mage-hand', 1, { ...noComponents, freeCastings: 0, canCastWithSpellSlots: false, castingNote: '法师之手隐形' }), racialSpell('jump', 3, noComponents), racialSpell('misty-step', 5, noComponents)] }),
  additionalRace('deep-gnome', '地底侏儒', 'Deep Gnome', '小型类人生物，也视为侏儒；魔法抗性、伪装及斯涅布力赠礼；黑暗视觉数值官方核验待补。', { size: 'small', darkvision: 60, spellcastingAbilityChoices: spellAbilities, spellGrants: [racialSpell('disguise-self', 3), racialSpell('nondetection', 5, { waivesMaterialComponents: true })] }),
  additionalRace('duergar', '灰矮人', 'Duergar', '中型类人生物，也视为矮人；毒素抗性与灵能坚韧；黑暗视觉数值官方核验待补。', { darkvision: 60, damageResistances: ['毒素'], spellcastingAbilityChoices: spellAbilities, spellGrants: [racialSpell('enlarge-reduce', 3, { waivesMaterialComponents: true, targetRestriction: 'self-only' }), racialSpell('invisibility', 5, { waivesMaterialComponents: true, targetRestriction: 'self-only' })] }),
  additionalRace('firbolg', '费尔伯格人', 'Firbolg', '中型类人生物，费尔伯格人魔法、神隐步及兽与叶之语。', { spellcastingAbilityChoices: spellAbilities, spellGrants: [racialSpell('detect-magic', 1), racialSpell('disguise-self', 1, { castingNote: '可显得变高或变矮3尺' })] }),
  additionalRace('aarakocra', '鸟羽人', 'Aarakocra', '中型类人生物，步行30；飞行随步行，中/重甲不可飞行；3级呼风者。', { flySpeed: 30, spellcastingAbilityChoices: spellAbilities, spellGrants: [racialSpell('gust-of-wind', 3, { waivesMaterialComponents: true })] }),
  additionalRace('triton', '梭螺鱼人', 'Triton', '中型类人生物，黑暗视觉60；游泳随步行、两栖与寒冷抗性。', { darkvision: 60, swimSpeed: 30, damageResistances: ['寒冷'], spellcastingAbilityChoices: spellAbilities, spellGrants: [racialSpell('fog-cloud', 1), racialSpell('gust-of-wind', 3), racialSpell('water-walk', 5)] }),
]
const magicalFeatures: readonly RaceFeature[] = [
  ...magicalRaces.map((race) => additionalFeature(race.id.replace('race-2014-motm-', ''), 'racial-magic', '种族施法', 'Racial Spellcasting', '智力、感知、魅力选一；法术按等级授予，有环法术独立免费次数/长休及明确许可的法术位路径。', { kind: 'choice' })),
  additionalFeature('yuan-ti', 'magic-resistance', '魔法抗性', 'Magic Resistance', '对抗法术的豁免具有优势，不泛化到全部魔法效果。'),
  additionalFeature('yuan-ti', 'poison-resilience', '毒素抗性', 'Poison Resilience', '毒素伤害抗性；避免或结束自身中毒状态的豁免具有优势，不是毒素免疫。'),
  additionalFeature('yuan-ti', 'serpentine-spellcasting', '巨蛇法术', 'Serpentine Spellcasting', '1级毒气喷涌与仅限蛇的无限次化兽为友；3级暗示术每长休一次免费，也可用二环或更高法术位。'),
  additionalFeature('githzerai', 'mental-discipline', '精神戒训', 'Mental Discipline', '避免或结束自身魅惑、恐慌的豁免具有优势；心灵伤害抗性。'),
  additionalFeature('githyanki', 'astral-knowledge', '星界知识', 'Astral Knowledge', '每次长休后选一项技能与一项PHB武器或工具熟练，持续至下次长休；只记录临时规则，不加入永久熟练。'),
  additionalFeature('githyanki', 'psychic-resistance', '心灵抗性', 'Psychic Resistance', '心灵伤害抗性。'),
  additionalFeature('deep-gnome', 'darkvision-review', '黑暗视觉（待核验）', 'Darkvision Review', '本地正文写60尺，官方同版证据待补；不得据此宣称最终数值已经核验。'),
  additionalFeature('deep-gnome', 'gnomish-resistance', '侏儒魔法抗性', 'Gnomish Magic Resistance', '对抗法术的智力、感知、魅力豁免具有优势。'),
  additionalFeature('deep-gnome', 'camouflage', '斯涅布力伪装', 'Svirfneblin Camouflage', '敏捷（隐匿）检定可获得优势，熟练次数/长休。', { resource: proficiencyResource }),
  additionalFeature('duergar', 'darkvision-review', '黑暗视觉（待核验）', 'Darkvision Review', '本地正文写60尺，官方同版证据待补；不得据此宣称最终数值已经核验。'),
  additionalFeature('duergar', 'dwarven-resilience', '矮人抗性', 'Dwarven Resilience', '毒素伤害抗性；避免或结束中毒的豁免具有优势。'),
  additionalFeature('duergar', 'psionic-fortitude', '灵能坚韧', 'Psionic Fortitude', '避免或结束魅惑和震慑的豁免具有优势，不扩展到恐慌。'),
  additionalFeature('firbolg', 'hidden-step', '神隐步', 'Hidden Step', '附赠动作隐形至自己下回合开始；攻击、掷伤害或迫使豁免时提前结束；熟练次数/长休。', { kind: 'bonus-action', resource: proficiencyResource }),
  additionalFeature('firbolg', 'powerful-build', '身强力壮', 'Powerful Build', '负重、推拉和抬举重量按体型大一级。'),
  additionalFeature('firbolg', 'speech', '兽与叶之语', 'Speech of Beast and Leaf', '野兽、植物和植被能理解自己的简单表达，不因此理解回应；影响它们的魅力检定具有优势。'),
  additionalFeature('aarakocra', 'flight', '飞行', 'Flight', '飞行速度等于当前步行速度；穿中甲或重甲时不能使用。'),
  additionalFeature('aarakocra', 'talons', '禽爪', 'Talons', '禽爪徒手命中造成1d6加力量调整值挥砍。'),
  additionalFeature('aarakocra', 'wind-caller', '呼风者', 'Wind Caller', '3级造风术免材料，每长休一次免费，也可用二环或更高法术位。', { level: 3 }),
  additionalFeature('triton', 'amphibious', '两栖', 'Amphibious', '游泳速度等于当前步行速度，可在水与空气中呼吸。'),
  additionalFeature('triton', 'emissary', '海之使者', 'Emissary of the Sea', '可向有游泳速度的野兽、元素和怪兽表达想法；不因此理解回应。'),
  additionalFeature('triton', 'guardian', '海渊守卫', 'Guardian of the Depth', '寒冷伤害抗性，适应深海严寒。'),
  ...['yuan-ti', 'triton'].map((slug) => additionalFeature(slug, 'darkvision', '黑暗视觉', 'Darkvision', '60尺黑暗视觉；黑暗中只能分辨灰度。')),
]

const branchSeeds = [
  ['shifter', 'beasthide', '兽皮', 'Beasthide', '化形额外1d6临时生命与AC+1。'],
  ['shifter', 'longtooth', '长牙', 'Longtooth', '化形立即徒手打击，之后每回合可附赠动作长牙攻击，1d6加力量穿刺。'],
  ['shifter', 'swiftstride', '迅捷', 'Swiftstride', '化形速度+10；生物在其回合进入5尺内时，可反应移动10尺，不触发借机。'],
  ['shifter', 'wildhunt', '猎食', 'Wildhunt', '化形感知检定优势；未失能时，30尺内生物攻击自己不能有优势。'],
  ['kobold', 'craftiness', '机智', 'Craftiness', '奥秘、调查、医药、巧手、求生选一熟练。'],
  ['kobold', 'defiance', '逆反', 'Defiance', '避免或结束自身恐慌的豁免具有优势。'],
  ['kobold', 'draconic-sorcery', '龙术', 'Draconic Sorcery', '从术士法术表选一戏法，施法属性智力、感知、魅力选一。'],
  ['aasimar', 'necrotic-shroud', '死灵环绕', 'Necrotic Shroud', '变身时10尺内非盟友可见生物魅力豁免DC=8+熟练加值+魅力，失败恐慌至自己下回合结束；变身期间自己每回合一次额外熟练加值暗蚀伤害。'],
  ['aasimar', 'radiant-consumption', '光辉焚化', 'Radiant Consumption', '变身明亮10尺及额外微光10尺；自己每回合结束自己及10尺内所有生物受熟练加值光耀伤害；自己每回合一次额外熟练加值光耀伤害。'],
  ['aasimar', 'radiant-soul', '光辉灵魂', 'Radiant Soul', '变身飞行等于当前步行；自己每回合一次额外熟练加值光耀伤害。'],
  ['eladrin', 'autumn', '秋', 'Autumn', '3级妖精步后至多两个10尺内可见目标感知豁免，失败魅惑1分钟，自己或同伴伤害时结束。'],
  ['eladrin', 'winter', '冬', 'Winter', '3级妖精步时，传送前5尺内一可见目标感知豁免，失败恐慌至自己下回合结束。'],
  ['eladrin', 'spring', '春', 'Spring', '3级妖精步可使碰触的5尺内自愿生物代替自己传送至30尺内可见空位。'],
  ['eladrin', 'summer', '夏', 'Summer', '3级妖精步后，对选定的5尺内可见生物各造成熟练加值火焰伤害。'],
] as const
export const motmChoiceOptions2014: readonly RuleOption[] = branchSeeds.map(([slug, key, name, englishName, summary]) => ({ id: `race-2014-motm-${slug}-${key}`, name, englishName, ruleset: '5e-2014', summary, description: summary, status: 'implemented', sourceIds }))
function speciesChoice(slug: string, key: string, title: string, optionIds: readonly string[], extra: Partial<ChoiceCheckpoint> = {}): ChoiceCheckpoint {
  return { id: `race-2014-motm-${slug}-${key}`, level: 1, step: 'timeline', kind: 'class-choice', title, description: title, required: true, minSelections: 1, maxSelections: 1, optionIds, ...extra }
}
const branchIds = (slug: string) => branchSeeds.filter((seed) => seed[0] === slug).map((seed) => `race-2014-motm-${seed[0]}-${seed[1]}`)
const branchedRaces: readonly RaceRule[] = [
  additionalRace('shifter', '化兽者', 'Shifter', '中型类人生物，黑暗视觉60；野兽本能技能四选一，化形四选一。', { darkvision: 60, skillProficiencyChoices: { count: 1, optionIds: ['skill-acrobatics', 'skill-athletics', 'skill-intimidation', 'skill-survival'] }, choices: [speciesChoice('shifter', 'shifting-choice', '选择化形', branchIds('shifter'))] }),
  additionalRace('kobold', '狗头人', 'Kobold', '小型类人生物，黑暗视觉60；三种遗赠选一，依赖技能或戏法选择。', { size: 'small', darkvision: 60, chosenCantripCheckpointId: 'race-2014-motm-kobold-cantrip', choices: [
    speciesChoice('kobold', 'legacy', '选择狗头人遗赠', branchIds('kobold')),
    { ...speciesChoice('kobold', 'skill', '机智技能', ['skill-arcana', 'skill-investigation', 'skill-medicine', 'skill-sleight-of-hand', 'skill-survival'], { parentCheckpointId: 'race-2014-motm-kobold-legacy', parentOptionId: 'race-2014-motm-kobold-craftiness' }), grantsSkillProficiency: true },
    speciesChoice('kobold', 'spellcasting-ability', '龙术施法属性', spellAbilities.map((ability) => `spell-ability-${ability}`), { parentCheckpointId: 'race-2014-motm-kobold-legacy', parentOptionId: 'race-2014-motm-kobold-draconic-sorcery' }),
    speciesChoice('kobold', 'cantrip', '选择术士戏法', [], { parentCheckpointId: 'race-2014-motm-kobold-legacy', parentOptionId: 'race-2014-motm-kobold-draconic-sorcery', candidateKind: 'spell-pool', spellPool: { level: 0, classIds: ['class-2014-sorcerer'] } }),
  ] }),
  additionalRace('aasimar', '阿斯莫', 'Aasimar', '类人生物，小型或中型；光耀及暗蚀抗性、治愈之手、光亮术和3级天启选择。', { size: undefined, sizeChoices: ['small', 'medium'], darkvision: 60, damageResistances: ['光耀', '暗蚀'], spellGrants: [{ spellId: 'spell-2014-light', minimumLevel: 1, alwaysPrepared: true, ability: 'cha', canCastWithSpellSlots: false }], choices: [speciesChoice('aasimar', 'revelation', '选择天启', branchIds('aasimar'), { level: 3 })] }),
  additionalRace('eladrin', '雅灵', 'Eladrin', '中型类人生物，也视为精灵；察觉熟练、四季选择与妖精步，换季需完成出神。', { darkvision: 60, skillProficiencies: ['skill-perception'], choices: [speciesChoice('eladrin', 'season', '选择季节', branchIds('eladrin'), { description: '改变季节需完成4小时出神长休；玩家确认条件后调整。' }), speciesChoice('eladrin', 'fey-step-ability', '妖精步能力属性', spellAbilities.map((ability) => `spell-ability-${ability}`))] }),
]
const branchedFeatures: readonly RaceFeature[] = [
  ...branchSeeds.map(([slug, key, name, englishName, text]) => additionalFeature(slug, `branch-${key}`, name, englishName, text, { level: slug === 'aasimar' || slug === 'eladrin' ? 3 : 1, selectionRequirement: { checkpointId: `race-2014-motm-${slug}-${slug === 'shifter' ? 'shifting-choice' : slug === 'kobold' ? 'legacy' : slug === 'aasimar' ? 'revelation' : 'season'}`, optionId: `race-2014-motm-${slug}-${key}`, ...(slug === 'eladrin' ? { additionalCheckpointIds: ['race-2014-motm-eladrin-fey-step-ability'] } : {}) } })),
  additionalFeature('shifter', 'shifting', '化形', 'Shifting', '附赠动作化形1分钟，死亡或附赠动作恢复时结束；获得2倍熟练加值临时生命及已选分支效果；熟练次数/长休。', { kind: 'bonus-action', resource: proficiencyResource, selectionRequirement: { checkpointId: 'race-2014-motm-shifter-shifting-choice' } }),
  additionalFeature('shifter', 'instincts', '野兽本能', 'Bestial Instincts', '特技、运动、威吓、求生四选一熟练。'),
  additionalFeature('kobold', 'draconic-cry', '龙吼', 'Draconic Cry', '附赠动作吼向10尺内敌人；可听见自己的敌人受到自己与盟友攻击时具有优势，至自己下回合开始；熟练次数/长休。', { kind: 'bonus-action', resource: proficiencyResource }),
  additionalFeature('aasimar', 'healing-hands', '治愈之手', 'Healing Hands', '动作触碰一生物，投掷熟练加值数量的d4并恢复等量生命；每长休一次，不自动治疗。', { kind: 'action', resource: singleResource }),
  additionalFeature('aasimar', 'celestial-resistance', '天界抗性', 'Celestial Resistance', '暗蚀和光耀伤害抗性。'),
  additionalFeature('aasimar', 'light-bearer', '光辉掌者', 'Light Bearer', '知晓光亮术，固定使用魅力施法。'),
  additionalFeature('aasimar', 'celestial-revelation', '天启', 'Celestial Revelation', '3级选择一种天启；附赠动作变身1分钟，可附赠动作结束；每长休一次，临时效果只提示。', { level: 3, kind: 'bonus-action', resource: singleResource, selectionRequirement: { checkpointId: 'race-2014-motm-aasimar-revelation' } }),
  additionalFeature('eladrin', 'fey-step', '妖精步', 'Fey Step', '附赠动作传送至30尺内可见空位；熟练次数/长休；3级获得所选季节附加效果，豁免DC=8+熟练加值+选定智/感/魅调整值。', { kind: 'bonus-action', resource: proficiencyResource, selectionRequirement: { checkpointId: 'race-2014-motm-eladrin-season', additionalCheckpointIds: ['race-2014-motm-eladrin-fey-step-ability'] } }),
  additionalFeature('eladrin', 'fey-ancestry', '妖精血统', 'Fey Ancestry', '避免或结束自身魅惑状态的豁免具有优势。'),
  additionalFeature('eladrin', 'trance', '出神', 'Trance', '保持意识的4小时出神完成长休，可换季并取得两项未有的PHB武器或工具熟练至下次长休；免魔法睡眠，临时熟练不永久化。'),
  ...['shifter', 'kobold', 'aasimar', 'eladrin'].map((slug) => additionalFeature(slug, 'darkvision', '黑暗视觉', 'Darkvision', '60尺黑暗视觉；黑暗中只能分辨灰度。')),
]

const natureSkills = ['skill-animal-handling', 'skill-medicine', 'skill-nature', 'skill-perception', 'skill-stealth', 'skill-survival'] as const
const armoredRaces: readonly RaceRule[] = [
  additionalRace('lizardfolk', '蜥蜴人', 'Lizardfolk', '中型类人生物，游泳随步行；六技能选二，天生护甲13加敏捷与合法护甲比较。', { swimSpeed: 30, skillProficiencyChoices: { count: 2, optionIds: natureSkills }, naturalArmor: { base: 13, addsDexterity: true } }),
  additionalRace('tortle', '龟人', 'Tortle', '类人生物，小型或中型；六技能选一，天生基础AC17，不加敏捷；不能穿甲，允许手动盾牌。', { size: undefined, sizeChoices: ['small', 'medium'], skillProficiencyChoices: { count: 1, optionIds: natureSkills }, naturalArmor: { base: 17, addsDexterity: false, forbidsArmor: true } }),
]
const armoredFeatures: readonly RaceFeature[] = [
  additionalFeature('lizardfolk', 'bite', '啃咬', 'Bite', '布满尖牙的嘴徒手命中造成1d6加力量挥砍，不套用旧版穿刺。', { kind: 'action' }),
  additionalFeature('lizardfolk', 'hold-breath', '屏息', 'Hold Breath', '每次可闭气至多15分钟；游泳速度等于当前步行速度。'),
  additionalFeature('lizardfolk', 'hungry-jaws', '饥渴之喉', 'Hungry Jaws', '附赠动作特殊啃咬，命中正常伤害并获得熟练加值临时生命；熟练次数/长休，不自动改生命。', { kind: 'bonus-action', resource: proficiencyResource }),
  additionalFeature('lizardfolk', 'natural-armor', '天生护甲', 'Natural Armor', '无甲AC13加敏捷；着甲AC较低时可用此公式，盾牌照常适用；不叠加其他基础公式。'),
  additionalFeature('lizardfolk', 'nature-intuition', '自然直觉', "Nature's Intuition", '驯兽、医药、自然、察觉、隐匿、求生六选二熟练。', { kind: 'choice' }),
  additionalFeature('tortle', 'claws', '利爪', 'Claws', '爪徒手命中造成1d6加力量挥砍。', { kind: 'action' }),
  additionalFeature('tortle', 'hold-breath', '屏息', 'Hold Breath', '可闭气至多1小时。'),
  additionalFeature('tortle', 'natural-armor', '天生护甲', 'Natural Armor', '基础AC17，不加敏捷；不能穿轻/中/重甲，保留非法装备但不计算护甲收益；可手动持盾。'),
  additionalFeature('tortle', 'nature-intuition', '自然直觉', "Nature's Intuition", '驯兽、医药、自然、察觉、隐匿、求生六选一熟练。', { kind: 'choice' }),
  additionalFeature('tortle', 'shell-defense', '龟壳防御', 'Shell Defense', '动作缩壳：临时AC+4，力量/体质豁免优势；倒地、速度0且不能增加，敏捷豁免劣势，不能反应；只能附赠动作出壳。本期不自动应用临时效果。', { kind: 'action' }),
]

/** 本地CHM 1771及各玩家种族正文；只登记核验元数据与原创摘要，不覆盖旧版。 */
export const motmRaces2014: readonly RaceRule[] = [{
  id: satyrId, ruleset: '5e-2014', name: '半羊人（多元宇宙）', englishName: 'Satyr', searchAliases: ['半羊人'],
  summary: '中型妖精，速度35；表演、游说及一种具体乐器熟练。',
  description: '中型妖精，步行35尺；两种属性分配方案，通用语及一门自选语言。表演、游说熟练，必须选择一种具体乐器。对抗法术的豁免具有优势；双角徒手打击1d6加力量钝击；跳跃额外d8尺，仍消耗移动力。',
  fixedAbilityBonuses: {}, flexibleBonusAlternatives: abilityAlternatives, fixedLanguages: ['通用语'], languageChoices: 1,
  size: 'medium', speed: 35, skillProficiencies: ['skill-performance', 'skill-persuasion'],
  toolProficiencyChoices: { count: 1, required: true, optionIds: ['lute', 'bagpipes', 'drum', 'dulcimer', 'flute', 'horn', 'lyre', 'pan-flute', 'shawm', 'viol'] },
  subraceIds: [], recommendedClassIds: ['class-2014-bard'], status: 'implemented', sourceIds,
}, {
  id: changelingId, ruleset: '5e-2014', name: '幻身灵（多元宇宙）', englishName: 'Changeling',
  searchAliases: ['幻身灵', '变形怪', 'MotM Changeling'],
  summary: '妖精；中型或小型；五项社交技能选二，可改变外貌与声音。',
  description: '多元宇宙版幻身灵属于妖精，创建时选择中型或小型，步行速度30尺。属性可选一项+2与另一项+1，或三项不同属性各+1；通用语加一门自选语言。幻身本能从欺瞒、洞悉、威吓、表演、游说中选两项熟练。变形生物以动作改变外貌和声音，可在中型与小型间变化；装备不变，其他游戏数据不随伪装种族改变。',
  fixedAbilityBonuses: {}, fixedLanguages: ['通用语'], languageChoices: 1,
  flexibleBonusAlternatives: abilityAlternatives,
  sizeChoices: ['small', 'medium'], speed: 30,
  skillProficiencyChoices: { count: 2, optionIds: ['skill-deception', 'skill-insight', 'skill-intimidation', 'skill-performance', 'skill-persuasion'] },
  subraceIds: [], recommendedClassIds: ['class-2014-bard', 'class-2014-rogue', 'class-2014-sorcerer'],
  status: 'implemented', sourceIds,
}, {
  id: harengonId, ruleset: '5e-2014', name: '兔人', englishName: 'Harengon', searchAliases: ['Rabbitfolk'],
  summary: '自选中型或小型；察觉熟练，先攻加入熟练加值，附赠动作兔子跳。',
  description: '类人生物，创建时选择中型或小型，步行速度30尺；采用两种自选属性方案，通用语及一门自选语言。察觉熟练，先攻加入熟练加值。兔子跳为附赠动作，距离为熟练加值乘5尺，不触发借机攻击；速度须大于0，次数为熟练加值，长休恢复。敏捷豁免失败时可用反应加入d4，速度为0或倒地时不可用。',
  fixedAbilityBonuses: {}, flexibleBonusAlternatives: abilityAlternatives, fixedLanguages: ['通用语'], languageChoices: 1,
  sizeChoices: ['small', 'medium'], speed: 30, initiativeProficiency: true, skillProficiencies: ['skill-perception'],
  subraceIds: [], recommendedClassIds: ['class-2014-rogue', 'class-2014-ranger'], status: 'implemented', sourceIds: harengonSources,
}, {
  id: shadarKaiId, ruleset: '5e-2014', name: '影灵（多元宇宙）', englishName: 'Shadar-kai', searchAliases: ['影灵'],
  summary: '中型精灵；察觉熟练、黑暗视觉与暗蚀抗性，祝福传送随熟练次数恢复。',
  description: '类人生物并视为精灵，中型，步行速度30尺；采用两种自选属性方案，通用语及一门自选语言。拥有察觉熟练、60尺黑暗视觉、暗蚀抗性和对抗魅惑的妖精血统。渡鸦女王的祝福以附赠动作传送到30尺内可见空位，次数为熟练加值，长休恢复；3级起传送后短暂抵抗所有伤害。出神4小时可完成长休，并临时选择两项武器或工具熟练。',
  fixedAbilityBonuses: {}, flexibleBonusAlternatives: abilityAlternatives, fixedLanguages: ['通用语'], languageChoices: 1,
  size: 'medium', speed: 30, darkvision: 60, damageResistances: ['暗蚀'], skillProficiencies: ['skill-perception'],
  subraceIds: [], recommendedClassIds: ['class-2014-rogue', 'class-2014-fighter'], status: 'implemented', sourceIds,
}, {
  id: fairyId, ruleset: '5e-2014', name: '仙灵', englishName: 'Fairy',
  summary: '小型妖精；步行30尺，仙灵魔法按等级授予；未穿中甲或重甲时可飞行。',
  description: '小型妖精，步行30尺；选择两种属性分配方案之一，通用语及一门自选语言。仙灵魔法的施法属性从智力、感知、魅力选择一项：1级德鲁伊伎俩，3级妖火，5级变巨术/缩小术；两个有环法术各可免费施放一次，长休恢复，也可使用合适法术位。不免除法术原有成分。飞行速度等于当前步行速度，但穿戴中甲或重甲时不能使用。',
  fixedAbilityBonuses: {}, flexibleBonusAlternatives: abilityAlternatives, fixedLanguages: ['通用语'], languageChoices: 1,
  size: 'small', speed: 30, flySpeed: 30, spellcastingAbilityChoices: ['int', 'wis', 'cha'],
  spellGrants: [
    { spellId: 'spell-2014-druidcraft', minimumLevel: 1, alwaysPrepared: true },
    { spellId: 'spell-2014-faerie-fire', minimumLevel: 3, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
    { spellId: 'spell-2014-enlarge-reduce', minimumLevel: 5, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
  ],
  subraceIds: [], recommendedClassIds: ['class-2014-druid', 'class-2014-bard', 'class-2014-sorcerer'],
  status: 'implemented', sourceIds: harengonSources,
}, {
  id: airGenasiId, ruleset: '5e-2014', name: '气元素裔（多元宇宙）', englishName: 'Air Genasi', searchAliases: ['气元素裔'],
  summary: '类人生物；中型或小型，步行35尺；60尺黑暗视觉、闪电抗性与融入清风。',
  description: '选择中型或小型，步行35尺；两种属性分配方案，通用语及一门自选语言。60尺黑暗视觉，闪电抗性，未失能时可持续闭气。施法属性智力/感知/魅力选一：1级电爪，3级羽落术，5级浮空术；两个有环法术各一次/长休，也可用合适法术位，羽落术和浮空术免材料。',
  fixedAbilityBonuses: {}, flexibleBonusAlternatives: abilityAlternatives, fixedLanguages: ['通用语'], languageChoices: 1,
  sizeChoices: ['small', 'medium'], speed: 35, darkvision: 60, damageResistances: ['闪电'], spellcastingAbilityChoices: ['int', 'wis', 'cha'],
  spellGrants: [
    { spellId: 'spell-2014-shocking-grasp', minimumLevel: 1, alwaysPrepared: true },
    { spellId: 'spell-2014-feather-fall', minimumLevel: 3, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest', waivesMaterialComponents: true },
    { spellId: 'spell-2014-levitate', minimumLevel: 5, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest', waivesMaterialComponents: true },
  ],
  subraceIds: [], recommendedClassIds: ['class-2014-sorcerer', 'class-2014-wizard'], status: 'implemented', sourceIds,
}, {
  id: earthGenasiId, ruleset: '5e-2014', name: '土元素裔（多元宇宙）', englishName: 'Earth Genasi', searchAliases: ['土元素裔'],
  summary: '类人生物；中型或小型，步行30尺；黑暗视觉、土行与附赠剑刃防护。',
  description: '选择中型或小型，步行30尺；两种属性分配方案，通用语及一门自选语言，60尺黑暗视觉。在地面或地板上步行时忽略困难地形额外移动消耗。施法属性智力/感知/魅力选一：1级剑刃防护，可正常施放，另可附赠动作施放熟练次数/长休；5级行动无踪一次/长休，免材料且可用二环或更高法术位。',
  fixedAbilityBonuses: {}, flexibleBonusAlternatives: abilityAlternatives, fixedLanguages: ['通用语'], languageChoices: 1,
  sizeChoices: ['small', 'medium'], speed: 30, darkvision: 60, spellcastingAbilityChoices: ['int', 'wis', 'cha'],
  spellGrants: [
    { spellId: 'spell-2014-blade-ward', minimumLevel: 1, alwaysPrepared: true },
    { spellId: 'spell-2014-pass-without-trace', minimumLevel: 5, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest', waivesMaterialComponents: true },
  ],
  subraceIds: [], recommendedClassIds: ['class-2014-fighter', 'class-2014-rogue'], status: 'implemented', sourceIds,
}, {
  id: fireGenasiId, ruleset: '5e-2014', name: '火元素裔（多元宇宙）', englishName: 'Fire Genasi', searchAliases: ['火元素裔'],
  summary: '类人生物；中型或小型，步行30尺；60尺黑暗视觉、火焰抗性与烈焰之触。',
  description: '选择中型或小型，步行30尺；两种属性分配方案，通用语及一门自选语言，60尺黑暗视觉和火焰抗性。施法属性智力/感知/魅力选一：1级燃火术，3级燃烧之手，5级火焰刀；两个有环法术各一次/长休，也可用合适法术位，仅火焰刀免材料。',
  fixedAbilityBonuses: {}, flexibleBonusAlternatives: abilityAlternatives, fixedLanguages: ['通用语'], languageChoices: 1,
  sizeChoices: ['small', 'medium'], speed: 30, darkvision: 60, damageResistances: ['火焰'], spellcastingAbilityChoices: ['int', 'wis', 'cha'],
  spellGrants: [
    { spellId: 'spell-2014-produce-flame', minimumLevel: 1, alwaysPrepared: true },
    { spellId: 'spell-2014-burning-hands', minimumLevel: 3, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
    { spellId: 'spell-2014-flame-blade', minimumLevel: 5, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest', waivesMaterialComponents: true },
  ],
  subraceIds: [], recommendedClassIds: ['class-2014-sorcerer', 'class-2014-druid'], status: 'implemented', sourceIds,
}, {
  id: waterGenasiId, ruleset: '5e-2014', name: '水元素裔（多元宇宙）', englishName: 'Water Genasi', searchAliases: ['水元素裔'],
  summary: '类人生物；中型或小型，步行30尺；黑暗视觉、强酸抗性、两栖与呼唤波浪。',
  description: '选择中型或小型，步行30尺；两种属性分配方案，通用语及一门自选语言，60尺黑暗视觉、强酸抗性，可在空气和水中呼吸。游泳速度等于当前步行速度。施法属性智力/感知/魅力选一：1级酸液飞溅，3级造水术/枯水术，5级水墙术；两个有环法术各一次/长休，也可用合适法术位，仅水墙术免材料。',
  fixedAbilityBonuses: {}, flexibleBonusAlternatives: abilityAlternatives, fixedLanguages: ['通用语'], languageChoices: 1,
  sizeChoices: ['small', 'medium'], speed: 30, swimSpeed: 30, darkvision: 60, damageResistances: ['强酸'], spellcastingAbilityChoices: ['int', 'wis', 'cha'],
  spellGrants: [
    { spellId: 'spell-2014-acid-splash', minimumLevel: 1, alwaysPrepared: true },
    { spellId: 'spell-2014-create-or-destroy-water', minimumLevel: 3, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
    { spellId: 'spell-2014-wall-of-water', minimumLevel: 5, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest', waivesMaterialComponents: true },
  ],
  subraceIds: [], recommendedClassIds: ['class-2014-druid', 'class-2014-cleric'], status: 'implemented', sourceIds,
}, ...martialRaces, ...magicalRaces, ...branchedRaces, ...armoredRaces]

export const motmRaceFeatures2014: readonly RaceFeature[] = [
  ...martialFeatures,
  ...magicalFeatures,
  ...branchedFeatures,
  ...armoredFeatures,
  { id: `${satyrId}-creature-type`, raceId: satyrId, name: '生物种类', englishName: 'Creature Type', level: 1, kind: 'passive', summary: '中型妖精', description: '中型妖精，不是类人生物；目标条件由玩家判断。', status: 'implemented', sourceIds },
  { id: `${satyrId}-ram`, raceId: satyrId, name: '顶撞', englishName: 'Ram', level: 1, kind: 'action', summary: '双角徒手打击1d6加力量钝击', description: '命中时替代通常徒手伤害，不自动追加到武器伤害。', status: 'implemented', sourceIds },
  { id: `${satyrId}-magic-resistance`, raceId: satyrId, name: '魔法抗性', englishName: 'Magic Resistance', level: 1, kind: 'passive', summary: '对抗法术的豁免具有优势', description: '仅对抗法术，不泛化到所有魔法效果。', status: 'implemented', sourceIds },
  { id: `${satyrId}-mirthful-leaps`, raceId: satyrId, name: '欢喜之跃', englishName: 'Mirthful Leaps', level: 1, kind: 'passive', summary: '跳远或跳高额外d8尺，立定也可', description: '额外距离照常消耗移动力，不自动修改常驻速度。', status: 'implemented', sourceIds },
  { id: `${satyrId}-reveler`, raceId: satyrId, name: '贪欢者', englishName: 'Reveler', level: 1, kind: 'choice', summary: '表演、游说及一种自选具体乐器熟练', description: '乐器在起源步骤十选一；同类技能熟练不重复叠加。', status: 'implemented', sourceIds },
  ...[airGenasiId, earthGenasiId, fireGenasiId, waterGenasiId].flatMap((raceId): RaceFeature[] => [
    { id: `${raceId}-creature-type`, raceId, name: '生物种类', englishName: 'Creature Type', level: 1, kind: 'passive', summary: '类人生物；创建体型选中型或小型', description: '类人生物；创建时选择中型或小型，相关目标条件由玩家判断。', status: 'implemented', sourceIds },
    { id: `${raceId}-darkvision`, raceId, name: '黑暗视觉', englishName: 'Darkvision', level: 1, kind: 'passive', summary: '60尺黑暗视觉', description: '60尺黑暗视觉；黑暗中只能分辨灰度，光照条件由玩家判断。', status: 'implemented', sourceIds },
  ]),
  { id: `${airGenasiId}-unending-breath`, raceId: airGenasiId, name: '魔息', englishName: 'Unending Breath', level: 1, kind: 'passive', summary: '未失能时持续闭气', description: '只在未失能时可持续闭气；不等同于水下呼吸，失能时须按正常闭气规则处理。', status: 'implemented', sourceIds },
  { id: `${airGenasiId}-lightning-resistance`, raceId: airGenasiId, name: '闪电抗性', englishName: 'Lightning Resistance', level: 1, kind: 'passive', summary: '闪电伤害抗性', description: '具有闪电伤害抗性。', status: 'implemented', sourceIds },
  { id: `${airGenasiId}-mingle-with-the-wind`, raceId: airGenasiId, name: '融入清风', englishName: 'Mingle with the Wind', level: 1, kind: 'choice', summary: '1级电爪，3级羽落术，5级浮空术；智/感/魅选一', description: '施法属性智力、感知、魅力选一。1级知晓电爪；3级羽落术与5级浮空术各一次免费施放/长休，也可用合适法术位；这两个有环法术免材料，不免语言或姿势成分。', status: 'implemented', sourceIds },
  { id: `${earthGenasiId}-earth-walk`, raceId: earthGenasiId, name: '土行', englishName: 'Earth Walk', level: 1, kind: 'passive', summary: '在地面或地板步行时忽略困难地形额外消耗', description: '仅在地面或地板上用步行速度移动时，困难地形不额外消耗移动力；其他减速或限制不因此取消。', status: 'implemented', sourceIds },
  { id: `${earthGenasiId}-merge-with-stone`, raceId: earthGenasiId, name: '混入大地', englishName: 'Merge with Stone', level: 1, kind: 'choice', summary: '1级剑刃防护，5级行动无踪；智/感/魅选一', description: '施法属性智力、感知、魅力选一。剑刃防护可正常施放，另有附赠动作熟练次数/长休资源；5级行动无踪一次免费施放/长休，免材料，也可使用二环或更高法术位。', status: 'implemented', sourceIds },
  { id: `${earthGenasiId}-bonus-blade-ward`, raceId: earthGenasiId, name: '附赠剑刃防护', englishName: 'Bonus Action Blade Ward', level: 1, kind: 'bonus-action', summary: '附赠动作施放剑刃防护；熟练次数/长休', description: '以附赠动作施放剑刃防护消耗本资源，次数等于熟练加值，长休恢复。正常动作施放戏法不消耗本资源，仍依照该戏法原有施法时间和效果。', resource: { maxByLevel: proficiencyUses, recovery: 'long-rest', unit: '次' }, status: 'implemented', sourceIds },
  { id: `${fireGenasiId}-fire-resistance`, raceId: fireGenasiId, name: '火焰抗性', englishName: 'Fire Resistance', level: 1, kind: 'passive', summary: '火焰伤害抗性', description: '具有火焰伤害抗性。', status: 'implemented', sourceIds },
  { id: `${fireGenasiId}-reach-to-the-blaze`, raceId: fireGenasiId, name: '烈焰之触', englishName: 'Reach to the Blaze', level: 1, kind: 'choice', summary: '1级燃火术，3级燃烧之手，5级火焰刀；智/感/魅选一', description: '施法属性智力、感知、魅力选一。1级知晓燃火术；3级燃烧之手与5级火焰刀各一次免费施放/长休，也可用合适法术位。仅火焰刀免材料，不免其他法术的成分。', status: 'implemented', sourceIds },
  { id: `${waterGenasiId}-acid-resistance`, raceId: waterGenasiId, name: '强酸抗性', englishName: 'Acid Resistance', level: 1, kind: 'passive', summary: '强酸伤害抗性', description: '具有强酸伤害抗性。', status: 'implemented', sourceIds },
  { id: `${waterGenasiId}-amphibious`, raceId: waterGenasiId, name: '水陆两栖', englishName: 'Amphibious', level: 1, kind: 'passive', summary: '可在空气及水中呼吸', description: '可在空气和水中呼吸；呼吸及局内环境限制由玩家判断。', status: 'implemented', sourceIds },
  { id: `${waterGenasiId}-swim`, raceId: waterGenasiId, name: '游泳', englishName: 'Swim', level: 1, kind: 'passive', summary: '游泳速度等于当前步行速度', description: '游泳速度等于当前步行速度，基础为30尺。', status: 'implemented', sourceIds },
  { id: `${waterGenasiId}-call-to-the-wave`, raceId: waterGenasiId, name: '呼唤波浪', englishName: 'Call to the Wave', level: 1, kind: 'choice', summary: '1级酸液飞溅，3级造水/枯水，5级水墙术；智/感/魅选一', description: '施法属性智力、感知、魅力选一。1级知晓酸液飞溅；3级造水术/枯水术与5级水墙术各一次免费施放/长休，也可用合适法术位。仅水墙术免材料。', status: 'implemented', sourceIds },
  { id: `${fairyId}-creature-type`, raceId: fairyId, name: '生物种类', englishName: 'Creature Type', level: 1, kind: 'passive', summary: '小型妖精', description: '生物种类为妖精，体型为小型而非微型；相关目标条件由玩家判断。', status: 'implemented', sourceIds: harengonSources },
  { id: `${fairyId}-fairy-magic`, raceId: fairyId, name: '仙灵魔法', englishName: 'Fairy Magic', level: 1, kind: 'choice', summary: '德鲁伊伎俩；施法属性智力/感知/魅力选一', description: '1级知晓德鲁伊伎俩，3级获得妖火，5级获得变巨术/缩小术；选择智力、感知或魅力作为这些法术的施法属性。每个有环法术各一次免费施放，长休恢复，也可使用合适法术位。法术成分不免除。', status: 'implemented', sourceIds: harengonSources },
  { id: `${fairyId}-faerie-fire`, raceId: fairyId, name: '仙灵魔法：妖火', englishName: 'Fairy Magic: Faerie Fire', level: 3, kind: 'action', summary: '妖火，每长休免费施放一次，也可用合适法术位', description: '3级起获得妖火，使用选定种族施法属性；每长休一次免费施放，也可消耗合适法术位。次数与变巨术/缩小术独立，不占职业法术选择名额。', status: 'implemented', sourceIds: harengonSources },
  { id: `${fairyId}-enlarge-reduce`, raceId: fairyId, name: '仙灵魔法：变巨术/缩小术', englishName: 'Fairy Magic: Enlarge/Reduce', level: 5, kind: 'action', summary: '变巨术/缩小术，每长休免费施放一次，也可用合适法术位', description: '5级起获得变巨术/缩小术，使用选定种族施法属性；每长休一次免费施放，也可消耗合适法术位，次数与妖火独立。按原有法术成分施放；局内体型变化不自动改写创建体型。', status: 'implemented', sourceIds: harengonSources },
  { id: `${fairyId}-flight`, raceId: fairyId, name: '飞行', englishName: 'Flight', level: 1, kind: 'passive', summary: '飞行速度等于当前步行速度；穿中甲或重甲时不可使用', description: '飞行速度等于当前步行速度；穿中甲或重甲时不可使用。该条件只作情境提示，不自动执行移动、不改写步行速度。', status: 'implemented', sourceIds: harengonSources },
  { id: `${harengonId}-hare-trigger`, raceId: harengonId, name: '狡兔敏锐', englishName: 'Hare-Trigger', level: 1, kind: 'passive', summary: '先攻加入熟练加值', description: '以敏捷调整值和熟练加值计算先攻，人工修正另外叠加一次。', status: 'implemented', sourceIds: harengonSources },
  { id: `${harengonId}-leporine-senses`, raceId: harengonId, name: '小兔感官', englishName: 'Leporine Senses', level: 1, kind: 'passive', summary: '察觉技能熟练', description: '与同类熟练不重复叠加。', status: 'implemented', sourceIds: harengonSources },
  { id: `${harengonId}-lucky-footwork`, raceId: harengonId, name: '幸运步伐', englishName: 'Lucky Footwork', level: 1, kind: 'reaction', summary: '敏捷豁免失败时反应加d4；速度0或倒地时不可用', description: '情境修正由玩家按当前状态处理，不常驻加到敏捷豁免，也不创建次数资源。', status: 'implemented', sourceIds: harengonSources },
  { id: `${harengonId}-rabbit-hop`, raceId: harengonId, name: '兔子跳', englishName: 'Rabbit Hop', level: 1, kind: 'bonus-action', summary: '跳跃5倍熟练加值尺，不触发借机攻击；熟练次数/长休', description: '使用时速度须大于0；资源计数不自动移动角色或判断借机攻击。', resource: { maxByLevel: proficiencyUses, recovery: 'long-rest', unit: '次' }, status: 'implemented', sourceIds: harengonSources },
  { id: `${shadarKaiId}-blessing`, raceId: shadarKaiId, name: '渡鸦女王的祝福', englishName: 'Blessing of the Raven Queen', level: 1, kind: 'bonus-action', summary: '传送到30尺内可见空位；熟练次数/长休', description: '从3级起传送后获得所有伤害抗性直到下回合开始，临时抗性不加入常驻抗性列表。', resource: { maxByLevel: proficiencyUses, recovery: 'long-rest', unit: '次' }, status: 'implemented', sourceIds },
  { id: `${shadarKaiId}-blessing-resistance`, raceId: shadarKaiId, name: '祝福抗性', englishName: 'Blessing Resistance', level: 3, kind: 'passive', summary: '使用祝福传送后抵抗所有伤害，至下回合开始', description: '条件效果仅展示，由玩家按实际使用时点处理。', status: 'implemented', sourceIds },
  { id: `${shadarKaiId}-darkvision`, raceId: shadarKaiId, name: '黑暗视觉', englishName: 'Darkvision', level: 1, kind: 'passive', summary: '60尺黑暗视觉', description: '光照条件由玩家判断。', status: 'implemented', sourceIds },
  { id: `${shadarKaiId}-fey-ancestry`, raceId: shadarKaiId, name: '妖精血统', englishName: 'Fey Ancestry', level: 1, kind: 'passive', summary: '避免或结束魅惑的豁免具有优势', description: '不常驻修改全部豁免数值。', status: 'implemented', sourceIds },
  { id: `${shadarKaiId}-keen-senses`, raceId: shadarKaiId, name: '敏锐感官', englishName: 'Keen Senses', level: 1, kind: 'passive', summary: '察觉技能熟练', description: '同类熟练不重复叠加。', status: 'implemented', sourceIds },
  { id: `${shadarKaiId}-necrotic-resistance`, raceId: shadarKaiId, name: '暗蚀抗性', englishName: 'Necrotic Resistance', level: 1, kind: 'passive', summary: '暗蚀伤害抗性', description: '展示级，不自动进行战斗减伤结算。', status: 'implemented', sourceIds },
  { id: `${shadarKaiId}-trance`, raceId: shadarKaiId, name: '出神', englishName: 'Trance', level: 1, kind: 'passive', summary: '4小时出神完成长休，免魔法睡眠；临时两项武器/工具熟练', description: '临时熟练由玩家按长休选择，不自动保存或推断手部占用。', status: 'implemented', sourceIds },
  { id: `${changelingId}-ability-score-increase`, raceId: changelingId, name: '属性提升', englishName: 'Ability Score Increase', level: 1, kind: 'choice', summary: '选择+2/+1或三项+1，分配到不同属性', description: '在属性步骤分配，最终属性不得超过20。', status: 'implemented', sourceIds },
  { id: `${changelingId}-creature-type`, raceId: changelingId, name: '生物种类', englishName: 'Creature Type', level: 1, kind: 'passive', summary: '妖精', description: '与旧艾伯伦版的类人生物不同，相关法术与效果由玩家按生物类型判断。', status: 'implemented', sourceIds },
  { id: `${changelingId}-instincts`, raceId: changelingId, name: '幻身灵本能', englishName: 'Changeling Instincts', level: 1, kind: 'choice', summary: '欺瞒、洞悉、威吓、表演、游说五选二熟练', description: '在起源步骤选择两项不同技能，按熟练规则计算。', status: 'implemented', sourceIds },
  { id: `${changelingId}-shapechanger`, raceId: changelingId, name: '变形生物', englishName: 'Shapechanger', level: 1, kind: 'action', summary: '动作改变外貌、声音及中型/小型形态；装备不变', description: '只可模仿见过的个体，肢体布局须与自身相同；形态持续至主动恢复或死亡。伪装不改变其他游戏数据，局内形态不自动改写创建体型。', status: 'implemented', sourceIds },
  { id: `${changelingId}-languages`, raceId: changelingId, name: '语言', englishName: 'Languages', level: 1, kind: 'choice', summary: '通用语及一门自选语言', description: '自选语言与背景额外语言在起源步骤一并选择，具体语言需符合战役要求。', status: 'implemented', sourceIds },
]
