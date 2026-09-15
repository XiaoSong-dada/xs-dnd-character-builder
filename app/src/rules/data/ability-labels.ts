import type { AbilityKey } from '@/types/character'

/**
 * 六项属性键与中文标签（叶子模块，B09-11）。
 * 派生标签、公式文案、法术头部与校验提示统一使用中文全称，不再使用 STR／DEX 等英文简写。
 */
export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const

export const ABILITY_LABELS: Readonly<Record<AbilityKey, string>> = {
  str: '力量',
  dex: '敏捷',
  con: '体质',
  int: '智力',
  wis: '感知',
  cha: '魅力',
}

/** 属性调整值标签（如“敏捷调整值”），用于派生来源与公式文案。 */
export function formatAbilityModifierLabel(ability: AbilityKey): string {
  return `${ABILITY_LABELS[ability]}调整值`
}
