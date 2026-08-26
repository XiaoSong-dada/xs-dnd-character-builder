import type { SpellRule } from '@/types/rules'

/** 统一生成法术列表副标题；仪式标记始终紧跟英文名。 */
export function formatSpellLabel(spell: Pick<SpellRule, 'englishName' | 'level' | 'ritual'>): string {
  return `${spell.level}环 · ${spell.englishName}${spell.ritual ? ' · 仪式' : ''}`
}
