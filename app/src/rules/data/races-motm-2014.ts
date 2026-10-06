import type { RaceFeature, RaceRule } from '@/types/rules'

const sourceIds = ['motm-2022-index'] as const
const changelingId = 'race-2014-motm-changeling'
const harengonId = 'race-2014-motm-harengon'
const shadarKaiId = 'race-2014-motm-shadar-kai'
const harengonSources = ['motm-2022-index', 'twbtw-2021-index'] as const
const abilityAlternatives = [
  { id: 'two-one', label: '一项 +2，另一项 +1', groups: [{ count: 1, value: 2 }, { count: 1, value: 1 }] },
  { id: 'three-one', label: '三项各 +1', groups: [{ count: 3, value: 1 }] },
] as const
const proficiencyUses = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6] as const

/** 本地CHM 1771总则及1755；只登记核验元数据与原创摘要，不覆盖旧版。 */
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
}]

export const motmRaceFeatures2014: readonly RaceFeature[] = [
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
