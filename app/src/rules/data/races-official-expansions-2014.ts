import { equipment2014 } from '@/rules/data/equipment-2014'
import { SKILL_IDS } from '@/rules/data/skill-ids'
import type { ChoiceCheckpoint, RaceFeature, RaceRule, RuleOption, SpeciesSpellGrant } from '@/types/rules'

const abilityAlternatives = [
  { id: 'two-one', label: '一项 +2，另一项 +1', groups: [{ count: 1, value: 2 }, { count: 1, value: 1 }] },
  { id: 'three-one', label: '三项各 +1', groups: [{ count: 3, value: 1 }] },
] as const
const proficiencyUses = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6] as const
const singleUse = { maxByLevel: Array.from({ length: 20 }, () => 1), recovery: 'long-rest', unit: '次' } as const
const proficiencyResource = { maxByLevel: proficiencyUses, recovery: 'long-rest', unit: '次' } as const
const concreteTools = equipment2014.filter((item) => item.category === 'tool' && !['holy-symbol', 'druidic-focus', 'arcane-focus', 'component-pouch', 'gaming-set', 'artisan-tools', 'musical-instrument', 'con-tools'].includes(item.id)).map((item) => item.id)
function choice(id: string, title: string, description: string, optionIds: readonly string[], extra: Partial<ChoiceCheckpoint> = {}): ChoiceCheckpoint {
  return { id, title, description, level: 1, step: 'timeline', kind: 'class-choice', required: true, minSelections: 1, maxSelections: 1, optionIds, ...extra }
}
const genasiSources = ['eepc-2015-index', 'egtw-2020-index'] as const
const instruments = ['bagpipes', 'drum', 'dulcimer', 'flute', 'horn', 'lute', 'lyre', 'pan-flute', 'shawm', 'viol'] as const
function oldSpell(slug: string, minimumLevel: number, extra: Partial<SpeciesSpellGrant> = {}): SpeciesSpellGrant {
  return { spellId: `spell-2014-${slug}`, minimumLevel, ability: 'con', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest', canCastWithSpellSlots: false, ...extra }
}

function race(slug: string, name: string, englishName: string, source: string, description: string, fields: Partial<RaceRule>): RaceRule {
  const ancestralMovement: NonNullable<RaceRule['ancestralMovement']> = [
    ...(fields.flySpeed ? [{ kind: 'fly' as const, speed: fields.flySpeed, usesWalkingSpeed: true, condition: '等于步行；穿中甲或重甲不可飞行' }] : []),
    ...(fields.climbSpeed ? [{ kind: 'climb' as const, speed: fields.climbSpeed, usesWalkingSpeed: true, condition: '攀爬速度等于步行，不附带其他原种族特性' }] : []),
    ...(fields.swimSpeed ? [{ kind: 'swim' as const, speed: fields.swimSpeed, usesWalkingSpeed: slug === 'giff', condition: slug === 'giff' ? '游泳速度等于步行' : '固定种族游泳速度；不保留两栖呼吸' }] : []),
  ]
  return { id: `race-2014-${slug}`, ruleset: '5e-2014', name, englishName, summary: description, description, fixedAbilityBonuses: {}, size: 'medium', speed: 30, fixedLanguages: ['通用语'], languageChoices: 1, subraceIds: [], recommendedClassIds: [], status: 'implemented', sourceIds: [source], ancestralMovement, ...(slug === 'astral-elf' ? { countsAsRaceIds: ['race-2014-elf'] } : {}), ...fields }
}

export const officialExpansionRaces2014: readonly RaceRule[] = [
  race('owlin', '枭人', 'Owlin', 'scc-2021-index', '小型或中型类人生物，黑暗视觉120尺、隐匿熟练。飞行等于步行；穿中甲或重甲时无法飞行。', { size: undefined, sizeChoices: ['small', 'medium'], flexibleBonusAlternatives: abilityAlternatives, darkvision: 120, flySpeed: 30, skillProficiencies: ['skill-stealth'] }),
  race('verdan', '佛丹人', 'Verdan', 'ai-2019-index', '类人生物，1—4级小型、5级起中型；游说熟练，感知及魅力豁免优势。短休生命骰掷出1或2可重掷，须用新结果；有限心灵感应30尺。', { fixedAbilityBonuses: { con: 1, cha: 2 }, size: 'small', sizeByLevel: [{ level: 1, size: 'small' }, { level: 5, size: 'medium' }], fixedLanguages: ['通用语', '地精语'], skillProficiencies: ['skill-persuasion'] }),
  race('kender', '坎德人', 'Kender', 'dsotdq-2022-index', '小型类人生物；五技能选一，无畏及嘲讽。嘲讽属性智力、感知、魅力选一，不是施法属性。', { size: 'small', flexibleBonusAlternatives: abilityAlternatives, skillProficiencyChoices: { count: 1, optionIds: ['skill-insight', 'skill-investigation', 'skill-sleight-of-hand', 'skill-stealth', 'skill-survival'] }, choices: [{ id: 'race-2014-kender-taunt-ability', level: 1, step: 'timeline', required: true, kind: 'subclass-feature', title: '嘲讽关键属性', description: '选择智力、感知或魅力；嘲讽DC=8+熟练加值+所选属性调整值。', minSelections: 1, maxSelections: 1, optionIds: ['spell-ability-int', 'spell-ability-wis', 'spell-ability-cha'] }] }),
  race('locathah', '洛卡鱼人', 'Locathah', 'locathah-2019-index', '中型类人生物；天生护甲12+敏捷，可比较穿甲公式，盾牌不妨碍；运动与察觉熟练。每四小时至少浸水一次，否则有窒息风险。', { fixedAbilityBonuses: { str: 2, dex: 1 }, languageChoices: 0, fixedLanguages: ['通用语', '水族语'], naturalArmor: { base: 12, addsDexterity: true }, swimSpeed: 30, skillProficiencies: ['skill-athletics', 'skill-perception'] }),
  race('astral-elf', '星界精灵', 'Astral Elf', 'aag-2022-index', '中型类人生物，也视为精灵。察觉熟练、黑暗视觉60尺；星光步及星界出神。', { flexibleBonusAlternatives: abilityAlternatives, darkvision: 60, skillProficiencies: ['skill-perception'], spellcastingAbilityChoices: ['int', 'wis', 'cha'], chosenCantripCheckpointId: 'race-2014-astral-elf-cantrip', choices: [choice('race-2014-astral-elf-cantrip', '星界之火', '舞光术、光亮术或圣火术选一；使用种族施法属性。', ['spell-2014-dancing-lights', 'spell-2014-light', 'spell-2014-sacred-flame'])] }),
  race('autognome', '自动侏儒', 'Autognome', 'aag-2022-index', '小型构装生物。仅未穿甲时基础AC13+敏捷；两项具体PHB工具熟练，机械治疗例外。', { size: 'small', flexibleBonusAlternatives: abilityAlternatives, naturalArmor: { base: 13, addsDexterity: true, requiresUnarmored: true }, damageResistances: ['毒素'], toolProficiencyChoices: { count: 2, optionIds: concreteTools, required: true } }),
  race('giff', '诘弗人', 'Giff', 'aag-2022-index', '中型类人生物，游泳速度等于步行；星界火花、枪械大师与河马构造。', { flexibleBonusAlternatives: abilityAlternatives, swimSpeed: 30, weaponArmorProficiencies: ['枪械熟练'] }),
  race('hadozee', '鼯猴人', 'Hadozee', 'aag-2022-index', '类人生物，小型或中型，攀爬速度等于步行；使用官方勘误后的滑翔与闪避。', { flexibleBonusAlternatives: abilityAlternatives, size: undefined, sizeChoices: ['small', 'medium'], climbSpeed: 30 }),
  race('plasmoid', '流浆体', 'Plasmoid', 'aag-2022-index', '泥怪，小型或中型；黑暗视觉60尺，强韧与变形。', { flexibleBonusAlternatives: abilityAlternatives, size: undefined, sizeChoices: ['small', 'medium'], darkvision: 60, damageResistances: ['强酸', '毒素'] }),
  race('thri-kreen', '螳螂人', 'Thri-kreen', 'aag-2022-index', '怪兽，小型或中型；黑暗视觉60尺，仅未穿甲时基础AC13+敏捷，副臂与心灵感应。', { flexibleBonusAlternatives: abilityAlternatives, size: undefined, sizeChoices: ['small', 'medium'], darkvision: 60, naturalArmor: { base: 13, addsDexterity: true, requiresUnarmored: true } }),
race('leonin', '狮族', 'Leonin', 'mot-2020-index', '中型类人生物，体质+2、力量+1；黑暗视觉60尺，猎手本能与畏惧咆哮。', { fixedAbilityBonuses: { con: 2, str: 1 }, speed: 35, darkvision: 60, fixedLanguages: ['通用语', '狮族语'], languageChoices: 0, skillProficiencyChoices: { count: 1, optionIds: ['skill-athletics', 'skill-intimidation', 'skill-persuasion', 'skill-survival'] } }),
  race('satyr', '半羊人（旧版）', 'Satyr', 'mot-2020-index', '中型妖精，魅力+2、敏捷+1，步行35尺；表演与游说熟练，具体乐器选一。旧版魔法抗性包括其他魔法效应。', { fixedAbilityBonuses: { cha: 2, dex: 1 }, speed: 35, fixedLanguages: ['通用语', '森林语'], languageChoices: 0, skillProficiencies: ['skill-performance', 'skill-persuasion'], toolProficiencyChoices: { count: 1, optionIds: instruments, required: true } }),
  race('genasi', '元素裔（旧版）', 'Genasi', 'eepc-2015-index', '旧版元素裔父种族；体质+2，选择气、土、火、水之一，固定体质施法，不继承MotM规则。', { sourceIds: genasiSources, fixedAbilityBonuses: { con: 2 }, fixedLanguages: ['通用语', '原初语'], languageChoices: 0, requiresSubrace: true, subraceIds: ['race-2014-genasi-air', 'race-2014-genasi-earth', 'race-2014-genasi-fire', 'race-2014-genasi-water'] }),
  race('genasi-air', '气元素裔（旧版）', 'Air Genasi', 'eepc-2015-index', '父项体质+2，分支敏捷+1；1级浮空术一次/长休，免材料，体质施法；未失能时无限屏息。', { sourceIds: genasiSources, parentRaceId: 'race-2014-genasi', size: undefined, speed: undefined, fixedLanguages: [], languageChoices: 0, fixedAbilityBonuses: { dex: 1 }, spellGrants: [oldSpell('levitate', 1, { waivesMaterialComponents: true })] }),
  race('genasi-earth', '土元素裔（旧版）', 'Earth Genasi', 'eepc-2015-index', '父项体质+2，分支力量+1；1级行动无踪一次/长休，免材料，体质施法；土行条件只提示。', { sourceIds: genasiSources, parentRaceId: 'race-2014-genasi', size: undefined, speed: undefined, fixedLanguages: [], languageChoices: 0, fixedAbilityBonuses: { str: 1 }, spellGrants: [oldSpell('pass-without-trace', 1, { waivesMaterialComponents: true })] }),
  race('genasi-fire', '火元素裔（旧版）', 'Fire Genasi', 'eepc-2015-index', '父项体质+2，分支智力+1；黑暗视觉60尺呈红色，火焰抗性；燃火术及3级1环燃烧之手，固定体质施法。', { sourceIds: genasiSources, parentRaceId: 'race-2014-genasi', size: undefined, speed: undefined, fixedLanguages: [], languageChoices: 0, fixedAbilityBonuses: { int: 1 }, darkvision: 60, damageResistances: ['火焰'], spellGrants: [oldSpell('produce-flame', 1, { freeCastings: 0 }), oldSpell('burning-hands', 3, { castingLevel: 1 })] }),
  race('genasi-water', '水元素裔（旧版）', 'Water Genasi', 'eepc-2015-index', '父项体质+2，分支感知+1；强酸抗性，两栖，游泳30尺；操水术及3级2环造水/枯水术，固定体质施法。', { sourceIds: genasiSources, parentRaceId: 'race-2014-genasi', size: undefined, speed: undefined, fixedLanguages: [], languageChoices: 0, fixedAbilityBonuses: { wis: 1 }, swimSpeed: 30, damageResistances: ['强酸'], spellGrants: [oldSpell('shape-water', 1, { freeCastings: 0 }), oldSpell('create-or-destroy-water', 3, { castingLevel: 2 })] }),
  race('elf-shadar-kai', '影灵（旧版）', 'Shadar-kai', 'mtof-2018-index', '精灵子种族，继承敏捷+2、察觉等父项；体质+1，黯蚀抗性；渡鸦女王祝福一次/长休，不继承MotM熟练次数。', { parentRaceId: 'race-2014-elf', size: undefined, speed: undefined, fixedLanguages: [], languageChoices: 0, fixedAbilityBonuses: { con: 1 }, damageResistances: ['黯蚀'] }),
  race('custom-lineage', '定制血统', 'Custom Lineage', 'tcoe-2020-index', '类人生物，小型或中型；一属性+2，一项满足1级前置的专长；黑暗视觉或一技能熟练二选一，外貌不授予其他种族资格。', { size: undefined, sizeChoices: ['small', 'medium'], flexibleBonusGroups: [{ count: 1, value: 2 }], originFeatChoices: { count: 1, categories: ['general'] }, choices: [choice('race-2014-custom-lineage-trait', '可变特质', '黑暗视觉60尺或一项技能熟练，二选一。', ['species-2014-custom-darkvision', 'species-2014-custom-skill']), { ...choice('race-2014-custom-lineage-skill', '血统技能', '选择一项技能熟练。', SKILL_IDS, { parentCheckpointId: 'race-2014-custom-lineage-trait', parentOptionId: 'species-2014-custom-skill' }), grantsSkillProficiency: true }] }),
  race('dhampir', '半血裔', 'Dhampir', 'vrgtr-2021-index', '类人生物，小型或中型；步行35尺，攀爬等于步行，黑暗视觉60尺；无需呼吸，吸血啮咬；创建时任选两技能。', { flexibleBonusAlternatives: abilityAlternatives, size: undefined, sizeChoices: ['small', 'medium'], speed: 35, climbSpeed: 35, darkvision: 60, skillProficiencyChoices: { count: 2 }, lineage: true }),
  race('hexblood', '巫咒之子', 'Hexblood', 'vrgtr-2021-index', '妖精，小型或中型，黑暗视觉60尺；诡异信物，易容术与妖术各一次/长休及法术位施放；创建时任选两技能。', { flexibleBonusAlternatives: abilityAlternatives, size: undefined, sizeChoices: ['small', 'medium'], darkvision: 60, skillProficiencyChoices: { count: 2 }, lineage: true, spellcastingAbilityChoices: ['int', 'wis', 'cha'], spellGrants: [oldSpell('disguise-self', 1, { ability: undefined, canCastWithSpellSlots: true }), oldSpell('hex', 1, { ability: undefined, canCastWithSpellSlots: true })] }),
  race('reborn', '复生者', 'Reborn', 'vrgtr-2021-index', '类人生物，小型或中型；死者本性、前世知识；无黑暗视觉，创建时任选两技能。', { flexibleBonusAlternatives: abilityAlternatives, size: undefined, sizeChoices: ['small', 'medium'], skillProficiencyChoices: { count: 2 }, lineage: true, damageResistances: ['毒素'] }),
]

function feature(slug: string, key: string, name: string, description: string, fields: Partial<RaceFeature> = {}): RaceFeature {
  const owner = officialExpansionRaces2014.find((item) => item.id === `race-2014-${slug}`)
  if (!owner) throw new Error(`Missing expansion race: ${slug}`)
  const stats: Partial<RaceFeature> = slug === 'kender' && key === 'taunt' ? { saveDc: { abilityCheckpointId: 'race-2014-kender-taunt-ability' } }
    : slug === 'leonin' && key === 'roar' ? { saveDc: { ability: 'con' } }
    : slug === 'dhampir' && key === 'bite' ? { naturalAttack: { ability: 'con', damageDice: '1d4' } } : {}
  return { id: `${owner.id}-${key}`, raceId: owner.id, name, englishName: key, level: 1, kind: 'passive', summary: description, description, status: 'implemented', sourceIds: owner.sourceIds, ...stats, ...fields }
}

export const officialExpansionFeatures2014: readonly RaceFeature[] = [
  ...officialExpansionRaces2014.map((item) => feature(item.id.slice(10), 'traits', '种族特质', item.description)),
  feature('owlin', 'flight', '飞行', '飞行速度等于当前步行速度；穿中甲或重甲不可用。条件由玩家判断。'),
  feature('owlin', 'darkvision', '黑暗视觉', '120尺黑暗视觉，黑暗中辨认灰度。'),
  feature('owlin', 'silent-feathers', '无声羽毛', '隐匿技能熟练，同类熟练不重复。'),
  feature('verdan', 'growth', '生长突变', '1—4级小型，5级起中型；升级及降级按当前等级派生。'),
  feature('verdan', 'healing', '黑血疗愈', '短休生命骰掷出1或2可重掷一次，须用新结果；不自动修改休息治疗。'),
  feature('verdan', 'telepathy', '有限心灵感应', '与30尺内可见且至少懂一种语言的生物传递简单想法，无须共通语言。'),
  feature('verdan', 'insight', '心灵感应洞悉', '感知及魅力豁免具有优势。'),
  feature('kender', 'fearless', '无畏', '避免或结束恐惧豁免具有优势；失败时可改为成功，一次/长休。', { resource: singleUse }),
  feature('kender', 'taunt', '嘲讽', '附赠动作嘲讽60尺内能听见且理解你的目标；感知豁免DC=8+熟练+所选属性，失败后对其他目标攻击劣势至你下回合开始。', { kind: 'bonus-action', selectionRequirement: { checkpointId: 'race-2014-kender-taunt-ability' }, resource: { maxByLevel: proficiencyUses, recovery: 'long-rest', unit: '次' } }),
  feature('locathah', 'natural-armor', '天生护甲', '基础AC12+敏捷，与合法护甲公式比较，不叠加基础公式，允许盾牌。'),
  feature('locathah', 'will', '利维坦意志', '避免魅惑、恐慌、麻痹、中毒、震慑或睡眠的豁免具有优势。'),
  feature('locathah', 'amphibious', '有限两栖', '可在空气与水中呼吸，但至少每四小时浸水一次以避免窒息；仅提示，不启动计时器。'),
  feature('astral-elf', 'fey-ancestry', '妖精血统', '避免或结束魅惑的豁免具有优势。'),
  feature('astral-elf', 'starlight-step', '星光步', '附赠动作传送至30尺内可见未占据空间；熟练次数/长休，不自动执行移动。', { kind: 'bonus-action', resource: proficiencyResource }),
  feature('astral-elf', 'trance', '星界出神', '无需睡眠，免魔法睡眠；保持意识的4小时出神完成长休。结束后选择一技能和一武器或工具熟练至下次长休，只提示临时熟练。'),
  feature('autognome', 'casing', '装甲外壳', '未穿甲时基础AC13+敏捷；与其他合法公式比较，不叠加。'),
  feature('autognome', 'built-for-success', '为成功而造', '进行攻击、属性检定或豁免后、效果结算前，可加1d4；熟练次数/长休。', { resource: proficiencyResource }),
  feature('autognome', 'healing-machine', '治疗机械', '修复术可让你消耗一枚生命骰治疗，最低1。构装类型不阻止疗伤术、治愈真言、群体疗伤术、群体治愈真言、维生术作用；治疗由玩家结算。'),
  feature('autognome', 'mechanical-nature', '机械本性', '毒素抗性，免疫疾病；避免或结束麻痹、中毒的豁免优势，无需饮食或呼吸。'),
  feature('autognome', 'sentry-rest', '哨兵休息', '长休需至少6小时保持不动、仍有意识；不自动判断休息完成。'),
  feature('giff', 'astral-spark', '星界火花', '简单或军用武器命中时可额外造成熟练加值的力场伤害，每回合一次；熟练次数/长休，伤害手动处理。', { resource: proficiencyResource }),
  feature('giff', 'firearms', '枪械大师', '枪械熟练；忽略枪械装填，远距离不因此劣势。不自动改写其他武器或枪械攻击。'),
  feature('giff', 'hippo-build', '河马构造', '力量属性检定和豁免优势；负重、推拉、抬举按体型大一级。'),
  feature('hadozee', 'feet', '灵巧双足', '附赠动作操作物件、打开或关闭门或容器、拾取或放下微型物品；由玩家处理。', { kind: 'bonus-action' }),
  feature('hadozee', 'glide', '滑翔', '离地至少10尺下落时，用反应水平滑翔至多等于步行速度的距离，自选方向，该次下落伤害为0；不沿用旧版滑翔倍率。', { kind: 'reaction' }),
  feature('hadozee', 'dodge', '鼯猴人闪避', '受伤时用反应减伤1d6+熟练加值，最低0；熟练次数/长休，手动结算。', { kind: 'reaction', resource: proficiencyResource }),
  feature('plasmoid', 'amorphous', '无定形', '未穿戴或携带任何物品时可通过至少1寸的空间；发起或逃脱擒抱的属性检定具有优势，装备限制只提示。'),
  feature('plasmoid', 'hold-breath', '屏息', '可屏息1小时，不启动倒计时。'),
  feature('plasmoid', 'resilience', '强韧', '强酸与毒素抗性；避免或结束中毒的豁免优势。'),
  feature('plasmoid', 'shape-self', '自我变形', '动作改变四肢形态；附赠动作伸出或收回10尺伪足，操作物体最多10磅，不能攻击、使用魔法物品或作为感官；不创建形态状态。'),
  feature('thri-kreen', 'carapace', '变色甲壳', '仅未穿甲时基础AC13+敏捷；动作改变颜色与纹理后，在相应环境中躲藏的隐匿检定优势，临时伪装只提示。'),
  feature('thri-kreen', 'arms', '副臂', '副臂可操作物件、开关门容器、拾取放下微型物件，或持有轻型武器；不自动增加攻击次数或装备槽。'),
  feature('thri-kreen', 'sleepless', '不眠', '无需睡眠，长休可保持清醒且只从事轻度活动。'),
  feature('thri-kreen', 'telepathy', '螳螂人心灵感应', '向120尺内愿意交流且至少懂一种语言的生物建立联系；无需可见目标。可中断或联系不同生物，超过范围结束；不能正常口述所懂语言。'),
  feature('leonin', 'claws', '爪击', '爪为天生武器，徒手命中造成1d4+力量调整值挥砍伤害。'),
  feature('leonin', 'roar', '畏惧咆哮', '附赠动作；自选10尺内能听见的目标，感知豁免DC8+熟练+体质；失败恐慌至你下回合结束，短休或长休恢复一次。', { kind: 'bonus-action', resource: { ...singleUse, recovery: 'short-rest' } }),
  feature('satyr', 'ram', '顶撞', '头角徒手命中造成1d4+力量调整值钝击伤害。'),
  feature('satyr', 'magic-resistance', '魔法抗性', '对抗法术和其他魔法效应的豁免具有优势；与MotM仅法术的规则隔离。'),
  feature('satyr', 'leaps', '欢腾跳跃', '跳跃距离增加1d8尺，仍消耗移动力；玩家掷骰判断，不自动改变速度。'),
  feature('genasi-air', 'breath', '魔息', '未陷入失能时可无限屏息，不创建呼吸状态。'),
  feature('genasi-earth', 'earth-walk', '土行', '穿越土地或岩地的困难地形时不额外消耗移动力；不泛化到所有地形。'),
  feature('genasi-fire', 'vision', '黑暗视觉与火焰抗性', '黑暗视觉60尺，黑暗中呈红色；火焰抗性。'),
  feature('genasi-water', 'amphibious', '水陆两栖', '可在空气和水中呼吸，游泳30尺，强酸抗性。'),
  feature('elf-shadar-kai', 'blessing', '渡鸦女王祝福', '附赠动作传送至30尺内可见未占据空间，一次/长休；3级起传送后对所有伤害抗性至下回合开始，只提示临时效果。', { kind: 'bonus-action', resource: singleUse }),
  feature('custom-lineage', 'darkvision', '黑暗视觉', '黑暗视觉60尺，不额外授予技能。', { selectionRequirement: { checkpointId: 'race-2014-custom-lineage-trait', optionId: 'species-2014-custom-darkvision' } }),
  ...['dhampir', 'hexblood', 'reborn'].map((slug) => feature(slug, 'ancestral-legacy', '先祖遗产', '创建时选择两技能；冒险中转化仅可保留原种族技能及攀爬、飞行、游泳速度和条件。不保留旧属性、专长、护甲、感官、法术或资源。')),
  feature('dhampir', 'deathless', '无生本性', '无需呼吸。'),
  feature('dhampir', 'spider-climb', '蛛行', '攀爬速度等于步行；3级起可无需双手沿垂直表面或天花板行走，移动条件手动判断。'),
  feature('dhampir', 'bite', '吸血啮咬', '啮咬为你熟练的简单近战武器，用体质代替力量计算命中及伤害，1d4穿刺；生命不超过上限一半时啮咬攻击优势。命中非构装、非亡灵可强化：恢复穿刺伤害等量生命，或给下一攻击/属性检定同量加值；强化熟练次数/长休，治疗与伤害手动处理。', { resource: proficiencyResource }),
  feature('hexblood', 'token', '诡异信物', '附赠动作制成一枚信物，一次/长休。持有者在10里内时，可用动作传递至多25词；或动作进入恍惚遥视信物周围至多1分钟，结束消耗信物；不建立物品或遥视状态。', { kind: 'bonus-action', resource: singleUse }),
  feature('hexblood', 'hex-magic', '巫咒魔法', '1级易容术与妖术，智力/感知/魅力必选；各一次/长休，也可用适当法术位，不免成分。'),
  feature('reborn', 'deathless', '死者本性', '毒素抗性；疾病、中毒及死亡豁免优势。无需饮食、呼吸或睡眠，魔法不能催眠；4小时静止休息完成长休，仍有意识。'),
  feature('reborn', 'past-life', '前世知识', '使用技能进行属性检定、掷d20后但知道结果前，可额外加1d6；熟练次数/长休，不自动添加常驻技能加值。', { resource: proficiencyResource }),
]

export const officialExpansionOptions2014: readonly RuleOption[] = [
  { id: 'species-2014-custom-darkvision', name: '黑暗视觉', englishName: 'Darkvision', description: '黑暗视觉60尺，不授予技能熟练。', status: 'implemented', sourceIds: ['tcoe-2020-index'] },
  { id: 'species-2014-custom-skill', name: '技能熟练', englishName: 'Skill Proficiency', description: '任选一技能熟练，不授予黑暗视觉。', status: 'implemented', sourceIds: ['tcoe-2020-index'] },
]

/** 经逐条比较的旧版重印保留旧ID；本地正文差异按官方勘误记录，不借用MotM。 */
export function withOfficialReprint(race: RaceRule): RaceRule {
  if (race.id === 'race-2014-aarakocra') return { ...race, ancestralMovement: [{ kind: 'fly', speed: 50, condition: '固定50尺；穿中甲或重甲不可飞行' }] }
  if (race.id === 'race-2014-tabaxi') return { ...race, ancestralMovement: [{ kind: 'climb', speed: 20, condition: '固定20尺；不保留猫之迅捷或爪击' }] }
  if (race.id === 'race-2014-lizardfolk' || race.id === 'race-2014-elf-sea-elf') return { ...race, ancestralMovement: [{ kind: 'swim', speed: 30, condition: '固定30尺；不保留两栖呼吸或屏息' }] }
  if (race.id.startsWith('race-2014-motm-')) return { ...race, ancestralMovement: [
    ...(race.flySpeed ? [{ kind: 'fly' as const, speed: race.flySpeed, usesWalkingSpeed: true, condition: '等于步行；穿中甲或重甲不可飞行' }] : []),
    ...(race.climbSpeed ? [{ kind: 'climb' as const, speed: race.climbSpeed, usesWalkingSpeed: true, condition: '攀爬速度等于步行' }] : []),
    ...(race.swimSpeed ? [{ kind: 'swim' as const, speed: race.swimSpeed, usesWalkingSpeed: true, condition: '游泳速度等于步行；不保留两栖呼吸' }] : []),
  ] }
  if (race.id === 'race-2014-elf') return { ...race, size: 'medium', speed: 30, darkvision: 60, fixedLanguages: ['通用语', '精灵语'], languageChoices: 0, subraceIds: [...race.subraceIds, 'race-2014-elf-shadar-kai'] }
  if (race.id === 'race-2014-centaur') return { ...race, sourceIds: ['ggr-2018-index', 'mot-2020-index'], size: 'medium', fixedLanguages: ['通用语', '森林语'], languageChoices: 0, searchAliases: ['人马'] }
  if (race.id === 'race-2014-minotaur') return { ...race, sourceIds: ['ggr-2018-index', 'mot-2020-index'], size: 'medium', speed: 30, fixedLanguages: ['通用语', '米诺陶语'], languageChoices: 0, searchAliases: ['牛头人'] }
  if (race.id === 'race-2014-triton') return { ...race, sourceIds: ['vgm-2016-index', 'mot-2020-index'], size: 'medium', speed: 30, swimSpeed: 30, ancestralMovement: [{ kind: 'swim', speed: 30, condition: '固定种族游泳速度；不保留两栖呼吸' }], darkvision: 60, fixedLanguages: ['通用语', '原初语'], languageChoices: 0, damageResistances: ['寒冷'], searchAliases: ['梭螺鱼人'], spellGrants: [oldSpell('fog-cloud', 1, { ability: 'cha' }), oldSpell('gust-of-wind', 3, { ability: 'cha' }), oldSpell('wall-of-water', 5, { ability: 'cha' })] }
  return race
}

export function withOfficialFeatureReprint(item: RaceFeature): RaceFeature {
  const ids = ['race-2014-centaur', 'race-2014-minotaur', 'race-2014-triton']
  if (!ids.includes(item.raceId)) return item
  return { ...item, sourceIds: item.raceId === 'race-2014-triton' ? ['vgm-2016-index', 'mot-2020-index'] : ['ggr-2018-index', 'mot-2020-index'] }
}
