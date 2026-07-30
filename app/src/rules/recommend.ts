import type { BackgroundRule, ClassRule, RaceRule } from '@/types/rules'

const preferenceAbilities: Readonly<Record<string, readonly string[]>> = {
  melee: ['str', 'dex'],
  ranged: ['dex'],
  spellcasting: ['int', 'wis', 'cha'],
  support: ['wis', 'cha'],
  durable: ['str', 'con'],
  control: ['int', 'wis', 'cha'],
}

export function getClassRecommendation(classRule: ClassRule, preferences: readonly string[]): { score: number; reason: string } {
  const matches = preferences.filter((preference) =>
    preferenceAbilities[preference]?.some((ability) => classRule.primaryAbilities.includes(ability)),
  )
  const score = Math.min(99, 60 + matches.length * 12 + (classRule.status === 'implemented' ? 8 : 0))
  const reason = matches.length ? `匹配${matches.length}项玩法偏好` : '可自由选择'
  return { score, reason }
}

export function getRaceRecommendationReason(race: RaceRule, classId?: string): string | undefined {
  if (!classId || !race.recommendedClassIds.includes(classId)) return undefined
  if (classId === 'class-2014-fighter') {
    const bonuses = race.fixedAbilityBonuses
    if (bonuses.str) return '力量加值适合近战战士'
    if (bonuses.dex) return '敏捷加值适合灵巧或远程战士'
    if (bonuses.con) return '体质加值有助于前排生存'
  }
  return '属性与种族能力契合该职业'
}

export function getBackgroundRecommendationReason(background: BackgroundRule, classId?: string): string | undefined {
  if (!classId || !background.recommendedClassIds.includes(classId)) return undefined
  if (classId === 'class-2014-fighter' && background.skillIds.includes('skill-athletics')) {
    return '运动技能与前排玩法契合'
  }
  return '技能与职业常见玩法契合'
}
