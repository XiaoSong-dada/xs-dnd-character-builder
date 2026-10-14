import type { MulticlassPrerequisite, MulticlassProficiencyGrant } from '@/types/rules'

/**
 * 2014 兼职规则登记（MC-B01／MC-B02）。
 *
 * 依据《5e 不全书》`玩家手册_自定义选项_兼职.md`：
 * - 「兼职先决条件」表（:20-72）：属性要求，含「或／及」语义；
 * - 「兼职熟练项」表（:99-152）：兼职一个新职业时获得的熟练项；
 * - 「施法」段（:177-186）：施法等级系数（消费方归 MC-D01）。
 *
 * 约定：
 * - 先决判定只能读**基础属性**（`draft.baseAbilities`）——临时加值不算数（官方 2025 裁定）。
 * - 豁免熟练**不在**兼职熟练项内，角色只拥有起始职业的豁免；此处不登记任何豁免。
 * - 奇械师按《塔莎的万事坩埚》`玩家手册`以外的职业章节（`塔莎的万事坩埚_玩家选项_职业_奇械师.md:523-526`）：
 *   至少 13 点智力；兼职熟练项按 TCoE 条目（轻甲／中甲／盾牌、盗贼工具、一项工匠工具）。
 */

/** 2014 各职业技能候选（用于「该职业技能熟练项中选择其一」的兼职项）。 */
const BARD_SKILLS: readonly string[] = [
  'skill-acrobatics', 'skill-animal-handling', 'skill-arcana', 'skill-athletics', 'skill-deception',
  'skill-history', 'skill-insight', 'skill-intimidation', 'skill-investigation', 'skill-medicine',
  'skill-nature', 'skill-perception', 'skill-performance', 'skill-persuasion', 'skill-religion',
  'skill-sleight-of-hand', 'skill-stealth', 'skill-survival',
]

const RANGER_SKILLS: readonly string[] = [
  'skill-animal-handling', 'skill-athletics', 'skill-insight', 'skill-investigation',
  'skill-nature', 'skill-perception', 'skill-stealth', 'skill-survival',
]

const ROGUE_SKILLS: readonly string[] = [
  'skill-acrobatics', 'skill-athletics', 'skill-deception', 'skill-insight', 'skill-intimidation',
  'skill-investigation', 'skill-perception', 'skill-performance', 'skill-persuasion',
  'skill-sleight-of-hand', 'skill-stealth',
]

/**
 * 乐器候选：2014 兼职条目只写「一种自选乐器」，项目内乐器为**总类**选项
 * （见 `martialOptions2014` 的 `tool-musical-instrument`，与吟游诗人 1 级、武僧 1 级检查点同口径）。
 * 逐件乐器属展示级资料，不进入候选池——避免为兼职单独引入未登记的具体工具 ID。
 */
const INSTRUMENT_IDS: readonly string[] = ['tool-musical-instrument']

/** 工匠工具候选：同样使用总类选项（与奇械师 1 级「选择一套工匠工具」的分档口径一致）。 */
const ARTISAN_TOOL_IDS: readonly string[] = ['tool-artisans-tools']

export interface MulticlassClassRule2014 {
  readonly classId: string
  readonly prerequisite: MulticlassPrerequisite
  readonly proficiencies: MulticlassProficiencyGrant
}

export const multiclassClasses2014: readonly MulticlassClassRule2014[] = [
  {
    classId: 'class-2014-barbarian',
    prerequisite: { anyOf: [['str']] },
    proficiencies: {
      ruleset: '5e-2014',
      armorTraining: ['shield'],
      weaponTraining: { categories: ['simple', 'martial'] },
    },
  },
  {
    classId: 'class-2014-bard',
    prerequisite: { anyOf: [['cha']] },
    proficiencies: {
      ruleset: '5e-2014',
      armorTraining: ['light'],
      skillChoices: { count: 1, optionIds: BARD_SKILLS },
      toolChoices: { count: 1, optionIds: INSTRUMENT_IDS },
    },
  },
  {
    classId: 'class-2014-cleric',
    prerequisite: { anyOf: [['wis']] },
    proficiencies: {
      ruleset: '5e-2014',
      armorTraining: ['light', 'medium', 'shield'],
    },
  },
  {
    classId: 'class-2014-druid',
    prerequisite: { anyOf: [['wis']] },
    proficiencies: {
      ruleset: '5e-2014',
      armorTraining: ['light', 'medium', 'shield'],
      // 原书附注：德鲁伊不使用铁质护甲或盾牌（展示级，不阻断数值计算）。
    },
  },
  {
    classId: 'class-2014-fighter',
    prerequisite: { anyOf: [['str'], ['dex']] },
    proficiencies: {
      ruleset: '5e-2014',
      armorTraining: ['light', 'medium', 'shield'],
      weaponTraining: { categories: ['simple', 'martial'] },
    },
  },
  {
    classId: 'class-2014-monk',
    prerequisite: { anyOf: [['dex', 'wis']] },
    proficiencies: {
      ruleset: '5e-2014',
      weaponTraining: { categories: ['simple'], itemIds: ['shortsword'] },
    },
  },
  {
    classId: 'class-2014-paladin',
    prerequisite: { anyOf: [['str', 'cha']] },
    proficiencies: {
      ruleset: '5e-2014',
      armorTraining: ['light', 'medium', 'shield'],
      weaponTraining: { categories: ['simple', 'martial'] },
    },
  },
  {
    classId: 'class-2014-ranger',
    prerequisite: { anyOf: [['dex', 'wis']] },
    proficiencies: {
      ruleset: '5e-2014',
      armorTraining: ['light', 'medium', 'shield'],
      weaponTraining: { categories: ['simple', 'martial'] },
      skillChoices: { count: 1, optionIds: RANGER_SKILLS },
    },
  },
  {
    classId: 'class-2014-rogue',
    prerequisite: { anyOf: [['dex']] },
    proficiencies: {
      ruleset: '5e-2014',
      armorTraining: ['light'],
      skillChoices: { count: 1, optionIds: ROGUE_SKILLS },
      toolProficiencies: ['thieves-tools'],
    },
  },
  {
    classId: 'class-2014-sorcerer',
    prerequisite: { anyOf: [['cha']] },
    // 原书：术士兼职条目的熟练项为「—」
    proficiencies: { ruleset: '5e-2014' },
  },
  {
    classId: 'class-2014-warlock',
    prerequisite: { anyOf: [['cha']] },
    proficiencies: {
      ruleset: '5e-2014',
      armorTraining: ['light'],
      weaponTraining: { categories: ['simple'] },
    },
  },
  {
    classId: 'class-2014-wizard',
    prerequisite: { anyOf: [['int']] },
    // 原书：法师兼职条目的熟练项为「—」
    proficiencies: { ruleset: '5e-2014' },
  },
  {
    classId: 'class-2014-artificer',
    prerequisite: { anyOf: [['int']] },
    proficiencies: {
      ruleset: '5e-2014',
      armorTraining: ['light', 'medium', 'shield'],
      toolProficiencies: ['thieves-tools'],
      toolChoices: { count: 1, optionIds: ARTISAN_TOOL_IDS },
    },
  },
]

/** 按职业 id 取兼职条目；未登记时返回 undefined（调用方给「先决条件待核验」提示，不推断）。 */
export function getMulticlassClassRule2014(classId: string): MulticlassClassRule2014 | undefined {
  return multiclassClasses2014.find((entry) => entry.classId === classId)
}

/** 兼职施法系数（2014）：full 全额、half 二分之一向下取整、third 三分之一向下取整。 */
export const multiclassCasterWeights2014: Readonly<Record<string, 'full' | 'half'>> = {
  'class-2014-bard': 'full',
  'class-2014-cleric': 'full',
  'class-2014-druid': 'full',
  'class-2014-sorcerer': 'full',
  'class-2014-wizard': 'full',
  'class-2014-paladin': 'half',
  'class-2014-ranger': 'half',
  'class-2014-artificer': 'half',
}

/** 1/3 施法子职（2014）：其职业等级 ÷3 向下取整计入施法等级。 */
export const multiclassThirdCasterSubclasses2014: readonly string[] = [
  'subclass-2014-fighter-eldritch-knight',
  'subclass-2014-rogue-arcane-trickster',
]
