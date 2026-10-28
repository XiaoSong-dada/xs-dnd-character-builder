import { SKILL_IDS } from '@/rules/data/skill-ids'

/** 18 项技能中文名（2014 与 2024 口径一致，内容工坊表单直接使用）。 */
export const SKILL_LABELS: Readonly<Record<string, string>> = {
  'skill-acrobatics': '特技',
  'skill-animal-handling': '驯兽',
  'skill-arcana': '奥秘',
  'skill-athletics': '运动',
  'skill-deception': '欺瞒',
  'skill-history': '历史',
  'skill-insight': '洞悉',
  'skill-intimidation': '威吓',
  'skill-investigation': '调查',
  'skill-medicine': '医药',
  'skill-nature': '自然',
  'skill-perception': '察觉',
  'skill-performance': '表演',
  'skill-persuasion': '游说',
  'skill-religion': '宗教',
  'skill-sleight-of-hand': '巧手',
  'skill-stealth': '隐匿',
  'skill-survival': '求生',
}

export interface SkillOption {
  readonly id: string
  readonly label: string
}

export const SKILL_OPTIONS: readonly SkillOption[] = SKILL_IDS.map((id) => ({
  id,
  label: SKILL_LABELS[id] ?? id,
}))

/** 常见伤害类型（种族抗性展示用；允许其它类型时直接在表单里选择这几项）。 */
export const DAMAGE_TYPE_OPTIONS: readonly string[] = [
  '强酸', '冷冻', '火焰', '闪电', '雷鸣', '毒素', '光耀', '死灵', '心灵', '力场', '穿刺', '钝击', '挥砍',
]

/** 常见语言（种族固定语言展示用）。 */
export const LANGUAGE_OPTIONS: readonly string[] = [
  '通用语', '精灵语', '矮人语', '地精语', '兽人语', '龙语', '地底通用语', '天界语', '深渊语', '炼狱语', '原初语', '深潜语',
]

export function skillLabel(skillId: string): string {
  return SKILL_LABELS[skillId] ?? skillId
}
