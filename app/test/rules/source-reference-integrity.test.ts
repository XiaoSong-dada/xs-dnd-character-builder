import { describe, expect, it } from 'vitest'

import { rulesRepository2014 } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'

/**
 * 来源引用完整性（G3-I 回归守卫）。
 *
 * 每个仓库只解析自己 `sources` 清单里的来源 ID：条目若引用了**另一规则集注册表**的
 * 来源 ID（例如把 2014 的 `tp-*` 写进 2024 条目），该来源无法在界面上被开启，
 * 条目会永久处于「来源已关闭」而不可达。本用例对全部条目逐条回查，防止此类跨注册表漂移。
 */
const collectSourceIds = (repository: typeof rulesRepository2014): { id: string; label: string; sourceIds: readonly string[] }[] => {
  const rows: { id: string; label: string; sourceIds: readonly string[] }[] = []
  const push = (label: string, items: readonly { readonly id: string; readonly sourceIds: readonly string[] }[]): void => {
    for (const item of items) rows.push({ id: item.id, label, sourceIds: item.sourceIds })
  }
  push('class', repository.classes)
  push('subclass', repository.subclasses)
  push('race', repository.races)
  push('background', repository.backgrounds)
  push('raceFeature', repository.raceFeatures)
  push('backgroundFeature', repository.backgroundFeatures)
  push('option', repository.options)
  push('feat', repository.feats)
  push('equipment', repository.equipment)
  push('spell', repository.spells)
  return rows
}

const danglingSourceRefs = (repository: typeof rulesRepository2014): string[] => {
  const registered = new Set(repository.sources.map((source) => source.id))
  return collectSourceIds(repository)
    .filter((row) => row.sourceIds.some((sourceId) => !registered.has(sourceId)))
    .map((row) => `${row.label}:${row.id} → ${row.sourceIds.filter((sourceId) => !registered.has(sourceId)).join(',')}`)
}

describe('来源引用完整性（G3-I）', () => {
  it('2014 仓库全部条目的 sourceIds 均已在该仓库注册', () => {
    expect(danglingSourceRefs(rulesRepository2014)).toEqual([])
  })

  it('2024 仓库全部条目的 sourceIds 均已在该仓库注册', () => {
    expect(danglingSourceRefs(rulesRepository2024)).toEqual([])
  })

  it('2014 与 2024 来源 ID 不跨注册表复用（tp-* / source-2024-tp-* 各自归属）', () => {
    const ids2014 = new Set(rulesRepository2014.sources.map((source) => source.id))
    const ids2024 = new Set(rulesRepository2024.sources.map((source) => source.id))
    const overlap = [...ids2014].filter((id) => ids2024.has(id))
    expect(overlap).toEqual([])
  })
})
