import { emptyBundle, isCustomEntryId } from '@/rules/custom-content'
import { collectCustomContentReferences } from '@/rules/custom-content-references'
import type { CharacterDraft } from '@/types/character'
import type { CustomContentBundle, CustomEntry } from '@/types/custom-content'

export function listBundleEntries(bundle: CustomContentBundle): readonly CustomEntry[] {
  return [...bundle.races, ...bundle.classes, ...bundle.subclasses, ...bundle.feats, ...bundle.spells]
}

export function customEntryDependencies(entry: CustomEntry): readonly string[] {
  switch (entry.kind) {
    case 'subclass': return [entry.classId]
    case 'spell': return entry.classIds
    case 'feat': return entry.grantedSpellIds ?? []
    case 'class': return entry.spellcastingSourceClassId ? [entry.spellcastingSourceClassId] : []
    case 'race': return []
  }
}

export function collectCharacterContent(draft: CharacterDraft, library: CustomContentBundle) {
  const entries = new Map(listBundleEntries(library).map((entry) => [entry.id, entry]))
  const roots = new Set(collectCustomContentReferences([draft]).keys())
  const missing: string[] = []
  const sourceIds = new Set<string>()
  for (const id of roots) {
    const entry = entries.get(id)
    if (!entry) {
      missing.push(id)
      continue
    }
    sourceIds.add(entry.expansionId)
    for (const dependency of customEntryDependencies(entry)) {
      if (isCustomEntryId(dependency)) roots.add(dependency)
    }
  }
  const bundle: CustomContentBundle = {
    ...emptyBundle(),
    expansions: library.expansions.filter((entry) => sourceIds.has(entry.id)),
    races: library.races.filter((entry) => roots.has(entry.id)),
    classes: library.classes.filter((entry) => roots.has(entry.id)),
    subclasses: library.subclasses.filter((entry) => roots.has(entry.id)),
    feats: library.feats.filter((entry) => roots.has(entry.id)),
    spells: library.spells.filter((entry) => roots.has(entry.id)),
  }
  return { bundle, count: listBundleEntries(bundle).length, missing }
}

type PackageItem = CustomEntry | CustomContentBundle['expansions'][number]

function comparableContent(item: PackageItem): string {
  return JSON.stringify(item, (key, value: unknown) => {
    if (key === 'createdAt' || key === 'updatedAt') return undefined
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)))
    }
    return value
  })
}

export function previewCharacterContent(local: CustomContentBundle, incoming: CustomContentBundle) {
  const existing = new Map([...local.expansions, ...listBundleEntries(local)].map((item) => [item.id, item]))
  return [...incoming.expansions, ...listBundleEntries(incoming)].map((item) => {
    const previous = existing.get(item.id)
    const status = !previous ? 'new' : comparableContent(previous) === comparableContent(item) ? 'same' : 'conflict'
    return {
      id: item.id,
      name: 'title' in item ? item.title : item.name,
      localName: previous ? ('title' in previous ? previous.title : previous.name) : undefined,
      summary: 'title' in item ? item.note : item.summary,
      localSummary: previous ? ('title' in previous ? previous.note : previous.summary) : undefined,
      status,
      fingerprint: previous ? comparableContent(previous) : undefined,
    } as const
  })
}

export function mergeCharacterContent(local: CustomContentBundle, incoming: CustomContentBundle, selectedIds: ReadonlySet<string>): CustomContentBundle {
  const merge = <T extends PackageItem>(current: readonly T[], packaged: readonly T[]): readonly T[] => {
    const result = new Map(current.map((item) => [item.id, item]))
    for (const item of packaged) if (selectedIds.has(item.id)) result.set(item.id, item)
    return [...result.values()]
  }
  return {
    version: 1,
    expansions: merge(local.expansions, incoming.expansions),
    races: merge(local.races, incoming.races),
    classes: merge(local.classes, incoming.classes),
    subclasses: merge(local.subclasses, incoming.subclasses),
    feats: merge(local.feats, incoming.feats),
    spells: merge(local.spells, incoming.spells),
  }
}
