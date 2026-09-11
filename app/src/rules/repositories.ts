import { createRulesRepository } from '@/rules/repository-builder'
import { rulesRepository2014 } from '@/rules/repository'
import {
  backgrounds2024Sample,
  classes2024Sample,
  equipment2024Sample,
  feats2024Sample,
  races2024Sample,
  sources2024Sample,
  spells2024Sample,
  subclasses2024Sample,
} from '@/rules/data/rules-2024-sample'
import type { RulesetId } from '@/types/character'
import type { RulesRepository } from '@/types/rules'

export class UnsupportedRulesetError extends Error {
  constructor(value: unknown) {
    super(`不支持的规则版本：${typeof value === 'string' && value.length > 0 ? value : '未提供'}`)
    this.name = 'UnsupportedRulesetError'
  }
}

export const rulesRepository2024 = createRulesRepository('5e-2024', {
  sources: sources2024Sample,
  classes: classes2024Sample,
  subclasses: subclasses2024Sample,
  races: races2024Sample,
  backgrounds: backgrounds2024Sample,
  options: [],
  feats: feats2024Sample,
  equipment: equipment2024Sample,
  classStartingEquipment: [],
  backgroundStartingEquipment: [],
  spells: spells2024Sample,
})

const repositories: Readonly<Record<RulesetId, RulesRepository>> = {
  '5e-2014': rulesRepository2014,
  '5e-2024': rulesRepository2024,
}

export function isRulesetId(value: unknown): value is RulesetId {
  return value === '5e-2014' || value === '5e-2024'
}

/** 已通过产品验收、允许进入用户流程的规则版本；按 B00-06 分批开放，后续批次扩展。 */
export const OPEN_RULESETS: readonly RulesetId[] = ['5e-2014']

export function isRulesetOpen(value: unknown): value is RulesetId {
  return isRulesetId(value) && OPEN_RULESETS.includes(value)
}

/** 外部输入必须经过此入口解析；缺失或未知版本不会回退到 2014。 */
export function getRulesRepository(ruleset: unknown): RulesRepository {
  if (!isRulesetId(ruleset)) throw new UnsupportedRulesetError(ruleset)
  return repositories[ruleset]
}
