import type { DraftStep } from '@/types/character'

/** 车卡步骤顺序（含最终检查与角色卡）。 */
export const STEP_ORDER: readonly DraftStep[] = ['setup', 'sources', 'class', 'origin', 'abilities', 'timeline', 'equipment', 'spells', 'identity', 'validation', 'sheet']

/** 车卡步骤友好文案（eyebrow：步骤徽标；title：步骤标题）。首页角色条与车卡流程步骤头共用。 */
export const STEP_META: Record<DraftStep, { eyebrow: string; title: string }> = {
  setup: { eyebrow: '第1步', title: '先确定冒险规模' },
  sources: { eyebrow: '第2步', title: '选择本次使用的扩展书' },
  class: { eyebrow: '第3步', title: '选择职业' },
  origin: { eyebrow: '第4步', title: '确定角色起源' },
  abilities: { eyebrow: '第5步', title: '分配六项属性' },
  timeline: { eyebrow: '第6步', title: '完成等级时间线' },
  equipment: { eyebrow: '第7步', title: '选择并装备物品' },
  spells: { eyebrow: '第8步', title: '配置职业法术' },
  identity: { eyebrow: '第9步', title: '让角色成为一个人' },
  validation: { eyebrow: '最终检查', title: '规则校验' },
  sheet: { eyebrow: '角色完成', title: '角色卡' },
}
