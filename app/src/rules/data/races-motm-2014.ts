import type { RaceFeature, RaceRule } from '@/types/rules'

const sourceIds = ['motm-2022-index'] as const
const changelingId = 'race-2014-motm-changeling'

/** 本地CHM 1771总则及1755；只登记核验元数据与原创摘要，不覆盖旧版。 */
export const motmRaces2014: readonly RaceRule[] = [{
  id: changelingId, ruleset: '5e-2014', name: '幻身灵（多元宇宙）', englishName: 'Changeling',
  searchAliases: ['幻身灵', '变形怪', 'MotM Changeling'],
  summary: '妖精；中型或小型；五项社交技能选二，可改变外貌与声音。',
  description: '多元宇宙版幻身灵属于妖精，创建时选择中型或小型，步行速度30尺。属性可选一项+2与另一项+1，或三项不同属性各+1；通用语加一门自选语言。幻身本能从欺瞒、洞悉、威吓、表演、游说中选两项熟练。变形生物以动作改变外貌和声音，可在中型与小型间变化；装备不变，其他游戏数据不随伪装种族改变。',
  fixedAbilityBonuses: {}, fixedLanguages: ['通用语'], languageChoices: 1,
  flexibleBonusAlternatives: [
    { id: 'two-one', label: '一项 +2，另一项 +1', groups: [{ count: 1, value: 2 }, { count: 1, value: 1 }] },
    { id: 'three-one', label: '三项各 +1', groups: [{ count: 3, value: 1 }] },
  ],
  sizeChoices: ['small', 'medium'], speed: 30,
  skillProficiencyChoices: { count: 2, optionIds: ['skill-deception', 'skill-insight', 'skill-intimidation', 'skill-performance', 'skill-persuasion'] },
  subraceIds: [], recommendedClassIds: ['class-2014-bard', 'class-2014-rogue', 'class-2014-sorcerer'],
  status: 'implemented', sourceIds,
}]

export const motmRaceFeatures2014: readonly RaceFeature[] = [
  { id: `${changelingId}-ability-score-increase`, raceId: changelingId, name: '属性提升', englishName: 'Ability Score Increase', level: 1, kind: 'choice', summary: '选择+2/+1或三项+1，分配到不同属性', description: '在属性步骤分配，最终属性不得超过20。', status: 'implemented', sourceIds },
  { id: `${changelingId}-creature-type`, raceId: changelingId, name: '生物种类', englishName: 'Creature Type', level: 1, kind: 'passive', summary: '妖精', description: '与旧艾伯伦版的类人生物不同，相关法术与效果由玩家按生物类型判断。', status: 'implemented', sourceIds },
  { id: `${changelingId}-instincts`, raceId: changelingId, name: '幻身灵本能', englishName: 'Changeling Instincts', level: 1, kind: 'choice', summary: '欺瞒、洞悉、威吓、表演、游说五选二熟练', description: '在起源步骤选择两项不同技能，按熟练规则计算。', status: 'implemented', sourceIds },
  { id: `${changelingId}-shapechanger`, raceId: changelingId, name: '变形生物', englishName: 'Shapechanger', level: 1, kind: 'action', summary: '动作改变外貌、声音及中型/小型形态；装备不变', description: '只可模仿见过的个体，肢体布局须与自身相同；形态持续至主动恢复或死亡。伪装不改变其他游戏数据，局内形态不自动改写创建体型。', status: 'implemented', sourceIds },
  { id: `${changelingId}-languages`, raceId: changelingId, name: '语言', englishName: 'Languages', level: 1, kind: 'choice', summary: '通用语及一门自选语言', description: '自选语言与背景额外语言在起源步骤一并选择，具体语言需符合战役要求。', status: 'implemented', sourceIds },
]
