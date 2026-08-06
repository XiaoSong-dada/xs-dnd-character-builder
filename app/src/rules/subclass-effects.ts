/**
 * 子职派生效果（纵向切片）。
 *
 * 子职特性对派生数值（HP、AC、攻击、伤害、法术攻击、法术 DC、速度）的影响
 * 统一从这里读取。当前批次登记的子职特性均为 `index-only`（未经官方文本核验），
 * 因此返回零效果；待具体效果核验为 `implemented` 后，在
 * `rules/data/subclass-features-2014.ts` 登记来源并在此返回对应数值。
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

export function getSubclassDerivedEffects(subclassId: string | undefined): SubclassDerivedEffects {
  if (!subclassId) return ZERO_SUBCLASS_EFFECTS
  // 本批次所有子职特性均为 index-only，未核验效果不参与自动计算。
  return ZERO_SUBCLASS_EFFECTS
}
