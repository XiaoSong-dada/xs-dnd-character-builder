import { ABILITY_LABELS } from '@/rules/data/feats-2014'
import { decodeAbilityImprovement, formatFeatBonusOption, listFeatGrants } from '@/rules/feats'
import { getRulesRepository } from '@/rules/repositories'
import { normalizeManualEdits } from '@/rules/manual-edits'
import { getEffectiveSpeciesFeatures, getEffectiveSpeciesSize } from '@/rules/origins'
import { listSessionResources } from '@/rules/session-resources'
import { getClassLevelLabel, getHitDiceFaces } from '@/rules/multiclass-session'
import { getClassEntries, getTotalLevel } from '@/rules/multiclass'
import { getCantripScalingAtLevel, getAlwaysPreparedSpellIds, getAvailableSpells, getEffectiveSpellSlots, getMagicalSecretsSpellIds, getSpeciesSpellcastingProfiles, getSpellcastingConfig, listClassSpellSelections, listSpellcastingScopes, usesPreparedSelection } from '@/rules/spellcasting'
import { getFixedSpeciesLanguages } from '@/rules/languages'
import { isSourceEnabled } from '@/rules/source-books'
import { buildTimeline } from '@/rules/timeline'
import { deriveWeaponAttack } from '@/rules/weapon-attacks'
import type { AbilityKey, CharacterDraft, DerivedCharacter } from '@/types/character'
import type { RulesRepository } from '@/types/rules'

export type ExportDiagnosticCode =
  | 'missing-rule-data'
  | 'missing-template-field'
  | 'unsupported-template-field'
  | 'invalid-template-target'
  | 'content-truncated'
  | 'formula-not-recalculated'
  | 'source-disabled'

export interface ExportDiagnostic {
  readonly code: ExportDiagnosticCode
  readonly severity: 'warning' | 'error'
  readonly field: string
  readonly message: string
}

export interface ExportAbility {
  readonly key: AbilityKey
  readonly label: string
  readonly score: number
  readonly modifier: number
  readonly savingThrow: number
  readonly savingThrowProficient: boolean
}

export interface ExportSkill {
  readonly id: string
  readonly name: string
  readonly value: number
  readonly proficiency: 'none' | 'proficient' | 'expertise'
}

export interface ExportAttack {
  readonly itemId: string
  readonly name: string
  readonly attackBonus: number
  readonly damage: string
  readonly note: string
}

export interface ExportFeature {
  readonly id: string
  readonly category: 'feat' | 'subclass' | 'class' | 'race' | 'background'
  readonly name: string
  readonly summary: string
  readonly priority: number
}

/** 跑团结算登记的可消耗资源（B10）：导出为上限与恢复说明，不包含局内已用数量。 */
export interface ExportResource {
  readonly id: string
  readonly name: string
  readonly max: number
  readonly unit: string
  readonly recovery: 'short-rest' | 'long-rest' | 'none' | 'special'
  /** 短休只恢复固定数量（如狂暴短休回 1 次）。 */
  readonly shortRestRecovery?: number
  /** 同名资源合并来源（MC-F01）：多个职业共用同一计数池时列出各来源特性名。 */
  readonly sharedSources?: readonly string[]
}

export interface ExportSpell {
  readonly id: string
  readonly name: string
  readonly level: number
  readonly prepared: boolean
  /** 归属职业名（MC-F01）：兼职时说明该法术由哪个职业提供；单职业不输出。 */
  readonly className?: string
}

/** 逐职业行（MC-F01）：PDF／XLSX 的多职业输出以此为准。 */
export interface ExportClassRow {
  readonly classId: string
  readonly className: string
  readonly level: number
  readonly subclassName?: string
  /** 是否为起始职业（豁免熟练与起始装备的唯一来源）。 */
  readonly primary: boolean
}

/** 戏法成长行（MC-F01／D11）：只作展示，不进入任何自动结算。 */
export interface ExportCantrip {
  readonly id: string
  readonly name: string
  /** 归属职业名（兼职时输出）。 */
  readonly className?: string
  /** 当前角色总等级下的成长值（如 `2d10`、`2 道`）。 */
  readonly scaling: string
}

export interface CharacterExportModel {
  readonly identity: {
    readonly characterName: string
    readonly className: string
    readonly level: number
    readonly classLevel: string
    readonly subclassName: string
    readonly raceName: string
    readonly backgroundName: string
    readonly alignment: string
    readonly playerName: string
    readonly experience: number
    /** 逐职业行（MC-F01）；单职业只有一行。 */
    readonly classRows: readonly ExportClassRow[]
  }
  readonly abilities: Readonly<Record<AbilityKey, ExportAbility>>
  readonly combat: {
    readonly proficiencyBonus: number
    readonly armorClass: number
    readonly initiative: number
    readonly speed: number
    readonly hitPointMaximum: number
    readonly hitPointCurrent: number
    readonly hitPointTemporary: number
    /** 单职业 `d10`；多职业 `5d10 + 5d8`（生命骰按各职业骰面汇集，需求 §2.4）。 */
    readonly hitDice: string
    /** 生命骰总览文本：单职业 `5d10`；多职业 `10（5d10 + 5d8）`。 */
    readonly hitDiceTotal: string
    readonly passivePerception: number
  }
  readonly skills: readonly ExportSkill[]
  readonly proficiencies: { readonly languages: readonly string[]; readonly text: string }
  readonly attacks: readonly ExportAttack[]
  readonly inventory: readonly { readonly itemId: string; readonly name: string; readonly quantity: number; readonly equippedQuantity: number }[]
  readonly currency: { readonly cp: number; readonly sp: number; readonly ep: number; readonly gp: number; readonly pp: number }
  readonly features: readonly ExportFeature[]
  readonly resources: readonly ExportResource[]
  /** 戏法成长行（MC-F01／D11）；未登记成长规则的条目不入列（D12）。 */
  readonly cantrips: readonly ExportCantrip[]
  readonly spellcasting?: {
    readonly className: string
    readonly abilityLabel: string
    readonly saveDc: number
    readonly attackBonus: number
    readonly slots: readonly { readonly level: number; readonly count: number; readonly pact: boolean }[]
    readonly spells: readonly ExportSpell[]
    /** 各施法职业行（MC-F01）：`法师5`、`魔契师3`；单职业只有一项。 */
    readonly classes: readonly string[]
    /** 契约魔法说明（魔契师）：法术位按自身职业等级单独结算。 */
    readonly pactNote?: string
  }
  readonly profile: { readonly backstory: string }
  readonly diagnostics: readonly ExportDiagnostic[]
}

const ABILITY_KEYS: readonly AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

function signed(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}`
}

function optionName(repository: RulesRepository, id: string): string {
  return repository.getOption(id)?.name ?? id
}

/** 展示类选择所在检查点类型（技能、专长、子职与属性提升另有管道）。 */
const DISPLAY_SELECTION_KINDS: ReadonlySet<string> = new Set([
  'class-choice',
  'subclass-feature',
  'weapon-mastery',
  'fighting-style',
  'feat-feature',
  'infusion',
])

/** 法术精通与招牌法术的选择法术在导出特性列表单列（其余法术由法术列表承载）。 */
const SPELL_FEATURE_CHECKPOINT_PREFIXES: readonly string[] = [
  'wizard-2014-spell-mastery-',
  'wizard-2014-signature-spells-',
  'class-2024-wizard-spell-mastery-',
  'class-2024-wizard-signature-spells-',
]

/** 选择是否写入导出特性列表：技能、物种施法属性、语言与工具仅影响派生，不重复列出。 */
function isDisplayableSelection(kind: string | undefined, optionId: string): boolean {
  if (optionId.startsWith('skill-') || optionId.startsWith('spell-ability-') || optionId.startsWith('language-') || optionId.startsWith('tool-')) {
    return false
  }
  if (kind && DISPLAY_SELECTION_KINDS.has(kind)) return true
  // 检查点信息缺失时的稳定前缀兜底（超魔与注法选项）。
  return optionId.startsWith('metamagic-') || optionId.startsWith('infusion-')
}

function resolveSelectedFeatures(draft: CharacterDraft): ExportFeature[] {
  const repository = getRulesRepository(draft.ruleset)
  const features: ExportFeature[] = []
  const seen = new Set<string>()
  const push = (entry: ExportFeature): void => {
    if (seen.has(entry.id)) return
    seen.add(entry.id)
    features.push(entry)
  }
  const timeline = draft.classId
    ? buildTimeline(draft.classId, draft.targetLevel, {
        subraceId: draft.subraceId,
        subclassId: draft.subclassId,
        enabledSourceIds: draft.enabledSourceIds,
        selections: draft.selections,
        manualFeatGrants: draft.manualEdits?.addedFeats ?? [],
        ruleset: draft.ruleset,
        raceId: draft.raceId,        backgroundId: draft.backgroundId,
      })
    : []
  const checkpointById = new Map(timeline.map((checkpoint) => [checkpoint.id, checkpoint]))

  for (const selection of draft.selections) {
    if (selection.invalidatedAt) continue
    const checkpoint = checkpointById.get(selection.checkpointId)
    for (const optionId of selection.optionIds) {
      // 专长与属性提升：任何检查点都展示。
      const feat = repository.getFeat(optionId)
      if (feat) {
        push({ id: feat.id, category: 'feat', name: feat.name, summary: feat.detail, priority: 10 })
        continue
      }
      const abilityImprovement = decodeAbilityImprovement(optionId)
      if (abilityImprovement) {
        const summary = abilityImprovement.mode === 'single'
          ? `${ABILITY_LABELS[abilityImprovement.abilities[0]]} +2`
          : abilityImprovement.abilities.map((ability) => `${ABILITY_LABELS[ability]} +1`).join('、')
        push({ id: optionId, category: 'feat', name: '属性值提升', summary, priority: 10 })
        continue
      }
      // 专长自带属性提升子选项（feat-bonus-*）进入导出特性列表（B09-09）。
      const featBonusLabel = formatFeatBonusOption(repository, optionId)
      if (featBonusLabel) {
        push({
          id: optionId,
          category: 'feat',
          name: featBonusLabel,
          summary: repository.getOption(optionId)?.description ?? '由专长授予的属性提升。',
          priority: 10,
        })
        continue
      }
      // 展示类选择按检查点类型数据驱动：2014／2024 的超魔、战技、子职选项、祈唤、圣职与武器精通共用一条管道。
      if (!isDisplayableSelection(checkpoint?.kind, optionId)) continue
      const spell = repository.getSpell(optionId)
      if (spell) {
        if (SPELL_FEATURE_CHECKPOINT_PREFIXES.some((prefix) => selection.checkpointId.startsWith(prefix))) {
          push({ id: spell.id, category: 'class', name: spell.name, summary: spell.description, priority: 10 })
        }
        continue
      }
      const equipment = repository.getEquipment(optionId)
      if (equipment) {
        const mastery = equipment.masteryId ? repository.getWeaponMastery(equipment.masteryId) : undefined
        push({
          id: equipment.id,
          category: 'class',
          name: `武器精通：${equipment.name}`,
          summary: mastery ? `${mastery.name}——${mastery.summary}` : '武器精通选择。',
          priority: 10,
        })
        continue
      }
      const option = repository.getOption(optionId)
      if (!option) continue
      const isInfusion = optionId.startsWith('infusion-2014-')
      const assignment = isInfusion ? (draft.infusionAssignments ?? []).find((item) => item.infusionId === optionId) : undefined
      const entry = assignment ? draft.inventory.find((item) => item.id === assignment.inventoryEntryId) : undefined
      const boundItem = entry ? repository.getEquipment(entry.itemId) : undefined
      push({
        id: option.id,
        category: checkpoint?.kind === 'subclass-feature' ? 'subclass' : 'class',
        name: option.name,
        summary: isInfusion
          ? `${option.description}${assignment ? ` 当前绑定：${boundItem?.name ?? assignment.inventoryEntryId}。` : ' 当前未生效。'}`
          : option.description,
        priority: 10,
      })
    }
  }
  return features
}

function buildFeatures(draft: CharacterDraft, derived: DerivedCharacter): ExportFeature[] {
  const repository = getRulesRepository(draft.ruleset)
  const classRule = draft.classId ? repository.getClass(draft.classId) : undefined
  const subclass = draft.subclassId ? repository.getSubclass(draft.subclassId) : undefined
  const race = draft.raceId ? repository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? repository.getRace(draft.subraceId) : undefined
  const background = draft.backgroundVariantId
    ? repository.getBackground(draft.backgroundVariantId)
    : draft.backgroundId ? repository.getBackground(draft.backgroundId) : undefined
  // 起源专长（H3）：与规则层授予列表同源，含二选一／任选结果与「狂野天赋替代」结果；
  // 优先级 9 高于 `resolveSelectedFeatures` 的专长条目，保证同一专长只保留带「（起源专长）」标注的一条。
  const originFeatEntries = listFeatGrants(draft, repository)
    .filter((grant) => grant.sourceKind === 'background' || grant.sourceKind === 'species')
    .flatMap((grant) => {
      const feat = repository.getFeat(grant.featId)
      if (!feat) return []
      const backgroundName = grant.sourceKind === 'background' ? repository.getBackground(grant.sourceId)?.name : undefined
      return [{
        id: feat.id,
        category: 'feat' as const,
        name: backgroundName ? `${feat.name}（起源专长 · ${backgroundName}）` : `${feat.name}（起源专长）`,
        summary: feat.detail,
        priority: 9,
      }]
    })
  const manualFeatEntries = listFeatGrants(draft, repository)
    .filter((grant) => grant.sourceKind === 'manual')
    .flatMap((grant) => {
      const feat = repository.getFeat(grant.featId)
      return feat ? [{
        id: grant.instanceId,
        category: 'feat' as const,
        name: `${feat.name}（手动添加）`,
        summary: feat.detail,
        priority: 9,
      }] : []
    })
  const allocation = draft.backgroundAbilityAllocation ?? {}
  const allocationText = Object.entries(allocation).length
    ? `属性分配：${Object.entries(allocation).map(([key, value]) => `${ABILITY_LABELS[key as AbilityKey]}${value >= 0 ? '+' : ''}${value}`).join('、')}`
    : ''
  // 2024 物种特性（含血统）逐条导出；种族名称已在身份区展示。
  const raceFeatures = [race, subrace]
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item) => isSourceEnabled(item.sourceIds, draft.enabledSourceIds, repository))
    .flatMap((item) => getEffectiveSpeciesFeatures(draft, repository, item.id, derived)
      .map((feature) => ({ id: feature.id, category: 'race' as const, name: feature.name, summary: feature.summary, priority: 40 })))
  const entries: ExportFeature[] = [
    ...resolveSelectedFeatures(draft),
    ...originFeatEntries,
    ...manualFeatEntries,
    ...(subclass?.features ?? []).filter((feature) => feature.level <= draft.targetLevel).map((feature) => ({ id: feature.id, category: 'subclass' as const, name: feature.name, summary: feature.summary, priority: 20 })),
    ...(classRule?.features ?? []).filter((feature) => feature.level <= draft.targetLevel).map((feature) => ({ id: feature.id, category: 'class' as const, name: feature.name, summary: feature.summary, priority: 30 })),
    ...raceFeatures,
    ...getSpeciesSpellcastingProfiles(draft, derived).map((profile) => ({
      id: profile.id, category: 'race' as const, name: `${profile.sourceName}施法`, priority: 40,
      summary: `${ABILITY_LABELS[profile.ability]}；法术攻击 ${signed(profile.attackBonus)}；法术豁免 DC ${profile.saveDc}；${profile.spellIds.map((id) => repository.getSpell(id)?.name ?? id).join('、')}${profile.materialFreeSpellIds.length ? `；无需材料成分（种族施放）：${profile.materialFreeSpellIds.map((id) => repository.getSpell(id)?.name ?? id).join('、')}` : ''}${profile.castingNotes.length ? `；${profile.castingNotes.join('；')}` : ''}`,
    })),
    ...(getEffectiveSpeciesSize(draft, repository)
      ? [{ id: `selected-size-${draft.ruleset}`, category: 'race' as const, name: '选定体型', summary: getEffectiveSpeciesSize(draft, repository) === 'small' ? '小型' : '中型', priority: 40 }]
      : []),
    ...(background ? [{ id: background.id, category: 'background' as const, name: background.featureName || background.name, summary: allocationText ? `${background.summary}；${allocationText}` : background.summary, priority: 50 }] : []),
  ]
  const seen = new Set<string>()
  return entries.sort((left, right) => left.priority - right.priority).filter((entry) => {
    if (seen.has(entry.id)) return false
    seen.add(entry.id)
    return true
  })
}

/** 跑团资源：导出上限与恢复说明（不含局内已用数量）。 */
function buildResources(draft: CharacterDraft, derived: DerivedCharacter): readonly ExportResource[] {
  return listSessionResources(draft, derived.modifiers).map((resource) => ({
    id: resource.id,
    name: resource.name,
    max: resource.max,
    unit: resource.unit,
    recovery: resource.recovery,
    ...(resource.shortRestRecovery !== undefined ? { shortRestRecovery: resource.shortRestRecovery } : {}),
    ...(resource.sharedSources ? { sharedSources: resource.sharedSources } : {}),
  }))
}

/**
 * 戏法成长行（MC-F01／D11）：按**角色总等级**给出当前成长值。
 * 未登记成长规则、或当前等级仍是 1 级基础值的戏法不入列（决策 D12：不写「无成长」）。
 */
function buildCantrips(draft: CharacterDraft, spellIds: readonly string[]): readonly ExportCantrip[] {
  const repository = getRulesRepository(draft.ruleset)
  const totalLevel = getTotalLevel(draft) || draft.targetLevel
  const owners = spellOwners(draft)
  return spellIds.flatMap((id) => {
    const spell = repository.getSpell(id)
    if (!spell || spell.level !== 0) return []
    const scaling = getCantripScalingAtLevel(draft.ruleset, id, totalLevel)
    if (!scaling || scaling.isBase) return []
    const parts = [
      scaling.dice ?? '',
      scaling.count !== undefined ? `${scaling.count} 道` : '',
      scaling.die ?? '',
      scaling.note ?? '',
    ].filter(Boolean)
    if (parts.length === 0) return []
    const owner = owners.get(id)
    const className = owner ? repository.getClass(owner)?.name : undefined
    return [{
      id,
      name: spell.name,
      scaling: parts.join('；'),
      ...(owners.size > 0 && className ? { className } : {}),
    }]
  })
}

/** 法术 → 归属职业（MC-F01）：仅兼职草稿有分桶时给出，单职业返回空表。 */
function spellOwners(draft: CharacterDraft): ReadonlyMap<string, string> {
  const owners = new Map<string, string>()
  if (getClassEntries(draft).length <= 1) return owners
  for (const { classId, selections } of listClassSpellSelections(draft)) {
    for (const id of [...selections.cantripIds, ...selections.knownSpellIds, ...selections.preparedSpellIds, ...selections.spellbookSpellIds]) {
      if (!owners.has(id)) owners.set(id, classId)
    }
  }
  return owners
}

/** 戏法成长区块文本（PDF 与 XLSX 共用）：`戏法成长（角色总等级 5 级）：火焰箭 2d10；魔能爆 2 道`。 */
export function formatExportCantripScaling(cantrips: readonly ExportCantrip[], totalLevel: number): string {
  if (!cantrips.length) return ''
  const text = cantrips.map((cantrip) =>
    `${cantrip.name} ${cantrip.scaling}${cantrip.className ? `（${cantrip.className}）` : ''}`).join('；')
  return `戏法成长（角色总等级 ${totalLevel} 级）：${text}`
}

const RESOURCE_RECOVERY_LABELS: Readonly<Record<ExportResource['recovery'], string>> = {
  'short-rest': '短休恢复',
  'long-rest': '长休恢复',
  none: '无次数限制',
  special: '特殊恢复',
}

/** 资源区块文本：`资源：狂暴 3次（短休回1）；引导神力 2次（短休恢复）`；空列表返回空串。 */
export function formatExportResources(resources: readonly ExportResource[]): string {
  if (!resources.length) return ''
  const text = resources.map((resource) => {
    const count = `${resource.max}${resource.unit}`
    const merged = resource.sharedSources?.length ? `（${resource.sharedSources.join('、')}共用）` : ''
    return resource.shortRestRecovery !== undefined
      ? `${resource.name} ${count}（短休回${resource.shortRestRecovery}）${merged}`
      : `${resource.name} ${count}（${RESOURCE_RECOVERY_LABELS[resource.recovery]}）${merged}`
  }).join('；')
  return `资源：${text}`
}

function buildInventory(draft: CharacterDraft, diagnostics: ExportDiagnostic[]) {
  const repository = getRulesRepository(draft.ruleset)
  const grouped = new Map<string, { quantity: number; equippedQuantity: number }>()
  for (const entry of draft.inventory) {
    const current = grouped.get(entry.itemId) ?? { quantity: 0, equippedQuantity: 0 }
    current.quantity += entry.quantity
    current.equippedQuantity += entry.equippedQuantity
    grouped.set(entry.itemId, current)
  }
  return [...grouped.entries()].map(([itemId, totals]) => {
    const equipment = repository.getEquipment(itemId)
    if (!equipment) diagnostics.push({ code: 'missing-rule-data', severity: 'warning', field: `inventory.${itemId}`, message: `无法解析物品 ${itemId}，已使用原始 ID。` })
    return { itemId, name: equipment?.name ?? itemId, ...totals }
  })
}

/**
 * 法术清单（MC-F01）：多职业草稿以**各职业分桶**为事实源（顶层数组只是兼容视图），
 * 单职业草稿仍读顶层数组，行为与改造前一致。
 */
function spellList(draft: CharacterDraft, diagnostics: ExportDiagnostic[]): readonly ExportSpell[] {
  const repository = getRulesRepository(draft.ruleset)
  const config = getSpellcastingConfig(draft)
  const multiClass = getClassEntries(draft).length > 1
  const scoped = multiClass
    ? listClassSpellSelections(draft).flatMap(({ selections }) => [
        ...selections.cantripIds,
        ...selections.knownSpellIds,
        ...selections.preparedSpellIds,
        ...selections.spellbookSpellIds,
      ])
    : []
  const selections = draft.spellSelections
  const baseIds = multiClass
    ? [...new Set(scoped)]
    : config?.mode === 'spellbook'
      ? [...selections.cantripIds, ...selections.spellbookSpellIds]
      : config && usesPreparedSelection(config)
        ? [...selections.cantripIds, ...getAvailableSpells(draft, config).filter((spell) => spell.level > 0).map((spell) => spell.id)]
        : [...selections.cantripIds, ...selections.knownSpellIds]
  const alwaysPrepared = getAlwaysPreparedSpellIds(draft)
  const manual = normalizeManualEdits(draft.manualEdits).addedSpells
  const ids = [...new Set([...baseIds, ...alwaysPrepared, ...getMagicalSecretsSpellIds(draft), ...manual.map((item) => item.spellId)])]
  const prepared = new Set([...selections.preparedSpellIds, ...alwaysPrepared, ...manual.filter((item) => item.prepared).map((item) => item.spellId)])
  const owners = spellOwners(draft)
  return ids.map((id) => {
    const spell = repository.getSpell(id)
    if (!spell) diagnostics.push({ code: 'missing-rule-data', severity: 'warning', field: `spell.${id}`, message: `无法解析法术 ${id}。` })
    if (!spell) return undefined
    const ownerClassId = owners.get(id)
    const className = ownerClassId ? repository.getClass(ownerClassId)?.name : undefined
    return {
      id, name: spell.name, level: spell.level, prepared: prepared.has(id),
      ...(owners.size > 0 && className ? { className } : {}),
    }
  }).filter((spell): spell is ExportSpell => Boolean(spell)).sort((left, right) =>
    Number(right.prepared) - Number(left.prepared)
    || left.level - right.level
    || left.name.localeCompare(right.name, 'zh-CN'))
}

export function buildCharacterExportModel(draft: CharacterDraft, derived: DerivedCharacter): CharacterExportModel {
  const repository = getRulesRepository(draft.ruleset)
  const diagnostics: ExportDiagnostic[] = []
  const classRule = draft.classId ? repository.getClass(draft.classId) : undefined
  const subclass = draft.subclassId ? repository.getSubclass(draft.subclassId) : undefined
  const race = draft.raceId ? repository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? repository.getRace(draft.subraceId) : undefined
  const background = draft.backgroundId ? repository.getBackground(draft.backgroundId) : undefined
  const backgroundVariant = draft.backgroundVariantId ? repository.getBackground(draft.backgroundVariantId) : undefined
  if (draft.classId && !classRule) diagnostics.push({ code: 'missing-rule-data', severity: 'error', field: 'identity.class', message: '无法解析角色职业。' })
  if (classRule && !isSourceEnabled(classRule.sourceIds, draft.enabledSourceIds, repository)) diagnostics.push({ code: 'source-disabled', severity: 'error', field: 'identity.class', message: `职业“${classRule.name}”的来源已关闭，导出已阻止。` })
  if (subclass && !isSourceEnabled(subclass.sourceIds, draft.enabledSourceIds, repository)) diagnostics.push({ code: 'source-disabled', severity: 'error', field: 'identity.subclass', message: `子职“${subclass.name}”的来源已关闭，导出已阻止。` })
  if (draft.raceId && !race) diagnostics.push({ code: 'missing-rule-data', severity: 'error', field: 'identity.race', message: '无法解析角色种族。' })

  const inventory = buildInventory(draft, diagnostics)
  const attacks = inventory.filter((entry) => entry.equippedQuantity > 0).flatMap((entry) => {
    const equipment = repository.getEquipment(entry.itemId)
    if (!equipment) return []
    const attack = deriveWeaponAttack(draft, derived, equipment)
    if (!attack) {
      if (equipment.category === 'weapon') diagnostics.push({ code: 'missing-rule-data', severity: 'warning', field: `attacks.${entry.itemId}`, message: `${equipment.name} 缺少可计算的基础武器结构，未生成攻击数据。` })
      return []
    }
    const damageBonus = attack.damageBonus === 0 ? '' : signed(attack.damageBonus)
    const notes = [attack.versatileDamageDice ? `双手 ${attack.versatileDamageDice}${damageBonus}` : '', attack.range ? `射程 ${attack.range[0]}/${attack.range[1]} 尺` : '', attack.proficient ? '' : '未熟练'].filter(Boolean)
    return [{ itemId: attack.itemId, name: attack.name, attackBonus: attack.attackBonus, damage: `${attack.damageDice}${damageBonus} ${attack.damageType}`, note: notes.join('；') }]
  })

  const abilities = Object.fromEntries(ABILITY_KEYS.map((key) => [key, {
    key,
    label: ABILITY_LABELS[key],
    score: derived.abilities[key],
    modifier: derived.modifiers[key],
    savingThrow: derived.savingThrows[key].value,
    // 豁免熟练只来自起始职业（兼职口径，MC-B02）；标签沿用既有 '职业豁免熟练'，
    // 来源具体职业写在 detail 中，避免导出层依赖具体标签文案。
    savingThrowProficient: derived.savingThrows[key].sources.some((source) => source.label === '职业豁免熟练'),
  }])) as Record<AbilityKey, ExportAbility>
  const skills = Object.entries(derived.skills).map(([id, value]) => {
    const labels = value.sources.map((source) => source.label)
    return { id, name: optionName(repository, id), value: value.value, proficiency: labels.includes('专精') ? 'expertise' as const : labels.includes('技能熟练') ? 'proficient' as const : 'none' as const }
  })
  const languages = [...new Set([...getFixedSpeciesLanguages(draft, repository), ...draft.languages.map((id) => optionName(repository, id))])]
  const spellcastingConfig = getSpellcastingConfig(draft)
  const speciesProfiles = getSpeciesSpellcastingProfiles(draft, derived)
  const primarySpeciesProfile = speciesProfiles.length === 1 ? speciesProfiles[0] : undefined
  const grantedSpellIds = getAlwaysPreparedSpellIds(draft)
  const spellSlots = getEffectiveSpellSlots(draft)
  const spells = spellList(draft, diagnostics)
  const classEntries = getClassEntries(draft)
  const multiClass = classEntries.length > 1
  // 逐职业行（MC-F01）：起始职业在首位，子职名按各职业自己的子职解析。
  const classRows: ExportClassRow[] = classEntries.map((entry, index) => {
    const classRule = repository.getClass(entry.classId)
    const entrySubclass = entry.subclassId ? repository.getSubclass(entry.subclassId) : undefined
    return {
      classId: entry.classId,
      className: classRule?.name ?? entry.classId,
      level: entry.level,
      ...(entrySubclass ? { subclassName: entrySubclass.name } : {}),
      primary: index === 0,
    }
  })
  // 职业标签（MC-F01，需求 §3.1）：多职业统一格式；单职业保持既有 `职业（N级）` 文案逐字段不变。
  const classLabel = getClassLevelLabel(draft, repository)
  // 生命骰（需求 §2.4）：按各职业骰面汇集；单职业仍是 `5d10`。
  const hitDiceFaces = getHitDiceFaces(draft)
  const hitDice = multiClass
    ? [...hitDiceFaces.reduce((groups, die) => groups.set(die, (groups.get(die) ?? 0) + 1), new Map<number, number>())]
        .sort(([left], [right]) => left - right)
        .map(([die, count]) => `${count}d${die}`)
        .join(' + ')
    : classRule ? `d${classRule.hitDie}` : ''
  // 各施法职业行与契约池说明（MC-F01）：法术位按「兼职施法者」表或各职业自身表结算。
  const scopes = listSpellcastingScopes(draft)
  const castingClasses = scopes.map((scope) => `${scope.className}${scope.classLevel}`)
  const pactScope = scopes.find((scope) => scope.pact)
  const pactSlot = pactScope ? spellSlots.find((slot) => slot.pact) : undefined
  const pactNote = pactSlot && pactScope
    ? `契约魔法：${pactSlot.count} 个 ${pactSlot.level} 环法术位，按${pactScope.className}${pactScope.classLevel}级结算（短休恢复）`
    : undefined

  return {
    identity: {
      characterName: draft.name || '', className: classRule?.name ?? '', level: draft.targetLevel,
      classLevel: multiClass && classLabel ? classLabel : classRule ? `${classRule.name}（${draft.targetLevel}级）` : '',
      subclassName: subclass?.name ?? '', raceName: subrace?.name ?? race?.name ?? '', backgroundName: backgroundVariant?.name ?? background?.name ?? '',
      alignment: draft.alignment, playerName: '', experience: 0,
      classRows,
    },
    abilities,
    combat: {
      proficiencyBonus: derived.proficiencyBonus.value, armorClass: derived.armorClass.value, initiative: derived.initiative.value, speed: derived.speed.value,
      hitPointMaximum: derived.hitPoints.value, hitPointCurrent: derived.hitPoints.value, hitPointTemporary: 0,
      hitDice, hitDiceTotal: multiClass ? `${draft.targetLevel}（${hitDice}）` : `${draft.targetLevel}${hitDice}`,
      passivePerception: derived.passivePerception.value,
    },
    skills,
    proficiencies: { languages, text: languages.join('、') },
    attacks,
    inventory,
    currency: { ...draft.currency, gp: draft.currency.gp + draft.adventureGold },
    features: buildFeatures(draft, derived),
    resources: buildResources(draft, derived),
    cantrips: buildCantrips(draft, spells.filter((spell) => spell.level === 0).map((spell) => spell.id)),
    ...(spellcastingConfig || scopes.length > 0 || grantedSpellIds.length > 0 || normalizeManualEdits(draft.manualEdits).addedSpells.length > 0 || spellSlots.length > 0 ? {
      spellcasting: {
        className: multiClass && castingClasses.length > 0
          ? castingClasses.join(' / ')
          : spellcastingConfig ? classRule?.name ?? subclass?.name ?? '' : primarySpeciesProfile?.sourceName ?? (grantedSpellIds.length ? '授予法术' : classRule?.name ?? subclass?.name ?? '人工施法'),
        abilityLabel: spellcastingConfig ? ABILITY_LABELS[spellcastingConfig.ability] : primarySpeciesProfile ? ABILITY_LABELS[primarySpeciesProfile.ability] : speciesProfiles.length > 1 ? '多来源，见特性' : grantedSpellIds.length ? '待确认' : '人工',
        saveDc: spellcastingConfig ? derived.spellSaveDc?.value ?? 0 : primarySpeciesProfile?.saveDc ?? derived.spellSaveDc?.value ?? 0,
        attackBonus: spellcastingConfig ? derived.spellAttackBonus?.value ?? 0 : primarySpeciesProfile?.attackBonus ?? derived.spellAttackBonus?.value ?? 0,
        slots: spellSlots.map((slot) => ({ ...slot, pact: Boolean(slot.pact) })),
        spells,
        classes: castingClasses,
        ...(pactNote ? { pactNote } : {}),
      },
    } : {}),
    profile: { backstory: draft.notes },
    diagnostics,
  }
}

export function formatSigned(value: number): string {
  return signed(value)
}
