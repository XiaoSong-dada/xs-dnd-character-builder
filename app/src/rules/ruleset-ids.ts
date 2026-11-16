import type { RulesetId } from '@/types/character'

export function isRulesetId(value: unknown): value is RulesetId {
  return value === '5e-2014' || value === '5e-2024'
}

/** 已开放的规则版本：2024 车卡流程自 B09-01 起可用；资源结算（B10）与导出承载（B11）尚未完成，按 B00-06 继续分批推进。 */
export const OPEN_RULESETS: readonly RulesetId[] = ['5e-2014', '5e-2024']

export function isRulesetOpen(value: unknown): value is RulesetId {
  return isRulesetId(value) && OPEN_RULESETS.includes(value)
}
