/**
 * 子职派生效果（纵向切片）。
 *
 * 子职特性对派生数值（HP、AC、攻击、伤害、法术攻击、法术 DC、速度）的影响
 * 统一从这里读取。只对"可核验、来源明确"的条目返回效果；570 条 `index-only`
 * 特性保持零效果，不参与自动计算（遵守内容与版权约定）。
 *
 * 本模块保持框架无关、无副作用：不读取 DOM、路由或存储。
 */
export interface SubclassDerivedEffects {
  readonly hitPointBonus: number
  readonly armorClassBonus: number
  readonly attackBonus: number
  readonly damageBonus: number
  readonly spellAttackBonus: number
  readonly spellSaveDcBonus: number
  readonly speedBonus: number
  /** 子职未着甲时的基础护甲公式（如龙族体魄的 13 + 敏捷调整值）；undefined 表示不覆盖默认公式。 */
  readonly armorClassBase?: number
}

export const ZERO_SUBCLASS_EFFECTS: SubclassDerivedEffects = {
  hitPointBonus: 0,
  armorClassBonus: 0,
  attackBonus: 0,
  damageBonus: 0,
  spellAttackBonus: 0,
  spellSaveDcBonus: 0,
  speedBonus: 0,
}

/**
 * 按子职返回派生效果。targetLevel 用于按等级的加成（如龙族体魄每级 +1 生命值）。
 * 新条目只有在官方文本核验通过后登记（`status: 'implemented'` 的子职特性）。
 */
export function getSubclassDerivedEffects(subclassId: string | undefined, targetLevel = 1): SubclassDerivedEffects {
  if (!subclassId) return ZERO_SUBCLASS_EFFECTS
  switch (subclassId) {
    case 'subclass-2014-sorcerer-draconic-bloodline':
      // 龙族体魄（PHB 2014 / SRD 5.1）：未着甲时基础护甲 13 + 敏捷调整值；每个术士等级 +1 生命值。
      return { ...ZERO_SUBCLASS_EFFECTS, armorClassBase: 13, hitPointBonus: targetLevel }
    default:
      return ZERO_SUBCLASS_EFFECTS
  }
}
