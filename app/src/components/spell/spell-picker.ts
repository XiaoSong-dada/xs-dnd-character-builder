import type { SpellRule } from '@/types/rules'

export const SPELL_LEVEL_ALL = 'all'
export const SPELL_SCHOOL_ALL = 'all'

export interface SpellLevelTab {
  readonly id: string
  readonly label: string
}

export interface SpellFilters {
  readonly query?: string
  readonly level?: string
  readonly school?: string
}

export function isSpellArchived(spell: Pick<SpellRule, 'status'>): boolean {
  return spell.status === 'unavailable'
}

export function spellMetaLabel(
  spell: Pick<SpellRule, 'level' | 'school' | 'englishName' | 'ritual'>,
): string {
  const parts = [spell.level === 0 ? '戏法' : `${spell.level} 环`]
  if (spell.school) {
    parts.push(spell.school)
  }
  if (spell.englishName) {
    parts.push(spell.englishName)
  }
  if (spell.ritual) {
    parts.push('仪式')
  }
  return parts.join(' · ')
}

export function buildSpellLevelTabs(spells: readonly SpellRule[]): readonly SpellLevelTab[] {
  const levels = [...new Set(spells.map((spell) => spell.level))].sort((left, right) => left - right)
  return [
    { id: SPELL_LEVEL_ALL, label: '全部' },
    ...levels.map((level) => ({
      id: String(level),
      label: level === 0 ? '戏法' : `${level} 环`,
    })),
  ]
}

export function sortSpells(spells: readonly SpellRule[]): readonly SpellRule[] {
  return [...spells].sort(
    (left, right) =>
      left.level - right.level ||
      left.name.localeCompare(right.name, 'zh-CN') ||
      left.id.localeCompare(right.id),
  )
}

export function filterSpells(
  spells: readonly SpellRule[],
  filters: SpellFilters,
): readonly SpellRule[] {
  const query = filters.query?.trim().toLowerCase() ?? ''
  const level = parseLevelFilter(filters.level)
  const school = filters.school && filters.school !== SPELL_SCHOOL_ALL ? filters.school : undefined

  return spells.filter((spell) => {
    if (level !== undefined && spell.level !== level) {
      return false
    }
    if (school !== undefined && spell.school !== school) {
      return false
    }
    if (!query) {
      return true
    }
    return [spell.name, spell.englishName, spell.id].some((value) =>
      value?.toLowerCase().includes(query),
    )
  })
}

function parseLevelFilter(value: string | undefined): number | undefined {
  if (!value || value === SPELL_LEVEL_ALL) {
    return undefined
  }
  const level = Number(value)
  return Number.isInteger(level) ? level : undefined
}
