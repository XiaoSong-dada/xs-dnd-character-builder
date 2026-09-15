import type { ClassResource, DicePoolRule } from '@/types/rules'

const RECOVERY_LABELS: Readonly<Record<ClassResource['recovery'], string>> = {
  'short-rest': '短休恢复',
  'long-rest': '长休恢复',
  none: '无次数限制',
  special: '特殊恢复',
}

/**
 * 资源上限：属性型资源（如诗人激励＝魅力调整值）按 `maxFromAbility` 计算，
 * 其余按等级表；越界等级按最近端点处理，未获得时返回 0。
 */
export function getResourceMax(resource: ClassResource, level: number, abilityModifier = 0): number {
  if (resource.maxFromAbility) return Math.max(resource.maxFromAbility.minimum, abilityModifier)
  if (!resource.maxByLevel?.length) return 0
  const index = Math.min(Math.max(1, Math.trunc(level)), resource.maxByLevel.length) - 1
  return Math.max(0, resource.maxByLevel[index] ?? 0)
}

/** 资源展示文本：`2 次 · 短休恢复`（单位缺省为“次”）；上限为 0 时返回空串。 */
export function formatResourceText(resource: ClassResource, level: number, abilityModifier = 0): string {
  const max = getResourceMax(resource, level, abilityModifier)
  if (max <= 0) return ''
  return `${max} ${resource.unit ?? '次'} · ${RECOVERY_LABELS[resource.recovery]}`
}

/** 按角色等级取骰池骰数；越界等级按最近端点处理。 */
export function getDicePoolCount(pool: DicePoolRule, level: number): number {
  if (pool.diceByLevel.length === 0) return 0
  const index = Math.min(Math.max(1, Math.trunc(level)), pool.diceByLevel.length) - 1
  return Math.max(0, pool.diceByLevel[index] ?? 0)
}

/** 按角色等级取骰池骰面：固定 `die` 优先，否则读 `dieByLevel`；未获得时返回空串。 */
export function getDicePoolDie(pool: DicePoolRule, level: number): string {
  if (pool.die) return pool.die
  if (!pool.dieByLevel?.length) return ''
  const index = Math.min(Math.max(1, Math.trunc(level)), pool.dieByLevel.length) - 1
  return pool.dieByLevel[index] ?? ''
}

/** 骰池展示文本：`3d6`；骰数为 0 或骰面未知时返回空串。 */
export function formatDicePoolText(pool: DicePoolRule, level: number): string {
  const count = getDicePoolCount(pool, level)
  const die = getDicePoolDie(pool, level)
  return count > 0 && die ? `${count}${die}` : ''
}
