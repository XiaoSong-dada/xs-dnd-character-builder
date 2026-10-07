import type { RaceFeature, RaceRule } from '@/types/rules'

const sourceIds = ['motm-2022-index'] as const
const changelingId = 'race-2014-motm-changeling'
const harengonId = 'race-2014-motm-harengon'
const shadarKaiId = 'race-2014-motm-shadar-kai'
const fairyId = 'race-2014-motm-fairy'
const airGenasiId = 'race-2014-motm-air-genasi'
const earthGenasiId = 'race-2014-motm-earth-genasi'
const fireGenasiId = 'race-2014-motm-fire-genasi'
const waterGenasiId = 'race-2014-motm-water-genasi'
const harengonSources = ['motm-2022-index', 'twbtw-2021-index'] as const
const abilityAlternatives = [
  { id: 'two-one', label: '一项 +2，另一项 +1', groups: [{ count: 1, value: 2 }, { count: 1, value: 1 }] },
  { id: 'three-one', label: '三项各 +1', groups: [{ count: 3, value: 1 }] },
] as const
const proficiencyUses = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6] as const

/** 本地CHM 1771及各玩家种族正文；只登记核验元数据与原创摘要，不覆盖旧版。 */
export const motmRaces2014: readonly RaceRule[] = [{
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
}]

export const motmRaceFeatures2014: readonly RaceFeature[] = [
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
