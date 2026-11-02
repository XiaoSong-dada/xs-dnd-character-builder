import { ABILITY_LABELS } from '@/rules/data/ability-labels'
import type { AbilityKey, RuleSource, RulesetId } from '@/types/character'
import type {
  ClassFeature,
  ClassRule,
  FeatRule,
  RaceFeature,
  RaceRule,
  SpellRule,
  SubclassFeature,
  SubclassRule,
} from '@/types/rules'
import type {
  CustomClassEntry,
  CustomContentBundle,
  CustomEntry,
  CustomExpansion,
  CustomFeatEntry,
  CustomRaceEntry,
  CustomSpellEntry,
  CustomSubclassEntry,
} from '@/types/custom-content'

/** 自定义扩展 ID 前缀：映射为 `RuleSource.id`。 */
export const CUSTOM_SOURCE_PREFIX = 'source-custom-'
/** 自定义条目 ID 前缀：`custom-<kind>-<token>`。 */
export const CUSTOM_ENTRY_PREFIX = 'custom-'

export function isCustomSourceId(id: string): boolean {
  return id.startsWith(CUSTOM_SOURCE_PREFIX)
}

export function isCustomEntryId(id: string): boolean {
  return id.startsWith(CUSTOM_ENTRY_PREFIX)
}

/**
 * 生成自定义条目 ID。`token` 由调用方（store）提供，`rules` 层不生成随机数，
 * 以保证纯函数与可测试性。
 */
export function buildCustomEntryId(kind: CustomEntry['kind'], token: string): string {
  return `${CUSTOM_ENTRY_PREFIX}${kind}-${token}`
}

export function buildCustomExpansionId(token: string): string {
  return `${CUSTOM_SOURCE_PREFIX}${token}`
}

export function emptyBundle(): CustomContentBundle {
  return { version: 1, expansions: [], races: [], classes: [], subclasses: [], feats: [], spells: [] }
}

export function emptyCustomContentState(): Readonly<Record<RulesetId, CustomContentBundle>> {
  return { '5e-2014': emptyBundle(), '5e-2024': emptyBundle() }
}

/** 内容库是否为空（空库时仓库不需要合并，保证未使用内容工坊时行为与改造前逐字段一致）。 */
export function isEmptyBundle(bundle: CustomContentBundle): boolean {
  return bundle.expansions.length === 0
    && bundle.races.length === 0
    && bundle.classes.length === 0
    && bundle.subclasses.length === 0
    && bundle.feats.length === 0
    && bundle.spells.length === 0
}

/** 扩展映射为可切换来源；内容工坊的自定义扩展默认启用（见需求 §6.4）。 */
export function toRuleSource(expansion: CustomExpansion): RuleSource {
  return {
    id: expansion.id,
    title: expansion.title,
    shortTitle: expansion.shortTitle,
    ruleset: expansion.ruleset,
    category: 'supplement',
    selectable: true,
    contentKind: 'custom',
    defaultEnabled: expansion.defaultEnabled,
  }
}

/** 归档条目：保留解析能力（已选角色不崩），但退出新建候选池。 */
function entryStatus(entry: { readonly archived?: boolean }): 'selectable' | 'unavailable' {
  return entry.archived ? 'unavailable' : 'selectable'
}

export function toRaceRule(entry: CustomRaceEntry): RaceRule {
  return {
    id: entry.id,
    ruleset: entry.ruleset,
    name: entry.name,
    englishName: entry.englishName,
    summary: entry.summary,
    description: entry.description,
    subraceIds: [],
    fixedAbilityBonuses: entry.ruleset === '5e-2014' ? entry.fixedAbilityBonuses ?? {} : {},
    recommendedClassIds: [],
    status: entryStatus(entry),
    sourceIds: [entry.expansionId],
    ...(entry.size ? { size: entry.size } : {}),
    ...(entry.sizeChoices?.length ? { sizeChoices: entry.sizeChoices } : {}),
    ...(entry.speed !== undefined ? { speed: entry.speed } : {}),
    ...(entry.darkvision !== undefined ? { darkvision: entry.darkvision } : {}),
    ...(entry.skillProficiencies?.length ? { skillProficiencies: entry.skillProficiencies } : {}),
    ...(entry.fixedLanguages?.length ? { fixedLanguages: entry.fixedLanguages } : {}),
    ...(entry.languageChoices !== undefined ? { languageChoices: entry.languageChoices } : {}),
    ...(entry.damageResistances?.length ? { damageResistances: entry.damageResistances } : {}),
    ...(entry.hitPointBonusPerLevel !== undefined ? { hitPointBonusPerLevel: entry.hitPointBonusPerLevel } : {}),
    ...(entry.initiativeProficiency ? { initiativeProficiency: true } : {}),
    ...(entry.climbSpeed !== undefined ? { climbSpeed: entry.climbSpeed } : {}),
    ...(entry.swimSpeed !== undefined ? { swimSpeed: entry.swimSpeed } : {}),
    ...(entry.flySpeed !== undefined ? { flySpeed: entry.flySpeed } : {}),
  }
}

export function toRaceFeatures(entry: CustomRaceEntry): readonly RaceFeature[] {
  return (entry.traits ?? []).map((trait) => ({
    id: trait.id,
    raceId: entry.id,
    name: trait.name,
    englishName: trait.name,
    level: trait.level,
    summary: trait.summary,
    description: trait.description,
    kind: 'passive',
    status: 'selectable',
    sourceIds: [entry.expansionId],
  }))
}

export interface CustomClassProjectionOptions {
  /** 已合并（含自定义内容注入）的内置职业查询器：用于"引用已有职业的法术表"。 */
  readonly getBaseClass: (classId: string) => ClassRule | undefined
}

export function toClassRule(entry: CustomClassEntry, options: CustomClassProjectionOptions): ClassRule {
  const sourceClass = entry.spellcastingSourceClassId ? options.getBaseClass(entry.spellcastingSourceClassId) : undefined
  const baseConfig = sourceClass?.spellcasting
  const spellcasting = baseConfig
    ? { ...baseConfig, ability: entry.spellcastingAbility ?? baseConfig.ability, ruleset: entry.ruleset }
    : undefined
  return {
    id: entry.id,
    ruleset: entry.ruleset,
    name: entry.name,
    englishName: entry.englishName,
    summary: entry.summary,
    introduction: entry.description,
    hitDie: entry.hitDie,
    primaryAbilities: entry.primaryAbilities,
    playStyleTags: [],
    savingThrowAbilities: entry.savingThrowAbilities,
    status: entryStatus(entry),
    sourceIds: [entry.expansionId],
    checkpoints: [],
    features: toClassFeatures(entry),
    ...(entry.armorTraining?.length ? { armorTraining: entry.armorTraining } : {}),
    ...(entry.weaponTraining ? { weaponTraining: entry.weaponTraining } : {}),
    ...(entry.unarmoredDefense ? { unarmoredDefense: entry.unarmoredDefense } : {}),
    ...(spellcasting ? { spellcasting } : {}),
  }
}

export function toClassFeatures(entry: CustomClassEntry): readonly ClassFeature[] {
  return (entry.features ?? []).map((feature) => ({
    id: feature.id,
    classId: entry.id,
    name: feature.name,
    englishName: feature.name,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
    kind: feature.kind ?? 'passive',
    status: 'selectable',
    sourceIds: [entry.expansionId],
  }))
}

export function toSubclassRule(entry: CustomSubclassEntry): SubclassRule {
  return {
    id: entry.id,
    classId: entry.classId,
    ruleset: entry.ruleset,
    name: entry.name,
    englishName: entry.englishName,
    selectionLevel: entry.selectionLevel,
    summary: entry.summary,
    status: entryStatus(entry),
    sourceIds: [entry.expansionId],
    features: toSubclassFeatures(entry),
  }
}

export function toSubclassFeatures(entry: CustomSubclassEntry): readonly SubclassFeature[] {
  return (entry.features ?? []).map((feature) => ({
    id: feature.id,
    subclassId: entry.id,
    name: feature.name,
    englishName: feature.name,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
    kind: feature.kind ?? 'passive',
    status: 'selectable',
    sourceIds: [entry.expansionId],
  }))
}

export function toFeatRule(entry: CustomFeatEntry): FeatRule {
  const category = entry.category ?? (entry.ruleset === '5e-2014' ? undefined : 'general')
  return {
    id: entry.id,
    name: entry.name,
    ruleset: entry.ruleset,
    englishName: entry.englishName,
    description: entry.summary,
    detail: entry.description,
    tags: ['custom'],
    status: entryStatus(entry),
    sourceIds: [entry.expansionId],
    ...(category ? { category } : {}),
    ...(entry.prerequisite ? { prerequisite: entry.prerequisite } : {}),
    ...(entry.repeatable ? { repeatable: true } : {}),
    ...(entry.grantedSpellIds?.length
      ? { grantedSpells: entry.grantedSpellIds.map((spellId) => ({ spellId })) }
      : {}),
    ...(entry.hitPointBonusPerLevel !== undefined ? { hitPointBonusPerLevel: entry.hitPointBonusPerLevel } : {}),
    ...(entry.hitPointBonus !== undefined ? { hitPointBonus: entry.hitPointBonus } : {}),
    ...(entry.speedBonus !== undefined ? { speedBonus: entry.speedBonus } : {}),
    ...(entry.armorTraining?.length ? { armorTraining: entry.armorTraining } : {}),
  }
}

/**
 * 职业 ID 在数据层的两种口径：2014 法术数据用短键（`wizard`），2024 用完整 ID（`class-2024-wizard`）。
 * 内容库统一保存**完整职业 ID**（界面按仓库职业列表选择），投影回内置类型时按规则集转换。
 */
function toDataClassId(ruleset: RulesetId, classId: string): string {
  return ruleset === '5e-2014' ? classId.replace(/^class-2014-/, '') : classId
}

export function toSpellRule(entry: CustomSpellEntry): SpellRule {
  return {
    id: entry.id,
    ruleset: entry.ruleset,
    name: entry.name,
    englishName: entry.englishName,
    level: entry.level,
    ritual: entry.ritual ?? false,
    classIds: entry.classIds.map((classId) => toDataClassId(entry.ruleset, classId)),
    summary: entry.summary === '' ? `${entry.level} 环自定义法术` : entry.summary,
    description: entry.description,
    status: entryStatus(entry),
    sourceIds: [entry.expansionId],
    ...(entry.school ? { school: entry.school } : {}),
    ...(entry.castingTime ? { castingTime: entry.castingTime } : {}),
    ...(entry.range ? { range: entry.range } : {}),
    ...(entry.components ? { components: entry.components } : {}),
    ...(entry.duration ? { duration: entry.duration } : {}),
    ...(entry.concentration !== undefined ? { concentration: entry.concentration } : {}),
  }
}

/** 校验可用的上下文：由调用方提供当前规则集的内置职业 ID，供引用校验。 */
export interface CustomEntryValidationOptions {
  readonly classIds?: readonly string[]
  readonly spellIds?: readonly string[]
  /** 父职业 ID → 已锁定选择等级；用于自定义子职。 */
  readonly subclassLevelsByClass?: Readonly<Record<string, number>>
}

const FEAT_CATEGORIES_2024: readonly string[] = ['origin', 'general', 'fighting-style', 'epic-boon', 'dragonmark', 'wild-talent', 'dark-gift', 'bloodline']

function isNonEmpty(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/** 扩展校验：返回中文原因列表，空数组表示通过。 */
export function validateCustomExpansion(expansion: CustomExpansion): readonly string[] {
  const issues: string[] = []
  if (!isNonEmpty(expansion.title)) issues.push('请填写扩展名称。')
  if (!isNonEmpty(expansion.shortTitle)) issues.push('请填写扩展简称（用于车卡来源列表）。')
  return issues
}

/**
 * 条目校验：返回中文原因列表，空数组表示通过。
 *
 * 与内置规则同样的原则——错误必须说明如何修正；这里只做与内容库自身一致的检查，
 * 不推进随机表或复杂情境规则。
 */
export function validateCustomEntry(
  entry: CustomEntry,
  options: CustomEntryValidationOptions = {},
): readonly string[] {
  const issues: string[] = []
  if (!isNonEmpty(entry.name)) issues.push('请填写名称。')
  if (!isNonEmpty(entry.expansionId) && !isCustomSourceId(entry.expansionId)) {
    issues.push('请选择所属自定义扩展（内容必须先归入一本自制扩展）。')
  }
  if (!isNonEmpty(entry.summary)) issues.push('请填写一句话概括。')
  if (!isNonEmpty(entry.description)) issues.push('请填写详细说明。')

  const knownClasses = options.classIds
  if (entry.kind === 'race') {
    if (entry.speed !== undefined && (!Number.isFinite(entry.speed) || entry.speed < 0 || entry.speed > 120)) {
      issues.push('速度必须是 0—120 之间的数值（尺）。')
    }
    if (entry.darkvision !== undefined && (!Number.isFinite(entry.darkvision) || entry.darkvision < 0 || entry.darkvision > 240)) {
      issues.push('黑暗视觉必须是 0—240 之间的数值（尺）。')
    }
    if (entry.ruleset === '5e-2024' && entry.fixedAbilityBonuses && Object.keys(entry.fixedAbilityBonuses).length > 0) {
      issues.push('2024 物种不使用固定属性加值，属性加值来自背景；请清空该字段。')
    }
    for (const [key, value] of Object.entries(entry.fixedAbilityBonuses ?? {})) {
      if (!Number.isInteger(value) || value === undefined || value < 0 || value > 3) {
        issues.push(`${ABILITY_LABELS[key as AbilityKey] ?? key} 的属性加值必须是 0—3 的整数。`)
      }
    }
    for (const trait of entry.traits ?? []) {
      if (!isNonEmpty(trait.name)) issues.push('种族特性的名称不能为空。')
      if (!Number.isInteger(trait.level) || trait.level < 1 || trait.level > 20) issues.push('种族特性的获得等级必须是 1—20。')
    }
  }
  if (entry.kind === 'class') {
    if (![6, 8, 10, 12].includes(entry.hitDie)) issues.push('生命骰必须是 d6、d8、d10 或 d12。')
    if (entry.savingThrowAbilities.length !== 2) issues.push('请选择两项豁免熟练（必须恰好两项）。')
    if (new Set(entry.savingThrowAbilities).size !== entry.savingThrowAbilities.length) issues.push('两项豁免熟练不能重复。')
    if (entry.primaryAbilities.length === 0) issues.push('请至少选择一项主属性。')
    if (entry.spellcastingSourceClassId && knownClasses && !knownClasses.includes(entry.spellcastingSourceClassId)) {
      issues.push('引用的法术表职业不存在或被关闭，请重新选择。')
    }
    for (const feature of entry.features ?? []) {
      if (!isNonEmpty(feature.name)) issues.push('职业特性的名称不能为空。')
      if (!Number.isInteger(feature.level) || feature.level < 1 || feature.level > 20) issues.push('职业特性的等级必须是 1—20。')
    }
  }
  if (entry.kind === 'subclass') {
    if (!isNonEmpty(entry.classId)) {
      issues.push('请选择所属职业。')
    } else if (knownClasses && !knownClasses.includes(entry.classId)) {
      issues.push('所属职业不存在或已被归档，请重新选择。')
    }
    if (!Number.isInteger(entry.selectionLevel) || entry.selectionLevel < 1 || entry.selectionLevel > 20) {
      issues.push('子职选择等级必须是 1—20 的整数。')
    }
    const lockedLevel = entry.classId ? options.subclassLevelsByClass?.[entry.classId] : undefined
    if (lockedLevel !== undefined && entry.selectionLevel !== lockedLevel) {
      issues.push(`该职业的子职选择等级固定为 ${lockedLevel} 级，不能修改。`)
    }
    for (const feature of entry.features ?? []) {
      if (!isNonEmpty(feature.name)) issues.push('子职特性的名称不能为空。')
      if (!Number.isInteger(feature.level) || feature.level < 1 || feature.level > 20) issues.push('子职特性的等级必须是 1—20。')
    }
  }
  if (entry.kind === 'feat') {
    if (entry.ruleset === '5e-2024' && !entry.category) issues.push('2024 专长必须选择类别。')
    if (entry.category && !FEAT_CATEGORIES_2024.includes(entry.category)) issues.push('专长类别不合法。')
    if (entry.ruleset === '5e-2014' && entry.category && entry.category !== 'general') {
      issues.push('2014 专长没有类别体系，请选择「通用」或不填。')
    }
    if (entry.prerequisite?.minimumLevel !== undefined && (entry.prerequisite.minimumLevel < 1 || entry.prerequisite.minimumLevel > 20)) {
      issues.push('前置等级必须是 1—20。')
    }
    if (entry.prerequisite?.abilityMinimum && entry.prerequisite.abilityMinimum.anyOf.length === 0) {
      issues.push('属性前置至少需要选择一项属性。')
    }
    const knownSpells = options.spellIds
    if (knownSpells) {
      for (const spellId of entry.grantedSpellIds ?? []) {
        if (!knownSpells.includes(spellId)) issues.push(`授予的法术「${spellId}」不在当前规则集的法术库中。`)
      }
    }
  }
  if (entry.kind === 'spell') {
    if (!Number.isInteger(entry.level) || entry.level < 0 || entry.level > 9) issues.push('法术环级必须是 0—9 的整数。')
    if (knownClasses) {
      for (const classId of entry.classIds) {
        if (!knownClasses.includes(classId)) issues.push(`法术归属的职业「${classId}」不在当前规则集中。`)
      }
    }
  }
  return issues
}

/** 条目参与计算的程度：`computed` 会进入派生/候选池，`display` 只作为文字展示。 */
export type CustomEntryAutomationLevel = 'computed' | 'display'

/**
 * 判断条目是否会参与自动计算（界面据此打标，见需求 §12「看得懂影响」）。
 * 只按已登记字段判断，不做规则推演。
 */
export function getCustomEntryAutomationLevel(entry: CustomEntry): CustomEntryAutomationLevel {
  if (entry.kind === 'subclass') return 'display'
  if (entry.kind === 'class' || entry.kind === 'spell') return 'computed'
  if (entry.kind === 'race') {
    const mechanical = entry.speed !== undefined
      || entry.darkvision !== undefined
      || entry.size !== undefined
      || (entry.sizeChoices?.length ?? 0) > 0
      || Object.values(entry.fixedAbilityBonuses ?? {}).some((value) => (value ?? 0) !== 0)
      || (entry.skillProficiencies?.length ?? 0) > 0
      || (entry.fixedLanguages?.length ?? 0) > 0
      || entry.languageChoices !== undefined
      || entry.hitPointBonusPerLevel !== undefined
      || entry.initiativeProficiency === true
    return mechanical ? 'computed' : 'display'
  }
  const mechanicalFeat = entry.hitPointBonusPerLevel !== undefined
    || entry.hitPointBonus !== undefined
    || entry.speedBonus !== undefined
    || (entry.armorTraining?.length ?? 0) > 0
    || (entry.grantedSpellIds?.length ?? 0) > 0
  return mechanicalFeat ? 'computed' : 'display'
}

export function getCustomAutomationLabel(level: CustomEntryAutomationLevel): string {
  return level === 'computed' ? '会参与计算' : '仅展示'
}

/** 摘要预览用的标签解析器；缺省直接显示 ID，界面可传入仓库名称解析。 */
export interface CustomSummaryOptions {
  readonly labelOf?: (id: string) => string
}

/**
 * 规则摘要预览：用文字复述"这条内容会带来什么"，供编辑器实时展示。
 * 只依赖条目本身，不读取仓库。
 */
export function summarizeCustomEntry(
  entry: CustomEntry,
  options: CustomSummaryOptions = {},
): readonly string[] {
  const label = options.labelOf ?? ((id: string) => id)
  const lines: string[] = []
  if (entry.kind === 'race') {
    if (entry.size && !entry.sizeChoices?.length) lines.push(`体型：${entry.size === 'small' ? '小型' : '中型'}`)
    if (entry.sizeChoices?.length) lines.push(`体型可选：${entry.sizeChoices.map((size) => (size === 'small' ? '小型' : '中型')).join(' / ')}`)
    if (entry.speed !== undefined) lines.push(`步行速度：${entry.speed} 尺`)
    if (entry.darkvision !== undefined) lines.push(`黑暗视觉：${entry.darkvision} 尺`)
    const bonuses = Object.entries(entry.fixedAbilityBonuses ?? {})
      .filter(([, value]) => (value ?? 0) !== 0)
      .map(([key, value]) => `${ABILITY_LABELS[key as AbilityKey] ?? key} ${(value ?? 0) > 0 ? '+' : ''}${value}`)
    if (bonuses.length) lines.push(`属性加值：${bonuses.join('、')}`)
    if (entry.skillProficiencies?.length) lines.push(`技能熟练：${entry.skillProficiencies.map(label).join('、')}`)
    if (entry.fixedLanguages?.length) lines.push(`语言：${entry.fixedLanguages.join('、')}`)
    if (entry.languageChoices) lines.push(`自选语言：${entry.languageChoices} 项`)
    if (entry.damageResistances?.length) lines.push(`伤害抗性（仅展示）：${entry.damageResistances.join('、')}`)
    if (entry.hitPointBonusPerLevel) lines.push(`每级最大生命：+${entry.hitPointBonusPerLevel}`)
    if (entry.initiativeProficiency) lines.push('先攻熟练：熟练加值计入先攻')
    const movement = [
      entry.climbSpeed !== undefined ? `攀爬 ${entry.climbSpeed} 尺` : '',
      entry.swimSpeed !== undefined ? `游泳 ${entry.swimSpeed} 尺` : '',
      entry.flySpeed !== undefined ? `飞行 ${entry.flySpeed} 尺` : '',
    ].filter(Boolean)
    if (movement.length) lines.push(`其他移动（仅展示）：${movement.join('、')}`)
    if (entry.traits?.length) lines.push(`种族特性（仅展示）：${entry.traits.length} 条`)
  }
  if (entry.kind === 'class') {
    lines.push(`生命骰：d${entry.hitDie}`)
    if (entry.primaryAbilities.length) lines.push(`主属性：${entry.primaryAbilities.join('、')}`)
    if (entry.savingThrowAbilities.length) lines.push(`豁免熟练：${entry.savingThrowAbilities.map((key) => ABILITY_LABELS[key]).join('、')}`)
    if (entry.armorTraining?.length) lines.push(`护甲训练：${entry.armorTraining.length} 类`)
    if (entry.weaponTraining) lines.push('武器训练：已登记')
    if (entry.unarmoredDefense) lines.push(`无甲防御：10＋${ABILITY_LABELS[entry.unarmoredDefense.ability]}${entry.unarmoredDefense.allowsShield ? '（可持盾）' : ''}`)
    lines.push(entry.spellcastingSourceClassId
      ? `施法：复用「${label(entry.spellcastingSourceClassId)}」的法术表与数量表`
      : '施法：非施法职业')
    if (entry.features?.length) lines.push(`职业特性（仅展示）：${entry.features.length} 条`)
    lines.push('子职由「自定义子职」单独创建；未创建时时间线不出现子职节点。')
  }
  if (entry.kind === 'subclass') {
    lines.push(`所属职业：${label(entry.classId)}`)
    lines.push(`选择等级：${entry.selectionLevel} 级`)
    if (entry.features?.length) lines.push(`子职特性（仅展示）：${entry.features.length} 条`)
    lines.push('特性仅展示，不自动授予法术/资源/AC/HP。')
  }
  if (entry.kind === 'feat') {
    if (entry.category) lines.push(`类别：${entry.category}`)
    if (entry.hitPointBonusPerLevel) lines.push(`每级最大生命：+${entry.hitPointBonusPerLevel}`)
    if (entry.hitPointBonus) lines.push(`最大生命：+${entry.hitPointBonus}`)
    if (entry.speedBonus) lines.push(`速度：+${entry.speedBonus} 尺`)
    if (entry.armorTraining?.length) lines.push(`护甲训练：${entry.armorTraining.length} 类`)
    if (entry.grantedSpellIds?.length) lines.push(`授予法术：${entry.grantedSpellIds.map(label).join('、')}`)
    const prerequisite: string[] = []
    if (entry.prerequisite?.minimumLevel) prerequisite.push(`等级 ${entry.prerequisite.minimumLevel}+`)
    if (entry.prerequisite?.abilityMinimum) prerequisite.push(`${entry.prerequisite.abilityMinimum.anyOf.map((key) => ABILITY_LABELS[key]).join('/')} ${entry.prerequisite.abilityMinimum.score}+`)
    if (entry.prerequisite?.requiredCapability) prerequisite.push('需要施法能力')
    if (prerequisite.length) lines.push(`前置：${prerequisite.join('、')}`)
  }
  if (entry.kind === 'spell') {
    lines.push(`环级：${entry.level === 0 ? '戏法' : `${entry.level} 环`}`)
    if (entry.school) lines.push(`学派：${entry.school}`)
    if (entry.classIds.length) lines.push(`职业法术表：${entry.classIds.map(label).join('、')}`)
    if (entry.ritual) lines.push('仪式法术')
    const meta = [entry.castingTime, entry.range, entry.duration].filter(isNonEmpty)
    if (meta.length) lines.push(meta.join(' · '))
    if (entry.concentration) lines.push('需要专注')
  }
  return lines
}
