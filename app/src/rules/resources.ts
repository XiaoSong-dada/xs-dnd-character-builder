import type { ClassResource } from '@/types/rules'

const RECOVERY_LABELS: Readonly<Record<ClassResource['recovery'], string>> = {
  'short-rest': '短休恢复',
  'long-rest': '长休恢复',
  none: '无次数限制',
  special: '特殊恢复',
}

/** 按角色等级取资源上限；越界等级按最近端点处理，未获得时返回 0。 */
export function getResourceMax(resource: ClassResource, level: number): number {
  if (resource.maxByLevel.length === 0) return 0
  const index = Math.min(Math.max(1, Math.trunc(level)), resource.maxByLevel.length) - 1
  return Math.max(0, resource.maxByLevel[index] ?? 0)
}

/** 资源展示文本：`2 次 · 短休恢复`（单位缺省为“次”）；上限为 0 时返回空串。 */
export function formatResourceText(resource: ClassResource, level: number): string {
  const max = getResourceMax(resource, level)
  if (max <= 0) return ''
  return `${max} ${resource.unit ?? '次'} · ${RECOVERY_LABELS[resource.recovery]}`
}
