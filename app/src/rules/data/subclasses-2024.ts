import type { RuleOption, SubclassRule } from '@/types/rules'
import { uaSubclassUpdate2024 } from '@/rules/data/ua-subclass-update-2024'
import { uaHorrorSubclasses2024 } from '@/rules/data/ua-horror-2024'
import { psionSubclasses2024 } from '@/rules/data/psion-2024'
import { cthulhuTorchlightSubclasses2024 } from '@/rules/data/third-party-subclasses-cthulhu-torchlight-2024'
import { valdasSpireSubclasses2024 } from '@/rules/data/third-party-subclasses-valdas-spire-2024'
import { floralDragonsSubclasses2024 } from '@/rules/data/third-party-subclasses-floral-dragons-2024'
import { steinhardtSubclasses2024 } from '@/rules/data/third-party-subclasses-steinhardt-2024'
import { crookedMoonSubclasses2024 } from '@/rules/data/third-party-subclasses-crooked-moon-2024'
import { uaArcaneSubclasses2024 } from '@/rules/data/ua-arcane-subclasses-2024'
import { uaCataclysmSubclasses2024 } from '@/rules/data/ua-cataclysm-2024'
import { uaFrSubclasses2024 } from '@/rules/data/ua-fr-subclasses-2024'
import { artificerSubclasses2024 } from '@/rules/data/ua-artificer-2024'
import { barbarianSubclasses2024 } from '@/rules/data/barbarian-2024'
import { bardSubclasses2024 } from '@/rules/data/bard-2024'
import { clericSubclasses2024 } from '@/rules/data/cleric-2024'
import { druidSubclasses2024 } from '@/rules/data/druid-2024'
import { fighterSubclasses2024 } from '@/rules/data/fighter-2024'
import { monkSubclasses2024 } from '@/rules/data/monk-2024'
import { paladinSubclasses2024 } from '@/rules/data/paladin-2024'
import { rangerSubclasses2024 } from '@/rules/data/ranger-2024'
import { rogueSubclasses2024 } from '@/rules/data/rogue-2024'
import { sorcererSubclasses2024 } from '@/rules/data/sorcerer-2024'
import { warlockSubclasses2024 } from '@/rules/data/warlock-2024'
import { wizardSubclasses2024 } from '@/rules/data/wizard-2024'

/** 2024 子职装配列表：核心子职 + 破解奥秘（UA）子职 + 第三方合作子职（G3-I2）；按批次逐批追加。 */
export const subclasses2024: readonly SubclassRule[] = [
  ...barbarianSubclasses2024,
  ...bardSubclasses2024,
  ...clericSubclasses2024,
  ...druidSubclasses2024,
  ...fighterSubclasses2024,
  ...monkSubclasses2024,
  ...paladinSubclasses2024,
  ...rangerSubclasses2024,
  ...rogueSubclasses2024,
  ...sorcererSubclasses2024,
  ...warlockSubclasses2024,
  ...wizardSubclasses2024,
  ...artificerSubclasses2024,
  ...uaFrSubclasses2024,
  ...uaSubclassUpdate2024,
  ...uaHorrorSubclasses2024,
  ...uaArcaneSubclasses2024,
  ...uaCataclysmSubclasses2024,
  ...psionSubclasses2024,
  ...cthulhuTorchlightSubclasses2024,
  ...valdasSpireSubclasses2024,
  ...floralDragonsSubclasses2024,
  ...steinhardtSubclasses2024,
  ...crookedMoonSubclasses2024,
]

/**
 * 第三方来源书名（G3-I2 起）：第三方子职在候选卡片里需要显示出自哪本合作书，
 * 与 2014 侧 `subclasses-2014.ts` 的 `sourceTitles` 口径一致。
 * 官方核心与 UA 来源不在此表内，其描述保持原有写法。
 */
const thirdPartySourceTitles: Readonly<Record<string, string>> = {
  'source-2024-tp-crooked-moon': '《歪曲之月》(第三方)',
  'source-2024-tp-valdas-spire': '《瓦尔达的秘密尖塔》(第三方)',
  'source-2024-tp-floral-dragons': '《花卉龙博考》(第三方)',
  'source-2024-tp-cthulhu-torchlight': '《火炬光下的克苏鲁》(第三方)',
  'source-2024-tp-steinhardt': '《斯坦哈德的诡怖猎杀指南》(第三方)',
  'source-2024-tp-vtm': '《吸血鬼：避世潜藏》(第三方)',
  'source-2024-tp-beyond-drops': '《Beyond Drops》(第三方·试行内容)',
  'source-2024-tp-drakkenheim': '《德拉肯海姆》(第三方)',
}

/** 子职选项投影：供时间线候选显示与来源过滤解析。 */
export const subclassOptions2024: readonly RuleOption[] = subclasses2024.map((subclass) => {
  const thirdPartyTitle = subclass.sourceIds.map((id) => thirdPartySourceTitles[id]).find(Boolean)
  return {
    id: subclass.id,
    name: subclass.name,
    englishName: subclass.englishName,
    description: thirdPartyTitle
      ? `${subclass.englishName} · ${thirdPartyTitle} · ${subclass.summary}`
      : `${subclass.englishName} · ${subclass.summary}`,
    status: subclass.status,
    sourceIds: subclass.sourceIds,
  }
})
