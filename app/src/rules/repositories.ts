import { createRulesRepository } from '@/rules/repository-builder'
import { rulesRepository2014 } from '@/rules/repository'
import { classes2024 } from '@/rules/data/classes-2024'
import { sources2024 } from '@/rules/data/sources-2024'
import { subclassOptions2024, subclasses2024 } from '@/rules/data/subclasses-2024'
import { skillOptions2024 } from '@/rules/data/skill-options-2024'
import { barbarianOptions2024 } from '@/rules/data/barbarian-2024'
import { clericOptions2024 } from '@/rules/data/cleric-2024'
import { monkOptions2024 } from '@/rules/data/monk-2024'
import { equipmentWithPacks2024 } from '@/rules/data/equipment-packs-2024'
import { magicItems2024 } from '@/rules/data/magic-items-2024'
import { classStartingEquipment2024, backgroundStartingEquipment2024 } from '@/rules/data/starting-equipment-2024'
import { weaponMasteries2024 } from '@/rules/data/weapon-masteries-2024'
import { backgrounds2024, races2024 } from '@/rules/data/origins-2024'
import { speciesTraits2024 } from '@/rules/data/species-traits-2024'
import { abilityImprovementOptions2024, feats2024 } from '@/rules/data/feats-2024'
import { spellListOptions2024, speciesSpellAbilityOptions2024 } from '@/rules/data/spell-lists-2024'
import { spells2024 } from '@/rules/data/spells-2024'
import type { RulesetId } from '@/types/character'
import type { RulesRepository } from '@/types/rules'

export class UnsupportedRulesetError extends Error {
  constructor(value: unknown) {
    super(`不支持的规则版本：${typeof value === 'string' && value.length > 0 ? value : '未提供'}`)
    this.name = 'UnsupportedRulesetError'
  }
}

export const rulesRepository2024 = createRulesRepository('5e-2024', {
  sources: sources2024,
  classes: classes2024,
  subclasses: subclasses2024,
  races: races2024,
  backgrounds: backgrounds2024,
  raceFeatures: speciesTraits2024,
  backgroundFeatures: [],
  options: [...abilityImprovementOptions2024, ...spellListOptions2024, ...speciesSpellAbilityOptions2024, ...feats2024, ...skillOptions2024, ...subclassOptions2024, ...barbarianOptions2024, ...clericOptions2024, ...monkOptions2024],
  feats: feats2024,
  equipment: [...equipmentWithPacks2024, ...magicItems2024],
  classStartingEquipment: classStartingEquipment2024,
  backgroundStartingEquipment: backgroundStartingEquipment2024,
  spells: spells2024,
  weaponMasteries: weaponMasteries2024,
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
