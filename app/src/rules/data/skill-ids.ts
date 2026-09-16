/**
 * 全部 18 项技能 ID（2014 与 2024 通用）。
 * 独立成叶子模块：供起源完成判定等纯规则函数复用，避免依赖 derive（derive → origins 存在依赖方向）。
 */
export const SKILL_IDS: readonly string[] = [
  'skill-acrobatics',
  'skill-animal-handling',
  'skill-arcana',
  'skill-athletics',
  'skill-deception',
  'skill-history',
  'skill-insight',
  'skill-intimidation',
  'skill-investigation',
  'skill-medicine',
  'skill-nature',
  'skill-perception',
  'skill-performance',
  'skill-persuasion',
  'skill-religion',
  'skill-sleight-of-hand',
  'skill-stealth',
  'skill-survival',
]
