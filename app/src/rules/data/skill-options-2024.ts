import type { RuleOption } from '@/types/rules'

const sourceIds = ['source-2024-phb'] as const

/**
 * 2024 共享技能选项表（18 项）。
 *
 * 技能 ID 与 2014 保持一致（`skill-*`），供各职业的技能检查点与专长候选引用；
 * 技能名与属性对应关系见 `derive.ts` 的 SKILL_IDS／skillAbilities。
 */
export const skillOptions2024: readonly RuleOption[] = [
  { id: 'skill-acrobatics', name: '特技', description: '敏捷相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-animal-handling', name: '驯兽', description: '感知相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-arcana', name: '奥秘', description: '智力相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-athletics', name: '运动', description: '力量相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-deception', name: '欺瞒', description: '魅力相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-history', name: '历史', description: '智力相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-insight', name: '洞悉', description: '感知相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-intimidation', name: '威吓', description: '魅力相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-investigation', name: '调查', description: '智力相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-medicine', name: '医药', description: '感知相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-nature', name: '自然', description: '智力相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-perception', name: '察觉', description: '感知相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-performance', name: '表演', description: '魅力相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-persuasion', name: '游说', description: '魅力相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-religion', name: '宗教', description: '智力相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-sleight-of-hand', name: '巧手', description: '敏捷相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-stealth', name: '隐匿', description: '敏捷相关技能。', status: 'implemented', sourceIds },
  { id: 'skill-survival', name: '生存', description: '感知相关技能。', status: 'implemented', sourceIds },
]
