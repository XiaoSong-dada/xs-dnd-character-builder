import type { MulticlassProficiencyGrant } from '@/types/rules'

/**
 * 2024 兼职熟练项登记（MC-D06 数据部分，MC-B02 消费）。
 *
 * 依据《5e 不全书》各职业「作为兼职角色 As a Multiclass Character」条目（需求 §2.6 的 2024 栏）：
 * 2024 侧没有独立的兼职熟练项总表，兼职获得的熟练直接写在各职业条目中，
 * **只包含生命骰与护甲／武器受训，不含任何豁免熟练**（官方 2025 裁定）。
 *
 * 逐条来源（文件名 `玩家手册2024_角色职业_<职业>_<职业>.md` 的「作为兼职角色」行）：
 * 野蛮人:50、吟游诗人:54-56、牧师:50-52、德鲁伊:52、战士:47-49、武僧:53-55、圣武士:50、
 * 游侠:49-51、游荡者:54-56、术士:50、魔契师:48-50、法师:51；UA 奇械师见 `ua-artificer-2024.ts`。
 */

const BARD_SKILLS_2024: readonly string[] = [
  'skill-acrobatics', 'skill-animal-handling', 'skill-arcana', 'skill-athletics', 'skill-deception',
  'skill-history', 'skill-insight', 'skill-intimidation', 'skill-investigation', 'skill-medicine',
  'skill-nature', 'skill-perception', 'skill-performance', 'skill-persuasion', 'skill-religion',
  'skill-sleight-of-hand', 'skill-stealth', 'skill-survival',
]

const RANGER_SKILLS_2024: readonly string[] = [
  'skill-animal-handling', 'skill-athletics', 'skill-insight', 'skill-investigation',
  'skill-nature', 'skill-perception', 'skill-stealth', 'skill-survival',
]

const ROGUE_SKILLS_2024: readonly string[] = [
  'skill-acrobatics', 'skill-athletics', 'skill-deception', 'skill-insight', 'skill-intimidation',
  'skill-investigation', 'skill-perception', 'skill-sleight-of-hand', 'skill-stealth', 'skill-persuasion',
]

export const multiclassProficiencyGrants2024: Readonly<Record<string, MulticlassProficiencyGrant>> = {
  // 生命值骰、军用武器熟练、轻甲/中甲/盾牌的护甲受训
  'class-2024-barbarian': { ruleset: '5e-2024', armorTraining: ['light', 'medium', 'shield'], weaponTraining: { categories: ['martial'] } },
  // 生命值骰、任选一项技能熟练、任选一项乐器熟练、轻甲
  'class-2024-bard': { ruleset: '5e-2024', armorTraining: ['light'], skillChoices: { count: 1, optionIds: BARD_SKILLS_2024 }, toolChoices: { count: 1, optionIds: ['tool-musical-instrument'] } },
  // 生命值骰、轻甲/中甲/盾牌的护甲受训
  'class-2024-cleric': { ruleset: '5e-2024', armorTraining: ['light', 'medium', 'shield'] },
  'class-2024-druid': { ruleset: '5e-2024', armorTraining: ['light', 'medium', 'shield'] },
  // 生命值骰、军用武器熟练、轻甲/中甲/盾牌的护甲受训
  'class-2024-fighter': { ruleset: '5e-2024', armorTraining: ['light', 'medium', 'shield'], weaponTraining: { categories: ['martial'] } },
  // 仅生命值骰
  'class-2024-monk': { ruleset: '5e-2024' },
  // 生命值骰、军用武器熟练、轻甲/中甲/盾牌的护甲受训
  'class-2024-paladin': { ruleset: '5e-2024', armorTraining: ['light', 'medium', 'shield'], weaponTraining: { categories: ['martial'] } },
  // 生命值骰、军用武器熟练、任选一项游侠技能熟练、轻甲/中甲/盾牌的护甲受训
  'class-2024-ranger': { ruleset: '5e-2024', armorTraining: ['light', 'medium', 'shield'], weaponTraining: { categories: ['martial'] }, skillChoices: { count: 1, optionIds: RANGER_SKILLS_2024 } },
  // 生命值骰、任选一项游荡者技能熟练、盗贼工具熟练、轻甲
  'class-2024-rogue': { ruleset: '5e-2024', armorTraining: ['light'], skillChoices: { count: 1, optionIds: ROGUE_SKILLS_2024 }, toolProficiencies: ['tool-thieves-tools'] },
  // 仅生命值骰
  'class-2024-sorcerer': { ruleset: '5e-2024' },
  // 生命值骰、轻甲
  'class-2024-warlock': { ruleset: '5e-2024', armorTraining: ['light'] },
  // 仅生命值骰
  'class-2024-wizard': { ruleset: '5e-2024' },
  // UA 奇械师（2024 版式）：生命值骰、轻甲/中甲/盾牌、盗贼工具、工匠工具
  'class-2024-ua-artificer': { ruleset: '5e-2024', armorTraining: ['light', 'medium', 'shield'], toolProficiencies: ['tool-thieves-tools'], toolChoices: { count: 1, optionIds: ['tool-artisans-tools'] } },
  // UA 灵能使：生命值骰（含 1 级特性，无额外受训）
  'class-2024-ua-psion': { ruleset: '5e-2024' },
}

export function getMulticlassProficiencyGrant2024(classId: string): MulticlassProficiencyGrant | undefined {
  return multiclassProficiencyGrants2024[classId]
}

/** 兼职施法系数（2024）：半施法者按 D1 决策「除以 2 向下取整」。 */
export const multiclassCasterWeights2024: Readonly<Record<string, 'full' | 'half'>> = {
  'class-2024-bard': 'full',
  'class-2024-cleric': 'full',
  'class-2024-druid': 'full',
  'class-2024-sorcerer': 'full',
  'class-2024-wizard': 'full',
  'class-2024-paladin': 'half',
  'class-2024-ranger': 'half',
  'class-2024-ua-artificer': 'half',
}

/** 1/3 施法子职（2024）：其职业等级 ÷3 向下取整计入施法等级。 */
export const multiclassThirdCasterSubclasses2024: readonly string[] = [
  'subclass-2024-fighter-eldritch-knight',
  'subclass-2024-rogue-arcane-trickster',
]
