import { createRulesRepository } from '@/rules/repository-builder'
import { rulesRepository2014 } from '@/rules/repository'
import { artificerOptions2024 } from '@/rules/data/ua-artificer-2024'
import { uaFrSubclassOptions2024 } from '@/rules/data/ua-fr-subclasses-2024'
import { uaSubclassUpdateOptions2024 } from '@/rules/data/ua-subclass-update-2024'
import { uaHorrorOptions2024 } from '@/rules/data/ua-horror-2024'
import { uaArcaneOptions2024 } from '@/rules/data/ua-arcane-subclasses-2024'
import { uaCataclysmOptions2024 } from '@/rules/data/ua-cataclysm-2024'
import { uaFeats2024 } from '@/rules/data/ua-feats-2024'
import { psionOptions2024 } from '@/rules/data/psion-2024'
import { psionSpells2024 } from '@/rules/data/psion-spells-2024'
import { uaMagicItems2024 } from '@/rules/data/ua-magic-items-2024'
import { uaSpells2024 } from '@/rules/data/ua-spells-2024'
import { classes2024 } from '@/rules/data/classes-2024'
import { sources2024 } from '@/rules/data/sources-2024'
import { subclassOptions2024, subclasses2024 } from '@/rules/data/subclasses-2024'
import { skillOptions2024 } from '@/rules/data/skill-options-2024'
import { barbarianOptions2024 } from '@/rules/data/barbarian-2024'
import { bardOptions2024 } from '@/rules/data/bard-2024'
import { clericOptions2024 } from '@/rules/data/cleric-2024'
import { druidOptions2024 } from '@/rules/data/druid-2024'
import { fighterOptions2024 } from '@/rules/data/fighter-2024'
import { monkOptions2024 } from '@/rules/data/monk-2024'
import { rangerOptions2024 } from '@/rules/data/ranger-2024'
import { sorcererOptions2024 } from '@/rules/data/sorcerer-2024'
import { warlockOptions2024 } from '@/rules/data/warlock-2024'
import { equipmentWithPacks2024 } from '@/rules/data/equipment-packs-2024'
import { magicItems2024 } from '@/rules/data/magic-items-2024'
import { classStartingEquipment2024, backgroundStartingEquipment2024 } from '@/rules/data/starting-equipment-2024'
import { weaponMasteries2024 } from '@/rules/data/weapon-masteries-2024'
import { backgrounds2024, races2024 } from '@/rules/data/origins-2024'
import { crookedMoonSpecies2024, valdasSpireSpecies2024 } from '@/rules/data/races-crooked-moon-2024'
import { speciesTraits2024 } from '@/rules/data/species-traits-2024'
import { abilityImprovementOptions2024, featChoiceOptions2024, feats2024 } from '@/rules/data/feats-2024'
import { thirdPartyOriginFeats2024 } from '@/rules/data/third-party-feats-2024'
import { faerunOriginFeats2024 } from '@/rules/data/feats-fr-2024'
import { arcanaUnleashedOriginFeats2024, damageResistanceOptions2024 } from '@/rules/data/feats-au-2024'
import { darkGiftCategoryNote2024, ravenloftDarkGiftFeats2024 } from '@/rules/data/feats-rthw-2024'
import { beyondDropsFeats2024, steinhardtOriginFeats2024, vtmOriginFeats2024 } from '@/rules/data/third-party-feats-g3-2024'
import { cthulhuTorchlightFeats2024 } from '@/rules/data/third-party-feats-cthulhu-torchlight-2024'
import { beyondDropsG3Feats2024 } from '@/rules/data/third-party-feats-beyond-drops-2024'
import { crookedMoonFeats2024 } from '@/rules/data/third-party-feats-crooked-moon-2024'
import { steinhardtGeneralFeats2024 } from '@/rules/data/third-party-feats-steinhardt-2024'
import { valdasSpireFeats2024 } from '@/rules/data/third-party-feats-valdas-spire-2024'
import { vtmBloodlineFeats2024, vtmEpicBoonFeats2024 } from '@/rules/data/third-party-feats-vtm-2024'
import { thirdPartyItems2024 } from '@/rules/data/third-party-items-2024'
import { spellListOptions2024, speciesSpellAbilityOptions2024 } from '@/rules/data/spell-lists-2024'
import { spells2024 } from '@/rules/data/spells-2024'
import { legacySpells2024 } from '@/rules/data/generated/spells-2024-legacy'
import type { RulesetId } from '@/types/character'
import type { RulesRepository } from '@/types/rules'

export class UnsupportedRulesetError extends Error {
  constructor(value: unknown) {
    super(`不支持的规则版本：${typeof value === 'string' && value.length > 0 ? value : '未提供'}`)
    this.name = 'UnsupportedRulesetError'
  }
}

/** 2024 全部法术（PHB 2024 + UA + 旧扩展镜像）；职业法表按 classIds 合并，来源开关在候选池阶段过滤。 */
const allSpells2024 = [...spells2024, ...uaSpells2024, ...psionSpells2024, ...legacySpells2024]

const classes2024WithSpellPools = classes2024.map((classRule) => classRule.spellcasting
  ? {
      ...classRule,
      spellcasting: {
        ...classRule.spellcasting,
        classSpellIds: [...new Set([
          ...classRule.spellcasting.classSpellIds,
          ...allSpells2024.filter((spell) => spell.classIds.includes(classRule.id)).map((spell) => spell.id),
        ])],
      },
    }
  : classRule)
export const rulesRepository2024 = createRulesRepository('5e-2024', {
  sources: sources2024,
  classes: classes2024WithSpellPools,
  subclasses: subclasses2024,
  races: [...races2024, ...crookedMoonSpecies2024, ...valdasSpireSpecies2024],
  backgrounds: backgrounds2024,
  raceFeatures: speciesTraits2024,
  backgroundFeatures: [],
  options: [...abilityImprovementOptions2024, ...featChoiceOptions2024, ...spellListOptions2024, ...speciesSpellAbilityOptions2024, ...damageResistanceOptions2024, ...[darkGiftCategoryNote2024], ...feats2024, ...skillOptions2024, ...subclassOptions2024, ...barbarianOptions2024, ...bardOptions2024, ...clericOptions2024, ...druidOptions2024, ...fighterOptions2024, ...monkOptions2024, ...rangerOptions2024, ...sorcererOptions2024, ...warlockOptions2024, ...artificerOptions2024, ...uaFrSubclassOptions2024, ...uaSubclassUpdateOptions2024, ...uaHorrorOptions2024, ...uaArcaneOptions2024, ...uaCataclysmOptions2024, ...psionOptions2024],
  feats: [
    ...feats2024,
    ...uaFeats2024,
    ...faerunOriginFeats2024,
    ...arcanaUnleashedOriginFeats2024,
    ...ravenloftDarkGiftFeats2024,
    ...vtmOriginFeats2024,
    ...steinhardtOriginFeats2024,
    ...beyondDropsFeats2024,
    ...thirdPartyOriginFeats2024,
    // G3-I4：第三方专长逐书并入（来源默认关闭）
    ...cthulhuTorchlightFeats2024,
    ...crookedMoonFeats2024,
    ...steinhardtGeneralFeats2024,
    ...beyondDropsG3Feats2024,
    ...valdasSpireFeats2024,
    ...vtmBloodlineFeats2024,
    ...vtmEpicBoonFeats2024,
  ],
  equipment: [...equipmentWithPacks2024, ...magicItems2024, ...uaMagicItems2024, ...thirdPartyItems2024],
  classStartingEquipment: classStartingEquipment2024,
  backgroundStartingEquipment: backgroundStartingEquipment2024,
  spells: [...spells2024, ...uaSpells2024, ...psionSpells2024, ...legacySpells2024],
  weaponMasteries: weaponMasteries2024,
})

const repositories: Readonly<Record<RulesetId, RulesRepository>> = {
  '5e-2014': rulesRepository2014,
  '5e-2024': rulesRepository2024,
}

export function isRulesetId(value: unknown): value is RulesetId {
  return value === '5e-2014' || value === '5e-2024'
}

/** 已开放的规则版本：2024 车卡流程自 B09-01 起可用；资源结算（B10）与导出承载（B11）尚未完成，按 B00-06 继续分批推进。 */
export const OPEN_RULESETS: readonly RulesetId[] = ['5e-2014', '5e-2024']

export function isRulesetOpen(value: unknown): value is RulesetId {
  return isRulesetId(value) && OPEN_RULESETS.includes(value)
}

/** 外部输入必须经过此入口解析；缺失或未知版本不会回退到 2014。 */
export function getRulesRepository(ruleset: unknown): RulesRepository {
  if (!isRulesetId(ruleset)) throw new UnsupportedRulesetError(ruleset)
  return repositories[ruleset]
}
