import { emptyBundle, emptyCustomContentState, isCustomSourceId } from '@/rules/custom-content'
import type { AbilityKey, RulesetId } from '@/types/character'
import type {
  CustomClassEntry,
  CustomClassFeature,
  CustomContentBundle,
  CustomContentLoadResult,
  CustomContentState,
  CustomExpansion,
  CustomFeatEntry,
  CustomRaceEntry,
  CustomSpellEntry,
  CustomTrait,
} from '@/types/custom-content'

const STORAGE_KEY = 'dnd-custom-content:v1'
const RULESETS: readonly RulesetId[] = ['5e-2014', '5e-2024']
const ABILITY_KEYS: readonly AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

/** 内容库读写失败；`message` 直接面向玩家。 */
export class CustomContentStorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CustomContentStorageError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function optionalText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function stringList(value: unknown): readonly string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const list = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  return list.length > 0 ? list : undefined
}

function abilityList(value: unknown): readonly AbilityKey[] | undefined {
  const list = stringList(value)?.filter((item): item is AbilityKey => (ABILITY_KEYS as readonly string[]).includes(item))
  return list && list.length > 0 ? list : undefined
}

function normalizeTraits(value: unknown): readonly CustomTrait[] | undefined {
  if (!Array.isArray(value)) return undefined
  const traits = value.flatMap((item, index) => {
    if (!isRecord(item)) return []
    const name = optionalText(item.name)
    if (!name) return []
    return [{
      id: text(item.id, `trait-${index + 1}`),
      name,
      level: Math.min(20, Math.max(1, Math.round(numberValue(item.level) ?? 1))),
      summary: text(item.summary),
      description: text(item.description),
    }]
  })
  return traits.length > 0 ? traits : undefined
}

function normalizeClassFeatures(value: unknown): readonly CustomClassFeature[] | undefined {
  if (!Array.isArray(value)) return undefined
  const features = value.flatMap((item, index) => {
    if (!isRecord(item)) return []
    const name = optionalText(item.name)
    if (!name) return []
    return [{
      id: text(item.id, `feature-${index + 1}`),
      name,
      level: Math.min(20, Math.max(1, Math.round(numberValue(item.level) ?? 1))),
      summary: text(item.summary),
      description: text(item.description),
    }]
  })
  return features.length > 0 ? features : undefined
}

function normalizeExpansion(raw: unknown, ruleset: RulesetId): CustomExpansion | undefined {
  if (!isRecord(raw)) return undefined
  const id = optionalText(raw.id)
  const title = optionalText(raw.title)
  const shortTitle = optionalText(raw.shortTitle)
  if (!id || !isCustomSourceId(id) || !title || !shortTitle) return undefined
  return {
    id,
    ruleset,
    title,
    shortTitle,
    note: optionalText(raw.note),
    defaultEnabled: typeof raw.defaultEnabled === 'boolean' ? raw.defaultEnabled : true,
    createdAt: text(raw.createdAt, new Date().toISOString()),
    updatedAt: text(raw.updatedAt, new Date().toISOString()),
  }
}

interface EntryBaseFields {
  readonly id: string
  readonly expansionId: string
  readonly name: string
  readonly englishName: string
  readonly summary: string
  readonly description: string
  readonly archived?: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

function readEntryBase(raw: unknown, kind: string, expansionIds: ReadonlySet<string>): EntryBaseFields | undefined {
  if (!isRecord(raw)) return undefined
  const id = optionalText(raw.id)
  const expansionId = optionalText(raw.expansionId)
  const name = optionalText(raw.name)
  if (!id || !expansionId || !name) return undefined
  if (!id.startsWith(`custom-${kind}-`) || !expansionIds.has(expansionId)) return undefined
  return {
    id,
    expansionId,
    name,
    englishName: text(raw.englishName, name),
    summary: text(raw.summary),
    description: text(raw.description),
    archived: raw.archived === true ? true : undefined,
    createdAt: text(raw.createdAt, new Date().toISOString()),
    updatedAt: text(raw.updatedAt, new Date().toISOString()),
  }
}

function normalizeRace(raw: unknown, ruleset: RulesetId, expansionIds: ReadonlySet<string>): CustomRaceEntry | undefined {
  const base = readEntryBase(raw, 'race', expansionIds)
  if (!base || !isRecord(raw)) return undefined
  const bonuses: Partial<Record<AbilityKey, number>> = {}
  if (isRecord(raw.fixedAbilityBonuses)) {
    for (const key of ABILITY_KEYS) {
      const value = numberValue(raw.fixedAbilityBonuses[key])
      if (value !== undefined && value !== 0) bonuses[key] = value
    }
  }
  return {
    kind: 'race',
    ruleset,
    ...base,
    size: raw.size === 'small' || raw.size === 'medium' ? raw.size : undefined,
    sizeChoices: Array.isArray(raw.sizeChoices)
      ? raw.sizeChoices.filter((item): item is 'small' | 'medium' => item === 'small' || item === 'medium')
      : undefined,
    speed: numberValue(raw.speed),
    darkvision: numberValue(raw.darkvision),
    fixedAbilityBonuses: Object.keys(bonuses).length > 0 ? bonuses : undefined,
    skillProficiencies: stringList(raw.skillProficiencies),
    fixedLanguages: stringList(raw.fixedLanguages),
    languageChoices: numberValue(raw.languageChoices),
    damageResistances: stringList(raw.damageResistances),
    hitPointBonusPerLevel: numberValue(raw.hitPointBonusPerLevel),
    initiativeProficiency: raw.initiativeProficiency === true ? true : undefined,
    climbSpeed: numberValue(raw.climbSpeed),
    swimSpeed: numberValue(raw.swimSpeed),
    flySpeed: numberValue(raw.flySpeed),
    traits: normalizeTraits(raw.traits),
  }
}

function normalizeClass(raw: unknown, ruleset: RulesetId, expansionIds: ReadonlySet<string>): CustomClassEntry | undefined {
  const base = readEntryBase(raw, 'class', expansionIds)
  if (!base || !isRecord(raw)) return undefined
  const hitDie = numberValue(raw.hitDie)
  if (hitDie !== 6 && hitDie !== 8 && hitDie !== 10 && hitDie !== 12) return undefined
  const savingThrows = abilityList(raw.savingThrowAbilities)
  if (!savingThrows || savingThrows.length !== 2) return undefined
  return {
    kind: 'class',
    ruleset,
    ...base,
    hitDie,
    primaryAbilities: stringList(raw.primaryAbilities) ?? [],
    savingThrowAbilities: savingThrows,
    armorTraining: Array.isArray(raw.armorTraining)
      ? raw.armorTraining.filter((item): item is 'light' | 'medium' | 'heavy' | 'shield' => item === 'light' || item === 'medium' || item === 'heavy' || item === 'shield')
      : undefined,
    spellcastingSourceClassId: optionalText(raw.spellcastingSourceClassId),
    spellcastingAbility: abilityList([raw.spellcastingAbility])?.[0],
    features: normalizeClassFeatures(raw.features),
  }
}

function normalizeFeat(raw: unknown, ruleset: RulesetId, expansionIds: ReadonlySet<string>): CustomFeatEntry | undefined {
  const base = readEntryBase(raw, 'feat', expansionIds)
  if (!base || !isRecord(raw)) return undefined
  const requiredCapability = (isRecord(raw.prerequisite)
    && (raw.prerequisite.requiredCapability === 'spellcasting' || raw.prerequisite.requiredCapability === 'spellcasting-or-pact'))
    ? raw.prerequisite.requiredCapability
    : undefined
  const prerequisite: CustomFeatEntry['prerequisite'] = isRecord(raw.prerequisite)
    ? {
        minimumLevel: numberValue(raw.prerequisite.minimumLevel),
        requiredCapability,
      }
    : undefined
  return {
    kind: 'feat',
    ruleset,
    ...base,
    category: optionalText(raw.category) as CustomFeatEntry['category'],
    repeatable: raw.repeatable === true ? true : undefined,
    prerequisite: prerequisite && (prerequisite.minimumLevel !== undefined || prerequisite.requiredCapability)
      ? prerequisite
      : undefined,
    hitPointBonusPerLevel: numberValue(raw.hitPointBonusPerLevel),
    hitPointBonus: numberValue(raw.hitPointBonus),
    speedBonus: numberValue(raw.speedBonus),
    grantedSpellIds: stringList(raw.grantedSpellIds),
  }
}

function normalizeSpell(raw: unknown, ruleset: RulesetId, expansionIds: ReadonlySet<string>): CustomSpellEntry | undefined {
  const base = readEntryBase(raw, 'spell', expansionIds)
  if (!base || !isRecord(raw)) return undefined
  const level = numberValue(raw.level)
  if (level === undefined || !Number.isInteger(level) || level < 0 || level > 9) return undefined
  return {
    kind: 'spell',
    ruleset,
    ...base,
    level,
    school: optionalText(raw.school),
    classIds: stringList(raw.classIds) ?? [],
    ritual: raw.ritual === true ? true : undefined,
    castingTime: optionalText(raw.castingTime),
    range: optionalText(raw.range),
    components: optionalText(raw.components),
    duration: optionalText(raw.duration),
    concentration: raw.concentration === true ? true : undefined,
  }
}

interface NormalizedBundle {
  readonly bundle: CustomContentBundle
  readonly skipped: number
}

function normalizeBundle(raw: unknown, ruleset: RulesetId): NormalizedBundle {
  if (!isRecord(raw)) return { bundle: emptyBundle(), skipped: 0 }
  let skipped = 0

  const expansions = Array.isArray(raw.expansions)
    ? raw.expansions.flatMap((item) => {
        const expansion = normalizeExpansion(item, ruleset)
        if (!expansion) skipped += 1
        return expansion ? [expansion] : []
      })
    : []
  const expansionIds = new Set(expansions.map((expansion) => expansion.id))

  const pick = <T>(items: unknown, normalize: (raw: unknown, rules: RulesetId, ids: ReadonlySet<string>) => T | undefined): readonly T[] => {
    if (!Array.isArray(items)) return []
    return items.flatMap((item) => {
      const entry = normalize(item, ruleset, expansionIds)
      if (!entry) skipped += 1
      return entry ? [entry] : []
    })
  }

  return {
    bundle: {
      version: 1,
      expansions,
      races: pick(raw.races, normalizeRace),
      classes: pick(raw.classes, normalizeClass),
      feats: pick(raw.feats, normalizeFeat),
      spells: pick(raw.spells, normalizeSpell),
    },
    skipped,
  }
}

function normalizeState(raw: unknown): { state: CustomContentState; skipped: number } {
  const source = isRecord(raw) && isRecord(raw.state) ? raw.state : isRecord(raw) ? raw : {}
  let skipped = 0
  const bundles: Record<RulesetId, CustomContentBundle> = {
    '5e-2014': emptyBundle(),
    '5e-2024': emptyBundle(),
  }
  for (const ruleset of RULESETS) {
    const normalized = normalizeBundle(source[ruleset], ruleset)
    bundles[ruleset] = normalized.bundle
    skipped += normalized.skipped
  }
  return { state: bundles, skipped }
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    // 预渲染（Node 无 localStorage）或浏览器禁用存储：静默降级为空内容库。
    return null
  }
}

function writeRaw(value: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch (error) {
    if (error instanceof Error && /quota/i.test(error.name + error.message)) {
      throw new CustomContentStorageError('浏览器存储空间不足。请先导出备份，再删除部分自定义内容。')
    }
    throw new CustomContentStorageError('无法保存自定义内容（浏览器拒绝了存储写入）。')
  }
}

export const CustomContentStorageService = {
  /** 读取内容库；损坏数据降级为空并通过 `error` 说明原因，不静默丢弃。 */
  load(): CustomContentLoadResult {
    const raw = readRaw()
    if (!raw) return { state: emptyCustomContentState(), skipped: 0 }
    try {
      const parsed: unknown = JSON.parse(raw)
      const { state, skipped } = normalizeState(parsed)
      return { state, skipped }
    } catch {
      return { state: emptyCustomContentState(), skipped: 0, error: '自定义内容数据损坏，已忽略。' }
    }
  },

  save(state: CustomContentState): void {
    writeRaw(JSON.stringify({ version: 1, state }))
  },

  /** 导出为可分享的 JSON 字符串；`scope` 为 `all` 时同时导出两个规则集。 */
  exportJson(state: CustomContentState, scope: RulesetId | 'all'): string {
    const rulesets = scope === 'all' ? RULESETS : [scope]
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      rulesets: Object.fromEntries(rulesets.map((ruleset) => [ruleset, state[ruleset]])),
    }
    return JSON.stringify(payload, null, 2)
  },

  /** 解析导入文件；非法文件整体拒绝并给出中文原因。 */
  importJson(raw: string): { state: CustomContentState; skipped: number } {
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new CustomContentStorageError('无法解析该文件：不是合法的 JSON。')
    }
    if (!isRecord(parsed) || !isRecord(parsed.rulesets)) {
      throw new CustomContentStorageError('无法识别该文件：缺少 rulesets 字段。')
    }
    const { state, skipped } = normalizeState({ state: parsed.rulesets })
    const empty = RULESETS.every((ruleset) => {
      const bundle = state[ruleset]
      return bundle.expansions.length === 0 && bundle.races.length === 0 && bundle.classes.length === 0
        && bundle.feats.length === 0 && bundle.spells.length === 0
    })
    if (empty) throw new CustomContentStorageError('该文件里没有可导入的自定义内容。')
    return { state, skipped }
  },
}

/** 供测试与"清空内容库"复用：删除本机保存的内容库。 */
export function clearStoredCustomContent(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 忽略：没有可清理的存储时无需报错。
  }
}
