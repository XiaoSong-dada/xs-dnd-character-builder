import { abilityModifier, deriveAbilities, proficiencyBonus } from '@/rules/derive'
import { getFeatChosenAbility, listActiveFeats, listFeatGrants } from '@/rules/feats'
import { normalizeManualEdits } from '@/rules/manual-edits'
import { getDraftSpeciesRules } from '@/rules/origins'
import { getRulesRepository } from '@/rules/repositories'
import { abilityFromSpeciesSpellAbilityOption, classIdFromSpellListOption } from '@/rules/data/spell-lists-2024'
import { isSourceEnabled } from '@/rules/source-books'
import type { AbilityKey, CharacterDraft, ChoiceSelection } from '@/types/character'
import type { ChoiceCheckpoint, RaceRule, RulesRepository, SpellcastingConfig, SpeciesSpellGrant } from '@/types/rules'

type SpellcraftDraft = Pick<CharacterDraft, 'classId' | 'subclassId' | 'enabledSourceIds' | 'ruleset'>

function abilityScoreAfterOrigin(draft: CharacterDraft, ability: SpellcastingConfig['ability']): number {
  return deriveAbilities(draft)[ability] + (normalizeManualEdits(draft.manualEdits).abilityAdjustments[ability] ?? 0)
}

export function getMaximumSpellLevel(config: SpellcastingConfig, classLevel: number): number {
  return config.maxSpellLevelByClassLevel[Math.max(0, classLevel - 1)] ?? 0
}

/** 单个环位的法术位信息；pact 模式下 count 为契约法术位数量、level 为契约环级。 */
export interface SpellSlotInfo {
  readonly level: number
  readonly count: number
  /** 是否为契约法术位（短休恢复）；仅邪术师（pact 模式）为 true。 */
  readonly pact?: boolean
}

/** 当前职业等级的法术位明细（派生展示数据，不持久化）；越界等级或未挂表时返回空数组。 */
export function getSpellSlots(config: SpellcastingConfig, classLevel: number): readonly SpellSlotInfo[] {
  if (classLevel < 1 || classLevel > 20) return []
  if (config.mode === 'pact') {
    const pact = config.pactSlotsByClassLevel?.[classLevel - 1]
    return pact ? [{ level: pact[1], count: pact[0], pact: true }] : []
  }
  const slots = config.slotsByClassLevel?.[classLevel - 1]
  if (!slots) return []
  return slots
    .map((count, index) => ({ level: index + 1, count }))
    .filter((slot) => slot.count > 0)
}

/** 角色最终法术位：职业表加人工环位差值；无施法职业也可通过人工调整获得环位。 */
export function getEffectiveSpellSlots(draft: CharacterDraft): readonly SpellSlotInfo[] {
  const config = getSpellcastingConfig(draft)
  const base = config ? getSpellSlots(config, draft.targetLevel) : []
  const baseByLevel = new Map(base.map((slot) => [slot.level, slot]))
  const adjustments = normalizeManualEdits(draft.manualEdits).spellSlotAdjustments
  return Array.from({ length: 9 }, (_, index) => index + 1).flatMap((level) => {
    const system = baseByLevel.get(level)
    const count = (system?.count ?? 0) + (adjustments[level] ?? 0)
    return count > 0 ? [{ level, count, ...(system?.pact ? { pact: true } : {}) }] : []
  })
}

/** 页面、跑团与导出共用：正常已选法术与人工添加法术按 ID 去重。 */
export function getEffectiveSelectedSpellIds(draft: CharacterDraft): readonly string[] {
  const repository = getRulesRepository(draft.ruleset)
  const config = getSpellcastingConfig(draft)
  const normal = config ? getSelectedSpellIds(draft, config) : []
  const manual = normalizeManualEdits(draft.manualEdits).addedSpells
    .filter((item) => {
      const level = repository.getSpell(item.spellId)?.level
      return level === 0
        || item.prepared
        || item.destination === 'known'
        || item.destination === 'pact-known'
        || item.destination === 'granted'
    })
    .map((item) => item.spellId)
  return [...new Set([...draft.spellSelections.cantripIds, ...normal, ...manual])]
}

/** 人工加入准备列表/法术书、但尚未准备的有环法术。 */
export function getUnpreparedManualSpellIds(draft: CharacterDraft): readonly string[] {
  const repository = getRulesRepository(draft.ruleset)
  return normalizeManualEdits(draft.manualEdits).addedSpells
    .filter((item) => !item.prepared && (item.destination === 'prepared-list' || item.destination === 'spellbook'))
    .filter((item) => (repository.getSpell(item.spellId)?.level ?? 0) > 0)
    .map((item) => item.spellId)
}

export function getRequiredSpellCount(draft: CharacterDraft, config: SpellcastingConfig): number {
  if (draft.targetLevel < config.startsAtLevel) return 0
  if (config.mode === 'known' || config.mode === 'pact') return config.spellsKnownByLevel?.[draft.targetLevel - 1] ?? 0
  if (config.preparedCountByLevel) return config.preparedCountByLevel[draft.targetLevel - 1] ?? 0
  if (config.preparedFormula === 'ability-plus-half-level') {
    return Math.max(1, abilityModifier(abilityScoreAfterOrigin(draft, config.ability)) + Math.floor(draft.targetLevel / 2))
  }
  if (config.preparedFormula === 'ability-plus-half-level-ceil') {
    return Math.max(1, abilityModifier(abilityScoreAfterOrigin(draft, config.ability)) + Math.ceil(draft.targetLevel / 2))
  }
  if (config.preparedFormula === 'ability-plus-level') {
    return Math.max(1, abilityModifier(abilityScoreAfterOrigin(draft, config.ability)) + draft.targetLevel)
  }
  return 0
}

export function getRequiredCantripCount(draft: CharacterDraft, config: SpellcastingConfig): number {
  return config.cantripsKnownByLevel?.[draft.targetLevel - 1] ?? 0
}

export function getRequiredSpellbookCount(draft: CharacterDraft, config: SpellcastingConfig): number {
  return config.spellbookSpellsByLevel?.[draft.targetLevel - 1] ?? 0
}

export function getSelectedSpellIds(draft: CharacterDraft, config: SpellcastingConfig): readonly string[] {
  if (config.mode === 'known') return draft.spellSelections.knownSpellIds
  if (config.mode === 'prepared') return draft.spellSelections.preparedSpellIds
  if (config.mode === 'spellbook') return draft.spellSelections.preparedSpellIds
  return draft.spellSelections.knownSpellIds
}

/** 候选池：可更换（准备）但尚未选择的法术 ID。`known`/`pact` 模式在 2014 规则中平时不可更换，无候选。 */
export interface SpellCandidates {
  /** prepared 模式：职业法术池（1 环起）中未准备的法术。 */
  readonly prepared: readonly string[]
  /** spellbook 模式：职业法术池（1 环起）中未写入法术书的法术（升级时可扩充入书）。 */
  readonly writeToBook: readonly string[]
  /** spellbook 模式：法术书中未准备的法术（长休可从书中换入准备）。 */
  readonly prepareFromBook: readonly string[]
}

export function getSpellCandidates(draft: CharacterDraft, config: SpellcastingConfig): SpellCandidates {
  const availableIds = getAvailableSpells(draft, config)
    .filter((spell) => spell.level > 0)
    .map((spell) => spell.id)
  const empty: SpellCandidates = { prepared: [], writeToBook: [], prepareFromBook: [] }
  if (config.mode === 'spellbook') {
    const book = draft.spellSelections.spellbookSpellIds
    const prepared = draft.spellSelections.preparedSpellIds
    return {
      prepared: [],
      writeToBook: availableIds.filter((id) => !book.includes(id)),
      prepareFromBook: book.filter((id) => !prepared.includes(id)),
    }
  }
  if (config.mode === 'prepared') {
    const selected = getSelectedSpellIds(draft, config)
    return { ...empty, prepared: availableIds.filter((id) => !selected.includes(id)) }
  }
  return empty
}

export function getAvailableSpells(draft: CharacterDraft, config: SpellcastingConfig) {
  const repository = getRulesRepository(draft.ruleset)
  const maximumLevel = getMaximumSpellLevel(config, draft.targetLevel)
  return config.classSpellIds
    .map((id) => repository.getSpell(id))
    .filter((spell): spell is NonNullable<typeof spell> => Boolean(
      spell
      && spell.level <= maximumLevel
      && isSourceEnabled(spell.sourceIds, draft.enabledSourceIds, repository),
    ))
}

/**
 * 动态候选池：解析检查点在当前草稿下的候选选项。
 * 普通检查点返回静态 optionIds；法术级候选（candidateKind）按草稿状态生成：
 * `all-spells` 为全部已登记 1 环及以上法术（环级不高于当前可用最高环，魔法奥秘用）；
 * `spellbook-level-N` 为法术书中对应环级的法术（法师法术精通/招牌法术用）。
 */
export function getCheckpointCandidates(draft: CharacterDraft, checkpoint: ChoiceCheckpoint): readonly string[] {
  if (checkpoint.optionIds.length > 0) return checkpoint.optionIds
  if (!checkpoint.candidateKind) return []
  const repository = getRulesRepository(draft.ruleset)
  if (checkpoint.candidateKind === 'spell-pool') {
    const pool = checkpoint.spellPool
    if (!pool) return []
    const classId = pool.fromListChoiceId
      ? resolveSpellListClassId(draft, checkpoint, pool.fromListChoiceId)
      : undefined
    if (pool.fromListChoiceId && !classId) return []
    return repository.spells
      .filter((spell) => spell.level === pool.level)
      .filter((spell) => !pool.schools || (spell.school !== undefined && pool.schools.includes(spell.school)))
      .filter((spell) => !pool.ritualOnly || spell.ritual)
      .filter((spell) => !classId || spell.classIds.includes(classId))
      .filter((spell) => isSourceEnabled(spell.sourceIds, draft.enabledSourceIds, repository))
      .map((spell) => spell.id)
  }
  if (checkpoint.candidateKind === 'all-spells') {
    const config = getSpellcastingConfig(draft)
    if (!config || draft.targetLevel < config.startsAtLevel) return []
    const maximumLevel = getMaximumSpellLevel(config, draft.targetLevel)
    return repository.spells
      .filter((spell) => spell.level >= 1 && spell.level <= maximumLevel && isSourceEnabled(spell.sourceIds, draft.enabledSourceIds, repository))
      .map((spell) => spell.id)
  }
  const targetLevel = checkpoint.candidateKind === 'spellbook-level-1' ? 1
    : checkpoint.candidateKind === 'spellbook-level-2' ? 2
      : 3
  return draft.spellSelections.spellbookSpellIds
    .map((id) => repository.getSpell(id))
    .filter((spell): spell is NonNullable<typeof spell> => Boolean(spell && spell.level === targetLevel))
    .map((spell) => spell.id)
}

/** 魔法奥秘法术：从时间线检查点选择中提取（不计入已知法术上限，展示与导出用）。 */
export function getMagicalSecretsSpellIds(draft: CharacterDraft): readonly string[] {
  return draft.selections
    .filter((item) => item.checkpointId.startsWith('bard-2014-magical-secrets-') && !item.invalidatedAt)
    .flatMap((item) => item.optionIds)
    .filter((id, index, all) => all.indexOf(id) === index)
}

/**
 * 解析角色当前施法配置：子职级施法（奥法骑士、诡术师）优先，否则回退职业级。
 * 按草稿规则版本选择仓库；2014 草稿与既有行为等价。
 */
export function getSpellcastingConfig(draft: SpellcraftDraft): SpellcastingConfig | undefined {
  const repository = getRulesRepository(draft.ruleset ?? '5e-2014')
  const subclass = draft.subclassId ? repository.getSubclass(draft.subclassId) : undefined
  if (subclass && !isSourceEnabled(subclass.sourceIds, draft.enabledSourceIds, repository)) return undefined
  const classRule = draft.classId ? repository.getClass(draft.classId) : undefined
  if (classRule && !isSourceEnabled(classRule.sourceIds, draft.enabledSourceIds, repository)) return undefined
  return repository.getSpellcastingConfig(draft)
}

function findClassCheckpoint(repository: RulesRepository, checkpointId: string): ChoiceCheckpoint | undefined {
  for (const classRule of repository.classes) {
    const found = classRule.checkpoints.find((checkpoint) => checkpoint.id === checkpointId)
    if (found) return found
  }
  return undefined
}

/** 从同一专长的法术表选择中解析出职业 ID；未选择或非法时返回 undefined。 */
function resolveSpellListClassId(
  draft: CharacterDraft,
  checkpoint: ChoiceCheckpoint,
  listChoiceId: string,
): string | undefined {
  const [, parentCheckpointId, featId] = checkpoint.id.split(':')
  if (!parentCheckpointId || !featId) return undefined
  const selection = draft.selections.find((item) =>
    item.checkpointId === `feat-child:${parentCheckpointId}:${featId}:${listChoiceId}` && !item.invalidatedAt)
  const optionId = selection?.optionIds[0]
  return optionId ? classIdFromSpellListOption(optionId) : undefined
}

/** 物种按等级授予的固定法术（纯函数，供派生与测试）。 */
export function collectSpeciesSpellGrants(
  race: RaceRule | undefined,
  targetLevel: number,
): readonly SpeciesSpellGrant[] {
  return (race?.spellGrants ?? []).filter((grant) => grant.minimumLevel <= targetLevel)
}

/** 物种法术施法属性：从 `spell-ability-*` 时间线选择解析。 */
export function getSpeciesSpellAbility(
  race: RaceRule,
  selections: readonly ChoiceSelection[],
): AbilityKey | undefined {
  const selection = selections.find((item) => !item.invalidatedAt && item.checkpointId === `${race.id}-spellcasting-ability`)
  return abilityFromSpeciesSpellAbilityOption(selection?.optionIds[0])
}

/** 检查点或专长子选择声明的始终准备法术（法术精通、招牌法术、专长授予等）。 */
function selectionAlwaysPreparedSpellIds(draft: CharacterDraft, repository: RulesRepository): readonly string[] {
  const ids: string[] = []
  for (const selection of draft.selections) {
    if (selection.invalidatedAt) continue
    if (selection.checkpointId.startsWith('feat-child:')) {
      const [, , featId, choiceId] = selection.checkpointId.split(':')
      const choice = featId ? repository.getFeat(featId)?.choices?.find((item) => item.id === choiceId) : undefined
      if (choice?.spellGrant?.alwaysPrepared) ids.push(...selection.optionIds)
      continue
    }
    const checkpoint = findClassCheckpoint(repository, selection.checkpointId)
    if (checkpoint?.spellGrant?.alwaysPrepared) ids.push(...selection.optionIds)
  }
  return ids
}

export function getAlwaysPreparedSpellIds(draft: CharacterDraft): readonly string[] {
  const repository = getRulesRepository(draft.ruleset)
  const ids = new Set<string>()
  const subclass = draft.subclassId ? repository.getSubclass(draft.subclassId) : undefined
  if (subclass && isSourceEnabled(subclass.sourceIds, draft.enabledSourceIds, repository)) {
    for (const [level, spellIds] of Object.entries(subclass.alwaysPreparedSpellIdsByLevel ?? {})) {
      if (Number(level) > draft.targetLevel) continue
      for (const id of spellIds) ids.add(id)
    }
  }
  const classRule = draft.classId ? repository.getClass(draft.classId) : undefined
  if (classRule && isSourceEnabled(classRule.sourceIds, draft.enabledSourceIds, repository)) {
    for (const [level, spellIds] of Object.entries(classRule.spellcasting?.alwaysPreparedSpellIdsByLevel ?? {})) {
      if (Number(level) > draft.targetLevel) continue
      for (const id of spellIds) ids.add(id)
    }
  }
  // 专长固定授予（如迷踪步、隐形术、侦测思想）。
  for (const feat of listActiveFeats(draft, repository)) {
    for (const grant of feat.grantedSpells ?? []) {
      if (grant.alwaysPrepared !== false) ids.add(grant.spellId)
    }
  }
  // 物种授予（血统法术等，按获得等级生效）。
  for (const race of getDraftSpeciesRules(draft, repository)) {
    for (const grant of collectSpeciesSpellGrants(race, draft.targetLevel)) {
      if (grant.alwaysPrepared !== false) ids.add(grant.spellId)
    }
  }
  for (const id of selectionAlwaysPreparedSpellIds(draft, repository)) {
    const spell = repository.getSpell(id)
    if (spell && isSourceEnabled(spell.sourceIds, draft.enabledSourceIds, repository)) ids.add(id)
  }
  return [...ids]
}

/** 免费施法资源（每休息次数）：来自专长／检查点声明；消耗与恢复操作由跑团批次接入。 */
export interface FreeCastingGrant {
  readonly spellId: string
  readonly sourceId: string
  readonly count: number
  readonly recovery: 'long-rest' | 'short-rest'
  readonly ability?: AbilityKey
}

export function getSpellFreeCastings(draft: CharacterDraft): readonly FreeCastingGrant[] {
  const repository = getRulesRepository(draft.ruleset)
  const grants: FreeCastingGrant[] = []
  const seen = new Set<string>()
  const push = (
    spellId: string,
    sourceId: string,
    count: number,
    recovery: 'long-rest' | 'short-rest',
    ability?: AbilityKey,
  ): void => {
    const key = `${sourceId}:${spellId}`
    if (seen.has(key)) return
    if (!repository.getSpell(spellId)) return
    seen.add(key)
    grants.push({ spellId, sourceId, count, recovery, ability })
  }
  // 专长固定授予
  for (const featGrant of listFeatGrants(draft, repository)) {
    const feat = repository.getFeat(featGrant.featId)
    for (const granted of feat?.grantedSpells ?? []) {
      if (!granted.freeCastings) continue
      push(
        granted.spellId,
        `${featGrant.sourceId}:${featGrant.featId}`,
        granted.freeCastings,
        granted.recovery ?? 'long-rest',
        granted.ability ?? getFeatChosenAbility(draft, featGrant.checkpointId, featGrant.featId),
      )
    }
  }
  // 专长子选择授予（所选法术）
  for (const selection of draft.selections) {
    if (selection.invalidatedAt || !selection.checkpointId.startsWith('feat-child:')) continue
    const [, parentCheckpointId, featId, choiceId] = selection.checkpointId.split(':')
    const choice = featId ? repository.getFeat(featId)?.choices?.find((item) => item.id === choiceId) : undefined
    const grant = choice?.spellGrant
    if (!grant?.freeCastings || grant.freeCastings <= 0) continue
    const ability = grant.ability ?? (featId ? getFeatChosenAbility(draft, parentCheckpointId, featId) : undefined)
    for (const spellId of selection.optionIds) {
      push(spellId, selection.checkpointId, grant.freeCastings, grant.recovery ?? 'long-rest', ability)
    }
  }
  // 检查点授予（法术精通、招牌法术等）
  for (const selection of draft.selections) {
    if (selection.invalidatedAt || selection.checkpointId.startsWith('feat-child:')) continue
    const checkpoint = findClassCheckpoint(repository, selection.checkpointId)
    const grant = checkpoint?.spellGrant
    if (!grant?.freeCastings || grant.freeCastings <= 0) continue
    for (const spellId of selection.optionIds) {
      push(spellId, selection.checkpointId, grant.freeCastings, grant.recovery ?? 'long-rest', grant.ability)
    }
  }
  // 物种授予（血统法术的免费次数）；施法属性从物种链上的属性选择解析。
  const speciesRules = getDraftSpeciesRules(draft, repository)
  const speciesAbility = speciesRules
    .map((race) => getSpeciesSpellAbility(race, draft.selections))
    .find((ability): ability is AbilityKey => Boolean(ability))
  for (const race of speciesRules) {
    for (const grant of collectSpeciesSpellGrants(race, draft.targetLevel)) {
      const count = grant.freeCastingsFrom === 'proficiency-bonus'
        ? proficiencyBonus(draft.targetLevel)
        : grant.freeCastings ?? 0
      if (count <= 0) continue
      push(grant.spellId, race.id, count, grant.recovery ?? 'long-rest', grant.ability ?? speciesAbility)
    }
  }
  return grants
}

export function validateSpellSelections(draft: CharacterDraft): boolean {
  const config = getSpellcastingConfig(draft)
  if (!config || draft.targetLevel < config.startsAtLevel) return true
  const selected = getSelectedSpellIds(draft, config)
  const availableSpells = getAvailableSpells(draft, config)
  const availableIds = new Set(availableSpells.filter((spell) => spell.level > 0).map((spell) => spell.id))
  const cantripIds = new Set(availableSpells.filter((spell) => spell.level === 0).map((spell) => spell.id))
  const requiredCantrips = getRequiredCantripCount(draft, config)
  const cantripsValid = requiredCantrips === 0
    || (draft.spellSelections.cantripIds.length === requiredCantrips
      && draft.spellSelections.cantripIds.length === new Set(draft.spellSelections.cantripIds).size
      && draft.spellSelections.cantripIds.every((id) => cantripIds.has(id)))
  // 法术书校验：抄录所得的法术（transcribedSpellIds）不计入升级名额，
  // 升级名额（非抄录法术）至少达到 requiredSpellbookCount（抄录可超出总数）。
  const spellbookSpells = draft.spellSelections.spellbookSpellIds
  const transcribed = draft.spellSelections.transcribedSpellIds
  const spellbookValid = config.mode !== 'spellbook'
    || (spellbookSpells.filter((id) => !transcribed.includes(id)).length >= getRequiredSpellbookCount(draft, config)
      && spellbookSpells.length === new Set(spellbookSpells).size
      && spellbookSpells.every((id) => availableIds.has(id))
      && selected.every((id) => spellbookSpells.includes(id)))
  return cantripsValid
    && spellbookValid
    && selected.length === getRequiredSpellCount(draft, config)
    && selected.length === new Set(selected).size
    && selected.every((id) => availableIds.has(id))
}
