import type { FeatRule } from '@/types/rules'

/**
 * G3-I4：Beyond Drops 26.7（第三方·试行内容）2024 版式专长 4 条。
 *
 * 来源 ID `source-2024-tp-beyond-drops`；第三方合作内容，来源默认关闭、需 DM 同意。
 *
 * 登记口径：
 * - 战斗风格 2 条（集群战斗、俯卧战斗），通用 2 条（移形斗士、战术斗士）；
 * - 同书 26.5 的 5 条与 26.8 节条目已由其他模块登记，本模块不重复登记；
 * - 中英文名与全部增益项取自 CHM v2026.09.13 26.7 节原文，`detail` 为原创中文转述；
 * - 战斗风格先决按项目既有口径登记为 `requiredCapability: 'fighting-style'`；
 *   武器精通类先决在 `FeatPrerequisite` 中无对应取值，故只写入 `detail`，不强行映射；
 * - Beyond Drops 为线上试行内容，条目状态 `selectable` 并标注试行，需 DM 同意后使用。
 */
const beyondDrops = ['source-2024-tp-beyond-drops'] as const
const fightingStylePrerequisite = { requiredCapability: 'fighting-style' } as const
const generalPrerequisite = { minimumLevel: 4 } as const

const beyondDropsFeat = (
  slug: string,
  name: string,
  englishName: string,
  category: 'fighting-style' | 'general',
  description: string,
  detail: string,
  prerequisite?: FeatRule['prerequisite'],
): FeatRule => ({
  id: `feat-2024-tp-bd-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  description,
  detail,
  tags: [category === 'fighting-style' ? '战斗风格' : '通用'],
  category,
  status: 'selectable',
  sourceIds: beyondDrops,
  ...(prerequisite ? { prerequisite } : {}),
})

export const beyondDropsG3Feats2024: readonly FeatRule[] = [
  beyondDropsFeat('pack-fighting', '集群战斗', 'Pack Fighting', 'fighting-style',
    '盟友近身夹击时提升近战伤害。',
    '战斗风格专长（先决：战斗风格特性）。你以武器或徒手打击发动近战攻击时，若目标 5 尺内存在至少一名未失能的你的盟友，你的伤害掷骰获得 +1 加值；若其中至少一名盟友也具有本专长且未失能，该加值提升为 +2。加值只取一档，不叠加，且无次数限制。试行内容（Beyond Drops 26.7），需 DM 同意。',
    fightingStylePrerequisite),
  beyondDropsFeat('prone-fighting', '俯卧战斗', 'Prone Fighting', 'fighting-style',
    '倒地不再带来攻击劣势与受击优势。',
    '战斗风格专长（先决：战斗风格特性）。你处于倒地状态期间，不会因倒地而在攻击检定上具有劣势，倒地状态也不会为对你发动的攻击检定提供优势；其余倒地规则（如仅能爬行、起身消耗移动力）照常生效。此为常驻效果，无次数与恢复限制。试行内容（Beyond Drops 26.7），需 DM 同意。',
    fightingStylePrerequisite),
  beyondDropsFeat('shifting-combatant', '移形斗士', 'Shifting Combatant', 'general',
    '推动敌人相撞并借飞跃取得掩护。',
    '通用专长（先决：等级 4+，且具有武器精通特性；武器精通在项目先决结构中无对应字段，故只登记等级，武器精通要求见本说明）。属性值提升：力量或敏捷 +1，至多 20。多米诺冲击：以武器命中并触发推离精通词条把目标推入他人空间时，可迫使双方相撞，各自进行一次敏捷豁免（DC = 8 + 本专长提升属性的调整值 + 熟练加值），失败则倒地。无畏飞跃：跳远前先移动至少 10 尺且落点在两名以上敌人 5 尺内时，直至你的下个回合开始，对你发动的攻击检定具有劣势。试行内容（Beyond Drops 26.7），需 DM 同意。',
    generalPrerequisite),
  beyondDropsFeat('tactical-combatant', '战术斗士', 'Tactical Combatant', 'general',
    '命中换取临时生命，并为属性检定补骰。',
    '通用专长（先决：等级 4+，力量或敏捷 13+）。属性值提升：力量或敏捷 +1，至多 20。缓冲打击：以武器命中一名生物时，你获得等于该次武器伤害骰骰值总和的临时生命值。百炼直觉：当你的属性检定失败时，可掷 1d6 并将骰值加到该检定上，可能使其变为成功。两项增益一经使用，直至你投掷先攻或完成短休或长休都无法再次使用。试行内容（Beyond Drops 26.7），需 DM 同意。',
    { minimumLevel: 4, abilityMinimum: { anyOf: ['str', 'dex'], score: 13 } }),
]
